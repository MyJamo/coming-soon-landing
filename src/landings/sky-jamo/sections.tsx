// Option 04's sections after the hero, 08:30 to 19:30. They began as 02's (src/landings/sky/Page.tsx)
// and keep its look, but every word, and every screen's contents, comes from copy.ts in the page's
// language, and the layout is centred: each heading and its copy over its screen, instead of copy
// beside it. The first screen is in top.tsx; this file loads after it, as its own chunk.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { JamoFace, type Mood } from '../../JamoFace';
import {
  AppWindow, Avatar, Board, BoardToolbar, CalendarPage, CallRecord, CallStage, ChatsPanel, Checklist, Conversation, ConversationHeader, DayDivider, DrivePage,
  EffectCard, type EffectCardData, HomeHeader, JamoAssistant, JamoMic, JuiRoot, type AiMessage, Logo, MessageBubble, type Person, ProjectHeader, Scaled, SearchBox, StatusBadge,
  type StatusKey, StatusPill, TaskCard, TaskChip, Toast, type Tone, useJuiText,
} from '../../shared/app-ui';
import { DAY_TO, MOMENTS } from '../sky/data';
import { clockOf } from '../sky/Page';
import type { Copy, LittleId, MomentId } from './copy';
import { Morph, useLang } from './i18n';
import { DOWNLOAD, DownloadGlyph, JoinForm, reduced, useMedia, useWorld } from './top';

/** The day after the hero, which the page loads once its first screen is up. */
export function Day({ onState }: { onState?: (s: string) => void }) {
  return <><Digest /><Moments /><Little /><Anywhere /><Audiences /><Final onState={onState} /></>;
}

/* ---------- 08:30: what did I miss? ---------- */

