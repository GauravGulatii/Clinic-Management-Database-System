import React, { useEffect, useState } from 'react';

const PrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [message, setMessage] = useState('');

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/prescriptions');
      const data = await res.json();
      setPrescriptions(data);
    } catch (err) {
      console.error('Failed to fetch prescriptions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrescriptions(); }, []);

  const handleAddPrescription = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientid: patientId, appointmentid: appointmentId, medication, dosage })
      });
      if (!res.ok) throw new Error('Failed to add prescription');
      await fetchPrescriptions();
      setMessage('Prescription added successfully.');
    } catch (err) {
      console.error(err);
      setMessage('Error adding prescription.');
    } finally {
      setShowModal(false);
      setPatientId(''); setAppointmentId(''); setMedication(''); setDosage('');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeletePrescription = async (id) => {
    if (!window.confirm('Delete this prescription?')) return;
    try {
      const res = await fetch(`/api/prescriptions/${id}`, { method: 'DELETE' });
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Prescriptions</h1>
      <button 
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={() => setShowModal(true)}>
        + Add Prescription
      </button>

      {message && <div className="mb-4 p-3 text-center bg-green-100 text-green-800 rounded">{message}</div>}

      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        {loading ? <p>Loading prescriptions...</p> : prescriptions.length === 0 ? (
          <p className="italic text-gray-600">No prescriptions found.</p>
        ) : (
          <table className="w-full table-auto">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Medication</th>
                <th className="px-4 py-2 text-left">Dosage</th>
                <th className="px-4 py-2 text-left">Patient</th>
                <th className="px-4 py-2 text-left">Doctor</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map(pr => (
                <tr key={pr.prescriptionid} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{pr.medication}</td>
                  <td className="px-4 py-2">{pr.dosage || '-'}</td>
                  <td className="px-4 py-2">{pr.patientname} (ID: {pr.patientid})</td>
                  <td className="px-4 py-2">{pr.doctorname}</td>
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => handleDeletePrescription(pr.prescriptionid)}
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

      {/* Add Prescription Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Prescription</h2>
            <form onSubmit={handleAddPrescription}>
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
                <label className="block font-medium mb-1">Medication</label>
                <input type="text" value={medication} required
                  onChange={(e) => setMedication(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200"/>
              </div>
              <div className="mb-3">
                <label className="block font-medium mb-1">Dosage</label>
                <input type="text" value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
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

export default PrescriptionsPage;
