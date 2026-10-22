// Chats: the panel and its rows (features/chats/chats-panel.*, chat-folder.ts), a conversation's
// header (chat-conversation.ts), its messages and composer (message-pane.ts), and the call record
// a call leaves in the transcript (shared/call-record.ts).
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { JamoFace, type Mood } from '../../JamoFace';
import { hueOf } from './catalog';
import { Icon } from './icons';
import { useJuiText } from './locale';
import { Avatar, IconButton, type Person } from './primitives';

type Vars = CSSProperties & Record<`--${string}`, string | number>;

export type ChatRowData =
  | { kind: 'assistant'; selected?: boolean; preview?: string }
  | { kind: 'direct'; person: Person; preview: string; time?: string; unread?: number; selected?: boolean; live?: boolean; presence?: 'online' | 'away' | 'offline' }
  | { kind: 'project'; name: string; id?: string; preview: string; time?: string; live?: boolean; selected?: boolean }
  | { kind: 'channel'; name: string; preview: string; time?: string; unread?: number; selected?: boolean }
  | { kind: 'room'; name: string; preview: string; time?: string; live?: boolean; selected?: boolean };

export function ChatRow({ row }: { row: ChatRowData }) {
  const on = row.selected ? ' on' : '';
  const t = useJuiText();
  switch (row.kind) {
    case 'assistant':
      return (
        <div className={'jui-chat-row' + on}>
          <span className="jui-chat-mark ai"><AssistantFace /><i className="jui-chat-dot" /></span>
          <span className="jui-chat-body">
            <span className="jui-chat-line"><Icon name="pin" className="jui-chat-pin" size={13} /><b>Jamo AI</b></span>
            <span className="jui-chat-line"><span className="jui-chat-preview">{row.preview ?? t.chats.assistantPreview}</span></span>
          </span>
        </div>
      );
    case 'direct':
      return (
        <div className={'jui-chat-row' + on}>
          <Avatar person={row.person} size={40} presence={row.presence} />
          <span className="jui-chat-body">
            <span className="jui-chat-line"><b>{row.person.name}</b>{row.time && <time>{row.time}</time>}</span>
            <span className="jui-chat-line">
              <span className={'jui-chat-preview' + (row.live ? ' live' : '')}>{row.preview}</span>
              {row.unread ? <span className="jui-chat-count">{row.unread}</span> : null}
            </span>
          </span>
        </div>
      );
    case 'project':
      return (
        <div className={'jui-chat-row' + on}>
          <span className="jui-chat-mark square" style={{ '--h': hueOf(row.id ?? row.name) } as Vars}>{row.name.slice(0, 1).toLocaleUpperCase('ru')}{row.live && <i className="jui-chat-dot" />}</span>
          <span className="jui-chat-body">
            <span className="jui-chat-line"><b>{row.name}</b>{row.time && <time>{row.time}</time>}</span>
            <span className="jui-chat-line"><span className="jui-chat-preview">{row.preview}</span><Icon name="chevRight" className="jui-chat-chev" size={16} /></span>
          </span>
        </div>
      );
    case 'channel':
      return (
        <div className={'jui-chat-row' + on}>
          <span className="jui-chat-mark grey">#</span>
          <span className="jui-chat-body">
            <span className="jui-chat-line"><b>{row.name}</b>{row.time && <time>{row.time}</time>}</span>
            <span className="jui-chat-line"><span className="jui-chat-preview">{row.preview}</span>{row.unread ? <span className="jui-chat-count">{row.unread}</span> : null}</span>
          </span>
        </div>
      );
    case 'room':
      return (
        <div className={'jui-chat-row' + on}>
          <span className={'jui-chat-mark room' + (row.live ? ' live' : '')}>▶{row.live && <i className="jui-chat-dot" />}</span>
          <span className="jui-chat-body">
            <span className="jui-chat-line"><b>{row.name}</b>{row.time && <time>{row.time}</time>}</span>
            <span className="jui-chat-line"><span className={'jui-chat-preview' + (row.live ? ' live' : '')}>{row.preview}</span></span>
          </span>
        </div>
      );
  }
}

/** Jamo's moods in the list, round and round: it looks about, thinks, and ticks something off. */
const ROUND: [Mood, number][] = [['idle', 4200], ['think2', 2400], ['reply2', 2600]];

/**
 * Jamo's face in place of the app's «AI» square, with the online dot: in a still screenshot it is the
 * one row that is alive. Under reduced motion it keeps still, blinking only.
 */
function AssistantFace() {
  const [at, setAt] = useState(0);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setTimeout(() => setAt((i) => (i + 1) % ROUND.length), ROUND[at][1]);
    return () => clearTimeout(id);
  }, [at]);
  return <JamoFace mood={ROUND[at][0]} size={40} />;
}

