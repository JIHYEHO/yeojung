import { useState } from 'react';
import StepSubwayLine from './components/StepSubwayLine';
import StepSubwayDest from './components/StepSubwayDest';
import StepMenu from './components/StepMenu';
import StepPayment from './components/StepPayment';
import StepActivity from './components/StepActivity';
import Summary from './components/Summary';
import { AnimatePresence, motion } from 'framer-motion';

export default function App() {
  const [step, setStep] = useState(1);
  const [results, setResults] = useState<{
    line?: string;
    startStation?: string;
    station?: string;
    menu?: string;
    menuPayer?: string;
    activity?: string;
    activityPayer?: string;
  }>({});

  const handleNext = (updates: Partial<typeof results>) => {
    setResults(prev => ({ ...prev, ...updates }));
    setStep(s => s + 1);
  };

  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-fuchsia-100 via-pink-100 to-rose-100 text-slate-800 p-4 sm:p-6 font-sans flex flex-col items-center selection:bg-pink-300/40 relative pb-20 overflow-x-hidden">
      
      {/* 배경 장식 원형 블러 */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 pointer-events-none z-0"></div>

      <header className="w-full max-w-md mt-4 sm:mt-8 mb-6 sm:mb-8 text-center relative z-10 transition-all">
        <h1 className="text-[10px] sm:text-[11px] font-black text-pink-500 tracking-[0.3em] uppercase mb-6 bg-white/60 inline-block px-5 py-2 rounded-full shadow-sm backdrop-blur-md border border-white/80">✨ 뜻밖의 여정</h1>
        
        {/* Step-specific styling & headers */}
        <div className="relative h-16 sm:h-20 w-full flex justify-center items-center">
          <AnimatePresence mode="wait">
            {step === 1 && <motion.h2 key="1" initial={{opacity:0, y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}} className="absolute text-4xl sm:text-5xl font-black tracking-tighter text-slate-800 drop-shadow-sm leading-tight w-full">오늘 <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">어디가?</span> 👀</motion.h2>}
            {step === 2 && <motion.h2 key="2" initial={{opacity:0, y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}} className="absolute text-4xl sm:text-5xl font-black tracking-tighter text-slate-800 drop-shadow-sm leading-tight w-full">어느 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">역에 내릴까?</span> 🚇</motion.h2>}
            {step === 3 && <motion.h2 key="3" initial={{opacity:0, y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}} className="absolute text-4xl sm:text-5xl font-black tracking-tighter text-slate-800 drop-shadow-sm leading-tight w-full">가서 <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">뭐 먹지?</span> 🍔</motion.h2>}
            {step === 4 && <motion.h2 key="4" initial={{opacity:0, y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}} className="absolute text-4xl sm:text-5xl font-black tracking-tighter text-slate-800 drop-shadow-sm leading-tight w-full">밥값은 <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">누가 쏴?</span> 💸</motion.h2>}
            {step === 5 && <motion.h2 key="5" initial={{opacity:0, y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}} className="absolute text-4xl sm:text-5xl font-black tracking-tighter text-slate-800 drop-shadow-sm leading-tight w-full">밥 먹고 <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-400">뭐 하지?</span> 🎯</motion.h2>}
            {step === 6 && <motion.h2 key="6" initial={{opacity:0, y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}} className="absolute text-4xl sm:text-5xl font-black tracking-tighter text-slate-800 drop-shadow-sm leading-tight w-full">놀거리는 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">누가 쏴?</span> 💸</motion.h2>}
            {step === 7 && <motion.h2 key="7" initial={{opacity:0, y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}} className="absolute text-4xl sm:text-5xl font-black tracking-tighter text-slate-800 drop-shadow-sm leading-tight w-full">전체 <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-emerald-500">코스 완성!</span> 🎉</motion.h2>}
          </AnimatePresence>
        </div>
      </header>

      <main className="w-full max-w-md relative z-10 perspective-1000">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <StepSubwayLine 
              key="step1" 
              onComplete={(line, startStation) => handleNext({ line, startStation })} 
            />
          )}
          
          {step === 2 && (
            <StepSubwayDest 
              key="step2" 
              lineId={results.line!} 
              startStation={results.startStation!} 
              onComplete={(station) => handleNext({ station })} 
            />
          )}

          {step === 3 && <StepMenu key="step3" onComplete={(val) => handleNext({ menu: val })} previousResult={results.station} />}
          
          {step === 4 && <StepPayment key="step4" context="menu" onComplete={(val) => handleNext({ menuPayer: val })} previousResults={results} />}
          
          {step === 5 && <StepActivity key="step5" onComplete={(val) => handleNext({ activity: val })} previousResults={results} />}
          
          {step === 6 && <StepPayment key="step6" context="activity" onComplete={(val) => handleNext({ activityPayer: val })} previousResults={results} />}

          {step === 7 && <Summary key="summary" results={results} onReset={() => { setStep(1); setResults({}); }} />}
        </AnimatePresence>
      </main>
    </div>
  );
}
