// The app's own glyphs, path for path: the rail's (shared/rail-icon.ts) and the inline SVGs of the
// screens the kit draws. Strokes are currentColor so a parent's colour reaches them.
import type { CSSProperties } from 'react';
import type { RailKey } from './catalog';

type Glyph = { viewBox: string; stroke: number; linear: string[]; dots?: string[] };
const G22 = '0 0 22 22';

export const RAIL_GLYPHS: Record<RailKey | 'notifications' | 'settings', Glyph> = {
  home: { viewBox: G22, stroke: 1.5, linear: ['M8.26833 2.60333L3.3275 6.45333C2.5025 7.095 1.83333 8.46083 1.83333 9.49667V16.2892C1.83333 18.4158 3.56583 20.1575 5.6925 20.1575H16.3075C18.4342 20.1575 20.1667 18.4158 20.1667 16.2983V9.625C20.1667 8.51583 19.4242 7.095 18.5167 6.4625L12.8517 2.49333C11.5683 1.595 9.50583 1.64083 8.26833 2.60333Z', 'M11 16.4908V13.7408'] },
  chats: { viewBox: G22, stroke: 1.5, linear: ['M7.79167 17.4167H7.33333C3.66667 17.4167 1.83333 16.5 1.83333 11.9167V7.33333C1.83333 3.66667 3.66667 1.83333 7.33333 1.83333H14.6667C18.3333 1.83333 20.1667 3.66667 20.1667 7.33333V11.9167C20.1667 15.5833 18.3333 17.4167 14.6667 17.4167H14.2083C13.9242 17.4167 13.6492 17.5542 13.475 17.7833L12.1 19.6167C11.495 20.4233 10.505 20.4233 9.9 19.6167L8.525 17.7833C8.37833 17.5817 8.03917 17.4167 7.79167 17.4167Z'], dots: ['M14.6634 10.0833H14.6717', 'M10.9959 10.0833H11.0041', 'M7.3283 10.0833H7.33653'] },
  boards: { viewBox: G22, stroke: 1.5, linear: ['M20.2 10v-6.2c0-1.4-.6-1.9-2-1.9h-3.7c-1.5 0-2 .5-2 1.9V10c0 1.4.5 1.9 2 1.9h3.7c1.4 0 2-.5 2-1.9Z', 'M20.2 18.2v-1.7c0-1.4-.6-1.9-2-1.9h-3.7c-1.5 0-2 .5-2 1.9v1.7c0 1.4.5 1.9 2 1.9h3.7c1.4 0 2-.5 2-1.9Z', 'M9.6 12v6.2c0 1.4-.6 1.9-2 1.9H3.9c-1.5 0-2-.5-2-1.9V12c0-1.4.5-1.9 2-1.9h3.7c1.4 0 2 .5 2 1.9Z', 'M9.6 3.8v1.7c0 1.4-.6 1.9-2 1.9H3.9c-1.5 0-2-.5-2-1.9V3.8c0-1.4.5-1.9 2-1.9h3.7c1.4 0 2 .5 2 1.9Z'] },
  calendar: { viewBox: G22, stroke: 1.5, linear: ['M7.33333 1.83333V4.58333', 'M14.6667 1.83333V4.58333', 'M3.20833 8.3325H18.7917', 'M19.25 7.79167V15.5833C19.25 18.3333 17.875 20.1667 14.6667 20.1667H7.33333C4.125 20.1667 2.75 18.3333 2.75 15.5833V7.79167C2.75 5.04167 4.125 3.20833 7.33333 3.20833H14.6667C17.875 3.20833 19.25 5.04167 19.25 7.79167Z'] },
  library: { viewBox: G22, stroke: 1.5, linear: ['M19.8642 13.1084L19.4975 17.6917C19.36 19.0942 19.25 20.1667 16.7658 20.1667H5.23418C2.75001 20.1667 2.64001 19.0942 2.50251 17.6917L2.13584 13.1084C2.06251 12.3475 2.30084 11.6417 2.73168 11.1009C2.74084 11.0917 2.74084 11.0917 2.75001 11.0825C3.25418 10.4684 4.01501 10.0834 4.86751 10.0834H17.1325C17.985 10.0834 18.7367 10.4684 19.2317 11.0642C19.2408 11.0734 19.25 11.0825 19.25 11.0917C19.6992 11.6325 19.9467 12.3384 19.8642 13.1084Z', 'M3.20834 10.4775V5.7567C3.20834 2.64003 3.98751 1.86086 7.10418 1.86086H8.26834C9.43251 1.86086 9.69834 2.2092 10.1383 2.79586L11.3025 4.3542C11.5958 4.7392 11.77 4.97753 12.5492 4.97753H14.8867C18.0033 4.97753 18.7825 5.7567 18.7825 8.87336V10.5142', 'M8.64418 15.5834H13.3558'] },
  notifications: { viewBox: '0 0 24 24', stroke: 1.7, linear: ['M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2ZM10 20a2 2 0 0 0 4 0'] },
  settings: { viewBox: '0 0 24 24', stroke: 1.7, linear: ['M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z', 'M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1'] },
};

