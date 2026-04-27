import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { SUBWAY_DATA } from '../data/subway';

const ADMIN_PASSWORD = 'yeojung2024';

interface Journey {
  id: string;
  created_at: string;
  nickname: string | null;
  line_id: string | null;
  station: string | null;
  menu: string | null;
  payer_menu: string | null;
  activity: string | null;
  payer_activity: string | null;
  review: string | null;
  is_public: boolean;
  photo_station: string | null;
  photo_menu: string | null;
  photo_activity: string | null;
  public_photo_url: string | null;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Journey | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'public' | 'review'>('all');

  const fetchJourneys = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setJourneys(data as Journey[]);
    setLoading(false);
  };

  useEffect(() => {
    if (authed) fetchJourneys();
  }, [authed]);

  const handleLogin = () => {
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true);
    } else {
      setPwError(true);
      setPw('');
    }
  };

  const filtered = journeys.filter(j => {
    const matchSearch =
      !search ||
      j.nickname?.includes(search) ||
      j.station?.includes(search) ||
      j.menu?.includes(search) ||
      j.activity?.includes(search) ||
      j.review?.includes(search);

    const matchFilter =
      filter === 'all' ||
      (filter === 'public' && j.is_public) ||
      (filter === 'review' && !!j.review);

    return matchSearch && matchFilter;
  });

  const todayCount = journeys.filter(j => {
    const d = new Date(j.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const publicCount = journeys.filter(j => j.is_public).length;
  const photoCount = journeys.filter(j => j.photo_station || j.photo_menu || j.photo_activity).length;

  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl space-y-5">
          <div className="text-center space-y-1">
            <p className="text-3xl">🔐</p>
            <h1 className="text-xl font-black text-slate-800">관리자 페이지</h1>
            <p className="text-xs text-slate-400 font-bold">여정 데이터 관리</p>
          </div>
          <div className="space-y-3">
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setPwError(false); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="비밀번호 입력"
              className={`w-full px-4 py-3 rounded-2xl border-2 font-bold text-sm outline-none transition-colors ${
                pwError ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-rose-400'
              }`}
            />
            {pwError && <p className="text-xs text-red-500 font-bold text-center">비밀번호가 틀렸어요</p>}
            <button
              onClick={handleLogin}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF4D6D] to-[#8B5CF6] text-white font-black text-sm active:scale-95 transition-transform"
            >
              입장하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* 헤더 */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-black text-slate-800">🗂️ 여정 관리자</h1>
          <p className="text-xs text-slate-400 font-bold">총 {journeys.length}개의 여정</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchJourneys}
            className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 font-black text-xs active:scale-95 transition-transform"
          >
            새로고침
          </button>
          <button
            onClick={() => { setAuthed(false); setPw(''); }}
            className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-500 font-black text-xs active:scale-95 transition-transform"
          >
            로그아웃
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 space-y-4">
        {/* 통계 카드 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '전체 여정', value: journeys.length, emoji: '🚇', color: 'from-[#FF4D6D] to-[#FF8FA3]' },
            { label: '오늘 여정', value: todayCount, emoji: '📅', color: 'from-[#8B5CF6] to-[#A78BFA]' },
            { label: '피드 공개', value: publicCount, emoji: '📢', color: 'from-[#F59E0B] to-[#FCD34D]' },
            { label: '사진 있음', value: photoCount, emoji: '📸', color: 'from-[#10B981] to-[#6EE7B7]' },
          ].map(s => (
            <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 text-white`}>
              <p className="text-2xl">{s.emoji}</p>
              <p className="text-2xl font-black mt-1">{s.value}</p>
              <p className="text-xs font-bold opacity-80">{s.label}</p>
            </div>
          ))}
        </div>

        {/* 검색/필터 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="닉네임, 역, 메뉴, 활동, 소감 검색..."
            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 font-bold text-sm outline-none focus:border-rose-400 transition-colors"
          />
          <div className="flex gap-2">
            {(['all', 'public', 'review'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition-colors ${
                  filter === f
                    ? 'bg-gradient-to-r from-[#FF4D6D] to-[#8B5CF6] text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {f === 'all' ? '전체' : f === 'public' ? '📢 피드공개' : '💬 소감있음'}
              </button>
            ))}
            <span className="ml-auto text-xs text-slate-400 font-bold self-center">{filtered.length}개</span>
          </div>
        </div>

        {/* 여정 목록 */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(j => {
              const lineData = j.line_id ? SUBWAY_DATA[j.line_id] : null;
              const date = new Date(j.created_at);
              const photos = [j.photo_station, j.photo_menu, j.photo_activity].filter(Boolean) as string[];

              return (
                <div
                  key={j.id}
                  onClick={() => setSelected(j)}
                  className="bg-white rounded-2xl border border-slate-100 p-4 cursor-pointer hover:border-rose-200 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {lineData && (
                        <span
                          className="px-2 py-0.5 rounded-full text-white text-[10px] font-black"
                          style={{ background: lineData.color }}
                        >
                          {lineData.name}
                        </span>
                      )}
                      <span className="font-black text-slate-800 text-sm">
                        {j.station ? `${j.station}역` : '—'}
                      </span>
                      {j.nickname && (
                        <span className="text-xs text-slate-400 font-bold">@{j.nickname}</span>
                      )}
                      {j.is_public && (
                        <span className="text-[10px] bg-violet-100 text-violet-600 font-black px-2 py-0.5 rounded-full">
                          📢 피드공개
                        </span>
                      )}
                      {j.review && (
                        <span className="text-[10px] bg-rose-50 text-rose-500 font-black px-2 py-0.5 rounded-full">
                          💬 소감
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold shrink-0">
                      {date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}{' '}
                      {date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex gap-2 flex-wrap text-xs">
                    {j.menu && (
                      <span className="bg-peach-50 text-orange-500 font-bold px-2 py-1 rounded-lg">
                        🍴 {j.menu}
                      </span>
                    )}
                    {j.activity && (
                      <span className="bg-violet-50 text-violet-600 font-bold px-2 py-1 rounded-lg">
                        🎯 {j.activity}
                      </span>
                    )}
                  </div>

                  {photos.length > 0 && (
                    <div className="flex gap-1.5">
                      {photos.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt=""
                          className="w-16 h-16 object-cover rounded-xl border border-slate-100"
                        />
                      ))}
                    </div>
                  )}

                  {j.review && (
                    <p className="text-xs text-slate-500 font-bold bg-slate-50 rounded-xl px-3 py-2 line-clamp-2">
                      "{j.review}"
                    </p>
                  )}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-16 text-slate-400 font-bold text-sm">
                해당하는 여정이 없어요
              </div>
            )}
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-slate-800 text-base">여정 상세</h2>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black text-sm"
                >
                  ✕
                </button>
              </div>

              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-100">
                  {[
                    ['ID', selected.id.slice(0, 8) + '...'],
                    ['생성일', new Date(selected.created_at).toLocaleString('ko-KR')],
                    ['닉네임', selected.nickname || '—'],
                    ['노선', selected.line_id ? SUBWAY_DATA[selected.line_id]?.name : '—'],
                    ['역', selected.station ? `${selected.station}역` : '—'],
                    ['메뉴', selected.menu || '—'],
                    ['메뉴 결제자', selected.payer_menu || '—'],
                    ['활동', selected.activity || '—'],
                    ['활동 결제자', selected.payer_activity || '—'],
                    ['피드 공개', selected.is_public ? '✅ 공개' : '🔒 비공개'],
                  ].map(([k, v]) => (
                    <tr key={k}>
                      <td className="py-2 pr-3 font-black text-slate-400 w-24">{k}</td>
                      <td className="py-2 font-bold text-slate-700">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {selected.review && (
                <div className="bg-rose-50 rounded-2xl p-3">
                  <p className="text-[10px] font-black text-rose-400 mb-1">💬 소감</p>
                  <p className="text-sm font-bold text-slate-700">{selected.review}</p>
                </div>
              )}

              {[
                { url: selected.photo_station, label: '역 인증샷' },
                { url: selected.photo_menu, label: '메뉴 인증샷' },
                { url: selected.photo_activity, label: '활동 인증샷' },
                { url: selected.public_photo_url, label: '뜻밖의 네컷' },
              ].filter(p => p.url).map(p => (
                <div key={p.label}>
                  <p className="text-[10px] font-black text-slate-400 mb-1">{p.label}</p>
                  <img src={p.url!} alt={p.label} className="w-full rounded-2xl object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
