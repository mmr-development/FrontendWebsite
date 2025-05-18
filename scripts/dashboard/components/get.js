import {renderTemplate} from '../../utils/template.js';

export const renderGet = async (container,data) => {
    await renderTemplate(
        '../../templates/partials/dashboard/content/get.mustache',
        container,
        data
    );
    // check select
    const select = document.querySelector('#' . container + 'custom-select');
    const options = select.querySelectorAll('option');
    options.forEach((option) => {
        option.addEventListener('click', () => {
            select.querySelector('input').value = option.value;
            if (data.selectCallback) {
                data.selectCallback(option.value);
            }
        });
    });

    const searchInput = document.querySelector('#' + container + 'search-input');
    const searchButton = document.querySelector('#' + container + 'search-button');
    searchButton.addEventListener('click', () => {
        const searchValue = searchInput.value;
        if (data.searchCallback) {
            data.searchCallback(searchValue);
        }
    });

    const clearButton = document.querySelector('#' + container + 'clear-button');
    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        if (data.clearCallback) {
            data.clearCallback();
        }
    });

    const pagination = document.querySelector('#' + container + 'pagination');
    if (pagination) {
        let totalPages = Math.ceil(data.totalItems / data.itemsPerPage);
        pagination.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const pageLink = document.createElement('a');
            pageLink.href = `#${container}-${i}`;
            pageLink.textContent = i;
            pageLink.classList.add('page-link');
            pageLink.addEventListener('click', async (e) => {
                e.preventDefault();
                if (data.pageCallback) {
                    data.pageCallback(i);
                }
            });
            pagination.appendChild(pageLink);
        }
    }
}


