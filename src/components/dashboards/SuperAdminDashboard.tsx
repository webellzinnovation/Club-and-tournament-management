import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderKanban,
  Grid2X2,
  Users,
  Trophy,
  Activity,
  ShieldCheck,
  Server,
  CreditCard,
  History,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { DashboardSection } from '../ui/DashboardSection';
import { StatusBadge } from '../ui/StatusBadge';
import { Button, PrimaryButton } from '../ui/Button';

interface SuperAdminDashboardProps {
  onNavigate: (view: string) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onNavigate }) => {
  const { organizations, clubs, players, tournaments, auditLogs, isFirestoreLive } = useApp();

  return (
    <div className="space-y-7">
      {/* 1. Platform Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60 text-[10px] font-bold tracking-wider uppercase">
              Platform Master
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Database: {isFirestoreLive ? 'Cloud Firestore (Production)' : 'Local Storage Engine'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Multi-Tenant Platform Control
          </h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Global telemetry, federation tenants, club registrations, and platform-wide security audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('audit_logs')}
            icon={<History className="w-3.5 h-3.5" />}
          >
            Security Audit
          </Button>
          <PrimaryButton
            size="sm"
            onClick={() => onNavigate('organizations')}
            icon={<FolderKanban className="w-3.5 h-3.5" />}
          >
            Tenant Registry
          </PrimaryButton>
        </div>
      </div>

      {/* 2. Platform Telemetry Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Federation Tenants"
          value={organizations.length}
          subtitle="Isolated multi-tenant domains"
          icon={FolderKanban}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          onClick={() => onNavigate('organizations')}
        />
        <StatCard
          title="Affiliated Clubs"
          value={clubs.length}
          subtitle="Operating sports clubs"
          icon={Grid2X2}
          iconColor="text-emerald-600"
          bgColor="bg-emerald-50"
          onClick={() => onNavigate('clubs')}
        />
        <StatCard
          title="Total Tournaments"
          value={tournaments.length}
          subtitle="Conducted across states"
          icon={Trophy}
          iconColor="text-purple-600"
          bgColor="bg-purple-50"
          onClick={() => onNavigate('tournaments')}
        />
        <StatCard
          title="Global Athletes"
          value={players.length}
          subtitle="Verified athlete profiles"
          icon={Users}
          iconColor="text-amber-600"
          bgColor="bg-amber-50"
          onClick={() => onNavigate('players')}
        />
      </div>

      {/* 3. Organizations / Tenants Overview */}
      <DashboardSection
        title="Active Federation Tenants"
        subtitle="Organizations with dedicated tenant data isolation"
        actionText="Manage all tenants →"
        onAction={() => onNavigate('organizations')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {organizations.map(org => {
            const orgClubs = clubs.filter(c => c.orgId === org.id);
            const orgTournaments = tournaments.filter(t => t.orgId === org.id);

            return (
              <div
                key={org.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-slate-400">ID: {org.id}</span>
                    <StatusBadge status="ACTIVE" size="sm" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{org.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Primary Domain: {org.domain || `${org.id}.sportos.app`}</p>

                  <div className="mt-4 grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-center">
                    <div>
                      <span className="text-xs font-bold text-slate-900">{orgClubs.length}</span>
                      <span className="block text-[10px] text-slate-400">Clubs</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900">{orgTournaments.length}</span>
                      <span className="block text-[10px] text-slate-400">Events</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900">100%</span>
                      <span className="block text-[10px] text-slate-400">Uptime</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DashboardSection>

      {/* 4. Security Audit Logs Preview */}
      <DashboardSection
        title="Recent System Audit Entries"
        subtitle="Role modifications, score approvals, and identity claims"
        actionText="View full audit log →"
        onAction={() => onNavigate('audit_logs')}
      >
        <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100">
            {auditLogs.slice(0, 5).map(log => (
              <div key={log.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{log.action}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Actor: <span className="font-semibold text-slate-700">{log.performedBy}</span> • Target: {log.entityType} ({log.entityId})
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardSection>
    </div>
  );
};
