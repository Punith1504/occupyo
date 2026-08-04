import { describe, it, expect, vi } from 'vitest';
import { createDeal } from '@/app/actions/deal';
import { authMock, prismaMock } from '../setup';
import { DealStatus } from '@prisma/client';

describe('Concurrency & Race Condition Audit: Transaction Locks', () => {
  it('should prevent duplicate deals from being created for the same property simultaneously', async () => {
    authMock.mockResolvedValue({ userId: 'tenant_uuid_123' });
    prismaMock.user.findUnique.mockResolvedValue({ id: 'tenant_uuid_123', role: 'TENANT' } as any);

    // Mock Prisma to simulate a unique constraint violation or successful insert
    let insertCount = 0;
    prismaMock.deal.create.mockImplementation(async (args) => {
      insertCount++;
      if (insertCount > 1) {
        // Simulate Prisma throwing a Unique Constraint error if a deal already exists
        // (Assuming there is a composite unique constraint @@unique([propertyId, tenantId]) in the schema)
        throw new Error('Unique constraint failed on the fields: (`propertyId`,`tenantId`)');
      }
      return { id: 'new_deal_123', status: DealStatus.INQUIRY } as any;
    });

    const propertyId = 'highly_contested_property_1';
    const tenantId = 'tenant_uuid_123';

    // Fire 5 exact same requests at the exact same millisecond
    const promises = Array(5).fill(null).map(() => createDeal(propertyId, tenantId));
    
    const results = await Promise.all(promises);

    // Assert that exactly one succeeded
    const successes = results.filter(r => r.success === true);
    const failures = results.filter(r => r.success === false);

    expect(successes.length).toBe(1);
    expect(failures.length).toBe(4);
    expect(failures[0].error).toBe('Failed to create deal');
  });
});
