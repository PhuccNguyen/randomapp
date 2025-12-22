import { UserTier, TIER_LIMITS } from '@/lib/user-types';

interface User {
  tier: UserTier;
  campaignsCount?: number;
  subscriptionStatus?: string;
}

interface Campaign {
  participantCount?: number;
  itemCount?: number;
}

// Kiểm tra user có thể tạo campaign mới không
export function canCreateCampaign(user: User): { allowed: boolean; reason?: string } {
  const limits = TIER_LIMITS[user.tier];
  const currentCount = user.campaignsCount || 0;
  
  // Unlimited campaigns cho Enterprise
  if (limits.maxCampaigns === -1) {
    return { allowed: true };
  }
  
  // Check limits
  if (currentCount >= limits.maxCampaigns) {
    return { 
      allowed: false, 
      reason: `Đã đạt giới hạn ${limits.maxCampaigns} campaigns cho gói ${getTierDisplayName(user.tier)}. Vui lòng nâng cấp gói.`
    };
  }
  
  return { allowed: true };
}

// Kiểm tra campaign có vượt quá limits không
export function validateCampaignLimits(user: User, campaign: Campaign): { valid: boolean; reason?: string } {
  const limits = TIER_LIMITS[user.tier];
  
  // Check participant limit
  if (limits.maxParticipants !== -1 && campaign.participantCount && campaign.participantCount > limits.maxParticipants) {
    return {
      valid: false,
      reason: `Gói ${getTierDisplayName(user.tier)} chỉ cho phép tối đa ${limits.maxParticipants} người tham gia.`
    };
  }
  
  // Check item limit
  if (limits.maxItems !== -1 && campaign.itemCount && campaign.itemCount > limits.maxItems) {
    return {
      valid: false,
      reason: `Gói ${getTierDisplayName(user.tier)} chỉ cho phép tối đa ${limits.maxItems} items trong vòng quay.`
    };
  }
  
  return { valid: true };
}

// Lấy tên hiển thị tier
export function getTierDisplayName(tier: UserTier): string {
  switch (tier) {
    case UserTier.PERSONAL:
      return 'Cá nhân (quay vui)';
    case UserTier.BUSINESS:
      return 'Doanh nghiệp (quay thưởng)';
    case UserTier.ENTERPRISE:
      return 'Sự kiện lớn (Hoa Hậu/Gameshow)';
    default:
      return tier;
  }
}

// Lấy features dựa theo tier
export function getTierFeatures(tier: UserTier): string[] {
  return TIER_LIMITS[tier].features;
}

// Kiểm tra user có quyền sử dụng feature không
export function canUseFeature(user: User, feature: string): boolean {
  const features = getTierFeatures(user.tier);
  return features.some(f => f.toLowerCase().includes(feature.toLowerCase()));
}

// Lấy thông tin giới hạn tier hiện tại
export function getTierLimitsInfo(tier: UserTier) {
  const limits = TIER_LIMITS[tier];
  return {
    displayName: getTierDisplayName(tier),
    maxCampaigns: limits.maxCampaigns === -1 ? 'Không giới hạn' : limits.maxCampaigns,
    maxParticipants: limits.maxParticipants === -1 ? 'Không giới hạn' : limits.maxParticipants,
    maxItems: limits.maxItems === -1 ? 'Không giới hạn' : limits.maxItems,
    features: limits.features,
    priceMonthly: limits.priceMonthly,
    priceYearly: limits.priceYearly
  };
}

// Recommend tier upgrade
export function getUpgradeRecommendation(currentTier: UserTier, requiredFeature?: string): UserTier | null {
  if (currentTier === UserTier.ENTERPRISE) return null;
  
  if (currentTier === UserTier.PERSONAL) {
    return UserTier.BUSINESS;
  }
  
  if (currentTier === UserTier.BUSINESS) {
    return UserTier.ENTERPRISE;
  }
  
  return null;
}