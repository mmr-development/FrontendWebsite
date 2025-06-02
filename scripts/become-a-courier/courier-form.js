import { renderTemplate } from "../utils/rendertemplate.js";
import * as api from "../utils/api.js";

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
            },
            {
                id: 'availability',
                type: 'select',
                label: 'Tilgængelighed',
                placeholder: 'Vælg din tilgængelighed',
                required: true,
                select: true,
                name: 'availability',
            },
            {
                id: 'work-hours',
                type: 'select',
                label: 'Arbejdstimer pr. uge',
                placeholder: 'Vælg dine arbejdstimer pr. uge',
                required: true,
                select: true,
                name: 'work-hours',
            }
        ],
        title: 'Bliv bud',
        description: 'Udfyld formularen nedenfor for at blive bud.',
        submitText: 'Send ansøgning',
    };
    renderTemplate(
        '../../templates/partials/form.mustache',
        'become-a-courier-form',
        formdata
    )
    let preferancehours = await api.get('couriers/hour-preferences/', api.includeCredentials).then((res) => {
        if (res.status === 200) {
            return res.data.hour_preferences.map((item) => {
                return {
                    value: item.id,
                    text: item.name,
                };
            });
        }
        return null;
    });
    formdata.fields.find((field) => field.id === 'work-hours').options = preferancehours;
    let preferanceavailability = await api.get('couriers/schedule-preferences/', api.includeCredentials).then((res) => {
        if (res.status === 200) {
            return res.data.schedule_preferences.map((item) => {
                return {
                    value: item.id,
                    text: item.name,
                };
            });
        }
        return null;
    });
    formdata.fields.find((field) => field.id === 'availability').options = preferanceavailability;
    let vehicleTypes = await api.get('couriers/vehicle-types/', api.includeCredentials).then((res) => {
        if (res.status === 200) {
            return res.data.vehicle_types.map((item) => {
                return {
                    value: item.id,
                    text: item.name,
                };
            });
        }
        return null;
    });
    formdata.fields.find((field) => field.id === 'vehicle').options = vehicleTypes;
    if(!vehicleTypes || !preferanceavailability || !preferancehours) {
        console.error("Failed to fetch vehicle types, availability preferences or work hours preferences.");
        alert("Der opstod en fejl under indlæsning af formularen. Prøv igen senere.");
        return;
    }
    await renderTemplate(
        '../../templates/partials/form.mustache',
        'become-a-courier-form',
        formdata
    ).then(() => {
        const form = document.getElementById('become-a-courier-form').children[0];
        const addressInput = document.getElementById('courier-address');
        const ageCheckbox = document.querySelectorAll('input[name="age"]');

        const availabilitySelect = document.getElementById('availability');
        const workHoursSelect = document.getElementById('work-hours');
        const vehicleSelect = document.getElementById('vehicle');

        let addressdata;

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

                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                const structuredData = {
                    personal_details: {
                        first_name: data.firstname || "",
                        last_name: data.lastname || "",
                        email: data.email || "",
                        phone_number: data.phone || "",
                        address: addressdata, 
                        is_eighteen_plus: data.age === "yes"
                    },
                    schedule_preference: parseInt(availabilitySelect.value) || 1,
                    hours_preference: parseInt(workHoursSelect.value) || 1,
                    vehicle_type_id: parseInt(vehicleSelect.value) || 1,
                    data_retention_consent: true
                };

                api.post('courier-applications/', structuredData, api.includeCredentials).then((res) => {
                    if (res.status === 201) {
                        alert("Ansøgning sendt. Du vil modtage en bekræftelse på din e-mail.");
                        window.location.href = `thank-you.html?type=courier`;
                    } else {
                        console.error(res);
                        alert("Der opstod en fejl. Prøv igen senere.");
                    }
                });
            });
        }

        if (addressInput) {
            dawaAutocomplete.dawaAutocomplete(addressInput, {
                select: function (selected) {
                    addressdata = {
                        street: selected.data.vejnavn,
                        address_detail: selected.data.husnr
                         + (selected.data.etage ? `, ${selected.data.etage}` : "") + (selected.data.dør ? ` ${selected.data.dør}` : ""),
                        city: selected.data.postnrnavn,
                        postal_code: selected.data.postnr,
                        country: "Danmark",
                        longitude: selected.data.y,
                        latitude: selected.data.x,
                    };

                    if (addressInput) {
                        addressInput.innerHTML = selected.tekst;
                    }
                },
            });
        }


    })

    
}

