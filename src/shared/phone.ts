// The waitlist's phone number: which country it is in, the digits after the country code, and how
// they are written. Only the countries we are sure of get a mask (Baymard: a wrong mask is worse than
// none); everywhere else the field takes digits as they come and checks only E.164's length.

/** Calling codes by ISO country. Codes are prefix-free, so a number's leading digits name its code. */
const DIAL: Record<string, string> = Object.fromEntries(
  ('AF93 AL355 DZ213 AD376 AO244 AG1 AR54 AM374 AU61 AT43 AZ994 BS1 BH973 BD880 BB1 BY375 BE32 BZ501 BJ229 BT975 ' +
    'BO591 BA387 BW267 BR55 BN673 BG359 BF226 BI257 KH855 CM237 CA1 CV238 CF236 TD235 CL56 CN86 CO57 KM269 CG242 ' +
    'CD243 CR506 CI225 HR385 CU53 CY357 CZ420 DK45 DJ253 DM1 DO1 EC593 EG20 SV503 GQ240 ER291 EE372 SZ268 ET251 ' +
    'FJ679 FI358 FR33 GA241 GM220 GE995 DE49 GH233 GR30 GD1 GT502 GN224 GW245 GY592 HT509 HN504 HK852 HU36 IS354 ' +
    'IN91 ID62 IR98 IQ964 IE353 IL972 IT39 JM1 JP81 JO962 KZ7 KE254 KI686 KR82 KW965 KG996 LA856 LV371 LB961 LS266 ' +
    'LR231 LY218 LI423 LT370 LU352 MO853 MG261 MW265 MY60 MV960 ML223 MT356 MH692 MR222 MU230 MX52 FM691 MD373 ' +
    'MC377 MN976 ME382 MA212 MZ258 MM95 NA264 NR674 NP977 NL31 NZ64 NI505 NE227 NG234 MK389 NO47 OM968 PK92 PW680 ' +
    'PS970 PA507 PG675 PY595 PE51 PH63 PL48 PT351 PR1 QA974 RO40 RU7 RW250 KN1 LC1 VC1 WS685 SM378 ST239 SA966 ' +
    'SN221 RS381 SC248 SL232 SG65 SK421 SI386 SB677 SO252 ZA27 SS211 ES34 LK94 SD249 SR597 SE46 CH41 SY963 TW886 ' +
    'TJ992 TZ255 TH66 TL670 TG228 TO676 TT1 TN216 TR90 TM993 TV688 UG256 UA380 AE971 GB44 US1 UY598 UZ998 VU678 ' +
    'VE58 VN84 YE967 ZM260 ZW263')
    .split(' ').map((s) => [s.slice(0, 2), s.slice(2)]),
);

/** Where a shared code goes when nothing else says: +1 is the US, +7 Russia (Kazakhstan by its 6 and 7). */
const HOME: Record<string, string> = { '1': 'US', '7': 'RU', '39': 'IT', '44': 'GB', '61': 'AU' };

/** The neighbours most visitors come from, above the alphabet in the picker. */
export const PINNED = ['UZ', 'KZ', 'KG', 'TJ', 'TM', 'RU'];

/** How the digits after the code are grouped, and a number to show the shape before anyone types. */
const MASKS: Record<string, { groups: number[]; example: string }> = {
  UZ: { groups: [2, 3, 2, 2], example: '901234567' },
  KZ: { groups: [3, 3, 2, 2], example: '7012345678' },
  RU: { groups: [3, 3, 2, 2], example: '9123456789' },
  KG: { groups: [3, 3, 3], example: '700123456' },
  TJ: { groups: [2, 3, 4], example: '931234567' },
  TM: { groups: [2, 2, 2, 2], example: '65123456' },
};

export const COUNTRIES = Object.keys(DIAL);
export const dialOf = (country: string) => DIAL[country];

/** The country as a flag: its two regional-indicator letters. */
export const flagOf = (country: string) => String.fromCodePoint(...[...country].map((c) => 0x1f1a5 + c.charCodeAt(0)));

