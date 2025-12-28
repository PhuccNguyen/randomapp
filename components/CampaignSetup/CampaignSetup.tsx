// components/CampaignSetup/CampaignSetup.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('id'); // Get campaign ID from URL
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
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

  // Fetch existing campaign data if editing
  useEffect(() => {
    if (campaignId) {
      const fetchCampaign = async () => {
        setFetchingData(true);
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            setError('Vui lòng đăng nhập để chỉnh sửa chiến dịch');
            return;
          }

          const response = await fetch(`/api/campaigns/${campaignId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error('Không thể tải dữ liệu chiến dịch');
          }

          const { campaign } = await response.json();
          console.log('📥 Loaded campaign for editing:', campaign);

          // Transform API data to form data
          setFormData({
            name: campaign.name || '',
            description: campaign.description || '',
            mode: campaign.mode || 'wheel',
            displayMode: campaign.displayMode || 'random',
            isPublic: campaign.isPublic || false,
            prizes: campaign.items?.map((item: any) => ({
              id: item.id || item._id,
              name: item.name,
              hasQuestion: item.hasQuestion || false,
              image: item.imageUrl || '',
              color: item.color || '#4ECDC4'
            })) || DEFAULT_PRIZES,
            design: {
              spinDuration: campaign.settings?.spinDuration ? campaign.settings.spinDuration / 1000 : 5,
              soundEnabled: campaign.settings?.soundEnabled ?? true,
              confettiEnabled: campaign.settings?.confettiEnabled ?? true,
              backgroundColor: campaign.settings?.backgroundColor || '#1a1a2e',
              textColor: campaign.settings?.textColor || '#ffffff'
            }
          });
        } catch (err: any) {
          console.error('❌ Error fetching campaign:', err);
          setError(err.message || 'Không thể tải dữ liệu chiến dịch');
        } finally {
          setFetchingData(false);
        }
      };

      fetchCampaign();
    }
  }, [campaignId]);

  // Load draft from localStorage (only for new campaigns)
  useEffect(() => {
    if (!campaignId) {
      const draft = localStorage.getItem('campaign_draft');
      if (draft) {
        try {
          setFormData(JSON.parse(draft));
        } catch (e) {
          console.error('Failed to load draft:', e);
        }
      }
    }
  }, [campaignId]);

  // Auto-save draft (only for new campaigns)
  useEffect(() => {
    if (!campaignId) {
      const timer = setTimeout(() => {
        localStorage.setItem('campaign_draft', JSON.stringify(formData));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData, campaignId]);

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

      // Use PUT for edit, POST for create
      const url = campaignId ? `/api/campaigns/${campaignId}` : '/api/campaigns';
      const method = campaignId ? 'PUT' : 'POST';
      
      console.log(`${method} ${url}`);

      const response = await fetch(url, {
        method,
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

      console.log(`✅ Campaign ${campaignId ? 'updated' : 'created'} successfully:`, data);
      setSuccess(true);
      
      if (!campaignId) {
        localStorage.removeItem('campaign_draft'); // Clear draft only for new campaigns
      }

      // Redirect to control panel after 2s
      const targetId = campaignId || data.id || data.campaign?._id;
      setTimeout(() => {
        router.push(`/control?id=${targetId}`);
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
          <h1 className={styles.title}>
            {campaignId ? 'Chỉnh Sửa Chiến Dịch' : 'Tạo Chiến Dịch Sự Kiện Lớn'}
          </h1>
          <p className={styles.subtitle}>
            {campaignId 
              ? 'Cập nhật thông tin chiến dịch, thêm/xóa ảnh, thay đổi vòng quay'
              : 'Thiết lập vòng quay chuyên nghiệp cho Hoa Hậu, Gameshow, Sự kiện truyền hình'
            }
          </p>
        </div>
      </div>

      {/* Loading State */}
      {fetchingData && (
        <div className={styles.alert} style={{ backgroundColor: '#e7f3ff', borderColor: '#b3d9ff' }}>
          <Loader2 size={18} className={styles.spinner} />
          <span>Đang tải dữ liệu chiến dịch...</span>
        </div>
      )}

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
          <span>{campaignId ? 'Cập nhật thành công!' : 'Lưu thành công!'} Đang chuyển đến Control Panel...</span>
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
            <PreviewSection 
              prizes={formData.prizes} 
              design={formData.design}
              mode={formData.mode}
            />
            
            <button
              onClick={handleSave}
              disabled={loading || fetchingData}
              className={styles.saveButton}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className={styles.spinner} />
                  <span>{campaignId ? 'Đang cập nhật...' : 'Đang lưu...'}</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>{campaignId ? 'Cập nhật' : 'Lưu & Tiếp tục'}</span>
                </>
              )}
            </button>

            <p className={styles.hint}>
              💡 {campaignId 
                ? 'Sau khi cập nhật, bạn sẽ được chuyển đến Control Panel'
                : 'Sau khi lưu, bạn sẽ được chuyển đến Control Panel để thiết lập kịch bản director mode'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignSetup;
