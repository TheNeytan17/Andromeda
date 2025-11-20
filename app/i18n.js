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
    // Asegura que resolvamos 'es'/'en' aunque el navegador sea 'es-ES' o 'en-US'
    load: "languageOnly",
    lowerCaseLng: true,
    nonExplicitSupportedLngs: true,
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
      // Leeremos la preferencia propia si existe; si no, i18next usará la suya por defecto
      lookupLocalStorage: "preferredLanguage",
    },
    interpolation: {
      escapeValue: false,
    },
    debug: typeof window !== "undefined" && import.meta?.env?.DEV === true,
  })
  .catch((err) => {
    // Manejo básico de error para debugging
    console.error("i18next init error:", err);
  });

// Logs útiles para ver en consola cuando falla una carga o cuando se carga correctamente
i18next.on("failedLoading", (lng, ns, msg) => {
  console.error("i18next failedLoading:", { lng, ns, msg });
});

i18next.on("loaded", (loaded) => {
  if (import.meta?.env?.DEV) {
    console.info("i18next loaded resources:", loaded);
  }
});

export default i18next;
