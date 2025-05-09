import { renderTemplate } from '../utils/rendertemplate.js';
import * as api from '../utils/api.js'

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
        {
            "restaunrat-list-name": "New Arrivals",
            "restaurants": [
                {
                    "id": "3",
                    "name": "Burger Haven",
                    "image": "../../files/images/restaurants/placeholder.png",
                    "rating": "4.3",
                    "top-picks": "Cheeseburger, Bacon Burger",
                    "estimated-delivery-time": "25-35 mins",
                    "delivery-fee": "$4.50",
                    "minimum-order": "$10.00"
                },
                {
                    "id": "4",
                    "name": "Taco Fiesta",
                    "image": "../../files/images/restaurants/placeholder.png",
                    "rating": "4.6",
                    "top-picks": "Beef Tacos, Chicken Quesadilla",
                    "estimated-delivery-time": "15-25 mins",
                    "delivery-fee": "$3.00",
                    "minimum-order": "$12.00"
                }
            ]
        }
    ]
};
// get city from url
const urlparams = new URLSearchParams(window.location.search);
const city = urlparams.get('city') || null;

api.get('partners/?' + new URLSearchParams(city)).then((res) => {
    if (res.status === 200) {
       console.log(res.data);
    } else {
        console.error("Error fetching restaurants:", res);
    }
}).catch((error) => {
    console.error("Error fetching restaurants:", error);
});
await renderTemplate('../templates/partials/restaurant-list.mustache', 'restaurants-list', data);

const restaurantList = document.querySelectorAll('.restaurants-item');

if (restaurantList.length !== 0) {
    restaurantList.forEach((item) => {
        item.addEventListener('click', () => {
            const restaurantId = item.getAttribute('data-id');
            window.location.href = `restaurant-detail.html?id=${restaurantId}`;
        });
    });
}