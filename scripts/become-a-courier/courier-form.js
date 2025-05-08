import { renderTemplate } from "../utils/rendertemplate.js";

export const renderCourierForm = async () => {
    let formdata = {
        action: 'thank-you.html',
        method: '',
        fields: [
            {
                id: 'firstname',
                type: 'text',
                label: 'Fornavn',
                placeholder: 'Indtast dit fornavn',
                required: true,
                name: 'firstname',
            },
            {
                id: 'lastname',
                type: 'text',
                label: 'Efternavn',
                placeholder: 'Indtast dit efternavn',
                required: true,
                name: 'lastname',
            },
            {
                id: 'courier-address',
                type: 'text',
                label: 'Adresse',
                placeholder: 'Indtast din adresse',
                required: true,
                autocomplete: true,
                name: 'courier-address',
            },
            {
                id: 'email',
                type: 'email',
                label: 'E-mail',
                placeholder: 'Indtast din e-mail',
                required: true,
                name: 'email',
            },
            {
                id: 'phone',
                type: 'tel',
                label: 'Telefonnummer',
                placeholder: 'Indtast dit telefonnummer',
                required: true,
                name: 'phone',
            },
            {
                id: 'age',
                type: 'radio',
                label: 'Er du over 18 år?',
                placeholder: 'Bekræft at du er over 18 år',
                required: true,
                checkbox: true,
                name: 'age',
                options: [
                    { value: 'yes', text: 'Ja' },
                    { value: 'no', text: 'Nej' },
                ],
            },
            {
                id: 'vehicle',
                type: 'select',
                label: 'Køretøj',
                placeholder: 'Vælg dit køretøj',
                required: true,
                select: true,
                name: 'vehicle',
                options: [
                    { value: 'car', text: 'Bil' },
                    { value: 'bike', text: 'Cykel' },
                    { value: 'scooter', text: 'Scooter' },
                ],
            },
            {
                id: 'availability',
                type: 'select',
                label: 'Tilgængelighed',
                placeholder: 'Vælg din tilgængelighed',
                required: true,
                select: true,
                name: 'availability',
                options: [
                    { value: 'full-time', text: 'Fuldtid' },
                    { value: 'part-time', text: 'Deltid' },
                    { value: 'weekends', text: 'Weekender' },
                ],
            },
            {
                id: 'work-hours',
                type: 'select',
                label: 'Arbejdstimer pr. uge',
                placeholder: 'Vælg dine arbejdstimer pr. uge',
                required: true,
                select: true,
                name: 'work-hours',
                options: [
                    { value: '8', text: '8 timer' },
                    { value: '16-20', text: '16-20 timer' },
                    { value: '24-30', text: '24-30 timer' },
                ],
            }
        ],
        title: 'Bliv bud',
        description: 'Udfyld formularen nedenfor for at blive bud.',
        submitText: 'Send ansøgning',
    };
    await renderTemplate(
        '../../templates/partials/form.mustache',
        'become-a-courier-form',
        formdata
    ).then(() => {
        const form = document.getElementById('become-a-courier-form');
        const addressInput = document.getElementById('courier-address');
        // get the age checkbox and add an event listener to it
        const ageCheckbox = document.querySelectorAll('input[name="age"]');

        if(ageCheckbox) {
            ageCheckbox.forEach((checkbox) => {
                checkbox.addEventListener('change', function () {
                    if (this.checked) {
                        ageCheckbox.forEach((otherCheckbox) => {
                            if (otherCheckbox !== this) {
                                otherCheckbox.checked = false;
                            }
                        });
                    }
                });
            });
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                window.location.href = `thank-you.html?type=courier`;
            });
        }

        if (addressInput) {
            dawaAutocomplete.dawaAutocomplete(addressInput, {
                select: function (selected) {
                    console.log(selected);
                    if (addressInput) {
                        addressInput.innerHTML = selected.tekst;
                    }
                },
            });
        }


    })

    
}

