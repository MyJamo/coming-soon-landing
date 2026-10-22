// Jamo's flight between margin notes and the arrow each note points with (src/landings/sky-jamo/notes.tsx).
// It is plain DOM code: it began shared with the review's Angular options.

type Pt = { x: number; y: number };
type Box = { left: number; top: number; right: number; bottom: number };
type Sample = { t: number; x: number; y: number; body: string };

/** The tricks Jamo takes turns with: a loop-the-loop with a full spin, or a corkscrew with a barrel roll. */
type Trick = 'loop' | 'corkscrew';

const SIZE = 58;
const STEPS = 90;
const CORAL = '#ff6b57';
const SPARKS = ['#ff6b57', '#ffb199', '#c9b6ff', '#ffffff'];

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smooth = (u: number) => u * u * (3 - 2 * u);
const easeInOut = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

function bezier(a: Pt, b: Pt, c: Pt, d: Pt, p: number): Pt {
  const q = 1 - p;
  return {
    x: q * q * q * a.x + 3 * q * q * p * b.x + 3 * q * p * p * c.x + p * p * p * d.x,
    y: q * q * q * a.y + 3 * q * q * p * b.y + 3 * q * p * p * c.y + p * p * p * d.y,
  };
}

/**
 * Moves Jamo between notes. `carrier` holds only Jamo's position (a translate), `body` inside it
 * takes the tilt, spin and squash, so the position can always be read back mid-flight. A new note
 * gets the whole flight: a crouch, an S-shaped swing out with a trick in the middle, a sparkle trail,
 * and a squash and bounce on landing. The same note moved by a relayout is a plain jump.
 */
export class JamoFlight {
  private key: string | null = null;
  private at: Pt | null = null;
  private target: Pt | null = null;
  private anims: Animation[] = [];
  private raf = 0;
  private flights = 0;

  constructor(
    readonly carrier: HTMLElement,
    private readonly body: HTMLElement,
    private readonly onFlying: (flying: boolean) => void = () => {},
    /** Called with the note's key once Jamo is standing at it: on arrival, or at once when it is placed there. */
    private readonly onLand: (key: string) => void = () => {},
  ) {}

  /** Puts Jamo at the note `key`, at (x, y) in the layer's coordinates: a flight when the note is a new one. */
  go(key: string, x: number, y: number): void {
    const to = { x, y };
    const fresh = key !== this.key;
    this.key = key;
    this.target = to;
    if (!this.at || reduced()) {
      this.place(to);
      this.onLand(key);
      return;
    }
    if (!fresh) {
      // A relayout under the same note: a flight in progress lands on the new spot when it ends.
      if (!this.anims.length) this.place(to);
      return;
    }
    this.fly(this.now(), to);
  }

  /** Stops any flight and clears its trail. */
  stop(): void {
    this.halt();
    this.onFlying(false);
  }

  /** Where Jamo is drawn right now; mid-flight that is wherever the carrier's animation has it. */
  private now(): Pt {
    if (!this.anims.length) return this.at!;
    const m = new DOMMatrixReadOnly(getComputedStyle(this.carrier).transform);
    return { x: m.m41, y: m.m42 };
  }

  private place(p: Pt): void {
    this.halt();
    this.at = p;
    this.carrier.style.transform = `translate(${p.x}px, ${p.y}px)`;
    this.body.style.transform = '';
  }

  private halt(): void {
    this.anims.forEach((a) => a.cancel());
    this.anims = [];
    cancelAnimationFrame(this.raf);
  }

  private fly(from: Pt, to: Pt): void {
    // A flight cut short by the next note goes on without crouching again.
    const midair = this.anims.length > 0;
    this.halt();
    const trick: Trick = this.flights++ % 2 ? 'corkscrew' : 'loop';
    const layer = this.carrier.parentElement;
    const bound = layer ? layer.clientWidth - SIZE : Infinity;
    const samples = path(from, to, trick, midair, bound);
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const duration = clamp(1150 + dist * 0.45, 1300, 2400);

    this.at = to;
    this.carrier.style.transform = `translate(${to.x}px, ${to.y}px)`;
    this.body.style.transform = '';
    const carrier = this.carrier.animate(
      samples.map((s) => ({ offset: s.t, transform: `translate(${s.x}px, ${s.y}px)` })),
      { duration, easing: 'linear' },
    );
    const body = this.body.animate(samples.map((s) => ({ offset: s.t, transform: s.body })), { duration, easing: 'linear' });
    this.anims = [carrier, body];
    this.onFlying(true);

    const start = performance.now();
    let last = 0;
    const tick = (now: number) => {
      const t = (now - start) / duration;
      if (t >= 1) return;
      if (layer && now - last > 26 && t > 0.08 && t < 0.86) {
        last = now;
        const p = sampleAt(samples, t);
        spark(layer, p.x + SIZE / 2, p.y + SIZE / 2);
      }
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);

    const key = this.key;
    carrier.onfinish = () => {
      if (!this.anims.includes(carrier)) return;
      this.anims = [];
      if (key) this.onLand(key);
      if (layer) ring(layer, to.x + SIZE / 2, to.y + SIZE / 2);
      // The note may have moved while Jamo was in the air.
      if (this.target && (this.target.x !== to.x || this.target.y !== to.y)) this.place(this.target);
      this.onFlying(false);
    };
  }
}

