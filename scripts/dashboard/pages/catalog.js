import { renderTemplate } from "../../utils/rendertemplate.js";
import * as api from '../../utils/api.js';
import { renderModal } from '../../utils/modal.js';

let partnerid = null;
let data;

const init = async () => {
    partnerid = await api.get('partners/me/', true).then((response) => {
        if (response.status == 200) {
            return response.data.id;
        } else {
            console.error("Error fetching partner ID:", response.data);
            return null;
        }
    });
    data = await api.get('partners/' + partnerid + "/catalogs/full", true).then((response) => {
        if (response.status == 200) {
            return response.data;
        } else {
            console.error("Error fetching catalogs:", response.data);
            return null;
        }
    });
}

function addCatalog(container) {
    let catalog = {
        temp_id: "temp_" + Math.random().toString(36).substr(2, 9),
        id: null,
        name: "New Catalog",
        is_active: false,
        categories: []
    };
    api.post('partners/' + partnerid + "/catalogs", catalog, true).then((response) => {
        if (response.status == 201) {
            catalog.id = response.data.id;
            catalog.temp_id = null;
            data.catalogs ? data.catalogs.push(catalog) : data.catalogs = [catalog];
            localStorage.setItem('catalogs', JSON.stringify(data));
            renderCatalog(container);
        } else {
            console.error("Error adding catalog:", response.data);
        }
    });
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
        api.post('catalog/' + catalog.id + "/categories/", category, true).then((response) => {
            if(response.status == 201) {
                category.id = response.data.id;
                category.temp_id = null;
                if (catalog.categories) {
                    catalog.categories.push(category);
                } else {
                    catalog.categories = [category];
                }
                localStorage.setItem('catalogs', JSON.stringify(data));
                renderCatalog(container);
            }else {
                console.error("Error adding category:", response.data);
            }
        })
        renderCatalog(container);
    }
}

function addItem(e, container) {
    let categoryId = e.target.dataset.categoryId;
    let tempid = e.target.dataset.tempId;
    let catalog = data.catalogs.find(c =>
        c.categories.some(cat =>
            (categoryId && cat.id == categoryId) ||
            (tempid && cat.temp_id == tempid)
        )
    );
    if (!catalog) return;

    let category = catalog.categories.find(cat =>
        (categoryId && cat.id == categoryId) ||
        (tempid && cat.temp_id == tempid)
    );
    if (!category) return;

    let item = {
        temp_id: "temp_" + Math.random().toString(36).substr(2, 9),
        id: null,
        name: "New Item",
        price: "0",
        description: "Description",
        category_id: category.id
    };

    api.post('categories/' + category.id + "/items/", item, true).then((response) => {
        if (response.status === 201) {
            console.log("API response:", response.data);
            item.id = response.data.id;
            item.temp_id = null;
            catalog.categories = catalog.categories.map(cat => {
                if (cat.id === category.id) {
                    cat.items = cat.items ? [...cat.items, item] : [item];
                }
                return cat;
            });

            localStorage.setItem('catalogs', JSON.stringify(data));
            console.log("Updated catalogs:", data.catalogs);
        } else {
            console.error("Error adding item:", response.data);
        }
        renderCatalog(container);
    }).catch((error) => {
        console.error("API error:", error);
    });
}

function deleteCatalog(e, container) {
    let catalogId = e.target.dataset.id;
    let tempid = e.target.dataset.tempId;
    let catalog = catalogId == ''
        ? data.catalogs.find(c => c.temp_id == tempid)
        : data.catalogs.find(c => c.id == catalogId);
    if (!catalog) return;
    api.del(`partners/` + partnerid + `/catalogs/` + catalog.id, true).then((response) => {
        if (response.status == 204) {
            data.catalogs = data.catalogs.filter(c => c != catalog);
            localStorage.setItem('catalogs', JSON.stringify(data));
            renderCatalog(container);
        } else {
            console.error("Error deleting catalog:", response.data);
        }
    })
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
    api.del(`catalog/categories/${category.id}`, true).then((response) => {
        if (response.status == 204) {
            catalog.categories = catalog.categories.filter(c => c != category);
            localStorage.setItem('catalogs', JSON.stringify(data));
            renderCatalog(container);
        } else {
            console.error("Error deleting category:", response.data);
        }
    })
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
    if (!item) return;
    api.del(`categories/items/${item.id}`, true).then((response) => {
        if (response.status == 204) {
            category.items = category.items.filter(i => i != item);
            localStorage.setItem('catalogs', JSON.stringify(data));
            renderCatalog(container);
        } else {
            console.error("Error deleting item:", response.data);
        }
    })
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
            console.log({
                name: catalog.name,
                is_active: catalog.is_active
            })
            api.patch('partners/' + partnerid + "/catalogs/" + catalog.id, {
                name: catalog.name,
                is_active: catalog.is_active
            }, true).then((response) => {
                if (response.status == 200) {
                    catalog.id = response.data.id;
                    catalog.temp_id = null;
                    localStorage.setItem('catalogs', JSON.stringify(data));
                } else {
                    console.error("Error updating catalog:", response.data);
                }
            });
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
            api.patch('catalog/categories/' + category.id, category, true).then((response) => {
                if (response.status == 200) {

                } else {
                    console.error("Error updating category:", response.data);
                }
            })
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
        if (!form) return;
        let submitButton = document.querySelector('.c-modal__submit');
        let pictureInput = document.getElementById('item-picture');
        if (!pictureInput) return;
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
        

        if (!submitButton) return;
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
            api.patch('categories/items/' + item.id, item, true).then((response) => {
                if (response.status == 200) {
                    item.id = response.data.id;
                    item.temp_id = null;
                    localStorage.setItem('catalogs', JSON.stringify(data));
                } else {
                    console.error("Error updating item:", response.data);
                }
            });
            renderCatalog(container);
        });
    });
}


export const renderCatalog = async (container) => {
    if(partnerid == null) {
        await init();
    }
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