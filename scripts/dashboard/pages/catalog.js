import { renderTemplate } from "../../utils/rendertemplate.js";
import * as api from '../../utils/api.js';
import { renderModal } from '../../utils/modal.js';

let partnerid = null;
let partners = [];
let data;

const init = async () => {
    partners = await api.get('partners/me/', true).then((response) => {
        if (response.status == 200) {
            return response.data;
        } else {
            console.error("Error fetching partner ID:", response.data);
            return null;
        }
    });
    if (partners) {
        localStorage.getItem('selectedPartnerId') ? partnerid = localStorage.getItem('selectedPartnerId') : partnerid = partners[0].id;            
    }
    data = await api.get('partners/' + partnerid + "/catalogs/full", true).then((response) => {
        if (response.status == 200) {
            return response.data;
        } else {
            console.error("Error fetching catalogs:", response.data);
            return null;
        }
    });
}

const findCatalog = (catalogId, tempId) => {
    if (tempId) {
        return data.catalogs.find(catalog => catalog.temp_id === tempId);
    } else {
        return data.catalogs.find(catalog => catalog.id === parseInt(catalogId));
    }
}
const findCategory = (categoryId, tempId) => {
    if (tempId) {
        return data.catalogs.reduce((acc, catalog) => {
            const category = catalog.categories.find(cat => cat.temp_id === tempId);
            if (category) {
                acc.catalog = catalog;
                acc.category = category;
            }
            return acc;
        }, {});
    } else {
        return data.catalogs.reduce((acc, catalog) => {
            const category = catalog.categories.find(cat => cat.id === parseInt(categoryId));
            if (category) {
                acc.catalog = catalog;
                acc.category = category;
            }
            return acc;
        }, {});
    }
}

const findItem = (itemId, tempId) => {
    if (tempId) {
        return data.catalogs.reduce((acc, catalog) => {
            catalog.categories.forEach(category => {
                const item = category.items.find(it => it.temp_id === tempId);
                if (item) {
                    acc.category = category;
                    acc.item = item;
                }
            });
            return acc;
        }
        , {});
    } else {
        return data.catalogs.reduce((acc, catalog) => {
            catalog.categories.forEach(category => {
                const item = category.items.find(it => it.id === parseInt(itemId));
                if (item) {
                    acc.category = category;
                    acc.item = item;
                }
            });
            return acc;
        }
        , {});
    }
}

async function addCatalog(container) {
    let catalog = {
        temp_id: "temp_" + Math.random().toString(36).substr(2, 9),
        id: null,
        name: "New Catalog",
        is_active: false,
        categories: []
    };
    const response = await api.post(`partners/${partnerid}/catalogs`, catalog, true);
    if (response.status === 201) {
        catalog.id = response.data.id;
        catalog.temp_id = null;
        data.catalogs = data.catalogs || [];
        data.catalogs.push(catalog);
        localStorage.setItem('catalogs', JSON.stringify(data));
        await renderCatalog(container);
    } else {
        console.error("Error adding catalog:", response.data);
    }
}

async function addCategory(e, container) {
    const { catalogId, tempId } = e.target.dataset;
    const catalog = findCatalog(catalogId, tempId);
    if (!catalog) return;
    const category = {
        temp_id: "temp_" + Math.random().toString(36).substr(2, 9),
        id: null,
        name: "New Category",
        catalog_id: catalog.id,
        items: []
    };
    const response = await api.post(`catalog/${catalog.id}/categories/`, category, true);
    if (response.status === 201) {
        category.id = response.data.id;
        category.temp_id = null;
        catalog.categories = catalog.categories || [];
        catalog.categories.push(category);
        localStorage.setItem('catalogs', JSON.stringify(data));
        await renderCatalog(container);
    } else {
        console.error("Error adding category:", response.data);
    }
}

async function addItem(e, container) {
    const { categoryId, tempId } = e.target.dataset;
    const { catalog, category } = findCategory(categoryId, tempId);
    if (!catalog || !category) return;
    const item = {
        temp_id: "temp_" + Math.random().toString(36).substr(2, 9),
        id: null,
        name: "New Item",
        price: "0",
        description: "Description",
        category_id: category.id
    };
    const response = await api.post(`categories/${category.id}/items/`, item, true);
    if (response.status === 201) {
        item.id = response.data.id;
        item.temp_id = null;
        category.items = category.items || [];
        category.items.push(item);
        localStorage.setItem('catalogs', JSON.stringify(data));
        await renderCatalog(container);
    } else {
        console.error("Error adding item:", response.data);
    }
}

async function deleteCatalog(e, container) {
    const { id: catalogId, tempId } = e.target.dataset;
    const catalog = findCatalog(catalogId, tempId);
    if (!catalog) return;
    const response = await api.del(`partners/${partnerid}/catalogs/${catalog.id}`, true);
    if (response.status === 204) {
        data.catalogs = data.catalogs.filter(c => c !== catalog);
        localStorage.setItem('catalogs', JSON.stringify(data));
        await renderCatalog(container);
    } else {
        console.error("Error deleting catalog:", response.data);
    }
}

