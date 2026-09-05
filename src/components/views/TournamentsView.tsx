import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Tournament, TournamentStatus } from '../../types';
import {
  Trophy,
  Calendar,
  MapPin,
  Search,
  Plus,
  Filter,
  Users,
  Grid2X2,
  ChevronRight,
  Tv,
  Activity,
  Play
} from 'lucide-react';

interface TournamentsViewProps {
  onSelectTournament: (tournamentId: string, initialTab?: string) => void;
  onOpenWizard: () => void;
  onOpenTvArena: () => void;
  onOpenScoring: (matchId?: string) => void;
}

export const TournamentsView: React.FC<TournamentsViewProps> = ({
  onSelectTournament,
  onOpenWizard,
  onOpenTvArena,
  onOpenScoring
}) => {
  const { tournaments, organization } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredTournaments = tournaments.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.city.toLowerCase().includes(search.toLowerCase()) ||
      t.venueName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold tracking-wider uppercase">
              Tournament Lifecycle Management
            </span>
            <span className="text-xs text-slate-400">Circuit & Open Championships</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Tournaments & Competitions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            End-to-end management: registrations, automated seeding, court scheduling, and live arena score broadcasting.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenTvArena}
            className="px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
          >
            <Tv className="w-4 h-4 text-amber-400" />
            <span>TV Arena</span>
          </button>
          <button
            onClick={onOpenWizard}
            className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Tournament</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tournament title or city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'LIVE', 'REGISTRATION_OPEN', 'SETUP', 'READY', 'COMPLETED'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTournaments.map(t => {
          const isLive = t.status === 'LIVE';

          return (
            <div
              key={t.id}
              className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 tracking-wider">
                      {t.sport.replace(/_/g, ' ')}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-2 line-clamp-1">
                      {t.title}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.venueName}, {t.city}</span>
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                      isLive
                        ? 'bg-rose-100 text-rose-700 animate-pulse'
                        : t.status === 'REGISTRATION_OPEN'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    ● {t.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="py-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Dates:</span>
                    <span className="font-semibold text-slate-900">{t.startDate} — {t.endDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Format Type:</span>
                    <span className="font-semibold text-slate-900">
                      {t.type === 'CIRCUIT' ? 'State Ranking' : 'Club Open'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Divisions:</span>
                    <span className="font-bold text-emerald-600">
                      {t.eventsCount || 3} Active Divisions
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectTournament(t.id, 'draws')}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Draws
                </button>

                <button
                  onClick={() => onSelectTournament(t.id, 'overview')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors inline-flex items-center gap-1"
                >
                  <span>Open Tournament</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
