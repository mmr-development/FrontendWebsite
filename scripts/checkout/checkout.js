import {renderTemplate} from '../utils/rendertemplate.js';
import { renderModal } from '../utils/modal.js';
import * as api from '../utils/api.js';
import {basketUpdate} from '../restaurant-detail/basket.js';

let userinfo = {};
let partnerID;
let renderContantFrom = async (container) => {
    let userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
    if (userInfo) {
        userinfo = {
            'customer-firstname': userInfo.first_name || '',
            'customer-lastname': userInfo.last_name || '',
            'customer-email': userInfo.email || '',
            'customer-phone': userInfo.phone_number || ''
        };
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
                value: userInfo.first_name || '',
            },
            {
                id: 'customer-lastname',
                type: 'text',
                label: 'Lastname',
                placeholder: 'Enter your lastname',
                required: true,
                name: 'customer-lastname',
                value: userInfo.last_name || '',
            },
            {
                id: 'customer-email',
                type: 'email',
                label: 'Email',
                placeholder: 'Enter your email',
                required: true,
                name: 'customer-email',
                value: userInfo.email || '',
            },
            {
                id: 'customer-phone',
                type: 'text',
                label: 'Phone Number',
                placeholder: 'Enter your phone number',
                required: true,
                name: 'customer-phone',
                value: userInfo.phone_number || '',
            }
        ]
    }

    await renderTemplate(
        '../../templates/partials/form.mustache',
        container,
        formdata
    ).then(() => {
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
}

let renderDetailsForm = async (container, id) => {
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
    let delivery = (JSON.parse(localStorage.getItem('delivery')).restaurant[id].delivery == false) || true;
    if (delivery) {
        contactFormData.deliveryNoteTitle = 'Delivery Note';
        contactFormData.deliveryNote = 'Delivery Note';
        contactFormData.deliveryTipTitle = 'Delivery Tip';
        contactFormData.deliveryTipOptions = [
            { value: '10', text: '10,00 kr.' },
            { value: '20', text: '20,00 kr.' },
            { value: '30', text: '30,00 kr.' },
        ];
    }
    await renderTemplate(
        '../../templates/partials/checkout/deliveryinformation.mustache',
        container,
        contactFormData
    )
}

let renderDeliveryTime = async (container, partnerId, minPrepTime, maxPrepTime) => {
    const deliveryTimeOptions = [
        { value: "asap", text: "As soon as possible" }
    ];
    const openingHours = await api.get('partners/' + partnerId + '/hours/').then(res => res.status === 200 ? res.data : []);

    let today = new Date();
    let todayDayOfWeek = today.getDay();
    let hoursArray = Array.isArray(openingHours.hours) ? openingHours.hours : [];
    let todayHours = hoursArray.find(h => h.day_of_week === todayDayOfWeek);

    if (todayHours) {
        const [openHour, openMinute] = todayHours.opens_at.split(':').map(Number);
        const [closeHour, closeMinute] = todayHours.closes_at.split(':').map(Number);

        let opening = new Date(today);
        opening.setHours(openHour, openMinute, 0, 0);
        let closing = new Date(today);
        closing.setHours(closeHour, closeMinute, 0, 0);
        if (closing <= opening) closing.setDate(closing.getDate() + 1);
        if (Date.now() > closing.getTime()) {
            let tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            let tomorrowDayOfWeek = tomorrow.getDay();
            todayHours = hoursArray.find(h => h.day_of_week === tomorrowDayOfWeek);
            today = tomorrow;
        }
    }

    if (todayHours) {
        const [openHour, openMinute] = todayHours.opens_at.split(':').map(Number);
        const [closeHour, closeMinute] = todayHours.closes_at.split(':').map(Number);
        let opening = new Date(today);
        opening.setHours(openHour, openMinute, 0, 0);
        let closing = new Date(today);
        closing.setHours(closeHour, closeMinute, 0, 0);
        if (closing <= opening) closing.setDate(closing.getDate() + 1);
        let start = new Date(Math.max(opening.getTime(), Date.now()));
        start.setMinutes(start.getMinutes() + minPrepTime);
        start.setMinutes(Math.ceil(start.getMinutes() / 5) * 5, 0, 0);
        let last = new Date(closing);
        last.setMinutes(last.getMinutes() - maxPrepTime);

        while (start <= last) {
            let slotEnd = new Date(start);
            slotEnd.setMinutes(slotEnd.getMinutes() + (maxPrepTime - minPrepTime));
            if (slotEnd > closing) slotEnd = new Date(closing);

            const weekday = start.toLocaleDateString([], { weekday: "long" });
            const weekdayCap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
            const timeStart = start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            const timeEnd = slotEnd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            deliveryTimeOptions.push({
                value: start.toISOString(),
                text: `${weekdayCap} ${timeStart} (${timeStart} - ${timeEnd})`
            });

            start.setMinutes(start.getMinutes() + 5);
        }
    }

    userinfo.deliveryTime = deliveryTimeOptions[1].value;

    document.getElementById(container).addEventListener('click', async () => {
        await renderModal({
            minWidth: '400',
            title: 'Delivery Time',
            content: '<select id="delivery-time-select" style="width:100%;padding:8px 0;margin:10px 0;"></select>',
            close: "Close",
            submit: "Submit",
        });

        const select = document.getElementById('delivery-time-select');
        deliveryTimeOptions.forEach(option => {
            let opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.text;
            select.appendChild(opt);
        });

        select.addEventListener('change', () => {
            let selectedValue = select.value;
            if (selectedValue !== 'asap') {
                let selectedDate = new Date(selectedValue);
                userinfo.deliveryTime = selectedDate;
                const weekday = selectedDate.toLocaleDateString([], { weekday: "long" });
                const weekdayCap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
                const formattedDate = `${weekdayCap} ${selectedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
                document.getElementById('deliverytimeform-final').textContent = formattedDate;
                validateCheckout(userinfo);
            } else {
                document.getElementById('deliverytimeform-final').textContent = 'As soon as possible';
                delete userinfo.deliveryTime;
            }
        });
    });
};

let renderDeliveryNote = async (container) => {
    document.getElementById(container).addEventListener('click', async () => {
        await renderModal({
            minWidth: '400',
            title: 'Delivery Note',
            content: '<textarea id="delivery-note-textarea" rows="4" cols="50" style="width:100%;padding:8px 0;margin:10px 0;"></textarea>',
            close: "Close",
            submit: "Submit",
        });

        const textarea = document.getElementById('delivery-note-textarea');
        textarea.addEventListener('input', () => {
            let note = textarea.value;
            if (note.length > 0) {
                userinfo.deliveryNote = note;
                document.getElementById('deliverynoteform-final').textContent = note;
            } else {
                delete userinfo.deliveryNote;
                document.getElementById('deliverynoteform-final').textContent = '';
            }
            validateCheckout(userinfo);
        });
    });
}

let renderDeliveryTip = async (container) => {
    let containerDiv = document.getElementById(container);
    let tipsLabels = containerDiv.querySelectorAll('.contact-form__input-group label');
    tipsLabels.forEach(label => {
        label.addEventListener('click', (e) => {
            let selectedTip = e.target.getAttribute('data-value');
            if (selectedTip) {
            if (label.classList.contains('selected')) {
                // Deselect if already selected
                label.classList.remove('selected');
                delete userinfo.deliveryTip;
            } else {
                userinfo.deliveryTip = selectedTip;
                tipsLabels.forEach(tipLabel => {
                tipLabel.classList.remove('selected');
                });
                label.classList.add('selected');
            }
            } else {
            delete userinfo.deliveryTip;
            }
            validateCheckout(userinfo);
        });
    })
    containerDiv.querySelector('#customTipOption').addEventListener('click', async () => {
        await renderModal({
            minWidth: '400',
            title: 'Custom Tip',
            content: '<input type="number" id="custom-tip-input" placeholder="Enter custom tip amount" style="width:100%;padding:8px 0;margin:10px 0;">',
            close: "Close",
            submit: "Submit",
            submitCallback: () => {
                const input = document.getElementById('custom-tip-input');
                let tip = input.value;
                let tipValue = parseInt(tip, 10);

                if (!isNaN(tipValue) && tipValue >= 0 && tipValue <= 10000) {
                    userinfo.deliveryTip = tipValue;
                    document.getElementById('deliverytipform-final').textContent = `: ${tipValue},00 kr.`;
                } else {
                    delete userinfo.deliveryTip;
                    document.getElementById('deliverytipform-final').textContent = '';
                    alert('Tip must be between 0 and 10,000.');
                }
                validateCheckout(userinfo);
            }
        });
    });

}

let renderPaymentMethod = async (container) => {
    document.getElementById(container).addEventListener('click', async () => {
        await renderModal({
            minWidth: '400',
            title: 'Payment Method',
            content: '<div id="payment-method-select"></div>',
            close: "Close",
            submit: "Submit",
        });

        await renderTemplate(
            '../../templates/partials/checkout/payment-method.mustache',
            'payment-method-select',
            { paymentOptions: [
                { value: 'credit_card', text: 'Credit Card', logo: '../../files/images/checkout/dankort.png'},
                { value: 'paypal', text: 'PayPal', logo: '../../files/images/checkout/paypal.png'},
                { value: 'mobile_pay', text: 'Mobil Pay', logo: '../../files/images/checkout/mobilpay.png'},
                { value: 'debit_card', text: 'Debit Card', logo: '../../files/images/checkout/debit-card.png'},
            ]}
        ).then(() => {
            const paymentMethods = document.querySelectorAll('.payment-method');
            paymentMethods.forEach(method => {
                method.addEventListener('click', () => {
                    paymentMethods.forEach(m => m.classList.remove('selected'));
                    method.classList.add('selected');
                    let selectedMethod = method.getAttribute('data-value');
                    userinfo.paymentMethod = selectedMethod;
                    document.getElementById('paymentmethod-final').innerHTML = method.querySelector('.payment-method__title').innerHTML;
                    validateCheckout(userinfo);
                });
            });
        });
    });
}

let checkoutLogic = () => {
    // Attach event listener to all current and future .checkout-button1 buttons
    document.body.addEventListener('click', async function (e) {
        const btn = e.target.closest('.checkout-button1');
        if (!btn) return;

        e.preventDefault();

        // Gather cart and delivery info
        let cart = JSON.parse(localStorage.getItem('restaurantCarts')) || {};
        let urlParams = new URLSearchParams(window.location.search);
        let restaurantId = urlParams.get('id');
        let restaurantCart = cart[restaurantId] || [];

        let delivery = JSON.parse(localStorage.getItem('delivery')) || {};
        let restaurantDelivery = delivery.restaurant?.[restaurantId]?.delivery === false;

        let addressData = JSON.parse(sessionStorage.getItem('address'))?.data || {};
        let customerAddress = {
            country: "Denmark",
            country_iso: "DK",
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
                delivery_type: restaurantDelivery ? 'pickup' : 'delivery',
                requested_delivery_time: userinfo.deliveryTime ? new Date(userinfo.deliveryTime).toISOString() : null,
                ...(userinfo.deliveryTip ? { tip_amount: parseInt(userinfo.deliveryTip) } : {}),
                ...(userinfo.deliveryNote ? { note: userinfo.deliveryNote } : {}),
                items: restaurantCart.map(item => ({
                    catalog_item_id: item.id,
                    quantity: item.quantity,
                    ...(item.note ? { note: item.customizations } : {}),
                }))
            },
            paymentMethod: userinfo.paymentMethod || 'credit_card',
            deliveryTip: userinfo.deliveryTip ? parseInt(userinfo.deliveryTip) : 0,
            requested_delivery_time: userinfo.deliveryTime ? new Date(userinfo.deliveryTime).toISOString() : null,
            deliveryNote: userinfo.deliveryNote || false,
            payment: {
                method: userinfo.paymentMethod,
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
                        if (res.status === 201) {
                            localStorage.setItem('orderConfirm', JSON.stringify(res.data));
                            localStorage.removeItem('restaurantCarts');
                            localStorage.removeItem('delivery');
                            localStorage.removeItem('userOrders');
                            window.location.href = '/pages/await-confirmation.html?id=' + restaurantId;
                        }
                    });
                });
            });
        });
    }, false);
}

let validateCheckout = async (options) => {
    let isValid = true;
    // cehck mandetory fields
    if (!options['customer-firstname'] || !options['customer-lastname'] || !options['customer-email'] || !options['customer-phone'] ||!options['paymentMethod'] ) {
        isValid = false;
    }
    
    let deliveryOptions = JSON.parse(localStorage.getItem('delivery')) || {};
    let delivery = deliveryOptions.restaurant[partnerID] || {};

    let basketData = {
        tip: parseInt(options.deliveryTip) || 0,
        valid: isValid,
    }

    await basketUpdate(delivery, basketData).then(() => {
        checkoutLogic()
    });
}

export const renderCheckout = async () => {
    let id = new URLSearchParams(window.location.search).get('id');
    partnerID = id;
    if (!id) {
        console.error("No restaurant ID found in URL.");
        return;
    }
    let partnerDetail = await api.get('partners/' + id).then(res => res.status === 200 ? res.data : null);

    renderContantFrom('checkout-form-userinfo');
    renderDetailsForm('checkout-form-contact', id).then(() => {
        renderDeliveryTime('deliverytimeform', id, partnerDetail.min_preparation_time_minutes || 0, partnerDetail.max_preparation_time_minutes || 0);
        renderDeliveryNote('deliverynoteform');
        renderDeliveryTip('deliverytipform');
        renderPaymentMethod('paymentmethodform');
    });
}

// export const renderCheckout = async () => {
//     let urlParams = new URLSearchParams(window.location.search);
//     let id = urlParams.get('id');
//     let partnerdetail = await api.get('partners/' + id).then((res) => {
//         if (res.status === 200) {
//             return res.data;
//         } else {
//             console.error("Error fetching restaurant detail:", res);
//             return [];
//         }
//     });
//     let opening_hours = await api.get('partners/' + id + '/hours').then((res) => {
//         if (res.status === 200) {
//             return res.data;
//         }
//         else {
//             console.error("Error fetching restaurant opening hours:", res);
//             return [];
//         }
//     });

//     let deliveryTimeOptions = [{ value: "asap", text: "As soon as possible" }];
//     const today = new Date();
//     const todayDayOfWeek = today.getDay();
//     const todayHours = opening_hours.hours.find(h => h.day_of_week === todayDayOfWeek);
//     const minPrep = partnerdetail.min_preparation_time_minutes || 0;
//     const maxPrep = partnerdetail.max_preparation_time_minutes || minPrep;

//     if (todayHours) {
//         const [openHour, openMinute] = todayHours.opens_at.split(':').map(Number);
//         const [closeHour, closeMinute] = todayHours.closes_at.split(':').map(Number);

//         let opening = new Date(today);
//         opening.setHours(openHour, openMinute, 0, 0);

//         let closing = new Date(today);
//         closing.setHours(closeHour, closeMinute, 0, 0);
//         if (closing <= opening) {
//             closing.setDate(closing.getDate() + 1);
//         }
//         let start = new Date(Math.max(opening.getTime(), Date.now()));
//         start.setMinutes(start.getMinutes() + minPrep);
//         let last = new Date(closing);
//         last.setMinutes(last.getMinutes() - maxPrep);
//         start.setMinutes(Math.ceil(start.getMinutes() / 5) * 5, 0, 0);

//         while (start <= last) {
//             let slotEnd = new Date(start);
//             slotEnd.setMinutes(slotEnd.getMinutes() + (maxPrep - minPrep));
//             if (slotEnd > closing) slotEnd = new Date(closing);

//             deliveryTimeOptions.push({
//                 value: start.toISOString(),
//                 text:
//                     start.toLocaleDateString([], { weekday: "long" }).charAt(0).toUpperCase() +
//                     start.toLocaleDateString([], { weekday: "long" }).slice(1) +
//                     " " +
//                     start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
//                     ' (' +
//                     start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
//                     ' - ' +
//                     slotEnd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
//                     ')'
//             });
//             start.setMinutes(start.getMinutes() + 5);
//         }
//     }
//     let userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
//     if (userInfo)
//         userinfo = {
//             'customer-firstname': userInfo.first_name || '',
//             'customer-lastname': userInfo.last_name || '',
//             'customer-email': userInfo.email || '',
//             'customer-phone': userInfo.phone_number || ''
//         };
        

//     let formdata = {
//         title: 'Contact Information',
//         description: 'Please fill out your contact information',
//         width: 'calc(100% - 30px)',
//         margin: '20px 0',
//         max_width: 'none',
//         fields: [
//             {
//                 id: 'customer-firstname',
//                 type: 'text',
//                 label: 'Firstname',
//                 placeholder: 'Enter your name',
//                 required: true,
//                 name: 'customer-firstname',
//                 value: userInfo.first_name || '',
//             },
//             {
//                 id: 'customer-lastname',
//                 type: 'text',
//                 label: 'Lastname',
//                 placeholder: 'Enter your lastname',
//                 required: true,
//                 name: 'customer-lastname',
//                 value: userInfo.last_name || '',
//             },
//             {
//                 id: 'customer-email',
//                 type: 'email',
//                 label: 'Email',
//                 placeholder: 'Enter your email',
//                 required: true,
//                 name: 'customer-email',
//                 value: userInfo.email || '',
//             },
//             {
//                 id: 'customer-phone',
//                 type: 'text',
//                 label: 'Phone Number',
//                 placeholder: 'Enter your phone number',
//                 required: true,
//                 name: 'customer-phone',
//                 value: userInfo.phone_number || '',
//             }
//         ]
//     }
//     await renderTemplate(
//         '../../templates/partials/form.mustache',
//         'checkout-form-userinfo',
//         formdata).then(() => {
//             let inputs = document.querySelectorAll('.form .form-content input');
//             inputs.forEach((input) => {
//                 input.addEventListener('input', () => {
//                     let name = input.getAttribute('name');
//                     let value = input.value;
//                     if (value.length > 0) {
//                         userinfo[name] = value;
//                     } else {
//                         delete userinfo[name];
//                     }
//                     validateCheckout(userinfo);
//                 });
//             });
//         });

//     let contactFormData = {
//         deliveryTime: 'Delivery Time',
//         deliveryTimeTitle: 'Delivery Time',
//         deliveryoption: 'Delivery Option',
//         paymentTitle: 'Payment Method',
//         paymentOptions: [
//             { value: 'credit_card', text: 'Credit Card', logo: '../../files/images/checkout/dankort.png'},
//             { value: 'paypal', text: 'PayPal', logo: '../../files/images/checkout/paypal.png'},
//             { value: 'mobile_pay', text: 'Mobil Pay', logo: '../../files/images/checkout/mobilpay.png'},
//             { value: 'debit_card', text: 'Debit Card', logo: '../../files/images/checkout/debit-card.png'},
//         ],
//     };

//     const deliveryRestaurants = JSON.parse(localStorage.getItem('delivery')) || {};
//     const delivery = deliveryRestaurants.restaurant[id];

//     if (delivery && !delivery.delivery == true) {
//         contactFormData.deliveryNoteTitle= 'Delivery Note';
//         contactFormData.deliveryNote= 'Delivery Note';
//         contactFormData.deliveryTipTitle= 'Delivery Tip';
//         contactFormData.deliveryTipOptions= [
//             { value: '10', text: '10,00 kr.' },
//             { value: '20', text: '20,00 kr.' },
//             { value: '30', text: '30,00 kr.' },
//         ];
//     }

//     let checkoutFormContact = document.getElementById('checkout-form-contact');
//     if (!checkoutFormContact) {
//         return;
//     }

//     await renderTemplate(
//         '../../templates/partials/checkout/deliveryinformation.mustache',
//         'checkout-form-contact',
//         contactFormData
//     ).then(() => {
//         let filledoutoptions = {
//         };

//         document.getElementById('deliverytimeform').addEventListener('click', async (e) => {
//             await renderModal({
//                 minWidth: '400',
//                 title: 'Delivery Time',
//                 content: '<select id="delivery-time-select"></select>',
//                 close: "Close",
//                 submit: "Submit",
//             }).then(() => {
//                 const select = document.getElementById('delivery-time-select');
//                 deliveryTimeOptions.forEach(option => {
//                     let opt = document.createElement('option');
//                     opt.value = option.value;
//                     opt.textContent = option.text;
//                     select.appendChild(opt);
//                 });
//                 select.addEventListener('change', () => {
//                     let selectedValue = select.options[select.selectedIndex].value;
//                     if (selectedValue !== 'asap') {
//                         let selectedDate = new Date(selectedValue);
//                         filledoutoptions.deliveryTime = selectedDate;
//                         let formattedDate = selectedDate.toLocaleDateString([], { weekday: "long" }).charAt(0).toUpperCase() + selectedDate.toLocaleDateString([], { weekday: "long" }).slice(1) + " " + selectedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//                         document.getElementById('deliverytimeform-final').textContent = formattedDate;
//                         validateCheckout(filledoutoptions);
//                     } else {
//                         document.getElementById('deliverytimeform-final').textContent = 'As soon as possible';
//                         delete filledoutoptions.deliveryTime;
//                     }
//                 });
//             });
//         });
//         const deliveryNote = document.getElementById('deliverynoteform');
//         if (deliveryNote) {
//             deliveryNote.addEventListener('click', async (e) => {
//                 await renderModal({
//                     minWidth: '400',
//                     title: 'Delivery Note',
//                     content: '<textarea id="delivery-note-textarea" rows="4" cols="50"></textarea>',
//                     close: "Close",
//                     submit: "Submit",
//                 }).then(() => {
//                     const textarea = document.getElementById('delivery-note-textarea');
//                     textarea.addEventListener('input', () => {
//                         let note = textarea.value;
//                         note.length > 0 ? filledoutoptions.deliveryNote = note : delete filledoutoptions.deliveryNote;
//                         document.getElementById('deliverynoteform-final').textContent = note;
//                         validateCheckout(filledoutoptions);
//                     });
//                 });
//             });
//         }
//         const deliveryTip = document.getElementById('deliverytipform');
//         if (deliveryTip) {
//             deliveryTip.querySelectorAll('.predefinedTips').forEach((tip) => {
//                 tip.addEventListener('click', () => {
//                     let selectedTip = tip.getAttribute('data-value');
//                     filledoutoptions.deliveryTip = selectedTip;
//                     document.getElementById('deliverytipform-final').textContent = ': ' + selectedTip + ',00 kr.';
//                     let basket = document.querySelector('.basket-calculation');
//                     document.querySelectorAll('.predefinedTips').forEach((tipVal) => {
//                         tipVal.classList.remove('selected');
//                         // remove the tip div
//                         let tipDiv = basket.querySelector('.tip');
//                         if (tipDiv) {
//                             tipDiv.remove();
//                         }
//                     });
//                     tip.classList.add('selected');
//                     let tipP = document.createElement('p');
//                     tipP.classList.add('tip');
//                     let tipText = document.createElement('span');
//                     tipText.textContent = 'Tip: ';
//                     let tipValue = document.createElement('span');
//                     tipValue.textContent = selectedTip + '.00 kr.';
//                     tipValue.classList.add('tip-value');
//                     tipP.appendChild(tipText);
//                     tipP.appendChild(tipValue);
//                     basket.appendChild(tipP);
//                     validateCheckout(filledoutoptions);

//                 });
//             });
//         }
//         const customTipOption = document.getElementById('customTipOption');
//         if (customTipOption) {
//             customTipOption.addEventListener('click', async (e) => {
//                 await renderModal({
//                     minWidth: '400',
//                     title: 'Custom Tip',
//                     content: '<input type="number" id="custom-tip-input" placeholder="Enter custom tip amount">',
//                     close: "Close",
//                     submit: "Submit",
//                     submitCallback: () => {
//                         const input = document.getElementById('custom-tip-input');
//                         let tip = input.value;
//                         if (tip.length > 0) {
//                             filledoutoptions.deliveryTip = tip;
//                             document.getElementById('deliverytipform-final').textContent = ': ' + tip + ',00 kr.';
//                             let basket = document.querySelector('.basket-calculation');
//                             let tipDiv = basket.querySelector('.tip');
//                             if (tipDiv) {
//                                 tipDiv.remove();
//                             }
//                             let tipP = document.createElement('p');
//                             tipP.classList.add('tip');
//                             let tipText = document.createElement('span');
//                             tipText.textContent = 'Tip: ';
//                             let tipValue = document.createElement('span');
//                             tipValue.textContent = tip + '.00 kr.';
//                             tipValue.classList.add('tip-value');
//                             tipP.appendChild(tipText);
//                             tipP.appendChild(tipValue);
//                             basket.appendChild(tipP);
//                         } else {
//                             delete filledoutoptions.deliveryTip;
//                         }
//                         validateCheckout(filledoutoptions);
//                     }
//                 });
//             });
//         }
//         document.getElementById('paymentmethodform').addEventListener('click', async (e) => {
//             await renderModal({
//                 minWidth: '400',
//                 title: 'Payment Method',
//                 content: '<div id="payment-method-select"></div>',
//                 close: "Close",
//                 submit: "Submit",
//             }).then(async () => {
//                 await renderTemplate(
//                     '../../templates/partials/checkout/payment-method.mustache',
//                     'payment-method-select',
//                     { paymentOptions: contactFormData.paymentOptions }
//                 ).then(() => {
//                     const paymentMethods = document.querySelectorAll('.payment-method');
//                     paymentMethods.forEach(method => {
//                         method.addEventListener('click', () => {
//                             paymentMethods.forEach(m => m.classList.remove('selected'));
//                             method.classList.add('selected');
//                             let selectedMethod = method.getAttribute('data-value');
//                             filledoutoptions.paymentMethod = selectedMethod;
//                             document.getElementById('paymentmethod-final').innerHTML =method.querySelector('.payment-method__title').innerHTML;
//                             validateCheckout(filledoutoptions);
//                         });
//                     });
//                 });
//             });
//         });
//     });
// }



// let validateCheckout = (options) => {
//     if (!options.paymentMethod || Object.keys(userinfo).length !== 4) {
//         let checkoutButton = document.querySelector('.checkout-button');
//         checkoutButton ?? checkoutButton.remove();
//         return;
//     }
//     let basket = document.getElementsByClassName('basket-total')[0];
//     let existingCheckoutButton = document.querySelector('.checkout-button');
//     if (existingCheckoutButton) existingCheckoutButton.remove();
//     let checkoutButton = document.createElement('button');
//     checkoutButton.classList.add('checkout-button', 'active');
//     checkoutButton.textContent = 'Checkout';
//     checkoutButton.addEventListener('click', async () => {
//         let cart = JSON.parse(localStorage.getItem('restaurantCarts'));
//         let urlParams = new URLSearchParams(window.location.search);
//         let restaurantId = urlParams.get('id');
//         let restaurantCart = cart[restaurantId];
    
//         let delivery = JSON.parse(localStorage.getItem('delivery'));
//         let restaurantDelivery = delivery.restaurant[restaurantId].delivery == false;
    
//         let addressData = JSON.parse(sessionStorage.getItem('address'))?.data || {};
//         let customerAddress = {
//             country: "Denmark", // Default country
//             country_iso: "DK", // Default ISO code
//             city: addressData.postnrnavn || "",
//             street: addressData.vejnavn || "",
//             postal_code: addressData.postnr || "",
//             address_detail: `${addressData.husnr || ""} ${addressData.etage || ""} ${addressData.dør || ""}`.trim(),
//             latitude: addressData.latitude || null,
//             longitude: addressData.longitude || null
//         };
//         let order = {
//             customer: {
//                 first_name: userinfo['customer-firstname'],
//                 last_name: userinfo['customer-lastname'],
//                 email: userinfo['customer-email'],
//                 phone_number: userinfo['customer-phone'],
//                 address: customerAddress
//             },
//             order: {
//                 partner_id: parseInt(restaurantId),
//                 delivery_type: restaurantDelivery ? 'delivery' : 'pickup',
//                 requested_delivery_time: options.deliveryTime ? options.deliveryTime : new Date().toISOString(),
//                 ...(options.deliveryTip ? { tip_amount: parseInt(options.deliveryTip)} : {}),
//                 ...(options.deliveryNote ? { note: options.deliveryNote } : {}),
//                 items: restaurantCart.map(item => ({
//                     catalog_item_id: item.id,
//                     quantity: item.quantity,
//                     ...(item.note ? { note: item.customizations } : {}),
//                 }))
//             },
//             payment: {
//                 method: options.paymentMethod,
//             }
//         };
    
//         localStorage.setItem('order', JSON.stringify(order));

//         renderModal({
//             minWidth: '400',
//             title: 'Order Confirmation',
//             content: '<div id="order-confirmation"></div>',
//             close: "Close",
//             submit: "Confirm",
//         }).then(() => {
//             renderTemplate(
//                 '../../templates/partials/checkout/order-confirmation.mustache',
//                 'order-confirmation',
//                 order
//             ).then(() => {
//                 document.querySelector('.c-modal__submit').addEventListener('click', async () => {
//                     await api.post('orders', order, api.includeCredentials).then((res) => {
//                         if(res.status === 201) {
//                             localStorage.setItem('orderConfirm', JSON.stringify(res.data));	
//                             localStorage.removeItem('restaurantCarts');
//                             localStorage.removeItem('delivery');
//                             localStorage.removeItem('restaurantCarts');
//                             localStorage.removeItem('userOrders');
//                             window.location.href = '/pages/await-confirmation.html?id=' + restaurantId;
                        
//                         }
//                     });
//                 });
//             });
//         });
//     });
//     basket.appendChild(checkoutButton);
// }

