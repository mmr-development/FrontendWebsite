import { renderGet } from "../components/get.js";
import { renderTemplate } from "../../utils/rendertemplate.js";
import * as api from '../../utils/api.js';

let roles = [];

const resetPassword = async (email) => {
    api.post('auth/forgot-password/', { email: email }).then((res) => {
        if (res.status === 200) {
            alert('Password reset link sent to ' + email);
        }
        else {
            console.error('Error sending password reset link');
        }
    }
    ).catch((error) => {
        console.error('Error:', error);
    }
    );
}

window.resetPassword = resetPassword;

export const renderUsers = async (container, offset = 0) => {
    const apiData = await api.get('users/?limit=5&offset=' + offset).then((res) => {
        if (res.status === 200) {
            return res.data;
        }
        return [];
    });

    const roles = await api.get('roles/').then((res) => {
        if (res.status === 200) {
            return res.data.roles || [];
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
                        <button class="btn btn-secondary" onclick="resetPassword('${user.email}')">Reset Password</button>
                    </div>
                    `;
                }
                return user[column] || 'N/A'; // Map each column to its value or 'N/A' if missing
            })
        };
    });

    // Create templateData
    const templateData = {
        data: {
            columns: columns.map(column => column.replace(/_/g, ' ').toUpperCase()), // Format column names
            rows: rows,
        },
        totalItems: apiData.pagination.total,
        itemsPerPage: apiData.pagination.limit,
        currentPage: Math.floor(offset / apiData.pagination.limit) + 1,
        paginationContainer: container + '-pagination',
        search: true,
        select: false,
        pagination: true,
        pageCallback: (selectedValue) => {
            const selectedOffset = (selectedValue - 1) * apiData.pagination.limit;
            renderUserContent(container, selectedOffset);
        }
    };

    // Render the template
    renderGet(container, templateData).then(() => {
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
            let selectedRoles = roles.map(role => {
                return {
                    id: role.id,
                    name: role.name,
                    selected: user.roles.some(userRole => userRole.id === role.id)
                };
            }   )
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
                        ${selectedRoles.map(role => `
                            <option value="${role.id}" ${role.selected ? 'selected' : ''}>${role.name}</option>
                        `).join('')}
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
                await api.patch('users/profile' + id, data);
                let roleIds = Array.from(formData.getAll('roles')).map(roleName => roleName);
                let roleNames = roles.filter(role => roleIds.includes(role.id.toString())).map(role => role.name);
                await api.patch('users/' + user.id + '/roles', {
                    roles: roleNames
                }).then((res) => {
                    if (res.status === 200) {
                        renderUserContent(container);
                    } else {
                        console.error('Error updating user');
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
                        renderUserContent(container);
                    } else {
                        console.error('Error deleting user');
                    }
                }).catch((error) => {
                    console.error(error);
                });
            }
        };
    });

    loadUserForms(container);
};

const renderUserContent = async (container, offset = 0) => {
    await renderUsers(container, offset).then(() => 
        loadUserForms(container)
    );
};


const loadUserForms = async (container) => {
    
    let formdata = {
        action: '',
        method: '',
        fields: [
            {
                id: 'first_name',
                type: 'text',
                label: 'Fornavn',
                placeholder: 'Indtast dit fornavn',
                required: true,
                name: 'first_name',
            },
            {
                id: 'last_name',
                type: 'text',
                label: 'Efternavn',
                placeholder: 'Indtast dit efternavn',
                required: true,
                name: 'last_name',
            },
            {
                id: 'email',
                type: 'email',
                label: 'E-mail',
                placeholder: 'Indtast din e-mail',
                required: true,
                name: 'email',
            },
            {
                id: 'phone_number',
                type: 'tel',
                label: 'Telefonnummer',
                placeholder: 'Indtast dit telefonnummer',
                required: true,
                name: 'phone_number',
            },
        ],
        title: 'Create User',
        description: 'Create a new user by filling out the form below.',
        submitText: 'Create User',
    };
    renderTemplate(
        '../../templates/partials/form.mustache',
        container,
        formdata,
        true
    ).then(() => {
        const form = document.querySelector(`#${container} form`);
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
    
            await api.post('users/', data).then((res) => {
                if (res.status === 201) {
                    renderUsers(container);
                } else {
                    console.error('Error creating user');
                }
            }).catch((error) => {
                console.error(error);
            });
        });
    });
}