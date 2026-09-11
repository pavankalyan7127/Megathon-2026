import React from 'react';
import { Shield, ShieldAlert, Lock, Activity, Terminal } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-mono font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>PS1: RUNTIME SECURITY HARNESS FOR AI AGENTS</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Defense-in-Depth Middleware for Autonomous AI Workflows
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            When organizations deploy AI agents, they harden the model with system prompts and jailbreak filters—building a well-defended front door on a house with no walls. Tripwire sits between the AI agent and protected tools, enforcing authorization boundaries, reversibility gates, and cross-session behavioral trajectory monitoring that foundation models cannot self-enforce.
          </p>
        </div>
      </div>

      {/* 3 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm">
          <div className="p-2.5 w-fit rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">1. Authorization Context Propagation</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every agent action carries a non-forgeable principal scope token. Any unauthorized or out-of-scope tool call is blocked at the middleware layer before touching databases or cloud APIs.
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm">
          <div className="p-2.5 w-fit rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">2. Action Reversibility Gates</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Actions are classified into <span className="text-emerald-700 font-bold font-mono">READ</span>, <span className="text-amber-700 font-bold font-mono">WRITE</span>, and <span className="text-rose-700 font-bold font-mono">DESTRUCTIVE</span> tiers. Destructive operations mandate explicit Human-in-the-Loop (HITL) confirmation.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm">
          <div className="p-2.5 w-fit rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">3. Cross-Session Trajectory Monitor</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tracks behavioral drift and asymmetric EMA scoring across turns and sessions. Catches "Boiling Frog" multi-day escalation attacks where individual steps appear routine in isolation.
          </p>
        </div>
      </div>

      {/* Decision Matrix Reference */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-indigo-600" />
          <span>Frozen Decision Matrix (Pre-Implementation Contract Section 9)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase bg-slate-50">
                <th className="py-2.5 px-3 font-bold">Authorization</th>
                <th className="py-2.5 px-3 font-bold">Risk Band</th>
                <th className="py-2.5 px-3 font-bold">Reversibility</th>
                <th className="py-2.5 px-3 font-bold">Decision</th>
                <th className="py-2.5 px-3 font-bold">Tool Execution Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-2.5 px-3 text-rose-700 font-bold">DENIED</td>
                <td className="py-2.5 px-3 text-slate-600">Any</td>
                <td className="py-2.5 px-3 text-slate-600">Any</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">BLOCK</span></td>
                <td className="py-2.5 px-3 text-slate-600">Execution = 0</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-emerald-700 font-bold">ALLOWED</td>
                <td className="py-2.5 px-3 text-emerald-700">LOW (&lt; 0.35)</td>
                <td className="py-2.5 px-3 text-emerald-700">READ</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">ALLOW</span></td>
                <td className="py-2.5 px-3 text-slate-600">Immediate Execution</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-emerald-700 font-bold">ALLOWED</td>
                <td className="py-2.5 px-3 text-emerald-700">LOW (&lt; 0.35)</td>
                <td className="py-2.5 px-3 text-amber-700">WRITE</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">ALLOW</span></td>
                <td className="py-2.5 px-3 text-slate-600">Immediate Execution</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-emerald-700 font-bold">ALLOWED</td>
                <td className="py-2.5 px-3 text-emerald-700">LOW (&lt; 0.35)</td>
                <td className="py-2.5 px-3 text-rose-700">DESTRUCTIVE</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">CONFIRM</span></td>
                <td className="py-2.5 px-3 text-slate-600">Requires Human Sign-off</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-emerald-700 font-bold">ALLOWED</td>
                <td className="py-2.5 px-3 text-amber-700">MEDIUM (0.35 - 0.65)</td>
                <td className="py-2.5 px-3 text-emerald-700">READ</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">ALLOW</span></td>
                <td className="py-2.5 px-3 text-slate-600">Immediate Execution</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-emerald-700 font-bold">ALLOWED</td>
                <td className="py-2.5 px-3 text-amber-700">MEDIUM (0.35 - 0.65)</td>
                <td className="py-2.5 px-3 text-amber-700">WRITE</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">CONFIRM</span></td>
                <td className="py-2.5 px-3 text-slate-600">Requires Human Sign-off</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-emerald-700 font-bold">ALLOWED</td>
                <td className="py-2.5 px-3 text-amber-700">MEDIUM (0.35 - 0.65)</td>
                <td className="py-2.5 px-3 text-rose-700">DESTRUCTIVE</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">HARD_CONFIRM</span></td>
                <td className="py-2.5 px-3 text-slate-600">Requires Dual Re-validation</td>
              </tr>
              <tr className="bg-rose-50/60">
                <td className="py-2.5 px-3 text-emerald-700 font-bold">ALLOWED</td>
                <td className="py-2.5 px-3 text-rose-700 font-bold">HIGH (&gt; 0.65)</td>
                <td className="py-2.5 px-3 text-slate-700 font-medium">ANY</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">BLOCK</span></td>
                <td className="py-2.5 px-3 text-rose-700 font-bold">Autonomous Halt (0 Executions)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
