// The task overlay (features/tasks/task-overlay.ts + task-detail.ts): header, the two meta groups,
// description, checklist and attachments on the left, comments on the right.
import type { CSSProperties, ReactNode } from 'react';
import type { PriorityKey, StatusKey, Tone, TypeKey } from './catalog';
import { PRIORITIES, TYPES } from './catalog';
import { Icon } from './icons';
import { toneOf, useJuiText } from './locale';
import { Avatar, StatusBadge, type Person } from './primitives';

export type Comment = { person: Person; time: string; text: string };
export type CheckItem = { text: string; done?: boolean };

/** The detail's «Подзадачи» with its count. With `onToggle` each step is a button, ticked and unticked by a click. */
export function Checklist({ items, onToggle }: { items: CheckItem[]; onToggle?: (i: number) => void }) {
  const d = useJuiText().detail;
  return (
    <div className="jui-detail-section">
      <h4>{d.subtasks} <span className="jui-soft">{items.filter((c) => c.done).length}/{items.length}</span></h4>
      {items.map((c, i) => {
        const inner = <><i>{c.done && <Icon name="check" size={12} stroke={3} />}</i><span>{c.text}</span></>;
        const cls = 'jui-check' + (c.done ? ' done' : '');
        return onToggle
          ? <button key={c.text} type="button" className={cls} aria-pressed={!!c.done} onClick={() => onToggle(i)}>{inner}</button>
          : <div key={c.text} className={cls}>{inner}</div>;
      })}
    </div>
  );
}

export function TaskDetail({ title, code, date, creator, assignees, watchers, type = 'task', dates, priority = 'normal', status, description, checklist, comments = [], solid, children, style }: {
  title: string;
  code: string;
  date: string;
  creator: Person;
  assignees: Person[];
  watchers?: Person[];
  type?: TypeKey | Tone;
  dates?: string;
  priority?: PriorityKey | Tone;
  status: StatusKey | Tone;
  description?: string;
  checklist?: CheckItem[];
  comments?: Comment[];
  /** Opaque, with a shadow: for drawing it over something other than the app. */
  solid?: boolean;
  /** Extra sections under the checklist. */
  children?: ReactNode;
  style?: CSSProperties;
}) {
  const t = useJuiText();
  const d = t.detail;
  const typeName = toneOf(TYPES, t.types, type).name;
  const priorityName = toneOf(PRIORITIES, t.priorities, priority).name;
  const people = (list: Person[]) => list.map((p) => <span key={p.name} className="jui-user"><Avatar person={p} />{p.name}</span>);
  return (
    <div className={'jui-detail' + (solid ? ' solid' : '')} style={style}>
      <header className="jui-detail-head">
        <div>
          <div className="jui-detail-title">{title}</div>
          <div className="jui-detail-sub"><span className="jui-detail-num">{code}</span>{date}</div>
        </div>
        <div className="jui-detail-actions"><span><Icon name="expand" /></span><span className="strong"><Icon name="close" /></span></div>
      </header>
      <div className="jui-detail-cols">
        <div className="jui-detail-main">
          <div className="jui-detail-meta">
            <div className="jui-detail-group">
              <span className="jui-k">{d.creator}</span><span className="jui-v">{people([creator])}</span>
              <span className="jui-k">{d.assignees}</span><span className="jui-v">{people(assignees)}</span>
              <span className="jui-k">{d.watchers}</span><span className={'jui-v' + (watchers?.length ? '' : ' blank')}>{watchers?.length ? people(watchers) : d.add}</span>
              <span className="jui-k">{d.type}</span><span className="jui-v">{typeName}</span>
            </div>
            <div className="jui-detail-group">
              <span className="jui-k">{d.dates}</span><span className={'jui-v' + (dates ? '' : ' blank')}>{dates ?? d.notSet}</span>
              <span className="jui-k">{d.priority}</span><span className="jui-v">{priorityName}</span>
              <span className="jui-k">{d.status}</span><span className="jui-v"><StatusBadge status={status} /></span>
            </div>
          </div>
          <div className="jui-detail-section">
            <h4>{d.description}</h4>
            <p style={description ? undefined : { color: 'var(--color-text-soft)' }}>{description ?? d.describe}</p>
          </div>
          {checklist && <Checklist items={checklist} />}
          {children}
        </div>
        <aside className="jui-detail-side">
          <nav className="jui-detail-tabs"><span className="on">{d.comments}</span><span>{d.history}</span></nav>
          {comments.length ? comments.map((c, i) => (
            <div key={i} className="jui-comment">
              <Avatar person={c.person} size={28} />
              <div className="jui-comment-body"><b>{c.person.name}<time>{c.time}</time></b><span>{c.text}</span></div>
            </div>
          )) : <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)' }}>{d.noComments}</p>}
          <div className="jui-comment-box">
            <span>{d.writeComment}</span>
            <div><Icon name="attach" size={18} stroke={1.5} /><span className="jui-send disabled" style={{ height: 36 }}><Icon name="arrowRight" size={18} />{t.common.send}</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
