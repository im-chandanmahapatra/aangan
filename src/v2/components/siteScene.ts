/**
 * Three.js site model — loaded on demand by <SiteModel/>.
 *
 * A diorama of a plot drawn to its stated frontage × depth, oriented to its
 * stated facing, with: a gently falling terrain block cut to show laterite
 * strata, the plot boundary, the approach road, trees, (for coastal sites)
 * beach, sea and casuarina belt, a sun path for ~19°N, and either an
 * indicative courtyard-house massing or an indicative building envelope.
 *
 * Modes: "day" (sun follows the hour), "monsoon" (overcast light, rain,
 * SW monsoon wind), "measure" (dimension lines + plan-like camera).
 *
 * Everything here is INDICATIVE: terrain, trees and massing are generated,
 * not surveyed. Only frontage, depth and facing come from the listing.
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export type Facing = "North" | "South" | "East" | "West";
export type SiteMode = "day" | "monsoon" | "measure";
export type SiteOptions = {
  frontageFt: number;
  depthFt: number;
  facing: Facing;
  coastal: boolean;
  /** which side of the plot the road runs along */
  roadSide: "front" | "back";
  build: "courtyard" | "envelope";
  reducedMotion: boolean;
  overlay: HTMLElement;
  northEl?: HTMLElement | null;
  scaleEl?: HTMLElement | null;
  scaleMeters?: number;
};
export type SiteScene = {
  setHour: (h: number) => void;
  setMode: (m: SiteMode) => void;
  dispose: () => void;
};

const FT = 0.3048;
// facing → rotation that turns local −x (the frontage) to the facing direction
const FACING_ROT: Record<Facing, number> = { West: 0, East: Math.PI, North: -Math.PI / 2, South: Math.PI / 2 };

