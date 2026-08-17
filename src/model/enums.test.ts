import { describe, expect, it } from 'vitest';
import { AccountStatus, WithdrawalStatus } from './enums.js';

describe('Enum forward-compatibility (SDK_CAPABILITY_SPEC.md §11.4)', () => {
  it('Group B known int value maps to the named constant', () => {
    const status = WithdrawalStatus.fromRaw(8);
    expect(status).toEqual(WithdrawalStatus.COMPLETED);
    expect(WithdrawalStatus.isUnknown(status)).toBe(false);
  });

  it('Group B unknown int value never throws, falls back to UNKNOWN preserving raw value', () => {
    const status = WithdrawalStatus.fromRaw(99);
    expect(WithdrawalStatus.isUnknown(status)).toBe(true);
    expect(status.rawValue).toBe(99);
    expect(status.name).toBe('UNKNOWN');
  });

  it('Group A known string value maps to the named constant', () => {
    const status = AccountStatus.fromRaw('Frozen');
    expect(status).toEqual(AccountStatus.FROZEN);
    expect(AccountStatus.isUnknown(status)).toBe(false);
  });

  it('Group A unknown string value never throws, falls back to UNKNOWN preserving raw value', () => {
    const status = AccountStatus.fromRaw('SomeFutureStatus');
    expect(AccountStatus.isUnknown(status)).toBe(true);
    expect(status.rawValue).toBe('SomeFutureStatus');
  });

  it('equality is by raw value', () => {
    expect(WithdrawalStatus.fromRaw(8)).toEqual(WithdrawalStatus.fromRaw(8));
  });
});
