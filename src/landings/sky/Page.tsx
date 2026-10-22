// Option C, "Glass over sky": the app's own canvas gradient grown into a sky, and the app's liquid glass
// laid on it, so the glass finally has something to refract. Scrolling runs one working day: the clock
// in the bar and the sky follow the section in the middle of the screen, 08:00 to 19:30, and each
// module gets its hour. Every screen is the app-UI kit; only its canvas is swapped for the sky.
// Its parts are exported for option 04 (src/landings/sky-jamo), which adds to this page without changing it.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { JamoFace, type Mood } from '../../JamoFace';
import { useBodyGround, useReveal } from '../../shared/reveal';
import { isEmail, JOIN, useWaitlist, type WaitlistSource } from '../../shared/waitlist';
import {
  AppWindow, Board, BoardToolbar, CalendarPage, CallStage, ChatsPanel, Conversation, ConversationHeader, DayDivider, DrivePage, EffectCard,
  HomeHeader, JamoAssistant, JuiRoot, type AiMessage, Logo, MessageBubble, ProjectHeader, Scaled, TaskCard, TaskChip, Toast,
} from '../../shared/app-ui';
import { ACME, AUDIENCES, BRAND, CARDS, DAY_FROM, DAY_TO, MOMENTS, PEOPLE, SKY, type Moment } from './data';
import './sky.css';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const mix = (a: string, b: string, k: number) => {
  const p = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * k)).join(',')})`;
};
export const clockOf = (h: number) => {
  const m = Math.floor(Math.round(h * 60) / 5) * 5;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};
export const partOf = (h: number) => (h < 12 ? 'утро' : h < 17 ? 'день' : 'вечер');

export default function Page() {
  const root = useRef<HTMLDivElement>(null);
  const hour = useDayClock(root);
  useBodyGround('#dce5f9');
  useReveal(root);
  return (
    <div className="sk" ref={root}>
      <Sky />
      <Nav hour={hour} />
      <main>
        <Hero />
        {MOMENTS.map((m, i) => <MomentSection key={m.id} m={m} flip={i % 2 === 1} />)}
        <Audiences />
        <Final />
      </main>
      <footer className="sk-foot">
        <span className="sk-brand"><Logo />MyJamo</span>
        <span>© 2026 MyJamo</span>
        <span className="sk-foot-links"><span>Конфиденциальность</span><span>Условия</span></span>
      </footer>
    </div>
  );
}

/**
 * The hour the page is at. Every `[data-at]` section pins an hour to its middle; between two of them
 * the hour runs on with the scroll. It also writes the sky: `--sk-*` colours and the sun's place.
 */
export function useDayClock(root: React.RefObject<HTMLDivElement | null>) {
  const [hour, setHour] = useState(DAY_FROM);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let raf = 0, last = -1;
    const frame = () => {
      raf = 0;
      const mid = innerHeight / 2;
      const pins = [...el.querySelectorAll<HTMLElement>('[data-at]')].map((s) => {
        const r = s.getBoundingClientRect();
        return { y: r.top + Math.min(r.height, innerHeight) / 2, at: Number(s.dataset.at) };
      });
      let h = pins[0].at;
      if (mid >= pins[pins.length - 1].y) h = pins[pins.length - 1].at;
      else for (let i = 0; i < pins.length - 1; i++) {
        const [a, b] = [pins[i], pins[i + 1]];
        if (mid >= a.y && mid < b.y) { h = a.at + (b.at - a.at) * (mid - a.y) / (b.y - a.y); break; }
      }
      paint(el, h);
      const q = Math.floor(h * 12);
      if (q !== last) { last = q; setHour(h); }
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(frame); };
    frame();
    addEventListener('scroll', on, { passive: true });
    addEventListener('resize', on);
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, [root]);
  return hour;
}

/** Sets the sky's colours for an hour, between its two nearest keyframes, and puts the sun on its arc. */
function paint(el: HTMLElement, h: number) {
  const i = Math.max(0, SKY.findIndex((_, j) => j === SKY.length - 1 || SKY[j + 1].at > h));
  const a = SKY[i], b = SKY[Math.min(i + 1, SKY.length - 1)];
  const k = b.at === a.at ? 0 : Math.min(1, Math.max(0, (h - a.at) / (b.at - a.at)));
  const t = (h - DAY_FROM) / (DAY_TO - DAY_FROM);
  el.style.setProperty('--sk-top', mix(a.top, b.top, k));
  el.style.setProperty('--sk-mid', mix(a.mid, b.mid, k));
  el.style.setProperty('--sk-low', mix(a.low, b.low, k));
  el.style.setProperty('--sk-sun', mix(a.sun, b.sun, k));
  el.style.setProperty('--sk-t', t.toFixed(4));
  el.style.setProperty('--sk-sun-x', `${8 + t * 84}vw`);
  el.style.setProperty('--sk-sun-y', `${62 - Math.sin(t * Math.PI) * 48}vh`);
  el.style.setProperty('--sk-dusk', Math.max(0, (t - 0.82) / 0.18).toFixed(3));
}

/* ---------- The sky: gradient, sun, clouds and, at dusk, the first stars ---------- */

const CLOUDS = [
  { x: 4, y: 18, w: 340, d: 0.5, s: 70 }, { x: 62, y: 10, w: 420, d: 0.8, s: 95 }, { x: 34, y: 46, w: 260, d: 0.35, s: 60 },
  { x: 78, y: 52, w: 380, d: 0.65, s: 110 }, { x: 14, y: 74, w: 460, d: 0.9, s: 130 }, { x: 52, y: 84, w: 300, d: 0.45, s: 80 },
];
const STARS = Array.from({ length: 22 }, (_, i) => ({ x: (i * 37) % 97 + 1.5, y: (i * 23) % 38 + 3, s: i % 3 === 0 ? 3 : 2, d: (i % 5) * 0.7 }));

export function Sky() {
  return (
    <div className="sk-sky" aria-hidden="true">
      <div className="sk-sun" />
      <div className="sk-stars">{STARS.map((s, i) => <i key={i} style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }} />)}</div>
      {CLOUDS.map((c, i) => (
        <div key={i} className="sk-cloud" style={{ left: `${c.x}%`, top: `${c.y}%`, width: c.w, '--d': c.d, animationDuration: `${c.s}s` } as React.CSSProperties}><i /><i /><i /></div>
      ))}
      <div className="sk-haze" />
    </div>
  );
}

/* ---------- Bar ---------- */

function Nav({ hour }: { hour: number }) {
  const to = (id: string) => (e: React.MouseEvent) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };
  return (
    <header className="sk-nav">
      <a className="sk-brand" href="#/l/sky" onClick={(e) => { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); }}><Logo />MyJamo</a>
      <nav>{MOMENTS.map((m) => <a key={m.id} href={'#sk-' + m.id} onClick={to('sk-' + m.id)}>{m.nav}</a>)}</nav>
      <span className="sk-clock" title="Время на странице: листайте — день идёт">
        <SunGlyph h={hour} /><b>{clockOf(hour)}</b><span>{partOf(hour)}</span>
      </span>
      <a className="sk-btn sk-btn-sm" href="#sk-join" onClick={to('sk-join')}>{JOIN.cta}</a>
    </header>
  );
}

/** A small sun that sinks toward the horizon line as the day goes. */
export function SunGlyph({ h }: { h: number }) {
  const t = (h - DAY_FROM) / (DAY_TO - DAY_FROM), y = 13 - Math.sin(t * Math.PI) * 7;
  return (
    <svg className="sk-sunglyph" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx={4 + t * 16} cy={y} r="3.6" />
      <path d="M2 17.5h20" />
    </svg>
  );
}

/* ---------- Hero: 08:00 ---------- */

export function Hero() {
  const win = useRef<HTMLDivElement>(null);
  // The window lies back and stands up over the first screen of scrolling.
  useEffect(() => {
    if (reduced()) return;
    let raf = 0;
    const on = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; win.current?.style.setProperty('--tilt', Math.max(0, 1 - scrollY / (innerHeight * 0.7)).toFixed(3)); });
    };
    on();
    addEventListener('scroll', on, { passive: true });
    return () => { removeEventListener('scroll', on); cancelAnimationFrame(raf); };
  }, []);
  return (
    <section className="sk-hero" data-at={DAY_FROM}>
      <div className="sk-hero-copy">
        <span className="sk-pill"><b />Ранний доступ откроется этой зимой</span>
        <h1>Весь рабочий день —<br /><span>в одном окне.</span></h1>
        <p className="sk-lead">Чаты, доски, календарь, звонки и диск знают друг о друге. А Jamo AI превращает переписку в задачи и встречи — с первого сообщения утром до итогов вечером.</p>
        <JoinForm source="hero" />
      </div>
      <div className="sk-hero-win" ref={win}>
        <Scaled width={1440} height={900} className="sk-scaled">
          <AppWindow rail="home" height={900} bare main={
            <div className="sk-home">
              <HomeHeader open={7} today={2} overdue={1} />
              <Board compact columns={[
                { status: 'todo', tasks: [{ ...CARDS.landing, project: ACME }, { ...CARDS.onboarding, project: BRAND }] },
                { status: 'progress', tasks: [{ ...CARDS.chats, project: ACME }] },
                { status: 'review', tasks: [{ ...CARDS.scroll, project: ACME }, { ...CARDS.dates, project: ACME }] },
                { status: 'done', tasks: [{ ...CARDS.release, project: BRAND }] },
              ]} />
            </div>
          } side={
            <ChatsPanel tabs={['Все', 'Проекты', 'Личные']} rows={[
              { kind: 'assistant', preview: 'Доброе утро! 3 задачи и 2 встречи' },
              { kind: 'project', name: 'Сайт Acme', id: 'acme', preview: 'Алишер: Макет готов к ревью', time: '08:02', live: true },
              { kind: 'direct', person: PEOPLE.dilnoza, preview: 'Глянешь сборку?', time: '07:48', unread: 2, presence: 'online' },
              { kind: 'project', name: 'Бренд 2026', id: 'brand-2026', preview: 'Бобур: Загрузил новые иконки', time: 'вчера' },
              { kind: 'direct', person: PEOPLE.jasur, preview: 'Увидимся на стендапе', time: 'вчера' },
            ]} />
          } />
        </Scaled>
      </div>
      <p className="sk-hint"><i />Листайте — день начнётся</p>
    </section>
  );
}

/* ---------- One module at its hour ---------- */

export function MomentSection({ m, flip }: { m: Moment; flip: boolean }) {
  return (
    <section className={'sk-moment' + (flip ? ' flip' : '') + ' m-' + m.id} id={'sk-' + m.id} data-at={m.at}>
      <div className="sk-moment-copy" data-reveal>
        <time className="sk-time">{clockOf(m.at)}</time>
        <span className="sk-eyebrow">{m.eyebrow}</span>
        <h2>{m.title}</h2>
        <p>{m.text}</p>
        <ul className={m.id === 'jamo' ? 'sk-steps' : ''}>
          {m.points.map((p, i) => <li key={p}>{m.id === 'jamo' && <span>{String(i + 1).padStart(2, '0')}</span>}{p}</li>)}
        </ul>
      </div>
      <div className="sk-moment-shot" data-reveal>{SHOTS[m.id]}</div>
    </section>
  );
}

/** A window that floats: the screen, plus whatever Jamo left on top of it. */
export function Float({ children, extra, width = 1440, height = 960 }: { children: ReactNode; extra?: ReactNode; width?: number; height?: number }) {
  return (
    <div className="sk-float">
      <Scaled width={width} height={height} className="sk-scaled">{children}</Scaled>
      {extra && <JuiRoot className="sk-extra">{extra}</JuiRoot>}
    </div>
  );
}

export const SHOTS: Record<string, ReactNode> = {
  chats: (
    <Float height={860} extra={<EffectCard card={{ code: 'ACM-24', badge: 'Создана', title: 'Сделать макет страницы «Чаты»', meta: 'В прогрессе · Срок 16 окт · Алишер' }} />}>
      <AppWindow rail="chats" height={860} bare main={
        <ChatsPanel expanded flat style={{ height: '100%' }} tabs={['Все', 'Сайт Acme', 'Бренд 2026']} rows={[
          { kind: 'assistant', preview: 'Доброе утро! 3 задачи и 2 встречи' },
          { kind: 'project', name: 'Сайт Acme', id: 'acme', preview: 'Вы: Привязал к задаче релиза', time: '09:10', selected: true, live: true },
          { kind: 'direct', person: PEOPLE.dilnoza, preview: 'Глянешь сборку?', time: '08:51', unread: 2 },
          { kind: 'direct', person: PEOPLE.alisher, preview: 'Макет готов к ревью', time: '08:40' },
          { kind: 'project', name: 'Бренд 2026', id: 'brand-2026', preview: 'Бобур: Загрузил новые иконки', time: 'вчера' },
          { kind: 'direct', person: PEOPLE.bobur, preview: 'Спасибо!', time: 'вчера' },
        ]} conversation={
          <Conversation expanded who={{ kind: 'channel', name: '# Сайт Acme', sub: '6 участников' }}>
            <DayDivider>Сегодня</DayDivider>
            <MessageBubble author={PEOPLE.alisher} avatar={PEOPLE.alisher} text="Макет страницы «Чаты» готов к ревью." time="09:02" tail />
            <MessageBubble author={PEOPLE.dilnoza} avatar={PEOPLE.dilnoza} text="Отлично. Выпускаем вместе с 2.4." time="09:06" tail />
            <MessageBubble mine text="Привязал его к задаче релиза." time="09:10" read attach={<TaskChip chip={{ code: 'ACM-24', title: 'Сделать макет страницы «Чаты»', trailing: '16 окт', tint: 'ahead' }} />} />
          </Conversation>
        } />
      } />
    </Float>
  ),
  board: (
    <Float height={860} extra={<div className="sk-lifted"><TaskCard task={CARDS.chats} lifted /></div>}>
      <AppWindow rail="boards" height={860} main={<>
        <ProjectHeader project={ACME} members={6} openTasks={7} unread={2} />
        <BoardToolbar />
        <Board over={2} columns={[
          { status: 'todo', tasks: [CARDS.landing, CARDS.onboarding] },
          { status: 'progress', tasks: [CARDS.review] },
          { status: 'review', tasks: [CARDS.scroll, CARDS.dates] },
          { status: 'done', tasks: [CARDS.release] },
        ]} />
      </>} />
    </Float>
  ),
  calendar: (
    <Float height={860} extra={
      <div className="sk-call">
        <Scaled width={760} height={500}>
          <JuiRoot style={{ width: 760, height: 500, display: 'flex' }}>
            <CallStage title="Дизайн-ревью" context="Acme Studio · # Сайт Acme" clock="00:04" cols={2} panel={false} tiles={[
              { person: PEOPLE.dilnoza, speaking: true }, { person: PEOPLE.alisher, muted: true }, { person: PEOPLE.bobur }, { person: PEOPLE.dev, you: true },
            ]} />
          </JuiRoot>
        </Scaled>
      </div>
    }>
      <AppWindow rail="calendar" height={860} main={
        <CalendarPage period="12 – 18 октября" legend={[{ name: 'Личный', tone: 'personal' }, { name: 'Сайт Acme', tone: 'purple' }, { name: 'Бренд 2026', tone: 'green' }, { name: 'Сроки задач', tone: '', icon: 'tasks' }]}
          days={[{ wd: 'Пн', num: 12 }, { wd: 'Вт', num: 13 }, { wd: 'Ср', num: 14, today: true }, { wd: 'Чт', num: 15 }, { wd: 'Пт', num: 16 }, { wd: 'Сб', num: 17 }, { wd: 'Вс', num: 18 }]}
          from={9} to={17} hour={64}
          events={[
            { day: 0, start: 10, end: 10.25, title: 'Ежедневный стендап', tone: 'purple' },
            { day: 1, start: 10, end: 10.25, title: 'Ежедневный стендап', tone: 'purple' },
            { day: 2, start: 10, end: 10.25, title: 'Ежедневный стендап', tone: 'purple' },
            { day: 1, start: 11, end: 12, title: 'Синк по дизайну', tone: 'green' },
            { day: 2, start: 12, end: 13, title: 'Командный обед', tone: 'personal' },
            { day: 2, start: 14, end: 15, title: 'Дизайн-ревью', tone: 'orange', found: true },
            { day: 3, start: 15, end: 16.5, title: 'Демо', tone: 'orange' },
            { day: 4, start: 11, end: 12.5, title: 'Планирование спринта', tone: 'purple' },
          ]} now={{ day: 2, at: 14.05 }} />
      } />
    </Float>
  ),
  drive: (
    <Float height={760} extra={<Toast action="Открыть">Договор BLINQ.docx — в «Сайт Acme»</Toast>}>
      <AppWindow rail="library" height={760} main={<DrivePage projects={['Сайт Acme', 'Бренд 2026']} rows={[
        { kind: 'folder', name: 'Design review', owner: PEOPLE.dev, date: '07.10.2026' },
        { kind: 'folder', name: 'Релиз 2.4', owner: PEOPLE.bobur, date: '09.10.2026' },
        { kind: 'file', name: 'Договор BLINQ.docx', owner: PEOPLE.dilnoza, date: '14.10.2026', size: '48 KB', selected: true },
        { kind: 'file', name: 'Бриф релиза 2.4.pdf', owner: PEOPLE.dev, date: '10.10.2026', size: '635.3 KB' },
        { kind: 'picture', name: 'Макет «Чаты».png', owner: PEOPLE.alisher, date: '14.10.2026', size: '2.4 MB' },
        { kind: 'picture', name: 'Обложка.png', owner: PEOPLE.dilnoza, date: '12.10.2026', size: '1.2 MB' },
      ]} />} />
    </Float>
  ),
  jamo: <JamoEvening />,
};

/** What the 18:05 conversation says, in order; a beat shows the first `shown` of them. The 5th is Jamo's change. */
const EVENING: { text: string; mine?: true }[] = [
  { text: 'Что мы сделали сегодня?', mine: true },
  { text: 'Закрыто 6 задач, назначены 2 встречи, Дилноза загрузила договор BLINQ.' },
  { text: 'Одна задача просрочена — «Исправить баг с датами». Перенести срок на завтра?' },
  { text: 'Да, на утро', mine: true },
  { text: '' },
  { text: 'Спасибо!', mine: true },
  { text: 'Хорошего вечера! Утром напомню про стендап.' },
];

/** Which of the section's four steps a face belongs to: listens, thinks, does, confirms. */
const STAGE: Partial<Record<Mood, number>> = { listening: 0, think2: 1, working: 2, celebrate: 3 };

/** One frame of the scene: how much of the conversation is out, what the composer holds, and Jamo's face. */
type Beat = { ms: number; shown: number; mood: Mood; label: string; typed?: string; typing?: boolean };

/** The user types `text` into the composer a letter at a time while Jamo listens. */
const typeOut = (text: string, shown: number): Beat[] =>
  [...text].map((_, i) => ({ ms: 55, shown, mood: 'listening', label: 'слушает', typed: text.slice(0, i + 1) }));

const BEATS: Beat[] = [
  { ms: 1000, shown: 0, mood: 'idle', label: 'на связи' },
  ...typeOut(EVENING[0].text, 0),
  { ms: 400, shown: 1, mood: 'listening', label: 'слушает' },
  { ms: 1700, shown: 1, mood: 'think2', label: 'думает', typing: true },
  { ms: 2300, shown: 2, mood: 'happy', label: 'рад' },
  { ms: 2900, shown: 3, mood: 'confused', label: 'переживает' },
  ...typeOut(EVENING[3].text, 3),
  { ms: 400, shown: 4, mood: 'listening', label: 'слушает' },
  { ms: 1600, shown: 4, mood: 'working', label: 'делает', typing: true },
  { ms: 2600, shown: 5, mood: 'celebrate', label: 'готово' },
  ...typeOut(EVENING[5].text, 5),
  { ms: 400, shown: 6, mood: 'listening', label: 'слушает' },
  { ms: 900, shown: 6, mood: 'think2', label: 'думает', typing: true },
  { ms: 3200, shown: 7, mood: 'wink', label: 'до завтра' },
  { ms: 1600, shown: 7, mood: 'idle', label: 'на связи' },
];

/**
 * 18:05: Jamo's panel as the app draws it, playing the evening's conversation by itself. The user's
 * lines type into the composer and send, Jamo thinks with dots, answers and makes its one change, and
 * the face in the orb follows: listening, thinking, glad, worried about the overdue task, working,
 * celebrating, winking goodbye. It plays only while on screen and starts over at the end; under
 * reduced motion it stands still on the finished conversation. «Отменить» on the card still works.
 */
export function JamoEvening() {
  const root = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(reduced() ? BEATS.length - 2 : 0);
  const [undone, setUndone] = useState(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el || reduced()) return;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!seen) return;
    const t = setTimeout(() => setStep((i) => (i + 1) % BEATS.length), BEATS[step].ms);
    return () => clearTimeout(t);
  }, [seen, step]);

  // A new round starts with the change still in place.
  useEffect(() => { if (step === 0) setUndone(false); }, [step]);

  const beat = BEATS[step];
  const messages: AiMessage[] = EVENING.slice(0, beat.shown).map((m, i) => i === 4
    ? { effect: { code: 'ACM-13', badge: 'Срок 15 окт', title: 'Исправить баг с датами в календаре', meta: 'На проверке · Срок 15 окт, 10:00', undone, onUndo: () => setUndone(true), onOpen: () => setUndone(false) } }
    : { text: m.text, mine: m.mine });
  if (beat.typing) messages.push({ text: <span className="sk-typing" aria-label="Jamo печатает"><i /><i /><i /></span> });
  const [mood, label] = undone && beat.shown >= 5 ? ['surprised' as Mood, 'отменил'] : [beat.mood, beat.label];

  // The section's own «01 Слушает … 04 Подтверждает» light up with the step Jamo is on.
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
      <JuiRoot className={'sk-ai' + (step === BEATS.length - 1 ? ' sk-ai-out' : '')}>
        <ConversationHeader who={{ kind: 'assistant' }} />
        <JamoAssistant starters={[]} mic typed={beat.typed} messages={messages.length ? messages : undefined} greeting="Добрый вечер!" lead="Спросите, что было за день — расскажу и сделаю" mood={mood} faceSize={96} />
      </JuiRoot>
    </div>
  );
}

/* ---------- 19:00: who it's for; 19:30: the waitlist ---------- */

export function Audiences() {
  return (
    <section className="sk-sec" data-at={19}>
      <div className="sk-head" data-reveal>
        <time className="sk-time">19:00</time>
        <h2>Один сервис вместо пяти.</h2>
        <p>Для одного человека и для тысячи.</p>
      </div>
      <div className="sk-who">
        {AUDIENCES.map((a, i) => (
          <article key={a.title} className="sk-glass" data-reveal style={{ transitionDelay: `${i * 70}ms` }}>
            <h3>{a.title}</h3>
            <p>{a.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Final() {
  const [state, setState] = useState('open');
  const mood: Mood = state === 'joined' ? 'celebrate' : state === 'sending' ? 'working' : 'wink';
  return (
    <section className="sk-final" id="sk-join" data-at={DAY_TO}>
      <div className="sk-final-in sk-glass" data-reveal>
        <div className="sk-final-face"><JamoFace mood={mood} size={132} /></div>
        <time className="sk-time">19:30</time>
        <h2>{JOIN.headline}</h2>
        <p>{JOIN.lead}</p>
        <JoinForm source="footer" onState={setState} />
      </div>
    </section>
  );
}

export function JoinForm({ source, onState }: { source: WaitlistSource; onState?: (s: string) => void }) {
  const w = useWaitlist(source);
  const [email, setEmail] = useState('');
  useEffect(() => { onState?.(w.state); }, [w.state, onState]);
  if (w.state === 'joined') return <p className="sk-joined">✓ {JOIN.joined}</p>;
  const entered = email.trim().toLowerCase();
  return (
    <form className="sk-join" onSubmit={(e) => { e.preventDefault(); w.submit('email', isEmail(entered) ? entered : null); }} noValidate>
      <div className="sk-join-row">
        <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); w.clearError(); }} placeholder={JOIN.placeholder} aria-label="Email" aria-invalid={!!w.error} />
        <button className="sk-btn" type="submit" disabled={w.state === 'sending'}>{w.state === 'sending' ? JOIN.sending : JOIN.cta}</button>
      </div>
      {w.error && <p className="sk-err" role="alert">{w.error}</p>}
    </form>
  );
}
