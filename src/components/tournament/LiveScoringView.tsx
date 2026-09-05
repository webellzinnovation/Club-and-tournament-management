import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Match, SportScoreData } from '../../types';
import {
  addPointTT,
  undoPointTT,
  checkTTMatchStatus
} from '../../engine/sports/tableTennis';
import {
  addPointBadminton,
  checkBadmintonMatchStatus
} from '../../engine/sports/badminton';
import {
  addFootballGoal,
  addFootballCard
} from '../../engine/sports/football';
import {
  addCricketDelivery
} from '../../engine/sports/cricket';
import {
  Activity,
  RotateCcw,
  CheckCircle2,
  Pause,
  Play,
  Award,
  ShieldCheck,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

interface LiveScoringViewProps {
  selectedMatchId?: string;
  onNavigate: (view: string) => void;
}

export const LiveScoringView: React.FC<LiveScoringViewProps> = ({
  selectedMatchId,
  onNavigate
}) => {
  const { matches, updateMatchScore, verifyMatchResult, currentUser } = useApp();

  // Pick match by selectedMatchId, or first LIVE match, or first match
  const activeMatch = matches.find(m => m.id === selectedMatchId) ||
    matches.find(m => m.status === 'LIVE') ||
    matches[0];

  const [currentMatchId, setCurrentMatchId] = useState<string>(activeMatch?.id || '');

  useEffect(() => {
    if (selectedMatchId) setCurrentMatchId(selectedMatchId);
    else if (activeMatch) setCurrentMatchId(activeMatch.id);
  }, [selectedMatchId]);

  const match = matches.find(m => m.id === currentMatchId) || activeMatch;

  if (!match) {
    return (
      <div className="p-8 bg-white rounded-xl border border-neutral-200 text-center text-xs text-neutral-500">
        No matches available for scoring.
      </div>
    );
  }

  // --- Table Tennis Scoring Handler ---
  const handleTTPoint = (player: 'p1' | 'p2') => {
    if (match.score.sport !== 'TABLE_TENNIS') return;
    const { updatedScore, matchResult } = addPointTT(
      match.score.data,
      player,
      5,
      match.participant1Id || 'p1',
      match.participant2Id || 'p2',
      match.participant1Name,
      match.participant2Name
    );

    const nextStatus = matchResult.isMatchOver ? 'COMPLETED' : 'LIVE';
    updateMatchScore(match.id, { sport: 'TABLE_TENNIS', data: updatedScore }, nextStatus);
  };

  const handleTTUndo = () => {
    if (match.score.sport !== 'TABLE_TENNIS') return;
    const reverted = undoPointTT(match.score.data);
    updateMatchScore(match.id, { sport: 'TABLE_TENNIS', data: reverted });
  };

  // --- Badminton Scoring Handler ---
  const handleBadmintonPoint = (player: 'p1' | 'p2') => {
    if (match.score.sport !== 'BADMINTON') return;
    const { updatedScore, matchResult } = addPointBadminton(
      match.score.data,
      player,
      3,
      match.participant1Id || 'p1',
      match.participant2Id || 'p2',
      match.participant1Name,
      match.participant2Name
    );
    const nextStatus = matchResult.isMatchOver ? 'COMPLETED' : 'LIVE';
    updateMatchScore(match.id, { sport: 'BADMINTON', data: updatedScore }, nextStatus);
  };

  // --- Football Scoring Handlers ---
  const handleFootballGoal = (team: 1 | 2) => {
    if (match.score.sport !== 'FOOTBALL') return;
    const playerName = team === 1 ? match.participant1Name || 'Team 1' : match.participant2Name || 'Team 2';
    const updated = addFootballGoal(match.score.data, team, `${playerName} Striker`);
    updateMatchScore(match.id, { sport: 'FOOTBALL', data: updated }, 'LIVE');
  };

  // --- Cricket Delivery Handlers ---
  const handleCricketBall = (type: 'RUNS' | 'WICKET' | 'WIDE' | 'NO_BALL', runs: number = 0) => {
    if (match.score.sport !== 'CRICKET') return;
    const updated = addCricketDelivery(match.score.data, type, runs);
    updateMatchScore(match.id, { sport: 'CRICKET', data: updated }, 'LIVE');
  };

  const handleVerify = () => {
    verifyMatchResult(match.id);
  };

  const isOrganizer = currentUser.currentRole === 'TOURNAMENT_ORGANIZER' || currentUser.currentRole === 'SUPER_ADMIN';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Match Selector Strip */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-2">
            Match:
          </span>
          {matches.slice(0, 8).map(m => (
            <button
              key={m.id}
              onClick={() => setCurrentMatchId(m.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                match.id === m.id
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <span>#{m.matchNumber} {m.participant1Name?.split(' ')[0]} vs {m.participant2Name?.split(' ')[0]}</span>
              {m.status === 'LIVE' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>}
            </button>
          ))}
        </div>

        <button
          onClick={() => onNavigate('assignments')}
          className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 px-3 py-1 border border-neutral-200 rounded-lg shrink-0"
        >
          View Assignments →
        </button>
      </div>

      {/* Match Context Header */}
      <div className="bg-neutral-900 text-white rounded-3xl p-6 shadow-sm border border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-amber-400 text-neutral-950">
                {match.resourceName || 'Center Court'}
              </span>
              <span className="text-xs text-neutral-300 font-medium">
                {match.stageName} • Match #{match.matchNumber}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1 flex items-center gap-2">
              <span>Official: <strong>{match.refereeName || 'Chief Referee'}</strong></span>
              <span>•</span>
              <span>Time: {match.scheduledTime}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              match.status === 'LIVE'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                : match.status === 'VERIFIED'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : match.status === 'COMPLETED'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-neutral-800 text-neutral-300'
            }`}>
              <Activity className="w-3.5 h-3.5" />
              <span>{match.status}</span>
            </span>

            {/* Result Verification Button for Organizers */}
            {(match.status === 'COMPLETED' || match.status === 'LIVE') && (
              <button
                id="btn-verify-match-result"
                onClick={handleVerify}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Official Result</span>
              </button>
            )}
          </div>
        </div>

        {/* ----------------- TABLE TENNIS SCORING UI ----------------- */}
        {match.score.sport === 'TABLE_TENNIS' && (
          <div className="mt-6">
            {/* Completed Sets Summary */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
                Set Scores:
              </span>
              {match.score.data.sets.length === 0 ? (
                <span className="text-xs text-neutral-500 font-mono">Game 1 in progress</span>
              ) : (
                match.score.data.sets.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-neutral-800 text-neutral-200 font-mono text-xs font-bold border border-neutral-700"
                  >
                    G{idx + 1}: {s.p1} - {s.p2}
                  </span>
                ))
              )}
            </div>

            {/* Main Interactive Touch Scoreboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Participant 1 Touch Pad */}
              <div className="bg-neutral-800/80 rounded-3xl p-6 border-2 border-neutral-700 hover:border-neutral-500 transition-all flex flex-col items-center justify-between text-center min-h-[300px]">
                <div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono text-xs text-neutral-400">P1</span>
                    {match.score.data.serverParticipantId === match.participant1Id && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 text-[10px] font-bold animate-pulse">
                        SERVING
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">{match.participant1Name}</h2>
                  <p className="text-xs text-neutral-400">Games Won: {match.score.data.sets.filter(s => s.p1 > s.p2).length}</p>
                </div>

                {/* Big Score Display */}
                <div className="my-4">
                  <span className="text-7xl sm:text-8xl font-black font-mono tracking-tight text-amber-400">
                    {match.score.data.currentSetP1}
                  </span>
                </div>

                {/* Touch Point Button */}
                <button
                  id="btn-point-p1"
                  onClick={() => handleTTPoint('p1')}
                  disabled={match.score.data.isGameOver}
                  className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-neutral-950 font-black text-lg shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <span>+1 Point ({match.participant1Name?.split(' ')[0]})</span>
                </button>
              </div>

              {/* Participant 2 Touch Pad */}
              <div className="bg-neutral-800/80 rounded-3xl p-6 border-2 border-neutral-700 hover:border-neutral-500 transition-all flex flex-col items-center justify-between text-center min-h-[300px]">
                <div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono text-xs text-neutral-400">P2</span>
                    {match.score.data.serverParticipantId === match.participant2Id && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 text-[10px] font-bold animate-pulse">
                        SERVING
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">{match.participant2Name}</h2>
                  <p className="text-xs text-neutral-400">Games Won: {match.score.data.sets.filter(s => s.p2 > s.p1).length}</p>
                </div>

                {/* Big Score Display */}
                <div className="my-4">
                  <span className="text-7xl sm:text-8xl font-black font-mono tracking-tight text-amber-400">
                    {match.score.data.currentSetP2}
                  </span>
                </div>

                {/* Touch Point Button */}
                <button
                  id="btn-point-p2"
                  onClick={() => handleTTPoint('p2')}
                  disabled={match.score.data.isGameOver}
                  className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-neutral-950 font-black text-lg shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <span>+1 Point ({match.participant2Name?.split(' ')[0]})</span>
                </button>
              </div>
            </div>

            {/* Quick Referee Actions Bar */}
            <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <button
                  id="btn-undo-point"
                  onClick={handleTTUndo}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-neutral-400" />
                  <span>Undo Point</span>
                </button>

                {match.score.data.isDeuce && (
                  <span className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold animate-pulse">
                    DEUCE (Win by 2)
                  </span>
                )}
              </div>

              <div className="text-xs text-neutral-400 font-mono">
                Game {match.score.data.currentSetIndex} • Server: {match.score.data.serverParticipantId === match.participant1Id ? match.participant1Name : match.participant2Name}
              </div>
            </div>
          </div>
        )}

        {/* ----------------- BADMINTON SCORING UI ----------------- */}
        {match.score.sport === 'BADMINTON' && (
          <div className="mt-6 text-center space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-800 p-6 rounded-2xl border border-neutral-700">
                <h3 className="font-bold text-white text-base">{match.participant1Name}</h3>
                <div className="text-7xl font-mono font-black text-emerald-400 my-4">
                  {match.score.data.currentSetP1}
                </div>
                <button
                  onClick={() => handleBadmintonPoint('p1')}
                  className="w-full py-3 bg-emerald-500 text-neutral-950 font-bold rounded-xl"
                >
                  +1 Point
                </button>
              </div>

              <div className="bg-neutral-800 p-6 rounded-2xl border border-neutral-700">
                <h3 className="font-bold text-white text-base">{match.participant2Name}</h3>
                <div className="text-7xl font-mono font-black text-emerald-400 my-4">
                  {match.score.data.currentSetP2}
                </div>
                <button
                  onClick={() => handleBadmintonPoint('p2')}
                  className="w-full py-3 bg-emerald-500 text-neutral-950 font-bold rounded-xl"
                >
                  +1 Point
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- FOOTBALL SCORING UI ----------------- */}
        {match.score.sport === 'FOOTBALL' && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-3 gap-4 items-center text-center">
              <div className="bg-neutral-800 p-4 rounded-xl">
                <h3 className="font-bold text-sm text-white">{match.participant1Name}</h3>
                <div className="text-6xl font-mono font-black text-amber-400 my-2">
                  {match.score.data.team1Goals}
                </div>
                <button
                  onClick={() => handleFootballGoal(1)}
                  className="px-3 py-1.5 bg-amber-500 text-neutral-950 font-bold rounded-lg text-xs"
                >
                  + GOAL
                </button>
              </div>

              <div className="text-xs text-neutral-400 space-y-1">
                <p className="font-mono text-2xl font-bold text-white">45:00</p>
                <p className="text-[10px] uppercase">Half 1</p>
              </div>

              <div className="bg-neutral-800 p-4 rounded-xl">
                <h3 className="font-bold text-sm text-white">{match.participant2Name}</h3>
                <div className="text-6xl font-mono font-black text-amber-400 my-2">
                  {match.score.data.team2Goals}
                </div>
                <button
                  onClick={() => handleFootballGoal(2)}
                  className="px-3 py-1.5 bg-amber-500 text-neutral-950 font-bold rounded-lg text-xs"
                >
                  + GOAL
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- CRICKET SCORING UI ----------------- */}
        {match.score.sport === 'CRICKET' && (
          <div className="mt-6 space-y-4">
            <div className="bg-neutral-800 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-neutral-400 uppercase">Batting Team</span>
                <h3 className="text-lg font-bold text-white">{match.participant1Name}</h3>
                <p className="text-xs text-neutral-400">
                  Striker: {match.score.data.currentInnings.currentStriker} • Bowler: {match.score.data.currentInnings.currentBowler}
                </p>
              </div>
              <div className="text-right font-mono">
                <div className="text-4xl font-black text-amber-400">
                  {match.score.data.currentInnings.runs} / {match.score.data.currentInnings.wickets}
                </div>
                <div className="text-xs text-neutral-300">
                  Overs: {match.score.data.currentInnings.overs}.{match.score.data.currentInnings.balls} (Target: {match.score.data.targetRuns || 165})
                </div>
              </div>
            </div>

            {/* Ball buttons */}
            <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
              {[0, 1, 2, 3, 4, 6].map(runs => (
                <button
                  key={runs}
                  onClick={() => handleCricketBall('RUNS', runs)}
                  className="w-12 h-12 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-mono font-bold text-base"
                >
                  {runs}
                </button>
              ))}
              <button
                onClick={() => handleCricketBall('WICKET')}
                className="px-4 h-12 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                WICKET
              </button>
              <button
                onClick={() => handleCricketBall('WIDE')}
                className="px-3 h-12 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-neutral-200 font-bold text-xs"
              >
                WD
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Point-by-point history audit */}
      {match.score.sport === 'TABLE_TENNIS' && match.score.data.history.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs">
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">
            Rally Timeline & Official Log
          </h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {match.score.data.history.slice(-8).reverse().map((h, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-neutral-50 flex items-center justify-between text-xs">
                <span className="text-neutral-700">{h.desc}</span>
                <span className="text-[10px] font-mono text-neutral-400">{h.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
