# Clinic Management System - README

## Overview
This is a patient portal for a clinic management system that allows patients to manage their appointments, view medical records, prescriptions, and billing information.

## How to Launch the Website

### Method 1: Using a Local Web Server

1. Install a local web server (if you don't have one already):
   - For a simple option, install Node.js (https://nodejs.org/) and then install the http-server package:
     npm install -g http-server

2. Navigate to the project directory in your terminal/command prompt:
   cd path/to/clinic-management-system

3. Start the server:
   http-server

4. Open your browser and go to:
   http://localhost:8080/frontend/index.html

### Method 2: Using Visual Studio Code Live Server

1. Install Visual Studio Code if you don't have it already: https://code.visualstudio.com/

2. Install the Live Server extension:
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "Live Server"
   - Install the extension by Ritwick Dey

3. Open the project folder in VS Code

4. Right-click on frontend/index.html and select "Open with Live Server"

### Method 3: Directly Opening the HTML File

1. Navigate to the project directory in your file explorer

2. Open the frontend/index.html file with your preferred web browser
   - Note: Some features might not work properly when opening files directly due to browser security restrictions

## How to Login and Test

### Login Credentials

The system uses local storage to simulate a database. On first run, it will create sample patient data.

You can log in with any of these sample accounts:

1. Patient 1:
   - ID: P001
   - Email: john.doe@example.com
   - Password: password123

2. Patient 2:
   - ID: P002
   - Email: jane.smith@example.com
   - Password: password123

3. Patient 3:
   - ID: P003
   - Email: bob.johnson@example.com
   - Password: password123

### Creating a New Account

You can also create a new account:

1. Click on the "Create Account" link on the login page
2. Fill in the registration form with your details
3. Submit the form to create a new account
4. You'll be redirected to the login page where you can use your new credentials
5. New accounts will be assigned IDs automatically (e.g., P004, P005, etc.)

## Testing the Features

After logging in, you can test the following features:

1. Dashboard: View upcoming appointments and quick access to other features

2. Book Appointment: Schedule a new appointment with a doctor
   - Select a doctor, date, time, and reason for the appointment

3. Appointment History: View past and upcoming appointments
   - Cancel upcoming appointments if needed

4. Medical Records: View your medical history and test results

5. Prescriptions: View your current and past prescriptions
   - See details like dosage, frequency, and refill information

6. Billing: View and pay your medical bills
   - See payment history and outstanding balances

7. Profile: Access your profile by clicking on your name in the top-right corner
   - View and edit your personal information

8. Logout: End your session by clicking the Logout button in the sidebar

## Notes

- This is a front-end only application that uses browser localStorage to simulate a database
- All data is stored locally in your browser and will persist between sessions
- Clearing your browser cache/localStorage will reset all data
- Patient IDs are used internally to link appointments, medical records, prescriptions, and billing information to specific patients

## Troubleshooting

If you encounter any issues:

1. Login Problems: Make sure you're using the correct email and password
2. Missing Data: Check if your browser has localStorage enabled
3. Page Not Loading: Ensure you're using a modern browser (Chrome, Firefox, Edge, Safari)
4. CORS Issues: If using the direct file opening method, consider switching to a local server method 