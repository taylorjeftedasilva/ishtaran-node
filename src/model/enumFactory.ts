/**
 * Generic forward-compatible enum factory -- see SDK_CAPABILITY_SPEC.md §11.4. An unknown raw
 * value never throws: it becomes `{ name: 'UNKNOWN', rawValue }`, preserving the exact received value
 * (inteiro ou string, conforme o Grupo do enum real — ver §11.3).
 */
export interface EnumValue<TRaw extends number | string> {
  readonly name: string;
  readonly rawValue: TRaw;
}

export function createEnum<TRaw extends number | string>(members: Record<string, TRaw>) {
  const byRaw = new Map<TRaw, EnumValue<TRaw>>();
  const constants = {} as Record<string, EnumValue<TRaw>>;

  for (const [name, rawValue] of Object.entries(members)) {
    const value: EnumValue<TRaw> = { name, rawValue };
    constants[name] = value;
    byRaw.set(rawValue, value);
  }

  function fromRaw(raw: TRaw): EnumValue<TRaw> {
    return byRaw.get(raw) ?? { name: 'UNKNOWN', rawValue: raw };
  }

  function isUnknown(value: EnumValue<TRaw>): boolean {
    return !byRaw.has(value.rawValue);
  }

  return { ...constants, fromRaw, isUnknown } as Record<string, EnumValue<TRaw>> & {
    fromRaw: typeof fromRaw;
    isUnknown: typeof isUnknown;
  };
}
