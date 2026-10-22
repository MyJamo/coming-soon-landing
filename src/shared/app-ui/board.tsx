// The project screen: header and tabs (features/projects/project-shell.ts), the Kanban toolbar
// (project-board-page.ts), the board (shared/board.ts), the card (shared/task-card.ts), and the
// task list (features/tasks/task-list.ts).
import type { CSSProperties, ReactNode } from 'react';
import { STATUSES, type PriorityKey, type StatusKey, type Tone, type TypeKey } from './catalog';
import { Icon, type IconName } from './icons';
import { toneOf, useJuiText } from './locale';
import { Avatar, Avatars, Button, ChatsButton, PriorityFlag, ProjectMark, ProjectTag, SearchBox, StatusPill, TypeChip, type Person, type Project } from './primitives';

export { plural } from './locale';

type Vars = CSSProperties & Record<`--${string}`, string | number>;

export type ProjectTab = 'docs' | 'tasks' | 'board' | 'calendar';
const TABS: [ProjectTab, IconName][] = [['docs', 'docs'], ['tasks', 'tasks'], ['board', 'board'], ['calendar', 'calendar']];

export function ProjectHeader({ project, members, tab = 'board', openTasks, chatsActive, unread = 0, addMember = true }: {
  project: Project;
  members: number;
  tab?: ProjectTab;
  openTasks?: number;
  chatsActive?: boolean;
  unread?: number;
  addMember?: boolean;
}) {
  const t = useJuiText();
  return (
    <>
      <header className="jui-project-head">
        <ProjectMark project={project} />
        <span className="jui-project-who">
          <span className="jui-project-name">{project.name}<Icon name="chev" size={18} stroke={2} /></span>
          <span className="jui-project-sub">{t.board.members(members)}</span>
        </span>
        <span className="jui-spacer" />
        {addMember && <Button variant="soft" icon="plus">{t.board.addMember}</Button>}
        <ChatsButton active={chatsActive} unread={unread} />
      </header>
      <nav className="jui-tabs">
        {TABS.map(([key, icon]) => (
          <span key={key} className={tab === key ? 'on' : ''}>
            <Icon name={icon} size={18} />{t.board.tabs[key]}
            {key === 'tasks' && openTasks ? <span className="jui-tab-count">{openTasks}</span> : null}
          </span>
        ))}
      </nav>
    </>
  );
}

/** «Задачи», the search, Фильтр and «+ Задача» over the board. */
export function BoardToolbar({ title, search }: { title?: string; search?: string }) {
  const t = useJuiText();
  return (
    <header className="jui-board-toolbar">
      <h2>{title ?? t.board.tasks}</h2>
      <SearchBox placeholder={search ?? t.common.searchTasks} />
      <Button variant="ghost" icon="filter">{t.board.filter}</Button>
      <Button variant="primary" icon="plus">{t.board.task}</Button>
    </header>
  );
}

export type TaskCardData = {
  id?: string;
  title: string;
  code: string;
  priority?: PriorityKey | Tone;
  type?: TypeKey | Tone;
  /** The date as the app prints it, e.g. 17.09.2026. */
  due?: string;
  overdue?: boolean;
  people?: Person[];
  comments?: number;
  subtasks?: [done: number, total: number];
  /** The home board tags each card with its project. */
  project?: Project;
};

