import { renderTemplate } from "../utils/rendertemplate.js";
import { renderCatalog } from "./pages/catalog.js";
import { renderUsers} from "./pages/users.js";
import { renderOrders} from "./pages/order.js";
import { renderApplications } from "./pages/applications.js";
import { renderPartnerHours } from "./pages/partner-hours.js";
import { renderParnterDetails } from "./pages/partner-details.js";
import * as api from '../utils/api.js';
import * as auth from "../utils/auth.js";
import { renderChatTemplate } from "./pages/chat.js";
import { renderSchemaPlanner } from "./pages/schema-planner.js";
import { renderLiveOrders } from "./pages/live-orders.js";

const role = sessionStorage.getItem('role');

if (role === null) {
    console.error("User is not logged in");
}

let pages = [
    { id: 'dashboard', url: '#dashboard', active: true },
];
export const renderDashboardContent = async () => {
    if (auth.isAdmin()) {
        pages.push(
            { id: 'orders', url: '#orders' },
            { id: 'users', url: '#users' },
            { id: 'applications', url: '#applications' },
            { id: 'chat-window', url: '#chat-window' }
        );
    } else if (auth.isPartner()) {
        pages.push(
            { id: 'orders', url: '#orders' },
            { id: 'catalog', url: '#catalog' },
            { id: 'partner-hours', url: '#partner-hours' },
            { id: 'partner-details', url: '#partner-details' },
            { id: 'schema-planner', url: '#schema-planner' },
            { id: 'live-orders', url: '#live-orders' }
        );
    } else if (auth.isSupport()) {
        pages.push(
            { id: 'schema-planner', url: '#schema-planner' },
            { id: 'chat-window', url: '#chat-window' }
        );
    }
    await renderTemplate('../../templates/partials/dashboard/content.mustache', 'dashboard-content', { pages });

    if (auth.isAdmin()) {
        await Promise.all([
            renderOrders('orders'),
            renderUsers('users'),
            renderApplications('applications'),
        ]);
    } else if (auth.isPartner()) {
        let partnerid = localStorage.getItem('selectedPartnerId') || null;
        let partners = [];
        try {
            const res = await api.get('partners/me');
            if (res.status === 200) {
                partners = res.data;
                if (partners.length > 0) {
                    const validPartner = partners.find(p => p.id === parseInt(partnerid));
                    if (!validPartner) {
                        partnerid = partners[0].id;
                        localStorage.setItem('selectedPartnerId', partnerid);
                    }
                } else {
                    console.error("No partners found");
                }
            }
        } catch (err) {
            console.error("Error fetching partner id:", err);
        }
        await Promise.all([
            renderCatalog('catalog', 0, partnerid, partners),
            renderOrders('orders', 0, partnerid, partners),
            renderLiveOrders('live-orders', partnerid, partners),
            renderPartnerHours('partner-hours', partnerid, partners),
            renderParnterDetails('partner-details', partnerid, partners),
        ]);
    } else if (auth.isSupport()) {
        await Promise.all([
            renderSchemaPlanner('schema-planner'),
            renderChatTemplate('chat-window')
        ]);
    }
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
