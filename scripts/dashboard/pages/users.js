import { renderTemplate } from "../../utils/rendertemplate.js";
import * as api from '../../utils/api.js';

let roles = [];

const loadRoles = async () => {
    roles = await api.get('users/roles').then((response) => {
        if (response.status === 200) {
            return response.data.roles;
        }
        return [];
    });
};

console.log(roles);

export const renderUsers = async (container, offset = 0) => {
    // if (roles.length === 0) {
    //     await loadRoles();
    // }
    const apiData = await api.get('users/?limit=5&offset=' + offset).then((res) => {
        if (res.status === 200) {
            return res.data;
        }
        return [];
    });

    if (apiData.length === 0) {
        return;
    }

    const columns = Object.keys(apiData.users[0]).filter(key => (
        key !== 'created_at' &&
        key !== 'updated_at' &&
        key !== 'id'
    ));
    // add actions to columns
    columns.push('actions');

    // Format rows
    const rows = apiData.users.map(user => {
        return {
            id: user.id, // Include the user's ID
            cells: columns.map(column => {
                if (column === 'roles') {
                    // Map roles to a comma-separated string of role names
                    return user.roles.map(role => role.name).join(', ') || 'N/A';
                } else if (column === 'actions') {
                    // Add action buttons
                    return `
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="editUser('${user.id}')">Edit</button>
                        <button class="btn btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
                    </div>
                    `;
                }
                return user[column] || 'N/A'; // Map each column to its value or 'N/A' if missing
            })
        };
    });

    // Calculate total pages
    const totalPages = Math.ceil(apiData.pagination.total / apiData.pagination.limit);

    // Create templateData
    const templateData = {
        columns: columns.map(column => column.replace(/_/g, ' ').toUpperCase()), // Format column names
        rows: rows,
        currentPage: Math.floor(apiData.pagination.offset / apiData.pagination.limit) + 1,
        totalPages: totalPages,
        paginationid: container + '-pagination',
    };

    // Render the template
    await renderTemplate('../../templates/partials/dashboard/content/get.mustache', container, templateData).then(() => {
        // implement the pagination
        const pagination = document.querySelector(`#${container}-pagination`);
        if (pagination) {
            pagination.innerHTML = ''; // Clear existing pagination
            for (let i = 1; i <= totalPages; i++) {
                const pageLink = document.createElement('a');
                pageLink.href = `#${container}-${i}`;
                pageLink.textContent = i;
                pageLink.classList.add('page-link');
                pageLink.addEventListener('click', async (e) => {
                    e.preventDefault();
                    await renderUsers(container, (i - 1) * apiData.pagination.limit);
                });
                pagination.appendChild(pageLink);
            }
        }

        // id edit user
        window.editUser = (id) => {
            // Check if the edit-user div already exists
            const existingEditUserDiv = document.querySelector('#edit-user');
            if (existingEditUserDiv) {
                // If the existing edit-user div is for the same user, remove it and return
                if (existingEditUserDiv.previousElementSibling?.id === id) {
                    existingEditUserDiv.remove();
                    return;
                }
                // Otherwise, remove the existing edit-user div
                existingEditUserDiv.remove();
            }
        
            let user = apiData.users.find(user => user.id === id);
        
            // Create the edit-user div
            const editUserDiv = document.createElement('div');
            editUserDiv.id = 'edit-user';
            editUserDiv.innerHTML = `
                <form class="edit-content-form">
                    <input type="hidden" name="id" value="${id}">
                    <label for="first_name">First name:</label>
                    <input type="text" name="first_name" value="${user.first_name}" required>
                    <label for="last_name">Last name:</label>
                    <input type="text" name="last_name" value="${user.last_name}" required>
                    <label for="phone_number">Phone number:</label>
                    <input type="text" name="phone_number" value="${user.phone_number}" required>
                    <label for="roles">Roles:</label>
                    <select name="roles" multiple>
                        ${roles.map(role => `<option value="${role.id}" ${user.roles.some(userRole => userRole.id === role.id) ? 'selected' : ''}>${role.name}</option>`).join('')}
                    </select>
                    <button type="submit">Save</button>
                </form>
            `;
        
            // Find the user row with the given ID and insert the edit-user div right after it
            const userRow = document.querySelector(`#${CSS.escape(id)}`);
            if (userRow) {
                userRow.insertAdjacentElement('afterend', editUserDiv);
            }
        
            // Add event listener for the form submission
            const editUserForm = document.querySelector('.edit-content-form');
            editUserForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(editUserForm);
                const data = Object.fromEntries(formData.entries());
                await api.put('users/' + id, data).then((res) => {
                    if (res.status === 200) {
                        console.log('User updated successfully');
                        // Reload the users list
                        renderUsers(container);
                    } else {
                        console.log('Error updating user');
                    }
                }).catch((error) => {
                    console.error(error);
                });
            });
        };

        window.deleteUser = (id) => {
            if (confirm('Are you sure you want to delete this user?')) {
                api.del('users/' + id).then((res) => {
                    if (res.status === 200) {
                        console.log('User deleted successfully');
                        // Reload the users list
                        renderUsers(container);
                    } else {
                        console.log('Error deleting user');
                    }
                }).catch((error) => {
                    console.error(error);
                });
            }
        };
    });
};