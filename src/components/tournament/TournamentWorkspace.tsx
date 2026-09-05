import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TournamentStatus, TournamentRegistration } from '../../types';
import {
  ArrowLeft,
  Trophy,
  Calendar,
  MapPin,
  Users,
  Grid2X2,
  Activity,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Share2,
  Tv,
  Megaphone,
  Plus,
  Search,
  Filter,
  Volume2,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Flame,
  UserCheck
} from 'lucide-react';

interface TournamentWorkspaceProps {
  tournamentId?: string;
  initialTab?: string;
  onBack: () => void;
  onSelectPlayer: (playerId: string) => void;
  onSelectClub: (clubId: string) => void;
  onOpenScoring: (matchId: string) => void;
  onOpenTvArena: () => void;
}

const LIFECYCLE_STAGES: { status: TournamentStatus; label: string; desc: string }[] = [
  { status: 'DRAFT', label: 'Draft', desc: 'Initial creation & rules config' },
  { status: 'REGISTRATION_OPEN', label: 'Registrations Open', desc: 'Accepting athlete & club entries' },
  { status: 'SETUP', label: 'Seeding & Draws', desc: 'Seeding players and generating fixtures' },
  { status: 'READY', label: 'Schedule Ready', desc: 'Courts assigned & referees briefed' },
  { status: 'LIVE', label: 'Live In Progress', desc: 'Active scoring, match calls & desk' },
  { status: 'COMPLETED', label: 'Concluded', desc: 'Official results and awards published' }
];

