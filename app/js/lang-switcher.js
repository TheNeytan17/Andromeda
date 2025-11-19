// Lógica del selector de idioma y traducción del DOM.
// Importa i18n (asegúrate de que app/i18n.js se importe/ejecute antes que este archivo).
import i18next from "../i18n";

// Inicializa el selector <select id="lang-select"> (si existe)
export function initLangSelector() {
  const select = document.getElementById("lang-select");
  if (!select) return;

  // Rellenar opciones si no existen
  if (select.options.length === 0) {
    const optEs = document.createElement("option");
    optEs.value = "es";
    optEs.text = "Español";
    const optEn = document.createElement("option");
    optEn.value = "en";
    optEn.text = "English";
    select.add(optEs);
    select.add(optEn);
  }

  // Establecer el valor actual (i18next.language podría estar en formato 'es' o 'en')
  select.value = i18next.language || "es";
  document.documentElement.lang = i18next.language || "es";

  select.addEventListener("change", (e) => {
    const lng = e.target.value;
    i18next
      .changeLanguage(lng)
      .then(() => {
        // Guardar preferencia redundante (i18next también puede cachear)
        localStorage.setItem("preferredLanguage", lng);
        // Actualiza el atributo lang del documento
        document.documentElement.lang = lng;
        // Re-traducir la página
        translatePage();
      })
      .catch((err) => {
        console.error("Error changing language:", err);
      });
  });
}

// Traduce elementos marcados con data-i18n
export function translatePage() {
  // Soporta claves con o sin namespace: 'common:title' o 'title' si defaultNS = 'common'
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const text = i18next.t(key);
    // Si es input, actualizar placeholder
    const tag = el.tagName.toLowerCase();
    if (
      (tag === "input" || tag === "textarea") &&
      el.hasAttribute("placeholder")
    ) {
      el.placeholder = text;
    } else if (el.hasAttribute("data-i18n-attr")) {
      // Soporte para atributos: data-i18n-attr="title,placeholder" y data-i18n="key"
      const attrList = el
        .getAttribute("data-i18n-attr")
        .split(",")
        .map((a) => a.trim());
      attrList.forEach((attr) => {
        if (attr) el.setAttribute(attr, text);
      });
    } else {
      el.textContent = text;
    }
  });
}
