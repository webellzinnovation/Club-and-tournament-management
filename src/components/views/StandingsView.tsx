import React from 'react';
import { useApp } from '../../context/AppContext';
import { Trophy, Award, Users } from 'lucide-react';

export const StandingsView: React.FC = () => {
  const { standings, activeTournament } = useApp();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold tracking-wider uppercase">
              Standings & Points
            </span>
            <span className="text-xs text-neutral-400">{activeTournament?.title}</span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mt-1">Official Tournament Standings</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Auto-calculated points: Win = 2 pts, Loss = 1 pt. Tiebreaker based on direct head-to-head and set differential.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs overflow-x-auto">
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
              <th className="p-3 text-center">Stage Progression</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {(standings || []).map(s => {
              const isQualified = s.rank <= 2;
              return (
                <tr key={s.participantId} className={`hover:bg-neutral-50 ${isQualified ? 'bg-emerald-50/20' : ''}`}>
                  <td className="p-3 text-center font-mono font-bold text-neutral-800">
                    #{s.rank}
                  </td>
                  <td className="p-3 font-bold text-neutral-900">{s.participantName}</td>
                  <td className="p-3 text-center font-mono">{s.played}</td>
                  <td className="p-3 text-center font-mono text-emerald-600 font-bold">{s.won}</td>
                  <td className="p-3 text-center font-mono text-neutral-500">{s.lost}</td>
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
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Qualified QF
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-400">Eliminated</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