export function Digest() {
  const { t } = useLang();
  const d = t.digest;
  const [undone, setUndone] = useState(false);
  return (
    <section className="sk-sec skj-digest" id="skj-digest" data-at={8.5}>
      <div className="sk-head" data-reveal>
        <time className="sk-time">08:30</time>
        <span className="sk-eyebrow"><Morph text={d.eyebrow} /></span>
        <h2><Morph text={d.title} /></h2>
        <p>{d.text}</p>
      </div>
      <div className="skj-digest-grid">
        <div data-reveal>
          <div className="skj-phone skj-shot-phone">
            <div className="skj-phone-screen">
              <MobileJamo effect={{ kind: 'event', badge: d.effect.badge, title: d.effect.title, meta: d.effect.meta, undone, onUndo: () => setUndone(true), onOpen: () => setUndone(false) }} />
              <span className="skj-island" />
            </div>
          </div>
        </div>
        <ol className="skj-noticed">
          {d.noticed.map(([n, label, text], i) => (
            <li key={i} className="sk-glass" data-reveal style={{ transitionDelay: `${i * 90}ms` }}><span className="skj-n"><b>{n}</b><small>{label}</small></span><p>{text}</p></li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- One module at its hour ---------- */

export function Moments() {
  return <>{MOMENTS.map((m) => <MomentSection key={m.id} id={m.id as MomentId} at={m.at} />)}</>;
}

function MomentSection({ id, at }: { id: MomentId; at: number }) {
  const { t } = useLang();
  const m = t.moments[id];
  return (
    <section className={'sk-moment m-' + id} id={'sk-' + id} data-at={at}>
      <div className="sk-moment-copy" data-reveal>
        <time className="sk-time">{clockOf(at)}</time>
        <span className="sk-eyebrow"><Morph text={m.eyebrow} /></span>
        <h2><Morph text={m.title} /></h2>
        <p>{m.text}</p>
        <ul className={id === 'jamo' ? 'sk-steps' : ''}>
          {m.points.map((p, i) => <li key={i}>{id === 'jamo' && <span>{String(i + 1).padStart(2, '0')}</span>}{p}</li>)}
        </ul>
      </div>
      <div className="sk-moment-shot" data-reveal><Shot id={id} /></div>
    </section>
  );
}

/** A window that floats: the screen, plus whatever Jamo left on top of it. */
function Float({ children, extra, width = 1440, height = 960 }: { children: ReactNode; extra?: ReactNode; width?: number; height?: number }) {
  return (
    <div className="sk-float">
      <Scaled width={width} height={height} className="sk-scaled">{children}</Scaled>
      {extra && <JuiRoot className="sk-extra">{extra}</JuiRoot>}
    </div>
  );
}

function Shot({ id }: { id: MomentId }) {
  const { t } = useLang();
  const w = useWorld();
  const c = t.calendar;
  if (id === 'chats') return (
    <Float height={860} extra={<EffectCard card={{ code: 'ORZ-24', badge: t.chats.effect.badge, title: t.cards.chats, meta: t.chats.effect.meta }} />}>
      <AppWindow rail="chats" height={860} bare main={
        <ChatsPanel expanded flat style={{ height: '100%' }} tabs={[t.chats.tabs[0], w.site.name, w.brand.name]} rows={[
          { kind: 'assistant', preview: t.chats.morning },
          { kind: 'project', name: w.site.name, id: w.site.id, preview: t.chats.linked, time: '09:10', selected: true, live: true },
          { kind: 'direct', person: w.people.dilnoza, preview: t.chats.build, time: '08:51', unread: 2 },
          { kind: 'direct', person: w.people.alisher, preview: t.chats.readyShort, time: '08:40' },
          { kind: 'project', name: w.brand.name, id: w.brand.id, preview: t.chats.icons, time: t.chats.yesterday },
          { kind: 'direct', person: w.people.bobur, preview: t.chats.thanks, time: t.chats.yesterday },
        ]} conversation={
          <Conversation expanded who={{ kind: 'channel', name: '# ' + w.site.name, sub: t.project.members }}>
            <DayDivider>{t.chats.today}</DayDivider>
            <MessageBubble author={w.people.alisher} avatar={w.people.alisher} text={t.chats.m1} time="09:02" tail />
            <MessageBubble author={w.people.dilnoza} avatar={w.people.dilnoza} text={t.chats.m2} time="09:06" tail />
            <MessageBubble mine text={t.chats.m3} time="09:10" read attach={<TaskChip chip={{ code: 'ORZ-24', title: t.cards.chats, trailing: t.chats.due, tint: 'ahead' }} />} />
          </Conversation>
        } />
      } />
    </Float>
  );
  if (id === 'board') return (
    <Float height={860} extra={<div className="sk-lifted"><TaskCard task={w.cards.chats} lifted /></div>}>
      <AppWindow rail="boards" height={860} main={<>
        <ProjectHeader project={w.site} members={6} openTasks={7} unread={2} />
        <BoardToolbar />
        <Board over={2} columns={[
          { status: 'todo', tasks: [w.cards.landing, w.cards.onboarding] },
          { status: 'progress', tasks: [w.cards.review] },
          { status: 'review', tasks: [w.cards.scroll, w.cards.dates] },
          { status: 'done', tasks: [w.cards.release] },
        ]} />
      </>} />
    </Float>
  );
  if (id === 'calendar') return (
    <Float height={860} extra={
      <div className="sk-call">
        <Scaled width={760} height={500}>
          <JuiRoot style={{ width: 760, height: 500, display: 'flex' }}>
            <CallStage title={c.review} context={'# ' + w.site.name} clock="00:04" cols={2} panel={false} tiles={[
              { person: w.people.dilnoza, speaking: true }, { person: w.people.alisher, muted: true }, { person: w.people.bobur }, { person: w.people.dev, you: true },
            ]} />
          </JuiRoot>
        </Scaled>
      </div>
    }>
      <AppWindow rail="calendar" height={860} main={
        <CalendarPage period={c.period} legend={[{ name: c.personal, tone: 'personal' }, { name: w.site.name, tone: 'purple' }, { name: w.brand.name, tone: 'green' }, { name: c.deadlines, tone: '', icon: 'tasks' }]}
          days={w.days} from={9} to={17} hour={64}
          events={[
            { day: 0, start: 10, end: 10.25, title: c.standup, tone: 'purple' },
            { day: 1, start: 10, end: 10.25, title: c.standup, tone: 'purple' },
            { day: 2, start: 10, end: 10.25, title: c.standup, tone: 'purple' },
            { day: 1, start: 11, end: 12, title: c.sync, tone: 'green' },
            { day: 2, start: 12, end: 13, title: c.lunch, tone: 'personal' },
            { day: 2, start: 14, end: 15, title: c.review, tone: 'orange', found: true },
            { day: 3, start: 15, end: 16.5, title: c.demo, tone: 'orange' },
            { day: 4, start: 11, end: 12.5, title: c.sprint, tone: 'purple' },
          ]} now={{ day: 2, at: 14.05 }} />
      } />
    </Float>
  );
  if (id === 'drive') {
    const dr = t.drive;
    return (
      <Float height={760} extra={<Toast action={dr.open}>{dr.toast(dr.contract, w.site.name)}</Toast>}>
        <AppWindow rail="library" height={760} main={<DrivePage projects={[w.site.name, w.brand.name]} rows={[
          { kind: 'folder', name: 'Design review', owner: w.people.dev, date: '07.10.2026' },
          { kind: 'folder', name: dr.release, owner: w.people.bobur, date: '09.10.2026' },
          { kind: 'file', name: dr.contract, owner: w.people.dilnoza, date: '14.10.2026', size: '48 KB', selected: true },
          { kind: 'file', name: dr.brief, owner: w.people.dev, date: '10.10.2026', size: '635.3 KB' },
          { kind: 'picture', name: dr.mockup, owner: w.people.alisher, date: '14.10.2026', size: '2.4 MB' },
          { kind: 'picture', name: dr.cover, owner: w.people.dilnoza, date: '12.10.2026', size: '1.2 MB' },
        ]} />} />
      </Float>
    );
  }
  return <JamoEvening />;
}

/* ---------- 18:05: Jamo plays the evening's conversation ---------- */

/** Which of the section's four steps a face belongs to: listens, thinks, does, confirms. */
const STAGE: Partial<Record<Mood, number>> = { listening: 0, think2: 1, working: 2, celebrate: 3 };

/** One frame of the scene: how much of the conversation is out, what the composer holds, and Jamo's face. */
type Beat = { ms: number; shown: number; mood: Mood; label: string; typed?: string; typing?: boolean };

function beatsFor(t: Copy): Beat[] {
  const s = t.evening.state, lines = t.evening.lines;
  const typeOut = (text: string, shown: number): Beat[] =>
    [...text].map((_, i) => ({ ms: 55, shown, mood: 'listening', label: s.listening, typed: text.slice(0, i + 1) }));
  return [
    { ms: 1000, shown: 0, mood: 'idle', label: s.idle },
    ...typeOut(lines[0], 0),
    { ms: 400, shown: 1, mood: 'listening', label: s.listening },
    { ms: 1700, shown: 1, mood: 'think2', label: s.thinking, typing: true },
    { ms: 2300, shown: 2, mood: 'happy', label: s.glad },
    { ms: 2900, shown: 3, mood: 'confused', label: s.asking },
    ...typeOut(lines[3], 3),
    { ms: 400, shown: 4, mood: 'listening', label: s.listening },
    { ms: 1600, shown: 4, mood: 'working', label: s.working, typing: true },
    { ms: 2600, shown: 5, mood: 'celebrate', label: s.done },
    ...typeOut(lines[5], 5),
    { ms: 400, shown: 6, mood: 'listening', label: s.listening },
    { ms: 900, shown: 6, mood: 'happy', label: s.glad, typing: true },
    { ms: 3200, shown: 7, mood: 'wink', label: s.bye },
    { ms: 1600, shown: 7, mood: 'idle', label: s.idle },
  ];
}

/**
 * 18:05, as in 02: Jamo's panel plays the evening's conversation by itself while on screen, the face
 * in the orb following along, and the section's four steps lighting up with it. A change of language
 * starts the conversation over in the new one.
 */
function JamoEvening() {
  const { t, lang } = useLang();
  const beats = useMemo(() => beatsFor(t), [t]);
  const root = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(() => (reduced() ? beats.length - 2 : 0));
  const [undone, setUndone] = useState(false);
  const seen = useSeen(root, 0.35);

  useEffect(() => { setStep(reduced() ? beats.length - 2 : 0); }, [lang, beats.length]);

  useEffect(() => {
    if (!seen || !beats[step]) return;
    const id = setTimeout(() => setStep((i) => (i + 1) % beats.length), beats[step].ms);
    return () => clearTimeout(id);
  }, [seen, step, beats]);

  // A new round starts with the change still in place.
  useEffect(() => { if (step === 0) setUndone(false); }, [step]);

  const beat = beats[Math.min(step, beats.length - 1)];
  const e = t.evening;
  const messages: AiMessage[] = e.lines.slice(0, beat.shown).map((text, i) => i === 4
    ? { effect: { code: 'ORZ-13', badge: e.effect.badge, title: t.cards.dates, meta: e.effect.meta, undone, onUndo: () => setUndone(true), onOpen: () => setUndone(false) } }
    : { text, mine: i === 0 || i === 3 || i === 5 ? true : undefined });
  if (beat.typing) messages.push({ text: <span className="sk-typing" aria-label={e.typing}><i /><i /><i /></span> });
  const [mood, label] = undone && beat.shown >= 5 ? ['idle' as Mood, e.state.undone] : [beat.mood, beat.label];

  const stage = STAGE[beat.mood] ?? -1;
  useEffect(() => {
    root.current?.closest('section')?.querySelectorAll('.sk-steps li').forEach((li, i) => li.classList.toggle('on', i === stage));
  }, [stage]);

  return (
    <div className="sk-evening" ref={root}>
      <div className="sk-orb">
        <JamoFace mood={mood} size={150} />
        <span key={label} className="sk-orb-state">{label}</span>
      </div>
      <JuiRoot className={'sk-ai' + (step === beats.length - 1 ? ' sk-ai-out' : '')}>
        <ConversationHeader who={{ kind: 'assistant' }} />
        <JamoAssistant starters={[]} mic typed={beat.typed} messages={messages.length ? messages : undefined} greeting={e.greeting} lead={e.lead} mood={mood} faceSize={96} />
      </JuiRoot>
    </div>
  );
}

/** Whether an element is on screen, so a scene plays only while it can be seen. Under reduced motion it never is: scenes hold still. */
function useSeen(ref: React.RefObject<HTMLElement | null>, threshold = 0.4) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
  return seen;
}

/* ---------- 18:20: the small things ---------- */

/**
 * The features too small for an hour of their own, each on a tile with a working piece of the app:
 * search narrowing as it is typed, who is online, a status of your own, a checklist to tick, the
 * calls the chat keeps, and Jamo hearing a sentence. Each tile says when in the day it was used.
 */
export function Little() {
  const { t } = useLang();
  const l = t.little;
  return (
    <section className="sk-sec skj-little" id="skj-little" data-at={18 + 20 / 60}>
      <div className="sk-head" data-reveal>
        <time className="sk-time">18:20</time>
        <span className="sk-eyebrow"><Morph text={l.eyebrow} /></span>
        <h2><Morph text={l.title} /></h2>
        <p>{l.text}</p>
      </div>
      <div className="skj-little-grid">
        {l.items.map((it, i) => (
          <article key={it.id} className={'sk-glass skj-little-' + it.id} data-reveal style={{ transitionDelay: `${(i % 3) * 70}ms` }}>
            <JuiRoot className="skj-little-demo"><LittleDemo id={it.id} /></JuiRoot>
            <time className="skj-little-at">{it.at}</time>
            <h3><Morph text={it.title} /></h3>
            <p>{it.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function LittleDemo({ id }: { id: LittleId }) {
  if (id === 'search') return <SearchDemo />;
  if (id === 'presence') return <PresenceDemo />;
  if (id === 'statuses') return <StatusesDemo />;
  if (id === 'checklist') return <ChecklistDemo />;
  if (id === 'calls') return <CallsDemo />;
  return <VoiceDemo />;
}

/** The query is typed a letter at a time and the tasks narrow with it; it clears and starts again. */
function SearchDemo() {
  const { t } = useLang();
  const w = useWorld();
  const box = useRef<HTMLDivElement>(null);
  const seen = useSeen(box);
  const q = t.little.query;
  const [n, setN] = useState(() => (reduced() ? q.length : 0));
  useEffect(() => { setN(reduced() ? q.length : 0); }, [q]);
  useEffect(() => {
    if (!seen) return;
    const id = setTimeout(() => setN((k) => (k >= q.length ? 0 : k + 1)), n >= q.length ? 3200 : n ? 150 : 900);
    return () => clearTimeout(id);
  }, [seen, n, q]);
  const typed = q.slice(0, n);
  const hits = Object.values(w.cards).filter((c) => c.title.toLocaleLowerCase().includes(typed.toLocaleLowerCase())).slice(0, 3);
  return (
    <div ref={box} className={'skj-search' + (typed ? ' typed' : '') + (seen && n < q.length ? ' typing' : '')}>
      <SearchBox width="100%" placeholder={typed || undefined} />
      <ul>{hits.map((c) => <li key={c.code}><span className="jui-mono code">{c.code}</span><span><Marked text={c.title} q={typed} /></span></li>)}</ul>
    </div>
  );
}

function Marked({ text, q }: { text: string; q: string }) {
  const at = q ? text.toLocaleLowerCase().indexOf(q.toLocaleLowerCase()) : -1;
  if (at < 0) return <>{text}</>;
  return <>{text.slice(0, at)}<mark>{text.slice(at, at + q.length)}</mark>{text.slice(at + q.length)}</>;
}

/** Three teammates with their dots; Alisher steps away and comes back. */
function PresenceDemo() {
  const { t } = useLang();
  const w = useWorld();
  const box = useRef<HTMLUListElement>(null);
  const seen = useSeen(box);
  const [back, setBack] = useState(false);
  useEffect(() => {
    if (!seen) return;
    const id = setInterval(() => setBack((b) => !b), 3400);
    return () => clearInterval(id);
  }, [seen]);
  const p = t.little.presence;
  const rows: [Person, 'online' | 'away' | 'offline', string][] = [
    [w.people.dilnoza, 'online', p[0]],
    [w.people.alisher, back ? 'online' : 'away', back ? p[0] : p[1]],
    [w.people.bobur, 'offline', p[2]],
  ];
  return (
    <ul ref={box} className="skj-presence">
      {rows.map(([who, state, label]) => (
        <li key={who.name}><Avatar person={who} size={36} presence={state} /><span><b>{who.name}</b><small key={label} className={state}>{label}</small></span></li>
      ))}
    </ul>
  );
}

/** A team's own column among the seeded ones. */
const PREPROD = { name: 'PreProd', color: '#14a3b8' };
const FLOW: (StatusKey | Tone)[] = ['todo', 'progress', 'review', PREPROD, 'done'];

/** A task walks through the board's columns, PreProd among them, until a status is picked by hand. */
function StatusesDemo() {
  const { t } = useLang();
  const box = useRef<HTMLDivElement>(null);
  const seen = useSeen(box);
  const [at, setAt] = useState(3);
  const [picked, setPicked] = useState(false);
  useEffect(() => {
    if (!seen || picked) return;
    const id = setInterval(() => setAt((i) => (i + 1) % FLOW.length), 1800);
    return () => clearInterval(id);
  }, [seen, picked]);
  return (
    <div ref={box} className="skj-statuses">
      <div className="skj-statuses-card">
        <span className="jui-mono code">ORZ-21</span>
        <b>{t.cards.release}</b>
        <span key={at} className="skj-statuses-now"><StatusBadge status={FLOW[at]} /></span>
      </div>
      <div className="skj-statuses-row">
        {FLOW.map((s, i) => (
          <button key={i} type="button" className={i === at ? 'on' : ''} aria-pressed={i === at} onClick={() => { setAt(i); setPicked(true); }}><StatusPill status={s} /></button>
        ))}
      </div>
    </div>
  );
}

function ChecklistDemo() {
  const { t } = useLang();
  const [done, setDone] = useState([true, false, false]);
  const items = t.little.checklist.map((text, i) => ({ text, done: done[i] }));
  return <div className="skj-checklist"><Checklist items={items} onToggle={(i) => setDone((d) => d.map((v, k) => (k === i ? !v : v)))} /></div>;
}

function CallsDemo() {
  const { t } = useLang();
  const w = useWorld();
  const c = t.little.calls;
  return (
    <div className="skj-calls">
      <div className="skj-calls-in"><Avatar person={w.people.dilnoza} size={28} /><span className="jui-bubble"><CallRecord label={c.incoming} detail={c.call + ' · 4:12'} time="15:10" incoming /></span></div>
      <span className="jui-bubble mine"><CallRecord label={c.outgoing} detail={c.call + ' · 0:48'} time="15:31" /></span>
    </div>
  );
}

/** A tenth of a second a tick: the scene listens from LISTEN to HEARD and starts over at ROUND. */
const LISTEN = 12, HEARD = 52, ROUND = 84;

/** Jamo hears a sentence: the mic goes live, the words come in, and Jamo is pleased; the mic starts or stops it by hand. */
function VoiceDemo() {
  const { t } = useLang();
  const ai = useJuiText().assistant;
  const box = useRef<HTMLDivElement>(null);
  const seen = useSeen(box);
  const [tick, setTick] = useState(() => (reduced() ? HEARD - 1 : 0));
  useEffect(() => {
    if (!seen) return;
    const id = setInterval(() => setTick((k) => (k + 1) % ROUND), 100);
    return () => clearInterval(id);
  }, [seen]);
  const words = t.little.said.split(' ');
  const live = tick >= LISTEN && tick < HEARD;
  const heard = tick < LISTEN ? 0 : Math.min(words.length, Math.floor((tick - LISTEN - 4) / 5) + 1);
  const said = words.slice(0, Math.max(0, heard)).join(' ');
  const sec = Math.floor((Math.min(tick, HEARD) - LISTEN) / 10);
  const mood: Mood = live ? 'listening' : tick >= HEARD ? 'happy' : 'idle';
  const level = live ? 0.25 + 0.6 * Math.abs(Math.sin(tick * 1.3) * Math.cos(tick * 0.45)) : 0;
  return (
    <div ref={box} className="skj-voice">
      <JamoFace mood={mood} size={52} />
      <div className="jui-ai-composer">
        <span className={said ? 'typed' : ''}>{said || ai.placeholder}</span>
        <JamoMic active={live} clock={'00:0' + Math.max(0, sec)} level={level} onClick={() => setTick(live ? HEARD : LISTEN)} />
      </div>
    </div>
  );
}

/* ---------- 18:40: from anywhere ---------- */

export function Anywhere() {
  const { t } = useLang();
  const w = useWorld();
  const a = t.anywhere, c = t.calendar;
  // A phone gets the stage drawn narrower: the browser over the phone, big enough to make out, and the
  // desktop app left to its card below. At the wide stage's scale the phone would be two fingers wide.
  const narrow = useMedia('(max-width: 640px)');
  return (
    <section className="sk-sec skj-anywhere" id="skj-anywhere" data-at={18 + 40 / 60}>
      <div className="sk-head" data-reveal>
        <time className="sk-time">18:40</time>
        <span className="sk-eyebrow"><Morph text={a.eyebrow} /></span>
        <h2><Morph text={a.title} /></h2>
        <p>{a.text}</p>
      </div>
      <div className={'skj-stage' + (narrow ? ' narrow' : '')} data-reveal>
        <Scaled width={narrow ? 460 : 1180} height={narrow ? 640 : 680}>
          <div className="skj-browser">
            <div className="skj-tabs"><span className="skj-lights"><i /><i /><i /></span><span className="skj-tab"><Logo scale={0.5} />MyJamo<em>×</em></span></div>
            <div className="skj-url"><span className="skj-arrows">‹ ›</span><span className="skj-addr"><b>myjamo.com</b>/o/orzu/projects/orzu-site</span></div>
            <Scaled width={1440} height={820} className="skj-shot">
              <AppWindow rail="home" height={820} bare main={
                <div className="sk-home">
                  <HomeHeader open={7} today={2} overdue={1} />
                  <Board compact columns={[
                    { status: 'todo', tasks: [{ ...w.cards.landing, project: w.site }, { ...w.cards.onboarding, project: w.brand }] },
                    { status: 'progress', tasks: [{ ...w.cards.chats, project: w.site }] },
                    { status: 'review', tasks: [{ ...w.cards.scroll, project: w.site }] },
                    { status: 'done', tasks: [{ ...w.cards.release, project: w.brand }] },
                  ]} />
                </div>
              } />
            </Scaled>
            <When at="11:30" place={a.office} />
          </div>
          {!narrow && <div className="skj-desktop">
            <div className="skj-title"><span className="skj-lights"><i /><i /><i /></span><b>MyJamo</b><span className="skj-soon"><span>{a.soon}</span></span></div>
            <Scaled width={1440} height={860} className="skj-shot">
              <AppWindow rail="calendar" height={860} main={
                <CalendarPage period={c.period} legend={[{ name: c.personal, tone: 'personal' }, { name: w.site.name, tone: 'purple' }, { name: w.brand.name, tone: 'green' }]}
                  days={w.days} from={9} to={17} hour={64}
                  events={[
                    { day: 0, start: 10, end: 10.25, title: c.standup, tone: 'purple' },
                    { day: 1, start: 10, end: 10.25, title: c.standup, tone: 'purple' },
                    { day: 2, start: 10, end: 10.25, title: c.standup, tone: 'purple' },
                    { day: 1, start: 11, end: 12, title: c.sync, tone: 'green' },
                    { day: 3, start: 11, end: 12, title: c.review, tone: 'orange', found: true },
                    { day: 3, start: 15, end: 16.5, title: c.demo, tone: 'orange' },
                    { day: 4, start: 11, end: 12.5, title: c.sprint, tone: 'purple' },
                  ]} now={{ day: 2, at: 16.4 }} />
              } />
            </Scaled>
            <When at="18:40" place={a.home} />
            <div className="skj-synced"><i>✓</i>{a.synced}</div>
          </div>}
          <div className="skj-phone skj-shot-phone skj-stage-phone">
            <When at="08:30" place={a.road} />
            <span className="skj-soon"><span>{a.soon}</span></span>
            <div className="skj-phone-screen"><MobileHome /><span className="skj-island" /></div>
          </div>
        </Scaled>
      </div>
      <div className="skj-platforms">
        {a.platforms.map((p, i) => (
          <article key={p.id} className="sk-glass" data-reveal style={{ transitionDelay: `${i * 70}ms` }}>
            <span className={'skj-badge' + (p.id === 'web' ? ' early' : '')}><span>{p.id === 'web' ? a.early : a.soon}</span></span>
            <span className="skj-ico"><PlatformIcon id={p.id} /></span>
            <h3><Morph text={p.title} /></h3>
            <p>{p.text}</p>
            <span className="skj-os">{p.os.map((o) => <span key={o}>{o}</span>)}</span>
          </article>
        ))}
      </div>
      <div className="skj-dl-cta" data-reveal>
        <a className="sk-btn skj-dl-btn" href={DOWNLOAD}><DownloadGlyph /><Morph text={a.download} /></a>
      </div>
    </section>
  );
}

/** Where and when each device is used: the time, and the place beside it. */
function When({ at, place }: { at: string; place: string }) {
  return <span className="skj-when"><b>{at}</b>{place}</span>;
}

export function PlatformIcon({ id, size = 22 }: { id: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {id === 'web' && <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>}
      {id === 'desktop' && <><rect x="2" y="4" width="20" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></>}
      {id === 'mobile' && <><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></>}
    </svg>
  );
}

/**
 * The mobile app's home screen (the design's JamoPrototype, 390 × 844), drawn rather than pictured so
 * it speaks the page's language: the team switcher, the day's greeting, the meeting you can join, and
 * my tasks over the tab bar with Jamo's button beside it.
 */
export function MobileHome() {
  const { t } = useLang();
  const m = t.mobile;
  return (
    <Scaled width={390} height={844}>
      <div className="skj-mh" role="img" aria-label={m.alt}>
        <div className="skj-mh-status"><b>9:41</b><span className="skj-sig"><i /><i /><i /><i /><em /></span></div>
        <div className="skj-mh-top">
          <span className="skj-mh-team"><i>JT</i>Jamo Team<svg width="10" height="14" viewBox="0 0 10 14" aria-hidden="true"><path d="M2 5l3-3 3 3M2 9l3 3 3-3" /></svg></span>
          <span className="skj-mh-bell"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M6 10a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7M10 20a2 2 0 0 0 4 0" /></svg><em /></span>
          <span className="skj-mh-me">AK</span>
        </div>
        <p className="skj-mh-date">{m.date}</p>
        <h4 className="skj-mh-hello">{m.hello}</h4>
        <div className="skj-mh-row"><b>{m.upcoming}</b><span>{m.count}</span><i className="up" /><i className="down" /></div>
        <div className="skj-mh-meet">
          <div><p className="skj-mh-when">{m.when} <span>{m.live}</span></p><b>{m.meeting}</b><span className="skj-mh-where">Jamo Meet</span></div>
          <span className="skj-mh-join"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="2" y="6" width="14" height="12" rx="3" /><path d="M17 10l5-3v10l-5-3z" /></svg>{m.join}</span>
        </div>
        <p className="skj-mh-swipe">{m.swipe}</p>
        <div className="skj-mh-row"><b>{m.mine}</b><span className="skj-mh-all">{m.all}</span></div>
        <ul className="skj-mh-tasks">
          {m.tasks.map((k) => (
            <li key={k.code}>
              <b>{k.title}</b>
              <span className="skj-mh-meta">{k.code}<em className={k.tone}>{k.status}</em></span>
              <span className={'skj-mh-due ' + k.tone}>{k.due}</span>
            </li>
          ))}
        </ul>
        <div className="skj-mh-bar">
          <nav>{m.tabs.map((tab, i) => <span key={i} className={i === 0 ? 'on' : ''}><TabIcon i={i} />{tab}{i === 2 && <em>6</em>}</span>)}</nav>
          <span className="skj-mh-jamo"><i /><i /></span>
        </div>
        <span className="skj-mh-home" />
      </div>
    </Scaled>
  );
}

/**
 * Jamo in the mobile app (the design's JamoPrototype, 390 × 844): who you're talking to and what it
 * sees, the last question and its answer, the meeting the answer booked, what to ask next, and the
 * composer with «Сказать».
 */
function MobileJamo({ effect }: { effect: EffectCardData }) {
  const { t } = useLang();
  const d = t.digest, m = d.phone;
  return (
    <Scaled width={390} height={844}>
      <div className="skj-mh skj-mj" role="img" aria-label={m.alt}>
        <div className="skj-mh-status"><b>9:41</b><span className="skj-sig"><i /><i /><i /><i /><em /></span></div>
        <div className="skj-mj-top">
          <JamoFace mood="reply2" size={40} />
          <span className="skj-mj-who"><b>MyJamo</b><small>{m.online}</small></span>
          <span className="skj-mj-new"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>{m.fresh}</span>
          <span className="skj-mj-close"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></span>
        </div>
        <div className="skj-mj-sees">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M8 12.5l3 3 5-6" /></svg>
          <span><small>{m.watching}</small><b>{m.screen}</b></span>
          <svg className="x" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </div>
        <div className="skj-mj-talk">
          <p className="skj-mj-from"><svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z" /></svg>{m.you}</p>
          <h4 className="skj-mj-ask">{d.ask}</h4>
          <p className="skj-mj-from jamo"><svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></svg>MyJamo</p>
          <p className="skj-mj-answer">{d.answer}</p>
          <JuiRoot><EffectCard card={effect} /></JuiRoot>
          <ul className="skj-mj-next">
            {m.next.map((q, i) => <li key={i}><NextIcon i={i} />{q}</li>)}
          </ul>
        </div>
        <div className="skj-mj-composer">
          <span>{m.placeholder}</span>
          <b><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>{m.say}</b>
        </div>
        <span className="skj-mh-home" />
      </div>
    </Scaled>
  );
}

/** What to ask next: a status to move, what's left, and a reminder. */
function NextIcon({ i }: { i: number }) {
  if (i === 2) return <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" className="fill" /><path d="M12 7v5l3 2" className="hand" /></svg>;
  return <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d={i === 0 ? 'M4 9h14l-3-3M20 15H6l3 3' : 'M4 7l2 2 3-3M4 16l2 2 3-3M12 8h8M12 17h8'} /></svg>;
}

function TabIcon({ i }: { i: number }) {
  const d = [
    'M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z',
    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12l3 3 5-6',
    'M4 5h16v11H9l-5 4z',
    'M4 6h16v14H4zM4 10h16M8 3v5M16 3v5',
    'M3 6h6l2 2h10v11H3z',
  ][i];
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true"><path d={d} /></svg>;
}

/* ---------- 19:00: who it's for; 19:30: the waitlist ---------- */

export function Audiences() {
  const { t } = useLang();
  return (
    <section className="sk-sec skj-who" data-at={19}>
      <div className="sk-head" data-reveal>
        <time className="sk-time">19:00</time>
        <h2><Morph text={t.audiences.title} /></h2>
        <p>{t.audiences.lead}</p>
      </div>
      <div className="sk-who">
        {t.audiences.items.map(([title, text], i) => (
          <article key={i} className="sk-glass" data-reveal style={{ transitionDelay: `${i * 70}ms` }}>
            <h3><Morph text={title} /></h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Final({ onState }: { onState?: (s: string) => void }) {
  const { t } = useLang();
  const [state, setState] = useState('open');
  const mood: Mood = state === 'joined' ? 'celebrate' : state === 'sending' ? 'working' : 'wink';
  useEffect(() => { onState?.(state); }, [state, onState]);
  return (
    <section className="sk-final" id="sk-join" data-at={DAY_TO}>
      <div className="sk-final-in sk-glass" data-reveal>
        <div className="sk-final-face"><JamoFace mood={mood} size={132} /></div>
        <time className="sk-time">19:30</time>
        <h2><Morph text={t.join.headline} /></h2>
        <p>{t.join.lead}</p>
        <JoinForm source="footer" onState={setState} />
      </div>
    </section>
  );
}
