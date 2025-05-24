// Mock clubs data
export const clubs = [
  'Battle Bunker Elite',
  'CrossFit Central',
  'Iron Warriors',
  'No Affiliation',
  'Pull-Up Kings',
  'Strength Academy',
  'Tactical Fitness'
];

// Mock regions data
export const regions = [
  'North America',
  'South America',
  'Europe',
  'Asia',
  'Africa',
  'Oceania',
  'Middle East'
];

// Female badge URLs
const femaleBadgeUrls = {
  'recruit': 'https://cdn.shopify.com/s/files/1/0567/5237/3945/files/Recruit_-_Female.png?v=1747583270',
  'proven': 'https://cdn.shopify.com/s/files/1/0567/5237/3945/files/Proven_-_Female.png?v=1747583270',
  'hardened': 'https://cdn.shopify.com/s/files/1/0567/5237/3945/files/Hardened_1_-_Female.png?v=1747583270',
  'operator': 'https://cdn.shopify.com/s/files/1/0567/5237/3945/files/Operator_-_Female.png?v=1747583270',
  'elite': 'https://cdn.shopify.com/s/files/1/0567/5237/3945/files/Elite_Female.png?v=1747583270'
};

// Mock badges data
export const badges: Badge[] = [
  {
    id: 'recruit',
    name: 'Recruit',
    description: 'Achieved 5-9 pull-ups',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0567/5237/3945/files/Recruit.png?v=1746488886',
    criteria: {
      type: 'pullUps',
      value: 5,
    },
  },
  {
    id: 'proven',
    name: 'Proven',
    description: 'Achieved 10-14 pull-ups',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0567/5237/3945/files/Proven.png?v=1746488886',
    criteria: {
      type: 'pullUps',
      value: 10,
    },
  },
  {
    id: 'hardened',
    name: 'Hardened',
    description: 'Achieved 15-19 pull-ups',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0567/5237/3945/files/Hardened.png?v=1746488887',
    criteria: {
      type: 'pullUps',
      value: 15,
    },
  },
  {
    id: 'operator',
    name: 'Operator',
    description: 'Achieved 20-24 pull-ups',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0567/5237/3945/files/Operator.png?v=1746488886',
    criteria: {
      type: 'pullUps',
      value: 20,
    },
  },
  {
    id: 'elite',
    name: 'Elite',
    description: 'Achieved 25+ pull-ups',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0567/5237/3945/files/Elite.png?v=1746488886',
    criteria: {
      type: 'pullUps',
      value: 25,
    },
  },
];

