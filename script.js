import { renderTemplate, rootpath } from './scripts/utils/rendertemplate.js';
import * as api from './scripts/utils/api.js';

// get session storage data role
const role = sessionStorage.getItem('role') || null;

const headerData = {
    logoUrl: rootpath + "",
    logoSrc: rootpath + "/files/images/logo.png",
    logoAlt: "MMR Delivery Logo",
    links: [
      { label: "Become a Partner", url: "/pages/become-a-partner.html" },
      { label: "Become a Courier ", url: "/pages/become-a-courier.html" },
    ],
    languages: [
      { code: "en", name: "English", selected: true },
      { code: "lt", name: "Lithuanian" },
      { code: "de", name: "German" },
    ],
    authUrl: role === null ? "/pages/login.html" : '',
    authText: (role === null ? "Login" : "Logout"),
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
    renderTemplate('templates/partials/header.mustache', 'header', headerData).then(() => {
      document.querySelector('.login-button').addEventListener('click', (event) => {
        // prevent default action
        event.preventDefault();
        if (role === null) {
          window.location.href = '/pages/login.html';
        } else {
          api.post('auth/sign-out', {}, api.includeCredentials).then((res) => {
            if (res.status === 200) {
              sessionStorage.removeItem('role');
              localStorage.removeItem('delivery');
              localStorage.removeItem('restaurantCarts');
              localStorage.removeItem('order');
              window.location.href = '/index.html';
            } else {
              console.error('Error logging out:', res);
            }
          });
        }
      });
    });
    renderTemplate('templates/partials/footer.mustache', 'footer', footerData)
}

baseRenderTemplates();

const fontAwesomeLink = document.createElement('link');
fontAwesomeLink.rel = 'stylesheet';
fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
document.head.appendChild(fontAwesomeLink);