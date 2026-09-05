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
  HelpCircle,
  Headphones,
  Sparkles
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
  const { currentUser, activeTournament, schedulingConflicts } = useApp();
  const role = currentUser?.currentRole || 'TOURNAMENT_ORGANIZER';

  // Role-specific navigation items (strict least-privilege scoping)
  const getNavItems = () => {
    switch (role) {
      case 'SUPER_ADMIN':
        return [
          { id: 'dashboard', label: 'Platform', icon: LayoutDashboard },
          { id: 'organizations', label: 'Organizations', icon: FolderKanban },
          { id: 'clubs', label: 'Clubs Registry', icon: Grid2X2 },
          { id: 'players', label: 'Global Athletes', icon: Users },
          { id: 'tournaments', label: 'Tournaments', icon: Trophy },
          { id: 'payments', label: 'Platform Billing', icon: CreditCard },
          { id: 'audit_logs', label: 'Security Audit', icon: History }
        ];

      case 'CLUB_OWNER':
        return [
          { id: 'dashboard', label: 'Club Overview', icon: LayoutDashboard },
          { id: 'players', label: 'My Athletes', icon: Users },
          { id: 'coaches', label: 'Coaching Staff', icon: UserSquare2 },
          { id: 'batches', label: 'Batches & Timings', icon: CalendarDays },
          { id: 'attendance', label: 'Daily Attendance', icon: ClipboardList },
          { id: 'memberships', label: 'Subscriptions', icon: CreditCard },
          { id: 'tournaments', label: 'Club Events', icon: Trophy },
          { id: 'announcements', label: 'Notices', icon: Megaphone }
        ];

      case 'COACH':
        return [
          { id: 'dashboard', label: 'Coaching Hub', icon: LayoutDashboard },
          { id: 'players', label: 'My Students', icon: Users },
          { id: 'batches', label: 'Training Batches', icon: CalendarDays },
          { id: 'attendance', label: 'Mark Attendance', icon: ClipboardList },
          { id: 'tournaments', label: 'Competition Results', icon: Trophy }
        ];

      case 'PLAYER':
        return [
          { id: 'dashboard', label: 'Athlete Home', icon: LayoutDashboard },
          { id: 'my_matches', label: 'My Matches', icon: CalendarDays },
          { id: 'standings', label: 'Points & Rank', icon: Award },
          { id: 'memberships', label: 'Club Membership', icon: CreditCard },
          { id: 'announcements', label: 'Club Notices', icon: Megaphone }
        ];

      case 'REFEREE':
        return [
          { id: 'dashboard', label: 'Referee Desk', icon: LayoutDashboard },
          { id: 'live_scoring', label: 'Touch Scorer', icon: Activity },
          { id: 'standings', label: 'Standings', icon: Award }
        ];

      case 'TOURNAMENT_ORGANIZER':
      default:
        return [
          { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
          {
            id: 'assignments',
            label: 'Assignments Board',
            icon: Grid2X2,
            badge: schedulingConflicts.length ? `${schedulingConflicts.length}` : undefined
          },
          { id: 'draws', label: 'Draws & Brackets', icon: Trophy },
          { id: 'live_scoring', label: 'Live Scoring', icon: Activity },
          { id: 'standings', label: 'Points Table', icon: Award },
          { id: 'players', label: 'Participants', icon: Users },
          { id: 'announcements', label: 'Announcements', icon: Megaphone },
          { id: 'audit_logs', label: 'Operations Audit', icon: History }
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-60 bg-white border-r border-slate-100 flex flex-col shrink-0 min-h-full p-4 justify-between">
      {/* Top: Brand and Nav Links */}
      <div className="space-y-6">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-base tracking-tight block">SportOS</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block -mt-0.5">
              Club & Tournaments
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Workspace
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Contextual Help & Support Widget (Inspired by the reference card) */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="bg-slate-900 rounded-2xl p-4 text-white text-center relative overflow-hidden shadow-sm">
          <div className="absolute -right-4 -top-4 w-14 h-14 bg-emerald-500/10 rounded-full blur-lg" />

          <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto mb-2 font-bold shadow-xs">
            <HelpCircle className="w-4 h-4" />
          </div>

          <h4 className="text-xs font-bold tracking-tight">Need Support?</h4>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
            Tournament rules, court setups or score sync inquiries
          </p>

          <button
            onClick={() => onNavigate('announcements')}
            className="mt-3 w-full py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors"
          >
            Help & Guidelines
          </button>
        </div>
      </div>
    </aside>
  );
};
