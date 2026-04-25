let audioCtx: AudioContext | null = null;

export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

// 룰렛 회전 중 "딩" 소리 — 밝고 경쾌하게
export const playTick = (pitch = 1000) => {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.09, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.09);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.09);
};

// 룰렛 시작 / 결과 확정 "붐" — 부드러운 저음 펀치
export const playThud = () => {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(220, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(70, audioCtx.currentTime + 0.18);
  gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.28);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.28);
};

// 결과 발표 팡파레 — C E G C E 경쾌한 아르페지오
export const playTada = () => {
  if (!audioCtx) return;
  const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
  notes.forEach((freq, i) => {
    const osc = audioCtx!.createOscillator();
    const gain = audioCtx!.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = audioCtx!.currentTime + i * 0.07;
    const isLast = i === notes.length - 1;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(isLast ? 0.25 : 0.15, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (isLast ? 1.4 : 0.7));
    osc.connect(gain);
    gain.connect(audioCtx!.destination);
    osc.start(t);
    osc.stop(t + (isLast ? 1.4 : 0.7));
  });
};
