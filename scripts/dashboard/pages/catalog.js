import { renderTemplate } from "../../utils/rendertemplate.js";
import * as api from '../../utils/api.js';
import { renderModal } from '../../utils/modal.js';

let data = localStorage.getItem('catalogs');
if (data) {
    data = {};
} else {
    data = {
        catalogs: [
            {
                id: 1,
                name: "Catalog 1",
                is_active: true,
                categories: [
                    {
                        id: 1,
                        name: "Category 1",
                        catalog_id: 1,
                        items: [
                            { id: 1, name: "Item 1", price: "10", description: "Description 1", category_id: 1 },
                            { id: 2, name: "Item 2", price: "20", description: "Description 2", category_id: 1 }
                        ]
                    },
                    {
                        id: 2,
                        name: "Category 2",
                        catalog_id: 1,
                        items: [
                            { id: 3, name: "Item 3", price: "30", description: "Description 3", category_id: 2 },
                            { id: 4, name: "Item 4", price: "40", description: "Description 4", category_id: 2 }
                        ]
                    }
                ]
            },
            {
                id: 2,
                name: "Catalog 2",
                is_active: false,
                categories: [
                    {
                        id: 3,
                        name: "Category 3",
                        catalog_id: 2,
                        items: [
                            { id: 5, name: "Item 5", price: "50", description: "Description 5", category_id: 3 },
                            { id: 6, name: "Item 6", price: "60", description: "Description 6", category_id: 3 }
                        ]
                    },
                    {
                        id: 4,
                        name: "Category 4",
                        catalog_id: 2,
                        items: [
                            { id: 7, name: "Item 7", price: "70", description: "Description 7", category_id: 4 },
                            { id: 8, name: "Item 8", price: "80", description: "Description 8", category_id: 4 }
                        ]
                    }
                ]
            }
        ]
    };
}

// --- Helper Functions ---

function addCatalog(container) {
    let catalog = {
        temp_id: "temp_" + Math.random().toString(36).substr(2, 9),
        id: null,
        name: "New Catalog",
        is_active: false,
        categories: []
    };
    if (data.catalogs) {
        data.catalogs.push(catalog);
    } else {
        data.catalogs = [catalog];
    }
    renderCatalog(container);
}

function addCategory(e, container) {
    let catalogId = e.target.dataset.catalogId;
    let tempid = e.target.dataset.tempId;
    let catalog = catalogId == ''
        ? data.catalogs.find(c => c.temp_id == tempid)
        : data.catalogs.find(c => c.id == catalogId);
    if (catalog) {
        let category = {
            temp_id: "temp_" + Math.random().toString(36).substr(2, 9),
            id: null,
            name: "New Category",
            catalog_id: catalog.id,
            items: []
        };
        if (catalog.categories) {
            catalog.categories.push(category);
        } else {
            catalog.categories = [category];
        }
        renderCatalog(container);
    }
}

function addItem(e, container) {
    let categoryId = e.target.dataset.categoryId;
    let tempid = e.target.dataset.tempId;
    let catalog = data.catalogs.find(c => {
        return c.categories.some(cat =>
            (categoryId && cat.id == categoryId) ||
            (tempid && cat.temp_id == tempid)
        );
    });
    if (!catalog) return;
    let category = catalog.categories.find(cat => {
        return (categoryId && cat.id == categoryId) ||
            (tempid && cat.temp_id == tempid);
    });
    if (!category) return;
    let item = {
        temp_id: "temp_" + Math.random().toString(36).substr(2, 9),
        id: null,
        name: "New Item",
        price: "0",
        description: "Description",
        category_id: category.id
    };
    if (category.items) {
        category.items.push(item);
    } else {
        category.items = [item];
    }
    renderCatalog(container);
}

function deleteCatalog(e, container) {
    let catalogId = e.target.dataset.id;
    let tempid = e.target.dataset.tempId;
    let catalog = catalogId == ''
        ? data.catalogs.find(c => c.temp_id == tempid)
        : data.catalogs.find(c => c.id == catalogId);
    if (!catalog) return;
    data.catalogs = data.catalogs.filter(c => c != catalog);
    renderCatalog(container);
}

