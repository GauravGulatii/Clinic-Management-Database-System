import React, { useEffect, useState } from 'react';

const SchedulesPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState('Available');
  const [message, setMessage] = useState('');

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/schedules');
      const data = await res.json();
      setSchedules(data);
    } catch (err) {
      console.error('Failed to fetch schedules', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSchedules(); }, []);

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorid: doctorId, scheduledate: date, starttime: startTime, endtime: endTime, status })
      });
      if (!res.ok) throw new Error('Failed to add schedule');
      await fetchSchedules();
      setMessage('Schedule added successfully.');
    } catch (err) {
      console.error(err);
      setMessage('Error adding schedule.');
    } finally {
      setShowModal(false);
      setDoctorId(''); setDate(''); setStartTime(''); setEndTime(''); setStatus('Available');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Delete this schedule?')) return;
    try {
      const res = await fetch(`/api/schedules/${scheduleId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await fetchSchedules();
      setMessage('Schedule deleted.');
    } catch (err) {
      console.error(err);
      setMessage('Error deleting schedule.');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Doctor Schedules</h1>
      <button 
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={() => setShowModal(true)}>
        + Add Schedule
      </button>

      {message && <div className="mb-4 p-3 text-center bg-green-100 text-green-800 rounded">{message}</div>}

      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        {loading ? <p>Loading schedules...</p> : schedules.length === 0 ? (
          <p className="italic text-gray-600">No schedules found.</p>
        ) : (
          <table className="w-full table-auto">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Doctor</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Start Time</th>
                <th className="px-4 py-2 text-left">End Time</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map(s => (
                <tr key={s.scheduleid} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{s.doctorname} (ID: {s.doctorid})</td>
                  <td className="px-4 py-2">{s.scheduledate.slice(0, 10)}</td>
                  <td className="px-4 py-2">{s.starttime}</td>
                  <td className="px-4 py-2">{s.endtime}</td>
                  <td className="px-4 py-2">{s.status || ''}</td>
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => handleDeleteSchedule(s.scheduleid)}
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

      {/* Add Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Add Schedule</h2>
            <form onSubmit={handleAddSchedule}>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block font-medium mb-1">Doctor ID</label>
                  <input type="number" value={doctorId} required
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200" />
                </div>
                <div>
                  <label className="block font-medium mb-1">Date</label>
                  <input type="date" value={date} required
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block font-medium mb-1">Start Time</label>
                  <input type="time" value={startTime} required
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200" />
                </div>
                <div>
                  <label className="block font-medium mb-1">End Time</label>
                  <input type="time" value={endTime} required
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200" />
                </div>
              </div>
              <div className="mb-3">
                <label className="block font-medium mb-1">Status</label>
                <input type="text" value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200" />
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

export default SchedulesPage;
