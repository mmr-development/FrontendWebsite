import { renderTemplate } from "../utils/rendertemplate.js";

export const renderCourierForm = async () => {
    let formdata = {
        action: 'courier-form',
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
        ],
        title: 'Bliv partner',
        description: 'Udfyld formularen nedenfor for at blive partner.',
        submitText: 'Send ansøgning',
    }

    await renderTemplate(
        '../../templates/partials/form.mustache',
        'become-a-courier-form',
        formdata
    );

    
}

