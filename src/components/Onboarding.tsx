import { useState } from 'react';
import { motion } from 'framer-motion';

interface OnboardingProps {
  onComplete: (nickname: string) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [nickname, setNickname] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) return;
    localStorage.setItem('yeojung_nickname', trimmed);
    onComplete(trimmed);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[100dvh] bg-[#FAFAF7] flex flex-col items-center justify-center p-6"
    >
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <p className="text-xs font-black text-rose-400 tracking-[0.4em] uppercase">Love Journey</p>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-snug">
            뜻밖의 여정에<br/>오신 걸 환영해요 💘
          </h1>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            피드에 표시될 닉네임을 정해주세요.<br/>나중에 마이페이지에서 바꿀 수 있어요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 px-5 py-4 flex items-center gap-3">
            <span className="text-xl shrink-0">🌸</span>
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="닉네임을 입력해요"
              maxLength={12}
              autoFocus
              className="flex-1 bg-transparent text-base font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-normal focus:outline-none"
            />
            <span className="text-xs text-slate-300 font-bold shrink-0">{nickname.length}/12</span>
          </div>

          <button
            type="submit"
            disabled={!nickname.trim()}
            className={`w-full py-5 rounded-2xl text-xl font-black transition-all active:scale-95 ${nickname.trim() ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'}`}
          >
            여정 시작하기 💘
          </button>
        </form>
      </div>
    </motion.div>
  );
}
