/**
 * User roles for NovaNode RBAC.
 * The first registered user (via Setup Wizard) becomes OWNER.
 */
export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  VIEWER = 'VIEWER',
}

/** Ordered from highest privilege to lowest. */
export const ROLE_HIERARCHY: UserRole[] = [
  UserRole.OWNER,
  UserRole.ADMIN,
  UserRole.STAFF,
  UserRole.VIEWER,
];

/**
 * Returns true if `role` has at least the privilege level of `required`.
 * OWNER satisfies every requirement; VIEWER only satisfies VIEWER.
 */
export function roleSatisfies(role: UserRole, required: UserRole): boolean {
  return ROLE_HIERARCHY.indexOf(role) <= ROLE_HIERARCHY.indexOf(required);
}
