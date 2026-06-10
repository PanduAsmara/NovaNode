import 'server-only';
import { cache } from 'react';
import { roleSatisfies, UserRole } from '@novanode/shared';
import { serverApi } from './server-api';

export interface Profile {
  name: string;
  email: string;
  role: UserRole;
}

/**
 * Current user's profile. Wrapped in React `cache` so multiple callers within
 * the same request (layout + page) share a single API round-trip.
 */
export const getProfile = cache((): Promise<Profile> => serverApi<Profile>('/auth/profile'));

/** True when the role can perform ADMIN-level writes (OWNER or ADMIN). */
export function canWrite(role: UserRole): boolean {
  return roleSatisfies(role, UserRole.ADMIN);
}
