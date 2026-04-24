import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Slot } from './Slot';
import { initAudio, playTick, playThud, playTada } from '../utils/audio';
import { SUBWAY_DATA } from '../data/subway';

interface StepSubwayLineProps {
  onComplete: (lineId: string, startStation: string) => void;
}

export default function StepSubwayLine({ onComplete }: StepSubwayLineProps) {
  const [phase, setPhase] = useState<'line' | 'stationGuide' | 'stationSelect'>('line');
  
  const [isRollingLine, setIsRollingLine] = useState(false);
  const [lineStr, setLineStr] = useState('2');
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const [startStation, setStartStation] = useState<string>('');

  const lines = Object.keys(SUBWAY_DATA); // '1' to '9'
  const cancelled = useRef(false);
  useEffect(() => {
    cancelled.current = false;
    return () => { cancelled.current = true; };
  }, []);

  const startRollingLine = () => {
    if (isRollingLine) return;
    initAudio();
    playThud();
    setIsRollingLine(true);
    setSelectedLineId(null);
    setResult(null);
    setPhase('line');

    const finalLine = lines[Math.floor(Math.random() * lines.length)];
    let startTime = performance.now();
    let lastVal: any = null;
    const durationMs = 4000;

    const runTick = () => {
      if (cancelled.current) return;
      let now = performance.now();
      let elapsed = now - startTime;
      if (elapsed >= durationMs) {
        setLineStr(finalLine);
        setIsRollingLine(false);
        setSelectedLineId(finalLine);
        setResult(finalLine);
        playThud();
        
        setTimeout(() => {
          playTada();
          confetti({
            particleCount: 200,
            spread: 80,
            origin: { y: 0.6 },
            colors: [SUBWAY_DATA[finalLine].color, '#ffffff', '#ffd700']
          });
        }, 400);

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
          ) : phase === 'stationGuide' ? (
            <motion.div key="stationGuide" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} className="flex flex-col items-center w-full min-h-[200px] justify-center">
              <div className="bg-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full font-black text-xs sm:text-sm tracking-widest mb-6 shadow-sm border border-indigo-200">STAGE 1-1. 안내</div>
              <div className="bg-white/80 text-slate-700 w-full px-5 py-8 rounded-2xl tracking-wide shadow-sm border border-slate-200 text-center leading-relaxed">
                <span className="text-xl inline-block mb-1 font-black drop-shadow-sm" style={{color: currentLineData.color}}>{lineStr}호선 탑승 준비!</span><br/>
                <span className="text-slate-700 font-black text-base">어디서 만날까요?</span>
                <p className="mt-4 text-[13px] sm:text-sm font-medium text-slate-400 leading-normal break-keep">
                  가장 편한 출발역을 선택해 주세요!<br/>
                  해당 역에서 <span className="text-indigo-400 font-bold">30분 내외(최대 15정거장)</span> 거리에 있는<br/>
                  뜻밖의 약속 장소를 랜덤으로 뽑아드려요. 🧭
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="stationSelect" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} className="flex flex-col items-center w-full">
              <div className="bg-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full font-black text-xs sm:text-sm tracking-widest mb-6 shadow-sm border border-indigo-200">STAGE 1-2. 출발역 선택</div>
              <div className="mb-4 text-center">
                <span className="text-sm font-bold text-slate-400">기준이 되는 역을 골라주세요</span>
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

      <AnimatePresence>
        {result && phase === 'line' && (
          <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} 
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            className="p-8 bg-white/70 backdrop-blur-3xl rounded-[2.5rem] text-center shadow-2xl border border-white/90">
             <h3 className="text-3xl sm:text-4xl font-black tracking-tighter drop-shadow-sm mb-2" style={{color: currentLineData.color}}>{result}호선 <span className="text-xl sm:text-2xl text-slate-400 font-bold leading-normal">당첨!</span></h3>
             <button onClick={() => setPhase('stationGuide')} className="mt-6 w-full py-4 rounded-xl font-bold bg-slate-800 text-white hover:bg-slate-700 shadow-lg active:scale-95 transition-transform">출발 정보 확인 👉</button>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'line' && !result && (
        <button
          onClick={startRollingLine}
          disabled={isRollingLine}
          className={`w-full py-5 rounded-[2rem] text-xl font-black transition-all transform active:scale-95 shadow-[0_10px_20px_-10px_rgba(59,130,246,0.5)] ${isRollingLine ? 'bg-white/60 text-slate-400 border border-white/50 shadow-none' : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border border-white/20'}`}
        >
          {isRollingLine ? '노선 탐색 중... 🚇' : '어느 호선 탈까? 🎲'}
        </button>
      )}

      {phase === 'stationGuide' && (
        <motion.button
          initial={{opacity:0, y:20}} animate={{opacity:1, y:0}}
          onClick={() => setPhase('stationSelect')}
          className="w-full py-5 rounded-[2rem] text-xl font-black transition-all transform active:scale-95 shadow-[0_10px_20px_-10px_rgba(79,70,229,0.5)] bg-gradient-to-r from-indigo-500 to-blue-600 text-white"
        >
          알겠어요! 📍
        </motion.button>
      )}

      {phase === 'stationSelect' && (
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
