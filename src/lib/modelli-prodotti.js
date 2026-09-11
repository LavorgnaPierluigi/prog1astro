import * as THREE from 'three';

function mat(color, extra = {}) {
  const c = new THREE.Color(color);
  return new THREE.MeshStandardMaterial({
    color: c,
    roughness: extra.roughness ?? 0.45,
    metalness: extra.metalness ?? 0.12,
    envMapIntensity: extra.envMapIntensity ?? 1.15,
    emissive: extra.emissive ?? c.clone().multiplyScalar(0.1),
    emissiveIntensity: extra.emissiveIntensity ?? 0.7,
    side: extra.side ?? THREE.FrontSide,
  });
}

function add(parent, geo, material, pos, rot) {
  const mesh = new THREE.Mesh(geo, material);
  if (pos) mesh.position.set(pos[0], pos[1], pos[2]);
  if (rot) mesh.rotation.set(rot[0], rot[1], rot[2]);
  parent.add(mesh);
  return mesh;
}

function fit(group, target = 0.22) {
  const box = new THREE.Box3().setFromObject(group);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  group.position.sub(center);
  const wrap = new THREE.Group();
  wrap.add(group);
  const m = Math.max(size.x, size.y, size.z, 0.001);
  wrap.scale.setScalar(target / m);
  return wrap;
}

function legs(root, wood, seatY, spreadX, spreadZ, thick = 0.028) {
  const h = seatY + 0.01;
  const geo = new THREE.CylinderGeometry(thick * 0.7, thick, h, 8);
  for (const [x, z] of [
    [-spreadX, spreadZ],
    [spreadX, spreadZ],
    [-spreadX, -spreadZ],
    [spreadX, -spreadZ],
  ]) {
    add(root, geo, wood, [x, h / 2, z], [0.08 * Math.sign(z), 0, -0.08 * Math.sign(x)]);
  }
}

function chair(id) {
  const root = new THREE.Group();
  const oak = mat(0xd2b48c, { roughness: 0.5 });
  const dark = mat(0x2a2a2e, { roughness: 0.42, metalness: 0.35 });
  const leather = mat(0x5c4033, { roughness: 0.62 });

  if (id === 'sedia-tonda') {
    add(root, new THREE.CylinderGeometry(0.26, 0.26, 0.05, 24), oak, [0, 0.24, 0]);
    add(root, new THREE.TorusGeometry(0.2, 0.035, 8, 20, Math.PI * 1.2), oak, [0, 0.42, -0.08], [0.2, 0, 0]);
    add(root, new THREE.CylinderGeometry(0.03, 0.03, 0.28, 8), oak, [-0.18, 0.38, -0.12]);
    add(root, new THREE.CylinderGeometry(0.03, 0.03, 0.28, 8), oak, [0.18, 0.38, -0.12]);
    legs(root, oak, 0.22, 0.16, 0.15);
    return root;
  }

  if (id === 'sedia-linea') {
    add(root, new THREE.BoxGeometry(0.4, 0.04, 0.36), leather, [0, 0.26, 0]);
    add(root, new THREE.BoxGeometry(0.38, 0.42, 0.03), oak, [0, 0.48, -0.16]);
    legs(root, oak, 0.24, 0.16, 0.14, 0.016);
    return root;
  }

  if (id === 'sedia-ombra') {
    add(root, new THREE.BoxGeometry(0.48, 0.07, 0.44), dark, [0, 0.16, 0.02]);
    add(root, new THREE.BoxGeometry(0.46, 0.28, 0.08), dark, [0, 0.32, -0.16]);
    legs(root, dark, 0.14, 0.18, 0.16, 0.032);
    return root;
  }

  if (id === 'sedia-ponte') {
    add(root, new THREE.BoxGeometry(0.4, 0.045, 0.36), oak, [0, 0.24, 0]);
    const arco = new THREE.TorusGeometry(0.22, 0.028, 8, 16, Math.PI);
    add(root, arco, oak, [0, 0.46, -0.14], [Math.PI / 2, 0, 0]);
    legs(root, oak, 0.22, 0.16, 0.14);
    return root;
  }

  if (id === 'sedia-corda') {
    add(root, new THREE.BoxGeometry(0.4, 0.03, 0.36), dark, [0, 0.24, 0]);
    const corda = mat(0xc4b49a, { roughness: 0.7 });
    for (let i = 0; i < 6; i++) {
      add(root, new THREE.BoxGeometry(0.36, 0.012, 0.018), corda, [0, 0.255, -0.14 + i * 0.05]);
    }
    add(root, new THREE.BoxGeometry(0.36, 0.36, 0.03), dark, [0, 0.44, -0.17]);
    legs(root, dark, 0.22, 0.16, 0.14, 0.018);
    return root;
  }

  add(root, new THREE.BoxGeometry(0.42, 0.045, 0.38), oak, [0, 0.24, 0.02]);
  add(root, new THREE.BoxGeometry(0.4, 0.16, 0.04), oak, [0, 0.42, -0.16], [0.18, 0, 0]);
  legs(root, oak, 0.22, 0.16, 0.15);
  return root;
}

