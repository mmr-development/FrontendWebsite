import * as api from '../utils/api.js';

const form = document.querySelector('#register-form');

const firstnameInput = form.querySelector('#firstname');
const lastnameInput = form.querySelector('#lastname');
const emailInput = form.querySelector('#email');
const phoneInput = form.querySelector('#phone');
const passwordInput = form.querySelector('#password');
const submitButton = form.querySelector('#submit');

const errorMessage = form.querySelector('#error-message');

submitButton.addEventListener('click', async (event) => {
    event.preventDefault();
    errorMessage.innerHTML = '';

    const email = emailInput.value;
    const password = passwordInput.value;
    const firstname = firstnameInput.value;
    const lastname = lastnameInput.value;
    const phone = phoneInput.value;

    if (!email || !password || !firstname || !lastname || !phone) {
        errorMessage.innerHTML = 'Udfyld venligst alle felter.';
        return;
    }

    const data = {
        first_name: firstname,
        last_name: lastname,
        email: email,
        phone_number: phone,
        password: password,
    };

    await api.post('auth/sign-up', data).then((res) => {
        if (res.status === 201) {
            window.location.href = '../index.html';
        } else {
            errorMessage.innerHTML = 'Forkert brugernavn eller adgangskode.';
        }
    }).catch((error) => {
        console.error(error);
        errorMessage.innerHTML = 'Der opstod en fejl. Prøv igen senere.';
    });
})