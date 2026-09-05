import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  CalendarDays,
  ClipboardList,
  Trophy,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Flame,
  Award
} from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { DashboardSection } from '../ui/DashboardSection';
import { StatusBadge } from '../ui/StatusBadge';
import { Button, PrimaryButton } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

interface CoachDashboardProps {
  onNavigate: (view: string) => void;
}

export const CoachDashboard: React.FC<CoachDashboardProps> = ({ onNavigate }) => {
  const { activeClub, batches, players, attendanceRecords, matches, markAttendance } = useApp();

  const myBatches = batches.filter(b => b.clubId === activeClub?.id);
  const myStudents = players.filter(p => p.clubId === activeClub?.id);

  // Quick attendance marker state for active batch
  const [selectedBatchId, setSelectedBatchId] = useState(myBatches[0]?.id || '');
  const [attendanceState, setAttendanceState] = useState<Record<string, boolean>>({});

  const toggleStudent = (playerId: string) => {
    setAttendanceState(prev => ({
      ...prev,
      [playerId]: !prev[playerId]
    }));
  };

  const handleSaveAttendance = () => {
    if (!selectedBatchId) return;
    const presentIds = Object.keys(attendanceState).filter(id => attendanceState[id]);
    markAttendance(selectedBatchId, new Date().toISOString().split('T')[0], presentIds);
    alert('Attendance saved successfully for today\'s session.');
  };

  return (
    <div className="space-y-7">
      {/* 1. Coaching Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-bold tracking-wider uppercase">
              Coaching Desk
            </span>
            <span className="text-xs text-slate-400 font-medium">Academy: {activeClub?.name || 'Club Academy'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Training & Athlete Development
          </h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Record training sessions, log technical drills, and track player tournament progress.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <PrimaryButton
            size="sm"
            onClick={() => onNavigate('attendance')}
            icon={<ClipboardList className="w-3.5 h-3.5" />}
          >
            Open Attendance Grid
          </PrimaryButton>
        </div>
      </div>

      {/* 2. Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Batches"
          value={myBatches.length}
          subtitle="Active squads"
          icon={CalendarDays}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          onClick={() => onNavigate('batches')}
        />
        <StatCard
          title="My Athletes"
          value={myStudents.length}
          subtitle="Enrolled under coach"
          icon={Users}
          iconColor="text-emerald-600"
          bgColor="bg-emerald-50"
          onClick={() => onNavigate('players')}
        />
        <StatCard
          title="Today's Drills"
          value="4 Sessions"
          subtitle="Court technical blocks"
          icon={Flame}
          iconColor="text-amber-600"
          bgColor="bg-amber-50"
        />
        <StatCard
          title="Tournament Wins"
          value="18 Medals"
          subtitle="Club season records"
          icon={Award}
          iconColor="text-purple-600"
          bgColor="bg-purple-50"
          onClick={() => onNavigate('tournaments')}
        />
      </div>

      {/* 3. My Squad Batches (Card format inspired by reference) */}
      <DashboardSection
        title="My Training Squads"
        subtitle="Batch timings, capacity, and student count"
        actionText="All batches →"
        onAction={() => onNavigate('batches')}
      >
        {myBatches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myBatches.map(batch => (
              <div
                key={batch.id}
                onClick={() => setSelectedBatchId(batch.id)}
                className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedBatchId === batch.id
                    ? 'border-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                    : 'border-slate-200/70 shadow-xs hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {batch.startTime} - {batch.endTime}
                    </span>
                    {selectedBatchId === batch.id ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Selected
                      </span>
                    ) : (
                      <StatusBadge status="ACTIVE" size="sm" />
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    {batch.name}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Days: <span className="font-medium text-slate-700">{batch.days.join(', ')}</span>
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">{batch.capacity} Students enrolled</span>
                  <span className="text-xs font-bold text-emerald-600">Log Session →</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="No Training Batches"
            description="Your club owner hasn't assigned batches to your profile yet."
          />
        )}
      </DashboardSection>

      {/* 4. Quick Daily Session Check-in Desk */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Fast Session Attendance Check-in
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select athletes present in today's training block
            </p>
          </div>

          <PrimaryButton
            size="sm"
            onClick={handleSaveAttendance}
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
          >
            Save Session Attendance
          </PrimaryButton>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {myStudents.map(student => {
            const isPresent = !!attendanceState[student.id];
            return (
              <div
                key={student.id}
                onClick={() => toggleStudent(student.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isPresent
                    ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-500/10'
                    : 'bg-white border-slate-200/70 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={student.photoUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80`}
                    alt={student.name}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-100 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{student.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{student.category || 'Open'}</p>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isPresent ? 'bg-emerald-600 text-white' : 'border border-slate-300 text-transparent'
                }`}>
                  ✓
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
