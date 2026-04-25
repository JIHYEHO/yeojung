import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Slot } from './Slot';
import { initAudio, playTick, playThud, playTada } from '../utils/audio';

interface StepPaymentProps {
  onComplete: (payer: string) => void;
  onParticipantsChange: (participants: string[]) => void;
  participants: string[];
  previousResults: { station?: string; menu?: string; activity?: string; };
  context: 'menu' | 'activity';
}

export default function StepPayment({ onComplete, onParticipantsChange, participants, previousResults, context }: StepPaymentProps) {
  const [newParticipant, setNewParticipant] = useState('');
  
  const [isRolling, setIsRolling] = useState(false);
  const [payer, setPayer] = useState('나');
  const [result, setResult] = useState<string | null>(null);
  const cancelled = useRef(false);
  useEffect(() => {
    cancelled.current = false;
    return () => { cancelled.current = true; };
  }, []);

  const addParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (newParticipant.trim() && !participants.includes(newParticipant.trim())) {
      onParticipantsChange([...participants, newParticipant.trim()]);
      setNewParticipant('');
    }
  };

  const removeParticipant = (index: number) => {
    onParticipantsChange(participants.filter((_, i) => i !== index));
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
      if (cancelled.current) return;
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
        }, 400); 
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
      <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-6 shadow-sm text-center">
        <div className="flex flex-col items-center gap-2">
          {previousResults.station && <p className="text-slate-500 font-bold bg-slate-50 px-3 py-1 rounded-full text-xs border border-slate-100">📍 {previousResults.station}역</p>}
          {targetItem && <p className="text-slate-500 font-bold bg-slate-50 px-3 py-1 rounded-full text-xs border border-slate-100">{targetEmoji} {targetItem}</p>}
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
          className={`w-full py-5 rounded-2xl text-xl font-black transition-all active:scale-95 ${isRolling || participants.length < 2 ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white'}`}
        >
          {isRolling ? '숨 막히는 추첨 중... 😱' : participants.length < 2 ? '후보를 2명 이상 적어주세요!' : `${isMenu ? '밥값' : '놀거리'} 결제자 추첨! 💸`}
        </button>
      )}

      <AnimatePresence>
        {result && !isRolling && (
          <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} 
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            className="p-8 bg-white rounded-2xl text-center shadow-sm border border-slate-100">
             <h3 className="text-3xl sm:text-4xl font-black text-emerald-500 tracking-tighter drop-shadow-sm mb-2"><span className="text-xl sm:text-2xl text-slate-400 font-bold leading-normal">{isMenu ? '식사비는 ' : '놀거리는 '}</span>{result}<span className="text-xl sm:text-2xl text-slate-400 font-bold leading-normal">님이!</span></h3>
             <button onClick={() => onComplete(result)} className="mt-6 w-full py-4 rounded-xl font-bold bg-slate-800 text-white hover:bg-slate-700 shadow-lg active:scale-95 transition-transform">{nextButtonText}</button>
             {isMenu ? (
               previousResults.station && previousResults.menu && (
                 <button
                   onClick={() => window.open(`https://search.naver.com/search.naver?query=${encodeURIComponent(previousResults.station + '역 ' + previousResults.menu)}`, '_blank')}
                   className="mt-2 w-full py-3 rounded-xl font-bold text-sm bg-[#03C75A] text-white active:scale-95 transition-transform shadow"
                 >
                   🔍 {previousResults.station}역 {previousResults.menu} 네이버에서 찾기
                 </button>
               )
             ) : (
               previousResults.station && previousResults.activity && (
                 <button
                   onClick={() => window.open(`https://search.naver.com/search.naver?query=${encodeURIComponent(previousResults.station + '역 ' + previousResults.activity)}`, '_blank')}
                   className="mt-2 w-full py-3 rounded-xl font-bold text-sm bg-[#03C75A] text-white active:scale-95 transition-transform shadow"
                 >
                   🔍 {previousResults.station}역 {previousResults.activity} 네이버에서 찾기
                 </button>
               )
             )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
