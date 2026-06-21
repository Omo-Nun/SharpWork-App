const ALL_CATEGORIES = [
  // 1. Building, Construction & Finishing
  { id: '1_1', name: 'Mason/Bricklayer', slug: 'mason-bricklayer', group: { id: 'g1', name: 'Building, Construction & Finishing', slug: 'building', sortOrder: 1 } },
  { id: '1_2', name: 'Block molder', slug: 'block-molder', group: { id: 'g1', name: 'Building, Construction & Finishing', slug: 'building', sortOrder: 1 } },
  { id: '1_3', name: 'Carpenter', slug: 'carpenter', group: { id: 'g1', name: 'Building, Construction & Finishing', slug: 'building', sortOrder: 1 } },
  { id: '1_4', name: 'Roofing specialist', slug: 'roofing', group: { id: 'g1', name: 'Building, Construction & Finishing', slug: 'building', sortOrder: 1 } },
  { id: '1_5', name: 'Steel bender/Fabricator', slug: 'steel-bender', group: { id: 'g1', name: 'Building, Construction & Finishing', slug: 'building', sortOrder: 1 } },
  { id: '1_6', name: 'Scaffolder', slug: 'scaffolder', group: { id: 'g1', name: 'Building, Construction & Finishing', slug: 'building', sortOrder: 1 } },
  { id: '1_7', name: 'Tiler', slug: 'tiler', group: { id: 'g1', name: 'Building, Construction & Finishing', slug: 'building', sortOrder: 1 } },
  { id: '1_8', name: 'Plasterer/Plaster of Paris specialist', slug: 'plasterer', group: { id: 'g1', name: 'Building, Construction & Finishing', slug: 'building', sortOrder: 1 } },
  { id: '1_9', name: 'POP/Ceiling installer', slug: 'pop-ceiling', group: { id: 'g1', name: 'Building, Construction & Finishing', slug: 'building', sortOrder: 1 } },
  { id: '1_10', name: 'Painter', slug: 'painter', group: { id: 'g1', name: 'Building, Construction & Finishing', slug: 'building', sortOrder: 1 } },
  { id: '1_11', name: 'Painter & Decorator', slug: 'painter-decorator', group: { id: 'g1', name: 'Building, Construction & Finishing', slug: 'building', sortOrder: 1 } },
  { id: '1_12', name: 'Glazier/Glass cutter', slug: 'glazier', group: { id: 'g1', name: 'Building, Construction & Finishing', slug: 'building', sortOrder: 1 } },
  { id: '1_13', name: 'Glass & Aluminum worker', slug: 'glass-aluminum', group: { id: 'g1', name: 'Building, Construction & Finishing', slug: 'building', sortOrder: 1 } },
  { id: '1_14', name: 'Aluminum fabricator', slug: 'aluminum-fabricator', group: { id: 'g1', name: 'Building, Construction & Finishing', slug: 'building', sortOrder: 1 } },
  { id: '1_15', name: 'Plumber', slug: 'plumber', group: { id: 'g1', name: 'Building, Construction & Finishing', slug: 'building', sortOrder: 1 } },
  { id: '1_16', name: 'Electrician', slug: 'electrician', group: { id: 'g1', name: 'Building, Construction & Finishing', slug: 'building', sortOrder: 1 } },
  { id: '1_17', name: 'AC/Refrigeration technician', slug: 'ac-refrigeration', group: { id: 'g1', name: 'Building, Construction & Finishing', slug: 'building', sortOrder: 1 } },
  { id: '1_18', name: 'Solar installer', slug: 'solar-installer', group: { id: 'g1', name: 'Building, Construction & Finishing', slug: 'building', sortOrder: 1 } },
  { id: '1_19', name: 'Landscaper/Gardener', slug: 'landscaper', group: { id: 'g1', name: 'Building, Construction & Finishing', slug: 'building', sortOrder: 1 } },
  { id: '1_20', name: 'Fumigation', slug: 'fumigation', group: { id: 'g1', name: 'Building, Construction & Finishing', slug: 'building', sortOrder: 1 } },
  { id: '1_21', name: 'House Cleaners', slug: 'house-cleaners', group: { id: 'g1', name: 'Building, Construction & Finishing', slug: 'building', sortOrder: 1 } },

  // 2. Metal & Fabrication
  { id: '2_1', name: 'Welder/Fabricator', slug: 'welder-fabricator', group: { id: 'g2', name: 'Metal & Fabrication', slug: 'metal-fabrication', sortOrder: 2 } },
  { id: '2_2', name: 'Blacksmith', slug: 'blacksmith', group: { id: 'g2', name: 'Metal & Fabrication', slug: 'metal-fabrication', sortOrder: 2 } },
  { id: '2_3', name: 'Sheet metal fabricator', slug: 'sheet-metal-fabricator', group: { id: 'g2', name: 'Metal & Fabrication', slug: 'metal-fabrication', sortOrder: 2 } },
  { id: '2_4', name: 'Machinist', slug: 'machinist', group: { id: 'g2', name: 'Metal & Fabrication', slug: 'metal-fabrication', sortOrder: 2 } },
  { id: '2_5', name: 'Instrumentation & Process Control technician', slug: 'instrumentation-technician', group: { id: 'g2', name: 'Metal & Fabrication', slug: 'metal-fabrication', sortOrder: 2 } },
  { id: '2_6', name: 'Furniture maker/Cabinet maker', slug: 'furniture-maker', group: { id: 'g2', name: 'Metal & Fabrication', slug: 'metal-fabrication', sortOrder: 2 } },
  { id: '2_7', name: 'Upholsterer', slug: 'upholsterer', group: { id: 'g2', name: 'Metal & Fabrication', slug: 'metal-fabrication', sortOrder: 2 } },

  // 3. Auto & Machine Services
  { id: '3_1', name: 'Auto mechanic', slug: 'auto-mechanic', group: { id: 'g3', name: 'Auto & Machine Services', slug: 'auto-machine-services', sortOrder: 3 } },
  { id: '3_2', name: 'Auto electrician', slug: 'auto-electrician', group: { id: 'g3', name: 'Auto & Machine Services', slug: 'auto-machine-services', sortOrder: 3 } },
  { id: '3_3', name: 'Panel beater', slug: 'panel-beater', group: { id: 'g3', name: 'Auto & Machine Services', slug: 'auto-machine-services', sortOrder: 3 } },
  { id: '3_4', name: 'Auto spray painter', slug: 'auto-spray-painter', group: { id: 'g3', name: 'Auto & Machine Services', slug: 'auto-machine-services', sortOrder: 3 } },
  { id: '3_5', name: 'Generator technician', slug: 'generator-technician', group: { id: 'g3', name: 'Auto & Machine Services', slug: 'auto-machine-services', sortOrder: 3 } },
  { id: '3_6', name: 'Motorcycle/Keke mechanic', slug: 'motorcycle-mechanic', group: { id: 'g3', name: 'Auto & Machine Services', slug: 'auto-machine-services', sortOrder: 3 } },
  { id: '3_7', name: 'Vulcanizer', slug: 'vulcanizer', group: { id: 'g3', name: 'Auto & Machine Services', slug: 'auto-machine-services', sortOrder: 3 } },
  { id: '3_8', name: 'Locksmith', slug: 'locksmith', group: { id: 'g3', name: 'Auto & Machine Services', slug: 'auto-machine-services', sortOrder: 3 } },

  // 4. Tech, Electronics & Creative
  { id: '4_1', name: 'Phone repairer', slug: 'phone-repairer', group: { id: 'g4', name: 'Tech, Electronics & Creative', slug: 'tech-electronics', sortOrder: 4 } },
  { id: '4_2', name: 'Laptop/Desktop repairer', slug: 'laptop-repairer', group: { id: 'g4', name: 'Tech, Electronics & Creative', slug: 'tech-electronics', sortOrder: 4 } },
  { id: '4_3', name: 'CCTV/Satellite installer', slug: 'cctv-installer', group: { id: 'g4', name: 'Tech, Electronics & Creative', slug: 'tech-electronics', sortOrder: 4 } },
  { id: '4_4', name: 'Photographer/Videographer', slug: 'photographer-videographer', group: { id: 'g4', name: 'Tech, Electronics & Creative', slug: 'tech-electronics', sortOrder: 4 } },
  { id: '4_5', name: 'Video editor', slug: 'video-editor', group: { id: 'g4', name: 'Tech, Electronics & Creative', slug: 'tech-electronics', sortOrder: 4 } },
  { id: '4_6', name: 'Graphic designer', slug: 'graphic-designer', group: { id: 'g4', name: 'Tech, Electronics & Creative', slug: 'tech-electronics', sortOrder: 4 } },
  { id: '4_7', name: 'Sound engineer/DJ', slug: 'sound-engineer-dj', group: { id: 'g4', name: 'Tech, Electronics & Creative', slug: 'tech-electronics', sortOrder: 4 } },
  { id: '4_8', name: 'Printer/Printing press operator', slug: 'printer', group: { id: 'g4', name: 'Tech, Electronics & Creative', slug: 'tech-electronics', sortOrder: 4 } },
  { id: '4_9', name: 'Signage maker', slug: 'signage-maker', group: { id: 'g4', name: 'Tech, Electronics & Creative', slug: 'tech-electronics', sortOrder: 4 } },

  // 5. Personal Care & Beauty
  { id: '5_1', name: 'Barber', slug: 'barber', group: { id: 'g5', name: 'Personal Care & Beauty', slug: 'personal-care-beauty', sortOrder: 5 } },
  { id: '5_2', name: 'Barbering specialist', slug: 'barbering-specialist', group: { id: 'g5', name: 'Personal Care & Beauty', slug: 'personal-care-beauty', sortOrder: 5 } },
  { id: '5_3', name: 'Hairdresser/Hair stylist', slug: 'hairdresser', group: { id: 'g5', name: 'Personal Care & Beauty', slug: 'personal-care-beauty', sortOrder: 5 } },
  { id: '5_4', name: 'Wig maker/Hair extension technician', slug: 'wig-maker', group: { id: 'g5', name: 'Personal Care & Beauty', slug: 'personal-care-beauty', sortOrder: 5 } },
  { id: '5_5', name: 'Makeup artist/MUA', slug: 'makeup-artist', group: { id: 'g5', name: 'Personal Care & Beauty', slug: 'personal-care-beauty', sortOrder: 5 } },
  { id: '5_6', name: 'Nail technician', slug: 'nail-technician', group: { id: 'g5', name: 'Personal Care & Beauty', slug: 'personal-care-beauty', sortOrder: 5 } },
  { id: '5_7', name: 'Skincare formulator', slug: 'skincare-formulator', group: { id: 'g5', name: 'Personal Care & Beauty', slug: 'personal-care-beauty', sortOrder: 5 } },

  // 6. Fashion & Textile
  { id: '6_1', name: 'Tailor/Fashion designer', slug: 'tailor', group: { id: 'g6', name: 'Fashion & Textile', slug: 'fashion-textile', sortOrder: 6 } },
  { id: '6_2', name: 'Embroidery/Monogramming specialist', slug: 'embroidery', group: { id: 'g6', name: 'Fashion & Textile', slug: 'fashion-textile', sortOrder: 6 } },
  { id: '6_3', name: 'Leather worker', slug: 'leather-worker', group: { id: 'g6', name: 'Fashion & Textile', slug: 'fashion-textile', sortOrder: 6 } },
  { id: '6_4', name: 'Shoe maker/Cobbler', slug: 'shoe-maker', group: { id: 'g6', name: 'Fashion & Textile', slug: 'fashion-textile', sortOrder: 6 } },
  { id: '6_5', name: 'Knitter/Crochet artisan', slug: 'knitter', group: { id: 'g6', name: 'Fashion & Textile', slug: 'fashion-textile', sortOrder: 6 } },
  { id: '6_6', name: 'Tie & dye/Batik maker', slug: 'tie-dye', group: { id: 'g6', name: 'Fashion & Textile', slug: 'fashion-textile', sortOrder: 6 } },
  { id: '6_7', name: 'Bead maker/Bead stringing', slug: 'bead-maker', group: { id: 'g6', name: 'Fashion & Textile', slug: 'fashion-textile', sortOrder: 6 } },
  { id: '6_8', name: 'Dry cleaner/Laundry man', slug: 'dry-cleaner', group: { id: 'g6', name: 'Fashion & Textile', slug: 'fashion-textile', sortOrder: 6 } },

  // 7. Food & Production
  { id: '7_1', name: 'Baker', slug: 'baker', group: { id: 'g7', name: 'Food & Production', slug: 'food-production', sortOrder: 7 } },
  { id: '7_2', name: 'Caterer', slug: 'caterer', group: { id: 'g7', name: 'Food & Production', slug: 'food-production', sortOrder: 7 } },
  { id: '7_3', name: 'Snacks & small chops vendor', slug: 'snacks-vendor', group: { id: 'g7', name: 'Food & Production', slug: 'food-production', sortOrder: 7 } },
  { id: '7_4', name: 'Soap & detergent maker', slug: 'soap-maker', group: { id: 'g7', name: 'Food & Production', slug: 'food-production', sortOrder: 7 } },
  { id: '7_5', name: 'Perfume & scent producer', slug: 'perfume-producer', group: { id: 'g7', name: 'Food & Production', slug: 'food-production', sortOrder: 7 } },
  { id: '7_6', name: 'Brewery/Distiller', slug: 'brewery', group: { id: 'g7', name: 'Food & Production', slug: 'food-production', sortOrder: 7 } },

  // 8. Events & Decoration
  { id: '8_1', name: 'Event planner/Decorator', slug: 'event-planner', group: { id: 'g8', name: 'Events & Decoration', slug: 'events-decoration', sortOrder: 8 } },
];