/** The flight as keyframes: where the carrier is and what the body does, at each of STEPS moments. */
function path(a: Pt, b: Pt, trick: Trick, midair: boolean, bound: number): Sample[] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy) || 1;
  const n = { x: -dy / dist, y: dx / dist };
  const side = Math.random() < 0.5 ? -1 : 1;
  const swing = clamp(dist * 0.6, 160, 560) * side;
  const c1 = { x: a.x + dx * 0.2 + n.x * swing, y: a.y + dy * 0.2 + n.y * swing };
  const c2 = { x: a.x + dx * 0.8 - n.x * swing, y: a.y + dy * 0.8 - n.y * swing };
  const fwd = dx < 0 ? -1 : 1;
  const r = clamp(dist * 0.07, 42, 78);
  const crouch = midair ? 0 : 0.1;
  const land = 0.86;

  const raw: { t: number; p: Pt; spin: number; roll: number; squash: number; dip: number }[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    if (t < crouch) {
      // Gathers itself, low and wide, before it jumps.
      const c = Math.sin((t / crouch) * Math.PI * 0.5);
      raw.push({ t, p: { ...a }, spin: 0, roll: 1, squash: 0.2 * c, dip: 6 * c });
      continue;
    }
    if (t > land) {
      // Hits the note, squashes, and wobbles still.
      const u = (t - land) / (1 - land);
      const k = Math.sin(u * Math.PI * 2.5) * Math.exp(-3.2 * u) * 0.26;
      raw.push({ t, p: { ...b }, spin: 0, roll: 1, squash: k, dip: 0 });
      continue;
    }
    const p = easeInOut((t - crouch) / (land - crouch));
    const pt = bezier(a, c1, c2, b, p);
    let spin = 0;
    let roll = 1;
    if (trick === 'loop') {
      const u = clamp((p - 0.36) / 0.3, 0, 1);
      const th = smooth(u) * Math.PI * 2;
      pt.x += fwd * r * Math.sin(th);
      pt.y -= r * (1 - Math.cos(th));
      spin = -fwd * 360 * smooth(u);
    } else {
      const env = Math.sin(p * Math.PI);
      const w = Math.sin(p * Math.PI * 6) * 34 * env;
      pt.x += n.x * w;
      pt.y += n.y * w;
      roll = Math.cos(smooth(clamp((p - 0.2) / 0.6, 0, 1)) * Math.PI * 4);
    }
    pt.x = clamp(pt.x, 0, bound);
    raw.push({ t, p: pt, spin, roll, squash: 0, dip: 0 });
  }

  // Leans into the way it is going and stretches with its speed.
  const speeds = raw.map((_, i) => {
    const q = raw[Math.min(i + 1, raw.length - 1)].p;
    const o = raw[Math.max(i - 1, 0)].p;
    return { vx: q.x - o.x, vy: q.y - o.y };
  });
  const top = Math.max(1, ...speeds.map((v) => Math.hypot(v.vx, v.vy)));
  return raw.map((s, i) => {
    const { vx, vy } = speeds[i];
    const v = Math.hypot(vx, vy) / top;
    const ang = (Math.atan2(vy, vx) * 180) / Math.PI;
    const tilt = clamp((vx / (Math.hypot(vx, vy) || 1)) * 28 * v, -28, 28);
    const st = 1 + 0.28 * v;
    const body = [
      `translateY(${s.dip.toFixed(1)}px)`,
      `rotate(${ang.toFixed(1)}deg) scale(${st.toFixed(3)}, ${(1 / st).toFixed(3)}) rotate(${(-ang).toFixed(1)}deg)`,
      `rotate(${(tilt + s.spin).toFixed(1)}deg)`,
      `scale(${((1 + s.squash) * s.roll).toFixed(3)}, ${(1 - s.squash).toFixed(3)})`,
    ].join(' ');
    return { t: s.t, x: s.p.x, y: s.p.y, body };
  });
}

function sampleAt(samples: Sample[], t: number): Pt {
  const i = clamp(Math.floor(t * STEPS), 0, STEPS - 1);
  const a = samples[i];
  const b = samples[i + 1];
  const u = (t - a.t) / (b.t - a.t || 1);
  return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
}

/** One spark of the trail, left where Jamo was; it drifts down and goes out. */
function spark(layer: HTMLElement, x: number, y: number): void {
  const el = document.createElement('i');
  const s = 4 + Math.random() * 6;
  const color = SPARKS[Math.floor(Math.random() * SPARKS.length)];
  Object.assign(el.style, {
    position: 'absolute', left: `${x + (Math.random() - 0.5) * 18}px`, top: `${y + (Math.random() - 0.5) * 18}px`,
    width: `${s}px`, height: `${s}px`, borderRadius: '50%', background: color, pointerEvents: 'none',
    boxShadow: `0 0 ${s * 1.6}px ${color}`, zIndex: '-1',
  });
  layer.append(el);
  el.animate(
    [
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.95 },
      { transform: `translate(-50%, calc(-50% + ${8 + Math.random() * 14}px)) scale(0)`, opacity: 0 },
    ],
    { duration: 600 + Math.random() * 400, easing: 'cubic-bezier(.2,.7,.3,1)' },
  ).onfinish = () => el.remove();
}

