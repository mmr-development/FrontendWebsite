import { renderTemplate } from "../../utils/rendertemplate.js";
import * as api from '../../utils/api.js';


const renderPartnerApplications = async (container, offset = 0) => {
    const apiData = await api.get('partner-applications/?limit=5&offset=' + offset).then((res) => {
        if (res.status === 200) {
            return res.data;
        }
        return [];
    });

    const columns = Object.keys(apiData.applications[0]).filter(key => (
        key !== 'created_at' &&
        key !== 'updated_at' &&
        key !== 'id'
    ));

    columns.push('actions');
    const rows = apiData.applications.map(application => {
        return {
            id: application.id,
            cells: columns.map(column => {
                if (column === 'actions') {
                    return `
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="approvePartnerApplication('${application.id}')">Approve</button>
                        <button class="btn btn-danger" onclick="rejectPartnerApplication('${application.id}')">Reject</button>
                    </div>
                    `;
                }
                else if (column === 'delivery_methods') {
                    return application[column].map(method => method.name).join(', ') || 'N/A';
                }
                return application[column]?.name || application[column];
            })
        };
    });

    const totalPages = Math.ceil(apiData.pagination.total / apiData.pagination.limit);

    const templateData = {
        columns: columns.map(column => column.replace(/_/g, ' ').toUpperCase()),
        rows: rows,
        currentPage: Math.floor(apiData.pagination.offset / apiData.pagination.limit) + 1,
        totalPages: totalPages,
        paginationid: container + '-pagination',
        search: false,
    };

    await renderTemplate('../../templates/partials/dashboard/content/get.mustache', container, templateData).then(() => {
        const pagination = document.querySelector(`#${container}-pagination`);
        if (pagination) {
            pagination.innerHTML = '';
            for (let i = 1; i <= totalPages; i++) {
                const pageLink = document.createElement('a');
                pageLink.href = `#${container}-${i}`;
                pageLink.textContent = i;
                pageLink.classList.add('page-link');
                pageLink.addEventListener('click', async (e) => {
                    e.preventDefault();
                    console.log((i - 1) * apiData.pagination.limit)
                    await renderPartnerApplications(container, (i - 1) * apiData.pagination.limit);
                });
                pagination.appendChild(pageLink);
            }
        }

        window.approvePartnerApplication = async (id) => {
            updatePartner(id, 'approved');
        };

        window.rejectPartnerApplication = async (id) => {
            updatePartner(id, 'rejected');
        };

        let updatePartner = async (id, applicationStatus) => {
            await api.patch(`partner-applications/${id}`, { status: applicationStatus }).then(async (res) => {
                if (res.status === 200) {
                    await renderPartnerApplications(container);
                }
            }) ;
        }
    });
}

const renderCourierApplications = async (container, offset = 0) => {
    const apiData = await api.get('courier-applications/?limit=5&offset=' + offset).then((res) => {
        if (res.status === 200) {
            return res.data;
        }
        return [];
    });

    const columns = Object.keys(apiData.applications[0]).filter(key => (
        key !== 'created_at' &&
        key !== 'updated_at' &&
        key !== 'id'
    ));

    columns.push('actions');
    const rows = apiData.applications.map(application => {
        return {
            id: application.id,
            cells: columns.map(column => {
                if (column === 'actions') {
                    return `
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="approveCourierApplication('${application.id}')">Approve</button>
                        <button class="btn btn-danger" onclick="rejectCourierApplication('${application.id}')">Reject</button>
                    </div>
                    `;
                }
                else if (column === 'delivery_methods') {
                    return application[column].map(method => method.name).join(', ') || 'N/A';
                } else if (column === 'documentation' ) {
                    // if no documentation, return N/A
                    if (application[column].length === 0) {
                        return 'N/A';
                    }
                } else if (column == 'user' || column == 'address') {
                    // object object, return string and ignore id
                    return Object.keys(application[column]).map(key => {
                        if (key === 'id') {
                            return '';
                        }
                        return application[column][key];
                    }).join(', ');
                }
                return application[column]?.name || application[column];
            })
        };
    });

    
    const totalPages = Math.ceil(apiData.pagination.total / apiData.pagination.limit);


    const templateData = {
        columns: columns.map(column => column.replace(/_/g, ' ').toUpperCase()),
        rows: rows,
        currentPage: Math.floor(apiData.pagination.offset / apiData.pagination.limit) + 1,
        totalPages: totalPages,
        paginationid: container + '-pagination',
        search: false,
    };

    await renderTemplate('../../templates/partials/dashboard/content/get.mustache', container, templateData).then(() => {
        window.approveCourierApplication = async (id) => {
            updateCourier(id, 'approved');
        };

        window.rejectCourierApplication = async (id) => {
            updateCourier(id, 'rejected');
        };

        let updateCourier = async (id, applicationStatus) => {
            await api.patch(`courier-applications/${id}`, { status: applicationStatus }).then(async (res) => {
                if (res.status === 200) {
                    await renderCourierApplications(container);
                }
            }) ;
        }

        const pagination = document.querySelector(`#${container}-pagination`);
        if (pagination) {
            pagination.innerHTML = '';
            for (let i = 1; i <= totalPages; i++) {
                const pageLink = document.createElement('a');
                pageLink.href = `#${container}-${i}`;
                pageLink.textContent = i;
                pageLink.classList.add('page-link');
                pageLink.addEventListener('click', async (e) => {
                    e.preventDefault();
                    console.log((i - 1) * apiData.pagination.limit)
                    await renderCourierApplications(container, (i - 1) * apiData.pagination.limit);
                });
                pagination.appendChild(pageLink);
            }
        }
    });
}


export const renderApplications = async (container) => {
    // add partner application and courier application containers
    const partnerApplicationsContainer = document.createElement('div');
    partnerApplicationsContainer.id = 'partner-applications';
    partnerApplicationsContainer.classList.add('applications-container');
    const courierApplicationsContainer = document.createElement('div');
    courierApplicationsContainer.id = 'courier-applications';
    courierApplicationsContainer.classList.add('applications-container');

    const containerElement = document.getElementById(container);
    if (containerElement) {
        containerElement.appendChild(partnerApplicationsContainer);
        containerElement.appendChild(courierApplicationsContainer);
    } else {
        console.error('Container not found:', container);
        return;
    }

    // Render partner applications
    await renderPartnerApplications(partnerApplicationsContainer.id);
    // Render courier applications
    await renderCourierApplications(courierApplicationsContainer.id);
}

