import React, { useEffect, useState } from 'react';

const BillingPage = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('Pending');
  // staffId will not be input by user – we'll use current staff
  const [message, setMessage] = useState('');

  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/billing');
      const data = await res.json();
      setBills(data);
    } catch (err) {
      console.error('Failed to fetch billing records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBills(); }, []);

  const handleAddBill = async (e) => {
    e.preventDefault();
    try {
      const staffId = sessionStorage.getItem('currentStaffId') || '';
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientid: patientId, appointmentid: appointmentId, amount: parseFloat(amount)||0, paymentstatus: status, staffid: staffId })
      });
      if (!res.ok) throw new Error('Failed to add billing record');
      await fetchBills();
      setMessage('Billing record added successfully.');
    } catch (err) {
      console.error(err);
      setMessage('Error adding billing record.');
    } finally {
      setShowModal(false);
      setPatientId(''); setAppointmentId(''); setAmount(''); setStatus('Pending');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteBill = async (id) => {
    if (!window.confirm('Delete this billing record?')) return;
    try {
      const res = await fetch(`/api/billing/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await fetchBills();
      setMessage('Billing record deleted.');
    } catch (err) {
      console.error(err);
      setMessage('Error deleting record.');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Billing</h1>
      <button 
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={() => setShowModal(true)}>
        + Add Billing Record
      </button>

      {message && <div className="mb-4 p-3 text-center bg-green-100 text-green-800 rounded">{message}</div>}

      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        {loading ? <p>Loading billing records...</p> : bills.length === 0 ? (
          <p className="italic text-gray-600">No billing records found.</p>
        ) : (
          <table className="w-full table-auto">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Patient</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Processed By</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map(b => (
                <tr key={b.billingid} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{b.patientname} (ID: {b.patientid})</td>
                  <td className="px-4 py-2">${Number(b.amount).toFixed(2)}</td>
                  <td className="px-4 py-2">{b.paymentstatus || ''}</td>
                  <td className="px-4 py-2">{b.staffname || '-'}</td>
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => handleDeleteBill(b.billingid)}
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

      {/* Add Billing Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Billing Record</h2>
            <form onSubmit={handleAddBill}>
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
                <label className="block font-medium mb-1">Amount</label>
                <input type="number" step="0.01" value={amount} required
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200"/>
              </div>
              <div className="mb-3">
                <label className="block font-medium mb-1">Payment Status</label>
                <input type="text" value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200"/>
              </div>
              {/* staffId is set automatically to current staff */}
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

export default BillingPage;
