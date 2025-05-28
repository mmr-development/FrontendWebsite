import {renderTemplate} from '../utils/rendertemplate.js';
import { basketUpdate} from '../restaurant-detail/basket.js';

let savedTip = 0;
export const renderSidebar = async (tip = savedTip, valid) => { 
    savedTip = tip;
    let deliveryStorage = JSON.parse(localStorage.getItem('delivery')) || { restaurant: {} };
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantId = urlParams.get('id');
    let deliveryOption = deliveryStorage.restaurant[restaurantId] == false;
    await renderTemplate('../../templates/partials/restaurant-detail/restaurant-detail-sidebar.mustache', 'checkout-sidebar', {delivery: deliveryOption})
    await basketUpdate({
        tip: tip,
        valid: valid
    })
};

