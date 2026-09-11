import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Activity,
  Terminal,
  Play,
  Lock,
  Layers,
  RefreshCw,
  Cpu,
  UserCheck,
} from 'lucide-react';
import {
  ActionProposal,
  ActionDecision,
  TrajectoryEvent,
  AuditEvent,
  ScenarioStep,
  RiskBandType,
} from './types/tripwire';
import { defaultTripwireClient, TripwireClient } from './api/client';
import { TrajectoryChart } from './components/TrajectoryChart';
import { ActionTimeline } from './components/ActionTimeline';
import { ConfirmationModal } from './components/ConfirmationModal';
import { AuditTable } from './components/AuditTable';
import { ScenarioRunner } from './components/ScenarioRunner';
import { ToolRegistryView } from './components/ToolRegistryView';
import { ArchitectureView } from './components/ArchitectureView';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'scenarios' | 'audit' | 'tools' | 'architecture'
  >('dashboard');
  const [backendOnline, setBackendOnline] = useState<boolean>(false);

  // --------------------------------------------------------------------------
  // Dynamic TechFlow Session State (Overview & Trajectory Monitor Page)
  // --------------------------------------------------------------------------
  const [sessionId, setSessionId] = useState<string>('sess_1_demo');
  const [availableSessions, setAvailableSessions] = useState<
    Array<{ session_id: string; principal_id?: string }>
  >([]);
  const [autoSyncSession, setAutoSyncSession] = useState<boolean>(true);
  const [principalId, setPrincipalId] = useState<string>('Backend Developer');
  const [currentScore, setCurrentScore] = useState<number>(0.0);
  const [currentRiskBand, setCurrentRiskBand] = useState<RiskBandType>('LOW');
  const [selectedEvent, setSelectedEvent] = useState<TrajectoryEvent | null>(null);
  const [events, setEvents] = useState<TrajectoryEvent[]>([]);

  // --------------------------------------------------------------------------
  // Audit Forensics State (All DB Logs)
  // --------------------------------------------------------------------------
  const [allDbAuditEvents, setAllDbAuditEvents] = useState<AuditEvent[]>([]);
  const [isAuditLoading, setIsAuditLoading] = useState<boolean>(false);

  // --------------------------------------------------------------------------
  // Interactive Scenario Runner Dedicated State (Isolated from TechFlow)
  // --------------------------------------------------------------------------
  const [scenarioEvents, setScenarioEvents] = useState<TrajectoryEvent[]>([]);
  const [scenarioScore, setScenarioScore] = useState<number>(0.0);
  const [scenarioRiskBand, setScenarioRiskBand] = useState<RiskBandType>('LOW');
  const [scenarioSelectedEvent, setScenarioSelectedEvent] = useState<TrajectoryEvent | null>(null);
  const [scenarioToolCounts, setScenarioToolCounts] = useState<Record<string, number>>({});

  // --------------------------------------------------------------------------
  // Human-in-the-Loop Modal State
  // --------------------------------------------------------------------------
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [pendingConfirmDecision, setPendingConfirmDecision] = useState<ActionDecision | null>(null);
  const [pendingConfirmProposal, setPendingConfirmProposal] = useState<ActionProposal | null>(null);
  const [handledModalActionIds, setHandledModalActionIds] = useState<Set<string>>(new Set());

  // Function to fetch database audit logs
  const fetchAllAuditLogs = useCallback(async () => {
    setIsAuditLoading(true);
    try {
      const res = await defaultTripwireClient.getAllAudit();
      if (res && res.events) {
        setAllDbAuditEvents(res.events);
      }
    } catch (err) {
      console.warn('Failed to fetch database audit logs:', err);
    } finally {
      setIsAuditLoading(false);
    }
  }, []);

  // Poll backend health, sessions, active session trajectory & all audit logs
  useEffect(() => {
    const sync = async () => {
      const res = await defaultTripwireClient.checkHealth();
      setBackendOnline(res.backendOnline);

      if (res.backendOnline) {
        // 1. Fetch available sessions from FastAPI
        let currentTargetSession = sessionId;
        try {
          const sessList = await defaultTripwireClient.listSessions();
          if (sessList && sessList.length > 0) {
            setAvailableSessions(
              sessList.map((s) => ({ session_id: s.session_id, principal_id: s.principal_id }))
            );
            if (autoSyncSession) {
              const latestId = sessList[0].session_id;
              if (latestId && latestId !== sessionId) {
                currentTargetSession = latestId;
                setSessionId(latestId);
              }
            } else if (!sessList.some((s) => s.session_id === sessionId)) {
              currentTargetSession = sessList[0].session_id;
              setSessionId(currentTargetSession);
            }
          }
        } catch (sessErr) {
          console.warn('Failed to fetch session list:', sessErr);
        }

        const targetSession = currentTargetSession || 'sess_1_demo';

        // 2. Fetch active session trajectory & audit events
        try {
          const audit = await defaultTripwireClient.getAudit(targetSession);
          if (audit && audit.events && audit.events.length > 0) {
            const latestEvent = audit.events[audit.events.length - 1];
            setCurrentScore(latestEvent.trajectory_score);
            setCurrentRiskBand(latestEvent.risk_band);
            setPrincipalId(latestEvent.principal_id);

            const traj = await defaultTripwireClient.getTrajectory(targetSession);
            if (traj && traj.events) {
              setEvents(traj.events);
            }

            // Scan for pending CONFIRM event
            const pendingEvent = [...audit.events].reverse().find(
              (e) =>
                (e.decision === 'CONFIRM' || e.decision === 'HARD_CONFIRM') &&
                e.execution_status === 'NOT_EXECUTED' &&
                !handledModalActionIds.has(e.action_id)
            );

            if (pendingEvent && !isConfirmModalOpen) {
              const decisionObj: ActionDecision = {
                action_id: pendingEvent.action_id,
                decision: pendingEvent.decision,
                trajectory_score: pendingEvent.trajectory_score,
                risk_band: pendingEvent.risk_band,
                reversibility: pendingEvent.reversibility,
                reason: pendingEvent.reason,
              };
              const proposalObj: ActionProposal = {
                principal_id: pendingEvent.principal_id,
                session_id: pendingEvent.session_id,
                agent_id: pendingEvent.agent_id,
                action: pendingEvent.action,
                resource: pendingEvent.resource,
                parameters: pendingEvent.parameters,
              };
              setPendingConfirmDecision(decisionObj);
              setPendingConfirmProposal(proposalObj);
              setIsConfirmModalOpen(true);
            }
          }
        } catch (e) {
          console.warn('Active session sync failed:', e);
        }

        // 3. Fetch all database logs
        try {
          const allLogs = await defaultTripwireClient.getAllAudit();
          if (allLogs && allLogs.events) {
            setAllDbAuditEvents(allLogs.events);
          }
        } catch (e) {
          console.warn('All-audit sync error:', e);
        }
      }
    };

    sync();
    const interval = setInterval(sync, 2500);
    return () => clearInterval(interval);
  }, [sessionId, autoSyncSession, isConfirmModalOpen, handledModalActionIds]);

  // --------------------------------------------------------------------------
  // Scenario Runner Handlers (Dedicated to Predefined Scenarios)
  // --------------------------------------------------------------------------
  const handleScenarioReset = (initialScore: number = 0.0) => {
    TripwireClient.resetSimState(initialScore);
    setScenarioScore(initialScore);
    setScenarioRiskBand(initialScore > 0.65 ? 'HIGH' : initialScore >= 0.35 ? 'MEDIUM' : 'LOW');
    setScenarioSelectedEvent(null);
    setScenarioEvents([]);
    setScenarioToolCounts({});
  };

  const handleScenarioStepAction = async (step: ScenarioStep, principal: string, agentId: string) => {
    const proposal: ActionProposal = {
      principal_id: principal,
      session_id: `scenario_sess_${Date.now().toString().slice(-4)}`,
      agent_id: agentId,
      action: step.action,
      resource: step.resource,
      parameters: step.parameters,
    };

    const decision = await defaultTripwireClient.proposeAction(proposal);
    setScenarioScore(decision.trajectory_score);
    setScenarioRiskBand(decision.risk_band);

    const isAllowed = decision.decision === 'ALLOW';
    const isConfirm = decision.decision === 'CONFIRM' || decision.decision === 'HARD_CONFIRM';

    const newEvent: TrajectoryEvent = {
      step: scenarioEvents.length + 1,
      action: proposal.action,
      resource: proposal.resource,
      reversibility: decision.reversibility,
      trajectory_score: decision.trajectory_score,
      risk_band: decision.risk_band,
      decision: decision.decision,
      reason: decision.reason,
      timestamp: new Date().toISOString(),
    };

    setScenarioEvents((prev) => [...prev, newEvent]);

    if (isAllowed) {
      setScenarioToolCounts((prev) => ({
        ...prev,
        [proposal.action]: (prev[proposal.action] || 0) + 1,
      }));
    } else if (isConfirm) {
      setPendingConfirmDecision(decision);
      setPendingConfirmProposal(proposal);
      setIsConfirmModalOpen(true);
    }
  };

  // --------------------------------------------------------------------------
  // Human Confirmation Handler
  // --------------------------------------------------------------------------
  const handleHumanConfirm = async (approvedBy: string, approve: boolean) => {
    if (!pendingConfirmDecision || !pendingConfirmProposal) return;

    if (!approve) {
      await defaultTripwireClient.denyAction(pendingConfirmDecision.action_id, approvedBy);
      setHandledModalActionIds((prev) => new Set([...prev, pendingConfirmDecision.action_id]));
      setPendingConfirmDecision(null);
      setPendingConfirmProposal(null);
      fetchAllAuditLogs();
      return;
    }

    const res = await defaultTripwireClient.confirmAction(
      pendingConfirmDecision.action_id,
      approvedBy
    );

    if (res.decision === 'ALLOW') {
      try {
        await fetch('http://localhost:4000/api/agent/execute-confirmed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action_id: pendingConfirmDecision.action_id,
            proposal: pendingConfirmProposal,
            approved_by: approvedBy,
          }),
        });
      } catch (execErr) {
        console.warn('Failed to forward confirmed execution to TechFlow backend:', execErr);
      }
    }

    setHandledModalActionIds((prev) => new Set([...prev, pendingConfirmDecision.action_id]));
    setPendingConfirmDecision(null);
    setPendingConfirmProposal(null);
    fetchAllAuditLogs();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-700">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                TRIPWIRE
              </h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-bold tracking-wider">
                RUNTIME SECURITY HARNESS
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Model-Agnostic AI Agent Authorization, Reversibility &amp; Trajectory Middleware
            </p>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <span
              className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}
            ></span>
            <span className="text-slate-500 font-medium">Harness Engine:</span>
            <span className={`font-bold ${backendOnline ? 'text-emerald-700' : 'text-amber-700'}`}>
              {backendOnline ? 'FastAPI Connected' : 'Simulated Harness'}
            </span>
          </div>
        </div>
      </header>

      {/* Navigation Subheader */}
      <div className="border-b border-slate-200 bg-white px-6 overflow-x-auto shadow-xs">
        <div className="flex space-x-8 min-w-max">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-3.5 text-xs font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'dashboard'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Overview &amp; Trajectory Monitor</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('audit');
              fetchAllAuditLogs();
            }}
            className={`py-3.5 text-xs font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'audit'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Audit Forensics ({allDbAuditEvents.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`py-3.5 text-xs font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'tools'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Protected Tools &amp; Invariants</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3.5 text-xs font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'architecture'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Architecture &amp; Decision Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`py-3.5 text-xs font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'scenarios'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Interactive Scenario Runner</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & TRAJECTORY MONITOR (Dynamic TECHFLOW Data Only)         */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Session Changer Control Bar (Moved here as requested in Item 5) */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    TechFlow Dynamic Session Stream
                  </h3>
                  <div className="flex items-center space-x-2 mt-0.5 text-xs text-slate-500">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Principal: <strong className="text-slate-700 font-mono">{principalId}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                  <span className="text-slate-500 font-semibold">Active Session:</span>
                  {availableSessions.length > 0 ? (
                    <select
                      value={sessionId}
                      onChange={(e) => {
                        setSessionId(e.target.value);
                        setAutoSyncSession(false);
                      }}
                      className="bg-white text-indigo-700 font-mono font-bold text-xs border border-slate-300 rounded px-2 py-0.5 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                    >
                      {availableSessions.map((s) => (
                        <option key={s.session_id} value={s.session_id} className="text-slate-800">
                          {s.session_id} {s.principal_id ? `(${s.principal_id})` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="font-mono text-indigo-700 font-bold">{sessionId}</span>
                  )}
                  <button
                    onClick={() => setAutoSyncSession((prev) => !prev)}
                    title={
                      autoSyncSession
                        ? 'Click to lock to current session'
                        : 'Click to enable live auto-sync to newest session'
                    }
                    className={`ml-1 px-2 py-0.5 text-[10px] font-bold rounded border transition cursor-pointer ${
                      autoSyncSession
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-white text-slate-600 border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    {autoSyncSession ? '⚡ LIVE AUTO-SYNC' : 'MANUAL'}
                  </button>
                </div>
              </div>
            </div>

            {/* Behavioral Trajectory Monitor & Action Timeline ALONE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrajectoryChart
                events={events}
                currentScore={currentScore}
                currentRiskBand={currentRiskBand}
                title="Behavioral Trajectory Monitor"
                subtitle="Live dynamic TechFlow score progression & EMA risk evaluation"
              />

              <ActionTimeline
                events={events}
                title="Action Timeline"
                subtitle="Live sequence of intercepted TechFlow actions & evaluations"
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: AUDIT FORENSICS (All Database Logs)                                 */}
        {/* ========================================================================= */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <AuditTable
              auditEvents={allDbAuditEvents}
              onRefresh={fetchAllAuditLogs}
              isLoading={isAuditLoading}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PROTECTED TOOLS & INVARIANTS                                      */}
        {/* ========================================================================= */}
        {activeTab === 'tools' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <ToolRegistryView executionCounts={scenarioToolCounts} />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ARCHITECTURE & DECISION MATRIX                                     */}
        {/* ========================================================================= */}
        {activeTab === 'architecture' && <ArchitectureView />}

        {/* ========================================================================= */}
        {/* TAB 5: INTERACTIVE SCENARIO RUNNER (Predefined Scenarios Only - LAST TAB) */}
        {/* ========================================================================= */}
        {activeTab === 'scenarios' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Predefined Scenario Demonstrator */}
              <div className="lg:col-span-5 space-y-6">
                <ScenarioRunner
                  isRunning={false}
                  onRunStep={handleScenarioStepAction}
                  onReset={handleScenarioReset}
                  toolExecutionCounts={scenarioToolCounts}
                />
              </div>

              {/* Right Column: Dedicated Scenario Trajectory Chart & Timeline */}
              <div className="lg:col-span-7 space-y-6">
                <TrajectoryChart
                  events={scenarioEvents}
                  currentScore={scenarioScore}
                  currentRiskBand={scenarioRiskBand}
                  selectedEvent={scenarioSelectedEvent}
                  onSelectEvent={(evt) => setScenarioSelectedEvent(evt)}
                  title="Scenario Trajectory Monitor"
                  subtitle="Isolated trajectory curve for current predefined test vector"
                />

                <ActionTimeline
                  events={scenarioEvents}
                  onSelectEvent={(evt) => setScenarioSelectedEvent(evt)}
                  title="Scenario Action Timeline"
                  subtitle="Step-by-step audit trail for the selected predefined test run"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Human-in-the-Loop Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        decision={pendingConfirmDecision}
        proposal={pendingConfirmProposal}
        onConfirm={handleHumanConfirm}
        onClose={() => setIsConfirmModalOpen(false)}
      />
    </div>
  );
}

