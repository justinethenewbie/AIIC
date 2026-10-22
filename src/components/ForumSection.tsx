import React, { useState } from 'react';
import { ForumPost } from '../types/xstk';
import { MessageSquare, ThumbsUp, Send, ShieldCheck, AlertTriangle, Paperclip, Plus, User } from 'lucide-react';

interface ForumSectionProps {
  onAddExp: (amount: number) => void;
}

const INITIAL_POSTS: ForumPost[] = [
  {
    id: 'post_1',
    authorName: 'Trần Minh Hoàng',
    authorClass: '2026-DHKT01',
    authorAvatar: '👨‍🎓',
    timestamp: '10 phút trước',
    title: 'Hỏi về cách phân biệt bài toán dùng Z-test hay Student T-test?',
    content:
      'Các bạn cho mình hỏi: Khi làm bài kiểm định trung bình mẫu, trong trường hợp mẫu n < 30 nhưng đề bài ĐÃ CHO BIẾT phương sai tổng thể \\sigma^2 thì mình dùng Z-test hay T-test vậy ạ?',
    likes: 12,
    commentsCount: 2,
    comments: [
      { id: 'c1', author: 'Linh Cú EDT AI', text: 'Chào Hoàng! Nếu đã biết phương sai tổng thể \\sigma^2 thì dù n < 30 vẫn dùng Z-test chuẩn nhé!', time: '8 phút trước' },
      { id: 'c2', author: 'Lê Thu Thảo', text: 'Đúng rồi bạn, chỉ khi CHƯA BIẾT phương sai tổng thể và n < 30 mới dùng Student T-test!', time: '5 phút trước' },
    ],
  },
  {
    id: 'post_2',
    authorName: 'Nguyễn Bích Ngọc',
    authorClass: '2026-NHDH02',
    authorAvatar: '👩‍🎓',
    timestamp: '1 giờ trước',
    title: 'Chia sẻ Bộ Đề Thi Thử Cuối Kỳ Xác Suất Thống Kê 2026 kèm Đáp Án Chi Tiết',
    content:
      'Mình vừa tổng hợp bộ 10 đề thi thử XSTK có lời giải chi tiết theo chuẩn Barem của trường. Mọi người tải về luyện cùng mình nhé!',
    attachmentType: 'pdf',
    attachmentName: 'De_Thi_Thu_XSTK_2026_Full_Dap_An.pdf',
    likes: 38,
    commentsCount: 0,
    comments: [],
  },
];

