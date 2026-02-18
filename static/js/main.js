// Inactivity Timer
let inactivityTimer;
const INACTIVITY_TIME = 15000; // 15 seconds

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    
    // Only set timer if not on screensaver or admin page
    if (!window.location.pathname.includes('index.html') && 
        window.location.pathname !== '/' &&
        !window.location.pathname.includes('admin')) {
        inactivityTimer = setTimeout(() => {
            exitToScreensaver();
        }, INACTIVITY_TIME);
    }
}

// Reset timer on user activity
document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('mousedown', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
document.addEventListener('touchstart', resetInactivityTimer);
document.addEventListener('click', resetInactivityTimer);

// Initialize timer on page load
resetInactivityTimer();

// Exit to screensaver function
function exitToScreensaver() {
    window.location.href = '/';   // Flask route
}

// Go back function
function goBack() {
    window.location.href = '/modules';
}

// Dark Mode Toggle (still client-side, OK)
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    const toggle = document.querySelector('.dark-mode-toggle');
    if (toggle) {
        toggle.textContent = isDarkMode ? '☀️' : '🌙';
    }
}

// Load dark mode preference
window.addEventListener('DOMContentLoaded', () => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        const toggle = document.querySelector('.dark-mode-toggle');
        if (toggle) {
            toggle.textContent = '☀️';
        }
    }
});

// ANALYTICS
async function logAnalytics(role, module) {
    const now = new Date();
    const payload = {
        role: role,
        module_first: module,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0]
    };

    await fetch("/api/analytics", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
    });
}
