import * as api from '../utils/api.js';

const form = document.querySelector('#login-form');

const emailInput = form.querySelector('#email');
const passwordInput = form.querySelector('#password');
const submitButton = form.querySelector('#submit');

const radioInput = form.querySelectorAll('input[type="radio"]');

const errorMessage = form.querySelector('#error-message');

submitButton.addEventListener('click', async (event) => {
    event.preventDefault();
    errorMessage.innerHTML = '';

    let checkedRadio = null;
    radioInput.forEach((radio) => radio.checked ? (checkedRadio = radio.id) : null);

    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
        errorMessage.innerHTML = 'Udfyld venligst alle felter.';
        return;
    }

    const data = {
        email: email,
        password: password,
    };

    await api.post('auth/sign-in?client_id=' + checkedRadio , data, api.includeCredentials).then((res) => {
        if (res.status === 200) {
            let role = JSON.parse(atob(res.data.access_token.split('.')[1])).role;
            role = role[0];
            sessionStorage.setItem('role', role);
            if (role === 'admin') {
                window.location.href = 'dashboard.html';
            } else if (role === 'partner') {
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = '../index.html';
            }
        } else {
            errorMessage.innerHTML = 'Forkert brugernavn eller adgangskode.';
        }
    }).catch((error) => {
        console.error(error);
        errorMessage.innerHTML = 'Der opstod en fejl. Prøv igen senere.';
    });
});