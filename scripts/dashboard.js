import { 
    auth, 
    database,
    signOut,
    onAuthStateChanged,
    ref, 
    onValue 
} from './firebase.js';
import { 
    formatDate, 
    formatDateDisplay,
    calculateTotalMinutes,
    groupByCategory,
    minutesToHoursString,
    getCategoryEmoji,
    getCategoryColor,
    showToast,
    MAX_DAILY_MINUTES
} from './utils.js';

// State
let currentUser = null;
let currentDate = null;
let activities = {};
let pieChart = null;
let barChart = null;

// DOM Elements
const userNameEl = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');
const dateInput = document.getElementById('dashboard-date');
const noDataState = document.getElementById('no-data-state');
const dataDashboard = document.getElementById('data-dashboard');

// Stat Elements
const statTotalTime = document.getElementById('stat-total-time');
const statActivities = document.getElementById('stat-activities');
const statTopCategory = document.getElementById('stat-top-category');
const statProductivity = document.getElementById('stat-productivity');

// Auth State Check
// onAuthStateChanged(auth, (user) => {
//     if (user) {
//         currentUser = user;
//         userNameEl.textContent = user.displayName || user.email.split('@')[0];
//         initializePage();
//     } else {
//         window.location.href = 'index.html';
//     }
// });

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'index.html';
    } else {
        currentUser = user;
        userNameEl.textContent = user.displayName || user.email.split('@')[0];
        initializePage();
    }
});


// Initialize
function initializePage() {
    // Check for date in URL
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get('date');
    
    if (dateParam && isValidDate(dateParam)) {
        currentDate = dateParam;
    } else {
        currentDate = formatDate(new Date());
    }
    
    dateInput.value = currentDate;
    dateInput.max = formatDate(new Date());
    
    loadDashboardData();
}

// Validate date format
function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

// Load dashboard data
function loadDashboardData() {
    const activitiesRef = ref(database, `users/${currentUser.uid}/days/${currentDate}/activities`);
    
    onValue(activitiesRef, (snapshot) => {
        activities = snapshot.val() || {};
        
        if (Object.keys(activities).length === 0) {
            showNoDataState();
        } else {
            showDashboard();
        }
    });
}

// Show no data state
function showNoDataState() {
    noDataState.classList.remove('hidden');
    dataDashboard.classList.add('hidden');
}

// Show dashboard with data
function showDashboard() {
    noDataState.classList.add('hidden');
    dataDashboard.classList.remove('hidden');
    
    updateStats();
    renderCharts();
    renderCategoryBreakdown();
    renderTimeline();
}

// Update stats
function updateStats() {
    const total = calculateTotalMinutes(activities);
    const count = Object.keys(activities).length;
    const grouped = groupByCategory(activities);
    const percentage = Math.round((total / MAX_DAILY_MINUTES) * 100);
    
    // Find top category
    let topCategory = '-';
    let maxMinutes = 0;
    Object.entries(grouped).forEach(([category, data]) => {
        if (data.minutes > maxMinutes) {
            maxMinutes = data.minutes;
            topCategory = category;
        }
    });
    
    statTotalTime.textContent = minutesToHoursString(total);
    statActivities.textContent = count;
    statTopCategory.textContent = `${getCategoryEmoji(topCategory)} ${topCategory}`;
    statProductivity.textContent = `${percentage}%`;
}

// Render charts
function renderCharts() {
    const grouped = groupByCategory(activities);
    const categories = Object.keys(grouped);
    const minutes = categories.map(cat => grouped[cat].minutes);
    const colors = categories.map(cat => getCategoryColor(cat));
    
    // Destroy existing charts
    if (pieChart) pieChart.destroy();
    if (barChart) barChart.destroy();
    
    // Pie Chart
    const pieCtx = document.getElementById('pie-chart').getContext('2d');
    pieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: {
            labels: categories.map(cat => `${getCategoryEmoji(cat)} ${cat}`),
            datasets: [{
                data: minutes,
                backgroundColor: colors,
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: { size: 12 }
                    }
                }
            },
            cutout: '60%'
        }
    });
    
    // Bar Chart - Individual activities
    const activityList = Object.values(activities);
    const barCtx = document.getElementById('bar-chart').getContext('2d');
    barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: activityList.map(a => a.name.length > 15 ? a.name.substring(0, 15) + '...' : a.name),
            datasets: [{
                label: 'Minutes',
                data: activityList.map(a => a.minutes),
                backgroundColor: activityList.map(a => getCategoryColor(a.category)),
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

// Render category breakdown
function renderCategoryBreakdown() {
    const grouped = groupByCategory(activities);
    const total = calculateTotalMinutes(activities);
    const container = document.getElementById('category-breakdown');
    
    const sortedCategories = Object.entries(grouped)
        .sort((a, b) => b[1].minutes - a[1].minutes);
    
    container.innerHTML = sortedCategories.map(([category, data]) => {
        const percentage = Math.round((data.minutes / total) * 100);
        const color = getCategoryColor(category);
        
        return `
            <div class="category-item">
                <div class="category-header">
                    <span class="category-name">
                        ${getCategoryEmoji(category)} ${category}
                    </span>
                    <span class="category-stats">
                        ${data.count} activities • ${minutesToHoursString(data.minutes)}
                    </span>
                </div>
                <div class="category-bar">
                    <div class="category-fill" style="width: ${percentage}%; background: ${color}"></div>
                </div>
                <span class="category-percentage">${percentage}%</span>
            </div>
        `;
    }).join('');
}

// Render timeline
function renderTimeline() {
    const container = document.getElementById('activity-timeline');
    const activityList = Object.values(activities)
        .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    
    container.innerHTML = activityList.map((activity, index) => {
        const color = getCategoryColor(activity.category);
        
        return `
            <div class="timeline-item">
                <div class="timeline-marker" style="background: ${color}"></div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <span class="timeline-emoji">${getCategoryEmoji(activity.category)}</span>
                        <span class="timeline-name">${escapeHtml(activity.name)}</span>
                    </div>
                    <div class="timeline-meta">
                        <span class="timeline-category">${activity.category}</span>
                        <span class="timeline-duration">${activity.minutes} min</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Date change handler
dateInput.addEventListener('change', (e) => {
    currentDate = e.target.value;
    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('date', currentDate);
    window.history.pushState({}, '', url);
    
    loadDashboardData();
});

// Logout
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error signing out:', error);
        showToast('Failed to sign out', 'error');
    }
});

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
