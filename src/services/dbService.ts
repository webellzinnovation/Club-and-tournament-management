import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  UserAccount,
  Organization,
  OrganizationMembership,
  ClubMembership,
  Club,
  Coach,
  Batch,
  AttendanceRecord,
  MembershipPlan,
  PaymentRecord,
  PlayerProfile,
  Referee,
  CompetitionResource,
  Tournament,
  TournamentEvent,
  TournamentStage,
  TournamentRound,
  TournamentGroup,
  TournamentParticipant,
  Fixture,
  Match,
  MatchResult,
  StandingRow,
  Ranking,
  Announcement,
  WebNotification,
  AuditLog,
  PlayerAccountLink,
  SportScoreData,
  MatchStatus
} from '../types';
import { authorizationService, AuthContext } from './authorizationService';
import {
  SEED_USERS,
  SEED_ORGANIZATION,
  SEED_CLUBS,
  SEED_COACHES,
  SEED_BATCHES,
  SEED_ATTENDANCE,
  SEED_MEMBERSHIPS,
  SEED_PLAYERS,
  SEED_RESOURCES,
  SEED_REFEREES,
  SEED_TOURNAMENTS,
  SEED_EVENTS,
  SEED_PARTICIPANTS,
  SEED_MATCHES,
  SEED_ANNOUNCEMENTS,
  SEED_NOTIFICATIONS,
  SEED_AUDIT_LOGS,
  SEED_PAYMENTS
} from '../data/seedData';

// Secondary Organization for multi-tenancy verification
export const SEED_ORG_2: Organization = {
  id: 'org-2',
  name: 'Karnataka Badminton & Sports Association',
  type: 'FEDERATION',
  tier: 'ENTERPRISE',
  activeClubs: 3,
  activeTournaments: 2,
  createdAt: '2025-06-01'
};

export const SEED_CLUB_3: Club = {
  id: 'club-3',
  orgId: 'org-2',
  name: 'Bangalore Smashers Academy',
  code: 'BSA',
  city: 'Bangalore',
  address: 'Indiranagar 100ft Road, Bangalore 560038',
  phone: '+91 80 2525 9988',
  email: 'info@bangaloresmashers.in',
  sportsSupported: ['BADMINTON', 'TABLE_TENNIS'],
  branchesCount: 1
};

export const SEED_USER_ORG2_OWNER: UserAccount = {
  id: 'user-owner-org2',
  name: 'Ramesh Gowda',
  email: 'ramesh@bangaloresmashers.in',
  mobile: '+91 99000 11223',
  roles: ['CLUB_OWNER'],
  currentRole: 'CLUB_OWNER',
  orgId: 'org-2',
  avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
};

