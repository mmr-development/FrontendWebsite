import { renderTemplate } from "../utils/rendertemplate.js";
import { renderCatalog } from "./pages/catalog.js";

let pages = [
    { id: 'dashboard', url: '#dashboard' },
    { id: 'orders', url: '#orders' },
    { id: 'products', url: '#products' },
    { id: 'customers', url: '#customers' },
    { id: 'settings', url: '#settings' },
    { id: 'applications', url: '#applications' },
    { id: 'catalog', url: '#catalog' },
];

export const renderDashboardContent = async () => {
    console.log("renderDashboardContent");
    await renderTemplate('../../templates/partials/dashboard/content.mustache', 'dashboard-content', {pages: pages}).then(async() => {
        await renderCatalog('catalog');
    });
};

renderDashboardContent();