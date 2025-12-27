// components/CampaignSetup/types.ts
export interface Prize {
  id: string;
  name: string;
  color: string;
  probability?: number; // % xác suất (optional)
  image?: string;
  hasQuestion: boolean;
  questionContent?: string;
}

export interface WheelDesign {
  shape: 'circle' | 'fan' | 'clock';
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  spinDuration: number; // seconds
  soundEnabled: boolean;
  confettiEnabled: boolean;
  logoUrl?: string;
}

export interface CampaignFormData {
  name: string;
  description: string;
  mode: 'wheel' | 'reel' | 'battle' | 'mystery' | 'glass-cylinder' | 'infinite-horizon' | 'cyber-decode';
  displayMode: 'random' | 'director';
  isPublic: boolean;
  prizes: Prize[];
  design: WheelDesign;
}

export const DEFAULT_WHEEL_DESIGN: WheelDesign = {
  shape: 'circle',
  backgroundColor: '#FFFFFF',
  textColor: '#000000',
  borderColor: '#D4AF37',
  spinDuration: 3,
  soundEnabled: true,
  confettiEnabled: true
};

export const DEFAULT_PRIZES: Prize[] = [
  { id: '1', name: 'Giải nhất', color: '#FFD700', hasQuestion: false },
  { id: '2', name: 'Giải nhì', color: '#C0C0C0', hasQuestion: false },
  { id: '3', name: 'Giải ba', color: '#CD7F32', hasQuestion: false },
  { id: '4', name: 'Khuyến khích', color: '#4ECDC4', hasQuestion: false }
];
