import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import RoleBadge from '../components/RoleBadge';
import QuickActionCards from '../components/QuickActionCards';
import AIAssistantChat from '../components/AIAssistantChat';
import { ROLE_CONFIGS } from '../dashboards/roleConfig';

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPrompt, setSelectedPrompt] = useState('');

  const currentRole = user?.role || 'Frontend Developer';
  const config = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS['Frontend Developer'];

  const handleActionClick = (prompt) => {
    setSelectedPrompt(prompt);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-6xl mx-auto w-full">
          {activeTab === 'architecture' ? (
            /* Architecture View */
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Tripwire Demo Architecture</h2>
              <p className="text-sm text-gray-600">Overview of the communication sequence:</p>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-sm">
                <div className="border border-gray-200 rounded p-3 bg-gray-50">
                  <div className="font-semibold text-gray-900">1. Frontend</div>
                  <div className="text-xs text-gray-500 mt-1">User interaction & role selection</div>
                </div>
                <div className="border border-gray-200 rounded p-3 bg-gray-50">
                  <div className="font-semibold text-gray-900">2. Gateway</div>
                  <div className="text-xs text-gray-500 mt-1">Context attachment & proxy</div>
                </div>
                <div className="border border-gray-200 rounded p-3 bg-gray-50">
                  <div className="font-semibold text-gray-900">3. n8n Webhook</div>
                  <div className="text-xs text-gray-500 mt-1">Workflow orchestration</div>
                </div>
                <div className="border border-gray-200 rounded p-3 bg-gray-50">
                  <div className="font-semibold text-gray-900">4. Tripwire</div>
                  <div className="text-xs text-gray-500 mt-1">Policy evaluation & security</div>
                </div>
                <div className="border border-gray-200 rounded p-3 bg-gray-50">
                  <div className="font-semibold text-gray-900">5. Resource</div>
                  <div className="text-xs text-gray-500 mt-1">Target database / system</div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 text-xs text-gray-500">
                <strong>Note:</strong> All policy enforcement occurs downstream in Tripwire.
              </div>
            </div>
          ) : (
            /* Main Dashboard & AI Assistant View */
            <div className="space-y-6">
              {/* Simple Header Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Welcome, {user?.name || 'User'}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {config.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <RoleBadge role={currentRole} size="lg" />
                </div>
              </div>

              {/* Role Quick Action Cards */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                <QuickActionCards
                  actions={config.quickActions}
                  onSelectAction={handleActionClick}
                />
              </div>

              {/* AI Agent Chat Interface */}
              <div>
                <AIAssistantChat
                  samplePrompts={config.samplePrompts}
                  defaultInput={selectedPrompt}
                  onInputConsumed={() => setSelectedPrompt('')}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

