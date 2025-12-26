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
    notes?: string; // Ghi chú thêm

}

export interface ControlState {
  status: 'idle' | 'spinning' | 'stopped' | 'completed';
  currentStep: number;
  targetId?: string;
  history: HistoryItem[];
  spinDuration: number; // Thêm duration vào state
  script?: DirectorScript[]; // Thêm script vào state
  items?: JudgeItem[]; // Thêm danh sách items cho random server-side
}

export interface HistoryItem {
  step: number;
  result: string;
  resultId: string;
  timestamp: number;
  contestant?: string; // Từ kịch bản
  question?: string; // Từ kịch bản
  color?: string;
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
