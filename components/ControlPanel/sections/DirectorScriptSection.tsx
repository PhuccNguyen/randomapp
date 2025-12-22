// components/ControlPanel/sections/DirectorScriptSection.tsx
'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, FileText } from 'lucide-react';
import { DirectorScript, JudgeItem } from '../types';
import styles from '../ControlPanel.module.css';

interface DirectorScriptSectionProps {
  script: DirectorScript[];
  judges: JudgeItem[];
  onScriptChange: (script: DirectorScript[]) => void;
  onSave: () => void;
}

const DirectorScriptSection: React.FC<DirectorScriptSectionProps> = ({
  script,
  judges,
  onScriptChange,
  onSave
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<DirectorScript | null>(null);

  const addScriptItem = () => {
    const newItem: DirectorScript = {
      step: script.length + 1,
      contestant: '',
      target_judge_id: judges[0]?.id || '',
      question_content: ''
    };
    onScriptChange([...script, newItem]);
    setEditingIndex(script.length);
    setEditingItem(newItem);
  };

  const deleteScriptItem = (index: number) => {
    const newScript = script.filter((_, i) => i !== index);
    // Re-number steps
    const renumbered = newScript.map((item, i) => ({ ...item, step: i + 1 }));
    onScriptChange(renumbered);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingItem({ ...script[index] });
  };

  const saveEdit = () => {
    if (editingIndex !== null && editingItem) {
      const newScript = [...script];
      newScript[editingIndex] = editingItem;
      onScriptChange(newScript);
      setEditingIndex(null);
      setEditingItem(null);
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingItem(null);
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <FileText className={styles.sectionIcon} />
        <h2>Kịch Bản Đạo Diễn ({script.length} bước)</h2>
        <button onClick={addScriptItem} className={styles.addButton}>
          <Plus size={16} /> Thêm bước
        </button>
      </div>

      {script.length === 0 ? (
        <div className={styles.emptyState}>
          <FileText size={48} />
          <p>Chưa có kịch bản. Nhấn "Thêm bước" để bắt đầu.</p>
        </div>
      ) : (
        <div className={styles.scriptList}>
          {script.map((item, index) => (
            <div key={index} className={styles.scriptItem}>
              {editingIndex === index ? (
                // EDIT MODE
                <div className={styles.scriptEditForm}>
                  <div className={styles.scriptEditHeader}>
                    <span className={styles.stepNumber}>Bước {item.step}</span>
                    <div className={styles.scriptEditActions}>
                      <button onClick={saveEdit} className={styles.iconButton}>
                        <Check size={16} color="#10b981" />
                      </button>
                      <button onClick={cancelEdit} className={styles.iconButton}>
                        <X size={16} color="#ef4444" />
                      </button>
                    </div>
                  </div>

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
                </div>
              ) : (
                // VIEW MODE
                <>
                  <div className={styles.scriptContent}>
                    <div className={styles.stepNumber}>Bước {item.step}</div>
                    <div className={styles.scriptDetails}>
                      <div className={styles.scriptRow}>
                        <span className={styles.scriptLabel}>Thí sinh:</span>
                        <span className={styles.scriptValue}>{item.contestant || '(Chưa có)'}</span>
                      </div>
                      <div className={styles.scriptRow}>
                        <span className={styles.scriptLabel}>Giám khảo:</span>
                        <span className={styles.scriptValue}>
                          {judges.find(j => j.id === item.target_judge_id)?.name || '(Không xác định)'}
                        </span>
                      </div>
                      <div className={styles.scriptRow}>
                        <span className={styles.scriptLabel}>Câu hỏi:</span>
                        <span className={styles.scriptValue}>
                          {item.question_content || '(Chưa có)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.scriptActions}>
                    <button onClick={() => startEditing(index)} className={styles.iconButton}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => deleteScriptItem(index)} className={styles.iconButton}>
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <button onClick={onSave} className={styles.saveScriptButton}>
        💾 Lưu Kịch Bản
      </button>
    </div>
  );
};

export default DirectorScriptSection;
