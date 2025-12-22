// models/Campaign.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

// ============== 1. INTERFACES (TYPESCRIPT) ==============

export interface IJudgeItem {
  id: string;
  name: string;
  hasQuestion: boolean;
  imageUrl?: string;
  color?: string; // Hex code (e.g., #FF0000)
}

export interface IDirectorScript {
  step: number;
  contestant: string;
  target_judge_id: string;
  question_content: string;
}

export interface ICampaign extends Document {
  name: string;
  description?: string; // Added field
  items: IJudgeItem[];
  director_script?: IDirectorScript[];
  mode: 'wheel' | 'reel' | 'battle' | 'mystery';
  displayMode: 'random' | 'director';
  owner: mongoose.Types.ObjectId;
  isPublic: boolean;
  isActive: boolean;
  settings: {
    spinDuration: number;
    soundEnabled: boolean;
    confettiEnabled: boolean;
    backgroundColor?: string;
    textColor?: string;
  };
  analytics: {
    totalSpins: number;
    uniqueViewers: number;
    lastAccessedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  isDirectorModeValid: boolean;
}

// ============== 2. SUB-SCHEMAS ==============

const JudgeItemSchema = new Schema<IJudgeItem>({
  id: { type: String, required: true },
  name: { 
    type: String, 
    required: true, 
    trim: true, 
    minlength: 1, 
    maxlength: 100 
  },
  hasQuestion: { type: Boolean, default: false },
  imageUrl: { type: String, trim: true },
  color: { 
    type: String, 
    trim: true,
    // Validate Hex Color format (e.g. #FFF or #FFFFFF)
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color code'] 
  }
}, { _id: false });

const DirectorScriptSchema = new Schema<IDirectorScript>({
  step: { type: Number, required: true, min: 1 },
  contestant: { type: String, required: true, trim: true },
  target_judge_id: { type: String, required: true },
  question_content: { type: String, required: true, trim: true }
}, { _id: false });

// ============== 3. MAIN SCHEMA ==============

const CampaignSchema = new Schema<ICampaign>({
  name: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true,
    minlength: [3, 'Campaign name must be at least 3 characters'],
    maxlength: [100, 'Campaign name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  items: {
    type: [JudgeItemSchema],
    required: [true, 'Campaign must have at least one judge'],
    validate: {
      validator: function(items: IJudgeItem[]) {
        return items.length >= 1 && items.length <= 100;
      },
      message: 'Campaign must have between 1 and 100 judges'
    }
  },
  director_script: {
    type: [DirectorScriptSchema],
    default: []
  },
  mode: {
    type: String,
    enum: ['wheel', 'reel', 'battle', 'mystery'],
    default: 'wheel'
  },
  displayMode: {
    type: String,
    enum: ['random', 'director'],
    default: 'random'
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Campaign must have an owner']
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    spinDuration: { type: Number, default: 3000, min: 1000, max: 10000 },
    soundEnabled: { type: Boolean, default: true },
    confettiEnabled: { type: Boolean, default: true },
    backgroundColor: { 
      type: String, 
      trim: true,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid background hex color']
    },
    textColor: { 
      type: String, 
      trim: true,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid text hex color']
    }
  },
  analytics: {
    totalSpins: { type: Number, default: 0 },
    uniqueViewers: { type: Number, default: 0 },
    lastAccessedAt: { type: Date }
  }
}, {
  timestamps: true,
  collection: 'campaigns',
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret._id; // Frontend thích dùng 'id' hơn '_id'
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// ============== 4. INDEXES & PERFORMANCE ==============
CampaignSchema.index({ owner: 1, createdAt: -1 }); // Lấy danh sách campaign của user
CampaignSchema.index({ isPublic: 1, isActive: 1 }); // Lọc campaign public
CampaignSchema.index({ name: 1, owner: 1 }); // Tìm kiếm

// ============== 5. MIDDLEWARE (HOOKS) ==============

// Validate Logic trước khi lưu (Deep Tech Logic)
CampaignSchema.pre('save', async function() {
  // 1. Validate Director Mode (only if script exists)
  if (this.displayMode === 'director' && this.director_script && this.director_script.length > 0) {
    // Đảm bảo script trỏ đúng vào các Judge ID đang tồn tại
    const judgeIds = new Set(this.items.map(item => item.id));
    const invalidTargets = this.director_script.filter(
      script => !judgeIds.has(script.target_judge_id)
    );

    if (invalidTargets.length > 0) {
      throw new Error(
        `Invalid target judge IDs in script: ${invalidTargets.map(s => s.target_judge_id).join(', ')}`
      );
    }
  }

  // 2. Validate Unique Judge IDs
  const judgeIds = this.items.map(item => item.id);
  const uniqueIds = new Set(judgeIds);
  if (judgeIds.length !== uniqueIds.size) {
    throw new Error('Duplicate judge IDs detected. Each judge must have a unique ID.');
  }
});

// ============== 6. VIRTUALS ==============

CampaignSchema.virtual('isDirectorModeValid').get(function() {
  if (this.displayMode !== 'director') return true;
  // Allow empty script during creation - script can be added later
  if (!this.director_script || this.director_script.length === 0) return true;
  
  const judgeIds = new Set(this.items.map(item => item.id));
  return this.director_script.every(script => judgeIds.has(script.target_judge_id));
});

// ============== 7. EXPORT ==============
const Campaign: Model<ICampaign> = mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', CampaignSchema);

export default Campaign;