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
            localStorage.setItem('selectedPartnerId', selectedValue);
            if (data.selectCallback) data.selectCallback(selectedValue);
        });
    }


    const searchInput = document.querySelector('#' + container + ' #search-input');
    const searchButton = document.querySelector('#' + container + ' #search-button');
    if (searchInput && searchButton) {
        searchButton.addEventListener('click', () => {
            const searchValue = searchInput.value;
            localStorage.setItem('selectedPartnerId', searchValue);
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
    if (pagination) {
        let totalPages = Math.ceil(data.totalItems / data.itemsPerPage);
        let currentPage = data.currentPage || 1;
        const maxVisible = 5;
        pagination.innerHTML = '';

        const createPageLink = (text, page, isActive = false, isDisabled = false) => {
            const link = document.createElement('a');
            link.textContent = text;
            link.classList.add('page-link');
            if (isActive) link.classList.add('active');
            if (isDisabled) link.classList.add('disabled');
            if (!isDisabled) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (data.pageCallback) data.pageCallback(page);
                });
            }
            return link;
        };

        pagination.appendChild(
            createPageLink('First', 1, false, currentPage === 1)
        );

        pagination.appendChild(
            createPageLink('Prev', Math.max(1, currentPage - 1), false, currentPage === 1)
        );

        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = startPage + maxVisible - 1;
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        if (startPage > 1) {
            pagination.appendChild(createPageLink('1', 1, false));
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.classList.add('ellipsis');
                pagination.appendChild(ellipsis);
            }
        }
        for (let i = startPage; i <= endPage; i++) {
            pagination.appendChild(createPageLink(i, i, i === currentPage));
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.classList.add('ellipsis');
                pagination.appendChild(ellipsis);
            }
            pagination.appendChild(createPageLink(totalPages, totalPages, false));
        }

        pagination.appendChild(
            createPageLink('Next', Math.min(totalPages, currentPage + 1), false, currentPage === totalPages)
        );

        pagination.appendChild(
            createPageLink('Last', totalPages, false, currentPage === totalPages)
        );
    }
}
