import React, { useState } from 'react';
import { ActionDecision, ActionProposal } from '../types/tripwire';
import { AlertOctagon, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  decision: ActionDecision | null;
  proposal: ActionProposal | null;
  onConfirm: (approvedBy: string, approve: boolean) => void;
  onClose: () => void;
}

export const ConfirmationModal: React.FC<Props> = ({
  isOpen,
  decision,
  proposal,
  onConfirm,
  onClose,
}) => {
  const [approverId, setApproverId] = useState('admin_security_01');

  if (!isOpen || !decision || !proposal) return null;

  const isHardConfirm = decision.decision === 'HARD_CONFIRM';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-start space-x-3">
          <div className={`p-3 rounded-xl ${isHardConfirm ? 'bg-orange-50 text-orange-600 border border-orange-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
            {isHardConfirm ? <ShieldAlert className="w-6 h-6" /> : <AlertOctagon className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isHardConfirm ? 'HARD CONFIRMATION GATE' : 'HUMAN APPROVAL REQUIRED'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tripwire has intercepted this action from autonomous execution pending human review &amp; authorization.
            </p>
          </div>
        </div>

        {/* Action Details Summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-slate-600">
            <span>Action Name:</span>
            <span className="font-mono text-indigo-700 font-bold">{proposal.action}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Target Resource:</span>
            <span className="font-mono text-slate-800 font-semibold">{proposal.resource}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Reversibility Class:</span>
            <span className="font-semibold text-rose-700 font-mono">{decision.reversibility}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Trajectory Risk Score:</span>
            <span className="font-mono text-amber-700 font-bold">{decision.trajectory_score.toFixed(3)} ({decision.risk_band})</span>
          </div>
          <div className="pt-2 border-t border-slate-200 text-slate-700">
            <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Harness Intercept Reason:</span>
            <p className="text-xs text-slate-800 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
              {decision.reason}
            </p>
          </div>
        </div>

        {/* Approver Input */}
        <div className="space-y-1.5 text-xs">
          <label className="text-slate-700 font-semibold">Authorizing Principal / SOC Approver ID:</label>
          <input
            type="text"
            value={approverId}
            onChange={(e) => setApproverId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-500"
            placeholder="e.g. admin_sec_ops"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => {
              onConfirm(approverId, false);
              onClose();
            }}
            className="py-2.5 px-4 bg-white hover:bg-rose-50 text-rose-700 font-semibold rounded-lg border border-rose-300 hover:border-rose-400 transition text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
          >
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>DENY (Block Execution)</span>
          </button>

          <button
            onClick={() => {
              onConfirm(approverId, true);
              onClose();
            }}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition text-xs flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>APPROVE &amp; REVALIDATE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
