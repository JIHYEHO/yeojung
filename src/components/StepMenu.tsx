import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Slot } from './Slot';
import { initAudio, playTick, playThud, playTada } from '../utils/audio';

const FOOD_CATEGORIES = [
  '한식', '중식', '일식', '양식', '분식', '아시안', '패스트푸드', '카페/디저트', '고기/구이', '해산물', '퓨전', '야식'
];
const FOOD_EMOJIS: Record<string, string> = {
  '한식': '🍚', '중식': '🍜', '일식': '🍣', '양식': '🍝', '분식': '🍘', '아시안': '🍛', '패스트푸드': '🍔', '카페/디저트': '🍰', '고기/구이': '🥩', '해산물': '🦐', '퓨전': '🌮', '야식': '🍗'
};

interface StepMenuProps {
  onComplete: (menu: string) => void;
  previousResult?: string;
}

export default function StepMenu({ onComplete, previousResult }: StepMenuProps) {
  const [phase, setPhase] = useState<'select' | 'rolling'>('select');
  const [selected, setSelected] = useState<string[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [menu, setMenu] = useState('한식');
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
    setSelected(selected.length === FOOD_CATEGORIES.length ? [] : [...FOOD_CATEGORIES]);
  };

  const startRolling = () => {
    if (isRolling) return;
    initAudio();
    playThud();
    setIsRolling(true);
    setResult(null);

    const pool = selected;
    const finalMenu = pool[Math.floor(Math.random() * pool.length)];

    let startTime = performance.now();
    let lastVal: any = null;
    const durationMs = 6000;

    const runTick = () => {
      if (cancelled.current) return;
      let now = performance.now();
      let elapsed = now - startTime;

      if (elapsed >= durationMs) {
        setMenu(finalMenu);
        setIsRolling(false);
        setResult(finalMenu);
        playThud();
        setTimeout(() => {
          playTada();
          confetti({
            particleCount: 200,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#f472b6', '#a78bfa', '#38bdf8', '#facc15', '#fb7185']
          });
        }, 400);
        return;
      }

      let progress = elapsed / durationMs;
      let currentDelay = 40 + (350 - 40) * Math.pow(progress, 3);
      let next = pool[Math.floor(Math.random() * pool.length)];
      while (next === lastVal && pool.length > 1) next = pool[Math.floor(Math.random() * pool.length)];
      lastVal = next;
      setMenu(next);
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
        {previousResult && <p className="text-slate-500 font-bold bg-slate-50 inline-block px-4 py-2 rounded-full text-sm border border-slate-200">📍 {previousResult}역에서 뭐 먹지?</p>}

        <AnimatePresence mode="wait">
          {phase === 'select' ? (
            <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 text-left">
              <div className="bg-rose-50 rounded-xl px-4 py-3 border border-rose-100">
                <p className="text-sm font-black text-rose-500 mb-0.5">오늘 먹고 싶은 것만 골라요 🍽️</p>
                <p className="text-xs text-rose-400 font-medium">6개 이상 선택하면 그 중에서 랜덤으로 뽑아드려요</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-slate-400">{selected.length > 0 ? `${selected.length}개 선택됨` : '아직 선택 안 했어요'}</p>
                <button onClick={toggleAll} className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  {selected.length === FOOD_CATEGORIES.length ? '전체 해제' : '전체 선택'}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {FOOD_CATEGORIES.map(cat => {
                  const isOn = selected.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${isOn ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-slate-400 border-slate-200'}`}
                    >
                      {FOOD_EMOJIS[cat]} {cat}
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
                value={FOOD_EMOJIS[menu] || '🍽️'}
                subValue={menu}
                isRolling={isRolling}
                isDone={!isRolling && result !== null}
                color="#ec4899"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {phase === 'select' && (
        <button
          onClick={() => setPhase('rolling')}
          disabled={!canStart}
          className={`w-full py-5 rounded-2xl text-xl font-black transition-all active:scale-95 ${canStart ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'}`}
        >
          {canStart ? `이 ${selected.length}개로 룰렛 돌리기! 🎲` : `${MIN}개 이상 선택해 주세요`}
        </button>
      )}

      {phase === 'rolling' && !result && (
        <button
          onClick={startRolling}
          disabled={isRolling}
          className={`w-full py-5 rounded-2xl text-xl font-black transition-all active:scale-95 ${isRolling ? 'bg-slate-100 text-slate-400' : 'bg-rose-500 text-white'}`}
        >
          {isRolling ? '고민하는 중... 🤔' : '오늘의 메뉴 정하기! 🌭'}
        </button>
      )}

      <AnimatePresence>
        {result && !isRolling && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 100 }}
            className="p-8 bg-white rounded-2xl text-center shadow-sm border border-slate-100">
            <h3 className="text-3xl sm:text-4xl font-black text-rose-500 tracking-tighter drop-shadow-sm mb-2">{result} <span className="text-xl sm:text-2xl text-slate-400 font-bold leading-normal">당첨!</span></h3>
            <button onClick={() => onComplete(result)} className="mt-6 w-full py-4 rounded-xl font-bold bg-slate-900 text-white active:scale-95 transition-transform">결제할 사람 고르기 👉</button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
