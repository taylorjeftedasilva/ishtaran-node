import { Environment } from './environment.js';

/**
 * Base URLs centralizadas — nunca strings de URL espalhadas pelo SDK. {@link LOCAL} é o único
 * default real conhecido hoje (docker-compose local). Sandbox/Production não têm DNS real
 * provisionado ainda (terraform apply nunca rodou — ver SDK_CAPABILITY_SPEC.md §2): resolver essas
 * duas sem `baseUrl` explícito é um erro de configuração, nunca um fallback silencioso inventado.
 */
export const LOCAL_BASE_URL = 'http://localhost:8080';

export function resolveBaseUrl(environment: Environment, explicitBaseUrl: string | undefined): string {
  if (explicitBaseUrl) {
    return explicitBaseUrl;
  }
  if (environment === Environment.Local) {
    return LOCAL_BASE_URL;
  }
  throw new Error(
    `baseUrl explícito é obrigatório para Environment.${environment} — nenhuma URL real de ` +
      'Sandbox/Production foi provisionada ainda (ver SDK_CAPABILITY_SPEC.md §2). Configure ' +
      'IshtaranClientConfig.baseUrl explicitamente.',
  );
}