const digitsOf = (s: string) => s.replace(/\D/g, '');
const maxDigits = (country: string) => MASKS[country]?.groups.reduce((a, b) => a + b) ?? 15 - DIAL[country].length;

/** The national digits in the country's groups, or as they are where it has no mask. */
export function formatNational(country: string, digits: string): string {
  const mask = MASKS[country];
  if (!mask) return digits;
  const parts: string[] = [];
  let at = 0;
  for (const n of mask.groups) {
    if (at >= digits.length) break;
    parts.push(digits.slice(at, at + n));
    at += n;
  }
  return parts.join(' ');
}

export const placeholderOf = (country: string) => (MASKS[country] ? formatNational(country, MASKS[country].example) : '');

/** The country a whole number (digits, code first) belongs to; `current` wins a code it shares. */
function countryOf(digits: string, current: string): string | null {
  for (const n of [1, 2, 3]) {
    const code = digits.slice(0, n);
    if (digits.length < n || !Object.values(DIAL).includes(code)) continue;
    if (code === '7' && digits.length > 1) return /^7[67]/.test(digits) ? 'KZ' : 'RU';
    if (DIAL[current] === code) return current;
    return HOME[code] ?? Object.keys(DIAL).find((c) => DIAL[c] === code)!;
  }
  return null;
}

/** What the field holds: the country picked, and the text shown after its code. */
export type PhoneValue = { country: string; text: string };

/**
 * Reads what was typed, pasted or autofilled. A number that starts with `+`, or that carries the
 * picked code in front of a full national number, picks its own country; `+` and digits that name
 * no code yet stay as typed until they do. A Russian or Kazakh number dialled with its home 8 loses it.
 */
export function readPhone(raw: string, country: string): PhoneValue {
  let digits = digitsOf(raw);
  const whole = raw.trimStart().startsWith('+') || (digits.length > maxDigits(country) && digits.startsWith(DIAL[country]));
  if (whole) {
    const found = countryOf(digits, country);
    if (!found) return { country, text: '+' + digits };
    country = found;
    digits = digits.slice(DIAL[found].length);
  } else if (DIAL[country] === '7' && digits.length === 11 && /^[78]/.test(digits)) {
    digits = digits.slice(1);
  }
  // +7 is both: Kazakh numbers start with 6 or 7, Russian ones never do.
  if (DIAL[country] === '7' && digits) country = /^[67]/.test(digits) ? 'KZ' : 'RU';
  return { country, text: formatNational(country, digits.slice(0, maxDigits(country))) };
}

/** The number as `+` and digits, or null while it is not a whole one yet. */
export function toE164({ country, text }: PhoneValue): string | null {
  if (text.startsWith('+')) return null;
  const digits = digitsOf(text);
  const whole = MASKS[country] ? digits.length === maxDigits(country) : DIAL[country].length + digits.length >= 10;
  return whole ? `+${DIAL[country]}${digits}` : null;
}

/** Where the caret goes in `text` so that `digits` digits are before it, as they were before formatting. */
export function caretAfter(text: string, digits: number): number {
  if (digits <= 0) return text.startsWith('+') ? 1 : 0;
  let seen = 0;
  for (let i = 0; i < text.length; i++) if (/\d/.test(text[i]) && ++seen === digits) return i + 1;
  return text.length;
}

/**
 * The countries' names in the page's language, for the picker and its search. Chrome takes `uz` but
 * may have no Uzbek names and answer with the code, so a name that comes back as its code is English.
 */
export function countryNames(locale: string): Record<string, string> {
  const of = (l: string) => { try { const n = new Intl.DisplayNames([l], { type: 'region' }); return (c: string) => n.of(c); } catch { return () => undefined; } };
  const local = of(locale), en = of('en');
  const name = (c: string) => [local(c), en(c)].find((n) => n && n !== c) ?? c;
  return Object.fromEntries(COUNTRIES.map((c) => [c, name(c)]));
}
