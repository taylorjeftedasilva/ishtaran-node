import { parse, LosslessNumber } from 'lossless-json';

/**
 * The real API sends money as `number(double)` in JSON (never a string -- confirmed in the real
 * OpenAPI schema, see SDK_CAPABILITY_SPEC.md §11.1). Native `JSON.parse` would already lose
 * precision before the SDK could intervene; that's why every response parse goes through
 * `lossless-json`, which preserves each number's exact text (`LosslessNumber`) instead of
 * blindly converting it to `number`.
 *
 * Usage: {@link moneyString} extracts a monetary field as an exact string (never a `Number`,
 * never rounded); {@link safeInt} extracts a small integer (decimals, confirmationCount, an
 * enum's raw value, skip/take) as a real `number` -- throws if the value can't be safely
 * represented as a JS `number` (a real guarantee from the library, not just documentation).
 */
export function parseLossless(text: string): unknown {
  return parse(text);
}

export function moneyString(value: unknown): string {
  if (value instanceof LosslessNumber) {
    return value.toString();
  }
  if (value === null || value === undefined) {
    throw new Error('moneyString: missing value where a monetary field was expected');
  }
  return String(value);
}

export function moneyStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return moneyString(value);
}

export function safeInt(value: unknown): number {
  if (value instanceof LosslessNumber) {
    const parsed = value.valueOf(); // throws if it's not safe to represent as a JS number/bigint
    return typeof parsed === 'bigint' ? Number(parsed) : parsed;
  }
  if (typeof value === 'number') {
    return value;
  }
  throw new Error(`safeInt: unexpected value ${String(value)}`);
}

export function safeIntOrNull(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  return safeInt(value);
}
