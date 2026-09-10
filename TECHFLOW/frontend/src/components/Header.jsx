import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import RoleBadge from './RoleBadge';
import { checkBackendHealth } from '../services/api';

export default function Header() {
  const { user, logout } = useAuth();
  const [backendHealth, setBackendHealth] = useState(null);

  useEffect(() => {
    checkBackendHealth().then(setBackendHealth);
    const interval = setInterval(() => {
      checkBackendHealth().then(setBackendHealth);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      {/* Brand & Context */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 text-lg">
              TechFlow Workspace
            </span>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
              Tripwire Demo
            </span>
          </div>
          <p className="text-xs text-gray-500">Employee Workspace</p>
        </div>

        {/* Backend status indicator */}
        <div className="hidden md:flex items-center gap-2 border-l border-gray-200 pl-4 text-xs text-gray-600">
          <span>
            Gateway: <strong className={backendHealth?.status === 'healthy' ? 'text-green-700 font-semibold' : 'text-yellow-600 font-semibold'}>
              {backendHealth?.status === 'healthy' ? 'Online' : 'Connecting'}
            </strong>
          </span>
          {backendHealth?.n8nConfigured && (
            <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-200 text-xs">
              n8n Linked
            </span>
          )}
        </div>
      </div>

      {/* User Info & Actions */}
      {user && (
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
          <RoleBadge role={user.role} />
          <button
            onClick={logout}
            className="ml-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}

