import * as THREE from 'three';
import { BLOB_FEELING, BLOB_PRESENTAZIONE, derivaBlob, rotazioneBlob } from './blob-sfondo.js';

/**
 * Stessa deformazione della sfera del gioco.
 * @param {import('three').WebGLProgramParametersWithUniforms} shader
 * @param {{ uTime: { value: number }, uDeform: { value: number }, uStretch: { value: number }, uSpeed: { value: number } }} uniforms
 * @param {number} off
 */
function collegaFormaGioco(shader, uniforms, off) {
  shader.uniforms.uTime = uniforms.uTime;
  shader.uniforms.uDeform = uniforms.uDeform;
  shader.uniforms.uStretch = uniforms.uStretch;
  shader.uniforms.uSpeed = uniforms.uSpeed;
  shader.uniforms.uOff = { value: off };
  shader.vertexShader = shader.vertexShader.replace(
    '#include <common>',
    `#include <common>
      uniform float uTime;
      uniform float uDeform;
      uniform float uStretch;
      uniform float uSpeed;
      uniform float uOff;
      float blobNoise(vec3 p, float t) {
        float n1 = sin(p.x * 2.4 + t) * sin(p.y * 2.1 + t * 0.72) * sin(p.z * 2.6 + t * 0.88);
        float n2 = sin(p.x * 4.1 + t * 0.55) * sin(p.y * 3.6 - t * 0.7) * sin(p.z * 3.2 + t * 0.48);
        float n3 = sin(p.x * 1.3 - t * 0.4) * sin(p.y * 2.8 + t * 0.62);
        float breathe = sin(t * 0.9) * 0.4 + 0.7;
        return (n1 * breathe + n2 * 0.65 + n3 * 0.35);
      }`,
  );
  shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    `#include <begin_vertex>
      float t = uTime * uSpeed * 8.0 + uOff;
      transformed.x *= 1.0 + uStretch * sin(t * 0.55);
      transformed.y *= 1.0 + uStretch * 0.85 * sin(t * 0.41 + 1.1);
      transformed.z *= 1.0 + uStretch * 0.7 * sin(t * 0.63 + 0.4);
      transformed += objectNormal * blobNoise(transformed, t) * uDeform;
    `,
  );
}

function materialeBlob(color, uniforms, off) {
  const mat = new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.38,
    roughness: 0.48,
    envMapIntensity: 0.58,
    clearcoat: 0.55,
    clearcoatRoughness: 0.48,
    sheen: 0.55,
    sheenColor: new THREE.Color(0xfff0e8),
    sheenRoughness: 0.5,
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.38,
    transparent: true,
    opacity: 0.92,
  });
  mat.onBeforeCompile = (shader) => collegaFormaGioco(shader, uniforms, off);
  return mat;
}

/**
 * @param {HTMLElement} stage
 */
export function mountSfondoBlob(stage) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.1, 100);
  camera.position.z = 8;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  stage.appendChild(canvas);

  const key = new THREE.DirectionalLight(0xfff4ea, 1.05);
  key.position.set(3.5, 4.2, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xf0c8d8, 0.5);
  rim.position.set(-6, 1, -2);
  scene.add(rim);
  const fill = new THREE.PointLight(0xffe4f0, 0.48, 24, 1.6);
  fill.position.set(-2, 4, 5);
  scene.add(fill);

  const uniforms = {
    uTime: { value: 0 },
    uDeform: { value: BLOB_FEELING.deform },
    uStretch: { value: BLOB_FEELING.stretch },
    uSpeed: { value: BLOB_FEELING.speed },
  };

  const geo = new THREE.SphereGeometry(1, 64, 48);
  const meshes = BLOB_PRESENTAZIONE.map((b, i) => {
    const mesh = new THREE.Mesh(geo, materialeBlob(b.colore, uniforms, i * 1.7));
    scene.add(mesh);
    return { mesh, conf: b, fase: i, restX: 0, restY: 0, visW: 1, visH: 1 };
  });

  function worldRadiusForPx(px) {
    const dist = camera.position.z;
    const visibleH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    return ((px / innerHeight) * visibleH) / 2;
  }

  function posiziona() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    const dist = camera.position.z;
    const visibleH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const visibleW = visibleH * camera.aspect;
    for (const item of meshes) {
      const { mesh, conf } = item;
      mesh.scale.setScalar(worldRadiusForPx(conf.diametroPx));
      item.visW = visibleW;
      item.visH = visibleH;
      item.restX = (conf.x - 0.5) * visibleW;
      item.restY = (0.5 - conf.y) * visibleH;
      mesh.position.set(item.restX, item.restY, 0);
    }
  }

  posiziona();
  window.addEventListener('resize', posiziona);

  const clock = new THREE.Clock();
  let vivo = true;

  function tick() {
    if (!vivo) return;
    const t = clock.elapsedTime;
    uniforms.uTime.value = t;
    for (const { mesh, fase, conf, restX, restY, visW, visH } of meshes) {
      const rot = rotazioneBlob(t, fase * 0.8);
      const deriva = derivaBlob(t, conf, fase);
      mesh.rotation.set(rot.x, rot.y, rot.z);
      mesh.position.set(restX + deriva.x * visW, restY + deriva.y * visH, 0);
    }
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  const stop = () => {
    vivo = false;
    window.removeEventListener('resize', posiziona);
    renderer.dispose();
    geo.dispose();
    for (const { mesh } of meshes) mesh.material.dispose();
  };
  document.addEventListener('astro:before-swap', stop, { once: true });
  window.addEventListener('pagehide', stop, { once: true });
}
