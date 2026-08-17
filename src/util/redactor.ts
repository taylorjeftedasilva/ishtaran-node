/**
 * Mascaramento central de segredos para log/toString/mensagens de erro — nunca o valor bruto.
 * Formato genérico (4 primeiros + **** + 4 últimos): a API Key real do Ishtaran não tem prefixo de
 * ambiente (Base64 puro de 32 bytes — ver SDK_CAPABILITY_SPEC.md §12.5), então este SDK nunca
 * assume um prefixo tipo `sk_live_` que não existe de verdade.
 */
export function mask(secret: string | undefined | null): string {
  if (secret === undefined || secret === null) {
    return 'null';
  }
  if (secret.length <= 8) {
    return '****';
  }
  return `${secret.slice(0, 4)}****${secret.slice(-4)}`;
}

const SENSITIVE_HEADERS = new Set(['authorization', 'x-api-key']);

export function isSensitiveHeader(headerName: string): boolean {
  return SENSITIVE_HEADERS.has(headerName.toLowerCase());
}
