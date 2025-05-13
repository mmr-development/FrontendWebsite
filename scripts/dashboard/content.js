import { renderTemplate } from "../utils/rendertemplate.js";
import { renderCatalog } from "./pages/catalog.js";
import { renderUsers} from "./pages/users.js";
import { renderOrders} from "./pages/order.js";
import { renderApplications } from "./pages/applications.js";
import * as api from '../utils/api.js';
import * as auth from "../utils/auth.js";

// get role from session storage
const role = sessionStorage.getItem('role');

if (role === null) {
    console.log("role is null");
}

let pages = [
    { id: 'dashboard', url: '#dashboard', active: true },
    { id: 'orders', url: '#orders' },
    { id: 'products', url: '#products' },
    { id: 'users', url: '#users' },
    { id: 'settings', url: '#settings' },
    { id: 'applications', url: '#applications' },
    { id: 'catalog', url: '#catalog' },
];

export const renderDashboardContent = async () => {
    await renderTemplate('../../templates/partials/dashboard/content.mustache', 'dashboard-content', {pages: pages}).then(async() => {
        if (auth.isAdmin()) {
            // render admin pages
            await renderOrders();
            await renderUsers('users');
            await renderApplications('applications');
        } else if (auth.isPartner()) {
            await renderCatalog('catalog');
        }
    }).then(async () => {
        let pages = document.querySelectorAll('.dashboard-page');

        const updateActivePage = () => {
            let pageId = window.location.hash.substring(1);
            if (!pageId) {
                pageId = 'dashboard';
            }
        
            pages.forEach(page => {
                if (page.id === pageId) {
                    page.classList.add('active');
                } else {
                    page.classList.remove('active');
                }
            });
        };
        
        // Initial call to set the active page
        updateActivePage();
        
        // Add an event listener to detect URL hash changes
        window.addEventListener('hashchange', updateActivePage);
    });
};

renderDashboardContent();