// src/components/DeleteMessage.jsx
import React from 'react';

export default function DeleteMessage({
  show,
  itemName,
  onConfirm,
  onCancel,
}) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center space-y-4">
        <h2 className="text-xl font-semibold">
          Are you sure you want to delete&nbsp;
          <span className="font-bold">{itemName}</span>?
        </h2>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
