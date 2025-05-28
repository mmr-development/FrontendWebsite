import { renderGet} from '../components/get.js';
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
                } else if (column === 'contact_person') {
                    // If contact_person is an object, display its details
                    const person = application[column];
                    if (!person) return 'N/A';
                    // Show name, email, and phone if available
                    return [person.first_name, person.last_name, person.email, person.phone_number]
                        .filter(Boolean)
                        .join(', ') || 'N/A';
                } else if (column === 'address' ) {
                    // If address is an object, display its details
                    const address = application[column];
                    if (!address) return 'N/A';
                    return [address.street, address.city, address.postal_code, address.country]
                        .filter(Boolean)
                        .join(', ') || 'N/A';
                }
                return application[column]?.name || application[column];
            })
        };
    });

    const templateData = {
        totalItems: apiData.pagination.total,
        itemsPerPage: apiData.pagination.limit,
        currentPage: Math.floor(offset / apiData.pagination.limit) + 1,
        paginationContainer: container + '-pagination',
        search: false,
        select: false,
        pagination: true,
        pageCallback: async (page) => {
            const offset = (page - 1) * apiData.pagination.limit;
            await renderPartnerApplications(container, offset);
        }
    };
    if (apiData.applications) {
        templateData.data = {
            columns: columns.map(column => column.replace(/_/g, ' ').toUpperCase()),
            rows: rows,
        }
    };

    await renderGet(container, templateData).then(() => {
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

    if (!apiData.applications) {
        const templateData = {
            currentPage: Math.floor(offset / apiData.pagination.limit) + 1,
            totalPages: 1,
            paginationid: container + '-pagination',
            search: false,
        };
        await renderGet(container, templateData);
        return;
    }

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

    const templateData = {
        data: {
            columns: columns.map(column => column.replace(/_/g, ' ').toUpperCase()),
            rows: rows,
        },
        totalItems: apiData.pagination.total,
        itemsPerPage: apiData.pagination.limit,
        currentPage: Math.floor(offset / apiData.pagination.limit) + 1,
        paginationContainer: container + '-pagination',
        search: false,
        select: false,
        pagination: true,
        pageCallback: async (page) => {
            const offset = (page - 1) * apiData.pagination.limit;
            await renderCourierApplications(container, offset);
        }
    };

    await renderGet(container, templateData).then(() => {
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

