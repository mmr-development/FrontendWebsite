import { renderTemplate } from "../utils/rendertemplate.js";

let data = {
    pageTitle: "Dashboard Overview",
    primaryAction: "Add New",
    secondaryAction: "View Reports",
    stats: [
        { icon: "fas fa-users", value: "1,245", label: "Users" },
        { icon: "fas fa-shopping-cart", value: "342", label: "Orders" },
        { icon: "fas fa-dollar-sign", value: "$12,345", label: "Revenue" }
    ],
    largeSectionTitle: "Performance Overview",
    largeSectionContent: "This section provides an overview of your platform's performance metrics.",
    smallSection1Title: "Recent Activity",
    smallSection1Content: "View the latest activity on your platform.",
    smallSection2Title: "Notifications",
    smallSection2Content: "You have 5 new notifications."
}

export const renderDashboardContent = async () => {
    await renderTemplate('../../templates/partials/dashboard/content.mustache', 'dashboard-content', data).then(() => {
        // Add any additional JavaScript functionality here if needed
    });
};

renderDashboardContent();