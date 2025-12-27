// components/ControlPanel/sections/ModeSelector.tsx
interface ModeSelectorProps {
  currentMode: string;
  onModeChange: (mode: string) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
  const modes = [
    { value: 'wheel', label: 'Classic Wheel', icon: '🎡', description: 'Vòng quay truyền thống' },
    { value: 'glass-cylinder', label: 'Glass Cylinder', icon: '🔮', description: '3D Cylinder đẳng cấp' },
    { value: 'infinite-horizon', label: 'Infinite Horizon', icon: '🌊', description: 'Dải ngang panorama' },
    { value: 'cyber-decode', label: 'Cyber Decode', icon: '💻', description: 'Matrix scramble' }
  ];

  return (
    <div className={styles.modeSelector}>
      <h3>Chọn kiểu hiển thị</h3>
      <div className={styles.modeGrid}>
        {modes.map(mode => (
          <button
            key={mode.value}
            className={`${styles.modeCard} ${currentMode === mode.value ? styles.active : ''}`}
            onClick={() => onModeChange(mode.value)}
          >
            <span className={styles.modeIcon}>{mode.icon}</span>
            <span className={styles.modeLabel}>{mode.label}</span>
            <span className={styles.modeDesc}>{mode.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
