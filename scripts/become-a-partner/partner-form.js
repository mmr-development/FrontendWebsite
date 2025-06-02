import { renderTemplate } from "../utils/rendertemplate.js";
import * as api from '../utils/api.js';

export const renderPartnerForm = async () => {
     let formdata = {
        action: 'partner-form',
        method: 'POST',
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
                id: 'company-name',
                type: 'text',
                label: 'Virksomhedsnavn',
                placeholder: 'Indtast dit virksomhedsnavn',
                required: true,
                name: 'company-name',
            },
            {
                id: 'company-address',
                type: 'text',
                label: 'Virksomhedsadresse',
                placeholder: 'Indtast din virksomhedsadresse',
                required: true,
                name: 'company-address',
                autocomplete: true,
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
                id: 'contact-phone',
                type: 'tel',
                label: 'Kontaktunmmer',
                placeholder: 'Indtast dit telefonnummer',
                required: true,
                name: 'contact-phone',
            },
            {
                id: 'company-phone',
                type: 'tel',
                label: 'Virksomhedens telefonnummer',
                placeholder: 'Indtast virksomhedens telefonnummer',
                required: true,
                name: 'company-phone',
            },
            {
                id: 'delivery-method',
                type: 'select',
                select: true,
                label: 'Leveringsmetode',
                placeholder: 'Vælg en leveringsmetode',
                required: true,
                name: 'delivery-method',
            },
            {
                id: 'business-type',
                type: 'select',
                select: true,
                label: 'Virksomhedstype',
                placeholder: 'Vælg en virksomhedstype',
                required: true,
                name: 'business-type',
            },
        ],
        title: 'Bliv partner',
        description: 'Udfyld formularen nedenfor for at blive partner.',
        submitText: 'Send ansøgning',
    }
    renderTemplate(
        '../../templates/partials/form.mustache',
        'become-a-partner-form',
        formdata
    );
    let deliverymethods = await api.get('partners/delivery-methods/').then((response) => {
        if (response.status === 200) {
            return response.data.delivery_methods;
        } 
        return [];
    })
    formdata.fields.find((field) => field.id === 'delivery-method').options = deliverymethods.map(method => {
        return {
            value: method.id,
            text: method.name,
        };
    });
    let buisnessTypes = await api.get('partners/business-types/').then((response) => {
        if (response.status === 200) {
            return response.data.business_types;
        }
        return [];
    })
    formdata.fields.find((field) => field.id === 'business-type').options = buisnessTypes.map(type => {
        return {
            value: type.id,
            text: type.name,
        };
    });
    await renderTemplate(
        '../../templates/partials/form.mustache',
        'become-a-partner-form',
        formdata
    ).then(async () => {
        let addressInput = document.querySelector('#company-address');
        let addressdata = {};
        if (addressInput) {
            dawaAutocomplete.dawaAutocomplete(addressInput, {
                select: function (selected) {
                    addressdata = {
                        street: selected.data.vejnavn,
                        address_detail: selected.data.husnr + (selected.data.etage ? ', ' + selected.data.etage : '') + (selected.data.dør ? ' ' + selected.data.dør : ''),
                        city: selected.data.postnrnavn,
                        postal_code: selected.data.postnr,
                        country: 'denmark',
                        latitude: selected.data.y,
                        longitude: selected.data.x,
                    };
                    if (addressInput) {
                        addressInput.innerHTML = selected.tekst;
                    }
                },
            });
        }

        document.querySelector('#become-a-partner-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            let formData = new FormData(e.target);
            let data = Object.fromEntries(formData.entries());
            let formattedData = {
                contact_person: {
                    first_name: data.firstname,
                    last_name: data.lastname,
                    phone_number: data['contact-phone'],
                    email: data.email,
                },
                business: {
                    name: data['company-name'],
                    phone_number: data['company-phone'],
                    address: addressdata,
                },
                delivery_method_id: parseInt(data['delivery-method'], 10),
                business_type_id: parseInt(data['business-type'], 10),
            };
            await api.post('partner-applications', formattedData).then((response) => {
                if (response.status === 201) {
                    window.location.href = 'thank-you.html?type=partner';
                } else {
                    alert('Der opstod en fejl. Prøv igen senere.');
                }
            }).catch((error) => {
                console.error(error);
                alert('Der opstod en fejl. Prøv igen senere.');
            });
        });
    });
}

