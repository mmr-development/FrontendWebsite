import {detail_data} from './restaurant-detail.js';
import menu_data from './restaurant-menu.js';
import './searchbar.js';
import { renderTemplate } from '../utils/rendertemplate.js';
import './restaurant-detail-sidebar.js';
import { basketUpdate } from './basket.js';
import { updateToggleButton} from './restaurant-detail-sidebar-toggle.js';

await renderTemplate('../../templates/pages/restaurant-detail.mustache', 'restaurant-detail', detail_data);
await renderTemplate('../../templates/partials/restaurant-detail/restaurant-menu.mustache', 'restaurant-menu', menu_data);

let menu_items = document.querySelectorAll('.menu-item');
menu_items.forEach(item => {
    item.addEventListener('click', async () => {
        let min = 1;
        let max = 50;
        let itemName = item.querySelector('.menu-item-name').textContent;
        let itemPrice = item.querySelector('.menu-item-price').textContent;
        let itemDescription = item.querySelector('.menu-item-description').textContent;
        let itemImage = item.querySelector('.menu-item-image img').src;
        await renderTemplate('../../templates/partials/restaurant-detail/modal.mustache', 'modal', {
            image: itemImage,
            name: itemName,
            price: itemPrice,
            description: itemDescription,
            min: min,
            max: max,
            quantity: 1,
        }).then(() => {
            const modal = document.getElementById('modal');
            modal.classList.add('active');
            document.querySelectorAll('.close-modal').forEach((close) => {
                close.addEventListener('click', () => {
                    modal.classList.remove('active');
                });
            });
            const quantityButtons = document.querySelectorAll('.quantity-button');
            const quantityInput = document.getElementById('quantity-input-menu-item');
            quantityButtons.forEach(button => {
                button.addEventListener('click', () => {
                    let currentValue = parseInt(quantityInput.value);
                    if (button.dataset.action === 'increase' && currentValue < max) {
                        quantityInput.value = currentValue + 1;
                    } else if (button.dataset.action === 'decrease' && currentValue > min) {
                        quantityInput.value = currentValue - 1;
                    }
                });
            });

            quantityInput.addEventListener('change', () => {
                let currentValue = parseInt(quantityInput.value);
                if (currentValue > max) {
                    quantityInput.value = max;
                } else if (currentValue < min) {
                    quantityInput.value = min;
                }
            });

            const addToCartButton = document.querySelector('.add-to-cart');
            addToCartButton.addEventListener('click', () => {
                const quantity = parseInt(quantityInput.value);
                const id = item.getAttribute('data-id');
                const itemName = item.querySelector('.menu-item-name').textContent;
                const itemPrice = item.querySelector('.menu-item-price').textContent;
                const urlParams = new URLSearchParams(window.location.search);
                const restaurantId = urlParams.get('id');
            
                if (!restaurantId) {
                    return;
                }
            
                const cartItem = {
                    id: id,
                    name: itemName,
                    price: itemPrice,
                    quantity: quantity
                };
            
                modal.classList.remove('active');
            
                let restaurantCarts = JSON.parse(localStorage.getItem('restaurantCarts')) || {};
                let cart = restaurantCarts[restaurantId] || [];
            
                const existingItemIndex = cart.findIndex(cartItem => cartItem.id === id);
                if (existingItemIndex > -1) {
                    cart[existingItemIndex].quantity += quantity;
                } else {
                    cart.push(cartItem);
                }
            
                restaurantCarts[restaurantId] = cart;
                localStorage.setItem('restaurantCarts', JSON.stringify(restaurantCarts));
            
                basketUpdate();
            });


        });
    });
});