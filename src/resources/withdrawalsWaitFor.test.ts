import { describe, expect, it } from 'vitest';
import { WithdrawalsResource } from './withdrawalsResource.js';
import { FakeHttpTransport } from '../http/fakeHttpTransport.js';
import { TimeoutError } from '../error/errors.js';

function withdrawalJson(id: string, status: number): string {
  return JSON.stringify({
    withdrawalId: id, organizationId: 'org', accountId: 'acc', withdrawalDestinationId: 'dest',
    assetNetworkId: 'an', amount: 100, estimatedNetworkFee: 0.4, estimatedRecipientAmount: 99.6,
    finalNetworkFee: null, finalRecipientAmount: null, status, entryGroupId: null,
    technicalReference: null, createdAt: '2026-08-17T12:00:00Z',
  });
}

describe('WithdrawalsResource.waitFor', () => {
  it('polls until a terminal status', async () => {
    const fake = new FakeHttpTransport()
      .enqueue(FakeHttpTransport.json(200, withdrawalJson('w1', 2)))
      .enqueue(FakeHttpTransport.json(200, withdrawalJson('w1', 8)));
    const resource = new WithdrawalsResource(fake);

    const result = await resource.waitFor('w1', 5000, 1);
    expect(result.status.rawValue).toBe(8);
    expect(fake.requestCount).toBe(2);
  });

  it('never resolving throws TimeoutError', async () => {
    const fake = new FakeHttpTransport().respondAlways(() => FakeHttpTransport.json(200, withdrawalJson('w1', 2)));
    const resource = new WithdrawalsResource(fake);

    await expect(resource.waitFor('w1', 20, 5)).rejects.toBeInstanceOf(TimeoutError);
  });
});
