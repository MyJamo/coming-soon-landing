// Option 03's margin notes over option 02's day. Each note is written beside the thing it is about
// (the card Jamo made, the window, the phone) and its arrow points at that thing. Nothing is drawn
// before Jamo gets there: Jamo flies to the note of the section being read, and only once it has
// landed does it say the note, on a glass pane beside it, and draw the arrow. The arrow is drawn while
// Jamo stands at its note and rubbed out when it flies on; the pane stays. On a narrow screen there is
// no room in the margin: Jamo sits in the corner and says the note in a bubble.
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { JamoFace, type Mood } from '../../JamoFace';
import { JamoFlight } from '../../shared/jamo-flight';

type Side = 'left' | 'right' | 'below' | 'above';

export type NoteSpec = {
  id: string;
  text: string;
  mood: Mood;
  /** What the note is about: the arrow points at it. */
  aim: string;
  /** The box the note is placed beside, if not `aim`'s. */
  at?: string;
  /** Where around that box to write, in order of preference; the first that fits on the page is used. */
  sides: Side[];
  /** Along the box's edge, where the note's middle goes: 0 is the start, 1 the end. 0.5 by default. */
  along?: number;
  /**
   * Beside something one line tall, Jamo stands level with it and the arrow runs straight out of Jamo,
   * the pane hanging below; otherwise the whole note is centred on it and the arrow leaves the note.
   */
  level?: boolean;
  /** Which way the arrow bows: 1 or -1. By default it is picked from the arrow's direction. */
  bend?: 1 | -1;
  dx?: number;
  dy?: number;
};

type Placed = NoteSpec & { x: number; y: number; w: number; stack: boolean };

