import {renderTemplate} from '../utils/rendertemplate.js';
import { renderModal } from '../utils/modal.js';
import * as api from '../utils/api.js';

let userinfo = {};

export const renderCheckout = async () => {
    let ropening = new Date().setHours(10, 0, 0, 0);
    let rclosing = new Date().setHours(22, 0, 0, 0);

    let deliveryTimeOptions = [{ value: "asap", text: "As soon as possible",}];
    let deliveryTime = new Date(ropening);
    while (deliveryTime < rclosing) {
        deliveryTimeOptions.push({
            value: deliveryTime.toISOString(),
            text: deliveryTime.toLocaleDateString([], { weekday: "long" }).charAt(0).toUpperCase() + deliveryTime.toLocaleDateString([], { weekday: "long" }).slice(1) + " " + deliveryTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
        deliveryTime.setMinutes(deliveryTime.getMinutes() + 5);
    }

    let formdata = {
        title: 'Contact Information',
        description: 'Please fill out your contact information',
        width: 'calc(100% - 30px)',
        margin: '20px 0',
        max_width: 'none',
        fields: [
            {
                id: 'customer-firstname',
                type: 'text',
                label: 'Firstname',
                placeholder: 'Enter your name',
                required: true,
                name: 'customer-firstname',
            },
            {
                id: 'customer-lastname',
                type: 'text',
                label: 'Lastname',
                placeholder: 'Enter your lastname',
                required: true,
                name: 'customer-lastname',

            },
            {
                id: 'customer-email',
                type: 'email',
                label: 'Email',
                placeholder: 'Enter your email',
                required: true,
                name: 'customer-email',
            },
            {
                id: 'customer-phone',
                type: 'text',
                label: 'Phone Number',
                placeholder: 'Enter your phone number',
                required: true,
                name: 'customer-phone',
            }
        ]
    }
    await renderTemplate(
        '../../templates/partials/form.mustache',
        'checkout-form-userinfo',
        formdata).then(() => {
            let inputs = document.querySelectorAll('.form .form-content input');
            inputs.forEach((input) => {
                input.addEventListener('input', () => {
                    let name = input.getAttribute('name');
                    let value = input.value;
                    if (value.length > 0) {
                        userinfo[name] = value;
                    } else {
                        delete userinfo[name];
                    }
                    validateCheckout(userinfo);
                });
            });
        });

    let contactFormData = {
        deliveryTime: 'Delivery Time',
        deliveryTimeTitle: 'Delivery Time',
        deliveryoption: 'Delivery Option',
        paymentTitle: 'Payment Method',
        paymentOptions: [
            { value: 'creditcard', text: 'Credit Card', logo: '../../files/images/checkout/dankort.png'},
            { value: 'paypal', text: 'PayPal', logo: '../../files/images/checkout/paypal.png'},
            { value: 'mobilpay', text: 'Mobil Pay', logo: '../../files/images/checkout/mobilpay.png'},
        ],
    };

    // get id from url
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    // get data from local storage
    const deliveryRestaurants = JSON.parse(localStorage.getItem('delivery')) || {};
    const delivery = deliveryRestaurants.restaurant[id];

    if (delivery && !delivery.delivery == true) {
        contactFormData.deliveryNoteTitle= 'Delivery Note';
        contactFormData.deliveryNote= 'Delivery Note';
        contactFormData.deliveryTipTitle= 'Delivery Tip';
        contactFormData.deliveryTipOptions= [
            { value: '10', text: '10,00 kr.' },
            { value: '20', text: '20,00 kr.' },
            { value: '30', text: '30,00 kr.' },
        ];
    }

    let checkoutFormContact = document.getElementById('checkout-form-contact');
    if (!checkoutFormContact) {
        return;
    }

    await renderTemplate(
        '../../templates/partials/checkout/deliveryinformation.mustache',
        'checkout-form-contact',
        contactFormData
    ).then(() => {
        let filledoutoptions = {
        };

        document.getElementById('deliverytimeform').addEventListener('click', async (e) => {
            await renderModal({
                minWidth: '400',
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
                        filledoutoptions.deliveryTime = selectedDate;
                        let formattedDate = selectedDate.toLocaleDateString([], { weekday: "long" }).charAt(0).toUpperCase() + selectedDate.toLocaleDateString([], { weekday: "long" }).slice(1) + " " + selectedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                        document.getElementById('deliverytimeform-final').textContent = formattedDate;
                        validateCheckout(filledoutoptions);
                    } else {
                        document.getElementById('deliverytimeform-final').textContent = 'As soon as possible';
                        delete filledoutoptions.deliveryTime;
                    }
                });
            });
        });
        const deliveryNote = document.getElementById('deliverynoteform');
        if (deliveryNote) {
            deliveryNote.addEventListener('click', async (e) => {
                await renderModal({
                    minWidth: '400',
                    title: 'Delivery Note',
                    content: '<textarea id="delivery-note-textarea" rows="4" cols="50"></textarea>',
                    close: "Close",
                    submit: "Submit",
                }).then(() => {
                    const textarea = document.getElementById('delivery-note-textarea');
                    textarea.addEventListener('input', () => {
                        let note = textarea.value;
                        note.length > 0 ? filledoutoptions.deliveryNote = note : delete filledoutoptions.deliveryNote;
                        document.getElementById('deliverynoteform-final').textContent = note;
                        validateCheckout(filledoutoptions);
                    });
                });
            });
        }
        const deliveryTip = document.getElementById('deliverytipform');
        if (deliveryTip) {
            deliveryTip.querySelectorAll('.predefinedTips').forEach((tip) => {
                tip.addEventListener('click', () => {
                    let selectedTip = tip.getAttribute('data-value');
                    filledoutoptions.deliveryTip = selectedTip;
                    document.getElementById('deliverytipform-final').textContent = ': ' + selectedTip + ',00 kr.';
                    document.querySelectorAll('.predefinedTips').forEach((tip) => {
                        tip.classList.remove('selected');
                    });
                    tip.classList.add('selected');
                    validateCheckout(filledoutoptions); // Validate after updating the tip
                });
            });
        }
        const customTipOption = document.getElementById('customTipOption');
        if (customTipOption) {
            customTipOption.addEventListener('click', async (e) => {
                await renderModal({
                    minWidth: '400',
                    title: 'Custom Tip',
                    content: '<input type="number" id="custom-tip-input" placeholder="Enter custom tip amount">',
                    close: "Close",
                    submit: "Submit",
                }).then(() => {
                    const input = document.getElementById('custom-tip-input');
                    input.addEventListener('input', () => {
                        let tip = input.value;
                        if (tip.length > 0) {
                            filledoutoptions.deliveryTip = tip;
                            document.querySelectorAll('.predefinedTips').forEach((tip) => {
                                tip.classList.remove('selected');
                            });
                        } else {
                            delete filledoutoptions.deliveryTip;
                        }
                        document.getElementById('deliverytipform-final').textContent = ': ' + tip + ',00 kr.';
                        validateCheckout(filledoutoptions);
                    });
                });
            });
        }
        document.getElementById('paymentmethodform').addEventListener('click', async (e) => {
            await renderModal({
                minWidth: '400',
                title: 'Payment Method',
                content: '<div id="payment-method-select"></div>',
                close: "Close",
                submit: "Submit",
            }).then(async () => {
                await renderTemplate(
                    '../../templates/partials/checkout/payment-method.mustache',
                    'payment-method-select',
                    { paymentOptions: contactFormData.paymentOptions }
                ).then(() => {
                    const paymentMethods = document.querySelectorAll('.payment-method');
                    paymentMethods.forEach(method => {
                        method.addEventListener('click', () => {
                            paymentMethods.forEach(m => m.classList.remove('selected'));
                            method.classList.add('selected');
                            let selectedMethod = method.getAttribute('data-value');
                            filledoutoptions.paymentMethod = selectedMethod;
                            document.getElementById('paymentmethod-final').innerHTML =method.querySelector('.payment-method__title').innerHTML;
                            validateCheckout(filledoutoptions);
                        });
                    });
                });
            });
        });
    });
}



