// The frame every signed-in screen sits in (features/org/org-shell.ts): the gradient, the rail
// (features/org/sidebar.ts), the page's glass panel and, docked at the right, the chats panel.
import type { CSSProperties, ReactNode } from 'react';
import './app-ui.css';
import { RAIL, type RailKey } from './catalog';
import { Logo, RailGlyph } from './icons';
import { useJuiText } from './locale';
import { Avatar, type Person } from './primitives';

/** Puts the app's tokens and type on its subtree. Every kit component must sit inside one. */
export function JuiRoot({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <div className={'jui' + (className ? ' ' + className : '')} style={style}>{children}</div>;
}

export function Rail({ active, chatsOpen, unread, call, me = { name: 'Dev One', photo: true }, notifications = true, height }: {
  active?: RailKey;
  /** «Чаты» while the docked panel is out: the chip lights, the name stays grey. */
  chatsOpen?: boolean;
  unread?: boolean;
  call?: boolean;
  me?: Person;
  notifications?: boolean;
  height?: number | string;
}) {
  const t = useJuiText();
  return (
    <aside className="jui-rail" style={height ? { height } : undefined}>
      <div className="jui-rail-head"><Logo /></div>
      <nav className="jui-rail-items">
        {RAIL.map((item) => {
          const on = active === item.key;
          const open = item.key === 'chats' && chatsOpen;
          return (
            <span key={item.key} className={'jui-rail-item' + (on ? ' active' : '') + (open ? ' open' : '')}>
              <span className="jui-rail-chip">
                <RailGlyph name={item.key} active={on} />
                {item.key === 'chats' && unread && !open && <span className="jui-rail-dot" />}
                {item.key === 'chats' && call && <span className="jui-rail-dot call" />}
              </span>
              <span className="jui-rail-label">{t.rail[item.key]}</span>
            </span>
          );
        })}
      </nav>
      <div className="jui-rail-foot">
        <span><RailGlyph name="notifications" />{notifications && <span className="jui-rail-dot" />}</span>
        <span><RailGlyph name="settings" /></span>
      </div>
      <div className="jui-rail-foot-card"><Avatar person={me} size={40} /></div>
    </aside>
  );
}

/**
 * The whole window at a fixed size. `main` goes in the glass panel (or straight on the gradient
 * with `bare`, as the home page draws it); `side` docks at the right, 340 wide, like the chats panel.
 */
export function AppWindow({ width = 1440, height = 960, rail = 'boards', chatsOpen, unread, call, main, side, bare, className, style }: {
  width?: number;
  height?: number;
  rail?: RailKey | null;
  chatsOpen?: boolean;
  unread?: boolean;
  call?: boolean;
  main: ReactNode;
  side?: ReactNode;
  bare?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <JuiRoot className={'jui-window' + (className ? ' ' + className : '')} style={{ width, height, ...style }}>
      {rail !== null && <Rail active={rail} chatsOpen={chatsOpen ?? !!side} unread={unread} call={call} />}
      <div className="jui-window-main">
        <section className={'jui-panel' + (bare ? ' bare' : '')}>{main}</section>
      </div>
      {side && <div className="jui-window-side">{side}</div>}
    </JuiRoot>
  );
}
