import {renderTemplate} from '../../utils/rendertemplate.js';
import * as api from '../../utils/api.js';

let partners = await api.get('partners/me').then((response) => {
    if (response.status === 200) {
        return response.data;
    }
    return [];
})

export const renderParnterDetails = async (container) => {
    let partners = await api.get('partners/me').then((response) => {
        if (response.status === 200) {
            return response.data;
        }
        return [];
    });
    if (partners.length === 0) {
        return;
    }
    console.log(partners);
}
