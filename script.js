// Get root path dynamically
const globalpath = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/') + '/';
let rootpath = '';

// Check if the URL contains "pages" and adjust the root path accordingly
if (globalpath.includes('/pages/')) {
    rootpath = '../'; // Go one level up if inside a "pages" subdirectory
} else {
    rootpath = './'; // Default to the current directory
}

console.log('Root path:', rootpath);


const headerData = {
    logoUrl: rootpath + "/",
    logoSrc: rootpath + "/files/images/logo.png",
    logoAlt: "MMR Delivery Logo",
    links: [
      { label: "Home", url: "/" },
      { label: "About", url: "/pages/about.html" },
      { label: "Contact", url: "/pages/contact.html" },
    ],
    languages: [
      { code: "en", name: "English", selected: true },
      { code: "lt", name: "Lithuanian" },
      { code: "de", name: "German" },
    ],
    loginUrl: "/pages/login.html",
  };

const footerData = {
    year: new Date().getFullYear(),
    companyName: "Your Company",
    socials: [
        { platform: "Facebook", url: "https://facebook.com" },
        { platform: "Twitter", url: "https://twitter.com" },
        { platform: "LinkedIn", url: "https://linkedin.com" },
    ],
};

// Function to load Mustache templates
async function loadTemplate(templatePath) {
    const response = await fetch(templatePath);
    return await response.text();
}

async function baseRenderTemplates() {
    const headerTemplate = await loadTemplate(rootpath + 'templates/partials/header.mustache');
    const footerTemplate = await loadTemplate(rootpath + 'templates/partials/footer.mustache');

    document.getElementById('header').innerHTML = Mustache.render(headerTemplate, headerData);
    document.getElementById('footer').innerHTML = Mustache.render(footerTemplate, footerData);
}

baseRenderTemplates();