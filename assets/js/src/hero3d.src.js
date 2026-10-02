/* RATTA MUSIK · logo 3D de la portada (Three.js)
   Fuente sin empaquetar. Se compila a assets/js/hero3d.js con esbuild:
   npx esbuild hero3d.src.js --bundle --minify --format=esm --outfile=assets/js/hero3d.js
*/
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, ExtrudeGeometry, MeshPhysicalMaterial,
  PMREMGenerator, Color, BoxGeometry, PlaneGeometry, MeshBasicMaterial, BackSide, DoubleSide,
  ACESFilmicToneMapping, SRGBColorSpace, Box3, Vector3,
} from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const easeOutExpo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));

function shapesFrom(d) {
  const data = new SVGLoader().parse('<svg xmlns="http://www.w3.org/2000/svg"><path d="' + d + '"/></svg>');
  const out = [];
  data.paths.forEach((p) => SVGLoader.createShapes(p).forEach((s) => out.push(s)));
  return out;
}

/* Entorno de "club" para el cromo: sala negra con un horizonte detrás de la cámara
   (abajo claro, arriba oscuro) que dibuja la clásica línea de las letras cromadas,
   barras de luz blancas para los cantos y un par de luces lilas. */
function clubEnvironment(renderer) {
  const env = new Scene();
  const room = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: 0x030204, side: BackSide }));
  room.scale.set(40, 24, 40);
  env.add(room);
  const panel = (w, h, x, y, z, color, intensity) => {
    const m = new Mesh(
      new PlaneGeometry(w, h),
      new MeshBasicMaterial({ color: new Color(color).multiplyScalar(intensity), side: DoubleSide }),
    );
    m.position.set(x, y, z);
    m.lookAt(0, y, 0);
    env.add(m);
    return m;
  };
  // horizonte detrás de la cámara (a la altura del logo): arriba oscuro, abajo claro
  panel(48, 2.4, 0, -0.6, 13, 0xffffff, 2.6);     // banda clara justo bajo el horizonte
  panel(48, 5, 0, -4.3, 13, 0xe4dde8, 1.35);      // suelo claro
  panel(48, 9, 0, -11, 13, 0xcfc6d6, 0.7);        // suelo lejano, más apagado
  panel(48, 0.3, 0, 0.75, 12.9, 0xffffff, 12);    // línea de horizonte
  panel(48, 3, 0, 2.4, 13, 0x0b0710, 1.0);        // banda oscura justo encima
  panel(48, 10, 0, 8.8, 13, 0x8f7aa3, 0.45);      // cielo gris lila
  panel(5, 26, 9, 0, 12.6, 0xcb6ce6, 2.2);       // franja lila que barre las letras al girar
  panel(0.8, 20, -15, 0, 6, 0xffffff, 7);        // columna de luz izquierda
  panel(0.8, 20, 15, 0, 6, 0xffffff, 4);         // columna de luz derecha
  panel(30, 0.8, 0, 11, 0, 0xffffff, 5);         // barra cenital
  panel(1.0, 18, -12, 0, -14, 0xcb6ce6, 8);      // lila detrás izquierda
  panel(16, 1.0, 10, -3, -12, 0xcb6ce6, 6);      // lila detrás derecha
  const pmrem = new PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.01).texture;
  pmrem.dispose();
  return tex;
}

export function initHero3D(opts) {
  const { canvas, wordmark, musik, anchor, hero, reduced, onShow } = opts;
  let shown = false;
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  scene.environment = clubEnvironment(renderer);
  const camera = new PerspectiveCamera(30, 1, 1, 10000);

  const chrome = new MeshPhysicalMaterial({
    color: 0xffffff, metalness: 1, roughness: 0.07,
    clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.1,
  });

  // RATTÄ (unidades del SVG: 372.9 × 152.4) y MUSIK colocado como en el presskit
  const logo = new Group();
  const wm = new Mesh(new ExtrudeGeometry(shapesFrom(wordmark), {
    depth: 30, bevelEnabled: true, bevelThickness: 3.2, bevelSize: 1.8, bevelSegments: 6, curveSegments: 20,
  }), chrome);
  logo.add(wm);
  if (musik) {
    const mk = new Mesh(new ExtrudeGeometry(shapesFrom(musik), {
      depth: 14, bevelEnabled: true, bevelThickness: 1.6, bevelSize: 0.9, bevelSegments: 4, curveSegments: 14,
    }), chrome);
    const s = 2.04; // escala del lockup de la página 3 del presskit
    mk.scale.set(s, s, 1);
    mk.position.set(372.9 - 58.6 * s - 2, 177, 0);
    logo.add(mk);
  }
  // centrar y pasar de coordenadas SVG (y hacia abajo) a 3D (y hacia arriba) sin espejo
  const box = new Box3().setFromObject(logo);
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  logo.children.forEach((c) => { c.position.x -= center.x; c.position.y -= center.y; c.position.z -= center.z; });
  logo.rotation.x = Math.PI;
  const rig = new Group();
  rig.add(logo);
  scene.add(rig);

  // tamaño: el logo 3D ocupa exactamente el sitio del logo plano (que queda invisible)
  let W = 1;
  let H = 1;
  let worldPerPx = 1;
  let baseY = 0;
  function resize() {
    const r = hero.getBoundingClientRect();
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    const a = anchor.getBoundingClientRect();
    worldPerPx = size.x / Math.max(80, a.width);
    const visibleH = worldPerPx * H;
    camera.position.set(0, 0, visibleH / (2 * Math.tan((camera.fov * Math.PI) / 360)));
    camera.near = camera.position.z / 20;
    camera.far = camera.position.z * 4;
    camera.updateProjectionMatrix();
    const dy = (a.top + a.height / 2) - (r.top + r.height / 2);
    baseY = -dy * worldPerPx;
  }
  resize();
  window.addEventListener('resize', resize);

  // ratón / dedo: el logo se inclina hacia donde apuntas
  let px = 0;
  let py = 0;
  let tx = 0;
  let ty = 0;
  window.addEventListener('pointermove', (e) => {
    tx = (e.clientX / window.innerWidth) * 2 - 1;
    ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(hero);

  let introStart = -1;
  const t0 = performance.now();
  // primer fotograma ya preparado (compila shaders) para que no haya hueco al aparecer
  renderer.compile(scene, camera);
  renderer.render(scene, camera);
  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    const t = (now - t0) / 1000;
    const intro = introStart < 0 ? 0 : easeOutExpo(clamp((now - introStart) / 2400, 0, 1));
    px += (tx - px) * 0.05;
    py += (ty - py) * 0.05;
    const s = clamp(window.scrollY / H, 0, 1.2);
    const idle = reduced ? 0 : 1;

    rig.rotation.y = (1 - intro) * -Math.PI * 0.85 + idle * (Math.sin(t * 0.42) * 0.24 + px * 0.3);
    rig.rotation.x = idle * (Math.sin(t * 0.31) * 0.035 + py * 0.06 + s * 0.9);
    rig.position.y = baseY + idle * (Math.sin(t * 0.8) * 3 + s * size.y * 0.9);
    const sc = (0.72 + 0.28 * intro) * (1 - idle * s * 0.25);
    rig.scale.setScalar(sc);
    canvas.style.opacity = String(intro * clamp(1 - s * 1.1, 0, 1));
    renderer.render(scene, camera);
    if (!shown && intro > 0.02) { shown = true; if (onShow) onShow(); }
  }
  requestAnimationFrame(frame);

  return {
    start() { if (introStart < 0) introStart = performance.now() - (reduced ? 10000 : 0); },
    resize,
  };
}
