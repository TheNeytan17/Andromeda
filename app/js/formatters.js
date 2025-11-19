// Utilidades para formateos dependientes de locale
import i18next from "../i18n";

export function formatDateISO(dateString) {
  const locale = i18next.language || "es";
  const options = { year: "numeric", month: "long", day: "numeric" };
  try {
    return new Intl.DateTimeFormat(locale, options).format(
      new Date(dateString)
    );
  } catch (e) {
    console.error("formatDateISO error:", e);
    return dateString;
  }
}

// Ejemplo de formatter para fecha corta
export function formatDateShort(dateString) {
  const locale = i18next.language || "es";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Intl.DateTimeFormat(locale, options).format(new Date(dateString));
}
