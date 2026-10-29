// The top of the page: the bar, the hero at 08:00 with its waitlist form, and the footer. These load
// with the page; the rest of the day (sections.tsx) comes in its own file right after, so a slow
// connection shows the first screen sooner.
import { useEffect, useMemo, useRef, useState } from 'react';
import { JamoFace } from '../../JamoFace';
import { toE164, type PhoneValue } from '../../shared/phone';
import { isEmail, useWaitlist, type Contact, type WaitlistSource } from '../../shared/waitlist';
import { AppWindow, Board, ChatsPanel, HomeHeader, Logo, Scaled, type TaskCardData } from '../../shared/app-ui';
import { DAY_FROM } from '../sky/data';
import { clockOf } from '../sky/Page';
import { LANGS, type Copy } from './copy';
import { useDayClock } from './clock';
import { PhoneField } from './phone';
import { LangSwitch, Morph, useLang } from './i18n';

export const DOWNLOAD = '#/download';
export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Whether a media query matches, kept up to date. */
export function useMedia(query: string) {
  const [on, setOn] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const mq = matchMedia(query);
    const change = () => setOn(mq.matches);
    change();
    mq.addEventListener('change', change);
    return () => mq.removeEventListener('change', change);
  }, [query]);
  return on;
}

/**
 * Takes the reader to a waitlist form with the cursor already in it: the one on screen if there is
 * one, otherwise the last on the page. On a phone it jumps rather than glides, so the keyboard comes
 * up at once and not after a long scroll through the day.
 */
export function toJoin(e: React.MouseEvent) {
  e.preventDefault();
  const forms = [...document.querySelectorAll<HTMLFormElement>('.sk-join')];
  const form = forms.find((f) => { const r = f.getBoundingClientRect(); return r.top > 64 && r.bottom < innerHeight; }) ?? forms[forms.length - 1];
  const to = form ?? document.getElementById('sk-join');
  if (!to) return;
  const jump = reduced() || matchMedia('(pointer: coarse)').matches;
  to.scrollIntoView({ behavior: jump ? 'auto' : 'smooth', block: 'center' });
  form?.querySelector<HTMLInputElement>('input[name]')?.focus({ preventScroll: true });
}

/* ---------- Who and what the screens show, in the page's language ---------- */

function world(t: Copy) {
  const people = {
    dev: { name: 'Dev One', photo: true as const },
    dilnoza: { name: t.people.dilnoza },
    alisher: { name: t.people.alisher },
    bobur: { name: t.people.bobur },
    jasur: { name: t.people.jasur },
  };
  const site = { name: t.project.site, id: 'orzu' };
  const brand = { name: t.project.brand, id: 'brand-2026' };
  const cards: Record<string, TaskCardData> = {
    review: { title: t.cards.review, code: 'ORZ-11', people: [people.dilnoza], type: 'story' },
    chats: { title: t.cards.chats, code: 'ORZ-24', priority: 'high', people: [people.alisher], type: 'feature', due: '16.10.2026', comments: 2 },
    scroll: { title: t.cards.scroll, code: 'ORZ-19', priority: 'urgent', people: [people.dilnoza], type: 'feature', comments: 1 },
    dates: { title: t.cards.dates, code: 'ORZ-13', priority: 'high', due: '14.10.2026', overdue: true, type: 'bug' },
    release: { title: t.cards.release, code: 'ORZ-21', people: [people.bobur], type: 'task', subtasks: [2, 3] },
    onboarding: { title: t.cards.onboarding, code: 'ORZ-17', priority: 'low', people: [people.jasur, people.dev], type: 'task' },
    landing: { title: t.cards.landing, code: 'ORZ-25', people: [people.dev], type: 'task', due: '20.10.2026' },
  };
  const days = t.calendar.days.map((wd, i) => ({ wd, num: 12 + i, today: i === 2 }));
  return { people, site, brand, cards, days };
}

export function useWorld() {
  const { t } = useLang();
  return useMemo(() => world(t), [t]);
}

/* ---------- Bar ---------- */

/**
 * The bar keeps to three things: the brand, the page's clock in the middle, and the language and the
 * waitlist at the right. The sections are found by scrolling, and the download page from 18:40 and the footer.
 */
export function Nav({ root, home }: { root: React.RefObject<HTMLDivElement | null>; home?: boolean }) {
  const { t } = useLang();
  return (
    <header className="sk-nav">
      <a className="sk-brand" href="#/" onClick={home ? undefined : (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }); }}><Logo />MyJamo</a>
      {home
        ? <a href="#/" className="skj-back" aria-label={t.download.back}><BackGlyph /><Morph text={t.download.back} /></a>
        : <DayClock root={root} />}
      <div className="skj-nav-end">
        <LangSwitch />
        <a className="sk-btn sk-btn-sm skj-nav-cta" href="#sk-join" onClick={toJoin}>
          <span className="skj-cta-long"><Morph text={t.join.cta} /></span>
          <span className="skj-cta-short">{t.join.short}</span>
        </a>
      </div>
    </header>
  );
}

/** From this hour the bar shows the moon: the sky has gone to dusk by then. */
const MOONRISE = 18;

/** The page's clock: the sun by day and the moon in the evening, the time, and the part of the day in words. */
function DayClock({ root }: { root: React.RefObject<HTMLDivElement | null> }) {
  const { t } = useLang();
  const hour = useDayClock(root);
  return (
    <span className="sk-clock" title={t.clockTitle}>
      <i className={'skj-sky-ico' + (hour >= MOONRISE ? ' night' : '')} aria-hidden="true">
        <svg className="skj-sun" viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" /></svg>
        <svg className="skj-moon" viewBox="0 0 24 24" width="18" height="18"><path d="M19.5 14.6A8 8 0 0 1 9.4 4.5a8 8 0 1 0 10.1 10.1z" /></svg>
      </i>
      <b>{clockOf(hour)}</b><span>{t.part[hour < 12 ? 0 : hour < 17 ? 1 : 2]}</span>
    </span>
  );
}

function BackGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

export function DownloadGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />
    </svg>
  );
}

/* ---------- Hero: 08:00 ---------- */

export function Hero() {
  const { t } = useLang();
  const w = useWorld();
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
        <h1><Morph text={t.hero.h1a} /><br /><span className="skj-h1b"><Morph text={t.hero.h1b} /></span></h1>
        <p className="sk-lead">{t.hero.lead}</p>
        <JoinForm source="hero" note />
      </div>
      <div className="sk-hero-win" ref={win}>
        <Scaled width={1440} height={900} className="sk-scaled">
          <AppWindow rail="home" chatsOpen={false} height={900} bare main={
            <div className="sk-home">
              <HomeHeader open={7} today={2} overdue={1} />
              <Board compact columns={[
                { status: 'todo', tasks: [{ ...w.cards.landing, project: w.site }, { ...w.cards.onboarding, project: w.brand }] },
                { status: 'progress', tasks: [{ ...w.cards.chats, project: w.site }] },
                { status: 'review', tasks: [{ ...w.cards.scroll, project: w.site }, { ...w.cards.dates, project: w.site }] },
                { status: 'done', tasks: [{ ...w.cards.release, project: w.brand }] },
              ]} />
            </div>
          } side={
            <ChatsPanel tabs={t.chats.tabs} rows={[
              { kind: 'assistant', preview: t.chats.morning },
              { kind: 'project', name: w.site.name, id: w.site.id, preview: t.chats.ready, time: '08:02', live: true },
              { kind: 'direct', person: w.people.dilnoza, preview: t.chats.build, time: '07:48', unread: 2, presence: 'online' },
              { kind: 'project', name: w.brand.name, id: w.brand.id, preview: t.chats.icons, time: t.chats.yesterday },
              { kind: 'direct', person: w.people.jasur, preview: t.chats.standup, time: t.chats.yesterday },
            ]} />
          } />
        </Scaled>
      </div>
      <p className="sk-hint"><i />{t.hero.hint}</p>
    </section>
  );
}

/**
 * The waitlist's field and button: a phone number first, with an address one click away. With
 * `note`, a line under them says what the number or the address is for.
 */
export function JoinForm({ source, note, onState }: { source: WaitlistSource; note?: boolean; onState?: (s: string) => void }) {
  const { t, lang } = useLang();
  const j = t.join;
  const locale = LANGS.find((l) => l.code === lang)!.html;
  const w = useWaitlist(source, { locale, failed: j.failed, invalid: j.invalid, invalidPhone: j.invalidPhone });
  const [contact, setContact] = useState<Contact>('phone');
  const [phone, setPhone] = useState<PhoneValue>({ country: 'UZ', text: '' });
  const [email, setEmail] = useState('');
  const field = useRef<HTMLInputElement>(null);
  useEffect(() => { onState?.(w.state); }, [w.state, onState]);
  if (w.state === 'joined') return <p className="sk-joined">✓ {j.joined}</p>;
  const byPhone = contact === 'phone';
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const address = email.trim().toLowerCase();
    w.submit(contact, byPhone ? toE164(phone) : isEmail(address) ? address : null);
  };
  const toggle = () => {
    setContact(byPhone ? 'email' : 'phone');
    w.clearError();
    requestAnimationFrame(() => field.current?.focus());
  };
  return (
    <form className="sk-join" onSubmit={send} noValidate>
      <div className="sk-join-row">
        {byPhone
          ? <PhoneField value={phone} onChange={(v) => { setPhone(v); w.clearError(); }} invalid={!!w.error} locale={locale} text={j} inputRef={field} />
          : <input ref={field} type="email" value={email} onChange={(e) => { setEmail(e.target.value); w.clearError(); }} placeholder={j.placeholder} aria-label={j.email} aria-invalid={!!w.error}
              name="email" autoComplete="email" inputMode="email" enterKeyHint="send" autoCapitalize="off" autoCorrect="off" spellCheck={false} />}
        <button className="sk-btn" type="submit" disabled={w.state === 'sending'}>{w.state === 'sending' ? j.sending : <Morph text={j.cta} />}</button>
      </div>
      {w.error && <p className="sk-err" role="alert">{w.error}</p>}
      <button type="button" className="skj-switch" onClick={toggle} disabled={w.state === 'sending'}>{byPhone ? j.toEmail : j.toPhone}</button>
      {note && <p className="skj-why">{byPhone ? j.why : j.whyEmail}</p>}
    </form>
  );
}

/** Jamo thinking, as index.html shows it before the script: in the place of a part still loading. */
export function Loading({ tall }: { tall?: boolean }) {
  const { t } = useLang();
  return <div className={'skj-loading' + (tall ? ' tall' : '')} role="status" aria-label={t.loading}><JamoFace mood="think2" size={72} track={false} /></div>;
}

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="sk-foot">
      <span className="sk-brand"><Logo />MyJamo</span>
      <span className="sk-foot-links"><a href={DOWNLOAD}>{t.nav.download}</a><span>{t.foot.privacy}</span><span>{t.foot.terms}</span></span>
      <small className="skj-foot-legal">© 2026 B2B HAMKOR SOLUTIONS MChJ</small>
    </footer>
  );
}
