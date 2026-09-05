import {
  UserAccount,
  UserRole,
  OrganizationMembership,
  ClubMembership,
  PlayerProfile,
  Coach,
  Batch,
  AttendanceRecord,
  Tournament,
  Match,
  PaymentRecord,
  Announcement,
  AuditLog
} from '../types';

export interface AuthContext {
  currentUser: UserAccount;
  activeOrgId: string;
  activeClubId?: string;
  orgMemberships: OrganizationMembership[];
  clubMemberships: ClubMembership[];
}

/**
 * Centralized Authorization Service
 * Evaluates: ROLE + ORGANIZATION + CLUB + OWNERSHIP + ASSIGNMENT + RESOURCE RELATIONSHIP
 * 
 * Never makes decisions solely on role. Default is strict DENY.
 */
class AuthorizationService {
  /**
   * Super Admin has platform-global authority
   */
  private isSuperAdmin(ctx: AuthContext): boolean {
    return ctx.currentUser.currentRole === 'SUPER_ADMIN' || ctx.currentUser.roles.includes('SUPER_ADMIN');
  }

  /**
   * Check if user is an active member of the given organization
   */
  isOrgMember(orgId: string, ctx: AuthContext): boolean {
    if (this.isSuperAdmin(ctx)) return true;
    return ctx.orgMemberships.some(
      m => (m.orgId === orgId || m.organizationId === orgId) && m.status === 'ACTIVE'
    );
  }

  /**
   * Check if user is an active member of the given club with an authorized role
   */
  isClubMember(clubId: string, ctx: AuthContext, allowedRoles?: UserRole[]): boolean {
    if (this.isSuperAdmin(ctx)) return true;
    return ctx.clubMemberships.some(m => {
      if (m.clubId !== clubId || m.status !== 'ACTIVE') return false;
      if (!allowedRoles) return true;
      return allowedRoles.includes(m.role);
    });
  }

  /**
   * Check if user is a club owner/admin for the specific club
   */
  isClubAdminOrOwner(clubId: string, ctx: AuthContext): boolean {
    if (this.isSuperAdmin(ctx)) return true;
    return this.isClubMember(clubId, ctx, ['CLUB_OWNER', 'CLUB_ADMIN']);
  }

  // --- User / Account ---
  canViewUser(targetUser: UserAccount, ctx: AuthContext): boolean {
    if (this.isSuperAdmin(ctx)) return true;
    if (targetUser.id === ctx.currentUser.id) return true;
    // Club owner/admin can view users belonging to same club/org
    return this.isOrgMember(targetUser.orgId, ctx);
  }

  // --- Club ---
  canViewClub(club: { id: string; orgId: string }, ctx: AuthContext): boolean {
    if (this.isSuperAdmin(ctx)) return true;
    // User can view club if they are a member of the club, or member of parent org
    return this.isOrgMember(club.orgId, ctx);
  }

  canManageClub(club: { id: string; orgId: string }, ctx: AuthContext): boolean {
    if (this.isSuperAdmin(ctx)) return true;
    return this.isClubAdminOrOwner(club.id, ctx);
  }

  // --- Player Profile ---
  canViewPlayer(player: PlayerProfile, ctx: AuthContext): boolean {
    if (this.isSuperAdmin(ctx)) return true;

    // 1. Self: Player viewing own record
    const isSelf = 
      player.id === ctx.currentUser.linkedPlayerId ||
      player.playerId === ctx.currentUser.linkedPlayerId ||
      player.email?.toLowerCase() === ctx.currentUser.email.toLowerCase();
    if (isSelf) return true;

    // 2. Club staff (Owner, Admin, Coach): Can view players belonging to their authorized club
    if (player.clubId && this.isClubMember(player.clubId, ctx, ['CLUB_OWNER', 'CLUB_ADMIN', 'COACH'])) {
      return true;
    }

    // 3. Tournament Organizer: Can view players participating in tournaments owned by this organizer
    if (ctx.currentUser.currentRole === 'TOURNAMENT_ORGANIZER') {
      return true; // Limited public/competition view allowed
    }

    // 4. Referees: Can view players for assigned matches
    if (ctx.currentUser.currentRole === 'REFEREE') {
      return true;
    }

    // Default: cannot view private data of unrelated players
    return false;
  }

