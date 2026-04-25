import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { SUBWAY_DATA } from '../data/subway';
import { supabase } from '../utils/supabaseClient';

interface SummaryProps {
  results: {
    line?: string;
    startStation?: string;
    station?: string;
    menu?: string;
    menuPayer?: string;
    activity?: string;
    activityPayer?: string;
  };
  photos: {
    station?: string;
    menu?: string;
    activity?: string;
  };
  user?: any;
  onReset: () => void;
  savedHistoryId: string | null;
  onHistorySaved: (id: string) => void;
}

export default function Summary({ results, photos, user, onReset, savedHistoryId, onHistorySaved }: SummaryProps) {
  const [copyMsg, setCopyMsg] = useState('');
  const [frameImg, setFrameImg] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [review, setReview] = useState('');
  const [reviewSaved, setReviewSaved] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  const hasPhotos = photos.station || photos.menu || photos.activity;

  const handleGenerateFrame = async () => {
    if (!frameRef.current) return;
    setGenerating(true);
    try {
      const dataUrl = await toPng(frameRef.current, { pixelRatio: 3 });
      setFrameImg(dataUrl);

      // 생성된 프레임을 Storage에 업로드하고 history에 저장
      if (savedHistoryId) {
        const blob = await (await fetch(dataUrl)).blob();
        const filePath = `public/${savedHistoryId}_frame.png`;
        const { error: uploadError } = await supabase.storage
          .from('missions')
          .upload(filePath, blob, { contentType: 'image/png', upsert: true });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('missions').getPublicUrl(filePath);
          await supabase.from('history').update({ public_photo_url: publicUrl }).eq('id', savedHistoryId);
        }
      }
    } catch (err) {
      console.error('프레임 생성 실패:', err);
      setCopyMsg('이미지 생성에 실패했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveFrame = () => {
    if (!frameImg) return;
    const a = document.createElement('a');
    a.href = frameImg;
    a.download = `yeojung_${results.station}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShareFrame = async () => {
    if (!frameImg) return;
    try {
      const blob = await (await fetch(frameImg)).blob();
      const file = new File([blob], 'yeojung.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: '뜻밖의 여정 🚇', text: `${results.station}역 완벽한 하루!` });
        return;
      }
    } catch { /* fallback */ }
    handleSaveFrame();
  };

  const lineData = results.line ? SUBWAY_DATA[results.line] : undefined;
  const lineColor = lineData?.color || '#ec4899';

  useEffect(() => {
    const saveToHistory = async () => {
      if (savedHistoryId) return;

      try {
        const { data, error } = await supabase.from('history').insert([
          {
            line_id: results.line,
            station: results.station,
            menu: results.menu,
            activity: results.activity,
            payer_menu: results.menuPayer,
            payer_activity: results.activityPayer,
            user_id: user?.id || null,
            nickname: localStorage.getItem('yeojung_nickname') || null,
          }
        ]).select('id').single();

        if (error) throw error;

        if (data && data.id) {
          const myJourneys = JSON.parse(localStorage.getItem('my_journeys') || '[]');
          localStorage.setItem('my_journeys', JSON.stringify([...myJourneys, data.id]));
          onHistorySaved(data.id);

          // 개별 사진 Storage 업로드
          const uploadPhoto = async (dataUrl: string, path: string) => {
            try {
              const blob = await (await fetch(dataUrl)).blob();
              const { error: upErr } = await supabase.storage.from('missions').upload(path, blob, { contentType: 'image/jpeg', upsert: true });
              if (upErr) return null;
              return supabase.storage.from('missions').getPublicUrl(path).data.publicUrl;
            } catch { return null; }
          };

          const photoUpdates: Record<string, string> = {};
          if (photos.station) {
            const url = await uploadPhoto(photos.station, `public/${data.id}_station.jpg`);
            if (url) photoUpdates.photo_station = url;
          }
          if (photos.menu) {
            const url = await uploadPhoto(photos.menu, `public/${data.id}_menu.jpg`);
            if (url) photoUpdates.photo_menu = url;
          }
          if (photos.activity) {
            const url = await uploadPhoto(photos.activity, `public/${data.id}_activity.jpg`);
            if (url) photoUpdates.photo_activity = url;
          }
          if (Object.keys(photoUpdates).length > 0) {
            await supabase.from('history').update(photoUpdates).eq('id', data.id);
          }
        }
      } catch (err) {
        console.error("히스토리 저장 실패:", err);
      }
    };

    saveToHistory();
  }, [results]);

  const handleSaveReview = async () => {
    if (!savedHistoryId || !review.trim() || savingReview) return;
    setSavingReview(true);
    try {
      await supabase.from('history').update({ review: review.trim() }).eq('id', savedHistoryId);
      setReviewSaved(true);
    } catch {
      setCopyMsg('저장에 실패했어요.');
    } finally {
      setSavingReview(false);
    }
  };

  const handlePublishToFeed = async () => {
    if (!savedHistoryId || isPublic) return;
    setSharing(true);
    try {
      await supabase.from('history').update({ is_public: true }).eq('id', savedHistoryId);
      setIsPublic(true);
    } catch {
      setCopyMsg('공유에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSharing(false);
    }
  };

  const handleShare = async () => {
    const text = `✨ 우리의 완벽한 데이트/모임 코스 ✨\n\n🚇 모임: ${lineData?.name || ''} ${results.station}역\n🍔 메뉴: ${results.menu} (💸결제: ${results.menuPayer})\n🎯 놀거리: ${results.activity} (💸결제: ${results.activityPayer})\n\n우리 오늘 이거 어때? 💖\n(만든곳: 뜻밖의 여정)`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: '우리의 랜덤코스 결과!',
          text: text,
        });
      } catch (err) {
        console.log("공유 취소됨");
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        setCopyMsg("클립보드에 복사됐어요! 카카오톡에 붙여넣기 하세요 💌");
      } catch (err) {
        setCopyMsg("복사에 실패했습니다.");
      }
    }
  };

  const photoSlots: { key: keyof typeof photos; label: string }[] = [
    { key: 'station', label: '📍 역 도착' },
    { key: 'menu',    label: '🍔 식사'   },
    { key: 'activity',label: '🎯 놀거리' },
  ];

  return (
    <motion.div initial={{opacity:0, scale: 0.9}} animate={{opacity:1, scale:1}} className="space-y-6 w-full">

      {/* 결과 카드 */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 space-y-6 shadow-sm relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/80 to-transparent pointer-events-none rounded-t-[2.5rem]"></div>
        <h3 className="text-2xl font-black text-slate-800 relative z-10">✨ 완벽한 데이트 라인업</h3>
        <div className="space-y-3 relative z-10">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1 items-start justify-center">
            <span className="text-slate-400 font-bold text-sm mb-1">📍 최종 모임 장소</span>
            <div className="flex w-full justify-between items-end">
              <span className="text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md shadow-sm border border-white/20" style={{ backgroundColor: lineColor, color: '#fff' }}>
                {lineData?.name} {results.startStation} 출발
              </span>
              <span className="text-xl sm:text-2xl font-black drop-shadow-sm" style={{ color: lineColor }}>{results.station}역</span>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 text-left gap-4">
            <div>
              <span className="text-slate-400 font-bold text-[10px] sm:text-xs block mb-1">🍔 메뉴</span>
              <span className="text-lg font-black text-orange-500 truncate block">{results.menu}</span>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="text-slate-400 font-bold text-[10px] sm:text-xs block mb-1">💸 식비 결제</span>
              <span className="text-lg font-black text-emerald-500 truncate block">{results.menuPayer}님</span>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 text-left gap-4">
            <div>
              <span className="text-slate-400 font-bold text-[10px] sm:text-xs block mb-1">🎯 놀거리</span>
              <span className="text-lg font-black text-violet-500 truncate block">{results.activity}</span>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="text-slate-400 font-bold text-[10px] sm:text-xs block mb-1">💸 놀거리 결제</span>
              <span className="text-lg font-black text-teal-500 truncate block">{results.activityPayer}님</span>
            </div>
          </div>
        </div>
      </div>

      {/* 뜻밖의 네컷 프레임 섹션 */}
      {hasPhotos && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <p className="text-center font-black text-slate-700 text-lg">📸 오늘의 뜻밖의 네컷</p>

          {frameImg ? (
            /* 생성 완료 — 이미지 표시 */
            <div className="space-y-3">
              <div className="w-full rounded-2xl overflow-hidden shadow-lg">
                <img src={frameImg} alt="뜻밖의 네컷 프레임" className="w-full h-auto" />
              </div>
              <button
                onClick={handleShareFrame}
                className="w-full py-4 rounded-2xl font-black text-lg bg-rose-500 text-white active:scale-95 transition-transform"
              >
                인스타에 자랑하기 📲
              </button>
              <button
                onClick={handleSaveFrame}
                className="w-full py-3 rounded-2xl font-bold text-sm text-slate-500 bg-white/60 border border-slate-200 active:scale-95"
              >
                갤러리에 저장 ⬇️
              </button>
            </div>
          ) : (
            <>
              {/* 프레임 미리보기 — html2canvas 캡처 대상 (화면에 직접 렌더링) */}
              <div
                ref={frameRef}
                style={{ background: '#0f0f1a', padding: '20px', borderRadius: '16px', fontFamily: 'system-ui, sans-serif' }}
              >
                {/* 브랜딩 */}
                <div style={{ textAlign: 'center', marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <p style={{ color: '#fb7185', fontWeight: 900, fontSize: '10px', letterSpacing: '0.25em', margin: 0, textTransform: 'uppercase' }}>💘 뜻밖의 여정</p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', margin: '4px 0 0' }}>
                    {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                {/* 사진 3장 */}
                {photoSlots.map(({ key, label }) => (
                  <div key={key} style={{ width: '100%', height: '180px', borderRadius: '10px', overflow: 'hidden', background: 'rgba(255,255,255,0.06)', marginBottom: '6px' }}>
                    {photos[key]
                      ? <img src={photos[key]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '13px', fontWeight: 700 }}>{label}</div>
                    }
                  </div>
                ))}
                {/* 하단 정보 */}
                <div style={{ textAlign: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <p style={{ color: lineColor, fontWeight: 900, fontSize: '20px', margin: '0 0 2px', letterSpacing: '-0.02em' }}>{results.station}역</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', margin: '0 0 8px', fontWeight: 700 }}>{lineData?.name}</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', flexWrap: 'wrap' }}>
                    <span style={{ background: 'rgba(251,146,60,0.15)', color: '#fb923c', padding: '3px 9px', borderRadius: '20px', fontSize: '10px', fontWeight: 700 }}>🍔 {results.menu}</span>
                    <span style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', padding: '3px 9px', borderRadius: '20px', fontSize: '10px', fontWeight: 700 }}>🎯 {results.activity}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerateFrame}
                disabled={generating}
                className={`w-full py-4 rounded-2xl font-black text-lg transition-all active:scale-95 ${generating ? 'bg-white/60 text-slate-400' : 'bg-slate-800 text-white shadow-lg'}`}
              >
                {generating ? '프레임 만드는 중... ✨' : '🎞️ 이 프레임으로 저장하기'}
              </button>
            </>
          )}
        </div>
      )}

      {copyMsg && (
        <p className="text-center text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">{copyMsg}</p>
      )}

      {/* 소감 남기기 */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
        <p className="text-sm font-black text-slate-700">💬 오늘 여정 소감 남기기</p>
        {reviewSaved ? (
          <div className="bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-100">
            <p className="text-sm font-bold text-emerald-600 leading-relaxed">"{review}"</p>
          </div>
        ) : (
          <>
            <textarea
              value={review}
              onChange={e => setReview(e.target.value)}
              placeholder="오늘 어땠어요? 짧게 남겨주세요 ✨"
              maxLength={100}
              rows={2}
              className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-normal focus:outline-none resize-none border border-slate-100"
            />
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-300 font-bold">{review.length}/100</span>
              <button
                onClick={handleSaveReview}
                disabled={!review.trim() || savingReview}
                className="px-4 py-2 rounded-xl text-xs font-black bg-slate-800 text-white disabled:opacity-30 active:scale-95 transition-transform"
              >
                {savingReview ? '저장 중...' : '저장하기'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* 피드 공유 */}
      <button
        onClick={handlePublishToFeed}
        disabled={isPublic || sharing}
        className={`w-full py-4 rounded-2xl font-black text-base transition-all active:scale-95 border ${isPublic ? 'bg-emerald-50 text-emerald-500 border-emerald-100 cursor-default' : 'bg-white text-slate-600 border-slate-200'}`}
      >
        {isPublic ? '✅ 피드에 공유됐어요!' : sharing ? '공유 중...' : '📢 피드에 자랑하기'}
      </button>

      <div className="space-y-3">
        <button onClick={handleShare} className="w-full py-5 rounded-full text-xl font-black transition-all bg-gradient-to-r from-[#FF4D6D] to-[#8B5CF6] text-white active:scale-95 shadow-lg shadow-rose-200">
          이 코스로 친구한테 공유하기 💌
        </button>
        <button onClick={() => window.open(`https://search.naver.com/search.naver?query=${encodeURIComponent(results.station + '역 데이트 추천')}`, '_blank')} className="w-full py-4 rounded-[2rem] flex flex-col items-center justify-center transition-all bg-[#03C75A] text-white shadow-lg border border-[#03C75A]/20 active:scale-95">
          <span className="text-lg font-black tracking-tight">뜻밖의 추억 쌓기 💡</span>
          <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full mt-1">네이버에서 '{results.station}역 데이트' 동선 찾기 👇</span>
        </button>
        <button onClick={onReset} className="w-full py-4 rounded-2xl text-lg font-black transition-all bg-white text-slate-600 border border-slate-200 active:scale-95">
          처음부터 다시하기 🔄
        </button>
      </div>
    </motion.div>
  );
}
