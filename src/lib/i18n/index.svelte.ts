import type { Locale } from '../types/settings.js';
import en from './en.js';
import ru from './ru.js';

type StringKey = keyof typeof en;
type Strings = Record<StringKey, string>;

const locales: Record<Locale, Strings> = { en, ru };

let currentLocale = $state<Locale>('en');

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: StringKey, params?: Record<string, string | number>): string {
  let str: string = locales[currentLocale]?.[key] ?? locales.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}

export function detectLocale(): Locale {
  const lang = navigator.language.slice(0, 2);
  return lang === 'ru' ? 'ru' : 'en';
}
