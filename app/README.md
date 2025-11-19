# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

```markdown
# I18N - Guía de integración (Andromeda)

## Resumen

Esta integración usa i18next para soportar inglés (en) y español (es) en el frontend.

## Instalación

Desde la raíz del proyecto (si tienes package.json):
```

npm install i18next i18next-browser-languagedetector i18next-http-backend

```
o con yarn:
```

yarn add i18next i18next-browser-languagedetector i18next-http-backend

````

Archivos clave
-------------
- app/i18n.js: inicializador de i18next (detection + backend).
- app/locales/{es|en}/{namespace}.json: recursos por idioma y namespace.
- app/js/lang-switcher.js: selector de idioma y función translatePage() para actualizar el DOM.
- app/js/formatters.js: utilidades para formateos dependientes del locale.
- app/partials/lang-selector.html: partial para incluir en header/navbar.

Uso rápido
---------
1. Asegúrate de importar app/i18n.js lo antes posible en tu bundle o en la plantilla (antes de renderizar textos).
2. Importa y ejecuta initLangSelector() y translatePage() cuando cargue la página o cuando montes tu UI.
Ejemplo en tu script principal:
```js
import './i18n';
import { initLangSelector, translatePage } from './js/lang-switcher';
initLangSelector();
translatePage();
````


## Investigación: Internacionalización (I18N) – Entrega técnica

Esta implementación cumple con los 6 puntos solicitados en el documento.

1) Selección de librería/framework
- i18next (+ browser-languagedetector + http-backend). Motivos: madurez, rendimiento, amplia adopción, soporte de namespaces y carga remota/estática, integración sencilla con React sin dependencias adicionales.

2) Configuración del entorno de traducción
- Archivo: `app/i18n.js` con fallbackLng, supportedLngs, detección (localStorage/cookie/navigator), `loadPath` a `public/Locales/{{lng}}/{{ns}}.json` y `defaultNS=common`.
- Se importa en `src/main.jsx` para inicializar antes del render.

3) Formatos y organización de archivos
- JSON por idioma en `app/public/Locales/{es|en}/common.json` con organización por módulos: `nav`, `maint`, `login`, `home`, `tables`, `tickets`, `category`, `common`.
- Estructura escalable por namespaces si se requiere más adelante.

4) Implementación en la interfaz (frontend)
- Hook `useI18n` (`src/hooks/useI18n.js`) expone `t`, `lang`, `changeLanguage` y re-renderiza al cambiar idioma.
- Componentes actualizados: `Header.jsx`, `Home.jsx`, `Maintenance/TableCategory.jsx`, `Maintenance/TableTechnician.jsx`, `Maintenance/TableTicket.jsx`, `Maintenance/CreateCategory.jsx` (labels, placeholders, títulos, tooltips, estados, validaciones y toasts).
- DB: valores provenientes del backend se muestran tal cual (no se traducen).

5) Mecanismo de selección de idioma
- Selector visible en `Header.jsx` (desktop + móvil) con el mismo estilo de `TableAssign` (Radix Select). Accesible con `label` y `aria-label`.

6) Persistencia del idioma
- i18next guarda en `localStorage`/cookie y el hook actualiza `document.documentElement.lang`. La preferencia se mantiene entre sesiones y navegación.

Formato de fechas/números
- Utilidades en `src/lib/utils.js`: `formatDate` y `formatNumber` usan `Intl` con el idioma activo.

Cómo añadir nuevas traducciones
- Agregar claves en `public/Locales/es/common.json` y `public/Locales/en/common.json` bajo el módulo correspondiente.
- Consumirlas en componentes con `const { t } = useI18n();` y `t('modulo.clave')`.

Ejecución
- Desarrollo: `npm run dev` (Vite). Los JSON se sirven desde `public/Locales`.
Alcance cubierto
- Textos visibles clave (títulos, subtítulos, botones, placeholders, etiquetas), notificaciones (toasts y errores de carga), estados de tickets, tooltips, y navegación. El resto de vistas puede migrarse siguiendo el mismo patrón.


- Texto visible: <span data-i18n="title"></span>
- Texto con namespace: <h2 data-i18n="home:welcome"></h2>
- Input placeholder: <input data-i18n="placeholders:name" placeholder="" />
- Atributos: usar data-i18n-attr="title,alt" y data-i18n="key" para setear atributos si se requiere.

## Persistencia y detección

- i18next detecta y cachea en localStorage y cookies (según configuración).
- El selector guarda en localStorage con la clave preferredLanguage.
- Se actualiza document.documentElement.lang para accesibilidad y SEO.

## Fechas y formatos

Usa Intl.DateTimeFormat con el locale activo (ejemplos en app/js/formatters.js).

## Notas de despliegue

- Ajusta `loadPath` en app/i18n.js según cómo sirvas archivos estáticos (por ejemplo, '/locales/{{lng}}/{{ns}}.json' es más común en producción).
- Si prefieres no exponer JSON públicos, puedes servirlos desde /api/locales/:lng/:ns y ajustar loadPath.

## Buenas prácticas

- Mantén namespaces por módulo: 'common', 'home', 'auth', 'dashboard'.
- Extrae todas las cadenas visibles a los JSON de locales.
- No traduzcas contenido proveniente directamente de la base de datos.
- Evita interpolar HTML inseguro en traducciones.

## Extensiones útiles

- i18next-scanner: para extraer automáticamente claves desde tu código a los JSON.
- Plugins para formatos .po si en el futuro necesitas integrarlo con traductores externos.

```

```
