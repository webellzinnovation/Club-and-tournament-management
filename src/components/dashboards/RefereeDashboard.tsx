import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  CheckCircle2,
  Clock,
  MapPin,
  Play,
  Award,
  AlertCircle
} from 'lucide-react';

interface RefereeDashboardProps {
  onNavigate: (view: string) => void;
  onSelectMatchForScoring: (matchId: string) => void;
}

export const RefereeDashboard: React.FC<RefereeDashboardProps> = ({
  onNavigate,
  onSelectMatchForScoring
}) => {
  const { matches, activeTournament } = useApp();

  // Referee matches (e.g. Suresh Iyer or ref-1)
  const assignedMatches = matches.filter(
    m => m.refereeId === 'ref-1' || m.refereeName?.toLowerCase().includes('suresh')
  );

  const activeOrUpcoming = assignedMatches.filter(m => m.status !== 'VERIFIED' && m.status !== 'PUBLISHED');
  const finishedMatches = assignedMatches.filter(m => m.status === 'VERIFIED' || m.status === 'PUBLISHED' || m.status === 'COMPLETED');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Referee Header */}
      <div className="bg-neutral-900 text-white rounded-2xl p-5 border border-neutral-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-neutral-950 text-[10px] font-bold tracking-wider uppercase">
              Match Official Console
            </span>
            <span className="text-xs text-neutral-400">ITTF Blue Badge Certified</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight mt-1 text-white">
            Chief Referee: Suresh Iyer
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Officiating {activeTournament?.title}
          </p>
        </div>

        <button
          onClick={() => onNavigate('live_scoring')}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <Play className="w-4 h-4 fill-neutral-950" />
          <span>Open Full Touch Scoring Screen</span>
        </button>
      </div>

      {/* Active Assigned Matches (Priority for mobile referee) */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" />
          <span>Assigned Matches ({activeOrUpcoming.length})</span>
        </h3>

        {activeOrUpcoming.length === 0 ? (
          <div className="p-8 bg-white rounded-xl border border-neutral-200 text-center text-xs text-neutral-500">
            No active officiating matches assigned right now.
          </div>
        ) : (
          <div className="space-y-3">
            {activeOrUpcoming.map(match => (
              <div
                key={match.id}
                className="bg-white rounded-2xl border-2 border-neutral-200 p-5 shadow-xs hover:border-neutral-400 transition-all"
              >
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-800">
                      Match #{match.matchNumber}
                    </span>
                    <span className="text-xs font-semibold text-neutral-600">
                      {match.stageName}
                    </span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    match.status === 'LIVE'
                      ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                      : match.status === 'CALLED'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    {match.status}
                  </span>
                </div>

                <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                      <span>{match.participant1Name}</span>
                      <span className="text-neutral-400 text-xs font-normal">vs</span>
                      <span>{match.participant2Name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      <span className="flex items-center gap-1 font-semibold text-amber-700">
                        <MapPin className="w-3.5 h-3.5" />
                        {match.resourceName || 'Unassigned Table'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        {match.scheduledTime}
                      </span>
                    </div>
                  </div>

                  {/* Touch Scoring CTA */}
                  <button
                    id={`btn-referee-score-${match.id}`}
                    onClick={() => {
                      onSelectMatchForScoring(match.id);
                      onNavigate('live_scoring');
                    }}
                    className="px-5 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Activity className="w-4 h-4 text-amber-400" />
                    <span>{match.status === 'LIVE' ? 'Continue Live Scoring' : 'Start Match & Score'}</span>
                  </button>
                </div>

                {match.score.sport === 'TABLE_TENNIS' && match.score.data.sets.length > 0 && (
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600 font-mono">
                    <span>Games: {match.score.data.sets.map(s => `${s.p1}-${s.p2}`).join(', ')}</span>
                    <span className="font-bold text-amber-600">
                      Current: {match.score.data.currentSetP1} - {match.score.data.currentSetP2}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Duty Matches */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Recently Officiated Matches</span>
        </h3>

        <div className="space-y-2">
          {finishedMatches.map(m => (
            <div key={m.id} className="p-3 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-neutral-900">
                  Match #{m.matchNumber}: {m.participant1Name} vs {m.participant2Name}
                </span>
                <p className="text-[10px] text-neutral-500 mt-0.5">
                  {m.stageName} • {m.resourceName} • Completed at {m.completedAt || '10:20'}
                </p>
              </div>
              <span className="font-bold text-emerald-600">
                Official Result Submitted
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
