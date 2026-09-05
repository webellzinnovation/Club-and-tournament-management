import { UserAccount, UserRole, OrganizationMembership } from '../types';
import { dbService, SEED_ORG_2, SEED_CLUB_3, SEED_USER_ORG2_OWNER } from './dbService';
import { SEED_USERS } from '../data/seedData';

export interface Session {
  token: string;
  user: UserAccount;
  activeOrgId: string;
  activeClubId?: string;
  permissions: string[];
  expiresAt: string;
}

export type PermissionAction =
  | 'VIEW_ALL_ORGS'
  | 'MANAGE_ORG'
  | 'MANAGE_CLUB'
  | 'MANAGE_PLAYERS'
  | 'MANAGE_ATTENDANCE'
  | 'MANAGE_MEMBERSHIPS'
  | 'MANAGE_PAYMENTS'
  | 'MANAGE_TOURNAMENTS'
  | 'OFFICIATE_MATCH'
  | 'VERIFY_RESULT'
  | 'CLAIM_PLAYER_PROFILE'
  | 'POST_ANNOUNCEMENT';

const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  SUPER_ADMIN: [
    'VIEW_ALL_ORGS',
    'MANAGE_ORG',
    'MANAGE_CLUB',
    'MANAGE_PLAYERS',
    'MANAGE_ATTENDANCE',
    'MANAGE_MEMBERSHIPS',
    'MANAGE_PAYMENTS',
    'MANAGE_TOURNAMENTS',
    'OFFICIATE_MATCH',
    'VERIFY_RESULT',
    'CLAIM_PLAYER_PROFILE',
    'POST_ANNOUNCEMENT'
  ],
  CLUB_OWNER: [
    'MANAGE_ORG',
    'MANAGE_CLUB',
    'MANAGE_PLAYERS',
    'MANAGE_ATTENDANCE',
    'MANAGE_MEMBERSHIPS',
    'MANAGE_PAYMENTS',
    'MANAGE_TOURNAMENTS',
    'POST_ANNOUNCEMENT'
  ],
  CLUB_ADMIN: [
    'MANAGE_CLUB',
    'MANAGE_PLAYERS',
    'MANAGE_ATTENDANCE',
    'MANAGE_MEMBERSHIPS',
    'MANAGE_TOURNAMENTS',
    'POST_ANNOUNCEMENT'
  ],
  TOURNAMENT_ORGANIZER: [
    'MANAGE_TOURNAMENTS',
    'OFFICIATE_MATCH',
    'VERIFY_RESULT',
    'POST_ANNOUNCEMENT'
  ],
  REFEREE: [
    'OFFICIATE_MATCH'
  ],
  COACH: [
    'MANAGE_PLAYERS',
    'MANAGE_ATTENDANCE'
  ],
  PLAYER: [
    'CLAIM_PLAYER_PROFILE'
  ]
};

class AuthService {
  private currentSession: Session | null = null;
  private subscribers: ((session: Session | null) => void)[] = [];

  constructor() {
    this.initDefaultSession();
  }

  private initDefaultSession() {
    // Initialize default authenticated session for Anand Natarajan (Director / Organizer)
    const defaultUser = SEED_USERS[0];
    this.createSessionForUser(defaultUser);
  }

  getSession(): Session | null {
    return this.currentSession;
  }

  getCurrentUser(): UserAccount | null {
    return this.currentSession?.user ?? null;
  }

  subscribe(callback: (session: Session | null) => void): () => void {
    this.subscribers.push(callback);
    callback(this.currentSession);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== callback);
    };
  }

  private notify() {
    for (const sub of this.subscribers) {
      sub(this.currentSession);
    }
  }

  createSessionForUser(user: UserAccount, targetRole?: UserRole): Session {
    const role = targetRole && user.roles.includes(targetRole) ? targetRole : user.currentRole;
    const permissions = ROLE_PERMISSIONS[role] || [];
    
    const session: Session = {
      token: `sess_${user.id}_${Date.now()}`,
      user: { ...user, currentRole: role },
      activeOrgId: user.orgId,
      activeClubId: user.orgId === 'org-2' ? 'club-3' : 'club-1',
      permissions,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    this.currentSession = session;
    this.notify();
    return session;
  }

  login(email: string): { success: boolean; session?: Session; message?: string } {
    const allUsers = [...SEED_USERS, SEED_USER_ORG2_OWNER];
    const found = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      return { success: false, message: 'Invalid credentials or user not registered in organization.' };
    }
    const session = this.createSessionForUser(found);
    return { success: true, session };
  }

  logout() {
    this.currentSession = null;
    this.notify();
  }

  /**
   * RBAC check: Checks if active user has permission
   */
  hasPermission(action: PermissionAction): boolean {
    if (!this.currentSession) return false;
    if (this.currentSession.user.currentRole === 'SUPER_ADMIN') return true;
    return this.currentSession.permissions.includes(action);
  }

  /**
   * Multi-tenancy isolation boundary check:
   * Verifies if the authenticated session can access an entity belonging to a given orgId
   */
  canAccessOrg(orgId: string): boolean {
    if (!this.currentSession) return false;
    if (this.currentSession.user.currentRole === 'SUPER_ADMIN') return true;
    return this.currentSession.activeOrgId === orgId;
  }

  /**
   * Multi-tenancy isolation boundary check for club data
   */
  canAccessClub(clubId: string, clubOrgId?: string): boolean {
    if (!this.currentSession) return false;
    if (this.currentSession.user.currentRole === 'SUPER_ADMIN') return true;
    if (clubOrgId) {
      return this.canAccessOrg(clubOrgId);
    }
    // Club 3 belongs to Org 2; Club 1 & 2 belong to Org 1
    if (clubId === 'club-3') return this.currentSession.activeOrgId === 'org-2';
    return this.currentSession.activeOrgId === 'org-1';
  }

  /**
   * Developer Quick Switcher (Explicitly isolated for demo / testing):
   * Authenticates as one of the seed users across roles and organizations
   */
  devQuickSwitchUser(userId: string, targetRole?: UserRole): Session | null {
    const allUsers = [...SEED_USERS, SEED_USER_ORG2_OWNER];
    const user = allUsers.find(u => u.id === userId);
    if (!user) return null;
    return this.createSessionForUser(user, targetRole);
  }
}

export const authService = new AuthService();