export type ChatsSection = { title: string; rows: ChatRowData[]; add?: boolean };

/**
 * The chats panel. Docked (default) it is the 340px list, or the conversation once one is open;
 * `expanded` puts the list and the conversation side by side, as the Chats page does.
 */
export function ChatsPanel({ tabs, tab = 0, rows, sections, conversation, expanded, docked = true, flat, style }: {
  tabs?: (string | { name: string; unread?: number })[];
  tab?: number;
  rows?: ChatRowData[];
  sections?: ChatsSection[];
  conversation?: ReactNode;
  expanded?: boolean;
  docked?: boolean;
  flat?: boolean;
  style?: CSSProperties;
}) {
  const t = useJuiText();
  const showList = expanded || !conversation;
  return (
    <aside className={'jui-chats' + (expanded ? ' expanded' : '') + (flat ? ' flat' : '') + (!expanded && !conversation && !docked ? ' full' : '')} style={style}>
      {showList && (
        <div className="jui-chats-list">
          <header className="jui-chats-head">
            <h2>{t.common.chats}</h2>
            <IconButton icon="search" />
            <IconButton icon={expanded ? 'collapse' : 'expand'} />
            {!expanded && <IconButton icon="close" />}
          </header>
          <nav className="jui-chats-tabs">
            {(tabs ?? [t.chats.all]).map((tb, i) => {
              const name = typeof tb === 'string' ? tb : tb.name, unread = typeof tb === 'string' ? 0 : tb.unread;
              return <span key={name} className={i === tab ? 'on' : ''}>{name}{unread ? <span className="jui-tab-badge">{unread}</span> : null}</span>;
            })}
          </nav>
          <div className="jui-chats-rows">
            {rows?.map((r, i) => <ChatRow key={i} row={r} />)}
            {sections?.map((s) => (
              <div key={s.title}>
                <div className="jui-chats-section">{s.title}{s.add !== false && <Icon name="plus" size={16} stroke={2} />}</div>
                {s.rows.map((r, i) => <ChatRow key={i} row={r} />)}
              </div>
            ))}
          </div>
        </div>
      )}
      {conversation ?? (expanded ? <div className="jui-chats-pick"><span>{t.chats.pick}</span></div> : null)}
    </aside>
  );
}

export type ConversationWho =
  | { kind: 'direct'; person: Person; sub?: string; online?: boolean }
  | { kind: 'channel'; name: string; sub?: string }
  | { kind: 'assistant'; sub?: string };

