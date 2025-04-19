// frontend/src/pages/BillingPage.js
import React, { useEffect, useMemo, useState } from 'react';
import ErrorModal from '../components/ErrorModal';

const STATUS_OPTIONS = ['All', 'Unpaid', 'Paid', 'Pending'];
const SORT_OPTIONS = [
  { label: 'Date ↑', value: 'date-asc' },
  { label: 'Date ↓', value: 'date-desc' },
];

export default function BillingPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  // modal fields
  const [billingDate, setBillingDate] = useState('');
  const [availableAppts, setAvailableAppts] = useState([]);
  const [appointmentId, setAppointmentId] = useState('');
  const [patientId, setPatientId] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('Unpaid');

  const [message, setMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // filters
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortOrder, setSortOrder] = useState('date-asc');

  const fmt = iso => (iso ? new Date(iso).toLocaleDateString('en-CA') : '');

  // load billing + appointments
  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing');
      setBills(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // when billingDate changes, load appointments
  useEffect(() => {
    if (!billingDate) return setAvailableAppts([]);
    (async () => {
      const res = await fetch('/api/appointments');
      const all = await res.json();
      setAvailableAppts(
        all.filter(a => a.appointmentdate.slice(0, 10) === billingDate)
      );
    })();
  }, [billingDate]);

  // open modal for add or edit
  const openModal = bill => {
    if (bill) {
      // edit
      setEditId(bill.billingid);
      setBillingDate(bill.appointmentdate.slice(0, 10));
      setAppointmentId(bill.appointmentid.toString());
      setPatientId(bill.patientid.toString());
      setAmount(bill.amount.toString());
      setStatus(bill.paymentstatus);
    } else {
      // add new
      setEditId(null);
      setBillingDate('');
      setAppointmentId('');
      setPatientId('');
      setAmount('');
      setStatus('Unpaid');
    }
    setShowModal(true);
  };

  // save new or edited
  const handleSave = async e => {
    e.preventDefault();
    try {
      const staffId = sessionStorage.getItem('currentStaffId') || null;
      const payload = {
        patientid: patientId,
        appointmentid: appointmentId,
        amount: parseFloat(amount) || 0,
        paymentstatus: status,
        staffid: staffId,
      };
      const url = editId ? `/api/billing/${editId}` : '/api/billing';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.status === 400) {
        const { error } = await res.json();
        setErrorMessage(error);
        setShowError(true);
        return;
      }
      if (!res.ok) throw new Error('Save failed');
      await fetchBills();
      setMessage(editId ? 'Billing record updated.' : 'Billing record added.');
    } catch (err) {
      console.error(err);
      setMessage('Error saving billing record.');
    } finally {
      setShowModal(false);
      setEditId(null);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this billing record?')) return;
    try {
      const res = await fetch(`/api/billing/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await fetchBills();
      setMessage('Billing record deleted.');
    } catch {
      setMessage('Error deleting billing record.');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // filter + sort
  const filtered = useMemo(() => {
    let arr = bills;
    if (filterStatus !== 'All')
      arr = arr.filter(b => b.paymentstatus === filterStatus);
    arr = [...arr].sort((a, b) => {
      const da = new Date(a.appointmentdate);
      const db = new Date(b.appointmentdate);
      return sortOrder === 'date-asc' ? da - db : db - da;
    });
    return arr;
  }, [bills, filterStatus, sortOrder]);

  // status badge
  const badge = s => {
    const map = {
      Paid: 'bg-green-100 text-green-800',
      Unpaid: 'bg-red-100 text-red-800',
      Pending: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span
        className={`${map[s] || ''} inline-block px-2 py-1 text-xs rounded-full`}
      >
        {s}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Billing</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => openModal(null)}
        >
          + Add Billing
        </button>
      </div>

      {message && (
        <div className="p-3 text-center bg-green-100 text-green-800 rounded">
          {message}
        </div>
      )}
      {showError && (
        <ErrorModal message={errorMessage} onClose={() => setShowError(false)} />
      )}

      <div className="flex flex-wrap gap-4">
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto shadow rounded">
        <table className="w-full">
          <thead className="bg-blue-500 text-white">
            <tr>
              {['Patient', 'Date', 'Time', 'Amount', 'Status', 'Staff', 'Actions'].map(h => (
                <th key={h} className="px-4 py-2 text-left text-sm">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-4 text-center">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-600 italic">
                  No records.
                </td>
              </tr>
            ) : (
              filtered.map(b => (
                <tr
                  key={`${b.patientid}-${b.appointmentid}`}
                  className="even:bg-gray-50"
                >
                  <td className="px-4 py-2 text-sm">
                    {b.patientname} (#{b.patientid})
                  </td>
                  <td className="px-4 py-2 text-sm">{fmt(b.appointmentdate)}</td>
                  <td className="px-4 py-2 text-sm">{b.appointmenttime}</td>
                  <td className="px-4 py-2 text-sm">
                    ${Number(b.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-2">{badge(b.paymentstatus)}</td>
                  <td className="px-4 py-2 text-sm">{b.staffname || '-'}</td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => openModal(b)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Edit
                    </button>
                    {b.billingid && (
                      <button
                        onClick={() => handleDelete(b.billingid)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editId ? 'Edit Billing' : 'Add Billing'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              {!editId && (
                <>
                  <div>
                    <label className="block mb-1 font-medium">Date</label>
                    <input
                      type="date"
                      value={billingDate}
                      required
                      onChange={e => setBillingDate(e.target.value)}
                      className="w-full border px-3 py-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Appointment</label>
                    <select
                      value={appointmentId}
                      required
                      onChange={e => {
                        const sel = availableAppts.find(
                          a => a.appointmentid === e.target.value
                        );
                        setAppointmentId(e.target.value);
                        setPatientId(sel?.patientid || '');
                      }}
                      className="w-full border px-3 py-2 rounded"
                    >
                      <option value="">— select appointment —</option>
                      {availableAppts.map(a => (
                        <option key={a.appointmentid} value={a.appointmentid}>
                          {fmt(a.appointmentdate)} {a.appointmenttime} —{' '}
                          {a.patientname}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className="block mb-1 font-medium">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  required
                  onChange={e => setAmount(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                >
                  {['Unpaid', 'Paid', 'Pending'].map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
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
                  {editId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
