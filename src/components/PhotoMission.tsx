import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { supabase } from '../utils/supabaseClient';

interface PhotoMissionProps {
  journeyId: string;
  lineId: string;
  station: string;
  menu: string;
  activity: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PhotoMission({ journeyId, lineId, station, menu, activity, onClose, onSuccess }: PhotoMissionProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRawFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhoto(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateFrame = async () => {
    if (!frameRef.current) return;
    setUploading(true);
    
    try {
      const canvas = await html2canvas(frameRef.current, {
        useCORS: true,
        scale: 3, // 고화질로 렌더링
        backgroundColor: null
      });
      const dataUrl = canvas.toDataURL('image/png');
      setGeneratedImg(dataUrl);
    } catch (err) {
      console.error('Frame generation failed:', err);
      alert('이미지 생성에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImg) return;
    const link = document.createElement('a');
    link.href = generatedImg;
    link.download = `yeojung_${station}_mission.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePublicUpload = async () => {
    if (!rawFile) return;
    setUploading(true);

    try {
      // 1. Supabase Storage에 원본 사진 업로드
      const fileExt = rawFile.name.split('.').pop();
      const fileName = `${journeyId}_${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('missions')
        .upload(filePath, rawFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('missions')
        .getPublicUrl(filePath);

      // 2. Database에 URL 저장
      const { error: dbError } = await supabase
        .from('history')
        .update({ public_photo_url: publicUrl })
        .eq('id', journeyId);

      if (dbError) throw dbError;

      alert('실시간 피드에 자랑하기 성공! 🎉');
      onSuccess();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[110] flex flex-col bg-slate-900/95 backdrop-blur-3xl overflow-y-auto"
    >
      <div className="flex items-center justify-between p-6">
        <h3 className="text-xl font-black text-white">📸 여정 인증샷 미션</h3>
        <button onClick={onClose} className="w-10 h-10 bg-white/10 rounded-full text-white flex justify-center items-center">✕</button>
      </div>

      <div className="flex-1 px-6 pb-20 space-y-6 flex flex-col items-center">
        {!photo ? (
          <div className="w-full flex-1 flex flex-col items-center justify-center">
            <label className="w-full aspect-[3/4] bg-white/5 border-2 border-dashed border-white/20 rounded-[2rem] flex flex-col items-center justify-center text-white/50 cursor-pointer hover:bg-white/10 transition-colors">
              <span className="text-5xl mb-4">📷</span>
              <span className="font-bold text-lg">사진 촬영 또는 업로드</span>
              <span className="text-xs mt-2 opacity-70">여정 중 찍은 최고의 한 컷을 골라주세요!</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
        ) : !generatedImg ? (
          <>
            <div className="w-full text-center text-white/80 font-bold text-sm mb-2">미리보기 (완성된 프레임)</div>
            
            {/* 렌더링될 실제 프레임 영역 */}
            <div 
               ref={frameRef} 
               className="w-full max-w-[320px] aspect-[3/4] bg-white p-4 rounded-xl shadow-2xl relative flex flex-col"
            >
              <div className="flex-1 w-full bg-slate-100 rounded-lg overflow-hidden relative border border-slate-200">
                <img src={photo} alt="Uploaded" className="w-full h-full object-cover" />
              </div>
              <div className="mt-4 pb-2 text-center space-y-2">
                <p className="text-[10px] font-black text-rose-500 tracking-[0.2em] uppercase">Yeojung Mission</p>
                <p className="text-2xl font-black text-slate-800 tracking-tighter">{station}역 <span className="text-base text-slate-400 font-bold ml-1">{lineId}호선</span></p>
                <div className="flex justify-center gap-2 pt-2">
                   <div className="bg-orange-50 px-3 py-1.5 rounded-full text-xs font-bold text-orange-600 truncate max-w-[120px]">🍔 {menu}</div>
                   <div className="bg-violet-50 px-3 py-1.5 rounded-full text-xs font-bold text-violet-600 truncate max-w-[120px]">🎯 {activity}</div>
                </div>
              </div>
            </div>

            <div className="w-full max-w-[320px] space-y-3 pt-6">
              <button 
                onClick={handleGenerateFrame}
                disabled={uploading}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-black text-lg active:scale-95 shadow-lg flex justify-center items-center"
              >
                {uploading ? '만드는 중...' : '🔥 인생네컷 프레임 생성하기'}
              </button>
              <button onClick={() => setPhoto(null)} className="w-full py-3 text-white/60 font-bold text-sm hover:text-white">
                다시 고르기
              </button>
            </div>
          </>
        ) : (
          <div className="w-full max-w-[320px] flex flex-col items-center space-y-8 animate-fade-in-up">
            <h4 className="text-white text-2xl font-black text-center mt-4">완성됐어요! 🎉</h4>
            <div className="w-full relative shadow-[0_0_50px_rgba(244,114,182,0.3)] rounded-xl overflow-hidden">
              <img src={generatedImg} alt="Frame" className="w-full h-auto" />
            </div>

            <div className="w-full space-y-3">
              <button 
                onClick={downloadImage}
                className="w-full py-4 bg-white text-rose-500 border-2 border-rose-100 rounded-2xl font-black text-lg active:scale-95 shadow-sm flex justify-center items-center gap-2"
              >
                ⬇️ 우리만 간직하기 (저장)
              </button>
              <button 
                onClick={handlePublicUpload}
                disabled={uploading}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-black text-lg active:scale-95 shadow-lg flex justify-center items-center gap-2"
              >
                {uploading ? '업로드 중...' : '🌍 실시간 피드에 자랑하기'}
              </button>
            </div>
            <p className="text-white/40 text-[10px] text-center w-full">'피드에 자랑하기' 클릭 시 사진은 모든 유저에게 공개됩니다.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
