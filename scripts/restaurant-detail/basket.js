import { renderTemplate } from '../utils/rendertemplate.js';
import { updateToggleButton } from './restaurant-detail-sidebar-toggle.js';

export const basketUpdate = async () => {
    // Get restaurantId from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantId = urlParams.get('id');

    if (!restaurantId) {
        console.error('Restaurant ID not found in the URL.');
        return;
    }

    // Retrieve the restaurant-specific cart from localStorage
    const restaurantCarts = JSON.parse(localStorage.getItem('restaurantCarts')) || {};
    const basket = restaurantCarts[restaurantId] || [];

    // Check if the basket is empty
    if (basket.length === 0) {
        // Render empty basket template
        await renderTemplate('../../templates/partials/restaurant-detail/basket.mustache', 'basket', {empty: true});
        return;
    }

    // Calculate totals
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

    await renderTemplate('../../templates/partials/restaurant-detail/basket.mustache', 'basket', data);

    updateToggleButton(totalItems, totalPrice);

    const removeButtons = document.querySelectorAll('.remove-item-button');
    removeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const itemId = button.getAttribute('data-id');
            const itemIndex = basket.findIndex(item => item.id === itemId);
            if (itemIndex > -1) {
                basket.splice(itemIndex, 1); // Remove the item from the basket
                restaurantCarts[restaurantId] = basket; // Update the restaurant-specific cart
                localStorage.setItem('restaurantCarts', JSON.stringify(restaurantCarts)); // Save to localStorage
                basketUpdate(); // Re-render the basket
            }
        });
    });

    // add event listeners for quantity buttons
    let quantitycontainers = document.querySelectorAll('.basket-quantity');
    quantitycontainers.forEach(container => {
        const quantityInput = container.querySelector('.quantity-input');
        const itemId = container.getAttribute('data-id');
        const itemIndex = basket.findIndex(item => item.id === itemId);
        const max = 50; // Set a maximum limit for quantity
        const min = 1; // Set a minimum limit for quantity

        const quantityButtons = container.querySelectorAll('.quantity-button');
        quantityButtons.forEach(button => {
            button.addEventListener('click', () => {
                let currentValue = parseInt(quantityInput.value);
                if (button.dataset.action === 'increase' && currentValue < max) {
                    quantityInput.value = currentValue + 1;
                    basket[itemIndex].quantity += 1; // Update the quantity in the basket
                } else if (button.dataset.action === 'decrease' && currentValue > min) {
                    quantityInput.value = currentValue - 1;
                    basket[itemIndex].quantity -= 1; // Update the quantity in the basket
                }
                localStorage.setItem('restaurantCarts', JSON.stringify(restaurantCarts)); // Save to localStorage
                basketUpdate();
            });
        });

        // Handle input change
        quantityInput.addEventListener('change', () => {
            let currentValue = parseInt(quantityInput.value);
            if (currentValue > max) {
                quantityInput.value = max;
                basket[itemIndex].quantity = max; // Update the quantity in the basket
            } else if (currentValue < min) {
                quantityInput.value = min;
                basket[itemIndex].quantity = min; // Update the quantity in the basket
            } else {
                basket[itemIndex].quantity = currentValue; // Update the quantity in the basket
            }
            localStorage.setItem('restaurantCarts', JSON.stringify(restaurantCarts)); // Save to localStorage
            basketUpdate();
        });
    });

    // Add event listener for the checkout button
    const checkoutButton = document.querySelector('.checkout-button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            window.location.href = `checkout.html?id=${restaurantId}`;
        });
    }
};

basketUpdate();

