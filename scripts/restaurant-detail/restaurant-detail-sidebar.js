import { renderTemplate } from '../utils/rendertemplate.js';

const data = {
    deliveryTime: '30-40 mins',
    pickupTime: '15-25 mins',
}

await renderTemplate('../../templates/partials/restaurant-detail/restaurant-detail-sidebar.mustache', 'restaurant-detail-sidebar', data).then(() => {
    let toggleDeliveryOption = document.getElementById('toggle-checkbox');

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    let deliveryOption = JSON.parse(localStorage.getItem('delivery')) || { restaurant: {} };
    let delivery = deliveryOption.restaurant[id];

    toggleDeliveryOption.checked = delivery && delivery.delivery === true;
    
    toggleDeliveryOption.addEventListener('change', () => {
        // If the delivery object for the restaurant doesn't exist, create it
        if (!delivery) {
            deliveryOption.restaurant[id] = { delivery: toggleDeliveryOption.checked };
        } else {
            // If it exists, update the delivery tag
            deliveryOption.restaurant[id].delivery = toggleDeliveryOption.checked;
        }
    
        // Save the updated deliveryOption back to localStorage
        localStorage.setItem('delivery', JSON.stringify(deliveryOption));
    });
});