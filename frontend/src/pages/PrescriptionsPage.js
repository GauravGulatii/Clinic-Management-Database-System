// frontend/src/pages/PrescriptionsPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ErrorModal from '../components/ErrorModal';

export default function PrescriptionsPage() {
  const [searchParams] = useSearchParams();
  const queryPatientId = parseInt(searchParams.get('patientid') || '', 10);
  const queryAppointmentId = parseInt(
    searchParams.get('appointmentid') || '',
    10
  );

  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [date, setDate] = useState('');
  const [patientId, setPatientId] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [message, setMessage] = useState('');

  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // search + sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  // fetch data
  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/prescriptions');
      setPrescriptions(await res.json());
    } catch (err) {
      console.error('Failed to fetch prescriptions', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/prescriptions/patients');
      setPatients(await res.json());
    } catch (err) {
      console.error('Failed to fetch patients', err);
    }
  };

  const fetchPatientAppointments = async () => {
    if (!patientId || !date) {
      setAppointments([]);
      return;
    }
    try {
      const res = await fetch(
        `/api/prescriptions/appointments?patientid=${patientId}&date=${date}`
      );
      setAppointments(await res.json());
    } catch (err) {
      console.error('Failed to fetch appointments', err);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
  }, []);

  useEffect(() => {
    fetchPatientAppointments();
  }, [patientId, date]);

  // prepopulate if URL has patient+appointment
  useEffect(() => {
    if (queryPatientId && queryAppointmentId) {
      fetch('/api/appointments')
        .then((res) => res.json())
        .then((all) => {
          const appt = all.find(
            (a) =>
              a.patientid === queryPatientId &&
              a.appointmentid === queryAppointmentId
          );
          if (appt) {
            const dateStr = appt.appointmentdate.slice(0, 10);
            setPatientId(queryPatientId.toString());
            setDate(dateStr);
            setAppointmentId(queryAppointmentId.toString());
            setShowModal(true);
          }
        })
        .catch(console.error);
    }
  }, [queryPatientId, queryAppointmentId]);

  const handleAddPrescription = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientid: patientId,
          appointmentid: appointmentId,
          medication,
          dosage,
        }),
      });
      if (res.status === 400) {
        const { error } = await res.json();
        setErrorMessage(error);
        setShowError(true);
        return;
      }
      if (!res.ok) throw new Error('Failed to add prescription');
      await fetchPrescriptions();
      setMessage('Prescription added successfully.');
    } catch (err) {
      console.error(err);
      setMessage('Error adding prescription.');
    } finally {
      setShowModal(false);
      setDate('');
      setPatientId('');
      setAppointmentId('');
      setMedication('');
      setDosage('');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeletePrescription = async (id) => {
    if (!window.confirm('Delete this prescription?')) return;
    try {
      const res = await fetch(`/api/prescriptions/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      await fetchPrescriptions();
      setMessage('Prescription deleted.');
    } catch (err) {
      console.error(err);
      setMessage('Error deleting prescription.');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // filter + sort prescriptions
  const filteredAndSorted = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let list = prescriptions.filter((pr) => {
      return (
        pr.medication.toLowerCase().includes(term) ||
        pr.patientname.toLowerCase().includes(term) ||
        pr.doctorname.toLowerCase().includes(term)
      );
    });
    list.sort((a, b) => {
      const cmp = a.medication.localeCompare(b.medication);
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [prescriptions, searchTerm, sortAsc]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Prescriptions</h1>
      <button
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={() => setShowModal(true)}
      >
        + Add Prescription
      </button>

      {/* Search + Sort */}
      <div className="flex items-center mb-4 space-x-2">
        <input
          type="text"
          placeholder="🔍 Search medication, patient or doctor"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
        />
        <button
          onClick={() => setSortAsc((s) => !s)}
          className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300"
        >
          Medication {sortAsc ? '↑' : '↓'}
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 text-center bg-green-100 text-green-800 rounded">
          {message}
        </div>
      )}

      {showError && (
        <ErrorModal message={errorMessage} onClose={() => setShowError(false)} />
      )}

      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        {loading ? (
          <p>Loading prescriptions...</p>
        ) : filteredAndSorted.length === 0 ? (
          <p className="italic text-gray-600">No prescriptions found.</p>
        ) : (
          <table className="w-full table-auto">
            <thead className="bg-blue-500 text-white">
              <tr>
                {['Medication', 'Dosage', 'Patient', 'Doctor', 'Actions'].map(
                  (h) => (
                    <th key={h} className="px-4 py-2 text-left">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((pr) => (
                <tr
                  key={pr.prescriptionid}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{pr.medication}</td>
                  <td className="px-4 py-2">{pr.dosage || '-'}</td>
                  <td className="px-4 py-2">
                    {pr.patientname} (ID: {pr.patientid})
                  </td>
                  <td className="px-4 py-2">{pr.doctorname}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() =>
                        handleDeletePrescription(pr.prescriptionid)
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Prescription</h2>
            <form onSubmit={handleAddPrescription}>
              <div className="mb-3">
                <label className="block font-medium mb-1">Date (optional)</label>
                <input
                  type="date"
                  value={date}
                  required
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div className="mb-3">
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
              <div className="mb-3">
                <label className="block font-medium mb-1">Appointment</label>
                <select
                  value={appointmentId}
                  required
                  disabled={!appointments.length}
                  onChange={(e) => setAppointmentId(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">— select appointment —</option>
                  {appointments.map((a) => (
                    <option key={a.appointmentid} value={a.appointmentid}>
                      {a.appointmenttime} with {a.doctorname} (#
                      {a.appointmentid})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="block font-medium mb-1">Medication</label>
                <input
                  type="text"
                  value={medication}
                  required
                  onChange={(e) => setMedication(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div className="mb-3">
                <label className="block font-medium mb-1">Dosage</label>
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
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
}
