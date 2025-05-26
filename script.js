import { renderTemplate, rootpath } from './scripts/utils/rendertemplate.js';
import * as api from './scripts/utils/api.js';
import * as auth from './scripts/utils/auth.js';
import { renderGet } from './scripts/dashboard/components/get.js';

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
    ...role === null ? {} : { userInfo: true},
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

let renderDivBelow = (elementid) => {
    const targetElement = document.getElementById(elementid);
    if (targetElement) {
        // Check if a .new-div is already directly after the targetElement
        const nextElem = targetElement.nextElementSibling;
        if (nextElem && nextElem.classList.contains('new-div')) {
            nextElem.remove(); // Close if already open
            return null;
        }
        // Remove any other open .new-div
        const existingDiv = document.querySelector('.new-div');
        if (existingDiv) {
            existingDiv.remove();
        }
        // Create and insert new
        const newDiv = document.createElement('div');
        newDiv.className = 'new-div';
        newDiv.innerHTML = '<p>This is a new div below the target element.</p>';
        targetElement.insertAdjacentElement('afterend', newDiv);
        return newDiv;
    }
}

async function baseRenderTemplates() {
    let header = document.getElementById('header');
    let footer = document.getElementById('footer');
    if (header) {
      renderTemplate('templates/partials/header.mustache', header.id, headerData).then(() => {
        let isLoggedin = auth.isLoggedIn();
          if (isLoggedin) {
            const userInfoButton = document.querySelector('.user-info');
            if (userInfoButton) {
              userInfoButton.addEventListener('click', () => {
                renderTemplate('templates/partials/user-info-modal.mustache', 'c-modal', {}).then(() => {
                  const modal = document.getElementById('c-modal');
                  console.log('Modal:', modal);
                  modal.classList.add('active');
                  if (modal) {
                    const submitButton = modal.querySelector('.c-modal__close');
                    console.log('Submit Button:', submitButton);
                    submitButton.addEventListener('click', () => {
                      modal.classList.remove('active');
                    });
                    let buttons = modal.querySelectorAll('.user-info-link');
                    buttons.forEach((button) => {
                      button.addEventListener('click', async (event) => {
                      event.preventDefault();
                      switch (button.id) {
                        case 'user-orders':
                        // get local storage data
                        let orders = localStorage.getItem('userOrders');
                        if (!orders) {
                          orders = await api.get('orders').then((response) => {
                            if (response.status === 200) {
                              return response.data;
                            }
                            return [];
                          });
                          localStorage.setItem('userOrders', JSON.stringify(orders));
                        }

                        if (typeof orders === 'string') orders = JSON.parse(orders);

                        let orderFormated = orders.orders.map((order) => {
                          order.formatedDate = new Date(order.requested_delivery_time).toLocaleDateString();
                          order.formatedTime = new Date(order.requested_delivery_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          order.formatedPrice = order.total_amount.toFixed(2);
                          order.total_items = order.items.reduce((total, item) => total + item.quantity, 0);
                          order.items = order.items.map(item => ({
                            name: item.name,
                            quantity: item.quantity,
                            price: item.price
                          }));
                          return order;
                        });
                        renderDivBelow(button.id).innerHTML = `
                        <div class="orders-list">
                        ${orderFormated.map(order => `
                        <div class="order-item" id="order-${order.id}">
                        <h3>Order #${order.id}</h3>
                        <p>Date: ${order.formatedDate}</p>
                        <p>Time: ${order.formatedTime}</p>
                        <p>Total Items: ${order.total_items}</p>
                        <p>Total Price: $${order.formatedPrice}</p>
                        </div>
                        `).join('')}
                        </div>`;

                        let orderItems = document.querySelectorAll('.order-item');
                        orderItems.forEach((orderItem) => {
                          orderItem.addEventListener('click', () => {
                            if (orderItem.classList.contains('active')) {
                              orderItem.classList.remove('active');
                              return;
                            }
                            orderItems.forEach(item => item.classList.remove('active'));
                            orderItem.classList.add('active');
                          });
                        });
                          
                        break;
                        case 'user-info':
                        let userInfo = localStorage.getItem('userInfo');
                        if (!userInfo) {
                          userInfo = await api.get('auth/user-info').then((response) => {
                            if (response.status === 200) {
                              return response.data;
                            }
                            return {};
                          });
                          localStorage.setItem('userInfo', JSON.stringify(userInfo));
                        }
                        renderDivBelow(button.id).innerHTML = '<p>User Orders List</p>';
                        break;
                        case 'user-settings':
                        // Show user settings
                        renderDivBelow(button.id).innerHTML = '<p>User Settings</p>';
                        break;
                        default:
                        renderDivBelow(button.id).innerHTML = '<p>Unknown action</p>';
                      }
                      });
                    });
                  }
                });
              });
            }
          }

        document.querySelector('.login-button').addEventListener('click', (event) => {
          event.preventDefault();
          if (role === null) {
            window.location.href = '/pages/login.html';
          } else {
            auth.Logout();
          }
        });
      });
    }
    if (footer) {
      renderTemplate('templates/partials/footer.mustache', footer.id, footerData);
    }
}

baseRenderTemplates();

const fontAwesomeLink = document.createElement('link');
fontAwesomeLink.rel = 'stylesheet';
fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
document.head.appendChild(fontAwesomeLink);