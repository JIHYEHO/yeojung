import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Slot } from './Slot';
import { initAudio, playTick, playThud, playTada } from '../utils/audio';

const ACTIVITY_CATEGORIES = [
  '코인노래방', '보드게임카페', '방탈출', '영화보기', '예쁜카페', '산책하기', '쇼핑하기', 'PC방', '만화카페', '오락실', '스포츠/액티비티', '인생네컷'
];
const ACTIVITY_EMOJIS: Record<string, string> = {
  '코인노래방': '🎤', '보드게임카페': '🎲', '방탈출': '🗝️', '영화보기': '🍿', '예쁜카페': '☕', '산책하기': '🚶', '쇼핑하기': '🛍️', 'PC방': '🎮', '만화카페': '📚', '오락실': '🕹️', '스포츠/액티비티': '🎳', '인생네컷': '📸'
};

interface StepActivityProps {
  onComplete: (activity: string) => void;
  previousResults: { station?: string; menu?: string; };
}

export default function StepActivity({ onComplete, previousResults }: StepActivityProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [activity, setActivity] = useState('코인노래방');
  const [result, setResult] = useState<string | null>(null);

  const startRolling = () => {
    if (isRolling) return;
    initAudio();
    playThud();
    setIsRolling(true);
    setResult(null);

    const finalActivity = ACTIVITY_CATEGORIES[Math.floor(Math.random() * ACTIVITY_CATEGORIES.length)];

    let startTime = performance.now();
    let lastVal: any = null;
    const durationMs = 6000; 

    const runTick = () => {
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
        }, 1000); 
        return;
      }

      let progress = elapsed / durationMs;
      let currentDelay = 40 + (350 - 40) * Math.pow(progress, 3);
      
      let next = ACTIVITY_CATEGORIES[Math.floor(Math.random() * ACTIVITY_CATEGORIES.length)];
      while(next === lastVal) next = ACTIVITY_CATEGORIES[Math.floor(Math.random() * ACTIVITY_CATEGORIES.length)];
      
      lastVal = next;
      setActivity(next);
      playTick(800);

      setTimeout(runTick, currentDelay);
    };

    runTick();
  };

  return (
    <motion.div initial={{opacity:0, x: -50}} animate={{opacity:1, x:0}} exit={{opacity:0, x:50}} className="space-y-6">
      <div className="bg-white/40 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/60 space-y-6 shadow-xl text-center">
        <div className="flex flex-col items-center gap-2">
          {previousResults.station && <p className="text-slate-500 font-bold bg-white/50 px-3 py-1 rounded-full shadow-sm text-xs">📍 {previousResults.station}역</p>}
          {previousResults.menu && <p className="text-slate-500 font-bold bg-white/50 px-3 py-1 rounded-full shadow-sm text-xs">🍔 {previousResults.menu}</p>}
        </div>
        
        <div className="flex justify-center pt-2 pb-4">
          <Slot 
            title="ACTIVITY" 
            value={ACTIVITY_EMOJIS[activity] || '🎯'} 
            subValue={activity}
            isRolling={isRolling} 
            isDone={!isRolling && result !== null} 
            color="#8B5CF6" 
          />
        </div>
      </div>

      {!result && (
        <button
          onClick={startRolling}
          disabled={isRolling}
          className={`w-full py-5 rounded-[2rem] text-xl font-black transition-all transform active:scale-95 shadow-[0_10px_20px_-10px_rgba(139,92,246,0.5)] ${isRolling ? 'bg-white/60 text-slate-400 shadow-none border border-white/50' : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:shadow-violet-400/40 cursor-pointer border border-white/20'}`}
        >
          {isRolling ? '고민하는 중... 🤔' : '밥 먹고 뭐하지? 🎯'}
        </button>
      )}

      <AnimatePresence>
        {result && !isRolling && (
          <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} 
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            className="p-8 bg-white/70 backdrop-blur-3xl rounded-[2.5rem] text-center shadow-2xl border border-white/90">
             <h3 className="text-4xl sm:text-5xl font-black text-violet-500 tracking-tighter drop-shadow-sm mb-2">{result} <span className="text-2xl sm:text-3xl text-slate-400 font-bold leading-normal">어때?</span></h3>
             <button onClick={() => onComplete(result)} className="mt-6 w-full py-4 rounded-xl font-bold bg-slate-800 text-white hover:bg-slate-700 shadow-lg active:scale-95 transition-transform">결제할 사람 고르기 👉</button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
