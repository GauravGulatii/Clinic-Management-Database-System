import React, { useEffect, useState } from 'react';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  // Form fields for new appointment
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [scheduleId, setScheduleId] = useState('');  // optional
  const [message, setMessage] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/appointments');
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error('Failed to fetch appointments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    try {
      // Use current staff ID for staffid
      const staffId = sessionStorage.getItem('currentStaffId') || '';
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          patientid: patientId, 
          appointmentdate: date, 
          appointmenttime: time,
          doctorid: doctorId, 
          staffid: staffId,
          scheduleid: scheduleId || null
        })
      });
      if (!res.ok) throw new Error('Failed to add appointment');
      await fetchAppointments();
      setMessage('Appointment added successfully.');
    } catch (err) {
      console.error(err);
      setMessage('Error adding appointment.');
    } finally {
      setShowModal(false);
      setPatientId(''); setDoctorId(''); setDate(''); setTime(''); setScheduleId('');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteAppointment = async (patId, appId) => {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      const res = await fetch(`/api/appointments/${patId}/${appId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await fetchAppointments();
      setMessage('Appointment deleted.');
    } catch (err) {
      console.error(err);
      setMessage('Error deleting appointment.');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Appointments</h1>
      <button 
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={() => setShowModal(true)}>
        + Add Appointment
      </button>

      {message && <div className="mb-4 p-3 text-center bg-green-100 text-green-800 rounded">{message}</div>}

      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        {loading ? <p>Loading appointments...</p> : appointments.length === 0 ? (
          <p className="italic text-gray-600">No appointments found.</p>
        ) : (
          <table className="w-full table-auto">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Patient</th>
                <th className="px-4 py-2 text-left">Doctor</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Time</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(app => (
                <tr key={`${app.patientid}-${app.appointmentid}`} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{app.patientname}</td>
                  <td className="px-4 py-2">{app.doctorname}</td>
                  <td className="px-4 py-2">{app.appointmentdate}</td>
                  <td className="px-4 py-2">{app.appointmenttime}</td>
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => handleDeleteAppointment(app.patientid, app.appointmentid)}
                            className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Add Appointment</h2>
            <form onSubmit={handleAddAppointment}>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block font-medium mb-1">Patient ID</label>
                  <input type="number" value={patientId} required
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200" />
                </div>
                <div>
                  <label className="block font-medium mb-1">Doctor ID</label>
                  <input type="number" value={doctorId} required
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block font-medium mb-1">Date</label>
                  <input type="date" value={date} required
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200" />
                </div>
                <div>
                  <label className="block font-medium mb-1">Time</label>
                  <input type="time" value={time} required
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200" />
                </div>
              </div>
              <div className="mb-3">
                <label className="block font-medium mb-1">Schedule ID (optional)</label>
                <input type="number" value={scheduleId}
                  onChange={(e) => setScheduleId(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200" />
              </div>
              <div className="text-right">
                <button type="button" onClick={() => setShowModal(false)}
                        className="mr-3 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                  Cancel
                </button>
                <button type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
