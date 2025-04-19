// frontend/src/pages/AppointmentsPage.js
import React, { useEffect, useState } from 'react';
import ErrorModal from '../components/ErrorModal';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // form fields
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [scheduleId, setScheduleId] = useState(null);
  const [message, setMessage] = useState('');

  // error‐modal state
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // fetch all appointments
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

  // fetch patients list
  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/appointments/patients');
      setPatients(await res.json());
    } catch (err) {
      console.error('Failed to fetch patients', err);
    }
  };

  // fetch doctors list
  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/appointments/doctors');
      setDoctors(await res.json());
    } catch (err) {
      console.error('Failed to fetch doctors', err);
    }
  };

  // fetch availability when doctor or date changes
  const fetchAvailability = async () => {
    if (!doctorId || !date) return;
    try {
      const res = await fetch(
        `/api/appointments/availability?doctorid=${doctorId}&date=${date}`
      );
      const schedules = await res.json();
      generateTimeSlots(schedules);
    } catch (err) {
      console.error('Failed to fetch availability', err);
    }
  };

  // build 1‑hour slots between 8 and 17
  const generateTimeSlots = (schedules) => {
    const slotsMap = new Map();

    schedules.forEach(({ scheduleid, starttime, endtime }) => {
      const startH = parseInt(starttime.split(':')[0], 10);
      const endH = parseInt(endtime.split(':')[0], 10);
      const clinicStart = 8;
      const clinicEnd = 17;
      const from = Math.max(startH, clinicStart);
      const to = Math.min(endH, clinicEnd);

      for (let h = from; h < to; h++) {
        const label = `${h}:00 – ${h + 1}:00`;
        const value = `${h.toString().padStart(2, '0')}:00`;
        slotsMap.set(`${value}|${scheduleid}`, { label, value, scheduleid });
      }
    });

    setTimeSlots(Array.from(slotsMap.values()));
  };

  // On mount: load patients, doctors, appointments
  useEffect(() => {
    fetchPatients();
    fetchDoctors();
    fetchAppointments();
  }, []);

  // When doctorId or date updates: reload available slots
  useEffect(() => {
    fetchAvailability();
  }, [doctorId, date]);

  // handleAddAppointment with conflict check
  const handleAddAppointment = async (e) => {
    e.preventDefault();

    const stored = sessionStorage.getItem('currentStaffId');
    const staffId = stored ? parseInt(stored, 10) : 1;

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientid: patientId,
          appointmentdate: date,
          appointmenttime: time,
          doctorid: doctorId,
          staffid: staffId,
          scheduleid: scheduleId,
        }),
      });

      if (res.status === 409) {
        const { error } = await res.json();
        setErrorMessage(error);
        setShowError(true);
        return;
      }

      if (!res.ok) throw new Error('Failed to add appointment');

      await fetchAppointments();
      setMessage('Appointment added successfully.');
    } catch (err) {
      console.error(err);
      setMessage('Error adding appointment.');
    } finally {
      setShowModal(false);
      setPatientId('');
      setDoctorId('');
      setDate('');
      setTime('');
      setScheduleId(null);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // delete handler
  const handleDeleteAppointment = async (patId, appId) => {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      const res = await fetch(`/api/appointments/${patId}/${appId}`, {
        method: 'DELETE',
      });
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
        onClick={() => setShowModal(true)}
      >
        + Add Appointment
      </button>

      {message && (
        <div className="mb-4 p-3 text-center bg-green-100 text-green-800 rounded">
          {message}
        </div>
      )}

      {/* Error Modal */}
      {showError && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setShowError(false)}
        />
      )}

      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        {loading ? (
          <p>Loading appointments...</p>
        ) : appointments.length === 0 ? (
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
              {appointments.map((app) => (
                <tr
                  key={`${app.patientid}-${app.appointmentid}`}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{app.patientname}</td>
                  <td className="px-4 py-2">{app.doctorname}</td>
                  <td className="px-4 py-2">{app.appointmentdate}</td>
                  <td className="px-4 py-2">{app.appointmenttime}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() =>
                        handleDeleteAppointment(
                          app.patientid,
                          app.appointmentid
                        )
                      }
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Add Appointment</h2>
            <form onSubmit={handleAddAppointment}>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block font-medium mb-1">Patient</label>
                  <select
                    value={patientId}
                    required
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">Select a patient</option>
                    {patients.map((p) => (
                      <option key={p.patientid} value={p.patientid}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Doctor</label>
                  <select
                    value={doctorId}
                    required
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">Select a doctor</option>
                    {doctors.map((d) => (
                      <option key={d.doctorid} value={d.doctorid}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    required
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Time Slot</label>
                  <select
                    value={`${time}|${scheduleId}`}
                    required
                    onChange={(e) => {
                      const [t, sid] = e.target.value.split('|');
                      setTime(t);
                      setScheduleId(sid);
                    }}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">— select slot —</option>
                    {timeSlots.map((slot, i) => (
                      <option
                        key={i}
                        value={`${slot.value}|${slot.scheduleid}`}
                      >
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="mr-3 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
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
