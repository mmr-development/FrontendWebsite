import {renderTemplate} from '../utils/rendertemplate.js';
import { renderModal } from '../utils/modal.js';

export const renderCheckout = async () => {
    let ropening = new Date().setHours(10, 0, 0, 0);
    let rclosing = new Date().setHours(22, 0, 0, 0);

    let deliveryTimeOptions = [
        {
            value: "asap",
            text: "As soon as possible",
        },
    ];
    let deliveryTime = new Date(ropening);
    while (deliveryTime < rclosing) {
        deliveryTimeOptions.push({
            value: deliveryTime.toISOString(),
            text: deliveryTime.toLocaleDateString([], { weekday: "long" }).charAt(0).toUpperCase() + deliveryTime.toLocaleDateString([], { weekday: "long" }).slice(1) + " " + deliveryTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
        deliveryTime.setMinutes(deliveryTime.getMinutes() + 5);
    }

    let contactFormData = {
        title: 'Contact Information',
        street: 'Street Name',
        postalcode: 'Postal Code',
        city: 'City Name',
        contactoption: 'Contact Option',
        floor: 'Floor Number',
        aptname: 'Apartment Option',
        companyname: 'Company Name',
        personalDataText: 'Personal Data',
        fullname: 'Full Name',
        phonenumber: 'Phone Number',
        deliveryTime: 'Delivery Time',
        deliveryoption: 'Delivery Option',
    }

    await renderTemplate(
        '../../templates/partials/checkout/deliveryinformation.mustache',
        'checkout-form-contact',
        contactFormData
    ).then(() => {

        document.getElementById('deliverytimeform').addEventListener('click', async (e) => {
            console.log('Delivery time form clicked');
            await renderModal({
                title: 'Delivery Time',
                content: '<select id="delivery-time-select"></select>',
                close: "Close",
                submit: "Submit",
            }).then(() => {
                const select = document.getElementById('delivery-time-select');
                deliveryTimeOptions.forEach(option => {
                    let opt = document.createElement('option');
                    opt.value = option.value;
                    opt.textContent = option.text;
                    select.appendChild(opt);
                });
                select.addEventListener('change', () => {
                    let selectedValue = select.options[select.selectedIndex].value;
                    if (selectedValue !== 'asap') {
                        let selectedDate = new Date(selectedValue);
                        let formattedDate = selectedDate.toLocaleDateString([], { weekday: "long" }).charAt(0).toUpperCase() + selectedDate.toLocaleDateString([], { weekday: "long" }).slice(1) + " " + selectedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                        document.getElementById('deliverytimeform').textContent = formattedDate;
                    } else {
                        document.getElementById('deliverytimeform').textContent = 'As soon as possible';
                    }
                });
            });
        });
    });
}