/** A rail glyph: the outline at rest; active, a heavier outline over a coral-18% fill. */
export function RailGlyph({ name, active }: { name: keyof typeof RAIL_GLYPHS; active?: boolean }) {
  const g = RAIL_GLYPHS[name];
  return (
    <svg className="jui-rail-glyph" viewBox={g.viewBox} fill={active ? 'rgba(255, 132, 71, 0.18)' : 'none'} stroke="currentColor"
      strokeWidth={active ? g.stroke * 1.2 : g.stroke} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {g.linear.map((d) => <path key={d} d={d} />)}
      {g.dots?.map((d) => <path key={d} d={d} strokeWidth={2} fill="none" />)}
    </svg>
  );
}

/** Outline icons of the screens, on a 24 grid. */
export const PATHS = {
  plus: 'M12 5v14M5 12h14',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-3.5-3.5',
  filter: 'M4 6h16M7 12h10M10 18h4',
  chat: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z',
  chev: 'm6 9 6 6 6-6',
  chevRight: 'm9 6 6 6-6 6',
  chevLeft: 'm15 6-6 6 6 6',
  close: 'M6 6l12 12M18 6 6 18',
  expand: 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7',
  collapse: 'M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7',
  flag: 'M4 22V4a1 1 0 0 1 1-1h13l-2.5 5L18 13H5',
  timer: 'M12 5a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM12 9v4l2 2M9 2h6',
  comment: 'M8.5 19H8c-4 0-6-1-6-6V8c0-4 2-6 6-6h8c4 0 6 2 6 6v5c0 4-2 6-6 6h-.5c-.31 0-.61.15-.8.4l-1.5 2c-.66.88-1.74.88-2.4 0l-1.5-2c-.16-.22-.53-.4-.8-.4Z',
  subtasks: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
  docs: 'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h5',
  tasks: 'M10 6h11M10 12h11M10 18h11M3 6l1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17',
  board: 'M4.5 4h4a1.5 1.5 0 0 1 1.5 1.5v4A1.5 1.5 0 0 1 8.5 11h-4A1.5 1.5 0 0 1 3 9.5v-4A1.5 1.5 0 0 1 4.5 4ZM15.5 4h4A1.5 1.5 0 0 1 21 5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 14 9.5v-4A1.5 1.5 0 0 1 15.5 4ZM4.5 15h4a1.5 1.5 0 0 1 1.5 1.5v3A1.5 1.5 0 0 1 8.5 21h-4A1.5 1.5 0 0 1 3 19.5v-3A1.5 1.5 0 0 1 4.5 15ZM15.5 15h4a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5v-3a1.5 1.5 0 0 1 1.5-1.5Z',
  calendar: 'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM3 10h18M8 3v4M16 3v4',
  phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.7a2 2 0 0 1 1.7 2z',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 11v5M12 8h.01',
  history: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2',
  pin: 'M12 17v5M5 17h14l-2-4V5h1V3H6v2h1v8z',
  taskCheck: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4ZM8.5 12l2.5 2.5 5-5',
  newTask: 'M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5ZM7.5 8.5l.9.9 2-2M13 9h4M7.5 15.5l.9.9 2-2M13 16h4',
  image: 'M7 3h10a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5ZM8.5 7.2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6ZM3 17l5-4.5c1-.9 2.3-.9 3.3 0L16 17M15 14.5l1.4-1.2c1-.9 2.3-.9 3.3 0L21 14.5',
  camera: 'M2 13.4c0-3.5 0-5.2 1-6.3.9-1.1 2.6-1.3 6-1.6l.6-1c.4-.6 1-1 1.7-1h1.4c.7 0 1.3.4 1.7 1l.6 1c3.4.3 5.1.5 6 1.6 1 1.1 1 2.8 1 6.3 0 4-.4 5.2-1.5 6.2S17 21 14 21h-4c-3 0-4.4 0-5.5-1.4S2 17.4 2 13.4ZM12 9.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z',
  attach: 'm21.4 11.1-8.8 8.8a5.5 5.5 0 0 1-7.8-7.8l8.8-8.8a3.7 3.7 0 0 1 5.2 5.2l-8.8 8.8a1.8 1.8 0 0 1-2.6-2.6l8.1-8.1',
  send: 'M10.1 13.9 20.9 3.1M21 7.4v-4.3h-4.3M10.5 3H8C4 3 3 5 3 8v8c0 3 1 5 5 5h8c3 0 5-1 5-5v-2.5',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  folder: 'M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z',
  document: 'M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8M8 16h6',
  picture: 'M3 3h18v18H3V3Zm0 13 6-6 12 11M16 7h.01',
  drive: 'M5 4h14l3 12v4H2v-4L5 4ZM2 16h20M16 18h.01M19 18h.01',
  upload: 'M12 15V3M7 8l5-5 5 5M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4',
  list: 'M4 6h10M4 12h7M4 18h4M17 6v12m0 0 3-3m-3 3-3-3',
  grid: 'M4.5 3h4A1.5 1.5 0 0 1 10 4.5v4A1.5 1.5 0 0 1 8.5 10h-4A1.5 1.5 0 0 1 3 8.5v-4A1.5 1.5 0 0 1 4.5 3ZM15.5 3h4A1.5 1.5 0 0 1 21 4.5v4a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 14 8.5v-4A1.5 1.5 0 0 1 15.5 3ZM4.5 14h4a1.5 1.5 0 0 1 1.5 1.5v4A1.5 1.5 0 0 1 8.5 21h-4A1.5 1.5 0 0 1 3 19.5v-4A1.5 1.5 0 0 1 4.5 14ZM15.5 14h4a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5v-4a1.5 1.5 0 0 1 1.5-1.5Z',
  dots: 'M5 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM19 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z',
  mic: 'M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3ZM5 11a7 7 0 0 0 14 0M12 18v3',
  micOff: 'M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3ZM5 11a7 7 0 0 0 14 0M12 18v3M3 3l18 18',
  video: 'M6 6h7a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3ZM16 10l5-3v10l-5-3',
  screen: 'M5 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM8 20h8M12 16v4',
  people: 'M9 4.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6',
  room: 'M4 5h16v11H9l-5 4V5Z',
  leave: 'M3 14c5-5 13-5 18 0l-2 3-4-1v-3a10 10 0 0 0-6 0v3l-4 1-2-3Z',
  bars: 'M1 5v4M5 2v10M9 4v6M13 1v12M17 5v4',
  check: 'm5 12 5 5L20 7',
  checkCircle: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-4 10.5 2.6 2.6L16.4 9',
} as const;
export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20, stroke = 1.8, className, style }: { name: IconName; size?: number; stroke?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg className={'jui-icon' + (className ? ' ' + className : '')} style={{ width: size, height: size, ...style }} viewBox={name === 'bars' ? '0 0 18 14' : '0 0 24 24'}
      fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}

/** The product's mark from the rail: the #23262b pill, two white dots and the coral check. */
export function Logo({ scale = 1 }: { scale?: number }) {
  return (
    <span className="jui-logo" style={{ transform: scale === 1 ? undefined : `scale(${scale})` }}>
      <svg className="jui-logo-dots" viewBox="0 0 13.3517 4.85517" aria-hidden="true"><circle cx="2.42759" cy="2.42759" r="2.42759" /><circle cx="10.9241" cy="2.42759" r="2.42759" /></svg>
      <svg className="jui-logo-check" viewBox="0 0 19.4207 19.4207" fill="none" aria-hidden="true"><path d="M4.40039 9.55828L8.04177 13.0479L14.7176 6.37207" strokeWidth="1.97241" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
}
