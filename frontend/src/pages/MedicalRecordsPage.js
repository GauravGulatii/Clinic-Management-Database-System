import React, { useEffect, useState } from 'react';

const MedicalRecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [message, setMessage] = useState('');

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/medicalrecords');
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.error('Failed to fetch records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleAddRecord = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/medicalrecords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientid: patientId, appointmentid: appointmentId, diagnosis, treatment })
      });
      if (!res.ok) throw new Error('Failed to add record');
      await fetchRecords();
      setMessage('Medical record added successfully.');
    } catch (err) {
      console.error(err);
      setMessage('Error adding medical record.');
    } finally {
      setShowModal(false);
      setPatientId(''); setAppointmentId(''); setDiagnosis(''); setTreatment('');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Delete this medical record?')) return;
    try {
      const res = await fetch(`/api/medicalrecords/${id}`, { method: 'DELETE' });
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Medical Records</h1>
      <button 
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={() => setShowModal(true)}>
        + Add Record
      </button>

      {message && <div className="mb-4 p-3 text-center bg-green-100 text-green-800 rounded">{message}</div>}

      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        {loading ? <p>Loading medical records...</p> : records.length === 0 ? (
          <p className="italic text-gray-600">No medical records found.</p>
        ) : (
          <table className="w-full table-auto">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Patient</th>
                <th className="px-4 py-2 text-left">Doctor</th>
                <th className="px-4 py-2 text-left">Diagnosis</th>
                <th className="px-4 py-2 text-left">Treatment</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.recordid} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{r.patientname} (ID: {r.patientid})</td>
                  <td className="px-4 py-2">{r.doctorname}</td>
                  <td className="px-4 py-2">{r.diagnosis || '-'}</td>
                  <td className="px-4 py-2">{r.treatment || '-'}</td>
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => handleDeleteRecord(r.recordid)}
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

      {/* Add Medical Record Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Add Medical Record</h2>
            <form onSubmit={handleAddRecord}>
              <div className="mb-3">
                <label className="block font-medium mb-1">Patient ID</label>
                <input type="number" value={patientId} required
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200"/>
              </div>
              <div className="mb-3">
                <label className="block font-medium mb-1">Appointment ID</label>
                <input type="number" value={appointmentId} required
                  onChange={(e) => setAppointmentId(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200"/>
              </div>
              <div className="mb-3">
                <label className="block font-medium mb-1">Diagnosis</label>
                <textarea value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200"/>
              </div>
              <div className="mb-3">
                <label className="block font-medium mb-1">Treatment</label>
                <textarea value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200"/>
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

export default MedicalRecordsPage;
