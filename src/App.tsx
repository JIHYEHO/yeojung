import { useState, useEffect } from 'react';
import Home from './components/Home';
import TabBar from './components/TabBar';
import type { TabType } from './components/TabBar';
import { supabase } from './utils/supabaseClient';
import type { User } from '@supabase/supabase-js';
import StepSubwayLine from './components/StepSubwayLine';
import StepSubwayDest from './components/StepSubwayDest';
import StepPhotoCapture from './components/StepPhotoCapture';
import StepMenu from './components/StepMenu';
import StepPayment from './components/StepPayment';
import StepActivity from './components/StepActivity';
import Summary from './components/Summary';
import StepHistory from './components/StepHistory';
import MyPage from './components/MyPage';
import { AnimatePresence, motion } from 'framer-motion';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [step, setStep] = useState(1);

  useEffect(() => {
    // 현재 세션 확인 및 로그인 상태 감시
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);
  const [results, setResults] = useState<{
    line?: string;
    startStation?: string;
    station?: string;
    menu?: string;
    menuPayer?: string;
    activity?: string;
    activityPayer?: string;
  }>({});

  const [photos, setPhotos] = useState<{
    station?: string;
    menu?: string;
    activity?: string;
  }>({});

  const handleNext = (updates: Partial<typeof results>) => {
    setResults(prev => ({ ...prev, ...updates }));
    setStep(s => s + 1);
  };

  const handlePhotoNext = (context: 'station' | 'menu' | 'activity', photo: string | null) => {
    if (photo) setPhotos(prev => ({ ...prev, [context]: photo }));
    setStep(s => s + 1);
  };

  const resetRoulette = () => {
    setStep(1);
    setResults({});
    setPhotos({});
    setCurrentTab('home');
  };

  const renderRouletteContent = () => {
    return (
      <div className="w-full flex flex-col items-center">
        <header className="w-full max-w-md mt-4 sm:mt-8 mb-6 sm:mb-8 text-center relative z-10 transition-all">
          <h1 className="text-[10px] sm:text-[11px] font-black text-rose-400 tracking-[0.3em] uppercase mb-6 bg-white/70 inline-block px-5 py-2 rounded-full shadow-sm backdrop-blur-md border border-rose-100">💝 여정 뽑는 중</h1>
          <div className="relative h-16 sm:h-20 w-full flex justify-center items-center">
            <AnimatePresence mode="wait">
              {step === 1  && <motion.h2 key="1"  initial={{opacity:0, y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}} className="absolute text-3xl sm:text-4xl font-black tracking-tighter text-slate-800 drop-shadow-sm leading-tight w-full">어느 <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">노선 탈까?</span> 🚃</motion.h2>}
              {step === 2  && <motion.h2 key="2"  initial={{opacity:0, y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}} className="absolute text-3xl sm:text-4xl font-black tracking-tighter text-slate-800 drop-shadow-sm leading-tight w-full">어느 <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">역에 내릴까?</span> 🌸</motion.h2>}
              {step === 3  && <motion.h2 key="3"  initial={{opacity:0, y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}} className="absolute text-3xl sm:text-4xl font-black tracking-tighter text-slate-800 drop-shadow-sm leading-tight w-full">역에서 <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">인증샷!</span> 📸</motion.h2>}
              {step === 4  && <motion.h2 key="4"  initial={{opacity:0, y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}} className="absolute text-3xl sm:text-4xl font-black tracking-tighter text-slate-800 drop-shadow-sm leading-tight w-full">가서 <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">뭐 먹을까?</span> 🍰</motion.h2>}
              {step === 5  && <motion.h2 key="5"  initial={{opacity:0, y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}} className="absolute text-3xl sm:text-4xl font-black tracking-tighter text-slate-800 drop-shadow-sm leading-tight w-full">밥값은 <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-500">누가 쏴?</span> 💕</motion.h2>}
              {step === 6  && <motion.h2 key="6"  initial={{opacity:0, y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}} className="absolute text-3xl sm:text-4xl font-black tracking-tighter text-slate-800 drop-shadow-sm leading-tight w-full">밥 먹은 <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">인증샷!</span> 📸</motion.h2>}
              {step === 7  && <motion.h2 key="7"  initial={{opacity:0, y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}} className="absolute text-3xl sm:text-4xl font-black tracking-tighter text-slate-800 drop-shadow-sm leading-tight w-full">밥 먹고 <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">뭐 할까?</span> 🧸</motion.h2>}
              {step === 8  && <motion.h2 key="8"  initial={{opacity:0, y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}} className="absolute text-3xl sm:text-4xl font-black tracking-tighter text-slate-800 drop-shadow-sm leading-tight w-full">놀거리는 <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">누가 쏴?</span> 💝</motion.h2>}
              {step === 9  && <motion.h2 key="9"  initial={{opacity:0, y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}} className="absolute text-3xl sm:text-4xl font-black tracking-tighter text-slate-800 drop-shadow-sm leading-tight w-full">놀거리 <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">인증샷!</span> 📸</motion.h2>}
              {step === 10 && <motion.h2 key="10" initial={{opacity:0, y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}} className="absolute text-3xl sm:text-4xl font-black tracking-tighter text-slate-800 drop-shadow-sm leading-tight w-full">달달한 <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">코스 완성!</span> 💖</motion.h2>}
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

            {step === 3 && (
              <StepPhotoCapture
                key="step3"
                label={`${results.station}역에 도착했나요?`}
                badge={`📍 ${results.station}역`}
                onComplete={(photo) => handlePhotoNext('station', photo)}
              />
            )}

            {step === 4 && <StepMenu key="step4" onComplete={(val) => handleNext({ menu: val })} previousResult={results.station} />}

            {step === 5 && <StepPayment key="step5" context="menu" onComplete={(val) => handleNext({ menuPayer: val })} previousResults={results} />}

            {step === 6 && (
              <StepPhotoCapture
                key="step6"
                label="맛있게 드셨나요?"
                badge={`🍔 ${results.menu}`}
                onComplete={(photo) => handlePhotoNext('menu', photo)}
              />
            )}

            {step === 7 && <StepActivity key="step7" onComplete={(val) => handleNext({ activity: val })} previousResults={results} />}

            {step === 8 && <StepPayment key="step8" context="activity" onComplete={(val) => handleNext({ activityPayer: val })} previousResults={results} />}

            {step === 9 && (
              <StepPhotoCapture
                key="step9"
                label="신나게 놀았나요?"
                badge={`🎯 ${results.activity}`}
                onComplete={(photo) => handlePhotoNext('activity', photo)}
              />
            )}

            {step === 10 && <Summary key="summary" results={results} photos={photos} user={user} onReset={resetRoulette} />}
          </AnimatePresence>
        </main>
      </div>
    );
  };

  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-50 via-pink-50 to-peach-100 text-slate-800 p-4 sm:p-6 font-sans flex flex-col items-center selection:bg-pink-300/40 relative pb-32 overflow-x-hidden">
      
      {/* 둥둥 떠다니는 배경 하트 효과 */}
      <div className="fixed top-10 left-10 text-4xl opacity-20 animate-float pointer-events-none" style={{ animationDelay: '0s' }}>☁️</div>
      <div className="fixed top-32 right-10 text-3xl opacity-20 animate-float pointer-events-none" style={{ animationDelay: '1s' }}>💖</div>
      <div className="fixed bottom-40 left-20 text-2xl opacity-20 animate-float pointer-events-none" style={{ animationDelay: '2s' }}>✨</div>
      <div className="fixed top-1/2 right-20 text-4xl opacity-20 animate-float pointer-events-none" style={{ animationDelay: '1.5s' }}>🌸</div>

      {/* 부드러운 빛 효과 */}
      <div className="fixed top-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-rose-200/40 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '4s' }}></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-pink-200/40 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '6s' }}></div>

      {currentTab === 'home' && (
        <div className="w-full max-w-md relative z-10 pt-8">
          <header className="text-center mb-10">
             <h1 className="text-[12px] font-black text-rose-400 tracking-[0.4em] uppercase mb-2">Love Journey</h1>
             <p className="text-3xl font-black text-slate-800 tracking-tighter">우리 어디갈까? 💘</p>
          </header>
          <Home 
            currentStep={step} 
            onStart={() => setCurrentTab('roulette')} 
            onShowFeed={() => setCurrentTab('feed')} 
          />
        </div>
      )}

      {currentTab === 'roulette' && renderRouletteContent()}

      {currentTab === 'feed' && (
        <div className="w-full max-w-md relative z-10">
          <StepHistory onClose={() => setCurrentTab('home')} />
        </div>
      )}

      {currentTab === 'mypage' && (
        <div className="w-full max-w-md relative z-10">
          <MyPage user={user} onStartJourney={() => setCurrentTab('roulette')} />
        </div>
      )}

      <TabBar 
        currentTab={currentTab} 
        onTabChange={setCurrentTab} 
        isRouletteActive={step > 1 && step < 10}
      />
    </div>
  );
}

