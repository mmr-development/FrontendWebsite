import {renderTemplate} from '../../utils/rendertemplate.js';
import * as api from '../../utils/api.js';

export const renderParnterDetails = async (container, partnerid, partners) => {
    let partner = await api.get('partners/' + partnerid).then((response) => {
        if (response.status === 200) {
            return response.data;
        }
        return [];
    });
    console.log(partner);

    let templatedata = {
        id: partner.id,
        name: partner.name,
        phone_number: partner.phone_number,
        delivery_fee: partner.delivery_fee,
        max_deliver_distance: partner.max_delivery_distance,
        min_order_value: partner.min_order_value,
        status: partner.status,
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
    });
}
