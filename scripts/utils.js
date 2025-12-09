// Utility Functions

export const MAX_DAILY_MINUTES = 1440;

/**
 * Calculate total minutes from activities
 */
export function calculateTotalMinutes(activities) {
    if (!activities) return 0;
    return Object.values(activities).reduce((sum, act) => sum + (act.minutes || 0), 0);
}

/**
 * Calculate remaining minutes for the day
 */
export function calculateRemainingMinutes(activities) {
    return MAX_DAILY_MINUTES - calculateTotalMinutes(activities);
}

/**
 * Group activities by category
 */
export function groupByCategory(activities) {
    if (!activities) return {};
    
    const grouped = {};
    Object.values(activities).forEach(activity => {
        const category = activity.category || 'Other';
        if (!grouped[category]) {
            grouped[category] = { minutes: 0, count: 0 };
        }
        grouped[category].minutes += activity.minutes || 0;
        grouped[category].count += 1;
    });
    return grouped;
}

/**
 * Convert minutes to hours and minutes string
 */
export function minutesToHoursString(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDate(date) {
    return date.toISOString().split('T')[0];
}

/**
 * Format date for display
 */
export function formatDateDisplay(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

/**
 * Get category emoji
 */
export function getCategoryEmoji(category) {
    const emojis = {
        'Work': '💼',
        'Study': '📚',
        'Sleep': '😴',
        'Exercise': '🏃',
        'Entertainment': '🎮',
        'Meal': '🍽️',
        'Travel': '🚗',
        'Self-care': '🧘',
        'Social': '👥',
        'Other': '📌'
    };
    return emojis[category] || '📌';
}

/**
 * Get category color
 */
export function getCategoryColor(category) {
    const colors = {
        'Work': '#3B82F6',
        'Study': '#8B5CF6',
        'Sleep': '#6366F1',
        'Exercise': '#10B981',
        'Entertainment': '#F59E0B',
        'Meal': '#EF4444',
        'Travel': '#06B6D4',
        'Self-care': '#EC4899',
        'Social': '#F97316',
        'Other': '#6B7280'
    };
    return colors[category] || '#6B7280';
}

/**
 * Show toast notification
 */
export function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Validate activity input
 */
export function validateActivity(name, category, minutes, remainingMinutes) {
    if (!name || name.trim().length === 0) {
        return { valid: false, message: 'Please enter an activity name' };
    }
    if (!category) {
        return { valid: false, message: 'Please select a category' };
    }
    if (!minutes || minutes < 1) {
        return { valid: false, message: 'Duration must be at least 1 minute' };
    }
    if (minutes > remainingMinutes) {
        return { valid: false, message: `Only ${remainingMinutes} minutes remaining for this day` };
    }
    return { valid: true };
}
