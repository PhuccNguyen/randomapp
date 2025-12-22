// components/CampaignSetup/CampaignSetup.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import BasicInfoSection from './sections/BasicInfoSection';
import WheelDesignSection from './sections/WheelDesignSection';
import PrizesSection from './sections/PrizesSection';
import PreviewSection from './sections/PreviewSection';
import { CampaignFormData, DEFAULT_WHEEL_DESIGN, DEFAULT_PRIZES } from './types';
import { validateCampaign } from './utils/validation';
import styles from './CampaignSetup.module.css';

const CampaignSetup: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    mode: 'wheel',
    displayMode: 'random',
    isPublic: false,
    prizes: DEFAULT_PRIZES,
    design: DEFAULT_WHEEL_DESIGN
  });

  // Load draft from localStorage
  useEffect(() => {
    const draft = localStorage.getItem('campaign_draft');
    if (draft) {
      try {
        setFormData(JSON.parse(draft));
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('campaign_draft', JSON.stringify(formData));
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData]);

  const handleSave = async () => {
    setError(null);
    setSuccess(false);

    console.log('📝 Form data:', formData);

    // Validation
    const errors = validateCampaign(formData);
    if (errors.length > 0) {
      console.error('❌ Validation errors:', errors);
      setError(errors.join('\n'));
      return;
    }

    console.log('✅ Validation passed');
    setLoading(true);

    try {
      // Get token
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ No token found');
        setError('Vui lòng đăng nhập để lưu chiến dịch');
        setLoading(false);
        return;
      }

      console.log('🔑 Token found');

      // Transform data for API
      const payload = {
        name: formData.name,
        description: formData.description,
        mode: formData.mode,
        displayMode: formData.displayMode,
        isPublic: formData.isPublic,
        items: formData.prizes.map(p => {
          // Ensure color is valid hex, fallback to default
          let color = p.color;
          const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
          if (!color || !hexRegex.test(color)) {
            color = '#4ECDC4'; // Default teal color
            console.warn(`⚠️ Invalid color for prize "${p.name}", using default: ${color}`);
          }
          
          return {
            id: p.id,
            name: p.name,
            hasQuestion: p.hasQuestion,
            imageUrl: p.image,
            color: color
          };
        }),
        director_script: [], // Will be managed in Control Panel
        settings: {
          spinDuration: formData.design.spinDuration * 1000, // Convert to ms
          soundEnabled: formData.design.soundEnabled,
          confettiEnabled: formData.design.confettiEnabled,
          backgroundColor: formData.design.backgroundColor,
          textColor: formData.design.textColor
        }
      };

      console.log('📤 Sending payload:', payload);

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('📥 Response:', { status: response.status, data });

      if (!response.ok) {
        console.error('❌ API Error:', data);
        
        // Better error message
        let errorMsg = data.error || 'Failed to save campaign';
        
        // Check for specific validation errors
        if (errorMsg.includes('hex color')) {
          errorMsg = 'Có giải thưởng có màu không hợp lệ. Vui lòng chọn màu hex hợp lệ (ví dụ: #FF0000)';
        } else if (errorMsg.includes('tier')) {
          errorMsg = 'Bạn cần nâng cấp lên gói ENTERPRISE để tạo campaign. Vui lòng liên hệ admin.';
        } else if (errorMsg.includes('campaign limit')) {
          errorMsg = 'Bạn đã đạt giới hạn số lượng campaign. Vui lòng xóa campaign cũ hoặc nâng cấp gói.';
        }
        
        throw new Error(errorMsg);
      }

      console.log('✅ Campaign created successfully:', data);
      setSuccess(true);
      localStorage.removeItem('campaign_draft'); // Clear draft

      // Redirect to control panel after 2s
      setTimeout(() => {
        router.push(`/control?id=${data.id}`);
      }, 2000);

    } catch (err: any) {
      console.error('❌ Save error:', err);
      setError(err.message || 'Đã xảy ra lỗi khi lưu chiến dịch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Tạo Chiến Dịch Sự Kiện Lớn</h1>
          <p className={styles.subtitle}>
            Thiết lập vòng quay chuyên nghiệp cho Hoa Hậu, Gameshow, Sự kiện truyền hình
          </p>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className={styles.alert} style={{ backgroundColor: '#fee', borderColor: '#fcc' }}>
          <AlertCircle size={18} />
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{error}</pre>
        </div>
      )}

      {success && (
        <div className={styles.alert} style={{ backgroundColor: '#efe', borderColor: '#cfc' }}>
          <CheckCircle2 size={18} />
          <span>Lưu thành công! Đang chuyển đến Control Panel...</span>
        </div>
      )}

      <div className={styles.layout}>
        {/* Left Column - Form */}
        <div className={styles.leftColumn}>
          <BasicInfoSection
            name={formData.name}
            description={formData.description}
            mode={formData.mode}
            displayMode={formData.displayMode}
            isPublic={formData.isPublic}
            onNameChange={(name) => setFormData({ ...formData, name })}
            onDescriptionChange={(description) => setFormData({ ...formData, description })}
            onModeChange={(mode) => setFormData({ ...formData, mode })}
            onDisplayModeChange={(displayMode) => setFormData({ ...formData, displayMode })}
            onPublicChange={(isPublic) => setFormData({ ...formData, isPublic })}
          />

          <WheelDesignSection
            design={formData.design}
            onDesignChange={(updates) => setFormData({
              ...formData,
              design: { ...formData.design, ...updates }
            })}
          />

          <PrizesSection
            prizes={formData.prizes}
            onPrizesChange={(prizes) => setFormData({ ...formData, prizes })}
          />
        </div>

        {/* Right Column - Preview */}
        <div className={styles.rightColumn}>
          <div className={styles.stickyContainer}>
            <PreviewSection prizes={formData.prizes} design={formData.design} />
            
            <button
              onClick={handleSave}
              disabled={loading}
              className={styles.saveButton}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className={styles.spinner} />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Lưu & Tiếp tục</span>
                </>
              )}
            </button>

            <p className={styles.hint}>
              💡 Sau khi lưu, bạn sẽ được chuyển đến <strong>Control Panel</strong> để thiết lập kịch bản director mode
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignSetup;
