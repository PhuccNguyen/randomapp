// components/CampaignSetup/sections/PrizesSection.tsx
'use client';

import React, { useState } from 'react';
import { Gift, Plus, Trash2, Upload, AlertCircle } from 'lucide-react';
import { Prize } from '../types';
import styles from '../CampaignSetup.module.css';

interface PrizesSectionProps {
  prizes: Prize[];
  onPrizesChange: (prizes: Prize[]) => void;
}

const PrizesSection: React.FC<PrizesSectionProps> = ({
  prizes,
  onPrizesChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const addPrize = () => {
    const newPrize: Prize = {
      id: Date.now().toString(),
      name: `Giải thưởng ${prizes.length + 1}`,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      hasQuestion: false
    };
    onPrizesChange([...prizes, newPrize]);
  };

  const updatePrize = (id: string, updates: Partial<Prize>) => {
    onPrizesChange(
      prizes.map(p => p.id === id ? { ...p, ...updates } : p)
    );
  };

  const deletePrize = (id: string) => {
    if (prizes.length <= 2) {
      alert('Phải có ít nhất 2 giải thưởng!');
      return;
    }
    onPrizesChange(prizes.filter(p => p.id !== id));
  };

  const handleImageUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      updatePrize(id, { image: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const filteredPrizes = prizes.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <Gift className={styles.sectionIcon} />
        <h2>Giải thưởng ({prizes.length})</h2>
        <button
          type="button"
          onClick={addPrize}
          className={styles.addButton}
          disabled={prizes.length >= 100}
        >
          <Plus size={16} /> Thêm giải
        </button>
      </div>

      {prizes.length >= 100 && (
        <div className={styles.warning}>
          <AlertCircle size={16} />
          <span>Đã đạt giới hạn 100 giải thưởng</span>
        </div>
      )}

      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Tìm kiếm giải thưởng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.prizesGrid}>
        {filteredPrizes.map((prize, index) => (
          <div key={prize.id} className={styles.prizeCard}>
            <div className={styles.prizeHeader}>
              <span className={styles.prizeNumber}>#{index + 1}</span>
              <button
                type="button"
                onClick={() => deletePrize(prize.id)}
                className={styles.deleteIconButton}
                disabled={prizes.length <= 2}
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className={styles.prizeBody}>
              {/* Color Picker */}
              <div className={styles.prizeColorSection}>
                <input
                  type="color"
                  value={prize.color}
                  onChange={(e) => updatePrize(prize.id, { color: e.target.value })}
                  className={styles.prizeColorInput}
                />
              </div>

              {/* Prize Name */}
              <input
                type="text"
                value={prize.name}
                onChange={(e) => updatePrize(prize.id, { name: e.target.value })}
                placeholder="Tên giải thưởng"
                className={styles.prizeNameInput}
                maxLength={50}
              />

              {/* Image Upload */}
              <label className={styles.imageUploadLabel}>
                <Upload size={14} />
                <span>{prize.image ? 'Đổi ảnh' : 'Thêm ảnh'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageUpload(prize.id, e.target.files[0])}
                  className={styles.imageUploadInput}
                />
              </label>

              {prize.image && (
                <div className={styles.prizeImagePreview}>
                  <img src={prize.image} alt={prize.name} />
                </div>
              )}

              {/* Question Toggle */}
              <label className={styles.questionToggle}>
                <input
                  type="checkbox"
                  checked={prize.hasQuestion}
                  onChange={(e) => updatePrize(prize.id, { hasQuestion: e.target.checked })}
                  className={styles.checkbox}
                />
                <span>Có câu hỏi</span>
              </label>

              {prize.hasQuestion && (
                <textarea
                  value={prize.questionContent || ''}
                  onChange={(e) => updatePrize(prize.id, { questionContent: e.target.value })}
                  placeholder="Nhập câu hỏi..."
                  className={styles.questionTextarea}
                  rows={2}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrizesSection;
