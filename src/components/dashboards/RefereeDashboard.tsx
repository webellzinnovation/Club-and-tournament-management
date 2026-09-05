import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  CheckCircle2,
  Clock,
  Play,
  ArrowRight,
  ShieldCheck,
  Award,
  AlertCircle
} from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { DashboardSection } from '../ui/DashboardSection';
import { StatusBadge } from '../ui/StatusBadge';
import { Button, PrimaryButton } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

interface RefereeDashboardProps {
  onNavigate: (view: string) => void;
  onSelectMatchForScoring: (matchId: string) => void;
}

export const RefereeDashboard: React.FC<RefereeDashboardProps> = ({
  onNavigate,
  onSelectMatchForScoring
}) => {
  const { currentUser, matches, activeTournament } = useApp();

  // Filter matches assigned to this referee or currently unofficiated
  const assignedMatches = matches.filter(
    m => m.refereeId === currentUser?.id || !m.refereeId
  );

  const liveMatches = assignedMatches.filter(m => m.status === 'LIVE');
  const upcomingMatches = assignedMatches.filter(m => m.status === 'SCHEDULED' || m.status === 'READY' || m.status === 'CALLED');
  const completedMatches = assignedMatches.filter(m => m.status === 'COMPLETED' || m.status === 'VERIFIED');

  return (
    <div className="space-y-7">
      {/* 1. Referee Hero Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60 text-[10px] font-bold tracking-wider uppercase">
              Officiating Desk
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Tournament: {activeTournament?.title}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Court Control & Match Scoring
          </h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Officiate assigned games, update points on touch console, and verify final match scores.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <PrimaryButton
            size="sm"
            onClick={() => onNavigate('live_scoring')}
            icon={<Activity className="w-3.5 h-3.5" />}
          >
            Launch Scorer Console
          </PrimaryButton>
        </div>
      </div>

      {/* 2. Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Matches"
          value={assignedMatches.length}
          subtitle="Assigned on duty today"
          icon={Activity}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Active Live Games"
          value={liveMatches.length}
          subtitle="Currently on table"
          icon={Play}
          iconColor="text-emerald-600"
          bgColor="bg-emerald-50"
          onClick={() => onNavigate('live_scoring')}
        />
        <StatCard
          title="Completed & Signed"
          value={completedMatches.length}
          subtitle="Scoresheets verified"
          icon={CheckCircle2}
          iconColor="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          title="Upcoming In Queue"
          value={upcomingMatches.length}
          subtitle="Next rounds assigned"
          icon={Clock}
          iconColor="text-amber-600"
          bgColor="bg-amber-50"
        />
      </div>

      {/* 3. Assigned Matches Table / List */}
      <DashboardSection
        title="Duty Schedule & Court Fixtures"
        subtitle="Select a match to start officiating or recording game points"
      >
        {assignedMatches.length > 0 ? (
          <div className="space-y-3">
            {assignedMatches.map(match => {
              const isLive = match.status === 'LIVE';
              return (
                <div
                  key={match.id}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isLive ? 'border-emerald-300 ring-1 ring-emerald-500/15 shadow-sm' : 'border-slate-200/70 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-bold shrink-0 ${
                      isLive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      <span className="text-[10px] uppercase font-semibold">Table</span>
                      <span className="text-sm">{match.resourceName?.replace('Table ', 'T') || 'T1'}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={match.status} size="sm" />
                        <span className="text-xs text-slate-400 font-medium">
                          {match.scheduledTime || 'Scheduled'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {match.player1?.name || 'TBD'} vs {match.player2?.name || 'TBD'}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {match.roundName || 'Quarter Finals'} • Best of 5 Sets
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <PrimaryButton
                      size="sm"
                      onClick={() => onSelectMatchForScoring(match.id)}
                      icon={<Activity className="w-3.5 h-3.5" />}
                    >
                      {isLive ? 'Score Live Now' : 'Open Scorecard'}
                    </PrimaryButton>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Activity}
            title="No Matches Assigned"
            description="You currently have no matches assigned to your officiating profile for this tournament."
          />
        )}
      </DashboardSection>
    </div>
  );
};
