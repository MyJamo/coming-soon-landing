// The waitlist's phone field: the country's flag and code on a button, the number beside it written
// in the country's groups as it is typed, and a searchable list of countries under the button.
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { caretAfter, COUNTRIES, countryNames, dialOf, flagOf, PINNED, placeholderOf, readPhone, type PhoneValue } from '../../shared/phone';
import type { Copy } from './copy';

const digitsIn = (s: string) => s.replace(/\D/g, '');

export function PhoneField({ value, onChange, invalid, locale, text, inputRef }: {
  value: PhoneValue; onChange: (v: PhoneValue) => void; invalid: boolean; locale: string; text: Copy['join']; inputRef: RefObject<HTMLInputElement>;
}) {
  const [open, setOpen] = useState(false);
  const names = useMemo(() => countryNames(locale), [locale]);
  const button = useRef<HTMLButtonElement>(null);
  // Formatting rewrites the text, so the caret is put back after as many digits as were before it.
  const caret = useRef<number | null>(null);
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (caret.current !== null && el && el === document.activeElement) el.setSelectionRange(caret.current, caret.current);
    caret.current = null;
  }, [value, inputRef]);

  const type = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;
    let at = e.target.selectionStart ?? raw.length;
    // Backspace over a space takes the digit before it; otherwise the space comes straight back.
    if ((e.nativeEvent as InputEvent).inputType === 'deleteContentBackward' && digitsIn(raw) === digitsIn(value.text)) {
      const i = raw.slice(0, at).search(/\d\D*$/);
      if (i >= 0) { raw = raw.slice(0, i) + raw.slice(i + 1); at = i; }
    }
    const next = readPhone(raw, value.country);
    // A whole number that picked its country loses its code, so the caret simply goes to the end.
    const whole = next.country !== value.country || (raw.trimStart().startsWith('+') && !next.text.startsWith('+'));
    caret.current = whole ? next.text.length : caretAfter(next.text, digitsIn(raw.slice(0, at)).length);
    onChange(next);
  };

  const pick = (country: string) => {
    setOpen(false);
    onChange(readPhone(value.text.startsWith('+') ? '' : digitsIn(value.text), country));
    inputRef.current?.focus();
  };

  const close = (refocus: boolean) => { setOpen(false); if (refocus) button.current?.focus(); };

  return (
    <div className="skj-tel">
      <button ref={button} type="button" className="skj-cc" aria-haspopup="listbox" aria-expanded={open}
        aria-label={`${text.country}: ${names[value.country]}, +${dialOf(value.country)}`} onClick={() => setOpen((o) => !o)}>
        <span className="skj-flag" aria-hidden="true">{flagOf(value.country)}</span>
        <span>+{dialOf(value.country)}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <input ref={inputRef} type="tel" inputMode="tel" name="phone" autoComplete="tel" enterKeyHint="send" value={value.text} onChange={type}
        placeholder={placeholderOf(value.country) || text.phone} aria-label={text.phone} aria-invalid={invalid} />
      {open && <CountryList current={value.country} names={names} locale={locale} text={text} onPick={pick} onClose={close} anchor={button} />}
    </div>
  );
}

/** The neighbours first, then every country by its name; the search takes a name, a code or `+7`. */
function CountryList({ current, names, locale, text, onPick, onClose, anchor }: {
  current: string; names: Record<string, string>; locale: string; text: Copy['join'];
  onPick: (c: string) => void; onClose: (refocus: boolean) => void; anchor: RefObject<HTMLButtonElement>;
}) {
  const id = useId();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(() => PINNED.includes(current) ? PINNED.indexOf(current) : 0);
  const box = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);

  const rest = useMemo(() => COUNTRIES.filter((c) => !PINNED.includes(c)).sort((a, b) => names[a].localeCompare(names[b], locale)), [names, locale]);
  const q = query.trim().toLowerCase();
  const shown = useMemo(() => {
    if (!q) return [...PINNED, ...rest];
    const code = q.replace(/^\+/, '');
    const hits = [...PINNED, ...rest].filter((c) => names[c].toLowerCase().includes(q) || c.toLowerCase() === q || (/^\d+$/.test(code) && dialOf(c).startsWith(code)));
    // Names that start with the query come before the ones that only contain it.
    return hits.sort((a, b) => Number(!names[a].toLowerCase().startsWith(q)) - Number(!names[b].toLowerCase().startsWith(q)));
  }, [q, rest, names]);

  useEffect(() => { list.current?.querySelector('[data-active]')?.scrollIntoView({ block: 'nearest' }); }, [active]);

  // A click anywhere else closes the list, as does focus leaving it.
  useEffect(() => {
    const away = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!box.current?.contains(t) && !anchor.current?.contains(t)) onClose(false);
    };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [onClose, anchor]);

  const key = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.min(shown.length - 1, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1))));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (shown[active]) onPick(shown[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose(true);
    }
  };

  // On a phone the keyboard would cover the list, and the neighbours at its top are usually enough.
  const fine = matchMedia('(pointer: fine)').matches;
  return (
    <div className="skj-picker" ref={box} onKeyDown={key}
      onBlur={(e) => { const to = e.relatedTarget as Node | null; if (!box.current?.contains(to) && !anchor.current?.contains(to)) onClose(false); }}>
      <input type="search" role="combobox" aria-expanded="true" aria-controls={`${id}-list`} aria-activedescendant={shown[active] ? `${id}-${shown[active]}` : undefined}
        autoFocus={fine} value={query} onChange={(e) => { setQuery(e.target.value); setActive(0); }} placeholder={text.search} aria-label={text.search}
        autoComplete="off" autoCorrect="off" spellCheck={false} enterKeyHint="go" />
      {/* Pressing a row keeps the focus in the search, so the list is still there when the click lands. */}
      <ul id={`${id}-list`} role="listbox" aria-label={text.country} ref={list} onMouseDown={(e) => e.preventDefault()}>
        {shown.map((c, i) => (
          <li key={c} id={`${id}-${c}`} role="option" aria-selected={c === current} data-active={i === active || undefined}
            className={!q && i === PINNED.length - 1 ? 'skj-cc-last-pinned' : undefined}
            onPointerMove={() => setActive(i)} onClick={() => onPick(c)}>
            <span className="skj-flag" aria-hidden="true">{flagOf(c)}</span>
            <span className="skj-cc-name">{names[c]}</span>
            <span className="skj-cc-dial">+{dialOf(c)}</span>
          </li>
        ))}
      </ul>
      {!shown.length && <p className="skj-cc-none">{text.nothing}</p>}
    </div>
  );
}
