export interface Submission {
  id: string;
  userId: string;
  fullName?: string;
  email?: string;
  phone?: string;
  age?: number;
  gender?: "Male" | "Female" | "Other";
  region?: string;
  clubAffiliation?: string;
  pullUpCount: number;
  actualPullUpCount?: number;
  videoLink: string;
  submissionDate: string;
  status: "Pending" | "Approved" | "Rejected";
  featured?: boolean;
  socialHandle?: string;
  notes?: string;
}

export interface LeaderboardFilters {
  club?: string;
  ageGroup?: string;
  gender?: string;
  badge?: string;
  region?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  criteria: {
    type: "pullUps" | "age" | "club";
    value: string | number;
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
