import React from 'react';
import { TrajectoryEvent, DecisionType, ReversibilityType } from '../types/tripwire';
import { CheckCircle2, AlertTriangle, ShieldX, History } from 'lucide-react';

interface Props {
  events: TrajectoryEvent[];
  onSelectEvent?: (event: TrajectoryEvent) => void;
  title?: string;
  subtitle?: string;
}

export const ActionTimeline: React.FC<Props> = ({
  events,
  title = 'Action Timeline',
  subtitle = 'Step-by-step proposal audit with trajectory scoring',
}) => {
  const getDecisionIcon = (decision: DecisionType) => {
    switch (decision) {
      case 'ALLOW':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'CONFIRM':
      case 'HARD_CONFIRM':
        return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'BLOCK':
      default:
        return <ShieldX className="w-4 h-4 text-rose-600 shrink-0" />;
    }
  };

  const getDecisionBadge = (decision: DecisionType) => {
    switch (decision) {
      case 'ALLOW':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'CONFIRM':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'HARD_CONFIRM':
        return 'bg-orange-50 text-orange-700 border-orange-300';
      case 'BLOCK':
      default:
        return 'bg-rose-50 text-rose-700 border-rose-300';
    }
  };

  const getReversibilityBadge = (rev: ReversibilityType) => {
    switch (rev) {
      case 'DESTRUCTIVE':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'WRITE':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'READ':
      default:
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="text-[11px] text-slate-500">{subtitle}</p>
          </div>
        </div>
        <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          {events.length} steps evaluated
        </span>
      </div>

      <div className="mt-4 space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {events.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No evaluated actions in this session timeline yet.
          </div>
        ) : (
          events.map((evt, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/30 transition flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                {getDecisionIcon(evt.decision)}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {evt.step}. {evt.action}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${getReversibilityBadge(evt.reversibility)}`}>
                      {evt.reversibility}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Target: <span className="text-slate-700 font-semibold">{evt.resource}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-right">
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono font-medium">Score</span>
                  <span className="font-mono text-xs font-bold text-slate-700">
                    {evt.trajectory_score.toFixed(3)}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border font-mono ${getDecisionBadge(evt.decision)}`}>
                  {evt.decision}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
