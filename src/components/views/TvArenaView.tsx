import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  Maximize2,
  Minimize2,
  Trophy,
  BellRing,
  MapPin,
  X
} from 'lucide-react';

interface TvArenaViewProps {
  onExit: () => void;
}

export const TvArenaView: React.FC<TvArenaViewProps> = ({ onExit }) => {
  const { activeTournament, matches, resources, announcements } = useApp();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const tournamentResources = resources.filter(r => r.sport === activeTournament?.sport);
  const latestAnnouncement = announcements[0];

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Top Header Bar */}
      <header className="px-6 py-4 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-black text-lg">
            OS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest">
                ARENA JUMBOTRON DISPLAY
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
            <h1 className="text-lg font-black text-white tracking-wide">
              {activeTournament?.title} — {activeTournament?.venueName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="font-mono text-xl font-bold text-neutral-300">
            {time}
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          <button
            id="btn-exit-tv-mode"
            onClick={onExit}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>Exit Arena Display</span>
          </button>
        </div>
      </header>

      {/* Main Grid: Multi-Table Arena Scoreboards */}
      <main className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto">
        {tournamentResources.slice(0, 6).map(res => {
          const match = matches.find(m => m.resourceId === res.id && (m.status === 'LIVE' || m.status === 'CALLED'));
          const nextMatch = matches.find(m => m.resourceId === res.id && m.status === 'SCHEDULED');

          return (
            <div
              key={res.id}
              className={`rounded-3xl border-2 p-6 flex flex-col justify-between shadow-2xl transition-all ${
                match?.status === 'LIVE'
                  ? 'border-emerald-500/80 bg-neutral-900/90'
                  : match?.status === 'CALLED'
                  ? 'border-amber-500/80 bg-neutral-900/80'
                  : 'border-neutral-800 bg-neutral-900/40'
              }`}
            >
              {/* Table Header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black px-2.5 py-0.5 rounded bg-amber-400 text-neutral-950">
                    {res.name}
                  </span>
                  <span className="text-xs text-neutral-400 font-medium">
                    {match ? match.stageName : 'Waiting for next match'}
                  </span>
                </div>

                {match && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black tracking-wider ${
                    match.status === 'LIVE'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500 animate-pulse'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500 animate-bounce'
                  }`}>
                    {match.status === 'LIVE' ? 'LIVE IN PLAY' : 'PLAYERS CALLED'}
                  </span>
                )}
              </div>

              {/* Match Content */}
              {match ? (
                <div className="py-4 space-y-4">
                  {/* Participant 1 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {match.score?.sport === 'TABLE_TENNIS' && match.score.data.serverParticipantId === match.participant1Id && (
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                      )}
                      <div>
                        <h3 className="text-xl font-black text-white">{match.participant1Name}</h3>
                        <p className="text-xs text-neutral-400">Games Won: {match.score?.data?.sets?.filter((s: any) => s.p1 > s.p2).length || 0}</p>
                      </div>
                    </div>
                    <span className="text-5xl font-mono font-black text-amber-400">
                      {match.score?.sport === 'TABLE_TENNIS' ? match.score.data.currentSetP1 : match.score?.sport === 'BADMINTON' ? match.score.data.currentSetP1 : match.score?.data?.team1Goals || 0}
                    </span>
                  </div>

                  <div className="h-px bg-neutral-800 my-2" />

                  {/* Participant 2 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {match.score?.sport === 'TABLE_TENNIS' && match.score.data.serverParticipantId === match.participant2Id && (
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                      )}
                      <div>
                        <h3 className="text-xl font-black text-white">{match.participant2Name}</h3>
                        <p className="text-xs text-neutral-400">Games Won: {match.score?.data?.sets?.filter((s: any) => s.p2 > s.p1).length || 0}</p>
                      </div>
                    </div>
                    <span className="text-5xl font-mono font-black text-amber-400">
                      {match.score?.sport === 'TABLE_TENNIS' ? match.score.data.currentSetP2 : match.score?.sport === 'BADMINTON' ? match.score.data.currentSetP2 : match.score?.data?.team2Goals || 0}
                    </span>
                  </div>
                </div>
              ) : nextMatch ? (
                <div className="py-8 text-center space-y-2">
                  <span className="text-xs text-neutral-500 uppercase tracking-wider block font-bold">
                    Next Up on this Table
                  </span>
                  <p className="text-base font-bold text-neutral-200">
                    {nextMatch.participant1Name} vs {nextMatch.participant2Name}
                  </p>
                  <p className="text-xs text-neutral-400 font-mono">Scheduled: {nextMatch.scheduledTime}</p>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-neutral-600 font-mono">
                  Table Available for Match Calling
                </div>
              )}

              {/* Table Footer */}
              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 font-mono">
                <span>Ref: {match?.refereeName || 'Assigned'}</span>
                {match?.score?.sport === 'TABLE_TENNIS' && match.score.data.sets.length > 0 && (
                  <span>
                    Sets: {match.score.data.sets.map((s: any) => `${s.p1}-${s.p2}`).join(' | ')}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </main>

      {/* Bottom Ticker: Arena Announcements & Calls */}
      <footer className="px-6 py-3.5 bg-neutral-900 border-t border-neutral-800 flex items-center gap-4">
        <div className="flex items-center gap-2 shrink-0 bg-amber-500 text-neutral-950 px-3 py-1 rounded-lg text-xs font-black uppercase">
          <BellRing className="w-3.5 h-3.5" />
          <span>OFFICIAL ARENA ANNOUNCEMENT</span>
        </div>

        <div className="flex-1 overflow-hidden">
          <p className="text-xs font-bold text-neutral-200 truncate">
            {latestAnnouncement ? (
              <span>
                📢 [{latestAnnouncement.priority}] {latestAnnouncement.title}: {latestAnnouncement.content}
              </span>
            ) : (
              <span>All players for Quarterfinal round please report to the warm-up area 10 minutes prior to call.</span>
            )}
          </p>
        </div>

        <span className="text-[10px] font-mono text-neutral-500 shrink-0">
          POWERED BY SPORTOS ENTERPRISE ENGINE
        </span>
      </footer>
    </div>
  );
};
