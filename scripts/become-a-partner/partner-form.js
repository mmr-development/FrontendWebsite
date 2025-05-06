import { renderTemplate } from "../utils/rendertemplate.js";
import * as api from '../utils/api.js';
import { renderConfetti } from "../utils/confetti.js";

export const renderPartnerForm = async () => {
    let deliverymethods = await api.get('partners/delivery-methods/');
    let buisnessTypes = await api.get('partners/business-types/');
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
                id: 'delivery-method',
                type: 'select',
                select: true,
                label: 'Leveringsmetode',
                placeholder: 'Vælg en leveringsmetode',
                required: true,
                name: 'delivery-method',
                options: [
                    { value: '', text: 'Vælg en leveringsmetode' },
                    ...deliverymethods.map(method => {
                        return {
                            value: method.id,
                            text: method.name,
                        }
                    }),
                ],
            },
            // buisness type
            {
                id: 'business-type',
                type: 'select',
                select: true,
                label: 'Virksomhedstype',
                placeholder: 'Vælg en virksomhedstype',
                required: true,
                name: 'business-type',
                options: [
                    { value: '', text: 'Vælg en virksomhedstype' },
                    ...buisnessTypes.map(type => {
                        return {
                            value: type.id,
                            text: type.name,
                        }
                    }),
                ]
            },
        ],
        title: 'Bliv partner',
        description: 'Udfyld formularen nedenfor for at blive partner.',
        submitText: 'Send ansøgning',
    }

    await renderTemplate(
        '../../templates/partials/form.mustache',
        'become-a-partner-form',
        formdata
    ).then(async () => {
        document.querySelector('#become-a-partner-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            let formData = new FormData(e.target);
            let data = Object.fromEntries(formData.entries());
        
            // Format the data into the required structure
            let formattedData = {
                contact_person: {
                    first_name: data.firstname,
                    last_name: data.lastname,
                    phone_number: data.phone,
                    email: data.email,
                },
                business: {
                    name: data['company-name'],
                    address: {
                        street: data['company-address'],
                        city: data['company-address'],
                        postal_code: data['company-address'],
                        country: data['company-address'],
                    },
                },
                delivery_method_id: parseInt(data['delivery-method'], 10),
                business_type_id: parseInt(data['business-type'], 10),
            };
            // Send the formatted data to the API
            await api.post('partner-applications/', formattedData).then((response) => {
                console.log(response);
                if (response.status === 201) {
                    window.location.href = 'pages/thank-you.html';
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

