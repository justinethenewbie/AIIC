import React, { useState } from 'react';
import { Upload, FileText, Image, CheckCircle, Lightbulb, Award, Sparkles, AlertCircle, ArrowRight, Sigma } from 'lucide-react';
import { InteractiveCanvas } from './InteractiveCanvas';
import { MathEquationToolbar } from './MathEquationToolbar';
import { MathText } from './MathFormula';
import { aiFetch } from '../utils/apiHelper';

interface ImagePdfGradingProps {
  onAddExp: (amount: number, details?: string, count?: number, gpaScore?: number) => void;
  onRecordMistake: (mistake: any) => void;
}

export const ImagePdfGrading: React.FC<ImagePdfGradingProps> = ({
  onAddExp,
  onRecordMistake,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [useiPadCanvas, setUseiPadCanvas] = useState(false);
  const [showInputToolbar, setShowInputToolbar] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [strategyData, setStrategyData] = useState<any>(null);
  const [studentResponse, setStudentResponse] = useState('');
  const [showStudentToolbar, setShowStudentToolbar] = useState(false);

  const [gradingResult, setGradingResult] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    setFile(uploaded);

    if (uploaded.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreviewUrl(reader.result as string);
      reader.readAsDataURL(uploaded);
    } else {
      setFilePreviewUrl(null);
    }
  };

  const insertToInputText = (formula: string) => {
    setInputText((prev) => (prev ? prev + ' ' + formula : formula));
  };

  const insertToStudentResponse = (formula: string) => {
    setStudentResponse((prev) => (prev ? prev + ' ' + formula : formula));
  };

  const handleGetStrategy = async (canvasDataUrl?: string, canvasText?: string) => {
    setIsLoading(true);
    setStrategyData(null);
    setGradingResult(null);

    const imgBase64 = canvasDataUrl || filePreviewUrl || '';
    const textContent = canvasText || inputText || (file ? `File PDF/Word đính kèm: ${file.name}` : '');

    try {
      const response = await aiFetch('/api/tutor/evaluate', {
        method: 'POST',
        body: JSON.stringify({
          imageBase64: imgBase64,
          textContent,
          chapterTitle: 'Giải bài tập thực tế ngoài hệ thống',
          strategyOnly: true,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setStrategyData(data.data);
      } else if (data.error) {
        console.warn(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluateStudentAnswer = async (canvasDataUrl?: string, customText?: string) => {
    const textToSubmit = customText || studentResponse;
    if (!textToSubmit.trim() && !canvasDataUrl) return;
    setIsLoading(true);

    try {
      const response = await aiFetch('/api/tutor/evaluate', {
        method: 'POST',
        body: JSON.stringify({
          imageBase64: canvasDataUrl || filePreviewUrl || '',
          textContent: `Đề bài/Ảnh đã gửi + Lời giải đáp ứng của sinh viên: "${textToSubmit}"`,
          chapterTitle: 'Chấm bài tập thực tế',
          strategyOnly: false,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setGradingResult(data.data);
        const score = typeof data.data?.totalScore === 'number' ? data.data.totalScore : 7;
        const gpaVal = (score / 10) * 4.0;
        if (score >= 7) {
          onAddExp(80, `Chấm bài tự upload: ${score}/10đ`, 1, gpaVal);
        } else {
          onAddExp(30, `Chấm bài tự upload: ${score}/10đ`, 1, gpaVal);
          onRecordMistake({
            id: `mistake_upload_${Date.now()}`,
            chapterId: 0,
            chapterTitle: 'Bài tập tự upload',
            sourceType: 'essay',
            questionSummary: strategyData?.problemType || 'Bài toán upload ngoài hệ thống',
            studentAnswer: textToSubmit,
            correctConcept: 'Theo hướng dẫn chiến lược AI Tutor',
            rootCauseError: data.data?.rootCauseError || 'Lỗi tính toán hoặc lập luận',
            remediationAdvice: data.data?.betterStrategy || 'Ôn tập lại công thức nền tảng',
            timestamp: new Date().toLocaleTimeString(),
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-500/40 p-6 rounded-3xl space-y-2 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
        <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm">
          <Upload className="w-5 h-5 text-cyan-400" />
          <span>TÍNH NĂNG CHẤM BÀI BẰNG HÌNH ẢNH, PDF & BẢNG IPAD</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">
          Trợ Lý AI Phân Tích Chiến Lược & Chấm Điểm Bài Tập Thực Tế (Pólya)
        </h2>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
          Upload đề bài (ảnh JPG/PNG, file PDF, Word) hoặc viết tay trực tiếp trên bảng iPad. AI Tutor EDT sẽ cung cấp <strong className="text-cyan-300 font-bold">Chiến Lược Giải & Gợi Ý</strong> trước khi chấm điểm chi tiết!
        </p>
      </div>

      {/* Input Selector: Upload vs iPad Canvas */}
      <div className="flex gap-2">
        <button
          onClick={() => setUseiPadCanvas(false)}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            !useiPadCanvas
              ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-cyan-400/50 hover:text-white'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload File / Hình Ảnh / PDF</span>
        </button>

        <button
          onClick={() => setUseiPadCanvas(true)}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            useiPadCanvas
              ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-cyan-400/50 hover:text-white'
          }`}
        >
          <Image className="w-4 h-4" />
          <span>Viết Tay Lời Giải Lên Bảng iPad</span>
        </button>
      </div>

      {!useiPadCanvas ? (
        <div className="bg-slate-900/90 border-2 border-cyan-500/30 p-6 rounded-3xl space-y-4 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
          {/* File Upload Box */}
          <div className="border-2 border-dashed border-cyan-500/40 rounded-2xl p-8 text-center bg-slate-950 hover:border-cyan-400 transition-all cursor-pointer">
            <input
              type="file"
              accept="image/*,application/pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload-input"
            />
            <label htmlFor="file-upload-input" className="cursor-pointer space-y-3 block">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                <Upload className="w-7 h-7 text-cyan-400" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-white">
                {file ? file.name : 'Nhấp để tải lên bài tập (Ảnh chụp bài làm JPG/PNG, file PDF, Word)'}
              </p>
              <p className="text-[11px] text-slate-400">Hỗ trợ nhận diện chữ viết tay & công thức toán KaTeX</p>
            </label>
          </div>

          {/* Image Preview */}
          {filePreviewUrl && (
            <div className="max-w-md mx-auto rounded-2xl overflow-hidden border-2 border-cyan-500/30 shadow-lg">
              <img src={filePreviewUrl} alt="Bài tập upload" className="w-full h-auto object-contain" />
            </div>
          )}

          {/* Additional text note with Word Equation Editor */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-200">
              Nhập bổ sung câu hỏi hoặc ghi chú đề bài (nếu cần):
            </label>

            <InteractiveCanvas
              initialText={inputText}
              placeholder="VD: Nhờ AI hướng dẫn chiến lược giải bài toán kiểm định tỷ lệ này... (Nhấn π Equation để chèn công thức)"
              submitButtonText="PHÂN TÍCH & NHẬN GỢI Ý CHIẾN LƯỢC GIẢI TỪ AI TUTOR"
              isSubmitting={isLoading}
              onExportCanvas={(dataUrl, text) => {
                setInputText(text);
                handleGetStrategy(dataUrl || filePreviewUrl || '', text);
              }}
            />
          </div>
        </div>
      ) : (
        /* iPad Canvas Option */
        <InteractiveCanvas
          onExportCanvas={(url, text) => handleGetStrategy(url, text)}
          isSubmitting={isLoading}
        />
      )}

      {/* PHASE 1: AI Strategy Advice Output */}
      {strategyData && !gradingResult && (
        <div className="bg-slate-900 border-2 border-cyan-500/40 p-6 rounded-3xl space-y-4 shadow-[0_0_25px_rgba(6,182,212,0.2)] animate-fade-in">
          <div className="flex items-center gap-2 text-cyan-300 font-black text-base">
            <Lightbulb className="w-5 h-5 text-cyan-400" />
            <span>Chiến Lược Định Hướng Bài Giải (Tư Vấn Trước)</span>
          </div>

          <div className="text-xs sm:text-sm text-slate-200 font-medium">
            <strong className="text-cyan-300">Dạng bài toán:</strong> <MathText text={strategyData.problemType} inline />
          </div>

          <div className="space-y-1.5 text-xs">
            <p className="font-black text-white">📌 Các bước chiến lược thực hiện:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-200 font-medium">
              {strategyData.strategySteps?.map((step: string, i: number) => (
                <li key={i}><MathText text={step} inline /></li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/30 text-xs">
            <p className="font-bold text-cyan-300 mb-1.5">📐 Công thức khuyến nghị:</p>
            <div className="flex flex-wrap gap-2">
              {strategyData.recommendedFormulas?.map((f: string, i: number) => (
                <span key={i} className="font-mono bg-slate-900 px-3 py-1 rounded-lg text-cyan-300 font-bold border border-cyan-500/40">
                  <MathText text={f} inline />
                </span>
              ))}
            </div>
          </div>

          {/* Student Answer Input for Phase 2: WYSIWYG Word Rich Math & Text Editor */}
          <div className="pt-2 space-y-3">
            <label className="block text-xs font-bold text-white">
              Giai đoạn 2: Trình bày bài giải tự luận của bạn (sử dụng khung Equation Word trực tiếp):
            </label>

            <InteractiveCanvas
              initialText={studentResponse}
              placeholder="Nhấp vào trang văn bản này để bắt đầu gõ lời giải... Nhấn π Equation để điền công thức vào ô vuông."
              submitButtonText="NỘP LỜI GIẢI ĐỂ CHẤM ĐIỂM & TÍCH LŨY EXP"
              isSubmitting={isLoading}
              onExportCanvas={(dataUrl, text) => {
                setStudentResponse(text);
                handleEvaluateStudentAnswer(dataUrl, text);
              }}
            />
          </div>
        </div>
      )}

      {/* PHASE 2: Final Grading Output */}
      {gradingResult && (
        <div className="bg-slate-900 border-2 border-emerald-400/70 p-6 rounded-3xl space-y-4 shadow-[0_0_25px_rgba(16,185,129,0.3)] animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-emerald-300 font-black text-base">
              <Award className="w-6 h-6 text-emerald-400" />
              <span>Kết Quả Chấm Điểm Cuối Cùng</span>
            </div>
            <div className="text-2xl font-black font-mono text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
              {gradingResult.totalScore} / 10 điểm
            </div>
          </div>

          <div className="text-xs sm:text-sm text-slate-100 leading-relaxed font-semibold">
            <MathText text={gradingResult.detailedFeedback} />
          </div>

          {gradingResult.betterStrategy && (
            <div className="p-4 bg-slate-950 border border-emerald-500/40 rounded-2xl text-xs text-slate-200 space-y-1">
              <p className="font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Lời khuyên đóng góp từ Cú AI:</span>
              </p>
              <MathText text={gradingResult.betterStrategy} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
