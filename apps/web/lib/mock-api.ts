export async function handleMockApi(method: string, path: string, body?: any): Promise<any> {
  const basePath = path.split('?')[0];
  console.log(`[Mock API] ${method} ${path}`);

  if (method === 'GET' && basePath === '/categories') {
    return [
      { id: '1', name: 'Plumbing', slug: 'plumbing', icon: '🚰' },
      { id: '2', name: 'Electrical', slug: 'electrical', icon: '⚡' },
      { id: '3', name: 'Carpentry', slug: 'carpentry', icon: '🪚' },
      { id: '4', name: 'Cleaning', slug: 'cleaning', icon: '🧹' },
      { id: '5', name: 'Painting', slug: 'painting', icon: '🎨' },
    ];
  }

  if (method === 'GET' && basePath === '/search') {
    return [
      {
        id: 'a1', userId: 'u1', firstName: 'John', lastName: 'Doe',
        skills: ['Plumbing'], categories: [{ id: '1', name: 'Plumbing', slug: 'plumbing', icon: '🚰' }],
        isOnline: true, isVerified: true, distanceKm: 2.5, averageRating: 4.8, reviewCount: 12, completedJobsCount: 45,
        lat: 6.52, lng: 3.37
      },
      {
        id: 'a2', userId: 'u2', firstName: 'Jane', lastName: 'Smith',
        skills: ['Electrical'], categories: [{ id: '2', name: 'Electrical', slug: 'electrical', icon: '⚡' }],
        isOnline: false, isVerified: true, distanceKm: 5.1, averageRating: 4.5, reviewCount: 8, completedJobsCount: 20,
        lat: 6.53, lng: 3.36
      },
      {
        id: 'a3', userId: 'u3', firstName: 'Mike', lastName: 'Johnson',
        skills: ['Carpentry'], categories: [{ id: '3', name: 'Carpentry', slug: 'carpentry', icon: '🪚' }],
        isOnline: true, isVerified: false, distanceKm: 8.0, averageRating: 4.0, reviewCount: 3, completedJobsCount: 5,
        lat: 6.54, lng: 3.38
      }
    ];
  }

  if (method === 'GET' && basePath === '/auth/me') {
    return {
      id: 'mock-user-1',
      email: 'mock@example.com',
      role: 'CUSTOMER',
      phoneNumber: '+1234567890',
      emailVerifiedAt: new Date().toISOString(),
      profile: {
        firstName: 'Test',
        lastName: 'User',
        isVerified: true
      }
    };
  }

  if (method === 'POST' && basePath === '/auth/login') {
    return {
      accessToken: 'mock-access-token',
      user: {
        id: 'mock-user-1',
        email: 'mock@example.com',
        role: 'CUSTOMER',
        phoneNumber: '+1234567890',
        emailVerifiedAt: new Date().toISOString(),
        profile: {
          firstName: 'Test',
          lastName: 'User',
          isVerified: true
        }
      }
    };
  }

  if (method === 'POST' && basePath === '/auth/refresh') {
    return { accessToken: 'mock-access-token' };
  }

  if (method === 'GET' && basePath.startsWith('/artisan/public/')) {
    return {
      userId: basePath.split('/')[3],
      firstName: 'Mock',
      lastName: 'Artisan',
      skills: ['Plumbing', 'Electrical'],
      categories: [
        { id: '1', name: 'Plumbing', slug: 'plumbing', icon: '🚰' },
        { id: '2', name: 'Electrical', slug: 'electrical', icon: '⚡' },
      ],
      portfolioUrls: ['https://placehold.co/600x400', 'https://placehold.co/600x400'],
      isVerified: true,
      averageRating: 4.9,
      reviewCount: 30,
      completedJobsCount: 120,
      memberSince: '2023-01-01',
      verificationBadges: ['identity', 'skills'],
      responseTimeMinutes: 10,
      ratingDistribution: { '5': 25, '4': 5 },
      reviews: [
        { rating: 5, comment: 'Great job!', createdAt: '2024-01-01', reviewerName: 'Alice' },
        { rating: 4, comment: 'Good, but a bit late.', createdAt: '2024-01-15', reviewerName: 'Bob' }
      ]
    };
  }

  if (method === 'GET' && basePath === '/booking') {
    return [
      {
        id: 'b1',
        state: 'PENDING',
        description: 'Fix the leaky sink',
        price: 5000,
        paymentStatus: 'PENDING',
        createdAt: new Date().toISOString(),
        artisan: { artisanProfile: { firstName: 'John', lastName: 'Doe', skills: ['Plumbing'] } }
      }
    ];
  }

  if (method === 'GET' && basePath.startsWith('/booking/')) {
    return {
      id: basePath.split('/')[2],
      state: 'PENDING',
      description: 'Fix the leaky sink',
      price: 5000,
      paymentStatus: 'PENDING',
      createdAt: new Date().toISOString(),
      artisan: { artisanProfile: { firstName: 'John', lastName: 'Doe', skills: ['Plumbing'] } },
      customer: { customerProfile: { firstName: 'Test', lastName: 'User' } }
    };
  }
  
  if (method === 'GET' && basePath === '/artisan/stats') {
    return {
      totalEarnings: 150000,
      completedJobs: 45,
      averageRating: 4.8,
      reviewCount: 12,
      monthlyEarnings: [
        { month: 'Jan', amount: 30000 },
        { month: 'Feb', amount: 50000 },
        { month: 'Mar', amount: 70000 }
      ],
      growthPercent: 15
    };
  }

  if (method === 'GET' && basePath === '/artisan/verification/status') {
    return {
      verificationStatus: 'PENDING',
      verificationStep: 1,
      isVerified: false,
      skillOptions: ['Plumbing', 'Electrical']
    };
  }

  // Delay for a short bit to simulate network
  await new Promise(resolve => setTimeout(resolve, 500));

  return { success: true, mocked: true, path, method };
}
