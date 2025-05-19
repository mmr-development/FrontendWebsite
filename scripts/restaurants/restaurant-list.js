import { renderTemplate } from '../utils/rendertemplate.js';
import * as api from '../utils/api.js'

const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);
let city = params.get('city');
if (city) {
    sessionStorage.setItem('city', city);
} else {
    city = sessionStorage.getItem('city');
}

let restaurants = await api.get('partners/?city=' + city).then((res) => {
    if (res.status === 200) {
        return res.data;
    } else {
        console.error("Error fetching restaurants:", res);
        return [];
    }
}).catch((error) => {
    console.error("Error fetching restaurants:", error);
    return [];
});
params.delete('city');
const newUrl = url.origin + url.pathname + '?' + params.toString();
window.history.replaceState({}, document.title, newUrl);

console.log(restaurants.partners);
const formattedData = {
    restaurant_lists: [
        {
            restaurant_list_name: "All Restaurants",
            "restaurants": restaurants.partners.map(partner => ({
                id: partner.id.toString(),
                name: partner.name,
                banner: partner.banner_url ? api.baseurl + 'public' + partner.banner_url : "../../files/images/restaurants/placeholder.png",
                logo: partner.logo_url ? api.baseurl + 'public' + partner.logo_url : "../../files/images/restaurants/placeholder.png",
                rating: "4.0", // Default rating (can be updated dynamically)
                top_picks: "N/A", // Placeholder for top picks
                estimated_delivery_time: 'N/A', // Placeholder for estimated delivery time
                delivery_fee: partner.delivery.fee ? partner.delivery.fee + 'dkk' : "N/A",
                minimum_order: partner.delivery.minimum_order_value ? partner.delivery.minimum_order_value + 'dkk' : "N/A",
                address: `${partner.address.street}, ${partner.address.city}, ${partner.address.postal_code}, ${partner.address.country}`
            }))
        }
    ]
};
console.log(formattedData);

const data = {
    "restaurnat-lists": [
        {
            "restaunrat-list-name": "Popular Restaurants",
            "restaurants": [
                {
                    "id": "1",
                    "name": "Pizza Palace",
                    "image": "../../files/images/restaurants/placeholder.png",
                    "rating": "4.5",
                    "top-picks": "Pepperoni Pizza, Margherita",
                    "estimated-delivery-time": "30-40 mins",
                    "delivery-fee": "$3.99",
                    "minimum-order": "$15.00"
                },
                {
                    "id": "2",
                    "name": "Sushi World",
                    "image": "../../files/images/restaurants/placeholder.png",
                    "rating": "4.8",
                    "top-picks": "California Roll, Dragon Roll",
                    "estimated-delivery-time": "20-30 mins",
                    "delivery-fee": "$2.99",
                    "minimum-order": "$20.00"
                }
            ]
        },
    ]
};

await renderTemplate('../templates/partials/restaurant-list.mustache', 'restaurants-list', formattedData);

const restaurantList = document.querySelectorAll('.restaurants-item');

if (restaurantList.length !== 0) {
    restaurantList.forEach((item) => {
        item.addEventListener('click', () => {
            const restaurantId = item.getAttribute('data-id');
            window.location.href = `restaurant-detail.html?id=${restaurantId}`;
        });
    });
}