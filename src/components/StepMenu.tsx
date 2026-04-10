import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Slot } from './Slot';
import { initAudio, playTick, playThud, playTada } from '../utils/audio';

const FOOD_CATEGORIES = [
  '한식', '중식', '일식', '양식', '분식', '아시안', '패스트푸드', '카페/디저트', '고기/구이', '해산물', '퓨전', '야식'
];
const FOOD_EMOJIS: Record<string, string> = {
  '한식': '🍚', '중식': '🍜', '일식': '🍣', '양식': '🍝', '분식': '떡', '아시안': '🍛', '패스트푸드': '🍔', '카페/디저트': '🍰', '고기/구이': '🥩', '해산물': '🦐', '퓨전': '🌮', '야식': '🍗'
};

interface StepMenuProps {
  onComplete: (menu: string) => void;
  previousResult?: string;
}

export default function StepMenu({ onComplete, previousResult }: StepMenuProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [menu, setMenu] = useState('한식');
  const [result, setResult] = useState<string | null>(null);

  const startRolling = () => {
    if (isRolling) return;
    initAudio();
    playThud();
    setIsRolling(true);
    setResult(null);

    const finalMenu = FOOD_CATEGORIES[Math.floor(Math.random() * FOOD_CATEGORIES.length)];

    let startTime = performance.now();
    let lastVal: any = null;
    const durationMs = 6000; // 메뉴 룰렛은 가볍게 6초

    const runTick = () => {
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
        }, 1000); 
        return;
      }

      let progress = elapsed / durationMs;
      let currentDelay = 40 + (350 - 40) * Math.pow(progress, 3);
      
      let next = FOOD_CATEGORIES[Math.floor(Math.random() * FOOD_CATEGORIES.length)];
      while(next === lastVal) next = FOOD_CATEGORIES[Math.floor(Math.random() * FOOD_CATEGORIES.length)];
      
      lastVal = next;
      setMenu(next);
      playTick(800);

      setTimeout(runTick, currentDelay);
    };

    runTick();
  };

  return (
    <motion.div initial={{opacity:0, x: -50}} animate={{opacity:1, x:0}} exit={{opacity:0, x:50}} className="space-y-6">
      <div className="bg-white/40 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/60 space-y-6 shadow-xl text-center">
        {previousResult && <p className="text-slate-500 font-bold bg-white/50 inline-block px-4 py-2 rounded-full shadow-sm text-sm">📍 {previousResult}역에서 뭐 먹지?</p>}
        
        <div className="flex justify-center pt-2 pb-4">
          <Slot 
            value={FOOD_EMOJIS[menu] || '🍽️'} 
            subValue={menu}
            isRolling={isRolling} 
            isDone={!isRolling && result !== null} 
            color="#ec4899" 
          />
        </div>
      </div>

      {!result && (
        <button
          onClick={startRolling}
          disabled={isRolling}
          className={`w-full py-5 rounded-[2rem] text-xl font-black transition-all transform active:scale-95 shadow-[0_10px_20px_-10px_rgba(249,115,22,0.5)] ${isRolling ? 'bg-white/60 text-slate-400 shadow-none border border-white/50' : 'bg-gradient-to-r from-orange-400 to-rose-400 text-white hover:shadow-orange-400/40 cursor-pointer border border-white/20'}`}
        >
          {isRolling ? '고민하는 중... 🤔' : '오늘의 메뉴 정하기! 🌭'}
        </button>
      )}

      <AnimatePresence>
        {result && !isRolling && (
          <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} 
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            className="p-8 bg-white/70 backdrop-blur-3xl rounded-[2.5rem] text-center shadow-2xl border border-white/90">
             <h3 className="text-3xl sm:text-4xl font-black text-rose-500 tracking-tighter drop-shadow-sm mb-2">{result} <span className="text-xl sm:text-2xl text-slate-400 font-bold leading-normal">당첨!</span></h3>
             <button onClick={() => onComplete(result)} className="mt-6 w-full py-4 rounded-xl font-bold bg-slate-800 text-white hover:bg-slate-700 shadow-lg active:scale-95 transition-transform">결제할 사람 고르기 👉</button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
