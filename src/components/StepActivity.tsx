import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Slot } from './Slot';
import { initAudio, playTick, playThud, playTada } from '../utils/audio';

const ACTIVITY_CATEGORIES = [
  '코인노래방', '보드게임카페', '방탈출', '영화보기', '예쁜카페', '산책하기', '쇼핑하기', 'PC방', '만화카페', '오락실', '스포츠/액티비티', '뜻밖의 네컷'
];
const ACTIVITY_EMOJIS: Record<string, string> = {
  '코인노래방': '🎤', '보드게임카페': '🎲', '방탈출': '🗝️', '영화보기': '🍿', '예쁜카페': '☕', '산책하기': '🚶', '쇼핑하기': '🛍️', 'PC방': '🎮', '만화카페': '📚', '오락실': '🕹️', '스포츠/액티비티': '🎳', '뜻밖의 네컷': '📸'
};

interface StepActivityProps {
  onComplete: (activity: string) => void;
  previousResults: { station?: string; menu?: string; };
}

export default function StepActivity({ onComplete, previousResults }: StepActivityProps) {
  const [phase, setPhase] = useState<'select' | 'rolling'>('select');
  const [selected, setSelected] = useState<string[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [activity, setActivity] = useState('코인노래방');
  const [result, setResult] = useState<string | null>(null);
  const cancelled = useRef(false);
  useEffect(() => {
    cancelled.current = false;
    return () => { cancelled.current = true; };
  }, []);

  const toggleCategory = (cat: string) => {
    setSelected(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleAll = () => {
    setSelected(selected.length === ACTIVITY_CATEGORIES.length ? [] : [...ACTIVITY_CATEGORIES]);
  };

  const startRolling = () => {
    if (isRolling) return;
    initAudio();
    playThud();
    setIsRolling(true);
    setResult(null);

    const pool = selected;
    const finalActivity = pool[Math.floor(Math.random() * pool.length)];

    let startTime = performance.now();
    let lastVal: any = null;
    const durationMs = 6000;

    const runTick = () => {
      if (cancelled.current) return;
      let now = performance.now();
      let elapsed = now - startTime;

      if (elapsed >= durationMs) {
        setActivity(finalActivity);
        setIsRolling(false);
        setResult(finalActivity);
        playThud();
        setTimeout(() => {
          playTada();
          confetti({
            particleCount: 200,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#818CF8', '#A78BFA', '#C084FC', '#E879F9', '#F472B6']
          });
        }, 400);
        return;
      }

      let progress = elapsed / durationMs;
      let currentDelay = 40 + (350 - 40) * Math.pow(progress, 3);
      let next = pool[Math.floor(Math.random() * pool.length)];
      while (next === lastVal && pool.length > 1) next = pool[Math.floor(Math.random() * pool.length)];
      lastVal = next;
      setActivity(next);
      playTick(800);
      setTimeout(runTick, currentDelay);
    };

    runTick();
  };

  const MIN = 6;
  const canStart = selected.length >= MIN;

  return (
    <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-6 shadow-sm text-center">
        <div className="flex flex-col items-center gap-2">
          {previousResults.station && <p className="text-slate-500 font-bold bg-slate-50 px-3 py-1 rounded-full text-xs border border-slate-100">📍 {previousResults.station}역</p>}
          {previousResults.menu && <p className="text-slate-500 font-bold bg-slate-50 px-3 py-1 rounded-full text-xs border border-slate-100">🍔 {previousResults.menu}</p>}
        </div>

        <AnimatePresence mode="wait">
          {phase === 'select' ? (
            <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 text-left">
              <div className="bg-violet-50 rounded-xl px-4 py-3 border border-violet-100">
                <p className="text-sm font-black text-violet-500 mb-0.5">오늘 하고 싶은 것만 골라요 🎯</p>
                <p className="text-xs text-violet-400 font-medium">6개 이상 선택하면 그 중에서 랜덤으로 뽑아드려요</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-slate-400">{selected.length > 0 ? `${selected.length}개 선택됨` : '아직 선택 안 했어요'}</p>
                <button onClick={toggleAll} className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  {selected.length === ACTIVITY_CATEGORIES.length ? '전체 해제' : '전체 선택'}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {ACTIVITY_CATEGORIES.map(cat => {
                  const isOn = selected.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${isOn ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200'}`}
                    >
                      {ACTIVITY_EMOJIS[cat]} {cat}
                    </button>
                  );
                })}
              </div>
              {!canStart && selected.length > 0 && (
                <p className="text-center text-xs font-bold text-rose-400">{MIN - selected.length}개 더 선택하면 룰렛 시작!</p>
              )}
            </motion.div>
          ) : (
            <motion.div key="rolling" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center pt-2 pb-4">
              <Slot
                title="ACTIVITY"
                value={ACTIVITY_EMOJIS[activity] || '🎯'}
                subValue={activity}
                isRolling={isRolling}
                isDone={!isRolling && result !== null}
                color="#8B5CF6"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {phase === 'select' && (
        <button
          onClick={() => setPhase('rolling')}
          disabled={!canStart}
          className={`w-full py-5 rounded-2xl text-xl font-black transition-all active:scale-95 ${canStart ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}
        >
          {canStart ? `이 ${selected.length}개로 룰렛 돌리기! 🎲` : `${MIN}개 이상 선택해 주세요`}
        </button>
      )}

      {phase === 'rolling' && !result && (
        <button
          onClick={startRolling}
          disabled={isRolling}
          className={`w-full py-5 rounded-2xl text-xl font-black transition-all active:scale-95 ${isRolling ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white'}`}
        >
          {isRolling ? '고민하는 중... 🤔' : '밥 먹고 뭐하지? 🎯'}
        </button>
      )}

      <AnimatePresence>
        {result && !isRolling && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 100 }}
            className="p-8 bg-white rounded-2xl text-center shadow-sm border border-slate-100">
            <h3 className="text-3xl sm:text-4xl font-black text-violet-500 tracking-tighter drop-shadow-sm mb-2">{result} <span className="text-xl sm:text-2xl text-slate-400 font-bold leading-normal">어때?</span></h3>
            <button onClick={() => onComplete(result)} className="mt-6 w-full py-4 rounded-xl font-bold bg-slate-900 text-white active:scale-95 transition-transform">결제할 사람 고르기 👉</button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
