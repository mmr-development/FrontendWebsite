import * as api from '../utils/api.js';

// get form data from login-form element
const form = document.querySelector('#login-form');

const emailInput = form.querySelector('#email');
const passwordInput = form.querySelector('#password');
const submitButton = form.querySelector('#submit');

const radioInput = form.querySelector('input[type="radio"]:checked').id;

const errorMessage = form.querySelector('#error-message');

submitButton.addEventListener('click', async (event) => {
    event.preventDefault();
    errorMessage.innerHTML = '';

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

    console.log(radioInput)
    await api.post('auth/sign-in?' + radioInput , data).then((res) => {
        if (res.status === 200) {
            window.location.href = '../index.html';
        } else {
            errorMessage.innerHTML = 'Forkert brugernavn eller adgangskode.';
        }
    }).catch((error) => {
        console.error(error);
        errorMessage.innerHTML = 'Der opstod en fejl. Prøv igen senere.';
    });
})