import * as api from '../utils/api.js';

let urlparams = new URLSearchParams(window.location.search);

let token = urlparams.get('token');
if (token === null) {
    token = localStorage.getItem('token');
    if (token === null) window.location.href = '/';
}

// let temp local storage
localStorage.setItem('token', token);

// remove token from url
let newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
window.history.replaceState({}, document.title, newUrl);

let form = document.getElementById('reset-password-form');
if (form) {
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        let password = document.getElementById('password').value;
        let confirmPassword = document.getElementById('confirm-password').value;
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        api.post('auth/reset-password/'+token, {password: password,confirm_password: confirmPassword}, api.includeCredentials).then((res) => {
            if (res.status === 200) {
                // remove token from local storage
                localStorage.removeItem('token');
                window.location.href = '/pages/login.html';
            } else {
                console.error('Error creating password:', res);
            }
        });
    });
}
