import * as api from './api.js';

export const isLoggedIn = () => {
    const token = sessionStorage.getItem('role');
    return token !== null;
}

export const isAdmin = () => {
    const token = sessionStorage.getItem('role');
    return token === 'admin';
}

export const isPartner = () => {
    const token = sessionStorage.getItem('role');
    return token === 'partner';
}

export const isSupport = () => {
    const token = sessionStorage.getItem('role');
    return token === 'support';
}

export const Logout = () => {
    // remove all session storage items
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('partner_id');
    sessionStorage.removeItem('userInfo');
    sessionStorage.removeItem('userOrders');
    sessionStorage.removeItem('restaurantCarts');
    sessionStorage.removeItem('delivery');
    sessionStorage.removeItem('order');
    // remove all local storage items
    localStorage.removeItem('role');
    localStorage.removeItem('partner_id');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userOrders');
    localStorage.removeItem('restaurantCarts');
    localStorage.removeItem('delivery');
    localStorage.removeItem('order');
    // call the API to sign out
    return api.post('auth/sign-out', {}, api.includeCredentials).then((res) => {
        if (res.status === 200) {
            window.location.href = '/index.html';
        }
        if (res.status === 401) {
            api.reauthenticate().then(() => {
                return api.post('auth/sign-out', {}, api.includeCredentials).then((res) => {
                    if (res.status === 200) {
                        window.location.href = '/index.html';
                    }
                });
            });
        }
    });
}