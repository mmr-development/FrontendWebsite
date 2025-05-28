import { renderTemplate } from '../utils/rendertemplate.js';
import * as api from '../utils/api.js';

export const renderMenu = async (id) => {
    let catalog = await api.get('partners/' + id + '/catalogs/full').then((res) => {
        if (res.status === 200) {
            return res.data;
        } else {
            console.error("Error fetching catalog:", res);
            return [];
        }
    });

    let menu_data = {
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

    let searchbar_data = {
    categories: catalog.catalogs[0].categories.map(category => ({
            name: category.name,
            value: category.id.toString()
        })),
    }
    await Promise.all([
        renderTemplate('../../templates/partials/restaurant-detail/restaurant-menu.mustache', 'restaurant-menu', menu_data),
        renderTemplate('../../templates/partials/restaurant-detail/searchbar.mustache', 'restaurant-searchbar', searchbar_data)
    ]);

    let restaurantsMenus = JSON.parse(localStorage.getItem('restaurantMenu')) || {};
    restaurantsMenus[id] = menu_data;
    localStorage.setItem('restaurantMenu', JSON.stringify(restaurantsMenus));

    let restaurantsSearchbarData = JSON.parse(localStorage.getItem('restaurantSearchbarData')) || {};
    restaurantsSearchbarData[id] = searchbar_data;
    localStorage.setItem('restaurantSearchbarData', JSON.stringify(restaurantsSearchbarData));
};

export const renderMenuFast = async (id) => {
    let restaurantsMenus = JSON.parse(localStorage.getItem('restaurantMenu')) || {};
    let restaurantsSearchbarData = JSON.parse(localStorage.getItem('restaurantSearchbarData')) || {};
    let menu_data = restaurantsMenus[id] || {};
    let searchbar_data = restaurantsSearchbarData[id] || {};
    await renderTemplate('../../templates/partials/restaurant-detail/restaurant-menu.mustache', 'restaurant-menu', menu_data);
    await renderTemplate('../../templates/partials/restaurant-detail/searchbar.mustache', 'restaurant-searchbar', searchbar_data);
}