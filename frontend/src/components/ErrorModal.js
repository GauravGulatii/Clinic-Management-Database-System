import React from 'react';

const ErrorModal = ({ message, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
      <h2 className="text-xl font-semibold mb-4 text-red-600">Error</h2>
      <p className="mb-4">{message}</p>
      <div className="text-right">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          OK
        </button>
      </div>
    </div>
  </div>
);

export default ErrorModal;
