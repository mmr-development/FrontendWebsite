import {renderTemplate} from '../../utils/rendertemplate.js';
import * as api from '../../utils/api.js';

export const renderLiveOrders = async (container, partner_id) => {
    console.log(api.wsurl)
    const ws = new WebSocket(api.wsurl + 'ws/partners/' + partner_id + "/orders/");

    ws.onopen = () => {
        console.log("WebSocket connection established");
    };

    console.log(container);

    let possibleStatus = [
        'pending', 'confirmed', 'preparing', 'ready'
    ];
    let preattyStatus = {
        'pending': 'Afventer bekræftelse',
        'confirmed': 'Bekræftet',
        'preparing': 'Forbereder',
        'ready': 'Klar til afhentning',
    }

    ws.onmessage = async (event) => {
        console.log("WebSocket message received:", event.data);
        const data = JSON.parse(event.data);
        console.log("Parsed data:", data);
        // define case for different message types
        if (data.type === 'orders') {
            console.log("Received live orders:", data);
            data.data.forEach(order => {
                order.requested_delivery_time = new Date(order.requested_delivery_time).toLocaleString();
                // get the next status in the preattyStatus array
                const nextStatusKey = possibleStatus[possibleStatus.indexOf(order.status) + 1] || null;
                order.nextStatus = nextStatusKey ? preattyStatus[nextStatusKey] : null;
            });
            renderTemplate('templates/partials/dashboard/content/live-order-list.mustache', container, { orders: data.data }).then(() => {
                orderActions();
            })
        } else if (data.type === 'order_created') {
            console.log("New order created:", data);
        
            data.order.requested_delivery_time = new Date(data.order.requested_delivery_time).toLocaleString();
            const nextStatusKey = possibleStatus[possibleStatus.indexOf(data.order.status) + 1] || null;
            data.order.nextStatus = nextStatusKey ? preattyStatus[nextStatusKey] : null;

            renderTemplate('templates/partials/dashboard/content/live-order-item.mustache', container, { orders: data.order }, append = true).then(() => {
                orderActions();
            });
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
    console.log("Accept buttons:", acceptButtons);
    console.log("Reject buttons:", rejectButtons);

    rejectButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            console.log("Reject button clicked");
            e.preventDefault();
            const orderId = button.getAttribute('data-order-id');
            try {
                const response = await api.patch(`orders/` + orderId, {
                    status: 'cancelled'
                }, api.includeCredentials);
                if (response.status === 200) {
                    console.log("Order rejected successfully");
                    button.closest('.order-item').remove();
                } else {
                    console.error("Failed to reject order:", response);
                }
            } catch (error) {
                console.error("Error rejecting order:", error);
            }
        });
    });
}