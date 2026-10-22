import React, { useState, useEffect } from 'react';
import {
  Settings,
  Moon,
  Sun,
  X,
  Check,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Cpu,
  KeyRound,
  ExternalLink,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  getSavedModel,
  setSavedModel,
} from '../utils/apiHelper';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [bgMusicVol, setBgMusicVol] = useState(50);
  const [sfxVol, setSfxVol] = useState(80);
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');

  // API Key State
  const [apiKey, setApiKey] = useState('');
  const [isApiKeySaved, setIsApiKeySaved] = useState(false);
  const [maskedKey, setMaskedKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [keySaveMessage, setKeySaveMessage] = useState('');

  // Connection Test Status
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedModel(getSavedModel());
      setTestStatus('idle');
      setTestMessage('');
      setKeySaveMessage('');

      // Fetch current API key status from server
      fetch('/api/settings/get-api-key-status')
        .then((res) => res.json())
        .then((data) => {
          if (data?.hasKey) {
            setIsApiKeySaved(true);
            setMaskedKey(data.maskedKey || '');
          } else {
            setIsApiKeySaved(false);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) return;
    setIsSavingKey(true);
    setKeySaveMessage('');

    try {
      const res = await fetch('/api/settings/save-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setIsApiKeySaved(true);
        setKeySaveMessage('✅ Đã lưu API Key vào máy chủ!');
        setMaskedKey(`${apiKey.trim().slice(0, 6)}...${apiKey.trim().slice(-4)}`);
        setApiKey('');
        // Automatically test connection
        handleTestConnection();
      } else {
        setKeySaveMessage(`❌ ${data.error || 'Lỗi khi lưu API Key'}`);
      }
    } catch {
      setKeySaveMessage('❌ Không thể gửi API Key tới server.');
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Đang kết nối tới máy chủ Google Gemini...');

    try {
      const response = await fetch('/api/tutor/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setTestStatus('success');
        setTestMessage(data.message || 'Kết nối Google Gemini AI thành công!');
      } else {
        setTestStatus('error');
        setTestMessage(data.error || 'Không thể kết nối AI.');
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage('Không thể kết nối máy chủ. Vui lòng đảm bảo server đang chạy!');
    }
  };

  const handleSaveSettings = () => {
    setSavedModel(selectedModel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-[0_0_50px_rgba(6,182,212,0.25)] relative text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-black text-white text-base">
            <span className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/40">
              <Settings className="w-5 h-5" />
            </span>
            <span>Cài Đặt Ứng Dụng EDT & Cấu Hình AI</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gemini AI Model Configuration Section */}
        <div className="bg-slate-950 border border-cyan-500/30 p-4 rounded-2xl space-y-3 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-300 font-extrabold text-xs">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>CẤU HÌNH MÔ HÌNH GEMINI AI (SERVER-SIDE)</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
            Hệ thống tự động sử dụng kết nối máy chủ AI cho các tính năng <strong>Tạo đề thi</strong>, <strong>Giải đáp câu hỏi</strong>, <strong>Vấn đáp AI</strong> và <strong>Chấm bài</strong>.
          </p>

          {/* Gemini API Key Configuration */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-900 border border-cyan-500/20 text-xs">
            <div className="flex items-center justify-between">
              <label className="text-slate-200 font-bold flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Google Gemini API Key:</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
              >
                <span>Lấy Key miễn phí</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {isApiKeySaved && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <Check className="w-3 h-3" />
                <span>Key đang hoạt động: <code>{maskedKey}</code></span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={isApiKeySaved ? 'Dán key mới để thay đổi...' : 'Dán mã API Key (AIzaSy...)'}
                  className="w-full p-2 pr-8 rounded-lg border border-slate-700 bg-slate-950 text-white text-xs font-mono outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <button
                type="button"
                onClick={handleSaveApiKey}
                disabled={!apiKey.trim() || isSavingKey}
                className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold rounded-lg text-xs whitespace-nowrap disabled:opacity-40 transition-all"
              >
                {isSavingKey ? 'Đang lưu...' : 'Lưu Key'}
              </button>
            </div>

            {keySaveMessage && (
              <p className="text-[11px] text-cyan-300 font-medium mt-1">{keySaveMessage}</p>
            )}
          </div>

          {/* Model Selection */}
          <div className="space-y-1 text-xs">
            <label className="block text-slate-300 font-bold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mô Hình AI (Model):</span>
            </label>
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                setTestStatus('idle');
              }}
              className="w-full p-2.5 rounded-xl border border-cyan-500/30 bg-slate-900 text-white text-xs font-semibold outline-none focus:border-cyan-400"
            >
              <option value="gemini-3.8-flash">Gemini 3.8 Flash (Mặc định siêu tốc &amp; Tư duy toán học chuyên sâu)</option>
              <option value="gemini-flash-latest">Gemini Flash Latest (Phản hồi tức thì)</option>
            </select>
          </div>

          {/* Test Connection Button & Status */}
          <div className="pt-1 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="w-full py-2 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {testStatus === 'testing' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang kiểm tra kết nối...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Kiểm Tra Kết Nối AI Ngay</span>
                </>
              )}
            </button>

            {testStatus === 'success' && (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{testMessage}</span>
              </div>
            )}

            {testStatus === 'error' && (
              <div className="p-2.5 bg-rose-950/60 border border-rose-500/50 rounded-xl text-rose-300 text-xs flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{testMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* UI & Theme Preferences */}
        <div className="space-y-3 text-xs">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-200 flex items-center gap-2 font-bold">
              {isDarkMode ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
              <span>Chế độ Giao diện Dark Mode (Neon)</span>
            </span>
            <button
              onClick={onToggleDarkMode}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                isDarkMode ? 'bg-cyan-500' : 'bg-slate-600'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Background Music Volume */}
          <div className="space-y-1.5 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="flex justify-between font-bold text-slate-300">
              <span>Âm lượng nhạc nền tập trung (Lo-Fi)</span>
              <span className="text-cyan-400">{bgMusicVol}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={bgMusicVol}
              onChange={(e) => setBgMusicVol(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Sound Effects Volume */}
          <div className="space-y-1.5 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="flex justify-between font-bold text-slate-300">
              <span>Âm lượng hiệu ứng âm thanh</span>
              <span className="text-cyan-400">{sfxVol}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sfxVol}
              onChange={(e) => setSfxVol(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSaveSettings}
          className="w-full py-3 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black rounded-xl text-xs shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>LƯU CÀI ĐẶT & ÁP DỤNG NGAY</span>
        </button>
      </div>
    </div>
  );
};
