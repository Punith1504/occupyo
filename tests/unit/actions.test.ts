import { describe, it, expect, vi } from 'vitest';
import { sendMessage } from '@/app/dashboard/messages/actions';

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: null }), // Default to unauthenticated
}));

describe('Message Actions', () => {
  it('should return Unauthorized if user is not authenticated', async () => {
    const result = await sendMessage('receiver-123', 'Hello world');
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });
});
