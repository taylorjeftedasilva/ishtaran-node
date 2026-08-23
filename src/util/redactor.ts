/**
 * Central secret masking for log/toString/error messages -- never the raw value. Generic format
 * (first 4 + **** + last 4): the real Ishtaran API Key has no environment prefix (pure Base64 of
 * 32 bytes -- see SDK_CAPABILITY_SPEC.md §12.5), so this SDK never assumes a `sk_live_`-style
 * prefix that doesn't actually exist.
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
