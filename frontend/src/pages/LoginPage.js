// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage({ onLogin }) {
  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [error,      setError]      = useState('');
  const navigate = useNavigate();
  const DEFAULT_PASS = 'clinic123';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier || !password) {
      setError('Please enter both Staff ID/name and password.');
      return;
    }
    if (password !== DEFAULT_PASS) {
      setError('Invalid password.');
      return;
    }

    try {
      // Determine whether to fetch by ID or by name
      let res;
      if (/^\d+$/.test(identifier)) {
        res = await fetch(`/api/staff/${identifier}`);
      } else {
        res = await fetch(
          `/api/staff?name=${encodeURIComponent(identifier)}`
        );
      }

      if (res.status === 404) {
        setError('Staff not found.');
        return;
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const staff = Array.isArray(data) ? data[0] : data;
      if (!staff) {
        setError('Staff not found.');
        return;
      }

      // Persist in sessionStorage
      sessionStorage.setItem('staff', JSON.stringify(staff));

      // Tell App that we are now logged in so it re-renders
      onLogin();

      // Now navigate to the protected area
      navigate('/patients', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError('Error logging in. Please try again.');
    }
  };

  return (
    <div className="max-w-sm mx-auto p-6 mt-16 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Staff Login</h2>
      {error && <p className="text-red-600 mb-3">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Staff ID or Full Name:</label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="e.g. 100 or Alice Smith"
          />
        </div>
        <div>
          <label className="block mb-1">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="clinic123"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}
