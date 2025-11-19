import { useEffect, useSyncExternalStore } from "react";
import i18next from "../../i18n";

function subscribe(callback) {
  i18next.on("languageChanged", callback);
  return () => i18next.off("languageChanged", callback);
}

function getSnapshot() {
  return i18next.language || "es";
}

export function useI18n() {
  const lang = useSyncExternalStore(subscribe, getSnapshot);
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const t = i18next.t.bind(i18next);

  const changeLanguage = async (lng) => {
    await i18next.changeLanguage(lng);
    try {
      localStorage.setItem("preferredLanguage", lng);
    } catch {}
    if (typeof document !== "undefined") {
      document.documentElement.lang = lng;
    }
  };

  return { t, lang, changeLanguage };
}
