import React, { useState } from 'react';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes
} from 'react-router-dom';

import Sidebar from './components/Sidebar';
import AppointmentsPage from './pages/AppointmentsPage';
import BillingPage from './pages/BillingPage';
import DoctorsPage from './pages/DoctorsPage';
import LoginPage from './pages/LoginPage';
import MedicalRecordsPage from './pages/MedicalRecordsPage';
import PatientsPage from './pages/PatientsPage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import SchedulesPage from './pages/SchedulesPage';
import StaffDirectoryPage from './pages/StaffDirectoryPage';

function App() {
  // track whether we're logged in
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!sessionStorage.getItem('staff')
  );

  return (
    <Router>
      <div className="flex min-h-screen bg-gray-100">
        {isLoggedIn && (
          /** Pass logout callback into Sidebar **/
          <Sidebar onLogout={() => setIsLoggedIn(false)} />
        )}

        <div className={`flex-1 p-6 ${isLoggedIn ? 'ml-64' : ''}`}>
          <Routes>
            {/** Landing route: show LoginPage if not logged in **/}
            <Route
              path="/"
              element={
                isLoggedIn ? (
                  <Navigate to="/patients" replace />
                ) : (
                  /** Pass login callback into LoginPage **/
                  <LoginPage onLogin={() => setIsLoggedIn(true)} />
                )
              }
            />

            {/** Protected routes **/}
            <Route
              path="/patients"
              element={
                isLoggedIn ? <PatientsPage /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/doctors"
              element={
                isLoggedIn ? <DoctorsPage /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/appointments"
              element={
                isLoggedIn ? <AppointmentsPage /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/schedules"
              element={
                isLoggedIn ? <SchedulesPage /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/prescriptions"
              element={
                isLoggedIn ? <PrescriptionsPage /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/records"
              element={
                isLoggedIn ? <MedicalRecordsPage /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/billing"
              element={
                isLoggedIn ? <BillingPage /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/staff"
              element={
                isLoggedIn ? (
                  <StaffDirectoryPage />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            {/** Catch‑all: redirect to login **/}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
