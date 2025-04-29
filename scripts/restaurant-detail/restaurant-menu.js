import { renderTemplate } from '../utils/rendertemplate.js';

export const menu_data = {
    categories: [
        {
            name: 'Appetizers',
            items: [
                {
                    id: '1',
                    name: 'Spring Rolls',
                    image: '../../files/images/restaurants/placeholder.png',
                    price: '75.00',
                    description: 'Crispy spring rolls filled with vegetables and served with sweet chili sauce.'
                },
                {
                    id: '2',
                    name: 'Garlic Bread',
                    image: '../../files/images/restaurants/placeholder.png',
                    price: '69.00',
                    description: 'Toasted garlic bread topped with herbs and butter.'
                }
            ]
        },
        {
            name: 'Main Courses',
            items: [
                {
                    id: '3',
                    name: 'Grilled Chicken',
                    image: '../../files/images/restaurants/placeholder.png',
                    price: '129.00',
                    description: 'Juicy grilled chicken served with seasonal vegetables.'
                },
                {
                    id: '4',
                    name: 'Pasta Primavera',
                    image: '../../files/images/restaurants/placeholder.png',
                    price: '89.00',
                    description: 'Pasta tossed with fresh vegetables and olive oil.'
                }
            ]
        },
        {
            name: 'Desserts',
            items: [
                {
                    id: '5',
                    name: 'Chocolate Cake',
                    image: '../../files/images/restaurants/placeholder.png',
                    price: '45.00',
                    description: 'Rich chocolate cake topped with chocolate ganache.'
                },
                {
                    id: '6',
                    name: 'Cheesecake',
                    image: '../../files/images/restaurants/placeholder.png',
                    price: '55.00',
                    description: 'Creamy cheesecake with a graham cracker crust.'
                }
            ]
        }
    ]
}