/** small deterministic PRNG so the model is identical on every visit */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function createSiteScene(host: HTMLElement, o: SiteOptions): SiteScene {
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  const W = o.frontageFt * FT; // along local z
  const D = o.depthFt * FT; // along local x
  const L = Math.max(W, D) + 72; // terrain block size
  const half = L / 2;
  const front = -D / 2; // local x of the frontage edge
  const seaX = o.coastal ? front - 22 : -Infinity; // shoreline (local x)

  // ——— Renderer ———
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);
  const cv = renderer.domElement;
  cv.style.display = "block";
  cv.style.width = "100%";
  cv.style.height = "100%";
  cv.style.touchAction = "pan-y";

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x142019, L * 1.4, L * 3.6);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.5, 2000);
  const camHome = new THREE.Vector3(L * 0.62, L * 0.58, L * 0.78);
  const camPlan = new THREE.Vector3(L * 0.06, L * 1.6, L * 0.3);
  camera.position.copy(camHome);

  const controls = new OrbitControls(camera, cv);
  controls.enableDamping = !o.reducedMotion;
  controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minPolarAngle = 0.15;
  controls.maxPolarAngle = 1.22;
  controls.rotateSpeed = 0.6;
  controls.target.set(0, 0, 0);
  controls.update();

  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x);

  // Site group: local frame where the frontage faces −x.
  const site = new THREE.Group();
  site.rotation.y = FACING_ROT[o.facing];
  scene.add(site);
  const toWorld = (v: THREE.Vector3) => v.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), site.rotation.y);

  // ——— Terrain height (local coords) ———
  const height = (x: number, z: number) => {
    const n =
      Math.sin(x * 0.075 + 1.3) * Math.cos(z * 0.068 + 0.4) * 0.7 +
      Math.sin(x * 0.17 + z * 0.13) * 0.28 +
      Math.cos(z * 0.21 - x * 0.05) * 0.18;
    let h = 2.4 + x * 0.035 + n; // gentle fall towards the frontage
    if (o.coastal) {
      const beach = smooth(seaX - 2, seaX + 16, x);
      h = THREE.MathUtils.lerp(-1.2 + (x - seaX) * 0.08, h, beach);
    }
    return h;
  };

  // ——— Terrain block ———
  const seg = mobile ? 72 : 110;
  const tg = keep(new THREE.PlaneGeometry(L, L, seg, seg));
  tg.rotateX(-Math.PI / 2);
  const pos = tg.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const r = rng(11);
  const grassA = new THREE.Color(0x56703c);
  const grassB = new THREE.Color(0x7d8a47);
  const earth = new THREE.Color(0x9a4a2a);
  const sand = new THREE.Color(0xcdb68a);
  const roadZ = o.roadSide === "back" ? D / 2 + 9 : front - 9;
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = height(x, z);
    pos.setY(i, y);
    const v = Math.sin(x * 0.31 + z * 0.17) * 0.5 + 0.5;
    c.copy(grassA).lerp(grassB, v * 0.8 + r() * 0.2);
    // red earth showing through near the road and on worn ground
    const nearRoad = 1 - smooth(4, 9, Math.abs(x - roadZ));
    const worn = smooth(0.55, 0.95, Math.sin(x * 0.045 - z * 0.06 + 2) * Math.cos(z * 0.09));
    c.lerp(earth, Math.max(nearRoad * 0.75, worn * 0.16));
    if (o.coastal) c.lerp(sand, 1 - smooth(seaX + 3, seaX + 14, x));
    colors.set([c.r, c.g, c.b], i * 3);
  }
  tg.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  tg.computeVertexNormals();
  const terrainMat = keep(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, flatShading: false }));
  const terrain = new THREE.Mesh(tg, terrainMat);
  terrain.receiveShadow = true;
  site.add(terrain);

  // Skirts: the block's cut faces, banded laterite strata.
  const base = -7;
  const skirtMat = keep(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, side: THREE.DoubleSide }));
  const strata = [new THREE.Color(0x7c3a20), new THREE.Color(0xa24d2b), new THREE.Color(0x6b301b), new THREE.Color(0x4a2213)];
  const skirt = (pts: [number, number][]) => {
    const n = pts.length;
    const g = new THREE.BufferGeometry();
    const p: number[] = [];
    const col: number[] = [];
    const idx: number[] = [];
    pts.forEach(([x, z], i) => {
      const top = height(x, z);
      p.push(x, top, z, x, base, z);
      const k = (Math.sin(i * 0.7) * 0.5 + 0.5) * 0.4;
      const ct = strata[0].clone().lerp(strata[1], k);
      col.push(ct.r, ct.g, ct.b, strata[3].r, strata[3].g, strata[3].b);
      if (i < n - 1) {
        const a = i * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    });
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    keep(g);
    site.add(new THREE.Mesh(g, skirtMat));
  };
  const edge = (fn: (t: number) => [number, number]) =>
    skirt(Array.from({ length: seg + 1 }, (_, i) => fn(i / seg)));
  edge((t) => [-half + t * L, half]);
  edge((t) => [half, half - t * L]);
  edge((t) => [half - t * L, -half]);
  edge((t) => [-half, -half + t * L]);
  // Strata lines on the skirts
  const strataMat = keep(new THREE.LineBasicMaterial({ color: 0xd06a3b, transparent: true, opacity: 0.35 }));
  [-2.2, -4.4].forEach((yy) => {
    const g = keep(
      new THREE.BufferGeometry().setFromPoints(
        [
          [-half, half],
          [half, half],
          [half, -half],
          [-half, -half],
          [-half, half],
        ].map(([x, z]) => new THREE.Vector3(x, yy, z)),
      ),
    );
    site.add(new THREE.Line(g, strataMat));
  });

  // ——— Sea ———
  let seaMat: THREE.MeshStandardMaterial | null = null;
  if (o.coastal) {
    seaMat = keep(
      new THREE.MeshStandardMaterial({ color: 0x3f7a7c, roughness: 0.18, metalness: 0.15, transparent: true, opacity: 0.94 }),
    );
    const sg = keep(new THREE.PlaneGeometry(900, 900));
    sg.rotateX(-Math.PI / 2);
    const sea = new THREE.Mesh(sg, seaMat);
    sea.position.set(seaX - 450 + 6, -0.55, 0);
    sea.receiveShadow = true;
    site.add(sea);
    // surf line
    const surf = keep(new THREE.LineBasicMaterial({ color: 0xf1ead8, transparent: true, opacity: 0.7 }));
    for (let k = 0; k < 3; k++) {
      const pts = Array.from({ length: 60 }, (_, i) => {
        const z = -half + (i / 59) * L;
        return new THREE.Vector3(seaX + 4.5 - k * 3.2 + Math.sin(z * 0.2 + k) * 0.8, -0.48, z);
      });
      site.add(new THREE.Line(keep(new THREE.BufferGeometry().setFromPoints(pts)), surf));
    }
  }

  // ——— Road ———
  {
    const rg = keep(new THREE.PlaneGeometry(6, L, 1, 60));
    rg.rotateX(-Math.PI / 2);
    const rp = rg.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < rp.count; i++) {
      const x = rp.getX(i) + roadZ;
      rp.setY(i, height(x, rp.getZ(i)) + 0.08);
    }
    rg.computeVertexNormals();
    const road = new THREE.Mesh(rg, keep(new THREE.MeshStandardMaterial({ color: 0x8e4a2c, roughness: 1 })));
    road.position.x = roadZ;
    road.receiveShadow = true;
    site.add(road);
  }

  // ——— Trees (instanced) ———
  const rand = rng(7);
  const treePts: { x: number; z: number; s: number; kind: "round" | "tall" }[] = [];
  const insidePlot = (x: number, z: number, m = 0) =>
    Math.abs(x) < D / 2 - m && Math.abs(z) < W / 2 - m;
  const buildR = o.build === "courtyard" ? Math.min(W, D) * 0.34 : 0;
  for (let i = 0; i < (mobile ? 110 : 170); i++) {
    const x = (rand() - 0.5) * (L - 6);
    const z = (rand() - 0.5) * (L - 6);
    if (Math.abs(x - roadZ) < 5.5) continue;
    if (o.coastal && x < seaX + 10) continue;
    if (insidePlot(x, z) && (Math.abs(x) < buildR + 4 && Math.abs(z) < buildR + 4)) continue;
    if (o.build === "envelope" && insidePlot(x, z, -2) && rand() < 0.75) continue;
    treePts.push({ x, z, s: 0.7 + rand() * 0.8, kind: "round" });
  }
  if (o.coastal) {
    for (let i = 0; i < (mobile ? 40 : 70); i++) {
      const z = -half + 3 + rand() * (L - 6);
      const x = seaX + 11 + rand() * 9;
      treePts.push({ x, z, s: 0.8 + rand() * 0.5, kind: "tall" });
    }
  }
  const crownG = keep(new THREE.IcosahedronGeometry(1, 1));
  const tallG = keep(new THREE.ConeGeometry(1, 1, 7));
  const trunkG = keep(new THREE.CylinderGeometry(0.12, 0.18, 1, 6));
  const leafMat = keep(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, flatShading: true }));
  const trunkMat = keep(new THREE.MeshStandardMaterial({ color: 0x4b3424, roughness: 1 }));
  const rounds = treePts.filter((t) => t.kind === "round");
  const talls = treePts.filter((t) => t.kind === "tall");
  const crowns = new THREE.InstancedMesh(crownG, leafMat, rounds.length);
  const cones = new THREE.InstancedMesh(tallG, leafMat, Math.max(1, talls.length));
  const trunks = new THREE.InstancedMesh(trunkG, trunkMat, treePts.length);
  const mtx = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const leafCols = [0x2f4a2a, 0x3d5a2f, 0x4f6a35, 0x2a3f27, 0x5d6e36].map((h) => new THREE.Color(h));
  rounds.forEach((t, i) => {
    const y = height(t.x, t.z);
    const s = t.s * 2.6;
    q.setFromEuler(new THREE.Euler(0, rand() * 6, 0));
    mtx.compose(new THREE.Vector3(t.x, y + 2.2 * t.s + s * 0.6, t.z), q, new THREE.Vector3(s, s * 0.82, s));
    crowns.setMatrixAt(i, mtx);
    crowns.setColorAt(i, leafCols[Math.floor(rand() * leafCols.length)]);
  });
  talls.forEach((t, i) => {
    const y = height(t.x, t.z);
    mtx.compose(new THREE.Vector3(t.x, y + 2 + 4 * t.s, t.z), q.identity(), new THREE.Vector3(1.3 * t.s, 8 * t.s, 1.3 * t.s));
    cones.setMatrixAt(i, mtx);
    cones.setColorAt(i, leafCols[3]);
  });
  treePts.forEach((t, i) => {
    const y = height(t.x, t.z);
    const hgt = t.kind === "tall" ? 3 * t.s : 2.6 * t.s;
    mtx.compose(new THREE.Vector3(t.x, y + hgt / 2, t.z), q.identity(), new THREE.Vector3(t.s, hgt, t.s));
    trunks.setMatrixAt(i, mtx);
  });
  [crowns, cones, trunks].forEach((m) => {
    m.castShadow = true;
    m.receiveShadow = true;
    site.add(m);
  });
  if (!talls.length) cones.visible = false;

  // ——— Built form ———
  const edgeMat = keep(new THREE.LineBasicMaterial({ color: 0x241a12, transparent: true, opacity: 0.45 }));
  const house = new THREE.Group();
  site.add(house);
  const plinthY = height(0, 0) + 0.1;
  if (o.build === "courtyard") {
    const S = Math.min(Math.min(W, D) * 0.6, 24); // outer size
    const wd = S * 0.27; // wing depth
    const wall = keep(new THREE.MeshStandardMaterial({ color: 0xb4603a, roughness: 0.9 }));
    const plaster = keep(new THREE.MeshStandardMaterial({ color: 0xe9dfcc, roughness: 0.9 }));
    const tile = keep(new THREE.MeshStandardMaterial({ color: 0x9c3f22, roughness: 0.75, flatShading: true }));
    const court = keep(new THREE.MeshStandardMaterial({ color: 0xc9b28c, roughness: 0.95 }));
    const water = keep(new THREE.MeshStandardMaterial({ color: 0x3f6463, roughness: 0.1, metalness: 0.2 }));
    const box = (w: number, h: number, d: number, x: number, z: number, mat: THREE.Material, y = plinthY) => {
      const g = keep(new THREE.BoxGeometry(w, h, d));
      const m = new THREE.Mesh(g, mat);
      m.position.set(x, y + h / 2, z);
      m.castShadow = true;
      m.receiveShadow = true;
      house.add(m);
      const e = new THREE.LineSegments(keep(new THREE.EdgesGeometry(g)), edgeMat);
      e.position.copy(m.position);
      house.add(e);
      return m;
    };
    // hip roof from a 4-sided cone, stretched to the wing
    const roof = (w: number, d: number, x: number, z: number, y: number) => {
      const g = keep(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1));
      g.rotateY(Math.PI / 4);
      const m = new THREE.Mesh(g, tile);
      m.scale.set(w + 1.6, 1.9, d + 1.6);
      m.position.set(x, y + 0.95, z);
      m.castShadow = true;
      house.add(m);
    };
    box(S + 4, 0.45, S + 4, 0, 0, court, plinthY - 0.45);
    const h = 3.4;
    const wings: [number, number, number, number][] = [
      [S, wd, 0, -S / 2 + wd / 2], // one side
      [S, wd, 0, S / 2 - wd / 2], // other side
      [wd, S - 2 * wd, S / 2 - wd / 2, 0], // back
      [wd, S - 2 * wd, -S / 2 + wd / 2, 0], // front (towards the frontage / sea)
    ];
    wings.forEach(([w, d, x, z], i) => {
      box(w, h, d, x, z, i === 3 ? plaster : wall);
      roof(w, d, x, z, plinthY + h);
    });
    // verandah: posts + slab on the frontage side
    for (let k = -2; k <= 2; k++) box(0.3, h - 0.2, 0.3, -S / 2 - 2.2, k * (S / 5), plaster);
    box(2.8, 0.22, S, -S / 2 - 1.3, 0, tile, plinthY + h - 0.2);
    const pool = box(S * 0.22, 0.12, S * 0.12, -wd * 0.2, 0, water);
    pool.castShadow = false;
    // courtyard tree
    const t = new THREE.Mesh(trunkG, trunkMat);
    t.scale.set(1.4, 3.2, 1.4);
    t.position.set(wd * 0.3, plinthY + 1.6, S * 0.12);
    t.castShadow = true;
    house.add(t);
    const cr = new THREE.Mesh(crownG, keep(new THREE.MeshStandardMaterial({ color: 0x55703a, roughness: 0.9, flatShading: true })));
    cr.scale.set(2.3, 1.9, 2.3);
    cr.position.set(wd * 0.3, plinthY + 4.4, S * 0.12);
    cr.castShadow = true;
    house.add(cr);
  } else {
    const ew = D * 0.62;
    const ed = W * 0.62;
    const g = keep(new THREE.BoxGeometry(ew, 7, ed));
    const m = new THREE.Mesh(
      g,
      keep(new THREE.MeshStandardMaterial({ color: 0xf3ede2, transparent: true, opacity: 0.16, depthWrite: false })),
    );
    m.position.set(0, plinthY + 3.5, 0);
    house.add(m);
    const e = new THREE.LineSegments(
      keep(new THREE.EdgesGeometry(g)),
      keep(new THREE.LineDashedMaterial({ color: 0xf3ede2, dashSize: 0.8, gapSize: 0.6, transparent: true, opacity: 0.8 })),
    );
    e.position.copy(m.position);
    e.computeLineDistances();
    house.add(e);
  }

  // ——— Plot boundary (dashed, draped on terrain) ———
  const boundaryPts: THREE.Vector3[] = [];
  const corners: [number, number][] = [
    [-D / 2, -W / 2],
    [D / 2, -W / 2],
    [D / 2, W / 2],
    [-D / 2, W / 2],
    [-D / 2, -W / 2],
  ];
  for (let k = 0; k < 4; k++) {
    const [x0, z0] = corners[k];
    const [x1, z1] = corners[k + 1];
    for (let i = 0; i < 40; i++) {
      const x = x0 + ((x1 - x0) * i) / 40;
      const z = z0 + ((z1 - z0) * i) / 40;
      boundaryPts.push(new THREE.Vector3(x, height(x, z) + 0.35, z));
    }
  }
  boundaryPts.push(boundaryPts[0].clone());
  const boundary = new THREE.Line(
    keep(new THREE.BufferGeometry().setFromPoints(boundaryPts)),
    keep(new THREE.LineDashedMaterial({ color: 0xfaf5ea, dashSize: 1.6, gapSize: 1.0 })),
  );
  boundary.computeLineDistances();
  site.add(boundary);
  const postG = keep(new THREE.CylinderGeometry(0.18, 0.18, 1.6, 6));
  const postM = keep(new THREE.MeshStandardMaterial({ color: 0xfaf5ea, roughness: 0.6 }));
  corners.slice(0, 4).forEach(([x, z]) => {
    const p = new THREE.Mesh(postG, postM);
    p.position.set(x, height(x, z) + 0.8, z);
    p.castShadow = true;
    site.add(p);
  });

  // ——— Measure: dimension lines ———
  const measure = new THREE.Group();
  site.add(measure);
  const dimMat = keep(new THREE.LineBasicMaterial({ color: 0xf3d58a }));
  const dimLine = (a: THREE.Vector3, b: THREE.Vector3, off: THREE.Vector3) => {
    const a2 = a.clone().add(off);
    const b2 = b.clone().add(off);
    const tick = off.clone().normalize().multiplyScalar(1.2);
    const g = keep(
      new THREE.BufferGeometry().setFromPoints([
        a2, b2,
        a.clone().add(off).sub(tick), a.clone().add(off).add(tick),
        b.clone().add(off).sub(tick), b.clone().add(off).add(tick),
      ]),
    );
    measure.add(new THREE.LineSegments(g, dimMat));
  };
  const yM = Math.max(height(-D / 2, -W / 2), height(D / 2, -W / 2), height(-D / 2, W / 2)) + 0.6;
  dimLine(new THREE.Vector3(-D / 2, yM, -W / 2), new THREE.Vector3(-D / 2, yM, W / 2), new THREE.Vector3(-4, 0, 0)); // frontage
  dimLine(new THREE.Vector3(-D / 2, yM, -W / 2), new THREE.Vector3(D / 2, yM, -W / 2), new THREE.Vector3(0, 0, -4)); // depth
  measure.visible = false;

  // ——— Wind arrows ———
  const wind = new THREE.Group();
  site.add(wind);
  const windMat = keep(new THREE.MeshBasicMaterial({ color: 0xbfe6f2, transparent: true, opacity: 0.95 }));
  const arrowAt = (x: number, z: number, len: number) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x, 0, z),
      new THREE.Vector3(x + len * 0.5, 0.6, z + 1.5),
      new THREE.Vector3(x + len, 0.2, z + 0.4),
    ]);
    const tube = new THREE.Mesh(keep(new THREE.TubeGeometry(curve, 24, 0.22, 6)), windMat);
    const head = new THREE.Mesh(keep(new THREE.ConeGeometry(0.7, 1.8, 8)), windMat);
    head.position.copy(curve.getPoint(1));
    head.lookAt(curve.getPoint(1).add(curve.getTangent(1)));
    head.rotateX(Math.PI / 2);
    const g = new THREE.Group();
    g.add(tube, head);
    return g;
  };
  // Wind comes off the sea for coastal sites; otherwise from the south-west (monsoon).
  const windY = height(front + 6, 0) + 5;
  for (let k = 0; k < 4; k++) {
    const a = arrowAt(0, (k - 1.5) * 5, 11);
    a.position.set(o.coastal ? seaX + 3 : front - 6, windY + k * 0.5, -W * 0.15 + (k - 1.5) * 1.5);
    wind.add(a);
  }
  if (!o.coastal) {
    // re-aim to world SW → NE regardless of the plot's rotation
    wind.rotation.y = -site.rotation.y + Math.PI * 0.25;
  }

  // ——— Rain ———
  const RAIN = mobile ? 900 : 2400;
  const rainPos = new Float32Array(RAIN * 6);
  const rainSpeed = new Float32Array(RAIN);
  const rr = rng(3);
  for (let i = 0; i < RAIN; i++) {
    const x = (rr() - 0.5) * L;
    const z = (rr() - 0.5) * L;
    const y = rr() * 40;
    rainPos.set([x, y, z, x + 0.25, y + 1.6, z], i * 6);
    rainSpeed[i] = 26 + rr() * 14;
  }
  const rainG = keep(new THREE.BufferGeometry());
  rainG.setAttribute("position", new THREE.BufferAttribute(rainPos, 3));
  const rain = new THREE.LineSegments(
    rainG,
    keep(new THREE.LineBasicMaterial({ color: 0xc8d6dc, transparent: true, opacity: 0.38 })),
  );
  rain.visible = false;
  rain.frustumCulled = false;
  scene.add(rain);

  // ——— Light & sun path (world space) ———
  const hemi = new THREE.HemisphereLight(0xfbf0dc, 0x3a3020, 0.7);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  const sc = sun.shadow.camera as THREE.OrthographicCamera;
  sc.left = -half - 6;
  sc.right = half + 6;
  sc.top = half + 6;
  sc.bottom = -half - 6;
  sc.near = 1;
  sc.far = L * 4;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.04;
  scene.add(sun, sun.target);

  const R = L * 0.72;
  const sunPathPoint = (h: number) => {
    const t = Math.min(1, Math.max(0, (h - 6) / 12));
    const az = Math.PI * t; // 0 = east (+x), π = west (−x)
    const elev = Math.sin(az);
    // ~19°N: the noon sun stands high and slightly to the south (+z)
    return new THREE.Vector3(Math.cos(az) * R, 6 + elev * R * 0.78, elev * R * 0.26);
  };
  const arc = new THREE.Line(
    keep(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 64 }, (_, i) => sunPathPoint(6 + (12 * i) / 63)))),
    keep(new THREE.LineDashedMaterial({ color: 0xe9b44c, dashSize: 2.2, gapSize: 1.6, transparent: true, opacity: 0.9 })),
  );
  arc.computeLineDistances();
  scene.add(arc);
  const sunDisc = new THREE.Mesh(keep(new THREE.SphereGeometry(2.1, 20, 14)), keep(new THREE.MeshBasicMaterial({ color: 0xf4c25a })));
  scene.add(sunDisc);
  const glow = new THREE.Mesh(
    keep(new THREE.SphereGeometry(3.6, 20, 14)),
    keep(new THREE.MeshBasicMaterial({ color: 0xf4c25a, transparent: true, opacity: 0.22 })),
  );
  scene.add(glow);

  // ——— HTML labels ———
  type Lbl = { el: HTMLDivElement; p: THREE.Vector3; modes: SiteMode[] };
  const labels: Lbl[] = [];
  const label = (text: string, local: THREE.Vector3 | null, world: THREE.Vector3 | null, modes: SiteMode[], kind = "") => {
    const el = document.createElement("div");
    el.className = "v2-model-label";
    if (kind) el.dataset.kind = kind;
    el.textContent = text;
    o.overlay.appendChild(el);
    labels.push({ el, p: world ?? toWorld(local!), modes });
  };
  const all: SiteMode[] = ["day", "monsoon", "measure"];
  label("Sunrise (E)", null, sunPathPoint(6.3).add(new THREE.Vector3(0, 3, 0)), ["day"]);
  label("Sunset (W)", null, sunPathPoint(17.7).add(new THREE.Vector3(0, 3, 0)), ["day"]);
  label("Sun path", null, sunPathPoint(12).add(new THREE.Vector3(0, 4, 0)), ["day"]);
  label(
    "Plot boundary (indicative)",
    new THREE.Vector3(D / 2 - 4, height(D / 2, W / 2) + 1, W / 2),
    null,
    ["day", "monsoon"],
  );
  label(
    o.build === "courtyard" ? "Courtyard house — indicative massing" : "Indicative building envelope",
    new THREE.Vector3(0, plinthY + 8.5, 0),
    null,
    ["day", "monsoon"],
  );
  label("Approach road", new THREE.Vector3(roadZ, height(roadZ, -half * 0.6) + 1, -half * 0.6), null, all);
  if (o.coastal) {
    label("Sea", new THREE.Vector3(seaX - 18, 0.5, half * 0.35), null, all);
    if (!mobile) label("Casuarina belt", new THREE.Vector3(seaX + 14, 11, half * 0.7), null, ["day", "monsoon"]);
    if (!mobile) label("Prevailing sea breeze", new THREE.Vector3(front - 8, windY + 7, -W * 0.45), null, ["day", "monsoon"]);
  } else {
    label("Monsoon wind (SW)", null, new THREE.Vector3(-L * 0.3, windY + 4, L * 0.3), ["monsoon"]);
  }
  const ftm = (ft: number) => `${ft} ft · ${(ft * FT).toFixed(1)} m`;
  label(`Frontage ${ftm(o.frontageFt)}`, new THREE.Vector3(-D / 2 - 6, yM + 1, 0), null, ["measure"], "dim");
  label(`Depth ${ftm(o.depthFt)}`, new THREE.Vector3(0, yM + 1, -W / 2 - 6), null, ["measure"], "dim");
  label(
    `${Math.round(o.frontageFt * o.depthFt).toLocaleString("en-IN")} sq ft · ${((o.frontageFt * o.depthFt) / 43560).toFixed(2)} acres`,
    new THREE.Vector3(0, yM + 4, 0),
    null,
    ["measure"],
    "dim",
  );
  label(`Frontage faces ${o.facing.toLowerCase()}`, new THREE.Vector3(-D / 2 - 2, yM + 6, W / 2 - 4), null, ["measure"]);

  // ——— State ———
  let mode: SiteMode = "day";
  let hour = 9;
  let needsRender = true;
  let raf = 0;
  let visible = true;
  let tween: { from: THREE.Vector3; to: THREE.Vector3; t: number } | null = null;
  let last = performance.now();
  const warm = new THREE.Color(0xffa565);
  const white = new THREE.Color(0xfff2dc);
  const fogDay = new THREE.Color(0x142019);
  const fogRain = new THREE.Color(0x26302d);

  function applyLight() {
    const p = sunPathPoint(hour);
    const elev = Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (hour - 6) / 12))));
    sunDisc.position.copy(p);
    glow.position.copy(p);
    if (mode === "monsoon") {
      sun.position.set(-R * 0.3, R * 0.9, R * 0.4);
      sun.intensity = 0.35;
      sun.color.set(0xd7e0e4);
      hemi.color.set(0xb9c6c8);
      hemi.groundColor.set(0x2b302a);
      hemi.intensity = 1.6;
      (scene.fog as THREE.Fog).color.copy(fogRain);
      (scene.fog as THREE.Fog).near = L * 0.6;
      (scene.fog as THREE.Fog).far = L * 2.2;
      if (seaMat) seaMat.color.set(0x34484a);
      renderer.toneMappingExposure = 1.05;
    } else {
      sun.position.copy(p);
      sun.color.copy(warm).lerp(white, Math.min(1, 0.25 + elev * 1.2));
      sun.intensity = 1.2 + elev * 2.2;
      hemi.color.set(0xfbf0dc);
      hemi.groundColor.set(0x3a3020);
      hemi.intensity = 0.45 + elev * 0.45;
      (scene.fog as THREE.Fog).color.copy(fogDay);
      (scene.fog as THREE.Fog).near = L * 1.8;
      (scene.fog as THREE.Fog).far = L * 4.2;
      if (seaMat) seaMat.color.set(0x3f7a7c);
      renderer.toneMappingExposure = 1.0;
    }
    const showSun = mode !== "monsoon";
    sunDisc.visible = showSun;
    glow.visible = showSun;
    arc.visible = mode === "day";
    rain.visible = mode === "monsoon";
    measure.visible = mode === "measure";
    wind.visible = mode !== "measure" && (o.coastal || mode === "monsoon");
    needsRender = true;
  }

  // ——— Sizing / visibility ———
  const resize = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < 640 ? 44 : w < 1000 ? 38 : 32;
    camera.updateProjectionMatrix();
    needsRender = true;
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
  });
  io.observe(host);
  controls.addEventListener("change", () => (needsRender = true));

  const v = new THREE.Vector3();
  const north0 = new THREE.Vector3();
  const north1 = new THREE.Vector3(0, 0, -20);
  function placeLabels() {
    const w = host.clientWidth;
    const h = host.clientHeight;
    for (const l of labels) {
      const on = l.modes.includes(mode);
      v.copy(l.p).project(camera);
      const behind = v.z > 1;
      l.el.style.opacity = on && !behind ? "1" : "0";
      l.el.style.transform = `translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px) translate(-50%, -100%)`;
    }
    // north arrow follows the camera
    if (o.northEl) {
      const a = north0.set(0, 0, 0).project(camera);
      const b = north1.clone().project(camera);
      const ang = Math.atan2(-(b.y - a.y) * h, (b.x - a.x) * w);
      o.northEl.style.transform = `rotate(${90 - (ang * 180) / Math.PI}deg)`;
    }
    // live scale bar: how many px is `scaleMeters` at the plot centre?
    if (o.scaleEl) {
      const m = o.scaleMeters ?? 20;
      const p0 = new THREE.Vector3(0, plinthY, 0).project(camera);
      const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0).multiplyScalar(m);
      const p1 = right.add(new THREE.Vector3(0, plinthY, 0)).project(camera);
      const px = Math.hypot((p1.x - p0.x) * w * 0.5, (p1.y - p0.y) * h * 0.5);
      o.scaleEl.style.width = `${Math.round(px)}px`;
    }
  }

  function loop() {
    raf = 0;
    if (!visible) return;
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (tween) {
      tween.t = Math.min(1, tween.t + dt / 1.4);
      const k = 1 - Math.pow(1 - tween.t, 3);
      camera.position.lerpVectors(tween.from, tween.to, k);
      camera.lookAt(controls.target);
      if (tween.t >= 1) tween = null;
      needsRender = true;
    }
    controls.update();
    if (mode === "monsoon" && !o.reducedMotion) {
      const p = rainG.attributes.position as THREE.BufferAttribute;
      const a = p.array as Float32Array;
      for (let i = 0; i < RAIN; i++) {
        const d = rainSpeed[i] * dt;
        a[i * 6 + 1] -= d;
        a[i * 6 + 4] -= d;
        a[i * 6] -= d * 0.15;
        a[i * 6 + 3] -= d * 0.15;
        if (a[i * 6 + 1] < -1) {
          const x = (Math.random() - 0.5) * L;
          a[i * 6] = x;
          a[i * 6 + 3] = x + 0.25;
          a[i * 6 + 1] = 38;
          a[i * 6 + 4] = 39.6;
        }
      }
      p.needsUpdate = true;
      needsRender = true;
    }
    if (needsRender) {
      renderer.render(scene, camera);
      placeLabels();
      needsRender = false;
    }
    raf = requestAnimationFrame(loop);
  }

  applyLight();
  raf = requestAnimationFrame(loop);

  return {
    setHour(h) {
      hour = h;
      applyLight();
    },
    setMode(m) {
      if (m === mode) return;
      const wasMeasure = mode === "measure";
      mode = m;
      applyLight();
      if (m === "measure" || wasMeasure) {
        const to = m === "measure" ? camPlan : camHome;
        if (o.reducedMotion) {
          camera.position.copy(to);
          camera.lookAt(controls.target);
        } else tween = { from: camera.position.clone(), to: to.clone(), t: 0 };
      }
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      controls.dispose();
      labels.forEach((l) => l.el.remove());
      crowns.dispose();
      cones.dispose();
      trunks.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      cv.remove();
    },
  };
}
