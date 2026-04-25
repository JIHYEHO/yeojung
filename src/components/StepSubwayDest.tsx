import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Slot } from './Slot';
import { playTick, playThud, playTada } from '../utils/audio';
import { SUBWAY_DATA } from '../data/subway';

interface StepSubwayDestProps {
  lineId: string;
  startStation: string;
  onComplete: (station: string) => void;
}

export default function StepSubwayDest({ lineId, startStation, onComplete }: StepSubwayDestProps) {
  const [phase, setPhase] = useState<'direction' | 'destination' | 'done'>('direction');
  
  const [isRollingDir, setIsRollingDir] = useState(false);
  const [direction, setDirection] = useState('상행');
  const [isDirSelected, setIsDirSelected] = useState(false);

  const [isRollingDest, setIsRollingDest] = useState(false);
  const [destSpinName, setDestSpinName] = useState('출발!');
  const [result, setResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const currentLineData = SUBWAY_DATA[lineId];
  const cancelled = useRef(false);
  useEffect(() => {
    cancelled.current = false;
    return () => { cancelled.current = true; };
  }, []);

  const getValidStations = (targetDir: string) => {
    const startIndex = currentLineData.stations.indexOf(startStation);
    if(startIndex === -1) return [];

    const dIndex = currentLineData.directions.indexOf(targetDir);
    let validStations: string[] = [];
    
    for(let s=1; s<=15; s++){
        let targetIndex = dIndex === 0 ? startIndex - s : startIndex + s;
        if(currentLineData.isCircular) {
          targetIndex = (targetIndex + currentLineData.stations.length) % currentLineData.stations.length;
          if(targetIndex < 0) targetIndex += currentLineData.stations.length;
          validStations.push(currentLineData.stations[targetIndex]);
        } else {
          if(targetIndex >= 0 && targetIndex < currentLineData.stations.length){
            validStations.push(currentLineData.stations[targetIndex]);
          }
        }
    }
    return validStations;
  };

  const startRollingDir = () => {
    if (isRollingDir) return;
    playThud();
    setIsRollingDir(true);
    
    const finalDir = currentLineData.directions[Math.floor(Math.random() * currentLineData.directions.length)];
    let startTime = performance.now();
    let lastVal: any = null;
    const durationMs = 3000;

    const runTick = () => {
      if (cancelled.current) return;
      let now = performance.now();
      let elapsed = now - startTime;
      if (elapsed >= durationMs) {
        setDirection(finalDir);
        setIsRollingDir(false);
        setIsDirSelected(true);
        setPhase('destination');
        playThud();
        
        const validSts = getValidStations(finalDir);
        if(validSts.length > 0) setDestSpinName(validSts[0]);
        return;
      }
      let progress = elapsed / durationMs;
      let currentDelay = 40 + (300 - 40) * Math.pow(progress, 3);
      let next = currentLineData.directions[Math.floor(Math.random() * currentLineData.directions.length)];
      while(next === lastVal) next = currentLineData.directions[Math.floor(Math.random() * currentLineData.directions.length)];
      lastVal = next;
      setDirection(next);
      playTick(800);
      setTimeout(runTick, currentDelay);
    };
    runTick();
  };

  const startRollingDest = () => {
    if (isRollingDest) return;
    const validStations = getValidStations(direction);
    if(validStations.length === 0) {
      setErrorMsg("해당 방향으로는 더 이상 갈 수 있는 역이 없습니다!");
      return;
    }
    setErrorMsg('');

    playThud();
    setIsRollingDest(true);
    setResult(null);

    const finalDest = validStations[Math.floor(Math.random() * validStations.length)];
    let startTime = performance.now();
    let lastVal: any = null;
    const durationMs = 6000;

    const runTick = () => {
      if (cancelled.current) return;
      let now = performance.now();
      let elapsed = now - startTime;
      if (elapsed >= durationMs) {
        setDestSpinName(finalDest);
        setIsRollingDest(false);
        setResult(finalDest);
        setPhase('done');
        playThud();
        setTimeout(() => {
          playTada();
          confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 } });
        }, 400); 
        return;
      }
      let progress = elapsed / durationMs;
      let currentDelay = 40 + (400 - 40) * Math.pow(progress, 3);
      
      let next = validStations[Math.floor(Math.random() * validStations.length)];
      while(next === lastVal && validStations.length > 1) {
          next = validStations[Math.floor(Math.random() * validStations.length)];
      }
      lastVal = next;
      setDestSpinName(next);
      playTick(1000);
      setTimeout(runTick, currentDelay);
    };
    runTick();
  };

  return (
    <motion.div initial={{opacity:0, x: -50}} animate={{opacity:1, x:0}} exit={{opacity:0, x:50}} className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-6 shadow-sm text-center">
        
        <div className="flex flex-col items-center gap-2">
          <p className="text-slate-500 font-bold bg-slate-50 px-3 py-1 rounded-full text-xs border border-slate-200">📍 {currentLineData.name} {startStation}역 출발</p>
        </div>

        <div className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full font-black text-xs sm:text-sm tracking-widest mx-auto border border-slate-200 w-max">STEP 2. 방향 & 목적지</div>
        

        
        <div className="flex flex-row w-full items-center justify-center gap-2 sm:gap-6 pt-2 pb-4">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 mb-2">방향</span>
            <Slot 
              title="DIR" 
              value={direction.substring(0,2)} 
              subValue={isRollingDir ? '어디로?' : direction}
              isRolling={isRollingDir} 
              isDone={isDirSelected} 
              color={currentLineData.color} 
            />
          </div>

          <AnimatePresence>
            {isDirSelected && (
              <motion.div initial={{scale:0}} animate={{scale:1}} className="text-3xl text-slate-300 transform rotate-90 sm:rotate-0">
                ➔
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isDirSelected && (
              <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-400 mb-2">최종 도착역 (최대 15정거장)</span>
                <Slot 
                  title="DEST" 
                  value={destSpinName.length > 5 ? destSpinName.substring(0,4)+'..' : destSpinName}
                  subValue={isRollingDest ? '탐색중...' : '최종 목적지'} 
                  isRolling={isRollingDest} 
                  isDone={!isRollingDest && result !== null} 
                  color={currentLineData.color} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {errorMsg && (
        <p className="text-center text-sm font-bold text-rose-500 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">{errorMsg}</p>
      )}

      {phase === 'direction' && !isDirSelected && (
        <button
          onClick={startRollingDir}
          disabled={isRollingDir}
          className={`w-full py-5 rounded-2xl text-xl font-black transition-all active:scale-95 ${isRollingDir ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white'}`}
        >
          {isRollingDir ? '방향 갈림길 선택 중... 🧭' : '먼저 방향부터 정하자! 🧭'}
        </button>
      )}

      {phase === 'destination' && !result && (
        <button
          onClick={startRollingDest}
          disabled={isRollingDest}
          className={`w-full py-5 rounded-2xl text-xl font-black transition-all active:scale-95 ${isRollingDest ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white'}`}
        >
          {isRollingDest ? '역 탐색 중... 🧭' : '가보자고! 어느 역에 내릴까? 🚀'}
        </button>
      )}

      <AnimatePresence>
        {result && phase === 'done' && (
          <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} 
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            className="p-8 bg-white rounded-2xl text-center shadow-sm border border-slate-100">
             <h3 className="text-3xl sm:text-4xl font-black tracking-tighter drop-shadow-sm mb-2" style={{color: currentLineData.color}}>{result}역 <span className="text-xl sm:text-2xl text-slate-400 font-bold leading-normal">당첨!</span></h3>
             <button onClick={() => onComplete(result)} className="mt-6 w-full py-4 rounded-xl font-bold bg-slate-800 text-white hover:bg-slate-700 shadow-lg active:scale-95 transition-transform">메뉴 정하러 가기 👉</button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
