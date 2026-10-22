// The kit's own chrome in three languages: every label a component draws by itself (not what a caller
// passes in). Without a <JuiLang> the kit speaks Russian, exactly as it always has. The Uzbek is Latin
// script and reuses the product's own terms from frontend/public/i18n/uz-Latn.json.
import { createContext, useContext, type ReactNode } from 'react';
import type { PriorityKey, RailKey, StatusKey, Tone, TypeKey } from './catalog';

export type JuiLangCode = 'ru' | 'uz' | 'en';

export type JuiText = {
  statuses: Record<StatusKey, string>;
  priorities: Record<PriorityKey, string>;
  types: Record<TypeKey, string>;
  rail: Record<RailKey, string>;
  common: {
    chats: string;
    searchTasks: string;
    send: string;
  };
  board: {
    tabs: { docs: string; tasks: string; board: string; calendar: string };
    members: (n: number) => string;
    addMember: string;
    tasks: string;
    filter: string;
    task: string;
    assignee: string;
    assignees: string;
    addTask: string;
    myTasks: string;
    open: (n: number) => string;
    today: (n: number) => string;
    overdue: (n: number) => string;
    columns: { code: string; title: string; type: string; status: string; priority: string; assignee: string; due: string };
  };
  calendar: {
    today: string;
    month: string;
    week: string;
    agenda: string;
    event: string;
  };
  assistant: {
    greeting: string;
    lead: string;
    starters: string[];
    placeholder: string;
    disclaimer: string;
    micStop: string;
    micStart: string;
    connecting: string;
    meetingKind: string;
    taskKind: string;
    undone: string;
    open: string;
    undo: string;
  };
  chats: {
    all: string;
    assistantPreview: string;
    pick: string;
    assistantSub: string;
    online: string;
    offline: string;
    message: string;
    messageFor: (name: string) => string;
  };
  drive: {
    name: string;
    uploadedBy: string;
    date: string;
    size: string;
    myFiles: string;
    lead: string;
    pages: string;
    files: string;
    disk: string;
    library: string;
    shared: string;
    projects: string;
    upload: string;
    items: (n: number) => string;
  };
  calls: {
    you: string;
    mic: string;
    camera: string;
    screen: string;
    participants: string;
    chat: string;
    more: string;
    leave: string;
  };
  detail: {
    creator: string;
    assignees: string;
    watchers: string;
    add: string;
    type: string;
    dates: string;
    notSet: string;
    priority: string;
    status: string;
    description: string;
    describe: string;
    subtasks: string;
    comments: string;
    history: string;
    noComments: string;
    writeComment: string;
  };
};

/** Russian plural: 1 участник, 2 участника, 5 участников. */
export function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

