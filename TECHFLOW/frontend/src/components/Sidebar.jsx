import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Workspace'
    },
    {
      id: 'architecture',
      label: 'Architecture'
    }
  ];

  return (
    <aside className="w-56 flex-shrink-0 border-r border-gray-200 bg-white p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Menu
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Current Role info */}
        <div className="border border-gray-200 bg-gray-50 rounded p-3 text-xs text-gray-700">
          <div className="font-semibold text-gray-900 mb-1">
            Current Role:
          </div>
          <div className="font-medium text-blue-700 mb-1">
            {user?.role}
          </div>
          <p className="text-gray-500 text-[11px]">
            User ID #{user?.id}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-3 text-xs text-gray-500">
        Status: <span className="text-green-700 font-medium">Ready</span>
      </div>
    </aside>
  );
}

