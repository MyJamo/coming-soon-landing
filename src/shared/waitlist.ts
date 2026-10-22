// The page's forms put a phone number or an address on the waitlist: POST /api/waitlist, the
// Vercel Function in api/waitlist.ts. The source is 'hero' or 'footer'.
import { useState } from 'react';
import { track } from './analytics';

export type WaitlistSource = 'hero' | 'footer';
export type WaitlistState = 'open' | 'sending' | 'joined';
export type Contact = 'phone' | 'email';

const FAILED = 'Не получилось сохранить. Попробуйте ещё раз.';
const INVALID = 'Проверьте адрес — кажется, в нём опечатка.';
const INVALID_PHONE = 'Проверьте номер — кажется, в нём не хватает цифр.';

/** The function's own test of an address, loosely: one `@`, no whitespace, a dot in the domain. */
export const isEmail = (s: string) => /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(s);

/** 204 for a new contact and a known one alike; a 400 is one the function turned away. */
async function join(contact: Contact, value: string, source: WaitlistSource, text: WaitlistText): Promise<string | null> {
  try {
    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [contact]: value, source, locale: text.locale }),
    });
    if (res.ok) return null;
    return res.status === 400 ? (contact === 'phone' ? text.invalidPhone : text.invalid) : text.failed;
  } catch {
    return text.failed;
  }
}

/** What a page that speaks more than Russian tells the function and the reader. */
export type WaitlistText = { locale: string; failed: string; invalid: string; invalidPhone: string };

/**
 * One waitlist form's state: where it is in sending, and the line to show under it. The form keeps
 * the contact itself and hands `submit` the value to send, or null when it is not a whole one.
 */
export function useWaitlist(source: WaitlistSource, text: WaitlistText = { locale: 'ru', failed: FAILED, invalid: INVALID, invalidPhone: INVALID_PHONE }) {
  const [state, setState] = useState<WaitlistState>('open');
  const [error, setError] = useState<string | null>(null);

  const submit = async (contact: Contact, value: string | null) => {
    if (state !== 'open') return;
    if (!value) { setError(contact === 'phone' ? text.invalidPhone : text.invalid); return; }
    setError(null);
    setState('sending');
    const failure = await join(contact, value, source, text);
    if (!failure) track('generate_lead', { method: contact, form: source });
    setError(failure);
    setState(failure ? 'open' : 'joined');
  };

  return { state, error, clearError: () => setError(null), submit };
}

/** The Angular landing's copy (frontend/public/i18n/ru.json, landing.join.*), shared by the new landings. */
export const JOIN = {
  placeholder: 'you@company.com',
  cta: 'В лист ожидания',
  sending: 'Сохраняем…',
  joined: 'Вы в списке. Напишем вам первыми.',
  headline: 'Получите MyJamo раньше всех.',
  lead: 'Этой зимой ранний доступ откроется для первых команд. Оставьте email — пришлём приглашение.',
};
