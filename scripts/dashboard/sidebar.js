import { renderTemplate } from "../utils/rendertemplate.js";
import * as api from '../utils/api.js';
import * as auth from "../utils/auth.js";

if (!auth.isLoggedIn()) {
    window.location.href = '/';
}

const data = {
    sidebarTitle: 'Dashboard',
    logoutText: 'Logout',
    sidebarLinks: [
        { label: 'Dashboard', url: '#', icon: 'fas fa-tachometer-alt' }, // Dashboard icon
        { label: 'Orders', url: '#orders', icon: 'fas fa-shopping-cart' }, // Shopping cart icon
        { label: 'Products', url: '#products', icon: 'fas fa-box' }, // Box icon
        { label: 'Customers', url: '#customers', icon: 'fas fa-users' }, // Users icon
        { label: 'Settings', url: '#settings', icon: 'fas fa-cog' }, // Settings gear icon
    ],
}

if(auth.isAdmin()) {
    data.sidebarLinks = [
        { url: '#dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
        { url: '#orders', label: 'Orders', icon: 'fas fa-shopping-cart' },
        { url: '#customers', label: 'Customers', icon: 'fas fa-users' },
        { url: '#applications', label: 'Applications' , icon: 'fas fa-cogs' },
    ];
} else if(auth.isPartner()) {
    data.sidebarLinks = [
        { url: '#dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
        { url: '#orders', label: 'Orders', icon: 'fas fa-shopping-cart' },
        { url: '#applications', label: 'Applications' , icon: 'fas fa-cogs' },
    ];
}

export const renderSidebar = async () => {
    await renderTemplate('../../templates/partials/dashboard/sidebar.mustache', 'dashboard-sidebar', data).then(() =>{
        let sidebarToggleButton = document.getElementById('dashboard-sidebar-toggle-button');
        if (!sidebarToggleButton) {
            return;
        }
        sidebarToggleButton.addEventListener('click', () => { 
            toggleSidebar();
        });

        // logout button
        let logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {

            });
        }
    })
};

export const toggleSidebar = () => {
    const sidebar = document.getElementById('dashboard-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('show');
    }
};

renderSidebar();