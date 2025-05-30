import * as api from '../utils/api.js';

export const getRestaurantDetail = async (id) => {
    let restaurantsDetail = localStorage.getItem('restaurantsDetail');
    if (restaurantsDetail) {
        restaurantsDetail = JSON.parse(restaurantsDetail);
        if (restaurantsDetail[id]) {
            return restaurantsDetail[id];
        }
    }

    let restaurantDetail = await api.get('partners/' + id).then((res) => {
        if (res.status === 200) {
            return res.data;
        } else {
            console.error("Error fetching restaurant detail:", res);
            return [];
        }
    }).catch((error) => {
        console.error("Error fetching restaurant detail:", error);
        return [];
    });

    let opening_hours = await api.get('partners/' + id + '/hours').then((res) => {
        if (res.status === 200) {
            return res.data;
        } else {
            console.error("Error fetching restaurant opening hours:", res);
            return [];
        }
    });
    // order of the days of the week from 0 to 6
    opening_hours.hours = opening_hours.hours.sort((a, b) => a.day_of_week - b.day_of_week);

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    let templateData = {
        id: restaurantDetail.id.toString(),
        name: restaurantDetail.name,
        banner: restaurantDetail.banner_url ? api.baseurl + 'public' + restaurantDetail.banner_url : "../../files/images/restaurants/placeholder.png",
        logo: restaurantDetail.logo_url ? api.baseurl + 'public' + restaurantDetail.logo_url : "../../files/images/restaurants/placeholder.png",
        top_picks: "N/A", // Placeholder for top picks
        estimated_delivery_time: restaurantDetail.delivery_time ? restaurantDetail.delivery_time + " mins" : "N/A",
        delivery_fee: restaurantDetail.delivery_fee ? restaurantDetail.delivery_fee + 'dkk ' : "N/A",
        minimum_order: restaurantDetail.min_order_value ? restaurantDetail.min_order_value + 'dkk ' : "N/A",
        address: 'temporary address',
        opening_hours: opening_hours.hours.map((item) => {
            return {
                day: daysOfWeek[item.day_of_week], // Map day_of_week to day name
                hours: `${item.opens_at.slice(0, 5)} - ${item.closes_at.slice(0, 5)}` // Format opening and closing hours
            };
        }),
        smiley: restaurantDetail.smiley_report_link ? {
            smiley_url: restaurantDetail.smiley_report_link,
            smiley_img: restaurantDetail.smiley_image_url,
        } : null,
        info: '<i class="fa fa-info-circle" aria-hidden="true"></i>'
    };
    restaurantsDetail = localStorage.getItem('restaurantsDetail');
    if (restaurantsDetail) {
        restaurantsDetail = JSON.parse(restaurantsDetail);
        restaurantsDetail[restaurantDetail.id] = templateData;
    } else {
        restaurantsDetail = {};
        restaurantsDetail[restaurantDetail.id] = templateData;
    }
    localStorage.setItem('restaurantsDetail', JSON.stringify(restaurantsDetail));
    return templateData;
}