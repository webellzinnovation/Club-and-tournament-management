import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Trophy,
  Users,
  Grid2X2,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Megaphone,
  UserSquare2,
  Play,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

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

  const liveMatches = matches.filter(m => m.status === 'LIVE');
  const completedMatches = matches.filter(m => m.status === 'COMPLETED' || m.status === 'VERIFIED');
  const unassignedMatches = matches.filter(m => !m.resourceId);
  const unassignedReferees = matches.filter(m => !m.refereeId);
  const availableResources = resources.filter(r => r.status === 'AVAILABLE');
  const pendingVerification = matches.filter(m => m.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      {/* Tournament Director Banner */}
      <div className="bg-neutral-900 text-white rounded-2xl p-6 border border-neutral-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 text-[10px] font-bold tracking-wider uppercase">
              Operations Center
            </span>
            <span className="text-xs text-neutral-400">Sport: {activeTournament?.sport.replace('_', ' ')}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight mt-1 text-neutral-100">
            {activeTournament?.title}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {activeTournament?.venueName} • {activeTournament?.city} • Format: Groups + Knockout
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-org-open-wizard"
            onClick={onOpenWizard}
            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors border border-neutral-700"
          >
            Tournament Wizard
          </button>
          <button
            id="btn-org-assignments"
            onClick={() => onNavigate('assignments')}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Grid2X2 className="w-4 h-4" />
            <span>Assignments Board</span>
          </button>
        </div>
      </div>

      {/* Conflict Alert Banner if any */}
      {schedulingConflicts.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-3 text-xs text-rose-800">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-rose-900">
                {schedulingConflicts.length} Assignment Conflict{schedulingConflicts.length > 1 ? 's' : ''} Detected
              </h4>
              <p className="text-rose-700 mt-0.5">
                Overlapping player schedules, referee double-bookings, or resource conflicts found in current schedule.
              </p>
              <div className="mt-2 space-y-1">
                {schedulingConflicts.slice(0, 2).map((c, idx) => (
                  <div key={idx} className="text-[11px] font-medium text-rose-800">
                    • {c.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('assignments')}
            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 shrink-0"
          >
            Resolve in Assignments →
          </button>
        </div>
      )}

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Matches Today</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-2">{matches.length}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>{liveMatches.length} Live on Tables</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Completed / Verified</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-2">{completedMatches.length}</div>
          <div className="text-[11px] text-neutral-500 mt-1">
            {pendingVerification.length} awaiting verification
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Unassigned Matches</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-2">{unassignedMatches.length}</div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Needs table/court allocation
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Available Resources</span>
            <Grid2X2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-2">{availableResources.length} / {resources.length}</div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Tables ready for matches
          </div>
        </div>
      </div>

      {/* Live Match Control Board */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Active Live Matches</h3>
            <p className="text-xs text-neutral-500">Real-time table scores and referee status</p>
          </div>
          <button
            onClick={() => onNavigate('live_scoring')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Live Scoring Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {liveMatches.map(m => (
            <div key={m.id} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-all">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                <span className="text-xs font-bold text-neutral-900">{m.resourceName}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 animate-pulse">
                  LIVE NOW
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-neutral-900">{m.participant1Name}</p>
                  <p className="text-xs font-bold text-neutral-900 mt-1">{m.participant2Name}</p>
                </div>

                <div className="text-right">
                  {m.score.sport === 'TABLE_TENNIS' && (
                    <div>
                      <div className="text-xs font-mono font-bold text-neutral-900">
                        Games: {m.score.data.sets.filter(s => s.p1 > s.p2).length} - {m.score.data.sets.filter(s => s.p2 > s.p1).length}
                      </div>
                      <div className="text-sm font-mono font-black text-amber-600 mt-0.5">
                        Set {m.score.data.currentSetIndex}: {m.score.data.currentSetP1} - {m.score.data.currentSetP2}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
                <span>Official: {m.refereeName || 'Chief Umpire'}</span>
                <button
                  onClick={() => callPlayers(m.id, 0)}
                  className="px-2 py-1 bg-amber-100 text-amber-800 rounded font-semibold text-[10px] hover:bg-amber-200"
                >
                  Call Players
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Access Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('assignments')}
          className="p-4 bg-white rounded-xl border border-neutral-200 hover:border-neutral-300 cursor-pointer shadow-xs transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
            <Grid2X2 className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-neutral-900">Assignments & Schedule</h4>
          <p className="text-[11px] text-neutral-500 mt-1">
            Assign tables 1-6, allocate certified referees, resolve timing overlaps, and call players.
          </p>
        </div>

        <div
          onClick={() => onNavigate('draws')}
          className="p-4 bg-white rounded-xl border border-neutral-200 hover:border-neutral-300 cursor-pointer shadow-xs transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center mb-2">
            <Trophy className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-neutral-900">Draws & Brackets</h4>
          <p className="text-[11px] text-neutral-500 mt-1">
            Inspect interactive knockout tree, group standings, seedings, and progression paths.
          </p>
        </div>

        <div
          onClick={() => onNavigate('announcements')}
          className="p-4 bg-white rounded-xl border border-neutral-200 hover:border-neutral-300 cursor-pointer shadow-xs transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center mb-2">
            <Megaphone className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-neutral-900">Broadcast Announcements</h4>
          <p className="text-[11px] text-neutral-500 mt-1">
            Send urgent arena calls, schedule changes, or broadcast to all authenticated athlete mobile inboxes.
          </p>
        </div>
      </div>
    </div>
  );
};
