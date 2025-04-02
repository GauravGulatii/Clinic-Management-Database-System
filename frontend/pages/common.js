// Logout functionality
document.querySelector('.nav-links li.logout').addEventListener('click', function() {
    if (confirm('Are you sure you want to log out?')) {
        // Clear session data
        sessionStorage.removeItem('currentPatientId');
        
        // Redirect to login page
        window.location.href = '../index.html';
    }
});

// Common functions for all pages

// Get current patient ID from sessionStorage
function getCurrentPatientId() {
    return sessionStorage.getItem('currentPatientId');
}

// Get current patient data
function getCurrentPatient() {
    const currentPatientId = getCurrentPatientId();
    if (!currentPatientId) return null;
    
    const patients = JSON.parse(localStorage.getItem('patients')) || [];
    return patients.find(p => p.id === currentPatientId) || null;
}



// Check if user is logged in, redirect to login if not
function checkLogin() {
    if (!getCurrentPatientId()) {
        window.location.href = '../index.html';
    }
}

// Initialize page
function initPage() {
    checkLogin();
    updateHeader();
}

// Call initPage when DOM is loaded
document.addEventListener('DOMContentLoaded', initPage); 