export function ConversationHeader({ who, expanded }: { who: ConversationWho; expanded?: boolean }) {
  const name = who.kind === 'direct' ? who.person.name : who.kind === 'channel' ? who.name : 'Jamo AI';
  const t = useJuiText().chats;
  const sub = who.sub ?? (who.kind === 'assistant' ? t.assistantSub : who.kind === 'direct' ? (who.online ? t.online : t.offline) : '');
  return (
    <header className="jui-conv-head">
      {expanded ? <span className="jui-conv-gap" /> : <IconButton icon="chevLeft" />}
      {who.kind === 'direct' && <Avatar person={who.person} size={34} presence={expanded ? (who.online ? 'online' : 'offline') : undefined} />}
      {who.kind === 'channel' && <span className="jui-conv-sq">#</span>}
      <div className="jui-conv-who">
        <span className="jui-conv-name">{name}</span>
        {sub && <span className={'jui-conv-sub' + (who.kind === 'direct' && who.online ? ' online' : '')}>{sub}</span>}
      </div>
      {expanded && who.kind !== 'assistant' && <IconButton icon="search" />}
      {expanded && who.kind !== 'assistant' && <IconButton icon="phone" />}
      {expanded && who.kind === 'direct' && <IconButton icon="info" on />}
      {expanded && who.kind === 'assistant' && <IconButton icon="history" />}
      {!expanded && <IconButton icon="expand" />}
      {!expanded && <IconButton icon="close" />}
    </header>
  );
}

export type TaskChipData = { code: string; title: string; trailing: string; tint?: 'ahead' | 'due'; color?: string };

/** The task made from a message: blue ahead of its date, red with a coral dot on the day or past. */
export function TaskChip({ chip }: { chip: TaskChipData }) {
  return (
    <span className={'jui-task-chip' + (chip.tint ? ' ' + chip.tint : '')} style={{ '--c': chip.color ?? '#335cff' } as Vars}>
      <Icon name="taskCheck" size={16} stroke={2} />
      <span>{chip.code}</span>
      <span className="jui-chip-ttl">{chip.title}</span>
      <span>{chip.trailing}</span>
    </span>
  );
}

export function FileChip({ name, size }: { name: string; size?: string }) {
  return <span className="jui-file-chip"><Icon name="document" size={16} /><b>{name}</b>{size && <span>{size}</span>}</span>;
}

export function DayDivider({ children }: { children: ReactNode }) {
  return <div className="jui-day">{children}</div>;
}

/**
 * One message, Telegram's shape: the name on the first of a run (channels only), the avatar on the
 * last, the viewer's own on the right in the coral tint with neither.
 */
export function MessageBubble({ text, time, mine, author, avatar, tail, cont, read, attach, children, className, style }: {
  text?: ReactNode;
  time: string;
  mine?: boolean;
  /** Shown in channels, on the first message of a run. */
  author?: Person;
  /** Shown in channels on the last message of a run; otherwise the 32px gap holds the place. */
  avatar?: Person | 'gap';
  tail?: boolean;
  cont?: boolean;
  read?: boolean;
  /** A task chip, file chip or call record hung under (or in place of) the bubble. */
  attach?: ReactNode;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={'jui-msg' + (mine ? ' mine' : '') + (tail ? ' tail' : '') + (cont ? ' cont' : '') + (className ? ' ' + className : '')} style={style}>
      {!mine && avatar && (avatar === 'gap' ? <span className="jui-msg-gap" /> : <Avatar person={avatar} size={32} />)}
      <div className="jui-msg-body">
        {(text !== undefined || children) && (
          <div className="jui-bubble">
            {author && <span className="jui-author" style={{ '--h': hueOf(author.id ?? author.name) } as Vars}>{author.name}</span>}
            {children}
            {text !== undefined && (
              <div className="jui-text">
                {text}
                <span className="jui-stamp">{time}{mine && read && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 12 5 5L18 6M13 15l2 2L22 7" /></svg>}</span>
              </div>
            )}
          </div>
        )}
        {attach}
      </div>
    </div>
  );
}

/** A call in the transcript: the glass tile tinted by how it ended, with the phone's arrow. */
export function CallRecord({ label, detail, time, incoming, failed }: { label: string; detail: string; time: string; incoming?: boolean; failed?: boolean }) {
  return (
    <span className={'jui-call-record' + (failed ? ' bad' : '')}>
      <span className="jui-call-ico"><Icon name="phone" size={20} stroke={1.7} /><i className={'jui-call-dir' + (incoming ? ' in' : '')} /></span>
      <span className="jui-call-txt"><b>{label}</b><span>{detail}</span></span>
      <span className="jui-call-when">{time}</span>
    </span>
  );
}

/** The feed: messages stack from the bottom, like a live chat. */
export function MessagePane({ children, composer, docked }: { children: ReactNode; composer?: ReactNode; docked?: boolean }) {
  return (
    <div className={'jui-pane' + (docked ? ' docked' : '')}>
      <div className="jui-feed">{children}</div>
      {composer}
    </div>
  );
}

export function Composer({ placeholder, text, docked }: { placeholder?: string; text?: string; docked?: boolean }) {
  const t = useJuiText();
  return (
    <div className={'jui-composer' + (docked ? ' docked' : '')}>
      <div className={'jui-composer-text' + (text ? ' typed' : '')}>{text || (placeholder ?? t.chats.message)}</div>
      <div className="jui-composer-actions">
        <div className="jui-tools">
          <span className="jui-tool"><Icon name="newTask" stroke={1.5} /></span>
          <span className="jui-tool"><Icon name="image" stroke={1.5} /></span>
          <span className="jui-tool"><Icon name="camera" stroke={1.5} /></span>
          <span className="jui-tool"><Icon name="attach" stroke={1.5} /></span>
        </div>
        <span className={'jui-send' + (text ? '' : ' disabled')}><Icon name="send" stroke={1.5} />{!docked && t.common.send}</span>
      </div>
    </div>
  );
}

/** Header + feed + composer: a whole open chat. */
export function Conversation({ who, expanded, children, composer = true, placeholder, typed }: { who: ConversationWho; expanded?: boolean; children: ReactNode; composer?: boolean; placeholder?: string; typed?: string }) {
  const t = useJuiText().chats;
  const hint = placeholder ?? (who.kind === 'direct' ? t.messageFor(who.person.name.split(' ')[0]) : t.message);
  return (
    <div className="jui-conv">
      <ConversationHeader who={who} expanded={expanded} />
      <MessagePane docked={!expanded} composer={composer ? <Composer docked={!expanded} placeholder={hint} text={typed} /> : undefined}>{children}</MessagePane>
    </div>
  );
}
