import { useEffect, useState } from "react";
import i18next from "../../i18n";

export function useI18n() {
  const [lang, setLang] = useState(i18next.language || "es");
  const [isReady, setIsReady] = useState(i18next.isInitialized);

  useEffect(() => {
    function handleUpdate() {
      setLang(i18next.language || "es");
      setIsReady(true);
    }
    // Suscribirse a eventos que indican recursos listos o cambios
    i18next.on("initialized", handleUpdate);
    i18next.on("loaded", handleUpdate);
    i18next.on("languageChanged", handleUpdate);

    // Si i18next ya está inicializado, actualizar inmediatamente
    if (i18next.isInitialized) {
      handleUpdate();
    }

    return () => {
      i18next.off("initialized", handleUpdate);
      i18next.off("loaded", handleUpdate);
      i18next.off("languageChanged", handleUpdate);
    };
  }, []);

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
      // También persistimos en la clave estándar de i18next por compatibilidad
      localStorage.setItem("i18nextLng", lng);
    } catch {}
    if (typeof document !== "undefined") {
      document.documentElement.lang = lng;
    }
  };

  return { t, lang, changeLanguage };
}
