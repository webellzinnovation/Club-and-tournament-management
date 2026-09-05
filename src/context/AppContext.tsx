import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserAccount,
  UserRole,
  Organization,
  Club,
  Coach,
  Batch,
  AttendanceRecord,
  AttendanceStatus,
  MembershipPlan,
  PaymentRecord,
  PlayerProfile,
  Referee,
  CompetitionResource,
  Tournament,
  TournamentEvent,
  TournamentParticipant,
  Match,
  Announcement,
  WebNotification,
  AuditLog,
  SportType,
  TournamentFormat,
  SportScoreData,
  StandingRow,
  CreateTournamentInput,
  BroadcastAnnouncementInput
} from '../types';
import {
  SEED_USERS,
  SEED_ORGANIZATION,
  SEED_CLUBS,
  SEED_COACHES,
  SEED_BATCHES,
  SEED_ATTENDANCE,
  SEED_MEMBERSHIPS,
  SEED_PAYMENTS,
  SEED_PLAYERS,
  SEED_REFEREES,
  SEED_RESOURCES,
  SEED_TOURNAMENTS,
  SEED_EVENTS,
  SEED_PARTICIPANTS,
  SEED_MATCHES,
  SEED_ANNOUNCEMENTS,
  SEED_NOTIFICATIONS,
  SEED_AUDIT_LOGS
} from '../data/seedData';
import {
  calculateStandings,
  generateKnockoutBracket,
  generateRoundRobinFixtures,
  detectSchedulingConflicts,
  SchedulingConflict
} from '../engine/competitionEngine';

interface AppContextType {
  // Auth & Roles
  currentUser: UserAccount;
  users: UserAccount[];
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;

  // Organizations & Clubs
  organization: Organization;
  clubs: Club[];
  activeClub: Club;
  setActiveClubId: (clubId: string) => void;

  // Players & Claiming
  players: PlayerProfile[];
  addPlayer: (data: Partial<PlayerProfile>) => PlayerProfile;
  updatePlayer: (id: string, data: Partial<PlayerProfile>) => void;
  claimPlayerProfile: (playerId: string) => { success: boolean; message: string };

  // Club Operations
  coaches: Coach[];
  batches: Batch[];
  attendanceRecords: AttendanceRecord[];
  membershipPlans: MembershipPlan[];
  payments: PaymentRecord[];
  addCoach: (coach: Omit<Coach, 'id'>) => void;
  addBatch: (batch: Omit<Batch, 'id'>) => void;
  recordAttendance: (batchId: string, date: string, records: AttendanceRecord['records']) => void;
  markAttendance: (batchId: string, playerId: string, date: string, status: AttendanceStatus) => void;
  recordPayment: (payment: Omit<PaymentRecord, 'id' | 'receiptNumber'>) => void;
  addMembershipPlan: (plan: Omit<MembershipPlan, 'id' | 'activeSubscribersCount'>) => void;

  // Tournaments & Events
  tournaments: Tournament[];
  activeTournament: Tournament | undefined;
  setActiveTournamentId: (id: string) => void;
  events: TournamentEvent[];
  participants: TournamentParticipant[];
  matches: Match[];
  resources: CompetitionResource[];
  referees: Referee[];
  standings: StandingRow[];
  addTournament: (tournament: Omit<Tournament, 'id' | 'slug' | 'eventsCount' | 'totalMatchesCount'>, events: Partial<TournamentEvent>[]) => Tournament;
  createTournament: (data: CreateTournamentInput) => Tournament;
  generateDraw: (eventId: string, format: TournamentFormat) => void;
  assignMatch: (matchId: string, resourceId?: string, refereeId?: string, date?: string, time?: string) => { success: boolean; conflicts: SchedulingConflict[] };
  callPlayers: (matchId: string, leadMinutes?: number) => void;
  updateMatchScore: (matchId: string, score: SportScoreData, status?: Match['status']) => void;
  verifyMatchResult: (matchId: string) => void;
  schedulingConflicts: SchedulingConflict[];

