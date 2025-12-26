// models/User.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserTier, SubscriptionStatus, TIER_LIMITS } from '@/lib/user-types';

// ============== 1. INTERFACES ==============

export interface IUser extends Document {
  email: string;
  username?: string;
  password?: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  image?: string;
  
  // OAuth Fields
  provider?: string; // 'google', 'email'
  googleId?: string;
  
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
  emailVerified?: Date;
  emailVerificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpiresAt?: Date;
  lastLoginAt?: Date;
  profileComplete?: boolean;
  
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
    unique: true,
    sparse: true, // Cho phép null cho OAuth users
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
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
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  
  // OAuth Fields
  provider: {
    type: String,
    enum: ['google', 'email', 'github'],
    default: 'email'
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  
  tier: {
    type: String,
    enum: Object.values(UserTier),
    default: UserTier.PERSONAL
  },
  subscriptionStatus: {
    type: String,
    enum: Object.values(SubscriptionStatus),
    default: SubscriptionStatus.ACTIVE
  },
  trialUsed: {
    type: Boolean,
    default: false
  },
  trialStartedAt: { type: Date },
  trialEndsAt: { type: Date },
  subscriptionEndsAt: {
    type: Date,
    default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
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
  emailVerified: Date,
  emailVerificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpiresAt: Date,
  lastLoginAt: Date,
  profileComplete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'users',
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.resetPasswordToken;
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