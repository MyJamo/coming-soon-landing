// The landing (option 04 of the review): option 02's day with option 03's Jamo flying alongside and writing notes on the sky,
// "what did I miss?" at 08:30, the small things at 18:20, and "use it from anywhere" at 18:40, where the desktop and mobile apps
// are marked as coming soon and lead to a download page (#/download). The page speaks
// Russian, Uzbek and English (copy.ts, i18n.tsx). It keeps 02's sky and look (src/landings/sky) but
// has its own sections (sections.tsx), centred, and its own day clock, built to scroll smoothly (clock.ts).
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { JuiLang } from '../../shared/app-ui';
import { useBodyGround, useReveal } from '../../shared/reveal';
import { Sky } from '../sky/Page';
import type { Copy } from './copy';
import { LangProvider, useLang, useLangIn } from './i18n';
import type { NoteSpec } from './notes';
import { Footer, Hero, Loading, Nav } from './top';
import '../sky/sky.css';
import './sky-jamo.css';

// The first screen comes with the page. The rest of the day, Jamo's notes and the download page each
// load as a chunk of their own, so on a slow connection the hero is up before the rest has arrived.
const Day = lazy(() => import('./sections').then((m) => ({ default: m.Day })));
const JamoNotes = lazy(() => import('./notes').then((m) => ({ default: m.JamoNotes })));
const DownloadPage = lazy(() => import('./download').then((m) => ({ default: m.DownloadPage })));

/** Where each of Jamo's notes is written, and what it points at. */
const notesFor = (t: Copy): NoteSpec[] => [
  { id: 'hero', text: t.notes.hero, mood: 'wink', aim: '.sk-hint', sides: ['right'], level: true },
  { id: 'digest', text: t.notes.digest, mood: 'reply2', aim: '#skj-digest .jui-effect', at: '#skj-digest .skj-noticed', sides: ['below'], along: 0.3 },
  { id: 'chats', text: t.notes.chats, mood: 'working', aim: '#sk-chats .sk-extra', at: '#sk-chats .sk-float', sides: ['below'], along: 0.72, bend: 1 },
  { id: 'board', text: t.notes.board, mood: 'happy', aim: '#sk-board .sk-lifted', at: '#sk-board .sk-float', sides: ['below'], along: 0.24, bend: -1 },
  { id: 'calendar', text: t.notes.calendar, mood: 'think2', aim: '#sk-calendar .sk-call', at: '#sk-calendar .sk-float', sides: ['below'], along: 0.36 },
  { id: 'drive', text: t.notes.drive, mood: 'idle', aim: '#sk-drive .sk-extra', sides: ['right', 'below'], dy: 36, bend: 1 },
  { id: 'jamo', text: t.notes.jamo, mood: 'wink', aim: '#sk-jamo .sk-ai', sides: ['right', 'below'], along: 0.62 },
  { id: 'little', text: t.notes.little, mood: 'happy', aim: '.skj-little-calls', at: '.skj-little-grid', sides: ['below'], along: 0.62 },
  { id: 'anywhere', text: t.notes.anywhere, mood: 'happy', aim: '.skj-platforms article:nth-child(3)', at: '.skj-platforms', sides: ['below'], along: 0.8, dy: 36 },
  { id: 'who', text: t.notes.who, mood: 'happy', aim: '.skj-who .sk-who article:first-child', at: '.skj-who .sk-head h2', sides: ['left', 'above'], along: 0.6 },
];

export default function Page() {
  const sub = useSub();
  return (
    <LangProvider>
      <Localized>{sub === 'download' ? <Download key="download" /> : <Landing key="landing" />}</Localized>
    </LangProvider>
  );
}

/** The app-UI kit's screens speak the page's language too. */
function Localized({ children }: { children: React.ReactNode }) {
  const { lang, t } = useLang();
  useEffect(() => {
    const prev = document.title;
    document.title = t.title;
    return () => { document.title = prev; };
  }, [t]);
  return <JuiLang lang={lang}>{children}</JuiLang>;
}

function Landing() {
  const { t } = useLang();
  const root = useRef<HTMLDivElement>(null);
  const [joined, setJoined] = useState(false);
  const notes = useMemo(() => notesFor(t), [t]);
  useBodyGround('#dce5f9');
  useReveal(root);
  useLangIn(root);
  return (
    <div className="sk skj" ref={root}>
      <Sky />
      <Nav root={root} />
      <main>
        <Hero />
        <Suspense fallback={<Loading />}><Day onState={(s) => setJoined(s === 'joined')} /></Suspense>
      </main>
      <Suspense fallback={null}><JamoNotes page={root} notes={notes} mood={joined ? 'celebrate' : null} /></Suspense>
      <Footer />
    </div>
  );
}

function Download() {
  const root = useRef<HTMLDivElement>(null);
  useBodyGround('#f2d9d6');
  useReveal(root);
  useLangIn(root);
  return <div className="sk skj skj-dl-page" ref={root}><Suspense fallback={<Loading tall />}><DownloadPage root={root} /></Suspense></div>;
}

/** `download` on #/download, or nothing for the day itself. In-page anchors (#sk-join) leave it alone. */
function useSub() {
  const read = () => (location.hash === '#/download' ? 'download' : '');
  const [sub, setSub] = useState(read);
  useEffect(() => {
    let cur = read();
    const on = () => {
      if (read() === cur) return;
      cur = read();
      setSub(cur);
      scrollTo(0, 0);
    };
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  return sub;
}
