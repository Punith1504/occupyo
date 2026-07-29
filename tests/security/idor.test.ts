import { describe, it, expect } from 'vitest';
import { updateDealStatus } from '@/app/actions/deal';
import { authMock, prismaMock } from '../setup';
import { DealStatus } from '@prisma/client';

describe('IDOR Security Audit: Direct Object Reference Protection', () => {
  it('should reject updateDealStatus if the user is not the tenant, owner, or broker of the deal', async () => {
    const maliciousUserId = 'malicious_user_999';
    authMock.mockResolvedValue({ userId: maliciousUserId });

    // Mock a deal that belongs to entirely different people
    prismaMock.deal.findUnique.mockResolvedValue({
      id: 'deal_123',
      propertyId: 'prop_1',
      tenantId: 'tenant_uuid',
      brokerId: null,
      status: DealStatus.INQUIRY,
      proposedRent: null,
      leaseTermMonths: null,
      commissionFee: null,
      loiDocumentUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      tenant: { clerkUserId: 'legit_tenant_123', id: 'tenant_uuid', name: 'Tenant', email: 'tenant@test.com', role: 'TENANT', createdAt: new Date(), updatedAt: new Date(), stripeCustomerId: null, hasActiveSubscription: false, aiCredits: 0 },
      property: { 
        owner: { clerkUserId: 'legit_owner_456', id: 'owner_uuid', name: 'Owner', email: 'owner@test.com', role: 'OWNER', createdAt: new Date(), updatedAt: new Date(), stripeCustomerId: null, hasActiveSubscription: false, aiCredits: 0 },
        id: 'prop_1', ownerId: 'owner_uuid', title: 'Prop', description: 'Desc', propertyType: 'OFFICE', sizeSqft: 100, pricePerHour: null, pricePerDay: null, pricePerMonth: 1000, minDuration: 1, maxDuration: 12, durationUnit: 'MONTHS', address: '123 St', lat: null, lng: null, amenities: [], status: 'AVAILABLE', sourceUrl: null, createdAt: new Date(), updatedAt: new Date()
      },
      broker: null,
    } as any);

    const result = await updateDealStatus('deal_123', DealStatus.TOUR);

    // Should catch the 'Unauthorized' error and return the generic failure message
    expect(result).toEqual({ success: false, error: 'Failed to update deal status' });
  });

  it('should allow updateDealStatus if the user IS the owner of the deal property', async () => {
    const legitOwnerId = 'legit_owner_456';
    authMock.mockResolvedValue({ userId: legitOwnerId });

    prismaMock.deal.findUnique.mockResolvedValue({
      id: 'deal_123',
      status: DealStatus.INQUIRY,
      tenant: { clerkUserId: 'legit_tenant_123' },
      property: { owner: { clerkUserId: legitOwnerId } },
      broker: null,
    } as any);

    prismaMock.deal.update.mockResolvedValue({} as any);

    const result = await updateDealStatus('deal_123', DealStatus.TOUR);

    expect(result).toEqual({ success: true });
  });
});
