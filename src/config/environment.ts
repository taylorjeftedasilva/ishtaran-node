/**
 * Ambientes oficiais do projeto (CLAUDE.md): Local, Sandbox, Production. Ver {@link resolveBaseUrl}
 * -- Sandbox/Production don't have real DNS provisioned yet (SDK_CAPABILITY_SPEC.md §2).
 */
export enum Environment {
  Local = 'local',
  Sandbox = 'sandbox',
  Production = 'production',
}