const ru: JuiText = {
  statuses: { todo: 'Сделать', progress: 'В прогрессе', review: 'На проверке', done: 'Сделано', cancelled: 'Отменено' },
  priorities: { low: 'Низкий', normal: 'Обычный', high: 'Высокий', urgent: 'Срочный' },
  types: { task: 'Задача', feature: 'Функция', bug: 'Ошибка', story: 'История', epic: 'Эпик' },
  rail: { home: 'Главное', chats: 'Чаты', boards: 'Проекты', calendar: 'Календарь', library: 'Хранилище' },
  common: { chats: 'Чаты', searchTasks: 'Поиск по задачам…', send: 'Отправить' },
  board: {
    tabs: { docs: 'Документы', tasks: 'Задачи', board: 'Kanban', calendar: 'Календарь' },
    members: (n) => `${n} ${plural(n, 'участник', 'участника', 'участников')}`,
    addMember: 'Добавить участника',
    tasks: 'Задачи',
    filter: 'Фильтр',
    task: 'Задача',
    assignee: 'Исполнитель',
    assignees: 'Исполнители',
    addTask: 'Добавить задачу',
    myTasks: 'Мои задачи',
    open: (n) => `Открытых: ${n}`,
    today: (n) => `На сегодня: ${n}`,
    overdue: (n) => `Просрочено: ${n}`,
    columns: { code: 'Код', title: 'Название', type: 'Тип', status: 'Статус', priority: 'Приоритет', assignee: 'Исполнитель', due: 'Срок' },
  },
  calendar: { today: 'Сегодня', month: 'Месяц', week: 'Неделя', agenda: 'Повестка', event: 'Событие' },
  assistant: {
    greeting: 'Добрый день!',
    lead: 'Превращаю переписку в задачи, слежу за сроками и встречами',
    starters: ['Создай задачу', 'Что у нас по доске?', 'Найди время для встречи', 'Ты кто?'],
    placeholder: 'Спросите Jamo AI',
    disclaimer: 'Ассистент может ошибаться. Всё, что он сделал по вашей просьбе, можно отменить.',
    micStop: 'Завершить разговор',
    micStart: 'Говорить голосом',
    connecting: 'Подключаю…',
    meetingKind: 'Встреча',
    taskKind: 'Задача',
    undone: 'Отменено',
    open: 'Открыть',
    undo: 'Отменить',
  },
  chats: {
    all: 'Все',
    assistantPreview: 'Спросите о задачах, чатах и встречах',
    pick: 'Выберите чат',
    assistantSub: 'ассистент онлайн',
    online: 'в сети',
    offline: 'не в сети',
    message: 'Сообщение',
    messageFor: (name) => `Сообщение для ${name}`,
  },
  drive: {
    name: 'Имя',
    uploadedBy: 'Загрузил',
    date: 'Дата',
    size: 'Размер',
    myFiles: 'Мои файлы',
    lead: 'Все нужные файлы на своём месте.',
    pages: 'Страницы',
    files: 'Файлы',
    disk: 'Диск',
    library: 'Библиотека',
    shared: 'Доступные мне',
    projects: 'Проекты',
    upload: 'Загрузить',
    items: (n) => `Объектов: ${n}`,
  },
  calls: { you: 'Вы', mic: 'Микрофон', camera: 'Камера', screen: 'Экран', participants: 'Участники', chat: 'Чат', more: 'Ещё', leave: 'Выйти' },
  detail: {
    creator: 'Создатель',
    assignees: 'Исполнитель(и)',
    watchers: 'Наблюдатели',
    add: '+ Добавить',
    type: 'Тип',
    dates: 'Даты',
    notSet: 'Не задано',
    priority: 'Приоритет',
    status: 'Статус',
    description: 'Описание',
    describe: 'Опишите задачу…',
    subtasks: 'Подзадачи',
    comments: 'Комментарии',
    history: 'История',
    noComments: 'Комментариев пока нет',
    writeComment: 'Написать комментарий…',
  },
};

