import { Environment } from './environment.js';

/**
 * Centralized base URLs -- never URL strings scattered across the SDK. {@link LOCAL_BASE_URL} and
 * {@link SANDBOX_BASE_URL} are real known defaults today. {@link SANDBOX_BASE_URL} points at the
 * canonical `sandbox-api.ishtaran.com` domain (Cloud Run Domain Mapping, live since 2026-08-25 --
 * the raw Cloud Run URL from the 2026-08-24 deploy still works but is no longer advertised).
 * Production does not have real infrastructure provisioned yet (terraform apply has never run
 * against it): resolving it without an explicit `baseUrl` is a configuration error, never an
 * invented silent fallback.
 */
export const LOCAL_BASE_URL = 'http://localhost:8080';
export const SANDBOX_BASE_URL = 'https://sandbox-api.ishtaran.com';

export function resolveBaseUrl(environment: Environment, explicitBaseUrl: string | undefined): string {
  if (explicitBaseUrl) {
    return explicitBaseUrl;
  }
  if (environment === Environment.Local) {
    return LOCAL_BASE_URL;
  }
  if (environment === Environment.Sandbox) {
    return SANDBOX_BASE_URL;
  }
  throw new Error(
    `An explicit baseUrl is required for Environment.${environment} -- no real Production ` +
      'URL has been provisioned yet (see SDK_CAPABILITY_SPEC.md §2). Configure ' +
      'IshtaranClientConfig.baseUrl explicitly.',
  );
}
