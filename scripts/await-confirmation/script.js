import { renderTemplate } from "../utils/rendertemplate.js";
import * as api from '../utils/api.js';

const orderConfirm = JSON.parse(localStorage.getItem('orderConfirm')) || {};

const wsUrl = api.wsurl + 'ws/orders/' + orderConfirm.order_id + "/status"; 
const socket = new WebSocket(wsUrl);

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
        document.querySelector('.await-confirmation').appendChild(animatedDiv);
        setTimeout(() => {
            animatedDiv.classList.add('slide-in');
        }, 50);
    }
};

socket.onclose = () => {
};