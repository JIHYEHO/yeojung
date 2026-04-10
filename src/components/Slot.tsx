import { motion, AnimatePresence } from 'framer-motion';

export interface SlotProps {
  title: string;
  value: string | number;
  subValue?: string;
  isRolling: boolean;
  color: string;
  isDone: boolean;
  width?: string;
}

export const Slot = ({ title, value, subValue, isRolling, color, isDone, width = "w-[125px] sm:w-[150px]" }: SlotProps) => (
  <div className={`flex flex-col items-center space-y-2 shrink-0 ${width}`}>
    <div className={`w-full aspect-[3/4] min-h-[120px] rounded-[2rem] flex flex-col items-center justify-center overflow-hidden relative transition-all duration-500 ${
        isRolling 
        ? 'bg-white/80 shadow-[inset_0_4px_10px_rgba(0,0,0,0.05)] border-2 border-pink-200/50' 
        : isDone 
          ? `bg-white shadow-[0_15px_35px_-5px_${color}40] border-2 border-white` 
          : 'bg-white/50 shadow-sm border-2 border-transparent'
      }`}
         style={{ borderColor: isDone ? color : undefined }}>
      <AnimatePresence mode="popLayout">
        <motion.div
           key={value}
           initial={{ y: isRolling ? 80 : -50, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           exit={{ y: isRolling ? -80 : 50, opacity: 0 }}
           transition={isRolling 
             ? { type: "spring", stiffness: 400, damping: 30 } 
             : { type: "spring", duration: 2.5, bounce: 0.35 }
           }
           className="flex flex-col items-center justify-center w-full px-1"
        >
          <span className="text-xl sm:text-2xl font-black tracking-tighter drop-shadow-sm text-center leading-tight break-keep" style={{ color: isDone ? color : '#94a3b8' }}>
            {value}
          </span>
          {subValue && (
            <span className={`text-[10px] sm:text-[11px] font-bold mt-1 px-2 py-0.5 rounded-full shadow-sm text-center ${isDone ? 'bg-[#FFEDD5] text-[#F97316]' : 'bg-slate-100 text-slate-400'}`}>
              {subValue}
            </span>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-white/80 to-transparent pointer-events-none rounded-t-[2rem]"></div>
    </div>
  </div>
);
