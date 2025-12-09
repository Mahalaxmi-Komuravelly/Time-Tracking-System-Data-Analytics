import { 
    auth, 
    database,
    signOut,
    onAuthStateChanged,
    ref, 
    push, 
    set, 
    update, 
    remove, 
    onValue 
} from './firebase.js';
import { 
    formatDate, 
    formatDateDisplay,
    calculateTotalMinutes, 
    calculateRemainingMinutes,
    getCategoryEmoji,
    getCategoryColor,
    validateActivity,
    showToast,
    MAX_DAILY_MINUTES
} from './utils.js';

// State
let currentUser = null;
let currentDate = formatDate(new Date());
let activities = {};
let unsubscribe = null;

// DOM Elements
const userNameEl = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');
const dateInput = document.getElementById('activity-date');
const dateDisplay = document.getElementById('selected-date-display');
const activityForm = document.getElementById('activity-form');
const activitiesList = document.getElementById('activities-list');
const totalMinutesEl = document.getElementById('total-minutes');
const remainingMinutesEl = document.getElementById('remaining-minutes');
const activityCountEl = document.getElementById('activity-count');
const progressFill = document.getElementById('progress-fill');
const budgetMessage = document.getElementById('budget-message');
const analyseBtn = document.getElementById('analyse-btn');
const submitBtn = document.getElementById('submit-btn');

// Modal Elements
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const modalClose = document.getElementById('modal-close');
const cancelEdit = document.getElementById('cancel-edit');

// --------------------------------------------
// AUTH STATE CHECK
// --------------------------------------------
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.replace('index.html'); // redirect if not logged in
    } else {
        currentUser = user;
        userNameEl.textContent = user.displayName || user.email.split('@')[0];
        initializePage();
    }
});

// --------------------------------------------
// INITIALIZATION
// --------------------------------------------
function initializePage() {
    // Set date picker to today
    dateInput.value = currentDate;
    dateInput.max = formatDate(new Date());
    updateDateDisplay();
    subscribeToActivities();
}

// Update date display
function updateDateDisplay() {
    dateDisplay.textContent = formatDateDisplay(currentDate);
}

// --------------------------------------------
// REAL-TIME ACTIVITIES
// --------------------------------------------
function subscribeToActivities() {
    if (unsubscribe) unsubscribe(); // remove previous listener

    const activitiesRef = ref(database, `users/${currentUser.uid}/days/${currentDate}/activities`);

    unsubscribe = onValue(activitiesRef, (snapshot) => {
        activities = snapshot.val() || {};

        // Update total minutes in DB
        const total = calculateTotalMinutes(activities);
        const dayRef = ref(database, `users/${currentUser.uid}/days/${currentDate}`);
        update(dayRef, { totalMinutes: total });

        renderActivities();
        updateStats();
    });
}

// --------------------------------------------
// RENDER ACTIVITIES
// --------------------------------------------
function renderActivities() {
    const activityIds = Object.keys(activities);

    if (activityIds.length === 0) {
        activitiesList.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📝</span>
                <p>No activities logged yet</p>
                <span class="empty-hint">Add your first activity to get started!</span>
            </div>
        `;
        return;
    }

    activitiesList.innerHTML = activityIds.map(id => {
        const activity = activities[id];
        const emoji = getCategoryEmoji(activity.category);
        const color = getCategoryColor(activity.category);

        return `
            <div class="activity-item" style="--category-color: ${color}">
                <div class="activity-info">
                    <span class="activity-emoji">${emoji}</span>
                    <div class="activity-details">
                        <span class="activity-name">${escapeHtml(activity.name)}</span>
                        <span class="activity-category">${activity.category}</span>
                    </div>
                </div>
                <div class="activity-meta">
                    <span class="activity-duration">${activity.minutes} min</span>
                    <div class="activity-actions">
                        <button class="btn-icon edit-btn" data-id="${id}" title="Edit">✏️</button>
                        <button class="btn-icon delete-btn" data-id="${id}" title="Delete">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Attach buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.dataset.id));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteActivity(btn.dataset.id));
    });
}

