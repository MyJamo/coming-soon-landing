// The design's copy, verbatim. `oops` and `failed` are new: the design never fails to save.
export type Lang = 'ru' | 'en';

export const T = {
  en: {
    lines: ['Polishing the chats…', 'Lining up the calendar…', 'Teaching Jamo good manners…', 'Sorting the boards…', 'Warming up the calls…'],
    sending: 'Saving your spot…', done: 'Done. See you in November.', off: 'Hmm, that email looks off…', listening: 'Listening…',
    title: 'Almost done.', lead: "Jamo is finishing your new workspace for chats, tasks, calls and files. Early access opens this November — leave your email and you'll be first in.",
    email: 'Email', cta: 'Notify me', joined: "You're on the list. We'll write to you first.", error: 'Enter a valid email address',
    oops: 'Hmm, something went wrong…', failed: "Couldn't save your email. Please try again.",
  },
  ru: {
    lines: ['Полирую чаты…', 'Расставляю календарь…', 'Учу Jamo хорошим манерам…', 'Раскладываю доски…', 'Настраиваю звонки…'],
    sending: 'Сохраняю ваше место…', done: 'Готово. До встречи в ноябре.', off: 'Хм, кажется, в адресе ошибка…', listening: 'Слушаю…',
    title: 'Почти готово.', lead: 'Jamo заканчивает ваше новое рабочее пространство для чатов, задач, звонков и файлов. Ранний доступ откроется в ноябре — оставьте почту, и мы пригласим вас одними из первых.',
    email: 'Электронная почта', cta: 'Сообщить мне', joined: 'Вы в списке. Напишем вам первыми.', error: 'Введите корректный адрес почты',
    oops: 'Хм, что-то пошло не так…', failed: 'Не удалось сохранить адрес. Попробуйте ещё раз.',
  },
} satisfies Record<Lang, Record<string, string | string[]>>;
