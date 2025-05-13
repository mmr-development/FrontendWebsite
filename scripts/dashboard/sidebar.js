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
    ],
}

if(auth.isAdmin()) {
    data.sidebarLinks = [
        { url: '#orders', label: 'Orders', icon: 'fas fa-shopping-cart' },
        { url: '#users', label: 'Users', icon: 'fas fa-users' },
        { url: '#applications', label: 'Applications' , icon: 'fas fa-cogs' },
    ];
} else if(auth.isPartner()) {
    data.sidebarLinks = [
        { url: '#orders', label: 'Orders', icon: 'fas fa-shopping-cart' },
        { url: "#catalog", label: "Catalog", icon: "fas fa-utensils" },
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
                // remove session storage
                sessionStorage.removeItem('role');
                api.post('auth/sign-out', {}, api.includeCredentials).then((res) => {
                    if (res.status === 200) {
                        window.location.href = '/';
                    } else {
                        console.log('Logout failed');
                    }
                }).catch((error) => {
                    console.error(error);
                });
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