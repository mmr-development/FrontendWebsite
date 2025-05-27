import {renderTemplate} from '../../utils/rendertemplate.js';
import * as api from '../../utils/api.js';

export const renderLiveOrders = async (container, partner_id) => {
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
        // define case for different message types
        if (data.type === 'orders') {
            // sort orders by requested_delivery_time
            console.log("single order", data.data[0]);
            orders = data.data;
            data.data.sort((a, b) => new Date(a.requested_delivery_time) - new Date(b.requested_delivery_time));
            data.data.forEach(order => {
                order.requested_delivery_time = new Date(order.requested_delivery_time).toLocaleString();
                // get the next status in the preattyStatus array
                order.nextStatusKey = possibleStatus[possibleStatus.indexOf(order.status) + 1] || null;
                order.nextStatus = order.nextStatusKey ? preattyStatus[order.nextStatusKey] : null;
            });
            renderTemplate('templates/partials/dashboard/content/live-order-list.mustache', container, { orders: data.data }).then(() => {
                orderActions(container, partner_id);
            })
        } else if (data.type === 'order_created') {
            let newOrders = data.data.order.filter(order => {
                return !orders.some(existingOrder => existingOrder.id === order.id);
            });
            newOrders.forEach(order => {
                order.requested_delivery_time = new Date(order.requested_delivery_time).toLocaleString();
                order.nextStatusKey = possibleStatus[possibleStatus.indexOf(order.status) + 1] || null;
                order.nextStatus = order.nextStatusKey ? preattyStatus[order.nextStatusKey] : null;
            });

            renderTemplate('templates/partials/dashboard/content/live-order-list.mustache', container, { orders: data.data.order }, true).then(() => {
                orderActions(container, partner_id);
            });
        } else if (data.type === 'order_status_updated') {
            let order = document.querySelector(`.order[data-id="${data.data.order.id}"]`);
            console.log(order);
            console.log("Order status updated:", data.data);

            if (order) {
                const orderStatusElem = order.querySelector('.order-status');
                let nextStatusKey = possibleStatus[possibleStatus.indexOf(data.data.order.status) + 1] || null;
                if (orderStatusElem) {
                    orderStatusElem.textContent = data.data.order.status;
                    orderStatusElem.setAttribute('data-status', nextStatusKey);
                }
                // update the next status
                let nextStatus = nextStatusKey ? preattyStatus[nextStatusKey] : null;
                const acceptButton = order.querySelector('.order-actions button[data-action="accept"]');
                if (acceptButton) {
                    acceptButton.textContent = nextStatus;
                }
            }
        } else {
            console.warn("Unknown message type:", data.type);
        }
    }
}

const orderActions = (container, partner_id) => {
    const buttonContainer = document.querySelectorAll('.order-actions');
    if (!buttonContainer) return;
    let rejectButtons = Array.from(document.querySelectorAll('button[data-action="reject"]'));
    let acceptButtons = Array.from(document.querySelectorAll('button[data-action="accept"]'));
    rejectButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            console.log("Reject button clicked");
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
                    console.log("Order rejected successfully");
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
            console.log("Accept button clicked");
            e.preventDefault();
            const orderId = button.getAttribute('data-order-id');
            const orderItem = button.closest('.order');
            let orderStatusSpan = orderItem.querySelector('.order-status');
            let orderStatus = orderStatusSpan ? orderStatusSpan.getAttribute('data-status') : null;
            console.log("Order status:", orderStatus);
            try {
                const response = await api.patch(`orders/` + orderId, {
                    status: orderStatus
                }, api.includeCredentials);
                if (response.status === 200) {
                //renderLiveOrders(container, partner_id);
                } else {
                    console.error("Failed to accept order:", response);
                }
            } catch (error) {
                console.error("Error accepting order:", error);
            }
        });
    });
}