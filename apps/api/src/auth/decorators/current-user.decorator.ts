import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '@novanode/shared';

/** Injects the authenticated user (JWT payload) into a controller handler. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: JwtPayload }>();
    return request.user;
  },
);
