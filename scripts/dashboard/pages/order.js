import { renderTemplate } from "../../utils/rendertemplate.js";
import * as api from '../../utils/api.js';

const orderCache = new Map();

export const renderOrders = async (container, offset = 0, partnerid = 0) => {
    const cacheKey = `${offset}_${partnerid}`;
    let apiData = orderCache.get(cacheKey);

    if (!apiData) {
        apiData = await api.get('orders/?limit=5&offset=' + offset + (partnerid && partnerid !== 0 ? '&partner_id=' + partnerid : '')).then((res) => {
            if (res.status === 200) return res.data;
            return [];
        });
        orderCache.set(cacheKey, apiData);
    }

    if (!apiData.orders || apiData.orders.length === 0) return;

    const showPartnerId = partnerid === 0 || partnerid === null;
    const columns = [
        ...(showPartnerId ? ['Partner_ID'] : []),
        "Customer Email", "Delivery Type", "Status", "Note",
        "Total Items", "Total Price", "Payment Methods", "Actions"
    ];

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
            <div class="action-buttons" data-order-id="${order.id}">
                <button class="btn btn-secondary expand-btn">Expand</button>
                <button class="btn btn-danger delete-btn">Delete</button>
            </div>
            `
        ];
        if (showPartnerId) cells.unshift(order.partner_id || 'N/A');
        return { id: order.id, cells };
    });

    const totalPages = Math.ceil(apiData.pagination.total / apiData.pagination.limit);
    const templateData = {
        columns,
        rows,
        totalPages,
        currentPage: Math.floor(apiData.pagination.offset / apiData.pagination.limit) + 1,
        paginationid: container + '-pagination',
    };

    await renderTemplate('../../templates/partials/dashboard/content/get.mustache', container, templateData);

    // Fast pagination rendering
    const pagination = document.getElementById(container + '-pagination');
    if (pagination) {
        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            html += `<a href="#${container}-${i}" class="page-link" data-page="${i}">${i}</a>`;
        }
        pagination.innerHTML = html;
        pagination.onclick = async (e) => {
            if (e.target.classList.contains('page-link')) {
                e.preventDefault();
                const page = Number(e.target.dataset.page);
                await renderOrders(container, (page - 1) * apiData.pagination.limit, partnerid);
            }
        };
    }

    // Event delegation for expand/delete
    document.getElementById(container).onclick = (e) => {
        const btn = e.target.closest('.expand-btn, .delete-btn');
        if (!btn) return;
        const orderId = btn.closest('.action-buttons').dataset.orderId;
        if (btn.classList.contains('expand-btn')) {
            const existing = document.querySelector('#order-details');
            if (existing) {
                if (existing.previousElementSibling?.id == orderId) {
                    existing.remove();
                    return;
                }
                existing.remove();
            }
            const order = apiData.orders.find(o => o.id == orderId);
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
            const row = document.querySelector(`#${CSS.escape(String(orderId))}`);
            if (row) row.insertAdjacentElement('afterend', detailsDiv);
        }
        // Add delete logic here if needed
    };
};
