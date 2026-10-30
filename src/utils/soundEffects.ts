let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export function playTinSnap(muted: boolean) {
  if (muted) return;
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(520, now);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.06);

  gain.gain.setValueAtTime(0.14, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.07);
}

export function playTrapBuzz(muted: boolean) {
  if (muted) return;
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(170, now);
  osc.frequency.linearRampToValueAtTime(125, now + 0.18);

  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.2);
}

export function playTinShakeSound(hasCotton: boolean, hasItems: boolean, muted: boolean) {
  if (muted) return;
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  if (!hasItems || hasCotton) {
    // Muffled dull thud (solid, silent tin!)
    [0, 0.14].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, now + offset);
      osc.frequency.exponentialRampToValueAtTime(55, now + offset + 0.08);
      gain.gain.setValueAtTime(0.12, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.1);
    });
  } else {
    // Metallic clattering rattle ("咔啦咔啦")
    [0, 0.08, 0.17, 0.26, 0.36, 0.44].forEach((offset, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(880 + (i % 3) * 310, now + offset);
      osc.frequency.exponentialRampToValueAtTime(320, now + offset + 0.045);
      gain.gain.setValueAtTime(0.08, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.055);
    });
  }
}

export function playMorseSOS(
  muted: boolean,
  onStep?: (index: number | null) => void
): () => void {
  // SOS: . . .   - - -   . . .
  const pattern = [
    0.1, 0.1, 0.1, // S
    0.3, 0.3, 0.3, // O
    0.1, 0.1, 0.1, // S
  ];
  const gaps = [0.1, 0.1, 0.28, 0.12, 0.12, 0.28, 0.1, 0.1, 0.2];

  const ctx = muted ? null : getCtx();
  const timers: number[] = [];
  let cursorMs = 0;

  pattern.forEach((durSec, idx) => {
    const startMs = cursorMs;
    const endMs = startMs + durSec * 1000;

    timers.push(
      window.setTimeout(() => {
        onStep?.(idx);
        if (ctx && !muted) {
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(780, now);
          gain.gain.setValueAtTime(0.14, now);
          gain.gain.setValueAtTime(0.14, now + durSec - 0.015);
          gain.gain.exponentialRampToValueAtTime(0.001, now + durSec);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + durSec + 0.01);
        }
      }, startMs)
    );

    timers.push(
      window.setTimeout(() => {
        onStep?.(-1);
      }, endMs)
    );

    cursorMs = endMs + gaps[idx] * 1000;
  });

  timers.push(
    window.setTimeout(() => {
      onStep?.(null);
    }, cursorMs + 80)
  );

  return () => {
    timers.forEach((t) => clearTimeout(t));
    onStep?.(null);
  };
}
