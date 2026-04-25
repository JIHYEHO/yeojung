import { useState } from 'react';
import { motion } from 'framer-motion';

interface StepPhotoCaptureProps {
  label: string;
  badge: string;
  onComplete: (photo: string | null) => void;
}

const compressImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
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
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('이미지를 불러올 수 없어요.'));
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
    try {
      const compressed = await compressImage(file);
      setPhoto(compressed);
    } catch {
      // 이미지 로드 실패 시 조용히 무시 (파일 선택 취소와 동일 처리)
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="space-y-6"
    >
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center space-y-4">
        <span className="inline-block bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full font-black text-xs tracking-widest border border-slate-200">
          📸 인증샷 미션
        </span>
        <p className="text-2xl font-black text-slate-800 leading-snug">{label}</p>
        <span className="inline-block bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">
          {badge}
        </span>

        <label className={`block w-full aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all mt-2 ${photo ? 'border-4 border-rose-400' : 'bg-slate-50 border-2 border-dashed border-slate-200 hover:bg-white'}`}>
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
          className="w-full py-5 rounded-2xl text-xl font-black bg-rose-500 text-white active:scale-95 transition-transform"
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
