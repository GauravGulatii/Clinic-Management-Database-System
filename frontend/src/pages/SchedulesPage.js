// frontend/src/pages/SchedulesPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import DeleteMessage from '../components/DeleteMessage';

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState('Available');

  // for delete confirmation
  const [showDelete, setShowDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // search & sort
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/schedules');
      const data = await res.json();
      setSchedules(data);
    } catch (err) {
      console.error('Failed to fetch schedules', err);
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorid: doctorId,
          scheduledate: date,
          starttime: startTime,
          endtime: endTime,
          status,
        }),
      });
      if (!res.ok) throw new Error();
      await fetchSchedules();
      toast.success('Schedule added');
    } catch {
      toast.error('Error adding schedule');
    } finally {
      setShowModal(false);
      setDoctorId(''); setDate(''); setStartTime(''); setEndTime(''); setStatus('Available');
    }
  };

  const handleDeleteClick = (s) => {
    setDeleteTarget(s);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`/api/schedules/${deleteTarget.scheduleid}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      await fetchSchedules();
      toast.success('Schedule deleted');
    } catch {
      toast.error('Error deleting schedule');
    } finally {
      setShowDelete(false);
    }
  };

  const filteredAndSorted = useMemo(() => {
    const term = searchTerm.toLowerCase();
    let list = schedules.filter(s => {
      return (
        s.doctorname.toLowerCase().includes(term) ||
        s.scheduledate.includes(term) ||
        s.status.toLowerCase().includes(term)
      );
    });
    list.sort((a, b) => {
      const da = new Date(a.scheduledate + ' ' + a.starttime);
      const db = new Date(b.scheduledate + ' ' + b.starttime);
      return sortAsc ? da - db : db - da;
    });
    return list;
  }, [schedules, searchTerm, sortAsc]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Doctor Schedules</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setShowModal(true)}
        >
          + Add Schedule
        </button>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="🔍 Search by doctor, date, status"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
        />
        <button
          onClick={() => setSortAsc(s => !s)}
          className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300"
        >
          Date {sortAsc ? '↑' : '↓'}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        {loading ? (
          <p>Loading schedules...</p>
        ) : filteredAndSorted.length === 0 ? (
          <p className="italic text-gray-600">No schedules found.</p>
        ) : (
          <table className="w-full table-auto">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Doctor</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Start</th>
                <th className="px-4 py-2 text-left">End</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map(s => (
                <tr key={s.scheduleid} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{s.doctorname} (#{s.doctorid})</td>
                  <td className="px-4 py-2">{s.scheduledate.slice(0,10)}</td>
                  <td className="px-4 py-2">{s.starttime}</td>
                  <td className="px-4 py-2">{s.endtime}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        s.status === 'Available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleDeleteClick(s)}
                      className="text-red-600 hover:underline text-sm"
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

      {/* Add Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Add Schedule</h2>
            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Doctor ID</label>
                  <input
                    type="number"
                    value={doctorId}
                    required
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    required
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    required
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    required
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200"
                >
                  <option>Available</option>
                  <option>Unavailable</option>
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
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <DeleteMessage
        show={showDelete}
        itemName={`schedule on ${deleteTarget?.scheduledate.slice(0,10)}`}
        onConfirm={confirmDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