// Mock submissions data
export const mockSubmissions: Submission[] = [
  {
    id: '1',
    fullName: 'John Smith',
    email: 'john@example.com',
    age: 28,
    gender: 'Male',
    region: 'North America',
    clubAffiliation: 'Battle Bunker Elite',
    pullUpCount: 30,
    videoLink: 'https://youtube.com/watch?v=abc123',
    submissionDate: '2025-06-12T14:30:00Z',
    status: 'Approved',
    featured: true,
  },
  {
    id: '2',
    fullName: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '555-123-4567',
    age: 32,
    gender: 'Female',
    region: 'Europe',
    clubAffiliation: 'Iron Warriors',
    pullUpCount: 25,
    videoLink: 'https://instagram.com/p/xyz789',
    submissionDate: '2025-06-12T16:45:00Z',
    status: 'Approved',
    featured: true,
  },
  {
    id: '3',
    fullName: 'Mike Williams',
    email: 'mike@example.com',
    age: 35,
    gender: 'Male',
    region: 'North America',
    clubAffiliation: 'CrossFit Central',
    pullUpCount: 28,
    videoLink: 'https://youtube.com/watch?v=def456',
    submissionDate: '2025-06-11T10:15:00Z',
    status: 'Approved',
    featured: true,
  },
  {
    id: '4',
    fullName: 'Emily Davis',
    email: 'emily@example.com',
    phone: '555-987-6543',
    age: 29,
    gender: 'Female',
    region: 'Asia',
    clubAffiliation: 'Battle Bunker Elite',
    pullUpCount: 22,
    videoLink: 'https://tiktok.com/@user/video/456789',
    submissionDate: '2025-06-11T09:30:00Z',
    status: 'Approved',
    featured: true,
  },
  {
    id: '5',
    fullName: 'Alex Chen',
    email: 'alex@example.com',
    age: 27,
    gender: 'Male',
    region: 'Asia',
    clubAffiliation: 'No Affiliation',
    pullUpCount: 20,
    videoLink: 'https://youtube.com/watch?v=ghi789',
    submissionDate: '2025-06-10T14:00:00Z',
    status: 'Approved',
    featured: true,
  },
  // More submissions with identical scores (to demonstrate grouping)
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `${i + 6}`,
    fullName: `Contestant ${i + 6}`,
    email: `contestant${i + 6}@example.com`,
    age: 25 + i,
    gender: i % 2 === 0 ? 'Male' : 'Female',
    region: regions[i % regions.length],
    clubAffiliation: clubs[i % clubs.length],
    pullUpCount: 15, // Same pull-up count to demonstrate grouping
    videoLink: `https://youtube.com/watch?v=abc${i + 100}`,
    submissionDate: `2025-06-0${9 - (i % 9)}T${10 + i}:00:00Z`,
    status: 'Approved',
    featured: true,
  })),
  {
    id: '16',
    fullName: 'Taylor Reed',
    email: 'taylor@example.com',
    phone: '555-111-2222',
    age: 31,
    gender: 'Other',
    region: 'Oceania',
    clubAffiliation: 'Tactical Fitness',
    pullUpCount: 23,
    videoLink: 'https://instagram.com/p/abc123',
    submissionDate: '2025-06-09T11:30:00Z',
    status: 'Pending',
    featured: false,
  },
  {
    id: '17',
    fullName: 'Jordan Lee',
    email: 'jordan@example.com',
    age: 29,
    gender: 'Male',
    region: 'Middle East',
    clubAffiliation: 'Pull-Up Kings',
    pullUpCount: 18,
    videoLink: 'https://tiktok.com/@user/video/123456',
    submissionDate: '2025-06-08T16:15:00Z',
    status: 'Rejected',
    featured: false,
  },
];

// Helper function to get age groups
export const getAgeGroups = () => [
  'Under 18',
  '18-24',
  '25-29',
  '30-39',
  '40-49',
  '50+'
];

// Helper function to get submission status text and color
export const getStatusInfo = (status: 'Pending' | 'Approved' | 'Rejected') => {
  switch (status) {
    case 'Approved':
      return { text: 'Approved', color: 'bg-green-500' };
    case 'Rejected':
      return { text: 'Rejected', color: 'bg-red-500' };
    default:
      return { text: 'Pending Review', color: 'bg-yellow-500' };
  }
};

// Helper function to determine badges for a submission
export const getBadgesForSubmission = (submission: Submission) => {
  const pullUps = submission.actualPullUpCount ?? submission.pullUpCount;
  
  // Determine which badge to display
  let badgeId: string | null = null;
  if (pullUps >= 25) badgeId = 'elite';
  else if (pullUps >= 20) badgeId = 'operator';
  else if (pullUps >= 15) badgeId = 'hardened';
  else if (pullUps >= 10) badgeId = 'proven';
  else if (pullUps >= 5) badgeId = 'recruit';
  else return [];
  
  // Find the base badge
  const badge = badges.find(b => b.id === badgeId)!;
  
  // Create a copy of the badge with the gender-specific image URL
  const badgeCopy = { ...badge };
  
  // Use female badge image URL if the submitter is female
  if (submission.gender === 'Female' && badgeId in femaleBadgeUrls) {
    badgeCopy.imageUrl = femaleBadgeUrls[badgeId as keyof typeof femaleBadgeUrls];
  }
  
  return [badgeCopy];
};