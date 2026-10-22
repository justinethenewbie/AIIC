import React from 'react';
import { MistakeRecord } from '../types/xstk';
import { BarChart3, AlertOctagon, CheckCircle2, ShieldAlert, ArrowUpRight, Lightbulb } from 'lucide-react';
import { MathFormula } from './MathFormula';

interface MistakeAnalyticsProps {
  mistakes: MistakeRecord[];
  onClearMistakes: () => void;
}

export const MistakeAnalytics: React.FC<MistakeAnalyticsProps> = ({ mistakes, onClearMistakes }) => {
  const vivaMistakes = mistakes.filter((m) => m.sourceType === 'viva');
  const mcqMistakes = mistakes.filter((m) => m.sourceType === 'mcq');
  const essayMistakes = mistakes.filter((m) => m.sourceType === 'essay' || m.sourceType === 'homework');

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-500/40 p-6 rounded-3xl space-y-2 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
        <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <span>THỐNG KÊ LỖI SAI & NHẬN ĐỊNH NGUYÊN NHÂN TỪ AI</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">
          Bảng Phân Tích Lỗ Hổng Kiến Thức & Lộ Trình Bổ Trợ
        </h2>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
          Hệ thống tự động tổng hợp tất cả các câu hỏi làm sai từ vấn đáp, trắc nghiệm và tự luận. Từ đó đưa ra nhận định chung về sai lầm thường gặp và lộ trình bổ trợ cụ thể!
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 p-5 rounded-2xl border-2 border-rose-500/30 flex items-center justify-between shadow-[0_0_15px_rgba(244,63,94,0.15)]">
          <div>
            <p className="text-xs text-rose-300 font-bold">Lỗi sai Vấn đáp AI</p>
            <p className="text-3xl font-black font-mono text-rose-400 mt-1">{vivaMistakes.length}</p>
          </div>
          <AlertOctagon className="w-9 h-9 text-rose-400/60" />
        </div>

        <div className="bg-slate-900/90 p-5 rounded-2xl border-2 border-cyan-500/30 flex items-center justify-between shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <div>
            <p className="text-xs text-cyan-300 font-bold">Lỗi sai Trắc nghiệm</p>
            <p className="text-3xl font-black font-mono text-cyan-400 mt-1">{mcqMistakes.length}</p>
          </div>
          <ShieldAlert className="w-9 h-9 text-cyan-400/60" />
        </div>

        <div className="bg-slate-900/90 p-5 rounded-2xl border-2 border-emerald-500/30 flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <div>
            <p className="text-xs text-emerald-300 font-bold">Lỗi sai Tự luận / iPad</p>
            <p className="text-3xl font-black font-mono text-emerald-400 mt-1">{essayMistakes.length}</p>
          </div>
          <BarChart3 className="w-9 h-9 text-emerald-400/60" />
        </div>
      </div>

      {/* AI Common Error Insights */}
      <div className="bg-slate-900/90 border-2 border-cyan-500/40 p-5 rounded-2xl space-y-3 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
        <div className="flex items-center gap-2 font-black text-cyan-300 text-sm">
          <Lightbulb className="w-5 h-5 text-cyan-400" />
          <span>Nhận Định Chung Của AI Tutor Về Các Lỗi Lập Luận Thường Gặp</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
          Qua phân tích các câu làm sai, sai lầm phổ biến nhất của sinh viên là <strong className="text-cyan-300">nhầm lẫn giữa biến cố xung khắc và biến cố độc lập</strong> khi áp dụng công thức cộng, cũng như quên điều kiện tích phân hàm mật độ <MathFormula math="\int_{-\infty}^{+\infty} f(x) dx = 1" /> trước khi tìm hằng số <MathFormula math="k" />.
        </p>
      </div>

      {/* Detailed Mistakes Table */}
      <div className="bg-slate-900/90 border-2 border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.1)]">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-black text-white text-xs">
            DANH SÁCH CHI TIẾT CÁC CÂU HỎI ĐÃ LÀM SAI
          </h3>
          {mistakes.length > 0 && (
            <button
              onClick={onClearMistakes}
              className="text-[11px] font-bold text-rose-400 hover:text-rose-300 transition-colors"
            >
              Xóa lịch sử lỗi sai
            </button>
          )}
        </div>

        {mistakes.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-300 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <p className="font-black text-white text-sm">Tuyệt vời! Bạn chưa ghi nhận lỗi sai nào.</p>
            <p className="text-slate-300">Hãy làm thêm các đề thi trắc nghiệm và tự luận để kiểm tra năng lực toàn diện!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {mistakes.map((m) => (
              <div key={m.id} className="p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-cyan-300">
                    {m.chapterTitle} • [{m.sourceType.toUpperCase()}]
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">{m.timestamp}</span>
                </div>

                <p className="text-slate-100 font-semibold text-xs leading-relaxed">
                  <strong className="text-white">Câu hỏi:</strong> {m.questionSummary}
                </p>

                <div className="p-3 bg-rose-950/70 border border-rose-500/40 rounded-xl text-rose-200">
                  <p className="font-bold text-[11px] text-rose-300">🔴 Lời giải đã nộp:</p>
                  <p className="mt-0.5">{m.studentAnswer}</p>
                </div>

                <div className="p-3 bg-slate-950 border border-cyan-500/30 rounded-xl text-slate-200 space-y-1">
                  <p className="font-bold text-cyan-300 text-[11px]">💡 Nguyên nhân & Hướng khắc phục:</p>
                  <p>
                    <strong className="text-white">Nguyên nhân:</strong> {m.rootCauseError}
                  </p>
                  <p>
                    <strong className="text-white">Hướng bổ trợ:</strong> {m.remediationAdvice}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