const SIZE = 58;
/** Jamo's middle, below the note's top: it is drawn 4px above it and its face is three quarters as tall as wide. */
const MID = SIZE * 0.375 - 4;
const GAP = 28;
/** Beside a box, the arrow needs room to be an arrow. */
const SIDE_GAP = 60;
const WIDE_W = 330;
const MIN_W = 210;
const EDGE = 16;
const WIDE = 1100;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function JamoNotes({ page, notes, mood }: { page: RefObject<HTMLElement | null>; notes: NoteSpec[]; mood?: Mood | null }) {
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [landed, setLanded] = useState<string | null>(null);
  const [written, setWritten] = useState<ReadonlySet<string>>(new Set());
  const [dock, setDock] = useState(false);
  const [flying, setFlying] = useState(false);
  // Bumped by every layout pass: what an arrow points at can move (a reveal, a resize) while its note stays put.
  const [measured, setMeasured] = useState(0);
  const layer = useRef<HTMLDivElement>(null);
  const carrier = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const flight = useRef<JamoFlight | null>(null);

  // A passive effect: the page's ref is attached after its children's layout effects run.
  useEffect(() => {
    const root = page.current;
    if (!root) return;
    let raf = 0, relayout = 0, soon = 0;
    let spots: Placed[] = [];
    let rootTop = 0;
    const probe = document.createElement('div');
    probe.className = 'skj-note skj-probe';
    probe.innerHTML = '<span class="skj-say"></span>';
    root.append(probe);

    /** How tall a note is at a width, laid out wide (Jamo beside the pane) or stacked (Jamo above it). */
    const size = (text: string, w: number, stack: boolean) => {
      probe.classList.toggle('stack', stack);
      probe.style.width = `${w}px`;
      probe.firstElementChild!.textContent = text;
      return probe.offsetHeight;
    };

    const layout = () => {
      relayout = 0;
      const o = root.getBoundingClientRect();
      rootTop = o.top + scrollY;
      const narrow = innerWidth < WIDE;
      setDock(narrow);
      if (narrow) { spots = []; setPlaced([]); pick(); return; }
      const right = o.width - EDGE;
      const next: Placed[] = [];
      for (const n of notes) {
        const el = root.querySelector(n.at ?? n.aim);
        if (!el || !root.querySelector(n.aim)) continue;
        const r = el.getBoundingClientRect();
        const b = { left: r.left - o.left, right: r.right - o.left, top: r.top - o.top, bottom: r.bottom - o.top };
        const k = n.along ?? 0.5;
        for (const side of n.sides) {
          // The room on that side decides the note's width, and whether Jamo stands beside the text or over it.
          const room = side === 'left' ? b.left - SIDE_GAP - EDGE : side === 'right' ? right - b.right - SIDE_GAP : right - EDGE;
          const w = Math.min(WIDE_W, room);
          if (w < MIN_W) continue;
          const stack = w < 300;
          const h = size(n.text, w, stack);
          let x: number, y: number;
          if (side === 'left' || side === 'right') {
            x = side === 'left' ? b.left - SIDE_GAP - w : b.right + SIDE_GAP;
            y = b.top + (b.bottom - b.top) * k - (n.level ? MID : h / 2);
          } else {
            x = clamp(b.left + (b.right - b.left) * k - w / 2, EDGE, right - w);
            y = side === 'below' ? b.bottom + GAP : b.top - GAP - h;
          }
          next.push({ ...n, x: Math.round(x + (n.dx ?? 0)), y: Math.round(y + (n.dy ?? 0)), w: Math.round(w), stack });
          break;
        }
      }
      spots = next;
      setPlaced((prev) => same(prev, next) ? prev : next);
      setMeasured((m) => m + 1);
      pick();
    };

    const pick = () => {
      raf = 0;
      // A note becomes Jamo's once it is well up the screen; until the first one, Jamo waits at it.
      const line = scrollY + innerHeight * 0.8;
      // In the dock a note belongs to its section: what it points at may not be drawn on a phone at all.
      const pool = dockMode()
        ? notes.map((n) => ({ id: n.id, y: (root.querySelector(n.at ?? n.aim)?.closest('section')?.getBoundingClientRect().top ?? Infinity) + scrollY })).sort((a, b) => a.y - b.y)
        : spots.map((s) => ({ id: s.id, y: rootTop + s.y })).sort((a, b) => a.y - b.y);
      if (!pool.length) return;
      let cur = pool[0].id;
      for (const n of pool) if (n.y < line) cur = n.id;
      setActive(cur);
    };
    const dockMode = () => innerWidth < WIDE;

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(pick); };
    const onLayout = () => {
      // Layout reads every note's box: at most every 120 ms while things keep moving, and once after.
      if (relayout || soon) return;
      relayout = requestAnimationFrame(layout);
      soon = window.setTimeout(() => { soon = 0; relayout = relayout || requestAnimationFrame(layout); }, 120);
    };
    // A section rising into place as it is revealed moves its note and whatever the note points at.
    const onSettle = (e: TransitionEvent) => { if (e.propertyName === 'transform' && (e.target as Element).matches('[data-reveal]')) onLayout(); };
    root.addEventListener('transitionend', onSettle);
    layout();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onLayout);
    document.fonts?.ready.then(onLayout);
    const ro = new ResizeObserver(onLayout);
    ro.observe(root);
    const late = setTimeout(onLayout, 1600);
    return () => {
      removeEventListener('scroll', onScroll); removeEventListener('resize', onLayout); root.removeEventListener('transitionend', onSettle);
      ro.disconnect(); clearTimeout(late); clearTimeout(soon); cancelAnimationFrame(raf); cancelAnimationFrame(relayout); probe.remove();
    };
  }, [page, notes]);

  const current = notes.find((n) => n.id === active);
  const here = placed.find((n) => n.id === active);
  const face: Mood = mood ?? (flying ? 'surprised' : current?.mood ?? 'idle');

  // Jamo flies to the current note; the carrier is new whenever the margin comes back from the dock.
  useLayoutEffect(() => {
    if (!here || !carrier.current || !body.current) return;
    if (flight.current?.carrier !== carrier.current) {
      flight.current?.stop();
      flight.current = new JamoFlight(carrier.current, body.current, (f) => { setFlying(f); if (f) setLanded(null); }, (id) => {
        setLanded(id);
        setWritten((w) => (w.has(id) ? w : new Set([...w, id])));
      });
    }
    flight.current.go(here.id, here.x, here.y - 4);
  }, [here?.id, here?.x, here?.y, dock]);
  useEffect(() => () => flight.current?.stop(), []);

  // Each arrow aims at what its note is about, measured where both now are.
  useLayoutEffect(() => {
    const root = page.current;
    if (!root || !layer.current) return;
    for (const n of placed) {
      const el = layer.current.querySelector<HTMLElement>(`[data-note="${n.id}"]`);
      const say = el?.querySelector<HTMLElement>('.skj-say');
      const path = el?.querySelector('path');
      const target = root.querySelector(n.aim);
      if (!el || !say || !path || !target) continue;
      path.setAttribute('d', pencilArrow(el, say, target.getBoundingClientRect(), n.bend, n.level));
    }
  }, [placed, page, measured, landed]);

  if (dock) {
    return current ? (
      <div className="skj-dock" aria-hidden="true">
        <div className="skj-dock-jamo"><JamoFace mood={face} size={48} /></div>
        <div key={current.id + current.text} className="skj-say skj-bubble">{current.text}</div>
      </div>
    ) : null;
  }
  return (
    <div className="skj-notes" aria-hidden="true" ref={layer}>
      {placed.map((n) => (
        <div key={n.id} data-note={n.id}
          className={'skj-note' + (n.stack ? ' stack' : '') + (written.has(n.id) ? ' seen' : '') + (landed === n.id ? ' here' : '')}
          style={{ left: n.x, top: n.y, width: n.w }}>
          <svg className="skj-arrow"><path pathLength={1} /></svg>
          <span key={n.text} className="skj-say">{n.text}</span>
        </div>
      ))}
      {here && <div className="skj-jamo" ref={carrier}><div className="skj-jamo-body" ref={body}><JamoFace mood={face} size={SIZE} /></div></div>}
    </div>
  );
}

