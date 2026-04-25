import { motion } from 'framer-motion';
import type { ReactElement } from 'react';

export type TabType = 'home' | 'roulette' | 'feed' | 'mypage';

interface TabBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  isRouletteActive: boolean;
}

const icons: Record<TabType, (active: boolean) => ReactElement> = {
  home: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  ),
  roulette: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a9 9 0 1 0 9 9" />
      <path d="M12 7v5l3 3" />
      <path d="M17 2l4 4-4 4" />
      <path d="M21 2l-4 4" />
    </svg>
  ),
  feed: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  mypage: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
};

export default function TabBar({ currentTab, onTabChange, isRouletteActive }: TabBarProps) {
  const tabs: { id: TabType; label: string }[] = [
    { id: 'home', label: '홈' },
    { id: 'roulette', label: '여정' },
    { id: 'feed', label: '피드' },
    { id: 'mypage', label: '마이' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 px-6 py-2 flex justify-between items-center z-[100]">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        const showActiveDot = tab.id === 'roulette' && isRouletteActive;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative flex flex-col items-center gap-0.5 outline-none"
          >
            <div className={`w-10 h-8 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-rose-500' : ''}`}>
              {icons[tab.id](isActive)}
              {showActiveDot && !isActive && (
                <motion.div
                  className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"
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
