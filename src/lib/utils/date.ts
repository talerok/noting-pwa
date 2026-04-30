import { t } from '../i18n/index.svelte.js';

export function relativeDate(iso: string): string {
  const date = new Date(iso);
  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return t('justNow');
  if (minutes < 60) return t('minutesAgo', { count: minutes });
  if (hours < 24) return t('hoursAgo', { count: hours });
  if (days < 30) return t('daysAgo', { count: days });

  return date.toLocaleDateString();
}