const uz: JuiText = {
  statuses: { todo: 'Bajarish', progress: 'Jarayonda', review: 'Tekshiruvda', done: 'Bajarildi', cancelled: 'Bekor qilindi' },
  priorities: { low: 'Past', normal: 'Oddiy', high: 'Yuqori', urgent: 'Shoshilinch' },
  types: { task: 'Vazifa', feature: 'Funksiya', bug: 'Xato', story: 'Hikoya', epic: 'Epik' },
  rail: { home: 'Asosiy', chats: 'Chatlar', boards: 'Loyihalar', calendar: 'Kalendar', library: 'Ombor' },
  common: { chats: 'Chatlar', searchTasks: 'Vazifalar boʻyicha qidiruv…', send: 'Yuborish' },
  board: {
    tabs: { docs: 'Hujjatlar', tasks: 'Vazifalar', board: 'Kanban', calendar: 'Kalendar' },
    members: (n) => `${n} a’zo`,
    addMember: 'A’zo qoʻshish',
    tasks: 'Vazifalar',
    filter: 'Filtr',
    task: 'Vazifa',
    assignee: 'Ijrochi',
    assignees: 'Ijrochilar',
    addTask: 'Vazifa qoʻshish',
    myTasks: 'Vazifalarim',
    open: (n) => `Ochiq: ${n}`,
    today: (n) => `Bugun: ${n}`,
    overdue: (n) => `Muddati oʻtgan: ${n}`,
    columns: { code: 'Kod', title: 'Nomi', type: 'Turi', status: 'Holat', priority: 'Ustuvorlik', assignee: 'Ijrochi', due: 'Muddat' },
  },
  calendar: { today: 'Bugun', month: 'Oy', week: 'Hafta', agenda: 'Kun tartibi', event: 'Tadbir' },
  assistant: {
    greeting: 'Xayrli kun!',
    lead: 'Yozishmalarni vazifalarga aylantiraman, muddatlar va uchrashuvlarni kuzatib boraman',
    starters: ['Vazifa yarat', 'Doskada nima gap?', 'Uchrashuv uchun vaqt top', 'Sen kimsan?'],
    placeholder: 'Jamo AI’dan soʻrang',
    disclaimer: 'Assistent xato qilishi mumkin. Siz soʻragan har bir amalni bekor qilsa boʻladi.',
    micStop: 'Suhbatni yakunlash',
    micStart: 'Ovoz bilan gapirish',
    connecting: 'Ulanmoqda…',
    meetingKind: 'Uchrashuv',
    taskKind: 'Vazifa',
    undone: 'Bekor qilindi',
    open: 'Ochish',
    undo: 'Bekor qilish',
  },
  chats: {
    all: 'Hammasi',
    assistantPreview: 'Vazifalar, chatlar va uchrashuvlar haqida soʻrang',
    pick: 'Chatni tanlang',
    assistantSub: 'assistent onlayn',
    online: 'onlayn',
    offline: 'oflayn',
    message: 'Xabar',
    messageFor: (name) => `${name} uchun xabar`,
  },
  drive: {
    name: 'Nomi',
    uploadedBy: 'Yuklagan',
    date: 'Sana',
    size: 'Hajmi',
    myFiles: 'Mening fayllarim',
    lead: 'Barcha kerakli fayllar oʻz joyida.',
    pages: 'Sahifalar',
    files: 'Fayllar',
    disk: 'Disk',
    library: 'Kutubxona',
    shared: 'Men bilan ulashilgan',
    projects: 'Loyihalar',
    upload: 'Yuklash',
    items: (n) => `Obyektlar: ${n}`,
  },
  calls: { you: 'Siz', mic: 'Mikrofon', camera: 'Kamera', screen: 'Ekran', participants: 'Ishtirokchilar', chat: 'Chat', more: 'Yana', leave: 'Chiqish' },
  detail: {
    creator: 'Yaratuvchi',
    assignees: 'Ijrochi(lar)',
    watchers: 'Kuzatuvchilar',
    add: '+ Qoʻshish',
    type: 'Turi',
    dates: 'Sanalar',
    notSet: 'Belgilanmagan',
    priority: 'Ustuvorlik',
    status: 'Holat',
    description: 'Tavsif',
    describe: 'Vazifani tavsiflang…',
    subtasks: 'Kichik vazifalar',
    comments: 'Izohlar',
    history: 'Tarix',
    noComments: 'Hozircha izohlar yoʻq',
    writeComment: 'Izoh yozing…',
  },
};

