/**
 * `RotateApiKeyRequest.OverlapWindow` é um `TimeSpan` real do .NET (sem converter customizado
 * registrado — confirmado via grep em `OrganizationTenancy.Contracts`), serializado no formato
 * constante "c" do `System.Text.Json` nativo desde .NET 6: `[-][d.]hh:mm:ss[.fffffff]`. Nunca usar
 * o formato ISO-8601 de `Duration.toISOString()` aqui — quebraria a chamada real.
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
