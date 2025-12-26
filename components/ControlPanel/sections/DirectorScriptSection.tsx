// C:\Users\Nguyen Phuc\Web\tingrandom\components\ControlPanel\sections\DirectorScriptSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, FileText, Upload, Download, Shuffle } from 'lucide-react';
import { DirectorScript, JudgeItem } from '../types';
import styles from '../ControlPanel.module.css';

interface DirectorScriptSectionProps {
  script: DirectorScript[];
  judges: JudgeItem[];
  currentStep: number;
  onScriptChange: (script: DirectorScript[]) => void;
  onSave: () => void;
}

const DirectorScriptSection: React.FC<DirectorScriptSectionProps> = ({
  script,
  judges,
  currentStep,
  onScriptChange,
  onSave
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<DirectorScript | null>(null);
  const [autoGenCount, setAutoGenCount] = useState(5);

  const addScriptItem = () => {
    console.log('🔹 DirectorScriptSection: Adding new script item');
    const newItem: DirectorScript = {
      step: script.length + 1,
      contestant: '',
      target_judge_id: judges[0]?.id || '',
      question_content: '',
      notes: ''
    };
    console.log('🔹 DirectorScriptSection: New item:', newItem);
    console.log('🔹 DirectorScriptSection: New script array length:', script.length + 1);
    onScriptChange([...script, newItem]);
    setEditingIndex(script.length);
    setEditingItem(newItem);
  };

  const deleteScriptItem = (index: number) => {
    if (!confirm('Bạn có chắc muốn xóa bước này?')) return;
    
    console.log('🔹 DirectorScriptSection: Deleting item at index:', index);
    const newScript = script.filter((_, i) => i !== index);
    const renumbered = newScript.map((item, i) => ({ ...item, step: i + 1 }));
    console.log('🔹 DirectorScriptSection: Updated script after delete:', renumbered);
    onScriptChange(renumbered);
  };

  const startEditing = (index: number) => {
    console.log('🔹 DirectorScriptSection: Starting edit at index:', index);
    console.log('🔹 DirectorScriptSection: Item to edit:', script[index]);
    setEditingIndex(index);
    setEditingItem({ ...script[index] });
  };

  const saveEdit = () => {
    if (editingIndex !== null && editingItem) {
      console.log('🔹 DirectorScriptSection: Saving edit at index:', editingIndex);
      console.log('🔹 DirectorScriptSection: Edited item:', editingItem);
      const newScript = [...script];
      newScript[editingIndex] = editingItem;
      console.log('🔹 DirectorScriptSection: Updated script:', newScript);
      onScriptChange(newScript);
      setEditingIndex(null);
      setEditingItem(null);
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingItem(null);
  };

  // Auto-generate script
  const autoGenerateScript = () => {
    const contestants = [
      'Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E',
      'Võ Thị F', 'Đặng Văn G', 'Bùi Thị H', 'Đỗ Văn I', 'Ngô Thị K'
    ];
    
    const questions = [
      'Hãy giới thiệu về bản thân và lý do tham gia cuộc thi',
      'Điểm mạnh và điểm yếu lớn nhất của bạn là gì?',
      'Kế hoạch phát triển sự nghiệp trong 5 năm tới',
      'Kinh nghiệm đáng nhớ nhất trong cuộc đời bạn',
      'Bạn sẽ làm gì với giải thưởng nếu chiến thắng?',
      'Người bạn ngưỡng mộ nhất và lý do',
      'Thử thách lớn nhất bạn từng vượt qua',
      'Giá trị sống quan trọng nhất với bạn',
      'Tài năng đặc biệt của bạn là gì?',
      'Lời khuyên cho thế hệ trẻ'
    ];

    const newScript: DirectorScript[] = [];
    
    for (let i = 0; i < autoGenCount; i++) {
      newScript.push({
        step: i + 1,
        contestant: contestants[i % contestants.length],
        target_judge_id: judges[i % judges.length]?.id || judges[0]?.id,
        question_content: questions[i % questions.length],
        notes: 'Tự động tạo'
      });
    }

    onScriptChange(newScript);
  };

  // Export/Import script
  const exportScript = () => {
    const dataStr = JSON.stringify(script, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `script_${Date.now()}.json`;
    link.click();
  };

  const importScript = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        onScriptChange(imported);
      } catch (error) {
        alert('File không hợp lệ!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <FileText className={styles.sectionIcon} />
        <h2>Kịch Bản Đạo Diễn ({script.length} bước)</h2>
        <div className={styles.headerActions}>
          <button onClick={addScriptItem} className={styles.addButton} title="Thêm bước mới">
            <Plus size={16} /> Thêm
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <button onClick={autoGenerateScript} className={styles.actionBtn} title="Tạo kịch bản mẫu">
          <Shuffle size={16} />
          <span>Tạo tự động ({autoGenCount})</span>
        </button>
        <input
          type="number"
          min="1"
          max="20"
          value={autoGenCount}
          onChange={(e) => setAutoGenCount(parseInt(e.target.value) || 5)}
          className={styles.miniInput}
        />
        
        <button onClick={exportScript} className={styles.actionBtn} title="Xuất file JSON">
          <Download size={16} />
          <span>Xuất</span>
        </button>
        
        <label className={styles.actionBtn} title="Nhập file JSON">
          <Upload size={16} />
          <span>Nhập</span>
          <input
            type="file"
            accept=".json"
            onChange={importScript}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {script.length === 0 ? (
        <div className={styles.emptyState}>
          <FileText size={64} className={styles.emptyIcon} />
          <h3>Chưa có kịch bản</h3>
          <p>Nhấn "Thêm" để tạo bước mới hoặc "Tạo tự động" để tạo kịch bản mẫu</p>
        </div>
      ) : (
        <div className={styles.scriptList}>
          {script.map((item, index) => {
            const isCurrentStep = index === currentStep;
            const isPastStep = index < currentStep;
            
            return (
              <div 
                key={index} 
                className={`${styles.scriptItem} ${
                  isCurrentStep ? styles.scriptItemCurrent : ''
                } ${isPastStep ? styles.scriptItemPast : ''}`}
              >
                {editingIndex === index ? (
                  // EDIT MODE
                  <div className={styles.scriptEditForm}>
                    <div className={styles.scriptEditHeader}>
                      <span className={styles.stepNumber}>Bước {item.step}</span>
                      <div className={styles.scriptEditActions}>
                        <button onClick={saveEdit} className={styles.iconButtonSuccess} title="Lưu">
                          <Check size={18} />
                        </button>
                        <button onClick={cancelEdit} className={styles.iconButtonDanger} title="Hủy">
                          <X size={18} />
                        </button>
                      </div>
                    </div>

                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label>Thí sinh:</label>
                        <input
                          type="text"
                          value={editingItem?.contestant || ''}
                          onChange={(e) => setEditingItem({ ...editingItem!, contestant: e.target.value })}
                          placeholder="Tên thí sinh"
                          className={styles.input}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Giám khảo:</label>
                        <select
                          value={editingItem?.target_judge_id || ''}
                          onChange={(e) => setEditingItem({ ...editingItem!, target_judge_id: e.target.value })}
                          className={styles.select}
                        >
                          {judges.map(judge => (
                            <option key={judge.id} value={judge.id}>
                              {judge.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Câu hỏi:</label>
                      <textarea
                        value={editingItem?.question_content || ''}
                        onChange={(e) => setEditingItem({ ...editingItem!, question_content: e.target.value })}
                        placeholder="Nội dung câu hỏi..."
                        className={styles.textarea}
                        rows={3}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Ghi chú:</label>
                      <input
                        type="text"
                        value={editingItem?.notes || ''}
                        onChange={(e) => setEditingItem({ ...editingItem!, notes: e.target.value })}
                        placeholder="Ghi chú thêm (tùy chọn)"
                        className={styles.input}
                      />
                    </div>
                  </div>
                ) : (
                  // VIEW MODE
                  <>
                    <div className={styles.scriptContent}>
                      <div className={styles.stepBadge}>
                        <span className={styles.stepNumber}>#{item.step}</span>
                        {isCurrentStep && <span className={styles.currentBadge}>Hiện tại</span>}
                        {isPastStep && <span className={styles.completedBadge}>✓</span>}
                      </div>
                      
                      <div className={styles.scriptDetails}>
                        <div className={styles.scriptRow}>
                          <span className={styles.scriptLabel}>👤 Thí sinh:</span>
                          <span className={styles.scriptValue}>
                            {item.contestant || <em className={styles.emptyValue}>(Chưa có)</em>}
                          </span>
                        </div>
                        
                        <div className={styles.scriptRow}>
                          <span className={styles.scriptLabel}>⭐ Giám khảo:</span>
                          <span className={styles.scriptValue}>
                            {judges.find(j => j.id === item.target_judge_id)?.name || 
                             <em className={styles.emptyValue}>(Không xác định)</em>}
                          </span>
                        </div>
                        
                        <div className={styles.scriptRow}>
                          <span className={styles.scriptLabel}>❓ Câu hỏi:</span>
                          <span className={styles.scriptValue}>
                            {item.question_content?.trim() || 
                             <em className={styles.emptyValue}>(Chưa có câu hỏi)</em>}
                          </span>
                        </div>
                        
                        {item.notes && (
                          <div className={styles.scriptRow}>
                            <span className={styles.scriptLabel}>📝 Ghi chú:</span>
                            <span className={styles.scriptValueMuted}>{item.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles.scriptActions}>
                      <button 
                        onClick={() => startEditing(index)} 
                        className={styles.iconButton}
                        title="Chỉnh sửa"
                        disabled={isPastStep}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteScriptItem(index)} 
                        className={styles.iconButtonDanger}
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.sectionFooter}>
        <button onClick={onSave} className={styles.saveButton}>
          💾 Lưu Kịch Bản
        </button>
      </div>
    </div>
  );
};

export default DirectorScriptSection;
