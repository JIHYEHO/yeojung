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
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center z-[100]">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        const showActiveDot = tab.id === 'roulette' && isRouletteActive;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative flex flex-col items-center gap-1 outline-none"
          >
            <div className={`
              w-11 h-9 rounded-xl flex items-center justify-center text-xl transition-all
              ${isActive ? 'bg-rose-500 text-white' : 'text-slate-400'}
            `}>
              {tab.icon}
              {showActiveDot && !isActive && (
                <motion.div
                  layoutId="active-dot"
                  className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}
            </div>
            <span className={`text-[10px] font-bold ${isActive ? 'text-rose-500' : 'text-slate-400'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
