export interface Submission {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  region: string;
  clubAffiliation: string;
  pullUpCount: number;
  actualPullUpCount?: number;
  videoUrl: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: string;
  approvedAt?: string;
  notes?: string;
  featured?: boolean;
  socialHandle?: string;
}

export interface LeaderboardFilters {
  gender?: string;
  region?: string;
  club?: string;
  timeframe?: string;
  ageGroup?: string;
  badge?: string;
}

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

export interface FormState {
  step: number;
  fullName: string;
  email: string;
  phone: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  region: string;
  clubAffiliation: string;
  otherClubAffiliation: string;
  pullUpCount: number;
  videoLink: string;
  videoConfirmed: boolean;
  videoAuthenticity: boolean;
  socialHandle?: string;
  consentChecked: boolean;
  isSubmitting: boolean;
  paymentStatus: "idle" | "processing" | "completed" | "failed";
  errorMessage: string;
  subscriptionType: "monthly" | "annual";
}

export interface Profile {
  id: string;
  userId: string;
  email: string;
  fullName?: string;
  socialMedia?: string;
  age?: number;
  gender?: string;
  organization?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  club?: string;
  stripeCustomerId?: string;
  isPaid: boolean;
  role: 'user' | 'admin';
  badges: Badge[];
  createdAt: string;
  updatedAt: string;
  isProfileCompleted?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
}

export interface PaymentHistory {
  id: string;
  userId: string;
  amount: number;
  status: 'succeeded' | 'failed' | 'pending';
  createdAt: string;
}

export interface EventParams {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

export interface AdminStats {
  totalUsers: number;
  paidUsers: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
}

export interface SubmitVideoParams {
  videoUrl: string;
  pullUpCount: number;
  userId: string;
}

export interface UseSubmissionsOptions {
  status?: 'Pending' | 'Approved' | 'Rejected' | 'all';
  limit?: number;
}
