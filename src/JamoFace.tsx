// The Coming Soon design's JamoFace.jsx, typed: a port of dots/src/components/JamoFace.tsx reduced to
// the moods this page uses. Geometry, colors and timings are unchanged.
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

const CO = '#FF6B57', GR = '#23262B', WH = '#F5F7FB';

export type Mood = 'idle' | 'thinking' | 'working' | 'think2' | 'reply2' | 'confused' | 'happy' | 'wink' | 'celebrate' | 'surprised' | 'listening';
type EyeKind = 'round' | 'focus' | 'confused' | 'happy' | 'wink' | 'big' | 'listen';
type D2Phase = 'enter' | 'pop' | 'think' | 'settle' | 'check' | 'idle';
type Pt = [number, number];
/** CSS custom properties in style (--dx, --x, --y, --r). */
type Vars = CSSProperties & Record<`--${string}`, string>;

// One pointer tracker for every head on the page.
const ptr: { pt: Pt | null; subs: Set<() => void> } = { pt: null, subs: new Set() };
window.addEventListener('pointermove', (e) => { ptr.pt = [e.clientX, e.clientY]; ptr.subs.forEach((f) => f()); }, { passive: true });

const CFG: Record<Mood, { eyes?: EyeKind; track?: number; blink?: number; slowBlink?: number }> = {
  idle: { eyes: 'round', track: 1, blink: 1 }, thinking: { track: 0 }, working: { eyes: 'focus', track: 0 },
  think2: { eyes: 'round', track: 1, blink: 1 }, reply2: { eyes: 'round', track: 1, blink: 1 },
  confused: { eyes: 'confused', track: .7, blink: 1 }, happy: { eyes: 'happy', track: .5 }, wink: { eyes: 'wink', track: .9 },
  celebrate: { eyes: 'happy', track: .4 }, surprised: { eyes: 'big', track: 1 },
  listening: { eyes: 'listen', track: 0, blink: 1, slowBlink: 1 },
};
const BASE: Partial<Record<Mood, Pt>> = { working: [0, .01], celebrate: [0, -.02], happy: [0, -.015], listening: [0, 0] };
const MOUTHY: Partial<Record<Mood, 1>> = { happy: 1, celebrate: 1, wink: 1, surprised: 1 };
const HEAD_ANIM: Partial<Record<Mood, string>> = {
  happy: 'jamoHop 1.6s ease-in-out infinite', celebrate: 'jamoHop .8s ease-in-out infinite', thinking: 'jamoBob 1.4s ease-in-out infinite',
  surprised: 'jamoJolt 3s ease-out infinite', confused: 'jamoTilt 3s ease-in-out infinite', wink: 'jamoHop 2.4s ease-in-out infinite',
  listening: 'jamoListenSway 3.2s ease-in-out infinite',
};
const isD2 = (m: Mood) => m === 'think2' || m === 'reply2';

