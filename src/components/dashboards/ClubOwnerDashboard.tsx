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
  TrendingUp
} from 'lucide-react';

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

  const clubPlayers = players.filter(p => p.clubId === activeClub.id);
  const clubCoaches = coaches.filter(c => c.clubId === activeClub.id);
  const clubBatches = batches.filter(b => b.clubId === activeClub.id);
  const totalRevenue = payments.filter(p => p.clubId === activeClub.id).reduce((sum, p) => sum + p.amount, 0);

  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    addPlayer({
      name: newPlayerName.trim(),
      clubId: activeClub.id,
      clubName: activeClub.name,
      sport: 'TABLE_TENNIS',
      category: newPlayerCategory,
      hand: newPlayerHand,
      playingStyle: newPlayerStyle
    });
    setNewPlayerName('');
    setShowAddPlayerModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Club Banner */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold tracking-wider uppercase">
              Club Management
            </span>
            <span className="text-xs text-neutral-400">Code: {activeClub.code}</span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mt-1">{activeClub.name}</h1>
          <p className="text-xs text-neutral-500 mt-0.5">{activeClub.address} • {activeClub.city}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-quick-add-player"
            onClick={() => setShowAddPlayerModal(true)}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add Player</span>
          </button>
          <button
            id="btn-club-create-tournament"
            onClick={onOpenWizard}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Trophy className="w-4 h-4" />
            <span>Host Club Tournament</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Enrolled Athletes</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-2">{clubPlayers.length}</div>
          <div className="text-[11px] text-neutral-500 mt-1">Permanent IDs assigned</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Active Batches</span>
            <CalendarDays className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-2">{clubBatches.length}</div>
          <div className="text-[11px] text-neutral-500 mt-1">{clubCoaches.length} coaches assigned</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Today's Attendance</span>
            <ClipboardList className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-2">92%</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Morning Squad completed</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Fees Collected</span>
            <CreditCard className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-2">₹{(totalRevenue / 1000).toFixed(1)}k</div>
          <div className="text-[11px] text-neutral-500 mt-1">Subscriptions & entries</div>
        </div>
      </div>

      {/* Split: Batches & Attendance Matrix Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Batches Overview */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Training Batches & Squads</h3>
              <p className="text-xs text-neutral-500">Coach assignments, timings, and player rosters</p>
            </div>
            <button
              onClick={() => onNavigate('batches')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Manage Batches →
            </button>
          </div>

          <div className="space-y-3">
            {clubBatches.map(b => (
              <div key={b.id} className="p-3.5 rounded-xl border border-neutral-200 hover:border-neutral-300 transition-colors flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900">{b.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 font-medium">
                      {b.sport}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Coach: <span className="text-neutral-700 font-medium">{b.coachName}</span> • {b.timing} ({b.days.join(', ')})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-neutral-900">{b.playerIds.length} / {b.maxCapacity}</span>
                  <p className="text-[10px] text-neutral-400">athletes</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Membership Plans */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-neutral-900">Membership Plans</h3>
            <button
              onClick={() => onNavigate('memberships')}
              className="text-xs text-blue-600 font-semibold hover:text-blue-800"
            >
              View Plans →
            </button>
          </div>

          <div className="space-y-3">
            {membershipPlans.map(plan => (
              <div key={plan.id} className="p-3 rounded-lg bg-neutral-50 border border-neutral-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-900">{plan.name}</span>
                  <span className="font-bold text-neutral-900">₹{plan.price.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-neutral-500 mt-0.5">{plan.billingCycle} • {plan.activeSubscribersCount} active members</p>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-neutral-100">
            <button
              onClick={() => onNavigate('attendance')}
              className="w-full py-2 px-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Open Daily Attendance Matrix</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Player Quick Modal */}
      {showAddPlayerModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 border border-neutral-200">
            <h3 className="text-sm font-bold text-neutral-900 mb-1">Add Athlete to Club</h3>
            <p className="text-xs text-neutral-500 mb-4">
              Requires only athlete's Name. Contact info (mobile/email) is completely optional.
            </p>

            <form onSubmit={handleCreatePlayer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Athlete Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-new-player-name"
                  type="text"
                  required
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="e.g. Ramesh S."
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Category</label>
                  <select
                    value={newPlayerCategory}
                    onChange={(e) => setNewPlayerCategory(e.target.value)}
                    className="w-full px-2.5 py-2 border border-neutral-200 rounded-lg focus:outline-none"
                  >
                    <option value="Open">Open Men</option>
                    <option value="Open Women">Open Women</option>
                    <option value="Under-17">Under-17</option>
                    <option value="Under-15">Under-15</option>
                    <option value="Veterans">Veterans (40+)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Playing Hand</label>
                  <select
                    value={newPlayerHand}
                    onChange={(e) => setNewPlayerHand(e.target.value as 'RIGHT' | 'LEFT')}
                    className="w-full px-2.5 py-2 border border-neutral-200 rounded-lg focus:outline-none"
                  >
                    <option value="RIGHT">Right Handed</option>
                    <option value="LEFT">Left Handed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Playing Style</label>
                <input
                  type="text"
                  value={newPlayerStyle}
                  onChange={(e) => setNewPlayerStyle(e.target.value)}
                  placeholder="e.g. Offensive Topspin, Chopper, All-round"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPlayerModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-new-player"
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-neutral-900 text-white font-semibold hover:bg-neutral-800"
                >
                  Create Athlete Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
