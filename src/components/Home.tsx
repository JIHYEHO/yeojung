import { motion } from 'framer-motion';

interface HomeProps {
  currentStep: number;
  onStart: () => void;
  onShowFeed: () => void;
}

export default function Home({ currentStep, onStart, onShowFeed }: HomeProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-8 w-full"
    >
      <div className="bg-white/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/60 shadow-xl text-center space-y-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">
            반가워요! 👋<br/>
            어디로 모실까요?
          </h3>
          <p className="text-slate-500 font-medium text-sm">
            뜻밖의 장소와 메뉴를 찾아드려요.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/60 p-4 rounded-3xl border border-white/80 shadow-sm">
            <span className="text-2xl block mb-1">🚇</span>
            <span className="text-[10px] font-bold text-slate-400 block tracking-tighter uppercase font-mono">Subway</span>
            <span className="text-xs font-black text-slate-700">9개 노선</span>
          </div>
          <div className="bg-white/60 p-4 rounded-3xl border border-white/80 shadow-sm">
            <span className="text-2xl block mb-1">🎁</span>
            <span className="text-[10px] font-bold text-slate-400 block tracking-tighter uppercase font-mono">Surprise</span>
            <span className="text-xs font-black text-slate-700">랜덤 추천</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button 
          onClick={onStart}
          className="w-full py-6 rounded-[2rem] text-xl font-black transition-all transform active:scale-95 shadow-[0_15px_30px_-10px_rgba(244,114,182,0.4)] bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 text-white border border-white/20 relative overflow-hidden group"
        >
          <div className="relative z-10 flex flex-col items-center">
             <span className="text-sm font-bold text-white/80 mb-0.5">Let's Go!</span>
             <span>{currentStep > 1 ? '여정 이어가기 🚩' : '뜻밖의 여정 시작하기 🎲'}</span>
          </div>
          <motion.div 
            animate={{ x: ['-100%', '200%'] }} 
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-30deg]"
          />
        </button>

        <button 
          onClick={onShowFeed}
          className="w-full py-5 rounded-[2rem] text-lg font-black transition-all bg-white/60 text-slate-600 hover:bg-white shadow-sm border border-slate-200 active:scale-95 flex items-center justify-center gap-2"
        >
          🔭 실시간 피드 구경하기
        </button>
      </div>

      <div className="pt-4">
        <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100/50 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">🔥</div>
          <div>
            <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-0.5">Hot Place</p>
            <p className="text-sm font-black text-slate-700 leading-snug">지금 사용자들이 가장 <br/>많이 찾는 역은 <span className="text-indigo-600 font-extrabold px-1">성수역</span> 이예요!</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
