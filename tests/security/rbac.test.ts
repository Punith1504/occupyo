import { describe, it, expect, vi } from 'vitest';
import { createPropertyListing } from '@/app/actions/property';
import { createDeal } from '@/app/actions/deal';
import { authMock } from '../setup';

describe('RBAC Security Audit: Direct Action Invocation', () => {
  it('should reject createPropertyListing when unauthorized (no session)', async () => {
    // Mock no user session
    authMock.mockResolvedValue({ userId: null });

    const result = await createPropertyListing({
      title: 'Hacked Property',
      description: 'Hacked Description',
      propertyType: 'OFFICE',
      sizeSqft: 1000,
      pricePerMonth: 5000,
      address: '123 Hack St',
    });

    expect(result).toEqual({ success: false, error: 'Internal server error' });
  });

  it('should reject createDeal when unauthorized (no session)', async () => {
    // Mock no user session
    authMock.mockResolvedValue({ userId: null });

    const result = await createDeal('property_123', 'tenant_123');

    // Currently createDeal catches and returns { success: false, error: "Failed to create deal" }
    expect(result).toEqual({ success: false, error: 'Failed to create deal' });
  });
});
