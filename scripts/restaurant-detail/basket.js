import { renderTemplate } from '../utils/rendertemplate.js';
import { updateToggleButton } from './restaurant-detail-sidebar-toggle.js';
import {renderModal} from '../utils/modal.js'
import * as api from '../utils/api.js';

export const basketUpdate = async (delivery = true) => {
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantId = urlParams.get('id');

    if (!restaurantId) return;

    const restaurantCarts = JSON.parse(localStorage.getItem('restaurantCarts')) || {};
    const basket = restaurantCarts[restaurantId] || [];

    let deliveryStorage = JSON.parse(localStorage.getItem('delivery')) || { restaurant: {} };
    let deliveryOption = deliveryStorage.restaurant[restaurantId];
    if (deliveryOption) {
        delivery = !deliveryOption.delivery;
    } else {
        deliveryStorage.restaurant[restaurantId] = { delivery: true };
        localStorage.setItem('delivery', JSON.stringify(deliveryStorage));
        delivery = true;
    }

    if (basket.length === 0) {
        await renderTemplate('../../templates/partials/restaurant-detail/basket.mustache', 'basket', {empty: true});
        return {
            empty: true,
        }
    }

    const totalItems = basket.reduce((total, item) => total + item.quantity, 0);
    const subtotal = basket.reduce((total, item) => total + parseFloat(item.price.replace('$', '')) * item.quantity, 0).toFixed(2);
    let deliveryFee = 39.00
    let totalPrice = delivery ? (parseFloat(subtotal) + deliveryFee).toFixed(2) : subtotal;

    const data = {
        totalItems: totalItems,
        subtotal: subtotal,
        delivery: delivery,
        deliveryFee: deliveryFee.toFixed(2),
        totalPrice: totalPrice,
        items: basket.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price.replace('kr.', ''),
            quantity: item.quantity,
            note: item.note || '',
        }))
    };
    if (!document.getElementById('basket')) return;
    await renderTemplate('../../templates/partials/restaurant-detail/basket.mustache', 'basket', data);

    let checkedinput = document.getElementById('toggle-checkbox');

    if (checkedinput) {
        checkedinput.addEventListener('change', () => {
            // update localstorage
            if (!deliveryStorage.restaurant[restaurantId]) {
                deliveryStorage.restaurant[restaurantId] = { delivery: checkedinput.checked };
            } else {
                deliveryStorage.restaurant[restaurantId].delivery = checkedinput.checked;
            }
            localStorage.setItem('delivery', JSON.stringify(deliveryStorage));

            basketUpdate(!checkedinput.checked);
        });
    }

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

    let quantitycontainers = document.querySelectorAll('.basket-quantity');
    quantitycontainers.forEach(container => {
        const quantityInput = container.querySelector('.quantity-input');
        const itemId = container.getAttribute('data-id');
        const itemIndex = basket.findIndex(item => item.id === itemId);
        const max = 50; 
        const min = 1; 

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

    const addNoteButton = document.querySelectorAll('.add-note-button');
    addNoteButton.forEach(button => {
        button.addEventListener('click',async () => {
            await renderModal({
                title: 'Add a note',
                content: `
                    <div class="modal-content">
                        <textarea id="note-textarea" rows="4" cols="50"></textarea>
                    </div>
                `,
                submit: 'Save',
                close: 'Close',
                minWidth: '400px',
                submitCallback: () => {
                    const noteTextarea = document.getElementById('note-textarea');
                    const itemId = button.getAttribute('data-id');
                    const itemIndex = basket.findIndex(item => item.id === itemId);
                    if (noteTextarea) {
                        noteTextarea.value ? basket[itemIndex].note = noteTextarea.value :  
                        basket[itemIndex].note = '';
                        localStorage.setItem('restaurantCarts', JSON.stringify(restaurantCarts)); // Save to localStorage
                        const noteDiv = document.querySelector(`.basket-item[data-id="${itemId}"] .note`);
                        if (noteDiv) {
                           if (noteTextarea.value) {
                                 noteDiv.innerHTML = "<p><strong>Note:</strong> " + noteTextarea.value + "</p>"; // Update the note in the basket
                            }else {
                                noteDiv.innerHTML = ""; // Update the note in the basket
                            }
                        }
                    }
                    basketUpdate();
                },
            });
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

await basketUpdate();

