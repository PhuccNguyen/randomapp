// components/CampaignSetup/utils/validation.ts
import { CampaignFormData } from '../types';

export const validateCampaign = (data: CampaignFormData): string[] => {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length < 3) {
    errors.push('Tên chiến dịch phải có ít nhất 3 ký tự');
  }
  
  if (data.prizes.length < 1) {
    errors.push('Phải có ít nhất 1 giải thưởng');
  }
  
  if (data.prizes.length > 100) {
    errors.push('Không được vượt quá 100 giải thưởng');
  }
  
  // Check duplicate prize names
  const prizeNames = data.prizes.map(p => p.name.toLowerCase());
  const uniqueNames = new Set(prizeNames);
  if (prizeNames.length !== uniqueNames.size) {
    errors.push('Tên các giải thưởng không được trùng lặp');
  }
  
  // Validate colors - hex format
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  data.prizes.forEach((prize, index) => {
    if (prize.color && !hexColorRegex.test(prize.color)) {
      errors.push(`Giải thưởng "${prize.name}" có màu không hợp lệ. Phải là mã hex (ví dụ: #FF0000)`);
    }
  });
  
  // Validate design colors
  if (data.design.backgroundColor && !hexColorRegex.test(data.design.backgroundColor)) {
    errors.push('Màu nền không hợp lệ. Phải là mã hex (ví dụ: #FFFFFF)');
  }
  
  if (data.design.textColor && !hexColorRegex.test(data.design.textColor)) {
    errors.push('Màu chữ không hợp lệ. Phải là mã hex (ví dụ: #000000)');
  }
  
  // Validate spin duration
  if (data.design.spinDuration < 1 || data.design.spinDuration > 10) {
    errors.push('Thời gian quay phải từ 1-10 giây');
  }
  
  return errors;
};
