import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const MISSIONS = [
  '모르는 사람한테 사진 부탁하기 📸',
  '오늘 처음 먹어보는 음식 하나 시도하기 🍽️',
  '서로 칭찬 3개씩 해주기 💌',
  '가장 특이한 간판 사진 찍기 🪧',
  '길거리 버스킹 만나면 잠깐 구경하기 🎵',
  '손잡고 100걸음 세기 👫',
  '오늘 본 것 중 제일 예쁜 장면 찍어두기 🌸',
  '서로 어릴 때 사진 보여주기 👶',
  '오늘 가장 맛있는 한 입 사진 찍기 🍴',
  '카페 직원한테 오늘의 추천 물어보기 ☕',
  '즉흥 골목 탐험 — 지도 없이 5분 걷기 🗺️',
  '오늘 영수증 다 모아서 총액 맞추기 🧾',
];

const TOPICS = [
  '우리 다음엔 어디 여행 가고 싶어? ✈️',
  '요즘 제일 행복한 순간이 언제야? 😊',
  '5년 후 우리 어떻게 됐을 것 같아? 🔮',
  '내가 몰랐던 나에 대해 하나 알려줘 🤫',
  '우리 처음 만났을 때 기억해? 💘',
  '요즘 제일 힘든 게 뭐야? 🤗',
  '나한테 고마웠던 순간 하나 말해줘 🙏',
  '함께 해보고 싶은 버킷리스트 3개 말해봐 📋',
  '지금 이 순간 딱 한 가지 바꿀 수 있다면? 🌈',
  '나의 어떤 점이 제일 좋아? 🥰',
  '오늘 여기 오길 잘했다고 느끼는 순간은? 💫',
  '우리 10년 후엔 어디서 뭐 하고 있을까? 🏡',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface FlipCardProps {
  emoji: string;
  label: string;
  content: string;
  color: string;
}

function FlipCard({ emoji, label, content, color }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="w-full" style={{ perspective: '1000px' }} onClick={() => setFlipped(true)}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d', position: 'relative', minHeight: '140px' }}
      >
        {/* 앞면 (물음표) */}
        <div
          className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 border-dashed"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderColor: color,
            background: `${color}10`,
          }}
        >
          <span className="text-4xl">🎴</span>
          <p className="text-xs font-black" style={{ color }}>{label}</p>
          <p className="text-[11px] text-slate-400 font-bold">탭해서 확인하기</p>
        </div>

        {/* 뒷면 (내용) */}
        <div
          className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-3 p-5 text-center"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: `${color}15`,
            border: `2px solid ${color}40`,
          }}
        >
          <span className="text-3xl">{emoji}</span>
          <p className="text-xs font-black" style={{ color }}>{label}</p>
          <p className="text-sm font-bold text-slate-700 leading-relaxed">{content}</p>
        </div>
      </motion.div>
    </div>
  );
}

interface StepQuestProps {
  station: string;
  onComplete: (mission: string, topic: string) => void;
}

export default function StepQuest({ station, onComplete }: StepQuestProps) {
  const mission = useRef(pick(MISSIONS));
  const topic   = useRef(pick(TOPICS));

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="space-y-6"
    >
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
        <div className="text-center space-y-1">
          <span className="inline-block bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full font-black text-xs tracking-widest border border-slate-200">
            🎯 오늘의 퀘스트
          </span>
          <p className="text-lg font-black text-slate-800 pt-1">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4D6D] to-[#8B5CF6]">{station}역</span>에서 도전해봐요!
          </p>
        </div>

        <FlipCard
          emoji="🎯"
          label="오늘의 미션"
          content={mission.current}
          color="#FF4D6D"
        />
        <FlipCard
          emoji="💬"
          label="대화 주제"
          content={topic.current}
          color="#8B5CF6"
        />
      </div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={() => onComplete(mission.current, topic.current)}
        className="w-full py-5 rounded-full text-xl font-black bg-gradient-to-r from-[#FF4D6D] to-[#8B5CF6] text-white active:scale-95 transition-transform shadow-lg shadow-rose-200"
      >
        여정 시작! 🚀
      </motion.button>

      <button
        onClick={() => onComplete(mission.current, topic.current)}
        className="w-full py-3 text-slate-400 font-bold text-sm"
      >
        퀘스트 없이 진행할게요
      </button>
    </motion.div>
  );
}
