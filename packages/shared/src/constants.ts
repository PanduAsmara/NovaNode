/** Global product constants for NovaNode. */
export const APP_NAME = 'NovaNode';
export const APP_FOUNDER = 'PanduAsmara';
export const APP_CREDIT = 'Created by PanduAsmara';

export const API_PREFIX = '/api/v1';

/** Supported operating systems for the installer. */
export const SUPPORTED_OS = ['Ubuntu 22.04', 'Ubuntu 24.04', 'Debian 12'] as const;
export type SupportedOS = (typeof SUPPORTED_OS)[number];
