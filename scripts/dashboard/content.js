import { renderTemplate } from "../utils/rendertemplate.js";
import { renderCatalog } from "./pages/catalog.js";
import { renderUsers} from "./pages/users.js";
import { renderOrders} from "./pages/order.js";
import { renderApplications } from "./pages/applications.js";
import { renderPartnerHours } from "./pages/partner-hours.js";
import * as api from '../utils/api.js';
import * as auth from "../utils/auth.js";
import { renderChatTemplate } from "./pages/chat.js";

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
    { id: 'partner-hours', url: '#partner-hours' },
    { id: 'chat-window', url: '#chat-window' },
    { id: 'live-orders', url: '#live-orders' },
];
export const renderDashboardContent = async () => {
    await renderTemplate('../../templates/partials/dashboard/content.mustache', 'dashboard-content', { pages });

    if (auth.isAdmin()) {
        await Promise.all([
            renderOrders('orders'),
            renderUsers('users'),
            renderApplications('applications'),
            renderChatTemplate('chat-window')
        ]);
    } else if (auth.isPartner()) {
        // Get partner id first
        let partnerid = null;
        try {
            const res = await api.get('partners/me');
            if (res.status === 200) {
                partnerid = res.data.id;
            } else {
                console.error("Error fetching partner id:", res);
            }
        } catch (err) {
            console.error("Error fetching partner id:", err);
        }
        // Parallelize partner page rendering
        await Promise.all([
            renderCatalog('catalog'),
            // renderOrders('orders', 0, partnerid),
            // // renderLiveOrders('live-orders', partnerid), // Uncomment if needed
            // renderPartnerHours('partner-hours', partnerid)
        ]);
    }

    // Handle active page highlighting
    const pagesEls = document.querySelectorAll('.dashboard-page');
    const updateActivePage = () => {
        let pageId = window.location.hash.substring(1) || 'dashboard';
        pagesEls.forEach(page => {
            page.classList.toggle('active', page.id === pageId);
        });
    };
    updateActivePage();
    window.addEventListener('hashchange', updateActivePage);
};

renderDashboardContent();
