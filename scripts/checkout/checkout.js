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

    if (delivery && delivery.delivery === true) {
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
    if (options.deliveryTime && options.paymentMethod) {
        let basket = document.getElementsByClassName('basket-total')[0];
        // add checkout button to basket
        let checkoutButton = document.createElement('button');
        checkoutButton.classList.add('checkout-button', 'active');
        checkoutButton.textContent = 'Checkout';
        checkoutButton.addEventListener('click', () => {
            // get from local storage
            let cart = JSON.parse(localStorage.getItem('restaurantCarts'))
            // id from url;
            let urlParams = new URLSearchParams(window.location.search);
            let restaurantId = urlParams.get('id');
            let restaurantCart = cart[restaurantId];

            let delivery = localStorage.getItem('delivery');
            let restaurantDelivery = delivery[restaurantId];
            let order = {
                restaurantId: restaurantId,
                items: restaurantCart,
                paymentMethod: options.paymentMethod,
                deliveryTime: options.deliveryTime
            };

            if (restaurantDelivery === true) {
                order.deliveryNote = options.deliveryNote ?? '';
                order.deliveryTip = options.deliveryTip ?? 0;
                order.delivery = true;
            }
            
            // save order to local storage
            localStorage.setItem('order', JSON.stringify(order));
            // create modal for order confirmation
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
                    // on confirm button click, redirect to order page
                    document.querySelector('.c-modal__submit').addEventListener('click', () => {
                        window.location.href = '/pages/await-confirmation.html?id=' + restaurantId;
                    });
                });
            });
        });
        basket.appendChild(checkoutButton);
    } else {
        let checkoutButton = document.querySelector('.checkout-button');
        if (checkoutButton) {
            checkoutButton.remove();
        }
    }
}

