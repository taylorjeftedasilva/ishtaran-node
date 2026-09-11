import { describe, expect, it } from 'vitest';
import { TransactionsResource } from './transactionsResource.js';
import { FakeHttpTransport } from '../http/fakeHttpTransport.js';
import { ExecutionStatus } from '../model/enums.js';

describe('TransactionsResource.searchExecutions', () => {
  it('scopes by organizationId and forwards status/transactionId/settlementId/skip/take as query params', async () => {
    const body = JSON.stringify([]);
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(200, body));
    const resource = new TransactionsResource(fake);

    await resource.searchExecutions('org-1', {
      status: ExecutionStatus.OVERDUE,
      transactionId: 'tx-1',
      settlementId: 'stl-1',
      skip: 10,
      take: 25,
    });

    expect(fake.received[0]?.method).toBe('GET');
    const path = fake.received[0]!.path;
    expect(path.startsWith('/v1/organizations/org-1/executions?')).toBe(true);
    expect(path).toContain('status=5');
    expect(path).toContain('transactionId=tx-1');
    expect(path).toContain('settlementId=stl-1');
    expect(path).toContain('skip=10');
    expect(path).toContain('take=25');
  });

  it('maps executions, including nullable executedAt/settlementId for a still-outstanding Execution', async () => {
    const body = JSON.stringify([
      {
        executionId: 'ex-1', transactionId: 'tx-1', organizationId: 'org-1',
        status: 5, // Overdue
        preparedAt: '2026-08-01T12:00:00Z', gracePeriodExpiresAt: '2026-08-01T13:00:00Z',
        executedAt: null, settlementId: null,
      },
    ]);
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(200, body));
    const resource = new TransactionsResource(fake);

    const executions = await resource.searchExecutions('org-1');

    expect(executions).toHaveLength(1);
    expect(executions[0]!.executionId).toBe('ex-1');
    expect(executions[0]!.status.name).toBe('OVERDUE');
    expect(executions[0]!.executedAt).toBeNull();
    expect(executions[0]!.settlementId).toBeNull();
  });
});
