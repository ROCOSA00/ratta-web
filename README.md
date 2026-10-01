# RATTA MUSIK · web oficial

Web de **RATTA MUSIK**, el dúo de DJs formado por **Rocco** ([@djroccolive](https://www.instagram.com/djroccolive/)) y **Giselz** ([@giseeelz](https://www.instagram.com/giseeelz/)).
*Ponemos música de* → **Diseñamos el AMBIENTE.**

Es una web estática: no necesita servidor, base de datos ni instalar nada. Se publica gratis con GitHub Pages.

> **Lo más importante:** para cambiar fechas, enlaces, sesiones, clubs y fotos solo hay que tocar **un archivo: [`datos.js`](datos.js)**.

---

## Índice

1. [Cómo editar un archivo desde el móvil o el ordenador](#1-cómo-editar-un-archivo-sin-instalar-nada)
2. [Añadir o cambiar fechas](#2-añadir-o-cambiar-fechas)
3. [Cambiar enlaces, email o WhatsApp](#3-cambiar-enlaces-email-o-whatsapp)
4. [Cambiar la live session de YouTube y los SoundCloud](#4-cambiar-la-live-session-de-youtube-y-los-soundcloud)
5. [Cambiar los clubs de la cinta](#5-cambiar-los-clubs-de-la-cinta-que-se-mueve)
6. [Cambiar o añadir fotos](#6-cambiar-o-añadir-fotos)
7. [Poner un vídeo en la portada](#7-poner-un-vídeo-en-la-portada-opcional)
8. [Cambiar textos (español e inglés)](#8-cambiar-textos-español-e-inglés)
9. [El formulario de booking](#9-el-formulario-de-booking)
10. [Cambiar el presskit en PDF](#10-cambiar-el-presskit-en-pdf)
11. [Dónde está publicada](#11-dónde-está-publicada)
12. [Usar un dominio propio](#12-usar-un-dominio-propio-opcional)
13. [Pendientes](#13-pendientes)
14. [Estructura de carpetas](#14-estructura-de-carpetas)

---

## 1. Cómo editar un archivo sin instalar nada

1. Entra en el repositorio en GitHub ([github.com/ROCOSA00/ratta-web](https://github.com/ROCOSA00/ratta-web)).
2. Pulsa sobre el archivo que quieras cambiar (por ejemplo `datos.js`).
3. Pulsa el **lápiz ✏️** (arriba a la derecha, "Edit this file").
4. Haz el cambio.
5. Pulsa **"Commit changes…"** (botón verde), escribe una frase corta de lo que has cambiado (por ejemplo *"Añadida fecha en Apolo"*) y confirma.
6. En 1-2 minutos la web se actualiza sola.

**Tres reglas de oro en `datos.js`:**

- Todo texto va **entre comillas**: `"Sala Apolo"`.
- Cada línea de una lista termina en **coma**: `"Sala Apolo",`
- No borres las **llaves `{ }`** ni los **corchetes `[ ]`**.

Las líneas que empiezan por `//` son comentarios: la web las ignora. Si algo deja de verse después de un cambio, casi siempre es una coma o unas comillas que faltan. Desde la pestaña **History** del archivo se puede volver a la versión anterior.

---

## 2. Añadir o cambiar fechas

En [`datos.js`](datos.js), busca el bloque `fechas:`. Está vacío y por eso la web muestra **"Próximas fechas muy pronto"**.

Para añadir un bolo, copia esta línea dentro de los corchetes:

```js
fechas: [
  { fecha: "2026-11-14", ciudad: "Barcelona", club: "Sala Apolo", entradas: "https://enlace-de-entradas.com", estado: "" },
  { fecha: "2026-12-05", ciudad: "Mataró", club: "Cocoa", entradas: "", estado: "gratis" },
],
```

| Campo      | Qué poner |
|------------|-----------|
| `fecha`    | Año-mes-día: `"2026-11-14"` |
| `ciudad`   | Ciudad del bolo |
| `club`     | Club, sala o nombre del evento |
| `entradas` | Enlace para comprar entradas. Si no hay, déjalo vacío: `""` |
| `estado`   | `""` (normal) · `"agotado"` · `"gratis"` |

- Da igual el orden: la web las ordena sola.
- Cuando una fecha pasa, se mueve sola a **"Fechas pasadas"** (atenuada y plegada).
- Si hay enlace de entradas, aparece el botón **Entradas ↗**.

---

## 3. Cambiar enlaces, email o WhatsApp

En [`datos.js`](datos.js):

```js
contacto: {
  email: "itsrattamusik@gmail.com",
  whatsapp: "34652932722",        // con el 34 delante, sin espacios ni +
  telefonoVisible: "652 932 722", // cómo se ve escrito en la web
},

enlaces: {
  instagram: "https://www.instagram.com/rattamusik/",
  youtube: "https://www.youtube.com/@RattaMusik",
  soundcloud: "https://soundcloud.com/rattamusik",
  tiktok: "https://www.tiktok.com/@itsrattamusik",
  linktree: "https://linktr.ee/rattamusik",
  instagramRocco: "https://www.instagram.com/djroccolive/",
  instagramGiselz: "https://www.instagram.com/giseeelz/",
},
```

Cambia el enlace y se actualiza en toda la web (menú, footer, botones…).

---

## 4. Cambiar la live session de YouTube y los SoundCloud

**Vídeo destacado** (bloque `videoDestacado` en `datos.js`):

- `youtubeId`: lo que va después de `watch?v=` en el enlace.
  Ejemplo: `youtube.com/watch?v=_EKQXdQ-XGg` → `"_EKQXdQ-XGg"`
- `empiezaEn`: segundo en el que empieza (ahora `162`, como el enlace del presskit). `0` = desde el principio.
- `titulo` y `subtitulo`: el texto que aparece debajo.
- `portada`: la imagen que se ve antes de darle al play.

El vídeo **no se carga hasta que alguien pulsa play** (así la web va más rápida y YouTube no pone cookies antes de tiempo).

**SoundCloud** (lista `soundcloud`): cada línea es una sesión. Para añadir una, copia una línea y cambia el título, el detalle y el enlace de la pista:

```js
{ titulo: "The Ratta House #003", detalle: "House session", url: "https://soundcloud.com/rattamusik/nombre-de-la-pista" },
```

---

## 5. Cambiar los clubs de la cinta que se mueve

En `datos.js`, listas `clubs` (fila grande) y `eventos` (fila pequeña). Añade, quita o reordena nombres. La cinta se rellena sola.

---

## 6. Cambiar o añadir fotos

### Preparar la foto

- Formato recomendado: **.webp** (también vale .jpg).
- Tamaño: unos **1200 px de ancho** y que pese **menos de 250 KB**.
- Para convertir y comprimir gratis: [squoosh.app](https://squoosh.app) → arrastra la foto → a la derecha elige **WebP**, calidad 70-75 → en "Resize" pon 1200 de ancho → descarga.
- El tratamiento violeta de las fotos actuales se hizo a partir del presskit. Si queréis el mismo look en fotos nuevas, aplicad un filtro violeta/duotono antes de subirlas (o subidlas tal cual: también quedan bien sobre el negro).

### Subirla

1. En GitHub entra en la carpeta `assets/img/`.
2. **Add file → Upload files** → arrastra la foto → **Commit changes**.

### Ponerla en la galería

En `datos.js`, lista `galeria`, añade una línea:

```js
{ foto: "assets/img/mi-foto.webp", mini: "assets/img/mi-foto.webp", texto: "Rocco y Giselz en Sala Apolo", forma: "vertical" },
```

- `foto`: la grande (la que se abre a pantalla completa).
- `mini`: la de la cuadrícula (si no tienes versión pequeña, repite la misma).
- `texto`: descripción corta (la leen Google y los lectores de pantalla).
- `forma`: `"vertical"`, `"horizontal"`, `"grande"` o `"normal"`.

La galería se coloca sola en mosaico (2 columnas en móvil, 3 en ordenador).

### Cambiar las fotos de la portada

La portada va cambiando entre fotos de cabina en blanco y negro, con cortes secos a ritmo (124 BPM). Están en `datos.js`, lista `portada`:

```js
portada: [
  { foto: "assets/img/portada-1.webp", enfoque: "50% 42%" },
  { foto: "assets/img/portada-2.webp", enfoque: "50% 44%" },
  ...
],
```

- En el **móvil** salen todas, una detrás de otra.
- En el **ordenador** la pantalla se parte en dos: las fotos 1, 3, 5… van a la izquierda y las 2, 4, 6… a la derecha. Por eso conviene ponerlas **por parejas** (por ejemplo: Giselz a un lado y Rocco al otro).
- Mejor fotos **verticales**, en **blanco y negro**, de unos **1080 px de ancho**.
- `enfoque` decide qué parte de la foto se ve si hay que recortar: el primer número es horizontal y el segundo vertical (`"50% 40%"` = centrada y un poco hacia arriba).

### Cambiar el resto de fotos

La forma más fácil es **subir la foto nueva con exactamente el mismo nombre** que la que quieres sustituir (GitHub la reemplaza).

---

## 7. Poner un vídeo en la portada (opcional)

Si tenéis un vídeo corto de cabina, puede sustituir a las fotos de la portada:

1. Que dure 10-20 segundos, sin sonido, en **.mp4** y que pese **menos de 4 MB** (se puede comprimir con [handbrake.fr](https://handbrake.fr), preset "Web").
2. Créalo en `assets/video/portada.mp4` (Add file → Upload files; si la carpeta no existe, escribe `assets/video/` delante del nombre al subirlo).
3. En `datos.js`: `portadaVideo: "assets/video/portada.mp4",`

El vídeo se ve en blanco y negro, como las fotos. A quien tenga activado el ahorro de datos o el "movimiento reducido" se le siguen mostrando las fotos.

---

## 8. Cambiar textos (español e inglés)

- **Español:** está escrito directamente en [`index.html`](index.html). Busca la frase (Ctrl+F) y cámbiala con cuidado de no tocar lo que va entre `< >`.
- **Inglés:** en [`assets/js/i18n.js`](assets/js/i18n.js). Cada texto tiene una "clave" (por ejemplo `"why.1"`) que es la misma que aparece en el HTML como `data-i18n="why.1"`.

La web se abre en español. Si el navegador del visitante no está en español, catalán, gallego o euskera, se abre en inglés. Siempre se puede cambiar con el selector **ES / EN** de arriba (y la web lo recuerda).

---

## 9. El formulario de booking

GitHub Pages no tiene servidor, así que el formulario funciona así:

- **"Enviar por email"** abre la app de correo del visitante con el email a `itsrattamusik@gmail.com` ya escrito (nombre, tipo de evento, fecha, ciudad y mensaje). Solo tiene que darle a enviar.
- **"Enviar por WhatsApp"** abre WhatsApp con el mismo mensaje dirigido al 652 932 722.

**Opcional, recibir el formulario sin que salga de la web:**

1. Crea una cuenta gratuita en [formspree.io](https://formspree.io) con `itsrattamusik@gmail.com`.
2. Crea un formulario nuevo y copia su enlace (algo como `https://formspree.io/f/abcdwxyz`).
3. En `datos.js`: `formulario: { endpoint: "https://formspree.io/f/abcdwxyz" },`

A partir de ahí, "Enviar por email" manda el mensaje directamente y muestra *"Mensaje enviado"*.

> Las **tarifas no aparecen en la web** a propósito: el booking va siempre por contacto.

---

## 10. Cambiar el presskit en PDF

El botón "Descargar presskit" descarga `assets/docs/ratta-musik-presskit.pdf`. Es el presskit original **sin la página de condiciones (tarifas)** y comprimido (2 MB en lugar de 22 MB).

Para actualizarlo: sube el PDF nuevo a `assets/docs/` con el mismo nombre. **Ojo:** quitadle antes la página de tarifas y comprimidlo (por ejemplo con [ilovepdf.com/compress_pdf](https://www.ilovepdf.com/compress_pdf)) para que se descargue rápido desde el móvil.

---

## 11. Dónde está publicada

La web se publica sola en dos sitios cada vez que cambia la rama `main`:

- **Vercel (principal):** https://ratta-web.vercel.app/ — es la dirección que usan Google y la vista previa al compartir el enlace.
- **GitHub Pages (copia):** https://rocosa00.github.io/ratta-web/ — se activa en **Settings → Pages → Source: Deploy from a branch → Branch: `main` · `/ (root)` → Save**.

Tras cada cambio, en 1-2 minutos está publicado.

**Al compartir el enlace** por WhatsApp o redes sale la imagen [`assets/img/og-image.jpg`](assets/img/og-image.jpg) con el logo y "Diseñamos el AMBIENTE". WhatsApp guarda en caché la vista previa: si cambiáis la imagen, puede tardar unos días en actualizarse.

---

## 12. Usar un dominio propio (opcional)

Si compráis un dominio (por ejemplo `rattamusik.com`), lo más sencillo es conectarlo en **Vercel → el proyecto → Settings → Domains** y seguir los pasos que indica.

Después, sustituye `https://ratta-web.vercel.app/` por la nueva dirección en: `index.html` (líneas de `canonical`, `og:url`, `og:image`, `twitter:image` y el bloque `application/ld+json`), `robots.txt` y `sitemap.xml`. La página `404.html` no hay que tocarla: funciona en cualquier dirección.

---

## 13. Pendientes

- **[PENDIENTE: fechas]** El presskit no incluye fechas. Mientras la lista esté vacía, la web muestra "Próximas fechas muy pronto".
- **[PENDIENTE: vídeo corto para la portada]** Opcional; ver el punto 7.
- **[PENDIENTE: formulario directo]** Opcional; ver Formspree en el punto 9.
- **[PENDIENTE: dominio propio]** Opcional; ver el punto 12.

---

## 14. Estructura de carpetas

```
ratta-web/
├── index.html            ← la web (textos en español)
├── datos.js              ← TODO lo editable: fechas, enlaces, sesiones, clubs, galería
├── README.md             ← este archivo
├── 404.html              ← página de "no encontrada"
├── favicon.ico / favicon.svg / apple-touch-icon.png
├── site.webmanifest, robots.txt, sitemap.xml, .nojekyll
└── assets/
    ├── css/styles.css    ← diseño (colores y tipografías arriba del todo)
    ├── js/main.js        ← animaciones e interacción (no hace falta tocarlo)
    ├── js/i18n.js        ← textos en inglés
    ├── js/vendor/        ← Lenis (scroll suave, licencia MIT)
    ├── fonts/            ← Inter Tight y DM Mono (licencia SIL OFL)
    ├── logo/             ← logo RATTÄ, RATTÄ + dj live sessions, RATTÄ MUSIK, isotipo (SVG)
    ├── img/              ← fotos optimizadas (.webp), imagen para compartir, iconos
    └── docs/             ← presskit en PDF (sin tarifas)
```

### Diseño, en una línea

Minimalista y de club: negro (`#09080b`), fotografía en blanco y negro con flash y grano, un único acento lila sacado del presskit (`#cb6ce6`) que aparece en detalles y al pasar el ratón por las fotos, titulares en **Inter Tight** (grotesca muy pesada, en mayúsculas) y datos en **DM Mono**. La pantalla partida en dos y el "B2B" juegan con *"la energía fluye por dos bandos"*.

### Para quien sepa programar

- Sin build: HTML + CSS + JS sin dependencias salvo Lenis (alojado en el repo).
- Para probarla en local: `npx http-server .` (o cualquier servidor estático) y abrir `http://localhost:8080`.
- Las fotos se procesaron desde el presskit con ImageMagick/Pillow: b/n con curva sigmoidal (portada) y duotono violeta (negro `#050109` → `#7d3aa3` → `#f7eefb`, mezclado al 75 % con la foto desaturada) para el resto, que se muestra en b/n con `filter: grayscale()` y recupera el violeta al pasar el ratón.
- Respeta `prefers-reduced-motion` (sin loader, sin scroll suave, sin cursor ni animaciones). Sin JavaScript se ve el contenido escrito en `index.html`; las listas que salen de `datos.js` (cinta de clubs, fechas, SoundCloud y galería) necesitan JavaScript.
