'use server';

import { revalidatePath } from 'next/cache';
import { InstallationKind } from '@novanode/shared';
import { serverApi } from '@/lib/server-api';
import type { InstallationRow } from '@/lib/types';

export interface InstallerState {
  error: string | null;
  message: string | null;
  installationId: string | null;
}

const ENDPOINT: Record<InstallationKind, string> = {
  [InstallationKind.PANEL]: '/installer/panel',
  [InstallationKind.WINGS]: '/installer/wings',
  [InstallationKind.UPDATE]: '/installer/update',
  [InstallationKind.REPAIR]: '/installer/repair',
  [InstallationKind.SERVICE]: '/installer/panel',
};

function clean(value: FormDataEntryValue | null): string {
  return String(value ?? '').trim();
}

export async function startInstall(
  _prev: InstallerState,
  formData: FormData,
): Promise<InstallerState> {
  const kind = clean(formData.get('kind')) as InstallationKind;
  const endpoint = ENDPOINT[kind];
  if (!endpoint) {
    return { error: 'Aksi tidak valid.', message: null, installationId: null };
  }

  const os = clean(formData.get('os'));
  const mode = clean(formData.get('mode')); // 'node' | 'manual'

  // Build the request body for either a saved node or ad-hoc SSH creds.
  let payload: Record<string, unknown>;
  if (mode === 'node') {
    const nodeId = clean(formData.get('nodeId'));
    if (!nodeId) return { error: 'Pilih node target.', message: null, installationId: null };
    payload = { os, nodeId };
  } else {
    const host = clean(formData.get('sshHost'));
    const user = clean(formData.get('sshUser'));
    const secret = clean(formData.get('sshSecret'));
    if (!host || !user || !secret) {
      return { error: 'Host, user, dan password/key SSH wajib diisi.', message: null, installationId: null };
    }
    const portRaw = clean(formData.get('sshPort'));
    const port = portRaw ? Number.parseInt(portRaw, 10) : undefined;
    payload = {
      os,
      ip: clean(formData.get('ip')) || host,
      ssh: { host, port, user, authType: clean(formData.get('sshAuthType')) || 'PASSWORD', secret },
    };
  }

  try {
    const res = await serverApi<InstallationRow>(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    revalidatePath('/installer');
    return { error: null, message: `Job ${kind} dibuat untuk ${res.targetIp}.`, installationId: res.id };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Gagal memulai instalasi',
      message: null,
      installationId: null,
    };
  }
}
