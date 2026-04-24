import { motion } from 'framer-motion';

export type TabType = 'home' | 'roulette' | 'feed' | 'mypage';

interface TabBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  isRouletteActive: boolean;
}

export default function TabBar({ currentTab, onTabChange, isRouletteActive }: TabBarProps) {
  const tabs: { id: TabType; icon: string; label: string }[] = [
    { id: 'home', icon: '🏠', label: '홈' },
    { id: 'roulette', icon: '🎲', label: '여정' },
    { id: 'feed', icon: '🔭', label: '피드' },
    { id: 'mypage', icon: '👤', label: '마이' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white/70 backdrop-blur-3xl border-t border-rose-100/50 px-6 py-4 flex justify-between items-center z-[100] shadow-[0_-5px_30px_rgba(251,113,133,0.08)]">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        const showActiveDot = tab.id === 'roulette' && isRouletteActive;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex flex-col items-center gap-1.5 transition-all outline-none group ${isActive ? 'animate-jelly' : ''}`}
          >
            <div className={`
              w-12 h-10 rounded-2xl flex items-center justify-center text-xl transition-all
              ${isActive ? 'bg-gradient-to-tr from-rose-400 to-pink-400 text-white shadow-[0_5px_15px_rgba(251,113,133,0.4)]' : 'text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-400'}
            `}>
              {tab.icon}
              {showActiveDot && !isActive && (
                <motion.div 
                  layoutId="active-dot" 
                  className="absolute top-0 right-0 w-2.5 h-2.5 bg-pink-400 rounded-full border-2 border-white shadow-sm"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}
            </div>
            <span className={`text-[10px] font-black ${isActive ? 'text-rose-500' : 'text-slate-400'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
