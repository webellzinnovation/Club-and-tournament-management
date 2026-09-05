import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Match, CompetitionResource, Referee } from '../../types';
import {
  Grid2X2,
  Clock,
  MapPin,
  UserSquare2,
  ShieldAlert,
  BellRing,
  Plus,
  Wand2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Play,
  X
} from 'lucide-react';

interface AssignmentsBoardProps {
  onNavigate: (view: string) => void;
  onSelectMatchForScoring: (matchId: string) => void;
}

export const AssignmentsBoard: React.FC<AssignmentsBoardProps> = ({
  onNavigate,
  onSelectMatchForScoring
}) => {
  const {
    activeTournament,
    matches,
    resources,
    referees,
    assignMatch,
    callPlayers,
    schedulingConflicts
  } = useApp();

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [selectedReferee, setSelectedReferee] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('11:00');
  const [scheduledDate, setScheduledDate] = useState<string>('2026-09-05');
  const [callModalMatch, setCallModalMatch] = useState<Match | null>(null);
  const [callTiming, setCallTiming] = useState<number>(0);

  // Time slots for schedule matrix
  const timeSlots = [
    '09:00', '09:45', '10:30', '11:15', '12:00', '14:00', '14:45', '15:30', '16:15', '17:00'
  ];

  const tournamentResources = resources.filter(r => r.sport === activeTournament?.sport);
  const unassignedMatches = matches.filter(m => !m.resourceId && m.status !== 'VERIFIED');

  const handleOpenAssign = (match: Match) => {
    setSelectedMatch(match);
    setSelectedResource(match.resourceId || tournamentResources[0]?.id || '');
    setSelectedReferee(match.refereeId || referees[0]?.id || '');
    setScheduledTime(match.scheduledTime || '11:00');
    setScheduledDate(match.scheduledDate || '2026-09-05');
  };

  const handleSaveAssignment = () => {
    if (!selectedMatch) return;
    assignMatch(selectedMatch.id, selectedResource, selectedReferee, scheduledDate, scheduledTime);
    setSelectedMatch(null);
  };

  const handleAutoDistribute = () => {
    if (unassignedMatches.length === 0 || tournamentResources.length === 0) return;
    let resIndex = 0;
    let slotIndex = 2; // Start from 10:30

    unassignedMatches.forEach((m, idx) => {
      const res = tournamentResources[resIndex % tournamentResources.length];
      const slot = timeSlots[slotIndex % timeSlots.length];
      const ref = referees[idx % referees.length];

      assignMatch(m.id, res.id, ref?.id, '2026-09-05', slot);

      resIndex++;
      if (resIndex % tournamentResources.length === 0) {
        slotIndex++;
      }
    });
  };

  const handleCallPlayersConfirm = () => {
    if (!callModalMatch) return;
    callPlayers(callModalMatch.id, callTiming);
    setCallModalMatch(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Operations Header */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold tracking-wider uppercase">
              Tournament Assignments Board
            </span>
            <span className="text-xs text-neutral-400">Competition Resource Scheduler</span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mt-1">
            Resource & Referee Allocation Grid
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real-time conflict detection across {tournamentResources.length} {activeTournament?.sport === 'TABLE_TENNIS' ? 'Tables' : 'Courts/Grounds'}, certified referees, and athletes.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {unassignedMatches.length > 0 && (
            <button
              id="btn-auto-distribute"
              onClick={handleAutoDistribute}
              className="px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Wand2 className="w-4 h-4 text-purple-600" />
              <span>Auto-Distribute ({unassignedMatches.length} Unassigned)</span>
            </button>
          )}
          <button
            id="btn-open-live-scoring"
            onClick={() => onNavigate('live_scoring')}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Referee Touch Console</span>
          </button>
        </div>
      </div>

      {/* Scheduling Conflicts Banner */}
      {schedulingConflicts.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>
              {schedulingConflicts.length} Assignment Conflict{schedulingConflicts.length > 1 ? 's' : ''} Detected! Overlaps prevent smooth tournament progression.
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {schedulingConflicts.map((c, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-white border border-rose-200 text-xs text-rose-900">
                <div className="flex items-center gap-1.5 font-semibold text-rose-700">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{c.type.replace(/_/g, ' ')}</span>
                </div>
                <p className="mt-1 text-neutral-700">{c.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unassigned Matches Shelf if any */}
      {unassignedMatches.length > 0 && (
        <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Unassigned Matches Queue ({unassignedMatches.length})
              </h3>
            </div>
            <span className="text-[11px] text-amber-700">Click any match to allocate table & referee</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {unassignedMatches.map(m => (
              <div
                key={m.id}
                onClick={() => handleOpenAssign(m)}
                className="p-3 bg-white rounded-xl border border-amber-200 hover:border-amber-400 hover:shadow-xs cursor-pointer transition-all text-xs"
              >
                <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                  <span>Match #{m.matchNumber}</span>
                  <span className="text-amber-800 font-bold">{m.stageName}</span>
                </div>
                <div className="mt-1.5 font-semibold text-neutral-900">
                  {m.participant1Name} vs {m.participant2Name}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-blue-600 font-semibold">
                  <span>+ Assign Resource</span>
                  <span>{m.estimatedDurationMinutes}m</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resource Assignment Matrix / Visual Schedule */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2">
            <Grid2X2 className="w-4 h-4 text-neutral-600" />
            <h3 className="text-sm font-bold text-neutral-900">
              Live Competition Resources Matrix (Tables 1 - {tournamentResources.length})
            </h3>
          </div>
          <span className="text-xs text-neutral-500 font-medium">Date: 2026-09-05</span>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Column Headers: Resources */}
            <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-100/70 text-xs font-bold text-neutral-700">
              <div className="p-3 border-r border-neutral-200 text-center text-neutral-500">
                Time Slot
              </div>
              {tournamentResources.slice(0, 6).map(res => (
                <div key={res.id} className="p-3 border-r border-neutral-200 text-center">
                  <span className="block text-neutral-900 font-bold">{res.name}</span>
                  <span className="text-[10px] text-neutral-400 font-normal truncate block">{res.venueName}</span>
                </div>
              ))}
            </div>

            {/* Time Slot Rows */}
            {timeSlots.map(time => (
              <div key={time} className="grid grid-cols-7 border-b border-neutral-100 hover:bg-neutral-50/40 text-xs">
                {/* Time Label */}
                <div className="p-3 border-r border-neutral-200 bg-neutral-50/60 font-mono font-bold text-neutral-600 flex items-center justify-center">
                  {time}
                </div>

                {/* Resource Cells */}
                {tournamentResources.slice(0, 6).map(res => {
                  const matchOnThis = matches.find(
                    m => m.resourceId === res.id && m.scheduledTime === time
                  );

                  return (
                    <div
                      key={res.id}
                      className={`p-2 border-r border-neutral-100 min-h-[90px] flex flex-col justify-between transition-colors ${
                        matchOnThis ? 'bg-white' : 'hover:bg-neutral-50'
                      }`}
                    >
                      {matchOnThis ? (
                        <div className={`h-full rounded-lg p-2 border flex flex-col justify-between ${
                          matchOnThis.status === 'LIVE'
                            ? 'bg-emerald-50/80 border-emerald-300'
                            : matchOnThis.status === 'CALLED'
                            ? 'bg-amber-50/80 border-amber-300'
                            : matchOnThis.status === 'VERIFIED'
                            ? 'bg-neutral-100 border-neutral-200'
                            : 'bg-blue-50/50 border-blue-200'
                        }`}>
                          <div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-mono font-bold text-neutral-600">#{matchOnThis.matchNumber}</span>
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                matchOnThis.status === 'LIVE'
                                  ? 'bg-emerald-200 text-emerald-900 animate-pulse'
                                  : matchOnThis.status === 'CALLED'
                                  ? 'bg-amber-200 text-amber-900'
                                  : 'bg-neutral-200 text-neutral-800'
                              }`}>
                                {matchOnThis.status}
                              </span>
                            </div>

                            <p className="font-bold text-neutral-900 text-xs mt-1 leading-tight line-clamp-2">
                              {matchOnThis.participant1Name} vs {matchOnThis.participant2Name}
                            </p>
                            <p className="text-[10px] text-neutral-500 mt-0.5 truncate">
                              Ref: {matchOnThis.refereeName || 'Unassigned'}
                            </p>
                          </div>

                          <div className="mt-2 pt-1 border-t border-neutral-200/60 flex items-center justify-between text-[10px]">
                            <button
                              id={`btn-call-${matchOnThis.id}`}
                              onClick={() => {
                                setCallModalMatch(matchOnThis);
                                setCallTiming(0);
                              }}
                              className="px-1.5 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold flex items-center gap-1"
                              title="Call Players to Table"
                            >
                              <BellRing className="w-3 h-3" />
                              <span>Call</span>
                            </button>

                            <button
                              id={`btn-edit-assign-${matchOnThis.id}`}
                              onClick={() => handleOpenAssign(matchOnThis)}
                              className="text-neutral-500 hover:text-neutral-800 font-semibold"
                            >
                              Reassign
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-[11px] text-neutral-400 font-medium">Available</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 border border-neutral-200 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Assign Competition Resource</h3>
                <p className="text-neutral-500 text-[11px]">Match #{selectedMatch.matchNumber}: {selectedMatch.participant1Name} vs {selectedMatch.participant2Name}</p>
              </div>
              <button onClick={() => setSelectedMatch(null)} className="p-1 text-neutral-400 hover:text-neutral-600 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Competition Table / Court / Ground
              </label>
              <select
                id="select-assign-resource"
                value={selectedResource}
                onChange={(e) => setSelectedResource(e.target.value)}
                className="w-full p-2 border border-neutral-200 rounded-lg focus:outline-none"
              >
                {tournamentResources.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.venueName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Certified Referee / Match Official
              </label>
              <select
                id="select-assign-referee"
                value={selectedReferee}
                onChange={(e) => setSelectedReferee(e.target.value)}
                className="w-full p-2 border border-neutral-200 rounded-lg focus:outline-none"
              >
                {referees.map(ref => (
                  <option key={ref.id} value={ref.id}>
                    {ref.name} ({ref.certificationLevel})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Match Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full p-2 border border-neutral-200 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Time Slot</label>
                <select
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full p-2 border border-neutral-200 rounded-lg focus:outline-none font-mono"
                >
                  {timeSlots.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedMatch(null)}
                className="px-3.5 py-1.5 rounded-lg border border-neutral-300 font-medium hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-assignment"
                onClick={handleSaveAssignment}
                className="px-4 py-1.5 rounded-lg bg-neutral-900 text-white font-semibold hover:bg-neutral-800"
              >
                Confirm & Notify Users
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Player Call Modal */}
      {callModalMatch && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 border border-neutral-200 text-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Issue Player Match Call</h3>
                <p className="text-neutral-500 text-[11px]">Direct in-app alert & public arena announcement</p>
              </div>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <p className="font-semibold text-neutral-900">
                Match #{callModalMatch.matchNumber}: {callModalMatch.participant1Name} vs {callModalMatch.participant2Name}
              </p>
              <p className="text-neutral-500">
                Resource: <strong className="text-neutral-800">{callModalMatch.resourceName || 'Unassigned Table'}</strong>
              </p>
              <p className="text-neutral-500">
                Scheduled Time: <strong>{callModalMatch.scheduledTime}</strong> (Ref: {callModalMatch.refereeName || 'Assigned'})
              </p>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1.5">
                Report Timing Option
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 0, label: 'Immediately' },
                  { val: 5, label: '5 min before' },
                  { val: 10, label: '10 min before' }
                ].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setCallTiming(opt.val)}
                    className={`py-2 px-2 text-center rounded-lg border font-semibold ${
                      callTiming === opt.val
                        ? 'bg-amber-500 text-neutral-950 border-amber-500'
                        : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setCallModalMatch(null)}
                className="px-3.5 py-1.5 rounded-lg border border-neutral-300 font-medium hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                id="btn-broadcast-player-call"
                onClick={handleCallPlayersConfirm}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold"
              >
                Broadcast Call Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
