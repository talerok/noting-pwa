import type { Appearance, Locale, Settings } from '../types/settings.js';
import { defaultSettings } from '../types/settings.js';
import type { OPFSStorage } from '../services/storage.js';
import { setLocale, detectLocale } from '../i18n/index.svelte.js';

export class SettingsStore {
  appearance = $state<Appearance>('system');
  locale = $state<Locale>('en');
  private storage: OPFSStorage | null = null;
  private systemThemeMql: MediaQueryList | null = null;

  async init(storage: OPFSStorage): Promise<void> {
    this.storage = storage;
    const saved = await storage.readSettings();
    this.appearance = saved.appearance;
    this.locale = saved.locale || detectLocale();
    setLocale(this.locale);
    this.applyTheme();

    // Listen for OS dark mode changes to update theme when appearance is 'system'
    this.systemThemeMql = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemThemeMql.addEventListener('change', () => {
      if (this.appearance === 'system') this.applyTheme();
    });
  }

  async setAppearance(value: Appearance): Promise<void> {
    this.appearance = value;
    this.applyTheme();
    await this.persist();
  }

  async setLocaleValue(value: Locale): Promise<void> {
    this.locale = value;
    setLocale(value);
    await this.persist();
  }

  applyTheme(): void {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    if (this.appearance === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      root.classList.add(this.appearance);
    }
  }

  private async persist(): Promise<void> {
    if (!this.storage) return;
    await this.storage.writeSettings({
      appearance: this.appearance,
      locale: this.locale,
    });
  }
}
