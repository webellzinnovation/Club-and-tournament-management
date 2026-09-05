import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalendarDays,
  Users,
  ClipboardList,
  Trophy,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface CoachDashboardProps {
  onNavigate: (view: string) => void;
}

export const CoachDashboard: React.FC<CoachDashboardProps> = ({ onNavigate }) => {
  const { coaches, batches, players, attendanceRecords } = useApp();

  const currentCoach = coaches[0]; // Coach Rajesh Kannan
  const coachBatches = batches.filter(b => b.coachId === currentCoach.id);
  const myPlayerIds = new Set(coachBatches.flatMap(b => b.playerIds));
  const myPlayers = players.filter(p => myPlayerIds.has(p.id));

  return (
    <div className="space-y-6">
      {/* Top Profile Card */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
            RK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold tracking-wider uppercase">
                Senior Coach
              </span>
              <span className="text-xs text-neutral-400">{currentCoach.experienceYears} years experience</span>
            </div>
            <h1 className="text-xl font-bold text-neutral-900 mt-1">{currentCoach.name}</h1>
            <p className="text-xs text-neutral-500 mt-0.5">Specialization: {currentCoach.specialization}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-coach-mark-att"
            onClick={() => onNavigate('attendance')}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <ClipboardList className="w-4 h-4 text-amber-400" />
            <span>Mark Daily Attendance</span>
          </button>
        </div>
      </div>

      {/* Grid: Coaching Sessions & Athletes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions & Batches */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Today's Coaching Batches</h3>
              <p className="text-xs text-neutral-500">Scheduled court & table training sessions</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-neutral-100 rounded text-neutral-600">
              {coachBatches.length} Squads
            </span>
          </div>

          <div className="space-y-3">
            {coachBatches.map(batch => (
              <div key={batch.id} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/40 hover:border-neutral-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">{batch.name}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{batch.timing}</span>
                      <span>•</span>
                      <span>{batch.days.join(', ')}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    ACTIVE
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-neutral-200/60 flex items-center justify-between text-xs">
                  <span className="text-neutral-500">
                    Enrolled: <strong className="text-neutral-800">{batch.playerIds.length}</strong> / {batch.maxCapacity} athletes
                  </span>
                  <button
                    onClick={() => onNavigate('attendance')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>Check-in Matrix</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Athletes List */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-neutral-900">Assigned Athletes ({myPlayers.length})</h3>
            <button
              onClick={() => onNavigate('players')}
              className="text-xs text-blue-600 font-semibold hover:text-blue-800"
            >
              All →
            </button>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {myPlayers.map(p => (
              <div key={p.id} className="p-2.5 rounded-lg border border-neutral-100 bg-neutral-50/70 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-neutral-500">{p.playerId}</span>
                    <span className="font-semibold text-neutral-900">{p.name}</span>
                  </div>
                  <p className="text-[10px] text-neutral-500">{p.category} • {p.playingStyle || 'Attacker'}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-neutral-800">{p.rating} pts</span>
                  <p className="text-[10px] text-emerald-600 font-medium">{p.wins}W / {p.losses}L</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