  // Announcements & Notifications
  announcements: Announcement[];
  notifications: WebNotification[];
  unreadNotificationsCount: number;
  createAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => void;
  broadcastAnnouncement: (data: BroadcastAnnouncementInput) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notif: Omit<WebNotification, 'id' | 'createdAt' | 'isRead'>) => void;

  // Audit Logs
  auditLogs: AuditLog[];
  logAction: (action: string, entity: string, entityId: string, details: string) => void;

  // Global Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const STORAGE_KEY = 'sportos_v1_data';
const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or use defaults
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_user`);
    return saved ? JSON.parse(saved) : SEED_USERS[0];
  });

  const [users] = useState<UserAccount[]>(SEED_USERS);
  const [organization] = useState<Organization>(SEED_ORGANIZATION);
  const [clubs, setClubs] = useState<Club[]>(SEED_CLUBS);
  const [activeClubId, setActiveClubId] = useState<string>('club-1');

  const [players, setPlayers] = useState<PlayerProfile[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_players`);
    return saved ? JSON.parse(saved) : SEED_PLAYERS;
  });

  const [coaches, setCoaches] = useState<Coach[]>(SEED_COACHES);
  const [batches, setBatches] = useState<Batch[]>(SEED_BATCHES);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(SEED_ATTENDANCE);
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>(SEED_MEMBERSHIPS);
  const [payments, setPayments] = useState<PaymentRecord[]>(SEED_PAYMENTS);

  const [tournaments, setTournaments] = useState<Tournament[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tournaments`);
    return saved ? JSON.parse(saved) : SEED_TOURNAMENTS;
  });

  const [activeTournamentId, setActiveTournamentId] = useState<string>('t-1');
  const [events, setEvents] = useState<TournamentEvent[]>(SEED_EVENTS);
  const [participants, setParticipants] = useState<TournamentParticipant[]>(SEED_PARTICIPANTS);
  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_matches`);
    return saved ? JSON.parse(saved) : SEED_MATCHES;
  });

  const [resources, setResources] = useState<CompetitionResource[]>(SEED_RESOURCES);
  const [referees, setReferees] = useState<Referee[]>(SEED_REFEREES);
  const [announcements, setAnnouncements] = useState<Announcement[]>(SEED_ANNOUNCEMENTS);
  const [notifications, setNotifications] = useState<WebNotification[]>(SEED_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(SEED_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Persist key state
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(currentUser));
      localStorage.setItem(`${STORAGE_KEY}_matches`, JSON.stringify(matches));
      localStorage.setItem(`${STORAGE_KEY}_players`, JSON.stringify(players));
      localStorage.setItem(`${STORAGE_KEY}_tournaments`, JSON.stringify(tournaments));
    } catch (e) {
      console.error('Storage sync error:', e);
    }
  }, [currentUser, matches, players, tournaments]);

  // Real-time broadcast channel across browser tabs
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('sportos_live_bus');
      channel.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'SCORE_UPDATE') {
          setMatches(prev => prev.map(m => m.id === payload.id ? payload : m));
        } else if (type === 'NEW_NOTIFICATION') {
          setNotifications(prev => [payload, ...prev]);
        } else if (type === 'NEW_ANNOUNCEMENT') {
          setAnnouncements(prev => [payload, ...prev]);
        }
      };
      return () => channel.close();
    }
  }, []);

  const broadcastEvent = (type: string, payload: unknown) => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel('sportos_live_bus');
        channel.postMessage({ type, payload });
        channel.close();
      } catch (e) {
        // Safe fallback
      }
    }
  };

  const playNotificationSound = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  }, []);

  const logAction = useCallback((action: string, entity: string, entityId: string, details: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      actor: currentUser.name,
      actorRole: currentUser.currentRole,
      action,
      entity,
      entityId,
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, [currentUser]);

  const addNotification = useCallback((notifData: Omit<WebNotification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotif: WebNotification = {
      ...notifData,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    broadcastEvent('NEW_NOTIFICATION', newNotif);
    playNotificationSound();
  }, [playNotificationSound]);

  const switchUser = useCallback((userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  }, [users]);

  const switchRole = useCallback((role: UserRole) => {
    setCurrentUser(prev => ({ ...prev, currentRole: role }));
  }, []);

  const addPlayer = useCallback((data: Partial<PlayerProfile>): PlayerProfile => {
    const count = players.length + 1;
    const prefix = data.sport === 'TABLE_TENNIS' ? 'TT' : data.sport === 'BADMINTON' ? 'BD' : data.sport === 'CRICKET' ? 'CR' : 'FB';
    const newPlayer: PlayerProfile = {
      id: `p-${Date.now()}`,
      playerId: `${prefix}-${String(180 + count).padStart(5, '0')}`,
      name: data.name || 'Anonymous Player',
      gender: data.gender || 'MALE',
      dateOfBirth: data.dateOfBirth,
      mobile: data.mobile,
      email: data.email,
      clubId: data.clubId || 'club-1',
      clubName: data.clubName || 'Chennai TT Academy',
      sport: data.sport || 'TABLE_TENNIS',
      category: data.category || 'Open',
      hand: data.hand || 'RIGHT',
      playingStyle: data.playingStyle || 'Offensive',
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
      rating: 1500,
      tournamentPoints: 0,
      rankings: {},
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      ...data
    };

    setPlayers(prev => [newPlayer, ...prev]);
    logAction('PLAYER_CREATED', 'PlayerProfile', newPlayer.playerId, `Created permanent player profile for ${newPlayer.name} (${newPlayer.playerId}).`);
    return newPlayer;
  }, [players, logAction]);

  const updatePlayer = useCallback((id: string, data: Partial<PlayerProfile>) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  }, []);

  const claimPlayerProfile = useCallback((playerId: string): { success: boolean; message: string } => {
    const player = players.find(p => p.playerId === playerId || p.id === playerId);
    if (!player) {
      return { success: false, message: 'Player profile with this ID not found.' };
    }

    // Link user to this player profile
    setCurrentUser(prev => ({
      ...prev,
      linkedPlayerId: player.playerId,
      name: player.name
    }));

    addNotification({
      recipientUserId: currentUser.id,
      recipientPlayerId: player.id,
      type: 'GENERAL_SYSTEM_NOTIFICATION',
      title: 'Profile Claim Verified',
      message: `You have successfully linked your account with Player ID ${player.playerId} (${player.name}). Existing tournament history, stats, and rankings are preserved.`
    });

    logAction('PROFILE_CLAIMED', 'PlayerProfile', player.playerId, `User ${currentUser.email} claimed player profile ${player.playerId} without data loss.`);
    return { success: true, message: `Successfully linked with ${player.name} (${player.playerId})!` };
  }, [players, currentUser, addNotification, logAction]);

  const addCoach = useCallback((coach: Omit<Coach, 'id'>) => {
    const newCoach = { ...coach, id: `coach-${Date.now()}` };
    setCoaches(prev => [...prev, newCoach]);
    logAction('COACH_ADDED', 'Coach', newCoach.id, `Added coach ${newCoach.name}`);
  }, [logAction]);

  const addBatch = useCallback((batch: Omit<Batch, 'id'>) => {
    const newBatch = { ...batch, id: `batch-${Date.now()}` };
    setBatches(prev => [...prev, newBatch]);
    logAction('BATCH_CREATED', 'Batch', newBatch.id, `Created batch ${newBatch.name}`);
  }, [logAction]);

  const recordAttendance = useCallback((batchId: string, date: string, records: AttendanceRecord['records']) => {
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      batchId,
      date,
      records
    };
    setAttendanceRecords(prev => [newRecord, ...prev]);
    logAction('ATTENDANCE_MARKED', 'AttendanceRecord', newRecord.id, `Marked attendance for batch ${batchId} on ${date}`);
  }, [logAction]);

  const markAttendance = useCallback((batchId: string, playerId: string, date: string, status: AttendanceStatus) => {
    const player = players.find(p => p.id === playerId);
    const playerName = player?.name || 'Player';
    setAttendanceRecords(prev => {
      const existingRecordIndex = prev.findIndex(r => r.batchId === batchId && r.date === date);
      if (existingRecordIndex >= 0) {
        const existing = prev[existingRecordIndex];
        const studentIndex = existing.records.findIndex(rec => rec.playerId === playerId);
        const updatedRecords = [...existing.records];
        if (studentIndex >= 0) {
          updatedRecords[studentIndex] = { ...updatedRecords[studentIndex], status };
        } else {
          updatedRecords.push({ playerId, playerName, status });
        }
        const updated = [...prev];
        updated[existingRecordIndex] = { ...existing, records: updatedRecords };
        return updated;
      } else {
        const newRec: AttendanceRecord = {
          id: `att-${Date.now()}`,
          batchId,
          date,
          records: [{ playerId, playerName, status }]
        };
        return [newRec, ...prev];
      }
    });
  }, [players]);

  const recordPayment = useCallback((payment: Omit<PaymentRecord, 'id' | 'receiptNumber'>) => {
    const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPayment: PaymentRecord = {
      ...payment,
      id: `pay-${Date.now()}`,
      receiptNumber
    };
    setPayments(prev => [newPayment, ...prev]);
    logAction('PAYMENT_RECORDED', 'PaymentRecord', newPayment.id, `Recorded ${payment.currency} ${payment.amount} from ${payment.payerName} (${receiptNumber})`);
  }, [logAction]);

  const addMembershipPlan = useCallback((plan: Omit<MembershipPlan, 'id' | 'activeSubscribersCount'>) => {
    const newPlan: MembershipPlan = {
      ...plan,
      id: `plan-${Date.now()}`,
      activeSubscribersCount: 0
    };
    setMembershipPlans(prev => [...prev, newPlan]);
  }, []);

  const addTournament = useCallback((
    tournamentData: Omit<Tournament, 'id' | 'slug' | 'eventsCount' | 'totalMatchesCount'>,
    eventsData: Partial<TournamentEvent>[]
  ): Tournament => {
    const id = `t-${Date.now()}`;
    const slug = tournamentData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newTournament: Tournament = {
      ...tournamentData,
      id,
      slug,
      eventsCount: eventsData.length,
      totalMatchesCount: 0
    };

    setTournaments(prev => [newTournament, ...prev]);

    // Create events for this tournament
    const newEvents: TournamentEvent[] = eventsData.map((ev, idx) => ({
      id: `ev-${Date.now()}-${idx}`,
      tournamentId: id,
      name: ev.name || "Men's Singles",
      sport: tournamentData.sport,
      format: ev.format || 'GROUPS_KNOCKOUT',
      category: ev.category || 'Open',
      isDoubles: ev.isDoubles || false,
      participantIds: [],
      rules: ev.rules || {
        sport: tournamentData.sport,
        bestOfSets: 5,
        pointsPerGame: 11,
        winByMargin: 2,
        pointsForWin: 2,
        pointsForDraw: 0,
        pointsForLoss: 0,
        tieBreakerPriority: ['POINTS', 'GAMES_DIFF']
      },
      status: 'UPCOMING'
    }));

    setEvents(prev => [...prev, ...newEvents]);
    logAction('TOURNAMENT_CREATED', 'Tournament', id, `Created ${tournamentData.sport} tournament: ${tournamentData.title} (${newTournament.type})`);
    return newTournament;
  }, [logAction]);

  const createTournament = useCallback((data: CreateTournamentInput) => {
    return addTournament(data, data.events || [
      {
        name: `${(data.sport || 'TABLE_TENNIS').replace(/_/g, ' ')} Open`,
        sport: data.sport || 'TABLE_TENNIS',
        format: data.format || 'GROUPS_KNOCKOUT',
        category: 'Open',
        rules: {
          sport: data.sport || 'TABLE_TENNIS',
          bestOfSets: 5,
          pointsPerGame: 11,
          winByMargin: 2,
          pointsForWin: 2,
          pointsForDraw: 0,
          pointsForLoss: 0,
          tieBreakerPriority: ['POINTS', 'GAMES_DIFF']
        }
      }
    ]);
  }, [addTournament]);

  const generateDraw = useCallback((eventId: string, format: TournamentFormat) => {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;

    const eventParticipants = participants.filter(p => p.eventId === eventId);
    if (eventParticipants.length < 2) {
      alert('At least 2 participants are required to generate draws.');
      return;
    }

    let generatedMatches: Match[] = [];

    if (format === 'ROUND_ROBIN') {
      generatedMatches = generateRoundRobinFixtures(ev.tournamentId, ev.id, ev.sport, eventParticipants);
    } else if (format === 'KNOCKOUT') {
      generatedMatches = generateKnockoutBracket(ev.tournamentId, ev.id, ev.sport, eventParticipants);
    } else if (format === 'GROUPS_KNOCKOUT') {
      // Divide into Group A and Group B
      const mid = Math.ceil(eventParticipants.length / 2);
      const groupA = eventParticipants.slice(0, mid).map(p => ({ ...p, groupName: 'Group A' }));
      const groupB = eventParticipants.slice(mid).map(p => ({ ...p, groupName: 'Group B' }));

      const fixturesA = generateRoundRobinFixtures(ev.tournamentId, ev.id, ev.sport, groupA, 'Group A');
      const fixturesB = generateRoundRobinFixtures(ev.tournamentId, ev.id, ev.sport, groupB, 'Group B');
      generatedMatches = [...fixturesA, ...fixturesB];
    }

    // Replace or append event matches
    setMatches(prev => {
      const remaining = prev.filter(m => m.eventId !== eventId);
      return [...remaining, ...generatedMatches];
    });

    logAction('DRAW_GENERATED', 'TournamentEvent', eventId, `Generated ${format} draw for ${ev.name} with ${eventParticipants.length} participants.`);
  }, [events, participants, logAction]);

  const assignMatch = useCallback((
    matchId: string,
    resourceId?: string,
    refereeId?: string,
    date?: string,
    time?: string
  ) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return { success: false, conflicts: [] };

    const resource = resources.find(r => r.id === resourceId);
    const referee = referees.find(r => r.id === refereeId);

    const updatedMatch: Match = {
      ...match,
      resourceId: resourceId ?? match.resourceId,
      resourceName: resource ? resource.name : match.resourceName,
      refereeId: refereeId ?? match.refereeId,
      refereeName: referee ? referee.name : match.refereeName,
      scheduledDate: date ?? match.scheduledDate,
      scheduledTime: time ?? match.scheduledTime,
      status: match.status === 'SCHEDULED' && resourceId ? 'READY' : match.status
    };

    const nextMatches = matches.map(m => m.id === matchId ? updatedMatch : m);
    const conflicts = detectSchedulingConflicts(nextMatches);

    // Apply update
    setMatches(nextMatches);

    // Notify assigned referee
    if (refereeId) {
      addNotification({
        recipientUserId: 'user-ref-suresh',
        type: 'REFEREE_ASSIGNED',
        title: `Officiating Duty: ${updatedMatch.resourceName || 'Assigned Table'}`,
        message: `You are assigned to Match #${updatedMatch.matchNumber}: ${updatedMatch.participant1Name} vs ${updatedMatch.participant2Name} at ${updatedMatch.scheduledTime}.`,
        tournamentId: match.tournamentId,
        matchId: match.id
      });
    }

    // Notify player if assigned
    if (updatedMatch.participant1Id || updatedMatch.participant2Id) {
      addNotification({
        recipientUserId: 'user-player-rahul',
        type: 'MATCH_ASSIGNED',
        title: `Match Scheduled on ${updatedMatch.resourceName}`,
        message: `Your match #${updatedMatch.matchNumber} is set for ${updatedMatch.scheduledDate} at ${updatedMatch.scheduledTime} on ${updatedMatch.resourceName}.`,
        tournamentId: match.tournamentId,
        matchId: match.id
      });
    }

    logAction('MATCH_ASSIGNED', 'Match', matchId, `Assigned Match #${match.matchNumber} to ${updatedMatch.resourceName || 'None'} and Referee ${updatedMatch.refereeName || 'None'} at ${updatedMatch.scheduledTime}`);
    return { success: true, conflicts };
  }, [matches, resources, referees, addNotification, logAction]);

  const callPlayers = useCallback((matchId: string, leadMinutes: number = 0) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const callTimeLabel = leadMinutes > 0 ? `in ${leadMinutes} minutes` : `immediately`;

    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status: 'CALLED', calledAt: timeStr } : m));

    // Send high-priority notification to players & referees
    addNotification({
      recipientUserId: 'user-player-rahul',
      type: 'MATCH_CALLED',
      title: `Match Call: ${match.participant1Name} vs ${match.participant2Name}`,
      message: `Match #${match.matchNumber} on ${match.resourceName || 'Designated Table'}. Please report ${callTimeLabel}! Match time: ${match.scheduledTime}.`,
      tournamentId: match.tournamentId,
      matchId: match.id
    });

    createAnnouncement({
      tournamentId: match.tournamentId,
      title: `Match Call: ${match.participant1Name} vs ${match.participant2Name}`,
      message: `Match #${match.matchNumber} called to ${match.resourceName || 'court/table'}. Players must report to chief referee.`,
      authorName: currentUser.name,
      audience: 'ALL',
      priority: 'URGENT',
      isPublic: true
    });

    logAction('PLAYER_CALLED', 'Match', matchId, `Issued player call for Match #${match.matchNumber} on ${match.resourceName || 'Unassigned'}`);
  }, [matches, currentUser, addNotification, logAction]);

  const updateMatchScore = useCallback((matchId: string, score: SportScoreData, status?: Match['status']) => {
    setMatches(prev => {
      return prev.map(m => {
        if (m.id !== matchId) return m;
        const nextStatus = status ?? (m.status === 'SCHEDULED' || m.status === 'READY' || m.status === 'CALLED' ? 'LIVE' : m.status);
        const updated = {
          ...m,
          score,
          status: nextStatus,
          startedAt: m.startedAt ?? new Date().toLocaleTimeString()
        };
        broadcastEvent('SCORE_UPDATE', updated);
        return updated;
      });
    });
  }, []);

  const verifyMatchResult = useCallback((matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    // Determine winner based on score
    let winnerId = match.winnerId;
    let s1 = 0;
    let s2 = 0;

    if (match.score.sport === 'TABLE_TENNIS' || match.score.sport === 'BADMINTON') {
      s1 = match.score.data.sets.filter(s => s.p1 > s.p2).length;
      s2 = match.score.data.sets.filter(s => s.p2 > s.p1).length;
      winnerId = s1 > s2 ? match.participant1Id : match.participant2Id;
    } else if (match.score.sport === 'FOOTBALL') {
      s1 = match.score.data.team1Goals;
      s2 = match.score.data.team2Goals;
      winnerId = s1 > s2 ? match.participant1Id : match.participant2Id;
    }

    const winnerName = winnerId === match.participant1Id ? match.participant1Name : match.participant2Name;

    // Update match state
    setMatches(prev => {
      return prev.map(m => {
        if (m.id === matchId) {
          return {
            ...m,
            status: 'VERIFIED',
            winnerId,
            verifiedBy: currentUser.name,
            verifiedAt: new Date().toLocaleTimeString(),
            completedAt: m.completedAt ?? new Date().toLocaleTimeString()
          };
        }

        // Bracket progression for Knockout matches
        if (match.bracketPosition?.nextMatchId && m.id === match.bracketPosition.nextMatchId) {
          if (match.bracketPosition.nextMatchSlot === 1) {
            return {
              ...m,
              participant1Id: winnerId,
              participant1Name: winnerName
            };
          } else {
            return {
              ...m,
              participant2Id: winnerId,
              participant2Name: winnerName
            };
          }
        }

        return m;
      });
    });

    // Update participant stats & rankings
    setParticipants(prev => {
      return prev.map(p => {
        if (p.id === match.participant1Id) {
          const isWin = winnerId === p.id;
          return {
            ...p,
            stats: {
              ...p.stats,
              matchesPlayed: p.stats.matchesPlayed + 1,
              wins: p.stats.wins + (isWin ? 1 : 0),
              losses: p.stats.losses + (isWin ? 0 : 1),
              scoreFor: p.stats.scoreFor + s1,
              scoreAgainst: p.stats.scoreAgainst + s2,
              points: p.stats.points + (isWin ? 2 : 0)
            }
          };
        } else if (p.id === match.participant2Id) {
          const isWin = winnerId === p.id;
          return {
            ...p,
            stats: {
              ...p.stats,
              matchesPlayed: p.stats.matchesPlayed + 1,
              wins: p.stats.wins + (isWin ? 1 : 0),
              losses: p.stats.losses + (isWin ? 0 : 1),
              scoreFor: p.stats.scoreFor + s2,
              scoreAgainst: p.stats.scoreAgainst + s1,
              points: p.stats.points + (isWin ? 2 : 0)
            }
          };
        }
        return p;
      });
    });

    // Notify participants
    addNotification({
      recipientUserId: 'user-player-rahul',
      type: 'RESULT_PUBLISHED',
      title: `Official Result Verified: Match #${match.matchNumber}`,
      message: `${winnerName} won the match (${s1}-${s2}). Result verified by ${currentUser.name}. Standings and tournament points updated.`,
      tournamentId: match.tournamentId,
      matchId: match.id
    });

    logAction('MATCH_VERIFIED', 'Match', matchId, `Verified official result for Match #${match.matchNumber}: ${winnerName} won (${s1}-${s2}). Progression & standings updated.`);
  }, [matches, currentUser, addNotification, logAction]);

  const createAnnouncement = useCallback((announcementData: Omit<Announcement, 'id' | 'createdAt'>) => {
    const newAnn: Announcement = {
      ...announcementData,
      id: `ann-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    broadcastEvent('NEW_ANNOUNCEMENT', newAnn);

    // Send web notification to target audience
    addNotification({
      type: 'TOURNAMENT_ANNOUNCEMENT',
      title: newAnn.title,
      message: newAnn.message,
      tournamentId: newAnn.tournamentId
    });

    logAction('ANNOUNCEMENT_PUBLISHED', 'Announcement', newAnn.id, `Published announcement: "${newAnn.title}" for audience ${newAnn.audience}`);
  }, [addNotification, logAction]);

  const broadcastAnnouncement = useCallback((data: BroadcastAnnouncementInput) => {
    createAnnouncement({
      title: data.title || 'Announcement',
      message: data.content || data.message || '',
      audience: data.target || data.audience || 'ALL',
      priority: data.priority || 'NORMAL',
      tournamentId: data.tournamentId
    });
  }, [createAnnouncement]);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const activeClub = clubs.find(c => c.id === activeClubId) || clubs[0];
  const activeTournament = tournaments.find(t => t.id === activeTournamentId) || tournaments[0];
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;
  const schedulingConflicts = detectSchedulingConflicts(matches);
  const standings = useMemo(() => {
    return calculateStandings(participants, matches);
  }, [participants, matches]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        switchUser,
        switchRole,
        organization,
        clubs,
        activeClub,
        setActiveClubId,
        players,
        addPlayer,
        updatePlayer,
        claimPlayerProfile,
        coaches,
        batches,
        attendanceRecords,
        membershipPlans,
        payments,
        addCoach,
        addBatch,
        recordAttendance,
        markAttendance,
        recordPayment,
        addMembershipPlan,
        tournaments,
        activeTournament,
        setActiveTournamentId,
        events,
        participants,
        matches,
        resources,
        referees,
        standings,
        addTournament,
        createTournament,
        generateDraw,
        assignMatch,
        callPlayers,
        updateMatchScore,
        verifyMatchResult,
        schedulingConflicts,
        announcements,
        notifications,
        unreadNotificationsCount,
        createAnnouncement,
        broadcastAnnouncement,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        auditLogs,
        logAction,
        searchQuery,
        setSearchQuery
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
