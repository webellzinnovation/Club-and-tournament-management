import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Trophy,
  Users,
  Grid2X2,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Play,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Sparkles,
  Layers,
  Award
} from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { DashboardSection } from '../ui/DashboardSection';
import { StatusBadge } from '../ui/StatusBadge';
import { Button, PrimaryButton } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

interface OrganizerDashboardProps {
  onNavigate: (view: string) => void;
  onOpenWizard: () => void;
}

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({
  onNavigate,
  onOpenWizard
}) => {
  const {
    activeTournament,
    events,
    participants,
    matches,
    resources,
    referees,
    schedulingConflicts,
    callPlayers
  } = useApp();

  const [eventTab, setEventTab] = useState('all');

  const liveMatches = matches.filter(m => m.status === 'LIVE');
  const completedMatches = matches.filter(m => m.status === 'COMPLETED' || m.status === 'VERIFIED');
  const pendingMatches = matches.filter(m => m.status === 'SCHEDULED' || m.status === 'READY' || m.status === 'CALLED');

  const filteredEvents = events.filter(e => {
    if (eventTab === 'active') return e.status === 'IN_PROGRESS';
    if (eventTab === 'completed') return e.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-7">
      {/* 1. Tournament Operations Hero Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-1.5 z-10 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-bold tracking-wider uppercase">
              Operations Center
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Sport: {activeTournament?.sport.replace('_', ' ') || 'Multi-Sport'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {activeTournament?.title || 'Tournament Operations'}
          </h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {activeTournament?.venueName} • {activeTournament?.city} • Groups & Elimination Format
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenWizard}
            icon={<Trophy className="w-3.5 h-3.5 text-slate-500" />}
          >
            Tournament Wizard
          </Button>
          <PrimaryButton
            size="sm"
            onClick={() => onNavigate('assignments')}
            icon={<Grid2X2 className="w-3.5 h-3.5" />}
          >
            Assignments Board
          </PrimaryButton>
        </div>
      </div>

      {/* 2. Operational Conflict Alert if any */}
      {schedulingConflicts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200/80 flex items-start justify-between gap-3 text-xs text-rose-800 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0 mt-0.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-rose-950 text-sm">
                {schedulingConflicts.length} Assignment Conflict{schedulingConflicts.length > 1 ? 's' : ''} Detected
              </h4>
              <p className="text-rose-700 mt-0.5 text-xs">
                Overlapping athlete schedules, referee assignments or court contention detected.
              </p>
              <div className="mt-2 space-y-1">
                {schedulingConflicts.slice(0, 2).map((c, idx) => (
                  <div key={idx} className="text-[11px] font-medium text-rose-900 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-rose-500" />
                    <span>{c.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onNavigate('assignments')}
            className="shrink-0"
          >
            Resolve Conflicts →
          </Button>
        </div>
      )}

      {/* 3. Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Matches"
          value={matches.length}
          subtitle="Scheduled for tournament"
          icon={Activity}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          onClick={() => onNavigate('draws')}
        />
        <StatCard
          title="Live on Court"
          value={liveMatches.length}
          subtitle="Active scoring in arena"
          icon={Play}
          iconColor="text-emerald-600"
          bgColor="bg-emerald-50"
          onClick={() => onNavigate('live_scoring')}
        />
        <StatCard
          title="Completed"
          value={completedMatches.length}
          subtitle="Official results verified"
          icon={CheckCircle2}
          iconColor="text-purple-600"
          bgColor="bg-purple-50"
          onClick={() => onNavigate('standings')}
        />
        <StatCard
          title="Registered Athletes"
          value={participants.length}
          subtitle="Seeded across all events"
          icon={Users}
          iconColor="text-amber-600"
          bgColor="bg-amber-50"
          onClick={() => onNavigate('players')}
        />
      </div>

      {/* 4. Active Events (Cards inspired by "My Courses" in the reference) */}
      <DashboardSection
        title="Tournament Events & Draws"
        subtitle="Divisions, brackets, and progress tracking"
        tabs={[
          { id: 'all', label: 'All Events', count: events.length },
          { id: 'active', label: 'Active', count: events.filter(e => e.status === 'IN_PROGRESS').length },
          { id: 'completed', label: 'Completed', count: events.filter(e => e.status === 'COMPLETED').length }
        ]}
        activeTab={eventTab}
        onTabChange={setEventTab}
        actionText="View all draws →"
        onAction={() => onNavigate('draws')}
      >
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map(event => {
              const eventMatches = matches.filter(m => m.eventId === event.id);
              const eventDone = eventMatches.filter(m => m.status === 'COMPLETED' || m.status === 'VERIFIED').length;
              const progress = eventMatches.length > 0 ? Math.round((eventDone / eventMatches.length) * 100) : 0;

              return (
                <div
                  key={event.id}
                  onClick={() => onNavigate('draws')}
                  className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        {event.gender} • {event.type}
                      </span>
                      <StatusBadge status={event.status} size="sm" />
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 tracking-tight line-clamp-1">
                      {event.name}
                    </h3>

                    <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {event.entriesCount || 16} Entries
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-slate-400" />
                        {eventMatches.length} Matches
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-1.5">
                      <span>Progress</span>
                      <span className="font-bold text-slate-800">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Trophy}
            title="No Events Created"
            description="Use the tournament wizard to configure competitive divisions and generate brackets."
            actionText="Launch Tournament Wizard"
            onAction={onOpenWizard}
          />
        )}
      </DashboardSection>

      {/* 5. Live & Next Matches on Court (Inspired by Assignments / Schedule in the reference) */}
      <DashboardSection
        title="Live Arena & Scheduled Matches"
        subtitle="Current court activity and upcoming calls"
        actionText="Assignments Board →"
        onAction={() => onNavigate('assignments')}
      >
        <div className="space-y-3">
          {matches.slice(0, 4).map(match => {
            const isLive = match.status === 'LIVE';
            return (
              <div
                key={match.id}
                className={`bg-white rounded-2xl p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isLive ? 'border-emerald-200/80 shadow-sm ring-1 ring-emerald-500/10' : 'border-slate-200/70 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 font-bold ${
                    isLive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <span className="text-[10px] uppercase font-semibold">Court</span>
                    <span className="text-sm">{match.resourceName?.replace('Table ', 'T') || 'T1'}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={match.status} size="sm" />
                      <span className="text-xs text-slate-400 font-medium">
                        {match.scheduledTime || 'Court Schedule'}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {match.player1?.name || 'TBD'} vs {match.player2?.name || 'TBD'}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Round: {match.roundName || 'Quarter Finals'} • Referee: {match.refereeName || 'Assigned Referee'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {match.status === 'READY' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => callPlayers(match.id)}
                    >
                      Call to Court
                    </Button>
                  )}
                  <PrimaryButton
                    size="sm"
                    onClick={() => onNavigate('live_scoring')}
                    icon={<Activity className="w-3.5 h-3.5" />}
                  >
                    {isLive ? 'Live Scoring' : 'Open Desk'}
                  </PrimaryButton>
                </div>
              </div>
            );
          })}
        </div>
      </DashboardSection>

      {/* 6. High-Level Operational Cards (Dual Highlight Cards like in reference bottom) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dark Highlight Card */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-amber-400">
                TV Broadcast
              </span>
              <Activity className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-base font-bold tracking-tight">Spectator & Arena TV Displays</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Launch full-screen court scoreboard displays for venue projectors and gymnasium monitors.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <span className="text-xs text-slate-400">Resolution: 1080p / 4K</span>
            <Button
              variant="dark"
              size="sm"
              onClick={() => onNavigate('tv_arena')}
              className="bg-white hover:bg-slate-100 text-slate-900 font-bold"
            >
              Launch Arena TV →
            </Button>
          </div>
        </div>

        {/* Soft Accent Card */}
        <div className="bg-emerald-50/80 rounded-2xl p-6 border border-emerald-200/70 text-emerald-950 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-emerald-800 border border-emerald-200/80">
                Public Live Center
              </span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-base font-bold tracking-tight">Public Athlete Portal</h3>
            <p className="text-xs text-emerald-800/80 mt-1.5 leading-relaxed">
              Allow parents, players, and coaches to track live bracket standings, schedules, and verified scorecards.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <span className="text-xs text-emerald-700 font-semibold">Instant Mobile Sync</span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('public_portal')}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Open Public Portal →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
