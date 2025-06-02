import {renderTemplate} from '../../utils/rendertemplate.js';
import * as api from '../../utils/api.js';

export const renderParnterDetails = async (container, partnerid, partners) => {
    let partner = await api.get('partners/' + partnerid).then((response) => {
        if (response.status === 200) {
            return response.data;
        }
        return [];
    });
    let templatedata = {
        id: partner.id,
        name: partner.name,
        phone_number: partner.phone_number,
        delivery_fee: partner.delivery_fee,
        max_deliver_distance: partner.max_delivery_distance,
        min_order_value: partner.min_order_value,
        min_delivery_time: partner.min_preparation_time_minutes,
        max_delivery_time: partner.max_preparation_time_minutes,
        status: partner.status,
        logo: partner.logo_url ? api.baseurl + 'public' +partner.logo_url : '/assets/images/default-partner-logo.png',
        banner: partner.banner_url ? api.baseurl + 'public' + partner.banner_url : '/assets/images/default-partner-banner.png',
        select: true,
        options: partners.map(partner => ({
            value: partner.id,
            name: partner.name + ' (id:' + partner.id + ')',
            selected: partner.id == partnerid ? true : false,
        })),
    }

    await renderTemplate('../../templates/partials/dashboard/pages/partner-details.mustache', container, templatedata).then(() => {
        const select = document.querySelector('#' + container + ' select');
        if (select) {
            select.onchange = async (e) => {
                const selectedPartnerId = e.target.value;
                localStorage.setItem('selectedPartnerId', selectedPartnerId);
                await renderParnterDetails(container, selectedPartnerId, partners);
            }
        }
        const editButton = document.querySelector('#' + container + ' #partner-edit');
        if (editButton) {
            editButton.onclick = async (e) => {
                e.preventDefault();
                // unlock the form
                const form = document.querySelector('#' + container + ' #partner-form');
                form.querySelectorAll('input, select').forEach(input => {
                    // remove readonly
                    input.removeAttribute('readonly');
                });
                // change the button to save
                editButton.innerHTML = 'Save';
                // then on click of save, save the data
                editButton.onclick = async (e) => {
                    e.preventDefault();
                    const formData = new FormData();
                    const data = Object.fromEntries(formData.entries());
                    await api.patch('partners/' + partnerid, data).then((res) => {
                        if (res.status === 200) {
                            renderParnterDetails(container, partnerid, partners);
                        } else {
                            console.error('Error updating partner');
                        }
                    }).catch((error) => {
                        console.error(error);
                    });
                }
            }
        }

        const partner_banner_form = document.querySelector('#' + container + ' #partner-banner-form');
        if (partner_banner_form) {
            // on input change show preview
            const fileInput = partner_banner_form.querySelector('input[type="file"]');
            const preview = partner_banner_form.querySelector('.preview');
            if (fileInput) {
                fileInput.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            preview.src = e.target.result;
                        }
                        reader.readAsDataURL(file);
                    }
                }
            }
            partner_banner_form.onsubmit = async (e) => {
                e.preventDefault();
                const formData = new FormData()
                //append the file to the form data
                const file = partner_banner_form.querySelector('input[type="file"]').files[0];
                if (file) {
                    formData.append('banner', file);
                }
                await api.postImage('partners/' + partnerid + '/banner', formData).then((res) => {
                    if (res.status === 200) {
                        renderParnterDetails(container, partnerid, partners);
                    } else {
                        console.error('Error updating partner banner');
                    }
                }).catch((error) => {
                    console.error(error);
                });
            }
        }

        const partner_logo_form = document.querySelector('#' + container + ' #partner-logo-form');
        if (partner_logo_form) {
            // on input change show preview
            const fileInput = partner_logo_form.querySelector('input[type="file"]');
            const preview = partner_logo_form.querySelector('.preview');
            if (fileInput) {
                fileInput.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            preview.src = e.target.result;
                        }
                        reader.readAsDataURL(file);
                    }
                }
            }
            partner_logo_form.onsubmit = async (e) => {
                e.preventDefault();
                const formData = new FormData();
                //append the file to the form data
                const file = partner_logo_form.querySelector('input[type="file"]').files[0];
                if (file) {
                    formData.append('logo', file);
                }
                await api.postImage('partners/' + partnerid + '/logo', formData).then((res) => {
                    if (res.status === 200) {
                        renderParnterDetails(container, partnerid, partners);
                    } else {
                        console.error('Error updating partner logo');
                    }
                }).catch((error) => {
                    console.error(error);
                });
            }
        }

    });
}
