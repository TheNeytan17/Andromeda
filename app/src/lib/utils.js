import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getCurrentLang() {
  // Intentar obtener de localStorage primero (más actualizado)
  try {
    const pref = localStorage.getItem('i18nextLng') || localStorage.getItem('preferredLanguage');
    if (pref) {
      // Limpiar el código de idioma (remover -US, -ES, etc. si existe)
      const cleanLang = pref.split('-')[0];
      return cleanLang;
    }
  } catch {}
  
  // Luego intentar obtener del atributo lang del document
  if (typeof document !== 'undefined' && document.documentElement.lang) {
    const cleanLang = document.documentElement.lang.split('-')[0];
    return cleanLang;
  }
  
  // Por defecto español
  return 'es';
}

export function formatDate(date, options = {}, lang = null) {
  const currentLang = lang || getCurrentLang();
  // Map common language codes to full locale codes
  const localeMap = {
    'es': 'es-ES',
    'en': 'en-US',
    'es-ES': 'es-ES',
    'en-US': 'en-US'
  };
  const locale = localeMap[currentLang] || 'es-ES';
  
  const defaultOptions = { year: 'numeric', month: 'short', day: '2-digit' };
  const fmt = new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options });
  return fmt.format(date);
}

export function formatNumber(num, options = {}) {
  const lang = getCurrentLang();
  const fmt = new Intl.NumberFormat(lang, options);
  return fmt.format(num);
}
