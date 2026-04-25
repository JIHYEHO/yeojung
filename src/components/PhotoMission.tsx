import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import { supabase } from '../utils/supabaseClient';
import { SUBWAY_DATA } from '../data/subway';

interface PhotoMissionProps {
  journeyId: string;
  lineId: string;
  station: string;
  menu: string;
  activity: string;
  onClose: () => void;
  onSuccess: () => void;
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

const SLOTS = [
  { key: 'station' as const, label: '📍 역 도착' },
  { key: 'menu'    as const, label: '🍔 식사'    },
  { key: 'activity'as const, label: '🎯 놀거리'  },
];

export default function PhotoMission({ journeyId, lineId, station, menu, activity, onClose, onSuccess }: PhotoMissionProps) {
  const [photos, setPhotos] = useState<{ station: string | null; menu: string | null; activity: string | null }>({
    station: null, menu: null, activity: null,
  });
  const [uploading, setUploading] = useState(false);
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState('');
  const frameRef = useRef<HTMLDivElement>(null);

  const lineData = SUBWAY_DATA[lineId];
  const lineColor = lineData?.color || '#ec4899';

  const hasAnyPhoto = photos.station || photos.menu || photos.activity;

  const handleFile = async (key: keyof typeof photos, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setPhotos(prev => ({ ...prev, [key]: compressed }));
    } catch {
      setStatusMsg('이미지를 불러올 수 없어요. 다른 파일을 선택해주세요.');
    }
  };

