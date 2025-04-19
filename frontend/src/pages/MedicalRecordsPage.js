// frontend/src/pages/MedicalRecordsPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ErrorModal from '../components/ErrorModal';

const PAGE_SIZE = 10;

export default function MedicalRecordsPage() {
  const [searchParams] = useSearchParams();
  const queryPatientId = parseInt(searchParams.get('patientid') || '', 10);
  const queryAppointmentId = parseInt(
    searchParams.get('appointmentid') || '',
    10
  );

  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [date, setDate] = useState(''); // YYYY-MM-DD
  const [patientId, setPatientId] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [message, setMessage] = useState('');

  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);

  // fetch existing records
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/medicalrecords');
      setRecords(await res.json());
    } catch (err) {
      console.error('Failed to fetch records', err);
    } finally {
      setLoading(false);
    }
  };

  // fetch patients list
  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/medicalrecords/patients');
      setPatients(await res.json());
    } catch (err) {
      console.error('Failed to fetch patients', err);
    }
  };

  // fetch this patient’s appointments for the chosen date
  const fetchPatientAppointments = async () => {
    if (!patientId || !date) {
      setAppointments([]);
      return;
    }
    try {
      const res = await fetch(
        `/api/medicalrecords/appointments?patientid=${patientId}&date=${date}`
      );
      setAppointments(await res.json());
    } catch (err) {
      console.error('Failed to fetch appointments', err);
    }
  };

  // on mount
  useEffect(() => {
    fetchRecords();
    fetchPatients();
  }, []);

  // when patient/date change
  useEffect(() => {
    fetchPatientAppointments();
  }, [patientId, date]);

  // if URL has patient+appointment, prepopulate and open modal
  useEffect(() => {
    if (queryPatientId && queryAppointmentId) {
      // fetch all appointments to get date
      fetch('/api/appointments')
        .then((res) => res.json())
        .then((all) => {
          const appt = all.find(
            (a) =>
              a.patientid === queryPatientId &&
              a.appointmentid === queryAppointmentId
          );
          if (!appt) return;
            const dateStr = appt.appointmentdate.slice(0, 10);
            // 1) set patient & date
            setPatientId(queryPatientId.toString());
            setDate(dateStr);
             // 2) fetch the actual medical‐record appointments list so the select isn’t disabled
             fetch(
                         `/api/medicalrecords/appointments?patientid=${queryPatientId}&date=${dateStr}`
                       )
                       .then((r) => r.json())
                                  .then((data) => {
                                    setAppointments(data);
                                  })
                                  .finally(() => {
                                    // 3) now prefill appointmentId and open
                                    setAppointmentId(queryAppointmentId.toString());
                                    setShowModal(true);
                                  });
                              })
                              .catch(console.error);
                           }
                         }, [queryPatientId, queryAppointmentId]);

  const fmt = (iso) =>
    iso ? new Date(iso).toLocaleDateString('en-CA') : '';

  const handleAddRecord = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/medicalrecords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientid: patientId,
          appointmentid: appointmentId,
          diagnosis,
          treatment,
        }),
      });
      if (res.status === 400) {
        const { error } = await res.json();
        setErrorMessage(error);
        setShowError(true);
        return;
      }
      if (!res.ok) throw new Error('Failed to add record');
      await fetchRecords();
      setMessage('Medical record added successfully.');
    } catch (err) {
      console.error(err);
      setMessage('Error adding medical record.');
    } finally {
      setShowModal(false);
      setDate('');
      setPatientId('');
      setAppointmentId('');
      setDiagnosis('');
      setTreatment('');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Delete this medical record?')) return;
    try {
      const res = await fetch(
        `/api/medicalrecords/${id}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Delete failed');
      await fetchRecords();
      setMessage('Medical record deleted.');
    } catch (err) {
      console.error(err);
      setMessage('Error deleting record.');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // filter + paginate
  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return records.filter(
      (r) =>
        r.patientname.toLowerCase().includes(term) ||
        r.doctorname.toLowerCase().includes(term) ||
        (r.diagnosis || '').toLowerCase().includes(term) ||
        (r.treatment || '').toLowerCase().includes(term) ||
        fmt(r.appointmentdate).includes(term)
    );
  }, [records, searchTerm]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageSlice = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Medical Records
        </h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setShowModal(true)}
        >
          + Add Record
        </button>
      </div>

      {message && (
        <div className="p-3 text-center bg-green-100 text-green-800 rounded">
          {message}
        </div>
      )}

      {showError && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setShowError(false)}
        />
      )}

      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="🔍 Search Date ,Patient, Doctor, Diagnosis or Treatment"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200"
        />
        <span className="text-base">
          {filtered.length} record
          {filtered.length !== 1 && 's'}
        </span>
      </div>

      <div className="overflow-x-auto shadow rounded">
        <table className="w-full table-auto">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              {[
                'Date',
                'Patient',
                'Doctor',
                'Diagnosis',
                'Treatment',
                'Actions',
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2 text-left font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-4 text-center">
                  Loading…
                </td>
              </tr>
            ) : pageSlice.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-4 text-center italic text-gray-600"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              pageSlice.map((r) => (
                <tr
                  key={r.recordid}
                  className="even:bg-gray-50"
                >
                  <td className="px-4 py-2">
                    {fmt(r.appointmentdate)}
                  </td>
                  <td className="px-4 py-2">
                    {r.patientname}
                  </td>
                  <td className="px-4 py-2">
                    {r.doctorname}
                  </td>
                  <td className="px-4 py-2">
                    {r.diagnosis || '-'}
                  </td>
                  <td className="px-4 py-2">
                    {r.treatment || '-'}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() =>
                        handleDeleteRecord(r.recordid)
                      }
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-base">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() =>
              setPage((p) => Math.min(p + 1, totalPages - 1))
            }
            disabled={page + 1 === totalPages}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">
              Add Medical Record
            </h2>
            <form
              onSubmit={handleAddRecord}
              className="space-y-4"
            >
              <div>
                <label className="block font-medium mb-1">
                  Date (optional)
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">
                  Patient
                </label>
                <select
                  value={patientId}
                  required
                  onChange={(e) =>
                    setPatientId(e.target.value)
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Select a patient</option>
                  {patients.map((p) => (
                    <option
                      key={p.patientid}
                      value={p.patientid}
                    >
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">
                  Appointment
                </label>
                <select
                  value={appointmentId}
                  required
                  disabled={!appointments.length}
                  onChange={(e) =>
                    setAppointmentId(e.target.value)
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">
                    — select appointment —
                  </option>
                  {appointments.map((a) => (
                    <option
                      key={a.appointmentid}
                      value={a.appointmentid}
                    >
                      {fmt(a.appointmentdate)}{' '}
                      {a.appointmenttime} with{' '}
                      {a.doctorname} (#
                      {a.appointmentid})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">
                  Diagnosis
                </label>
                <textarea
                  value={diagnosis}
                  onChange={(e) =>
                    setDiagnosis(e.target.value)
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">
                  Treatment
                </label>
                <textarea
                  value={treatment}
                  onChange={(e) =>
                    setTreatment(e.target.value)
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
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
