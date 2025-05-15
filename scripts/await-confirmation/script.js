import { renderTemplate } from "../utils/rendertemplate.js";
import * as api from '../utils/api.js';
// websocket.

const localStorageData = JSON.parse(localStorage.getItem('order')) || {};

// Convert the object into an array of its values
const order = Object.values(localStorageData).map(item => {
    return {
        id: item.id ?? 0,
        name: item.name ?? 'Unknown',
        quantity: item.quantity ?? 0,
        price: item.price ?? 0,
        totalPrice: item.totalPrice ?? 0,
        image: item.image,
    };
});

const data = {
    order: order,
    totalPrice: Object.values(localStorageData).reduce((acc, item) => acc + (item.totalPrice ?? 0), 0),
    deliveryTime: '30-40 mins',
    pickupTime: '15-25 mins',
};

const wsUrl = api.wsurl + 'ws/test'; // Replace with your backend WebSocket URL
console.log("WebSocket URL:", wsUrl);
const socket = new WebSocket(wsUrl);

socket.onopen = () => {
    console.log("WebSocket connection established");

};

socket.onmessage = (event) => {
 
};

socket.onerror = (error) => {
    console.error("WebSocket error:", error);
};

socket.onclose = () => {
    console.log("WebSocket connection closed");
};