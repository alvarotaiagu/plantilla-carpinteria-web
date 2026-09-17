/* ==========================================================================
   Espiga — carpintería a medida (SITIO DE DEMOSTRACIÓN, negocio ficticio)
   Concepto «Ensamble»: el recurso protagonista es la espiga entrando en su
   mortaja. Las dos piezas del hero se separan y vuelven a encajar —solas al
   llegar y con un botón— y el resto de la página entra igual: cada cosa desde
   su lado, metiéndose en su hueco.

   - `has-motion` solo se enciende si GSAP y ScrollTrigger existen de verdad.
   - Las piezas son `<g>` de SVG: GSAP les escribe el `transform` en el
     ATRIBUTO, así que el CSS no toca su transform (ni con `none`).
   - Sin GSAP y con movimiento reducido las piezas se quedan encajadas, que es
     el estado que cuenta la historia.
   - Lo de «una sola vez» va con IntersectionObserver.
   ========================================================================== */
(function () {
  'use strict';

  var raiz = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var gsapReady = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var motion = gsapReady && !reduce.matches;

  if (gsapReady) {
    gsap.registerPlugin(ScrollTrigger);
    if (motion) raiz.classList.add('has-motion');
  }

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  function alEntrar(el, hacer, margen) {
    if (!('IntersectionObserver' in window)) { hacer(); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        hacer();
      });
    }, { rootMargin: margen || '0px 0px -8% 0px' });
    io.observe(el);
  }

  /* ── 1. Scroll suave ─────────────────────────────────────────────────── */
  var lenis = null;
  if (motion && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.12, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var destino = document.getElementById(id.slice(1));
      if (!destino) return;
      e.preventDefault();
      cerrarMenu();
      if (lenis) lenis.scrollTo(destino, { offset: -70 });
      else destino.scrollIntoView();
      destino.setAttribute('tabindex', '-1');
      destino.focus({ preventScroll: true });
    });
  });

  /* ── 2. El ensamble (recurso protagonista) ───────────────────────────── */
  (function ensamble() {
    var caja = $('[data-ensamble]');
    if (!caja) return;
    var a = $('[data-pieza-a]', caja);
    var b = $('[data-pieza-b]', caja);
    var cotas = $('[data-cotas-ensamble]', caja);
    var boton = $('[data-ensamble-boton]', caja);
    var separadas = false;

    function poner(x, duracion) {
      if (motion) {
        gsap.to(a, { x: -x, duration: duracion, ease: 'power3.inOut' });
        gsap.to(b, { x: x, duration: duracion, ease: 'power3.inOut' });
        if (cotas) gsap.to(cotas, { opacity: x ? 0.35 : 1, duration: duracion * 0.6 });
      } else {
        // sin GSAP se coloca el atributo a mano; el estado por defecto es encajado
        a.setAttribute('transform', 'translate(' + (-x) + ' 0)');
        b.setAttribute('transform', 'translate(' + x + ' 0)');
      }
    }

    function actualizarBoton() {
      if (!boton) return;
      boton.textContent = separadas ? 'Encajar las piezas' : 'Separar las piezas';
    }

    if (boton) {
      boton.addEventListener('click', function () {
        separadas = !separadas;
        poner(separadas ? 120 : 0, 0.7);
        actualizarBoton();
      });
    }

    // al llegar: entran separadas y encajan solas, una vez
    if (motion) {
      poner(150, 0);
      alEntrar(caja, function () {
        setTimeout(function () { poner(0, 1.1); }, 350);
      }, '0px');
    }
    actualizarBoton();
  })();

  /* ── 3. Titulares letra a letra ──────────────────────────────────────── */
  function partir(el) {
    var original = el.textContent.replace(/\s+/g, ' ').trim();
    el.setAttribute('aria-label', original);
    el.textContent = '';
    var letras = [];
    original.split(' ').forEach(function (palabra, i, todas) {
      var cont = document.createElement('span');
      cont.className = 'palabra';
      cont.setAttribute('aria-hidden', 'true');
      palabra.split('').forEach(function (c) {
        var s = document.createElement('span');
        s.className = 'palabra__letra';
        s.textContent = c;
        cont.appendChild(s);
        letras.push(s);
      });
      el.appendChild(cont);
      if (i < todas.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return letras;
  }

  if (motion) {
    $$('[data-char]').forEach(function (el) {
      var letras = partir(el);
      // `y: 0` explícito: GSAP leería un translate heredado del CSS como px
      gsap.set(letras, { y: 0, yPercent: 55, opacity: 0 });
      var anim = { yPercent: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.015 };
      if (el.closest('.hero')) gsap.to(letras, Object.assign({ delay: 0.15 }, anim));
      else alEntrar(el, function () { gsap.to(letras, anim); });
    });
  }

  /* ── 4. Entradas: cada cosa entra desde su lado y encaja ─────────────── */
  if (motion) {
    [['.kicker', 0], ['.indice', 0], ['.parrafo', 0], ['.hero__entrada', 0],
     ['.hero__acciones', 0], ['.hero__cifras', 0], ['.ensamble', 0],
     ['.mueble', 1], ['.pasos li', 1], ['.como__foto', -1],
     ['.tabla tbody tr', 1], ['.maderas__nota', -1], ['.fichas li', 1],
     ['.taller__foto', -1], ['.formulario', -1], ['.donde', 1]
    ].forEach(function (par) {
      $$(par[0]).forEach(function (el, i) {
        var enHero = !!el.closest('.hero');
        var lado = par[1] === 0 ? 0 : (par[1] * (i % 2 === 0 ? 1 : -1)) * 34;
        var ajustes = {
          opacity: 1, x: 0, y: 0, duration: 0.75, ease: 'power3.out',
          startAt: lado ? { x: lado, y: 0 } : { y: 14 },
          delay: enHero ? 0.35 + i * 0.09 : (i % 4) * 0.05
        };
        if (enHero) gsap.to(el, ajustes);
        else alEntrar(el, function () { gsap.to(el, ajustes); });
      });
    });
  }

  /* ── 5. Contadores ───────────────────────────────────────────────────── */
  $$('[data-contador]').forEach(function (el) {
    var fin = parseFloat(el.getAttribute('data-contador'));
    var sufijo = el.getAttribute('data-sufijo') || '';
    if (!motion) { el.textContent = fin + sufijo; return; }
    var obj = { v: 0 };
    gsap.to(obj, {
      v: fin, duration: 1.2, ease: 'power2.out', delay: 0.6,
      onUpdate: function () { el.textContent = Math.round(obj.v) + sufijo; }
    });
  });

  /* ── 6. Botones magnéticos ───────────────────────────────────────────── */
  if (motion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('[data-iman]').forEach(function (el) {
      var qx = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
      var qy = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
      el.addEventListener('pointermove', function (e) {
        var c = el.getBoundingClientRect();
        qx((e.clientX - (c.left + c.width / 2)) * 0.3);
        qy((e.clientY - (c.top + c.height / 2)) * 0.4);
      });
      el.addEventListener('pointerleave', function () { qx(0); qy(0); });
      el.addEventListener('blur', function () { qx(0); qy(0); });
    });
  }

  /* ── 7. Cursor: una pieza con su espiga ──────────────────────────────── */
  (function cursor() {
    var el = $('[data-cursor]');
    if (!el || !motion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var texto = $('.cursor__texto', el);
    var qx = gsap.quickTo(el, 'x', { duration: 0.2, ease: 'power3.out' });
    var qy = gsap.quickTo(el, 'y', { duration: 0.2, ease: 'power3.out' });
    window.addEventListener('pointermove', function (e) { qx(e.clientX); qy(e.clientY); });

    var zonas = [
      ['.mueble', 'las medidas'],
      ['[data-ensamble]', 'encaja'],
      ['[data-mapa-boton]', 'cargar'],
      ['a, button, input, select', 'venga']
    ];
    document.addEventListener('pointerover', function (e) {
      for (var i = 0; i < zonas.length; i++) {
        if (e.target.closest(zonas[i][0])) {
          el.classList.add('es-grande');
          texto.textContent = zonas[i][1];
          return;
        }
      }
      el.classList.remove('es-grande');
      texto.textContent = '';
    });
  })();

  /* ── 8. Horario en vivo ──────────────────────────────────────────────── */
  (function horario() {
    var estado = $('[data-estado]');
    if (!estado) return;
    var filas = $$('[data-horario] > div');
    // Horario ficticio. 0 = domingo. Minutos desde medianoche.
    var HORARIO = {
      0: [], 6: [],
      1: [[510, 810], [930, 1140]],
      2: [[510, 810], [930, 1140]],
      3: [[510, 810], [930, 1140]],
      4: [[510, 810], [930, 1140]],
      5: [[510, 810], [930, 1140]]
    };
    var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    function dd(n) { return String(n).padStart(2, '0'); }
    function txt(m) { return dd(Math.floor(m / 60)) + ':' + dd(m % 60); }

    function refrescar() {
      var ahora = new Date();
      var d = ahora.getDay();
      var min = ahora.getHours() * 60 + ahora.getMinutes();
      var cierra = null, abreHoy = null;
      HORARIO[d].forEach(function (t) {
        if (min >= t[0] && min < t[1]) cierra = t[1];
        else if (min < t[0] && abreHoy === null) abreHoy = t[0];
      });

      if (cierra !== null) {
        estado.textContent = 'Taller abierto · hasta las ' + txt(cierra);
        estado.classList.add('esta-abierto');
      } else if (abreHoy !== null) {
        estado.textContent = 'Cerrado · abre hoy a las ' + txt(abreHoy);
        estado.classList.remove('esta-abierto');
      } else {
        var salto = 1;
        while (salto < 8 && HORARIO[(d + salto) % 7].length === 0) salto++;
        var dia = (d + salto) % 7;
        estado.textContent = 'Cerrado · abre el ' + DIAS[dia] + ' a las ' + txt(HORARIO[dia][0][0]);
        estado.classList.remove('esta-abierto');
      }
      filas.forEach(function (f) {
        var dias = (f.getAttribute('data-dias') || '').split(',');
        f.classList.toggle('es-hoy', dias.indexOf(String(d)) !== -1);
      });
    }
    refrescar();
    setInterval(refrescar, 30000);
  })();

  /* ── 9. Cabecera ─────────────────────────────────────────────────────── */
  (function cabecera() {
    var el = $('[data-cabecera]');
    if (!el) return;
    function mirar() { el.classList.toggle('esta-pegada', window.scrollY > 20); }
    mirar();
    window.addEventListener('scroll', mirar, { passive: true });
  })();

  /* ── 10. Menú móvil ──────────────────────────────────────────────────── */
  var boton = $('[data-menu-boton]');
  var menu = $('[data-menu]');
  function cerrarMenu() {
    if (!boton || !menu) return;
    boton.setAttribute('aria-expanded', 'false');
    menu.classList.remove('esta-abierto');
  }
  if (boton && menu) {
    boton.addEventListener('click', function () {
      var abierto = boton.getAttribute('aria-expanded') === 'true';
      boton.setAttribute('aria-expanded', String(!abierto));
      menu.classList.toggle('esta-abierto', !abierto);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarMenu(); });
  }

  /* ── 11. Mapa solo bajo clic ─────────────────────────────────────────── */
  (function mapa() {
    var caja = $('[data-mapa]');
    var btn = $('[data-mapa-boton]');
    if (!caja || !btn) return;
    btn.addEventListener('click', function () {
      var marco = document.createElement('iframe');
      marco.src = 'https://www.google.com/maps?q=' + encodeURIComponent('Rúa do Serrín 12, Betanzos') + '&output=embed';
      marco.title = 'Mapa de la dirección de muestra: Rúa do Serrín, 12, Betanzos';
      marco.loading = 'lazy';
      marco.referrerPolicy = 'no-referrer-when-downgrade';
      btn.remove();
      caja.insertBefore(marco, caja.firstChild);
      if (gsapReady) ScrollTrigger.refresh();
    });
  })();

  /* ── 12. Formulario de presupuesto (de muestra) ──────────────────────── */
  (function presupuesto() {
    var form = $('[data-presupuesto]');
    if (!form) return;
    var salida = $('[data-presupuesto-estado]', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nombre = form.querySelector('#nombre');
      var tel = form.querySelector('#tel');
      if (!nombre.value.trim()) { salida.textContent = 'Escribe un nombre para poder llamarte.'; nombre.focus(); return; }
      if (!tel.value.trim()) { salida.textContent = 'Hace falta un teléfono para concertar la visita.'; tel.focus(); return; }
      salida.textContent = 'Formulario de demostración: la petición de ' + nombre.value.trim() + ' no se ha enviado a ningún sitio.';
    });
  })();

  /* ── 13. Aviso de cookies ────────────────────────────────────────────── */
  (function cookies() {
    var banner = $('[data-cookies]');
    if (!banner) return;
    var CLAVE = 'espiga-cookies';
    var visto = null;
    try { visto = localStorage.getItem(CLAVE); } catch (err) { visto = null; }
    if (!visto) banner.hidden = false;
    var ok = $('[data-cookies-ok]', banner);
    if (ok) {
      ok.addEventListener('click', function () {
        banner.hidden = true;
        try { localStorage.setItem(CLAVE, '1'); } catch (err) { /* modo privado */ }
      });
    }
  })();

  /* ── 14. Refrescos ───────────────────────────────────────────────────── */
  if (gsapReady) {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
})();
