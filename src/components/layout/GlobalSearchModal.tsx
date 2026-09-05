import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Trophy, Users, Activity, X } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEntity: (type: 'PLAYER' | 'TOURNAMENT' | 'MATCH', id: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectEntity
}) => {
  const { players, tournaments, matches } = useApp();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return { players: [], tournaments: [], matches: [] };
    const q = query.toLowerCase();

    const matchedPlayers = players.filter(
      p => p.name.toLowerCase().includes(q) || p.playerId.toLowerCase().includes(q) || p.clubName?.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedTournaments = tournaments.filter(
      t => t.title.toLowerCase().includes(q) || t.sport.toLowerCase().includes(q) || t.city.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedMatches = matches.filter(
      m =>
        m.participant1Name?.toLowerCase().includes(q) ||
        m.participant2Name?.toLowerCase().includes(q) ||
        m.resourceName?.toLowerCase().includes(q)
    ).slice(0, 4);

    return { players: matchedPlayers, tournaments: matchedTournaments, matches: matchedMatches };
  }, [query, players, tournaments, matches]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Search Input */}
        <div className="p-3 border-b border-neutral-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-neutral-400" />
          <input
            id="input-global-search"
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search athletes (e.g. Rahul, TT-00184), tournaments, matches, tables..."
            className="flex-1 text-sm bg-transparent border-none focus:outline-none text-neutral-900 placeholder:text-neutral-400"
          />
          <button
            id="btn-close-search"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {!query.trim() ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              Type athlete name, permanent Player ID, tournament, or court name to search.
            </div>
          ) : results.players.length === 0 && results.tournaments.length === 0 && results.matches.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              No matching records found for "{query}".
            </div>
          ) : (
            <>
              {results.players.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    <span>Athletes & Players ({results.players.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.players.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSelectEntity('PLAYER', p.id);
                          onClose();
                        }}
                        className="p-2 rounded-lg hover:bg-neutral-100 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-mono font-bold bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-700">
                            {p.playerId}
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-neutral-900">{p.name}</p>
                            <p className="text-[10px] text-neutral-500">{p.clubName} • {p.playingStyle || p.sport}</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-amber-600">Rating {p.rating}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.tournaments.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <span>Tournaments ({results.tournaments.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.tournaments.map(t => (
                      <div
                        key={t.id}
                        onClick={() => {
                          onSelectEntity('TOURNAMENT', t.id);
                          onClose();
                        }}
                        className="p-2 rounded-lg hover:bg-neutral-100 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-neutral-900">{t.title}</p>
                          <p className="text-[10px] text-neutral-500">{t.sport} • {t.city} • {t.status}</p>
                        </div>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                          {t.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.matches.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Matches & Fixtures ({results.matches.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.matches.map(m => (
                      <div
                        key={m.id}
                        onClick={() => {
                          onSelectEntity('MATCH', m.id);
                          onClose();
                        }}
                        className="p-2 rounded-lg hover:bg-neutral-100 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-neutral-900">
                            Match #{m.matchNumber}: {m.participant1Name} vs {m.participant2Name}
                          </p>
                          <p className="text-[10px] text-neutral-500">
                            {m.stageName} • {m.resourceName || 'Unassigned'} • {m.scheduledTime}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          m.status === 'LIVE' ? 'bg-emerald-100 text-emerald-800 animate-pulse' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          {m.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