function deleteCategory(e, container) {
    let categoryId = e.target.dataset.id;
    let tempid = e.target.dataset.tempId;
    let catalog = data.catalogs.find(c => {
        return c.categories.some(cat =>
            (categoryId && cat.id == categoryId) ||
            (tempid && cat.temp_id == tempid)
        );
    });
    if (!catalog) return;
    let category = catalog.categories.find(cat => {
        return (categoryId && cat.id == categoryId) ||
            (tempid && cat.temp_id == tempid);
    });
    if (!category) return;
    catalog.categories = catalog.categories.filter(cat => cat != category);
    renderCatalog(container);
}

function deleteItem(e, container) {
    let itemId = e.target.dataset.id;
    let tempid = e.target.dataset.tempId;
    let catalog = data.catalogs.find(c => {
        return c.categories.some(cat => {
            return cat.items.some(item =>
                (itemId && item.id == itemId) ||
                (tempid && item.temp_id == tempid)
            );
        });
    });
    if (!catalog) return;
    let category = catalog.categories.find(cat => {
        return cat.items.some(item =>
            (itemId && item.id == itemId) ||
            (tempid && item.temp_id == tempid)
        );
    });
    if (!category) return;
    let item = category.items.find(item => {
        return (itemId && item.id == itemId) ||
            (tempid && item.temp_id == tempid);
    });
if (!item) return
    category.items = category.items.filter(i => i != item);
    renderCatalog(container);
}

function editCatalog(e, container) {
    let catalogId = e.target.dataset.id;
    let tempid = e.target.dataset.tempId;
    let catalog = catalogId == ''
        ? data.catalogs.find(c => c.temp_id == tempid)
        : data.catalogs.find(c => c.id == catalogId);
    if (!catalog) return;

    renderModal({
        title: "Edit Catalog",
        content: `
            <form id="edit-catalog-form" data-id="${catalog.id}" data-tempid="${catalog.temp_id}">
                <label for="catalog-name">Catalog Name</label>
                <input type="text" id="catalog-name" name="catalog-name" value="${catalog.name}" required>
                <label for="catalog-active">Is Active</label>
                <input type="checkbox" id="catalog-active" name="catalog-active" ${catalog.is_active ? 'checked' : ''}>
            </form>
        `,
        submit: "Save",
    }).then(() => {
        let form = document.getElementById('edit-catalog-form');
        if (!form) return;
        let submitButton = document.querySelector('.c-modal__submit');
        if (!submitButton) return;
        submitButton.addEventListener('click', (e) => {
            e.preventDefault();
            let formData = new FormData(form);
            catalog.name = formData.get('catalog-name');
            catalog.is_active = formData.get('catalog-active') == 'on' ? true : false;
            if (catalog.is_active) {
                data.catalogs.forEach(c => {
                    if (c.id != catalog.id) {
                        c.is_active = false;
                    }
                });
            }
            renderCatalog(container);
        });
    });
}

function editCategory(e, container) {
    let categoryId = e.target.dataset.id;
    let tempid = e.target.dataset.tempId;
    let catalog = data.catalogs.find(c => {
        return c.categories.some(cat =>
            (categoryId && cat.id == categoryId) ||
            (tempid && cat.temp_id == tempid)
        );
    });
    if (!catalog)
        return;
    let category = catalog.categories.find(cat => {
        return (categoryId && cat.id == categoryId) ||
            (tempid && cat.temp_id == tempid);
    });
    if (!category)
        return;
    renderModal({
        title: "Edit Category",
        content: `
            <form id="edit-category-form" data-id="${category.id}" data-tempid="${category.temp_id}">
                <label for="category-name">Category Name</label>
                <input type="text" id="category-name" name="category-name" value="${category.name}" required>
            </form>
        `,
        submit: "Save",
    }).then(() => {
        let form = document.getElementById('edit-category-form');
        if (!form)
            return;
        let submitButton = document.querySelector('.c-modal__submit');
        if (!submitButton) return;
        submitButton.addEventListener('click', (e) => {
            e.preventDefault();
            let formData = new FormData(form);
            category.name = formData.get('category-name');
            renderCatalog(container);
        });
    });
}


