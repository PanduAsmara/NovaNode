import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@novanode/shared';

export const ROLES_KEY = 'roles';

/** Restricts a route to the given roles (evaluated by RolesGuard). */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
