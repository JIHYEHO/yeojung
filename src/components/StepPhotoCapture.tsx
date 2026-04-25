import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface StepPhotoCaptureProps {
  label: string;
  badge: string;
  onComplete: (photo: string | null) => void;
}

const OUTPUT_W = 1080;
const OUTPUT_H = 607; // 16:9

const compressImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1920;
      const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('load fail')); };
    img.src = url;
  });

interface CropEditorProps {
  src: string;
  onConfirm: (cropped: string) => void;
  onCancel: () => void;
}

function CropEditor({ src, onConfirm, onCancel }: CropEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [coverScale, setCoverScale] = useState(1);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [userScale, setUserScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const touchRef = useRef<{
    type: 'drag' | 'pinch';
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
    startDist: number;
    startScale: number;
  } | null>(null);

  // non-passive touchmove to allow preventDefault (stops page scroll)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: TouchEvent) => e.preventDefault();
    el.addEventListener('touchmove', handler, { passive: false });
    return () => el.removeEventListener('touchmove', handler);
  }, []);

  const handleImgLoad = () => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) return;
    const cs = Math.max(container.clientWidth / img.naturalWidth, container.clientHeight / img.naturalHeight);
    setCoverScale(cs);
    setImgLoaded(true);
  };

  const getDist = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchRef.current = {
        type: 'drag',
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        startOffsetX: offset.x,
        startOffsetY: offset.y,
        startDist: 0,
        startScale: userScale,
      };
    } else if (e.touches.length >= 2) {
      touchRef.current = {
        type: 'pinch',
        startX: 0, startY: 0,
        startOffsetX: offset.x,
        startOffsetY: offset.y,
        startDist: getDist(e.touches),
        startScale: userScale,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const t = touchRef.current;
    if (!t) return;

    if (t.type === 'drag' && e.touches.length === 1) {
      const newX = t.startOffsetX + e.touches[0].clientX - t.startX;
      const newY = t.startOffsetY + e.touches[0].clientY - t.startY;

      // clamp so image never leaves the frame
      const img = imgRef.current;
      const container = containerRef.current;
      if (img && container) {
        const totalScale = coverScale * userScale;
        const displayW = img.naturalWidth * totalScale;
        const displayH = img.naturalHeight * totalScale;
        const maxX = Math.max(0, (displayW - container.clientWidth) / 2);
        const maxY = Math.max(0, (displayH - container.clientHeight) / 2);
        setOffset({
          x: Math.max(-maxX, Math.min(maxX, newX)),
          y: Math.max(-maxY, Math.min(maxY, newY)),
        });
      } else {
        setOffset({ x: newX, y: newY });
      }
    } else if (t.type === 'pinch' && e.touches.length >= 2) {
      const newDist = getDist(e.touches);
      const newScale = Math.max(1, Math.min(5, t.startScale * (newDist / t.startDist)));
      setUserScale(newScale);
    }
  };

  const handleTouchEnd = () => { touchRef.current = null; };

  const handleConfirm = () => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container || !img.naturalWidth) return;

    const containerW = container.clientWidth;
    const containerH = container.clientHeight;
    const totalScale = coverScale * userScale;

    const displayW = img.naturalWidth * totalScale;
    const displayH = img.naturalHeight * totalScale;

    // top-left of displayed image in container coords
    const imgLeft = containerW / 2 + offset.x - displayW / 2;
    const imgTop = containerH / 2 + offset.y - displayH / 2;

    // source rect in original image pixels
    const srcX = Math.max(0, -imgLeft / totalScale);
    const srcY = Math.max(0, -imgTop / totalScale);
    const srcW = Math.min(img.naturalWidth - srcX, containerW / totalScale);
    const srcH = Math.min(img.naturalHeight - srcY, containerH / totalScale);

    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_W;
    canvas.height = OUTPUT_H;
    canvas.getContext('2d')!.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, OUTPUT_W, OUTPUT_H);
    onConfirm(canvas.toDataURL('image/jpeg', 0.9));
  };

  const totalScale = coverScale * userScale;

  return (
    <div className="space-y-3">
      {/* crop area */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl bg-black w-full"
        style={{ aspectRatio: '16/9', touchAction: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          ref={imgRef}
          src={src}
          alt=""
          onLoad={handleImgLoad}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: imgLoaded && imgRef.current ? imgRef.current.naturalWidth * totalScale : 'auto',
            height: imgLoaded && imgRef.current ? imgRef.current.naturalHeight * totalScale : 'auto',
            transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
            userSelect: 'none',
            pointerEvents: 'none',
            maxWidth: 'none',
            maxHeight: 'none',
          }}
        />
        {/* 3×3 grid guide */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '33.33% 33.33%',
          }}
        />
        {/* zoom indicator */}
        {userScale > 1 && (
          <div className="absolute top-2 right-2 bg-black/50 rounded-full px-2 py-1">
            <span className="text-white text-[10px] font-black">{userScale.toFixed(1)}×</span>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-slate-400 font-bold">드래그로 위치 · 두 손가락으로 확대/축소</p>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-500 font-black text-sm active:scale-95 transition-transform"
        >
          다시 고르기
        </button>
        <button
          onClick={handleConfirm}
          className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#FF4D6D] to-[#8B5CF6] text-white font-black text-sm active:scale-95 transition-transform"
        >
          이 구도로 확정 ✓
        </button>
      </div>
    </div>
  );
}

export default function StepPhotoCapture({ label, badge, onComplete }: StepPhotoCaptureProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<'select' | 'crop'>('select');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const compressed = await compressImage(file);
      setPhoto(compressed);
      setPhase('crop');
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (phase === 'crop' && photo) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        className="space-y-4"
      >
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="text-center space-y-1">
            <span className="inline-block bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full font-black text-xs tracking-widest border border-slate-200">
              ✂️ 구도 맞추기
            </span>
            <p className="text-sm font-bold text-slate-400">뜻밖의 네컷 프레임에 맞게 조정해요</p>
          </div>
          <CropEditor
            src={photo}
            onConfirm={(cropped) => onComplete(cropped)}
            onCancel={() => { setPhoto(null); setPhase('select'); }}
          />
        </div>
        <button onClick={() => onComplete(null)} className="w-full py-3 text-slate-400 font-bold text-sm">
          사진 없이 건너뛰기
        </button>
      </motion.div>
    );
  }

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

        <label className="block w-full aspect-square rounded-2xl overflow-hidden cursor-pointer bg-slate-50 border-2 border-dashed border-slate-200 transition-all hover:bg-white">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 px-6">
              <span className="text-5xl">📷</span>
              <span className="font-black text-slate-500 text-base">사진 찍기 / 업로드</span>
              <span className="text-xs text-slate-400 text-center leading-relaxed">
                나중에 뜻밖의 네컷 프레임으로 완성돼요!<br />예쁜 사진으로 골라주세요 🎞️
              </span>
            </div>
          )}
          <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
        </label>
      </div>

      <button onClick={() => onComplete(null)} className="w-full py-3 text-slate-400 font-bold text-sm">
        지금은 건너뛰기
      </button>
    </motion.div>
  );
}
