/* =====================================================================
   RATTA MUSIK · interacción
   No hace falta tocar este archivo para cambiar contenido:
   todo lo editable está en /datos.js (ver README).
   ===================================================================== */
(() => {
  'use strict';

  const D = window.RATTA || {};
  const I18N = window.RATTA_I18N || { en: {}, es: {} };
  const html = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduced) html.classList.add('reduced');

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } },
  };
  const session = {
    get(k) { try { return window.sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { window.sessionStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } },
  };

  /* -------------------------------------------------------------------
     IDIOMA
     ------------------------------------------------------------------- */
  let lang = 'es';
  const originals = new Map();
  const tr = (key) => (I18N[lang] && I18N[lang][key]) || (I18N.es && I18N.es[key]) || key;

  function captureOriginals() {
    $$('[data-i18n]').forEach((el) => originals.set(el, el.innerHTML));
    $$('[data-i18n-alt]').forEach((el) => { el.dataset.altEs = el.alt; });
    $$('[data-i18n-ph]').forEach((el) => { el.dataset.phEs = el.placeholder; });
  }

  function applyLang(next) {
    lang = next === 'en' ? 'en' : 'es';
    html.lang = lang;
    $$('[data-i18n]').forEach((el) => {
      const val = lang === 'es' ? originals.get(el) : I18N.en[el.dataset.i18n];
      if (val == null) return;
      el.innerHTML = val;
      if (el.matches('[data-reveal="lines"]')) splitWords(el);
    });
    $$('[data-i18n-alt]').forEach((el) => {
      el.alt = lang === 'es' ? el.dataset.altEs : (I18N.en[el.dataset.i18nAlt] || el.dataset.altEs);
    });
    $$('[data-i18n-ph]').forEach((el) => {
      el.placeholder = lang === 'es' ? el.dataset.phEs : (I18N.en[el.dataset.i18nPh] || el.dataset.phEs);
    });
    $$('.lang__btn').forEach((b) => {
      const on = b.dataset.lang === lang;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    const vf = $('#videoFacade');
    if (vf) vf.setAttribute('aria-label', tr('sessions.playVideo'));
    renderDates();
    renderTracks();
    renderGallery();
    buildMarquees();
    store.set('ratta-lang', lang);
  }

  /* -------------------------------------------------------------------
     TEXTO QUE SE REVELA LÍNEA A LÍNEA
     Cada palabra va en una máscara; todas las de la misma línea
     comparten retardo, así sube línea por línea.
     ------------------------------------------------------------------- */
  function splitWords(el) {
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const m = document.createElement('span');
            m.className = 'wm';
            const i = document.createElement('span');
            i.className = 'wi';
            i.textContent = part;
            m.appendChild(i);
            frag.appendChild(m);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains('wm')) {
          walk(n);
        }
      });
    };
    walk(el);
    el.classList.add('is-split');
    lineIndex(el);
  }

  function lineIndex(el) {
    let last = null;
    let line = -1;
    $$('.wm', el).forEach((w) => {
      const top = w.getBoundingClientRect().top;
      if (last === null || Math.abs(top - last) > 6) { line += 1; last = top; }
      w.style.setProperty('--i', line);
    });
  }

  /* -------------------------------------------------------------------
     ENLACES Y CONTACTO desde datos.js
     ------------------------------------------------------------------- */
  function applyLinks() {
    const L = D.enlaces || {};
    $$('[data-link]').forEach((a) => { if (L[a.dataset.link]) a.href = L[a.dataset.link]; });
    const C = D.contacto || {};
    if (C.email) {
      $$('[data-contact="email"], #bookingMail').forEach((a) => { a.href = 'mailto:' + C.email; a.textContent = C.email; });
    }
    if (C.whatsapp) {
      $$('[data-contact="whatsapp"], #waBtn').forEach((a) => { a.href = 'https://wa.me/' + C.whatsapp; });
    }
    if (C.telefonoVisible) {
      $$('[data-contact="phone"], #waNumber').forEach((s) => { s.textContent = C.telefonoVisible; });
    }
    const y = $('#year');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  /* -------------------------------------------------------------------
     SCROLL SUAVE (Lenis) + bucle de animación único
     ------------------------------------------------------------------- */
  let lenis = null;
  let scrollY = window.scrollY;
  let velocity = 0;
  const frameHooks = [];

  if (!reduced && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.4 });
    lenis.on('scroll', (l) => { scrollY = l.scroll; velocity = l.velocity || 0; onScroll(); });
  } else {
    window.addEventListener('scroll', () => { scrollY = window.scrollY; onScroll(); }, { passive: true });
  }

  let lastT = performance.now();
  function frame(now) {
    const dt = Math.min(64, now - lastT) / 16.667;
    lastT = now;
    if (lenis) lenis.raf(now);
    else velocity *= 0.9;
    for (let i = 0; i < frameHooks.length; i += 1) frameHooks[i](dt, now);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  function scrollToTarget(target, immediate) {
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: immediate ? 0 : 1.5, immediate: !!immediate });
    else target.scrollIntoView({ behavior: reduced || immediate ? 'auto' : 'smooth' });
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const target = document.getElementById(id.slice(1));
    if (!target) return;
    e.preventDefault();
    closeMenu();
    scrollToTarget(target);
    if (history.replaceState) history.replaceState(null, '', id);
  });

  /* -------------------------------------------------------------------
     CABECERA Y MENÚ
     ------------------------------------------------------------------- */
  const header = $('#header');
  const menu = $('#menu');
  const burger = $('#burger');
  let lastY = 0;
  let menuOpen = false;

  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', scrollY > 40);
    if (!menuOpen) {
      if (scrollY > lastY + 4 && scrollY > 160) header.classList.add('is-hidden');
      else if (scrollY < lastY - 4 || scrollY < 160) header.classList.remove('is-hidden');
    }
    lastY = scrollY;
  }

  function openMenu() {
    if (!menu) return;
    menuOpen = true;
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    burger.setAttribute('aria-expanded', 'true');
    header.classList.remove('is-hidden');
    if (lenis) lenis.stop();
    document.addEventListener('keydown', menuKey);
  }
  function closeMenu() {
    if (!menu || !menuOpen) return;
    menuOpen = false;
    menu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    if (lenis) lenis.start();
    document.removeEventListener('keydown', menuKey);
    setTimeout(() => { if (!menuOpen) menu.hidden = true; }, 800);
  }
  function menuKey(e) { if (e.key === 'Escape') { closeMenu(); burger.focus(); } }
  if (burger) burger.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));

  $$('.lang__btn').forEach((b) => b.addEventListener('click', () => applyLang(b.dataset.lang)));

  /* -------------------------------------------------------------------
     LOADER
     ------------------------------------------------------------------- */
  function runLoader() {
    const count = $('#loaderCount');
    const bar = $('#loaderBar');
    const heroImg = $('.hero__frame');
    if (reduced || !count) {
      html.classList.add('is-loaded', 'is-ready');
      return Promise.resolve();
    }
    const seen = session.get('ratta-seen') === '1';
    session.set('ratta-seen', '1');
    const minTime = seen ? 350 : 1100;
    const imgReady = !heroImg || heroImg.complete ? Promise.resolve() : new Promise((r) => {
      heroImg.addEventListener('load', r, { once: true });
      heroImg.addEventListener('error', r, { once: true });
    });
    const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    let ready = false;
    Promise.race([Promise.all([imgReady, fontsReady]), new Promise((r) => setTimeout(r, 3500))]).then(() => { ready = true; });
    if (lenis) lenis.stop();

    return new Promise((resolve) => {
      const t0 = performance.now();
      let p = 0;
      const tick = (now) => {
        const el = now - t0;
        const target = ready && el >= minTime ? 100 : Math.min(92, (el / minTime) * 92);
        p += (target - p) * (ready && el >= minTime ? 0.25 : 0.12);
        if (target === 100 && p > 99.4) p = 100;
        count.textContent = pad(Math.round(p), 3);
        if (bar) bar.style.transform = 'scaleX(' + (p / 100) + ')';
        if (p >= 100) {
          html.classList.add('is-loaded');
          if (lenis) lenis.start();
          setTimeout(() => html.classList.add('is-ready'), 1150);
          resolve();
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  function playClaim() {
    const c = $('#claim');
    if (!c) return;
    if (reduced) { c.classList.add('claim-1', 'claim-2', 'claim-3'); return; }
    setTimeout(() => c.classList.add('claim-1'), 450);
    setTimeout(() => c.classList.add('claim-2'), 1150);
    setTimeout(() => c.classList.add('claim-3'), 1650);
  }

  /* -------------------------------------------------------------------
     PORTADA: fotos de cabina con cortes secos, como un teaser de club.
     Móvil: una sola pantalla. Ordenador: dos bandos (izquierda y derecha),
     la derecha corta un pulso después que la izquierda.
     ------------------------------------------------------------------- */
  const BEAT = 60000 / 124; // 124 BPM
  const CUT_EVERY = BEAT * 8; // cada dos compases

  function initHero() {
    const hero = $('#inicio');
    const stage = $('#heroStage');
    if (!hero || !stage) return;

    const frames = (D.portada || []).filter((f) => f && f.foto);
    const left = $('.hero__side--l', stage);
    const right = $('.hero__side--r', stage);
    const first = $('.hero__frame', left);
    if (frames[0] && first) {
      if (first.getAttribute('src') !== frames[0].foto) first.src = frames[0].foto;
      if (frames[0].enfoque) first.style.objectPosition = frames[0].enfoque;
    }

    let visible = true;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(hero);

    const play = $('#heroPlay');
    if (play) {
      play.addEventListener('click', (e) => {
        e.preventDefault();
        loadVideo(true);
        scrollToTarget($('#sesiones'));
      });
    }

    // vídeo opcional en la portada (datos.js → portadaVideo): sustituye a las fotos
    const saveData = navigator.connection && navigator.connection.saveData;
    if (D.portadaVideo && !reduced && !saveData) {
      const v = document.createElement('video');
      v.muted = true;
      v.loop = true;
      v.autoplay = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.setAttribute('aria-hidden', 'true');
      v.preload = 'auto';
      v.poster = first ? first.src : '';
      v.src = D.portadaVideo;
      v.className = 'hero__video';
      v.addEventListener('canplay', () => {
        stage.prepend(v);
        stage.classList.add('has-video');
        v.play().catch(() => {});
      }, { once: true });
      v.load();
      return;
    }

    const wide = () => window.matchMedia('(min-aspect-ratio: 1/1) and (min-width: 700px)').matches;
    const decks = [];
    const setup = () => {
      decks.length = 0;
      if (wide() && frames.length > 1) {
        decks.push({ el: left, list: frames.filter((_, k) => k % 2 === 0), i: 0, delay: 0 });
        decks.push({ el: right, list: frames.filter((_, k) => k % 2 === 1), i: 0, delay: BEAT });
        if (!$('.hero__frame', right)) show(decks[1], 0, false);
      } else {
        decks.push({ el: left, list: frames, i: 0, delay: 0 });
      }
    };

    function show(deck, idx, flash) {
      const f = deck.list[idx];
      if (!f) return;
      const img = new Image();
      img.className = 'hero__frame';
      img.alt = '';
      img.decoding = 'async';
      img.src = f.foto;
      if (f.enfoque) img.style.objectPosition = f.enfoque;
      const swap = () => {
        const old = $$('.hero__frame', deck.el);
        deck.el.appendChild(img);
        img.getBoundingClientRect();
        img.classList.add('is-on');
        old.forEach((o) => { o.classList.remove('is-on'); setTimeout(() => o.remove(), 60); });
        if (flash) {
          deck.el.classList.remove('is-flash');
          void deck.el.offsetWidth;
          deck.el.classList.add('is-flash');
        }
        deck.i = idx;
      };
      if (img.decode) img.decode().then(swap).catch(swap);
      else img.onload = swap;
    }

    if (reduced || frames.length < 2) { setup(); return; }

    // las demás fotos se cargan cuando la página ya ha terminado
    const start = () => {
      setup();
      setInterval(() => {
        if (!visible || document.hidden) return;
        decks.forEach((d) => setTimeout(() => show(d, (d.i + 1) % d.list.length, true), d.delay));
      }, CUT_EVERY);
    };
    if (document.readyState === 'complete') setTimeout(start, 600);
    else window.addEventListener('load', () => setTimeout(start, 600), { once: true });

    let wasWide = wide();
    window.addEventListener('resize', () => {
      if (wide() === wasWide) return;
      wasWide = wide();
      $$('.hero__frame', right).forEach((o) => o.remove());
      setup();
    });
  }

  /* -------------------------------------------------------------------
     CURSOR + BOTONES MAGNÉTICOS
     ------------------------------------------------------------------- */
  function initCursor() {
    if (!fine || reduced) return;
    const cur = $('#cursor');
    if (!cur) return;
    html.classList.add('has-cursor');
    const dot = $('.cursor__dot', cur);
    const ring = $('.cursor__ring', cur);
    const label = $('#cursorLabel');
    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;

    window.addEventListener('pointermove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      cur.classList.remove('is-hidden');
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => cur.classList.add('is-hidden'));

    frameHooks.push((dt) => {
      rx += (mx - rx) * Math.min(1, 0.2 * dt);
      ry += (my - ry) * Math.min(1, 0.2 * dt);
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
    });

    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('[data-cursor], a, button, .shot, .side, label, input, select, textarea');
      cur.classList.remove('is-hover', 'is-label');
      label.textContent = '';
      if (!t || t.matches('input, select, textarea, label')) return;
      if (t.dataset.cursor === 'play') {
        cur.classList.add('is-label');
        label.textContent = tr('sessions.play');
      } else if (t.classList.contains('shot')) {
        cur.classList.add('is-label');
        label.textContent = lang === 'en' ? 'View' : 'Ver';
      } else {
        cur.classList.add('is-hover');
      }
    });

    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate3d(' + (x * 0.28) + 'px,' + (y * 0.4) + 'px,0)';
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* -------------------------------------------------------------------
     REVELADOS AL HACER SCROLL + PARALLAX
     ------------------------------------------------------------------- */
  function initReveals() {
    $$('[data-reveal="lines"]').forEach((el) => { if (!el.classList.contains('is-split')) splitWords(el); });
    if (reduced || !('IntersectionObserver' in window)) {
      $$('[data-reveal], .why__item').forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    $$('[data-reveal], .why__item').forEach((el) => io.observe(el));
  }

  function initParallax() {
    if (reduced) return;
    const items = $$('[data-parallax]').map((el) => ({ el, speed: parseFloat(el.dataset.parallax) || 0, box: el.parentElement }));
    if (!items.length) return;
    let lastScroll = -1;
    frameHooks.push(() => {
      if (scrollY === lastScroll) return;
      lastScroll = scrollY;
      const vh = window.innerHeight;
      items.forEach((it) => {
        const r = it.box.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const off = (r.top + r.height / 2 - vh / 2) * it.speed;
        it.el.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)';
      });
    });
  }

  /* -------------------------------------------------------------------
     MARQUESINA INFINITA (acelera con la velocidad del scroll)
     ------------------------------------------------------------------- */
  const marquees = [];
  let marqueeVisible = false;

  function buildMarquees() {
    marquees.length = 0;
    const sep = '<span class="marquee__sep" aria-hidden="true"><svg viewBox="0 0 140 151"><use href="#logo-iso"/></svg></span>';
    $$('[data-marquee]').forEach((row) => {
      const items = (D[row.dataset.marquee] || []).filter(Boolean);
      row.innerHTML = '';
      if (!items.length) return;
      const track = document.createElement('div');
      track.className = 'marquee__track';
      track.setAttribute('aria-hidden', 'true');
      track.innerHTML = items.map((x) => '<span class="marquee__item">' + esc(x) + '</span>' + sep).join('');
      row.appendChild(track);
      const w = track.getBoundingClientRect().width || 1;
      const copies = Math.max(2, Math.ceil((window.innerWidth * 2) / w) + 1);
      for (let i = 1; i < copies; i += 1) row.appendChild(track.cloneNode(true));
      const speed = parseFloat(row.dataset.speed) || 0.5;
      marquees.push({ row, w, speed, x: speed > 0 ? 0 : -w });
    });
    const list = $('#marqueeList');
    if (list) list.innerHTML = (D.clubs || []).concat(D.eventos || []).map((x) => '<li>' + esc(x) + '</li>').join('');
  }

  function initMarquee() {
    const sec = $('.marquee');
    if (!sec) return;
    buildMarquees();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(buildMarquees);
    new IntersectionObserver(([e]) => { marqueeVisible = e.isIntersecting; }).observe(sec);
    frameHooks.push((dt) => {
      if (!marqueeVisible) return;
      const boost = reduced ? 0 : Math.min(Math.abs(velocity) * 0.35, 14);
      const base = reduced ? 0.15 : 1;
      marquees.forEach((m) => {
        const dir = m.speed > 0 ? 1 : -1;
        m.x -= (Math.abs(m.speed) * base + boost) * dir * dt;
        if (m.x <= -m.w) m.x += m.w;
        if (m.x > 0) m.x -= m.w;
        m.row.style.transform = 'translate3d(' + m.x.toFixed(2) + 'px,0,0)';
      });
    });
  }

  /* -------------------------------------------------------------------
     LADO A / LADO B
     ------------------------------------------------------------------- */
  function initSides() {
    const wrap = $('#sides');
    if (!wrap) return;
    const sides = $$('.side', wrap);
    const set = (side) => {
      sides.forEach((s) => s.classList.toggle('is-active', s === side));
      wrap.classList.toggle('has-active', !!side);
      wrap.classList.toggle('a-active', !!side && side.classList.contains('side--a'));
      wrap.classList.toggle('b-active', !!side && side.classList.contains('side--b'));
    };
    sides.forEach((s) => {
      if (fine) s.addEventListener('pointerenter', () => set(s));
      // solo con teclado: al tocar en móvil ya se encarga el click
      s.addEventListener('focusin', () => { if (s.matches(':focus-visible') || s.contains(document.activeElement) && document.activeElement !== s) set(s); });
      s.addEventListener('click', (e) => {
        if (fine || e.target.closest('a')) return;
        set(s.classList.contains('is-active') ? null : s);
      });
      s.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target === s) { e.preventDefault(); set(s.classList.contains('is-active') ? null : s); }
      });
    });
    if (fine) wrap.addEventListener('pointerleave', () => set(null));
    wrap.addEventListener('focusout', (e) => { if (!wrap.contains(e.relatedTarget)) set(null); });
  }

  /* -------------------------------------------------------------------
     ¿POR QUÉ DOS? imagen que sigue al ratón
     ------------------------------------------------------------------- */
  function initWhy() {
    const list = $('#whyList');
    const float = $('#whyFloat');
    if (!list || !float || !fine || reduced) return;
    const img = $('img', float);
    let mx = 0;
    let my = 0;
    let fx = 0;
    let fy = 0;
    let on = false;
    list.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; });
    $$('.why__item', list).forEach((li) => {
      li.addEventListener('pointerenter', (e) => {
        if (!on) { fx = e.clientX; fy = e.clientY; }
        if (li.dataset.img && img.getAttribute('src') !== li.dataset.img) img.src = li.dataset.img;
        on = true;
        float.classList.add('is-on');
      });
    });
    list.addEventListener('pointerleave', () => { on = false; float.classList.remove('is-on'); });
    frameHooks.push((dt) => {
      if (!on) return;
      fx += (mx - fx) * Math.min(1, 0.14 * dt);
      fy += (my - fy) * Math.min(1, 0.14 * dt);
      const rot = clamp((mx - fx) * 0.05, -8, 8);
      float.style.transform = 'translate3d(' + (fx + 30) + 'px,' + (fy - 160) + 'px,0) rotate(' + rot + 'deg)';
    });
  }

  /* -------------------------------------------------------------------
     LIVE SESSIONS: YouTube + SoundCloud (se cargan solo al pulsar)
     ------------------------------------------------------------------- */
  const V = D.videoDestacado || {};

  function initVideo() {
    const facade = $('#videoFacade');
    if (!facade) return;
    if (V.titulo) $('#videoTitle').textContent = V.titulo;
    if (V.youtubeId) $('#videoLink').href = 'https://www.youtube.com/watch?v=' + encodeURIComponent(V.youtubeId);
    if (V.subtitulo) $('#videoSub').textContent = V.subtitulo;
    if (V.portada) {
      const p = $('#videoPoster');
      p.removeAttribute('srcset');
      p.src = V.portada;
    }
    facade.addEventListener('click', () => loadVideo(true));
  }

  function loadVideo(autoplay) {
    const box = $('#video');
    if (!box || !V.youtubeId || $('iframe', box)) return;
    const params = new URLSearchParams({ autoplay: autoplay ? '1' : '0', rel: '0', modestbranding: '1', playsinline: '1' });
    if (V.empiezaEn) params.set('start', String(parseInt(V.empiezaEn, 10) || 0));
    const f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(V.youtubeId) + '?' + params.toString();
    f.title = (V.titulo || 'Live session') + ' · YouTube';
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    f.allowFullscreen = true;
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    box.appendChild(f);
    const facade = $('#videoFacade');
    if (facade) facade.remove();
    box.classList.add('is-in');
  }

  function renderTracks() {
    const ol = $('#tracks');
    if (!ol) return;
    const list = (D.soundcloud || []).filter((x) => x && x.url);
    const count = $('#trackCount');
    if (count) count.textContent = pad(list.length);
    ol.innerHTML = list.map((t, i) => (
      '<li class="track">' +
        '<button class="track__btn" type="button" aria-expanded="false" data-url="' + esc(t.url) + '" aria-label="' + esc(tr('sessions.listen') + ': ' + t.titulo) + '">' +
          '<span class="track__n mono">' + pad(i + 1) + '</span>' +
          '<span class="track__title"><span class="track__name">' + esc(t.titulo) + '</span>' +
          (t.detalle ? '<span class="track__detail mono">' + esc(t.detalle) + '</span>' : '') + '</span>' +
          '<span class="track__icon" aria-hidden="true"></span>' +
        '</button>' +
        '<div class="track__player"></div>' +
      '</li>'
    )).join('');
  }

  function initTracks() {
    const ol = $('#tracks');
    if (!ol) return;
    renderTracks();
    ol.addEventListener('click', (e) => {
      const btn = e.target.closest('.track__btn');
      if (!btn) return;
      const li = btn.parentElement;
      const open = li.classList.contains('is-open');
      $$('.track.is-open', ol).forEach((o) => closeTrack(o));
      if (open) return;
      const player = $('.track__player', li);
      const f = document.createElement('iframe');
      f.title = 'SoundCloud · ' + btn.querySelector('.track__name').textContent;
      f.allow = 'autoplay';
      f.loading = 'lazy';
      f.src = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(btn.dataset.url) +
        '&color=%23cb6ce6&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false';
      player.appendChild(f);
      li.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    });
  }
  function closeTrack(li) {
    li.classList.remove('is-open');
    $('.track__btn', li).setAttribute('aria-expanded', 'false');
    const f = $('iframe', li);
    if (f) setTimeout(() => f.remove(), 500);
  }

  /* -------------------------------------------------------------------
     FECHAS
     ------------------------------------------------------------------- */
  function renderDates() {
    const box = $('#dates');
    if (!box) return;
    const locale = lang === 'en' ? 'en-GB' : 'es-ES';
    const fmtMonth = new Intl.DateTimeFormat(locale, { month: 'short' });
    const fmtDay = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parse = (s) => {
      const p = String(s).split('-').map(Number);
      return new Date(p[0], (p[1] || 1) - 1, p[2] || 1);
    };
    const all = (D.fechas || [])
      .filter((f) => f && f.fecha)
      .map((f) => Object.assign({}, f, { d: parse(f.fecha) }))
      .filter((f) => !isNaN(f.d.getTime()))
      .sort((a, b) => a.d - b.d);
    const upcoming = all.filter((f) => f.d >= today);
    const past = all.filter((f) => f.d < today).reverse();

    const row = (f, isPast) => {
      const month = fmtMonth.format(f.d).replace('.', '');
      const wd = fmtDay.format(f.d).replace('.', '');
      const estado = String(f.estado || '').toLowerCase();
      let cta = '';
      if (!isPast) {
        if (estado === 'agotado') cta = '<span class="gig__tag mono">' + esc(tr('dates.soldout')) + '</span>';
        else if (f.entradas) cta = '<a class="btn btn--sm btn--accent" href="' + esc(f.entradas) + '" target="_blank" rel="noopener">' + esc(tr('dates.tickets')) + ' <span aria-hidden="true">↗</span></a>';
        else if (estado === 'gratis') cta = '<span class="gig__tag mono">' + esc(tr('dates.free')) + '</span>';
      }
      return '<li class="gig' + (isPast ? ' gig--past' : '') + '">' +
        '<div class="gig__date"><span class="gig__day">' + pad(f.d.getDate()) + '</span>' +
        '<span class="gig__month mono">' + esc(month + ' ' + String(f.d.getFullYear()).slice(2) + ' · ' + wd) + '</span></div>' +
        '<div class="gig__where"><span class="gig__club">' + esc(f.club || '') + '</span><span class="gig__city mono">' + esc(f.ciudad || '') + '</span></div>' +
        '<div class="gig__cta">' + cta + '</div>' +
      '</li>';
    };

    let out = '';
    if (upcoming.length) {
      out += '<ol class="gigs">' + upcoming.map((f) => row(f, false)).join('') + '</ol>';
    } else {
      out += '<div class="soon">' +
        '<p class="soon__text">' + esc(tr('dates.soon1')) + '<br><em>' + esc(tr('dates.soon2')) + '</em><span class="soon__caret" aria-hidden="true"></span></p>' +
        '<div class="soon__row"><div class="soon__meta mono"><span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span><span>' + esc(tr('dates.soonMeta')) + '</span></div>' +
        '<a class="btn btn--accent" href="#booking" data-magnetic>Booking <span aria-hidden="true">↗</span></a></div>' +
      '</div>';
    }
    if (past.length) {
      out += '<details class="dates__past"><summary class="mono"><span>' + esc(tr('dates.past')) + ' · ' + pad(past.length) + '</span></summary>' +
        '<ol class="gigs">' + past.map((f) => row(f, true)).join('') + '</ol></details>';
    }
    box.innerHTML = out;
  }

  /* -------------------------------------------------------------------
     GALERÍA + VISOR A PANTALLA COMPLETA
     ------------------------------------------------------------------- */
  const G = (D.galeria || []).filter((g) => g && g.foto);

  // proporción alto/ancho de cada "forma"
  const SHAPES = { vertical: 1.5, horizontal: 0.66, grande: 1.28, normal: 1 };
  let galleryCols = 0;

  function renderGallery() {
    const grid = $('#gallery');
    if (!grid) return;
    galleryCols = window.innerWidth >= 900 ? 3 : 2;
    const cols = Array.from({ length: galleryCols }, (_, i) => ({ h: i === 1 ? 0.45 : (i === 2 ? 0.15 : 0), html: '' }));
    G.forEach((g, i) => {
      const r = SHAPES[g.forma] || SHAPES.normal;
      let c = 0;
      cols.forEach((col, ci) => { if (col.h < cols[c].h - 0.001) c = ci; });
      cols[c].html += '<button class="shot" type="button" data-i="' + i + '" style="aspect-ratio:1/' + r + '" aria-label="' + esc(tr('gallery.open') + ': ' + (g.texto || '')) + '">' +
        '<img src="' + esc(g.mini || g.foto) + '" alt="' + esc(g.texto || '') + '" loading="lazy" decoding="async">' +
        '<span class="shot__n mono" aria-hidden="true">' + pad(i + 1) + '</span>' +
      '</button>';
      cols[c].h += r + 0.06;
    });
    grid.innerHTML = cols.map((c) => '<div class="gallery__col">' + c.html + '</div>').join('');
    $$('img', grid).forEach((img) => {
      const done = () => img.classList.add('is-loaded');
      if (img.complete && img.naturalWidth) done();
      else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
    });
  }

  function initGallery() {
    const grid = $('#gallery');
    const lb = $('#lightbox');
    if (!grid || !lb) return;
    renderGallery();
    const img = $('#lbImg');
    const cap = $('#lbCap');
    const cnt = $('#lbCount');
    let idx = 0;
    let opener = null;

    const show = (i) => {
      idx = (i + G.length) % G.length;
      const g = G[idx];
      img.style.removeProperty('--max-w');
      img.onload = () => { img.style.setProperty('--max-w', Math.round(img.naturalWidth * 1.6) + 'px'); };
      img.src = g.foto;
      img.alt = g.texto || '';
      cap.textContent = g.texto || '';
      cnt.textContent = pad(idx + 1) + ' / ' + pad(G.length);
      const next = G[(idx + 1) % G.length];
      if (next) { const pre = new Image(); pre.src = next.foto; }
    };
    const open = (i, from) => {
      opener = from || null;
      show(i);
      lb.hidden = false;
      requestAnimationFrame(() => lb.classList.add('is-open'));
      if (lenis) lenis.stop();
      document.addEventListener('keydown', onKey);
      $('#lbClose').focus();
    };
    const close = () => {
      lb.classList.remove('is-open');
      document.removeEventListener('keydown', onKey);
      if (lenis) lenis.start();
      setTimeout(() => { lb.hidden = true; img.removeAttribute('src'); }, 400);
      if (opener) opener.focus();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') show(idx + 1);
      else if (e.key === 'ArrowLeft') show(idx - 1);
      else if (e.key === 'Tab') {
        const f = $$('button', lb);
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    grid.addEventListener('click', (e) => {
      const s = e.target.closest('.shot');
      if (s) open(parseInt(s.dataset.i, 10) || 0, s);
    });
    $('#lbClose').addEventListener('click', close);
    $('#lbPrev').addEventListener('click', () => show(idx - 1));
    $('#lbNext').addEventListener('click', () => show(idx + 1));
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });

    let sx = null;
    lb.addEventListener('pointerdown', (e) => { sx = e.clientX; });
    lb.addEventListener('pointerup', (e) => {
      if (sx === null) return;
      const dx = e.clientX - sx;
      sx = null;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    });
  }

  /* -------------------------------------------------------------------
     FORMULARIO DE BOOKING
     ------------------------------------------------------------------- */
  function initForm() {
    const form = $('#bookingForm');
    if (!form) return;
    const status = $('#formStatus');
    let via = 'email';
    $$('button[type="submit"]', form).forEach((b) => b.addEventListener('click', () => { via = b.dataset.via; }));
    $$('input, select, textarea', form).forEach((el) => el.addEventListener('input', () => el.closest('.field').classList.remove('is-invalid')));

    const say = (msg, err) => { status.textContent = msg; status.classList.toggle('is-error', !!err); };
    const labelOf = (name) => {
      const el = form.elements[name];
      const l = el && el.closest('.field') && $('.field__label', el.closest('.field'));
      return l ? l.textContent.trim() : name;
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (e.submitter && e.submitter.dataset.via) via = e.submitter.dataset.via;
      const data = {};
      new FormData(form).forEach((v, k) => { data[k] = String(v).trim(); });

      let ok = true;
      ['nombre', 'tipo', 'ciudad'].forEach((k) => {
        const bad = !data[k];
        form.elements[k].closest('.field').classList.toggle('is-invalid', bad);
        if (bad) ok = false;
      });
      if (!ok) { say(tr('form.missing'), true); return; }

      let fecha = '—';
      if (data.fecha) {
        const p = data.fecha.split('-');
        fecha = p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : data.fecha;
      }
      const tipoTxt = form.elements.tipo.selectedOptions[0] ? form.elements.tipo.selectedOptions[0].textContent.trim() : data.tipo;
      const lines = [
        tr('form.hello'),
        '',
        labelOf('nombre') + ': ' + data.nombre,
        labelOf('tipo') + ': ' + tipoTxt,
        labelOf('fecha') + ': ' + fecha,
        labelOf('ciudad') + ': ' + data.ciudad,
      ];
      if (data.mensaje) lines.push('', labelOf('mensaje') + ':', data.mensaje);
      const text = lines.join('\n');
      const C = D.contacto || {};
      const endpoint = D.formulario && D.formulario.endpoint;

      if (via === 'whatsapp') {
        say(tr('form.openingWa'));
        window.open('https://wa.me/' + (C.whatsapp || '34652932722') + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
        return;
      }
      if (endpoint) {
        say(tr('form.sending'));
        fetch(endpoint, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(Object.assign({}, data, { _subject: tr('form.subject') + ' · ' + data.nombre, resumen: text })),
        }).then((r) => {
          if (!r.ok) throw new Error(String(r.status));
          say(tr('form.sent'));
          form.reset();
        }).catch(() => say(tr('form.error'), true));
        return;
      }
      say(tr('form.openingMail'));
      window.location.href = 'mailto:' + (C.email || 'itsrattamusik@gmail.com') +
        '?subject=' + encodeURIComponent(tr('form.subject') + ' · ' + data.nombre + ' · ' + data.ciudad) +
        '&body=' + encodeURIComponent(text);
    });
  }

  /* -------------------------------------------------------------------
     REDIMENSIONADO
     ------------------------------------------------------------------- */
  let lastW = window.innerWidth;
  let rt = null;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      if (window.innerWidth === lastW) return; // la barra del navegador móvil no cuenta
      lastW = window.innerWidth;
      $$('[data-reveal="lines"].is-split').forEach(lineIndex);
      buildMarquees();
      if ((window.innerWidth >= 900 ? 3 : 2) !== galleryCols) renderGallery();
    }, 200);
  });

  /* -------------------------------------------------------------------
     ARRANQUE
     ------------------------------------------------------------------- */
  captureOriginals();
  applyLinks();
  const saved = store.get('ratta-lang');
  const nav = (navigator.language || 'es').toLowerCase().slice(0, 2);
  const prefersEn = !saved && ['es', 'ca', 'gl', 'eu'].indexOf(nav) === -1;
  initTracks();
  initGallery();
  initVideo();
  initMarquee();
  if (saved === 'en' || prefersEn) applyLang('en');
  else renderDates();
  initHero();
  initCursor();
  initSides();
  initWhy();
  initParallax();
  initForm();

  const start = () => {
    initReveals();
    runLoader().then(playClaim);
  };
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]).then(start);
  } else {
    start();
  }
})();
