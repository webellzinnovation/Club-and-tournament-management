import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SportType, TournamentFormat } from '../../types';
import {
  Trophy,
  CheckCircle2,
  Calendar,
  Grid2X2,
  Users,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles
} from 'lucide-react';

interface TournamentWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TournamentWizardModal: React.FC<TournamentWizardModalProps> = ({ isOpen, onClose }) => {
  const { createTournament } = useApp();
  const [step, setStep] = useState(1);

  // Form State
  const [title, setTitle] = useState('');
  const [sport, setSport] = useState<SportType>('TABLE_TENNIS');
  const [format, setFormat] = useState<TournamentFormat>('GROUPS_THEN_KNOCKOUT');
  const [venueName, setVenueName] = useState('Nehru Indoor Stadium');
  const [city, setCity] = useState('Chennai');
  const [startDate, setStartDate] = useState('2026-09-15');
  const [endDate, setEndDate] = useState('2026-09-18');
  const [resourceCount, setResourceCount] = useState(4);
  const [entryFee, setEntryFee] = useState(750);
  const [prizePool, setPrizePool] = useState(50000);

  if (!isOpen) return null;

  const handleFinish = () => {
    createTournament({
      title: title || `${city} Open ${sport.replace('_', ' ')} Championships`,
      sport,
      format,
      venueName,
      city,
      startDate,
      endDate,
      entryFee,
      prizePool
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-sm">Create Tournament Wizard</h3>
              <p className="text-xs text-neutral-500">Step {step} of 4: Setup competition engine parameters</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 pt-4 pb-2 border-b border-neutral-100 flex items-center justify-between">
          {[
            { num: 1, label: 'Info & Sport' },
            { num: 2, label: 'Format & Rules' },
            { num: 3, label: 'Venues & Tables' },
            { num: 4, label: 'Entry & Publish' }
          ].map(s => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= s.num ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-100 text-neutral-400'
              }`}>
                {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-xs hidden sm:inline font-semibold ${step === s.num ? 'text-neutral-900' : 'text-neutral-400'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Tournament Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-wizard-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Tamil Nadu State Table Tennis Ranking 2026"
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-2">
                  Select Sport Engine
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'TABLE_TENNIS', label: 'Table Tennis', icon: '🏓' },
                    { id: 'BADMINTON', label: 'Badminton', icon: '🏸' },
                    { id: 'FOOTBALL', label: 'Football', icon: '⚽' },
                    { id: 'CRICKET', label: 'Cricket', icon: '🏏' }
                  ].map(sp => (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => setSport(sp.id as SportType)}
                      className={`p-3 rounded-xl border text-center font-bold flex flex-col items-center gap-1 transition-all ${
                        sport === sp.id
                          ? 'border-amber-500 bg-amber-50/50 text-neutral-950 shadow-xs'
                          : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <span className="text-2xl">{sp.icon}</span>
                      <span className="text-xs">{sp.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Venue / Stadium</label>
                  <input
                    type="text"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">City / Location</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-neutral-700 mb-2">
                  Tournament Format Architecture
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'GROUPS_THEN_KNOCKOUT', title: 'Group Stage (Round Robin) + Knockout Bracket', desc: 'ITTF & Olympic standard: pools of 3-4 players, top 2 advance to main draw.' },
                    { id: 'KNOCKOUT', title: 'Single Elimination Knockout', desc: 'Fast, high-stakes brackets with seeded draws and byes.' },
                    { id: 'ROUND_ROBIN', title: 'Pure Round Robin League', desc: 'Every participant plays each other; standings decide medal winners.' }
                  ].map(f => (
                    <div
                      key={f.id}
                      onClick={() => setFormat(f.id as TournamentFormat)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        format === f.id
                          ? 'border-amber-500 bg-amber-50/40 text-neutral-950'
                          : 'border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      <p className="font-bold text-xs text-neutral-900">{f.title}</p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <span className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider block">
                  Scoring Configuration
                </span>
                <p className="text-neutral-600">
                  {sport === 'TABLE_TENNIS' && 'Matches: Best of 5 Games (11 points per game, deuce win by 2, 2-serve rotation).'}
                  {sport === 'BADMINTON' && 'Matches: Best of 3 Games (21 points rally scoring, deuce win by 2, max 30).'}
                  {sport === 'FOOTBALL' && 'Matches: 2 Halves of 45 mins + Stoppage Time + Penalties if tied in knockout.'}
                  {sport === 'CRICKET' && 'Matches: T20 Format (20 overs per innings, powerplay, max 4 overs per bowler).'}
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Competition Resources (Tables / Courts) Count
                </label>
                <div className="flex items-center gap-3">
                  {[2, 4, 6, 8].map(count => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setResourceCount(count)}
                      className={`px-4 py-2 rounded-xl border font-bold text-xs ${
                        resourceCount === count
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {count} {sport === 'TABLE_TENNIS' ? 'Tables' : 'Courts'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Entry Fee per Event (₹)</label>
                  <input
                    type="number"
                    value={entryFee}
                    onChange={(e) => setEntryFee(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Prize Money Pool (₹)</label>
                  <input
                    type="number"
                    value={prizePool}
                    onChange={(e) => setPrizePool(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Ready to Initialize Tournament</span>
                </div>
                <p className="text-emerald-800 leading-relaxed">
                  Upon creation, SportOS Competition Engine will generate fixture brackets, allocate tables, provision referee rosters, and broadcast to registered club players.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/80 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 font-semibold text-xs flex items-center gap-1 hover:bg-neutral-100"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              id="btn-wizard-next"
              onClick={() => setStep(step + 1)}
              className="px-4 py-2 rounded-xl bg-neutral-900 text-white font-semibold text-xs flex items-center gap-1 hover:bg-neutral-800"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-wizard-publish"
              onClick={handleFinish}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Initialize & Publish Tournament</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
