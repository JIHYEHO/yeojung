import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import type { User } from '@supabase/supabase-js';
import Auth from './Auth';
import PhotoMission from './PhotoMission';

interface HistoryItem {
  id: string;
  created_at: string;
  line_id: string;
  station: string;
  menu: string;
  activity: string;
  payer_menu: string;
  payer_activity: string;
}

interface MyPageProps {
  user: User | null;
  onStartJourney: () => void;
}

export default function MyPage({ user, onStartJourney }: MyPageProps) {
  const [showAuth, setShowAuth] = useState(false);
  const [myHistory, setMyHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<HistoryItem | null>(null);

  useEffect(() => {
    const fetchMyHistory = async () => {
      setLoading(true);
      try {
        let storedIds: string[] = [];
        
        if (user) {
          // 로그인 상태: DB에서 해당 user_id 기록 가져오기
          const { data, error } = await supabase
            .from('history')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setMyHistory(data || []);
        } else {
          // 게스트 상태: localStorage ID들로 가져오기
          storedIds = JSON.parse(localStorage.getItem('my_journeys') || '[]');
          if (storedIds.length === 0) {
            setMyHistory([]);
            return;
          }

          const { data, error } = await supabase
            .from('history')
            .select('*')
            .in('id', storedIds)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setMyHistory(data || []);
        }
      } catch (err) {
        console.error('My history fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyHistory();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowAuth(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 기록을 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase.from('history').delete().eq('id', id);
      if (error) throw error;

      if (!user) {
        const storedIds = JSON.parse(localStorage.getItem('my_journeys') || '[]');
        const newIds = storedIds.filter((sid: string) => sid !== id);
        localStorage.setItem('my_journeys', JSON.stringify(newIds));
      }

      setMyHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  if (showAuth && !user) {
    return (
      <div className="w-full">
         <button onClick={() => setShowAuth(false)} className="mb-4 text-slate-400 font-bold flex items-center gap-1">
           ‹ 돌아가기
         </button>
         <Auth />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="flex flex-col w-full pb-20"
    >
      <div className="py-6 flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-slate-800">👤 마이페이지</h3>
          <p className="text-slate-400 font-bold text-sm">
            {user ? `${user.email?.split('@')[0]}님, 안녕하세요! ✨` : '반가워요, 게스트님! 👋'}
          </p>
        </div>
        {user ? (
          <button onClick={handleLogout} className="text-[10px] font-black text-slate-300 border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50 transition-colors">로그아웃</button>
        ) : (
          <button onClick={() => setShowAuth(true)} className="text-[10px] font-black text-rose-500 bg-rose-50 px-3 py-1.5 rounded-full hover:bg-rose-100 transition-colors">로그인하기</button>
        )}
      </div>

      <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/80 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-black text-slate-700">{user ? '저장된 여정' : '나의 여정 기록'}</h4>
          <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-full">{myHistory.length}개의 조각</span>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 border-3 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
          </div>
        ) : myHistory.length === 0 ? (
          <div className="py-12 text-center space-y-4">
            <p className="text-slate-400 font-bold text-sm leading-relaxed">
              아직 다녀온 여정이 없네요.<br/>
              오늘 첫 번째 추억을 만들어볼까요?
            </p>
            <button 
              onClick={onStartJourney}
              className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm active:scale-95 transition-transform"
            >
              여정 시작하기 👉
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {myHistory.map((item) => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white p-4 rounded-2xl border border-slate-50 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-lg">📍</div>
                    <div>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black text-rose-400">{item.line_id}호선</span>
                         <span className="text-[10px] font-bold text-slate-300">{formatDate(item.created_at)}</span>
                      </div>
                      <p className="font-black text-slate-700 text-sm">{item.station}역 여정</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setSelectedMission(item)}
                      className="p-2 text-rose-400 hover:text-rose-600 transition-colors bg-rose-50 rounded-xl"
                    >
                      📸
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-slate-300 hover:text-slate-500 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedMission && (
          <PhotoMission 
            journeyId={selectedMission.id}
            lineId={selectedMission.line_id}
            station={selectedMission.station}
            menu={selectedMission.menu}
            activity={selectedMission.activity}
            onClose={() => setSelectedMission(null)}
            onSuccess={() => {
              setSelectedMission(null);
              // Option: Refresh history if needed to show updated item
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
