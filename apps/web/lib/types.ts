import { InstallationKind, InstallationStatus, NodeStatus, SshAuthType, UserRole } from '@novanode/shared';

export { InstallationKind, InstallationStatus, NodeStatus, SshAuthType, UserRole };

/** SSH fields shared between node list/detail (secret is never returned). */
export interface NodeSsh {
  sshHost: string | null;
  sshPort: number;
  sshUser: string | null;
  sshAuthType: SshAuthType | null;
  wingsInstalled: boolean;
}

/** A node as returned by `GET /nodes` (list view, with allocation count). */
export interface NodeRow extends NodeSsh {
  id: string;
  name: string;
  fqdn: string;
  location: string | null;
  token: string | null;
  status: NodeStatus;
  createdAt: string;
  updatedAt: string;
  _count: { allocations: number };
}

/** A node as returned by `GET /nodes/:id` (detail, with allocations). */
export interface NodeDetail extends NodeSsh {
  id: string;
  name: string;
  fqdn: string;
  location: string | null;
  token: string | null;
  status: NodeStatus;
  createdAt: string;
  updatedAt: string;
  allocations: Allocation[];
}

/** A user as returned by the `/users` endpoints (never includes the password hash). */
export interface UserRow {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** A port allocation as returned by `GET /allocations`. */
export interface Allocation {
  id: string;
  nodeId: string;
  ip: string;
  port: number;
  alias: string | null;
}

/** An installer job as returned by `GET /installer/logs`. */
export interface InstallationRow {
  id: string;
  targetIp: string;
  nodeId: string | null;
  kind: InstallationKind;
  service: string;
  os: string | null;
  status: InstallationStatus;
  createdAt: string;
  updatedAt: string;
}

/** Installer job detail (with streamed log) from `GET /installer/logs/:id`. */
export interface InstallationDetail extends InstallationRow {
  log: string | null;
}
