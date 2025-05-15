import { renderTemplate } from "../utils/rendertemplate.js";
import * as api from '../utils/api.js';
// websocket.

const orderConfirm = JSON.parse(localStorage.getItem('orderConfirm')) || {};

console.log("localStorageData", orderConfirm);

const wsUrl = api.wsurl + 'ws/' + orderConfirm.status_url; // Replace with your backend WebSocket URL
const socket = new WebSocket(wsUrl);

socket.onopen = () => {
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'status_update') {
        if( data.status === 'confirmed') {
            console.log("Order confirmed");
        }
    }
};

socket.onclose = () => {
    console.log("WebSocket connection closed");
};