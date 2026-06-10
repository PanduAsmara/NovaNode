import { InstallableService, type SupportedOS, SUPPORTED_OS } from '@novanode/shared';
import {
  phpStep,
  type ScriptStep,
  serviceScript,
  SYSTEM_REPAIR,
  SYSTEM_UPDATE,
} from './scripts';

export interface InstallTarget {
  ip: string;
  os: SupportedOS;
}

/** Legacy lightweight step shape (no script body). Kept for back-compat. */
export interface InstallStep {
  service: InstallableService;
  description: string;
}

/** High-level installer actions, mirroring the `InstallationKind` DB enum. */
export type InstallKind = 'PANEL' | 'WINGS' | 'UPDATE' | 'REPAIR' | 'SERVICE';

export interface BuildPlanInput {
  os: SupportedOS;
  kind: InstallKind;
  /** Services to install for the SERVICE kind (ignored by the other kinds). */
  services?: InstallableService[];
}

function assertSupportedOS(os: SupportedOS): void {
  if (!SUPPORTED_OS.includes(os)) {
    throw new Error(`Unsupported OS: ${os}`);
  }
}

/**
 * Deployment engine (Phase 2).
 *
 * Produces an ordered list of idempotent provisioning steps — each carrying a
 * runnable bash `script` — that the API's BullMQ worker streams over SSH to the
 * target host (One-Click Install / Update / Repair).
 */
export function buildPlan(input: BuildPlanInput): ScriptStep[] {
  assertSupportedOS(input.os);
  const { os, kind } = input;

  switch (kind) {
    case 'PANEL':
      // Full panel stack: webserver, database, cache, PHP toolchain, then panel.
      return [
        serviceScript(InstallableService.NGINX, os),
        serviceScript(InstallableService.MARIADB, os),
        serviceScript(InstallableService.REDIS, os),
        phpStep(os),
        serviceScript(InstallableService.PANEL, os),
      ];
    case 'WINGS':
      // Wings requires Docker.
      return [
        serviceScript(InstallableService.DOCKER, os),
        serviceScript(InstallableService.WINGS, os),
      ];
    case 'UPDATE':
      return [SYSTEM_UPDATE];
    case 'REPAIR':
      return [SYSTEM_REPAIR];
    case 'SERVICE': {
      const services = input.services ?? [];
      if (services.length === 0) {
        throw new Error('No services selected for SERVICE installation');
      }
      return services.map((service) => serviceScript(service, os));
    }
    default:
      throw new Error(`Unknown install kind: ${kind as string}`);
  }
}

/**
 * Back-compat plan: returns the lightweight {service, description} list for a
 * set of services (no script bodies). New code should prefer {@link buildPlan}.
 */
export function planInstallation(
  target: InstallTarget,
  services: InstallableService[],
): InstallStep[] {
  assertSupportedOS(target.os);
  return services.map((service) => {
    const step = serviceScript(service, target.os);
    return { service, description: `${step.description} on ${target.ip} (${target.os})` };
  });
}

export { InstallableService };
export type { ScriptStep } from './scripts';
