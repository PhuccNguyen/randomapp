// Enum cho các loại dịch vụ
export enum UserTier {
  PERSONAL = 'PERSONAL',      // Cá nhân - quay vui
  BUSINESS = 'BUSINESS',      // Doanh nghiệp - quay thưởng  
  ENTERPRISE = 'ENTERPRISE'   // Sự kiện lớn - Hoa Hậu/Gameshow
}

// Enum cho subscription status
export enum SubscriptionStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE', 
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

// Interface cho pricing limits
interface TierLimits {
  maxCampaigns: number;
  maxParticipants: number;
  maxItems: number;
  features: string[];
  priceMonthly: number;
  priceYearly: number;
}

// Pricing tiers configuration
export const TIER_LIMITS: Record<UserTier, TierLimits> = {
  [UserTier.PERSONAL]: {
    maxCampaigns: 3,
    maxParticipants: 50,
    maxItems: 8,
    features: ['Basic spinning wheel', 'Simple questions', 'Basic analytics'],
    priceMonthly: 0, // Free
    priceYearly: 0
  },
  [UserTier.BUSINESS]: {
    maxCampaigns: 20,
    maxParticipants: 500,
    maxItems: 20,
    features: ['Advanced wheel design', 'Custom branding', 'Prize management', 'Analytics dashboard'],
    priceMonthly: 99000, // 99k VND
    priceYearly: 990000  // 990k VND (2 tháng free)
  },
  [UserTier.ENTERPRISE]: {
    maxCampaigns: -1, // Unlimited
    maxParticipants: -1,
    maxItems: -1,
    features: ['Custom development', 'Live event support', 'API access', 'Premium support', '24/7 assistance'],
    priceMonthly: 499000, // 499k VND
    priceYearly: 4990000  // 4.99M VND (2 tháng free)
  }
};

// Interface cho User document
export interface IUser {
  _id?: string;
  email: string;
  username: string;
  password?: string; // Không trả về trong API responses
  name: string;
  phone?: string;
  tier: UserTier;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: Date;
  subscriptionEndsAt?: Date;
  companyName?: string;
  companySize?: string;
  industry?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpiresAt?: Date;
}

// Interface cho registration form
export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone: string;
  tier: UserTier;
  companyName: string;
  companySize: string;
  industry: string;
}

// Interface cho login form
export interface LoginForm {
  email: string;
  password: string;
}

// Interface cho API responses
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: Omit<IUser, 'password'>;
  token?: string;
}