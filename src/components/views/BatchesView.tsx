import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalendarDays,
  Users,
  Clock,
  UserSquare2,
  CheckCircle2,
  Plus
} from 'lucide-react';

export const BatchesView: React.FC = () => {
  const { batches, coaches, players, activeClub } = useApp();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold tracking-wider uppercase">
              Training Schedule
            </span>
            <span className="text-xs text-neutral-400">{activeClub.name}</span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mt-1">Batches, Squads & Timings</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure morning/evening training squads, coach allocations, player caps, and weekly days.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {batches.map(b => {
          const coach = coaches.find(c => c.id === b.coachId);
          const enrolledPlayers = players.filter(p => b.playerIds?.includes(p.id));

          return (
            <div key={b.id} className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-neutral-100">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">{b.name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{b.timing}</span>
                    <span>•</span>
                    <span>{(b.days || []).join(', ')}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {b.sport}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <UserSquare2 className="w-4 h-4 text-neutral-500" />
                  <span className="text-neutral-600">Head Coach:</span>
                  <span className="font-bold text-neutral-900">{b.coachName}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-neutral-900">{enrolledPlayers.length} / {b.maxCapacity}</span>
                  <span className="text-[10px] text-neutral-400 ml-1">enrolled</span>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                  Enrolled Athletes in this Squad
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {enrolledPlayers.map(p => (
                    <span key={p.id} className="px-2 py-1 bg-white border border-neutral-200 rounded-lg text-xs font-medium text-neutral-800">
                      {p.name} ({p.playerId})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
