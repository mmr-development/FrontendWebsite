import { renderTemplate, rootpath } from './scripts/utils/rendertemplate.js';

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

async function baseRenderTemplates() {
    renderTemplate('templates/partials/header.mustache', 'header', headerData);
    renderTemplate('templates/partials/footer.mustache', 'footer', footerData)
}

baseRenderTemplates();

const fontAwesomeLink = document.createElement('link');
fontAwesomeLink.rel = 'stylesheet';
fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
document.head.appendChild(fontAwesomeLink);