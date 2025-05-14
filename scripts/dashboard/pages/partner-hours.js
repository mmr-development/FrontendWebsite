import { renderTemplate } from "../../utils/rendertemplate.js";
import * as api from "../../utils/api.js";

export const renderPartnerHours = async (container, partner_id) => {
    const partnerHours = await api.get(`partners/${partner_id}/hours`).then((res) => {
        if (res.status === 200) {
            return res.data;
        } else {
            console.error("Error fetching partner hours:", res);
            return [];
        }
    });

    const columns = Object.keys(partnerHours.hours[0])
        .filter(
            (key) =>
                key !== "id" &&
                key !== "created_at" &&
                key !== "updated_at" &&
                key !== "partner_id"
        );
    columns.push("actions"); // Add actions column

    const rows = partnerHours.hours.map((hour) => {
        return {
            id: hour.id,
            cells: [
                ...columns.slice(0, -1).map((column) => {
                    if (column === "days") {
                        return hour[column].map((day) => day.name).join(", ") || "N/A";
                    }
                    return hour[column] || "N/A";
                }),
                // Actions cell (edit button)
                `<button class="edit-hour-btn" data-hour-id="${hour.id}">Edit</button>`,
            ],
        };
    });
    const data = {
        columns: columns,
        rows: rows,
        pagination: false,
        search: false,
    };

    await renderTemplate(
        "../../templates/partials/dashboard/content/get.mustache",
        container,
        data
    ).then(() => {
        // Add event listeners to edit buttons
        const editButtons = document.querySelectorAll(".edit-hour-btn");
        editButtons.forEach((button) => {
            button.addEventListener("click", async (event) => {
            const hourId = event.target.dataset.hourId;
            const existing = document.querySelector('#hour-edit-form');
            if (existing) {
                if (existing.previousElementSibling?.querySelector('.edit-hour-btn')?.dataset.hourId == hourId) {
                existing.remove();
                return;
                }
                existing.remove();
            }
            const hourData = partnerHours.hours.find((hour) => hour.id == hourId);
            if (hourData) {
                const editDiv = document.createElement('div');
                editDiv.id = 'hour-edit-form';
                editDiv.className = 'edit-content-form';
                editDiv.innerHTML = `
                <form>
                    <label for="start_time_${hourId}">Start Time:</label>
                    <input type="time" id="start_time_${hourId}" name="start_time" value="${hourData.start_time}" required>
                    <label for="end_time_${hourId}">End Time:</label>
                    <input type="time" id="end_time_${hourId}" name="end_time" value="${hourData.end_time}" required>
                    <button type="submit">Save</button>
                </form>
                `;
                // Find the row for this hour
                const row = button.closest('.custom-table-row');
                if (row) {
                row.insertAdjacentElement('afterend', editDiv);
                const editForm = editDiv.querySelector('form');
                editForm.addEventListener("submit", async (e) => {
                    e.preventDefault();
                    const startTime = e.target.start_time.value;
                    const endTime = e.target.end_time.value;
                    await api
                    .put(`partners/${partner_id}/hours/${hourId}`, {
                        start_time: startTime,
                        end_time: endTime,
                    })
                    .then((res) => {
                        if (res.status === 200) {
                        renderPartnerHours(container, partner_id);
                        } else {
                        console.error("Error updating partner hours:", res);
                        }
                    });
                });
                }
            }
            });
        });
    });
}