/** The ring that spreads where Jamo lands. */
function ring(layer: HTMLElement, x: number, y: number): void {
  const el = document.createElement('i');
  Object.assign(el.style, {
    position: 'absolute', left: `${x}px`, top: `${y}px`, width: `${SIZE + 12}px`, height: `${SIZE + 12}px`,
    borderRadius: '50%', border: `2px solid ${CORAL}`, pointerEvents: 'none', zIndex: '-1',
  });
  layer.append(el);
  el.animate(
    [
      { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 0.9 },
      { transform: 'translate(-50%, -50%) scale(1.7)', opacity: 0 },
    ],
    { duration: 620, easing: 'cubic-bezier(.2,.7,.3,1)' },
  ).onfinish = () => el.remove();
}

const box = (r: DOMRect, o: DOMRect): Box => ({ left: r.left - o.left, top: r.top - o.top, right: r.right - o.left, bottom: r.bottom - o.top });

/** The visible extent of an element's text, or its box when it has none (a window, a card). */
export function inkOf(el: Element): DOMRect {
  const range = document.createRange();
  range.selectNodeContents(el);
  const ink = range.getBoundingClientRect();
  return ink.width && ink.height && el.textContent?.trim() ? ink : el.getBoundingClientRect();
}

/**
 * The hand-drawn arrow from a note to what it is about, as a path in the note's own coordinates.
 * It leaves the note on the side that faces `target` (Jamo's spot and the handwriting, together),
 * bows a little, and stops short of the target, at most `max` pixels out. Empty when they overlap.
 */
export function arrowPath(note: HTMLElement, hand: Element, target: DOMRect, max = 120): string {
  const o = note.getBoundingClientRect();
  const h = box(inkOf(hand), o);
  // Jamo's spot is the note's top-left corner, where it stands while the note is the current one.
  const ink: Box = { left: Math.min(h.left, 0), top: Math.min(h.top, -4), right: Math.max(h.right, SIZE), bottom: Math.max(h.bottom, SIZE - 4) };
  const t = box(target, o);
  const c = { x: (ink.left + ink.right) / 2, y: (ink.top + ink.bottom) / 2 };
  const near = (b: Box, p: Pt): Pt => ({ x: clamp(p.x, b.left, b.right), y: clamp(p.y, b.top, b.bottom) });
  const aim = near(t, c);
  let dx = aim.x - c.x;
  let dy = aim.y - c.y;
  const d = Math.hypot(dx, dy);
  if (d < 1) return '';
  dx /= d;
  dy /= d;
  // Where the line from the middle leaves the ink, plus a gap.
  const hw = (ink.right - ink.left) / 2;
  const hh = (ink.bottom - ink.top) / 2;
  const exit = Math.min(Math.abs(dx) > 1e-6 ? hw / Math.abs(dx) : Infinity, Math.abs(dy) > 1e-6 ? hh / Math.abs(dy) : Infinity);
  const s = { x: c.x + dx * (exit + 10), y: c.y + dy * (exit + 10) };
  let e = near(t, s);
  let ex = e.x - s.x;
  let ey = e.y - s.y;
  let len = Math.hypot(ex, ey);
  if (len < 8 || (s.x >= t.left && s.x <= t.right && s.y >= t.top && s.y <= t.bottom)) return '';
  const reach = clamp(len - 12, 36, max);
  ex /= len;
  ey /= len;
  e = { x: s.x + ex * reach, y: s.y + ey * reach };
  len = reach;
  // A pencil arrow bows; this one bows upward, whichever way it points.
  let px = -ey;
  let py = ex;
  if (py > 0 || (py === 0 && px < 0)) {
    px = -px;
    py = -py;
  }
  const bow = len * 0.22;
  const q = { x: (s.x + e.x) / 2 + px * bow, y: (s.y + e.y) / 2 + py * bow };
  // The head follows the curve's last direction, one barb a touch longer than the other.
  let tx = e.x - q.x;
  let ty = e.y - q.y;
  const tl = Math.hypot(tx, ty) || 1;
  tx /= tl;
  ty /= tl;
  const barb = (deg: number, l: number) => {
    const a = (deg * Math.PI) / 180;
    const bx = tx * Math.cos(a) - ty * Math.sin(a);
    const by = tx * Math.sin(a) + ty * Math.cos(a);
    return `M${e.x.toFixed(1)} ${e.y.toFixed(1)} l${(-bx * l).toFixed(1)} ${(-by * l).toFixed(1)}`;
  };
  const f = (p: Pt) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  return `M${f(s)} Q${f(q)} ${f(e)} ${barb(32, 10)} ${barb(-26, 8)}`;
}
