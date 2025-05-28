import * as L from 'https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js';
import * as api from '../utils/api.js';

let partnerDetails;
let partnerMarker;

let loadMap = (latitude, longitude) => {
    let courierLat = latitude;
    let courierLng = longitude;
    let radiusMeters = 50;

    if (!map) {
        map = L.map('map').setView([courierLat, courierLng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
    } else {
        map.setView([courierLat, courierLng]);
    }

    if (circle) {
        map.removeLayer(circle);
    }

    circle = L.circle([courierLat, courierLng], {
        color: '#007bff',
        fillColor: '#007bff33',
        fillOpacity: 0.3,
        radius: radiusMeters
    }).addTo(map).bindPopup('Order Location');

    if (partnerMarker) {
        map.removeLayer(partnerMarker);
    }
    let partner = partnerDetails;
    if (partner && partner.latitude && partner.longitude && partner.logo) {
        let icon = L.icon({
            iconUrl: partner.logo,
            iconSize: [80, 80],
            iconAnchor: [40, 40],
            popupAnchor: [0, -40],
            className: 'partner-logo-marker'
        });
        partnerMarker = L.marker([partner.latitude, partner.longitude], { icon }).addTo(map)
            .bindPopup('Partner Location');
    }

    map.fitBounds(circle.getBounds(), { maxZoom: 15 });
}


let token = new URLSearchParams(window.location.search).get('token');
if (token) {
    history.replaceState({}, document.title, window.location.pathname);
    sessionStorage.setItem('orderTrackingToken', token);
} else {
    token = sessionStorage.getItem('orderTrackingToken');
    !token ? document.getElementById('order-tracking-container').innerHTML = `<p class="error">No token found for order tracking</p>` : null;
}
  
let map, circle;

let tempData= {
    "type": "location_update",
    "payload": {
        "delivery_id": 35,
        "order_id": 372,
        "latitude": 55.35252,
        "longitude": 10.38423,
        "status": "assigned",
        "timestamp": "2025-05-28T10:31:40.417Z"
    },
    "timestamp": "2025-05-28T10:31:40.417Z"
}

loadMap(tempData.payload.latitude, tempData.payload.longitude);

if (token) {
    let wsurl = api.wsurl + 'ws/tracking?token=' + token;


    const ws = new WebSocket(wsurl);
    ws.onopen = () => {
    
    };
    ws.onmessage = async (event) => {
        const data = JSON.parse(event.data); 
        if (data.type === 'location_update') {
            loadMap(data.payload.latitude, data.payload.longitude);
        } else if (data.type === 'connection_confirmed') {
            partnerDetails = data.payload.partner;
            partnerDetails.logo = api.baseurl + 'public/' + partnerDetails.logo;
            loadMap(data.payload.partner.latitude, data.payload.partner.longitude);
        }else if (data.type === 'error') {
            console.error(data.message);
            document.getElementById('order-tracking-container').innerHTML = `<p class="error">${data.message}</p>`;
        }
    };
}