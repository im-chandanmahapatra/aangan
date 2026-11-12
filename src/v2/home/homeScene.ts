/**
 * The interactive home: an exterior you can turn in your hands, a way in
 * through the front door, and room-to-room movement once you are inside.
 *
 * Three.js is only ever reached through this module, which is imported
 * lazily so the half-megabyte of library never loads for a visitor who
 * does not open the model.
 *
 * Rendering is on demand: a frame is drawn when something actually
 * changed (a drag, a camera move, a rebuild) and the loop stops entirely
 * while the model is off screen.
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { buildHome, planToWorld, type BuiltHome } from "./buildHome";
import { derivePlan, viewpointFor, type DerivedPlan } from "./walls";
import { getPlan, type HomePlan, type Room } from "./plans";

export type ViewMode = "exterior" | "interior";

export type HomeSceneOptions = {
  planId: string;
  reducedMotion: boolean;
  /** Fewer lights and no shadows on small or low-powered devices. */
  lowPower: boolean;
  /** Overlay element the scene fills with doorway markers. */
  overlay: HTMLElement;
  onMode: (m: ViewMode) => void;
  onRoom: (roomId: string | null) => void;
  onReady: () => void;
};

export type HomeScene = {
  setPlan: (planId: string) => void;
  enter: (roomId?: string) => void;
  exit: () => void;
  goToRoom: (roomId: string) => void;
  resetView: () => void;
  dispose: () => void;
};

