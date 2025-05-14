import { renderTemplate } from "../../utils/rendertemplate.js";
import * as api from '../../utils/api.js';

export const renderOrders = async (container, offset = 0, partnerid = 0) => {
    // Treat null partnerid as 0 (show all partners)
    const showPartnerId = partnerid === 0 || partnerid === null;

    const apiData = await api.get('orders/?limit=5&offset=' + offset + (partnerid && partnerid !== 0 ? '&partner_id=' + partnerid : '')).then((res) => {
        if (res.status === 200) {
            return res.data;
        }
        return [];
    });

    if (!apiData.orders || apiData.orders.length === 0) {
        return;
    }
    // Format rows
    const rows = apiData.orders.map(order => {
        const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const cells = [
            order.customer?.email || 'N/A',
            order.delivery_type || 'N/A',
            order.status || 'N/A',
            order.note || 'N/A',
            totalItems,
            totalPrice,
            order.payment?.method || 'N/A',
            `
            <div class="action-buttons">
                <button class="btn btn-secondary" onclick="expandOrder('${order.id}')">Expand</button>
                <button class="btn btn-danger" onclick="deleteOrder('${order.id}')">Delete</button>
            </div>
            `
        ];
        if (showPartnerId) {
            cells.unshift(order.partner_id || 'N/A');
        }
        return {
            id: order.id,
            cells: cells
        };
    });

    const columns = [
        "Customer Email",
        "Delivery Type",
        "Status",
        "Note",
        "Total Items",
        "Total Price",
        "Payment Methods",
        "Actions",
    ];
    if (showPartnerId) {
        columns.unshift('Partner_ID');
    }

    const totalPages = Math.ceil(apiData.pagination.total / apiData.pagination.limit);

    const templateData = {
        columns: columns,
        rows: rows,
        totalPages: totalPages,
        currentPage: Math.floor(apiData.pagination.offset / apiData.pagination.limit) + 1,
        paginationid: container + '-pagination',
    };

    await renderTemplate('../../templates/partials/dashboard/content/get.mustache', container, templateData).then(() => {
        // Pagination
        const pagination = document.getElementById(container + '-pagination');
        if (pagination) {
            pagination.innerHTML = '';
            for (let i = 1; i <= totalPages; i++) {
                const pageLink = document.createElement('a');
                pageLink.href = `#${container}-${i}`;
                pageLink.textContent = i;
                pageLink.classList.add('page-link');
                pageLink.addEventListener('click', async (e) => {
                    e.preventDefault();
                    await renderOrders(container, (i - 1) * apiData.pagination.limit, partnerid);
                });
                pagination.appendChild(pageLink);
            }
        }

        // Expand order details
        window.expandOrder = (id) => {
            const existing = document.querySelector('#order-details');
            if (existing) {
                if (existing.previousElementSibling?.id == id) {
                    existing.remove();
                    return;
                }
                existing.remove();
            }
            const order = apiData.orders.find(o => o.id == id);
            const detailsDiv = document.createElement('div');
            detailsDiv.id = 'order-details';
            detailsDiv.className = 'order-details-expand';
            detailsDiv.innerHTML = `
                <div>
                    <strong>Customer:</strong> ${order.customer.first_name} ${order.customer.last_name}<br>
                    <strong>Email:</strong> ${order.customer.email}<br>
                    <strong>Phone:</strong> ${order.customer.phone_number}<br>
                    <strong>Address:</strong> ${order.customer.address.street}, ${order.customer.address.city}, ${order.customer.address.country}, ${order.customer.address.postal_code}<br>
                    <strong>Requested Delivery Time:</strong> ${order.requested_delivery_time}<br>
                    <strong>Items:</strong>
                    <ul>
                        ${order.items.map(item => `<li>Item ID: ${item.catalog_item_id}, Qty: ${item.quantity}, Price: ${item.price}, Note: ${item.note}</li>`).join('')}
                    </ul>
                </div>
            `;
            const row = document.querySelector(`#${CSS.escape(String(id))}`);
            if (row) {
                row.insertAdjacentElement('afterend', detailsDiv);
            }
        };
    });
};