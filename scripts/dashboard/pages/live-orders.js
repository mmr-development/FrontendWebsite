import {renderTemplate} from '../../utils/rendertemplate.js';
import * as api from '../../utils/api.js';

export const renderLiveOrders = async (container, partner_id, partners = []) => {
    const ws = new WebSocket(api.wsurl + 'ws/partners/' + partner_id + "/orders/");
    ws.onopen = () => {
        console.log("WebSocket connection established");
    };

    let possibleStatus = [
        'pending', 'confirmed', 'preparing', 'ready'
    ];
    let preattyStatus = {
        'pending': 'Afventer bekræftelse',
        'confirmed': 'Bekræftet',
        'preparing': 'Forbereder',
        'ready': 'Klar til afhentning',
    }
    let orders;
    ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'orders') {
            console.log("single order", data.data[0]);
            orders = data.data;
            data.data.sort((a, b) => new Date(a.requested_delivery_time) - new Date(b.requested_delivery_time));
            data.data.forEach(order => {
                order.requested_delivery_time = new Date(order.requested_delivery_time).toLocaleString();
                order.nextStatusKey = possibleStatus[possibleStatus.indexOf(order.status) + 1] || null;
                order.nextStatus = order.nextStatusKey ? preattyStatus[order.nextStatusKey] : null;
            });
            let templateData = {
                orders: data.data,
                select: partners.length > 0,
                options: partners.length > 0 ? partners.map((partner) => ({
                    value: partner.id,
                    name: partner.name + " (id:" + partner.id + ")",
                    selected: partner.id == partner_id ? true : false,
                })) : [],
            };
            renderTemplate('templates/partials/dashboard/content/live-order-list.mustache', container, templateData).then(() => {
                orderActions();
            }).then(() => {
                const select = document.querySelector('#' + container + ' #custom-select');
                if (select) {
                    select.addEventListener('change', (e) => {
                        const selectedValue = e.target.value;
                        localStorage.setItem('selectedPartnerId', selectedValue);
                        renderLiveOrders(container, selectedValue, partners);
                    });
                }
            });
        } else if (data.type === 'order_created') {
            let newOrders = data.data.order.filter(order => {
                return !orders.some(existingOrder => existingOrder.id === order.id);
            });
            newOrders.forEach(order => {
                order.requested_delivery_time = new Date(order.requested_delivery_time).toLocaleString();
                order.nextStatusKey = possibleStatus[possibleStatus.indexOf(order.status) + 1] || null;
                order.nextStatus = order.nextStatusKey ? preattyStatus[order.nextStatusKey] : null;
            });
            renderTemplate('templates/partials/dashboard/content/live-order-list-append.mustache', 'live-order-list', { orders: data.data.order }, true).then(() => {
                orderActions();
            });
        } else if (data.type === 'order_status_updated') {
            let order = document.querySelector(`.order[data-id="${data.data.order.id}"]`);
            if (order) {
                const orderStatusElem = order.querySelector('.order-status');
                let nextStatusKey = possibleStatus[possibleStatus.indexOf(data.data.order.status) + 1] || null;
                if (orderStatusElem) {
                    orderStatusElem.textContent = data.data.order.status;
                    orderStatusElem.setAttribute('data-status', nextStatusKey);
                }
                let nextStatus = nextStatusKey ? preattyStatus[nextStatusKey] : null;
                const acceptButton = order.querySelector('.order-actions button[data-action="accept"]');
                if (acceptButton) {
                    if (nextStatus) {
                        acceptButton.textContent = nextStatus;
                        acceptButton.setAttribute('data-next-status', nextStatusKey);
                    } else {
                        acceptButton.remove();
                    }
                }
            }
        } else if (data.type == 'picked_up') {
            let order = document.querySelector(`.order[data-id="${data.data.order.id}"]`);
            if (order){order.remove()}
        } else {
            console.warn("Unknown message type:", data.type);
        }
    }
}

const orderActions = () => {
    const buttonContainer = document.querySelectorAll('.order-actions');
    if (!buttonContainer) return;
    let rejectButtons = Array.from(document.querySelectorAll('button[data-action="reject"]'));
    let acceptButtons = Array.from(document.querySelectorAll('button[data-action="accept"]'));
    rejectButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const orderId = button.getAttribute('data-order-id');
            const orderItem = button.closest('.order');
            if (orderItem) {
                orderItem.remove();
            } else {
                console.warn("Could not find .order-item to remove");
            }
            try {
                const response = await api.patch(`orders/` + orderId, {
                    status: 'cancelled'
                }, api.includeCredentials);
                if (response.status === 200) {
                } else {
                    console.error("Failed to reject order:", response);
                    if (orderItem) {
                        document.querySelector('#live-orders').appendChild(orderItem);
                    }
                }
            } catch (error) {
                console.error("Error rejecting order:", error);
            }
        });
    });

    acceptButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const orderId = button.getAttribute('data-order-id');
            const orderItem = button.closest('.order');
            let orderStatusSpan = orderItem.querySelector('.order-status');
            let orderStatus = orderStatusSpan ? orderStatusSpan.getAttribute('data-status') : null;
            try {
                const response = await api.patch(`orders/` + orderId, {
                    status: orderStatus
                }, api.includeCredentials);
                if (response.status === 200) {
                } else {
                    console.error("Failed to accept order:", response);
                }
            } catch (error) {
                console.error("Error accepting order:", error);
            }
        });
    });
}