export const TournamentWorkspace: React.FC<TournamentWorkspaceProps> = ({
  tournamentId,
  initialTab = 'overview',
  onBack,
  onSelectPlayer,
  onSelectClub,
  onOpenScoring,
  onOpenTvArena
}) => {
  const {
    tournaments,
    activeTournament,
    events,
    participants,
    matches,
    resources,
    referees,
    standings,
    registrations,
    schedulingConflicts,
    updateTournamentStatus,
    updateRegistrationStatus,
    addRegistration,
    advanceTournamentWinner,
    callPlayers,
    assignMatch,
    generateDraw
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || 'ev-1');
  const [searchRegQuery, setSearchRegQuery] = useState('');
  const [showAddRegModal, setShowAddRegModal] = useState(false);
  const [callAlertMessage, setCallAlertMessage] = useState<string | null>(null);

  // New registration form state
  const [newRegPlayerName, setNewRegPlayerName] = useState('');
  const [newRegClubName, setNewRegClubName] = useState('Chennai TT Academy');
  const [newRegSeed, setNewRegSeed] = useState<number | undefined>(undefined);

  // Target tournament
  const tournament = tournaments.find(t => t.id === (tournamentId || activeTournament?.id)) || activeTournament || tournaments[0];

  if (!tournament) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center max-w-lg mx-auto border border-slate-100 shadow-sm mt-8">
        <p className="text-slate-500 mb-4">Tournament not found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Tournaments
        </button>
      </div>
    );
  }

  const tournamentEvents = events.filter(e => e.tournamentId === tournament.id);
  const tournamentMatches = matches.filter(m => m.tournamentId === tournament.id);
  const tournamentRegistrations = registrations.filter(r => r.tournamentId === tournament.id);

  // Current stage index in lifecycle
  const currentStageIndex = LIFECYCLE_STAGES.findIndex(s => s.status === tournament.status);
  const safeStageIndex = currentStageIndex >= 0 ? currentStageIndex : 4; // default to LIVE if unknown

  const handleAdvanceLifecycle = async () => {
    if (safeStageIndex < LIFECYCLE_STAGES.length - 1) {
      const nextStage = LIFECYCLE_STAGES[safeStageIndex + 1].status;
      await updateTournamentStatus(tournament.id, nextStage);
    }
  };

  const handleCallMatch = async (matchId: string) => {
    await callPlayers(matchId, 5);
    const m = tournamentMatches.find(match => match.id === matchId);
    setCallAlertMessage(`Audible chime broadcast: Match #${m?.matchNumber || '1'} called to ${m?.resourceName || 'Court/Table'}`);
    setTimeout(() => setCallAlertMessage(null), 4000);
  };

  const handleCreateRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRegPlayerName.trim()) return;

    const currentEvent = tournamentEvents.find(ev => ev.id === selectedEventId) || tournamentEvents[0];
    await addRegistration({
      tournamentId: tournament.id,
      eventId: currentEvent ? currentEvent.id : 'ev-1',
      eventName: currentEvent ? currentEvent.name : "Men's Singles",
      playerId: `p-${Date.now()}`,
      playerName: newRegPlayerName.trim(),
      clubId: 'club-1',
      clubName: newRegClubName,
      type: 'INDIVIDUAL',
      source: 'ORGANIZER_INVITE',
      status: 'APPROVED',
      seed: newRegSeed ? Number(newRegSeed) : undefined,
      feePaid: true
    });

    setNewRegPlayerName('');
    setNewRegSeed(undefined);
    setShowAddRegModal(false);
  };

  const currentEventMatches = tournamentMatches.filter(
    m => !selectedEventId || m.eventId === selectedEventId
  );

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tournaments</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenTvArena}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            <Tv className="w-3.5 h-3.5 text-amber-400" />
            <span>Launch TV Arena</span>
          </button>
          <button
            onClick={() => onOpenScoring(tournamentMatches[0]?.id || 'match-101')}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Touch Scorer</span>
          </button>
        </div>
      </div>

      {/* Call Audible Banner Alert */}
      {callAlertMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <Volume2 className="w-4 h-4 text-emerald-600 animate-bounce" />
            <span>{callAlertMessage}</span>
          </div>
          <button
            onClick={() => setCallAlertMessage(null)}
            className="text-xs text-emerald-700 hover:underline font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tournament Master Header */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Banner with visual styling */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
                  {tournament.sport.replace(/_/g, ' ')}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300">
                  {tournament.type === 'CIRCUIT' ? 'State Ranking Circuit' : 'Club Invitational'}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  tournament.status === 'LIVE' ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40' : 'bg-white/10 text-slate-300'
                }`}>
                  ● {tournament.status.replace(/_/g, ' ')}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {tournament.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{tournament.venueName}, {tournament.city}</span>
                </span>
                <span className="text-slate-500">•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{tournament.startDate} to {tournament.endDate}</span>
                </span>
              </div>
            </div>

            {/* Quick action based on current lifecycle */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col sm:items-end justify-between gap-3">
              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Current Lifecycle Phase
                </span>
                <span className="text-base font-extrabold text-white block mt-0.5">
                  {LIFECYCLE_STAGES[safeStageIndex]?.label || tournament.status}
                </span>
              </div>

              {safeStageIndex < LIFECYCLE_STAGES.length - 1 && (
                <button
                  onClick={handleAdvanceLifecycle}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>Advance to {LIFECYCLE_STAGES[safeStageIndex + 1]?.label}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Interactive Lifecycle Pipeline Stepper */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {LIFECYCLE_STAGES.map((stage, idx) => {
                const isPassed = idx < safeStageIndex;
                const isCurrent = idx === safeStageIndex;

                return (
                  <div
                    key={stage.status}
                    onClick={() => updateTournamentStatus(tournament.id, stage.status)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-xs'
                        : isPassed
                        ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        : 'bg-transparent border-white/5 text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center ${
                        isCurrent
                          ? 'bg-emerald-400 text-slate-950'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white/10 text-slate-400'
                      }`}>
                        {isPassed ? '✓' : idx + 1}
                      </span>
                      <span className="text-[11px] font-bold truncate">{stage.label}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 block line-clamp-1">
                      {stage.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-100 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Status' },
            { id: 'registrations', label: `Registrations (${tournamentRegistrations.length})` },
            { id: 'draws', label: 'Draws & Brackets' },
            { id: 'schedule', label: `Court Schedule (${tournamentMatches.length})` },
            { id: 'live_desk', label: 'Live Arena & Calls' },
            { id: 'standings', label: 'Official Results' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3.5 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Panels */}
        <div className="p-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Conflict Alert Banner if any */}
              {schedulingConflicts.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 text-rose-900 p-4 rounded-2xl flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold">
                      {schedulingConflicts.length} Scheduling Conflict(s) Detected
                    </h4>
                    <p className="text-xs text-rose-700 mt-0.5">
                      {schedulingConflicts[0].message}
                    </p>
                    <button
                      onClick={() => setActiveTab('schedule')}
                      className="text-xs font-bold text-rose-800 underline mt-1 block"
                    >
                      Resolve on Schedule Board →
                    </button>
                  </div>
                </div>
              )}

              {/* High-level metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Events / Categories
                  </span>
                  <div className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-emerald-600" />
                    <span>{tournamentEvents.length} Divisions</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Singles & Doubles
                  </span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Athlete Entries
                  </span>
                  <div className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>{tournamentRegistrations.length || 16} Entries</span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
                    100% Fees Reconciled
                  </span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Competition Matches
                  </span>
                  <div className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-amber-500" />
                    <span>{tournamentMatches.length} Matches</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    {tournamentMatches.filter(m => m.status === 'VERIFIED').length} Completed
                  </span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Assigned Courts / Tables
                  </span>
                  <div className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
                    <Grid2X2 className="w-4 h-4 text-purple-600" />
                    <span>{resources.length} Competition Units</span>
                  </div>
                  <span className="text-[11px] text-purple-600 font-semibold mt-0.5 block">
                    Active on TV Arena
                  </span>
                </div>
              </div>

              {/* Divisions & Formats List */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-1">Competition Divisions</h3>
                <p className="text-xs text-slate-500 mb-4">Click any division to configure draws or inspect registered seeds</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {tournamentEvents.map(ev => (
                    <div
                      key={ev.id}
                      onClick={() => {
                        setSelectedEventId(ev.id);
                        setActiveTab('draws');
                      }}
                      className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-200 transition-all cursor-pointer"
                    >
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                        {ev.format.replace(/_/g, ' ')}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-2">{ev.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Best of {ev.rules?.bestOfSets || 5} sets • {ev.rules?.pointsPerGame || 11} pts
                      </p>
                      <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-emerald-600 font-semibold">
                        <span>Open Bracket →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTRATIONS */}
          {activeTab === 'registrations' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search registrations..."
                    value={searchRegQuery}
                    onChange={e => setSearchRegQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  onClick={() => setShowAddRegModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Athlete Entry</span>
                </button>
              </div>

              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-3 px-4">Athlete</th>
                      <th className="py-3 px-4">Affiliated Club</th>
                      <th className="py-3 px-4">Event Division</th>
                      <th className="py-3 px-4">Seed</th>
                      <th className="py-3 px-4">Entry Source</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tournamentRegistrations
                      .filter(r => r.playerName.toLowerCase().includes(searchRegQuery.toLowerCase()))
                      .map(reg => (
                        <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <button
                              onClick={() => onSelectPlayer(reg.playerId)}
                              className="hover:text-emerald-600 transition-colors text-left"
                            >
                              {reg.playerName}
                            </button>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => reg.clubId && onSelectClub(reg.clubId)}
                              className="text-slate-600 hover:text-emerald-600 transition-colors font-medium"
                            >
                              {reg.clubName}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {reg.eventName}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-amber-600">
                            {reg.seed ? `#${reg.seed}` : '—'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                              {reg.source.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              reg.status === 'FINALIZED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {reg.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {reg.status !== 'FINALIZED' && (
                              <button
                                onClick={() => updateRegistrationStatus(reg.id, 'FINALIZED')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-colors"
                              >
                                Finalize Seed
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: DRAWS & BRACKETS */}
          {activeTab === 'draws' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Division:</span>
                  <select
                    value={selectedEventId}
                    onChange={e => setSelectedEventId(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800"
                  >
                    {tournamentEvents.map(ev => (
                      <option key={ev.id} value={ev.id}>
                        {ev.name} ({ev.format})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => generateDraw(selectedEventId, 'KNOCKOUT')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                >
                  Regenerate Draw
                </button>
              </div>

              {/* Bracket Matches List with Instant Advancement */}
              <div className="space-y-3">
                {currentEventMatches.map(m => {
                  const hasWinner = Boolean(m.winnerId);
                  return (
                    <div
                      key={m.id}
                      className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Match #{m.matchNumber || 1} • {m.roundName || m.stageName || 'Knockout'}
                          </span>
                          {m.resourceName && (
                            <span className="text-xs text-slate-500">
                              {m.resourceName}
                            </span>
                          )}
                        </div>

                        {/* Participants and winner indicator */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`w-2 h-2 rounded-full ${m.winnerId === m.participant1Id ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            <button
                              onClick={() => m.participant1Id && onSelectPlayer(m.participant1Id)}
                              className={`font-bold hover:text-emerald-600 transition-colors ${
                                m.winnerId === m.participant1Id ? 'text-slate-900 font-black' : 'text-slate-700'
                              }`}
                            >
                              {m.participant1Name || 'TBD Slot 1'}
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`w-2 h-2 rounded-full ${m.winnerId === m.participant2Id ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            <button
                              onClick={() => m.participant2Id && onSelectPlayer(m.participant2Id)}
                              className={`font-bold hover:text-emerald-600 transition-colors ${
                                m.winnerId === m.participant2Id ? 'text-slate-900 font-black' : 'text-slate-700'
                              }`}
                            >
                              {m.participant2Name || 'TBD Slot 2'}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
                        {/* Winner Advancement button */}
                        {!hasWinner && m.participant1Id && m.participant2Id && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => advanceTournamentWinner(m.id, m.participant1Id!)}
                              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold"
                            >
                              P1 Wins
                            </button>
                            <button
                              onClick={() => advanceTournamentWinner(m.id, m.participant2Id!)}
                              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold"
                            >
                              P2 Wins
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => onOpenScoring(m.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                        >
                          Scoring
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: SCHEDULE & ASSIGNMENTS */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Court Allocations & Scheduling Matrix</h3>
                  <p className="text-xs text-slate-500">Live table allocations across tournament competition resources</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {resources.map(res => {
                  const assignedMatches = tournamentMatches.filter(m => m.resourceId === res.id);
                  return (
                    <div key={res.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 mb-3">
                        <span className="font-bold text-slate-900 text-xs">{res.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {res.status}
                        </span>
                      </div>

                      {assignedMatches.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">No matches assigned</p>
                      ) : (
                        <div className="space-y-2">
                          {assignedMatches.map(m => (
                            <div
                              key={m.id}
                              className="p-2.5 bg-white rounded-xl border border-slate-100 text-xs"
                            >
                              <span className="text-[10px] font-mono font-bold text-slate-500 block mb-1">
                                {m.scheduledTime || '10:00 AM'}
                              </span>
                              <div className="font-bold text-slate-900 truncate">
                                {m.participant1Name} vs {m.participant2Name}
                              </div>
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                                <button
                                  onClick={() => handleCallMatch(m.id)}
                                  className="text-[10px] font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
                                >
                                  <Volume2 className="w-3 h-3" />
                                  <span>Call to Table</span>
                                </button>
                                <button
                                  onClick={() => onOpenScoring(m.id)}
                                  className="text-[10px] font-bold text-slate-700 hover:underline"
                                >
                                  Score →
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: LIVE ARENA & CALLS */}
          {activeTab === 'live_desk' && (
            <div className="space-y-4">
              <div className="bg-slate-950 text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span>Live Match Call Desk</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Send high-priority audio announcements to athletes & referees to report to designated courts
                  </p>
                </div>
                <button
                  onClick={onOpenTvArena}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <Tv className="w-4 h-4" />
                  <span>Full Screen TV Scoreboard</span>
                </button>
              </div>

              <div className="space-y-2">
                {tournamentMatches.map(m => (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {m.resourceName || 'Unassigned Table'} • Match #{m.matchNumber || 1}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                        {m.participant1Name} vs {m.participant2Name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCallMatch(m.id)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Call Players</span>
                      </button>
                      <button
                        onClick={() => onOpenScoring(m.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                      >
                        Launch Scorer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: STANDINGS */}
          {activeTab === 'standings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Official Tournament Results & Standings</h3>
                  <p className="text-xs text-slate-500">Standings computed dynamically using official sport tie-breaker rules</p>
                </div>
              </div>

              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Participant</th>
                      <th className="py-3 px-4">Club</th>
                      <th className="py-3 px-4">Played</th>
                      <th className="py-3 px-4">Won</th>
                      <th className="py-3 px-4">Lost</th>
                      <th className="py-3 px-4">Games Diff</th>
                      <th className="py-3 px-4 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {standings.map((row, idx) => (
                      <tr key={row.participantId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          #{idx + 1}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {row.participantName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {row.clubName || 'Club'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">{row.played}</td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-600">{row.won}</td>
                        <td className="py-3.5 px-4 text-rose-600">{row.lost}</td>
                        <td className="py-3.5 px-4 font-mono">{row.gamesDiff > 0 ? `+${row.gamesDiff}` : row.gamesDiff}</td>
                        <td className="py-3.5 px-4 text-right font-black text-slate-900">
                          {row.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add Athlete Entry */}
      {showAddRegModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Add Athlete Entry</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Register athlete directly into tournament division.
            </p>

            <form onSubmit={handleCreateRegistration} className="space-y-4 mt-5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Athlete Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Snehit Suravajjula"
                  value={newRegPlayerName}
                  onChange={e => setNewRegPlayerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Club Affiliation</label>
                <input
                  type="text"
                  placeholder="e.g. Chennai TT Academy"
                  value={newRegClubName}
                  onChange={e => setNewRegClubName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Seed (Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  value={newRegSeed || ''}
                  onChange={e => setNewRegSeed(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddRegModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  Confirm Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