export function JamoFace(p: { mood: Mood; size: number; track?: boolean }) {
  const s = p.size || 112, mood: Mood = CFG[p.mood] ? p.mood : 'idle', cfg = CFG[mood], D2 = isD2(mood);
  const moodRef = useRef(mood); moodRef.current = mood;
  const trackOn = p.track !== false, persp = .12, kk = .75;
  const H = s * kk, Y = (v: number) => H / 2 + (v - s / 2) * kk, HR = Math.min(s * .32, H * .42);
  const ew = s * .16, eh = s * .22, EX = [s * .28, s * .56], EY = Y(s * .44) - eh / 2, bz = s * .055;
  const glow = '0 0 ' + (s * .06).toFixed(1) + 'px rgba(225,235,255,.55)';
  const root = useRef<HTMLDivElement>(null), look = useRef<HTMLDivElement>(null), wL = useRef<HTMLDivElement>(null), wR = useRef<HTMLDivElement>(null), bL = useRef<HTMLDivElement>(null), bR = useRef<HTMLDivElement>(null);
  const waveRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)], headRef = useRef<HTMLDivElement>(null), swap = useRef<HTMLDivElement>(null);
  const dr = [useRef<HTMLSpanElement>(null), useRef<HTMLSpanElement>(null), useRef<HTMLSpanElement>(null)];
  const [ph, setPh] = useState<D2Phase>('think');
  const phRef = useRef<D2Phase>('think'), applyRef = useRef<(() => void) | null>(null);

  // thinking dots → coral dot becomes the logo check
  useEffect(() => {
    if (!D2) return;
    const SEQ: Record<'think2' | 'reply2', [D2Phase, number][]> = { think2: [['enter', 450], ['pop', 380], ['think', Infinity]], reply2: [['settle', 380], ['check', 1250], ['idle', Infinity]] };
    let raf = 0, curM: Mood | null = null, t0 = 0, tb = performance.now(), envNow = 0, envFrom = 1;
    const sm = (v: number) => v <= 0 ? 0 : v >= 1 ? 1 : v * v * (3 - 2 * v), d = s * .143;
    const tick = () => {
      const mm = moodRef.current, now = performance.now();
      if (mm !== curM) { curM = mm; t0 = now; envFrom = envNow; }
      const seq = SEQ[mm as 'think2' | 'reply2'] || SEQ.think2;
      let x = now - t0, pp = seq[seq.length - 1][0];
      for (const [n, dur] of seq) { if (x < dur) { pp = n; break; } x -= dur; }
      if (pp !== phRef.current) {
        if (pp === 'think') tb = now;
        if (pp === 'settle' && phRef.current === 'think') envFrom = envNow;
        phRef.current = pp; setPh(pp); applyRef.current && applyRef.current();
      }
      if (pp === 'think' || pp === 'settle') {
        const env = pp === 'think' ? sm(x / 320) : envFrom * (1 - sm(x / 380)), tt = now - tb;
        envNow = env;
        dr.forEach((r, i) => {
          if (!r.current) return;
          const q = ((((tt - i * 150) % 900) + 900) % 900) / 900;
          const y = q < .3 ? sm(q / .3) : q < .6 ? 1 - sm((q - .3) / .3) : 0;
          r.current.style.transform = 'translateY(' + (-.45 * d * y * env).toFixed(2) + 'px)';
          r.current.style.opacity = (1 - (1 - (.6 + .4 * y)) * env).toFixed(3);
        });
        if (headRef.current) headRef.current.style.transform = 'translateY(' + (-(s * .027) * (.5 - .5 * Math.cos(2 * Math.PI * tt / 1400)) * env).toFixed(2) + 'px)';
      } else { envNow = 0; if (headRef.current && headRef.current.style.transform) headRef.current.style.transform = ''; }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [D2, s]);

  // pointer tracking + blinking
  useEffect(() => {
    const base = BASE[mood] || [0, 0];
    const apply = () => {
      if (!root.current || !look.current) return;
      const tr = trackOn ? (D2 && phRef.current !== 'idle' ? 0 : (cfg.track || 0)) : 0;
      let tx = base[0] * s, ty = base[1] * s, nx = base[0] ? Math.sign(base[0]) * .7 : 0;
      const pt = ptr.pt;
      if (tr && pt) {
        const r = root.current.getBoundingClientRect();
        const dx = pt[0] - (r.left + r.width / 2), dy = pt[1] - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 200), m = s * 0.1 * tr;
        tx += dx / d * m * k; ty += dy / d * m * k * .75;
        nx = Math.max(-1, Math.min(1, dx / 240)) * tr;
      }
      ty *= kk; if (MOUTHY[mood]) ty = Math.min(ty, (base[1] * s + s * .03) * kk);
      look.current.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px)';
      const fL = Math.max(0, nx) * persp, fR = Math.max(0, -nx) * persp;
      if (wL.current) wL.current.style.transform = 'scale(' + (1 - fL).toFixed(3) + ',' + (1 - fL * .35).toFixed(3) + ')';
      if (wR.current) wR.current.style.transform = 'scale(' + (1 - fR).toFixed(3) + ',' + (1 - fR * .35).toFixed(3) + ')';
    };
    applyRef.current = apply; apply();
    ptr.subs.add(apply);
    let t: ReturnType<typeof setTimeout> | undefined, alive = true;
    const set = (v: number) => [bL, bR].forEach((b) => b.current && (b.current.style.transform = 'scaleY(' + v + ')'));
    const slow = !!cfg.slowBlink;
    const blink = () => { if (!alive) return; set(.1); setTimeout(() => set(1), slow ? 260 : 120); t = setTimeout(blink, slow ? 5000 + Math.random() * 4000 : 2200 + Math.random() * 3000); };
    if (cfg.blink) t = setTimeout(blink, 800 + Math.random() * 2500);
    return () => { alive = false; ptr.subs.delete(apply); clearTimeout(t); };
  }, [mood, s, trackOn]);

  // listening waves (simulated level)
  useEffect(() => {
    if (mood !== 'listening') return;
    let raf = 0, cur = 0, last = performance.now();
    const g = { kind: 'pause', start: last, end: last + 200, amp: 0, left: 0 };
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const next = (now: number) => {
      if (g.kind === 'syl' && g.left > 0) g.left--;
      else if (g.kind === 'syl') { g.kind = 'pause'; g.start = now; g.end = now + (Math.random() < .15 ? rnd(550, 1000) : rnd(150, 400)); return; }
      else { g.kind = 'syl'; g.left = Math.floor(rnd(0, 3.99)); }
      g.amp = rnd(.35, .8); g.start = now; g.end = now + rnd(140, 320);
    };
    const tick = () => {
      const now = performance.now(), dt = Math.min(64, now - last); last = now;
      while (now >= g.end) next(g.end > now - 1000 ? g.end : now);
      let target = g.kind === 'syl' ? g.amp * Math.pow(Math.sin(Math.PI * (now - g.start) / (g.end - g.start)), .6) : 0;
      target = Math.max(target, .14 + .06 * Math.sin(now / 650));
      cur += (target - cur) * (1 - Math.exp(-dt / (target > cur ? 40 : 120)));
      waveRefs.forEach((r) => { if (r.current) { r.current.style.opacity = (.3 + .7 * cur).toFixed(3); r.current.style.transform = 'scale(' + (.75 + .4 * cur).toFixed(3) + ',' + (.65 + .5 * cur).toFixed(3) + ')'; } });
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [mood]);

  const prevMood = useRef(mood);
  useEffect(() => {
    const prev = prevMood.current; prevMood.current = mood;
    if (prev === mood || isD2(prev) || D2 || !swap.current || !swap.current.animate) return;
    swap.current.animate([{ opacity: .45, transform: 'scale(.94)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 180, easing: 'ease-out' });
  }, [mood]);

  const EYE_TR = 'transform .1s, clip-path .3s ease, left .45s cubic-bezier(.4,0,.2,1), top .45s cubic-bezier(.4,0,.2,1), width .45s cubic-bezier(.4,0,.2,1), height .45s cubic-bezier(.4,0,.2,1)';
  // The glow is a drop-shadow on a wrapper, so it follows the clipped shape; as a box-shadow on the
  // clipped element itself it was cut off at the eye's box and left square corners under the eye.
  // Chrome blurs a drop-shadow twice as wide as a box-shadow, hence half the glow's blur.
  const orb = (ref: typeof bL, left: number, top: number, w: number, h: number, clip?: string) => (
    <div key="c" ref={ref} style={{ position: 'absolute', left, top, width: w, height: h, filter: 'drop-shadow(0 0 ' + (s * .03).toFixed(1) + 'px rgba(225,235,255,.55))', transition: EYE_TR }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: ew, background: WH, clipPath: clip, transition: 'clip-path .3s ease' }} />
    </div>
  );
  const circ = (ref: typeof bL, sc?: number, clip?: string) => {
    sc = sc || 1; const w = ew * sc, hh = eh * sc;
    return orb(ref, (ew - w) / 2, (eh - hh) / 2, w, hh, clip);
  };
  const arc = (d: string) => (
    <svg key="a" width={ew * 1.5} height={ew * 1.5} viewBox="0 0 24 24" style={{ position: 'absolute', left: -ew * .25, top: eh / 2 - ew * .75, overflow: 'visible', filter: 'drop-shadow(0 0 ' + (s * .03).toFixed(1) + 'px rgba(225,235,255,.6))' }}>
      <path d={d} fill="none" stroke={WH} strokeWidth={4.6} strokeLinecap="round" />
    </svg>
  );
  const HAPPY = 'M3 15.5Q12 3.5 21 15.5';
  const P = (a: number, b: number) => 'polygon(0 ' + a + '%,100% ' + b + '%,100% 100%,0 100%)';
  const eyeInner = (L: boolean): ReactNode[] => {
    const b = L ? bL : bR;
    switch (D2 ? (ph === 'idle' ? 'round3' : 'dot3') : cfg.eyes) {
      case 'listen': return [circ(b, 1.12)];
      case 'round': return [circ(b)];
      case 'round3': return [circ(b, 1, P(0, 0))];
      case 'dot3': { const dd = s * .143, sh = L ? -.09 * s : -.17 * s, sv = H / 2 - (EY + eh / 2); return [orb(b, (ew - dd) / 2 + sh, (eh - dd) / 2 + sv, dd, dd, P(0, 0))]; }
      case 'big': return [circ(b, 1.25)];
      case 'confused': return [circ(b, L ? 1.12 : .74)];
      case 'focus': return [circ(b, 1, P(32, 32))];
      case 'happy': return [arc(HAPPY)];
      case 'wink': return L ? [circ(b)] : [arc(HAPPY)];
      default: return [];
    }
  };
  const eye = (L: boolean) => (
    <div key={L ? 'L' : 'R'} ref={L ? wL : wR} style={{ position: 'absolute', left: L ? EX[0] : EX[1], top: EY, width: ew, height: eh, transition: 'transform .2s ease-out' }}>{eyeInner(L)}</div>
  );

  const inHead: ReactNode[] = [
    <div key="screen" style={{ position: 'absolute', inset: bz, borderRadius: HR - bz, background: 'radial-gradient(120% 100% at 35% 25%, #2A2E35 0%, #15171B 65%, #0F1114 100%)', boxShadow: 'inset 0 ' + (s * .02).toFixed(1) + 'px ' + (s * .05).toFixed(1) + 'px rgba(0,0,0,.7)' }} />,
    <div key="look" ref={look} style={{ position: 'absolute', inset: 0, opacity: D2 && (ph === 'think' || ph === 'settle') ? 0 : 1, transition: D2 ? 'transform .16s ease-out' : 'transform .16s ease-out, opacity .25s ease' }}>
      <div style={{ position: 'absolute', inset: 0, animation: mood === 'working' ? 'jamoScan 2.6s ease-in-out infinite' : 'none' }}>{eye(true)}{eye(false)}</div>
    </div>,
  ];
  if (mood === 'thinking') inHead.push(
    <div key="dots" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: s * .07 }}>
      {[0, 1, 2].map((i) => <span key={i} style={{ width: s * .13, height: s * .13, borderRadius: '50%', background: i === 2 ? CO : WH, boxShadow: i === 2 ? '0 0 ' + (s * .05).toFixed(1) + 'px rgba(255,107,87,.7)' : glow, animation: 'jamoBounce .9s ' + (i * .15) + 's infinite ease-in-out' }} />)}
    </div>,
  );
  if (D2) {
    const d = s * .143, k = d / 20, cy = H / 2, xs = [.27 * s, .47 * s, .67 * s];
    if (ph !== 'idle' && ph !== 'enter') inHead.push(
      <div key="dots2" style={{ position: 'absolute', inset: 0 }}>
        {xs.map((x, i) => <span key={i} ref={dr[i]} style={{ position: 'absolute', left: x - d / 2, top: cy - d / 2, width: d, height: d, borderRadius: '50%', background: i === 2 ? CO : WH, boxShadow: i === 2 ? '0 0 ' + (s * .05).toFixed(1) + 'px rgba(255,107,87,.7)' : glow, opacity: (ph === 'check' || ph === 'pop') && i < 2 ? 0 : undefined, transform: ph === 'check' && i === 2 ? 'scale(0)' : undefined, transition: ph === 'check' ? 'transform .2s ease-in' : 'none', animation: ph === 'pop' && i === 2 ? 'jamoBulk .38s cubic-bezier(.3,1.4,.5,1) both' : 'none' }} />)}
      </div>,
    );
    if (ph === 'check') {
      const c2 = xs[1], C = [c2 + 22 * k, cy], M = [c2 + 31 * k, cy + 10 * k], E = [c2 + 47 * k, cy - 10 * k];
      inHead.push(
        <svg key="d2chk" width={s} height={H} viewBox={'0 0 ' + s + ' ' + H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: 'drop-shadow(0 0 ' + (s * .03).toFixed(1) + 'px rgba(255,107,87,.75))' }}>
          <path d={'M ' + C.join(' ') + ' L ' + M.join(' ') + ' L ' + E.join(' ')} fill="none" stroke={CO} strokeWidth={10 * k} strokeLinecap="round" strokeLinejoin="round" pathLength={24} style={{ strokeDasharray: 24, animation: 'jamoDraw .4s .1s ease-out both' }} />
        </svg>,
      );
    }
  }
  if (mood === 'working') {
    const W = s - bz * 2, Wy = H - bz * 2;
    inHead.push(
      <svg key="trace" width={W} height={Wy} viewBox={'0 0 ' + W + ' ' + Wy} style={{ position: 'absolute', left: bz, top: bz, overflow: 'visible', filter: 'drop-shadow(0 0 ' + (s * .03).toFixed(1) + 'px rgba(255,107,87,.8))' }}>
        <rect x={1.5} y={1.5} width={W - 3} height={Wy - 3} rx={HR - bz - 1.5} fill="none" stroke={CO} strokeWidth={Math.max(2, s * .03)} strokeLinecap="round" pathLength={100} strokeDasharray="22 78" style={{ animation: 'jamoTrace 1.3s linear infinite' }} />
      </svg>,
    );
  }
  if (mood === 'happy' || mood === 'celebrate' || mood === 'wink') {
    const op = mood === 'wink' ? .55 : .9;
    [.15, .7].forEach((x, i) => inHead.push(<div key={'bl' + i} style={{ position: 'absolute', left: x * s, top: Y(.63 * s), width: .15 * s, height: .07 * s, borderRadius: '50%', background: CO, opacity: op, filter: 'blur(' + (s * .008).toFixed(1) + 'px)' }} />));
  }
  inHead.push(<div key="sheen" style={{ position: 'absolute', inset: 0, borderRadius: HR, background: 'linear-gradient(160deg, rgba(255,255,255,.16) 0%, rgba(255,255,255,0) 30%)', pointerEvents: 'none' }} />);

  const outer: ReactNode[] = [];
  if (mood === 'listening') [-1, 1].forEach((side, si) => {
    const ww = s * .3, hh2 = s * .44;
    outer.push(
      <div key={'wv' + si} ref={waveRefs[si]} style={{ position: 'absolute', top: H / 2 - hh2 / 2, height: hh2, width: ww, left: side < 0 ? -ww - s * .02 : s + s * .02, transformOrigin: side < 0 ? '100% 50%' : '0 50%', pointerEvents: 'none', opacity: .4, filter: 'drop-shadow(0 0 ' + (s * .025).toFixed(1) + 'px rgba(255,107,87,.7))' }}>
        {[0, 1, 2].map((i) => (
          <svg key={i} width={ww * .42} height={hh2} viewBox="0 0 12 40" style={{ position: 'absolute', top: 0, [side < 0 ? 'right' : 'left']: 0, '--dx': (side * ww * .65).toFixed(1) + 'px', animation: 'jamoListenIn 1.5s ' + (i * .5) + 's ease-in infinite', opacity: 0 } as Vars}>
            <path d={side < 0 ? 'M3 4 Q11 20 3 36' : 'M9 4 Q1 20 9 36'} fill="none" stroke={CO} strokeWidth={2.6} strokeLinecap="round" />
          </svg>
        ))}
      </div>,
    );
  });
  if (mood === 'confused') outer.push(<div key="q" style={{ position: 'absolute', left: s * .88, top: -s * .24, fontSize: s * .34, fontWeight: 800, color: CO, lineHeight: 1, animation: 'jamoWobble 1.6s ease-in-out infinite', transformOrigin: '50% 90%' }}>?</div>);
  if (mood === 'wink') outer.push(
    <svg key="sp" width={s * .22} height={s * .22} viewBox="0 0 24 24" style={{ position: 'absolute', right: -s * .14, top: -s * .08, animation: 'jamoTwinkle 2.2s ease-in-out infinite' }}>
      <path d="M12 1l2.6 8.4L23 12l-8.4 2.6L12 23l-2.6-8.4L1 12l8.4-2.6z" fill={CO} />
    </svg>,
  );
  if (mood === 'celebrate') {
    const cols = [CO, GR, '#FFC2B6', CO];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2, dist = s * (.7 + (i % 3) * .15);
      outer.push(<div key={'cf' + i} style={{ position: 'absolute', left: s * .5, top: s * .3, width: s * .05, height: s * .085, borderRadius: 2, background: cols[i % 4], '--x': (Math.cos(a) * dist).toFixed(1) + 'px', '--y': (Math.sin(a) * dist - s * .2).toFixed(1) + 'px', '--r': (i % 2 ? 260 : -220) + 'deg', animation: 'jamoConfetti 1.6s ' + ((i % 4) * .12) + 's ease-out infinite', opacity: 0 } as Vars} />);
    }
  }

  const headStyle: CSSProperties = {
    position: 'relative', width: s, height: H, borderRadius: HR, overflow: 'hidden',
    background: 'linear-gradient(155deg,#5A5F68 0%,#33373E 38%,#1E2024 100%)',
    boxShadow: '0 ' + (s * .09).toFixed(1) + 'px ' + (s * .14).toFixed(1) + 'px -' + (s * .05).toFixed(1) + 'px rgba(35,38,43,.5), inset 0 1px 1px rgba(255,255,255,.35), inset 0 -2px 3px rgba(0,0,0,.35)',
    animation: D2 ? (ph === 'check' ? 'jamoPop .45s ease-out' : 'none') : (HEAD_ANIM[mood] || 'none'), transition: 'box-shadow .3s',
  };
  return (
    <div ref={root} data-jamo-face={mood} style={{ position: 'relative', width: s, height: H, flexShrink: 0, lineHeight: 'normal' }}>
      <div ref={swap} style={{ position: 'absolute', inset: 0 }}>
        <div ref={headRef} style={headStyle}>{inHead}</div>
        {outer}
      </div>
    </div>
  );
}
