import { renderTemplate } from '../utils/rendertemplate.js';
import * as api from '../utils/api.js';

// get the catalog for this partner
const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);
let partner_id = params.get('id');
if (partner_id) {
    sessionStorage.setItem('partner_id', partner_id);
} else {
    partner_id = sessionStorage.getItem('partner_id');
}
let catalog = await api.get('partners/' + partner_id + '/catalogs/full').then((res) => {
    if (res.status === 200) {
        return res.data;
    } else {
        console.error("Error fetching catalog:", res);
        return [];
    }
});

export const menu_data = {
    categories: catalog.catalogs[0].categories.map(category => ({
        id: category.id.toString(),
        name: category.name,
        items: category.items.map(item => {
            const menuItem = {
                id: item.id.toString(),
                name: item.name,
                price: item.price.toFixed(2),
                description: item.description
            };
            if (item.image_url && item.image_url.trim() !== "") {
                menuItem.image = api.baseurl + 'public/' + item.image_url;
            }
            return menuItem;
        })
    })),
};

export const searchbar_data = {
   categories: catalog.catalogs[0].categories.map(category => ({
        name: category.name,
        value: category.id.toString()
    })),
}