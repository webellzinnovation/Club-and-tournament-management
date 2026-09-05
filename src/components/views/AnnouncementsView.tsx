import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Megaphone,
  BellRing,
  Send,
  AlertTriangle,
  Users,
  CheckCircle2,
  Radio,
  Tv
} from 'lucide-react';

export const AnnouncementsView: React.FC = () => {
  const { announcements, broadcastAnnouncement, activeTournament } = useApp();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'NORMAL' | 'URGENT' | 'EMERGENCY'>('URGENT');
  const [target, setTarget] = useState<'ALL' | 'PLAYERS' | 'COACHES' | 'REFEREES'>('ALL');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    broadcastAnnouncement({
      tournamentId: activeTournament?.id,
      title: title.trim(),
      content: content.trim(),
      priority,
      target,
      channels: ['IN_APP', 'TV_DISPLAY']
    });

    setTitle('');
    setContent('');
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold tracking-wider uppercase">
              Omnichannel Broadcasting
            </span>
            <span className="text-xs text-neutral-400">Emergency & Arena Audio Alerts</span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mt-1">
            Arena Announcements & Notifications
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Broadcast urgent player calls, table reassignments, schedule adjustments, and weather delays across in-app notifications and TV jumbotron tickers.
          </p>
        </div>
      </div>

      {/* Broadcast Composer */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Radio className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold text-neutral-900">Broadcast Instant Announcement</h3>
        </div>

        <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-neutral-700 mb-1">
              Announcement Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-broadcast-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Table 3 Match Call: Arjun vs Rahul report immediately"
              className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1">
              Message Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="input-broadcast-content"
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide exact instructions, table numbers, warm-up expectations, or schedule delays..."
              className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Urgency Priority</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'NORMAL' as const, label: 'Normal', color: 'border-neutral-300' },
                  { id: 'URGENT' as const, label: 'Urgent', color: 'border-amber-400 bg-amber-50/60' },
                  { id: 'EMERGENCY' as const, label: 'Emergency', color: 'border-rose-400 bg-rose-50/60' }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`p-2 rounded-xl border text-center font-bold text-xs transition-all ${
                      priority === p.id
                        ? `${p.color} border-2 text-neutral-950 font-black`
                        : 'border-neutral-200 text-neutral-500'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Target Audience</label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value as 'ALL' | 'PLAYERS' | 'COACHES' | 'REFEREES')}
                className="w-full p-2.5 border border-neutral-200 rounded-xl focus:outline-none bg-neutral-50 font-semibold"
              >
                <option value="ALL">Everyone in Arena & App</option>
                <option value="PLAYERS">Athletes & Players Only</option>
                <option value="COACHES">Club Coaches & Staff</option>
                <option value="REFEREES">Officiating Referees</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-3 text-neutral-500">
              <span className="flex items-center gap-1"><BellRing className="w-3.5 h-3.5" /> Push & In-App</span>
              <span className="flex items-center gap-1"><Tv className="w-3.5 h-3.5" /> TV Jumbotron Ticker</span>
            </div>

            <button
              id="btn-broadcast-submit"
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast to Arena</span>
            </button>
          </div>
        </form>

        {sentSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Announcement successfully broadcasted! Notification sound triggered.</span>
          </div>
        )}
      </div>

      {/* Announcements Stream History */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-neutral-900 mb-4">Official Announcements Stream</h3>

        <div className="space-y-3">
          {announcements.map(a => (
            <div
              key={a.id}
              className={`p-4 rounded-xl border text-xs space-y-1.5 transition-all ${
                a.priority === 'EMERGENCY'
                  ? 'bg-rose-50/50 border-rose-200 text-rose-950'
                  : a.priority === 'URGENT'
                  ? 'bg-amber-50/50 border-amber-200 text-amber-950'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-800'
              }`}
            >
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-2 font-bold">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider ${
                    a.priority === 'EMERGENCY' ? 'bg-rose-200 text-rose-800' : a.priority === 'URGENT' ? 'bg-amber-200 text-amber-900' : 'bg-neutral-200 text-neutral-800'
                  }`}>
                    {a.priority}
                  </span>
                  <span>Target: {a.target}</span>
                </div>
                <span className="text-neutral-400">{new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <h4 className="font-bold text-sm text-neutral-900 mt-1">{a.title}</h4>
              <p className="text-neutral-700 leading-relaxed">{a.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