function lamp(id) {
  const root = new THREE.Group();
  const nero = mat(0x6a6a72, { roughness: 0.28, metalness: 0.78, emissive: new THREE.Color(0x2a2a30), emissiveIntensity: 0.55 });
  const luce = mat(0xffd9a8, {
    roughness: 0.28,
    metalness: 0,
    emissive: new THREE.Color(0xffc27a),
    emissiveIntensity: 2.2,
  });

  if (id === 'lampada-isola') {
    add(root, new THREE.CylinderGeometry(0.008, 0.008, 0.28, 8), nero, [0, 0.42, 0]);
    add(root, new THREE.SphereGeometry(0.18, 20, 12, 0, Math.PI * 2, 0, Math.PI / 1.7), nero, [0, 0.2, 0]);
    add(root, new THREE.CircleGeometry(0.14, 20), luce, [0, 0.14, 0], [-Math.PI / 2, 0, 0]);
    return root;
  }

  if (id === 'lampada-filo') {
    add(root, new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16), nero, [0, 0.01, 0]);
    add(root, new THREE.CylinderGeometry(0.01, 0.01, 0.28, 8), nero, [0, 0.16, 0]);
    add(root, new THREE.CylinderGeometry(0.09, 0.11, 0.1, 16, 1, true), nero, [0, 0.34, 0]);
    add(root, new THREE.CircleGeometry(0.08, 16), luce, [0, 0.3, 0], [-Math.PI / 2, 0, 0]);
    return root;
  }

  if (id === 'lampada-cupola') {
    add(root, new THREE.CylinderGeometry(0.14, 0.14, 0.025, 20), nero, [0, 0.01, 0]);
    add(root, new THREE.CylinderGeometry(0.014, 0.014, 0.2, 8), nero, [0, 0.12, 0]);
    add(root, new THREE.SphereGeometry(0.2, 20, 12, 0, Math.PI * 2, 0, Math.PI / 1.8), nero, [0, 0.28, 0]);
    add(root, new THREE.CircleGeometry(0.16, 20), luce, [0, 0.22, 0], [-Math.PI / 2, 0, 0]);
    return root;
  }

  if (id === 'lampada-muro') {
    add(root, new THREE.BoxGeometry(0.06, 0.18, 0.04), nero, [0, 0.2, -0.08]);
    add(root, new THREE.CylinderGeometry(0.09, 0.1, 0.12, 16, 1, true), nero, [0, 0.2, 0.04], [Math.PI / 2.6, 0, 0]);
    add(root, new THREE.CircleGeometry(0.08, 16), luce, [0, 0.16, 0.05], [-0.9, 0, 0]);
    return root;
  }

  if (id === 'lampada-anello') {
    add(root, new THREE.TorusGeometry(0.2, 0.028, 12, 32), nero);
    add(root, new THREE.TorusGeometry(0.168, 0.012, 10, 32), luce);
    return root;
  }

  add(root, new THREE.CylinderGeometry(0.14, 0.14, 0.025, 20), nero, [0, 0.01, 0]);
  add(root, new THREE.CylinderGeometry(0.022, 0.022, 0.52, 8), nero, [0, 0.28, 0]);
  add(root, new THREE.BoxGeometry(0.14, 0.022, 0.022), nero, [0.07, 0.53, 0]);
  add(root, new THREE.CylinderGeometry(0.1, 0.12, 0.16, 16, 1, true), nero, [0.14, 0.48, 0]);
  add(root, new THREE.CircleGeometry(0.095, 16), luce, [0.14, 0.41, 0], [-Math.PI / 2, 0, 0]);
  return root;
}

function vaseProfile(kind) {
  const pts = [];
  const steps = 14;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    let r;
    let y;
    if (kind === 'terra') {
      y = t * 0.55;
      r = 0.08 + Math.sin(t * Math.PI) * 0.2;
      if (t > 0.82) r = 0.1;
    } else if (kind === 'orlo') {
      y = t * 0.42;
      r = 0.1 + Math.sin(t * Math.PI) * 0.16 + t * 0.08;
    } else if (kind === 'alto') {
      y = t * 0.7;
      r = 0.09 + Math.sin(t * Math.PI) * 0.05;
    } else if (kind === 'bacino') {
      y = t * 0.22;
      r = 0.06 + t * 0.22;
    } else if (kind === 'fessura') {
      y = t * 0.5;
      r = 0.1 + Math.sin(t * Math.PI) * 0.1;
    } else {
      y = t * 0.5;
      r = 0.12 + Math.sin(t * Math.PI) * 0.12;
    }
    pts.push(new THREE.Vector2(r, y));
  }
  return pts;
}

function vase(id) {
  const root = new THREE.Group();
  const terracotta = mat(0xb85c38, { roughness: 0.72, metalness: 0.04 });
  const pietra = mat(0x9a9aa3, { roughness: 0.55, metalness: 0.18 });
  const nero = mat(0x161616, { roughness: 0.32, metalness: 0.2 });
  const chiaro = mat(0xd8cfc4, { roughness: 0.5 });

  if (id === 'vaso-doppio') {
    add(root, new THREE.SphereGeometry(0.16, 20, 14), chiaro, [-0.1, 0.16, 0]);
    add(root, new THREE.SphereGeometry(0.13, 20, 14), chiaro, [0.12, 0.14, 0]);
    add(root, new THREE.CylinderGeometry(0.05, 0.05, 0.06, 12), chiaro, [-0.1, 0.3, 0]);
    add(root, new THREE.CylinderGeometry(0.04, 0.04, 0.05, 12), chiaro, [0.12, 0.26, 0]);
    return root;
  }

  const kind = id.replace('vaso-', '');
  const color =
    id === 'vaso-terra' ? terracotta
    : id === 'vaso-orlo' ? pietra
    : id === 'vaso-alto' ? nero
    : id === 'vaso-bacino' ? chiaro
    : nero;

  add(root, new THREE.LatheGeometry(vaseProfile(kind), 24), color);
  return root;
}

/**
 * Miniatura 3D di un pezzo del catalogo, già centrata e ridotta per stare nella sfera.
 * @param {string} id
 * @param {string} famiglia
 */
export function createProductModel(id, famiglia) {
  let built;
  if (famiglia === 'sedie') built = chair(id);
  else if (famiglia === 'lampade') built = lamp(id);
  else built = vase(id);
  return fit(built, 0.28);
}
