import React, { useState } from 'react';
import { TrajectoryEvent, RiskBandType } from '../types/tripwire';
import { TrendingUp } from 'lucide-react';

interface Props {
  events: TrajectoryEvent[];
  currentScore: number;
  currentRiskBand: RiskBandType;
  selectedEvent?: TrajectoryEvent | null;
  onSelectEvent?: (event: TrajectoryEvent) => void;
  title?: string;
  subtitle?: string;
}

export const TrajectoryChart: React.FC<Props> = ({
  events,
  currentScore,
  currentRiskBand,
  selectedEvent,
  onSelectEvent,
  title = 'Behavioral Trajectory Monitor',
  subtitle = 'Cross-session score progression & asymmetric EMA decay',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const getRiskColor = (band: RiskBandType) => {
    switch (band) {
      case 'HIGH':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'MEDIUM':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'LOW':
      default:
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 0.65) return '#e11d48'; // rose-600
    if (score >= 0.35) return '#d97706'; // amber-600
    return '#059669'; // emerald-600
  };

  // SVG dimensions
  const width = 640;
  const height = 180;
  const padding = 40;

  const points = events.map((e, idx) => {
    const x = padding + (idx / Math.max(1, events.length - 1)) * (width - 2 * padding);
    const y = height - padding - e.trajectory_score * (height - 2 * padding);
    return { x, y, score: e.trajectory_score, step: e.step, event: e };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  const activeEvent = selectedEvent || (hoveredIndex !== null ? events[hoveredIndex] : null);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="text-[11px] text-slate-500">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">Risk Score</span>
            <span className="text-lg font-mono font-bold" style={{ color: getScoreColor(currentScore) }}>
              {currentScore.toFixed(3)}
            </span>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getRiskColor(currentRiskBand)}`}>
            {currentRiskBand} RISK
          </span>
        </div>
      </div>

      {/* Threshold Bands */}
      <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between font-semibold">
          <span>LOW (&lt; 0.35)</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">ALLOW</span>
        </div>
        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-between font-semibold">
          <span>MED (0.35 - 0.65)</span>
          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">CONFIRM</span>
        </div>
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between font-semibold">
          <span>HIGH (&gt; 0.65)</span>
          <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">BLOCK</span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 relative">
        {events.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-slate-400 text-xs">
            <TrendingUp className="w-8 h-8 mb-2 text-slate-300" />
            <span>No trajectory data recorded yet. Actions will populate the EMA scoring curve live.</span>
          </div>
        ) : (
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 select-none">
            {/* Grid background lines */}
            <line
              x1={padding}
              y1={height - padding}
              x2={width - padding}
              y2={height - padding}
              stroke="#cbd5e1"
              strokeWidth="1"
            />
            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={height - padding}
              stroke="#cbd5e1"
              strokeWidth="1"
            />

            {/* 0.65 HIGH line */}
            <line
              x1={padding}
              y1={height - padding - 0.65 * (height - 2 * padding)}
              x2={width - padding}
              y2={height - padding - 0.65 * (height - 2 * padding)}
              stroke="#e11d48"
              strokeDasharray="4 4"
              strokeWidth="1.2"
              opacity="0.8"
            />
            <text
              x={width - padding - 55}
              y={height - padding - 0.65 * (height - 2 * padding) - 4}
              fill="#e11d48"
              fontSize="10"
              fontWeight="bold"
              fontFamily="monospace"
            >
              HIGH: 0.65
            </text>

            {/* 0.35 MEDIUM line */}
            <line
              x1={padding}
              y1={height - padding - 0.35 * (height - 2 * padding)}
              x2={width - padding}
              y2={height - padding - 0.35 * (height - 2 * padding)}
              stroke="#d97706"
              strokeDasharray="4 4"
              strokeWidth="1.2"
              opacity="0.8"
            />
            <text
              x={width - padding - 55}
              y={height - padding - 0.35 * (height - 2 * padding) - 4}
              fill="#d97706"
              fontSize="10"
              fontWeight="bold"
              fontFamily="monospace"
            >
              MED: 0.35
            </text>

            {/* Trajectory Polyline */}
            {points.length > 1 && (
              <polyline
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2.5"
                points={polylinePoints}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Nodes */}
            {points.map((p, i) => (
              <g
                key={i}
                className="cursor-pointer transition-transform duration-100"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSelectEvent && onSelectEvent(p.event)}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredIndex === i ? '7' : '5'}
                  fill={getScoreColor(p.score)}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x={p.x}
                  y={p.y - 10}
                  fill="#1e293b"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {p.score.toFixed(2)}
                </text>
                <text
                  x={p.x}
                  y={height - 12}
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  Step {p.step}
                </text>
              </g>
            ))}
          </svg>
        )}
      </div>

      {/* Hovered Step Signal Tooltip */}
      {hoveredIndex !== null && events[hoveredIndex] && (
        <div className="bg-slate-50 rounded-lg p-3 border border-indigo-200 text-xs space-y-1.5 animate-in fade-in duration-100">
          <div className="flex justify-between items-center">
            <span className="font-bold text-indigo-900">
              Step #{events[hoveredIndex].step}: {events[hoveredIndex].action}
            </span>
            <span className="font-mono text-slate-600 font-semibold">Score: {events[hoveredIndex].trajectory_score.toFixed(3)}</span>
          </div>
          <p className="text-[11px] text-slate-700">{events[hoveredIndex].reason}</p>
        </div>
      )}
    </div>
  );
};
