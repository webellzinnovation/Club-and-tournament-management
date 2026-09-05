import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Trophy,
  CalendarDays,
  Activity,
  Award,
  TrendingUp,
  Flame,
  CheckCircle2,
  Clock,
  MapPin,
  UserCheck,
  Play
} from 'lucide-react';

interface PlayerDashboardProps {
  onNavigate: (view: string) => void;
  onOpenClaimModal: () => void;
}

export const PlayerDashboard: React.FC<PlayerDashboardProps> = ({ onNavigate, onOpenClaimModal }) => {
  const { currentUser, players, matches, activeTournament } = useApp();

  // Find linked player profile or default to Rahul Kumar (TT-00184)
  const linkedId = currentUser.linkedPlayerId || 'TT-00184';
  const playerProfile = players.find(p => p.playerId === linkedId) || players[1];

  // Find matches involving this player
  const playerMatches = matches.filter(
    m =>
      m.participant1Id === 'part-2' ||
      m.participant2Id === 'part-2' ||
      m.participant1Name?.toLowerCase().includes(playerProfile.name.toLowerCase()) ||
      m.participant2Name?.toLowerCase().includes(playerProfile.name.toLowerCase())
  );

  // Next upcoming or live match
  const activeOrUpcomingMatch = playerMatches.find(m => m.status === 'LIVE' || m.status === 'CALLED' || m.status === 'SCHEDULED');
  const pastMatches = playerMatches.filter(m => m.status === 'VERIFIED' || m.status === 'COMPLETED');

  const winRate = playerProfile.matchesPlayed > 0 ? Math.round((playerProfile.wins / playerProfile.matchesPlayed) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Athlete Header Card */}
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-2xl p-6 shadow-sm border border-neutral-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={playerProfile.profilePhoto || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
              alt={playerProfile.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-neutral-700 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {playerProfile.playerId}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-medium">
                  {playerProfile.playingStyle || 'All-round'}
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight mt-1 text-white">
                {playerProfile.name}
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                {playerProfile.clubName} • Hand: {playerProfile.hand === 'LEFT' ? 'Left-handed' : 'Right-handed'} • {playerProfile.category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right px-4 py-2 bg-neutral-800/80 rounded-xl border border-neutral-700">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Official Rating</span>
              <span className="text-xl font-black text-amber-400">{playerProfile.rating}</span>
            </div>
            <div className="text-right px-4 py-2 bg-neutral-800/80 rounded-xl border border-neutral-700">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Tour Points</span>
              <span className="text-xl font-black text-emerald-400">{playerProfile.tournamentPoints}</span>
            </div>
          </div>
        </div>

        {/* Identity Claim Info Banner */}
        <div className="mt-4 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-300 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Linked Account: <strong>{currentUser.email}</strong> is claimed to permanent ID <strong>{playerProfile.playerId}</strong>.
            </span>
          </div>
          <button
            onClick={onOpenClaimModal}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2"
          >
            Switch/Verify Claim
          </button>
        </div>
      </div>

      {/* Athlete Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Career Matches</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-2">{playerProfile.matchesPlayed}</div>
          <div className="text-[11px] text-neutral-500 mt-1">Official competitive games</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Wins / Losses</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-2">
            {playerProfile.wins}W - {playerProfile.losses}L
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {winRate}% Win Percentage
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Club Ranking</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-2">
            #{playerProfile.rankings.clubRank || 2}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            City: #{playerProfile.rankings.cityRank || 4} • State: #{playerProfile.rankings.nationalRank || 22}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Current Form</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-2">W - W - L</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Qualified for Group A Knockouts</div>
        </div>
      </div>

      {/* Next Match Highlight Card */}
      {activeOrUpcomingMatch ? (
        <div className="bg-white rounded-2xl border-2 border-amber-400 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                activeOrUpcomingMatch.status === 'LIVE'
                  ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                  : activeOrUpcomingMatch.status === 'CALLED'
                  ? 'bg-amber-100 text-amber-800 animate-bounce'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {activeOrUpcomingMatch.status === 'LIVE'
                  ? '● LIVE MATCH ON TABLE'
                  : activeOrUpcomingMatch.status === 'CALLED'
                  ? '🔔 MATCH CALLED - REPORT NOW'
                  : 'UPCOMING SCHEDULED MATCH'}
              </span>
              <span className="text-xs font-semibold text-neutral-500">
                Match #{activeOrUpcomingMatch.matchNumber}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-player-open-live-score"
                onClick={() => onNavigate('live_scoring')}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Open Scoreboard</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 items-center">
            {/* Player 1 */}
            <div className="text-left md:text-right">
              <p className="text-xs text-neutral-400 font-medium">Participant 1</p>
              <h3 className="text-base font-bold text-neutral-900">{activeOrUpcomingMatch.participant1Name}</h3>
              <p className="text-xs text-neutral-500">Chennai TT Academy</p>
            </div>

            {/* VS Box & Resource */}
            <div className="text-center py-2 px-4 rounded-xl bg-neutral-50 border border-neutral-200">
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                {activeOrUpcomingMatch.stageName}
              </div>
              <div className="text-sm font-black text-amber-600 mt-1 flex items-center justify-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{activeOrUpcomingMatch.resourceName || 'Table TBD'}</span>
              </div>
              <div className="text-xs text-neutral-600 mt-1 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-neutral-400" />
                <span>{activeOrUpcomingMatch.scheduledTime} (Ref: {activeOrUpcomingMatch.refereeName || 'Assigned'})</span>
              </div>
            </div>

            {/* Player 2 */}
            <div className="text-left">
              <p className="text-xs text-neutral-400 font-medium">Participant 2</p>
              <h3 className="text-base font-bold text-neutral-900">{activeOrUpcomingMatch.participant2Name}</h3>
              <p className="text-xs text-neutral-500">Marina Smashers Club</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-white rounded-xl border border-neutral-200 text-center text-xs text-neutral-500">
          No matches currently scheduled for this athlete today.
        </div>
      )}

      {/* Match History & Past Results */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Recent Tournament Results</h3>
            <p className="text-xs text-neutral-500">Verified official results in {activeTournament?.title}</p>
          </div>
          <button
            onClick={() => onNavigate('standings')}
            className="text-xs text-blue-600 font-semibold hover:text-blue-800"
          >
            Full Standings & Points →
          </button>
        </div>

        <div className="space-y-3">
          {pastMatches.map(m => (
            <div key={m.id} className="p-3.5 rounded-xl border border-neutral-100 bg-neutral-50/60 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-900">
                    Match #{m.matchNumber}: {m.participant1Name} vs {m.participant2Name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">
                    VERIFIED
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {m.stageName} • {m.resourceName} • Verified by {m.verifiedBy || 'Director'}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-neutral-900">
                  {m.score.sport === 'TABLE_TENNIS' && (
                    <span>
                      {m.score.data.sets.map(s => `${s.p1}-${s.p2}`).join(', ')}
                    </span>
                  )}
                </span>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                  Winner: {m.winnerId === m.participant1Id ? m.participant1Name : m.participant2Name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
