import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
// Import page components
import AppointmentsPage from './pages/AppointmentsPage';
import BillingPage from './pages/BillingPage';
import DoctorsPage from './pages/DoctorsPage';
import MedicalRecordsPage from './pages/MedicalRecordsPage';
import PatientsPage from './pages/PatientsPage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import SchedulesPage from './pages/SchedulesPage';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar navigation */}
        <Sidebar />
        {/* Main content area */}
        <div className="flex-1 p-6 ml-64">
          <Routes>
            <Route path="/" element={<Navigate to="/patients" replace />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/schedules" element={<SchedulesPage />} />
            <Route path="/prescriptions" element={<PrescriptionsPage />} />
            <Route path="/records" element={<MedicalRecordsPage />} />
            <Route path="/billing" element={<BillingPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
