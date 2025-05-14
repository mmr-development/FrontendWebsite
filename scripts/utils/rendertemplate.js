// Get root path dynamically
const globalpath = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/') + '/';
let rootpath = '';

// Check if the URL contains "pages" and adjust the root path accordingly
if (globalpath.includes('/pages/')) {
    rootpath = '../'; // Go one level up if inside a "pages" subdirectory
} else {
    rootpath = './'; // Default to the current directory
}

// Function to load Mustache templates
async function loadTemplate(templatePath) {
    const response = await fetch(templatePath);
    if (!response.ok) {
        throw new Error(`Failed to load template: ${templatePath}`);
    }
    return await response.text();
}

export { rootpath };

export async function renderTemplate(path, templateId, data = {}) {
    try {
        const template = await loadTemplate(rootpath + path);
        const renderedTemplate = Mustache.render(template, data);
        document.getElementById(templateId).innerHTML = renderedTemplate;
    } catch (error) {
        console.log(path, error);
    }
}