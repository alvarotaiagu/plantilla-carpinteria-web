# Espiga — plantilla de carpintería a medida

> **Sitio de demostración.** «Espiga, carpintería a medida» es un **negocio ficticio**.
> El nombre, la dirección (Rúa do Serrín, 12 · Betanzos), el teléfono (981 00 00 58), el
> horario, los precios, los plazos, los seis muebles y las tres personas del taller son
> **datos de muestra inventados**. No corresponden a ningún negocio real. La página lleva
> `noindex, nofollow` a propósito.

**Demo:** https://alvarotaiagu.github.io/plantilla-carpinteria-web/

---

## El concepto: «Ensamble»

Un mueble a medida es, al final, dos piezas que encajan. La espiga y la mortaja son el
ensamble de toda la vida —sin un tornillo— y son también el argumento de venta: esto no
es un mueble de caja, es una pieza hecha para tu hueco. Así que **la web se comporta como
un ensamble**:

- El hero **es una espiga entrando en su mortaja**: las dos piezas llegan separadas,
  encajan solas al entrar en pantalla, y hay un botón para volver a separarlas y verlo
  otra vez. Las dos están cortadas en el mismo rango de coordenadas, así que **encajan de
  verdad**, no se quedan a un palmo.
- El resto de la página entra igual: cada bloque viene **desde su lado** y se mete en su
  sitio, alternando izquierda y derecha.
- Los muebles se enseñan como **alzados acotados**, con su veta y sus medidas escritas,
  que es exactamente el papel que se le enseña a un cliente.

Registro visual: papel de taller, roble y nogal, con una grotesca ancha y el mono de las
cotas. Nada de fondo oscuro ni de cartel deportivo.

## Mapa de secciones

| # | Sección | Qué hace |
|---|---|---|
| — | Hero | El ensamble que encaja, tres cifras y el aviso de que el presupuesto es gratis |
| 01 | Muebles | Seis alzados dibujados con veta, cotas y precio «desde» |
| 02 | Cómo trabajamos | Los cinco pasos, con lo que dura cada uno |
| 03 | Maderas | Cuatro maderas, para qué sirve cada una, y «lo que decimos siempre» |
| 04 | El taller | Las tres personas y la foto del banco |
| 05 | Presupuesto | Formulario de muestra, horario **en vivo** y mapa bajo clic |

## Recursos de movimiento

1. **Lenis** como único motor de scroll.
2. **El ensamble** — el recurso protagonista: dos `<g>` de SVG que se separan y encajan,
   con botón para repetirlo.
3. **Entradas por el lado**: cada bloque llega desde izquierda o derecha y se mete.
4. **Titulares letra a letra**.
5. **Botones magnéticos** y **cursor** con forma de pieza con espiga.
6. **Contadores** y **horario en vivo** con el día de hoy resaltado.

## Rendimiento medido

`PerformanceObserver` de `longtask` en la pasada de verificación (Chromium, 1440×900,
recorrido completo con la rueda): **1 tarea larga, de 69 ms, al arrancar** (GSAP +
webfont) y **0 mientras se recorre la página**.

## Cómo reskinearlo a una carpintería real

1. **Los muebles se generan.** El script `genmuebles.js` que acompaña a la plantilla
   monta cada alzado con una función `tabla()` (rectángulo + veta procedural + contorno)
   y dos funciones de cota (`cotaH` y `cotaV`). Para otro mueble se describen sus tablas
   en coordenadas y listo. Para un taller real lo normal es sustituirlos por fotos: basta
   cambiar el `<img>` de cada `<li class="mueble">`.
2. **El ensamble del hero** está en línea en `index.html`. Si se cambian las medidas, la
   mortaja de la pieza B tiene que ocupar **el mismo rango de x** que la espiga de la
   pieza A, o quedan a un palmo la una de la otra. Costó una pasada de verificación
   descubrirlo.
   **Ojo**: las piezas son `<g>` de SVG y GSAP les escribe el `transform` en el atributo;
   si el CSS les pusiera cualquier `transform` —incluso `none`— se quedarían clavadas.
3. **Precios y plazos** — en `#muebles` (el `p.mueble__precio` de cada ficha), en
   `#como` (el `p.pasos__dato`) y en la tabla de `#maderas`.
4. **Datos del negocio** — el `application/ld+json` del `<head>`, la sección
   «Presupuesto», el `<footer>` y la consulta del mapa (sección 11 de `js/main.js`).
   Quitar `noindex, nofollow` y el sello de demostración.
5. **Horario** — sección 8 de `js/main.js`, en minutos desde medianoche, `0 = domingo`.
6. **Paleta y tipografía** — las variables de `:root` en `css/estilo.css`. Los tonos de
   madera de los dibujos están en `genmuebles.js`, en el objeto `TONOS`.

## Decisiones tomadas

- **Ningún mueble real.** Los seis alzados están dibujados; enseñar obra de otro taller
  en la web de uno que no existe sería apropiarse de su trabajo.
- **Sin `aggregateRating` ni `review`** en los datos estructurados, y sin testimonios.
- **Precios «desde» y con aviso**: el aviso legal explica que un presupuesto de verdad
  depende de la madera, el herraje y el hueco.
- **Fotos sin caras identificables** y con pie que aclara que no son este taller.
- **Sin GSAP y con movimiento reducido, las piezas se quedan encajadas**, que es el
  estado que cuenta la historia; el botón de separar sigue funcionando.
- **Lo de «una sola vez» va con `IntersectionObserver`**, no con `ScrollTrigger`
  `once: true`.

## Créditos

Ver [`CREDITOS.md`](CREDITOS.md). Dos fotos de Pexels acreditadas; el resto es dibujo
propio generado con script.

## Técnico

HTML + CSS + un `main.js`. Sin framework, sin build, sin backend, sin npm. GSAP,
ScrollTrigger y Lenis por CDN. Se abre con doble clic en `index.html` y se publica tal
cual en GitHub Pages.
