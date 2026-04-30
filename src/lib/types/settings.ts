export type Appearance = 'system' | 'light' | 'dark';
export type Locale = 'en' | 'ru';

export interface Settings {
  appearance: Appearance;
  locale: Locale;
}

export const defaultSettings: Settings = {
  appearance: 'system',
  locale: 'en',
};
