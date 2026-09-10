import * as THREE from 'three';
import { createProductModel } from './modelli-prodotti.js';

const FEELING = {
  deform: 0.18,
  speed: 0.22,
  stretch: 0.16,
};

const LOAD_BLACK_MS = {
  intro: 2000,
  home: 0,
};
const FADE_MS = {
  intro: 4000,
  home: 1400,
};
const DIAMETER_CM = 6;
const PX_PER_CM = 96 / 2.54;
const REST_SCREEN = {
  intro: 0.5,
  home: 0.28,
};
const PRODUCT_PX = 58;
const ABSORB_GLOW_S = 2;
const ABSORB_SHAKE_S = 0.55;

/**
 * @param {HTMLElement} stage
 * @param {{ mode: 'intro' | 'home' }} options
 */
export function mountSfera(stage, { mode }) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.1, 100);
  camera.position.z = 8;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.82;
  const canvas = renderer.domElement;
  canvas.style.touchAction = 'none';
  stage.appendChild(canvas);

  const envScene = new THREE.Scene();
  const envGeo = new THREE.SphereGeometry(12, 32, 16);
  const envMat = new THREE.MeshBasicMaterial({ side: THREE.BackSide });
  const envMesh = new THREE.Mesh(envGeo, envMat);
  const envCanvas = document.createElement('canvas');
  envCanvas.width = 512;
  envCanvas.height = 256;
  const ctx = envCanvas.getContext('2d');
  if (!ctx) throw new Error('Sfera: canvas 2d');
  ctx.fillStyle = '#050506';
  ctx.fillRect(0, 0, 512, 256);
  const sky = ctx.createLinearGradient(0, 0, 0, 120);
  sky.addColorStop(0, '#2a2a30');
  sky.addColorStop(1, '#050506');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 512, 90);
  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.beginPath();
  ctx.ellipse(360, 58, 36, 14, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(210,215,225,0.45)';
  ctx.beginPath();
  ctx.ellipse(140, 200, 70, 16, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(0, 88, 512, 6);
  envMat.map = new THREE.CanvasTexture(envCanvas);
  envScene.add(envMesh);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(envScene, 0, 0.1, 20).texture;
  scene.environment = envMap;
  scene.environmentIntensity = 0.7;

  const key = new THREE.DirectionalLight(0xf7f4f8, 1.05);
  key.position.set(3.5, 4.2, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xc5d0dc, 0.4);
  rim.position.set(-6, 1, -2);
  scene.add(rim);
  const fill = new THREE.PointLight(0xffffff, 0.35, 24, 1.6);
  fill.position.set(-2, 4, 5);
  scene.add(fill);

  const uniforms = {
    uTime: { value: 0 },
    uDeform: { value: FEELING.deform },
    uStretch: { value: FEELING.stretch },
    uSpeed: { value: FEELING.speed },
    uRim: { value: 0.55 },
    uGlow: { value: 0 },
    uTint: { value: 0 },
  };

  const GLOW_RED = new THREE.Color(0xff1a0a);
  const GLOW_VIOLET = new THREE.Color(0xb14dff);

  const material = new THREE.MeshPhysicalMaterial({
    color: 0x16161a,
    metalness: 1,
    roughness: 0.28,
    envMapIntensity: 0.75,
    clearcoat: 0.22,
    clearcoatRoughness: 0.4,
    specularIntensity: 0.5,
    specularColor: new THREE.Color(0xdddddd),
    sheen: 0.08,
    sheenColor: new THREE.Color(0x8a8a92),
    sheenRoughness: 0.55,
    emissive: GLOW_RED.clone(),
    emissiveIntensity: 0,
    transparent: true,
    opacity: 0,
    transmission: mode === 'home' ? 0 : 0,
    thickness: 0.45,
    ior: 1.5,
    attenuationColor: new THREE.Color(0x1a181f),
    attenuationDistance: 1.8,
  });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uDeform = uniforms.uDeform;
    shader.uniforms.uStretch = uniforms.uStretch;
    shader.uniforms.uSpeed = uniforms.uSpeed;
    shader.uniforms.uRim = uniforms.uRim;
    shader.uniforms.uGlow = uniforms.uGlow;
        shader.uniforms.uTint = uniforms.uTint;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>
      uniform float uTime;
      uniform float uDeform;
      uniform float uStretch;
      uniform float uSpeed;
      float blobNoise(vec3 p, float t) {
        float n1 = sin(p.x * 2.4 + t) * sin(p.y * 2.1 + t * 0.72) * sin(p.z * 2.6 + t * 0.88);
        float n2 = sin(p.x * 4.1 + t * 0.55) * sin(p.y * 3.6 - t * 0.7) * sin(p.z * 3.2 + t * 0.48);
        float n3 = sin(p.x * 1.3 - t * 0.4) * sin(p.y * 2.8 + t * 0.62);
        float breathe = sin(t * 0.9) * 0.4 + 0.7;
        return (n1 * breathe + n2 * 0.65 + n3 * 0.35);
      }`
    );
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      float t = uTime * uSpeed * 8.0;
      transformed.x *= 1.0 + uStretch * sin(t * 0.55);
      transformed.y *= 1.0 + uStretch * 0.85 * sin(t * 0.41 + 1.1);
      transformed.z *= 1.0 + uStretch * 0.7 * sin(t * 0.63 + 0.4);
      transformed += objectNormal * blobNoise(transformed, t) * uDeform;
      `
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>
      uniform float uRim;
      uniform float uGlow;
      uniform float uTint;`
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `
      float rim = pow(1.0 - saturate(dot(normalize(vNormal), normalize(vViewPosition))), 2.25);
      vec3 glowCol = mix(vec3(1.0, 0.08, 0.04), vec3(0.72, 0.22, 1.0), uTint);
      vec3 rimCol = mix(vec3(0.55, 0.56, 0.6), glowCol, uGlow);
      gl_FragColor.rgb += rimCol * rim * (uRim + uGlow * 2.4);
      gl_FragColor.rgb += glowCol * uGlow * 0.16;
      #include <dithering_fragment>
      `
    );
  };

  const geometry = new THREE.SphereGeometry(1, 96, 64);
  const sphere = new THREE.Mesh(geometry, material);
  sphere.renderOrder = 2;
  scene.add(sphere);

  const innerRoot = new THREE.Group();
  scene.add(innerRoot);
  const innerLight = new THREE.PointLight(0xfff1dc, 1.35, 4, 1.8);
  innerRoot.add(innerLight);
  const innerItems = new Map();
  let glassT = 0;
  let fadeOpacity = 0;
  const COLOR_METAL = new THREE.Color(0x16161a);
  const COLOR_GLASS = new THREE.Color(0x6a6a74);
  const COLOR_GREEN = new THREE.Color(0x1f9d55);
  const COLOR_MOOD_RED = new THREE.Color(0xc42318);

  let umoreTarget = 0;
  let umoreSmooth = 0;
  let scalaExtra = 1;
  let scalaExtraTarget = 1;
  let fadeGame = 1;
  let finale = null;
  let introClickEnabled = true;
  /** @type {null | (() => void)} */
  let introClick = null;

  let following = false;
  let displaced = false;
  let lastPointerX = innerWidth / 2;
  let lastPointerY = innerHeight / 2;
  let absorbStarted = 0;
  let fadedIn = false;
  let running = true;
  let spinY = 0;
  let spinVel = 0;
  const presi = [];
  const pointer = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const planeHit = new THREE.Vector3();
  const grabOffset = new THREE.Vector3();
  const screenPos = new THREE.Vector3();

  const catalogo = document.getElementById('catalogo');
  const griglia = document.querySelector('.griglia');
  const presiN = document.getElementById('presi-n');

  function restScreenY() {
    return innerHeight * REST_SCREEN[mode];
  }

  function restWorldY() {
    const visibleH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    return (0.5 - restScreenY() / innerHeight) * visibleH;
  }

  function worldRadiusForPx(px) {
    const dist = camera.position.z;
    const visibleH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    return ((px / innerHeight) * visibleH) / 2;
  }

  function absorbAge() {
    if (!absorbStarted) return Infinity;
    return (performance.now() - absorbStarted) / 1000;
  }

  function absorbGlow() {
    const age = absorbAge();
    if (age >= ABSORB_GLOW_S) return 0;
    const u = 1 - age / ABSORB_GLOW_S;
    return u > 0.28 ? 1 : u / 0.28;
  }

  function absorbShake() {
    const age = absorbAge();
    if (age >= ABSORB_SHAKE_S) return 0;
    return 1 - age / ABSORB_SHAKE_S;
  }

  function shopShrinkT() {
    if (mode !== 'home' || (!following && !displaced)) return 0;
    const p = aimPoint();
    let min = Infinity;
    for (const el of document.querySelectorAll('.prodotto')) {
      const b = el.getBoundingClientRect();
      const cx = b.left + b.width / 2;
      const cy = b.top + b.height / 2;
      min = Math.min(min, Math.hypot(p.x - cx, p.y - cy));
    }
    if (!Number.isFinite(min)) return 0;
    return THREE.MathUtils.clamp(1 - (min - 48) / (220 - 48), 0, 1);
  }

  function applyScale() {
    umoreSmooth += (umoreTarget - umoreSmooth) * 0.1;
    scalaExtra += (scalaExtraTarget - scalaExtra) * 0.1;
    const fullPx = DIAMETER_CM * PX_PER_CM;
    const tShop = shopShrinkT() * (1 - glassT * 0.7);
    const mood = umoreSmooth / 10;
    const moodMul = mood >= 0
      ? THREE.MathUtils.lerp(1, 0.12, mood)
      : THREE.MathUtils.lerp(1, 3.6, -mood);
    const diameterPx = THREE.MathUtils.lerp(fullPx, PRODUCT_PX, tShop) * moodMul * scalaExtra;
    const age = absorbAge();
    const pulse = age < 0.22 ? (1 - age / 0.22) * 0.08 : 0;
    sphere.scale.setScalar(worldRadiusForPx(Math.max(diameterPx * (1 + pulse), 0.4)));
    const glow = absorbGlow();
    uniforms.uDeform.value = FEELING.deform * (1 - tShop * 0.65) * (finale === 'explode' ? 1 + Math.min(2, scalaExtra) : 1);
    uniforms.uStretch.value = FEELING.stretch * (1 - tShop * 0.65);
    uniforms.uRim.value = 0.55 + glow * 1.8 + Math.abs(mood) * 0.35;
    uniforms.uGlow.value = glow;
    if (mood > 0.001) material.color.lerpColors(COLOR_METAL, COLOR_GREEN, mood);
    else if (mood < -0.001) material.color.lerpColors(COLOR_METAL, COLOR_MOOD_RED, -mood);
    else if (mode !== 'home') material.color.copy(COLOR_METAL);
    const moodGlow = Math.abs(mood) * 0.45;
    if (glow > 0.05) {
      material.emissive.copy(uniforms.uTint.value > 0.5 ? GLOW_VIOLET : GLOW_RED);
      material.emissiveIntensity = glow * 0.7;
    } else if (mood > 0.001) {
      material.emissive.copy(COLOR_GREEN);
      material.emissiveIntensity = moodGlow;
    } else if (mood < -0.001) {
      material.emissive.copy(COLOR_MOOD_RED);
      material.emissiveIntensity = moodGlow;
    } else {
      material.emissiveIntensity = 0;
    }
  }

  function setPointer(e) {
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / innerHeight) * 2 + 1;
  }

  function hitsSphere() {
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObject(sphere).length > 0;
  }

  function pointOnPlane() {
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(dragPlane, planeHit);
    return planeHit;
  }

  function aimPoint() {
    if (following) return { x: lastPointerX, y: lastPointerY };
    screenPos.copy(sphere.position).project(camera);
    return {
      x: (screenPos.x * 0.5 + 0.5) * innerWidth,
      y: (-screenPos.y * 0.5 + 0.5) * innerHeight,
    };
  }

  function prodottoSotto() {
    const p = aimPoint();
    for (const el of document.querySelectorAll('.prodotto')) {
      const b = el.getBoundingClientRect();
      if (p.x >= b.left && p.x <= b.right && p.y >= b.top && p.y <= b.bottom) return el;
    }
    return null;
  }

  function evidenzia() {
    if (mode !== 'home') return;
    const hit = following ? prodottoSotto() : null;
    for (const el of document.querySelectorAll('.prodotto')) {
      el.classList.toggle('sotto-sfera', el === hit);
    }
  }

  function pulsa(el) {
    el.classList.remove('succhiato');
    void el.offsetWidth;
    el.classList.add('succhiato');
    window.setTimeout(() => el.classList.remove('succhiato'), 360);
  }

  function ghostVersoSfera(el) {
    const b = el.getBoundingClientRect();
    const ghost = el.cloneNode(true);
    ghost.classList.remove('sotto-sfera', 'succhiato', 'preso');
    ghost.classList.add('risucchio');
    ghost.style.left = `${b.left}px`;
    ghost.style.top = `${b.top}px`;
    ghost.style.width = `${b.width}px`;
    ghost.style.height = `${b.height}px`;
    document.body.appendChild(ghost);
    const p = aimPoint();
    const dx = p.x - (b.left + b.width / 2);
    const dy = p.y - (b.top + b.height / 2);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ghost.style.transform = `translate(${dx}px, ${dy}px) scale(0.1)`;
        ghost.style.opacity = '0';
      });
    });
    window.setTimeout(() => ghost.remove(), 420);
  }

  function hash01(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) / 4294967295;
  }

  function disposeObject(obj) {
    obj.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) m.dispose();
      }
    });
  }

  function entraNellaSfera(id, famiglia) {
    if (innerItems.has(id)) {
      innerItems.get(id).leaving = false;
      return;
    }
    const u = hash01(id);
    const pivot = new THREE.Group();
    pivot.rotation.z = (u - 0.5) * 0.9;
    pivot.rotation.x = (hash01(id + 'x') - 0.5) * 0.8;
    const holder = new THREE.Group();
    holder.scale.setScalar(0);
    const model = createProductModel(id, famiglia);
    model.traverse((o) => {
      o.renderOrder = 1;
    });
    holder.add(model);
    pivot.add(holder);
    innerRoot.add(pivot);
    innerItems.set(id, {
      pivot,
      holder,
      radius: 0.34 + u * 0.08,
      speed: 0.45 + hash01(id + 's') * 0.7,
      phase: u * Math.PI * 2,
      appear: 0,
      leaving: false,
    });
  }

  function togliDallaSfera(id) {
    const item = innerItems.get(id);
    if (item) item.leaving = true;
  }

  function applyGlass() {
    if (mode !== 'home') {
      material.opacity = fadeOpacity * fadeGame;
      return;
    }
    const alive = [...innerItems.values()].some((item) => !item.leaving || item.appear > 0.02);
    const target = alive ? 1 : 0;
    glassT += (target - glassT) * 0.1;
    material.transmission = 0;
    material.metalness = THREE.MathUtils.lerp(1, 0.55, glassT);
    material.roughness = THREE.MathUtils.lerp(0.28, 0.16, glassT);
    material.color.lerpColors(COLOR_METAL, COLOR_GLASS, glassT);
    material.opacity = fadeOpacity * THREE.MathUtils.lerp(1, 0.28, glassT);
    material.depthWrite = glassT < 0.4;
    scene.environmentIntensity = THREE.MathUtils.lerp(0.7, 1.15, glassT);
    innerLight.intensity = 1.35 + glassT * 1.1;
  }

  function tickInner(t) {
    innerRoot.position.copy(sphere.position);
    innerRoot.scale.copy(sphere.scale);
    innerRoot.rotation.y = spinY * 0.7;
    const gone = [];
    for (const [id, item] of innerItems) {
      if (item.leaving) {
        item.appear = Math.max(0, item.appear - 0.045);
        if (item.appear <= 0.01) gone.push(id);
      } else {
        item.appear = Math.min(1, item.appear + 0.035);
      }
      const u = item.appear * item.appear * (3 - 2 * item.appear);
      item.holder.position.x = item.radius * u;
      item.holder.scale.setScalar(u);
      item.pivot.rotation.y = item.phase + t * item.speed;
      item.holder.rotation.y = t * 0.85;
      item.holder.rotation.x = Math.sin(t * 0.4 + item.phase) * 0.15;
    }
    for (const id of gone) {
      const item = innerItems.get(id);
      innerRoot.remove(item.pivot);
      disposeObject(item.pivot);
      innerItems.delete(id);
    }
  }

  function assorbi(el) {
    if (!el || el.dataset.esaurito === 'true') return;
    const id = el.dataset.id;
    const famiglia = el.dataset.famiglia || 'vasi';
    const giaPreso = presi.findIndex((p) => p.id === id);
    absorbStarted = performance.now();
    if (giaPreso >= 0) {
      presi.splice(giaPreso, 1);
      el.classList.remove('preso');
      uniforms.uTint.value = 1;
      material.emissive.copy(GLOW_VIOLET);
      pulsa(el);
      togliDallaSfera(id);
    } else {
      presi.push({ id, nome: el.dataset.nome });
      el.classList.add('preso');
      uniforms.uTint.value = 0;
      material.emissive.copy(GLOW_RED);
      pulsa(el);
      ghostVersoSfera(el);
      entraNellaSfera(id, famiglia);
    }
    if (presiN) presiN.textContent = String(presi.length);
  }

  function stayCenter(t) {
    if (!following && !displaced) {
      sphere.position.set(0, restWorldY(), 0);
    }
    spinVel *= 0.9;
    spinY += spinVel;
    sphere.rotation.y = t * 0.18 + spinY;
    sphere.rotation.x = Math.sin(t * 0.22) * 0.22;
    sphere.rotation.z = Math.cos(t * 0.17) * 0.12;
  }

  function setFade(opacity) {
    fadeOpacity = opacity;
    if (catalogo) catalogo.style.opacity = String(opacity);
  }

  function opacityAt(now) {
    const elapsed = now - started;
    const wait = LOAD_BLACK_MS[mode];
    if (elapsed < wait) return 0;
    return Math.min(1, (elapsed - wait) / FADE_MS[mode]);
  }

  function onResize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    applyScale();
  }

  const clock = new THREE.Clock();
  const started = performance.now();

  window.addEventListener('resize', onResize);
  window.addEventListener('pointermove', (e) => {
    setPointer(e);
    if (mode === 'intro') {
      canvas.style.cursor = fadedIn && hitsSphere() ? 'pointer' : 'default';
      return;
    }
    if (!following) {
      canvas.style.cursor = fadedIn && hitsSphere() ? 'grab' : 'default';
      return;
    }
    canvas.style.cursor = 'grabbing';
    sphere.position.copy(pointOnPlane()).add(grabOffset);
    displaced = true;
  });
  window.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || !fadedIn) return;
    setPointer(e);
    if (mode === 'intro') {
      if (!hitsSphere() || !introClickEnabled) return;
      if (introClick) introClick();
      else window.location.href = '/home';
      return;
    }
    if (following) {
      following = false;
      canvas.style.cursor = hitsSphere() ? 'grab' : 'default';
      return;
    }
    if (!hitsSphere()) return;
    grabOffset.copy(sphere.position).sub(pointOnPlane());
    following = true;
    displaced = true;
    canvas.style.cursor = 'grabbing';
  });
  window.addEventListener('keydown', (e) => {
    if (mode !== 'home') return;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.code !== 'Space' || e.repeat) return;
    e.preventDefault();
    if (!fadedIn || !following) return;
    assorbi(prodottoSotto());
  });
  window.addEventListener('wheel', (e) => {
    if (mode !== 'home' || !following || !fadedIn || e.ctrlKey) return;
    e.preventDefault();
    const delta = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (griglia) griglia.scrollLeft += delta;
    spinVel += delta * 0.0038;
  }, { passive: false });

  applyScale();

  function tick() {
    if (!running) return;
    clock.getDelta();
    const t = clock.elapsedTime;
    uniforms.uTime.value = t;
    stayCenter(t);
    applyScale();
    const shake = absorbShake();
    if (shake > 0) {
      const amp = sphere.scale.x * 0.22 * shake;
      sphere.position.x += Math.sin(t * 74) * amp;
      sphere.position.y += Math.cos(t * 91) * amp * 0.85;
    }
    tickInner(t);
    evidenzia();
    if (!fadedIn) {
      const o = opacityAt(performance.now());
      setFade(o);
      if (o >= 1) fadedIn = true;
    }
    if (finale === 'vanish') {
      fadeGame += (0 - fadeGame) * 0.1;
    } else if (finale === 'explode') {
      if (scalaExtra > 2.1) fadeGame += (0 - fadeGame) * 0.16;
    }
    applyGlass();
    const orbit = t * 0.08;
    fill.position.set(Math.cos(orbit) * 3.5, 3 + Math.sin(orbit * 0.7) * 1.2, 5);
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  function resetta() {
    finale = null;
    umoreTarget = 0;
    umoreSmooth = 0;
    scalaExtra = 1;
    scalaExtraTarget = 1;
    fadeGame = 1;
    absorbStarted = 0;
    material.color.copy(COLOR_METAL);
    material.emissiveIntensity = 0;
    introClickEnabled = true;
    applyScale();
  }

  const stop = () => {
    running = false;
    for (const item of innerItems.values()) {
      disposeObject(item.pivot);
    }
    innerItems.clear();
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  };
  document.addEventListener('astro:before-swap', stop, { once: true });
  window.addEventListener('pagehide', stop, { once: true });

  return {
    onIntroClick(fn) {
      introClick = fn;
    },
    setIntroClickEnabled(v) {
      introClickEnabled = v;
    },
    setUmore(n) {
      umoreTarget = n;
    },
    risucchia(els) {
      absorbStarted = performance.now();
      uniforms.uTint.value = 0;
      material.emissive.copy(GLOW_RED);
      for (const el of els) ghostVersoSfera(el);
    },
    sparisci() {
      finale = 'vanish';
      scalaExtraTarget = 0;
    },
    esplodi() {
      finale = 'explode';
      scalaExtraTarget = 6.5;
      absorbStarted = performance.now();
    },
    resetta,
  };
}
