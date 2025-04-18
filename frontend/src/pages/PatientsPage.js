import React, { useEffect, useState } from 'react';

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [message, setMessage] = useState('');

  // Fetch patients list from API
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/patients');
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      console.error('Failed to fetch patients', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Handle new patient form submission
  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstname: firstName, lastname: lastName, dob })
      });
      if (!res.ok) {
        throw new Error('Failed to add patient');
      }
      // Refresh list after adding
      await fetchPatients();
      setMessage('Patient added successfully.');
    } catch (err) {
      console.error(err);
      setMessage('Error adding patient.');
    } finally {
      // Reset form and close modal
      setFirstName(''); setLastName(''); setDob('');
      setShowModal(false);
      // Clear message after a short delay
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Handle delete patient
  const handleDeletePatient = async (patientId) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) {
      return;
    }
    try {
      const res = await fetch(`/api/patients/${patientId}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Delete failed');
      }
      // Refresh list after deletion
      await fetchPatients();
      setMessage('Patient deleted.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Error deleting patient.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="relative">
      <h1 className="text-2xl font-bold mb-4">Patients</h1>

      {/* Add Patient Button */}
      <button 
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={() => setShowModal(true)}>
        + Add Patient
      </button>

      {/* Success/Error message */}
      {message && (
        <div className="mb-4 p-3 text-center rounded 
                        bg-green-100 text-green-800">
          {message}
        </div>
      )}

      {/* Patients Table */}
      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        {loading ? (
          <p>Loading patients...</p>
        ) : patients.length === 0 ? (
          <p className="italic text-gray-600">No patients found.</p>
        ) : (
          <table className="w-full table-auto">
            <thead className="bg-blue-500 text-white text-left">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">First Name</th>
                <th className="px-4 py-2">Last Name</th>
                <th className="px-4 py-2">Date of Birth</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.patientid} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{p.patientid}</td>
                  <td className="px-4 py-2">{p.firstname}</td>
                  <td className="px-4 py-2">{p.lastname}</td>
                  <td className="px-4 py-2">{p.dob}</td>
                  <td className="px-4 py-2">
                    <button 
                      onClick={() => handleDeletePatient(p.patientid)}
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

      {/* Add Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Patient</h2>
            <form onSubmit={handleAddPatient}>
              <div className="mb-3">
                <label className="block font-medium mb-1">First Name</label>
                <input type="text" value={firstName} required
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200" />
              </div>
              <div className="mb-3">
                <label className="block font-medium mb-1">Last Name</label>
                <input type="text" value={lastName} required
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200" />
              </div>
              <div className="mb-3">
                <label className="block font-medium mb-1">Date of Birth</label>
                <input type="date" value={dob} required
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200" />
              </div>
              <div className="text-right">
                <button type="button" 
                        onClick={() => setShowModal(false)}
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

export default PatientsPage;
