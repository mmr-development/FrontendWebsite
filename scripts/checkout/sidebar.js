import {renderTemplate} from '../utils/rendertemplate.js';
import { basketUpdate} from '../restaurant-detail/basket.js';

export const renderSidebar = async () => { 
    // get id from url
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    // get data from local storage
    const restaurantCarts = JSON.parse(localStorage.getItem('restaurantCarts')) || {};
    const basket = restaurantCarts[id] || [];
    if (!basket) return;

    const totalItems = basket.reduce((total, item) => total + item.quantity, 0);
    const subtotal = basket.reduce((total, item) => total + parseFloat(item.price.replace('$', '')) * item.quantity, 0).toFixed(2);
    const deliveryFee = 39.00
    const totalPrice = (parseFloat(subtotal) + deliveryFee).toFixed(2);

    // Prepare data for rendering
    const data = {
        totalItems: totalItems,
        subtotal: subtotal,
        deliveryFee: deliveryFee.toFixed(2),
        totalPrice: totalPrice,
        items: basket.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price.replace('kr.', ''),
            quantity: item.quantity
        }))
    };

    await renderTemplate('../../templates/partials/restaurant-detail/restaurant-detail-sidebar.mustache', 'checkout-sidebar', data)
    await basketUpdate('checkout-sidebar'); // Update the basket in the sidebar
};

