import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slot } from './Slot';
import { initAudio, playTick, playThud } from '../utils/audio';
import { SUBWAY_DATA } from '../data/subway';

interface StepSubwayLineProps {
  onComplete: (lineId: string, startStation: string) => void;
}

export default function StepSubwayLine({ onComplete }: StepSubwayLineProps) {
  const [phase, setPhase] = useState<'line' | 'station'>('line');
  
  const [isRollingLine, setIsRollingLine] = useState(false);
  const [lineStr, setLineStr] = useState('2');
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);

  const [startStation, setStartStation] = useState<string>('');

  const lines = Object.keys(SUBWAY_DATA); // '1' to '9'

  const startRollingLine = () => {
    if (isRollingLine) return;
    initAudio();
    playThud();
    setIsRollingLine(true);
    setSelectedLineId(null);
    setPhase('line');

    const finalLine = lines[Math.floor(Math.random() * lines.length)];
    let startTime = performance.now();
    let lastVal: any = null;
    const durationMs = 4000;

    const runTick = () => {
      let now = performance.now();
      let elapsed = now - startTime;
      if (elapsed >= durationMs) {
        setLineStr(finalLine);
        setIsRollingLine(false);
        setSelectedLineId(finalLine);
        
        setPhase('station');
        playThud();
        
        setStartStation(SUBWAY_DATA[finalLine].stations[Math.floor(SUBWAY_DATA[finalLine].stations.length / 2)]);
        return;
      }
      let progress = elapsed / durationMs;
      let currentDelay = 40 + (300 - 40) * Math.pow(progress, 3);
      let next = lines[Math.floor(Math.random() * lines.length)];
      while(next === lastVal) next = lines[Math.floor(Math.random() * lines.length)];
      lastVal = next;
      setLineStr(next);
      playTick(800);
      setTimeout(runTick, currentDelay);
    };
    runTick();
  };

  const currentLineData = selectedLineId ? SUBWAY_DATA[selectedLineId] : SUBWAY_DATA['2'];

  return (
    <motion.div initial={{opacity:0, x: -50}} animate={{opacity:1, x:0}} exit={{opacity:0, x:50}} className="space-y-6">
      <div className="bg-white/40 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/60 shadow-xl relative overflow-hidden">
        <AnimatePresence mode="wait">
          {phase === 'line' ? (
            <motion.div key="line" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} className="flex flex-col items-center w-full">
              <div className="bg-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full font-black text-xs sm:text-sm tracking-widest mb-6 shadow-sm border border-indigo-200">STEP 1. 노선 추첨</div>
              <Slot 
                title="LINE" 
                value={`${lineStr}호선`} 
                subValue="Seoul Metro" 
                isRolling={isRollingLine} 
                isDone={selectedLineId !== null} 
                color={currentLineData.color} 
              />
            </motion.div>
          ) : (
            <motion.div key="station" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} className="flex flex-col items-center w-full">
              <div className="bg-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full font-black text-xs sm:text-sm tracking-widest mb-6 shadow-sm border border-indigo-200">STEP 1-5. 출발역 선택</div>
              <div className="bg-white/80 text-slate-700 w-full px-5 py-6 rounded-2xl font-black text-sm sm:text-base tracking-wide mb-6 shadow-sm border border-slate-200 text-center leading-relaxed">
                <span className="text-xl inline-block mb-1 font-black drop-shadow-sm" style={{color: currentLineData.color}}>{lineStr}호선 탑승 준비!</span><br/>
                <span className="text-slate-500 font-bold">어디서 만날까요?</span>
              </div>
              <select 
                value={startStation} 
                onChange={(e) => setStartStation(e.target.value)} 
                className="w-full bg-white/70 border border-slate-200 rounded-xl px-4 py-4 text-xl font-black focus:outline-none focus:border-indigo-400 text-slate-800 text-center shadow-sm"
              >
                {currentLineData.stations.map(st => <option key={st} value={st}>{st}역</option>)}
              </select>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {phase === 'line' ? (
        <button
          onClick={startRollingLine}
          disabled={isRollingLine}
          className={`w-full py-5 rounded-[2rem] text-xl font-black transition-all transform active:scale-95 shadow-[0_10px_20px_-10px_rgba(59,130,246,0.5)] ${isRollingLine ? 'bg-white/60 text-slate-400 border border-white/50 shadow-none' : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border border-white/20'}`}
        >
          {isRollingLine ? '노선 탐색 중... 🚇' : '어느 호선 탈까? 🎲'}
        </button>
      ) : (
        <motion.button
          initial={{opacity:0, y:20}} animate={{opacity:1, y:0}}
          onClick={() => onComplete(selectedLineId!, startStation)}
          className="w-full py-5 rounded-[2rem] text-xl font-black transition-all transform active:scale-95 shadow-[0_10px_20px_-10px_rgba(30,41,59,0.5)] bg-slate-800 text-white hover:bg-slate-700"
        >
          여기서 출발 확정 👉
        </motion.button>
      )}
    </motion.div>
  );
}