// --------------------------------------------
// UPDATE STATS
// --------------------------------------------
function updateStats() {
    const total = calculateTotalMinutes(activities);
    const remaining = calculateRemainingMinutes(activities);
    const count = Object.keys(activities).length;
    const percentage = (total / MAX_DAILY_MINUTES) * 100;

    totalMinutesEl.textContent = total;
    remainingMinutesEl.textContent = remaining;
    activityCountEl.textContent = count;
    progressFill.style.width = `${percentage}%`;

    if (percentage >= 100) progressFill.style.background = 'linear-gradient(90deg, #10B981, #059669)';
    else if (percentage >= 75) progressFill.style.background = 'linear-gradient(90deg, #3B82F6, #2563EB)';
    else progressFill.style.background = 'linear-gradient(90deg, var(--primary), var(--primary-dark))';

    budgetMessage.textContent = remaining === 0 
        ? "🎉 You've logged a full day!" 
        : `You have ${remaining} minutes left for this day`;
    budgetMessage.className = remaining === 0 ? 'budget-message success' : 'budget-message';

    analyseBtn.disabled = total < 1;
    submitBtn.disabled = remaining <= 0;
}

// --------------------------------------------
// ADD ACTIVITY
// --------------------------------------------
activityForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('activity-name').value.trim();
    const category = document.getElementById('activity-category').value;
    const minutes = parseInt(document.getElementById('activity-minutes').value);
    const remaining = calculateRemainingMinutes(activities);

    const validation = validateActivity(name, category, minutes, remaining);
    if (!validation.valid) {
        showToast(validation.message, 'error');
        return;
    }

    try {
        const activitiesRef = ref(database, `users/${currentUser.uid}/days/${currentDate}/activities`);
        const newActivityRef = push(activitiesRef);

        await set(newActivityRef, {
            name,
            category,
            minutes,
            createdAt: Date.now()
        });

        activityForm.reset();
        showToast('Activity added successfully!', 'success');
    } catch (error) {
        console.error(error);
        showToast('Failed to add activity', 'error');
    }
});

// --------------------------------------------
// DELETE ACTIVITY
// --------------------------------------------
async function deleteActivity(activityId) {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    try {
        const activityRef = ref(database, `users/${currentUser.uid}/days/${currentDate}/activities/${activityId}`);
        await remove(activityRef);
        showToast('Activity deleted', 'success');
    } catch (error) {
        console.error(error);
        showToast('Failed to delete activity', 'error');
    }
}

// --------------------------------------------
// EDIT ACTIVITY
// --------------------------------------------
function openEditModal(activityId) {
    const activity = activities[activityId];
    if (!activity) return;

    document.getElementById('edit-activity-id').value = activityId;
    document.getElementById('edit-name').value = activity.name;
    document.getElementById('edit-category').value = activity.category;
    document.getElementById('edit-minutes').value = activity.minutes;

    editModal.classList.add('show');
}

function closeEditModal() {
    editModal.classList.remove('show');
    editForm.reset();
}

modalClose.addEventListener('click', closeEditModal);
cancelEdit.addEventListener('click', closeEditModal);
editModal.addEventListener('click', (e) => { if (e.target === editModal) closeEditModal(); });

editForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const activityId = document.getElementById('edit-activity-id').value;
    const name = document.getElementById('edit-name').value.trim();
    const category = document.getElementById('edit-category').value;
    const minutes = parseInt(document.getElementById('edit-minutes').value);
    const oldMinutes = activities[activityId]?.minutes || 0;
    const remaining = calculateRemainingMinutes(activities) + oldMinutes;

    const validation = validateActivity(name, category, minutes, remaining);
    if (!validation.valid) {
        showToast(validation.message, 'error');
        return;
    }

    try {
        const activityRef = ref(database, `users/${currentUser.uid}/days/${currentDate}/activities/${activityId}`);
        await update(activityRef, { name, category, minutes, updatedAt: Date.now() });
        closeEditModal();
        showToast('Activity updated!', 'success');
    } catch (error) {
        console.error(error);
        showToast('Failed to update activity', 'error');
    }
});

// --------------------------------------------
// DATE CHANGE
// --------------------------------------------
dateInput.addEventListener('change', (e) => {
    currentDate = e.target.value;
    updateDateDisplay();
    subscribeToActivities();
});

// --------------------------------------------
// ANALYSE BUTTON
// --------------------------------------------
analyseBtn.addEventListener('click', () => {
    window.location.href = `dashboard.html?date=${currentDate}`;
});

// --------------------------------------------
// LOGOUT
// --------------------------------------------
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error(error);
        showToast('Failed to sign out', 'error');
    }
});

// --------------------------------------------
// UTILITY
// --------------------------------------------
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
