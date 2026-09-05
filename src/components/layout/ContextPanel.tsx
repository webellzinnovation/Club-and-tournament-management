import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Bell,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  User,
  MapPin,
  Flame,
  Activity
} from 'lucide-react';

interface ContextPanelProps {
  onNavigate: (view: string) => void;
  onOpenProfile?: () => void;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({ onNavigate, onOpenProfile }) => {
  const {
    currentUser,
    activeTournament,
    matches,
    batches,
    notifications,
    activeClub,
    markNotificationAsRead
  } = useApp();

  const [currentDate] = useState(new Date(2026, 8, 5)); // September 5, 2026
  const [selectedDay, setSelectedDay] = useState(5);

  // Generate calendar days for current month (September 2026)
  const monthName = 'September 2026';
  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const days = [
    { num: 30, isCurrentMonth: false, dayIdx: 0 },
    { num: 31, isCurrentMonth: false, dayIdx: 1 },
    { num: 1, isCurrentMonth: true, dayIdx: 2 },
    { num: 2, isCurrentMonth: true, dayIdx: 3 },
    { num: 3, isCurrentMonth: true, dayIdx: 4 },
    { num: 4, isCurrentMonth: true, dayIdx: 5 },
    { num: 5, isCurrentMonth: true, dayIdx: 6, isToday: true, hasEvent: true },
    { num: 6, isCurrentMonth: true, dayIdx: 0, hasEvent: true },
    { num: 7, isCurrentMonth: true, dayIdx: 1, hasEvent: true },
    { num: 8, isCurrentMonth: true, dayIdx: 2 },
    { num: 9, isCurrentMonth: true, dayIdx: 3 },
    { num: 10, isCurrentMonth: true, dayIdx: 4 }
  ];

  // Role-specific upcoming events / agenda
  const role = currentUser?.currentRole || 'TOURNAMENT_ORGANIZER';

  const getUpcomingSchedule = () => {
    if (role === 'PLAYER') {
      const myMatches = matches.filter(
        m => m.player1?.id === currentUser?.linkedPlayerId || m.player2?.id === currentUser?.linkedPlayerId
      );
      if (myMatches.length > 0) {
        return myMatches.slice(0, 3).map(m => ({
          time: m.scheduledTime || '14:30',
          title: `Match vs ${m.player1?.id === currentUser?.linkedPlayerId ? m.player2?.name || 'TBD' : m.player1?.name || 'TBD'}`,
          location: m.resourceName || 'Court 1',
          status: m.status
        }));
      }
      return [
        { time: '11:00', title: 'Singles Knockout Rd 1', location: 'Table 2 • SDAT', status: 'SCHEDULED' },
        { time: '15:30', title: 'Club Conditioning Batch', location: 'Marina Academy', status: 'CONFIRMED' }
      ];
    }

    if (role === 'COACH' || role === 'CLUB_OWNER') {
      const clubBatches = batches.filter(b => b.clubId === activeClub?.id);
      if (clubBatches.length > 0) {
        return clubBatches.slice(0, 3).map(b => ({
          time: b.startTime,
          title: `${b.name}`,
          location: `${b.days.slice(0, 2).join(', ')} • ${activeClub?.name || 'Club Academy'}`,
          status: 'UPCOMING'
        }));
      }
      return [
        { time: '07:00', title: 'Elite Morning Drills', location: 'Court A • 12 Athletes', status: 'UPCOMING' },
        { time: '16:30', title: 'Junior Development Session', location: 'Court B • 16 Athletes', status: 'UPCOMING' }
      ];
    }

    if (role === 'REFEREE') {
      const assigned = matches.filter(m => m.refereeId === currentUser?.id);
      if (assigned.length > 0) {
        return assigned.slice(0, 3).map(m => ({
          time: m.scheduledTime || '12:00',
          title: `${m.player1?.name || 'TBD'} vs ${m.player2?.name || 'TBD'}`,
          location: m.resourceName || 'Assigned Table',
          status: m.status
        }));
      }
      return [
        { time: '10:30', title: 'Quarter-Final 1 Officiating', location: 'Table 1 • Arena', status: 'SCHEDULED' },
        { time: '14:00', title: 'Semi-Final 2 Officiating', location: 'Table 1 • Arena', status: 'SCHEDULED' }
      ];
    }

    // Default for Tournament Organizer & Super Admin
    const liveOrReady = matches.filter(m => m.status === 'LIVE' || m.status === 'CALLED' || m.status === 'READY');
    if (liveOrReady.length > 0) {
      return liveOrReady.slice(0, 3).map(m => ({
        time: m.scheduledTime || 'LIVE',
        title: `${m.player1?.name || 'TBD'} vs ${m.player2?.name || 'TBD'}`,
        location: m.resourceName || 'Arena Table',
        status: m.status
      }));
    }

    return [
      { time: '10:00', title: 'Men Singles Group Stage', location: 'Tables 1 - 4', status: 'IN_PROGRESS' },
      { time: '14:30', title: 'Round of 16 Knockouts', location: 'Central Arena', status: 'SCHEDULED' },
      { time: '18:00', title: 'Medal Ceremony & Podiums', location: 'Main Stage', status: 'PLANNED' }
    ];
  };

  const scheduleItems = getUpcomingSchedule();

  // Reminders
  const unreadAlerts = notifications.filter(n => !n.read).slice(0, 2);

  return (
    <aside className="w-80 shrink-0 bg-slate-50/50 p-6 flex flex-col gap-6 border-l border-slate-100 overflow-y-auto">
      {/* 1. User Profile Widget */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 tracking-tight">Identity Profile</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {role.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="mt-4 flex flex-col items-center text-center">
          <div className="relative">
            <img
              src={currentUser?.avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`}
              alt={currentUser?.name}
              className="w-16 h-16 rounded-full object-cover ring-4 ring-slate-100 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          <h3 className="mt-2.5 text-sm font-bold text-slate-900 tracking-tight">
            {currentUser?.name || 'Authorized Member'}
          </h3>
          <p className="text-xs text-slate-400 font-medium truncate max-w-[200px]">
            {currentUser?.email}
          </p>

          <div className="mt-3 w-full pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Tenant</span>
            <span className="font-semibold text-slate-800">
              {currentUser?.orgId === 'org-1' ? 'Tamil Nadu TT Fed' : 'SportOS Central'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Mini Calendar Widget */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-800 tracking-tight">{monthName}</span>
          <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {daysOfWeek.map(d => (
            <span key={d} className="text-[10px] font-semibold text-slate-400">
              {d}
            </span>
          ))}
        </div>

        {/* Calendar Day Pills */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {days.slice(0, 7).map((d, i) => {
            const isSelected = selectedDay === d.num;
            return (
              <button
                key={i}
                onClick={() => setSelectedDay(d.num)}
                className={`py-1.5 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : d.isToday
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : d.isCurrentMonth
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-slate-300'
                }`}
              >
                <span>{d.num}</span>
                {d.hasEvent && (
                  <span className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Schedule / Agenda Section */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs flex-1">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <h4 className="text-xs font-bold text-slate-800 tracking-tight">Today's Schedule</h4>
          </div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            See all
          </button>
        </div>

        <div className="space-y-2.5">
          {scheduleItems.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition-colors flex items-start gap-3"
            >
              <span className="px-2 py-1 rounded-lg bg-white border border-slate-200/80 text-[10px] font-bold text-slate-700 shrink-0 shadow-2xs">
                {item.time}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 truncate">{item.title}</p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{item.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Reminders / Action Alerts */}
      <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold tracking-tight">SportOS Reminders</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-amber-300 font-semibold">
            {unreadAlerts.length} new
          </span>
        </div>

        <div className="space-y-2 mt-3">
          {unreadAlerts.length > 0 ? (
            unreadAlerts.map(alert => (
              <div
                key={alert.id}
                onClick={() => markNotificationAsRead(alert.id)}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-colors"
              >
                <p className="text-xs font-medium text-slate-200 line-clamp-1">{alert.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{alert.message}</p>
              </div>
            ))
          ) : (
            <div className="p-2.5 rounded-xl bg-slate-800/60 text-center">
              <p className="text-xs text-slate-300 font-medium">All systems synchronized</p>
              <p className="text-[10px] text-slate-400 mt-0.5">No critical warnings pending</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
