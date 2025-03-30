function validateForm() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const userType = document.querySelector('input[name="userType"]:checked').value;

    // Basic validation
    if (username.trim() === '' || password.trim() === '') {
        alert('Please fill in all fields');
        return false;
    }

    // Store username in sessionStorage
    sessionStorage.setItem('username', username);
    console.log('Stored username:', username);
    
    // Redirect to dashboard
    window.location.href = 'patient-dashboard.html';
    return false;
} 