export async function handleMockApi(method: string, path: string, body?: any): Promise<any> {
  const basePath = path.split('?')[0] || '';
  console.log(`[Mock API] ${method} ${path}`);

  if (method === 'GET' && basePath === '/categories') {
    return ALL_CATEGORIES;
  }

  if (method === 'GET' && basePath === '/search') {
    const url = new URL(path, 'http://localhost');
    const q = url.searchParams.get('q')?.toLowerCase() || '';
    const selectedSlugs = url.searchParams.get('categories')?.split(',').filter(Boolean) || [];

    // Simple Levenshtein distance for typo tolerance
    const levenshtein = (a: string, b: string): number => {
      if (!a.length) return b.length;
      if (!b.length) return a.length;
      const matrix: number[][] = Array.from({ length: b.length + 1 }, () => Array(a.length + 1).fill(0));
      for (let i = 0; i <= a.length; i++) matrix[0]![i] = i;
      for (let j = 0; j <= b.length; j++) matrix[j]![0] = j;
      for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
          const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
          matrix[j]![i] = Math.min(
            matrix[j]![i - 1]! + 1,
            matrix[j - 1]![i]! + 1,
            matrix[j - 1]![i - 1]! + indicator
          );
        }
      }
      return matrix[b.length]![a.length]!;
    };

    const fuzzyMatch = (str: string, query: string) => {
      const sTokens = str.toLowerCase().split(/\W+/).filter(Boolean);
      const qTokens = query.toLowerCase().split(/\s+/).filter(Boolean);
      if (qTokens.length === 0) return true;
      
      // For every token in the query, there must be at least one string token that either 
      // contains the query token exactly or is very close (Levenshtein distance <= 2).
      return qTokens.every(qTok => 
        sTokens.some(sTok => sTok.includes(qTok) || levenshtein(sTok, qTok) <= 2)
      );
    };

    // Generate mock artisans dynamically for matching categories
    const matchingCategories = ALL_CATEGORIES.filter(c => {
      let matchesSlug = selectedSlugs.length === 0 || selectedSlugs.includes(c.slug);
      let matchesQuery = q === '' || fuzzyMatch(c.name, q) || fuzzyMatch(c.group?.name || '', q);
      return matchesSlug && matchesQuery;
    });

    const mockArtisans = matchingCategories.map((c, idx) => ({
      id: `a_${c.id}_1`,
      userId: `u_${c.id}_1`,
      firstName: 'Expert',
      lastName: c.name.split('/')[0]!.split(' ')[0],
      skills: [c.name],
      categories: [c],
      isOnline: idx % 2 === 0,
      isVerified: idx % 3 !== 0,
      distanceKm: Number((1.5 + (idx % 10) * 0.8).toFixed(1)),
      averageRating: Number((4.0 + (idx % 10) * 0.1).toFixed(1)),
      reviewCount: 5 + (idx % 20) * 3,
      completedJobsCount: 10 + (idx % 50) * 5,
      lat: 6.52 + (idx * 0.001),
      lng: 3.37 + (idx * 0.001),
    }));

    // If query exists but no category matched, maybe we return empty array or search by name
    return mockArtisans;
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
