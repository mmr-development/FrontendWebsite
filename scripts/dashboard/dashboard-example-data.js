import {renderTemplate} from "../utils/renderTemplate.js";

const dashboardExampleData = {
    title: "Restaurant Dashboard",
    actions: [
        { id: "add-restaurant", label: "Add Restaurant", buttonClass: "primary-button" },
        { id: "export-data", label: "Export Data", buttonClass: "secondary-button" }
    ],
    statsCards: [
        { icon: "fas fa-utensils", value: "42", label: "Active Restaurants" },
        { icon: "fas fa-shopping-cart", value: "1,234", label: "Orders This Month" },
        { icon: "fas fa-users", value: "5,678", label: "Active Users" },
        { icon: "fas fa-money-bill-wave", value: "$12,345", label: "Monthly Revenue" }
    ],
    gridItems: [
        {
            title: "Recent Orders",
            sizeClass: "large",
            hasTable: true,
            tableHeaders: ["Order ID", "Restaurant", "Customer", "Amount", "Status", "Date"],
            tableRows: [
                { cells: ["#12345", "Pizza Palace", "John Doe", "$24.99", "Delivered", "Today, 14:30"] },
                { cells: ["#12344", "Burger Bistro", "Jane Smith", "$18.50", "In Progress", "Today, 14:15"] },
                { cells: ["#12343", "Sushi Spot", "Mike Johnson", "$32.75", "Delivered", "Today, 13:45"] },
                { cells: ["#12342", "Taco Time", "Sarah Williams", "$15.25", "Delivered", "Today, 13:20"] },
                { cells: ["#12341", "Pasta Place", "Chris Brown", "$27.50", "Cancelled", "Today, 12:50"] }
            ]
        },
        {
            title: "Revenue Overview",
            sizeClass: "",
            hasChart: true,
            chartId: "revenue-chart",
            hasContent: true,
            content: "Monthly revenue is up 15% compared to last month. Weekend sales show the strongest performance."
        },
        {
            title: "Top Restaurants",
            sizeClass: "",
            hasTable: true,
            tableHeaders: ["Restaurant", "Orders", "Rating"],
            tableRows: [
                { cells: ["Pizza Palace", "523", "4.8"] },
                { cells: ["Burger Bistro", "487", "4.7"] },
                { cells: ["Sushi Spot", "412", "4.9"] },
                { cells: ["Taco Time", "389", "4.6"] }
            ]
        },
        {
            title: "Recent Activity",
            sizeClass: "large",
            hasContent: true,
            content: "System activity log shows normal operations. Last backup completed successfully at 03:00 AM.",
            hasActions: true,
            itemActions: [
                { id: "view-logs", label: "View Full Logs", buttonClass: "secondary-button" }
            ]
        },
        {
            title: "Pending Approvals",
            sizeClass: "",
            hasTable: true,
            tableHeaders: ["Restaurant", "Status", "Action"],
            tableRows: [
                { cells: ["Thai Delight", "Pending", "<button class='mini-button approve'>Approve</button>"] },
                { cells: ["Indian Spice", "Pending", "<button class='mini-button approve'>Approve</button>"] },
                { cells: ["Mediterranean Grill", "Pending", "<button class='mini-button approve'>Approve</button>"] }
            ]
        }
    ]
};

// This function would be used to render the dashboard with the example data
function renderDashboardExample() {
    renderTemplate('../../templates/partials/dashboard/dashboard-content.mustache', 'dashboard-content', dashboardExampleData)
}

renderDashboardExample();

// Export the example data for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { dashboardExampleData, renderDashboardExample };
}
