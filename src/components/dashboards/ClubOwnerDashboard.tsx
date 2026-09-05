import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserSquare2,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Plus,
  Trophy,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Sparkles,
  Building
} from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { DashboardSection } from '../ui/DashboardSection';
import { StatusBadge } from '../ui/StatusBadge';
import { Button, PrimaryButton } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

interface ClubOwnerDashboardProps {
  onNavigate: (view: string) => void;
  onOpenWizard: () => void;
}

export const ClubOwnerDashboard: React.FC<ClubOwnerDashboardProps> = ({ onNavigate, onOpenWizard }) => {
  const { activeClub, players, coaches, batches, attendanceRecords, membershipPlans, payments, addPlayer } = useApp();

  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerCategory, setNewPlayerCategory] = useState('Open');
  const [newPlayerHand, setNewPlayerHand] = useState<'RIGHT' | 'LEFT'>('RIGHT');
  const [newPlayerStyle, setNewPlayerStyle] = useState('Offensive');
  const [batchTab, setBatchTab] = useState('all');

  const clubPlayers = players.filter(p => p.clubId === activeClub?.id);
  const clubCoaches = coaches.filter(c => c.clubId === activeClub?.id);
  const clubBatches = batches.filter(b => b.clubId === activeClub?.id);
  const totalRevenue = payments.filter(p => p.clubId === activeClub?.id).reduce((sum, p) => sum + p.amount, 0);

  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    addPlayer({
      name: newPlayerName.trim(),
      clubId: activeClub?.id || 'club-1',
      clubName: activeClub?.name || 'Club Academy',
      sport: 'TABLE_TENNIS',
      category: newPlayerCategory,
      hand: newPlayerHand,
      playingStyle: newPlayerStyle
    });
    setNewPlayerName('');
    setShowAddPlayerModal(false);
  };

  return (
    <div className="space-y-7">
      {/* 1. Club Identity Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-bold tracking-wider uppercase">
              Club Workspace
            </span>
            <span className="text-xs text-slate-400 font-medium">Club Code: {activeClub?.code || 'CLUB-01'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {activeClub?.name || 'Club Academy'}
          </h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {activeClub?.address || '12 Sports Complex'} • {activeClub?.city || 'Chennai'} • Affiliated Academy
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddPlayerModal(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Enroll Athlete
          </Button>
          <PrimaryButton
            size="sm"
            onClick={onOpenWizard}
            icon={<Trophy className="w-3.5 h-3.5" />}
          >
            Host Club Event
          </PrimaryButton>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Club Athletes"
          value={clubPlayers.length}
          subtitle="Enrolled members"
          icon={Users}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          onClick={() => onNavigate('players')}
        />
        <StatCard
          title="Active Batches"
          value={clubBatches.length}
          subtitle="Training programs"
          icon={CalendarDays}
          iconColor="text-emerald-600"
          bgColor="bg-emerald-50"
          onClick={() => onNavigate('batches')}
        />
        <StatCard
          title="Coaching Staff"
          value={clubCoaches.length}
          subtitle="Certified instructors"
          icon={UserSquare2}
          iconColor="text-purple-600"
          bgColor="bg-purple-50"
          onClick={() => onNavigate('coaches')}
        />
        <StatCard
          title="Monthly Collections"
          value={`₹${totalRevenue.toLocaleString()}`}
          subtitle="Active subscriptions"
          icon={CreditCard}
          iconColor="text-amber-600"
          bgColor="bg-amber-50"
          onClick={() => onNavigate('memberships')}
        />
      </div>

      {/* 3. Club Training Batches (Cards inspired by reference "My Courses") */}
      <DashboardSection
        title="Training Batches & Squads"
        subtitle="Weekly operational schedules and head count"
        actionText="Manage all batches →"
        onAction={() => onNavigate('batches')}
      >
        {clubBatches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clubBatches.map(batch => (
              <div
                key={batch.id}
                onClick={() => onNavigate('attendance')}
                className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {batch.startTime} - {batch.endTime}
                    </span>
                    <StatusBadge status="ACTIVE" size="sm" />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    {batch.name}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Coach: <span className="font-semibold text-slate-700">{batch.coachName || 'Head Coach'}</span>
                  </p>

                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    {batch.days.slice(0, 3).map(day => (
                      <span key={day} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                        {day}
                      </span>
                    ))}
                    {batch.days.length > 3 && (
                      <span className="text-[10px] text-slate-400 font-medium">+{batch.days.length - 3} days</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Cap: {batch.capacity} Students</span>
                  <span className="text-xs font-bold text-emerald-600">Mark Attendance →</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="No Batches Configured"
            description="Create your first training batch to start scheduling student sessions and daily attendance."
            actionText="Create Training Batch"
            onAction={() => onNavigate('batches')}
          />
        )}
      </DashboardSection>

      {/* 4. Enrolled Athletes Roster (Clean, spacious card list) */}
      <DashboardSection
        title="Club Athletes & Trainees"
        subtitle="Recent registered players in your academy"
        actionText="Full Athlete Roster →"
        onAction={() => onNavigate('players')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {clubPlayers.slice(0, 4).map(player => (
            <div
              key={player.id}
              onClick={() => onNavigate('players')}
              className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center"
            >
              <img
                src={player.photoUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`}
                alt={player.name}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-100 mb-2.5"
                referrerPolicy="no-referrer"
              />
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">{player.name}</h4>
              <p className="text-[11px] text-slate-400 font-medium">ID: {player.permanentId || 'TT-001'}</p>
              
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap justify-center">
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                  {player.category || 'Open'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                  {player.playingStyle || 'Attacking'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </DashboardSection>

      {/* Add Athlete Modal */}
      {showAddPlayerModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Enroll New Club Athlete</h3>
              <button
                onClick={() => setShowAddPlayerModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreatePlayer} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Athlete Full Name</label>
                <input
                  type="text"
                  required
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="e.g., Arjun Rao"
                  className="mt-1 w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Category</label>
                  <select
                    value={newPlayerCategory}
                    onChange={(e) => setNewPlayerCategory(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Under 15">Under 15</option>
                    <option value="Under 19">Under 19</option>
                    <option value="Men Singles">Men Singles</option>
                    <option value="Women Singles">Women Singles</option>
                    <option value="Veterans">Veterans</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Dominant Hand</label>
                  <select
                    value={newPlayerHand}
                    onChange={(e) => setNewPlayerHand(e.target.value as 'RIGHT' | 'LEFT')}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="RIGHT">Right Hand</option>
                    <option value="LEFT">Left Hand</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowAddPlayerModal(false)}>
                  Cancel
                </Button>
                <PrimaryButton size="sm" type="submit">
                  Confirm Enrollment
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
