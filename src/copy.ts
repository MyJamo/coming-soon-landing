// The design's copy, verbatim, plus Uzbek (not in the design). `oops` and `failed` are new: the design never fails to save.
export type Lang = 'ru' | 'uz' | 'en';

/** The tag the backend and `<html lang>` expect for each language. */
export const LOCALE: Record<Lang, string> = { ru: 'ru', uz: 'uz-Latn', en: 'en' };

export const T = {
  en: {
    lines: ['Polishing the chats…', 'Lining up the calendar…', 'Teaching Jamo good manners…', 'Sorting the boards…', 'Warming up the calls…'],
    sending: 'Saving your spot…', done: 'Done. See you in November.', off: 'Hmm, that email looks off…', listening: 'Listening…',
    title: 'Be among the first', lead: "Jamo is finishing your new workspace for chats, tasks, calls and files. Early access opens this November — leave your email and you'll be first in.",
    email: 'Email', cta: 'Notify me', joined: "You're on the list. We'll write to you first.", error: 'Enter a valid email address',
    oops: 'Hmm, something went wrong…', failed: "Couldn't save your email. Please try again.",
  },
  uz: {
    lines: ['Chatlarni sayqallayapman…', 'Taqvimni tartibga solyapman…', 'Jamoni odobga oʻrgatyapman…', 'Doskalarni saralayapman…', 'Qoʻngʻiroqlarni sozlayapman…'],
    sending: 'Joyingizni saqlayapman…', done: 'Tayyor. Noyabrda koʻrishamiz.', off: 'Hmm, manzilda xato borga oʻxshaydi…', listening: 'Tinglayapman…',
    title: 'Birinchilardan boʻling', lead: 'Jamo chatlar, vazifalar, qoʻngʻiroqlar va fayllar uchun yangi ish maydoningizni tugatyapti. Erta kirish noyabrda ochiladi — emailingizni qoldiring, sizni birinchilardan boʻlib taklif qilamiz.',
    email: 'Email', cta: 'Xabar berish', joined: 'Siz roʻyxatdasiz. Sizga birinchi boʻlib yozamiz.', error: 'Toʻgʻri email kiriting',
    oops: 'Hmm, nimadir xato ketdi…', failed: 'Emailni saqlab boʻlmadi. Qaytadan urinib koʻring.',
  },
  ru: {
    lines: ['Полирую чаты…', 'Расставляю календарь…', 'Учу Jamo хорошим манерам…', 'Раскладываю доски…', 'Настраиваю звонки…'],
    sending: 'Сохраняю ваше место…', done: 'Готово. До встречи в ноябре.', off: 'Хм, кажется, в адресе ошибка…', listening: 'Слушаю…',
    title: 'Стань одним из первых', lead: 'Jamo заканчивает ваше новое рабочее пространство для чатов, задач, звонков и файлов. Ранний доступ откроется в ноябре — оставьте почту, и мы пригласим вас одними из первых.',
    email: 'Электронная почта', cta: 'Сообщить мне', joined: 'Вы в списке. Напишем вам первыми.', error: 'Введите корректный адрес почты',
    oops: 'Хм, что-то пошло не так…', failed: 'Не удалось сохранить адрес. Попробуйте ещё раз.',
  },
} satisfies Record<Lang, Record<string, string | string[]>>;
