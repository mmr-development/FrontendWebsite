import {renderTemplate} from '../utils/rendertemplate.js';
import { renderModal } from '../utils/modal.js';
import * as api from '../utils/api.js';

let userinfo = {};

export const renderCheckout = async () => {
    let urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    let partnerdetail = await api.get('partners/' + id).then((res) => {
        if (res.status === 200) {
            return res.data;
        } else {
            console.error("Error fetching restaurant detail:", res);
            return [];
        }
    });
    let opening_hours = await api.get('partners/' + id + '/hours').then((res) => {
        if (res.status === 200) {
            return res.data;
        }
        else {
            console.error("Error fetching restaurant opening hours:", res);
            return [];
        }
    });

    let deliveryTimeOptions = [{ value: "asap", text: "As soon as possible" }];
    const today = new Date();
    const todayDayOfWeek = today.getDay();
    const todayHours = opening_hours.hours.find(h => h.day_of_week === todayDayOfWeek);
    const minPrep = partnerdetail.min_preparation_time_minutes || 0;
    const maxPrep = partnerdetail.max_preparation_time_minutes || minPrep;

    if (todayHours) {
        const [openHour, openMinute] = todayHours.opens_at.split(':').map(Number);
        const [closeHour, closeMinute] = todayHours.closes_at.split(':').map(Number);

        let opening = new Date(today);
        opening.setHours(openHour, openMinute, 0, 0);

        let closing = new Date(today);
        closing.setHours(closeHour, closeMinute, 0, 0);
        if (closing <= opening) {
            closing.setDate(closing.getDate() + 1);
        }
        let start = new Date(Math.max(opening.getTime(), Date.now()));
        start.setMinutes(start.getMinutes() + minPrep);
        let last = new Date(closing);
        last.setMinutes(last.getMinutes() - maxPrep);
        start.setMinutes(Math.ceil(start.getMinutes() / 5) * 5, 0, 0);

        while (start <= last) {
            let slotEnd = new Date(start);
            slotEnd.setMinutes(slotEnd.getMinutes() + (maxPrep - minPrep));
            if (slotEnd > closing) slotEnd = new Date(closing);

            deliveryTimeOptions.push({
                value: start.toISOString(),
                text:
                    start.toLocaleDateString([], { weekday: "long" }).charAt(0).toUpperCase() +
                    start.toLocaleDateString([], { weekday: "long" }).slice(1) +
                    " " +
                    start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
                    ' (' +
                    start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
                    ' - ' +
                    slotEnd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
                    ')'
            });
            start.setMinutes(start.getMinutes() + 5);
        }
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
            { value: 'credit_card', text: 'Credit Card', logo: '../../files/images/checkout/dankort.png'},
            { value: 'paypal', text: 'PayPal', logo: '../../files/images/checkout/paypal.png'},
            { value: 'mobile_pay', text: 'Mobil Pay', logo: '../../files/images/checkout/mobilpay.png'},
            { value: 'debit_card', text: 'Debit Card', logo: '../../files/images/checkout/debit-card.png'},
        ],
    };

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
                    let basket = document.querySelector('.basket-calculation');
                    document.querySelectorAll('.predefinedTips').forEach((tipVal) => {
                        tipVal.classList.remove('selected');
                        // remove the tip div
                        let tipDiv = basket.querySelector('.tip');
                        if (tipDiv) {
                            tipDiv.remove();
                        }
                    });
                    tip.classList.add('selected');
                    let tipP = document.createElement('p');
                    tipP.classList.add('tip');
                    let tipText = document.createElement('span');
                    tipText.textContent = 'Tip: ';
                    let tipValue = document.createElement('span');
                    tipValue.textContent = selectedTip + '.00 kr.';
                    tipValue.classList.add('tip-value');
                    tipP.appendChild(tipText);
                    tipP.appendChild(tipValue);
                    basket.appendChild(tipP);
                    validateCheckout(filledoutoptions);
                    console.log(filledoutoptions);

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
                    submitCallback: () => {
                        const input = document.getElementById('custom-tip-input');
                        let tip = input.value;
                        if (tip.length > 0) {
                            filledoutoptions.deliveryTip = tip;
                            document.getElementById('deliverytipform-final').textContent = ': ' + tip + ',00 kr.';
                            let basket = document.querySelector('.basket-calculation');
                            let tipDiv = basket.querySelector('.tip');
                            if (tipDiv) {
                                tipDiv.remove();
                            }
                            let tipP = document.createElement('p');
                            tipP.classList.add('tip');
                            let tipText = document.createElement('span');
                            tipText.textContent = 'Tip: ';
                            let tipValue = document.createElement('span');
                            tipValue.textContent = tip + '.00 kr.';
                            tipValue.classList.add('tip-value');
                            tipP.appendChild(tipText);
                            tipP.appendChild(tipValue);
                            basket.appendChild(tipP);
                        } else {
                            delete filledoutoptions.deliveryTip;
                        }
                        validateCheckout(filledoutoptions);
                    }
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
    if (existingCheckoutButton) existingCheckoutButton.remove();
    let checkoutButton = document.createElement('button');
    checkoutButton.classList.add('checkout-button', 'active');
    checkoutButton.textContent = 'Checkout';
    checkoutButton.addEventListener('click', async () => {
        let cart = JSON.parse(localStorage.getItem('restaurantCarts'));
        let urlParams = new URLSearchParams(window.location.search);
        let restaurantId = urlParams.get('id');
        let restaurantCart = cart[restaurantId];
    
        let delivery = JSON.parse(localStorage.getItem('delivery'));
        let restaurantDelivery = delivery.restaurant[restaurantId].delivery == false;
    
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
                delivery_type: restaurantDelivery ? 'delivery' : 'pickup',
                requested_delivery_time: options.deliveryTime,
                ...(options.deliveryTip ? { tip_amount: parseInt(options.deliveryTip)} : {}),
                ...(options.deliveryNote ? { note: options.deliveryNote } : {}),
                items: restaurantCart.map(item => ({
                    catalog_item_id: item.id,
                    quantity: item.quantity,
                    ...(item.note ? { note: item.customizations } : {}),
                }))
            },
            payment: {
                method: options.paymentMethod,
            }
        };
    
        localStorage.setItem('order', JSON.stringify(order));

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
                            localStorage.setItem('orderConfirm', JSON.stringify(res.data));	
                            window.location.href = '/pages/await-confirmation.html?id=' + restaurantId;
                        }
                    });
                });
            });
        });
    });
    basket.appendChild(checkoutButton);
}

