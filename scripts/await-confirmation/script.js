import { renderTemplate } from "../utils/rendertemplate.js";
import * as api from '../utils/api.js';
// websocket.

const orderConfirm = JSON.parse(localStorage.getItem('orderConfirm')) || {};
console.log("Order confirmation data:", orderConfirm);

const wsUrl = api.wsurl + 'ws/orders/' + orderConfirm.order_id + "/status"; // Replace with your backend WebSocket URL
const socket = new WebSocket(wsUrl);

// remove from localstorage
localStorage.removeItem('order');
localStorage.removeItem('delivery');
localStorage.removeItem('restaunrantCarts');

socket.onopen = () => {
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.status === 'confirmed') {
        let animatedDiv = document.createElement('div');
        animatedDiv.className = "order-confirmed-barber";
        animatedDiv.innerHTML = `<span>Order Confirmed!</span>`;

        // 3. append the animated div to the DOM
        document.querySelector('.await-confirmation').appendChild(animatedDiv);

        // 4. Trigger the slide-in animation
        setTimeout(() => {
            animatedDiv.classList.add('slide-in');
        }, 50);
        
    }
};

socket.onclose = () => {
    console.log("WebSocket connection closed");
};