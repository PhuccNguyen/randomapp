export interface JudgeItem {
  id: string;
  name: string;
  hasQuestion: boolean;
  imageUrl?: string;
  color?: string;
}

export interface DirectorScript {
  step: number;
  contestant: string;
  target_judge_id: string;
  question_content: string;
}

export interface Campaign {
  _id?: string;
  name: string;
  items: JudgeItem[];
  director_script?: DirectorScript[];
  mode: 'wheel' | 'reel' | 'battle' | 'mystery';
  displayMode: 'random' | 'director';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Session {
  _id?: string;
  campaignId: string;
  currentStep: number;
  status: 'idle' | 'spinning' | 'stopped' | 'completed';
  targetId?: string;
  history: {
    step: number;
    result: string;
    timestamp: Date;
  }[];
}

export interface SocketEvents {
  // Client -> Server
  'trigger:spin': void;
  'trigger:stop': void;
  'trigger:next': void;
  'override:target': { targetId: string };
  
  // Server -> Client
  'state:update': {
    status: 'idle' | 'spinning' | 'stopped';
    currentStep: number;
    targetId?: string;
  };
  'result:reveal': {
    judge: JudgeItem;
    question: string;
  };
}
