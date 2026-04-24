import { useState } from 'react';
import { motion } from 'framer-motion';

interface StepPhotoCaptureProps {
  label: string;
  badge: string;
  onComplete: (photo: string | null) => void;
}

const compressImage = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1080;
      const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.src = url;
  });

export default function StepPhotoCapture({ label, badge, onComplete }: StepPhotoCaptureProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const compressed = await compressImage(file);
    setPhoto(compressed);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="space-y-6"
    >
      <div className="bg-white/40 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/60 shadow-xl text-center space-y-4">
        <span className="inline-block bg-rose-100 text-rose-500 px-4 py-1.5 rounded-full font-black text-xs tracking-widest border border-rose-200">
          📸 인증샷 미션
        </span>
        <p className="text-2xl font-black text-slate-800 leading-snug">{label}</p>
        <span className="inline-block bg-white/80 text-slate-500 px-3 py-1 rounded-full text-xs font-bold border border-white/60 shadow-sm">
          {badge}
        </span>

        <label className={`block w-full aspect-square rounded-3xl overflow-hidden cursor-pointer transition-all mt-2 ${photo ? 'border-4 border-rose-300' : 'bg-white/60 border-2 border-dashed border-rose-200 hover:bg-white/80'}`}>
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
            </div>
          ) : photo ? (
            <img src={photo} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <span className="text-5xl">📷</span>
              <span className="font-black text-slate-500 text-base">사진 찍기 / 업로드</span>
              <span className="text-xs text-slate-400">이 순간을 담아주세요!</span>
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>

        {photo && (
          <button
            onClick={() => setPhoto(null)}
            className="text-xs text-slate-400 font-bold underline underline-offset-2"
          >
            다시 고르기
          </button>
        )}
      </div>

      {photo && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onComplete(photo)}
          className="w-full py-5 rounded-[2rem] text-xl font-black bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-[0_10px_20px_-10px_rgba(251,113,133,0.6)] active:scale-95 transition-transform"
        >
          인증 완료! 다음으로 👉
        </motion.button>
      )}

      <button
        onClick={() => onComplete(null)}
        className="w-full py-3 text-slate-400 font-bold text-sm"
      >
        지금은 건너뛰기
      </button>
    </motion.div>
  );
}
