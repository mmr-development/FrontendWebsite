import { renderTemplate } from "../utils/rendertemplate.js";

export const updateToggleButton = async (quantity, totalPrice) => {
    await renderTemplate(
        '../../templates/partials/restaurant-detail/sidebar-toggle-button.mustache',
        'sidebar-toggle-button',
        {quantity: quantity, totalPrice: totalPrice}
    );

    let toggleButton = document.getElementById('sidebar-toggle-button');
    let contentWrapper = document.querySelector('.sidebar-content-wrapper');

    toggleButton.addEventListener('click', () => { // Use querySelector for a single element
        if (contentWrapper) {
            contentWrapper.classList.add('show'); // Toggle a class to show/hide the sidebar
        }
    });

    let closeButton = document.getElementsByClassName('close-sidebar')[0];
    
    closeButton.addEventListener('click', () => {
        if (contentWrapper) {
            contentWrapper.classList.toggle('show'); // Toggle a class to show/hide the sidebar
        }
    });
};