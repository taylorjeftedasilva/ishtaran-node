import { parse, LosslessNumber } from 'lossless-json';

/**
 * A API real envia dinheiro como `number(double)` no JSON (nunca string — confirmado no schema
 * OpenAPI real, ver SDK_CAPABILITY_SPEC.md §11.1). `JSON.parse` nativo já perderia precisão antes
 * do SDK poder intervir; por isso todo parsing de resposta passa por `lossless-json`, que preserva
 * o texto exato de cada número (`LosslessNumber`) em vez de convertê-lo cegamente para `number`.
 *
 * Uso: {@link moneyString} extrai um campo monetário como string exata (nunca `Number`, nunca
 * arredondado); {@link safeInt} extrai um inteiro pequeno (decimals, confirmationCount, enum raw
 * value, skip/take) como `number` real — lança se o valor não puder ser representado com segurança
 * como `number` do JS (proteção real da biblioteca, não apenas documentação).
 */
export function parseLossless(text: string): unknown {
  return parse(text);
}

export function moneyString(value: unknown): string {
  if (value instanceof LosslessNumber) {
    return value.toString();
  }
  if (value === null || value === undefined) {
    throw new Error('moneyString: valor ausente onde um campo monetário era esperado');
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
    const parsed = value.valueOf(); // lança se não for seguro representar como JS number/bigint
    return typeof parsed === 'bigint' ? Number(parsed) : parsed;
  }
  if (typeof value === 'number') {
    return value;
  }
  throw new Error(`safeInt: valor inesperado ${String(value)}`);
}

export function safeIntOrNull(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  return safeInt(value);
}
