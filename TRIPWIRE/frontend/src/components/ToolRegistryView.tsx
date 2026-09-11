import React from 'react';
import { Lock } from 'lucide-react';

interface Props {
  executionCounts: Record<string, number>;
}

export const ToolRegistryView: React.FC<Props> = ({ executionCounts }) => {
  const tools = [
    {
      name: 'read_logs',
      resource: 'logs',
      reversibility: 'READ',
      scope: 'logs:read',
      desc: 'Read system audit logs',
    },
    {
      name: 'search_customers',
      resource: 'db_records:customer_table',
      reversibility: 'READ',
      scope: 'customer:read',
      desc: 'Search customer records',
    },
    {
      name: 'read_customer',
      resource: 'db_records:customer_table',
      reversibility: 'READ',
      scope: 'customer:read',
      desc: 'Read customer details',
    },
    {
      name: 'export_customers',
      resource: 'db_records:customer_table',
      reversibility: 'WRITE',
      scope: 'customer:write',
      desc: 'Export bulk records to external storage',
    },
    {
      name: 'update_customer',
      resource: 'db_records:customer_table',
      reversibility: 'WRITE',
      scope: 'customer:write',
      desc: 'Modify customer attributes',
    },
    {
      name: 'change_permissions',
      resource: 'system:permissions',
      reversibility: 'DESTRUCTIVE',
      scope: 'permissions:write',
      desc: 'Modify RBAC access permissions',
    },
    {
      name: 'drop_table',
      resource: 'db_schema:core',
      reversibility: 'DESTRUCTIVE',
      scope: 'schema:admin',
      desc: 'Permanently drop relational database table',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Protected Tool Registry &amp; Invariants</h3>
            <p className="text-[11px] text-slate-500">Execution gates enforce zero-bypass tool invocation invariant</p>
          </div>
        </div>
        <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          Zero-Bypass Active
        </span>
      </div>

      <p className="text-xs text-slate-600">
        Tool handlers execute <span className="text-slate-900 font-bold">strictly</span> after passing Tripwire authorization and trajectory gates. Invocations remain 0 on blocked attempts.
      </p>

      <div className="space-y-2">
        {tools.map((t) => {
          const count = executionCounts[t.name] || 0;
          return (
            <div
              key={t.name}
              className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs font-mono"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-800">{t.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                      t.reversibility === 'DESTRUCTIVE'
                        ? 'text-rose-700 bg-rose-50 border border-rose-200'
                        : t.reversibility === 'WRITE'
                        ? 'text-amber-700 bg-amber-50 border border-amber-200'
                        : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                    }`}
                  >
                    {t.reversibility}
                  </span>
                </div>
                <span className="text-slate-500 text-[11px] block mt-0.5">Scope: {t.scope} &bull; {t.desc}</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Invocations</span>
                <span
                  className={`font-bold font-mono text-xs px-2 py-0.5 rounded ${
                    count > 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
