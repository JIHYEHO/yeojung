import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Slot } from './Slot';
import { initAudio, playTick, playThud, playTada } from '../utils/audio';
import { SUBWAY_DATA } from '../data/subway';

interface StepDestinationProps {
  onComplete: (station: string) => void;
}

export default function StepDestination({ onComplete }: StepDestinationProps) {
  const [phase, setPhase] = useState<'line' | 'station' | 'direction' | 'destination' | 'done'>('line');
  
  // Phase 1: Line Selection
  const [isRollingLine, setIsRollingLine] = useState(false);
  const [lineStr, setLineStr] = useState('2');
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);

  // Phase 2: Start Station Selection
  const [startStation, setStartStation] = useState<string>('');

  // Phase 3: Direction Selection
  const [isRollingDir, setIsRollingDir] = useState(false);
  const [direction, setDirection] = useState('상행');
  const [isDirSelected, setIsDirSelected] = useState(false);

  // Phase 4: Destination Selection (Station Names)
  const [isRollingDest, setIsRollingDest] = useState(false);
  const [destSpinName, setDestSpinName] = useState('도착역');
  const [result, setResult] = useState<string | null>(null);

  const lines = Object.keys(SUBWAY_DATA); // '1' to '9'

  // Helper: Get valid stations within 15 stops in a specific direction
  const getValidStations = (targetDir: string, lineId: string, currentStart: string) => {
    const lineInfo = SUBWAY_DATA[lineId];
    const startIndex = lineInfo.stations.indexOf(currentStart);
    if(startIndex === -1) return [];

    const dIndex = lineInfo.directions.indexOf(targetDir); // 0=상행/내선, 1=하행/외선
    let validStations: string[] = [];
    
    for(let s=1; s<=15; s++){
        let targetIndex = dIndex === 0 ? startIndex - s : startIndex + s;
        if(lineInfo.isCircular) {
          targetIndex = (targetIndex + lineInfo.stations.length) % lineInfo.stations.length;
          if(targetIndex < 0) targetIndex += lineInfo.stations.length;
          validStations.push(lineInfo.stations[targetIndex]);
        } else {
          if(targetIndex >= 0 && targetIndex < lineInfo.stations.length){
            validStations.push(lineInfo.stations[targetIndex]);
          }
        }
    }
    return validStations;
  };

  // --- Phase 1: Roll Line ---
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

  // --- Phase 3: Roll Direction ---
  const startRollingDir = () => {
    if (isRollingDir || !selectedLineId) return;
    playThud();
    setIsRollingDir(true);
    
    const lineInfo = SUBWAY_DATA[selectedLineId];
    const finalDir = lineInfo.directions[Math.floor(Math.random() * lineInfo.directions.length)];

    let startTime = performance.now();
    let lastVal: any = null;
    const durationMs = 4000;

    const runTick = () => {
      let now = performance.now();
      let elapsed = now - startTime;
      if (elapsed >= durationMs) {
        setDirection(finalDir);
        setIsRollingDir(false);
        setIsDirSelected(true);
        setPhase('destination');
        playThud();
        
        // 초기 목적지용 스핀 단어 세팅
        const validSts = getValidStations(finalDir, selectedLineId, startStation);
        if(validSts.length > 0) setDestSpinName(validSts[0]);
        return;
      }
      let progress = elapsed / durationMs;
      let currentDelay = 40 + (300 - 40) * Math.pow(progress, 3);
      let next = lineInfo.directions[Math.floor(Math.random() * lineInfo.directions.length)];
      while(next === lastVal) next = lineInfo.directions[Math.floor(Math.random() * lineInfo.directions.length)];
      lastVal = next;
      setDirection(next);
      playTick(800);
      setTimeout(runTick, currentDelay);
    };
    runTick();
  };

  // --- Phase 4: Roll Station Name ---
  const startRollingDest = () => {
    if (isRollingDest || !selectedLineId) return;
    
    const validStations = getValidStations(direction, selectedLineId, startStation);
    if(validStations.length === 0) {
      alert("해당 방향으로는 더 이상 갈 수 있는 역이 없습니다! 출발역을 변경해주세요.");
      setPhase('station');
      setIsDirSelected(false);
      return;
    }

    playThud();
    setIsRollingDest(true);
    setResult(null);

    const finalDest = validStations[Math.floor(Math.random() * validStations.length)];

    let startTime = performance.now();
    let lastVal: any = null;
    const durationMs = 7000;

    const runTick = () => {
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
        }, 1000); 
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

  const currentLineData = selectedLineId ? SUBWAY_DATA[selectedLineId] : SUBWAY_DATA['2'];

  return (
    <motion.div initial={{opacity:0, x: -50}} animate={{opacity:1, x:0}} exit={{opacity:0, x:50}} className="space-y-6">
      <div className="bg-white/40 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/60 space-y-6 shadow-xl relative overflow-hidden">
        
        {/* Phase 1: Line Slot */}
        <div className="flex flex-col items-center">
            <h4 className="text-sm font-black text-slate-700 mb-4 opacity-50 uppercase tracking-widest">STEP 1. 호선 추첨</h4>
            <Slot 
              title="LINE" 
              value={`${lineStr}호선`} 
              subValue="Seoul Metro" 
              isRolling={isRollingLine} 
              isDone={selectedLineId !== null} 
              color={currentLineData.color} 
            />
        </div>

        {/* Phase 2: Start Station Selection */}
        <AnimatePresence>
          {phase !== 'line' && (
            <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="pt-4 border-t border-white/40 flex flex-col items-center">
              <h4 className="text-sm font-black text-slate-700 mb-3 opacity-50 uppercase tracking-widest text-center">{lineStr}호선 탑승 준비!<br/>어디서 출발하시나요?</h4>
              <select 
                value={startStation} 
                onChange={(e) => {
                  setStartStation(e.target.value);
                  setIsDirSelected(false); // 역을 바꾸면 방향 다시 정해야 함
                }} 
                disabled={phase === 'direction' || phase === 'destination' || phase === 'done'}
                className="w-full bg-white/70 border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:border-indigo-400 text-slate-700 text-center shadow-sm"
              >
                {currentLineData.stations.map(st => <option key={st} value={st}>{st}역</option>)}
              </select>
              
              {phase === 'station' && (
                <button onClick={() => setPhase('direction')} className="mt-6 w-full py-4 bg-slate-800 text-white rounded-2xl font-bold text-lg hover:bg-slate-700 shadow-xl transition-all active:scale-95">
                  여기서 출발 확정 👉
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 3 & 4: Direction & Result Station Slots */}
        <AnimatePresence>
          {(phase === 'direction' || phase === 'destination' || phase === 'done') && (
             <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="pt-6 border-t border-white/40">
               <h4 className="text-sm font-black text-slate-700 mb-6 opacity-50 uppercase tracking-widest text-center">STEP 2. 방향 & 15정거장 이내 목적지</h4>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                 
                 {/* Direction Slot */}
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

                 {/* Direction Arrow */}
                 {isDirSelected && (
                   <motion.div initial={{scale:0}} animate={{scale:1}} className="text-3xl text-slate-300 transform rotate-90 sm:rotate-0">
                     ➔
                   </motion.div>
                 )}

                 {/* Destination Station Name Slot - Only Appears After Direction is Selected */}
                 <AnimatePresence>
                   {isDirSelected && (
                     <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="flex flex-col items-center">
                       <span className="text-[10px] font-bold text-slate-400 mb-2">최종 도착역</span>
                       <Slot 
                         title="DEST" 
                         value={destSpinName.length > 5 ? destSpinName.substring(0,4)+'..' : destSpinName} // 긴 역명 처리
                         subValue={isRollingDest ? 'N정거장 탐색중' : '최종 목적지'} 
                         isRolling={isRollingDest} 
                         isDone={!isRollingDest && result !== null} 
                         color="#ec4899" 
                       />
                     </motion.div>
                   )}
                 </AnimatePresence>

               </div>
               
               {/* Phase 3 Button: Roll Direction */}
               {phase === 'direction' && !isDirSelected && (
                 <motion.button
                   initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}
                   onClick={startRollingDir}
                   disabled={isRollingDir}
                   className={`mt-8 w-full py-4 rounded-[2rem] text-lg font-black transition-all ${isRollingDir ? 'bg-white/60 text-slate-400' : 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-lg active:scale-95'}`}
                 >
                   {isRollingDir ? '방향 갈림길 선택 중... 🧭' : '먼저 방향부터 정하자! 🧭'}
                 </motion.button>
               )}

             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {phase === 'line' && (
        <button
          onClick={startRollingLine}
          disabled={isRollingLine}
          className={`w-full py-5 rounded-[2rem] text-xl font-black transition-all transform active:scale-95 shadow-[0_10px_20px_-10px_rgba(59,130,246,0.5)] ${isRollingLine ? 'bg-white/60 text-slate-400 border border-white/50 shadow-none' : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border border-white/20'}`}
        >
          {isRollingLine ? '호선 추첨 중... 🚇' : '어느 호선 탈까? 🎲'}
        </button>
      )}

      {phase === 'destination' && !result && (
        <button
          onClick={startRollingDest}
          disabled={isRollingDest}
          className={`w-full py-5 rounded-[2rem] text-xl font-black transition-all transform active:scale-95 shadow-[0_10px_20px_-10px_rgba(139,92,246,0.5)] ${isRollingDest ? 'bg-white/60 text-slate-400 border border-white/50 shadow-none' : 'bg-gradient-to-r from-violet-500 to-purple-500 text-white border border-white/20'}`}
        >
          {isRollingDest ? '역 탐색 중... 🧭' : '가보자고! 어느 역에 내릴까? 🚀'}
        </button>
      )}

      <AnimatePresence>
        {result && !isRollingDest && phase === 'done' && (
          <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} 
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            className="p-8 bg-white/70 backdrop-blur-3xl rounded-[2.5rem] text-center shadow-2xl border border-white/90">
             <h3 className="text-4xl sm:text-5xl font-black text-pink-500 tracking-tighter drop-shadow-sm mb-2">{result}역 <span className="text-2xl sm:text-3xl text-slate-400 font-bold leading-normal">당첨!</span></h3>
             <button onClick={() => onComplete(result)} className="mt-6 w-full py-4 rounded-xl font-bold bg-slate-800 text-white hover:bg-slate-700 shadow-lg active:scale-95 transition-transform">메뉴 정하러 가기 👉</button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
