import { describe, expect, it } from 'vitest';
import { parseLossless, moneyString, safeInt } from './json.js';
import { field } from '../resources/resourceSupport.js';

describe('lossless JSON parsing (money precision, SDK_CAPABILITY_SPEC.md §11.1)', () => {
  it('preserves exact precision from the JSON number token, never rounds via JS Number', () => {
    const json = `{
      "requestedAmount": 100.123456789012345678,
      "estimatedNetworkFee": 0.4,
      "estimatedRecipientAmount": 99.723456789012345678
    }`;
    const raw = parseLossless(json);
    expect(moneyString(field(raw, 'requestedAmount'))).toBe('100.123456789012345678');
    expect(moneyString(field(raw, 'estimatedNetworkFee'))).toBe('0.4');
    expect(moneyString(field(raw, 'estimatedRecipientAmount'))).toBe('99.723456789012345678');
  });

  it('confirms native JSON.parse WOULD have lost this precision (proves the problem is real)', () => {
    const parsed = JSON.parse('{"amount": 100.123456789012345678}');
    expect(String(parsed.amount)).not.toBe('100.123456789012345678');
  });

  it('safeInt extracts small integers as real JS numbers', () => {
    const raw = parseLossless('{"decimals": 6, "confirmationCount": 12}');
    expect(safeInt(field(raw, 'decimals'))).toBe(6);
    expect(safeInt(field(raw, 'confirmationCount'))).toBe(12);
  });

  it('matches the real backend small-payment example (0.9% fee, no floor)', () => {
    // Same scenario as the backend test ExecuteSettlement_SmallPayment_NoFloor.
    const raw = parseLossless('{"grossAmount": 1, "platformFeeAmount": 0.009, "distributableAmount": 0.991}');
    expect(moneyString(field(raw, 'platformFeeAmount'))).toBe('0.009');
    expect(moneyString(field(raw, 'distributableAmount'))).toBe('0.991');
  });
});
