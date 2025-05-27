import * as L from 'https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js';
import * as api from '../utils/api.js';

// get token from url
let token = new URLSearchParams(window.location.search).get('token');
//remove token from url
if (token) {
    history.replaceState({}, document.title, window.location.pathname);
    sessionStorage.setItem('orderTrackingToken', token);
} else {
    token = sessionStorage.getItem('orderTrackingToken');
    if (!token) {
        document.getElementById('order-tracking-container').innerHTML = `<p class="error">No token found for order tracking</p>`;
    }
}
  
let map, circle;

if (token) {
    let wsurl = api.wsurl + 'track-order/verify?token=' + token;

    const ws = new WebSocket(wsurl);
    ws.onopen = () => {
        console.log("WebSocket connection established for order tracking");
    };

    ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'order') {
            let courierLat = data.data.latitude;
            let courierLng = data.data.longitude;
            let radiusMeters = 100;

            if (!map) {
                map = L.map('map').setView([courierLat, courierLng], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors'
                }).addTo(map);
            } else {
                map.setView([courierLat, courierLng], 13);
                if (circle) {
                    map.removeLayer(circle);
                }
            }

            circle = L.circle([courierLat, courierLng], {
                color: '#007bff',
                fillColor: '#007bff33',
                fillOpacity: 0.3,
                radius: radiusMeters
            }).addTo(map).bindPopup('Order Location').openPopup();
        } else if (data.type === 'error') {
            console.error(data.message);
            document.getElementById('order-tracking-container').innerHTML = `<p class="error">${data.message}</p>`;
        }
    };
}