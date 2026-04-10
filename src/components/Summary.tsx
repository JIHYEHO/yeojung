import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { SUBWAY_DATA } from '../data/subway';
import { supabase } from '../utils/supabaseClient';

interface SummaryProps {
  results: { 
    line?: string;
    startStation?: string;
    station?: string; 
    menu?: string; 
    menuPayer?: string; 
    activity?: string; 
    activityPayer?: string; 
  };
  user?: any;
  onReset: () => void;
}

import { useRef } from 'react';

export default function Summary({ results, user, onReset }: SummaryProps) {
  const hasSaved = useRef(false);
  const lineData = results.line ? SUBWAY_DATA[results.line] : undefined;
  const lineColor = lineData?.color || '#ec4899';

  useEffect(() => {
    const saveToHistory = async () => {
      if (hasSaved.current) return;
      hasSaved.current = true;

      try {
        const { data, error } = await supabase.from('history').insert([
          {
            line_id: results.line,
            station: results.station,
            menu: results.menu,
            activity: results.activity,
            payer_menu: results.menuPayer,
            payer_activity: results.activityPayer,
            user_id: user?.id || null
          }
        ]).select('id').single();

        if (error) throw error;
        
        // localStorage에 내 기기 전용 ID 리스트 저장
        if (data && data.id) {
          const myJourneys = JSON.parse(localStorage.getItem('my_journeys') || '[]');
          localStorage.setItem('my_journeys', JSON.stringify([...myJourneys, data.id]));
        }

        console.log("히스토리 저장 성공! 🚀");
      } catch (err) {
        console.error("히스토리 저장 실패:", err);
      }
    };

    saveToHistory();
  }, [results]);

  const handleShare = async () => {
    const text = `✨ 우리의 완벽한 데이트/모임 코스 ✨\n\n🚇 모임: ${lineData?.name || ''} ${results.station}역\n🍔 메뉴: ${results.menu} (💸결제: ${results.menuPayer})\n🎯 놀거리: ${results.activity} (💸결제: ${results.activityPayer})\n\n우리 오늘 이거 어때? 💖\n(만든곳: 뜻밖의 여정)`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: '우리의 랜덤코스 결과!',
          text: text,
        });
      } catch (err) {
        console.log("공유 취소됨");
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert("데이트 코스가 텍스트로 클립보드에 복사되었습니다! 카카오톡에 붙여넣기 하세요!");
      } catch (err) {
        alert("복사에 실패했습니다.");
      }
    }
  };

  return (
    <motion.div initial={{opacity:0, scale: 0.9}} animate={{opacity:1, scale:1}} className="space-y-6 w-full">
      <div className="bg-white/40 backdrop-blur-2xl p-6 sm:p-8 rounded-[2.5rem] border border-white/60 space-y-6 shadow-2xl relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/80 to-transparent pointer-events-none rounded-t-[2.5rem]"></div>
        <h3 className="text-2xl font-black text-slate-800 relative z-10">✨ 완벽한 데이트 라인업</h3>
        
        <div className="space-y-3 relative z-10">
          <div className="bg-white/70 p-4 rounded-2xl border border-white/80 shadow-sm flex flex-col gap-1 items-start justify-center">
            <span className="text-slate-400 font-bold text-sm mb-1">📍 최종 모임 장소</span>
            <div className="flex w-full justify-between items-end">
              <span className="text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md shadow-sm border border-white/20" style={{ backgroundColor: lineColor, color: '#fff' }}>
                {lineData?.name} {results.startStation} 출발
              </span>
              <span className="text-xl sm:text-2xl font-black drop-shadow-sm" style={{ color: lineColor }}>{results.station}역</span>
            </div>
          </div>

          <div className="bg-white/70 p-4 rounded-2xl border border-white/80 shadow-sm grid grid-cols-2 text-left gap-4">
            <div>
               <span className="text-slate-400 font-bold text-[10px] sm:text-xs block mb-1">🍔 메뉴</span>
               <span className="text-lg font-black text-orange-500 truncate block">{results.menu}</span>
            </div>
            <div className="border-l border-slate-200 pl-4">
               <span className="text-slate-400 font-bold text-[10px] sm:text-xs block mb-1">💸 식비 결제</span>
               <span className="text-lg font-black text-emerald-500 truncate block">{results.menuPayer}님</span>
            </div>
          </div>

          <div className="bg-white/70 p-4 rounded-2xl border border-white/80 shadow-sm grid grid-cols-2 text-left gap-4">
            <div>
               <span className="text-slate-400 font-bold text-[10px] sm:text-xs block mb-1">🎯 놀거리</span>
               <span className="text-lg font-black text-violet-500 truncate block">{results.activity}</span>
            </div>
            <div className="border-l border-slate-200 pl-4">
               <span className="text-slate-400 font-bold text-[10px] sm:text-xs block mb-1">💸 놀거리 결제</span>
               <span className="text-lg font-black text-teal-500 truncate block">{results.activityPayer}님</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <button onClick={handleShare} className="w-full py-5 rounded-[2rem] text-xl font-black transition-all bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-lg active:scale-95 border border-white/20">
          이 코스로 친구한테 공유하기 💌
        </button>
        <button onClick={() => window.open(`https://search.naver.com/search.naver?query=${encodeURIComponent(results.station + '역 데이트 추천')}`, '_blank')} className="w-full py-4 rounded-[2rem] flex flex-col items-center justify-center transition-all bg-[#03C75A] text-white shadow-lg border border-[#03C75A]/20 active:scale-95">
          <span className="text-lg font-black tracking-tight">뜻밖의 추억 쌓기 💡</span>
          <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full mt-1">네이버에서 '{results.station}역 데이트' 동선 찾기 👇</span>
        </button>
        <button onClick={onReset} className="w-full py-4 rounded-[2rem] text-lg font-black transition-all bg-white/60 text-slate-600 hover:bg-white shadow-sm border border-slate-200 active:scale-95 line-clamp-1">
          처음부터 다시하기 🔄
        </button>
      </div>
    </motion.div>
  );
}
