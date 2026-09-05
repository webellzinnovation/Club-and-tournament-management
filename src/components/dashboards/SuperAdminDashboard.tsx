import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Users,
  Trophy,
  Activity,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  History,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';

interface SuperAdminDashboardProps {
  onNavigate: (view: string) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onNavigate }) => {
  const { organization, clubs, players, tournaments, matches, auditLogs, payments } = useApp();

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const liveMatches = matches.filter(m => m.status === 'LIVE').length;
  const totalMatches = matches.length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-neutral-900 text-white rounded-2xl p-6 shadow-sm border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold tracking-wider uppercase border border-rose-500/30">
              Super Admin Operations
            </span>
            <span className="text-xs text-neutral-400">Multi-tenant Cloud Instance</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight mt-1 text-neutral-100">
            Platform Master Console
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Managing organizations, federations, multi-sport competition engine tenants, and global athlete identity registers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-sa-audit-logs"
            onClick={() => onNavigate('audit_logs')}
            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 border border-neutral-700 flex items-center gap-1.5 transition-colors"
          >
            <History className="w-4 h-4 text-neutral-400" />
            <span>Audit Trail</span>
          </button>
          <button
            id="btn-sa-create-tournament"
            onClick={() => onNavigate('assignments')}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Activity className="w-4 h-4" />
            <span>Live Competition Room</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Active Tenants</span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-2">12</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+2 federations this quarter</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Registered Athletes</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-2">{players.length}</div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Permanent IDs generated
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Tournaments & Matches</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-2">{tournaments.length}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>{liveMatches} active matches live now</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Platform Billing</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-2">
            ₹{(totalRevenue / 1000).toFixed(1)}k
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Across club & tournament subscriptions
          </div>
        </div>
      </div>

      {/* Two Column Layout: Organizations & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organizations List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Federations & Club Chains</h3>
              <p className="text-xs text-neutral-500">Multi-tenant isolation & data boundary</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 text-xs font-semibold">
              3 Active
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-neutral-200 hover:border-neutral-300 transition-colors flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-neutral-900">{organization.name}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                    {organization.tier}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  8 Registered Clubs • 4 Active Tournaments • 1,240 Athletes
                </p>
              </div>
              <button
                onClick={() => onNavigate('clubs')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Inspect Clubs →
              </button>
            </div>

            {clubs.map(c => (
              <div key={c.id} className="p-3.5 rounded-xl border border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-neutral-900">{c.name} ({c.code})</span>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {c.city} • {c.sportsSupported.join(', ')} • {c.branchesCount} Branches
                  </p>
                </div>
                <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Healthy</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Audit Trail */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-neutral-900">Platform Audit Trail</h3>
            <span className="text-xs text-neutral-400">Live stream</span>
          </div>

          <div className="space-y-3">
            {auditLogs.slice(0, 5).map(log => (
              <div key={log.id} className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-100 text-xs">
                <div className="flex items-center justify-between text-neutral-500 text-[10px]">
                  <span className="font-semibold text-neutral-700">{log.actor} ({log.actorRole})</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="font-medium text-neutral-800 mt-1">{log.details}</p>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-neutral-400 font-mono">
                  <span>{log.action}</span> • <span>{log.entity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
