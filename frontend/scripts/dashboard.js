// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard script loaded');
    
    // Get username from sessionStorage
    const username = sessionStorage.getItem('username');
    console.log('Retrieved username from session:', username);
    
    // Get the elements to update
    const usernameDisplay = document.getElementById('username-display');
    const profileName = document.getElementById('profile-name');
    
    if (usernameDisplay && username) {
        console.log('Updating username display with:', username);
        usernameDisplay.textContent = username;
        
        if (profileName) {
            profileName.textContent = username;
        }
    } else {
        console.error('Could not update username display:', {
            usernameDisplayExists: !!usernameDisplay,
            usernameExists: !!username
        });
    }
});

// Add this to verify the script is running
console.log('Dashboard script loaded'); 