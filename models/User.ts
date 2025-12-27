// models/User.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserTier, SubscriptionStatus, TIER_LIMITS } from '@/lib/user-types';

// ============== 1. INTERFACES ==============

export interface IUser extends Document {
  email: string;
  username: string;
  password: string;
  name: string;
  phone?: string;
  
  // Business Fields
  tier: UserTier;
  subscriptionStatus: SubscriptionStatus;
  trialUsed: boolean;
  trialStartedAt?: Date;
  trialEndsAt?: Date;
  subscriptionEndsAt?: Date;
  
  // Company Info
  companyName?: string;
  companySize?: string;
  industry?: string;
  
  // Usage & Status
  campaignsCount: number;
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpiresAt?: Date;
  lastLoginAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  startTrial(): Promise<void>;
  canCreateCampaign(): boolean;
  upgradeUsage(): Promise<void>;
  
  // Virtuals
  isSubscriptionActive: boolean;
  tierLimits: typeof TIER_LIMITS[UserTier];
}

// ============== 2. SCHEMA DEFINITION ==============

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // SECURITY: Không bao giờ trả về password trừ khi gọi .select('+password')
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  tier: {
    type: String,
    enum: Object.values(UserTier),
    default: UserTier.PERSONAL
  },
  subscriptionStatus: {
    type: String,
    enum: Object.values(SubscriptionStatus),
    default: SubscriptionStatus.ACTIVE // Dev Mode: Mặc định Active để test dễ dàng
  },
  trialUsed: {
    type: Boolean,
    default: false
  },
  trialStartedAt: { type: Date },
  trialEndsAt: { type: Date },
  subscriptionEndsAt: {
    type: Date,
    default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Default 1 year
  },
  companyName: String,
  companySize: String,
  industry: String,
  campaignsCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpiresAt: Date,
  lastLoginAt: Date
}, {
  timestamps: true,
  collection: 'users',
  // AUTOMATION: Tự động xóa field nhạy cảm khi convert sang JSON
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id.toString(); // Convert to string and assign to id
      delete (ret as any)._id; // Then delete _id
      delete (ret as any).__v;
      delete (ret as any).password; // An toàn tuyệt đối
      delete (ret as any).emailVerificationToken;
      delete (ret as any).resetPasswordToken;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// ============== 3. INDEXES ==============
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ tier: 1, subscriptionStatus: 1 });

// ============== 4. MIDDLEWARE (HOOKS) ==============

// ✅ Pre-save hook - FIXED
UserSchema.pre('save', async function() {
  // Only hash if password is modified AND exists
  if (!this.isModified('password') || !this.password) return;
  
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ============== 5. METHODS ==============
// ✅ comparePassword method - FIXED
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  // Guard clause
  if (!this.password || !candidatePassword) {
    console.error('❌ Missing password for comparison');
    return false;
  }
  
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.startTrial = async function(): Promise<void> {
  if (!this.trialUsed) {
    this.trialUsed = true;
    this.trialStartedAt = new Date();
    this.trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days trial
    this.subscriptionStatus = SubscriptionStatus.TRIAL;
    await this.save();
  }
};

UserSchema.methods.canCreateCampaign = function(): boolean {
  const limits = TIER_LIMITS[this.tier as UserTier];
  if (limits.maxCampaigns === -1) return true; // Unlimited
  return this.campaignsCount < limits.maxCampaigns;
};

UserSchema.methods.upgradeUsage = async function(): Promise<void> {
  this.campaignsCount += 1;
  await this.save();
};

// ============== 6. VIRTUALS ==============

UserSchema.virtual('isSubscriptionActive').get(function() {
  // Rule 1: Enterprise luôn luôn Active (VIP Priority)
  if (this.tier === UserTier.ENTERPRISE) return true;
  
  // Rule 2: Active Status
  if (this.subscriptionStatus === SubscriptionStatus.ACTIVE) return true;
  
  // Rule 3: Trial Check
  if (this.subscriptionStatus === SubscriptionStatus.TRIAL) {
    return this.trialEndsAt ? this.trialEndsAt > new Date() : false;
  }
  
  return false;
});

UserSchema.virtual('tierLimits').get(function() {
  return TIER_LIMITS[this.tier];
});

// ============== 7. EXPORT ==============
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;