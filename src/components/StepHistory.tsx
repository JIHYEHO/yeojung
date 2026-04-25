import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import { SUBWAY_DATA } from '../data/subway';

/* ─── PhotoCarousel ─────────────────────────────────────── */
interface PhotoCarouselProps {
  photos: string[];
  gradient: string;
}

function PhotoCarousel({ photos, gradient }: PhotoCarouselProps) {
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) setIdx(i => Math.min(i + 1, photos.length - 1));
      else setIdx(i => Math.max(i - 1, 0));
    }
    touchStartX.current = null;
  };

  if (photos.length === 0) {
    return (
      <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <span className="text-6xl opacity-30">🚇</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${idx * 100}%)` }}
      >
        {photos.map((url, i) => (
          <div key={i} className="h-full shrink-0" style={{ minWidth: '100%' }}>
            <img src={url} alt="" className="w-full h-full object-cover object-top" />
          </div>
        ))}
      </div>
      {photos.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {photos.map((_, i) => (
            <div key={i} className={`rounded-full transition-all duration-200 ${i === idx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── CommentSheet ───────────────────────────────────────── */
interface Comment {
  id: string;
  history_id: string;
  nickname: string | null;
  content: string;
  created_at: string;
}

interface CommentSheetProps {
  historyId: string;
  station: string;
  onClose: () => void;
  onCountChange: (id: string, count: number) => void;
}

function CommentSheet({ historyId, station, onClose, onCountChange }: CommentSheetProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const nickname = localStorage.getItem('yeojung_nickname') || '익명';

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('comments')
        .select('*')
        .eq('history_id', historyId)
        .order('created_at', { ascending: true });
      setComments(data || []);
      setLoading(false);
    };
    fetch();
  }, [historyId]);

  const handlePost = async () => {
    if (!text.trim() || posting) return;
    setPosting(true);
    const { data } = await supabase
      .from('comments')
      .insert({ history_id: historyId, nickname, content: text.trim() })
      .select()
      .single();
    if (data) {
      const next = [...comments, data];
      setComments(next);
      onCountChange(historyId, next.length);
      setText('');
      setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }), 50);
    }
    setPosting(false);
  };

  const formatTime = (d: string) => {
    const date = new Date(d);
    return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-end"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full bg-white rounded-t-[2rem] flex flex-col z-10"
        style={{ maxHeight: '75vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 shrink-0">
          <div>
            <p className="font-black text-slate-800 text-base">{station}역 댓글</p>
            <p className="text-xs text-slate-400 font-bold">{comments.length}개의 이야기</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold text-sm">✕</button>
        </div>

        {/* 댓글 목록 */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-4 border-rose-100 border-t-rose-400 rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-3xl">💬</p>
              <p className="text-sm font-bold text-slate-400">첫 댓글을 남겨보세요!</p>
            </div>
          ) : (
            comments.map(c => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF4D6D] to-[#8B5CF6] flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-black">{(c.nickname || '익')[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-xs font-black text-slate-700">{c.nickname || '익명'}</span>
                    <span className="text-[10px] text-slate-300 font-bold">{formatTime(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed break-words">{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 입력창 */}
        <div className="border-t border-slate-100 px-4 py-3 flex gap-2 items-center shrink-0 pb-safe">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF4D6D] to-[#8B5CF6] flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-black">{nickname[0]}</span>
          </div>
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePost()}
            placeholder={`${nickname}님, 한마디 남겨요 ✨`}
            maxLength={100}
            className="flex-1 bg-slate-50 rounded-full px-4 py-2 text-sm font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-normal focus:outline-none border border-slate-100"
          />
          <button
            onClick={handlePost}
            disabled={!text.trim() || posting}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF4D6D] to-[#8B5CF6] flex items-center justify-center shrink-0 disabled:opacity-30 active:scale-95 transition-transform"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" /><path d="M22 2L15 22l-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Types ──────────────────────────────────────────────── */
interface HistoryItem {
  id: string;
  created_at: string;
  line_id: string;
  station: string;
  menu: string;
  activity: string;
  payer_menu: string;
  payer_activity: string;
  public_photo_url?: string | null;
  photo_station?: string | null;
  photo_menu?: string | null;
  photo_activity?: string | null;
  likes?: number;
  nickname?: string | null;
  review?: string | null;
}

const GRADIENTS = [
  'from-[#FF4D6D] to-[#8B5CF6]',
  'from-[#8B5CF6] to-[#FF4D6D]',
  'from-[#FF4D6D] to-[#FF8FA3]',
  'from-[#A78BFA] to-[#FF6B85]',
  'from-[#FF6B85] to-[#C4B5FD]',
  'from-[#7C3AED] to-[#FF4D6D]',
];

interface StepHistoryProps {
  onClose: () => void;
}

/* ─── Main ───────────────────────────────────────────────── */
export default function StepHistory({ onClose }: StepHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);

  useEffect(() => {
    const liked = JSON.parse(localStorage.getItem('liked_journeys') || '[]');
    setLikedIds(new Set(liked));

    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('history')
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(30);
        if (error) throw error;
        const items = data || [];
        setHistory(items);

        // 댓글 수 일괄 조회
        if (items.length > 0) {
          const ids = items.map(i => i.id);
          const { data: counts } = await supabase
            .from('comments')
            .select('history_id')
            .in('history_id', ids);
          if (counts) {
            const map: Record<string, number> = {};
            counts.forEach(c => { map[c.history_id] = (map[c.history_id] || 0) + 1; });
            setCommentCounts(map);
          }
        }
      } catch {
        // 조용히 처리
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleLike = async (item: HistoryItem) => {
    const isLiked = likedIds.has(item.id);
    const newCount = isLiked ? Math.max(0, (item.likes || 0) - 1) : (item.likes || 0) + 1;
    setHistory(prev => prev.map(h => h.id === item.id ? { ...h, likes: newCount } : h));
    const newSet = new Set(likedIds);
    isLiked ? newSet.delete(item.id) : newSet.add(item.id);
    setLikedIds(newSet);
    localStorage.setItem('liked_journeys', JSON.stringify([...newSet]));
    await supabase.from('history').update({ likes: newCount }).eq('id', item.id);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  const openItem = openCommentId ? history.find(h => h.id === openCommentId) : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col w-full pb-28"
      >
        <div className="pt-6 pb-4">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">✨ 실시간 여정 피드</h3>
          <p className="text-sm text-slate-400 font-bold mt-1">다른 사람들의 뜻밖의 여정 💘</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-8 h-8 border-4 border-rose-100 border-t-rose-400 rounded-full animate-spin" />
            <p className="text-slate-400 font-bold text-sm">불러오는 중...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4 px-8">
            <span className="text-5xl">🌸</span>
            <p className="text-slate-500 font-bold leading-relaxed">아직 공유된 여정이 없어요.<br />첫 번째 주인공이 되어보세요!</p>
            <button onClick={onClose} className="mt-2 px-6 py-3 bg-slate-800 text-white font-black rounded-2xl text-sm active:scale-95 transition-transform">
              여정 시작하기 💘
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item, idx) => {
              const lineData = SUBWAY_DATA[item.line_id];
              const lineColor = lineData?.color || '#f43f5e';
              const isLiked = likedIds.has(item.id);
              const gradient = GRADIENTS[idx % GRADIENTS.length];
              const commentCount = commentCounts[item.id] || 0;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100"
                >
                  {/* 사진 */}
                  <div className="relative h-52 overflow-hidden">
                    <PhotoCarousel
                      photos={[item.photo_station, item.photo_menu, item.photo_activity, item.public_photo_url].filter((u): u is string => !!u)}
                      gradient={gradient}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 text-[11px] font-black px-2.5 py-1 rounded-full text-white shadow" style={{ backgroundColor: lineColor }}>
                      {lineData?.name || `${item.line_id}호선`}
                    </span>
                    <div className="absolute bottom-3 left-4">
                      <p className="text-white font-black text-2xl tracking-tighter drop-shadow-md leading-none">{item.station}역</p>
                      <p className="text-white/60 text-xs font-bold mt-0.5">{formatDate(item.created_at)}</p>
                    </div>
                    <button onClick={() => handleLike(item)} className="absolute bottom-3 right-4 flex flex-col items-center gap-0.5">
                      <motion.span whileTap={{ scale: 1.4 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }} className="text-2xl drop-shadow">
                        {isLiked ? '❤️' : '🤍'}
                      </motion.span>
                      <span className="text-white font-black text-[10px] drop-shadow">{item.likes || 0}</span>
                    </button>
                  </div>

                  {/* 하단 정보 */}
                  <div className="px-4 py-3 space-y-2.5">
                    {item.nickname && <p className="text-xs font-black text-slate-500">🌸 {item.nickname}</p>}
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-orange-50 text-orange-500 px-3 py-1.5 rounded-full text-xs font-bold border border-orange-100">🍔 {item.menu}</span>
                      <span className="bg-violet-50 text-violet-500 px-3 py-1.5 rounded-full text-xs font-bold border border-violet-100">🎯 {item.activity}</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-slate-300 text-[11px] font-bold">💸 {item.payer_menu}님</span>
                      <span className="text-slate-200 text-[11px]">·</span>
                      <span className="text-slate-300 text-[11px] font-bold">💸 {item.payer_activity}님</span>
                    </div>
                    {item.review && (
                      <div className="bg-slate-50 rounded-2xl px-3 py-2.5 border border-slate-100">
                        <p className="text-xs font-bold text-slate-500 leading-relaxed">💬 {item.review}</p>
                      </div>
                    )}

                    {/* 댓글 버튼 */}
                    <button
                      onClick={() => setOpenCommentId(item.id)}
                      className="w-full flex items-center gap-2 pt-2 border-t border-slate-50"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span className="text-xs font-bold text-slate-400">
                        {commentCount > 0 ? `댓글 ${commentCount}개` : '댓글 달기'}
                      </span>
                      {commentCount === 0 && <span className="text-xs text-slate-300 font-medium">· 첫 번째로 남겨보세요 ✨</span>}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-6">
          <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl active:scale-95 transition-transform">
            나도 여정 뽑으러 가기 💘
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {openCommentId && openItem && (
          <CommentSheet
            historyId={openCommentId}
            station={openItem.station}
            onClose={() => setOpenCommentId(null)}
            onCountChange={(id, count) => setCommentCounts(prev => ({ ...prev, [id]: count }))}
          />
        )}
      </AnimatePresence>
    </>
  );
}
