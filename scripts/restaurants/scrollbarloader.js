import { renderTemplate } from '../../script.js';

//    <div class="options"></div>

scrollbarData = {
    categories: [
        {img: "" , name: "All", selected: true },
        { name: "Pizza" },
        { name: "Burgers" },
        { name: "Sushi" },
        { name: "Salads" },
        { name: "Desserts" },
    ],
};

renderTemplate('templates/partials/categoryscrollbar.mustache', 'categoryscrollbar', scrollbarData);