const en: JuiText = {
  statuses: { todo: 'To do', progress: 'In progress', review: 'In review', done: 'Done', cancelled: 'Cancelled' },
  priorities: { low: 'Low', normal: 'Normal', high: 'High', urgent: 'Urgent' },
  types: { task: 'Task', feature: 'Feature', bug: 'Bug', story: 'Story', epic: 'Epic' },
  rail: { home: 'Home', chats: 'Chats', boards: 'Projects', calendar: 'Calendar', library: 'Drive' },
  common: { chats: 'Chats', searchTasks: 'Search tasks…', send: 'Send' },
  board: {
    tabs: { docs: 'Docs', tasks: 'Tasks', board: 'Kanban', calendar: 'Calendar' },
    members: (n) => `${n} ${n === 1 ? 'member' : 'members'}`,
    addMember: 'Add member',
    tasks: 'Tasks',
    filter: 'Filter',
    task: 'Task',
    assignee: 'Assignee',
    assignees: 'Assignees',
    addTask: 'Add task',
    myTasks: 'My tasks',
    open: (n) => `Open: ${n}`,
    today: (n) => `Due today: ${n}`,
    overdue: (n) => `Overdue: ${n}`,
    columns: { code: 'Key', title: 'Title', type: 'Type', status: 'Status', priority: 'Priority', assignee: 'Assignee', due: 'Due' },
  },
  calendar: { today: 'Today', month: 'Month', week: 'Week', agenda: 'Agenda', event: 'Event' },
  assistant: {
    greeting: 'Good afternoon!',
    lead: 'I turn conversations into tasks and keep track of deadlines and meetings',
    starters: ['Create a task', 'What’s on the board?', 'Find time for a meeting', 'Who are you?'],
    placeholder: 'Ask Jamo AI',
    disclaimer: 'The assistant can make mistakes. Anything it does at your request can be undone.',
    micStop: 'End conversation',
    micStart: 'Talk by voice',
    connecting: 'Connecting…',
    meetingKind: 'Meeting',
    taskKind: 'Task',
    undone: 'Undone',
    open: 'Open',
    undo: 'Undo',
  },
  chats: {
    all: 'All',
    assistantPreview: 'Ask about tasks, chats and meetings',
    pick: 'Select a chat',
    assistantSub: 'online assistant',
    online: 'online',
    offline: 'offline',
    message: 'Message',
    messageFor: (name) => `Message ${name}`,
  },
  drive: {
    name: 'Name',
    uploadedBy: 'Uploaded by',
    date: 'Date',
    size: 'Size',
    myFiles: 'My files',
    lead: 'Every file you need, right where it belongs.',
    pages: 'Pages',
    files: 'Files',
    disk: 'Drive',
    library: 'Library',
    shared: 'Shared with me',
    projects: 'Projects',
    upload: 'Upload',
    items: (n) => `Items: ${n}`,
  },
  calls: { you: 'You', mic: 'Mic', camera: 'Camera', screen: 'Screen', participants: 'People', chat: 'Chat', more: 'More', leave: 'Leave' },
  detail: {
    creator: 'Creator',
    assignees: 'Assignee(s)',
    watchers: 'Watchers',
    add: '+ Add',
    type: 'Type',
    dates: 'Dates',
    notSet: 'Not set',
    priority: 'Priority',
    status: 'Status',
    description: 'Description',
    describe: 'Describe the task…',
    subtasks: 'Subtasks',
    comments: 'Comments',
    history: 'History',
    noComments: 'No comments yet',
    writeComment: 'Write a comment…',
  },
};

/** A catalog key takes its colour from the catalog and its name from the current language; a tone is drawn as given. */
export const toneOf = <K extends string>(map: Record<K, Tone>, names: Record<K, string>, key: K | Tone): Tone =>
  typeof key === 'string' ? { name: names[key], color: map[key].color } : key;

const TEXT: Record<JuiLangCode, JuiText> = { ru, uz, en };

const LangContext = createContext<JuiLangCode>('ru');

/** Sets the language of every kit component inside it. Without one the kit is Russian. */
export function JuiLang({ lang, children }: { lang: JuiLangCode; children: ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useJuiLang(): JuiLangCode {
  return useContext(LangContext);
}

/** The kit's chrome in the current language. */
export function useJuiText(): JuiText {
  return TEXT[useContext(LangContext)];
}