  const handleGenerateFrame = async () => {
    if (!frameRef.current) return;
    setUploading(true);
    setStatusMsg('');
    try {
      const dataUrl = await toPng(frameRef.current, { pixelRatio: 3 });
      setGeneratedImg(dataUrl);
    } catch (err) {
      console.error('Frame generation failed:', err);
      setStatusMsg('이미지 생성에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!generatedImg) return;
    const a = document.createElement('a');
    a.href = generatedImg;
    a.download = `yeojung_${station}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    if (!generatedImg) return;
    try {
      const blob = await (await fetch(generatedImg)).blob();
      const file = new File([blob], 'yeojung.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: '뜻밖의 여정 🚇', text: `${station}역 완벽한 하루!` });
        return;
      }
    } catch { /* fallback */ }
    handleSave();
  };

  const handlePublicUpload = async () => {
    if (!generatedImg) return;
    setUploading(true);
    setStatusMsg('');
    try {
      const blob = await (await fetch(generatedImg)).blob();
      const fileName = `${journeyId}_${Date.now()}.png`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('missions')
        .upload(filePath, blob, { contentType: 'image/png' });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('missions').getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('history')
        .update({ public_photo_url: publicUrl })
        .eq('id', journeyId);
      if (dbError) throw dbError;

      setStatusMsg('실시간 피드에 자랑하기 성공! 🎉');
      onSuccess();
    } catch (err) {
      console.error('Upload failed:', err);
      setStatusMsg('업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[210] flex flex-col bg-slate-900/98 backdrop-blur-3xl overflow-y-auto"
    >
      <div className="flex items-center justify-between p-6 shrink-0">
        <h3 className="text-xl font-black text-white">📸 인생네컷 만들기</h3>
        <button onClick={onClose} className="w-10 h-10 bg-white/10 rounded-full text-white flex justify-center items-center">✕</button>
      </div>

      {statusMsg && (
        <p className="mx-6 mb-2 text-center text-sm font-bold px-4 py-2 rounded-xl bg-white/10 text-white/80">{statusMsg}</p>
      )}

      <div className="flex-1 px-6 pb-28 flex flex-col items-center gap-6">
        {!generatedImg ? (
          <>
            {/* 사진 업로드 슬롯 3개 */}
            <div className="w-full space-y-3">
              {SLOTS.map(({ key, label }) => (
                <label
                  key={key}
                  className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-colors ${
                    photos[key] ? 'bg-white/10' : 'bg-white/5 border border-dashed border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 shrink-0 flex items-center justify-center">
                    {photos[key]
                      ? <img src={photos[key]!} alt="" className="w-full h-full object-cover" />
                      : <span className="text-2xl opacity-40">📷</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-black text-sm">{label}</p>
                    <p className="text-white/40 text-xs mt-0.5">{photos[key] ? '탭해서 다시 고르기' : '사진 추가하기'}</p>
                  </div>
                  {photos[key] && <span className="text-emerald-400 text-lg shrink-0">✓</span>}
                  <input type="file" accept="image/*" onChange={(e) => handleFile(key, e)} className="hidden" />
                </label>
              ))}
            </div>

            {/* 프레임 미리보기 */}
            <div
              ref={frameRef}
              style={{ background: '#0f0f1a', padding: '20px', borderRadius: '16px', fontFamily: 'system-ui, sans-serif', width: '100%', maxWidth: '320px' }}
            >
              <div style={{ textAlign: 'center', marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ color: '#fb7185', fontWeight: 900, fontSize: '10px', letterSpacing: '0.25em', margin: 0, textTransform: 'uppercase' }}>💘 뜻밖의 여정</p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', margin: '4px 0 0' }}>
                  {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {SLOTS.map(({ key, label }) => (
                <div key={key} style={{ width: '100%', height: '180px', borderRadius: '10px', overflow: 'hidden', background: 'rgba(255,255,255,0.06)', marginBottom: '6px' }}>
                  {photos[key]
                    ? <img src={photos[key]!} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '13px', fontWeight: 700 }}>{label}</div>
                  }
                </div>
              ))}

              <div style={{ textAlign: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ color: lineColor, fontWeight: 900, fontSize: '20px', margin: '0 0 2px', letterSpacing: '-0.02em' }}>{station}역</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', margin: '0 0 8px', fontWeight: 700 }}>{lineData?.name || `${lineId}호선`}</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', flexWrap: 'wrap' }}>
                  <span style={{ background: 'rgba(251,146,60,0.15)', color: '#fb923c', padding: '3px 9px', borderRadius: '20px', fontSize: '10px', fontWeight: 700 }}>🍔 {menu}</span>
                  <span style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', padding: '3px 9px', borderRadius: '20px', fontSize: '10px', fontWeight: 700 }}>🎯 {activity}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateFrame}
              disabled={uploading || !hasAnyPhoto}
              className={`w-full max-w-[320px] py-4 rounded-2xl font-black text-lg active:scale-95 transition-all ${
                hasAnyPhoto && !uploading
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                  : 'bg-white/10 text-white/30'
              }`}
            >
              {uploading ? '프레임 만드는 중... ✨' : '🎞️ 프레임 생성하기'}
            </button>
          </>
        ) : (
          <div className="w-full max-w-[320px] flex flex-col items-center space-y-6 pt-2">
            <h4 className="text-white text-2xl font-black text-center">완성됐어요! 🎉</h4>
            <div className="w-full rounded-xl overflow-hidden shadow-[0_0_50px_rgba(244,114,182,0.3)]">
              <img src={generatedImg} alt="Frame" className="w-full h-auto" />
            </div>
            <div className="w-full space-y-3">
              <button
                onClick={handleShare}
                className="w-full py-4 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-2xl font-black text-lg active:scale-95 shadow-lg"
              >
                인스타에 자랑하기 📲
              </button>
              <button
                onClick={handleSave}
                className="w-full py-3 bg-white/10 text-white rounded-2xl font-bold text-sm active:scale-95"
              >
                갤러리에 저장 ⬇️
              </button>
              <button
                onClick={handlePublicUpload}
                disabled={uploading}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-black text-base active:scale-95 shadow-lg"
              >
                {uploading ? '업로드 중...' : '🌍 실시간 피드에 자랑하기'}
              </button>
            </div>
            <p className="text-white/30 text-[10px] text-center">'피드에 자랑하기' 클릭 시 사진은 모든 유저에게 공개됩니다.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
