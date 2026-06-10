import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload, UserRole, roleSatisfies } from '@novanode/shared';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Enforces @Roles(...) using the role hierarchy from @novanode/shared.
 * A user passes if their role satisfies AT LEAST ONE of the required roles.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const { user } = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    if (!user) throw new ForbiddenException('Missing authenticated user');

    const userRole = user.role as UserRole;
    const allowed = required.some((r) => roleSatisfies(userRole, r));
    if (!allowed) throw new ForbiddenException('Insufficient role');
    return true;
  }
}
