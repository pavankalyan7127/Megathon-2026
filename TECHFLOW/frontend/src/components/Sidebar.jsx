import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';
import { MessageSquare, Plus, Trash2, Shield } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user } = useAuth();
  const {
    sessions,
    activeSessionId,
    createNewSession,
    selectSession,
    deleteSession
  } = useSession();

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
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white p-3.5 flex flex-col justify-between hidden md:flex h-full">
      <div className="space-y-4 flex-1 flex flex-col min-h-0">
        {/* Navigation Menu */}
        <div>
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 px-2">
            Navigation
          </div>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-2.5 py-1.5 text-xs font-medium rounded transition-colors ${
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

        {/* New Session Button */}
        <div>
          <button
            onClick={() => {
              setActiveTab('dashboard');
              createNewSession(user?.role || 'Backend Developer');
            }}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat Session</span>
          </button>
        </div>

        {/* Sessions History List */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 px-2">
            <span>Chat Sessions ({sessions.length})</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {sessions.map((sess) => {
              const isActive = sess.id === activeSessionId && activeTab === 'dashboard';
              return (
                <div
                  key={sess.id}
                  onClick={() => {
                    setActiveTab('dashboard');
                    selectSession(sess.id);
                  }}
                  className={`group flex items-center justify-between px-2.5 py-2 rounded-md text-xs cursor-pointer transition-all ${
                    isActive
                      ? 'bg-blue-50/80 text-blue-800 font-medium border border-blue-200/60 shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="truncate text-[12px]">{sess.title || 'Conversation'}</span>
                  </div>

                  {sessions.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(sess.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-opacity"
                      title="Delete session"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Role info */}
        <div className="border border-gray-200 bg-gray-50/70 rounded-md p-2.5 text-xs text-gray-700">
          <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 mb-0.5">
            <span>Role Context</span>
            <Shield className="w-3 h-3 text-indigo-500" />
          </div>
          <div className="font-semibold text-blue-700 truncate">
            {user?.role}
          </div>
          <div className="text-gray-400 text-[10px] truncate mt-0.5">
            Active: {activeSessionId.slice(0, 16)}...
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-2 text-[11px] text-gray-400 flex items-center justify-between">
        <span>Tripwire Harness</span>
        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Secured
        </span>
      </div>
    </aside>
  );
}