function editItem(e, container) {
    let itemId = e.target.dataset.id;
    let tempid = e.target.dataset.tempId;
    let catalog = data.catalogs.find(c => {
        return c.categories.some(cat => {
            return cat.items.some(item =>
                (itemId && item.id == itemId) ||
                (tempid && item.temp_id == tempid)
            );
        });
    });
    if (!catalog)
        return;

    let category = catalog.categories.find(cat => {
        return cat.items.some(item =>
            (itemId && item.id == itemId) ||
            (tempid && item.temp_id == tempid)
        );
    });
    if (!category)
        return;

    let item = category.items.find(item => {
        return (itemId && item.id == itemId) ||
            (tempid && item.temp_id == tempid);
    });
    if (!item)
        return;
    renderModal({
        title: "Edit Item",
        content: `
            <form id="edit-item-form" data-id="${item.id}" data-tempid="${item.temp_id}">
                <label for="item-name">Item Name</label>
                <input type="text" id="item-name" name="item-name" value="${item.name}" required>
                <label for="item-price">Item Price</label>
                <input type="text" id="item-price" name="item-price" value="${item.price}" required>
                <label for="item-description">Item Description</label>
                <textarea id="item-description" name="item-description">${item.description}</textarea>
                <label for="item-picture">Item Picture</label>
                <input type="file" id="item-picture" name="item-picture" accept="image/*">
                <img id="item-picture-preview" src="${item.picture}" alt="Item Picture" style="display: ${item.picture ? 'block' : 'none'};">
            </form>
        `,
        submit: "Save",
    }).then(() => {
        let form = document.getElementById('edit-item-form');
        if (!form) 
            return;
        let submitButton = document.querySelector('.c-modal__submit');
        let pictureInput = document.getElementById('item-picture');
        if (!pictureInput)
            return;
        pictureInput.addEventListener('change', (e) => {
            let file = e.target.files[0];
            if (file && file.size !== 0) {
                let reader = new FileReader();
                reader.onload = function (e) {
                    document.getElementById('item-picture-preview').src = e.target.result;
                }
                reader.readAsDataURL(file);
            }
        });
        

        if (!submitButton)
            return;
        submitButton.addEventListener('click', (e) => {
            e.preventDefault();
            let formData = new FormData(form);
            item.name = formData.get('item-name');
            item.price = formData.get('item-price');
            item.description = formData.get('item-description');
            let formpic = formData.get('item-picture');
            if (formpic && formpic.size && formpic.size !== 0) {
                let reader = new FileReader();
                reader.onload = function (e) {
                    item.picture = e.target.result;
                    document.getElementById('item-picture-preview').src = item.picture;
                };
                reader.readAsDataURL(formpic);
            }
            renderCatalog(container);
        });
    });
}


export const renderCatalog = async (container) => {
    localStorage.setItem('catalogs', JSON.stringify(data));
    await renderTemplate(
        '../../templates/partials/dashboard/pages/catalog.mustache',
        container,
        data
    ).then(() => {
        let addCatalogButton = document.querySelector('.add-catalog');
        if (addCatalogButton) {
            addCatalogButton.addEventListener('click', () => addCatalog(container));
        }

        let addCategoryButtons = document.querySelectorAll('.add-category');
        addCategoryButtons.forEach((button) => {
            button.addEventListener('click', (e) => addCategory(e, container));
        });

        let addItemButtons = document.querySelectorAll('.add-item');
        addItemButtons.forEach((button) => {
            button.addEventListener('click', (e) => addItem(e, container));
        });

        let deleteCatalogButtons = document.querySelectorAll('.delete-catalog');
        deleteCatalogButtons.forEach((button) => {
            button.addEventListener('click', (e) => deleteCatalog(e, container));
        });

        let deleteCategoryButtons = document.querySelectorAll('.delete-category');
        deleteCategoryButtons.forEach((button) => {
            button.addEventListener('click', (e) => deleteCategory(e, container));
        });

        let deleteItemButtons = document.querySelectorAll('.delete-item');
        deleteItemButtons.forEach((button) => {
            button.addEventListener('click', (e) => deleteItem(e, container));
        });

        let editCatalogButtons = document.querySelectorAll('.edit-catalog');
        editCatalogButtons.forEach((button) => {
            button.addEventListener('click', (e) => editCatalog(e, container));
        });

        let editCategoryButtons = document.querySelectorAll('.edit-category');
        editCategoryButtons.forEach((button) => {
            button.addEventListener('click', (e) => editCategory(e, container));
        });

        let editItemButtons = document.querySelectorAll('.edit-item');
        editItemButtons.forEach((button) => {
            button.addEventListener('click', (e) => editItem(e, container));
        });
    });
};