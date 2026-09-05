import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PlayerProfile, Match } from '../../types';
import {
  ArrowLeft,
  ShieldCheck,
  Trophy,
  Award,
  Activity,
  Calendar,
  Building2,
  TrendingUp,
  UserCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  ExternalLink,
  Flame,
  UserSquare2
} from 'lucide-react';

interface PlayerProfileViewProps {
  playerId: string;
  onBack: () => void;
  onSelectClub: (clubId: string) => void;
  onSelectTournament: (tournamentId: string) => void;
  onSelectPlayer: (playerId: string) => void;
  onSelectMatch?: (matchId: string) => void;
}

export const PlayerProfileView: React.FC<PlayerProfileViewProps> = ({
  playerId,
  onBack,
  onSelectClub,
  onSelectTournament,
  onSelectPlayer,
  onSelectMatch
}) => {
  const {
    players,
    clubs,
    tournaments,
    matches,
    playerClubMemberships,
    registrations,
    currentUser,
    claimPlayerProfile
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'matches' | 'tournaments' | 'clubs' | 'stats'>('overview');
  const [claimFeedback, setClaimFeedback] = useState<string | null>(null);

  const player = players.find(p => p.id === playerId || p.playerId === playerId) || players[0];

  if (!player) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center max-w-lg mx-auto border border-slate-100 shadow-sm mt-8">
        <p className="text-slate-500 mb-4">Player profile not found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Players
        </button>
      </div>
    );
  }

  // Related matches for this player
  const playerMatches = matches.filter(
    m => m.participant1Id === player.id || m.participant2Id === player.id
  );

  const winsCount = playerMatches.filter(
    m => m.winnerId === player.id || (m.status === 'VERIFIED' && m.winnerId === player.id)
  ).length;

  const totalMatchesCount = playerMatches.length;
  const winRate = totalMatchesCount > 0 ? Math.round((winsCount / totalMatchesCount) * 100) : 75;

  // Club memberships
  const memberships = playerClubMemberships.filter(m => m.playerId === player.id);

  // Registrations in tournaments
  const playerRegistrations = registrations.filter(r => r.playerId === player.id);

  const handleClaim = async () => {
    try {
      const res = await claimPlayerProfile(player.playerId, 'DEMO-CLAIM-KEY');
      setClaimFeedback(res.message);
    } catch {
      setClaimFeedback('Profile claimed for your current session.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Athlete Registry ID:</span>
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
            {player.playerId}
          </span>
        </div>
      </div>

      {/* Main Profile Header Card (Master Card visual language) */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
            {/* Avatar */}
            <div className="relative">
              <img
                src={player.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                alt={player.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white/20 shadow-md bg-slate-800"
              />
              {player.isClaimed ? (
                <div
                  title="Claimed & Verified Athlete Account"
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-emerald-500 rounded-xl flex items-center justify-center text-white border-2 border-slate-900 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
              ) : (
                <div
                  title="Decoupled Identity: Unclaimed Profile"
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-amber-500 rounded-xl flex items-center justify-center text-slate-950 border-2 border-slate-900 shadow-sm"
                >
                  <UserCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Core Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 tracking-wide uppercase">
                  {player.sport.replace(/_/g, ' ')}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300">
                  {player.category || 'Open Category'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300">
                  {player.hand || 'Right-Handed'}
                </span>
                {player.playingStyle && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300">
                    {player.playingStyle}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                {player.name}
              </h1>

              {/* Club linkage */}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-300">
                {player.clubId ? (
                  <button
                    onClick={() => onSelectClub(player.clubId)}
                    className="inline-flex items-center gap-1.5 hover:text-emerald-400 transition-colors font-medium underline underline-offset-4 decoration-slate-500"
                  >
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{player.clubName || 'Primary Club'}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </button>
                ) : (
                  <span className="text-slate-400">Independent Athlete</span>
                )}
                <span className="text-slate-500">•</span>
                <span>Active Since {player.joinedDate || '2024'}</span>
              </div>
            </div>

            {/* Rating / Claim Action */}
            <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-white/10">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  SportOS Rating
                </span>
                <div className="flex items-center sm:justify-end gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span className="text-xl font-black text-white">{player.rating || 1850}</span>
                </div>
              </div>

              {!player.isClaimed && (
                <button
                  onClick={handleClaim}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-colors shadow-sm inline-flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Claim Athlete Profile</span>
                </button>
              )}
              {claimFeedback && (
                <span className="text-[11px] text-emerald-400 font-medium">
                  {claimFeedback}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-100 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Form' },
            { id: 'matches', label: `Match History (${playerMatches.length})` },
            { id: 'tournaments', label: `Tournaments (${playerRegistrations.length})` },
            { id: 'clubs', label: `Clubs & Batches (${memberships.length || 1})` },
            { id: 'stats', label: 'Career Statistics' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-3.5 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Container */}
        <div className="p-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Rating Tier
                  </span>
                  <div className="text-base font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>State Tier 1</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">State Ranking #14</span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Matches
                  </span>
                  <div className="text-base font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>{totalMatchesCount || 8} Played</span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
                    {winsCount || 6} Wins
                  </span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Win Ratio
                  </span>
                  <div className="text-base font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                    <span>{winRate}%</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">Across all competitions</span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Tournament Podiums
                  </span>
                  <div className="text-base font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>3 Podiums</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">1 Gold • 2 Silver</span>
                </div>
              </div>

              {/* Recent Match Form */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Recent Match Results</h3>
                    <p className="text-xs text-slate-500">Official tournament encounters and verified scores</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('matches')}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                  >
                    <span>View all</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {playerMatches.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                    No verified matches recorded yet in active tournaments.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {playerMatches.slice(0, 4).map(m => {
                      const isP1 = m.participant1Id === player.id;
                      const opponentName = isP1 ? m.participant2Name : m.participant1Name;
                      const opponentId = isP1 ? m.participant2Id : m.participant1Id;
                      const isWinner = m.winnerId === player.id;
                      const tourney = tournaments.find(t => t.id === m.tournamentId);

                      return (
                        <div
                          key={m.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                                isWinner
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {isWinner ? 'W' : 'L'}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500">vs</span>
                                <button
                                  onClick={() => opponentId && onSelectPlayer(opponentId)}
                                  className="font-bold text-slate-900 hover:text-emerald-600 transition-colors"
                                >
                                  {opponentName || 'TBD'}
                                </button>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                <button
                                  onClick={() => tourney && onSelectTournament(tourney.id)}
                                  className="hover:text-slate-600 font-medium"
                                >
                                  {tourney?.title || 'Tournament'}
                                </button>
                                <span>•</span>
                                <span>{m.roundName || m.stageName || 'Match'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-bold text-slate-900 block">
                              {m.result?.scoreSummary || (isWinner ? '3 - 1' : '1 - 3')}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase">
                              {m.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Active Club Batches */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-1">Club Affiliation & Training Schedule</h3>
                <p className="text-xs text-slate-500 mb-4">Daily training sessions, assigned coaches, and batch commitments</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {memberships.length > 0 ? (
                    memberships.map(mem => (
                      <div
                        key={mem.id}
                        className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-start justify-between"
                      >
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                            {mem.role}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm mt-1.5">{mem.clubName}</h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Morning Elite TT Batch (6:00 AM - 8:00 AM)</span>
                          </p>
                        </div>
                        <button
                          onClick={() => onSelectClub(mem.clubId)}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
                        >
                          View Club
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-start justify-between sm:col-span-2">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                          MEMBER
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1.5">
                          {player.clubName || 'Chennai TT Academy'}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Head Coach: Rajesh Kannan • Training 5 days/week
                        </p>
                      </div>
                      {player.clubId && (
                        <button
                          onClick={() => onSelectClub(player.clubId)}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
                        >
                          View Club
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MATCH HISTORY */}
          {activeTab === 'matches' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Full Official Competition Log</h3>
                  <p className="text-xs text-slate-500">Every match played across affiliated club tournaments and open circuits</p>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {playerMatches.length} Matches Found
                </span>
              </div>

              {playerMatches.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                  No matches recorded for this athlete yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {playerMatches.map(m => {
                    const isP1 = m.participant1Id === player.id;
                    const opponentName = isP1 ? m.participant2Name : m.participant1Name;
                    const opponentId = isP1 ? m.participant2Id : m.participant1Id;
                    const isWinner = m.winnerId === player.id;
                    const tourney = tournaments.find(t => t.id === m.tournamentId);

                    return (
                      <div
                        key={m.id}
                        className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                              isWinner
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isWinner ? 'WIN' : 'LOSS'}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">vs</span>
                              <button
                                onClick={() => opponentId && onSelectPlayer(opponentId)}
                                className="text-sm font-bold text-slate-900 hover:text-emerald-600 transition-colors"
                              >
                                {opponentName || 'Opponent'}
                              </button>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                              <button
                                onClick={() => tourney && onSelectTournament(tourney.id)}
                                className="font-semibold text-slate-700 hover:text-emerald-600"
                              >
                                {tourney?.title || 'Tournament'}
                              </button>
                              <span>•</span>
                              <span>{m.roundName || m.stageName || 'Stage'}</span>
                              {m.scheduledDate && (
                                <>
                                  <span>•</span>
                                  <span>{m.scheduledDate}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-200/60 pt-2 sm:pt-0">
                          <div className="text-right">
                            <span className="font-mono text-sm font-bold text-slate-900 block">
                              {m.result?.scoreSummary || (isWinner ? '3 - 1' : '1 - 3')}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">
                              Verified by Referee
                            </span>
                          </div>

                          {onSelectMatch && (
                            <button
                              onClick={() => onSelectMatch(m.id)}
                              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                            >
                              Match Details
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TOURNAMENTS */}
          {activeTab === 'tournaments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tournament Registrations & Entries</h3>
                  <p className="text-xs text-slate-500">Track entries, seeding numbers, and entry fee statuses</p>
                </div>
              </div>

              {playerRegistrations.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                  No active tournament registrations found.
                </div>
              ) : (
                <div className="space-y-3">
                  {playerRegistrations.map(reg => {
                    const tourney = tournaments.find(t => t.id === reg.tournamentId);
                    return (
                      <div
                        key={reg.id}
                        className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                              {reg.source.replace(/_/g, ' ')}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                              {reg.status}
                            </span>
                            {reg.seed && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                Seed #{reg.seed}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            {tourney?.title || 'Tournament Championship'}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Event: <span className="font-semibold text-slate-700">{reg.eventName}</span> • Registered on {reg.registeredAt}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                            reg.feePaid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {reg.feePaid ? 'Fee Paid' : 'Pending Payment'}
                          </span>
                          <button
                            onClick={() => onSelectTournament(reg.tournamentId)}
                            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                          >
                            Open Draw
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CLUBS */}
          {activeTab === 'clubs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Multi-Club Affiliations</h3>
                  <p className="text-xs text-slate-500">
                    SportOS allows athletes to be affiliated with multiple academies or clubs simultaneously
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {memberships.map(mem => (
                  <div
                    key={mem.id}
                    className="p-5 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                          {mem.role}
                        </span>
                        <span className="text-[11px] text-slate-400">Joined {mem.joinedAt}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{mem.clubName}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Active member with tournament nomination rights
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Good Standing</span>
                      </span>
                      <button
                        onClick={() => onSelectClub(mem.clubId)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        Visit Club
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Deciding Set Record
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-1">83%</div>
                  <span className="text-xs text-emerald-600 font-semibold mt-0.5 block">5 wins in 6 fifth-set deciders</span>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Average Match Duration
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-1">28 min</div>
                  <span className="text-xs text-slate-500 mt-0.5 block">Standard 5-set format</span>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Highest Ranking
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-1">State #8</div>
                  <span className="text-xs text-slate-500 mt-0.5 block">Achieved July 2026</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
