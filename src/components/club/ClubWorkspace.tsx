import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  Building2,
  Users,
  Calendar,
  ClipboardList,
  CreditCard,
  Trophy,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Flame,
  Award,
  ShieldCheck,
  UserPlus,
  Activity,
  CalendarDays
} from 'lucide-react';

interface ClubWorkspaceProps {
  clubId: string;
  onBack: () => void;
  onSelectPlayer: (playerId: string) => void;
  onSelectTournament: (tournamentId: string) => void;
}

export const ClubWorkspace: React.FC<ClubWorkspaceProps> = ({
  clubId,
  onBack,
  onSelectPlayer,
  onSelectTournament
}) => {
  const {
    clubs,
    organization,
    players,
    coaches,
    batches,
    attendanceRecords,
    membershipPlans,
    tournaments,
    registrations,
    trainingSessions,
    addPlayer,
    markAttendance,
    addTrainingSession
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'roster' | 'coaches' | 'batches' | 'attendance' | 'memberships' | 'tournaments'>('overview');
  const [searchRoster, setSearchRoster] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('ALL');

  // New athlete modal state
  const [showAddAthlete, setShowAddAthlete] = useState(false);
  const [newAthleteName, setNewAthleteName] = useState('');
  const [newAthleteCategory, setNewAthleteCategory] = useState('Open');
  const [newAthleteStyle, setNewAthleteStyle] = useState('Attacking Topspin');
  const [newAthleteHand, setNewAthleteHand] = useState<'RIGHT' | 'LEFT'>('RIGHT');

  // Attendance batch selection
  const [attendanceBatchId, setAttendanceBatchId] = useState(batches[0]?.id || 'batch-1');
  const todayStr = '2026-09-06';

  const club = clubs.find(c => c.id === clubId) || clubs[0];

  if (!club) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center max-w-lg mx-auto border border-slate-100 shadow-sm mt-8">
        <p className="text-slate-500 mb-4">Club workspace not found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Clubs Directory
        </button>
      </div>
    );
  }

  // Club roster
  const clubAthletes = players.filter(p => p.clubId === club.id);
  const filteredRoster = clubAthletes.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchRoster.toLowerCase()) ||
      p.playerId.toLowerCase().includes(searchRoster.toLowerCase());
    return matchSearch;
  });

  // Club coaches
  const clubCoaches = coaches.filter(c => c.clubId === club.id);

  // Club batches
  const clubBatches = batches.filter(b => b.clubId === club.id);

  // Club training sessions
  const clubSessions = trainingSessions.filter(s => s.clubId === club.id);

  // Club tournament registrations
  const clubTournamentRegistrations = registrations.filter(r => r.clubId === club.id);

  const handleRegisterAthlete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAthleteName.trim()) return;

    addPlayer({
      name: newAthleteName.trim(),
      clubId: club.id,
      clubName: club.name,
      sport: club.sportsSupported[0] || 'TABLE_TENNIS',
      category: newAthleteCategory,
      hand: newAthleteHand,
      playingStyle: newAthleteStyle
    });

    setNewAthleteName('');
    setShowAddAthlete(false);
  };

  const handleToggleAttendance = async (playerId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'PRESENT' ? 'LATE' : currentStatus === 'LATE' ? 'ABSENT' : 'PRESENT';
    await markAttendance(attendanceBatchId, playerId, todayStr, nextStatus as 'PRESENT' | 'LATE' | 'ABSENT');
  };

  const currentAttendanceRecord = attendanceRecords.find(
    r => r.batchId === attendanceBatchId && r.date === todayStr
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Clubs</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Federation Tenant:</span>
          <span className="font-semibold text-xs text-slate-700">{organization?.name || 'SportOS Federation'}</span>
        </div>
      </div>

      {/* Club Master Banner */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 text-white relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-600/30 shrink-0">
                {club.code || 'CTA'}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                    {club.sportsSupported.join(' • ')}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>{club.city}</span>
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {club.name}
                </h1>
                <p className="text-xs text-slate-300 mt-1">
                  Multi-court training facility with {club.branchesCount || 2} branches in {club.city}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                id="btn-add-club-athlete"
                onClick={() => setShowAddAthlete(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 inline-flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register Athlete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-100 overflow-x-auto">
          {[
            { id: 'overview', label: 'Club Overview' },
            { id: 'roster', label: `Athletes Roster (${clubAthletes.length})` },
            { id: 'batches', label: `Batches & Timings (${clubBatches.length})` },
            { id: 'attendance', label: 'Attendance Tracker' },
            { id: 'coaches', label: `Coaching Staff (${clubCoaches.length})` },
            { id: 'tournaments', label: `Tournament Entries (${clubTournamentRegistrations.length})` },
            { id: 'memberships', label: 'Memberships & Fees' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-3.5 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Registered Athletes
                  </span>
                  <div className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>{clubAthletes.length} Athletes</span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
                    100% with SportOS IDs
                  </span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Coaching Staff
                  </span>
                  <div className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>{clubCoaches.length || 2} Coaches</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">Certified NIS / ITTF</span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Active Batches
                  </span>
                  <div className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4 text-amber-500" />
                    <span>{clubBatches.length || 2} Batches</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">Daily court operations</span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Tournament Entries
                  </span>
                  <div className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-purple-600" />
                    <span>{clubTournamentRegistrations.length} Entries</span>
                  </div>
                  <span className="text-[11px] text-purple-600 font-semibold mt-0.5 block">
                    Active nominations
                  </span>
                </div>
              </div>

              {/* Training Sessions Today */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Training Sessions Scheduled Today</h3>
                    <p className="text-xs text-slate-500">Structured drills, morning and evening batch progressions</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Open Attendance Sheet →
                  </button>
                </div>

                <div className="space-y-3">
                  {clubSessions.map(s => (
                    <div
                      key={s.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold shrink-0 text-xs">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{s.batchName}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              s.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {s.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 font-medium">{s.focusArea}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {s.startTime} - {s.endTime} • {s.coachName}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setAttendanceBatchId(s.batchId);
                          setActiveTab('attendance');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        Mark Attendance
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Club Athletes Preview */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Featured Club Athletes</h3>
                    <p className="text-xs text-slate-500">Top ranked athletes representing {club.name}</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('roster')}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    View All {clubAthletes.length} Athletes →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {clubAthletes.slice(0, 3).map(p => (
                    <div
                      key={p.id}
                      onClick={() => onSelectPlayer(p.id)}
                      className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all cursor-pointer flex items-center gap-3.5"
                    >
                      <img
                        src={p.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-xs truncate hover:text-indigo-600">
                          {p.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-mono font-bold text-indigo-600">{p.playerId}</span>
                          <span>•</span>
                          <span>{p.category}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold mt-0.5">
                          <Flame className="w-3 h-3" />
                          <span>Rating {p.rating || 1800}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ROSTER */}
          {activeTab === 'roster' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search athletes or SportOS ID..."
                    value={searchRoster}
                    onChange={e => setSearchRoster(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  onClick={() => setShowAddAthlete(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Athlete</span>
                </button>
              </div>

              {filteredRoster.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                  No athletes found matching this search criteria.
                </div>
              ) : (
                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="py-3 px-4">Athlete Name</th>
                        <th className="py-3 px-4">SportOS ID</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Playing Style</th>
                        <th className="py-3 px-4">Rating</th>
                        <th className="py-3 px-4">Identity Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRoster.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-3">
                            <img
                              src={p.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                            />
                            <span>{p.name}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                            {p.playerId}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {p.category || 'Open'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {p.playingStyle || 'Attacking Topspin'}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-amber-600">
                            {p.rating || 1800}
                          </td>
                          <td className="py-3.5 px-4">
                            {p.isClaimed ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Verified</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                                <span>Unclaimed</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => onSelectPlayer(p.id)}
                              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                            >
                              Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BATCHES */}
          {activeTab === 'batches' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Training Batches & Court Allocations</h3>
                  <p className="text-xs text-slate-500">Manage batch timings, max athlete capacities, and coach leads</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {clubBatches.map(b => (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase">
                          {b.timing}
                        </span>
                        <span className="text-xs font-bold text-slate-600">
                          Capacity: {b.capacity} Students
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{b.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Days: {b.days.join(', ')} • Coach Lead: {b.coachName}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-600">
                        Active Training Group
                      </span>
                      <button
                        onClick={() => {
                          setAttendanceBatchId(b.id);
                          setActiveTab('attendance');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        Track Attendance
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ATTENDANCE TRACKER */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Daily Attendance Roll Call</h3>
                  <p className="text-xs text-slate-500">Date: {todayStr} • 1-click attendance marking for session coaches</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Batch:</span>
                  <select
                    value={attendanceBatchId}
                    onChange={e => setAttendanceBatchId(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800"
                  >
                    {clubBatches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Student attendance list */}
              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-3 px-4">Student Athlete</th>
                      <th className="py-3 px-4">SportOS ID</th>
                      <th className="py-3 px-4">Current Status</th>
                      <th className="py-3 px-4 text-right">Click to Toggle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clubAthletes.map(p => {
                      const recordItem = currentAttendanceRecord?.records.find(r => r.playerId === p.id);
                      const status = recordItem?.status || 'PRESENT';

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-3">
                            <img
                              src={p.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                            <span>{p.name}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600 font-semibold">
                            {p.playerId}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                status === 'PRESENT'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : status === 'LATE'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleToggleAttendance(p.id, status)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                            >
                              Toggle Status
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: COACHES */}
          {activeTab === 'coaches' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Coaching Staff & Certifications</h3>
                  <p className="text-xs text-slate-500">Qualified sports professionals driving training curriculums</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {clubCoaches.map(c => (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl border border-slate-100 bg-slate-50 flex items-start gap-4"
                  >
                    <img
                      src={c.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                      alt={c.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                      <p className="text-xs text-indigo-600 font-semibold mt-0.5">{c.specialization}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Experience: {c.experienceYears} Years • {c.assignedBatches.length} Assigned Batches
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: TOURNAMENTS */}
          {activeTab === 'tournaments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Club Athlete Tournament Entries</h3>
                  <p className="text-xs text-slate-500">Official tournament nominations submitted by this club</p>
                </div>
              </div>

              <div className="space-y-3">
                {clubTournamentRegistrations.map(reg => {
                  const tourney = tournaments.find(t => t.id === reg.tournamentId);
                  return (
                    <div
                      key={reg.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                            {reg.status}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-500">
                            Seed #{reg.seed || 'Unseeded'}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {reg.playerName} — {reg.eventName}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Tournament: {tourney?.title || 'Championship Cup'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onSelectPlayer(reg.playerId)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                        >
                          Athlete Profile
                        </button>
                        <button
                          onClick={() => onSelectTournament(reg.tournamentId)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                        >
                          View Tournament
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 7: MEMBERSHIPS */}
          {activeTab === 'memberships' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Training Subscriptions & Packages</h3>
                  <p className="text-xs text-slate-500">Fee tiers, payment frequencies, and enrolled athlete counts</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {membershipPlans.map(plan => (
                  <div
                    key={plan.id}
                    className="p-5 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                        {plan.frequency}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-1">{plan.name}</h4>
                      <div className="text-xl font-black text-slate-900 mt-2">
                        {plan.currency} {plan.amount}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">{plan.description}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200/60 text-xs font-semibold text-slate-600">
                      {plan.activeSubscribersCount} Active Athletes Enrolled
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Register New Athlete directly into this Club */}
      {showAddAthlete && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Register Athlete to {club.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Creates a permanent SportOS athlete ID (e.g. TT-00184) without requiring phone/email signup.
            </p>

            <form onSubmit={handleRegisterAthlete} className="space-y-4 mt-5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Athlete Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Rathore"
                  value={newAthleteName}
                  onChange={e => setNewAthleteName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newAthleteCategory}
                    onChange={e => setNewAthleteCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Open">Open</option>
                    <option value="Under-19">Under-19</option>
                    <option value="Under-17">Under-17</option>
                    <option value="Under-15">Under-15</option>
                    <option value="Veterans 40+">Veterans 40+</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Dominant Hand</label>
                  <select
                    value={newAthleteHand}
                    onChange={e => setNewAthleteHand(e.target.value as 'RIGHT' | 'LEFT')}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  >
                    <option value="RIGHT">Right-Handed</option>
                    <option value="LEFT">Left-Handed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Playing Style</label>
                <input
                  type="text"
                  placeholder="e.g. Modern Defender / Forehand Looper"
                  value={newAthleteStyle}
                  onChange={e => setNewAthleteStyle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAthlete(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
