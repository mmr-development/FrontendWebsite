import { renderTemplate } from '../utils/rendertemplate.js';

const data = {
    deliveryTime: '30-40 mins',
    pickupTime: '15-25 mins',
}

await renderTemplate('../../templates/partials/restaurant-detail/restaurant-detail-sidebar.mustache', 'restaurant-detail-sidebar', data);