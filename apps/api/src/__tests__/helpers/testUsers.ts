import bcrypt from 'bcrypt';
import { Role, VerificationStatus } from '@prisma/client';
import prisma from '../../prisma';
import { generateTokens } from '../../utils/jwt';

export interface TestUserContext {
  userId: string;
  email: string;
  accessToken: string;
  role: Role;
}

let counter = 0;

function uniqueSuffix() {
  counter += 1;
  return `${Date.now()}-${counter}`;
}

export async function createTestUser(
  role: Role,
  options?: { firstName?: string; lastName?: string; lat?: number; lng?: number; verified?: boolean }
): Promise<TestUserContext> {
  const suffix = uniqueSuffix();
  const email = `${role.toLowerCase()}-${suffix}@sharpwork.test`;
  const phoneNumber = `+2348099${String(suffix).slice(-6).padStart(6, '0')}`;
  const passwordHash = await bcrypt.hash('testpass123', 4);

  const user = await prisma.user.create({
    data: {
      email,
      phoneNumber,
      passwordHash,
      role,
      emailVerifiedAt: new Date(),
    },
  });

  if (role === Role.CUSTOMER) {
    await prisma.customerProfile.create({
      data: {
        userId: user.id,
        firstName: options?.firstName || 'Test',
        lastName: options?.lastName || 'Customer',
      },
    });
  }

  if (role === Role.ARTISAN) {
    await prisma.artisanProfile.create({
      data: {
        userId: user.id,
        firstName: options?.firstName || 'Test',
        lastName: options?.lastName || 'Artisan',
        skills: ['Plumbing'],
        isVerified: options?.verified ?? true,
        verificationStatus: VerificationStatus.APPROVED,
        latitude: options?.lat ?? 6.5244,
        longitude: options?.lng ?? 3.3792,
        settlementBank: '058',
        accountNumber: '0123456789',
      },
    });
  }

  if (role === Role.ADMIN) {
    await prisma.adminProfile.create({
      data: {
        userId: user.id,
        totpSecret: 'JBSWY3DPEHPK3PXPTESTSECRET12',
        totpEnabled: true,
      },
    });
  }

  const { accessToken } = generateTokens(user.id, user.role);

  return { userId: user.id, email, accessToken, role };
}

export async function deleteTestUsers(userIds: string[]): Promise<void> {
  if (userIds.length === 0) return;

  await prisma.review.deleteMany({
    where: { OR: [{ customerId: { in: userIds } }, { artisanId: { in: userIds } }] },
  });
  await prisma.message.deleteMany({
    where: { OR: [{ senderId: { in: userIds } }, { receiverId: { in: userIds } }] },
  });
  await prisma.moderationReport.deleteMany({
    where: { OR: [{ reporterId: { in: userIds } }, { targetUserId: { in: userIds } }] },
  });
  await prisma.dispute.deleteMany({ where: { raisedById: { in: userIds } } });
  await prisma.escrowAuditLog.deleteMany({
    where: { booking: { OR: [{ customerId: { in: userIds } }, { artisanId: { in: userIds } }] } },
  });
  await prisma.booking.deleteMany({
    where: { OR: [{ customerId: { in: userIds } }, { artisanId: { in: userIds } }] },
  });
  await prisma.artisanReference.deleteMany({
    where: { artisanProfile: { userId: { in: userIds } } },
  });
  await prisma.customerProfile.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.artisanProfile.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.adminProfile.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.emailVerificationToken.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
}
