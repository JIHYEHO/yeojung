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
      className="space-y-6 w-full"
    >
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center space-y-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-rose-500 tracking-tight">
            안녕! 우리 오늘<br/>
            어디서 데이트할까? 💕
          </h3>
          <p className="text-slate-400 font-medium text-sm">
            뜻밖의 달달한 장소를 찾아줄게!
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
            <span className="text-2xl block mb-1">🚃</span>
            <span className="text-[10px] font-bold text-rose-300 block tracking-tighter uppercase font-mono">Subway</span>
            <span className="text-xs font-black text-rose-600">두근두근 전철역</span>
          </div>
          <div className="bg-violet-50 p-4 rounded-2xl border border-violet-100">
            <span className="text-2xl block mb-1">🎁</span>
            <span className="text-[10px] font-bold text-violet-300 block tracking-tighter uppercase font-mono">Surprise</span>
            <span className="text-xs font-black text-violet-600">랜덤 데이트</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={onStart}
          className="w-full py-5 rounded-full text-xl font-black transition-all bg-gradient-to-r from-[#FF4D6D] to-[#8B5CF6] text-white active:scale-95 shadow-lg shadow-rose-200"
        >
          {currentStep > 1 ? '데이트 이어가기 💘' : '두근두근 코스 뽑기 🎲'}
        </button>

        <button
          onClick={onShowFeed}
          className="w-full py-4 rounded-2xl text-base font-black transition-all bg-white text-slate-600 border border-slate-200 active:scale-95 flex items-center justify-center gap-2"
        >
          💌 다른 커플들은 어디갔을까?
        </button>
      </div>

      <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 flex items-center gap-4">
        <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm shrink-0">🔥</div>
        <div>
          <p className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-0.5">Hot Place</p>
          <p className="text-sm font-black text-rose-700 leading-snug">지금 가장 핫한 데이트 성지는<br/><span className="text-rose-500 font-extrabold">성수역</span> 이예요!</p>
        </div>
      </div>
    </motion.div>
  );
}
