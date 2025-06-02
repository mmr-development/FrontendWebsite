import { renderTemplate } from '../utils/rendertemplate.js';
import * as api from '../utils/api.js'

let tempCatalogs = localStorage.getItem('catalogs');
if (tempCatalogs) {
    renderTemplate('../templates/partials/restaurant-list.mustache', 'restaurants-list', JSON.parse(tempCatalogs));
}

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

function isRestaurantOpen(openingHours) {
    const now = new Date();
    const jsDay = now.getDay();
    const dataDay = (jsDay + 6) % 7; 
    const currentTime = now.toTimeString().slice(0, 5); 

    const todayHours = openingHours.find(hour => hour.day === dataDay);
    if (!todayHours) return false;

    const opensAt = todayHours.opens_at.slice(0, 5); 
    const closesAt = todayHours.closes_at.slice(0, 5);

    return currentTime >= opensAt && currentTime <= closesAt;
}

const formattedData = {
    restaurant_lists: [
        {
            restaurant_list_name: "All Restaurants",
            "restaurants": restaurants.partners.map(partner => ({
                id: partner.id.toString(),
                name: partner.name,
                banner: partner.banner_url ? api.baseurl + 'public' + partner.banner_url : "../../files/images/restaurants/placeholder.png",
                logo: partner.logo_url ? api.baseurl + 'public' + partner.logo_url : "../../files/images/restaurants/placeholder.png",
                top_picks: "N/A", 
                estimated_delivery_time: partner.delivery.min_preparation_time_minutes + '-' + partner.delivery.max_preparation_time_minutes + ' mins',
                delivery_fee: partner.delivery.fee ? partner.delivery.fee + 'dkk' : "N/A",
                minimum_order: partner.delivery.min_order_value ? partner.delivery.min_order_value + 'dkk' : "N/A",
                address: `${partner.address.street}, ${partner.address.city}, ${partner.address.postal_code}, ${partner.address.country}`,
                created_at: partner.created_at,
                is_open: isRestaurantOpen(partner.opening_hours)
            }))
        }
    ]
};

localStorage.setItem('catalogs', JSON.stringify(formattedData));

await renderTemplate('../templates/partials/restaurant-list.mustache', 'restaurants-list', formattedData).then(() => {
    const rForm = document.getElementById('restaurant-form');
    if (rForm) {
        rForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const searchInput = rForm.querySelector('#restaurants-search-input');
            const searchValue = searchInput.value.trim().toLowerCase();
            const restaurantItems = document.querySelectorAll('.restaurants-item');

            restaurantItems.forEach((item) => {
                const restaurantName = item.querySelector('.restaurant-name').textContent.toLowerCase();
                if (restaurantName.includes(searchValue)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
        const searchInput = rForm.querySelector('#restaurants-search-input');
        searchInput.addEventListener('input', () => {
            const searchValue = searchInput.value.trim().toLowerCase();
            const restaurantItems = document.querySelectorAll('.restaurants-item');

            restaurantItems.forEach((item) => {
                const restaurantName = item.querySelector('.restaurant-name').textContent.toLowerCase();
                if (restaurantName.includes(searchValue)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    const openNowTotoggle = document.getElementById('open-now-toggle').querySelector('input[type="checkbox"]');
    const newestToggle = document.getElementById('newest-toggle').querySelector('input[type="checkbox"]');

    let filterOpenRestaurants = (toggle) => {
        const restaurantItems = document.querySelectorAll('.restaurants-item');
        restaurantItems.forEach((item) => {
            const isOpen = item.getAttribute('data-is-open') === 'true';
            if (toggle.checked && !isOpen) {
                item.style.display = 'none';
            } else {
                item.style.display = 'flex';
            }
        });
    }

    let scrollbatContainer = document.querySelector('.scrollbar-container');
    if (scrollbatContainer) {
        const scrollbarItems = scrollbatContainer.querySelectorAll('.scrollbar-item');
        scrollbarItems.forEach(item => {
            item.addEventListener('click', () => {
                if (item.classList.contains('selected')) {
                    const partnersIds = item.getAttribute('data-partners-ids').split(',');
                    const restaurantItems = document.querySelectorAll('.restaurants-item');
                    restaurantItems.forEach(restaurantItem => {
                        const restaurantId = restaurantItem.getAttribute('data-id');
                        if (partnersIds.includes(restaurantId)) {
                            restaurantItem.style.display = 'flex';
                        } else {
                            restaurantItem.style.display = 'none';
                        }
                    });
                } else {
                    const selectedItems = scrollbatContainer.querySelectorAll('.scrollbar-item.selected');
                    if (selectedItems.length === 0) {
                        const restaurantItems = document.querySelectorAll('.restaurants-item');
                        restaurantItems.forEach(restaurantItem => {
                            restaurantItem.style.display = 'flex';
                        });
                    } else {
                        const partnersIds = Array.from(selectedItems).map(item => item.getAttribute('data-partners-ids')).join(',').split(',');
                        const restaurantItems = document.querySelectorAll('.restaurants-item');
                        restaurantItems.forEach(restaurantItem => {
                            const restaurantId = restaurantItem.getAttribute('data-id');
                            if (partnersIds.includes(restaurantId)) {
                                restaurantItem.style.display = 'flex';
                            } else {
                                restaurantItem.style.display = 'none';
                            }
                        });
                    }
                }
            });
        });
    }


    if (openNowTotoggle) {
        newestToggle.checked = false;
        newestToggle.dispatchEvent(new Event('change'));
        filterOpenRestaurants(openNowTotoggle);
        openNowTotoggle.addEventListener('change', () => {
            filterOpenRestaurants(openNowTotoggle);
        });
    }

    let sortItemsByDate = (toggle) => {
        const restaurantItems = document.querySelectorAll('.restaurants-item');
        const sortedItems = Array.from(restaurantItems).sort((a, b) => {
            const dateA = new Date(a.getAttribute('data-created-at'));
            const dateB = new Date(b.getAttribute('data-created-at'));
            return toggle.checked ? dateB - dateA : dateA - dateB;
        });
        const restaurantsList = document.getElementById('restaurants-list');
        restaurantsList.querySelectorAll('.restaurants-item').forEach(item => item.remove());
        sortedItems.forEach((item) => {
            restaurantsList.querySelector('.restaurants-list').appendChild(item);
        });
    }
    
    if (newestToggle) {
        openNowTotoggle.checked = false; 
        openNowTotoggle.dispatchEvent(new Event('change'));
        sortItemsByDate(newestToggle);
        newestToggle.addEventListener('change', () => {
            sortItemsByDate(newestToggle);
        });
    }
});

const restaurantList = document.querySelectorAll('.restaurants-item');

if (restaurantList.length !== 0) {
    restaurantList.forEach((item) => {
        item.addEventListener('click', () => {
            const restaurantId = item.getAttribute('data-id');
            window.location.href = `restaurant-detail.html?id=${restaurantId}`;
        });
    });
}