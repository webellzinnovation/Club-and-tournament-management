import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus } from '../../types';
import {
  ClipboardList,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Users,
  Check,
  RotateCcw
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { batches, players, attendanceRecords, markAttendance } = useApp();

  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState('2026-09-05');

  const currentBatch = batches.find(b => b.id === selectedBatchId) || batches[0];
  const batchPlayers = players.filter(p => currentBatch?.playerIds.includes(p.id));

  // Build current map of player status for this date & batch
  const getPlayerStatus = (playerId: string): AttendanceStatus => {
    const rec = attendanceRecords.find(
      r => r.batchId === currentBatch?.id && r.playerId === playerId && r.date === selectedDate
    );
    return rec ? rec.status : 'PRESENT'; // Default present
  };

  const handleStatusChange = (playerId: string, status: AttendanceStatus) => {
    markAttendance(currentBatch.id, playerId, selectedDate, status);
  };

  const handleMarkAllPresent = () => {
    batchPlayers.forEach(p => {
      markAttendance(currentBatch.id, p.id, selectedDate, 'PRESENT');
    });
  };

  const presentCount = batchPlayers.filter(p => getPlayerStatus(p.id) === 'PRESENT').length;
  const absentCount = batchPlayers.filter(p => getPlayerStatus(p.id) === 'ABSENT').length;
  const lateCount = batchPlayers.filter(p => getPlayerStatus(p.id) === 'LATE').length;
  const attendanceRate = batchPlayers.length > 0 ? Math.round((presentCount / batchPlayers.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Attendance Header */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold tracking-wider uppercase">
              Club Academy Operations
            </span>
            <span className="text-xs text-neutral-400">Daily Training Log</span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mt-1">
            Training Attendance Matrix
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Log athlete check-ins, punctuality, and session attendance across training squads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-mark-all-present"
            onClick={handleMarkAllPresent}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>Mark All Present</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Batch Selector & Date */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Squad Batch</label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none"
            >
              {batches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.timing})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Session Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none"
            >
            </input>
          </div>
        </div>

        {/* Quick Rate Indicator */}
        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <span className="text-[10px] text-neutral-400 block uppercase">Attendance Rate</span>
            <span className="text-base font-black text-emerald-600">{attendanceRate}%</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-neutral-400 block uppercase">Present / Absent</span>
            <span className="text-base font-bold text-neutral-800">{presentCount} / {absentCount}</span>
          </div>
        </div>
      </div>

      {/* Athlete Matrix Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 bg-neutral-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-neutral-500" />
            <span className="text-xs font-bold text-neutral-900">
              {currentBatch.name} — Coach: {currentBatch.coachName} ({batchPlayers.length} Athletes)
            </span>
          </div>
          <span className="text-xs text-neutral-400">Timing: {currentBatch.timing}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-100/50 text-neutral-600 font-bold">
                <th className="p-3 w-16 text-center">ID</th>
                <th className="p-3">Athlete Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Current Rating</th>
                <th className="p-3 text-center">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {batchPlayers.map(p => {
                const currentStatus = getPlayerStatus(p.id);
                return (
                  <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="p-3 text-center font-mono font-bold text-neutral-500">
                      {p.playerId}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-neutral-900">{p.name}</div>
                      <div className="text-[10px] text-neutral-400">{p.playingStyle || 'Attacking'}</div>
                    </td>
                    <td className="p-3 font-medium text-neutral-600">{p.category}</td>
                    <td className="p-3 font-mono font-bold text-amber-600">{p.rating} pts</td>
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl">
                        {[
                          { status: 'PRESENT', label: 'Present', color: 'bg-emerald-600 text-white' },
                          { status: 'ABSENT', label: 'Absent', color: 'bg-rose-600 text-white' },
                          { status: 'LATE', label: 'Late', color: 'bg-amber-500 text-neutral-950' },
                          { status: 'EXCUSED', label: 'Excused', color: 'bg-neutral-600 text-white' }
                        ].map(opt => (
                          <button
                            key={opt.status}
                            type="button"
                            onClick={() => handleStatusChange(p.id, opt.status as AttendanceStatus)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                              currentStatus === opt.status
                                ? `${opt.color} shadow-xs`
                                : 'text-neutral-500 hover:text-neutral-800'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
