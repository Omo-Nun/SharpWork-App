export async function handleMockApi(method: string, path: string, body?: any): Promise<any> {
  const basePath = path.split('?')[0];
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
      { id: 'v1', userId: '2', status: 'PENDING', documents: ['id_card.jpg'], submittedAt: new Date().toISOString() }
    ];
  }

  if (method === 'GET' && basePath.includes('/bookings')) {
    return [
      { id: 'b1', state: 'COMPLETED', price: 5000, customerId: '1', artisanId: '2', createdAt: new Date().toISOString() }
    ];
  }

  if (method === 'GET' && basePath.includes('/disputes')) {
    return [
      { id: 'd1', bookingId: 'b1', reason: 'Unfinished work', status: 'OPEN', raisedBy: 'CUSTOMER' }
    ];
  }

  if (method === 'GET' && basePath.includes('/categories')) {
    return [
      { id: 'c1', name: 'Plumbing', slug: 'plumbing' },
      { id: 'c2', name: 'Electrical', slug: 'electrical' }
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

  if (method === 'POST' && basePath === '/auth/login') {
    return {
      accessToken: 'admin-mock-token',
      user: { id: 'admin-1', email: 'admin@sharpwork.com', role: 'ADMIN' }
    };
  }

  return { success: true, mocked: true, message: 'Default admin mock response' };
}
