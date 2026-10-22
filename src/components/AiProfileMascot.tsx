import React, { useState } from 'react';
import { UserProfile, MascotItem } from '../types/xstk';
import { Mascot } from './Mascot';
import { Award, Flame, Shield, Sparkles, User, Package, Gift, Check, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AiProfileMascotProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export const AiProfileMascot: React.FC<AiProfileMascotProps> = ({ userProfile, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'inventory' | 'lootbox'>('profile');
  const [openingLootbox, setOpeningLootbox] = useState(false);
  const [rewardMsg, setRewardMsg] = useState<string | null>(null);

  const toggleEquipItem = (item: MascotItem) => {
    const currentEquipped = { ...userProfile.equippedMascot };

    if (item.type === 'hat') {
      currentEquipped.hat = currentEquipped.hat === item.id ? undefined : item.id;
    } else if (item.type === 'outfit') {
      currentEquipped.outfit = currentEquipped.outfit === item.id ? undefined : item.id;
    } else if (item.type === 'accessory') {
      currentEquipped.accessory = currentEquipped.accessory === item.id ? undefined : item.id;
    }

    onUpdateProfile({ equippedMascot: currentEquipped });
  };

  const handleOpenLootbox = () => {
    if (userProfile.unlockedLootboxes <= 0) return;
    setOpeningLootbox(true);
    setRewardMsg(null);

    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      const rewards = [
        { name: 'Mũ Phù Thủy Bayes Mạ Vàng', icon: '🧙‍♂️', type: 'hat' as const, desc: 'Tăng 20% khả năng giải bài tập Bayes' },
        { name: 'Vé Bảo Vệ Chuỗi Streak 3 Ngày', icon: '🛡️', type: 'streak_protection' as const, desc: 'Bảo vệ streak khi nghỉ học' },
        { name: 'Casio FX-580VN X Kim Cương Neon', icon: '💎', type: 'accessory' as const, desc: 'Phụ kiện siêu hiếm' },
      ];

      const won = rewards[Math.floor(Math.random() * rewards.length)];

      const newItem: MascotItem = {
        id: `won_${Date.now()}`,
        name: won.name,
        type: won.type,
        icon: won.icon,
        description: won.desc,
        rarity: 'legendary',
        isEquipped: false,
      };

      onUpdateProfile({
        unlockedLootboxes: userProfile.unlockedLootboxes - 1,
        inventory: [...userProfile.inventory, newItem],
      });

      setRewardMsg(`🎉 Chúc mừng! Bạn mở được Rương Kho Báu: "${won.name}" ${won.icon}!`);
      setOpeningLootbox(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-500/40 text-white p-6 rounded-3xl shadow-[0_0_25px_rgba(6,182,212,0.2)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="text-5xl bg-cyan-500/20 p-3 rounded-2xl border border-cyan-500/40 backdrop-blur shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            {userProfile.avatarUrl || '👨‍🎓'}
          </div>
          <div>
            <h2 className="text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">{userProfile.fullName}</h2>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              MSSV: {userProfile.studentId} • Lớp: {userProfile.classGroup} • Ngành: {userProfile.major}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs font-bold">
              <span className="bg-cyan-950/80 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/40 shadow">
                Level {userProfile.level} ({userProfile.exp}/{userProfile.nextLevelExp} EXP)
              </span>
              <span className="bg-emerald-950/80 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40 shadow">
                GPA XSTK: {userProfile.gpa}
              </span>
            </div>
          </div>
        </div>

        {/* Live Mascot Preview */}
        <Mascot size="sm" equipped={userProfile.equippedMascot} speechText="Trang phục của mình trông đỉnh không?" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-bold space-x-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 transition-colors ${
            activeTab === 'profile' ? 'border-b-2 border-cyan-400 text-cyan-300 font-black drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'text-slate-300 hover:text-white'
          }`}
        >
          1. Thông Tin & Đánh Giá Năng Lực
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 transition-colors ${
            activeTab === 'inventory' ? 'border-b-2 border-cyan-400 text-cyan-300 font-black drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'text-slate-300 hover:text-white'
          }`}
        >
          2. Kho Đồ & Trang Phục Linh Vật ({userProfile.inventory.length})
        </button>

        <button
          onClick={() => setActiveTab('lootbox')}
          className={`pb-3 transition-colors ${
            activeTab === 'lootbox' ? 'border-b-2 border-cyan-400 text-cyan-300 font-black drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'text-slate-300 hover:text-white'
          }`}
        >
          3. Rương Kho Báu Thắng Bài ({userProfile.unlockedLootboxes})
        </button>
      </div>

      {/* TAB 1: Profile & Assessment */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-4 bg-slate-900 border-2 border-cyan-500/30 rounded-2xl shadow-md">
              <p className="text-slate-300 font-bold mb-1">Chuỗi Streak</p>
              <p className="text-xl font-black text-cyan-400 flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 fill-cyan-400 text-cyan-400" />
                <span>{userProfile.streakDays} Ngày</span>
              </p>
            </div>

            <div className="p-4 bg-slate-900 border-2 border-cyan-500/30 rounded-2xl shadow-md">
              <p className="text-slate-300 font-bold mb-1">Giờ Học Tích Lũy</p>
              <p className="text-xl font-black text-white font-mono">{userProfile.studyHours}h</p>
            </div>

            <div className="p-4 bg-slate-900 border-2 border-emerald-500/30 rounded-2xl shadow-md">
              <p className="text-slate-300 font-bold mb-1">Xếp Hạng Tuần</p>
              <p className="text-xl font-black text-emerald-400 font-mono">Top #3</p>
            </div>

            <div className="p-4 bg-slate-900 border-2 border-cyan-500/30 rounded-2xl shadow-md">
              <p className="text-slate-300 font-bold mb-1">Mức Độ Đạt Yêu Cầu</p>
              <p className="text-xl font-black text-cyan-300 font-mono">92%</p>
            </div>
          </div>

          <div className="bg-slate-900 border-2 border-cyan-500/30 p-5 rounded-2xl space-y-2">
            <h4 className="font-black text-cyan-300 text-xs">
              🤖 Nhận Định Tổng Quan Năng Lực Từ AI Tutor EDT
            </h4>
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
              Bạn có nền tảng xuất sắc ở <strong className="text-cyan-300">Chương 1 (Xác suất có điều kiện)</strong> và <strong className="text-cyan-300">Chương 3 (Biến ngẫu nhiên liên tục & Tích phân)</strong>. Khuyên bạn nên dành thêm 15 phút ôn luyện phần <strong className="text-emerald-300">Phương sai gộp trong So sánh 2 Tham số (Chương 7)</strong> để đạt GPA 4.0 tuyệt đối!
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: Inventory & Customizer */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <h3 className="font-black text-xs text-white">
            TRANG PHỤC & PHỤ KIỆN ĐÃ THU THẬP:
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {userProfile.inventory.map((item) => {
              const isEquipped =
                userProfile.equippedMascot.hat === item.id ||
                userProfile.equippedMascot.outfit === item.id ||
                userProfile.equippedMascot.accessory === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border-2 transition-all space-y-2.5 ${
                    isEquipped
                      ? 'bg-slate-900 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-950 border-slate-800 hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-1 bg-slate-900 rounded-xl border border-slate-700">{item.icon}</span>
                    <span className="text-[10px] font-mono uppercase bg-cyan-950/80 text-cyan-300 font-bold px-2.5 py-0.5 rounded border border-cyan-500/40">
                      {item.rarity}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-xs">{item.name}</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5 font-medium">{item.description}</p>
                  </div>

                  <button
                    onClick={() => toggleEquipItem(item)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-black transition-all ${
                      isEquipped
                        ? 'bg-rose-500 hover:bg-rose-600 text-white shadow'
                        : 'bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    }`}
                  >
                    {isEquipped ? 'Gỡ Bỏ' : 'Trang Bị Lên Linh Vật'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Lootbox Opening */}
      {activeTab === 'lootbox' && (
        <div className="bg-slate-900 border-2 border-cyan-500/30 p-8 rounded-3xl text-center space-y-4 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          <div className="w-20 h-20 bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-lg animate-bounce">
            🎁
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-black text-white">
              Bạn Đang Có {userProfile.unlockedLootboxes} Rương Kho Báu
            </h3>
            <p className="text-xs text-slate-300 font-medium">Mở rương hoàn thành bài học để nhận vật phẩm trang phục hoặc vé bảo vệ streak!</p>
          </div>

          {rewardMsg && (
            <div className="p-3 bg-emerald-950/90 text-emerald-200 border border-emerald-500/50 rounded-xl text-xs font-bold animate-pulse max-w-md mx-auto">
              {rewardMsg}
            </div>
          )}

          <button
            onClick={handleOpenLootbox}
            disabled={openingLootbox || userProfile.unlockedLootboxes <= 0}
            className="py-3 px-8 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{openingLootbox ? 'Đang mở Rương Kho Báu...' : 'MỞ RƯƠNG NGAY'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
