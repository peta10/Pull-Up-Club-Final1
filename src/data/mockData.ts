import { Submission, Badge } from '../types';

export const clubs = [
  'Elite Fitness',
  'Power Gym',
  'Dragon Fitness',
  'Aussie Strength',
  'Power House',
  'CrossFit Central',
  'Iron Warriors',
  'Strength Lab',
  'Peak Performance',
  'Fitness First'
];

export const regions = [
  'North America',
  'South America',
  'Europe',
  'Asia',
  'Africa',
  'Australia',
  'Middle East'
];

export const getAgeGroups = () => [
  '18-24',
  '25-34',
  '35-44',
  '45-54',
  '55+'
];

export const mockSubmissions: Submission[] = [
  {
    id: '1',
    userId: 'user1',
    fullName: 'John Smith',
    email: 'john@example.com',
    age: 25,
    gender: 'Male',
    region: 'North America',
    clubAffiliation: 'Elite Fitness',
    pullUpCount: 50,
    actualPullUpCount: 50,
    videoUrl: 'https://youtube.com/watch?v=123',
    status: 'Approved',
    submittedAt: '2025-01-01',
    approvedAt: '2025-01-02',
    notes: 'Great form!'
  },
  {
    id: '2',
    userId: 'user2',
    fullName: 'Sarah Johnson',
    email: 'sarah@example.com',
    age: 28,
    gender: 'Female',
    region: 'Europe',
    clubAffiliation: 'Power Gym',
    pullUpCount: 45,
    actualPullUpCount: 45,
    videoUrl: 'https://youtube.com/watch?v=456',
    status: 'Approved',
    submittedAt: '2025-01-02',
    approvedAt: '2025-01-03',
    notes: 'Excellent performance'
  },
  {
    id: '3',
    userId: 'user3',
    fullName: 'Mike Wilson',
    email: 'mike@example.com',
    age: 32,
    gender: 'Male',
    region: 'Asia',
    clubAffiliation: 'Dragon Fitness',
    pullUpCount: 40,
    actualPullUpCount: 40,
    videoUrl: 'https://youtube.com/watch?v=789',
    status: 'Approved',
    submittedAt: '2025-01-03',
    approvedAt: '2025-01-04',
    notes: 'Perfect execution'
  },
  {
    id: '4',
    userId: 'user4',
    fullName: 'Emma Davis',
    email: 'emma@example.com',
    age: 27,
    gender: 'Female',
    region: 'Australia',
    clubAffiliation: 'Aussie Strength',
    pullUpCount: 35,
    actualPullUpCount: 35,
    videoUrl: 'https://youtube.com/watch?v=012',
    status: 'Approved',
    submittedAt: '2025-01-04',
    approvedAt: '2025-01-05',
    notes: 'Outstanding effort'
  },
  {
    id: '5',
    userId: 'user5',
    fullName: 'James Brown',
    email: 'james@example.com',
    age: 30,
    gender: 'Male',
    region: 'South America',
    clubAffiliation: 'Power House',
    pullUpCount: 30,
    actualPullUpCount: 30,
    videoUrl: 'https://youtube.com/watch?v=345',
    status: 'Approved',
    submittedAt: '2025-01-05',
    approvedAt: '2025-01-06',
    notes: 'Great technique'
  },
];

const badges: Badge[] = [
  {
    id: 'recruit',
    name: 'Recruit',
    description: 'Completed 5 pull-ups',
    imageUrl: '/Male-Badges/Recruit.png',
    criteria: {
      type: 'pullUps',
      value: 5
    }
  },
  {
    id: 'proven',
    name: 'Proven',
    description: 'Completed 10 pull-ups',
    imageUrl: '/Male-Badges/Proven.png',
    criteria: {
      type: 'pullUps',
      value: 10
    }
  },
  {
    id: 'hardened',
    name: 'Hardened',
    description: 'Completed 15 pull-ups',
    imageUrl: '/Male-Badges/Hardened.png',
    criteria: {
      type: 'pullUps',
      value: 15
    }
  },
  {
    id: 'operator',
    name: 'Operator',
    description: 'Completed 20 pull-ups',
    imageUrl: '/Male-Badges/Operator.png',
    criteria: {
      type: 'pullUps',
      value: 20
    }
  },
  {
    id: 'elite',
    name: 'Elite',
    description: 'Completed 25 pull-ups',
    imageUrl: '/Male-Badges/Elite.png',
    criteria: {
      type: 'pullUps',
      value: 25
    }
  }
];

export const getBadgesForSubmission = (pullUpCount: number): Badge[] => {
  return badges.filter(badge => badge.criteria.value <= pullUpCount);
};

export default badges;

export const getStatusInfo = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return {
        label: 'Pending Review',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-500',
        description: 'Your submission is being reviewed by our team.'
      };
    case 'approved':
      return {
        label: 'Approved',
        color: 'bg-green-500',
        textColor: 'text-green-500',
        description: 'Your submission has been approved!'
      };
    case 'rejected':
      return {
        label: 'Rejected',
        color: 'bg-red-500',
        textColor: 'text-red-500',
        description: 'Your submission was not approved. Please check the feedback and try again.'
      };
    default:
      return {
        label: 'Unknown',
        color: 'bg-gray-500',
        textColor: 'text-gray-500',
        description: 'Status unknown'
      };
  }
}; 