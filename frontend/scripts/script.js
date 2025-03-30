function validateForm() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const userType = document.querySelector('input[name="userType"]:checked').value;

    // Basic validation
    if (username.trim() === '' || password.trim() === '') {
        alert('Please fill in all fields');
        return false;
    }

    // Update path to correctly point to patient dashboard in the pages directory
    window.location.href = 'patient-dashboard.html';
    return false;
} 