export function TaskCard({ task, compact, highlight, lifted, className, style }: { task: TaskCardData; compact?: boolean; highlight?: boolean; lifted?: boolean; className?: string; style?: CSSProperties }) {
  const people = task.people ?? [];
  const t = useJuiText();
  return (
    <div className={'jui-card' + (compact ? ' compact' : '') + (highlight ? ' highlight' : '') + (lifted ? ' lifted' : '') + (className ? ' ' + className : '')} style={style}>
      <div className="jui-card-head">
        <div className="jui-card-top">
          <PriorityFlag priority={task.priority ?? 'normal'} label={compact} />
          {task.due && <span className={'jui-due' + (task.overdue ? ' overdue' : '')}><Icon name="timer" stroke={1.5} />{task.due}</span>}
        </div>
        <div className="jui-card-title">{task.title}</div>
      </div>
      <div className="jui-card-who">
        <span className="jui-card-label">{people.length > 1 ? t.board.assignees : t.board.assignee}</span>
        <div className="jui-card-row">
          {people.length ? <Avatars people={people} /> : <span />}
          <span className="jui-card-tags">
            {task.project && <ProjectTag project={task.project} />}
            {task.type && <TypeChip type={task.type} />}
            {task.comments ? <span className="jui-card-subs"><Icon name="comment" size={13} />{task.comments}</span> : null}
            {task.subtasks ? <span className="jui-card-subs"><Icon name="subtasks" size={13} />{task.subtasks[0]}/{task.subtasks[1]}</span> : null}
            <span className="jui-card-num">{task.code}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export type ColumnData = { status: StatusKey | Tone; tasks: TaskCardData[]; count?: number };

/**
 * One status column. An empty one shows the coral add zone (the compact one an add row); `over`
 * lights it the way a held card does; `children` are drawn after the cards (a drop slot, say).
 */
export function BoardColumn({ column, compact, over, children, highlight }: { column: ColumnData; compact?: boolean; over?: boolean; children?: ReactNode; highlight?: string }) {
  const t = useJuiText();
  const tone = toneOf(STATUSES, t.statuses, column.status);
  const empty = !column.tasks.length && !children;
  return (
    <section className={'jui-column' + (over ? ' over' : '')} style={{ '--c': tone.color } as Vars}>
      <header className="jui-column-head">
        <span className="jui-column-name">{tone.name}</span>
        <span className="jui-column-count">{column.count ?? column.tasks.length}</span>
      </header>
      <div className="jui-column-cards">
        {column.tasks.map((t) => <TaskCard key={t.id ?? t.code} task={t} compact={compact} highlight={highlight === (t.id ?? t.code)} />)}
        {children}
        {!compact && empty && <div className="jui-add-card"><Icon name="plus" size={40} stroke={2} /></div>}
      </div>
      {compact && <div className="jui-add-row"><Icon name="plus" size={18} stroke={2} />{t.board.addTask}</div>}
    </section>
  );
}

export function Board({ columns, compact, over, highlight, style }: { columns: ColumnData[]; compact?: boolean; over?: number; highlight?: string; style?: CSSProperties }) {
  return (
    <div className={'jui-board-host' + (compact ? ' compact' : '')} style={style}>
      <div className={'jui-board' + (compact ? ' compact' : '')}>
        {columns.map((c, i) => <BoardColumn key={i} column={c} compact={compact} over={over === i} highlight={highlight} />)}
      </div>
    </div>
  );
}

/** The home page's head: «Мои задачи» and the open / today / overdue line. */
export function HomeHeader({ name, open, today, overdue }: { name?: string; open: number; today: number; overdue: number }) {
  const t = useJuiText();
  return (
    <header className="jui-home-head">
      <div style={{ flex: 1 }}>
        <h1>{name ?? t.board.myTasks}</h1>
        <p className="jui-home-stats"><span>{t.board.open(open)}</span><span>{t.board.today(today)}</span>{overdue ? <span className="jui-home-over">{t.board.overdue(overdue)}</span> : <span>{t.board.overdue(0)}</span>}</p>
      </div>
      <span className="jui-icon-btn"><Icon name="search" size={22} stroke={2} /></span>
      <Button variant="primary" icon="plus">{t.board.task}</Button>
      <ChatsButton />
    </header>
  );
}

export type TaskRow = {
  code: string;
  title: string;
  type: TypeKey | Tone;
  status: StatusKey | Tone;
  priority: PriorityKey | Tone;
  assignee?: Person;
  due?: string;
  overdue?: boolean;
  subtasks?: string;
};

export function TaskListTable({ rows }: { rows: TaskRow[] }) {
  const c = useJuiText().board.columns;
  return (
    <table className="jui-table">
      <thead><tr><th>{c.code}</th><th>{c.title}</th><th>{c.type}</th><th>{c.status}</th><th>{c.priority}</th><th>{c.assignee}</th><th>{c.due}</th></tr></thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.code}>
            <td className="jui-td-code">{r.code}</td>
            <td className="jui-td-title">{r.title}{r.subtasks && <span style={{ marginLeft: 6, fontWeight: 400, fontSize: 12, color: 'var(--color-text-muted)' }}>{r.subtasks}</span>}</td>
            <td><TypeChip type={r.type} /></td>
            <td><StatusPill status={r.status} /></td>
            <td><PriorityFlag priority={r.priority} label /></td>
            <td>{r.assignee ? <span className="jui-user"><Avatar person={r.assignee} />{r.assignee.name}</span> : null}</td>
            <td className={r.overdue ? 'jui-td-overdue' : ''}>{r.due}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
