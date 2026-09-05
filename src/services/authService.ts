import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  query,
  where
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import {
  UserAccount,
  UserRole,
  OrganizationMembership,
  ClubMembership
} from '../types';

export interface SessionState {
  firebaseUser: FirebaseUser | null;
  user: UserAccount | null;
  orgMemberships: OrganizationMembership[];
  clubMemberships: ClubMembership[];
  activeOrgId: string;
  activeClubId?: string;
  loading: boolean;
}

type AuthCallback = (state: SessionState) => void;

class AuthService {
  private state: SessionState = {
    firebaseUser: null,
    user: null,
    orgMemberships: [],
    clubMemberships: [],
    activeOrgId: '',
    activeClubId: undefined,
    loading: true
  };

  private listeners: AuthCallback[] = [];

  constructor() {
    this.initAuthListener();
  }

  private initAuthListener() {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        // Only clear if not in demo mode
        if (this.state.user && this.state.user.id.startsWith('demo-')) {
          this.updateState({ loading: false });
          return;
        }
        this.updateState({
          firebaseUser: null,
          user: null,
          orgMemberships: [],
          clubMemberships: [],
          activeOrgId: '',
          activeClubId: undefined,
          loading: false
        });
        return;
      }

      try {
        await this.loadUserProfileAndMemberships(firebaseUser);
      } catch (err) {
        console.error('Failed to load user profile after auth state change:', err);
        this.updateState({
          firebaseUser,
          user: null,
          orgMemberships: [],
          clubMemberships: [],
          activeOrgId: '',
          activeClubId: undefined,
          loading: false
        });
      }
    });
  }

  /**
   * Loads the authoritative user record and memberships from Firestore
   */
  async loadUserProfileAndMemberships(firebaseUser: FirebaseUser, preferredRole?: UserRole): Promise<void> {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    let userSnap;
    try {
      userSnap = await getDoc(userDocRef);
    } catch (e) {
      console.warn('Could not read user profile from Firestore:', e);
    }

    let appUser: UserAccount;

    if (userSnap && userSnap.exists()) {
      appUser = userSnap.data() as UserAccount;
      if (preferredRole && appUser.currentRole !== preferredRole) {
        appUser.currentRole = preferredRole;
        if (!appUser.roles.includes(preferredRole)) {
          appUser.roles.push(preferredRole);
        }
        try {
          await setDoc(userDocRef, appUser, { merge: true });
        } catch {}
      }
    } else {
      // Create initial application user profile in Firestore
      const email = firebaseUser.email || 'user@sportos.app';
      const name = firebaseUser.displayName || email.split('@')[0];
      const defaultOrgId = 'org-1';
      const role = preferredRole || 'TOURNAMENT_ORGANIZER';

      appUser = {
        id: firebaseUser.uid,
        name,
        email,
        roles: [role],
        currentRole: role,
        orgId: defaultOrgId,
        avatarUrl: firebaseUser.photoURL || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80`
      };

      try {
        await setDoc(userDocRef, appUser);

        // Create initial organization membership
        const memId = `mem-${firebaseUser.uid}-${defaultOrgId}`;
        const membership: OrganizationMembership = {
          id: memId,
          orgId: defaultOrgId,
          organizationId: defaultOrgId,
          userId: firebaseUser.uid,
          role,
          roles: [role],
          status: 'ACTIVE',
          joinedAt: new Date().toISOString().split('T')[0]
        };
        await setDoc(doc(db, 'organization_memberships', memId), membership);

        // If Club Owner or Coach, also seed club membership
        if (role === 'CLUB_OWNER' || role === 'COACH') {
          const clubMemId = `cmem-${firebaseUser.uid}-club-1`;
          const clubMembership: ClubMembership = {
            id: clubMemId,
            organizationId: defaultOrgId,
            clubId: 'club-1',
            userId: firebaseUser.uid,
            role,
            status: 'ACTIVE',
            createdAt: new Date().toISOString().split('T')[0]
          };
          await setDoc(doc(db, 'club_memberships', clubMemId), clubMembership);
        }
      } catch (e) {
        console.warn('Could not write new user profile to Firestore:', e);
      }
    }

    // Load organization memberships
    let orgMemberships: OrganizationMembership[] = [];
    try {
      const orgQuery = query(
        collection(db, 'organization_memberships'),
        where('userId', '==', firebaseUser.uid)
      );
      const orgSnap = await getDocs(orgQuery);
      orgMemberships = orgSnap.docs.map(d => d.data() as OrganizationMembership);
    } catch (e) {
      console.warn('Could not query organization_memberships, using default membership:', e);
    }

    if (orgMemberships.length === 0) {
      orgMemberships = [{
        id: `mem-${appUser.id}-${appUser.orgId}`,
        orgId: appUser.orgId,
        organizationId: appUser.orgId,
        userId: appUser.id,
        role: appUser.currentRole,
        roles: appUser.roles,
        status: 'ACTIVE',
        joinedAt: new Date().toISOString().split('T')[0]
      }];
    }

    // Load club memberships
    let clubMemberships: ClubMembership[] = [];
    try {
      const clubQuery = query(
        collection(db, 'club_memberships'),
        where('userId', '==', firebaseUser.uid)
      );
      const clubSnap = await getDocs(clubQuery);
      clubMemberships = clubSnap.docs.map(d => d.data() as ClubMembership);
    } catch (e) {
      console.warn('Could not query club_memberships:', e);
    }

    // If club memberships is empty but user is club owner/coach, default to club-1
    if (clubMemberships.length === 0 && (appUser.currentRole === 'CLUB_OWNER' || appUser.currentRole === 'COACH')) {
      clubMemberships = [{
        id: `cmem-${appUser.id}-club-1`,
        organizationId: appUser.orgId,
        clubId: 'club-1',
        userId: appUser.id,
        role: appUser.currentRole,
        status: 'ACTIVE',
        createdAt: new Date().toISOString().split('T')[0]
      }];
    }

    // Determine active organization (must be one the user is a member of)
    const activeOrgId = orgMemberships.length > 0
      ? (orgMemberships.some(m => m.orgId === appUser.orgId || m.organizationId === appUser.orgId) ? appUser.orgId : (orgMemberships[0].orgId || orgMemberships[0].organizationId || 'org-1'))
      : appUser.orgId;

    // Determine active club
    const activeClubId = clubMemberships.length > 0
      ? clubMemberships.find(m => m.organizationId === activeOrgId)?.clubId || clubMemberships[0].clubId
      : (appUser.clubId || 'club-1');

    this.updateState({
      firebaseUser,
      user: appUser,
      orgMemberships,
      clubMemberships,
      activeOrgId,
      activeClubId,
      loading: false
    });
  }

  getState(): SessionState {
    return this.state;
  }

  subscribe(callback: AuthCallback): () => void {
    this.listeners.push(callback);
    callback(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private updateState(partial: Partial<SessionState>) {
    this.state = { ...this.state, ...partial };
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  /**
   * Google Sign-In with Popup (Recommended for Firebase in AI Studio)
   */
  async loginWithGoogle(preferredRole?: UserRole): Promise<UserAccount> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    await this.loadUserProfileAndMemberships(cred.user, preferredRole);
    if (!this.state.user) {
      throw new Error('Failed to load user profile after Google sign-in.');
    }
    return this.state.user;
  }

  /**
   * Real Email / Password Sign In
   */
  async loginWithEmail(email: string, password: string): Promise<UserAccount> {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      await this.loadUserProfileAndMemberships(cred.user);
      if (!this.state.user) {
        throw new Error('Failed to load user profile after authentication.');
      }
      return this.state.user;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('auth/operation-not-allowed')) {
        throw new Error(
          'Email/Password sign-in is disabled in your Firebase Console. Please sign in with Google above, or enable Email/Password provider in the Firebase Authentication console.'
        );
      }
      throw err;
    }
  }

  /**
   * Real User Registration
   */
  async registerWithEmail(
    name: string,
    email: string,
    password: string,
    role: UserRole,
    organizationId: string = 'org-1',
    clubId?: string,
    sport?: string
  ): Promise<UserAccount> {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name });

      const newUser: UserAccount = {
        id: cred.user.uid,
        name,
        email: email.trim(),
        roles: [role],
        currentRole: role,
        orgId: organizationId,
        clubId,
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`
      };

      // Save user profile in Firestore
      await setDoc(doc(db, 'users', cred.user.uid), newUser);

      // Save Organization Membership
      const orgMemId = `mem-${cred.user.uid}-${organizationId}`;
      const orgMembership: OrganizationMembership = {
        id: orgMemId,
        orgId: organizationId,
        organizationId,
        userId: cred.user.uid,
        role,
        roles: [role],
        status: 'ACTIVE',
        joinedAt: new Date().toISOString().split('T')[0]
      };
      await setDoc(doc(db, 'organization_memberships', orgMemId), orgMembership);

      // Save Club Membership if club was chosen
      if (clubId) {
        const clubMemId = `cmem-${cred.user.uid}-${clubId}`;
        const clubMembership: ClubMembership = {
          id: clubMemId,
          organizationId,
          clubId,
          userId: cred.user.uid,
          role,
          status: 'ACTIVE',
          createdAt: new Date().toISOString().split('T')[0]
        };
        await setDoc(doc(db, 'club_memberships', clubMemId), clubMembership);
      }

      await this.loadUserProfileAndMemberships(cred.user, role);
      if (!this.state.user) {
        throw new Error('Failed to initialize registered user account.');
      }
      return this.state.user;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('auth/operation-not-allowed')) {
        throw new Error(
          'Email/Password registration is disabled in your Firebase Console. Please sign in with Google above, or enable Email/Password provider in the Firebase Authentication console.'
        );
      }
      throw err;
    }
  }

  /**
   * Fast Demo / Sandbox Profile Login
   * Guarantees testing access across all 6 roles even before console providers are enabled.
   */
  async loginAsDemoUser(
    role: UserRole,
    email: string,
    name: string,
    orgId: string = 'org-1',
    clubId: string = 'club-1'
  ): Promise<UserAccount> {
    // Try signing anonymously first to acquire a genuine Firebase Auth token if anonymous is enabled
    let firebaseUser: FirebaseUser | null = auth.currentUser;
    if (!firebaseUser) {
      try {
        const anonCred = await signInAnonymously(auth);
        firebaseUser = anonCred.user;
      } catch {
        // If anonymous is also not enabled, we continue with standard isolated profile UID
      }
    }

    const uid = firebaseUser?.uid || `demo-${role.toLowerCase()}-${email.split('@')[0].replace(/[^a-z0-9]/g, '')}`;

    const appUser: UserAccount = {
      id: uid,
      name,
      email,
      roles: [role],
      currentRole: role,
      orgId,
      clubId: role === 'CLUB_OWNER' || role === 'COACH' ? clubId : undefined,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`
    };

    const orgMemberships: OrganizationMembership[] = [{
      id: `mem-${uid}-${orgId}`,
      orgId,
      organizationId: orgId,
      userId: uid,
      role,
      roles: [role],
      status: 'ACTIVE',
      joinedAt: new Date().toISOString().split('T')[0]
    }];

    const clubMemberships: ClubMembership[] = (role === 'CLUB_OWNER' || role === 'COACH') ? [{
      id: `cmem-${uid}-${clubId}`,
      organizationId: orgId,
      clubId,
      userId: uid,
      role,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0]
    }] : [];

    // Attempt to persist profile to Firestore so other views can read it
    try {
      await setDoc(doc(db, 'users', uid), appUser, { merge: true });
    } catch {}

    this.updateState({
      firebaseUser,
      user: appUser,
      orgMemberships,
      clubMemberships,
      activeOrgId: orgId,
      activeClubId: clubId,
      loading: false
    });

    return appUser;
  }

  /**
   * Real Sign Out
   */
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch {}
    this.updateState({
      firebaseUser: null,
      user: null,
      orgMemberships: [],
      clubMemberships: [],
      activeOrgId: '',
      activeClubId: undefined,
      loading: false
    });
  }

  /**
   * Switch Active Organization Context
   */
  switchActiveOrganization(orgId: string): boolean {
    if (!this.state.user) return false;
    const isSuperAdmin = this.state.user.currentRole === 'SUPER_ADMIN';

    const isMember = isSuperAdmin || this.state.orgMemberships.some(m => m.orgId === orgId || m.organizationId === orgId);
    if (!isMember) {
      console.warn(`Access Denied: User is not an active member of organization ${orgId}`);
      return false;
    }

    const availableClubs = this.state.clubMemberships.filter(m => m.organizationId === orgId);
    const newClubId = availableClubs.length > 0 ? availableClubs[0].clubId : undefined;

    this.updateState({
      activeOrgId: orgId,
      activeClubId: newClubId
    });

    return true;
  }

  /**
   * Switch Active Club Context
   */
  switchActiveClub(clubId: string): boolean {
    if (!this.state.user) return false;
    const isSuperAdmin = this.state.user.currentRole === 'SUPER_ADMIN';

    const isMember = isSuperAdmin || this.state.clubMemberships.some(m => m.clubId === clubId);
    if (!isMember) {
      console.warn(`Access Denied: User is not an active member of club ${clubId}`);
      return false;
    }

    this.updateState({ activeClubId: clubId });
    return true;
  }
}

export const authService = new AuthService();
