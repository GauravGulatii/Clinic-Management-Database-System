// frontend/src/pages/DoctorsPage.js
import React, { useEffect, useMemo, useState } from 'react';

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [message, setMessage] = useState('');

  // search + sort + filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [filterSpec, setFilterSpec] = useState('');

  // fetch doctors
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/doctors');
      const data = await res.json();
      setDoctors(data);
    } catch (err) {
      console.error('Failed to fetch doctors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // add doctor
  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, specialization })
      });
      if (!res.ok) throw new Error('Failed to add doctor');
      await fetchDoctors();
      setMessage('Doctor added successfully.');
    } catch (err) {
      console.error(err);
      setMessage('Error adding doctor.');
    } finally {
      setShowModal(false);
      setName('');
      setSpecialization('');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // delete doctor
  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm('Delete this doctor and all related records?')) return;
    try {
      const res = await fetch(`/api/doctors/${doctorId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await fetchDoctors();
      setMessage('Doctor deleted.');
    } catch (err) {
      console.error(err);
      setMessage('Error deleting doctor.');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // derive unique specializations for filter dropdown
  const allSpecs = useMemo(() => {
    const specs = new Set();
    doctors.forEach((d) => {
      if (d.specialization) specs.add(d.specialization);
    });
    return Array.from(specs).sort();
  }, [doctors]);

  // filter + sort the table
  const filteredAndSorted = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let list = doctors.filter((d) => {
      const idStr = d.doctorid.toString();
      const nm = d.name.toLowerCase();
      const spec = (d.specialization || '').toLowerCase();
      const matchesSearch =
        idStr.includes(term) || nm.includes(term) || spec.includes(term);
      const matchesFilter = filterSpec ? d.specialization === filterSpec : true;
      return matchesSearch && matchesFilter;
    });
    list.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [doctors, searchTerm, filterSpec, sortAsc]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Doctors</h1>

      {/* Search + Filter + Sort */}
      <div className="flex items-center mb-4 space-x-2">
        <input
          type="text"
          placeholder="🔍 Search by ID, name, or specialization"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
        />
        <select
          value={filterSpec}
          onChange={(e) => setFilterSpec(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
        >
          <option value="">All Specializations</option>
          {allSpecs.map((spec) => (
            <option key={spec} value={spec}>
              {spec}
            </option>
          ))}
        </select>
        <button
          onClick={() => setSortAsc((s) => !s)}
          className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300"
        >
          Name {sortAsc ? '↑' : '↓'}
        </button>
      </div>

      {/* Add Doctor Button */}
      <button
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={() => setShowModal(true)}
      >
        + Add Doctor
      </button>

      {/* Message */}
      {message && (
        <div className="mb-4 p-3 text-center bg-green-100 text-green-800 rounded">
          {message}
        </div>
      )}

      {/* Doctors Table */}
      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        {loading ? (
          <p>Loading doctors...</p>
        ) : filteredAndSorted.length === 0 ? (
          <p className="italic text-gray-600">No doctors found.</p>
        ) : (
          <table className="w-full table-auto">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Specialization</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((d) => (
                <tr key={d.doctorid} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{d.doctorid}</td>
                  <td className="px-4 py-2">{d.name}</td>
                  <td className="px-4 py-2">{d.specialization || '–'}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleDeleteDoctor(d.doctorid)}
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

      {/* Add Doctor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Doctor</h2>
            <form onSubmit={handleAddDoctor}>
              <div className="mb-3">
                <label className="block font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  required
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200"
                />
              </div>
              <div className="mb-3">
                <label className="block font-medium mb-1">Specialization</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200"
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
};

export default DoctorsPage;
