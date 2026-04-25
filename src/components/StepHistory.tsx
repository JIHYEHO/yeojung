import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import { SUBWAY_DATA } from '../data/subway';

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
  likes?: number;
  nickname?: string | null;
  review?: string | null;
}

const GRADIENTS = [
  'from-rose-400 to-pink-500',
  'from-violet-400 to-fuchsia-500',
  'from-pink-400 to-rose-500',
  'from-fuchsia-400 to-violet-500',
  'from-orange-400 to-rose-400',
  'from-indigo-400 to-violet-500',
];

interface StepHistoryProps {
  onClose: () => void;
}

export default function StepHistory({ onClose }: StepHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const liked = JSON.parse(localStorage.getItem('liked_journeys') || '[]');
    setLikedIds(new Set(liked));

    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('history')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(30);
        if (error) throw error;
        setHistory(data || []);
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col w-full pb-28"
    >
      {/* 헤더 */}
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

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100"
              >
                {/* 상단 사진 or 그라디언트 */}
                <div className="relative h-52 overflow-hidden">
                  {item.public_photo_url ? (
                    <img
                      src={item.public_photo_url}
                      alt=""
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                      <span className="text-6xl opacity-30">🚇</span>
                    </div>
                  )}
                  {/* 하단 그라디언트 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* 노선 뱃지 */}
                  <span
                    className="absolute top-3 left-3 text-[11px] font-black px-2.5 py-1 rounded-full text-white shadow"
                    style={{ backgroundColor: lineColor }}
                  >
                    {lineData?.name || `${item.line_id}호선`}
                  </span>

                  {/* 역명 오버레이 */}
                  <div className="absolute bottom-3 left-4">
                    <p className="text-white font-black text-2xl tracking-tighter drop-shadow-md leading-none">{item.station}역</p>
                    <p className="text-white/60 text-xs font-bold mt-0.5">{formatDate(item.created_at)}</p>
                  </div>

                  {/* 하트 버튼 */}
                  <button
                    onClick={() => handleLike(item)}
                    className="absolute bottom-3 right-4 flex flex-col items-center gap-0.5"
                  >
                    <motion.span
                      whileTap={{ scale: 1.4 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      className="text-2xl drop-shadow"
                    >
                      {isLiked ? '❤️' : '🤍'}
                    </motion.span>
                    <span className="text-white font-black text-[10px] drop-shadow">{item.likes || 0}</span>
                  </button>
                </div>

                {/* 하단 정보 */}
                <div className="px-4 py-3 space-y-2.5">
                  {/* 닉네임 */}
                  {item.nickname && (
                    <p className="text-xs font-black text-slate-500">🌸 {item.nickname}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-orange-50 text-orange-500 px-3 py-1.5 rounded-full text-xs font-bold border border-orange-100">
                      🍔 {item.menu}
                    </span>
                    <span className="bg-violet-50 text-violet-500 px-3 py-1.5 rounded-full text-xs font-bold border border-violet-100">
                      🎯 {item.activity}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-slate-300 text-[11px] font-bold">💸 {item.payer_menu}님</span>
                    <span className="text-slate-200 text-[11px]">·</span>
                    <span className="text-slate-300 text-[11px] font-bold">💸 {item.payer_activity}님</span>
                  </div>
                  {/* 후기 */}
                  {item.review && (
                    <div className="bg-slate-50 rounded-2xl px-3 py-2.5 border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 leading-relaxed">💬 {item.review}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={onClose}
          className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl active:scale-95 transition-transform"
        >
          나도 여정 뽑으러 가기 💘
        </button>
      </div>
    </motion.div>
  );
}
