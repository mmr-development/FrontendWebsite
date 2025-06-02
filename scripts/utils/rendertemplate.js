const globalpath = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/') + '/';
let rootpath = '';

if (globalpath.includes('/pages/')) {
    rootpath = '../'; 
} else {
    rootpath = './';
}

async function loadTemplate(templatePath) {
    const response = await fetch(templatePath);
    if (!response.ok) {
        throw new Error(`Failed to load template: ${templatePath}`);
    }
    return await response.text();
}

export { rootpath };

export async function renderTemplate(path, templateId, data = {}, append = false) {
    try {
        const template = await loadTemplate(rootpath + path);
        const renderedTemplate = Mustache.render(template, data);
        const targetElement = document.getElementById(templateId);
        if (targetElement) {
            if (append) {
                targetElement.insertAdjacentHTML('beforeend', renderedTemplate);
            } else {
                targetElement.innerHTML = renderedTemplate;
            }
        } else {
            console.error(`Element with ID "${templateId}" not found.`);
        }
    } catch (error) {
        console.error(path, error);
    }
}