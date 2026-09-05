import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Grid2X2,
  Building2,
  Users,
  Calendar,
  CheckCircle2,
  MapPin,
  Plus
} from 'lucide-react';

interface ClubsViewProps {
  onSelectClub?: (clubId: string) => void;
}

export const ClubsView: React.FC<ClubsViewProps> = ({ onSelectClub }) => {
  const { clubs, organization, players } = useApp();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold tracking-wider uppercase">
              Club Multi-Tenant Directory
            </span>
            <span className="text-xs text-neutral-400">Parent Federation: {organization?.name || 'SportOS Federation'}</span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mt-1">Registered Sports Clubs & Academies</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Individual sports clubs operate with isolated coaches, athlete rosters, subscription fees, and attendance logs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {clubs.map(c => {
          const clubPlayerCount = players.filter(p => p.clubId === c.id).length;
          return (
            <div
              key={c.id}
              onClick={() => onSelectClub && onSelectClub(c.id)}
              className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-neutral-100">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 hover:text-indigo-600 transition-colors">{c.name}</h3>
                    <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{c.city}</span>
                    </p>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                    {c.code}
                  </span>
                </div>

                <div className="py-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Sports Supported:</span>
                    <span className="font-semibold text-neutral-900">{c.sportsSupported.join(', ')}</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Branches / Venues:</span>
                    <span className="font-semibold text-neutral-900">{c.branchesCount} Facility Locations</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Registered Athletes:</span>
                    <span className="font-bold text-emerald-600">{clubPlayerCount} Athletes</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Tenant</span>
                </span>
                <span className="text-indigo-600 font-bold hover:underline">Open Workspace →</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