class DbService {
  /**
   * Explicit administrator or developer tool to seed initial data into Firestore.
   * NEVER called automatically on startup.
   */
  async seedDemoDataToFirestore(adminCtx?: AuthContext): Promise<{ success: boolean; message: string }> {
    if (adminCtx && adminCtx.currentUser.currentRole !== 'SUPER_ADMIN') {
      throw new Error('Access Denied: Only Super Admin can run database seeding.');
    }

    try {
      // 1. Organizations
      await setDoc(doc(db, 'organizations', SEED_ORGANIZATION.id), SEED_ORGANIZATION);
      await setDoc(doc(db, 'organizations', SEED_ORG_2.id), SEED_ORG_2);

      // 2. Clubs
      for (const club of [...SEED_CLUBS, SEED_CLUB_3]) {
        await setDoc(doc(db, 'clubs', club.id), club);
      }

      // 3. Users & Memberships
      for (const user of [...SEED_USERS, SEED_USER_ORG2_OWNER]) {
        await setDoc(doc(db, 'users', user.id), user);
        await setDoc(doc(db, 'organization_memberships', `mem-${user.id}`), {
          id: `mem-${user.id}`,
          orgId: user.orgId,
          organizationId: user.orgId,
          userId: user.id,
          role: user.currentRole,
          roles: user.roles,
          status: 'ACTIVE',
          joinedAt: '2025-01-01'
        } as OrganizationMembership);

        // Seed club memberships for club-scoped roles
        if (user.currentRole === 'CLUB_OWNER' || user.currentRole === 'COACH') {
          const clubId = user.orgId === 'org-2' ? 'club-3' : 'club-1';
          await setDoc(doc(db, 'club_memberships', `cmem-${user.id}-${clubId}`), {
            id: `cmem-${user.id}-${clubId}`,
            organizationId: user.orgId,
            clubId,
            userId: user.id,
            role: user.currentRole,
            status: 'ACTIVE',
            createdAt: '2025-01-01'
          } as ClubMembership);
        }
      }

      // 4. Players
      for (const player of SEED_PLAYERS) {
        await setDoc(doc(db, 'players', player.id), player);
      }

      // 5. Coaches & Batches
      for (const coach of SEED_COACHES) {
        await setDoc(doc(db, 'coaches', coach.id), coach);
      }
      for (const batch of SEED_BATCHES) {
        await setDoc(doc(db, 'batches', batch.id), batch);
      }

      // 6. Resources & Referees
      for (const res of SEED_RESOURCES) {
        await setDoc(doc(db, 'competition_resources', res.id), res);
      }
      for (const ref of SEED_REFEREES) {
        await setDoc(doc(db, 'referees', ref.id), ref);
      }

      // 7. Tournaments, Events, Participants, Matches
      for (const t of SEED_TOURNAMENTS) {
        const enrichedTournament: Tournament = {
          ...t,
          ownerUserId: t.id === 't-1' ? 'u-organizer-1' : 'u-super-1',
          createdByUserId: t.id === 't-1' ? 'u-organizer-1' : 'u-super-1',
          organizationId: t.orgId
        };
        await setDoc(doc(db, 'tournaments', t.id), enrichedTournament);
      }
      for (const ev of SEED_EVENTS) {
        await setDoc(doc(db, 'tournament_events', ev.id), ev);
      }
      for (const p of SEED_PARTICIPANTS) {
        await setDoc(doc(db, 'tournament_participants', p.id), p);
      }
      for (const m of SEED_MATCHES) {
        const enrichedMatch: Match = {
          ...m,
          assignedRefereeId: m.refereeId || 'u-referee-1'
        };
        await setDoc(doc(db, 'matches', m.id), enrichedMatch);
      }

      // 8. Announcements & Notifications
      for (const ann of SEED_ANNOUNCEMENTS) {
        await setDoc(doc(db, 'announcements', ann.id), ann);
      }
      for (const notif of SEED_NOTIFICATIONS) {
        await setDoc(doc(db, 'notifications', notif.id), notif);
      }

      // 9. Audit Logs & Payments
      for (const log of SEED_AUDIT_LOGS) {
        const enrichedLog: AuditLog = {
          ...log,
          actorUserId: 'u-super-1',
          tournamentId: 't-1',
          clubId: 'club-1'
        };
        await setDoc(doc(db, 'audit_logs', log.id), enrichedLog);
      }
      for (const pay of SEED_PAYMENTS) {
        await setDoc(doc(db, 'payment_records', pay.id), pay);
      }

      return { success: true, message: 'Seeded initial database successfully.' };
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'seed_data');
    }
  }

  // --- Authoritative Scoped Subscriptions ---

  /**
   * Tournaments: Scoped to user's authorization boundary
   */
  subscribeToTournaments(
    ctx: AuthContext,
    onUpdate: (tournaments: Tournament[]) => void
  ): Unsubscribe {
    const role = ctx.currentUser.currentRole;
    let q = query(collection(db, 'tournaments'));

    // Tournament Organizer: only tournaments owned by this organizer
    if (role === 'TOURNAMENT_ORGANIZER') {
      q = query(collection(db, 'tournaments'), where('ownerUserId', '==', ctx.currentUser.id));
    } else if (role === 'CLUB_OWNER' || role === 'CLUB_ADMIN' || role === 'COACH') {
      if (ctx.activeClubId) {
        q = query(collection(db, 'tournaments'), where('clubId', '==', ctx.activeClubId));
      } else if (ctx.activeOrgId) {
        q = query(collection(db, 'tournaments'), where('orgId', '==', ctx.activeOrgId));
      }
    } else if (role === 'PLAYER') {
      // Players see public active tournaments
      q = query(collection(db, 'tournaments'), where('isPublic', '==', true));
    } else if (role !== 'SUPER_ADMIN' && ctx.activeOrgId) {
      q = query(collection(db, 'tournaments'), where('orgId', '==', ctx.activeOrgId));
    }

    return onSnapshot(q, (snapshot) => {
      let tourneys = snapshot.docs.map(d => d.data() as Tournament);
      // Extra client-side filter defense
      tourneys = tourneys.filter(t => authorizationService.canViewTournament(t, ctx));
      onUpdate(tourneys);
    }, (error) => {
      console.warn('Tournaments subscription error:', error);
      onUpdate([]);
    });
  }

  /**
   * Matches: Scoped to specific tournament and authorization context
   */
  subscribeToMatches(
    tournamentId: string,
    ctx: AuthContext,
    onUpdate: (matches: Match[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'matches'),
      where('tournamentId', '==', tournamentId)
    );

    return onSnapshot(q, (snapshot) => {
      let matches = snapshot.docs.map(d => d.data() as Match);

      // If user is a REFEREE, they can see all tournament matches but highlight their assigned matches
      if (ctx.currentUser.currentRole === 'PLAYER' && ctx.currentUser.linkedPlayerId) {
        // Player sees matches involving their playerId
        const pid = ctx.currentUser.linkedPlayerId;
        matches = matches.filter(m => m.participant1Id === pid || m.participant2Id === pid);
      }

      onUpdate(matches);
    }, (error) => {
      console.warn('Match subscription error:', error);
      onUpdate([]);
    });
  }

  /**
   * Players: Scoped to authorized club or self
   */
  subscribeToPlayers(
    ctx: AuthContext,
    onUpdate: (players: PlayerProfile[]) => void
  ): Unsubscribe {
    const role = ctx.currentUser.currentRole;
    let q = query(collection(db, 'players'));

    if (role === 'PLAYER') {
      if (ctx.currentUser.linkedPlayerId) {
        q = query(collection(db, 'players'), where('id', '==', ctx.currentUser.linkedPlayerId));
      } else {
        onUpdate([]);
        return () => {};
      }
    } else if ((role === 'CLUB_OWNER' || role === 'CLUB_ADMIN' || role === 'COACH') && ctx.activeClubId) {
      q = query(collection(db, 'players'), where('clubId', '==', ctx.activeClubId));
    }

    return onSnapshot(q, (snapshot) => {
      let players = snapshot.docs.map(d => d.data() as PlayerProfile);
      players = players.filter(p => authorizationService.canViewPlayer(p, ctx));
      onUpdate(players);
    }, (error) => {
      console.warn('Players subscription error:', error);
      onUpdate([]);
    });
  }

  /**
   * Batches: Scoped to active club
   */
  subscribeToBatches(
    clubId: string | undefined,
    ctx: AuthContext,
    onUpdate: (batches: Batch[]) => void
  ): Unsubscribe {
    if (!clubId) {
      onUpdate([]);
      return () => {};
    }

    const q = query(collection(db, 'batches'), where('clubId', '==', clubId));
    return onSnapshot(q, (snapshot) => {
      const batches = snapshot.docs.map(d => d.data() as Batch);
      const filtered = batches.filter(b => authorizationService.canViewBatch(b, ctx));
      onUpdate(filtered);
    }, (error) => {
      console.warn('Batches subscription error:', error);
      onUpdate([]);
    });
  }

  /**
   * Coaches: Scoped to active club
   */
  subscribeToCoaches(
    clubId: string | undefined,
    ctx: AuthContext,
    onUpdate: (coaches: Coach[]) => void
  ): Unsubscribe {
    if (!clubId) {
      onUpdate([]);
      return () => {};
    }

    const q = query(collection(db, 'coaches'), where('clubId', '==', clubId));
    return onSnapshot(q, (snapshot) => {
      const coaches = snapshot.docs.map(d => d.data() as Coach);
      const filtered = coaches.filter(c => authorizationService.canViewCoach(c, ctx));
      onUpdate(filtered);
    }, (error) => {
      console.warn('Coaches subscription error:', error);
      onUpdate([]);
    });
  }

  /**
   * Attendance: Scoped to authorized batches
   */
  subscribeToAttendance(
    batchId: string,
    ctx: AuthContext,
    onUpdate: (records: AttendanceRecord[]) => void
  ): Unsubscribe {
    const q = query(collection(db, 'attendance_records'), where('batchId', '==', batchId));
    return onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(d => d.data() as AttendanceRecord);
      onUpdate(records);
    }, (error) => {
      console.warn('Attendance subscription error:', error);
      onUpdate([]);
    });
  }

  /**
   * Membership Plans: Scoped to active club
   */
  subscribeToMembershipPlans(
    clubId: string | undefined,
    onUpdate: (plans: MembershipPlan[]) => void
  ): Unsubscribe {
    if (!clubId) {
      onUpdate([]);
      return () => {};
    }

    const q = query(collection(db, 'membership_plans'), where('clubId', '==', clubId));
    return onSnapshot(q, (snapshot) => {
      const plans = snapshot.docs.map(d => d.data() as MembershipPlan);
      onUpdate(plans);
    }, (error) => {
      console.warn('Membership plans subscription error:', error);
      onUpdate([]);
    });
  }

  /**
   * Payments: Scoped by authorization
   */
  subscribeToPayments(
    ctx: AuthContext,
    onUpdate: (payments: PaymentRecord[]) => void
  ): Unsubscribe {
    const role = ctx.currentUser.currentRole;
    let q = query(collection(db, 'payment_records'));

    if (role === 'PLAYER') {
      if (ctx.currentUser.linkedPlayerId) {
        q = query(collection(db, 'payment_records'), where('playerId', '==', ctx.currentUser.linkedPlayerId));
      } else {
        onUpdate([]);
        return () => {};
      }
    } else if ((role === 'CLUB_OWNER' || role === 'CLUB_ADMIN') && ctx.activeClubId) {
      q = query(collection(db, 'payment_records'), where('clubId', '==', ctx.activeClubId));
    } else if (role !== 'SUPER_ADMIN') {
      onUpdate([]);
      return () => {};
    }

    return onSnapshot(q, (snapshot) => {
      const payments = snapshot.docs.map(d => d.data() as PaymentRecord);
      const filtered = payments.filter(p => authorizationService.canViewPayment(p, ctx));
      onUpdate(filtered);
    }, (error) => {
      console.warn('Payments subscription error:', error);
      onUpdate([]);
    });
  }

  /**
   * Announcements: Scoped by active context
   */
  subscribeToAnnouncements(
    ctx: AuthContext,
    onUpdate: (announcements: Announcement[]) => void
  ): Unsubscribe {
    const col = collection(db, 'announcements');
    return onSnapshot(col, (snapshot) => {
      let announcements = snapshot.docs.map(d => d.data() as Announcement);
      announcements = announcements.filter(a => authorizationService.canViewAnnouncement(a, ctx));
      announcements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(announcements);
    }, (error) => {
      console.warn('Announcements subscription error:', error);
      onUpdate([]);
    });
  }

  /**
   * Notifications: Strictly scoped to recipient user ID
   */
  subscribeToNotifications(
    userId: string | undefined,
    onUpdate: (notifications: WebNotification[]) => void
  ): Unsubscribe {
    if (!userId) {
      onUpdate([]);
      return () => {};
    }

    const q = query(collection(db, 'notifications'), where('recipientUserId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(d => d.data() as WebNotification);
      notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(notifs);
    }, (error) => {
      console.warn('Notifications subscription error:', error);
      onUpdate([]);
    });
  }

  /**
   * Audit Logs: Strictly isolated
   */
  subscribeToAuditLogs(
    ctx: AuthContext,
    tournamentId: string | undefined,
    onUpdate: (logs: AuditLog[]) => void
  ): Unsubscribe {
    const role = ctx.currentUser.currentRole;
    let q = query(collection(db, 'audit_logs'));

    if (role === 'TOURNAMENT_ORGANIZER' && tournamentId) {
      q = query(collection(db, 'audit_logs'), where('tournamentId', '==', tournamentId));
    } else if ((role === 'CLUB_OWNER' || role === 'CLUB_ADMIN') && ctx.activeClubId) {
      q = query(collection(db, 'audit_logs'), where('clubId', '==', ctx.activeClubId));
    } else if (role !== 'SUPER_ADMIN') {
      onUpdate([]);
      return () => {};
    }

    return onSnapshot(q, (snapshot) => {
      let logs = snapshot.docs.map(d => d.data() as AuditLog);
      logs = logs.filter(l => authorizationService.canViewAuditLog(l, ctx));
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onUpdate(logs);
    }, (error) => {
      console.warn('Audit logs subscription error:', error);
      onUpdate([]);
    });
  }

  // --- Authoritative Mutations with Pre-Write Checks ---

  async createPlayer(player: Omit<PlayerProfile, 'id'>, ctx: AuthContext): Promise<PlayerProfile> {
    const dummyProfile: PlayerProfile = { ...player, id: 'temp' };
    if (!authorizationService.canEditPlayer(dummyProfile, ctx)) {
      throw new Error('Access Denied: You do not have permission to create this player.');
    }

    const id = `p-${Date.now()}`;
    const newPlayer: PlayerProfile = {
      ...player,
      id,
      playerId: player.playerId || `PL-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: player.createdAt || new Date().toISOString().split('T')[0],
      rating: player.rating ?? 1200,
      tournamentPoints: player.tournamentPoints ?? 0,
      rankings: player.rankings || {},
      matchesPlayed: player.matchesPlayed ?? 0,
      wins: player.wins ?? 0,
      losses: player.losses ?? 0
    };

    try {
      await setDoc(doc(db, 'players', id), newPlayer);
      return newPlayer;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `players/${id}`);
    }
  }

  async updatePlayer(id: string, updates: Partial<PlayerProfile>, ctx: AuthContext, existingPlayer: PlayerProfile): Promise<void> {
    if (!authorizationService.canEditPlayer(existingPlayer, ctx)) {
      throw new Error('Access Denied: You do not have permission to modify this player.');
    }

    try {
      await updateDoc(doc(db, 'players', id), updates);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `players/${id}`);
    }
  }

  async claimPlayerProfile(
    userId: string,
    playerId: string,
    verificationValue: string,
    ctx: AuthContext,
    method: 'EMAIL_OTP' | 'MOBILE_OTP' | 'FEDERATION_ID' = 'EMAIL_OTP'
  ): Promise<{ success: boolean; message: string }> {
    if (ctx.currentUser.id !== userId) {
      throw new Error('Access Denied: Identity mismatch.');
    }

    try {
      const playerQuery = query(collection(db, 'players'), where('playerId', '==', playerId));
      const playerSnap = await getDocs(playerQuery);
      if (playerSnap.empty) {
        return { success: false, message: `Player profile with ID "${playerId}" not found.` };
      }
      const playerDoc = playerSnap.docs[0];
      const playerData = playerDoc.data() as PlayerProfile;

      const linkQuery = query(collection(db, 'player_account_links'), where('playerId', '==', playerId));
      const linkSnap = await getDocs(linkQuery);
      if (!linkSnap.empty) {
        return { success: false, message: `This player profile is already linked to a verified user account.` };
      }

      const linkId = `link-${Date.now()}`;
      const link: PlayerAccountLink = {
        id: linkId,
        userId,
        playerId,
        isVerified: true,
        claimedAt: new Date().toISOString(),
        verificationMethod: method,
        verifiedValue: verificationValue
      };
      await setDoc(doc(db, 'player_account_links', linkId), link);
      await updateDoc(doc(db, 'users', userId), { linkedPlayerId: playerId });

      await this.createAuditLog({
        actorUserId: userId,
        actor: ctx.currentUser.name,
        actorRole: 'PLAYER',
        action: 'PLAYER_PROFILE_CLAIMED',
        entity: 'PlayerProfile',
        entityId: playerData.id,
        details: `User ${userId} successfully claimed player profile ${playerId} (${playerData.name}) via ${method}`
      }, ctx);

      return { success: true, message: `Profile successfully linked to ${playerData.name}!` };
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'player_account_links');
    }
  }

  async saveTournamentHierarchy(
    tournament: Tournament,
    events: TournamentEvent[],
    ctx: AuthContext,
    stages?: TournamentStage[],
    rounds?: TournamentRound[],
    groups?: TournamentGroup[],
    fixtures?: Fixture[],
    matches?: Match[]
  ): Promise<void> {
    if (!authorizationService.canManageTournament(tournament, ctx)) {
      throw new Error('Access Denied: You do not have permission to manage this tournament.');
    }

    try {
      await setDoc(doc(db, 'tournaments', tournament.id), tournament);
      for (const ev of events) {
        await setDoc(doc(db, 'tournament_events', ev.id), ev);
      }
      if (stages) {
        for (const st of stages) {
          await setDoc(doc(db, 'tournament_stages', st.id), st);
        }
      }
      if (rounds) {
        for (const rd of rounds) {
          await setDoc(doc(db, 'tournament_rounds', rd.id), rd);
        }
      }
      if (groups) {
        for (const gp of groups) {
          await setDoc(doc(db, 'tournament_groups', gp.id), gp);
        }
      }
      if (fixtures) {
        for (const fx of fixtures) {
          await setDoc(doc(db, 'fixtures', fx.id), fx);
        }
      }
      if (matches) {
        for (const m of matches) {
          await setDoc(doc(db, 'matches', m.id), m);
        }
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `tournaments/${tournament.id}`);
    }
  }

  async updateMatchScore(
    matchId: string,
    score: SportScoreData,
    match: Match,
    tournament: Tournament | undefined,
    ctx: AuthContext,
    status?: MatchStatus
  ): Promise<void> {
    if (!authorizationService.canScoreMatch(match, tournament, ctx)) {
      throw new Error('Access Denied: You are not assigned to score this match.');
    }

    try {
      const updates: Record<string, unknown> = { score };
      if (status) updates.status = status;
      await updateDoc(doc(db, 'matches', matchId), updates);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `matches/${matchId}`);
    }
  }

  async submitMatchResult(
    matchId: string,
    result: Omit<MatchResult, 'id'>,
    match: Match,
    tournament: Tournament | undefined,
    ctx: AuthContext
  ): Promise<void> {
    if (!authorizationService.canScoreMatch(match, tournament, ctx)) {
      throw new Error('Access Denied: You are not authorized to submit results for this match.');
    }

    try {
      const resultId = `res-${matchId}`;
      const fullResult: MatchResult = { ...result, id: resultId };
      await setDoc(doc(db, 'match_results', resultId), fullResult);
      await updateDoc(doc(db, 'matches', matchId), {
        status: 'AWAITING_VERIFICATION',
        winnerId: result.winnerId
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `match_results/res-${matchId}`);
    }
  }

  async verifyMatchResult(
    matchId: string,
    match: Match,
    tournament: Tournament | undefined,
    ctx: AuthContext,
    winnerId?: string
  ): Promise<void> {
    if (!authorizationService.canVerifyResult(match, tournament, ctx)) {
      throw new Error('Access Denied: Only the Tournament Organizer can verify official results.');
    }

    try {
      const verifiedAt = new Date().toISOString();
      await updateDoc(doc(db, 'matches', matchId), {
        status: 'VERIFIED',
        verifiedBy: ctx.currentUser.id,
        verifiedAt,
        winnerId
      });

      const resultId = `res-${matchId}`;
      try {
        await updateDoc(doc(db, 'match_results', resultId), {
          isOfficial: true,
          verifiedByUserId: ctx.currentUser.id,
          verifiedAt
        });
      } catch {
        // Doc may not exist if result was direct
      }

      await this.createAuditLog({
        actorUserId: ctx.currentUser.id,
        actor: ctx.currentUser.name,
        actorRole: ctx.currentUser.currentRole,
        tournamentId: match.tournamentId,
        action: 'RESULT_VERIFIED',
        entity: 'Match',
        entityId: matchId,
        details: `Official verified result for match ${matchId}. Winner: ${winnerId || 'Draw'}`
      }, ctx);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `matches/${matchId}`);
    }
  }

  async assignMatch(
    matchId: string,
    tournament: Tournament,
    ctx: AuthContext,
    resourceId?: string,
    refereeId?: string,
    date?: string,
    time?: string
  ): Promise<void> {
    if (!authorizationService.canManageTournament(tournament, ctx)) {
      throw new Error('Access Denied: You do not have permission to modify tournament schedule.');
    }

    try {
      const updates: Record<string, unknown> = {};
      if (resourceId !== undefined) updates.resourceId = resourceId;
      if (refereeId !== undefined) {
        updates.refereeId = refereeId;
        updates.assignedRefereeId = refereeId;
      }
      if (date !== undefined) updates.scheduledDate = date;
      if (time !== undefined) updates.scheduledTime = time;

      await updateDoc(doc(db, 'matches', matchId), updates);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `matches/${matchId}`);
    }
  }

  async recordAttendance(record: AttendanceRecord, batch: Batch, ctx: AuthContext): Promise<void> {
    if (!authorizationService.canEditAttendance(record, batch, ctx)) {
      throw new Error('Access Denied: You are not authorized to mark attendance for this batch.');
    }

    try {
      await setDoc(doc(db, 'attendance_records', record.id), record);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `attendance_records/${record.id}`);
    }
  }

  async recordPayment(payment: PaymentRecord, ctx: AuthContext): Promise<void> {
    if (!authorizationService.canRecordPayment(payment.clubId, ctx)) {
      throw new Error('Access Denied: You do not have permission to record payments for this club.');
    }

    try {
      await setDoc(doc(db, 'payment_records', payment.id), payment);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `payment_records/${payment.id}`);
    }
  }

  async createAnnouncement(
    announcement: Omit<Announcement, 'id' | 'createdAt'>,
    ctx: AuthContext
  ): Promise<Announcement> {
    if (!authorizationService.canPostAnnouncement(ctx, { clubId: announcement.clubId, tournamentId: announcement.tournamentId })) {
      throw new Error('Access Denied: You are not authorized to post announcements for this scope.');
    }

    const id = `ann-${Date.now()}`;
    const newAnn: Announcement = {
      ...announcement,
      id,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'announcements', id), newAnn);
      return newAnn;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `announcements/${id}`);
    }
  }

  async createNotification(notification: Omit<WebNotification, 'id' | 'createdAt'>): Promise<WebNotification> {
    const id = `notif-${Date.now()}`;
    const newNotif: WebNotification = {
      ...notification,
      id,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'notifications', id), newNotif);
      return newNotif;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `notifications/${id}`);
    }
  }

  async markNotificationRead(id: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'notifications', id), { isRead: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `notifications/${id}`);
    }
  }

  async createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>, ctx: AuthContext): Promise<void> {
    const id = `log-${Date.now()}`;
    const fullLog: AuditLog = {
      ...log,
      id,
      timestamp: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'audit_logs', id), fullLog);
    } catch (e) {
      console.warn('Failed to write audit log to Firestore:', e);
    }
  }
}

export const dbService = new DbService();
