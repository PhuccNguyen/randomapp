// components/ControlPanel/types.ts
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

export interface ControlState {
  status: 'idle' | 'spinning' | 'stopped' | 'completed';
  currentStep: number;
  targetId?: string;
  history: HistoryItem[];
}

export interface HistoryItem {
  step: number;
  result: string;
  timestamp: Date;
}

export interface SocketEvents {
  'trigger:spin': void;
  'trigger:stop': void;
  'trigger:next': void;
  'override:target': { targetId: string };
  'state:update': ControlState;
  'result:reveal': {
    judge: JudgeItem;
    question: string;
  };
}
