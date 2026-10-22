// The catalog a new organization starts with (backend TaskCatalogService seeds): the names and
// colours every status, priority and type is drawn in. The rail's five places are nav.rail in ru.json.
// The names here are the Russian seeds; components draw the name in the current language from
// locale.tsx (useJuiText), so only the colours are read from here.

export type Tone = { readonly name: string; readonly color: string };

export const STATUSES = {
  todo: { name: 'Сделать', color: '#335cff' },
  progress: { name: 'В прогрессе', color: '#1fc16b' },
  review: { name: 'На проверке', color: '#ff8447' },
  done: { name: 'Сделано', color: '#7d52f4' },
  cancelled: { name: 'Отменено', color: '#9aa0ab' },
} as const satisfies Record<string, Tone>;
export type StatusKey = keyof typeof STATUSES;

export const PRIORITIES = {
  low: { name: 'Низкий', color: '#6d727d' },
  normal: { name: 'Обычный', color: '#6d727d' },
  high: { name: 'Высокий', color: '#f6b51e' },
  urgent: { name: 'Срочный', color: '#fb3748' },
} as const satisfies Record<string, Tone>;
export type PriorityKey = keyof typeof PRIORITIES;

export const TYPES = {
  task: { name: 'Задача', color: '#6d727d' },
  feature: { name: 'Функция', color: '#22b573' },
  bug: { name: 'Ошибка', color: '#e03e3e' },
  story: { name: 'История', color: '#3b6cf6' },
  epic: { name: 'Эпик', color: '#7c5cff' },
} as const satisfies Record<string, Tone>;
export type TypeKey = keyof typeof TYPES;

export const RAIL = [
  { key: 'home', label: 'Главное' },
  { key: 'chats', label: 'Чаты' },
  { key: 'boards', label: 'Проекты' },
  { key: 'calendar', label: 'Календарь' },
  { key: 'library', label: 'Хранилище' },
] as const;
export type RailKey = (typeof RAIL)[number]['key'];

/** Calendar entry colours (calendar-schedule.css): the viewer's own are blue, projects take a tone. */
export const EVENT_TONES = {
  personal: '#335cff',
  orange: '#ff8447',
  green: '#1fc16b',
  purple: '#7d52f4',
  yellow: '#f0a000',
  cyan: '#0099cc',
  red: '#fb3748',
} as const;
export type EventTone = keyof typeof EVENT_TONES;

const HUES = [12, 32, 160, 200, 230, 262, 290, 340];

/** shared/avatar.ts hueOf: the stable hue of an id (a person's disc, a project's mark). */
export function hueOf(id: string | null | undefined): number {
  let h = 0;
  for (let i = 0; i < (id ?? '').length; i++) h = (h * 31 + (id as string).charCodeAt(i)) >>> 0;
  return HUES[h % HUES.length];
}

/** The avatar's initials, as shared/avatar.ts takes them from a display name. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2)).toUpperCase();
}

/** The gradient the seeded "Dev One" account wears as its picture; any person can wear one. */
export const PHOTO_GRADIENT = 'radial-gradient(circle at 70% 85%, #4cd6a4 0%, rgba(76, 214, 164, 0) 55%), radial-gradient(circle at 20% 60%, #e2558f 0%, rgba(226, 85, 143, 0) 50%), linear-gradient(165deg, #2b1f7a 0%, #7a2fb0 45%, #c9417f 70%, #3fbf95 100%)';
