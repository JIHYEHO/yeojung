import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';

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
}

interface StepHistoryProps {
  onClose: () => void;
}

export default function StepHistory({ onClose }: StepHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('history')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        setHistory(data || []);
      } catch (err) {
        console.error('History fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="flex flex-col w-full pb-20"
    >
      <div className="flex items-center justify-between py-6">
        <h3 className="text-2xl font-black text-slate-800">🔭 실시간 여정 피드</h3>
      </div>


      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold">다른 사람들의 여정 불러오는 중...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
            <span className="text-5xl">🏜️</span>
            <p className="text-slate-400 font-bold">아직 기록된 여정이 없어요.<br />첫 번째 주인공이 되어보세요!</p>
          </div>
        ) : (
          history.map((item) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-5 rounded-3xl border border-rose-50 shadow-sm hover:shadow-md transition-shadow space-y-3"
            >
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="text-[10px] font-bold text-slate-300">{formatDate(item.created_at)}</span>
                <span className="text-[11px] font-black text-rose-400 px-2 py-0.5 bg-rose-50 rounded-full">{item.line_id}호선</span>
              </div>
              
              {item.public_photo_url && (
                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                  <img src={item.public_photo_url} alt="Mission Photo" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">📍</div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400">모임 장소</p>
                  <p className="font-black text-slate-700">{item.station}역</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-50/50 p-3 rounded-2xl">
                  <p className="text-[9px] font-bold text-orange-400 mb-1">🍔 메뉴</p>
                  <p className="text-sm font-black text-slate-700">{item.menu}</p>
                </div>
                <div className="bg-violet-50/50 p-3 rounded-2xl">
                  <p className="text-[9px] font-bold text-violet-400 mb-1">🎯 놀거리</p>
                  <p className="text-sm font-black text-slate-700">{item.activity}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <span className="text-[10px] font-bold bg-slate-50 text-slate-500 px-2 py-1 rounded-lg">💸 {item.payer_menu}님 결제</span>
                <span className="text-[10px] font-bold bg-slate-50 text-slate-500 px-2 py-1 rounded-lg">💸 {item.payer_activity}님 결제</span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="p-6 bg-gradient-to-t from-white to-transparent">
        <button 
          onClick={onClose}
          className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black shadow-lg active:scale-95 transition-transform"
        >
          나도 뽑으러 가기 👉
        </button>
      </div>
    </motion.div>
  );
}
