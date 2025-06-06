import { renderTemplate } from '../utils/rendertemplate.js';
import { updateToggleButton } from './restaurant-detail-sidebar-toggle.js';
import {renderModal} from '../utils/modal.js'
import * as api from '../utils/api.js';

let checkoutData = {};

export const basketUpdate = async (delivery = true, cData = checkoutData) => {
    checkoutData = cData;
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
    let catalogs = JSON.parse(localStorage.getItem('catalogs'));
    let thisRestaurantCatalog = catalogs.restaurant_lists[0].restaurants.find(
        restaurant => restaurant.id === restaurantId
    );
    let deliveryFeeWithValuta = thisRestaurantCatalog.delivery_fee || '0';
    let deliveryFee = parseFloat(deliveryFeeWithValuta.replace(/[^0-9.-]+/g, ''))
    let totalPrice = delivery ?subtotal: (parseFloat(subtotal) + deliveryFee).toFixed(2);
    if (cData.tip) {
        totalPrice = (parseFloat(totalPrice) + parseFloat(cData.tip)).toFixed(2);
    }

    const data = {
        totalItems: totalItems,
        subtotal: subtotal,
        delivery: !delivery,
        deliveryFee: deliveryFee.toFixed(2),
        totalPrice: totalPrice,
        tip: cData.tip ? parseFloat(cData.tip).toFixed(2) : false,
        items: basket.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price.replace('kr.', ''),
            quantity: item.quantity,
            note: item.note || '',
        }))
    };
    if (!document.getElementById('basket')){
        await renderTemplate('../../templates/partials/restaurant-detail/restaurant-detail-sidebar.mustache', 'restaurant-detail-sidebar', {});
        if(document.getElementById('toggle-checkbox')) document.getElementById('toggle-checkbox').checked = delivery;
    }
    await renderTemplate('../../templates/partials/restaurant-detail/basket.mustache', 'basket', data);
    let checkedinput = document.getElementById('toggle-checkbox');

    if (checkedinput) {
        const hasListener = checkedinput.hasAttribute('data-listener');
        if (!hasListener) {
            checkedinput.addEventListener('change', () => {
                const previousValue = deliveryStorage.restaurant[restaurantId]
                    ? deliveryStorage.restaurant[restaurantId].delivery
                    : undefined;
                const newValue = !checkedinput.checked;
                if (previousValue !== newValue) {
                    deliveryStorage.restaurant[restaurantId] = { delivery: newValue };
                    localStorage.setItem('delivery', JSON.stringify(deliveryStorage));
                    setTimeout(() => basketUpdate(newValue), 0);
                }
            });
            checkedinput.setAttribute('data-listener', 'true');
        }
    }

    updateToggleButton(totalItems, totalPrice);

    const removeButtons = document.querySelectorAll('.remove-item-button');
    removeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const itemId = button.getAttribute('data-id');
            const itemIndex = basket.findIndex(item => item.id === itemId);
            if (itemIndex > -1) {
                basket.splice(itemIndex, 1); 
                restaurantCarts[restaurantId] = basket; 
                localStorage.setItem('restaurantCarts', JSON.stringify(restaurantCarts));
                basketUpdate(delivery);
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
                    basket[itemIndex].quantity += 1; 
                } else if (button.dataset.action === 'decrease' && currentValue > min) {
                    quantityInput.value = currentValue - 1;
                    basket[itemIndex].quantity -= 1;
                }
                localStorage.setItem('restaurantCarts', JSON.stringify(restaurantCarts)); 
                basketUpdate(delivery);
            });
        });

        quantityInput.addEventListener('change', () => {
            let currentValue = parseInt(quantityInput.value);
            if (currentValue > max) {
                quantityInput.value = max;
                basket[itemIndex].quantity = max;
            } else if (currentValue < min) {
                quantityInput.value = min;
                basket[itemIndex].quantity = min;
            } else {
                basket[itemIndex].quantity = currentValue; 
            }
            localStorage.setItem('restaurantCarts', JSON.stringify(restaurantCarts));
            basketUpdate(delivery);
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
                        localStorage.setItem('restaurantCarts', JSON.stringify(restaurantCarts));
                        const noteDiv = document.querySelector(`.basket-item[data-id="${itemId}"] .note`);
                        if (noteDiv) {
                           if (noteTextarea.value) {
                                 noteDiv.innerHTML = "<p><strong>Note:</strong> " + noteTextarea.value + "</p>";
                            }else {
                                noteDiv.innerHTML = "";
                            }
                        }
                    }
                    basketUpdate(delivery);
                },
            });
        });
    });

    const checkoutButton = document.querySelector('.checkout-button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            window.location.href = `checkout.html?id=${restaurantId}`;
        });
    }

    let cValid = checkoutData.valid;

    if (cValid === true) {
        const checkoutButton = document.querySelector('.checkout-button1');
        if (checkoutButton) {
            checkoutButton.style.display = 'block';
        }else {
            const checkoutButtonContainer = document.createElement('div');
            checkoutButtonContainer.className = 'checkout-button-container';
            const checkoutButton = document.createElement('button');
            checkoutButton.className = 'checkout-button1';
            checkoutButton.textContent = 'Checkout';
            checkoutButtonContainer.appendChild(checkoutButton);
            const basketContainer = document.querySelector('.basket-footer');
            if (basketContainer) {;
                basketContainer.appendChild(checkoutButtonContainer);
            } else {
                console.error('Basket container not found');
            }
        }
    } else {
        const checkoutButton = document.querySelector('.checkout-button1');
        if (checkoutButton) {
            checkoutButton.style.display = 'none';
        }
    }
};

basketUpdate();
