import { renderTemplate } from '../utils/rendertemplate.js';

let scrollbarData = {
    categories: [
        { image: "../../files/images/restaurants/placeholder.png" , title: "All", selected: true },
        { image: "../../files/images/restaurants/placeholder.png" , title: "Pizza", selected: false },
        { image: "../../files/images/restaurants/placeholder.png" , title: "Sushi", selected: false },
        { image: "../../files/images/restaurants/placeholder.png" , title: "Burgers", selected: false },
        { image: "../../files/images/restaurants/placeholder.png" , title: "Salads", selected: false },
        { image: "../../files/images/restaurants/placeholder.png" , title: "Desserts", selected: false },
        { image: "../../files/images/restaurants/placeholder.png" , title: "Drinks", selected: false },
        { image: "../../files/images/restaurants/placeholder.png" , title: "Snacks", selected: false },
        { image: "../../files/images/restaurants/placeholder.png" , title: "Breakfast", selected: false },
        { image: "../../files/images/restaurants/placeholder.png" , title: "Brunch", selected: false },
        { image: "../../files/images/restaurants/placeholder.png" , title: "Lunch", selected: false },
        { image: "../../files/images/restaurants/placeholder.png" , title: "Dinner", selected: false },
        { image: "../../files/images/restaurants/placeholder.png" , title: "Vegan", selected: false },
        { image: "../../files/images/restaurants/placeholder.png" , title: "Vegetarian", selected: false },
        { image: "../../files/images/restaurants/placeholder.png" , title: "Gluten-Free", selected: false },
        { image: "../../files/images/restaurants/placeholder.png" , title: "Halal", selected: false },
        { image: "../../files/images/restaurants/placeholder.png" , title: "Kosher", selected: false },
        { image: "../../files/images/restaurants/placeholder.png" , title: "Organic", selected: false },
        { image: "../../files/images/restaurants/placeholder.png" , title: "Local", selected: false },
        { image: "../../files/images/restaurants/placeholder.png" , title: "Seasonal", selected: false },
    ],
};

await renderTemplate('templates/partials/categoryscrollbar.mustache', 'categoryscrollbar', scrollbarData).then(() => {
    const scrollbarContainer = document.querySelector('.scrollbar-container'); // Replace with the correct class or ID

    if (scrollbarContainer) {
        scrollbarContainer.addEventListener('wheel', (event) => {
            event.preventDefault(); // Prevent vertical scrolling

            // Adjust scrolling for both mouse wheels and touchpads
            const scrollAmount = event.deltaY * 5 || event.deltaX * 100; // Use deltaX for horizontal touchpad gestures
            scrollbarContainer.scrollBy({
                left: scrollAmount, // Scroll horizontally
                behavior: 'smooth', // Add smooth scrolling behavior
            });
        });
    }
});