  canEditPlayer(player: PlayerProfile, ctx: AuthContext): boolean {
    if (this.isSuperAdmin(ctx)) return true;

    // Self can update limited profile attributes
    const isSelf = 
      player.id === ctx.currentUser.linkedPlayerId ||
      player.playerId === ctx.currentUser.linkedPlayerId;
    if (isSelf && ctx.currentUser.currentRole === 'PLAYER') {
      return true;
    }

    // Club Owner / Admin can manage players in their own club
    if (player.clubId && this.isClubAdminOrOwner(player.clubId, ctx)) {
      return true;
    }

    return false;
  }

  // --- Coach ---
  canViewCoach(coach: Coach, ctx: AuthContext): boolean {
    if (this.isSuperAdmin(ctx)) return true;
    return this.isClubMember(coach.clubId, ctx);
  }

  canManageCoach(coach: Coach, ctx: AuthContext): boolean {
    if (this.isSuperAdmin(ctx)) return true;
    return this.isClubAdminOrOwner(coach.clubId, ctx);
  }

  // --- Batches & Sessions ---
  canViewBatch(batch: Batch, ctx: AuthContext): boolean {
    if (this.isSuperAdmin(ctx)) return true;
    return this.isClubMember(batch.clubId, ctx);
  }

  canManageBatch(batch: Batch, ctx: AuthContext): boolean {
    if (this.isSuperAdmin(ctx)) return true;
    // Only Club Owner or Club Admin can create/edit batches
    return this.isClubAdminOrOwner(batch.clubId, ctx);
  }

  // --- Attendance ---
  canViewAttendance(record: AttendanceRecord, batch: Batch | undefined, ctx: AuthContext): boolean {
    if (this.isSuperAdmin(ctx)) return true;
    if (!batch) return false;
    return this.isClubMember(batch.clubId, ctx);
  }

  canEditAttendance(record: AttendanceRecord, batch: Batch | undefined, ctx: AuthContext): boolean {
    if (this.isSuperAdmin(ctx)) return true;
    if (!batch) return false;

    // Club Owner / Admin can edit attendance for their club
    if (this.isClubAdminOrOwner(batch.clubId, ctx)) return true;

    // Coach can edit attendance ONLY for their assigned batch (Assignment-based edit scope)
    if (ctx.currentUser.currentRole === 'COACH') {
      const isAssigned = 
        batch.coachId === ctx.currentUser.id || 
        batch.coachName.toLowerCase().includes(ctx.currentUser.name.toLowerCase());
      return isAssigned && this.isClubMember(batch.clubId, ctx, ['COACH']);
    }

    return false;
  }

  // --- Tournaments ---
  canViewTournament(tournament: Tournament, ctx: AuthContext): boolean {
    if (this.isSuperAdmin(ctx)) return true;
    if (tournament.isPublic) return true;

    // Tournament Owner / Organizer
    if (tournament.ownerUserId === ctx.currentUser.id || tournament.createdByUserId === ctx.currentUser.id) {
      return true;
    }

    // Associated club owner/admin
    if (tournament.clubId && this.isClubMember(tournament.clubId, ctx)) {
      return true;
    }

    // Associated organization
    if (this.isOrgMember(tournament.orgId, ctx)) {
      return true;
    }

    return false;
  }

  canManageTournament(tournament: Tournament, ctx: AuthContext): boolean {
    if (this.isSuperAdmin(ctx)) return true;

    // Strict Tournament Owner isolation: Only the owner/creator can manage
    const isOwner = tournament.ownerUserId === ctx.currentUser.id || tournament.createdByUserId === ctx.currentUser.id;
    return isOwner && (ctx.currentUser.currentRole === 'TOURNAMENT_ORGANIZER' || ctx.currentUser.roles.includes('TOURNAMENT_ORGANIZER'));
  }

  // --- Matches ---
  canViewMatch(match: Match, tournament: Tournament | undefined, ctx: AuthContext): boolean {
    if (this.isSuperAdmin(ctx)) return true;
    if (tournament && this.canViewTournament(tournament, ctx)) return true;

    // Assigned referee can view
    if (this.isMatchAssignedToUser(match, ctx.currentUser.id)) return true;

    // Participating player can view
    if (
      match.participant1Id === ctx.currentUser.linkedPlayerId ||
      match.participant2Id === ctx.currentUser.linkedPlayerId
    ) {
      return true;
    }

    return false;
  }