let validateCheckout = (options) => {
    if (!options.deliveryTime || !options.paymentMethod || Object.keys(userinfo).length !== 4) {
        let checkoutButton = document.querySelector('.checkout-button');
        checkoutButton ?? checkoutButton.remove();
        return;
    }
    let basket = document.getElementsByClassName('basket-total')[0];
    let existingCheckoutButton = document.querySelector('.checkout-button');
    existingCheckoutButton ?? existingCheckoutButton.remove();
    let checkoutButton = document.createElement('button');
    checkoutButton.classList.add('checkout-button', 'active');
    checkoutButton.textContent = 'Checkout';
    checkoutButton.addEventListener('click', async () => {
        let cart = JSON.parse(localStorage.getItem('restaurantCarts'));
        let urlParams = new URLSearchParams(window.location.search);
        let restaurantId = urlParams.get('id');
        let restaurantCart = cart[restaurantId];
    
        let delivery = JSON.parse(localStorage.getItem('delivery'));
        let restaurantDelivery = delivery[restaurantId];
    
        let addressData = JSON.parse(sessionStorage.getItem('address'))?.data || {};
        let customerAddress = {
            country: "Denmark", // Default country
            country_iso: "DK", // Default ISO code
            city: addressData.postnrnavn || "",
            street: addressData.vejnavn || "",
            postal_code: addressData.postnr || "",
            address_detail: `${addressData.husnr || ""} ${addressData.etage || ""} ${addressData.dør || ""}`.trim(),
            latitude: addressData.latitude || null,
            longitude: addressData.longitude || null
        };
        let order = {
            customer: {
                first_name: userinfo['customer-firstname'],
                last_name: userinfo['customer-lastname'],
                email: userinfo['customer-email'],
                phone_number: userinfo['customer-phone'],
                address: customerAddress
            },
            order: {
                partner_id: parseInt(restaurantId),
                delivery_type: restaurantDelivery === true ? "delivery" : "pickup",
                items: restaurantCart.map(item => ({
                    catalog_item_id: item.id,
                    quantity: item.quantity
                }))
            }
        };
    
        localStorage.setItem('order', JSON.stringify(order));
        console.log(order)
    
        renderModal({
            minWidth: '400',
            title: 'Order Confirmation',
            content: '<div id="order-confirmation"></div>',
            close: "Close",
            submit: "Confirm",
        }).then(() => {
            renderTemplate(
                '../../templates/partials/checkout/order-confirmation.mustache',
                'order-confirmation',
                order
            ).then(() => {
                document.querySelector('.c-modal__submit').addEventListener('click', async () => {
                    await api.post('orders', order, api.includeCredentials).then((res) => {
                        if(res.status === 201) {
                            window.location.href = '/pages/await-confirmation.html?id=' + restaurantId;
                        }
                    });
                });
            });
        });
    });
    basket.appendChild(checkoutButton);
}

