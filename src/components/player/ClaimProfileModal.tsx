import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserCheck, ShieldCheck, Search, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ClaimProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClaimProfileModal: React.FC<ClaimProfileModalProps> = ({ isOpen, onClose }) => {
  const { players, currentUser, claimPlayerProfile } = useApp();
  const [searchTerm, setSearchTerm] = useState('TT-00184');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>('TT-00184');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.playerId.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 6);

  const handleClaim = () => {
    if (!selectedPlayerId) return;
    const res = claimPlayerProfile(selectedPlayerId);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const selectedPlayer = players.find(p => p.playerId === selectedPlayerId || p.id === selectedPlayerId);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-sm">Claim & Link Player Profile</h3>
              <p className="text-xs text-neutral-500">Unify tournament history with authenticated login</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="p-3 bg-blue-50/60 border border-blue-200/60 rounded-xl text-xs text-blue-800 space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Independent Player Identity Model</span>
            </div>
            <p className="text-blue-700 leading-relaxed">
              In SportOS, players are created with permanent IDs (e.g. <strong>TT-00184</strong>) without requiring emails.
              Linking preserves your existing wins, match history, rating, and standings without creating duplicates.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Search by Player ID or Name
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
              <input
                id="input-claim-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g. TT-00184 or Rahul Kumar"
                className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto border border-neutral-100 rounded-lg p-1.5">
            {filteredPlayers.length === 0 ? (
              <div className="p-4 text-center text-xs text-neutral-400">No matching athlete records found.</div>
            ) : (
              filteredPlayers.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlayerId(p.playerId)}
                  className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                    selectedPlayerId === p.playerId
                      ? 'border-blue-500 bg-blue-50/50'
                      : 'border-transparent hover:bg-neutral-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded">
                        {p.playerId}
                      </span>
                      <span className="text-xs font-semibold text-neutral-900">{p.name}</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      {p.clubName} • {p.sport} • {p.matchesPlayed} matches ({p.wins}W - {p.losses}L)
                    </p>
                  </div>
                  {selectedPlayerId === p.playerId ? (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <span className="text-[11px] text-neutral-400 font-medium">Select</span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Preview of Profile to Link */}
          {selectedPlayer && (
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                Account Link Preview
              </span>
              <div className="grid grid-cols-2 gap-2 text-neutral-700">
                <div>
                  <span className="text-neutral-400">Logged User:</span>
                  <p className="font-medium truncate">{currentUser.name} ({currentUser.email})</p>
                </div>
                <div>
                  <span className="text-neutral-400">Permanent Player:</span>
                  <p className="font-medium">{selectedPlayer.name} ({selectedPlayer.playerId})</p>
                </div>
                <div>
                  <span className="text-neutral-400">Current Rating:</span>
                  <p className="font-bold text-amber-600">{selectedPlayer.rating} pts</p>
                </div>
                <div>
                  <span className="text-neutral-400">Career Record:</span>
                  <p className="font-bold text-emerald-600">{selectedPlayer.wins}W / {selectedPlayer.losses}L</p>
                </div>
              </div>
            </div>
          )}

          {feedback && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{feedback.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/80 flex items-center justify-end gap-2">
          <button
            id="btn-cancel-claim"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-neutral-300 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
          >
            Cancel
          </button>
          <button
            id="btn-confirm-claim"
            onClick={handleClaim}
            disabled={!selectedPlayerId}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
          >
            Verify & Link Profile
          </button>
        </div>
      </div>
    </div>
  );
};
