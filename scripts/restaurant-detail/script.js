import {detail_data} from './restaurant-detail.js';
import {menu_data} from './restaurant-menu.js';
import './searchbar.js';
import { renderTemplate } from '../utils/rendertemplate.js';
import './restaurant-detail-sidebar.js';

await renderTemplate('../../templates/pages/restaurant-detail.mustache', 'restaurant-detail', detail_data);
await renderTemplate('../../templates/partials/restaurant-detail/restaurant-menu.mustache', 'restaurant-menu', menu_data);

let menu_items = document.querySelectorAll('.menu-item');
menu_items.forEach(item => {
    item.addEventListener('click', async () => {
        let min = 1;
        let max = 50;
        await renderTemplate('../../templates/partials/restaurant-detail/modal.mustache', 'modal', {
            image: "../../files/images/restaurants/placeholder.png",
            name: "test",
            price: "test123",
            description: "test123",
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
            const quantityInput = document.querySelector('.quantity-input');
            quantityButtons.forEach(button => {
                button.addEventListener('click', () => {
                    let currentValue = parseInt(quantityInput.value);
                    if (button.dataset.action === 'increase') {
                        if (currentValue < max) {
                            quantityInput.value = currentValue + 1;
                        }
                    } else if (button.dataset.action === 'decrease') {
                        if (currentValue > min) {
                            quantityInput.value = currentValue - 1;
                        }
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
        });
    });
});