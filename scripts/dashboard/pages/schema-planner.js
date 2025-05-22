import { renderTemplate} from '../../utils/rendertemplate.js';
import * as api from '../../utils/api.js';

export const renderSchemaPlanner = async (container, courierid = null) => {
    let couriers = await api.get('couriers/').then(res => res.data);
    let data = await api.get('couriers/schedules/?courier_id=' + (courierid ? courierid : couriers.couriers[1].id)).then(res => res.data);

    let daysOfWeek = generateDaysOfWeek();

    let daysofweekwithschedules = daysOfWeek.map(day => {
        let schedules = data.schedules.filter(schedule => {
            let startDate = new Date(schedule.start_datetime);
            let endDate = new Date(schedule.end_datetime);
            return startDate.toISOString().split('T')[0] === day.date || endDate.toISOString().split('T')[0] === day.date;
        });
        return {
            ...day,
            wekkdayname: new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' }),
            schedules: schedules.map(schedule => ({
                ...schedule,
                start: schedule.start_datetime,
                end: schedule.end_datetime
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
    }).then(async() => {
        const containerDiv = document.getElementById(container);
        const searchInput = containerDiv.querySelector('#search-input');
        const selectInput = containerDiv.querySelector('#custom-select');

        if (searchInput) {
            searchInput.addEventListener('input', async (event) => {
                const value = event.target.value.toLowerCase();
                const filteredUsers = couriers.filter(courier => courier.email.toLowerCase().includes(value));
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
                await renderSchemaPlanner(container, courierid);
            });
        }
    });
};


Date.prototype.getWeek = function() {
  var date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  var week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                        - 3 + (week1.getDay() + 6) % 7) / 7);
}

let generateDaysOfWeek = (week = (new Date()).getWeek(), year = (new Date()).getFullYear()) => {
    // January 4th is always in week 1 (ISO)
    let simple = new Date(Date.UTC(year, 0, 4));
    let dayOfWeek = simple.getUTCDay(); // 0 (Sun) - 6 (Sat)
    // Calculate the Monday of week 1
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
}
