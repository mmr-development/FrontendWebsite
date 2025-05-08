import * as api from '../utils/api.js';

const form = document.querySelector('#forgot-password-form');
const emailInput = form.querySelector('#email');

const submitButton = form.querySelector('#submit');

const errorMessage = form.querySelector('#error-message');
const successMessage = form.querySelector('#success-message');

submitButton.addEventListener('click', async (event) => {
    event.preventDefault();
    errorMessage.innerHTML = '';
    successMessage.innerHTML = '';

    const email = emailInput.value;

    if (!email) {
        errorMessage.innerHTML = 'Udfyld venligst alle felter.';
        return;
    }

    const data = {
        email: email,
    };

    await api.post('auth/forgot-password', data).then((res) => {
        console.log(res);
        if (res.status === 200) {
            successMessage.innerHTML = 'En e-mail med instruktioner til nulstilling af din adgangskode er blevet sendt til din e-mailadresse.';
        } else {
            errorMessage.innerHTML = 'Forkert brugernavn eller adgangskode.';
        }
    }).catch((error) => {
        console.error(error);
        errorMessage.innerHTML = 'Der opstod en fejl. Prøv igen senere.';
    });
});