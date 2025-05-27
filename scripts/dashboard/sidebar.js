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
        { url: '#live-orders', label: 'Live Orders', icon: 'fas fa-bolt' }, // Changed icon to 'bolt'
        { url: "#catalog", label: "Catalog", icon: "fas fa-utensils" },
        { url: '#partner-hours', label: 'Partner Hours', icon: 'fas fa-clock' },
        { url: '#partner-details', label: 'Partner Details', icon: 'fas fa-user' },
    ]
} else if (auth.isSupport()) {
    data.sidebarLinks =  [
        { url: '#schema-planner', label: 'Schema Planner', icon: 'fas fa-calendar-alt' },
        { url: '#chat-window', label: 'Chat', icon: 'fas fa-comments' },
    ]
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

        let logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                // remove session storage
                sessionStorage.removeItem('role');
                api.post('auth/sign-out', {}, api.includeCredentials).then((res) => {
                    if (res.status === 200) {
                        window.location.href = '/';
                    } else {
                        console.error('Logout failed');
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