const EYE = 5.4; // standing eye height, in feet
const TWEEN_MS = 1500;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function createHomeScene(host: HTMLElement, opts: HomeSceneOptions): HomeScene {
  const renderer = new THREE.WebGLRenderer({ antialias: !opts.lowPower, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, opts.lowPower ? 1.5 : 2));
  renderer.setSize(host.clientWidth, host.clientHeight);
  renderer.shadowMap.enabled = !opts.lowPower;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.appendChild(renderer.domElement);
  renderer.domElement.style.touchAction = "pan-y";
  renderer.domElement.style.display = "block";
  renderer.domElement.style.outline = "none";

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(
    52,
    host.clientWidth / Math.max(host.clientHeight, 1),
    0.3,
    900,
  );

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.rotateSpeed = 0.7;

  // ---- lighting -----------------------------------------------------
  // Keep the fill low so the sun does the modelling — a flatly lit model
  // reads as a toy, a strongly lit one reads as a building.
  const hemi = new THREE.HemisphereLight(0xcfe0ee, 0x5d5343, 0.95);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0dc, 2.8);
  sun.position.set(48, 56, 30);
  if (!opts.lowPower) {
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 260;
    sun.shadow.bias = -0.0009;
    sun.shadow.normalBias = 0.04;
  }
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0xffffff, 0.16));

  // ---- ground and air ------------------------------------------------
  // The canvas is transparent over a dark CSS wash, so the ground is
  // faded into that same colour with fog rather than ending in a hard
  // edge against it.
  const HORIZON = 0x16241b;
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(260, 64).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x616d47, roughness: 1 }),
  );
  ground.position.y = -1.4;
  ground.receiveShadow = !opts.lowPower;
  scene.add(ground);
  scene.fog = new THREE.Fog(HORIZON, 60, 180);

  // ---- state --------------------------------------------------------
  let plan: HomePlan = getPlan(opts.planId) ?? getPlan("nook")!;
  let derived: DerivedPlan = derivePlan(plan);
  let built: BuiltHome | null = null;
  let toWorld = planToWorld(plan);
  let mode: ViewMode = "exterior";
  let currentRoom: string | null = null;
  let needsRender = true;
  let running = true;
  let raf = 0;

  type Tween = {
    t0: number;
    from: THREE.Vector3;
    via: THREE.Vector3 | null;
    to: THREE.Vector3;
    fromT: THREE.Vector3;
    toT: THREE.Vector3;
    roofFrom: number;
    roofTo: number;
    after?: () => void;
  };
  let tween: Tween | null = null;

  const modelRadius = () => {
    const xs = plan.rooms.flatMap((r) => [r.x0, r.x1]);
    const zs = plan.rooms.flatMap((r) => [r.z0, r.z1]);
    return Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs)) / 2;
  };

  /**
   * How far back the camera has to stand for the whole house to fit, given
   * the current aspect. A house is wide and low, so fitting its bounding
   * sphere leaves it marooned in empty sky; this fits the box instead,
   * horizontally and vertically, and takes whichever is further.
   */
  function fitDistance(elevation: number) {
    const halfDiag = modelRadius();
    const height = plan.ceiling + 2.2;
    const fovV = THREE.MathUtils.degToRad(camera.fov);
    const fovH = 2 * Math.atan(Math.tan(fovV / 2) * Math.max(camera.aspect, 0.4));
    // Seen from above, the plan contributes to the on-screen height too.
    const screenHalfH = (height * Math.cos(elevation) + halfDiag * 2 * Math.sin(elevation)) / 2;
    const distH = halfDiag / Math.tan(fovH / 2);
    const distV = screenHalfH / Math.tan(fovV / 2);
    return Math.max(distH, distV) * 1.12;
  }

  function rebuild() {
    if (built) {
      scene.remove(built.shell, built.roof);
      built.dispose();
    }
    derived = derivePlan(plan);
    toWorld = planToWorld(plan);
    built = buildHome(plan, derived);
    scene.add(built.shell, built.roof);
    needsRender = true;
  }

  const ELEV = THREE.MathUtils.degToRad(30);
  const AZIM = THREE.MathUtils.degToRad(38);

  function exteriorCamera() {
    const dist = fitDistance(ELEV);
    const target = new THREE.Vector3(0, plan.ceiling * 0.4, 0);
    return {
      dist,
      target,
      pos: new THREE.Vector3(
        target.x + dist * Math.cos(ELEV) * Math.sin(AZIM),
        target.y + dist * Math.sin(ELEV),
        target.z + dist * Math.cos(ELEV) * Math.cos(AZIM),
      ),
    };
  }

  /** Keep the sun's shadow box tight around the model, so shadows stay crisp. */
  function fitSun() {
    if (!sun.castShadow) return;
    const s = modelRadius() * 1.9;
    const c = sun.shadow.camera;
    c.left = -s;
    c.right = s;
    c.top = s;
    c.bottom = -s;
    c.updateProjectionMatrix();
  }

  function fitFog(dist: number) {
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.near = dist * 1.5;
      scene.fog.far = dist * 4.2;
    }
  }

  function applyExterior(instant: boolean) {
    const { pos, target, dist } = exteriorCamera();
    mode = "exterior";
    currentRoom = null;
    opts.onMode("exterior");
    opts.onRoom(null);
    fitSun();
    fitFog(dist);
    controls.minDistance = dist * 0.45;
    controls.maxDistance = dist * 2.2;
    controls.minPolarAngle = 0.15;
    controls.maxPolarAngle = Math.PI / 2 - 0.06;
    if (instant) {
      camera.position.copy(pos);
      controls.target.copy(target);
      if (built) {
        built.roof.position.y = 0;
        built.roof.visible = true;
      }
      needsRender = true;
    } else {
      startTween(pos, null, target, 0);
    }
  }

  /** Where the camera stands to look at a room, in world space. */
  function roomCamera(room: Room) {
    const v = viewpointFor(plan, room, derived);
    const pos = toWorld(v.x, v.z);
    pos.y = EYE;
    const target = toWorld(v.lookX, v.lookZ);
    target.y = EYE - 0.5;
    return { pos, target };
  }

  /** The doorway between two rooms, so the camera can walk through it. */
  function doorBetween(a: string, b: string) {
    const w = derived.walls.find(
      (x) =>
        x.kind === "int" &&
        x.rooms.includes(a) &&
        x.rooms.includes(b) &&
        x.openings.some((o) => o.kind !== "window"),
    );
    if (!w) return null;
    const o = w.openings.filter((p) => p.kind !== "window")[0];
    const mid = (o.from + o.to) / 2;
    const p = w.axis === "x" ? toWorld(w.pos, mid) : toWorld(mid, w.pos);
    p.y = EYE;
    return p;
  }

  function startTween(
    to: THREE.Vector3,
    via: THREE.Vector3 | null,
    toTarget: THREE.Vector3,
    roofTo: number,
    after?: () => void,
  ) {
    if (opts.reducedMotion) {
      camera.position.copy(to);
      controls.target.copy(toTarget);
      if (built) {
        built.roof.position.y = roofTo;
        built.roof.visible = roofTo < 0.5;
      }
      needsRender = true;
      after?.();
      return;
    }
    tween = {
      t0: performance.now(),
      from: camera.position.clone(),
      via,
      to: to.clone(),
      fromT: controls.target.clone(),
      toT: toTarget.clone(),
      roofFrom: built ? built.roof.position.y : 0,
      roofTo,
      after,
    };
    if (built) built.roof.visible = true;
    needsRender = true;
  }

  function setInteriorLimits() {
    controls.minDistance = 0.4;
    controls.maxDistance = 14;
    controls.minPolarAngle = 0.5;
    controls.maxPolarAngle = Math.PI - 0.55;
  }

  function enter(roomId?: string) {
    const first =
      (roomId ? plan.rooms.find((r) => r.id === roomId) : undefined) ??
      plan.rooms.find((r) => r.id === plan.entry.room) ??
      plan.rooms[0];
    const { pos, target } = roomCamera(first);
    // Approach through the front door rather than through a wall.
    const gate = toWorld(derived.entryPoint.x, derived.entryPoint.z);
    gate.y = EYE;
    mode = "interior";
    currentRoom = first.id;
    setInteriorLimits();
    opts.onMode("interior");
    opts.onRoom(first.id);
    startTween(pos, gate, target, 26, () => {
      if (built) built.roof.visible = false;
    });
  }

  function goToRoom(roomId: string) {
    const room = plan.rooms.find((r) => r.id === roomId);
    if (!room) return;
    if (mode === "exterior") {
      enter(roomId);
      return;
    }
    const { pos, target } = roomCamera(room);
    const via = currentRoom ? doorBetween(currentRoom, roomId) : null;
    currentRoom = roomId;
    opts.onRoom(roomId);
    startTween(pos, via, target, 26);
  }

  function exit() {
    const { pos, target, dist } = exteriorCamera();
    mode = "exterior";
    currentRoom = null;
    opts.onMode("exterior");
    opts.onRoom(null);
    fitFog(dist);
    controls.minDistance = dist * 0.45;
    controls.maxDistance = dist * 2.2;
    controls.minPolarAngle = 0.15;
    controls.maxPolarAngle = Math.PI / 2 - 0.06;
    if (built) built.roof.visible = true;
    startTween(pos, null, target, 0);
  }

  // ---- doorway markers ----------------------------------------------
  const markers = new Map<string, HTMLButtonElement>();

  function syncMarkers() {
    const wanted = new Map<string, THREE.Vector3>();
    if (mode === "interior" && currentRoom) {
      for (const w of derived.walls) {
        if (w.kind !== "int" || !w.rooms.includes(currentRoom)) continue;
        const o = w.openings.filter((p) => p.kind !== "window")[0];
        if (!o) continue;
        const other = w.rooms.find((r) => r !== currentRoom);
        if (!other) continue;
        const room = plan.rooms.find((r) => r.id === other);
        if (!room) continue;
        const mid = (o.from + o.to) / 2;
        const p = w.axis === "x" ? toWorld(w.pos, mid) : toWorld(mid, w.pos);
        p.y = 3.4;
        wanted.set(other, p);
      }
    }

    for (const [id, el] of markers) {
      if (!wanted.has(id)) {
        el.remove();
        markers.delete(id);
      }
    }

    const fwd = new THREE.Vector3();
    camera.getWorldDirection(fwd);
    const v = new THREE.Vector3();

    for (const [id, world] of wanted) {
      let el = markers.get(id);
      if (!el) {
        const room = plan.rooms.find((r) => r.id === id)!;
        el = document.createElement("button");
        el.type = "button";
        el.className = "v2-hot";
        el.innerHTML = `<span class="v2-hot__dot" aria-hidden="true"></span><span class="v2-hot__label">${room.name}</span>`;
        el.addEventListener("click", () => goToRoom(id));
        opts.overlay.appendChild(el);
        markers.set(id, el);
      }
      v.copy(world);
      const behind = v.clone().sub(camera.position).dot(fwd) <= 0;
      v.project(camera);
      const inFrame = Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1;
      if (behind || !inFrame) {
        el.style.opacity = "0";
        el.style.pointerEvents = "none";
        continue;
      }
      el.style.opacity = "1";
      el.style.pointerEvents = "auto";
      el.style.left = `${((v.x + 1) / 2) * 100}%`;
      el.style.top = `${((1 - v.y) / 2) * 100}%`;
    }
  }

  // ---- loop ---------------------------------------------------------
  controls.addEventListener("change", () => {
    needsRender = true;
  });

  function frame() {
    raf = requestAnimationFrame(frame);
    if (!running) return;

    if (tween) {
      const t = Math.min(1, (performance.now() - tween.t0) / TWEEN_MS);
      const e = ease(t);
      if (tween.via) {
        // Two legs, so the camera passes through the doorway.
        if (e < 0.5) camera.position.lerpVectors(tween.from, tween.via, e * 2);
        else camera.position.lerpVectors(tween.via, tween.to, (e - 0.5) * 2);
      } else {
        camera.position.lerpVectors(tween.from, tween.to, e);
      }
      controls.target.lerpVectors(tween.fromT, tween.toT, e);
      if (built) built.roof.position.y = tween.roofFrom + (tween.roofTo - tween.roofFrom) * e;
      needsRender = true;
      if (t >= 1) {
        const after = tween.after;
        tween = null;
        after?.();
      }
    }

    const damped = controls.enableDamping && controls.update();
    if (needsRender || damped || tween) {
      renderer.render(scene, camera);
      syncMarkers();
      needsRender = false;
    }
  }

  // ---- lifecycle ----------------------------------------------------
  const ro = new ResizeObserver(() => {
    const w = host.clientWidth;
    const h = Math.max(host.clientHeight, 1);
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    needsRender = true;
  });
  ro.observe(host);

  const io = new IntersectionObserver(([e]) => {
    running = e.isIntersecting;
    if (running) needsRender = true;
  });
  io.observe(host);

  rebuild();
  applyExterior(true);
  frame();
  opts.onReady();

  return {
    setPlan(planId) {
      const next = getPlan(planId);
      if (!next || next.id === plan.id) return;
      plan = next;
      rebuild();
      applyExterior(true);
    },
    enter,
    exit,
    goToRoom,
    resetView: () => applyExterior(false),
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      controls.dispose();
      for (const el of markers.values()) el.remove();
      markers.clear();
      if (built) {
        scene.remove(built.shell, built.roof);
        built.dispose();
      }
      ground.geometry.dispose();
      (ground.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
