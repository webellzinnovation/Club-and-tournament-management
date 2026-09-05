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
  MatchResult,
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
  advanceWinnerInBracket,
  detectSchedulingConflicts,
  SchedulingConflict
} from '../engine/competitionEngine';
import { dbService, SEED_ORG_2, SEED_CLUB_3, SEED_USER_ORG2_OWNER } from '../services/dbService';
import { authService, Session, PermissionAction } from '../services/authService';

interface AppContextType {
  // Auth & RBAC
  currentUser: UserAccount;
  session: Session | null;
  users: UserAccount[];
  switchUser: (userId: string, targetRole?: UserRole) => void;
  switchRole: (role: UserRole) => void;
  login: (email: string) => { success: boolean; message?: string };
  logout: () => void;
  hasPermission: (action: PermissionAction) => boolean;
  canAccessOrg: (orgId: string) => boolean;
  canAccessClub: (clubId: string) => boolean;

  // Organizations & Multi-tenancy
  organizations: Organization[];
  organization: Organization;
  activeOrgId: string;
  setActiveOrgId: (orgId: string) => void;
  clubs: Club[];
  activeClub: Club;
  setActiveClubId: (clubId: string) => void;

  // Players & Claiming
  players: PlayerProfile[];
  addPlayer: (data: Partial<PlayerProfile>) => Promise<PlayerProfile>;
  updatePlayer: (id: string, data: Partial<PlayerProfile>) => Promise<void>;
  claimPlayerProfile: (playerId: string, verificationValue?: string, method?: 'EMAIL_OTP' | 'MOBILE_OTP' | 'FEDERATION_ID') => Promise<{ success: boolean; message: string }>;

  // Club Operations
  coaches: Coach[];
  batches: Batch[];
  attendanceRecords: AttendanceRecord[];
  membershipPlans: MembershipPlan[];
  payments: PaymentRecord[];
  addCoach: (coach: Omit<Coach, 'id'>) => void;
  addBatch: (batch: Omit<Batch, 'id'>) => void;
  recordAttendance: (batchId: string, date: string, records: AttendanceRecord['records']) => Promise<void>;
  markAttendance: (batchId: string, playerId: string, date: string, status: AttendanceStatus) => Promise<void>;
  recordPayment: (payment: Omit<PaymentRecord, 'id' | 'receiptNumber'>) => Promise<void>;
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
  addTournament: (tournament: Omit<Tournament, 'id' | 'slug' | 'eventsCount' | 'totalMatchesCount'>, events: Partial<TournamentEvent>[]) => Promise<Tournament>;
  createTournament: (data: CreateTournamentInput) => Promise<Tournament>;
  generateDraw: (eventId: string, format: TournamentFormat) => Promise<void>;
  assignMatch: (matchId: string, resourceId?: string, refereeId?: string, date?: string, time?: string) => Promise<{ success: boolean; conflicts: SchedulingConflict[] }>;
  callPlayers: (matchId: string, leadMinutes?: number) => Promise<void>;
  updateMatchScore: (matchId: string, score: SportScoreData, status?: Match['status']) => Promise<void>;
  submitMatchResult: (matchId: string, result: Omit<MatchResult, 'id'>) => Promise<void>;
  verifyMatchResult: (matchId: string) => Promise<void>;
  schedulingConflicts: SchedulingConflict[];

