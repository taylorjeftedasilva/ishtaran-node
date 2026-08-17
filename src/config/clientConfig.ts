import { Environment } from './environment.js';
import { resolveBaseUrl } from './endpoints.js';
import { RetryPolicy, defaultRetryPolicy } from './retryPolicy.js';
import { mask } from '../util/redactor.js';
import { DEFAULT_USER_AGENT } from '../util/userAgent.js';

export interface IshtaranClientConfigInput {
  apiKey?: string;
  environment?: Environment;
  baseUrl?: string;
  connectTimeoutMs?: number;
  requestTimeoutMs?: number;
  retryPolicy?: RetryPolicy;
  userAgent?: string;
  enableLogging?: boolean;
  /** Nunca usar contra Sandbox/Production — lança em {@link buildClientConfig} se combinado com outro Environment. */
  allowInsecureTlsForLocalDevelopment?: boolean;
}

export interface IshtaranClientConfig {
  readonly apiKey?: string;
  readonly environment: Environment;
  readonly baseUrl: string;
  readonly connectTimeoutMs: number;
  readonly requestTimeoutMs: number;
  readonly retryPolicy: RetryPolicy;
  readonly userAgent: string;
  readonly loggingEnabled: boolean;
  readonly allowInsecureTlsForLocalDevelopment: boolean;
}

/**
 * Fábrica única de configuração — fonte de verdade de defaults (baseUrl/apiKey/timeout/
 * environment/userAgent/retryPolicy), nunca dispersa entre resources individuais.
 */
export function buildClientConfig(input: IshtaranClientConfigInput): IshtaranClientConfig {
  const environment = input.environment ?? Environment.Local;
  const baseUrl = resolveBaseUrl(environment, input.baseUrl);
  const allowInsecureTlsForLocalDevelopment = input.allowInsecureTlsForLocalDevelopment ?? false;

  if (allowInsecureTlsForLocalDevelopment && environment !== Environment.Local) {
    throw new Error(
      'allowInsecureTlsForLocalDevelopment só pode ser usado com Environment.Local — nunca contra Sandbox/Production.',
    );
  }

  return {
    apiKey: input.apiKey,
    environment,
    baseUrl,
    connectTimeoutMs: input.connectTimeoutMs ?? 5000,
    requestTimeoutMs: input.requestTimeoutMs ?? 30000,
    retryPolicy: input.retryPolicy ?? defaultRetryPolicy(),
    userAgent: input.userAgent ?? DEFAULT_USER_AGENT,
    loggingEnabled: input.enableLogging ?? false,
    allowInsecureTlsForLocalDevelopment,
  };
}

export function describeConfig(config: IshtaranClientConfig): string {
  return (
    `IshtaranClientConfig{baseUrl=${config.baseUrl}, environment=${config.environment}, ` +
    `apiKey=${mask(config.apiKey)}, connectTimeoutMs=${config.connectTimeoutMs}, ` +
    `requestTimeoutMs=${config.requestTimeoutMs}, userAgent=${config.userAgent}}`
  );
}
