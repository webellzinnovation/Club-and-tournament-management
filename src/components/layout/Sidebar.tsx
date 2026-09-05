import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Trophy,
  CalendarDays,
  Grid2X2,
  Activity,
  Award,
  Bell,
  Megaphone,
  CreditCard,
  Settings,
  ClipboardList,
  UserSquare2,
  FileCheck2,
  FolderKanban,
  History,
  PlusCircle,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenWizard: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onOpenWizard
}) => {
  const { currentUser, tournaments, activeTournament, setActiveTournamentId, schedulingConflicts } = useApp();
  const role = currentUser.currentRole;

  // Configure navigation based on current role
  const getNavItems = () => {
    switch (role) {
      case 'SUPER_ADMIN':
        return [
          { id: 'dashboard', label: 'Platform Overview', icon: LayoutDashboard },
          { id: 'organizations', label: 'Organizations', icon: FolderKanban },
          { id: 'clubs', label: 'Clubs Directory', icon: Grid2X2 },
          { id: 'players', label: 'Global Players', icon: Users },
          { id: 'tournaments', label: 'All Tournaments', icon: Trophy },
          { id: 'payments', label: 'Billing & Payments', icon: CreditCard },
          { id: 'audit_logs', label: 'Audit Logs', icon: History }
        ];

      case 'CLUB_OWNER':
        return [
          { id: 'dashboard', label: 'Club Dashboard', icon: LayoutDashboard },
          { id: 'players', label: 'Club Athletes', icon: Users },
          { id: 'coaches', label: 'Coaches & Staff', icon: UserSquare2 },
          { id: 'batches', label: 'Batches & Timing', icon: CalendarDays },
          { id: 'attendance', label: 'Attendance Matrix', icon: ClipboardList },
          { id: 'memberships', label: 'Membership Plans', icon: CreditCard },
          { id: 'tournaments', label: 'Club Tournaments', icon: Trophy },
          { id: 'announcements', label: 'Announcements', icon: Megaphone }
        ];

      case 'COACH':
        return [
          { id: 'dashboard', label: 'Coaching Overview', icon: LayoutDashboard },
          { id: 'players', label: 'My Athletes', icon: Users },
          { id: 'batches', label: 'My Batches', icon: CalendarDays },
          { id: 'attendance', label: 'Mark Attendance', icon: ClipboardList },
          { id: 'tournaments', label: 'Tournament Results', icon: Trophy }
        ];

      case 'PLAYER':
        return [
          { id: 'dashboard', label: 'Athlete Dashboard', icon: LayoutDashboard },
          { id: 'my_matches', label: 'My Upcoming Matches', icon: CalendarDays },
          { id: 'standings', label: 'Rankings & Points', icon: Award },
          { id: 'memberships', label: 'My Club Membership', icon: CreditCard },
          { id: 'notifications', label: 'Notifications Center', icon: Bell }
        ];

      case 'REFEREE':
        return [
          { id: 'dashboard', label: 'Referee Hub', icon: LayoutDashboard },
          { id: 'live_scoring', label: 'Touch Live Scoring', icon: Activity },
          { id: 'standings', label: 'Tournament Standings', icon: Award }
        ];

      case 'TOURNAMENT_ORGANIZER':
      default:
        return [
          { id: 'dashboard', label: 'Director Dashboard', icon: LayoutDashboard },
          { id: 'assignments', label: 'Assignments Board', icon: Grid2X2, badge: schedulingConflicts.length ? `${schedulingConflicts.length} alert` : undefined },
          { id: 'draws', label: 'Draws & Brackets', icon: Trophy },
          { id: 'live_scoring', label: 'Live Scoring Console', icon: Activity },
          { id: 'standings', label: 'Standings & Points', icon: Award },
          { id: 'players', label: 'Tournament Athletes', icon: Users },
          { id: 'announcements', label: 'Announcements', icon: Megaphone },
          { id: 'audit_logs', label: 'Operations Audit', icon: History }
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-neutral-900 text-neutral-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-neutral-800">
      {/* Tournament Context Selector */}
      <div className="p-4 border-b border-neutral-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Active Competition
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium">
            {activeTournament?.sport.replace('_', ' ')}
          </span>
        </div>
        <select
          id="select-active-tournament"
          value={activeTournament?.id}
          onChange={(e) => setActiveTournamentId(e.target.value)}
          className="w-full bg-neutral-800 text-white text-xs rounded-lg px-2.5 py-2 border border-neutral-700 focus:outline-none focus:border-amber-500 truncate"
        >
          {tournaments.map(t => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>

        {/* Quick Tournament Creator */}
        {(role === 'TOURNAMENT_ORGANIZER' || role === 'SUPER_ADMIN' || role === 'CLUB_OWNER') && (
          <button
            id="btn-create-tournament-sidebar"
            onClick={onOpenWizard}
            className="w-full mt-2.5 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Tournament Wizard</span>
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
          {role.replace(/_/g, ' ')} MENU
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-neutral-800 text-white shadow-xs font-semibold border-l-3 border-amber-400 pl-2.5'
                  : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-900/60 text-rose-300 border border-rose-700">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Tenant Info */}
      <div className="p-3 border-t border-neutral-800 text-xs bg-neutral-950/50">
        <div className="flex items-center justify-between text-neutral-400">
          <span className="text-[11px]">Tenant Domain:</span>
          <span className="font-mono text-[10px] text-emerald-400">tn-tt-fed.org</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-neutral-500 text-[10px]">
          <span>Role Scope:</span>
          <span className="text-neutral-300">{role}</span>
        </div>
      </div>
    </aside>
  );
};
