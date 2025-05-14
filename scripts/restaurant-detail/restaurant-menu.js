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

const menu_data = {
    categories: catalog.catalogs[0].categories.map(category => ({
        name: category.name,
        items: category.items.map(item => ({
            id: item.id.toString(),
            name: item.name,
            image: '../../files/images/restaurants/placeholder.png', // Placeholder image
            price: item.price.toFixed(2), // Format price to 2 decimal places
            description: item.description
        }))
    })),
};

export default menu_data;