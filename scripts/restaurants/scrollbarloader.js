import { renderTemplate } from '../../script.js';

//    <div class="options"></div>

let scrollbarData = {
    categories: [
        { image: "../../files/images/restaunrants/placeholder.png" , title: "All", selected: true },
        { image: "../../files/images/restaunrants/placeholder.png" , title: "Pizza", selected: false },
        { image: "../../files/images/restaunrants/placeholder.png" , title: "Sushi", selected: false },
        { image: "../../files/images/restaunrants/placeholder.png" , title: "Burgers", selected: false },
        { image: "../../files/images/restaunrants/placeholder.png" , title: "Salads", selected: false },
        { image: "../../files/images/restaunrants/placeholder.png" , title: "Desserts", selected: false },
        { image: "../../files/images/restaunrants/placeholder.png" , title: "Drinks", selected: false },
        { image: "../../files/images/restaunrants/placeholder.png" , title: "Snacks", selected: false },
        { image: "../../files/images/restaunrants/placeholder.png" , title: "Breakfast", selected: false },
        { image: "../../files/images/restaunrants/placeholder.png" , title: "Brunch", selected: false },
        { image: "../../files/images/restaunrants/placeholder.png" , title: "Lunch", selected: false },
        { image: "../../files/images/restaunrants/placeholder.png" , title: "Dinner", selected: false },
        { image: "../../files/images/restaunrants/placeholder.png" , title: "Vegan", selected: false },
        { image: "../../files/images/restaunrants/placeholder.png" , title: "Vegetarian", selected: false },
        { image: "../../files/images/restaunrants/placeholder.png" , title: "Gluten-Free", selected: false },
        { image: "../../files/images/restaunrants/placeholder.png" , title: "Halal", selected: false },
        { image: "../../files/images/restaunrants/placeholder.png" , title: "Kosher", selected: false },
        { image: "../../files/images/restaunrants/placeholder.png" , title: "Organic", selected: false },
        { image: "../../files/images/restaunrants/placeholder.png" , title: "Local", selected: false },
        { image: "../../files/images/restaunrants/placeholder.png" , title: "Seasonal", selected: false },
    ],
};

renderTemplate('templates/partials/categoryscrollbar.mustache', 'categoryscrollbar', scrollbarData);