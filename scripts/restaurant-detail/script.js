import {getRestaurantDetail} from './restaurant-detail.js';
import {renderMenu, renderMenuFast} from './restaurant-menu.js';
import { renderTemplate } from '../utils/rendertemplate.js';
import './restaurant-detail-sidebar.js';
import { basketUpdate } from './basket.js';
import { renderModal } from '../utils/modal.js';

let renderPage = async (id) => {
    let restaurantsCatalogs = JSON.parse(localStorage.getItem('restaurantsCatalogs')) || {};
    let restaurantDetail = restaurantsCatalogs[id];
    await renderTemplate('../../templates/pages/restaurant-detail.mustache', 'restaurant-detail',restaurantDetail);
    await renderMenuFast(id);

    let newDetails = await getRestaurantDetail(id)

    if (!restaurantDetail || JSON.stringify(newDetails) !== JSON.stringify(restaurantDetail)) {
        restaurantDetail = newDetails;
        restaurantsCatalogs[id] = restaurantDetail;
        localStorage.setItem('restaurantsCatalogs', JSON.stringify(restaurantsCatalogs));
        await renderTemplate('../../templates/pages/restaurant-detail.mustache', 'restaurant-detail',restaurantDetail);
        await renderMenu(id);
    }
}

let id = new URLSearchParams(window.location.search).get('id');

await renderPage(id).then(() => {
    let infoIcon = document.querySelector('.fa-info-circle');
    if (!infoIcon) {
        console.error("Info icon not found, rendering page without it.");
        renderPage(id);
    }
    if (infoIcon) {
        infoIcon.addEventListener('click', async () => {
            let restaurantsCatalogs = JSON.parse(localStorage.getItem('restaurantsCatalogs')) || {};
            let restaurantDetail = restaurantsCatalogs[id];
            await renderModal({
                minWidth: '400',
                title: 'Restaurant Information',
                content: `
                <div class="restaurant-detail-info">
                    <p><strong>Delivery Fee:</strong> ${restaurantDetail.delivery_fee ? restaurantDetail.delivery_fee : 'N/A'}</p>
                    <p><strong>Minimum Order:</strong> ${restaurantDetail.minimum_order ? restaurantDetail.minimum_order : 'N/A'}</p>
                    <p><strong>Opening Hours:</strong></p>
                    <ul>
                    ${restaurantDetail.opening_hours.map(hour => `<li>${hour.day}: ${hour.hours}</li>`).join('')}
                    </ul>
                </div>
                `,
                close: "Close",
                submit: null,
                submitCallback: null
            });
        });
    }

    let searchcategories = document.querySelectorAll('.search-category');
    searchcategories.forEach((category) => {
        category.addEventListener('click', () => {
            let value = category.getAttribute('data-value');
            let isActive = category.classList.contains('active');
            searchcategories.forEach((cat) => cat.classList.remove('active'));
    
            let categories = document.querySelectorAll('.menu-category');
    
            if (isActive) {
                categories.forEach((cat) => {
                    cat.style.display = 'flex';
                });
            } else {
                category.classList.add('active');
                categories.forEach((cat) => {
                    if (cat.getAttribute('data-value') === value) {
                        cat.style.display = 'flex';
                    } else {
                        cat.style.display = 'none';
                    }
                });
            }
        });
    });

    let searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', () => {
        let searchValue = searchInput.value.toLowerCase();
        let menuCategories = document.querySelectorAll('.menu-category');
    
        menuCategories.forEach((category) => {
            let menuItems = category.querySelectorAll('.menu-item');
            let hasVisibleItems = false;
    
            menuItems.forEach((item) => {
                let itemName = item.querySelector('.menu-item-name').textContent.toLowerCase();
                let itemDescription = item.querySelector('.menu-item-description').textContent.toLowerCase();
    
                if (itemName.includes(searchValue) || itemDescription.includes(searchValue)) {
                    item.style.display = 'flex';
                    hasVisibleItems = true;
                } else {
                    item.style.display = 'none';
                }
            });

            if (hasVisibleItems) {
                category.style.display = 'flex';
            } else {
                category.style.display = 'none';
            }
        });
    });

    let menu_items = document.querySelectorAll('.menu-item');
    menu_items.forEach(item => {
        item.addEventListener('click', async () => {
            let min = 1;
            let max = 50;
            let itemName = item.querySelector('.menu-item-name').textContent;
            let itemPrice = item.querySelector('.menu-item-price').textContent;
            let itemDescription = item.querySelector('.menu-item-description').textContent;
            let itemImage = item.querySelector('.menu-item-image img') ? item.querySelector('.menu-item-image img').src : '';	
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
                addToCartButton.addEventListener('click', async () => {
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
                
                    await basketUpdate();
                });
            });
        });
    });
});