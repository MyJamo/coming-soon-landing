// The design's copy, verbatim, plus Uzbek (not in the design). `oops` and `failed` are new: the design never fails to save.
// The phone keys are new too, and `lead` asks for a phone where the design asked for an email.
export type Lang = 'ru' | 'uz' | 'en';

/** The tag the backend and `<html lang>` expect for each language. */
export const LOCALE: Record<Lang, string> = { ru: 'ru', uz: 'uz-Latn', en: 'en' };

export const T = {
  en: {
    lines: ['Polishing the chats…', 'Lining up the calendar…', 'Teaching Jamo good manners…', 'Sorting the boards…', 'Warming up the calls…'],
    sending: 'Saving your spot…', done: 'Done. See you in November.', off: 'Hmm, that email looks off…', listening: 'Listening…',
    title: 'Be among the first', lead: "Jamo is finishing your new workspace for chats, tasks, calls and files. Early access opens this November — leave your phone number and you'll be first in.",
    email: 'Email', cta: 'Notify me', joined: "You're on the list. We'll write to you first.", error: 'Enter a valid email address',
    phone: 'Phone number', phoneOff: 'Hmm, that number looks off…', phoneError: 'Enter a valid phone number',
    toEmail: 'Prefer email?', toPhone: 'Use a phone number instead',
    oops: 'Hmm, something went wrong…', failed: "Couldn't save that. Please try again.",
  },
  uz: {
    lines: ['Chatlarni sayqallayapman…', 'Taqvimni tartibga solyapman…', 'Jamoni odobga oʻrgatyapman…', 'Doskalarni saralayapman…', 'Qoʻngʻiroqlarni sozlayapman…'],
    sending: 'Joyingizni saqlayapman…', done: 'Tayyor. Noyabrda koʻrishamiz.', off: 'Hmm, manzilda xato borga oʻxshaydi…', listening: 'Tinglayapman…',
    title: 'Birinchilardan boʻling', lead: 'Jamo chatlar, vazifalar, qoʻngʻiroqlar va fayllar uchun yangi ish maydoningizni tugatyapti. Erta kirish noyabrda ochiladi — telefon raqamingizni qoldiring, sizni birinchilardan boʻlib taklif qilamiz.',
    email: 'Email', cta: 'Xabar berish', joined: 'Siz roʻyxatdasiz. Sizga birinchi boʻlib yozamiz.', error: 'Toʻgʻri email kiriting',
    phone: 'Telefon raqami', phoneOff: 'Hmm, raqamda xato borga oʻxshaydi…', phoneError: 'Toʻgʻri telefon raqamini kiriting',
    toEmail: 'Email qulayroqmi?', toPhone: 'Telefon raqamini qoldirish',
    oops: 'Hmm, nimadir xato ketdi…', failed: 'Saqlab boʻlmadi. Qaytadan urinib koʻring.',
  },
  ru: {
    lines: ['Полирую чаты…', 'Расставляю календарь…', 'Учу Jamo хорошим манерам…', 'Раскладываю доски…', 'Настраиваю звонки…'],
    sending: 'Сохраняю ваше место…', done: 'Готово. До встречи в ноябре.', off: 'Хм, кажется, в адресе ошибка…', listening: 'Слушаю…',
    title: 'Стань одним из первых', lead: 'Jamo заканчивает ваше новое рабочее пространство для чатов, задач, звонков и файлов. Ранний доступ откроется в ноябре — оставьте номер телефона, и мы пригласим вас одними из первых.',
    email: 'Электронная почта', cta: 'Сообщить мне', joined: 'Вы в списке. Напишем вам первыми.', error: 'Введите корректный адрес почты',
    phone: 'Номер телефона', phoneOff: 'Хм, кажется, в номере ошибка…', phoneError: 'Введите корректный номер телефона',
    toEmail: 'Удобнее почта?', toPhone: 'Оставить номер телефона',
    oops: 'Хм, что-то пошло не так…', failed: 'Не удалось сохранить. Попробуйте ещё раз.',
  },
} satisfies Record<Lang, Record<string, string | string[]>>;
