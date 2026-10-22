// The landing's download page (#/download): where the apps will be. The web version opens
// first, with early access; the desktop and mobile apps are coming soon, so their buttons say so and
// the page offers to write when they are out. It guesses the reader's system and puts that first.
import { useEffect, useMemo, useRef, useState } from 'react';
import { JamoFace } from '../../JamoFace';
import { AppWindow, Board, HomeHeader, Scaled } from '../../shared/app-ui';
import { Sky } from '../sky/Page';
import { paintSky } from './clock';
import { useLang, Morph } from './i18n';
import { MobileHome, PlatformIcon } from './sections';
import { DownloadGlyph, Footer, JoinForm, Nav, toJoin, useWorld } from './top';

type Os = 'mac' | 'win' | 'linux' | 'ios' | 'android';
const OS_NAME: Record<Os, string> = { mac: 'macOS', win: 'Windows', linux: 'Linux', ios: 'iOS', android: 'Android' };

function detect(): Os | null {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Mac/.test(ua)) return 'mac';
  if (/Win/.test(ua)) return 'win';
  if (/Linux|X11/.test(ua)) return 'linux';
  return null;
}

export function DownloadPage({ root }: { root: React.RefObject<HTMLDivElement | null> }) {
  const { t } = useLang();
  const d = t.download;
  const os = useMemo(detect, []);
  const kind = os === 'ios' || os === 'android' ? 'mobile' : os ? 'desktop' : null;
  // The sky stands still here, in the late afternoon.
  useEffect(() => { if (root.current) paintSky(root.current, 16.6); }, [root]);

  const cards = [
    { id: 'web', node: (
      <PlatformCard key="web" id="web" title={d.web.title} text={d.web.text} badge={t.anywhere.early} early>
        <a className="sk-btn skj-dl-go" href="#sk-join" onClick={toJoin}><Morph text={d.early} /></a>
      </PlatformCard>
    ) },
    { id: 'desktop', node: (
      <PlatformCard key="desktop" id="desktop" title={d.desktop.title} text={d.desktop.text} badge={d.soon} yours={kind === 'desktop' ? d.yours : undefined}>
        <ul className="skj-builds">
          {(['mac', 'win', 'linux'] as const).map((k) => (
            <li key={k} className={os === k ? 'mine' : ''}>
              <OsGlyph os={k} />
              <span><b>{OS_NAME[k]}</b><small>{d.builds[k]}</small></span>
              <button type="button" disabled aria-label={`${OS_NAME[k]}, ${d.soon}`}><DownloadGlyph />{d.soon}</button>
            </li>
          ))}
        </ul>
      </PlatformCard>
    ) },
    { id: 'mobile', node: (
      <PlatformCard key="mobile" id="mobile" title={d.mobile.title} text={d.mobile.text} badge={d.soon} yours={kind === 'mobile' ? d.yours : undefined}>
        <div className="skj-stores">
          <Store os="ios" mine={os === 'ios'} soon={d.storeSoon} sub={d.builds.ios} />
          <Store os="android" mine={os === 'android'} soon={d.storeSoon} sub={d.builds.android} />
        </div>
      </PlatformCard>
    ) },
  ];
  // The reader's own kind of device goes first, then the rest in their usual order.
  const order = kind ? [...cards.filter((c) => c.id === kind), ...cards.filter((c) => c.id !== kind)] : cards;

  return (
    <>
      <Sky />
      <Nav root={root} home />
      <main className="skj-dl">
        <section className="skj-dl-hero">
          <div className="skj-dl-face"><JamoFace mood="happy" size={88} /></div>
          <span className="sk-eyebrow"><Morph text={d.eyebrow} /></span>
          <h1><Morph text={d.title} /></h1>
          <p className="sk-lead">{d.lead}</p>
          {os && <span className="sk-pill"><OsGlyph os={os} />{d.detected(OS_NAME[os])}</span>}
        </section>
        <Showcase />
        <div className="skj-dl-grid">{order.map((c) => c.node)}</div>
        <ul className="skj-perks" data-reveal>
          {d.perks.map((p, i) => <li key={i}><Check />{p}</li>)}
        </ul>
        <section className="sk-final" id="sk-join">
          <div className="sk-final-in sk-glass" data-reveal>
            <div className="sk-final-face"><JamoFace mood="wink" size={120} /></div>
            <h2><Morph text={d.notify} /></h2>
            <p>{d.notifyLead}</p>
            <JoinForm source="footer" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function PlatformCard({ id, title, text, badge, early, yours, children }: { id: string; title: string; text: string; badge: string; early?: boolean; yours?: string; children: React.ReactNode }) {
  const card = useRef<HTMLElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number } | null>(null);
  // The card leans a touch toward the pointer, and its glass catches the light where the pointer is.
  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const r = card.current!.getBoundingClientRect();
    setTilt({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
  };
  const style = tilt ? { '--rx': `${(0.5 - tilt.y) * 5}deg`, '--ry': `${(tilt.x - 0.5) * 6}deg`, '--mx': `${tilt.x * 100}%`, '--my': `${tilt.y * 100}%` } as React.CSSProperties : undefined;
  return (
    // The reveal owns the article's transform; the lean is on the card inside it.
    <article ref={card} className="skj-dl-cell" data-reveal onPointerMove={move} onPointerLeave={() => setTilt(null)}>
      <div className={'skj-dl-card sk-glass' + (yours ? ' yours' : '') + (tilt ? ' lean' : '')} style={style}>
        {yours && <span className="skj-yours">{yours}</span>}
        <header>
          <span className="skj-ico"><PlatformIcon id={id} /></span>
          <span className={'skj-badge' + (early ? ' early' : '')}><span>{badge}</span></span>
        </header>
        <h3><Morph text={title} /></h3>
        <p>{text}</p>
        <div className="skj-dl-actions">{children}</div>
      </div>
    </article>
  );
}

function Store({ os, mine, soon, sub }: { os: 'ios' | 'android'; mine: boolean; soon: string; sub: string }) {
  return (
    <div className={'skj-store' + (mine ? ' mine' : '')} aria-disabled="true">
      <OsGlyph os={os} />
      <span><small>{soon}</small><b>{os === 'ios' ? 'App Store' : 'Google Play'}</b></span>
      <em>{sub}</em>
    </div>
  );
}

/** The three apps together: the desktop app over the browser, and the phone in front. */
function Showcase() {
  const w = useWorld();
  return (
    <div className="skj-dl-show" data-reveal aria-hidden="true">
      <div className="skj-dl-desk">
        <div className="skj-title"><span className="skj-lights"><i /><i /><i /></span><b>MyJamo</b></div>
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
      </div>
      <div className="skj-phone skj-shot-phone skj-dl-phone">
        <div className="skj-phone-screen"><MobileHome /><span className="skj-island" /></div>
      </div>
    </div>
  );
}

function Check() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 8.5 6.5 11.5 12.5 4.5" /></svg>;
}

function OsGlyph({ os }: { os: Os }) {
  const s = { width: 18, height: 18, viewBox: '0 0 24 24', 'aria-hidden': true } as const;
  if (os === 'mac' || os === 'ios') return <svg {...s} fill="currentColor"><path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.9-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.6 1.3-2.6s-2.5-1-2.5-3.8zM14.1 5.8c.6-.8 1.1-1.8 1-2.8-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.7-1 2.7 1 .1 2-.5 2.7-1.3z" /></svg>;
  if (os === 'win') return <svg {...s} fill="currentColor"><path d="M3 5.5 10 4.5v7H3zM11 4.3 21 3v8.5H11zM3 12.5h7v7l-7-1zM11 12.5h10V21l-10-1.4z" /></svg>;
  if (os === 'android') return <svg {...s} fill="currentColor"><path d="M7 9h10v8a1 1 0 0 1-1 1h-1v3h-2v-3h-2v3H9v-3H8a1 1 0 0 1-1-1zM4 9.5a1 1 0 0 1 2 0v5a1 1 0 0 1-2 0zM18 9.5a1 1 0 0 1 2 0v5a1 1 0 0 1-2 0zM7.2 8a5 5 0 0 1 9.6 0zM9.5 4.2l-1-1.6M14.5 4.2l1-1.6" stroke="currentColor" strokeWidth="1" /></svg>;
  return <svg {...s} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M12 3c2 0 3 2 3 4.5s1 3.5 2.5 5.5 2 4 .5 5.5c-1 1-2.5.5-3.5 1.5h-5C8.5 19 7 19.5 6 18.5c-1.5-1.5-1-3.5.5-5.5S9 10 9 7.5 10 3 12 3z" /><circle cx="10.5" cy="8" r=".6" fill="currentColor" /><circle cx="13.5" cy="8" r=".6" fill="currentColor" /></svg>;
}