  // Announcements & Notifications
  announcements: Announcement[];
  notifications: WebNotification[];
  unreadNotificationsCount: number;
  createAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => Promise<void>;
  broadcastAnnouncement: (data: BroadcastAnnouncementInput) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  addNotification: (notif: Omit<WebNotification, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;

  // Audit Logs
  auditLogs: AuditLog[];
  logAction: (action: string, entity: string, entityId: string, details: string) => Promise<void>;

  // Global Search & Live Sync Status
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isFirestoreLive: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth Session State
  const [session, setSession] = useState<Session | null>(() => authService.getSession());
  const currentUser = session?.user ?? SEED_USERS[0];
  const allUsers = useMemo(() => [...SEED_USERS, SEED_USER_ORG2_OWNER], []);

  // Multi-tenancy State
  const organizations = useMemo(() => [SEED_ORGANIZATION, SEED_ORG_2], []);
  const [activeOrgId, setActiveOrgId] = useState<string>(currentUser.orgId || 'org-1');
  const allClubs = useMemo(() => [...SEED_CLUBS, SEED_CLUB_3], []);
  const [activeClubId, setActiveClubId] = useState<string>('club-1');

  // Authoritative State (backed by Firestore realtime listeners)
  const [players, setPlayers] = useState<PlayerProfile[]>(SEED_PLAYERS);
  const [tournaments, setTournaments] = useState<Tournament[]>(SEED_TOURNAMENTS);
  const [activeTournamentId, setActiveTournamentId] = useState<string>('t-1');
  const [events, setEvents] = useState<TournamentEvent[]>(SEED_EVENTS);
  const [participants, setParticipants] = useState<TournamentParticipant[]>(SEED_PARTICIPANTS);
  const [matches, setMatches] = useState<Match[]>(SEED_MATCHES);
  const [resources, setResources] = useState<CompetitionResource[]>(SEED_RESOURCES);
  const [referees] = useState<Referee[]>(SEED_REFEREES);
  const [announcements, setAnnouncements] = useState<Announcement[]>(SEED_ANNOUNCEMENTS);
  const [notifications, setNotifications] = useState<WebNotification[]>(SEED_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(SEED_AUDIT_LOGS);

  // Club Internal Data
  const [coaches, setCoaches] = useState<Coach[]>(SEED_COACHES);
  const [batches, setBatches] = useState<Batch[]>(SEED_BATCHES);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(SEED_ATTENDANCE);
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>(SEED_MEMBERSHIPS);
  const [payments, setPayments] = useState<PaymentRecord[]>(SEED_PAYMENTS);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFirestoreLive, setIsFirestoreLive] = useState<boolean>(true);

  // Subscribe to auth session changes
  useEffect(() => {
    return authService.subscribe((s) => {
      setSession(s);
      if (s) {
        setActiveOrgId(s.activeOrgId);
        setActiveClubId(s.activeClubId || 'club-1');
      }
    });
  }, []);

  // Initialize Firestore on mount and setup real-time listeners
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    const setupFirestore = async () => {
      try {
        await dbService.initDatabase();
        setIsFirestoreLive(true);

        // 1. Matches realtime listener
        const unsubMatches = dbService.subscribeToMatches(activeTournamentId, (liveMatches) => {
          if (liveMatches.length > 0) {
            setMatches(liveMatches);
          }
        });
        unsubs.push(unsubMatches);

        // 2. Tournaments realtime listener
        const unsubTourneys = dbService.subscribeToTournaments((liveTourneys) => {
          if (liveTourneys.length > 0) {
            setTournaments(liveTourneys);
          }
        });
        unsubs.push(unsubTourneys);

        // 3. Announcements realtime listener
        const unsubAnnounce = dbService.subscribeToAnnouncements((liveAnnouncements) => {
          if (liveAnnouncements.length > 0) {
            setAnnouncements(liveAnnouncements);
          }
        });
        unsubs.push(unsubAnnounce);

        // 4. Notifications realtime listener
        const unsubNotifs = dbService.subscribeToNotifications(currentUser.id, (liveNotifs) => {
          if (liveNotifs.length > 0) {
            setNotifications(liveNotifs);
          }
        });
        unsubs.push(unsubNotifs);

        // 5. Audit logs realtime listener
        const unsubLogs = dbService.subscribeToAuditLogs((liveLogs) => {
          if (liveLogs.length > 0) {
            setAuditLogs(liveLogs);
          }
        });
        unsubs.push(unsubLogs);

        // 6. Players realtime listener
        const unsubPlayers = dbService.subscribeToPlayers((livePlayers) => {
          if (livePlayers.length > 0) {
            setPlayers(livePlayers);
          }
        });
        unsubs.push(unsubPlayers);

        // 7. Resources realtime listener
        const unsubResources = dbService.subscribeToResources((liveResources) => {
          if (liveResources.length > 0) {
            setResources(liveResources);
          }
        });
        unsubs.push(unsubResources);
      } catch (e) {
        console.warn('Realtime listener subscription warning:', e);
      }
    };

    setupFirestore();

    return () => {
      unsubs.forEach(unsub => {
        try { unsub(); } catch {}
      });
    };
  }, [activeTournamentId, currentUser.id]);

  // Notification audio chime
  const playNotificationSound = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Audio context might be restricted before interaction
    }
  }, []);

  // --- Auth & RBAC Actions ---

  const switchUser = useCallback((userId: string, targetRole?: UserRole) => {
    authService.devQuickSwitchUser(userId, targetRole);
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    if (session?.user) {
      authService.createSessionForUser(session.user, role);
    }
  }, [session]);

  const login = useCallback((email: string) => {
    return authService.login(email);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
  }, []);

  const hasPermission = useCallback((action: PermissionAction) => {
    return authService.hasPermission(action);
  }, []);

  const canAccessOrg = useCallback((orgId: string) => {
    return authService.canAccessOrg(orgId);
  }, []);

  const canAccessClub = useCallback((clubId: string) => {
    return authService.canAccessClub(clubId);
  }, []);

  // --- Audit & Notification Actions ---

  const logAction = useCallback(async (action: string, entity: string, entityId: string, details: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      actor: currentUser.name,
      actorRole: currentUser.currentRole,
      action,
      entity,
      entityId,
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
    await dbService.createAuditLog(newLog);
  }, [currentUser]);

  const addNotification = useCallback(async (notifData: Omit<WebNotification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotif = await dbService.createNotification({
      ...notifData,
      isRead: false
    });
    setNotifications(prev => [newNotif, ...prev]);
    playNotificationSound();
  }, [playNotificationSound]);

  const markNotificationAsRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await dbService.markNotificationRead(id);
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await dbService.markAllNotificationsRead(currentUser.id);
  }, [currentUser.id]);

  // --- Player Management & Claim Security ---

  const addPlayer = useCallback(async (data: Partial<PlayerProfile>): Promise<PlayerProfile> => {
    const count = players.length + 1;
    const prefix = data.sport === 'TABLE_TENNIS' ? 'TT' : data.sport === 'BADMINTON' ? 'BD' : data.sport === 'CRICKET' ? 'CR' : 'FB';
    
    // Minimal requirements: ONLY name is required!
    const newPlayerInput: Omit<PlayerProfile, 'id'> = {
      playerId: `${prefix}-${String(180 + count).padStart(5, '0')}`,
      name: data.name || 'Anonymous Player',
      gender: data.gender || 'MALE',
      dateOfBirth: data.dateOfBirth,
      mobile: data.mobile,
      email: data.email,
      clubId: data.clubId || activeClubId,
      clubName: data.clubName || (allClubs.find(c => c.id === activeClubId)?.name || 'Chennai TT Academy'),
      sport: data.sport || 'TABLE_TENNIS',
      category: data.category || 'Open',
      hand: data.hand || 'RIGHT',
      playingStyle: data.playingStyle || 'Offensive',
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
      rating: data.rating ?? 1500,
      tournamentPoints: data.tournamentPoints ?? 0,
      rankings: data.rankings || {},
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      ...data
    };

    const created = await dbService.createPlayer(newPlayerInput);
    setPlayers(prev => [created, ...prev]);
    await logAction('PLAYER_CREATED', 'PlayerProfile', created.playerId, `Created independent player profile for ${created.name} (${created.playerId}).`);
    return created;
  }, [players.length, activeClubId, allClubs, logAction]);

  const updatePlayer = useCallback(async (id: string, data: Partial<PlayerProfile>) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    await dbService.updatePlayer(id, data);
  }, []);

  const claimPlayerProfile = useCallback(async (
    playerId: string,
    verificationValue?: string,
    method: 'EMAIL_OTP' | 'MOBILE_OTP' | 'FEDERATION_ID' = 'EMAIL_OTP'
  ): Promise<{ success: boolean; message: string }> => {
    const player = players.find(p => p.playerId === playerId || p.id === playerId);
    if (!player) {
      return { success: false, message: `Player profile "${playerId}" not found.` };
    }

    const val = verificationValue || player.email || player.mobile || 'VERIFIED-TOKEN';
    const result = await dbService.claimPlayerProfile(currentUser.id, player.playerId, val, method);

    if (result.success) {
      // Update local session
      authService.createSessionForUser({
        ...currentUser,
        linkedPlayerId: player.playerId,
        name: player.name
      });

      await addNotification({
        recipientUserId: currentUser.id,
        recipientPlayerId: player.id,
        type: 'GENERAL_SYSTEM_NOTIFICATION',
        title: 'Profile Claim Verified',
        message: `Successfully linked your account with Player ID ${player.playerId} (${player.name}). Tournament history, ranking points, and draw records are permanently preserved.`
      });
    }

    return result;
  }, [players, currentUser, addNotification]);

  // --- Club Operations ---

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

  const recordAttendance = useCallback(async (batchId: string, date: string, records: AttendanceRecord['records']) => {
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      batchId,
      date,
      records
    };
    setAttendanceRecords(prev => [newRecord, ...prev]);
    await dbService.recordAttendance(newRecord);
    await logAction('ATTENDANCE_MARKED', 'AttendanceRecord', newRecord.id, `Marked attendance for batch ${batchId} on ${date}`);
  }, [logAction]);

  const markAttendance = useCallback(async (batchId: string, playerId: string, date: string, status: AttendanceStatus) => {
    const player = players.find(p => p.id === playerId);
    const playerName = player?.name || 'Player';
    
    let targetRecord: AttendanceRecord | undefined;
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
        targetRecord = { ...existing, records: updatedRecords };
        updated[existingRecordIndex] = targetRecord;
        return updated;
      } else {
        targetRecord = {
          id: `att-${Date.now()}`,
          batchId,
          date,
          records: [{ playerId, playerName, status }]
        };
        return [targetRecord, ...prev];
      }
    });

    if (targetRecord) {
      await dbService.recordAttendance(targetRecord);
    }
  }, [players]);

  const recordPayment = useCallback(async (payment: Omit<PaymentRecord, 'id' | 'receiptNumber'>) => {
    const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPayment: PaymentRecord = {
      ...payment,
      id: `pay-${Date.now()}`,
      receiptNumber
    };
    setPayments(prev => [newPayment, ...prev]);
    await dbService.recordPayment(newPayment);
    await logAction('PAYMENT_RECORDED', 'PaymentRecord', newPayment.id, `Recorded ${payment.currency} ${payment.amount} from ${payment.payerName} (${receiptNumber})`);
  }, [logAction]);

  const addMembershipPlan = useCallback((plan: Omit<MembershipPlan, 'id' | 'activeSubscribersCount'>) => {
    const newPlan: MembershipPlan = {
      ...plan,
      id: `plan-${Date.now()}`,
      activeSubscribersCount: 0
    };
    setMembershipPlans(prev => [...prev, newPlan]);
  }, []);

  // --- Tournament & Competition Engine Actions ---

  const addTournament = useCallback(async (
    tournamentData: Omit<Tournament, 'id' | 'slug' | 'eventsCount' | 'totalMatchesCount'>,
    eventsData: Partial<TournamentEvent>[]
  ): Promise<Tournament> => {
    const id = `t-${Date.now()}`;
    const slug = tournamentData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newTournament: Tournament = {
      ...tournamentData,
      id,
      slug,
      eventsCount: eventsData.length,
      totalMatchesCount: 0
    };

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

    setTournaments(prev => [newTournament, ...prev]);
    setEvents(prev => [...prev, ...newEvents]);

    await dbService.saveTournamentHierarchy(newTournament, newEvents);
    await logAction('TOURNAMENT_CREATED', 'Tournament', id, `Created ${tournamentData.sport} tournament: ${tournamentData.title} (${newTournament.type})`);
    return newTournament;
  }, [logAction]);

  const createTournament = useCallback(async (data: CreateTournamentInput) => {
    return await addTournament(data, data.events || [
      {
        name: `${(data.sport || 'TABLE_TENNIS').replace(/_/g, ' ')} Championship`,
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

  const generateDraw = useCallback(async (eventId: string, format: TournamentFormat) => {
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
      const mid = Math.ceil(eventParticipants.length / 2);
      const groupA = eventParticipants.slice(0, mid).map(p => ({ ...p, groupName: 'Group A' }));
      const groupB = eventParticipants.slice(mid).map(p => ({ ...p, groupName: 'Group B' }));

      const fixturesA = generateRoundRobinFixtures(ev.tournamentId, ev.id, ev.sport, groupA, 'Group A');
      const fixturesB = generateRoundRobinFixtures(ev.tournamentId, ev.id, ev.sport, groupB, 'Group B');
      generatedMatches = [...fixturesA, ...fixturesB];
    }

    setMatches(prev => {
      const remaining = prev.filter(m => m.eventId !== eventId);
      return [...remaining, ...generatedMatches];
    });

    // Save to Firestore
    const targetTourney = tournaments.find(t => t.id === ev.tournamentId);
    if (targetTourney) {
      await dbService.saveTournamentHierarchy(targetTourney, [ev], undefined, undefined, undefined, undefined, generatedMatches);
    }

    await logAction('DRAW_GENERATED', 'TournamentEvent', eventId, `Generated ${format} draw for ${ev.name} with ${eventParticipants.length} participants.`);
  }, [events, participants, tournaments, logAction]);

  const assignMatch = useCallback(async (
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
    // Real interval-based conflict check
    const conflicts = detectSchedulingConflicts(nextMatches);

    setMatches(nextMatches);

    // Save to Firestore
    await dbService.assignMatch(matchId, resourceId, refereeId, date, time);

    if (refereeId) {
      await addNotification({
        recipientUserId: 'user-ref-suresh',
        type: 'REFEREE_ASSIGNED',
        title: `Officiating Duty: ${updatedMatch.resourceName || 'Assigned Table'}`,
        message: `Assigned to Match #${updatedMatch.matchNumber}: ${updatedMatch.participant1Name} vs ${updatedMatch.participant2Name} at ${updatedMatch.scheduledTime}.`,
        tournamentId: match.tournamentId,
        matchId: match.id
      });
    }

    if (updatedMatch.participant1Id || updatedMatch.participant2Id) {
      await addNotification({
        recipientUserId: 'user-player-rahul',
        type: 'MATCH_ASSIGNED',
        title: `Match Scheduled on ${updatedMatch.resourceName}`,
        message: `Match #${updatedMatch.matchNumber} is scheduled for ${updatedMatch.scheduledDate} at ${updatedMatch.scheduledTime} on ${updatedMatch.resourceName}.`,
        tournamentId: match.tournamentId,
        matchId: match.id
      });
    }

    await logAction('MATCH_ASSIGNED', 'Match', matchId, `Assigned Match #${match.matchNumber} to ${updatedMatch.resourceName || 'None'} and Referee ${updatedMatch.refereeName || 'None'} at ${updatedMatch.scheduledTime}`);
    return { success: true, conflicts };
  }, [matches, resources, referees, addNotification, logAction]);

  const callPlayers = useCallback(async (matchId: string, leadMinutes: number = 0) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const callTimeLabel = leadMinutes > 0 ? `in ${leadMinutes} minutes` : `immediately`;

    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status: 'CALLED', calledAt: timeStr } : m));
    await dbService.updateMatchScore(matchId, match.score, 'CALLED');

    await addNotification({
      recipientUserId: 'user-player-rahul',
      type: 'MATCH_CALLED',
      title: `Match Call: ${match.participant1Name} vs ${match.participant2Name}`,
      message: `Match #${match.matchNumber} on ${match.resourceName || 'Designated Table'}. Please report ${callTimeLabel}! Match time: ${match.scheduledTime}.`,
      tournamentId: match.tournamentId,
      matchId: match.id
    });

    await createAnnouncement({
      tournamentId: match.tournamentId,
      title: `Match Call: ${match.participant1Name} vs ${match.participant2Name}`,
      message: `Match #${match.matchNumber} called to ${match.resourceName || 'court/table'}. Players please report to chief referee.`,
      authorName: currentUser.name,
      audience: 'ALL',
      priority: 'URGENT',
      isPublic: true
    });

    await logAction('PLAYER_CALLED', 'Match', matchId, `Issued player call for Match #${match.matchNumber} on ${match.resourceName || 'Unassigned'}`);
  }, [matches, currentUser, addNotification, logAction]);

  const updateMatchScore = useCallback(async (matchId: string, score: SportScoreData, status?: Match['status']) => {
    const nextStatus = status ?? 'LIVE';
    setMatches(prev => prev.map(m => {
      if (m.id !== matchId) return m;
      return {
        ...m,
        score,
        status: nextStatus,
        startedAt: m.startedAt ?? new Date().toLocaleTimeString()
      };
    }));

    // Persist directly to Firestore
    await dbService.updateMatchScore(matchId, score, nextStatus);
  }, []);

  const submitMatchResult = useCallback(async (matchId: string, result: Omit<MatchResult, 'id'>) => {
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status: 'AWAITING_VERIFICATION', winnerId: result.winnerId } : m));
    await dbService.submitMatchResult(matchId, result);
    await logAction('RESULT_SUBMITTED', 'Match', matchId, `Referee submitted result for match ${matchId}. Awaiting official verification.`);
  }, [logAction]);

  const verifyMatchResult = useCallback(async (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

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

    // Advance winner in bracket
    let updatedMatches = matches.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          status: 'VERIFIED' as const,
          winnerId,
          verifiedBy: currentUser.name,
          verifiedAt: new Date().toLocaleTimeString(),
          completedAt: m.completedAt ?? new Date().toLocaleTimeString()
        };
      }
      return m;
    });

    if (winnerId && winnerName) {
      updatedMatches = advanceWinnerInBracket(updatedMatches, matchId, winnerId, winnerName);
    }

    setMatches(updatedMatches);

    // Persist verified result to Firestore
    await dbService.verifyMatchResult(matchId, currentUser.id, winnerId);

    // Update player rankings/points
    if (winnerId) {
      const winnerPlayer = players.find(p => p.id === winnerId || p.playerId === winnerId);
      if (winnerPlayer) {
        await dbService.updatePlayer(winnerPlayer.id, {
          tournamentPoints: (winnerPlayer.tournamentPoints || 0) + 100,
          wins: (winnerPlayer.wins || 0) + 1,
          matchesPlayed: (winnerPlayer.matchesPlayed || 0) + 1
        });
      }
    }

    await addNotification({
      recipientUserId: 'user-player-rahul',
      type: 'RESULT_PUBLISHED',
      title: `Official Result Verified: Match #${match.matchNumber}`,
      message: `${winnerName || 'Winner'} won the match. Result verified by ${currentUser.name}. Standings and bracket progression updated.`,
      tournamentId: match.tournamentId,
      matchId: match.id
    });

    await logAction('MATCH_VERIFIED', 'Match', matchId, `Verified official result for Match #${match.matchNumber}: ${winnerName} won. Progression & standings updated.`);
  }, [matches, currentUser, players, addNotification, logAction]);

  const createAnnouncement = useCallback(async (announcementData: Omit<Announcement, 'id' | 'createdAt'>) => {
    const newAnn = await dbService.createAnnouncement(announcementData);
    setAnnouncements(prev => [newAnn, ...prev]);

    await addNotification({
      type: 'TOURNAMENT_ANNOUNCEMENT',
      title: newAnn.title,
      message: newAnn.message,
      tournamentId: newAnn.tournamentId
    });

    await logAction('ANNOUNCEMENT_PUBLISHED', 'Announcement', newAnn.id, `Published announcement: "${newAnn.title}"`);
  }, [addNotification, logAction]);

  const broadcastAnnouncement = useCallback(async (data: BroadcastAnnouncementInput) => {
    await createAnnouncement({
      title: data.title || 'Announcement',
      message: data.content || data.message || '',
      audience: data.target || data.audience || 'ALL',
      priority: data.priority || 'NORMAL',
      tournamentId: data.tournamentId
    });
  }, [createAnnouncement]);

  // --- Multi-tenancy Scoping & Selectors ---

  const organization = useMemo(() => {
    return organizations.find(o => o.id === activeOrgId) || organizations[0];
  }, [organizations, activeOrgId]);

  // Scoped clubs based on organization boundary
  const clubs = useMemo(() => {
    if (currentUser.currentRole === 'SUPER_ADMIN') {
      return allClubs;
    }
    return allClubs.filter(c => c.orgId === activeOrgId);
  }, [allClubs, activeOrgId, currentUser.currentRole]);

  const activeClub = useMemo(() => {
    return clubs.find(c => c.id === activeClubId) || clubs[0] || allClubs[0];
  }, [clubs, activeClubId, allClubs]);

  // Scoped tournaments based on organization boundary
  const scopedTournaments = useMemo(() => {
    if (currentUser.currentRole === 'SUPER_ADMIN') {
      return tournaments;
    }
    return tournaments.filter(t => !t.orgId || t.orgId === activeOrgId);
  }, [tournaments, activeOrgId, currentUser.currentRole]);

  const activeTournament = useMemo(() => {
    return scopedTournaments.find(t => t.id === activeTournamentId) || scopedTournaments[0];
  }, [scopedTournaments, activeTournamentId]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  // Conflict detection across matches
  const schedulingConflicts = useMemo(() => {
    return detectSchedulingConflicts(matches);
  }, [matches]);

  // Standings calculation
  const standings = useMemo(() => {
    const currentEvent = events.find(e => e.tournamentId === activeTournament?.id);
    return calculateStandings(participants, matches, currentEvent?.rules);
  }, [participants, matches, events, activeTournament]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        session,
        users: allUsers,
        switchUser,
        switchRole,
        login,
        logout,
        hasPermission,
        canAccessOrg,
        canAccessClub,
        organizations,
        organization,
        activeOrgId,
        setActiveOrgId,
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
        tournaments: scopedTournaments,
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
        submitMatchResult,
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
        setSearchQuery,
        isFirestoreLive
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
