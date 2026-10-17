// Claude Design "Coming Soon v2.dc.html", 1:1. The one change: the form puts the address on the
// backend's waitlist instead of only playing the reply.
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { JamoFace, type Mood } from './JamoFace';
import { LOCALE, T, type Lang } from './copy';

type Stage = 'open' | 'sending' | 'reply' | 'party' | 'joined';
const MOODS: Mood[] = ['working', 'thinking', 'wink', 'working', 'idle'];
const LANGS: Lang[] = ['ru', 'uz', 'en'];

/** `?lang=uz` or `?lang=en` picks the language; anything else is Russian. */
function initialLang(): Lang {
  const asked = new URLSearchParams(location.search).get('lang');
  return LANGS.find((l) => l === asked) ?? 'ru';
}

/** 204 for a new address and a known one alike; otherwise the server's localized detail, if any. */
async function joinWaitlist(email: string, lang: Lang): Promise<string | null> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE ?? ''}/api/v1/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source: 'hero', locale: LOCALE[lang] }),
    });
    if (res.ok) return null;
    const body = await res.json().catch(() => null);
    return typeof body?.detail === 'string' ? body.detail : T[lang].failed;
  } catch {
    return T[lang].failed;
  }
}

export function ComingSoon() {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [email, setEmail] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [stage, setStage] = useState<Stage>('open');
  const [typer, setTyper] = useState({ line: 0, chars: 0, hold: 0 });
  const langRef = useRef(lang); langRef.current = lang;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setTyper((s) => {
      if (s.chars < T[langRef.current].lines[s.line].length) return { ...s, chars: s.chars + 1 };
      if (s.hold < 50) return { ...s, hold: s.hold + 1 };
      return { line: (s.line + 1) % MOODS.length, chars: 0, hold: 0 };
    }), 55);
    return () => { clearInterval(timer); timers.current.forEach(clearTimeout); };
  }, []);

  useEffect(() => { document.documentElement.lang = LOCALE[lang]; }, [lang]);

  const setLang = (next: Lang) => { setLangState(next); setTyper((s) => ({ ...s, chars: 0, hold: 0 })); };

  const join = (e: FormEvent) => {
    e.preventDefault();
    if (stage !== 'open') return;
    const address = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(address)) { setInvalid(true); return; }
    setStage('sending'); setInvalid(false); setFailure(null);
    // The design's beats (reply at 1.4 s, party at 3.6 s, joined at 6 s), with the reply held until
    // the server has answered.
    const started = performance.now();
    joinWaitlist(address, lang).then((error) => {
      if (error) { setStage('open'); setFailure(error); return; }
      const at = (ms: number, next: Stage) => timers.current.push(setTimeout(() => setStage(next), ms));
      const reply = Math.max(0, 1400 - (performance.now() - started));
      at(reply, 'reply'); at(reply + 2200, 'party'); at(reply + 4600, 'joined');
    });
  };

  const t = T[lang];
  const listening = focused || !!email;
  const done = stage === 'reply' || stage === 'party' || stage === 'joined';
  const confused = invalid || !!failure;
  const mood: Mood = stage === 'sending' ? 'think2' : stage === 'reply' ? 'reply2' : stage === 'party' ? 'celebrate' : stage === 'joined' ? 'happy'
    : confused ? 'confused' : listening ? 'listening' : MOODS[typer.line];
  const status = stage === 'sending' ? t.sending : done ? t.done
    : invalid ? t.off : failure ? t.oops : listening ? t.listening : t.lines[typer.line].slice(0, typer.chars);
  const alert = invalid ? t.error : failure;

  return (
    <div data-screen-label="Coming soon" style={{ position: 'relative', isolation: 'isolate', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'radial-gradient(60% 50% at 50% 108%, rgba(255,150,118,.55), transparent 70%), radial-gradient(40% 35% at 50% 30%, rgba(255,255,255,.7), transparent 70%), radial-gradient(35% 35% at 96% 6%, rgba(255,190,160,.45), transparent 70%), #f7f1ee' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '28px clamp(20px, 4vw, 40px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="46" height="20" viewBox="40 68.5 145 64" aria-hidden="true"><rect x="40" y="68.5" width="145" height="64" rx="32" fill="#23262B"></rect><circle cx="72" cy="100.5" r="8" fill="#fff"></circle><circle cx="100" cy="100.5" r="8" fill="#fff"></circle><path d="M122.5 100L134.5 111.5L156.5 89.5" stroke="#FF6B57" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path></svg>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em' }}>MyJamo</span>
        </div>
        <div role="group" aria-label="Language" style={{ display: 'flex', gap: 2, padding: 3, borderRadius: 12, background: 'rgba(255,255,255,.6)', border: '1px solid rgba(255,255,255,.9)', boxShadow: 'inset 0 1px 0 #fff' }}>
          {LANGS.map((l) => (
            <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={l === lang} style={{ height: 30, padding: '0 12px', border: 0, borderRadius: 9, background: l === lang ? '#0e121b' : 'transparent', color: l === lang ? '#fff' : '#525866', font: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{l.toUpperCase()}</button>
          ))}
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, padding: '12px 20px 32px', textAlign: 'center' }}>
        <div style={{ display: 'grid', placeItems: 'center', width: 340, maxWidth: '100%', height: 280 }}>
          <JamoFace mood={mood} size={260} />
        </div>

        <div aria-live="polite" style={{ display: 'flex', alignItems: 'center', gap: 2, minHeight: 26, fontSize: 18, fontWeight: 500, color: '#e2552f' }}>
          <span>{status}</span><span style={{ width: 2, height: 22, marginLeft: 2, background: '#ff6b57', animation: 'caret 1s steps(1) infinite' }}></span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(44px, 7vw, 76px)', lineHeight: 1, fontWeight: 700, letterSpacing: '-.05em' }}>{t.title}</h1>
          <p style={{ margin: 0, maxWidth: 540, fontSize: 17, lineHeight: 1.5, color: '#525866', textWrap: 'pretty' }}>{t.lead}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
          {!done && (
            <form onSubmit={join} noValidate style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 460, padding: 6, borderRadius: 18, background: 'rgba(255,255,255,.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,.95)', boxShadow: 'inset 0 1px 0 #fff, 0 14px 30px -18px rgba(90,45,30,.35)' }}>
              <input type="email" value={email} onChange={(e) => { setEmail(e.currentTarget.value); setInvalid(false); setFailure(null); }} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder="you@company.com" aria-label={t.email} autoComplete="email" style={{ flex: 1, minWidth: 0, height: 48, padding: '0 14px', border: 0, outline: 'none', background: 'transparent', font: 'inherit', fontSize: 15, color: '#0e121b' }} />
              <button type="submit" className="cta" style={{ flex: 'none', height: 48, padding: '0 20px', border: 0, borderRadius: 12, color: '#fff', font: 'inherit', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>{t.cta}</button>
            </form>
          )}
          {done && (
            <div style={{ display: 'flex', alignItems: 'center', minHeight: 60, fontSize: 17, fontWeight: 500 }}>{t.joined}</div>
          )}
          {alert && !done && <div role="alert" style={{ fontSize: 14, color: '#e2552f' }}>{alert}</div>}
        </div>
      </main>

      <footer style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22, padding: '24px 20px 32px', fontSize: 14, color: '#717784' }}>
        <span>© 2026 MyJamo</span>
      </footer>
    </div>
  );
}
