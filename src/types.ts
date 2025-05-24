// User and Profile types
export interface User {
  id: string;
  email: string;
  role?: 'user' | 'admin';
}

export interface Profile {
  id: string;
  user_id?: string;
  email?: string;
  full_name?: string;
  role?: string;
  is_paid?: boolean;
  created_at?: string;
  // Additional profile fields
  isProfileCompleted?: boolean;
  socialMedia?: string | null;
  socialHandle?: string | null;
  streetAddress?: string | null;
  apartment?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
}

// Submission type
export interface Submission {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  phone?: string;
  age?: number;
  gender: string;
  region: string;
  clubAffiliation: string;
  pullUpCount: number;
  actualPullUpCount?: number;
  videoLink: string;
  submissionDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  featured: boolean;
  socialHandle?: string;
  notes?: string;
}

// Badge type
export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  criteria: {
    type: string;
    value: number;
  };
}

// Leaderboard filter type
export interface LeaderboardFilters {
  club?: string;
  gender?: string;
  region?: string;
  ageGroup?: string;
  badge?: string;
}

// Analytics event type
export interface AnalyticsEvent {
  action: string;
  category: string;
  label: string;
  value?: number;
} 