/** Node connectivity / health status. */
export enum NodeStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  UNKNOWN = 'UNKNOWN',
}

/** SSH authentication method for a node (used by installer / wings / monitoring). */
export enum SshAuthType {
  PASSWORD = 'PASSWORD',
  KEY = 'KEY',
}

/** High-level installer action, mirrors the `InstallationKind` DB enum. */
export enum InstallationKind {
  PANEL = 'PANEL',
  WINGS = 'WINGS',
  UPDATE = 'UPDATE',
  REPAIR = 'REPAIR',
  SERVICE = 'SERVICE',
}

/** Installer / installation job status. */
export enum InstallationStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

/** Services that the installer can provision. */
export enum InstallableService {
  DOCKER = 'DOCKER',
  MARIADB = 'MARIADB',
  POSTGRESQL = 'POSTGRESQL',
  REDIS = 'REDIS',
  NGINX = 'NGINX',
  PANEL = 'PANEL',
  WINGS = 'WINGS',
}

/** Standard API envelope returned by every NovaNode endpoint. */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/** Pagination metadata for list endpoints. */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

/** JWT access-token payload shape. */
export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: string;
}

/** Aggregated stats shown on the dashboard. */
export interface DashboardStats {
  totalNodes: number;
  totalServers: number;
  totalAllocations: number;
  onlineNodes: number;
  offlineNodes: number;
  cpuUsage: number;
  ramUsage: number;
  diskUsage: number;
}
