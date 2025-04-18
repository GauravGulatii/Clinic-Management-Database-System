import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const linkClasses = ({ isActive }) =>
    // base styles for links:
    "flex items-center px-4 py-3 text-white hover:bg-white/10 " +
    // active link styles:
    (isActive ? "bg-white/20 border-l-4 border-blue-500" : "");
  
  return (
    <nav className="bg-gray-800 text-gray-100 w-64 h-screen flex flex-col fixed left-0 top-0">
      {/* Logo / Brand section */}
      <div className="flex flex-col items-center justify-center py-6 bg-gray-900">
        <i className="fas fa-clinic-medical text-4xl text-green-400 mb-2"></i>
        <h2 className="text-2xl font-semibold">Clinic CMS</h2>
      </div>
      {/* Navigation Links */}
      <ul className="flex-1 flex flex-col mt-4">
        <li>
          <NavLink to="/patients" className={linkClasses}>
            <i className="fas fa-users mr-3"></i>
            <span>Patients</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/doctors" className={linkClasses}>
            <i className="fas fa-user-md mr-3"></i>
            <span>Doctors</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/appointments" className={linkClasses}>
            <i className="fas fa-calendar-check mr-3"></i>
            <span>Appointments</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/schedules" className={linkClasses}>
            <i className="fas fa-calendar-day mr-3"></i>
            <span>Schedules</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/prescriptions" className={linkClasses}>
            <i className="fas fa-prescription-bottle-alt mr-3"></i>
            <span>Prescriptions</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/records" className={linkClasses}>
            <i className="fas fa-file-medical mr-3"></i>
            <span>Medical Records</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/billing" className={linkClasses}>
            <i className="fas fa-file-invoice-dollar mr-3"></i>
            <span>Billing</span>
          </NavLink>
        </li>
      </ul>
      {/* Profile/Logout section at bottom */}
      <div className="mt-auto mb-6 px-4">
        <div className="text-sm mb-3">
          Logged in as: <span id="profile-name" className="font-semibold">
            {sessionStorage.getItem('currentStaffId') || 'Staff'}
          </span>
        </div>
        <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded" 
                onClick={() => { 
                  // Simple logout: clear session and reload to login page
                  sessionStorage.clear();
                  window.location.href = '../index.html'; 
                }}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
