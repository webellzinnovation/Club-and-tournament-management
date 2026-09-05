import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Trophy,
  Award,
  CalendarDays,
  Clock,
  CheckCircle2,
  Activity,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Flame,
  Zap,
  TrendingUp
} from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { DashboardSection } from '../ui/DashboardSection';
import { StatusBadge } from '../ui/StatusBadge';
import { Button, PrimaryButton } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

interface PlayerDashboardProps {
  onNavigate: (view: string) => void;
  onOpenClaimModal: () => void;
}

export const PlayerDashboard: React.FC<PlayerDashboardProps> = ({
  onNavigate,
  onOpenClaimModal
}) => {
  const { currentUser, players, matches, activeClub } = useApp();

  const linkedPlayer = players.find(p => p.id === currentUser?.linkedPlayerId);
  const myMatches = matches.filter(
    m => m.player1?.id === linkedPlayer?.id || m.player2?.id === linkedPlayer?.id
  );

  const completedMatches = myMatches.filter(m => m.status === 'COMPLETED' || m.status === 'VERIFIED');
  const upcomingMatches = myMatches.filter(m => m.status === 'SCHEDULED' || m.status === 'READY' || m.status === 'CALLED');

  return (
    <div className="space-y-7">
      {/* 1. Athlete Hero Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={linkedPlayer?.photoUrl || currentUser?.avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80`}
              alt={currentUser?.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-100 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
              ✓
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-bold tracking-wider uppercase">
                Athlete Portal
              </span>
              <span className="text-xs text-slate-400 font-medium">
                ID: {linkedPlayer?.permanentId || 'TT-IND-4029'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {linkedPlayer?.name || currentUser?.name}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Club: <span className="font-semibold text-slate-700">{linkedPlayer?.clubName || activeClub?.name || 'Affiliated Academy'}</span> • Category: {linkedPlayer?.category || 'Men Singles (U-19)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {!linkedPlayer && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenClaimModal}
              icon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
            >
              Link Player ID
            </Button>
          )}
          <PrimaryButton
            size="sm"
            onClick={() => onNavigate('standings')}
            icon={<Award className="w-3.5 h-3.5" />}
          >
            Leaderboard & Rank
          </PrimaryButton>
        </div>
      </div>

      {/* 2. Personal Athlete Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="State Rank"
          value="#4"
          subtitle="Top 5% in Division"
          icon={Award}
          iconColor="text-amber-600"
          bgColor="bg-amber-50"
          trend={{ value: '+2 this month', isPositive: true }}
          onClick={() => onNavigate('standings')}
        />
        <StatCard
          title="Rating Points"
          value="1,420"
          subtitle="Elo Performance Index"
          icon={TrendingUp}
          iconColor="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard
          title="Match Record"
          value={`${completedMatches.length} Played`}
          subtitle="82% Win Rate (2026)"
          icon={Activity}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Club Membership"
          value="Active Pro"
          subtitle="Valid until Dec 2026"
          icon={CreditCard}
          iconColor="text-purple-600"
          bgColor="bg-purple-50"
          onClick={() => onNavigate('memberships')}
        />
      </div>

      {/* 3. My Upcoming Fixtures & Matches */}
      <DashboardSection
        title="My Upcoming Matches"
        subtitle="Report to assigned tables 10 minutes prior to call"
        actionText="Tournament draws →"
        onAction={() => onNavigate('draws')}
      >
        {upcomingMatches.length > 0 ? (
          <div className="space-y-3">
            {upcomingMatches.map(match => {
              const opponent = match.player1?.id === linkedPlayer?.id ? match.player2 : match.player1;
              return (
                <div
                  key={match.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex flex-col items-center justify-center font-bold text-slate-700 shrink-0">
                      <span className="text-[10px] uppercase font-semibold">Table</span>
                      <span className="text-sm">{match.resourceName?.replace('Table ', 'T') || 'T1'}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={match.status} size="sm" />
                        <span className="text-xs text-slate-400 font-medium">
                          Scheduled: {match.scheduledTime || 'Today, 14:00'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Vs {opponent?.name || 'TBD Opponent'}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Round: {match.roundName || 'Quarter Finals'} • Event: {match.eventName || 'Men Singles Open'}
                      </p>
                    </div>
                  </div>

                  <div className="self-end sm:self-center">
                    <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                      Assigned to Court
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="No Scheduled Matches"
            description="You currently have no pending match calls. Check back once bracket draws are generated."
            actionText="View Tournament Brackets"
            onAction={() => onNavigate('draws')}
          />
        )}
      </DashboardSection>

      {/* 4. Recent Competition Results */}
      <DashboardSection
        title="Recent Match Scorecards"
        subtitle="Verified tournament game logs"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span>State Championship Round 2</span>
              <StatusBadge status="COMPLETED" size="sm" />
            </div>
            <div className="flex items-center justify-between font-bold text-sm text-slate-900">
              <span className="text-emerald-600">You (W)</span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs">
                3 - 1 (11-9, 11-8, 9-11, 11-6)
              </span>
              <span>K. Varma</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span>Club Invitational Group A</span>
              <StatusBadge status="COMPLETED" size="sm" />
            </div>
            <div className="flex items-center justify-between font-bold text-sm text-slate-900">
              <span className="text-emerald-600">You (W)</span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs">
                3 - 0 (11-5, 11-7, 11-8)
              </span>
              <span>R. Iyer</span>
            </div>
          </div>
        </div>
      </DashboardSection>
    </div>
  );
};
