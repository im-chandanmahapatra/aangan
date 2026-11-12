/**
 * Turns a derived plan into Three.js geometry: plinth, floors, walls with
 * real door and window openings, columns, furniture, and a roof that can
 * be lifted away for the exterior view.
 *
 * Every box is merged into one geometry per material, so a whole house is
 * a handful of draw calls rather than several hundred.
 *
 * One unit = one foot, matching `plans.ts`, so nothing has to be scaled
 * and the dimensions shown in the interface are the dimensions built.
 */
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  hasRoof,
  PARAPET_H,
  WALL_EXT,
  WALL_INT,
  type HomePlan,
  type Room,
  type RoomType,
} from "./plans";
import type { DerivedPlan, Wall } from "./walls";

export type MatKey =
  | "plasterExt"
  | "plasterInt"
  | "floorWood"
  | "floorStone"
  | "floorWet"
  | "floorOpen"
  | "roof"
  | "plinth"
  | "door"
  | "timber"
  | "upholstery"
  | "stoneTop"
  | "metal"
  | "ceramic"
  | "greenery"
  | "soil";

type Bucket = Map<MatKey, THREE.BufferGeometry[]>;

const push = (b: Bucket, key: MatKey, g: THREE.BufferGeometry) => {
  const list = b.get(key);
  if (list) list.push(g);
  else b.set(key, [g]);
};

/** Axis-aligned box given its centre and size, in feet. */
function box(
  b: Bucket,
  key: MatKey,
  cx: number,
  cy: number,
  cz: number,
  w: number,
  h: number,
  d: number,
) {
  if (w <= 0.001 || h <= 0.001 || d <= 0.001) return;
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(cx, cy, cz);
  push(b, key, g);
}

/** Box given its min/max on each axis — easier when working from a plan. */
function span(
  b: Bucket,
  key: MatKey,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  z0: number,
  z1: number,
) {
  box(b, key, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, x1 - x0, y1 - y0, z1 - z0);
}

const FLOOR_MAT: Record<RoomType, MatKey> = {
  living: "floorWood",
  dining: "floorWood",
  bed: "floorWood",
  study: "floorWood",
  lobby: "floorStone",
  kitchen: "floorStone",
  bath: "floorWet",
  utility: "floorWet",
  wardrobe: "floorWood",
  balcony: "floorOpen",
  court: "floorOpen",
  verandah: "floorOpen",
};

export const materials = (): Record<MatKey, THREE.Material> => {
  const std = (color: number, roughness = 0.92, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });
  return {
    plasterExt: std(0xe4dac6),
    plasterInt: std(0xf2ece1, 0.95),
    floorWood: std(0x8a6038, 0.72),
    floorStone: std(0xcabfab),
    floorWet: std(0xb3ab9c),
    floorOpen: std(0x9d917c),
    roof: std(0x6b6054),
    plinth: std(0x7b7164),
    door: std(0x4a3a2c, 0.65),
    timber: std(0x6b4a30, 0.7),
    upholstery: std(0x8d8878, 0.98),
    stoneTop: std(0x5d574c, 0.5),
    metal: new THREE.MeshStandardMaterial({ color: 0xb8955a, roughness: 0.35, metalness: 0.75 }),
    ceramic: std(0xf4f1ea, 0.3),
    greenery: std(0x4f6b3c, 0.95),
    soil: std(0x5a4433),
  };
};

/**
 * A door leaf, hinged on the jamb at `from` and swung open by `swing`
 * radians. Built as a box whose hinge edge is moved to the origin, turned,
 * then set down on the wall line.
 */
