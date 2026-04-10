import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Slot } from './Slot';
import { initAudio, playTick, playThud, playTada } from '../utils/audio';

interface StepPaymentProps {
  onComplete: (payer: string) => void;
  previousResults: { station?: string; menu?: string; activity?: string; };
  context: 'menu' | 'activity'; // 밥값인지 놀거리인지 구분
}

export default function StepPayment({ onComplete, previousResults, context }: StepPaymentProps) {
  const [participants, setParticipants] = useState<string[]>(['나', '너']);
  const [newParticipant, setNewParticipant] = useState('');
  
  const [isRolling, setIsRolling] = useState(false);
  const [payer, setPayer] = useState('나');
  const [result, setResult] = useState<string | null>(null);

  const addParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (newParticipant.trim() && !participants.includes(newParticipant.trim())) {
      setParticipants([...participants, newParticipant.trim()]);
      setNewParticipant('');
    }
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const startRolling = () => {
    if (isRolling || participants.length < 2) return;
    initAudio();
    playThud();
    setIsRolling(true);
    setResult(null);

    const finalPayer = participants[Math.floor(Math.random() * participants.length)];

    let startTime = performance.now();
    let lastVal: any = null;
    const durationMs = 8000;

    const runTick = () => {
      let now = performance.now();
      let elapsed = now - startTime;
      
      if (elapsed >= durationMs) {
        setPayer(finalPayer);
        setIsRolling(false);
        setResult(finalPayer);
        playThud();
        
        setTimeout(() => {
          playTada();
          confetti({
            particleCount: 300,
            spread: 120,
            origin: { y: 0.6 },
            colors: ['#10B981', '#34D399', '#A7F3D0', '#FDE68A', '#FCD34D'] 
          });
        }, 1500); 
        return;
      }

      let progress = elapsed / durationMs;
      let currentDelay = 40 + (450 - 40) * Math.pow(progress, 3);
      
      let next = participants[Math.floor(Math.random() * participants.length)];
      if (participants.length > 1) {
        while(next === lastVal) next = participants[Math.floor(Math.random() * participants.length)];
      }
      
      lastVal = next;
      setPayer(next);
      playTick(900);

      setTimeout(runTick, currentDelay);
    };

    runTick();
  };

  const isMenu = context === 'menu';
  const targetItem = isMenu ? previousResults.menu : previousResults.activity;
  const targetEmoji = isMenu ? '🍔' : '🎮';
  const nextButtonText = isMenu ? '밥 먹고 뭐하지? 👉' : '최종 결과 보기 👉';

  return (
    <motion.div initial={{opacity:0, x: -50}} animate={{opacity:1, x:0}} exit={{opacity:0, x:50}} className="space-y-6">
      <div className="bg-white/40 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/60 space-y-6 shadow-xl text-center">
        <div className="flex flex-col items-center gap-2">
          {previousResults.station && <p className="text-slate-500 font-bold bg-white/50 px-3 py-1 rounded-full shadow-sm text-xs">📍 {previousResults.station}역</p>}
          {targetItem && <p className="text-slate-500 font-bold bg-white/50 px-3 py-1 rounded-full shadow-sm text-xs">{targetEmoji} {targetItem}</p>}
        </div>

        {!isRolling && !result && (
          <div className="bg-white/60 p-4 rounded-2xl border border-white/80 text-left">
            <h4 className="text-sm font-black text-slate-700 mb-3">{isMenu ? '식사비' : '놀거리 비용'} 후보자 등록</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {participants.map((p, i) => (
                <span key={i} className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-sm border border-indigo-200">
                  {p} 
                  <button onClick={() => removeParticipant(i)} className="text-indigo-400 hover:text-indigo-600">×</button>
                </span>
              ))}
            </div>
            <form onSubmit={addParticipant} className="flex gap-2">
              <input 
                type="text" 
                value={newParticipant}
                onChange={(e) => setNewParticipant(e.target.value)}
                placeholder="이름 입력"
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-400 font-bold text-slate-700 placeholder:font-normal"
              />
              <button type="submit" className="bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-600">+</button>
            </form>
          </div>
        )}

        <div className="flex justify-center pt-2 pb-4">
          <Slot 
            title="PAYER" 
            value={isRolling ? payer : (result || '💸')} 
            subValue={isRolling ? "누가 낼까?" : result ? "당첨!" : "결제자 추첨"}
            isRolling={isRolling} 
            isDone={!isRolling && result !== null} 
            color="#10B981" 
          />
        </div>
      </div>

      {!result && (
        <button
          onClick={startRolling}
          disabled={isRolling || participants.length < 2}
          className={`w-full py-5 rounded-[2rem] text-xl font-black transition-all transform active:scale-95 shadow-[0_10px_20px_-10px_rgba(16,185,129,0.5)] ${isRolling || participants.length < 2 ? 'bg-white/60 text-slate-400 shadow-none border border-white/50' : 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white hover:shadow-emerald-400/40 cursor-pointer border border-white/20'}`}
        >
          {isRolling ? '숨 막히는 추첨 중... 😱' : participants.length < 2 ? '후보를 2명 이상 적어주세요!' : `${isMenu ? '밥값' : '놀거리'} 결제자 추첨! 💸`}
        </button>
      )}

      <AnimatePresence>
        {result && !isRolling && (
          <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} 
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            className="p-8 bg-white/70 backdrop-blur-3xl rounded-[2.5rem] text-center shadow-2xl border border-white/90">
             <h3 className="text-4xl sm:text-5xl font-black text-emerald-500 tracking-tighter drop-shadow-sm mb-2"><span className="text-2xl sm:text-3xl text-slate-400 font-bold leading-normal">{isMenu ? '식사비는 ' : '놀거리는 '}</span>{result}<span className="text-2xl sm:text-3xl text-slate-400 font-bold leading-normal">님이!</span></h3>
             <button onClick={() => onComplete(result)} className="mt-6 w-full py-4 rounded-xl font-bold bg-slate-800 text-white hover:bg-slate-700 shadow-lg active:scale-95 transition-transform">{nextButtonText}</button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
