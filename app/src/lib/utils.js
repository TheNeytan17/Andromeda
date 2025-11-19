import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getCurrentLang() {
  if (typeof document !== 'undefined' && document.documentElement.lang) {
    return document.documentElement.lang;
  }
  try {
    const pref = localStorage.getItem('preferredLanguage');
    if (pref) return pref;
  } catch {}
  return 'es';
}

export function formatDate(date, options = {}) {
  const lang = getCurrentLang();
  const fmt = new Intl.DateTimeFormat(lang, {
    year: 'numeric', month: 'short', day: '2-digit', ...options
  });
  return fmt.format(date);
}

export function formatNumber(num, options = {}) {
  const lang = getCurrentLang();
  const fmt = new Intl.NumberFormat(lang, options);
  return fmt.format(num);
}
