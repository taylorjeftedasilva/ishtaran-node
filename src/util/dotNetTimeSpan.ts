/**
 * `RotateApiKeyRequest.OverlapWindow` is a real .NET `TimeSpan` (no custom converter registered
 * -- confirmed via a grep in `OrganizationTenancy.Contracts`), serialized in `System.Text.Json`'s
 * constant "c" format, native since .NET 6: `[-][d.]hh:mm:ss[.fffffff]`. Never use
 * `Duration.toISOString()`'s ISO-8601 format here -- it would break the real call.
 */
export function formatDotNetTimeSpan(totalMs: number): string {
  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  const prefix = days !== 0 ? `${days}.` : '';
  return `${prefix}${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
