import { describe, expect, it } from 'vitest';
import { OrganizationsResource } from './organizationsResource.js';
import { FakeHttpTransport } from '../http/fakeHttpTransport.js';

describe('OrganizationsResource idempotency (header, not body field — SDK_CAPABILITY_SPEC.md §9)', () => {
  it('create without explicit key auto-generates the header, never a body field', async () => {
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(201, '{"id":"11111111-1111-1111-1111-111111111111"}'));
    const resource = new OrganizationsResource(fake);

    await resource.create('Acme Inc');

    const sent = fake.received[0]!;
    expect(sent.headers['Idempotency-Key']).toBeTruthy();
    expect(sent.body?.includes('idempotencyKey')).toBeFalsy();
  });

  it('create with explicit key is never overwritten', async () => {
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(201, '{"id":"11111111-1111-1111-1111-111111111111"}'));
    const resource = new OrganizationsResource(fake);

    await resource.create('Acme Inc', 'my-explicit-key');

    expect(fake.received[0]!.headers['Idempotency-Key']).toBe('my-explicit-key');
  });
});
