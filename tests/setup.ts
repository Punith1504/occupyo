import { vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';

// 1. Mock Prisma
export const prismaMock = mockDeep<PrismaClient>();
vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

// 2. Mock Clerk Auth
export const authMock = vi.fn();
vi.mock('@clerk/nextjs/server', () => ({
  auth: authMock,
}));

// 3. Mock Next.js Cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Reset mocks before each test
beforeEach(() => {
  mockReset(prismaMock);
  authMock.mockReset();
});
