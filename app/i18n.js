// Inicializador de i18next (cliente)
// Ajusta loadPath según cómo sirvas archivos estáticos en tu proyecto.
// Requiere instalar: i18next, i18next-browser-languagedetector, i18next-http-backend
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

i18next
  .use(HttpBackend)
  .use(LanguageDetector)
  .init({
    fallbackLng: "es",
    supportedLngs: ["es", "en"],
    ns: ["common"],
    defaultNS: "common",
    backend: {
      // Si sirves archivos desde la carpeta app/locales tal como están, puede que necesites
      // cambiar esto a '/locales/{{lng}}/{{ns}}.json' dependiendo de cómo sirves assets.
      loadPath: "/Locales/{{lng}}/{{ns}}.json",
    },
    detection: {
      // Detecta por localStorage, cookie, navigator y guarda en localStorage/cookie
      order: ["localStorage", "cookie", "navigator"],
      caches: ["localStorage", "cookie"],
      lookupLocalStorage: "i18nextLng",
    },
    interpolation: {
      escapeValue: false,
    },
  })
  .catch((err) => {
    // Manejo básico de error para debugging
    console.error("i18next init error:", err);
  });

export default i18next;
