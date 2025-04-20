import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();

  const linkClasses = ({ isActive }) =>
    'flex items-center px-4 py-3 text-white hover:bg-white/10 ' +
    (isActive ? 'bg-white/20 border-l-4 border-blue-500' : '');

  // show the stored staff info
  const staffJson = sessionStorage.getItem('staff');
  const staff = staffJson ? JSON.parse(staffJson) : null;
  const staffLabel = staff
    ? `${staff.name} (#${staff.staffid})`
    : 'Staff';

  const handleLogout = () => {
    sessionStorage.clear();
    onLogout();           // tell App we’re logged out
    navigate('/', {       // go back to login
      replace: true
    });
  };

  return (
    <nav className="bg-gray-800 text-gray-100 w-64 h-screen flex flex-col fixed left-0 top-0">
      <div className="flex flex-col items-center justify-center py-6 bg-gray-900">
        <i className="fas fa-clinic-medical text-4xl text-green-400 mb-2"></i>
        <h2 className="text-2xl font-semibold">Clinic CMS Tool</h2>
      </div>

      <ul className="flex-1 flex flex-col mt-4 space-y-1">
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
        <li>
          <NavLink to="/staff" className={linkClasses}>
            <i className="fas fa-id-badge mr-3"></i>
            <span>Staff Directory</span>
          </NavLink>
        </li>
      </ul>

      <div className="mt-auto mb-6 px-4">
        <div className="text-sm mb-3">
          Logged in as:{' '}
          <span id="profile-name" className="font-semibold">
            {staffLabel}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
