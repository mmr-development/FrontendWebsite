import { renderTemplate } from '../utils/rendertemplate.js';
import * as api from '../utils/api.js';

let categories = await api.get('catalog/categories/all', api.includeCredentials).then((res) => {
    if (res.status === 200) {
        console.log(res.data)
        return res.data.categories.map(category => ({
            image: category.image || "../../files/images/restaurants/placeholder.png",
            title: category.name,
            selected: false,
            count: category.count || 0,
            partner_ids: category.partner_ids || [],
        }));
    } else {
        console.error('Failed to load categories:', res.status);
        return [];
    }
}).catch((error) => {
    console.error('Error fetching categories:', error);
    return [];
});

console.log(categories);

let scrollbarData = {
    categories: categories.map(category => ({
        image: category.image || "../../files/images/restaurants/placeholder.png",
        title: category.title,
        selected: category.selected || false,
        count: category.count || 0,
        partnerIds: Array.isArray(category.partner_ids) ? category.partner_ids.join(',') : ''
    }))
};

await renderTemplate('templates/partials/categoryscrollbar.mustache', 'categoryscrollbar', scrollbarData).then(() => {
    const scrollbarContainer = document.querySelector('.scrollbar-container'); 

    if (scrollbarContainer) {
        scrollbarContainer.addEventListener('wheel', (event) => {
            event.preventDefault(); 
            const scrollAmount = event.deltaY * 5 || event.deltaX * 100; 
            scrollbarContainer.scrollBy({
                left: scrollAmount, 
                behavior: 'smooth', 
            });
        });
        const items = scrollbarContainer.querySelectorAll('.scrollbar-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
            if (item.classList.contains('selected')) {
                item.classList.remove('selected');
            } else {
                items.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
            }
            });
        });
    }
});

