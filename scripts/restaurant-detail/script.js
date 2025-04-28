import {detail_data} from './restaurant-detail.js';
import {menu_data} from './restaurant-menu.js';
import './searchbar.js';
import { renderTemplate } from '../utils/rendertemplate.js';

await renderTemplate('../../templates/pages/restaurant-detail.mustache', 'restaurant-detail', detail_data);
await renderTemplate('../../templates/partials/restaurant-detail/restaurant-menu.mustache', 'restaurant-menu', menu_data);

let menu_items = document.querySelectorAll('.menu-item');
menu_items.forEach(item => {
    item.addEventListener('click', async () => {
        await renderTemplate('../../templates/partials/restaurant-detail/modal.mustache', 'modal', {
            image: "../../files/images/restaurants/placeholder.png",
            name: "test",
            price: "test123",
            description: "test123",
        }).then(() => {
            const modal = document.getElementById('modal');
            modal.classList.add('active');
            document.querySelectorAll('.close-modal').forEach((close) => {
                close.addEventListener('click', () => {
                    modal.classList.remove('active');
                });
            });
        });
    });
});