  /**
   * Only assigned referee, authorized tournament owner, or super admin can score a match
   */
  canScoreMatch(match: Match, tournament: Tournament | undefined, ctx: AuthContext): boolean {
    if (this.isSuperAdmin(ctx)) return true;

    // If Referee role: must be assigned to THIS match
    if (ctx.currentUser.currentRole === 'REFEREE') {
      return this.isMatchAssignedToUser(match, ctx.currentUser.id);
    }

    // Tournament Organizer: must own THIS tournament
    if (ctx.currentUser.currentRole === 'TOURNAMENT_ORGANIZER') {
      if (!tournament) return false;
      return this.canManageTournament(tournament, ctx);
    }

    return false;
  }

  /**
   * Verification of official results: Tournament Organizer or Super Admin only
   */
  canVerifyResult(match: Match, tournament: Tournament | undefined, ctx: AuthContext): boolean {
    if (this.isSuperAdmin(ctx)) return true;

    // A referee CANNOT verify their own match result as official
    if (ctx.currentUser.currentRole === 'REFEREE') {
      return false;
    }

    if (tournament && this.canManageTournament(tournament, ctx)) {
      return true;
    }

    return false;
  }

  private isMatchAssignedToUser(match: Match, userId: string): boolean {
    return (
      match.assignedRefereeId === userId ||
      match.refereeId === userId ||
      (Boolean(match.refereeName) && match.refereeName?.toLowerCase().includes(userId.toLowerCase()))
    );
  }

  // --- Payments ---
  canViewPayment(payment: PaymentRecord, ctx: AuthContext): boolean {
    if (this.isSuperAdmin(ctx)) return true;

    // Player viewing their own payment
    if (payment.playerId && payment.playerId === ctx.currentUser.linkedPlayerId) {
      return true;
    }
    if (payment.payerEmail?.toLowerCase() === ctx.currentUser.email.toLowerCase()) {
      return true;
    }

    // Club Owner / Admin viewing club payments
    if (payment.clubId && this.isClubAdminOrOwner(payment.clubId, ctx)) {
      return true;
    }

    return false;
  }

  canRecordPayment(clubId: string | undefined, ctx: AuthContext): boolean {
    if (this.isSuperAdmin(ctx)) return true;
    if (!clubId) return false;
    return this.isClubAdminOrOwner(clubId, ctx);
  }

  // --- Audit Logs ---
  canViewAuditLog(log: AuditLog, ctx: AuthContext): boolean {
    if (this.isSuperAdmin(ctx)) return true;

    // Tournament organizer: only audit logs for their own tournament
    if (log.tournamentId && ctx.currentUser.currentRole === 'TOURNAMENT_ORGANIZER') {
      return log.actorUserId === ctx.currentUser.id || log.actor === ctx.currentUser.id;
    }

    // Club Owner: only audit logs for their club
    if (log.clubId && this.isClubAdminOrOwner(log.clubId, ctx)) {
      return true;
    }

    return false;
  }

  // --- Announcements ---
  canViewAnnouncement(announcement: Announcement, ctx: AuthContext): boolean {
    if (this.isSuperAdmin(ctx)) return true;
    if (announcement.isPublic) return true;

    if (announcement.clubId && this.isClubMember(announcement.clubId, ctx)) {
      return true;
    }

    return true;
  }

  canPostAnnouncement(ctx: AuthContext, scope: { clubId?: string; tournamentId?: string }): boolean {
    if (this.isSuperAdmin(ctx)) return true;

    if (scope.clubId && this.isClubAdminOrOwner(scope.clubId, ctx)) {
      return true;
    }

    if (scope.tournamentId && (ctx.currentUser.currentRole === 'TOURNAMENT_ORGANIZER' || ctx.currentUser.roles.includes('TOURNAMENT_ORGANIZER'))) {
      return true;
    }

    return false;
  }
}

export const authorizationService = new AuthorizationService();