async function deleteCategory(e, container) {
    const { id: categoryId, tempId } = e.target.dataset;
    const { catalog, category } = findCategory(categoryId, tempId);
    if (!catalog || !category) return;
    const response = await api.del(`catalog/categories/${category.id}`, true);
    if (response.status === 204) {
        catalog.categories = catalog.categories.filter(c => c !== category);
        localStorage.setItem('catalogs', JSON.stringify(data));
        await renderCatalog(container);
    } else {
        console.error("Error deleting category:", response.data);
    }
}

async function deleteItem(e, container) {
    const { id: itemId, tempId } = e.target.dataset;
    const { category, item } = findItem(itemId, tempId);
    if (!category || !item) return;
    const response = await api.del(`categories/items/${item.id}`, true);
    if (response.status === 204) {
        category.items = category.items.filter(i => i !== item);
        localStorage.setItem('catalogs', JSON.stringify(data));
        await renderCatalog(container);
    } else {
        console.error("Error deleting item:", response.data);
    }
}

function editCatalog(e, container) {
    const { id: catalogId, tempId } = e.target.dataset;
    const catalog = findCatalog(catalogId, tempId);
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
        const form = document.getElementById('edit-catalog-form');
        const submitButton = document.querySelector('.c-modal__submit');
        if (!form || !submitButton) return;
        submitButton.addEventListener('click', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            catalog.name = formData.get('catalog-name');
            catalog.is_active = formData.get('catalog-active') === 'on';
            if (catalog.is_active) {
                data.catalogs.forEach(c => { if (c.id !== catalog.id) c.is_active = false; });
            }
            const response = await api.patch(`partners/${partnerid}/catalogs/${catalog.id}`, {
                name: catalog.name,
                is_active: catalog.is_active
            }, true);
            if (response.status === 200) {
                catalog.id = response.data.id;
                catalog.temp_id = null;
                localStorage.setItem('catalogs', JSON.stringify(data));
            } else {
                console.error("Error updating catalog:", response.data);
            }
            await renderCatalog(container);
        });
    });
}

function editCategory(e, container) {
    const { id: categoryId, tempId } = e.target.dataset;
    const { category } = findCategory(categoryId, tempId);
    if (!category) return;
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
        const form = document.getElementById('edit-category-form');
        const submitButton = document.querySelector('.c-modal__submit');
        if (!form || !submitButton) return;
        submitButton.addEventListener('click', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            category.name = formData.get('category-name');
            const response = await api.patch(`catalog/categories/${category.id}`, category, true);
            if (response.status !== 200) {
                console.error("Error updating category:", response.data);
            }
            await renderCatalog(container);
        });
    });
}

function editItem(e, container) {
    const { id: itemId, tempId } = e.target.dataset;
    const { category, item } = findItem(itemId, tempId);
    if (!category || !item) return;
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
                <img id="item-picture-preview" src="${item.picture || ''}" alt="Item Picture" style="display: ${item.picture ? 'block' : 'none'};">
            </form>
        `,
        submit: "Save",
    }).then(() => {
        const form = document.getElementById('edit-item-form');
        const submitButton = document.querySelector('.c-modal__submit');
        const pictureInput = document.getElementById('item-picture');
        if (!form || !submitButton) return;

        if (pictureInput) {
            pictureInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && file.size !== 0) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        document.getElementById('item-picture-preview').src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        submitButton.addEventListener('click', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            item.name = formData.get('item-name');
            item.price = formData.get('item-price');
            item.description = formData.get('item-description');
            const formpic = formData.get('item-picture');
            if (formpic && formpic.size && formpic.size !== 0) {
                const imgForm = new FormData();
                imgForm.append('file', formpic, formpic.name);
                const imgResponse = await api.postImage(`categories/items/${item.id}/upload-image`, imgForm, true);
                if (imgResponse.status === 201) {
                    item.picture = imgResponse.data.url;
                } else {
                    console.error("Error uploading image:", imgResponse.data);
                }
            }
            const response = await api.patch(`categories/items/${item.id}`, item, true);
            if (response.status === 200) {
                item.id = response.data.id;
                item.temp_id = null;
                localStorage.setItem('catalogs', JSON.stringify(data));
            } else {
                console.error("Error updating item:", response.data);
            }
            await renderCatalog(container);
        });
    });
}

export const renderCatalog = async (container) => {
    if (!partnerid || !data) await init();
    localStorage.setItem('catalogs', JSON.stringify(data));

    data.partners = data.partners || {};
    data.partners.options = partners.map((partner) => {
        return {
            value: partner.id,
            name: partner.name + " (id: " + partner.id + ")",
            selected: partner.id == parseInt(partnerid) ? true : false
        };
    });

    await renderTemplate(
        '../../templates/partials/dashboard/pages/catalog.mustache',
        container,
        data
    ).then(() => {

        let partnerSelect = document.querySelector('#' + container + ' #partner-select');
        if (partners.length > 1) {
            partnerSelect.style.display = 'block';
            partnerSelect.addEventListener('change', async (e) => {
                partnerid = e.target.value;
                localStorage.setItem('selectedPartnerId', partnerid);
                data = await api.get('partners/' + partnerid + "/catalogs/full", true).then((response) => {
                    if (response.status == 200) {
                        return response.data;
                    } else {
                        console.error("Error fetching catalogs:", response.data);
                        return null;
                    }
                });
                renderCatalog(container);
            });
        } else {
            partnerSelect.style.display = 'none';
        }

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