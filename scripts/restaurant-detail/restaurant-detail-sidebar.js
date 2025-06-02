import { renderTemplate } from '../utils/rendertemplate.js';

const data = {
    deliveryTime: '30-40 mins',
    pickupTime: '15-25 mins',
}

await renderTemplate('../../templates/partials/restaurant-detail/restaurant-detail-sidebar.mustache', 'restaurant-detail-sidebar', {}).then(() => {
    let toggleDeliveryOption = document.getElementById('toggle-checkbox');

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    let deliveryOption = JSON.parse(localStorage.getItem('delivery')) || { restaurant: {} };
    let delivery = deliveryOption.restaurant[id];

    toggleDeliveryOption.checked = delivery && delivery.delivery === true;
    
    toggleDeliveryOption.addEventListener('change', () => {
        if (!delivery) {
            deliveryOption.restaurant[id] = { delivery: toggleDeliveryOption.checked };
        } else {
            deliveryOption.restaurant[id].delivery = toggleDeliveryOption.checked;
        }
        localStorage.setItem('delivery', JSON.stringify(deliveryOption));
    });
});