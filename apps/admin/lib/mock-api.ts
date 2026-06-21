export async function handleMockApi(method: string, path: string, body?: any): Promise<any> {
  const basePath = path.split('?')[0] || '';
  console.log(`[Admin Mock API] ${method} ${path}`);

  // Artificial delay
  await new Promise(resolve => setTimeout(resolve, 500));

  if (method === 'GET' && basePath.includes('/stats')) {
    return {
      kpis: {
        totalUsers: 1500,
        activeBookings: 120,
        openDisputes: 5,
        escalatedDisputes: 1,
        pendingVerifications: 12,
        escrowHeldAmount: 5000000,
        escrowHeldCount: 45
      },
      recentActivity: [
        { type: 'verification', id: '1', title: 'New Verification Request', subtitle: 'John Doe', status: 'PENDING', createdAt: new Date().toISOString() },
        { type: 'dispute', id: '2', title: 'Dispute Raised', subtitle: 'Booking #b1', status: 'OPEN', createdAt: new Date().toISOString() }
      ]
    };
  }

  if (method === 'GET' && basePath.includes('/users')) {
    return [
      { id: '1', email: 'user@example.com', role: 'CUSTOMER', isVerified: true, createdAt: new Date().toISOString() },
      { id: '2', email: 'artisan@example.com', role: 'ARTISAN', isVerified: false, createdAt: new Date().toISOString() }
    ];
  }

  if (method === 'GET' && basePath.includes('/verifications')) {
    return [
      {
        userId: '2',
        firstName: 'James',
        lastName: 'Okafor',
        skills: ['Plumbing', 'Tiling'],
        verificationStatus: 'PENDING',
        ninNumber: '12345678901',
        portfolioUrls: ['https://placehold.co/600x400'],
        rejectionReason: null,
        user: { email: 'james.okafor@example.com', phoneNumber: '+2348012345678' },
        references: [
          { name: 'Chidi Eze', phone: '+2348099887766', relationship: 'Former client' }
        ]
      }
    ];
  }

  if (method === 'GET' && basePath.includes('/bookings')) {
    return [
      {
        id: 'b1',
        description: 'Fix leaking kitchen sink and replace faucet',
        price: 15000,
        state: 'ARTISAN_COMPLETED',
        artisanCompletedAt: new Date(Date.now() - 50 * 3600 * 1000).toISOString(),
        eligibleFor48hRelease: true,
        canAdminRelease: true,
        customer: { email: 'customer@example.com', customerProfile: { firstName: 'Ada', lastName: 'Obi' } },
        artisan: { email: 'artisan@example.com', artisanProfile: { firstName: 'John', lastName: 'Doe' } }
      }
    ];
  }

  if (method === 'GET' && basePath.includes('/disputes')) {
    return [
      {
        id: 'd1',
        reason: 'Unfinished work — artisan left before completing the job',
        status: 'OPEN',
        escrowFrozen: true,
        adminNotes: null,
        createdAt: new Date().toISOString(),
        booking: {
          id: 'b1',
          description: 'Fix leaking kitchen sink and replace faucet',
          price: 15000,
          customer: { email: 'customer@example.com' },
          artisan: { email: 'artisan@example.com' }
        },
        raisedBy: { email: 'customer@example.com' }
      }
    ];
  }

  if (method === 'GET' && basePath.includes('/category-groups')) {
    return [
      { id: 'g1', name: 'Home Services', slug: 'home-services', sortOrder: 0, isActive: true },
      { id: 'g2', name: 'Technical Services', slug: 'technical-services', sortOrder: 1, isActive: true }
    ];
  }

  if (method === 'GET' && basePath.includes('/categories')) {
    return [
      { id: 'c1', name: 'Plumbing', slug: 'plumbing', description: 'Pipe and water fixture services', icon: '🚰', isActive: true, sortOrder: 0, groupId: 'g1', group: { id: 'g1', name: 'Home Services', slug: 'home-services', sortOrder: 0, isActive: true } },
      { id: 'c2', name: 'Electrical', slug: 'electrical', description: 'Electrical wiring and repairs', icon: '⚡', isActive: true, sortOrder: 1, groupId: 'g2', group: { id: 'g2', name: 'Technical Services', slug: 'technical-services', sortOrder: 1, isActive: true } }
    ];
  }

  if (method === 'GET' && basePath === '/auth/me') {
    return {
      id: 'admin-1',
      email: 'admin@sharpwork.com',
      role: 'ADMIN',
      profile: { firstName: 'Admin', lastName: 'User' }
    };
  }

  if (method === 'GET' && basePath.includes('/audit-log')) {
    return [
      { id: 'al1', action: 'ESCROW_RELEASED', amount: 15000, actorRole: 'ADMIN', createdAt: new Date().toISOString(), booking: { id: 'b1', description: 'Fix leaking kitchen sink', price: 15000 } },
      { id: 'al2', action: 'ESCROW_HELD', amount: 8000, actorRole: 'SYSTEM', createdAt: new Date(Date.now() - 86400000).toISOString(), booking: { id: 'b2', description: 'Electrical wiring repair', price: 8000 } }
    ];
  }

  if (basePath.includes('/settings/platform')) {
    return { platformFeePercent: 15 };
  }

  if (method === 'POST' && basePath.includes('/totp/setup')) {
    return { secret: 'MOCK_SECRET_BASE32', qrCode: '' };
  }

  if (method === 'POST' && basePath.includes('/totp/verify')) {
    return { success: true };
  }

  if (method === 'POST' && basePath === '/auth/login') {
    return {
      accessToken: 'admin-mock-token',
      user: { id: 'admin-1', email: 'admin@sharpwork.com', role: 'ADMIN' }
    };
  }

  return { success: true, mocked: true, message: 'Default admin mock response' };
}
