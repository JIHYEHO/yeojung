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
          <h3 className="text-2xl font-black text-rose-500 tracking-tight">
            안녕! 우리 오늘<br/>
            어디서 데이트할까? 💕
          </h3>
          <p className="text-rose-400/80 font-medium text-sm">
            뜻밖의 달달한 장소를 찾아줄게!
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/80 p-4 rounded-3xl border border-rose-100 shadow-sm hover:scale-105 transition-transform duration-300">
            <span className="text-2xl block mb-1">🚃</span>
            <span className="text-[10px] font-bold text-rose-300 block tracking-tighter uppercase font-mono">Subway</span>
            <span className="text-xs font-black text-rose-600">두근두근 전철역</span>
          </div>
          <div className="bg-white/80 p-4 rounded-3xl border border-rose-100 shadow-sm hover:scale-105 transition-transform duration-300">
            <span className="text-2xl block mb-1">🎁</span>
            <span className="text-[10px] font-bold text-rose-300 block tracking-tighter uppercase font-mono">Surprise</span>
            <span className="text-xs font-black text-rose-600">랜덤 데이트</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button 
          onClick={onStart}
          className="w-full py-6 rounded-[2rem] text-xl font-black transition-all shadow-[0_15px_30px_-10px_rgba(251,113,133,0.4)] bg-gradient-to-r from-rose-400 via-pink-400 to-peach-400 text-white border border-white/50 relative overflow-hidden group animate-jelly"
        >
          <div className="relative z-10 flex flex-col items-center">
             <span className="text-sm font-bold text-white/90 mb-0.5">Ready?</span>
             <span>{currentStep > 1 ? '데이트 이어가기 💘' : '두근두근 코스 뽑기 🎲'}</span>
          </div>
          <motion.div 
            animate={{ x: ['-100%', '200%'] }} 
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-30deg]"
          />
        </button>

        <button 
          onClick={onShowFeed}
          className="w-full py-5 rounded-[2rem] text-lg font-black transition-all bg-white/70 text-rose-500 hover:bg-white shadow-sm border border-rose-100 animate-jelly flex items-center justify-center gap-2"
        >
          💌 다른 커플들은 어디갔을까?
        </button>
      </div>

      <div className="pt-4">
        <div className="bg-rose-50/80 p-6 rounded-[2rem] border border-rose-100 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">🔥</div>
          <div>
            <p className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-0.5">Hot Place</p>
            <p className="text-sm font-black text-rose-700 leading-snug">지금 가장 핫한 데이트 성지는<br/><span className="text-pink-600 font-extrabold px-1">성수역</span> 이예요!</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
