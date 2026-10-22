// The page's language: which one is on, the switch in the bar, and how text changes over. Headings
// decode into the new language letter by letter (Cyrillic and Latin glyphs churn, then settle from left
// to right); body copy surfaces out of a blur (sky-jamo.css, `.skj-lang-in`); Jamo rewrites its notes;
// and a soft wave of light spreads over the sky from the switch. The choice is remembered per browser.
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { COPY, LANGS, type Copy, type Lang } from './copy';

const KEY = 'jamo.landing.lang';
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

type LangState = { lang: Lang; t: Copy; epoch: number; setLang: (l: Lang, from?: { x: number; y: number }) => void };
const Ctx = createContext<LangState | null>(null);

export const useLang = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useLang outside <LangProvider>');
  return v;
};

function stored(): Lang | null {
  try {
    const v = localStorage.getItem(KEY);
    return LANGS.some((l) => l.code === v) ? (v as Lang) : null;
  } catch {
    return null;
  }
}

function guess(): Lang {
  const nav = (navigator.languages ?? [navigator.language]).map((l) => l.toLowerCase());
  for (const l of nav) {
    if (l.startsWith('ru')) return 'ru';
    if (l.startsWith('uz')) return 'uz';
    if (l.startsWith('en')) return 'en';
  }
  return 'ru';
}

/** Holds the page's language, and plays the wave when it changes. */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, set] = useState<Lang>(() => stored() ?? guess());
  const [epoch, setEpoch] = useState(0);
  const [wave, setWave] = useState<{ x: number; y: number; n: number } | null>(null);

  useEffect(() => {
    const prev = document.documentElement.lang;
    document.documentElement.lang = LANGS.find((l) => l.code === lang)!.html;
    return () => { document.documentElement.lang = prev; };
  }, [lang]);

  const setLang = (l: Lang, from?: { x: number; y: number }) => {
    if (l === lang) return;
    try { localStorage.setItem(KEY, l); } catch { /* private mode: the choice lasts for this visit */ }
    set(l);
    setEpoch((e) => e + 1);
    if (from && !reduced()) setWave((w) => ({ ...from, n: (w?.n ?? 0) + 1 }));
  };

  return (
    <Ctx.Provider value={{ lang, t: COPY[lang], epoch, setLang }}>
      {children}
      {wave && <span key={wave.n} className="skj-wave" style={{ left: wave.x, top: wave.y }} onAnimationEnd={() => setWave(null)} aria-hidden="true" />}
    </Ctx.Provider>
  );
}

/** Puts `.skj-lang-in` on `root` for the moment the copy is changing over, so body text surfaces out of a blur. */
export function useLangIn(root: React.RefObject<HTMLElement | null>) {
  const { epoch } = useLang();
  useEffect(() => {
    const el = root.current;
    if (!epoch || !el) return;
    el.classList.add('skj-lang-in');
    const t = setTimeout(() => el.classList.remove('skj-lang-in'), 900);
    return () => { clearTimeout(t); el.classList.remove('skj-lang-in'); };
  }, [epoch, root]);
}

/* ---------- Text that decodes into the new language ---------- */

const GLYPHS = 'абвгдежзиклмнопрстуфхцчшэюяABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzʻ';
const glyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

/**
 * `text`, which churns into its new value when it changes. Only what is on screen animates; the rest
 * changes at once. Screen readers get the settled text; the churning copy is hidden from them.
 */
export function Morph({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const was = useRef<string | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = was.current;
    was.current = text;
    const r = el.getBoundingClientRect();
    if (from === null || from === text || reduced() || r.bottom < 0 || r.top > innerHeight) {
      el.textContent = text;
      return;
    }
    return decode(el, from, text);
  }, [text]);
  return <><span className="skj-sr">{text}</span><span ref={ref} aria-hidden="true" /></>;
}

function decode(el: HTMLElement, from: string, to: string): () => void {
  const duration = Math.min(1100, 520 + to.length * 9);
  const n = Math.max(from.length, to.length);
  const order = Array.from({ length: n }, (_, i) => (i / n) * 0.65 + Math.random() * 0.35);
  const noise = order.map(glyph);
  let raf = 0, last = 0;
  const start = performance.now();
  const frame = (now: number) => {
    const p = Math.min(1, (now - start) / duration);
    if (now - last > 55) { last = now; for (let i = 0; i < noise.length; i++) noise[i] = glyph(); }
    const len = Math.round(from.length + (to.length - from.length) * Math.min(1, p * 1.6));
    let s = '';
    for (let i = 0; i < len; i++) {
      const c = to[i] ?? '';
      s += p >= order[i] ? c : c === ' ' || from[i] === ' ' ? ' ' : noise[i];
    }
    el.textContent = p < 1 ? s : to;
    if (p < 1) raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => { cancelAnimationFrame(raf); el.textContent = to; };
}

/* ---------- The switch ---------- */

/**
 * A glass pill with a globe and the current code. It opens into a short list: each language's code,
 * its own name, and a hello in Jamo's hand that writes itself out under the pointer. A glass thumb
 * glides to whichever row the pointer or the arrow keys are on. Choosing spins the globe and sends
 * the wave out from the pill.
 */
export function LangSwitch() {
  const { lang, t, epoch, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const cur = LANGS.findIndex((l) => l.code === lang);
  const [hover, setHover] = useState(cur);
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open) return;
    setHover(cur);
    list.current?.focus({ preventScroll: true });
    const away = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open, cur]);

  const choose = (i: number) => {
    const r = btn.current!.getBoundingClientRect();
    setOpen(false);
    btn.current?.focus({ preventScroll: true });
    setLang(LANGS[i].code, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setHover((h) => (h + (e.key === 'ArrowDown' ? 1 : LANGS.length - 1)) % LANGS.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      choose(hover);
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false);
      if (e.key === 'Escape') btn.current?.focus();
    }
  };

  return (
    <div className={'skj-lang' + (open ? ' open' : '')} ref={wrap}>
      <button ref={btn} type="button" className="skj-lang-btn" aria-haspopup="listbox" aria-expanded={open} aria-label={`${t.langLabel}: ${LANGS[cur].native}`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => { if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); } }}>
        <Globe key={epoch} spin={epoch > 0} />
        <span className="skj-lang-code"><Morph text={LANGS[cur].label} /></span>
        <svg className="skj-lang-chev" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 5 6.5 8 3.5" /></svg>
      </button>
      <ul ref={list} className="skj-lang-menu" role="listbox" tabIndex={-1} aria-label={t.langLabel} aria-activedescendant={`skj-lang-${LANGS[hover].code}`} onKeyDown={onKey}
        style={{ '--i': hover } as React.CSSProperties}>
        <span className="skj-lang-thumb" aria-hidden="true" />
        {LANGS.map((l, i) => (
          <li key={l.code} id={`skj-lang-${l.code}`} role="option" aria-selected={i === cur} lang={l.html}
            className={(i === hover ? 'hot' : '') + (i === cur ? ' cur' : '')} style={{ '--n': i } as React.CSSProperties}
            onPointerEnter={() => setHover(i)} onClick={() => choose(i)}>
            <b>{l.label}</b>
            <span className="skj-lang-name">{l.native}</span>
            <span className="skj-lang-hello" aria-hidden="true">{l.hello}</span>
            <svg className="skj-lang-tick" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5 6.5 11.5 12.5 4.5" /></svg>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Globe({ spin }: { spin: boolean }) {
  return (
    <svg className={'skj-globe' + (spin ? ' spin' : '')} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <ellipse className="skj-globe-m" cx="12" cy="12" rx="4" ry="9" />
    </svg>
  );
}
