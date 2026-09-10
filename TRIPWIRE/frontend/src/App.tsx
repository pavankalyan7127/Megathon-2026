import React, { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  Terminal,
  Play,
  RotateCcw,
  Lock,
  Layers,
  Sparkles,
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
import { DecisionCard } from './components/DecisionCard';
import { ActionTimeline } from './components/ActionTimeline';
import { ConfirmationModal } from './components/ConfirmationModal';
import { AuditTable } from './components/AuditTable';
import { ScenarioRunner } from './components/ScenarioRunner';
import { ToolRegistryView } from './components/ToolRegistryView';
import { CustomActionSandbox } from './components/CustomActionSandbox';
import { ArchitectureView } from './components/ArchitectureView';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'scenarios' | 'sandbox' | 'audit' | 'tools' | 'architecture'
  >('dashboard');
  const [backendOnline, setBackendOnline] = useState<boolean>(false);

  // Runtime State & Session Management
  const [sessionId, setSessionId] = useState<string>('sess_1_demo');
  const [availableSessions, setAvailableSessions] = useState<Array<{ session_id: string; principal_id?: string }>>([]);
  const [autoSyncSession, setAutoSyncSession] = useState<boolean>(true);
  const [principalId, setPrincipalId] = useState<string>('Backend Developer');
  const [currentScore, setCurrentScore] = useState<number>(0.0);
  const [currentRiskBand, setCurrentRiskBand] = useState<RiskBandType>('LOW');

  const [currentProposal, setCurrentProposal] = useState<ActionProposal | null>(null);
  const [currentDecision, setCurrentDecision] = useState<ActionDecision | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TrajectoryEvent | null>(null);
  const [events, setEvents] = useState<TrajectoryEvent[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [toolExecutionCounts, setToolExecutionCounts] = useState<Record<string, number>>({});

  // HITL Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [pendingConfirmDecision, setPendingConfirmDecision] = useState<ActionDecision | null>(null);
  const [pendingConfirmProposal, setPendingConfirmProposal] = useState<ActionProposal | null>(null);

  // Track handled action IDs for modal to prevent re-opening for already dismissed items
  const [handledModalActionIds, sethandledModalActionIds] = useState<Set<string>>(new Set());

  // Poll backend health and auto-sync active session data from FastAPI
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
            setAvailableSessions(sessList.map((s) => ({ session_id: s.session_id, principal_id: s.principal_id })));
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
        const audit = await defaultTripwireClient.getAudit(targetSession);
        if (audit && audit.events && audit.events.length > 0) {
          setAuditEvents(audit.events);
          // Audit events are ordered chronologically (oldest to newest), so last element is latest
          const latestEvent = audit.events[audit.events.length - 1];
          setCurrentScore(latestEvent.trajectory_score);
          setCurrentRiskBand(latestEvent.risk_band);
          setPrincipalId(latestEvent.principal_id);

          const traj = await defaultTripwireClient.getTrajectory(targetSession);
          if (traj && traj.events) {
            setEvents(traj.events);
          }

          // Scan for any pending CONFIRM event that has not been handled
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
            setCurrentDecision(decisionObj);
            setCurrentProposal(proposalObj);
            setIsConfirmModalOpen(true);
          }
        }
      }
    };
    sync();
    const interval = setInterval(sync, 2500);
    return () => clearInterval(interval);
  }, [sessionId, autoSyncSession, isConfirmModalOpen, handledModalActionIds]);

  const handleReset = (initialScore: number = 0.0) => {
    TripwireClient.resetSimState(initialScore);
    setCurrentScore(initialScore);
    setCurrentRiskBand(initialScore > 0.65 ? 'HIGH' : initialScore >= 0.35 ? 'MEDIUM' : 'LOW');
    setCurrentProposal(null);
    setCurrentDecision(null);
    setSelectedEvent(null);
    setEvents([]);
    setToolExecutionCounts({});
    setSessionId(`session_${Date.now().toString().slice(-4)}`);
  };

  const handleDispatchProposal = async (proposal: ActionProposal) => {
    setPrincipalId(proposal.principal_id);
    setCurrentProposal(proposal);

    // Call Tripwire
    const decision = await defaultTripwireClient.proposeAction(proposal);
    setCurrentDecision(decision);
    setCurrentScore(decision.trajectory_score);
    setCurrentRiskBand(decision.risk_band);

    const isAllowed = decision.decision === 'ALLOW';
    const isConfirm = decision.decision === 'CONFIRM' || decision.decision === 'HARD_CONFIRM';

    // Record Trajectory Event
    const newEvent: TrajectoryEvent = {
      step: events.length + 1,
      action: proposal.action,
      resource: proposal.resource,
      reversibility: decision.reversibility,
      trajectory_score: decision.trajectory_score,
      risk_band: decision.risk_band,
      decision: decision.decision,
      reason: decision.reason,
      timestamp: new Date().toISOString(),
    };
    setEvents((prev) => [...prev, newEvent]);

    // Record Audit Event
    const newAuditEvent: AuditEvent = {
      action_id: decision.action_id,
      principal_id: proposal.principal_id,
      session_id: sessionId,
      agent_id: proposal.agent_id,
      action: proposal.action,
      resource: proposal.resource,
      reversibility: decision.reversibility,
      trajectory_score: decision.trajectory_score,
      risk_band: decision.risk_band,
      decision: decision.decision,
      reason: decision.reason,
      timestamp: new Date().toISOString(),
      parameters: proposal.parameters,
      execution_status: isAllowed ? 'EXECUTED' : isConfirm ? 'PENDING_APPROVAL' : 'NOT_EXECUTED',
    };
    setAuditEvents((prev) => [newAuditEvent, ...prev]);

    // Protected Tool Handling
    if (isAllowed) {
      setToolExecutionCounts((prev) => ({
        ...prev,
        [proposal.action]: (prev[proposal.action] || 0) + 1,
      }));
    } else if (isConfirm) {
      setPendingConfirmDecision(decision);
      setPendingConfirmProposal(proposal);
      setIsConfirmModalOpen(true);
    }

    // Try to sync with authoritative backend data
    if (backendOnline) {
      const traj = await defaultTripwireClient.getTrajectory(sessionId);
      if (traj && traj.events) {
        setEvents(traj.events);
      }
      const audit = await defaultTripwireClient.getAudit(sessionId);
      if (audit && audit.events) {
        setAuditEvents(audit.events);
      }
    }
  };

  const handleStepAction = async (step: ScenarioStep, principal: string, agentId: string) => {
    await handleDispatchProposal({
      principal_id: principal,
      session_id: sessionId,
      agent_id: agentId,
      action: step.action,
      resource: step.resource,
      parameters: step.parameters,
    });
  };

  const handleHumanConfirm = async (approvedBy: string, approve: boolean) => {
    if (!pendingConfirmDecision || !pendingConfirmProposal) return;

    if (!approve) {
      // DENY: Call backend deny endpoint to persist BLOCK in database and NEVER call n8n
      await defaultTripwireClient.denyAction(pendingConfirmDecision.action_id, approvedBy);

      setAuditEvents((prev) =>
        prev.map((a) =>
          a.action_id === pendingConfirmDecision.action_id
            ? { ...a, decision: 'BLOCK', execution_status: 'NOT_EXECUTED', reason: `Denied by human operator (${approvedBy})`, approved_by: approvedBy }
            : a
        )
      );
      setEvents((prev) =>
        prev.map((evt) =>
          evt.action === pendingConfirmProposal.action && evt.decision === pendingConfirmDecision.decision
            ? { ...evt, decision: 'BLOCK', reason: `Denied by human operator (${approvedBy})` }
            : evt
        )
      );
      if (pendingConfirmDecision) {
        sethandledModalActionIds((prev) => new Set([...prev, pendingConfirmDecision.action_id]));
      }
      setPendingConfirmDecision(null);
      setPendingConfirmProposal(null);

      // Sync with authoritative backend data
      if (backendOnline) {
        const audit = await defaultTripwireClient.getAudit(sessionId);
        if (audit && audit.events) {
          setAuditEvents(audit.events);
        }
      }
      return;
    }

    const res = await defaultTripwireClient.confirmAction(
      pendingConfirmDecision.action_id,
      approvedBy
    );

    if (res.decision === 'ALLOW') {
      setToolExecutionCounts((prev) => ({
        ...prev,
        [pendingConfirmProposal.action]: (prev[pendingConfirmProposal.action] || 0) + 1,
      }));

      setAuditEvents((prev) =>
        prev.map((a) =>
          a.action_id === pendingConfirmDecision.action_id
            ? { ...a, decision: 'ALLOW', execution_status: 'EXECUTED', reason: `Approved by human operator (${approvedBy})`, approved_by: approvedBy }
            : a
        )
      );

      // Trigger actual execution on TechFlow/n8n database layer
      try {
        console.log('🛡️ [TRIPWIRE FRONTEND] Admin Approved Action:', {
          action_id: pendingConfirmDecision.action_id,
          proposal: pendingConfirmProposal,
          approved_by: approvedBy
        });

        const execRes = await fetch('http://localhost:4000/api/agent/execute-confirmed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action_id: pendingConfirmDecision.action_id,
            proposal: pendingConfirmProposal,
            approved_by: approvedBy
          })
        });

        const execData = await execRes.json();
        console.log('🛡️ [TRIPWIRE FRONTEND] TechFlow Gateway Response:', execData);
      } catch (execErr) {
        console.warn('❌ Failed to forward confirmed execution to TechFlow backend:', execErr);
      }
    } else {
      setAuditEvents((prev) =>
        prev.map((a) =>
          a.action_id === pendingConfirmDecision.action_id
            ? { ...a, decision: 'BLOCK', execution_status: 'NOT_EXECUTED', reason: `Denied by backend re-validation after human approval (${approvedBy})`, approved_by: approvedBy }
            : a
        )
      );
    }

    if (pendingConfirmDecision) {
      sethandledModalActionIds((prev) => new Set([...prev, pendingConfirmDecision.action_id]));
    }
    setPendingConfirmDecision(null);
    setPendingConfirmProposal(null);

    // Try to sync with authoritative backend data
    if (backendOnline) {
      const traj = await defaultTripwireClient.getTrajectory(sessionId);
      if (traj && traj.events) {
        setEvents(traj.events);
      }
      const audit = await defaultTripwireClient.getAudit(sessionId);
      if (audit && audit.events) {
        setAuditEvents(audit.events);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/20 border border-indigo-500/40 rounded-xl text-indigo-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
                TRIPWIRE
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/50 font-mono font-bold tracking-wider">
                RUNTIME SECURITY HARNESS
              </span>
            </div>
            <p className="text-xs text-slate-400">Model-Agnostic AI Agent Authorization, Reversibility &amp; Trajectory Middleware</p>
          </div>
        </div>

        {/* Indicators & Session Selector */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
            <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
            <span className="text-slate-400">Harness Engine:</span>
            <span className={`font-semibold ${backendOnline ? 'text-emerald-300' : 'text-amber-300'}`}>
              {backendOnline ? 'FastAPI Connected' : 'Simulated Harness'}
            </span>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
            <span className="text-slate-400">Active Session:</span>
            {availableSessions.length > 0 ? (
              <select
                value={sessionId}
                onChange={(e) => {
                  setSessionId(e.target.value);
                  setAutoSyncSession(false);
                }}
                className="bg-slate-950 text-indigo-300 font-mono font-bold text-xs border border-indigo-900/60 rounded px-2 py-0.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {availableSessions.map((s) => (
                  <option key={s.session_id} value={s.session_id} className="bg-slate-900 text-slate-200">
                    {s.session_id} {s.principal_id ? `(${s.principal_id})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <span className="font-mono text-indigo-300 font-bold">{sessionId}</span>
            )}
            <button
              onClick={() => setAutoSyncSession((prev) => !prev)}
              title={autoSyncSession ? 'Click to lock to current session' : 'Click to enable live auto-sync to newest session'}
              className={`ml-1 px-1.5 py-0.5 text-[10px] font-semibold rounded border transition ${
                autoSyncSession
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 animate-pulse'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              {autoSyncSession ? '⚡ LIVE AUTO-SYNC' : 'MANUAL'}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Subheader */}
      <div className="border-b border-slate-800 bg-slate-900/40 px-6 overflow-x-auto">
        <div className="flex space-x-6 min-w-max">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'dashboard'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Overview &amp; Trajectory Monitor</span>
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'scenarios'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Interactive Scenario Runner</span>
          </button>
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'sandbox'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Custom Action Sandbox</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'audit'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Audit Forensics ({auditEvents.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'tools'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Protected Tools &amp; Invariants</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'architecture'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Architecture &amp; Decision Matrix</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <TrajectoryChart
                events={events}
                currentScore={currentScore}
                currentRiskBand={currentRiskBand}
                selectedEvent={selectedEvent}
                onSelectEvent={(evt) => setSelectedEvent(evt)}
              />
              <ActionTimeline
                events={events}
                onSelectEvent={(evt) => setSelectedEvent(evt)}
              />
            </div>

            <div className="space-y-6">
              <DecisionCard
                currentProposal={currentProposal}
                currentDecision={currentDecision}
                onRequestConfirm={() => setIsConfirmModalOpen(true)}
              />
              <ScenarioRunner
                isRunning={false}
                onRunStep={handleStepAction}
                onReset={handleReset}
                toolExecutionCounts={toolExecutionCounts}
              />
            </div>
          </div>
        )}

        {activeTab === 'scenarios' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <ScenarioRunner
                isRunning={false}
                onRunStep={handleStepAction}
                onReset={handleReset}
                toolExecutionCounts={toolExecutionCounts}
              />
              <ToolRegistryView executionCounts={toolExecutionCounts} />
            </div>

            <div className="lg:col-span-2 space-y-6">
              <TrajectoryChart
                events={events}
                currentScore={currentScore}
                currentRiskBand={currentRiskBand}
                selectedEvent={selectedEvent}
                onSelectEvent={(evt) => setSelectedEvent(evt)}
              />
              <DecisionCard
                currentProposal={currentProposal}
                currentDecision={currentDecision}
                onRequestConfirm={() => setIsConfirmModalOpen(true)}
              />
              <ActionTimeline
                events={events}
                onSelectEvent={(evt) => setSelectedEvent(evt)}
              />
            </div>
          </div>
        )}

        {activeTab === 'sandbox' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <CustomActionSandbox
                onPropose={handleDispatchProposal}
                currentSessionId={sessionId}
              />
              <ToolRegistryView executionCounts={toolExecutionCounts} />
            </div>

            <div className="lg:col-span-2 space-y-6">
              <TrajectoryChart
                events={events}
                currentScore={currentScore}
                currentRiskBand={currentRiskBand}
                selectedEvent={selectedEvent}
                onSelectEvent={(evt) => setSelectedEvent(evt)}
              />
              <DecisionCard
                currentProposal={currentProposal}
                currentDecision={currentDecision}
                onRequestConfirm={() => setIsConfirmModalOpen(true)}
              />
              <ActionTimeline
                events={events}
                onSelectEvent={(evt) => setSelectedEvent(evt)}
              />
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-6">
            <AuditTable auditEvents={auditEvents} />
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <ToolRegistryView executionCounts={toolExecutionCounts} />
          </div>
        )}

        {activeTab === 'architecture' && (
          <ArchitectureView />
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
