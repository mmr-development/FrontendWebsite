import {renderTemplate} from '../../utils/template.js';
import * as api from '../../utils/api.js';

export const rednerLiveOrders = async (container, partner_id) => {
    const liveOrders = await api.get('partners/' + partner_id + '/live-orders').then((res) => {
        if (res.status === 200) {
            return res.data;
        }
        return [];
    });

    // Create templateData
    const templateData = {
        data: {
            columns: columns.map(column => column.replace(/_/g, ' ').toUpperCase()), // Format column names
            rows: rows,
        },
        totalItems: liveOrders.pagination.total,
        itemsPerPage: liveOrders.pagination.limit,
        paginationContainer: container + '-pagination',
        search: true,
        select: false,
        pagination: true,
        pageCallback: (selectedValue) => {

        }
    };

    await renderTemplate('../../templates/partials/dashboard/pages/live-orders.mustache', container, templateData).then(() => {
        // connect to ws
        const ws = new WebSocket(api.wsurl + 'partners/' + partner_id + '/live-orders');
        ws.onopen = () => {
            // Optionally, send a message to request initial orders
            // ws.send(JSON.stringify({ type: 'get-initial-orders' }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'order') {
                renderTemplate('../../templates/partials/dashboard/components/live-orders-list.mustache', 'order-list', data, true).then(() => {
                    const buttons = document.querySelectorAll('.order-action');
                    buttons.forEach(button => {
                        button.onclick = async (e) => {
                            e.preventDefault();
                            const orderId = button.getAttribute('data-order-id');
                            const action = button.getAttribute('data-action');
                            await api.post('orders/' + orderId + '/' + action).then((res) => {
                                if (res.status === 200) {
                                    console.log('Order ' + action + 'ed successfully');
                                } else {
                                    console.error('Error ' + action + 'ing order');
                                }
                            });
                        };
                    });
                });
            }
        };
    });
}