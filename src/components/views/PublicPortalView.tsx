import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Trophy,
  Activity,
  Award,
  Users,
  Calendar,
  Search,
  ExternalLink,
  ChevronRight,
  MapPin,
  Clock,
  ArrowLeft
} from 'lucide-react';

interface PublicPortalViewProps {
  onBackToApp: () => void;
  onSelectMatchForScoring: (matchId: string) => void;
  onOpenLiveScore: () => void;
}

export const PublicPortalView: React.FC<PublicPortalViewProps> = ({
  onBackToApp,
  onSelectMatchForScoring,
  onOpenLiveScore
}) => {
  const { tournaments, activeTournament, matches, players, standings } = useApp();
  const [activeTab, setActiveTab] = useState<'LIVE' | 'STANDINGS' | 'PLAYERS'>('LIVE');
  const [search, setSearch] = useState('');

  const liveMatches = matches.filter(m => m.status === 'LIVE');
  const upcomingMatches = matches.filter(m => m.status === 'SCHEDULED' || m.status === 'CALLED');

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col">
      {/* Public Top Navbar */}
      <header className="bg-neutral-950 border-b border-neutral-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-black text-sm">
            OS
          </div>
          <div>
            <span className="font-mono text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
              PUBLIC FAN & ATHLETE PORTAL
            </span>
            <h1 className="text-sm font-bold text-white">SportOS Live Championship Center</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-portal-back-to-console"
            onClick={onBackToApp}
            className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-neutral-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Staff / Athlete Login Console</span>
          </button>
        </div>
      </header>

      {/* Hero Tournament Banner */}
      <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border-b border-neutral-800 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>TOURNAMENT IN PROGRESS</span>
              </span>
              <span className="text-xs text-neutral-400">{activeTournament?.sport.replace('_', ' ')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
              {activeTournament?.title}
            </h2>
            <p className="text-xs text-neutral-400 mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-neutral-500" /> {activeTournament?.venueName}, {activeTournament?.city}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-neutral-500" /> {activeTournament?.startDate} to {activeTournament?.endDate}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('LIVE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'LIVE' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'bg-neutral-800 text-neutral-300'
              }`}
            >
              Live Scores ({liveMatches.length})
            </button>
            <button
              onClick={() => setActiveTab('STANDINGS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'STANDINGS' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'bg-neutral-800 text-neutral-300'
              }`}
            >
              Rankings & Points
            </button>
            <button
              onClick={() => setActiveTab('PLAYERS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'PLAYERS' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'bg-neutral-800 text-neutral-300'
              }`}
            >
              Player Directory
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full p-6 flex-1 space-y-6">
        {/* LIVE MATCHES VIEW */}
        {activeTab === 'LIVE' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Active Table Matches Live</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liveMatches.map(m => (
                  <div
                    key={m.id}
                    onClick={() => {
                      onSelectMatchForScoring(m.id);
                      onOpenLiveScore();
                    }}
                    className="p-5 rounded-2xl bg-neutral-950/80 border border-neutral-800 hover:border-neutral-600 transition-all cursor-pointer shadow-lg space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-xs">
                      <span className="font-mono font-bold text-amber-400">{m.resourceName}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold animate-pulse">
                        LIVE NOW
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-white">{m.participant1Name}</p>
                        <p className="text-sm font-bold text-white">{m.participant2Name}</p>
                      </div>

                      <div className="text-right font-mono">
                        {m.score?.sport === 'TABLE_TENNIS' && (
                          <div>
                            <span className="text-2xl font-black text-amber-400">
                              {m.score.data.currentSetP1} - {m.score.data.currentSetP2}
                            </span>
                            <div className="text-[10px] text-neutral-400 mt-1">
                              Game {m.score.data.currentSetIndex}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                      <span>{m.stageName}</span>
                      <span className="text-amber-400 font-semibold flex items-center gap-1">
                        Watch Live Ball-by-Ball →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Schedule */}
            <div>
              <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-400" />
                <span>Next Scheduled Matches Today</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {upcomingMatches.map(m => (
                  <div key={m.id} className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                      <span>Match #{m.matchNumber}</span>
                      <span>{m.scheduledTime}</span>
                    </div>
                    <p className="font-bold text-neutral-200 truncate">
                      {m.participant1Name} vs {m.participant2Name}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1">
                      <span>{m.stageName}</span>
                      <span className="text-amber-400 font-medium">{m.resourceName || 'Table TBD'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STANDINGS VIEW */}
        {activeTab === 'STANDINGS' && (
          <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-4">Official Group Table Standings</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 font-bold">
                    <th className="p-2.5">Rank</th>
                    <th className="p-2.5">Athlete</th>
                    <th className="p-2.5 text-center">Played</th>
                    <th className="p-2.5 text-center">Won</th>
                    <th className="p-2.5 text-center">Lost</th>
                    <th className="p-2.5 text-center font-bold text-white">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {(standings || []).map(s => (
                    <tr key={s.participantId} className="hover:bg-neutral-900">
                      <td className="p-2.5 font-mono font-bold text-amber-400">#{s.rank}</td>
                      <td className="p-2.5 font-semibold text-white">{s.participantName}</td>
                      <td className="p-2.5 text-center font-mono text-neutral-300">{s.played}</td>
                      <td className="p-2.5 text-center font-mono text-emerald-400 font-bold">{s.won}</td>
                      <td className="p-2.5 text-center font-mono text-neutral-400">{s.lost}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-amber-400">{s.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PLAYERS DIRECTORY VIEW */}
        {activeTab === 'PLAYERS' && (
          <div className="space-y-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search athlete by name or permanent ID..."
              className="w-full max-w-md px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs focus:outline-none focus:border-amber-500"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {players.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.playerId.toLowerCase().includes(search.toLowerCase())).map(p => (
                <div key={p.id} className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-amber-400 font-bold">{p.playerId}</span>
                      <span className="font-bold text-white">{p.name}</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{p.clubName}</p>
                  </div>
                  <span className="font-mono font-bold text-amber-400">{p.rating} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Public Footer */}
      <footer className="border-t border-neutral-800 py-6 text-center text-xs text-neutral-500">
        SportOS Multi-Sport Cloud SaaS Platform • Generic Competition Engine
      </footer>
    </div>
  );
};
