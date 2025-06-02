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
    companyName: "MMR Delivery",
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
    await renderTemplate('templates/partials/header.mustache', header.id, headerData);

    let isLoggedin = auth.isLoggedIn();
    if (isLoggedin) {
      const userInfoButtons = document.querySelectorAll('.user-info');
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

      let userInfo = localStorage.getItem('userInfo');
      if (!userInfo) {
        userInfo = await api.get('users/profile/').then((response) => {
          if (response.status === 200) {
            return response.data;
          }
          return {};
        });
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
      }

      if (userInfoButtons) {
        userInfoButtons.forEach(userInfoButton => {
          userInfoButton.addEventListener('click', async () => {
          await renderTemplate('templates/partials/user-info-modal.mustache', 'c-modal', {});
          const modal = document.getElementById('c-modal');
          if (!modal) return;
          modal.classList.add('active');

          const submitButton = modal.querySelector('.c-modal__close');
          if (submitButton) {
            submitButton.addEventListener('click', () => {
              modal.classList.remove('active');
            });
          }

          let buttons = modal.querySelectorAll('.user-info-link');
          buttons.forEach((button) => {
            button.addEventListener('click', async (event) => {
              event.preventDefault();
              switch (button.id) {
                case 'user-orders': {
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

                  let div = renderDivBelow(button.id);
                  if (div) {
                    div.innerHTML = `
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
                  }

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
                }
                case 'user-info': {
                  if (typeof userInfo === 'string') userInfo = JSON.parse(userInfo);
                  let div = renderDivBelow(button.id);
                    // Disable the user info form by adding the 'disabled' attribute to all inputs and disabling the submit button
                    
                    if (Array.isArray(userInfo.address)) {
                      userInfo.address = userInfo.address
                        .map(address => `${address.street} ${address.address_detail}, ${address.postal_code} ${address.city}`)
                        .join('; ');
                    } else if (userInfo.address && typeof userInfo.address === 'object') {
                      userInfo.address = `${userInfo.address.street || ''} ${userInfo.address.address_detail || ''}, ${userInfo.address.postal_code || ''} ${userInfo.address.city || ''}`;
                    } else if (typeof userInfo.address === 'string') {
                      // Already a string, do nothing
                    }
                    div.innerHTML =
                      `<form class="user-info-edit-form">
                        <div>
                          <label for="first_name"><strong>First Name:</strong></label>
                          <input type="text" id="first_name" name="first_name" value="${userInfo.first_name || ''}" required >
                          <label for="last_name"><strong>Last Name:</strong></label>
                          <input type="text" id="last_name" name="last_name" value="${userInfo.last_name || ''}" required>
                        </div>
                        <div>
                          <label for="email"><strong>Email:</strong></label>
                          <input type="email" id="email" name="email" value="${userInfo.email || ''}" required disabled>
                        </div>
                        <div>
                          <label for="phone_number"><strong>Phone:</strong></label>
                          <input type="tel" id="phone_number" name="phone_number" value="${userInfo.phone_number || ''}" >
                        </div>
                        <div>
                          <label for="address"><strong>Address:</strong></label>
                          <input type="text" id="address" name="address" value="${userInfo.address || ''}" >
                          <div id="dawa-autocomplete-container"></div>
                        </div>
                        <button type="submit">Save</button>
                      </form>`;

                  let form = div.querySelector('.user-info-edit-form');
                  if (form) {
                    // add dawa autocomplete to the address input
                    let addressInput = form.querySelector('#address');
                    let customerAddress;
                    let selectedAddress;
                    if (window.dawaAutocomplete) {
                        window.dawaAutocomplete.dawaAutocomplete(addressInput, {
                          container: form.querySelector('#dawa-autocomplete-container'),
                          maxResults: 5,
                          select: function(selected) {
                            addressInput.value = selected.tekst;
                            if (submitButton) submitButton.style.display = "block";
                            const addressData = {
                              ...selected.data,
                              latitude: selected.data.x || null,
                              longitude: selected.data.y || null
                            };
                            customerAddress = {
                              country: "Denmark", // Default country
                              country_iso: "DK", // Default ISO code
                              city: addressData.postnrnavn || "",
                              street: addressData.vejnavn || "",
                              postal_code: addressData.postnr || "",
                              address_detail: `${addressData.husnr || ""} ${addressData.etage || ""} ${addressData.dør || ""}`.trim(),
                              latitude: addressData.latitude,
                              longitude: addressData.longitude
                            };
                            selected.data.longitude = addressData.longitude;
                            selected.data.latitude = addressData.latitude;
                            selectedAddress = selected;
                          }
                        });
                    }
                    form.addEventListener('submit', async (e) => {
                      e.preventDefault();
                      let formData = new FormData(form);
                      let data = {
                        first_name: formData.get('first_name'),
                        last_name: formData.get('last_name'),
                        email: form.querySelector('#email').value,
                        phone_number: formData.get('phone_number'),
                        address: customerAddress
                      };
                      let response = await api.patch('users/profile/', data);
                      if (response.status === 200) {
                        localStorage.setItem('userInfo', JSON.stringify(data));
                        sessionStorage.setItem('address', JSON.stringify(selectedAddress));
                        userInfo = data;
                      }
                    });
                  }
                  break;
                }
                case 'user-settings': {
                  let div = renderDivBelow(button.id);
                  if (div) div.innerHTML = '<p>User Settings</p>';
                  break;
                }
                default: {
                  let div = renderDivBelow(button.id);
                  if (div) div.innerHTML = '<p>Unknown action</p>';
                }
              }
              
            });
          });
        });
        });
      }
    }

    const loginButton = document.querySelectorAll('.login-button');
    if (loginButton) {
      loginButton.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault(); // Prevent default action
        if (role === null) {
        window.location.href = '/pages/login.html';
        } else {
        await auth.Logout();
        window.location.reload();
        }
      });
      });
    }

    const menuToggle = document.querySelector('.menu-toggle');
    const menuOverlay = document.getElementById('menu-overlay');
    if (menuToggle && menuOverlay) {
      menuToggle.addEventListener('click', () => {
        menuOverlay.classList.toggle('active');
      });

      menuOverlay.addEventListener('click', (e) => {
        if (e.target === menuOverlay) menuOverlay.classList.remove('active');
      });
    }
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