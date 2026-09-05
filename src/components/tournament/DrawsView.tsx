import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Match } from '../../types';
import {
  Trophy,
  Users,
  Grid2X2,
  Play,
  CheckCircle2,
  Sparkles,
  MapPin,
  Clock,
  Shuffle
} from 'lucide-react';

interface DrawsViewProps {
  onNavigate: (view: string) => void;
  onSelectMatchForScoring: (matchId: string) => void;
}

export const DrawsView: React.FC<DrawsViewProps> = ({
  onNavigate,
  onSelectMatchForScoring
}) => {
  const { activeTournament, events, matches, participants, standings } = useApp();
  const [activeTab, setActiveTab] = useState<'KNOCKOUT' | 'GROUPS'>('KNOCKOUT');

  // Filter matches for current tournament
  const knockoutMatches = matches.filter(m => m.stageType === 'KNOCKOUT' || (!m.stageType && (m.stageName.includes('Semi') || m.stageName.includes('Final') || m.stageName.includes('Quarter'))));
  const groupMatches = matches.filter(m => m.stageType === 'ROUND_ROBIN' || m.stageType === 'GROUP' || (!m.stageType && !m.stageName.includes('Semi') && !m.stageName.includes('Final') && !m.stageName.includes('Quarter')));

  // Group knockout matches by round index
  const round1Matches = knockoutMatches.filter(m => m.roundIndex === 1 || m.stageName.includes('Quarter'));
  const semiMatches = knockoutMatches.filter(m => m.roundIndex === 2 || m.stageName.includes('Semi'));
  const finalMatches = knockoutMatches.filter(m => m.roundIndex === 3 || m.stageName.includes('Final'));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold tracking-wider uppercase">
              Competition Engine
            </span>
            <span className="text-xs text-neutral-400">Deterministic Seeded Draws</span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mt-1">
            Draws, Brackets & Group Standings
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Automatic seeding, bye distribution, club conflict separation, and stage progression.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-xl">
          <button
            id="tab-draws-knockout"
            onClick={() => setActiveTab('KNOCKOUT')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'KNOCKOUT'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Knockout Tree Bracket
          </button>
          <button
            id="tab-draws-groups"
            onClick={() => setActiveTab('GROUPS')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'GROUPS'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Group Stage Tables ({(standings || []).length})
          </button>
        </div>
      </div>

      {/* KNOCKOUT TREE BRACKET VIEW */}
      {activeTab === 'KNOCKOUT' && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs overflow-x-auto">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-neutral-900">
                Men's Open Singles — Championship Bracket
              </h3>
            </div>
            <span className="text-xs text-neutral-500">Seed 1 (Top) • Seed 2 (Bottom) separation</span>
          </div>

          <div className="min-w-[760px] grid grid-cols-3 gap-8 relative py-4">
            {/* Column 1: Quarterfinals */}
            <div className="space-y-6">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 text-center pb-2 border-b border-neutral-100">
                Quarterfinals (Round of 8)
              </div>
              <div className="space-y-6">
                {round1Matches.length > 0 ? (
                  round1Matches.map(m => (
                    <BracketCard
                      key={m.id}
                      match={m}
                      onSelect={() => {
                        onSelectMatchForScoring(m.id);
                        onNavigate('live_scoring');
                      }}
                    />
                  ))
                ) : (
                  <div className="p-4 bg-neutral-50 rounded-xl text-center text-xs text-neutral-400">
                    Quarterfinal fixtures
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Semifinals */}
            <div className="space-y-6">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 text-center pb-2 border-b border-neutral-100">
                Semifinals
              </div>
              <div className="space-y-16 pt-8">
                {semiMatches.length > 0 ? (
                  semiMatches.map(m => (
                    <BracketCard
                      key={m.id}
                      match={m}
                      onSelect={() => {
                        onSelectMatchForScoring(m.id);
                        onNavigate('live_scoring');
                      }}
                    />
                  ))
                ) : (
                  <div className="p-4 bg-neutral-50 rounded-xl text-center text-xs text-neutral-400">
                    Awaiting Quarterfinal winners
                  </div>
                )}
              </div>
            </div>

            {/* Column 3: Championship Final */}
            <div className="space-y-6">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-600 text-center pb-2 border-b border-amber-200">
                Championship Final
              </div>
              <div className="pt-24">
                {finalMatches.length > 0 ? (
                  finalMatches.map(m => (
                    <BracketCard
                      key={m.id}
                      match={m}
                      isFinal
                      onSelect={() => {
                        onSelectMatchForScoring(m.id);
                        onNavigate('live_scoring');
                      }}
                    />
                  ))
                ) : (
                  <div className="p-5 bg-amber-50/50 border border-amber-200 rounded-2xl text-center text-xs text-amber-900 font-semibold">
                    Gold Medal Match
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GROUP STAGE STANDINGS VIEW */}
      {activeTab === 'GROUPS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Group Stage Standings (Round Robin)</h3>
                  <p className="text-xs text-neutral-500">
                    Points: Win = 2 pts, Loss = 1 pt. Top 2 ranked athletes qualify for Knockout Stage.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  Qualifying Stage
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/80 text-neutral-600 font-bold">
                      <th className="p-3 text-center w-12">Rank</th>
                      <th className="p-3">Athlete</th>
                      <th className="p-3 text-center">Played</th>
                      <th className="p-3 text-center">Won</th>
                      <th className="p-3 text-center">Lost</th>
                      <th className="p-3 text-center">Sets Won</th>
                      <th className="p-3 text-center">Sets Lost</th>
                      <th className="p-3 text-center font-mono">Diff</th>
                      <th className="p-3 text-center font-bold text-neutral-900">Points</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {(standings || []).map((s, idx) => {
                      const isQualified = s.rank <= 2;
                      return (
                        <tr
                          key={s.participantId}
                          className={`hover:bg-neutral-50 transition-colors ${
                            isQualified ? 'bg-emerald-50/20' : ''
                          }`}
                        >
                          <td className="p-3 text-center font-mono font-bold text-neutral-800">
                            #{s.rank}
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-neutral-900">{s.participantName}</div>
                            <div className="text-[10px] text-neutral-400">Chennai TT Club</div>
                          </td>
                          <td className="p-3 text-center font-mono">{s.played}</td>
                          <td className="p-3 text-center font-mono text-emerald-600 font-bold">{s.won}</td>
                          <td className="p-3 text-center font-mono text-neutral-600">{s.lost}</td>
                          <td className="p-3 text-center font-mono">{s.setsWon}</td>
                          <td className="p-3 text-center font-mono">{s.setsLost}</td>
                          <td className="p-3 text-center font-mono font-semibold">
                            {s.setDifference > 0 ? `+${s.setDifference}` : s.setDifference}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-sm text-neutral-900">
                            {s.points}
                          </td>
                          <td className="p-3 text-center">
                            {isQualified ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                Qualified QF
                              </span>
                            ) : (
                              <span className="text-[10px] text-neutral-400 font-medium">Eliminated</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Subcomponent for Bracket Card
const BracketCard: React.FC<{
  match: Match;
  isFinal?: boolean;
  onSelect: () => void;
}> = ({ match, isFinal, onSelect }) => {
  const sets = match.score?.sport === 'TABLE_TENNIS' || match.score?.sport === 'BADMINTON'
    ? match.score.data.sets
    : [];
  const p1SetsWon = sets.filter(s => s.p1 > s.p2).length;
  const p2SetsWon = sets.filter(s => s.p2 > s.p1).length;

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl border-2 p-3.5 shadow-xs cursor-pointer hover:border-neutral-400 transition-all ${
        isFinal ? 'border-amber-400 bg-amber-50/30' : 'border-neutral-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between text-[10px] text-neutral-400 pb-2 border-b border-neutral-100">
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-neutral-600">Match #{match.matchNumber}</span>
          {match.bestOfSets ? (
            <span className="px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-900 text-[10px]">
              Bo{match.bestOfSets}
            </span>
          ) : null}
        </div>
        <span className="flex items-center gap-1 text-neutral-700 font-medium">
          <MapPin className="w-3 h-3" />
          {match.resourceName || 'Table TBD'}
        </span>
      </div>

      <div className="space-y-2 py-2">
        {/* Participant 1 */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 truncate">
            {match.seedP1 && (
              <span className="px-1 py-0.2 rounded bg-neutral-100 text-[10px] font-mono font-bold text-neutral-700">
                [{match.seedP1}]
              </span>
            )}
            <span className={`truncate font-semibold ${match.winnerId === match.participant1Id ? 'text-emerald-700 font-bold' : 'text-neutral-900'}`}>
              {match.participant1Name || 'BYE'}
            </span>
          </div>
          <span className="font-mono font-bold text-xs pl-2">{p1SetsWon}</span>
        </div>

        {/* Participant 2 */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 truncate">
            {match.seedP2 && (
              <span className="px-1 py-0.2 rounded bg-neutral-100 text-[10px] font-mono font-bold text-neutral-700">
                [{match.seedP2}]
              </span>
            )}
            <span className={`truncate font-semibold ${match.winnerId === match.participant2Id ? 'text-emerald-700 font-bold' : 'text-neutral-900'}`}>
              {match.participant2Name || 'BYE'}
            </span>
          </div>
          <span className="font-mono font-bold text-xs pl-2">{p2SetsWon}</span>
        </div>
      </div>

      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px]">
        <span className={`px-1.5 py-0.2 rounded font-bold ${
          match.status === 'LIVE' ? 'bg-emerald-100 text-emerald-800 animate-pulse' : 'bg-neutral-100 text-neutral-600'
        }`}>
          {match.status}
        </span>
        <span className="text-blue-600 font-semibold hover:underline">
          Score Match →
        </span>
      </div>
    </div>
  );
};
