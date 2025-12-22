import { Schema, model, models } from 'mongoose';

const SessionSchema = new Schema({
  campaignId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Campaign',
    required: true 
  },
  currentStep: { 
    type: Number, 
    default: 1 
  },
  status: { 
    type: String, 
    enum: ['idle', 'spinning', 'stopped', 'completed'],
    default: 'idle'
  },
  targetId: { type: String },
  history: [{
    step: Number,
    result: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Session = models.Session || model('Session', SessionSchema);

export default Session;
