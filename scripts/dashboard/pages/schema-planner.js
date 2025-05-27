import { renderTemplate } from '../../utils/rendertemplate.js';
import * as api from '../../utils/api.js';
import { renderModal } from '../../utils/modal.js';

export const renderSchemaPlanner = async (container, courierid = null, week = (new Date()).getWeek(), year = (new Date()).getFullYear()) => {
    let couriers = await api.get('couriers/').then(res => res.data);
    let data = await api.get('couriers/schedules/?courier_id=' + (courierid ? courierid : couriers.couriers[0].id)).then(res => res.data);

    let daysOfWeek = generateDaysOfWeek(week, year);

    let daysofweekwithschedules = daysOfWeek.map(day => {
        let schedules = data.schedules.filter(schedule => {
            let startDate = new Date(schedule.start_datetime);
            let endDate = new Date(schedule.end_datetime);
            return startDate.toISOString().split('T')[0] === day.date || endDate.toISOString().split('T')[0] === day.date;
        });
        return {
            ...day,
            weekdayname: new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' }),
            schedules: schedules.map(schedule => ({
                ...schedule,
                start: schedule.start_datetime,
                start_human: new Date(schedule.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                end: schedule.end_datetime,
                end_human: new Date(schedule.end_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }))
        };
    });

    await renderTemplate('templates/partials/dashboard/pages/schema-planner.mustache', container, {
        search: true,
        searchPlaceholder: 'Search users',
        select: true,
        options: couriers.couriers.map(courier => ({
            value: courier.id,
            label: courier.email,
            selected: courier.id === courierid,
        })),
        data: {
            days: daysofweekwithschedules,
        },
    }).then(async () => {
        const containerDiv = document.getElementById(container);
        const searchInput = containerDiv.querySelector('#search-input');
        const selectInput = containerDiv.querySelector('#custom-select');
        const createScheduleButton = containerDiv.querySelector('#create-schedule');

        if (searchInput) {
            searchInput.addEventListener('input', async (event) => {
                const value = event.target.value.toLowerCase();
                const filteredUsers = couriers.couriers.filter(courier => courier.email.toLowerCase().includes(value));
                selectInput.innerHTML = '';
                filteredUsers.forEach(courier => {
                    const option = document.createElement('option');
                    option.value = courier.id;
                    option.textContent = courier.email;
                    selectInput.appendChild(option);
                });
            });
        }

        if (selectInput) {
            selectInput.addEventListener('change', async (event) => {
                const selectedUserId = event.target.value;
                courierid = parseInt(selectedUserId);
                await renderSchemaPlanner(container, courierid, week, year);
            });
        }

        if (createScheduleButton) {
            createScheduleButton.addEventListener('click', async () => {
                const selectedUserId = selectInput.value;
                if (!selectedUserId) {
                    alert('Please select a courier first.');
                    return;
                }
                await renderModal({
                    title: 'Create Schedule',
                    content: `
                        <form id="schedule-form">
                            <div>
                                <label for="schedule-date">Date:</label>
                                <input type="date" id="schedule-date" name="date" required>
                            </div>
                            <div>
                                <label for="start-time">Start Time:</label>
                                <input type="time" id="start-time" name="start_time" required>
                            </div>
                            <div>
                                <label for="end-time">End Time:</label>
                                <input type="time" id="end-time" name="end_time" required>
                            </div>
                            <div>
                                <label for="type">Type:</label>
                                <input type="text" id="type" name="type" value="normal">
                            </div>
                        </form>
                        <div id="schedule-form-error" style="color:red;display:none;"></div>
                    `,
                    close: "Close",
                    submit: "Submit",
                    submitCallback: () => {
                        const form = document.querySelector('#schedule-form');
                        const date = form.querySelector('#schedule-date').value;
                        const startTime = form.querySelector('#start-time').value;
                        const endTime = form.querySelector('#end-time').value;
                        const type = form.querySelector('#type').value;

                        if (!date || !startTime || !endTime) {
                            const errorDiv = document.querySelector('#schedule-form-error');
                            errorDiv.textContent = 'Please fill in all fields.';
                            errorDiv.style.display = 'block';
                            return false;
                        }
                        const startDateTime = new Date(`${date}T${startTime}:00`);
                        const endDateTime = new Date(`${date}T${endTime}:00`);
                        if (startDateTime >= endDateTime) {
                            const errorDiv = document.querySelector('#schedule-form-error');
                            errorDiv.textContent = 'End time must be after start time.';
                            errorDiv.style.display = 'block';
                            return false;
                        }
                        function toDanishISOString(date) {
                            const newDate = new Date(date.getTime() + 2 * 60 * 60 * 1000);
                            return newDate.toISOString().replace('Z', '+02:00');
                        }

                        const scheduleData = {
                            courier_id: selectedUserId,
                            start_datetime: toDanishISOString(startDateTime),
                            end_datetime: toDanishISOString(endDateTime),
                            status: 'scheduled',
                            notes: type
                        };
                        api.post('couriers/schedules/', scheduleData)
                            .then(res => {
                                if (res.status === 201) {
                                    renderSchemaPlanner(container, courierid, week, year);
                                } else {
                                    alert('Error creating schedule. Please try again.');
                                }
                            })
                            .catch(() => {
                                alert('Error creating schedule. Please try again.');
                            });
                    }
                });
            });
        }
        let previousWeekButton = containerDiv.querySelector('#previous-week');
        let nextWeekButton = containerDiv.querySelector('#next-week');

        if (previousWeekButton) {
            previousWeekButton.addEventListener('click', async () => {
                let newWeek = week - 1;
                let newYear = year;
                if (newWeek < 1) {
                    newWeek = 52;
                    newYear -= 1;
                }
                await renderSchemaPlanner(container, courierid, newWeek, newYear);
            });
        }

        if (nextWeekButton) {
            nextWeekButton.addEventListener('click', async () => {
                let newWeek = week + 1;
                let newYear = year;
                if (newWeek > 52) {
                    newWeek = 1;
                    newYear += 1;
                }
                await renderSchemaPlanner(container, courierid, newWeek, newYear);
            });
        }
    });
};

// --- Helper functions ---
Date.prototype.getWeek = function () {
    var date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    var week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
        - 3 + (week1.getDay() + 6) % 7) / 7);
};

let generateDaysOfWeek = (week = (new Date()).getWeek(), year = (new Date()).getFullYear()) => {
    let simple = new Date(Date.UTC(year, 0, 4));
    let dayOfWeek = simple.getUTCDay();
    let ISOweekStart = new Date(simple);
    ISOweekStart.setUTCDate(simple.getUTCDate() - ((dayOfWeek + 6) % 7) + (week - 1) * 7);

    let days = [];
    for (let i = 0; i < 7; i++) {
        let date = new Date(ISOweekStart);
        date.setUTCDate(ISOweekStart.getUTCDate() + i);
        days.push({
            date: date.toISOString().split('T')[0],
            schedules: []
        });
    }
    return days;
};