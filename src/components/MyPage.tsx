import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import type { User } from '@supabase/supabase-js';
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
  public_photo_url?: string | null;
  nickname?: string | null;
  review?: string | null;
}

interface MyPageProps {
  user: User | null;
  onStartJourney: () => void;
}

export default function MyPage({ user, onStartJourney }: MyPageProps) {
  const [myHistory, setMyHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<HistoryItem | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<HistoryItem | null>(null);
  const [editingItem, setEditingItem] = useState<HistoryItem | null>(null);
  const [editNickname, setEditNickname] = useState('');
  const [editReview, setEditReview] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('history').delete().eq('id', id);
      if (error) throw error;

      if (!user) {
        const storedIds = JSON.parse(localStorage.getItem('my_journeys') || '[]');
        const newIds = storedIds.filter((sid: string) => sid !== id);
        localStorage.setItem('my_journeys', JSON.stringify(newIds));
      }

      setMyHistory(prev => prev.filter(item => item.id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Delete error:', err);
      setDeleteError('삭제 중 오류가 발생했습니다.');
      setConfirmDeleteId(null);
    }
  };

  const openEditModal = (item: HistoryItem) => {
    setEditingItem(item);
    setEditNickname(item.nickname || localStorage.getItem('yeojung_nickname') || '');
    setEditReview(item.review || '');
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    setSaving(true);
    const trimmedNickname = editNickname.trim();
    const trimmedReview = editReview.trim();
    try {
      await supabase.from('history').update({
        nickname: trimmedNickname || null,
        review: trimmedReview || null,
      }).eq('id', editingItem.id);
      if (trimmedNickname) localStorage.setItem('yeojung_nickname', trimmedNickname);
      setMyHistory(prev => prev.map(h =>
        h.id === editingItem.id ? { ...h, nickname: trimmedNickname || null, review: trimmedReview || null } : h
      ));
      setEditingItem(null);
    } catch {
      // 조용히 처리
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

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
          <p className="text-slate-400 font-bold text-sm">나의 뜻밖의 여정들 💘</p>
        </div>
        {user && (
          <button onClick={handleLogout} className="text-[10px] font-black text-slate-300 border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50 transition-colors">로그아웃</button>
        )}
      </div>

      {deleteError && (
        <p className="text-center text-sm font-bold text-rose-500 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 mb-4">{deleteError}</p>
      )}

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-8">
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
                  className="bg-white p-4 rounded-2xl border border-slate-50 flex items-center justify-between group cursor-pointer active:scale-[0.98] transition-transform"
                  onClick={() => setSelectedDetail(item)}
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
                  <div className="flex gap-1 items-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedMission(item); }}
                      className="w-10 h-10 rounded-xl overflow-hidden bg-rose-50 flex items-center justify-center shrink-0"
                    >
                      {item.public_photo_url
                        ? <img src={item.public_photo_url} alt="" className="w-full h-full object-cover" />
                        : <span className="text-lg">📸</span>
                      }
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditModal(item); }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0 transition-colors ${item.review ? 'bg-violet-100 text-violet-500' : 'bg-slate-50 text-slate-400'}`}
                    >
                      ✏️
                    </button>
                    {confirmDeleteId === item.id ? (
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-2 py-1 text-xs font-black text-white bg-rose-500 rounded-lg"
                        >
                          삭제
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 text-xs font-black text-slate-400 bg-slate-100 rounded-lg"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(item.id); }}
                        className="p-2 text-slate-300 hover:text-slate-500 transition-colors"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedDetail && !selectedMission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setSelectedDetail(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white rounded-[2.5rem] p-6 pb-8 space-y-5 overflow-y-auto max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800">여정 상세</h3>
                <button onClick={() => setSelectedDetail(null)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold">✕</button>
              </div>

              <p className="text-xs font-bold text-slate-400">{formatFullDate(selectedDetail.created_at)}</p>

              <div className="bg-rose-50 px-4 py-3 rounded-2xl flex justify-between items-center">
                <span className="text-xs font-black text-rose-400">{selectedDetail.line_id}호선</span>
                <span className="text-xl font-black text-slate-800">{selectedDetail.station}역</span>
              </div>

              {selectedDetail.public_photo_url && (
                <div className="w-full rounded-2xl overflow-hidden shadow-md">
                  <img src={selectedDetail.public_photo_url} alt="인생네컷" className="w-full h-auto" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-50 p-4 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold text-orange-400">🍔 메뉴</p>
                  <p className="font-black text-slate-700 text-sm">{selectedDetail.menu}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">💸 {selectedDetail.payer_menu}님 결제</p>
                </div>
                <div className="bg-violet-50 p-4 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold text-violet-400">🎯 놀거리</p>
                  <p className="font-black text-slate-700 text-sm">{selectedDetail.activity}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">💸 {selectedDetail.payer_activity}님 결제</p>
                </div>
              </div>

              <button
                onClick={() => { setSelectedMission(selectedDetail); setSelectedDetail(null); }}
                className="w-full py-4 rounded-2xl font-black text-base bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-lg active:scale-95 transition-transform"
              >
                📸 인증샷 프레임 만들기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setEditingItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white rounded-[2.5rem] p-6 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800">✏️ 닉네임 · 후기 작성</h3>
                <button onClick={() => setEditingItem(null)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold">✕</button>
              </div>

              <div className="bg-rose-50 px-4 py-2 rounded-2xl text-center">
                <p className="text-sm font-black text-rose-400">{editingItem.station}역 여정</p>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <span className="text-lg shrink-0">🌸</span>
                  <input
                    type="text"
                    value={editNickname}
                    onChange={e => setEditNickname(e.target.value)}
                    placeholder="닉네임 (피드에 표시돼요)"
                    maxLength={12}
                    className="flex-1 bg-transparent text-sm font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-normal focus:outline-none"
                  />
                </div>

                <div className="bg-slate-50 rounded-2xl px-4 py-3">
                  <div className="flex items-start gap-3">
                    <span className="text-lg shrink-0 mt-0.5">💬</span>
                    <textarea
                      value={editReview}
                      onChange={e => setEditReview(e.target.value)}
                      placeholder="오늘 여정 어떠셨나요? 짧게 남겨주세요 (선택)"
                      maxLength={100}
                      rows={3}
                      className="flex-1 bg-transparent text-sm font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-normal focus:outline-none resize-none"
                    />
                  </div>
                  <p className="text-right text-[10px] text-slate-300 font-bold mt-1">{editReview.length}/100</p>
                </div>
              </div>

              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="w-full py-4 rounded-2xl font-black text-base bg-slate-800 text-white active:scale-95 transition-transform disabled:opacity-50"
              >
                {saving ? '저장 중...' : '피드에 공유하기 💌'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
