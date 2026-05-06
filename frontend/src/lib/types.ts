export type User = {
  id: string;
  fullName: string;
  email: string;
  role: "member" | "trainer" | "admin";
};

export type NotificationOverview = {
  unreadCount: number;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    notificationType: string;
    isRead: boolean;
    createdAt: string;
  }>;
};

export type ManagedUsersOverview = {
  summary: {
    total_users: string;
    total_members: string;
    total_trainers: string;
    total_admins: string;
  };
  users: Array<{
    id: string;
    full_name: string;
    username: string | null;
    email: string;
    role: "member" | "trainer" | "admin";
    phone: string | null;
    gender: string | null;
    created_at: string;
    membership_type: string | null;
    trainer_title: string | null;
    hourly_rate: string | null;
    specialties: string[] | null;
  }>;
};

export type DashboardData = {
  profile: {
    full_name: string;
    email: string;
    role: "member" | "trainer" | "admin";
    membership_type: string | null;
    end_date: string | null;
    is_active: boolean | null;
  };
  wallet: {
    points_balance: number;
    lifetime_points: number;
    tier_name: string;
  };
  stats: {
    totalBookings: number;
    attendedClasses: number;
    reviewedTrainers: number;
  };
  roleStats: Record<string, string | number>;
};

export type RewardsData = {
  wallet: {
    points_balance: number;
    lifetime_points: number;
    tier_name: string;
  };
  badges: Array<{
    name: string;
    description: string;
    icon: string;
    earned_at: string;
  }>;
  rewards: Array<{
    id: string;
    name: string;
    description: string;
    points_cost: number;
    reward_type: string;
  }>;
  transactions: Array<{
    reason: string;
    points: number;
    transaction_type: string;
    created_at: string;
  }>;
};

export type RewardRedeemResult = {
  message: string;
  rewardName: string;
  redeemCode: string;
  qrUrl: string;
};

export type PaymentOverview = {
  role: "member" | "trainer" | "admin";
  summary: Record<string, string | null>;
  recentPayments: Array<{
    id: string;
    amount: string;
    payment_category: string;
    payment_method: string;
    payment_status: string;
    description?: string | null;
    paid_at: string;
    invoice_no?: string | null;
    card_last4?: string | null;
    membership_months?: number | null;
    session_count?: number | null;
    trainer_name?: string | null;
    member_name?: string | null;
    trainer_share?: string | null;
    gym_share?: string | null;
  }>;
  membershipPlans: Array<{
    code: string;
    label: string;
    months: number;
    amount: string;
  }>;
  personalTrainingOffers: Array<{
    trainerId: string;
    trainerName: string;
    title: string;
    hourlyRate: string;
    packages: Array<{
      sessionCount: number;
      label: string;
      amount: string;
    }>;
  }>;
};

export type ProgramOverview = {
  role: "member" | "trainer" | "admin";
  assignableMembers: Array<{
    id: string;
    full_name: string;
    username: string | null;
    email: string;
  }>;
  programs: Array<{
    id: string;
    title: string;
    goal_summary: string;
    notes: string | null;
    status: string;
    created_at: string;
    member_name: string;
    trainer_name: string;
    days: Array<{
      day_index: number;
      day_label: string;
      focus_area: string;
      exercise_name: string;
      sets: string;
      reps: string;
      rest_seconds: number;
      notes: string | null;
    }>;
  }>;
};

export type RecommendationOverview = {
  role: "member" | "trainer" | "admin";
  insights: Array<{
    title: string;
    description: string;
  }>;
};

export type AttendanceOverview = {
  records: Array<{
    id: string;
    full_name: string;
    check_in_at: string;
    check_out_at: string | null;
    access_method: string;
  }>;
  hourChart: Array<{
    hour_label: string;
    total: string;
  }>;
  dayChart: Array<{
    day_label: string;
    total: string;
  }>;
};

export type EntryPassData = {
  fullName: string;
  username: string | null;
  passToken: string;
  qrUrl: string;
  expiresInHours: number;
  currentStatus: string;
  lastActionAt: string | null;
};

export type EntryPassScanResult = {
  action: "check_in" | "check_out";
  fullName: string;
  message: string;
};

export type RecentEntryScanOverview = {
  records: Array<{
    id: string;
    fullName: string;
    status: string;
    checkInAt: string;
    checkOutAt: string | null;
    accessMethod: string;
  }>;
};

export type Trainer = {
  id: string;
  full_name: string;
  avatar_url: string;
  title: string;
  specialties: string[];
  bio: string;
  hourly_rate: string;
  years_of_experience: number;
  rating_average: string;
  rating_count: number;
  certificates: Array<{ name: string; issuer: string }>;
  reviews: Array<{
    full_name: string;
    rating: number;
    comment: string;
    created_at: string;
  }>;
};

export type GymClass = {
  id: string;
  name: string;
  category: string;
  description: string;
  capacity: number;
  starts_at: string;
  ends_at: string;
  room_name: string;
  trainer_name: string;
  reserved_count: number;
  is_booked: boolean;
};
