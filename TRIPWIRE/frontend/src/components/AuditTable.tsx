import React, { useState } from 'react';
import { AuditEvent, DecisionType } from '../types/tripwire';
import { Terminal, Download, Search, RefreshCw, Database } from 'lucide-react';

interface Props {
  auditEvents: AuditEvent[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const AuditTable: React.FC<Props> = ({ auditEvents, onRefresh, isLoading }) => {
  const [filterDecision, setFilterDecision] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredEvents = auditEvents.filter((evt) => {
    const matchesFilter = filterDecision === 'ALL' || evt.decision === filterDecision;
    const matchesSearch =
      evt.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.principal_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evt.session_id && evt.session_id.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditEvents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tripwire_db_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getDecisionBadge = (decision: string) => {
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

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Database Audit &amp; Forensics Trail</h3>
            <p className="text-[11px] text-slate-500">Live authoritative logs queried directly from SQLite database</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer border border-slate-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
              <span>Refresh DB Logs</span>
            </button>
          )}

          <button
            onClick={handleExportJson}
            disabled={auditEvents.length === 0}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, resource, session, principal, reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono text-xs"
          />
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          {['ALL', 'ALLOW', 'CONFIRM', 'BLOCK'].map((btn) => (
            <button
              key={btn}
              onClick={() => setFilterDecision(btn)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                filterDecision === btn ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredEvents.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No audit records found in the database.
          </div>
        ) : (
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase bg-slate-50">
                <th className="py-2.5 px-3 font-bold">Timestamp</th>
                <th className="py-2.5 px-3 font-bold">Session</th>
                <th className="py-2.5 px-3 font-bold">Principal</th>
                <th className="py-2.5 px-3 font-bold">Action</th>
                <th className="py-2.5 px-3 font-bold">Resource</th>
                <th className="py-2.5 px-3 font-bold">Class</th>
                <th className="py-2.5 px-3 font-bold">Score</th>
                <th className="py-2.5 px-3 font-bold">Decision</th>
                <th className="py-2.5 px-3 font-bold">Exec Status</th>
                <th className="py-2.5 px-3 font-bold">Approved By</th>
                <th className="py-2.5 px-3 font-bold">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredEvents.map((evt, idx) => (
                <tr key={idx} className="hover:bg-indigo-50/20 transition">
                  <td className="py-2.5 px-3 text-slate-600 text-[11px] whitespace-nowrap">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 px-3 text-indigo-700 font-bold text-[11px] whitespace-nowrap">{evt.session_id}</td>
                  <td className="py-2.5 px-3 text-slate-800 font-medium">{evt.principal_id}</td>
                  <td className="py-2.5 px-3 text-slate-900 font-bold">{evt.action}</td>
                  <td className="py-2.5 px-3 text-slate-600 truncate max-w-[180px]">{evt.resource}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        evt.reversibility === 'DESTRUCTIVE'
                          ? 'text-rose-700 bg-rose-50 border border-rose-200'
                          : evt.reversibility === 'WRITE'
                          ? 'text-amber-700 bg-amber-50 border border-amber-200'
                          : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                      }`}
                    >
                      {evt.reversibility}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-800 font-bold">{evt.trajectory_score.toFixed(3)}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getDecisionBadge(evt.decision)}`}>
                      {evt.decision}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {evt.execution_status && (
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                        evt.execution_status === 'EXECUTED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        evt.execution_status === 'NOT_EXECUTED' ? 'bg-slate-100 text-slate-500 border border-slate-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {evt.execution_status}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 font-mono text-[10px]">{evt.approved_by || '-'}</td>
                  <td className="py-2.5 px-3 text-slate-700 max-w-md font-sans text-xs">{evt.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