export const ForumSection: React.FC<ForumSectionProps> = ({ onAddExp }) => {
  const [posts, setPosts] = useState<ForumPost[]>(INITIAL_POSTS);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isModerating, setIsModerating] = useState(false);
  const [modWarning, setModWarning] = useState<string | null>(null);

  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsModerating(true);
    setModWarning(null);

    try {
      const response = await fetch('/api/tutor/forum-moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postContent: `${newTitle} ${newContent}` }),
      });

      const data = await response.json();
      const mod = data.data;

      if (mod && !mod.isApproved) {
        setModWarning(`⚠️ AI Giám sát nhắc nhở: ${mod.moderatorNote || 'Nội dung chứa từ ngữ không phù hợp!'}`);
        return;
      }

      const newPost: ForumPost = {
        id: `post_${Date.now()}`,
        authorName: 'Bạn (Sinh viên EDT)',
        authorClass: '2026-DHKT01',
        authorAvatar: '🦉',
        timestamp: 'Vừa xong',
        title: newTitle.trim(),
        content: newContent.trim(),
        likes: 0,
        commentsCount: 0,
        comments: [],
        isModerated: true,
      };

      setPosts([newPost, ...posts]);
      setNewTitle('');
      setNewContent('');
      onAddExp(25);
    } catch (err) {
      console.error(err);
    } finally {
      setIsModerating(false);
    }
  };

  const handleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  const handleAddComment = (postId: string) => {
    if (!commentText.trim()) return;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [
              ...p.comments,
              {
                id: `c_${Date.now()}`,
                author: 'Bạn (Sinh viên EDT)',
                text: commentText.trim(),
                time: 'Vừa xong',
              },
            ],
          };
        }
        return p;
      })
    );

    setCommentText('');
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-500/40 p-6 rounded-3xl space-y-2 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
        <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm">
          <MessageSquare className="w-5 h-5 text-cyan-400" />
          <span>DIỄN ĐÀN ĐIỆN TỬ HỌC XÁC SUẤT THỐNG KÊ EDT</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">
          Kênh Trao Đổi Tri Thức XSTK & Chia Sẻ Đề Thi Có Giám Sát AI
        </h2>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
          Kênh thảo luận học thuật giữa các sinh viên toàn quốc. Được AI giám sát tự động để duy trì môi trường trao đổi học thuật chuẩn mực, tích cực.
        </p>
      </div>

      {/* New Post Form */}
      <form onSubmit={handleCreatePost} className="bg-slate-900/90 border-2 border-cyan-500/30 p-6 rounded-3xl space-y-4 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
        <h3 className="font-black text-xs text-cyan-300">✍️ ĐĂNG BÀI VIẾT HOẶC THẮC MẮC MỚI</h3>

        {modWarning && (
          <div className="p-3 bg-rose-950/80 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{modWarning}</span>
          </div>
        )}

        <input
          type="text"
          required
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Tiêu đề thảo luận ngắn gọn (VD: Thắc mắc bài toán Bayes câu 3 đề thi 2026)..."
          className="w-full p-3 rounded-xl border border-cyan-500/30 bg-slate-950 text-white placeholder-slate-400 text-xs outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-medium"
        />

        <textarea
          required
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Nội dung chi tiết thắc mắc hoặc bài tập cần trao đổi..."
          className="w-full p-3.5 rounded-xl border border-cyan-500/30 bg-slate-950 text-white placeholder-slate-400 text-xs h-24 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 resize-none font-medium"
        />

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>AI Auto-Moderated Active</span>
          </div>

          <button
            type="submit"
            disabled={isModerating}
            className="py-2.5 px-6 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4 text-slate-950" />
            <span>{isModerating ? 'AI đang kiểm duyệt...' : 'ĐĂNG BÀI LÊN DIỄN ĐÀN'}</span>
          </button>
        </div>
      </form>

      {/* Feed Posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-slate-900 border-2 border-cyan-500/25 p-6 rounded-3xl space-y-4 shadow-md hover:border-cyan-500/40 transition-all"
          >
            {/* Author Header */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-1 bg-slate-950 rounded-xl border border-cyan-500/30">{post.authorAvatar}</span>
                <div>
                  <h4 className="font-black text-white">{post.authorName}</h4>
                  <p className="text-[11px] text-slate-300 font-medium">{post.authorClass} • {post.timestamp}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 px-2.5 py-1 rounded-lg font-bold border border-emerald-500/40">
                ✓ Đã kiểm duyệt
              </span>
            </div>

            {/* Title & Content */}
            <h3 className="font-black text-cyan-300 text-sm">{post.title}</h3>
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">{post.content}</p>

            {/* Attachment if present */}
            {post.attachmentName && (
              <div className="p-3 bg-slate-950 rounded-xl border border-cyan-500/30 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-cyan-300">
                  <Paperclip className="w-4 h-4 text-cyan-400" />
                  <span>{post.attachmentName}</span>
                </div>
                <button
                  onClick={() => alert(`Tải xuống ${post.attachmentName} thành công!`)}
                  className="px-3 py-1.5 bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 rounded-lg text-[10px] font-black shadow"
                >
                  Tải Về
                </button>
              </div>
            )}

            {/* Actions: Likes & Comments */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <button
                onClick={() => handleLikePost(post.id)}
                className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-300 font-bold transition-colors"
              >
                <ThumbsUp className="w-4 h-4 text-cyan-400" />
                <span>Hữu ích ({post.likes})</span>
              </button>

              <button
                onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-300 font-bold transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>Bình luận ({post.commentsCount || post.comments.length})</span>
              </button>
            </div>

            {/* Comments List */}
            {activeCommentPostId === post.id && (
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="space-y-2">
                  {post.comments.map((c) => (
                    <div key={c.id} className="p-3 bg-slate-950 rounded-xl text-xs space-y-1 border border-slate-800">
                      <div className="flex justify-between font-bold text-cyan-300 text-[11px]">
                        <span>{c.author}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{c.time}</span>
                      </div>
                      <p className="text-slate-100 font-medium">{c.text}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Gõ bình luận trao đổi..."
                    className="flex-1 p-2.5 rounded-xl border border-cyan-500/30 bg-slate-950 text-white placeholder-slate-400 text-xs outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    className="px-4 py-2.5 bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow"
                  >
                    Gửi
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
