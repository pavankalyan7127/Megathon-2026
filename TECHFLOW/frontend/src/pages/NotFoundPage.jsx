import React from 'react';

export default function NotFoundPage({ onReset }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 text-gray-900">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-lg p-6 text-center shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-sm text-gray-500 mb-6">
          The requested page does not exist.
        </p>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
        >
          Return to Workspace
        </button>
      </div>
    </div>
  );
}

