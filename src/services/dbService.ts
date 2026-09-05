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
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  UserAccount,
  Organization,
  OrganizationMembership,
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
  private initialized = false;

  async initDatabase(forceSeed: boolean = false): Promise<void> {
    if (this.initialized && !forceSeed) return;
    try {
      const tourneysSnap = await getDocs(collection(db, 'tournaments'));
      if (tourneysSnap.empty || forceSeed) {
        console.log('Seeding initial data into Firestore...');
        await this.seedAllData();
      }
      this.initialized = true;
    } catch (err) {
      console.warn('Firestore initialization warning (will retry or use offline cache):', err);
      this.initialized = true;
    }
  }

  private async seedAllData(): Promise<void> {
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
          userId: user.id,
          roles: user.roles,
          status: 'ACTIVE',
          joinedAt: '2025-01-01'
        } as OrganizationMembership);
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
        await setDoc(doc(db, 'tournaments', t.id), t);
      }
      for (const ev of SEED_EVENTS) {
        await setDoc(doc(db, 'tournament_events', ev.id), ev);
      }
      for (const p of SEED_PARTICIPANTS) {
        await setDoc(doc(db, 'tournament_participants', p.id), p);
      }
      for (const m of SEED_MATCHES) {
        await setDoc(doc(db, 'matches', m.id), m);
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
        await setDoc(doc(db, 'audit_logs', log.id), log);
      }
      for (const pay of SEED_PAYMENTS) {
        await setDoc(doc(db, 'payment_records', pay.id), pay);
      }

      console.log('Firestore seed complete!');
    } catch (e) {
      console.error('Error during Firestore seeding:', e);
    }
  }

  // --- Realtime Subscriptions ---

  subscribeToMatches(tournamentId: string, onUpdate: (matches: Match[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'matches'),
      where('tournamentId', '==', tournamentId)
    );
    return onSnapshot(q, (snapshot) => {
      const matches = snapshot.docs.map(d => d.data() as Match);
      onUpdate(matches);
    }, (error) => {
      console.warn('Match subscription error:', error);
    });
  }

  subscribeToTournaments(onUpdate: (tournaments: Tournament[]) => void): Unsubscribe {
    const col = collection(db, 'tournaments');
    return onSnapshot(col, (snapshot) => {
      const tournaments = snapshot.docs.map(d => d.data() as Tournament);
      onUpdate(tournaments);
    }, (error) => {
      console.warn('Tournaments subscription error:', error);
    });
  }

  subscribeToAnnouncements(onUpdate: (announcements: Announcement[]) => void): Unsubscribe {
    const col = collection(db, 'announcements');
    return onSnapshot(col, (snapshot) => {
      const announcements = snapshot.docs.map(d => d.data() as Announcement);
      // Sort newest first
      announcements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(announcements);
    }, (error) => {
      console.warn('Announcements subscription error:', error);
    });
  }

  subscribeToNotifications(userId: string | undefined, onUpdate: (notifications: WebNotification[]) => void): Unsubscribe {
    const col = collection(db, 'notifications');
    return onSnapshot(col, (snapshot) => {
      const notifs = snapshot.docs.map(d => d.data() as WebNotification);
      const filtered = userId ? notifs.filter(n => !n.recipientUserId || n.recipientUserId === userId) : notifs;
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(filtered);
    }, (error) => {
      console.warn('Notifications subscription error:', error);
    });
  }

  subscribeToAuditLogs(onUpdate: (logs: AuditLog[]) => void): Unsubscribe {
    const col = collection(db, 'audit_logs');
    return onSnapshot(col, (snapshot) => {
      const logs = snapshot.docs.map(d => d.data() as AuditLog);
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onUpdate(logs);
    }, (error) => {
      console.warn('Audit logs subscription error:', error);
    });
  }

  subscribeToPlayers(onUpdate: (players: PlayerProfile[]) => void): Unsubscribe {
    const col = collection(db, 'players');
    return onSnapshot(col, (snapshot) => {
      const players = snapshot.docs.map(d => d.data() as PlayerProfile);
      onUpdate(players);
    }, (error) => {
      console.warn('Players subscription error:', error);
    });
  }

  subscribeToResources(onUpdate: (resources: CompetitionResource[]) => void): Unsubscribe {
    const col = collection(db, 'competition_resources');
    return onSnapshot(col, (snapshot) => {
      const resources = snapshot.docs.map(d => d.data() as CompetitionResource);
      onUpdate(resources);
    }, (error) => {
      console.warn('Resources subscription error:', error);
    });
  }

  // --- CRUD Operations ---

  async createPlayer(player: Omit<PlayerProfile, 'id'>): Promise<PlayerProfile> {
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
    await setDoc(doc(db, 'players', id), newPlayer);
    return newPlayer;
  }

  async updatePlayer(id: string, updates: Partial<PlayerProfile>): Promise<void> {
    await updateDoc(doc(db, 'players', id), updates);
  }

  async claimPlayerProfile(userId: string, playerId: string, verificationValue: string, method: 'EMAIL_OTP' | 'MOBILE_OTP' | 'FEDERATION_ID' = 'EMAIL_OTP'): Promise<{ success: boolean; message: string }> {
    // 1. Check if player exists
    const playerQuery = query(collection(db, 'players'), where('playerId', '==', playerId));
    const playerSnap = await getDocs(playerQuery);
    if (playerSnap.empty) {
      return { success: false, message: `Player profile with ID "${playerId}" not found.` };
    }
    const playerDoc = playerSnap.docs[0];
    const playerData = playerDoc.data() as PlayerProfile;

    // 2. Check if already claimed by anyone
    const linkQuery = query(collection(db, 'player_account_links'), where('playerId', '==', playerId));
    const linkSnap = await getDocs(linkQuery);
    if (!linkSnap.empty) {
      return { success: false, message: `This player profile is already linked to a verified user account.` };
    }

    // 3. Create claim link
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

    // 4. Update user record with linkedPlayerId
    await updateDoc(doc(db, 'users', userId), { linkedPlayerId: playerId });

    // 5. Create audit log
    await this.createAuditLog({
      actor: userId,
      actorRole: 'PLAYER',
      action: 'PLAYER_PROFILE_CLAIMED',
      entity: 'PlayerProfile',
      entityId: playerData.id,
      details: `User ${userId} successfully claimed player profile ${playerId} (${playerData.name}) via ${method}`
    });

    return { success: true, message: `Profile successfully linked to ${playerData.name}!` };
  }

  async saveTournamentHierarchy(
    tournament: Tournament,
    events: TournamentEvent[],
    stages?: TournamentStage[],
    rounds?: TournamentRound[],
    groups?: TournamentGroup[],
    fixtures?: Fixture[],
    matches?: Match[]
  ): Promise<void> {
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
  }

  async updateMatchScore(matchId: string, score: SportScoreData, status?: MatchStatus): Promise<void> {
    const updates: Record<string, unknown> = { score };
    if (status) {
      updates.status = status;
    }
    await updateDoc(doc(db, 'matches', matchId), updates);
  }

  async submitMatchResult(matchId: string, result: Omit<MatchResult, 'id'>): Promise<void> {
    const resultId = `res-${matchId}`;
    const fullResult: MatchResult = {
      ...result,
      id: resultId
    };
    await setDoc(doc(db, 'match_results', resultId), fullResult);
    await updateDoc(doc(db, 'matches', matchId), {
      status: 'AWAITING_VERIFICATION',
      winnerId: result.winnerId
    });
  }

  async verifyMatchResult(matchId: string, verifierUserId: string, winnerId?: string): Promise<void> {
    const verifiedAt = new Date().toISOString();
    await updateDoc(doc(db, 'matches', matchId), {
      status: 'VERIFIED',
      verifiedBy: verifierUserId,
      verifiedAt,
      winnerId
    });

    const resultId = `res-${matchId}`;
    try {
      await updateDoc(doc(db, 'match_results', resultId), {
        isOfficial: true,
        verifiedByUserId: verifierUserId,
        verifiedAt
      });
    } catch {
      // If result doc doesn't exist yet, that's okay
    }

    await this.createAuditLog({
      actor: verifierUserId,
      actorRole: 'TOURNAMENT_ORGANIZER',
      action: 'RESULT_VERIFIED',
      entity: 'Match',
      entityId: matchId,
      details: `Official verified result for match ${matchId}. Winner: ${winnerId || 'Draw'}`
    });
  }

  async assignMatch(matchId: string, resourceId?: string, refereeId?: string, date?: string, time?: string): Promise<void> {
    const updates: Record<string, unknown> = {};
    if (resourceId !== undefined) updates.resourceId = resourceId;
    if (refereeId !== undefined) updates.refereeId = refereeId;
    if (date !== undefined) updates.scheduledDate = date;
    if (time !== undefined) updates.scheduledTime = time;

    await updateDoc(doc(db, 'matches', matchId), updates);
  }

  async createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> {
    const id = `ann-${Date.now()}`;
    const newAnn: Announcement = {
      ...announcement,
      id,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'announcements', id), newAnn);
    return newAnn;
  }

  async createNotification(notification: Omit<WebNotification, 'id' | 'createdAt'>): Promise<WebNotification> {
    const id = `notif-${Date.now()}`;
    const newNotif: WebNotification = {
      ...notification,
      id,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'notifications', id), newNotif);
    return newNotif;
  }

  async markNotificationRead(id: string): Promise<void> {
    await updateDoc(doc(db, 'notifications', id), { isRead: true });
  }

  async markAllNotificationsRead(userId?: string): Promise<void> {
    const col = collection(db, 'notifications');
    const snap = await getDocs(col);
    const batch = writeBatch(db);
    snap.docs.forEach(d => {
      const data = d.data() as WebNotification;
      if (!userId || !data.recipientUserId || data.recipientUserId === userId) {
        batch.update(d.ref, { isRead: true });
      }
    });
    await batch.commit();
  }

  async createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
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

  async recordAttendance(record: AttendanceRecord): Promise<void> {
    await setDoc(doc(db, 'attendance_records', record.id), record);
  }

  async recordPayment(payment: PaymentRecord): Promise<void> {
    await setDoc(doc(db, 'payment_records', payment.id), payment);
  }
}

export const dbService = new DbService();
