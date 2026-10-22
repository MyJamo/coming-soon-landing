// Option C's copy and the people and things its screens show. The module copy follows the Angular
// landing's catalog (frontend/public/i18n/ru.json, landing.*) wherever that already says it.
import type { Person, TaskCardData } from '../../shared/app-ui';

export const PEOPLE = {
  dev: { name: 'Dev One', photo: true },
  dilnoza: { name: 'Дилноза Рахимова' },
  alisher: { name: 'Алишер Каримов' },
  bobur: { name: 'Бобур Тошев' },
  jasur: { name: 'Жасур Абдуллаев' },
} satisfies Record<string, Person>;

export const ACME = { name: 'Сайт Acme', id: 'acme' };
export const BRAND = { name: 'Бренд 2026', id: 'brand-2026' };

/** The sky's keyframes, at hours of the day. Every one stays light: the app's glass never sits on a dark ground. */
export const SKY: { at: number; top: string; mid: string; low: string; sun: string }[] = [
  { at: 8, top: '#dce5f9', mid: '#f7d6c8', low: '#ffe8dc', sun: '#ffd9c2' },
  { at: 10.5, top: '#b9d0f4', mid: '#dce8fb', low: '#f5f1ee', sun: '#fff3df' },
  { at: 13.5, top: '#a7c6f1', mid: '#d3e4fb', low: '#eef3fa', sun: '#fffaf0' },
  { at: 16.5, top: '#c3c9ee', mid: '#ffd8c6', low: '#ffbea8', sun: '#ffb38f' },
  { at: 19.5, top: '#b4ade3', mid: '#e7c8e6', low: '#ffc6b2', sun: '#ff8f73' },
];
export const DAY_FROM = SKY[0].at;
export const DAY_TO = SKY[SKY.length - 1].at;

export type Moment = {
  id: string;
  /** Hours as decimals; the clock reads this when the section is in the middle of the screen. */
  at: number;
  eyebrow: string;
  /** Its link in the bar. */
  nav: string;
  title: string;
  text: string;
  points: string[];
};

export const MOMENTS: Moment[] = [
  {
    id: 'chats', nav: 'Чаты', at: 9 + 10 / 60, eyebrow: 'Чаты',
    title: 'Утро начинается в чате.',
    text: 'Проекты, личные чаты и коллеги — каждые в своей вкладке. Упомянули задачу — она уже карточка в сообщении.',
    points: ['Сообщение — уже задача', 'Своя видеокомната у канала', 'Всё по вкладкам'],
  },
  {
    id: 'board', nav: 'Задачи', at: 11.5, eyebrow: 'Таск-трекер',
    title: 'К обеду всё на своих местах.',
    text: 'Kanban, список и сроки у каждого проекта. Карточка помнит, из какого разговора она пришла и кто за неё отвечает.',
    points: ['Статусы как у вас в команде', 'Приоритеты и сроки', 'Подзадачи и чек-листы'],
  },
  {
    id: 'calendar', nav: 'Календарь', at: 14, eyebrow: 'Календарь и звонки',
    title: 'Встречи, которые назначаются сами.',
    text: 'Попросите в чате — Jamo AI найдёт время, удобное всем. Звонок начинается прямо в MyJamo, без ссылок и лишних приложений.',
    points: ['Время находит AI', 'Перетащите — и готово', 'Звонки без ссылок'],
  },
  {
    id: 'drive', nav: 'Диск', at: 16 + 20 / 60, eyebrow: 'Облачный диск',
    title: 'Файлы лежат там, где о них говорили.',
    text: 'Диск рядом с задачей и чатом: вложение из переписки сразу видно в проекте, а договор находится по одному слову.',
    points: ['Папки по проектам', 'Вложения из чатов', 'Поиск по названию'],
  },
  {
    id: 'jamo', nav: 'Jamo AI', at: 18 + 5 / 60, eyebrow: 'Jamo AI',
    title: 'Вечером Jamo подводит итоги.',
    text: 'Jamo AI знает ваши проекты, людей и сроки. Спросите обычными словами — он сделает и покажет, что изменилось. Отменить — одно касание.',
    points: ['Слушает', 'Думает', 'Делает', 'Подтверждает'],
  },
];

export const CARDS: Record<string, TaskCardData> = {
  review: { title: 'Ревью пул-реквеста по навигации', code: 'ACM-11', people: [PEOPLE.dilnoza], type: 'story' },
  chats: { title: 'Сделать макет страницы «Чаты»', code: 'ACM-24', priority: 'high', people: [PEOPLE.alisher], type: 'feature', due: '16.10.2026', comments: 2 },
  scroll: { title: 'Починить прокрутку на мобильных', code: 'ACM-19', priority: 'urgent', people: [PEOPLE.dilnoza], type: 'feature', comments: 1 },
  dates: { title: 'Исправить баг с датами в календаре', code: 'ACM-13', priority: 'high', due: '14.10.2026', overdue: true, type: 'bug' },
  release: { title: 'Заметки к релизу 2.4', code: 'ACM-21', people: [PEOPLE.bobur], type: 'task', subtasks: [2, 3] },
  onboarding: { title: 'Обновить онбординг гостей', code: 'ACM-17', priority: 'low', people: [PEOPLE.jasur, PEOPLE.dev], type: 'task' },
  landing: { title: 'Обновить лендинг к запуску', code: 'ACM-25', people: [PEOPLE.dev], type: 'task', due: '20.10.2026' },
};

export const AUDIENCES = [
  { title: 'Фрилансеры', text: 'Клиенты, сроки и звонки в одном месте вместо пяти вкладок.' },
  { title: 'Команды от 5 до 50', text: 'Одна подписка вместо мессенджера, трекера, календаря и диска.' },
  { title: 'Растущие компании', text: 'Проекты, роли и организации, которые растут вместе с вами.' },
  { title: 'Крупный бизнес и госсектор', text: 'Установка на ваших серверах. Персональные данные остаются у вас, в соответствии с 152-ФЗ.' },
];
