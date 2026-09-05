import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Player } from '../../types';
import {
  Users,
  Search,
  Plus,
  ShieldCheck,
  Award,
  Filter,
  Activity,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface PlayersViewProps {
  onOpenClaimModal: () => void;
}

export const PlayersView: React.FC<PlayersViewProps> = ({ onOpenClaimModal }) => {
  const { players, clubs, addPlayer } = useApp();
  const [search, setSearch] = useState('');
  const [selectedClub, setSelectedClub] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Player Form
  const [name, setName] = useState('');
  const [clubId, setClubId] = useState(clubs[0]?.id || '');
  const [category, setCategory] = useState('Open');
  const [style, setStyle] = useState('Attacking Topspin');
  const [hand, setHand] = useState<'RIGHT' | 'LEFT'>('RIGHT');

  const filteredPlayers = players.filter(p => {
    const matchQuery = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.playerId.toLowerCase().includes(search.toLowerCase()) ||
      p.clubName?.toLowerCase().includes(search.toLowerCase());
    const matchClub = selectedClub === 'ALL' || p.clubId === selectedClub;
    return matchQuery && matchClub;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const c = clubs.find(cl => cl.id === clubId);
    addPlayer({
      name: name.trim(),
      clubId,
      clubName: c?.name || 'Independent',
      sport: 'TABLE_TENNIS',
      category,
      hand,
      playingStyle: style
    });
    setName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold tracking-wider uppercase">
              Permanent Identity Registry
            </span>
            <span className="text-xs text-neutral-400">Decoupled Athlete Profiles</span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mt-1">
            Global Athletes & Player Registry
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Players possess permanent IDs (e.g. TT-00184) created without mandatory email/phone. Accounts can claim anytime.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-open-claim-modal"
            onClick={onOpenClaimModal}
            className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Claim / Link Account</span>
          </button>
          <button
            id="btn-register-athlete"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Register Athlete</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
          <input
            id="input-filter-athletes"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, permanent ID (TT-00184)..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-neutral-500 font-semibold whitespace-nowrap">Filter Club:</span>
          <select
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
            className="px-3 py-2 text-xs border border-neutral-200 rounded-xl bg-neutral-50 focus:outline-none"
          >
            <option value="ALL">All Clubs</option>
            {clubs.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Players Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.map(p => (
          <div
            key={p.id}
            className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs hover:border-neutral-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <img
                    src={p.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={p.name}
                    className="w-11 h-11 rounded-xl object-cover border border-neutral-200"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">{p.name}</h3>
                    <p className="text-[11px] text-neutral-500">{p.clubName}</p>
                  </div>
                </div>

                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-200">
                  {p.playerId}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 text-center border-b border-neutral-100 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-400 block uppercase">Rating</span>
                  <span className="font-bold text-amber-600 text-sm">{p.rating}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block uppercase">Record</span>
                  <span className="font-semibold text-neutral-800 text-xs">{p.wins}W - {p.losses}L</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block uppercase">Category</span>
                  <span className="font-semibold text-neutral-700 text-xs truncate block">{p.category}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between text-xs text-neutral-500">
              <span>{p.playingStyle || 'Offensive'} • {p.hand}</span>
              <span className="text-emerald-600 font-bold">
                #{p.rankings?.clubRank || 1} in Club
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Athlete Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 border border-neutral-200 text-xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">Register Athlete Profile</h3>
            <p className="text-neutral-500">
              Generates a permanent SportOS Player ID. No email or phone is required.
            </p>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pradeep Sundaram"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Affiliated Club</label>
                <select
                  value={clubId}
                  onChange={(e) => setClubId(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none"
                >
                  {clubs.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none"
                  >
                    <option value="Open">Open</option>
                    <option value="Under-17">Under-17</option>
                    <option value="Under-15">Under-15</option>
                    <option value="Veterans">Veterans</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Hand</label>
                  <select
                    value={hand}
                    onChange={(e) => setHand(e.target.value as 'RIGHT' | 'LEFT')}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none"
                  >
                    <option value="RIGHT">Right Hand</option>
                    <option value="LEFT">Left Hand</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-neutral-300 font-medium hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-neutral-900 text-white font-semibold hover:bg-neutral-800"
                >
                  Create Permanent Athlete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
