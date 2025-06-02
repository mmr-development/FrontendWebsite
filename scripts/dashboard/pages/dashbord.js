import * as api from '../../utils/api.js';
import { renderTemplate } from '../../utils/rendertemplate.js';

export const renderDashboard = async (container, partnerid = 0, partners = []) => {
    // Helper to fetch stats for a partner or all
    const fetchStats = async (pid) => {
        let url = 'orders/statistics';
        if (pid && pid !== 0) url += `?partnerId=${pid}`;
        const res = await api.get(url);
        return res.status === 200 ? res.data : {};
    };

    // Render partner select if partners provided
    let partnerSelectHtml = '';
    if (partners.length > 0) {
        partnerSelectHtml = `
        <div class="dashboard-partner-select">
            <label for="partner-select">Partner:</label>
            <select id="partner-select">
                ${partners.map(p => `<option value="${p.id}" ${p.id == partnerid ? 'selected' : ''}>${p.name}</option>`).join('')}
            </select>
        </div>
        `;
    }

    let dashbordContainer = document.getElementById(container);
    dashbordContainer.innerHTML = `
        <div class="dashboard-loading">Loading dashboard...</div>
        ${partnerSelectHtml}
    `;

    // Fetch data
    let data = await fetchStats(partnerid);

    // If no data, show message
    if (!data || Object.keys(data).length === 0) {
        condashbordContainertainer.innerHTML = `
            ${partnerSelectHtml}
            <div class="dashboard-empty">No statistics available.</div>
        `;
        return;
    }

    // Format date helper
    const fmt = d => new Date(d).toLocaleDateString();

    // Build stats cards
    const statsHtml = `
        <div class="dashboard-stats">
            <div class="stat-card">
                <div class="stat-label">Total Orders</div>
                <div class="stat-value">${data.totalOrders ?? 0}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Total Revenue</div>
                <div class="stat-value">${data.totalRevenue ?? 0} kr</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Total Tips</div>
                <div class="stat-value">${data.totalTips ?? 0} kr</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Revenue (excl. tips)</div>
                <div class="stat-value">${data.totalWithoutTips ?? 0} kr</div>
            </div>
        </div>
    `;

    // Build per day tables
    const perDayTable = (arr, label, valueKey) => `
        <div class="dashboard-table">
            <div class="table-title">${label} per Day</div>
            <table>
                <thead>
                    <tr><th>Date</th><th>${label}</th></tr>
                </thead>
                <tbody>
                    ${arr && arr.length ? arr.map(row => `
                        <tr>
                            <td>${fmt(row.date)}</td>
                            <td>${row[valueKey]}</td>
                        </tr>
                    `).join('') : `<tr><td colspan="2">No data</td></tr>`}
                </tbody>
            </table>
        </div>
    `;

    dashbordContainer.innerHTML = `
        ${partnerSelectHtml}
        ${statsHtml}
        <div class="dashboard-tables">
            ${perDayTable(data.ordersPerDay, 'Orders', 'orders')}
            ${perDayTable(data.revenuePerDay, 'Revenue', 'revenue')}
            ${perDayTable(data.tipsPerDay, 'Tips', 'tips')}
        </div>
    `;

    // Partner select event
    if (partners.length > 0) {
        dashbordContainer.querySelector('#partner-select').addEventListener('change', e => {
            renderDashboard(container, Number(e.target.value), partners);
        });
    }
};