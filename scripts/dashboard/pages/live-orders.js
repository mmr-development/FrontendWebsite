import {renderTemplate} from '../../utils/rendertemplate.js';
import * as api from '../../utils/api.js';

export const renderLiveOrders = async (container, partner_id) => {
    console.log(api.wsurl)
    const ws = new WebSocket(api.wsurl + 'ws/partners/' + partner_id + "/orders/");

    ws.onopen = () => {
        console.log("WebSocket connection established");
    };

    ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        // define case for different message types
        if (data.type === 'orders') {
            // Render the order in the live orders section
            console.log("Rendering live orders:", data.data);
            await renderTemplate('templates/partials/dashboard/content/live-order-list.mustache', container, { orders: data.data });
        } else if (data.type === 'status_update') {
            // Update the status of an existing order
            const orderElement = document.querySelector(`#order-${data.order.id}`);
            if (orderElement) {
                orderElement.querySelector('.status').textContent = data.order.status;
            }
        } else {
            console.warn("Unknown message type:", data.type);
        }
    }
}