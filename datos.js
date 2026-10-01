/* =====================================================================
   RATTA MUSIK · DATOS DE LA WEB
   ---------------------------------------------------------------------
   Este es el ÚNICO archivo que hace falta tocar para actualizar
   fechas, enlaces, sesiones, clubs y fotos. No hace falta saber
   programar: el README.md explica cada caso paso a paso.

   Tres reglas para no romper nada:
     1. Todo texto va entre comillas "así".
     2. Cada línea de una lista termina en coma ,
     3. No borres las llaves { } ni los corchetes [ ].
   Las líneas que empiezan por // son comentarios: la web las ignora.
   ===================================================================== */

window.RATTA = {

  /* -------------------------------------------------------------------
     1. FECHAS (BOLOS)
     Copia la línea de ejemplo, quítale las // del principio y rellena:
       fecha:    "AAAA-MM-DD"  (año-mes-día, por ejemplo "2026-11-14")
       ciudad:   ciudad del bolo
       club:     nombre del club, sala o evento
       entradas: enlace para comprar entradas ("" si no hay)
       estado:   ""  normal  ·  "agotado"  ·  "gratis"
     Las fechas que ya han pasado se mueven solas a "Fechas pasadas".
     Si la lista está vacía, la web muestra "Próximas fechas muy pronto".
     ------------------------------------------------------------------- */
  fechas: [
    // { fecha: "2026-11-14", ciudad: "Barcelona", club: "Nombre del club", entradas: "https://...", estado: "" },
  ],

  /* [PENDIENTE: no hay ninguna fecha en el presskit. Añadidlas aquí cuando estén confirmadas.] */

  /* -------------------------------------------------------------------
     PORTADA: FOTOS QUE VAN CAMBIANDO
     En el móvil salen todas, una detrás de otra.
     En el ordenador la pantalla se parte en dos: las fotos 1, 3, 5…
     van a la izquierda y las 2, 4, 6… a la derecha (por eso van por parejas).
     foto:    ruta de la imagen (vertical, en blanco y negro, ~1080 px de ancho)
     enfoque: qué parte de la foto se ve si hay que recortar
              ("50% 40%" = centrada y un poco hacia arriba)
     ------------------------------------------------------------------- */
  portada: [
    { foto: "assets/img/portada-1.webp", enfoque: "50% 42%" },
    { foto: "assets/img/portada-2.webp", enfoque: "50% 44%" },
    { foto: "assets/img/portada-3.webp", enfoque: "50% 46%" },
    { foto: "assets/img/portada-4.webp", enfoque: "50% 38%" },
    { foto: "assets/img/portada-5.webp", enfoque: "58% 45%" },
    { foto: "assets/img/portada-6.webp", enfoque: "50% 35%" },
  ],

  /* -------------------------------------------------------------------
     PORTADA EN VÍDEO (opcional)
     Si tenéis un vídeo corto de cabina (10-20 s, sin sonido, .mp4,
     menos de 4 MB), subidlo a assets/video/ y escribid aquí su ruta,
     por ejemplo "assets/video/portada.mp4". Sustituye a las fotos.
     [PENDIENTE: vídeo corto para la portada]
     ------------------------------------------------------------------- */
  portadaVideo: "",

  /* -------------------------------------------------------------------
     2. CONTACTO Y BOOKING
     whatsapp: número con prefijo de país, sin espacios ni el signo +
     ------------------------------------------------------------------- */
  contacto: {
    email: "itsrattamusik@gmail.com",
    whatsapp: "34652932722",
    telefonoVisible: "652 932 722",
  },

  /* Formulario de booking.
     Vacío (""): el formulario prepara el email o el WhatsApp con los datos
     y solo hay que darle a enviar.
     Si algún día creáis una cuenta gratuita en formspree.io, pegad aquí
     vuestro enlace (tipo "https://formspree.io/f/xxxxxxx") y los mensajes
     llegarán directamente al correo sin salir de la web. */
  formulario: {
    endpoint: "",
  },

  /* -------------------------------------------------------------------
     3. REDES SOCIALES
     ------------------------------------------------------------------- */
  enlaces: {
    instagram: "https://www.instagram.com/rattamusik/",
    youtube: "https://www.youtube.com/@RattaMusik",
    soundcloud: "https://soundcloud.com/rattamusik",
    tiktok: "https://www.tiktok.com/@itsrattamusik",
    linktree: "https://linktr.ee/rattamusik",
    instagramRocco: "https://www.instagram.com/djroccolive/",
    instagramGiselz: "https://www.instagram.com/giseeelz/",
  },

  /* -------------------------------------------------------------------
     4. LIVE SESSIONS
     Vídeo destacado de YouTube:
       youtubeId: lo que va después de "watch?v=" en el enlace del vídeo.
                  Ej.: youtube.com/watch?v=_EKQXdQ-XGg  →  "_EKQXdQ-XGg"
       empiezaEn: segundo en el que arranca el vídeo (0 = desde el principio)
     ------------------------------------------------------------------- */
  videoDestacado: {
    youtubeId: "_EKQXdQ-XGg",
    empiezaEn: 162,
    titulo: "The Ratta House #001",
    subtitulo: "House session",
    portada: "assets/img/live-session-1184.webp",
  },

  /* Sesiones de SoundCloud (se muestran en este orden).
     url: el enlace de la pista en SoundCloud. */
  soundcloud: [
    { titulo: "The Ratta House #002", detalle: "House session at The Pink Elephant · 23.06.2026", url: "https://soundcloud.com/rattamusik/the-ratta-house-002-house" },
    { titulo: "Sexy Caramel", detalle: "RATTA · Extended mix", url: "https://soundcloud.com/rattamusik/sexycaramel" },
    { titulo: "The Ratta House #001", detalle: "House session", url: "https://soundcloud.com/rattamusik/the-ratta-house-001-house" },
  ],

  /* -------------------------------------------------------------------
     5. CABINAS (la cinta que se mueve debajo de la portada)
     clubs:   fila grande
     eventos: fila pequeña (eventos, restaurantes, fiestas mayores…)
     ------------------------------------------------------------------- */
  clubs: [
    "Pachá Barcelona",
    "Sala Apolo",
    "Espai Titus Badalona",
    "Sala Vértigo",
    "Sala Upload",
    "Sala Dresdén",
    "Nexus Club Zaragoza",
    "Pachito Sitges",
    "Cocoa Mataró",
    "Classic Mataró",
    "Sala Duvet",
    "Malalts de Festa",
    "Particular Mataró",
    "Sakova Menorca",
    "Sala Privat",
  ],
  eventos: [
    "El Jaleo",
    "Attic",
    "Hotel W",
    "Zeta Dance",
    "Milkshake",
    "Somos Manuelas",
    "La Curiosa",
    "Bbsesh",
    "Panoràmic Montgat",
    "Sal Groga Badalona",
    "Santa Lola Badalona",
    "Fiesta Mayor de Martorell",
    "Fiesta Mayor de Santa Coloma",
  ],

  /* -------------------------------------------------------------------
     6. GALERÍA
     foto:      la imagen grande (la que se abre a pantalla completa)
     mini:      versión pequeña para la cuadrícula (si no tienes, repite la grande)
     texto:     descripción corta de la foto (la leen Google y los lectores de pantalla)
     forma:     "vertical" · "horizontal" · "grande" · "normal"
     ------------------------------------------------------------------- */
  galeria: [
    { foto: "assets/img/duo-cabina-a-1200.webp", mini: "assets/img/duo-cabina-a-640.webp", texto: "Rocco y Giselz en la cabina", forma: "grande" },
    { foto: "assets/img/giselz-cabina-1200.webp", mini: "assets/img/giselz-cabina-640.webp", texto: "Giselz a los platos", forma: "vertical" },
    { foto: "assets/img/rocco-jaleo-1179.webp", mini: "assets/img/rocco-jaleo-640.webp", texto: "Rocco en cabina con la pista a tope", forma: "normal" },
    { foto: "assets/img/live-session-1184.webp", mini: "assets/img/live-session-640.webp", texto: "The Ratta House #001, live session al aire libre", forma: "horizontal" },
    { foto: "assets/img/rocco-flash-354.webp", mini: "assets/img/rocco-flash-354.webp", texto: "Rocco en cabina, en blanco y negro", forma: "normal" },
    { foto: "assets/img/duo-retrato-1066.webp", mini: "assets/img/duo-retrato-640.webp", texto: "Retrato de Rocco y Giselz en la pista", forma: "vertical" },
    { foto: "assets/img/rocco-cabina-800.webp", mini: "assets/img/rocco-cabina-640.webp", texto: "Rocco a los platos", forma: "vertical" },
    { foto: "assets/img/giselz-flash-354.webp", mini: "assets/img/giselz-flash-354.webp", texto: "Giselz en cabina con flash", forma: "normal" },
    { foto: "assets/img/duo-cabina-b-1200.webp", mini: "assets/img/duo-cabina-b-640.webp", texto: "Rocco y Giselz haciendo el signo de la paz en cabina", forma: "vertical" },
    { foto: "assets/img/giselz-retrato-432.webp", mini: "assets/img/giselz-retrato-432.webp", texto: "Retrato de Giselz", forma: "normal" },
  ],
};
