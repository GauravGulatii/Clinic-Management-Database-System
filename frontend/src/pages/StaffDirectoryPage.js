// src/pages/StaffDirectoryPage.js
import React, { useEffect, useMemo, useState } from 'react';
import DeleteMessage from '../components/DeleteMessage';

export default function StaffDirectoryPage() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [firstName, setFirstName]   = useState('');
  const [lastName, setLastName]     = useState('');
  const [message, setMessage]       = useState('');

  // For delete confirmation
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  // current logged‑in staff
  const current = JSON.parse(sessionStorage.getItem('staff') || '{}');

  // Fetch staff list
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/staff');
      const data = await res.json();
      setStaffList(data);
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Add new staff
  const handleAdd = async (e) => {
    e.preventDefault();
    const name = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!name) return;
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (!res.ok) throw new Error('Add failed');
      await fetchStaff();
      setMessage('Staff added successfully.');
    } catch (err) {
      console.error(err);
      setMessage('Error adding staff.');
    } finally {
      setFirstName('');
      setLastName('');
      setShowModal(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Initiate delete — opens confirmation modal or shows error if self
  const handleDeleteClick = (s) => {
    if (s.staffid === current.staffid) {
      setMessage("Cannot delete yourself.");
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    setDeleteCandidate(s);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      const res = await fetch(`/api/staff/${deleteCandidate.staffid}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await fetchStaff();
      setMessage('Staff deleted.');
    } catch (err) {
      console.error(err);
      setMessage('Error deleting staff.');
    } finally {
      setTimeout(() => setMessage(''), 3000);
      setDeleteCandidate(null);
    }
  };

  // Cancel deletion
  const cancelDelete = () => {
    setDeleteCandidate(null);
  };

  // filter + sort
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let list = staffList.filter(s => {
      const idStr = s.staffid.toString();
      const name = s.name.toLowerCase();
      return idStr.includes(term) || name.includes(term);
    });
    list.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [staffList, searchTerm, sortAsc]);

  return (
    <div className="relative">
      <h1 className="text-2xl font-bold mb-4">Staff Directory</h1>

      {/* Search & Sort */}
      <div className="flex items-center mb-4 space-x-2">
        <input
          type="text"
          placeholder="🔍 Search ID or name"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 border rounded px-3 py-2 focus:ring focus:ring-blue-200"
        />
        <button
          onClick={() => setSortAsc(a => !a)}
          className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300"
        >
          Name {sortAsc ? '↑' : '↓'}
        </button>
      </div>

      {/* Add Staff */}
      <button
        onClick={() => setShowModal(true)}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        + Add Staff
      </button>

      {/* Message */}
      {message && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-800">
          {message}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        {loading ? (
          <p>Loading staff...</p>
        ) : filtered.length === 0 ? (
          <p className="italic text-gray-600">No staff found.</p>
        ) : (
          <table className="w-full table-auto">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.staffid} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{s.staffid}</td>
                  <td className="px-4 py-2">{s.name}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleDeleteClick(s)}
                      disabled={s.staffid === current.staffid}
                      className={`${
                        s.staffid === current.staffid
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-red-600 hover:underline'
                      }`}
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

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Staff</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200"
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

      {/* Delete Confirmation Modal */}
      <DeleteMessage
        show={!!deleteCandidate}
        itemName={deleteCandidate?.name || ''}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
