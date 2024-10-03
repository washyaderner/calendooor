// script.js

document.addEventListener('DOMContentLoaded', function () {
    const calendarContainer = document.getElementById('calendar');
    const setReminderBtn = document.getElementById('set-reminder-btn');
    const reminderTimeDropdown = document.getElementById('reminder-time');
    const repeatIntervalSelect = document.getElementById('repeat-interval');
    const currentDateTimeHeader = document.getElementById('current-date-time');

    // Sidebar Elements
    const reminderList = document.getElementById('reminder-list');
    const reminderDetails = document.getElementById('reminder-details');
    const editReminderDate = document.getElementById('edit-reminder-date');
    const editReminderTime = document.getElementById('edit-reminder-time');
    const updateReminderBtn = document.getElementById('update-reminder-btn');
    const deleteReminderBtn = document.getElementById('delete-reminder-btn');

    // Month Navigation Elements
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const currentMonthDisplay = document.getElementById('current-month');

    let selectedDate = null; // Placeholder to keep track of the selected date
    let reminders = []; // Array to store reminders
    let currentEditingReminder = null; // To track the reminder being edited

    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth(); // 0-11

    // Function to get today's date and time with seconds
    function getTodayDateTime() {
        const now = new Date();
        const options = { month: '2-digit', day: '2-digit', year: 'numeric' };
        const date = now.toLocaleDateString('en-US', options); // Format: MM/DD/YYYY
        const time = formatTimeTo12HourWithSeconds(now.getHours(), now.getMinutes(), now.getSeconds()); // HH:MM:SS AM/PM
        return { date, time };
    }

    // Function to format time to 12-hour format with seconds and AM/PM
    function formatTimeTo12HourWithSeconds(hour, minute, second) {
        const period = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12; // Convert hour to 12-hour format
        hour = hour.toString().padStart(2, '0'); // Pad hour with leading zero
        minute = minute.toString().padStart(2, '0');
        second = second.toString().padStart(2, '0');
        return `${hour}:${minute}:${second} ${period}`;
    }

    // Function to format time to 12-hour format without seconds
    function formatTimeTo12Hour(hour, minute) {
        const period = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
        hour = hour.toString().padStart(2, '0');
        minute = minute.toString().padStart(2, '0');
        return `${hour}:${minute} ${period}`;
    }

    // Display and update today's date and time at the top of the page
    function showCurrentDateTime() {
        const updateTime = () => {
            const { date, time } = getTodayDateTime();
            currentDateTimeHeader.textContent = `Today: ${date}, ${time}`;
        };

        updateTime(); // Initial call to set time
        setInterval(updateTime, 1000); // Update time every second
    }

    // Create a dynamic calendar for the current month
    function createCalendar() {
        calendarContainer.innerHTML = ''; // Clear existing calendar content

        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        daysOfWeek.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = day;
            calendarContainer.appendChild(dayHeader);
        });

        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const startingDay = firstDayOfMonth.getDay();

        // Update the current month display
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        currentMonthDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;

        // Fill empty cells before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            calendarContainer.appendChild(emptyCell);
        }

        // Fill the days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            dayElement.dataset.date = `${currentMonth + 1}/${day}/${currentYear}`; // MM/DD/YYYY format

            // Highlight today's date if it matches
            const today = new Date();
            if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                dayElement.classList.add('selected');
                selectedDate = dayElement.dataset.date; // Set the selected date to today
                populateTimeDropdown(selectedDate);
            }

            // Click event to select a date
            dayElement.addEventListener('click', () => {
                // Remove highlight from previous selection
                document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));
                
                dayElement.classList.add('selected');
                selectedDate = dayElement.dataset.date; // Set the selected date
                populateTimeDropdown(selectedDate);
            });

            calendarContainer.appendChild(dayElement);
        }
    }

    // Event listeners for month navigation buttons
    prevMonthBtn.addEventListener('click', () => {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear -= 1;
        } else {
            currentMonth -= 1;
        }
        createCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear += 1;
        } else {
            currentMonth += 1;
        }
        createCalendar();
    });

    // Populate the time dropdown based on the selected date
    function populateTimeDropdown(date) {
        reminderTimeDropdown.innerHTML = ''; // Clear existing options

        const now = new Date();
        let startHour = 5, startMinute = 0; // Default starting time is 5:00 AM

        const selectedDateObj = new Date(date);

        // If the selected date is today, adjust startHour and startMinute
        if (selectedDateObj.toDateString() === now.toDateString()) {
            startHour = now.getHours();
            startMinute = now.getMinutes();

            // Round up to the next 15-minute interval
            startMinute = Math.ceil(startMinute / 15) * 15;
            if (startMinute === 60) {
                startHour += 1;
                startMinute = 0;
            }
        }

        // Populate time dropdown with 15-minute intervals
        for (let hour = startHour; hour < 24; hour++) {
            for (let minute = (hour === startHour ? startMinute : 0); minute < 60; minute += 15) {
                const timeString = formatTimeTo12Hour(hour, minute); // Format time to HH:MM AM/PM
                const option = document.createElement('option');
                option.value = timeString;
                option.textContent = timeString;
                reminderTimeDropdown.appendChild(option);
            }
        }
    }

    // Function to add a reminder to the list and to the reminders array
    function addReminder(date, time, repeatInterval) {
        const reminder = {
            id: Date.now(), // Unique ID
            date: date,
            time: time,
            repeat: repeatInterval,
            notified: false // Flag to check if notification has been sent
        };
        reminders.push(reminder);
        saveReminders();
        renderReminders();
    }

    // Function to render reminders in the sidebar
    function renderReminders() {
        reminderList.innerHTML = '';
        reminders.forEach(reminder => {
            const listItem = document.createElement('li');
            listItem.textContent = `${reminder.date} at ${reminder.time} - Repeat: ${reminder.repeat}`;
            listItem.dataset.id = reminder.id;

            // Click event to edit the reminder
            listItem.addEventListener('click', () => {
                currentEditingReminder = reminder;
                showReminderDetails(reminder);
            });

            reminderList.appendChild(listItem);
        });
    }

    // Function to show details of the selected reminder in the detailed view
    function showReminderDetails(reminder) {
        reminderDetails.classList.remove('hidden');
        editReminderDate.value = formatDateForInput(reminder.date); // Convert MM/DD/YYYY to YYYY-MM-DD
        editReminderTime.value = convertTimeTo24Hour(reminder.time); // Convert time to 24-hour format
    }

    // Function to update a reminder
    function updateReminder() {
        if (currentEditingReminder) {
            const newDate = editReminderDate.value; // YYYY-MM-DD
            const newTime = formatTimeTo12Hour(...convertTimeFromInput(editReminderTime.value)); // HH:MM AM/PM
            const formattedDate = formatDateFromInput(newDate); // MM/DD/YYYY

            currentEditingReminder.date = formattedDate;
            currentEditingReminder.time = newTime;
            currentEditingReminder.notified = false; // Reset notification flag

            saveReminders();
            renderReminders();
            alert(`Reminder updated to ${formattedDate} at ${newTime}`);
            reminderDetails.classList.add('hidden');
        }
    }

    // Function to delete a reminder
    function deleteReminder() {
        if (currentEditingReminder) {
            // Remove the reminder from the array
            reminders = reminders.filter(reminder => reminder.id !== currentEditingReminder.id);
            saveReminders();
            renderReminders();
            alert('Reminder deleted.');
            reminderDetails.classList.add('hidden'); // Hide the edit reminder window
            currentEditingReminder = null;
        }
    }

    // Helper function to format date from MM/DD/YYYY to YYYY-MM-DD
    function formatDateForInput(date) {
        const [month, day, year] = date.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Helper function to format date from YYYY-MM-DD to MM/DD/YYYY
    function formatDateFromInput(date) {
        const [year, month, day] = date.split('-');
        return `${month}/${day}/${year}`;
    }

    // Convert time from 12-hour format to 24-hour format
    function convertTimeTo24Hour(time12Hour) {
        const [time, period] = time12Hour.split(' ');
        let [hour, minute] = time.split(':').map(Number);
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        hour = hour.toString().padStart(2, '0');
        minute = minute.toString().padStart(2, '0');
        return `${hour}:${minute}`;
    }

    // Convert time from 24-hour format to [hour, minute]
    function convertTimeFromInput(time24Hour) {
        let [hour, minute] = time24Hour.split(':').map(Number);
        return [hour, minute];
    }

    // Function to check for due reminders every second
    function checkReminders() {
        const now = new Date();
        const nowDateStr = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        const nowTimeStr = formatTimeTo12Hour(now.getHours(), now.getMinutes());

        reminders.forEach(reminder => {
            if (!reminder.notified && reminder.date === nowDateStr && reminder.time === nowTimeStr) {
                // Play the alarm sound (if implemented)
                // alarmSound.play().catch(error => console.error('Error playing the alarm sound:', error));

                // Trigger alert
                alert(`Reminder: It's time for your reminder set on ${reminder.date} at ${reminder.time}.`);
                reminder.notified = true;

                // Handle repeating reminders
                if (reminder.repeat !== 'none') {
                    scheduleNextReminder(reminder);
                }
            }
        });

        saveReminders();
    }

    // Function to schedule the next occurrence of a repeating reminder
    function scheduleNextReminder(reminder) {
        let reminderDateTime = new Date(`${formatDateForSorting(reminder.date)}T${convertTimeTo24Hour(reminder.time)}:00`);

        switch (reminder.repeat) {
            case '15':
                reminderDateTime.setMinutes(reminderDateTime.getMinutes() + 15);
                break;
            case '30':
                reminderDateTime.setMinutes(reminderDateTime.getMinutes() + 30);
                break;
            case '60':
                reminderDateTime.setHours(reminderDateTime.getHours() + 1);
                break;
            case 'daily':
                reminderDateTime.setDate(reminderDateTime.getDate() + 1);
                break;
            case 'weekly':
                reminderDateTime.setDate(reminderDateTime.getDate() + 7);
                break;
            default:
                break;
        }

        reminder.date = reminderDateTime.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        reminder.time = formatTimeTo12Hour(reminderDateTime.getHours(), reminderDateTime.getMinutes());
        reminder.notified = false;
    }

    // Helper function to format date for sorting (convert MM/DD/YYYY to YYYY-MM-DD)
    function formatDateForSorting(date) {
        const [month, day, year] = date.split('/');
        return `${year}-${month}-${day}`;
    }

    // Function to save reminders to localStorage
    function saveReminders() {
        localStorage.setItem('reminders', JSON.stringify(reminders));
    }

    // Function to load reminders from localStorage
    function loadReminders() {
        const storedReminders = localStorage.getItem('reminders');
        if (storedReminders) {
            reminders = JSON.parse(storedReminders);
            renderReminders();
        }
    }

    // Initialize the app
    function init() {
        // Show today's date and time
        showCurrentDateTime();

        // Create the calendar
        createCalendar();

        // Load reminders from localStorage
        loadReminders();

        // Start checking for due reminders every second
        setInterval(checkReminders, 1000); // Check every second

        // Event listener for setting reminders
        setReminderBtn.addEventListener('click', () => {
            const selectedTime = reminderTimeDropdown.value;
            const repeatInterval = repeatIntervalSelect.value;

            if (selectedDate && selectedTime) {
                addReminder(selectedDate, selectedTime, repeatInterval);
                alert(`Reminder set for ${selectedDate} at ${selectedTime}`);
            } else {
                alert('Please select a date and time for the reminder.');
            }
        });

        // Event listener for updating reminders
        updateReminderBtn.addEventListener('click', updateReminder);

        // Event listener for deleting reminders
        deleteReminderBtn.addEventListener('click', deleteReminder);
    }

    // Run the app
    init();
});
