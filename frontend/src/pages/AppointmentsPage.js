import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorModal from '../components/ErrorModal';

export default function AppointmentsPage() {
  const nav = useNavigate();

  // — state —
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // add/edit modal
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // form fields
  const [patientId, setPatientId] = useState(null);
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [scheduleId, setScheduleId] = useState(null);

  // selection for row actions
  const [selPatientId, setSelPatientId] = useState(null);
  const [patientAppts, setPatientAppts] = useState([]);
  const [selAppt, setSelAppt] = useState(null);

  // feedback & errors
  const [message, setMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // fetch all three lists
  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/appointments').then((r) => r.json()),
      fetch('/api/appointments/patients').then((r) => r.json()),
      fetch('/api/appointments/doctors').then((r) => r.json()),
    ])
      .then(([appts, pts, drs]) => {
        setAppointments(appts);
        setPatients(pts);
        setDoctors(drs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchAll, []);

  // reload time‑slots when doctor or date changes
  useEffect(() => {
    if (!doctorId || !date) {
      setTimeSlots([]);
      return;
    }
    fetch(`/api/appointments/availability?doctorid=${doctorId}&date=${date}`)
      .then((r) => r.json())
      .then((schedules) => {
        const m = new Map();
        schedules.forEach(({ scheduleid, starttime, endtime }) => {
          const sh = +starttime.split(':')[0];
          const eh = +endtime.split(':')[0];
          for (let h = Math.max(8, sh); h < Math.min(17, eh); h++) {
            const val = `${h.toString().padStart(2, '0')}:00`;
            m.set(`${val}|${scheduleid}`, {
              value: val,
              scheduleid,
              label: `${h}:00 – ${h + 1}:00`,
            });
          }
        });
        setTimeSlots(Array.from(m.values()));
      })
      .catch(console.error);
  }, [doctorId, date]);

  // filter appointments when selPatientId or appointments change
  useEffect(() => {
    if (selPatientId == null) {
      setPatientAppts([]);
    } else {
      setPatientAppts(appointments.filter((a) => a.patientid === selPatientId));
    }
  }, [selPatientId, appointments]);

  // open add modal
  const openAdd = () => {
    setIsEditing(false);
    setPatientId(null);
    setDoctorId('');
    setDate('');
    setTime('');
    setScheduleId(null);
    setShowModal(true);
  };

  // open edit modal
  const openEdit = () => {
    if (!selAppt) return;
    setIsEditing(true);
    setPatientId(selAppt.patientid);
    setDoctorId(selAppt.doctorid);
    setDate(selAppt.appointmentdate.slice(0, 10));
    setTime(selAppt.appointmenttime);
    setScheduleId(selAppt.scheduleid);
    setShowModal(true);
  };

  // add or update
  const handleSave = (e) => {
    e.preventDefault();
    const staffid = parseInt(sessionStorage.getItem('currentStaffId') || '1', 10);
    const payload = {
      patientid: patientId,
      appointmentdate: date,
      appointmenttime: time,
      doctorid: doctorId,
      staffid,
      scheduleid: scheduleId,
    };
    const url = isEditing
      ? `/api/appointments/${selAppt.patientid}/${selAppt.appointmentid}`
      : '/api/appointments';
    fetch(url, {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (res.status === 409) {
          const { error } = await res.json();
          setErrorMsg(error);
          setShowError(true);
          throw new Error('Conflict');
        }
        if (!res.ok) throw new Error('Save failed');
      })
      .then(() => {
        fetchAll();
        setMessage(isEditing ? 'Appointment updated' : 'Appointment added');
      })
      .catch((err) => {
        if (err.message !== 'Conflict') {
          console.error(err);
          setMessage('Error saving appointment');
        }
      })
      .finally(() => {
        setShowModal(false);
        setTimeout(() => setMessage(''), 3000);
      });
  };

  // delete appointment
  const handleDelete = () => {
    if (!selAppt || !window.confirm('Delete this appointment?')) return;
    fetch(
      `/api/appointments/${selAppt.patientid}/${selAppt.appointmentid}`,
      { method: 'DELETE' }
    )
      .then((res) => {
        if (!res.ok) throw new Error('Delete failed');
        return fetchAll();
      })
      .then(() => {
        setMessage('Appointment deleted');
        setSelAppt(null);
      })
      .catch((err) => {
        console.error(err);
        setMessage('Error deleting appointment');
      })
      .finally(() => setTimeout(() => setMessage(''), 3000));
  };

  const fmt = (iso) => new Date(iso).toLocaleDateString('en-CA');

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Appointments</h1>

      {message && (
        <div className="p-2 bg-green-100 text-green-800 rounded">{message}</div>
      )}
      {showError && (
        <ErrorModal message={errorMsg} onClose={() => setShowError(false)} />
      )}

      <div className="flex space-x-2">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={openAdd}
        >
          + Add Appointment
        </button>
      </div>

      <div className="flex space-x-2 items-center">
        {/* Patient selector */}
        <select
          value={selPatientId ?? ''}
          onChange={(e) => {
            const id = e.target.value ? parseInt(e.target.value, 10) : null;
            setSelPatientId(id);
            setSelAppt(null); // clear selected appointment only when patient changes
          }}
          className="border px-2 py-1 rounded"
        >
          <option value="">— Select patient —</option>
          {patients.map((p) => (
            <option key={p.patientid} value={p.patientid}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Appointment selector */}
        <select
          value={selAppt?.appointmentid ?? ''}
          onChange={(e) => {
            const id = parseInt(e.target.value, 10);
            setSelAppt(
              patientAppts.find((a) => a.appointmentid === id) || null
            );
          }}
          disabled={!selPatientId}
          className="border px-2 py-1 rounded"
        >
          <option value="">— Select appointment —</option>
          {patientAppts.map((a) => (
            <option key={a.appointmentid} value={a.appointmentid}>
              {fmt(a.appointmentdate)} {a.appointmenttime}
            </option>
          ))}
        </select>

        <button
          onClick={openEdit}
          disabled={!selAppt}
          className="px-3 py-1 bg-yellow-400 rounded text-white hover:bg-yellow-500 disabled:opacity-50"
        >
          Edit
        </button>
        <button
          onClick={() =>
            nav(
              `/billing?patientid=${selAppt?.patientid}&appointmentid=${selAppt?.appointmentid}`
            )
          }
          disabled={!selAppt}
          className="px-3 py-1 bg-blue-500 rounded text-white hover:bg-blue-600 disabled:opacity-50"
        >
          Billing
        </button>
        <button
          onClick={() =>
            nav(
              `/prescriptions?patientid=${selAppt?.patientid}&appointmentid=${selAppt?.appointmentid}`
            )
          }
          disabled={!selAppt}
          className="px-3 py-1 bg-green-500 rounded text-white hover:bg-green-600 disabled:opacity-50"
        >
          Prescription
        </button>
        <button
          onClick={() =>
            nav(
              `/medicalrecords?patientid=${selAppt?.patientid}&appointmentid=${selAppt?.appointmentid}`
            )
          }
          disabled={!selAppt}
          className="px-3 py-1 bg-purple-500 rounded text-white hover:bg-purple-600 disabled:opacity-50"
        >
          Medical Record
        </button>
        <button
          onClick={handleDelete}
          disabled={!selAppt}
          className="px-3 py-1 bg-red-600 rounded text-white hover:bg-red-700 disabled:opacity-50"
        >
          Delete
        </button>
      </div>

      <div className="overflow-auto shadow rounded">
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Patient</th>
              <th className="px-4 py-2 text-left">Doctor</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-4 text-center">
                  Loading…
                </td>
              </tr>
            ) : appointments.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center italic">
                  No appointments
                </td>
              </tr>
            ) : (
              appointments.map((app) => (
                <tr
                  key={`${app.patientid}-${app.appointmentid}`}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    selAppt?.appointmentid === app.appointmentid
                      ? 'bg-blue-100'
                      : ''
                  }`}
                  onClick={() => {
                    setSelPatientId(app.patientid);
                    setSelAppt(app);
                  }}
                >
                  <td className="px-4 py-2 text-left">
                    {app.patientname}
                  </td>
                  <td className="px-4 py-2 text-left">
                    {app.doctorname}
                  </td>
                  <td className="px-4 py-2 text-left">
                    {app.appointmentdate.slice(0, 10)}
                  </td>
                  <td className="px-4 py-2 text-left">
                    {app.appointmenttime}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? 'Edit' : 'Add'} Appointment
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              {/* Patient */}
              <div>
                <label className="block mb-1">Patient</label>
                <select
                  value={patientId ?? ''}
                  onChange={(e) =>
                    setPatientId(
                      e.target.value ? parseInt(e.target.value, 10) : null
                    )
                  }
                  required
                  className="w-full border px-2 py-1 rounded"
                >
                  <option value="">Select patient</option>
                  {patients.map((p) => (
                    <option key={p.patientid} value={p.patientid}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor */}
              <div>
                <label className="block mb-1">Doctor</label>
                <select
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  required
                  className="w-full border px-2 py-1 rounded"
                >
                  <option value="">Select doctor</option>
                  {doctors.map((d) => (
                    <option key={d.doctorid} value={d.doctorid}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full border px-2 py-1 rounded"
                />
              </div>

              {/* Time Slot */}
              <div>
                <label className="block mb-1">Time Slot</label>
                <select
                  value={`${time}|${scheduleId}`}
                  onChange={(e) => {
                    const [t, s] = e.target.value.split('|');
                    setTime(t);
                    setScheduleId(s);
                  }}
                  required
                  className="w-full border px-2 py-1 rounded"
                >
                  <option value="">Select slot</option>
                  {timeSlots.map((slot) => (
                    <option
                      key={`${slot.scheduleid}-${slot.value}`}
                      value={`${slot.value}|${slot.scheduleid}`}
                    >
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {isEditing ? 'Save Changes' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
