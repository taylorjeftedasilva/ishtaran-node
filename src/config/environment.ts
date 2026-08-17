/**
 * Ambientes oficiais do projeto (CLAUDE.md): Local, Sandbox, Production. Ver {@link resolveBaseUrl}
 * — Sandbox/Production não têm DNS real provisionado ainda (SDK_CAPABILITY_SPEC.md §2).
 */
export enum Environment {
  Local = 'local',
  Sandbox = 'sandbox',
  Production = 'production',
}