const same = (a: Placed[], b: Placed[]) =>
  a.length === b.length && a.every((p, i) => p.id === b[i].id && p.x === b[i].x && p.y === b[i].y && p.w === b[i].w && p.text === b[i].text);

type Pt = { x: number; y: number };
type Box = { left: number; top: number; right: number; bottom: number };

/**
 * A pencil arrow from a note to what it is about, as a path in the note's own coordinates. It leaves
 * the note (Jamo's spot and the pane together) on the side facing the target, heads for a point
 * a little inside the target's nearest edge, so it points into the thing rather than at its corner,
 * bows gently to one side, and stops just short of it with a two-barbed head. Empty when they overlap.
 * With `fromJamo` it leaves Jamo alone, not the note.
 */
export function pencilArrow(note: HTMLElement, say: HTMLElement, target: DOMRect, bend?: 1 | -1, fromJamo?: boolean): string {
  const o = note.getBoundingClientRect();
  const rel = (r: DOMRect): Box => ({ left: r.left - o.left, top: r.top - o.top, right: r.right - o.left, bottom: r.bottom - o.top });
  // The pane's layout box, not its rect: it may still be springing open when the arrow is measured.
  const h: Box = { left: say.offsetLeft, top: say.offsetTop, right: say.offsetLeft + say.offsetWidth, bottom: say.offsetTop + say.offsetHeight };
  // Jamo's spot is the note's top-left corner, where it stands while the note is the current one.
  const ink: Box = fromJamo
    ? { left: 0, top: -4, right: SIZE, bottom: SIZE * 0.75 - 4 }
    : { left: Math.min(h.left, 0), top: Math.min(h.top, -4), right: Math.max(h.right, SIZE), bottom: Math.max(h.bottom, SIZE - 4) };
  const t = rel(target);
  const c = { x: (ink.left + ink.right) / 2, y: (ink.top + ink.bottom) / 2 };
  const tc = { x: (t.left + t.right) / 2, y: (t.top + t.bottom) / 2 };
  const near = { x: clamp(c.x, t.left, t.right), y: clamp(c.y, t.top, t.bottom) };
  const aim = { x: near.x + (tc.x - near.x) * 0.3, y: near.y + (tc.y - near.y) * 0.3 };
  let ux = aim.x - c.x, uy = aim.y - c.y;
  const d = Math.hypot(ux, uy);
  if (d < 1) return '';
  ux /= d; uy /= d;
  // Out of the ink along that line, plus a gap.
  const exit = Math.min(Math.abs(ux) > 1e-6 ? (ink.right - ink.left) / 2 / Math.abs(ux) : Infinity, Math.abs(uy) > 1e-6 ? (ink.bottom - ink.top) / 2 / Math.abs(uy) : Infinity);
  const s = { x: c.x + ux * (exit + 8), y: c.y + uy * (exit + 8) };
  if (s.x >= t.left && s.x <= t.right && s.y >= t.top && s.y <= t.bottom) return '';
  // Where that line meets the target's box, less a gap.
  const enter = Math.max(
    ux > 0 ? (t.left - s.x) / ux : ux < 0 ? (t.right - s.x) / ux : -Infinity,
    uy > 0 ? (t.top - s.y) / uy : uy < 0 ? (t.bottom - s.y) / uy : -Infinity,
  );
  const len = Math.max(enter - 10, 0);
  if (len < 22) return '';
  const e = { x: s.x + ux * len, y: s.y + uy * len };
  const sign = bend ?? (ux >= 0 ? -1 : 1);
  const bow = len * 0.2 * sign;
  const q = { x: (s.x + e.x) / 2 - uy * bow, y: (s.y + e.y) / 2 + ux * bow };
  let tx = e.x - q.x, ty = e.y - q.y;
  const tl = Math.hypot(tx, ty) || 1;
  tx /= tl; ty /= tl;
  const barb = (deg: number, l: number) => {
    const a = (deg * Math.PI) / 180;
    const bx = tx * Math.cos(a) - ty * Math.sin(a), by = tx * Math.sin(a) + ty * Math.cos(a);
    return `M${f(e)} l${(-bx * l).toFixed(1)} ${(-by * l).toFixed(1)}`;
  };
  return `M${f(s)} Q${f(q)} ${f(e)} ${barb(30, 11)} ${barb(-26, 9)}`;
}

const f = (p: Pt) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
