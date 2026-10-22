// The calendar page (features/calendar/calendar.ts) and its week schedule (calendar-schedule.css):
// the period bar, the legend chips, a 60px hour gutter, 70px hours, entries washed in their colour,
// the coral disc on today and the now-line across today's column.
import type { CSSProperties, ReactNode } from 'react';
import { EVENT_TONES, type EventTone } from './catalog';
import { Icon } from './icons';
import { useJuiText } from './locale';
import { Button, ChatsButton } from './primitives';

type Vars = CSSProperties & Record<`--${string}`, string | number>;

export type CalendarView = 'month' | 'week' | 'agenda';
export type LegendChip = { name: string; tone: EventTone | string; off?: boolean; icon?: 'tasks' };

export function CalendarToolbar({ period, view = 'week', chats = true }: { period: string; view?: CalendarView; chats?: boolean }) {
  const t = useJuiText().calendar;
  return (
    <div className="jui-cal-bar">
      <span className="jui-cal-period">{period}</span>
      <span className="jui-cal-step"><Icon name="chevLeft" stroke={1.7} /></span>
      <span className="jui-cal-step"><Icon name="chevRight" stroke={1.7} /></span>
      <Button variant="white">{t.today}</Button>
      <span className="jui-spacer" />
      <span className="jui-cal-step"><Icon name="search" stroke={1.7} /></span>
      <span className="jui-cal-views">
        {([['month', t.month], ['week', t.week], ['agenda', t.agenda]] as const).map(([k, l]) => <span key={k} className={view === k ? 'on' : ''}>{l}</span>)}
      </span>
      <Button variant="primary" icon="plus" style={{ height: 36 }}>{t.event}</Button>
      {chats && <ChatsButton />}
    </div>
  );
}

export function CalendarLegend({ chips }: { chips: LegendChip[] }) {
  return (
    <div className="jui-cal-legend">
      {chips.map((c, i) => c.icon === 'tasks'
        ? [<span key={'r' + i} className="jui-legend-rule" />, <span key={i} className="jui-legend-chip"><Icon name="tasks" size={14} />{c.name}</span>]
        : <span key={i} className="jui-legend-chip" style={{ '--dot': toneColor(c.tone) } as Vars}><i />{c.name}</span>)}
    </div>
  );
}

export type WeekDay = { wd: string; num: number; today?: boolean };
export type CalendarEvent = {
  /** Column, 0-based. */
  day: number;
  /** Hours as decimals: 9.5 = 9:30. */
  start: number;
  end: number;
  title: string;
  time?: string;
  tone?: EventTone | string;
  /** Outlined, not filled: a slot being proposed. */
  ghost?: boolean;
  /** Ringed coral: the slot Jamo just found. */
  found?: boolean;
  className?: string;
  style?: CSSProperties;
};

const toneColor = (t: EventTone | string | undefined) => (t && t in EVENT_TONES ? EVENT_TONES[t as EventTone] : t ?? EVENT_TONES.personal);
const hhmm = (h: number) => `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;

export function EventBlock({ ev, from, hour }: { ev: CalendarEvent; from: number; hour: number }) {
  const top = (ev.start - from) * hour + 2, height = Math.max(16, (ev.end - ev.start) * hour - 4);
  const compact = ev.end - ev.start < 0.75;
  const time = ev.time ?? `${hhmm(ev.start)}–${hhmm(ev.end)}`;
  return (
    <div className={'jui-event' + (compact ? ' compact' : '') + (ev.ghost ? ' ghost' : '') + (ev.found ? ' found' : '') + (ev.className ? ' ' + ev.className : '')}
      style={{ '--ev': toneColor(ev.tone), top, height, ...(compact && { paddingBlock: (height - 16) / 2 }), ...ev.style } as Vars}>
      <b>{ev.title}</b>{compact ? <span className="jui-ev-at">{ev.time ?? hhmm(ev.start)}</span> : <span>{time}</span>}
    </div>
  );
}

/** The week (or any run of days) on the hour grid. `drop` tints one column as a held entry does. */
export function CalendarWeek({ days, from = 8, to = 17, hour = 70, events, now, drop, children }: {
  days: WeekDay[];
  from?: number;
  to?: number;
  hour?: number;
  events: CalendarEvent[];
  now?: { day: number; at: number };
  drop?: number;
  /** Drawn over the grid, positioned by the caller (a flying card, say). */
  children?: ReactNode;
}) {
  const hours = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  return (
    <div className="jui-schedule" style={{ '--days': days.length, '--hour': hour + 'px' } as Vars}>
      <div className="jui-schedule-head">
        <span />
        {days.map((d) => <span key={d.wd + d.num} className={'jui-schedule-date' + (d.today ? ' today' : '')}><span className="jui-wd">{d.wd}</span><span className="jui-dnum">{d.num}</span></span>)}
      </div>
      <div className="jui-hour-scroll">
        <div className="jui-hour-grid">
          <div className="jui-hour-labels">{hours.map((h) => <div key={h}>{h}:00</div>)}</div>
          {days.map((_, i) => (
            <div key={i} className={'jui-hour-column' + (drop === i ? ' drop' : '')} style={{ height: hours.length * hour }}>
              <div className="jui-timed-layer">
                {events.filter((e) => e.day === i).map((e, k) => <EventBlock key={k} ev={e} from={from} hour={hour} />)}
              </div>
              {now?.day === i && <div className="jui-now" style={{ top: (now.at - from) * hour }} />}
            </div>
          ))}
          {children}
        </div>
      </div>
    </div>
  );
}

/** The whole calendar page: bar, legend, week. */
export function CalendarPage({ period, view = 'week', legend, ...week }: { period: string; view?: CalendarView; legend: LegendChip[] } & Parameters<typeof CalendarWeek>[0]) {
  return (
    <div className="jui-cal">
      <CalendarToolbar period={period} view={view} />
      <CalendarLegend chips={legend} />
      <CalendarWeek {...week} />
    </div>
  );
}
