import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  UserSquare2,
  Clock
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 text-[10px] font-bold tracking-wider uppercase">
              System Immutability
            </span>
            <span className="text-xs text-neutral-400">Enterprise Audit Log Stream</span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mt-1">Platform Operations Audit Trail</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Every critical competition event, scoring override, draw generation, player claim, and payment action is recorded.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs">
        <div className="divide-y divide-neutral-100">
          {auditLogs.map(log => (
            <div key={log.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700">
                    {log.action}
                  </span>
                  <span className="font-bold text-neutral-900">{log.details}</span>
                </div>
                <p className="text-[11px] text-neutral-500 flex items-center gap-2">
                  <span>Actor: <strong>{log.actor}</strong> ({log.actorRole})</span>
                  <span>•</span>
                  <span>Entity: {log.entity} (#{log.entityId})</span>
                </p>
              </div>

              <div className="text-right text-[11px] text-neutral-400 font-mono">
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
