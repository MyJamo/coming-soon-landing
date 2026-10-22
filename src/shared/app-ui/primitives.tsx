// The small pieces every screen is built from: shared/avatar.ts, shared/task-ui.ts, the buttons of
// styles.scss and chats-button.ts, and the search box of shared/filters.ts.
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { PHOTO_GRADIENT, PRIORITIES, STATUSES, TYPES, hueOf, initialsOf, type PriorityKey, type StatusKey, type Tone, type TypeKey } from './catalog';
import { Icon, type IconName } from './icons';
import { toneOf, useJuiText } from './locale';

type Vars = CSSProperties & Record<`--${string}`, string | number>;

export type Person = {
  name: string;
  /** What the disc's hue is hashed from; the name when absent. */
  id?: string;
  /** A picture: any CSS background, or true for the seeded gradient. */
  photo?: string | true;
};

export function Avatar({ person, size = 24, presence, className }: { person: Person; size?: number; presence?: 'online' | 'away' | 'offline'; className?: string }) {
  const photo = person.photo === true ? PHOTO_GRADIENT : person.photo;
  const style: Vars = { '--h': hueOf(person.id ?? person.name), '--s': size + 'px', ...(photo ? { background: photo } : {}) };
  return (
    <span className={'jui-avatar' + (photo ? ' photo' : '') + (className ? ' ' + className : '')} style={style} title={person.name} data-presence={presence}>
      {photo ? null : initialsOf(person.name)}
    </span>
  );
}

/** An avatar group: 24px faces ringed white, overlapping by 4, then +N. */
export function Avatars({ people, size = 24, max = 3 }: { people: Person[]; size?: number; max?: number }) {
  const shown = people.slice(0, max), rest = people.length - shown.length;
  return (
    <span className="jui-avatars">
      {shown.map((p) => <Avatar key={p.name} person={p} size={size} />)}
      {rest > 0 && <span className="jui-more">+{rest}</span>}
    </span>
  );
}

export type Project = { name: string; id?: string };

/** The project's coloured initial: 44 in its header, 40 as a chat row, 36 in the switcher. */
export function ProjectMark({ project, size = 44 }: { project: Project; size?: number }) {
  return <span className="jui-project-mark" style={{ '--h': hueOf(project.id ?? project.name), '--s': size + 'px' } as Vars}>{project.name.slice(0, 1).toLocaleUpperCase('ru')}</span>;
}

/** The 20px tag a card wears for its project on the home board. */
export function ProjectTag({ project }: { project: Project }) {
  return <span className="jui-project-tag" title={project.name} style={{ '--h': hueOf(project.id ?? project.name) } as Vars}>{project.name.slice(0, 1).toLocaleUpperCase('ru')}</span>;
}

export function PriorityFlag({ priority, label }: { priority: PriorityKey | Tone; label?: boolean }) {
  const t = toneOf(PRIORITIES, useJuiText().priorities, priority);
  return (
    <span className={'jui-flag' + (label ? ' labelled' : '')} style={{ '--c': t.color } as Vars} title={t.name}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22V4a1 1 0 0 1 1-1h13l-2.5 5L18 13H5" /></svg>
      {label && <span>{t.name}</span>}
    </span>
  );
}

export function TypeChip({ type }: { type: TypeKey | Tone }) {
  const t = toneOf(TYPES, useJuiText().types, type);
  return <span className="jui-type" style={{ '--c': t.color } as Vars}>{t.name}</span>;
}

/** The list's status pill (task-ui.ts StatusBadge on the .badge rung). */
export function StatusPill({ status }: { status: StatusKey | Tone }) {
  const t = toneOf(STATUSES, useJuiText().statuses, status);
  return <span className="jui-status" style={{ '--c': t.color } as Vars}>{t.name}</span>;
}

/** The detail's Status Badge: radius 6, a filled check, the colour itself. */
export function StatusBadge({ status }: { status: StatusKey | Tone }) {
  const t = toneOf(STATUSES, useJuiText().statuses, status);
  return (
    <span className="jui-status-badge" style={{ '--c': t.color } as Vars}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor" /><path d="m7.5 12.5 3 3 6-6" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      {t.name}
    </span>
  );
}

export type ButtonVariant = 'primary' | 'soft' | 'ghost' | 'glass' | 'white' | 'plain';

export function Button({ variant = 'plain', icon, size, children, onClick, className, style }: { variant?: ButtonVariant; icon?: IconName; size?: 'sm'; children?: ReactNode; onClick?: () => void; className?: string; style?: CSSProperties }) {
  const cls = 'jui-btn' + (variant === 'plain' ? '' : ' ' + variant) + (size ? ' ' + size : '') + (className ? ' ' + className : '');
  const Tag = onClick ? 'button' : 'span';
  return <Tag type={onClick ? 'button' : undefined} className={cls} style={style} onClick={onClick}>{icon && <Icon name={icon} stroke={2} />}{children}</Tag>;
}

/** «Чаты» with the unread count: tinted while the panel is shut, solid coral while it is out. */
export function ChatsButton({ active, unread = 0 }: { active?: boolean; unread?: number }) {
  return (
    <span className={'jui-chats-btn' + (active ? ' active' : '')}>
      <Icon name="chat" size={18} />{useJuiText().common.chats}<span className="jui-chats-n">{unread > 99 ? '99+' : unread}</span>
    </span>
  );
}

export function SearchBox({ placeholder, width = 300, kbd = '/' }: { placeholder?: string; width?: number | string; kbd?: string }) {
  const t = useJuiText();
  return <span className="jui-search" style={{ width }}><Icon name="search" stroke={2} /><span>{placeholder ?? t.common.searchTasks}</span>{kbd && <kbd>{kbd}</kbd>}</span>;
}

export function IconButton({ icon, on }: { icon: IconName; on?: boolean }) {
  return <span className={'jui-icon-btn' + (on ? ' on' : '')}><Icon name={icon} size={18} /></span>;
}

/**
 * Draws a fixed-size screen (the app is laid out at 1440 wide) into whatever width it is given,
 * scaled down, never up. `height` is the design height; the box takes width × height / designWidth.
 */
export function Scaled({ width = 1440, height = 960, children, className, style }: { width?: number; height?: number; children: ReactNode; className?: string; style?: CSSProperties }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1, e.contentRect.width / width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  return (
    <div ref={box} className={'jui-scaled' + (className ? ' ' + className : '')} style={{ aspectRatio: `${width} / ${height}`, ...style }}>
      {scale > 0 && <div className="jui-scaled-in" style={{ width, height, transform: `scale(${scale})` }}>{children}</div>}
    </div>
  );
}
