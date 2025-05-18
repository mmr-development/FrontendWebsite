import {renderTemplate} from '../../utils/rendertemplate.js';

export const renderGet = async (container,data) => {
    await renderTemplate(
        '../../templates/partials/dashboard/content/get.mustache',
        container,
        data
    );
    const select = document.querySelector('#' + container + ' #custom-select');
    if (select) {
        select.addEventListener('change', (e) => {
            const selectedValue = e.target.value;
            localStorage.setItem('selectedParntetId', selectedValue);
            if (data.selectCallback) data.selectCallback(selectedValue);
        });
    }


    const searchInput = document.querySelector('#' + container + ' #search-input');
    const searchButton = document.querySelector('#' + container + ' #search-button');
    if (searchInput && searchButton) {
        searchButton.addEventListener('click', () => {
            const searchValue = searchInput.value;
            localStorage.setItem('selectedParntetId', searchValue);
            if (data.searchCallback) {
                data.searchCallback(searchValue);
            }
        });
    }

    const clearButton = document.querySelector('#' + container + ' #clear-search-button');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            searchInput.value = '';
            if (data.clearCallback) data.clearCallback();
        });
    }

    const pagination = document.querySelector('#' + container + ' #' + container + '-pagination');
    console.log('Pagination:', pagination);
    console.log('#' + container + ' #' + container + '-pagination');
    if (pagination) {
        let totalPages = Math.ceil(data.totalItems / data.itemsPerPage);
        console.log('Total Pages:', totalPages);
        pagination.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            console.log('Page:', i);
            const pageLink = document.createElement('a');
            pageLink.href = `#${container}-${i}`;
            pageLink.textContent = i;
            pageLink.classList.add('page-link');
            pageLink.addEventListener('click', async (e) => {
                e.preventDefault();
                if (data.pageCallback) data.pageCallback(i);
            });
            pageLink.classList.add('page-link');
            pagination.appendChild(pageLink);
        }
    }
}