function addDoorLeaf(
  b: Bucket,
  axis: "x" | "z",
  pos: number,
  from: number,
  width: number,
  height: number,
  swing: number,
) {
  const t = 0.16;
  const g =
    axis === "x" ? new THREE.BoxGeometry(t, height, width) : new THREE.BoxGeometry(width, height, t);
  // Move the hinge edge to the origin, turn about it, then place it.
  if (axis === "x") g.translate(0, height / 2, width / 2);
  else g.translate(width / 2, height / 2, 0);
  g.rotateY(axis === "x" ? swing : -swing);
  if (axis === "x") g.translate(pos, 0, from);
  else g.translate(from, 0, pos);
  push(b, "door", g);
}

/* ------------------------------------------------------------------ */
/* Walls                                                               */
/* ------------------------------------------------------------------ */

/**
 * A wall is built as the pieces left over once its openings are removed:
 * the solid runs between them, plus the lintel above each and the sill
 * below each window. No CSG — just boxes that stop where a hole starts.
 */
function addWall(b: Bucket, w: Wall, ceiling: number) {
  if (w.style === "open") return;
  const height = w.style === "parapet" ? PARAPET_H : ceiling;
  const t = w.kind === "ext" ? WALL_EXT : WALL_INT;
  const key: MatKey = w.kind === "ext" ? "plasterExt" : "plasterInt";

  // Put the wall on the gridline, straddling it.
  const lo = w.pos - t / 2;
  const hi = w.pos + t / 2;

  // A parapet is below every opening head, so openings do not apply.
  const openings =
    w.style === "parapet" ? w.openings.filter((o) => o.kind !== "window") : w.openings;

  const emit = (from: number, to: number, y0: number, y1: number) => {
    if (to - from <= 0.001 || y1 - y0 <= 0.001) return;
    if (w.axis === "x") span(b, key, lo, hi, y0, y1, from, to);
    else span(b, key, from, to, y0, y1, lo, hi);
  };

  let cursor = w.from;
  for (const o of openings) {
    const oFrom = Math.max(w.from, o.from);
    const oTo = Math.min(w.to, o.to);
    if (oTo <= oFrom) continue;
    emit(cursor, oFrom, 0, height); // solid run before the opening
    emit(oFrom, oTo, 0, Math.min(o.bottom, height)); // sill under a window
    emit(oFrom, oTo, Math.min(o.top, height), height); // lintel over it
    cursor = Math.max(cursor, oTo);
  }
  emit(cursor, w.to, 0, height);

  // Glass in the window openings, and a leaf in the doors.
  if (w.style === "parapet") return;
  for (const o of w.openings) {
    const mid = (o.from + o.to) / 2;
    const width = o.to - o.from;
    if (o.kind === "window") {
      if (w.axis === "x") box(b, "ceramic", w.pos, (o.bottom + o.top) / 2, mid, 0.08, o.top - o.bottom, width);
      else box(b, "ceramic", mid, (o.bottom + o.top) / 2, w.pos, width, o.top - o.bottom, 0.08);
      // A slim frame reads better than a bare sheet of glass.
      const fr = 0.18;
      if (w.axis === "x") {
        box(b, "timber", w.pos, o.bottom + fr / 2, mid, 0.22, fr, width);
        box(b, "timber", w.pos, o.top - fr / 2, mid, 0.22, fr, width);
      } else {
        box(b, "timber", mid, o.bottom + fr / 2, w.pos, width, fr, 0.22);
        box(b, "timber", mid, o.top - fr / 2, w.pos, width, fr, 0.22);
      }
    } else if (o.kind === "door" || o.kind === "entry") {
      // A real leaf, hinged at one jamb and standing open — so a doorway
      // reads as a door rather than as a hole.
      addDoorLeaf(b, w.axis, w.pos, o.from, width, o.top - 0.12, 1.02);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Furniture                                                           */
/* ------------------------------------------------------------------ */

type Side = "N" | "S" | "E" | "W";

/** The longest wall of a room with no door in it — where furniture goes. */
function freeWall(room: Room, derived: DerivedPlan): Side {
  const sides: Array<{ side: Side; axis: "x" | "z"; pos: number; run: number }> = [
    { side: "W", axis: "x", pos: room.x0, run: room.z1 - room.z0 },
    { side: "E", axis: "x", pos: room.x1, run: room.z1 - room.z0 },
    { side: "S", axis: "z", pos: room.z0, run: room.x1 - room.x0 },
    { side: "N", axis: "z", pos: room.z1, run: room.x1 - room.x0 },
  ];
  let best = sides[0];
  let bestScore = -Infinity;
  for (const s of sides) {
    const doors = derived.walls
      .filter(
        (w) =>
          w.axis === s.axis &&
          Math.abs(w.pos - s.pos) < 1e-6 &&
          w.rooms.includes(room.id),
      )
      .reduce((n, w) => n + w.openings.filter((o) => o.kind !== "window").length, 0);
    const score = s.run - doors * 100;
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  }
  return best.side;
}

/** Place a footprint against one wall of a room, `depth` deep, centred. */
function against(room: Room, side: Side, depth: number, width: number, inset = 0.5) {
  const cx = (room.x0 + room.x1) / 2;
  const cz = (room.z0 + room.z1) / 2;
  switch (side) {
    case "W":
      return { x0: room.x0 + inset, x1: room.x0 + inset + depth, z0: cz - width / 2, z1: cz + width / 2 };
    case "E":
      return { x0: room.x1 - inset - depth, x1: room.x1 - inset, z0: cz - width / 2, z1: cz + width / 2 };
    case "S":
      return { x0: cx - width / 2, x1: cx + width / 2, z0: room.z0 + inset, z1: room.z0 + inset + depth };
    default:
      return { x0: cx - width / 2, x1: cx + width / 2, z0: room.z1 - inset - depth, z1: room.z1 - inset };
  }
}

function addFurniture(b: Bucket, room: Room, derived: DerivedPlan, ceiling: number) {
  const w = room.x1 - room.x0;
  const d = room.z1 - room.z0;
  const cx = (room.x0 + room.x1) / 2;
  const cz = (room.z0 + room.z1) / 2;
  const wall = freeWall(room, derived);
  const horizontal = wall === "N" || wall === "S";

  switch (room.type) {
    case "bed": {
      const bed = against(room, wall, 6.6, 5, 0.9);
      span(b, "timber", bed.x0, bed.x1, 0.3, 0.85, bed.z0, bed.z1); // base
      span(b, "ceramic", bed.x0 + 0.15, bed.x1 - 0.15, 0.85, 1.35, bed.z0 + 0.15, bed.z1 - 0.15); // bedding
      // Headboard on the wall side.
      const hb = 0.3;
      if (wall === "N") span(b, "timber", bed.x0, bed.x1, 0.3, 3.2, bed.z1 - hb, bed.z1);
      if (wall === "S") span(b, "timber", bed.x0, bed.x1, 0.3, 3.2, bed.z0, bed.z0 + hb);
      if (wall === "E") span(b, "timber", bed.x1 - hb, bed.x1, 0.3, 3.2, bed.z0, bed.z1);
      if (wall === "W") span(b, "timber", bed.x0, bed.x0 + hb, 0.3, 3.2, bed.z0, bed.z1);
      // Side tables, one each end of the headboard.
      for (const s of [-1, 1]) {
        if (horizontal) {
          const x = s < 0 ? bed.x0 - 1.9 : bed.x1 + 0.3;
          if (x > room.x0 + 0.4 && x + 1.6 < room.x1 - 0.4)
            span(b, "timber", x, x + 1.6, 0.3, 1.9, wall === "N" ? bed.z1 - 1.6 : bed.z0, wall === "N" ? bed.z1 : bed.z0 + 1.6);
        } else {
          const z = s < 0 ? bed.z0 - 1.9 : bed.z1 + 0.3;
          if (z > room.z0 + 0.4 && z + 1.6 < room.z1 - 0.4)
            span(b, "timber", wall === "E" ? bed.x1 - 1.6 : bed.x0, wall === "E" ? bed.x1 : bed.x0 + 1.6, 0.3, 1.9, z, z + 1.6);
        }
      }
      break;
    }
    case "living": {
      const sofa = against(room, wall, 3, Math.min(8, (horizontal ? w : d) - 4), 1.2);
      span(b, "upholstery", sofa.x0, sofa.x1, 0.4, 1.4, sofa.z0, sofa.z1);
      // Back against the wall.
      if (wall === "N") span(b, "upholstery", sofa.x0, sofa.x1, 0.4, 2.5, sofa.z1 - 0.6, sofa.z1);
      if (wall === "S") span(b, "upholstery", sofa.x0, sofa.x1, 0.4, 2.5, sofa.z0, sofa.z0 + 0.6);
      if (wall === "E") span(b, "upholstery", sofa.x1 - 0.6, sofa.x1, 0.4, 2.5, sofa.z0, sofa.z1);
      if (wall === "W") span(b, "upholstery", sofa.x0, sofa.x0 + 0.6, 0.4, 2.5, sofa.z0, sofa.z1);
      // Rug and low table, pulled into the room.
      const off = 4.2;
      const tx = wall === "W" ? room.x0 + off : wall === "E" ? room.x1 - off : cx;
      const tz = wall === "S" ? room.z0 + off : wall === "N" ? room.z1 - off : cz;
      box(b, "upholstery", tx, 0.03, tz, Math.min(w - 3, 9), 0.06, Math.min(d - 3, 7));
      box(b, "timber", tx, 0.7, tz, horizontal ? 3.6 : 2, 0.35, horizontal ? 2 : 3.6);
      break;
    }
    case "dining": {
      const long = Math.min(Math.max(w, d) - 4, 7);
      const tw = w > d ? long : 3.2;
      const td = w > d ? 3.2 : long;
      box(b, "timber", cx, 2.2, cz, tw, 0.25, td);
      for (const s of [-1, 1]) {
        const n = Math.max(2, Math.floor(long / 2.2));
        for (let i = 0; i < n; i++) {
          const t = (i + 0.5) / n - 0.5;
          const px = w > d ? cx + t * long : cx + s * 2.4;
          const pz = w > d ? cz + s * 2.4 : cz + t * long;
          box(b, "timber", px, 1.0, pz, 1.4, 0.2, 1.4);
          box(b, "timber", px, 1.8, pz, w > d ? 1.4 : 0.2, 1.6, w > d ? 0.2 : 1.4);
        }
      }
      // Table legs.
      box(b, "timber", cx, 1.1, cz, tw - 1.6, 2.2, td - 1.6);
      break;
    }
    case "kitchen": {
      const run = against(room, wall, 2.2, (horizontal ? w : d) - 1.2, 0.3);
      span(b, "timber", run.x0, run.x1, 0, 2.9, run.z0, run.z1);
      span(b, "stoneTop", run.x0, run.x1, 2.9, 3.05, run.z0, run.z1);
      // Overhead cupboards.
      if (wall === "N") span(b, "timber", run.x0, run.x1, 5, 7, run.z1 - 1.2, run.z1);
      if (wall === "S") span(b, "timber", run.x0, run.x1, 5, 7, run.z0, run.z0 + 1.2);
      if (wall === "E") span(b, "timber", run.x1 - 1.2, run.x1, 5, 7, run.z0, run.z1);
      if (wall === "W") span(b, "timber", run.x0, run.x0 + 1.2, 5, 7, run.z0, run.z1);
      // An island, if the room is wide enough to walk round one.
      if (w > 11 && d > 11) {
        box(b, "timber", cx, 1.45, cz, Math.min(w - 7, 7), 2.9, 3);
        box(b, "stoneTop", cx, 2.97, cz, Math.min(w - 7, 7) + 0.3, 0.15, 3.3);
      }
      break;
    }
    case "bath": {
      const run = against(room, wall, 1.8, Math.min((horizontal ? w : d) - 1.5, 5), 0.4);
      span(b, "stoneTop", run.x0, run.x1, 0, 2.6, run.z0, run.z1); // vanity
      span(b, "ceramic", run.x0 + 0.4, run.x1 - 0.4, 2.6, 2.75, run.z0 + 0.25, run.z1 - 0.25);
      // WC in a corner, and a shower tray in the opposite one.
      box(b, "ceramic", room.x0 + 1.4, 0.75, room.z1 - 1.3, 1.5, 1.5, 2.1);
      span(b, "floorWet", room.x1 - 3.4, room.x1 - 0.4, 0.02, 0.12, room.z1 - 3.4, room.z1 - 0.4);
      break;
    }
    case "study": {
      const desk = against(room, wall, 2.2, Math.min((horizontal ? w : d) - 3, 6), 0.6);
      span(b, "timber", desk.x0, desk.x1, 2.2, 2.4, desk.z0, desk.z1);
      span(b, "timber", desk.x0, desk.x0 + 0.2, 0, 2.2, desk.z0, desk.z1);
      span(b, "timber", desk.x1 - 0.2, desk.x1, 0, 2.2, desk.z0, desk.z1);
      box(b, "upholstery", cx, 1.1, cz, 1.6, 2.2, 1.6);
      break;
    }
    case "wardrobe": {
      const run = against(room, wall, 2, (horizontal ? w : d) - 0.8, 0.2);
      span(b, "timber", run.x0, run.x1, 0, ceiling - 0.6, run.z0, run.z1);
      break;
    }
    case "utility": {
      const run = against(room, wall, 2, Math.min((horizontal ? w : d) - 1, 5), 0.4);
      span(b, "stoneTop", run.x0, run.x1, 0, 2.8, run.z0, run.z1);
      break;
    }
    case "court": {
      // A planted bed with a single small tree.
      box(b, "soil", cx, 0.35, cz, Math.min(w - 2, 5), 0.7, Math.min(d - 2, 4));
      box(b, "timber", cx, 3.2, cz, 0.5, 6, 0.5);
      box(b, "greenery", cx, 7, cz, Math.min(w - 2.5, 5.5), 3.4, Math.min(d - 2.5, 4.5));
      break;
    }
    case "balcony":
    case "verandah": {
      // A pair of chairs and a low table, set to one end.
      const px = room.type === "verandah" ? room.x0 + Math.min(7, w / 3) : cx;
      for (const s of [-1, 1]) {
        const o = room.type === "verandah" ? 0 : s * 2.2;
        box(b, "timber", px + (room.type === "verandah" ? s * 2.2 : 0), 0.9, cz + (room.type === "verandah" ? 0 : o), 1.8, 1.8, 1.8);
      }
      box(b, "timber", px, 0.75, cz, 1.6, 1.5, 1.6);
      break;
    }
    default:
      break;
  }
}

/* ------------------------------------------------------------------ */
/* Assembly                                                            */
/* ------------------------------------------------------------------ */

export type BuiltHome = {
  /** Everything except the roof. */
  shell: THREE.Group;
  /** Separate so it can be lifted away when the visitor steps inside. */
  roof: THREE.Group;
  /** Disposes every geometry and material this build created. */
  dispose: () => void;
};

export function buildHome(plan: HomePlan, derived: DerivedPlan): BuiltHome {
  const b: Bucket = new Map();
  const roofB: Bucket = new Map();
  const ceiling = plan.ceiling;

  const xs = plan.rooms.flatMap((r) => [r.x0, r.x1]);
  const zs = plan.rooms.flatMap((r) => [r.z0, r.z1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);

  // Plinth — the house sits on a base, as a model would.
  const over = 2.5;
  span(b, "plinth", minX - over, maxX + over, -1.4, -0.08, minZ - over, maxZ + over);

  // Floors, one slab per room, coloured by what the room is for.
  for (const r of plan.rooms) {
    span(b, FLOOR_MAT[r.type], r.x0, r.x1, -0.08, 0.02, r.z0, r.z1);
  }

  // Walls.
  for (const w of derived.walls) addWall(b, w, ceiling);

  // Columns where a verandah is open to the garden.
  for (const w of derived.walls) {
    if (w.style !== "open") continue;
    const run = w.to - w.from;
    const bays = Math.max(1, Math.round(run / 8));
    for (let i = 0; i <= bays; i++) {
      const t = w.from + (run * i) / bays;
      // Nudge the end columns inboard so they sit on the slab.
      const p = i === 0 ? t + 0.45 : i === bays ? t - 0.45 : t;
      if (w.axis === "x") box(b, "plasterExt", w.pos, ceiling / 2, p, 0.9, ceiling, 0.9);
      else box(b, "plasterExt", p, ceiling / 2, w.pos, 0.9, ceiling, 0.9);
    }
  }

  // Furniture.
  for (const r of plan.rooms) addFurniture(b, r, derived, ceiling);

  // The roof slab: one plate per covered room, just overlapping its
  // neighbours so they merge into a single surface.
  const roomById = new Map(plan.rooms.map((r) => [r.id, r]));
  for (const r of plan.rooms) {
    if (!hasRoof(r.type)) continue;
    span(roofB, "roof", r.x0 - 0.2, r.x1 + 0.2, ceiling, ceiling + 0.7, r.z0 - 0.2, r.z1 + 0.2);
  }

  // An eave wherever the envelope meets the outside. Working from the
  // derived exterior walls means the overhang follows the real outline —
  // including the inside corner of an L — and never reaches across a
  // court or a balcony.
  const EAVE = 1.4;
  for (const w of derived.walls) {
    if (w.kind !== "ext") continue;
    const room = roomById.get(w.rooms[0]);
    if (!room || !hasRoof(room.type)) continue;
    // `side: "low"` means the room sits below the line, so outdoors is above it.
    const out0 = w.side === "low" ? w.pos : w.pos - EAVE;
    const out1 = w.side === "low" ? w.pos + EAVE : w.pos;
    if (w.axis === "x")
      span(roofB, "roof", out0, out1, ceiling, ceiling + 0.7, w.from - EAVE, w.to + EAVE);
    else span(roofB, "roof", w.from - EAVE, w.to + EAVE, ceiling, ceiling + 0.7, out0, out1);
  }

  const mats = materials();
  const build = (bucket: Bucket) => {
    const group = new THREE.Group();
    const made: THREE.BufferGeometry[] = [];
    for (const [key, list] of bucket) {
      const merged = list.length === 1 ? list[0] : mergeGeometries(list, false);
      if (!merged) continue;
      if (list.length > 1) list.forEach((g) => g.dispose());
      made.push(merged);
      const mesh = new THREE.Mesh(merged, mats[key]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    return { group, made };
  };

  const shellBuilt = build(b);
  const roofBuilt = build(roofB);

  // Centre the model on the origin so orbiting feels balanced.
  const ox = -(minX + maxX) / 2;
  const oz = -(minZ + maxZ) / 2;
  shellBuilt.group.position.set(ox, 0, oz);
  roofBuilt.group.position.set(ox, 0, oz);

  return {
    shell: shellBuilt.group,
    roof: roofBuilt.group,
    dispose: () => {
      [...shellBuilt.made, ...roofBuilt.made].forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
  };
}

/** Plan coordinates → world coordinates for a centred model. */
export function planToWorld(plan: HomePlan) {
  const xs = plan.rooms.flatMap((r) => [r.x0, r.x1]);
  const zs = plan.rooms.flatMap((r) => [r.z0, r.z1]);
  const ox = -(Math.min(...xs) + Math.max(...xs)) / 2;
  const oz = -(Math.min(...zs) + Math.max(...zs)) / 2;
  return (x: number, z: number) => new THREE.Vector3(x + ox, 0, z + oz);
}
