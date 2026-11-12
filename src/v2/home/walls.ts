/**
 * Derives walls, doors and windows from the room rectangles in `plans.ts`.
 *
 * Pure TypeScript — no Three.js — because both the 3D model and the 2D
 * floor plan consume the output. One derivation, two renderings, so the
 * drawing and the model are always the same building.
 *
 * How it works: for every gridline (each distinct x, then each distinct z)
 * we take the rooms on either side. Where two rooms overlap along that
 * line, the overlap is an interior wall and we know both rooms it divides.
 * Whatever is left over faces outdoors and becomes an exterior wall.
 */
import {
  connectionWidth,
  DOOR_H,
  OPEN_TO_SKY,
  WINDOW_HEAD,
  WINDOW_SILL,
  type HomePlan,
  type Room,
  type RoomType,
} from "./plans";

export type OpeningKind = "door" | "wide" | "slider" | "window" | "entry";

export type Opening = {
  /** Position along the wall, in the wall's own run direction. */
  from: number;
  to: number;
  /** Height above the floor, in feet. */
  bottom: number;
  top: number;
  kind: OpeningKind;
};

/** How the wall is built where it meets the outdoors. */
export type WallStyle = "full" | "parapet" | "open";

export type Wall = {
  /**
   * "x" — a wall standing on a constant-x line, running along z.
   * "z" — a wall standing on a constant-z line, running along x.
   */
  axis: "x" | "z";
  /** The constant coordinate the wall stands on. */
  pos: number;
  /** Extent along the run direction. */
  from: number;
  to: number;
  kind: "ext" | "int";
  /** One room for an exterior wall, two for an interior one. */
  rooms: string[];
  /** Exterior walls only: is the room on the low or high side of `pos`? */
  side?: "low" | "high";
  style: WallStyle;
  openings: Opening[];
};

type Span = [number, number];

const EPS = 1e-6;

const overlap = (a: Span, b: Span): Span | null => {
  const lo = Math.max(a[0], b[0]);
  const hi = Math.min(a[1], b[1]);
  return hi - lo > EPS ? [lo, hi] : null;
};

/** `span` with every hole removed, left to right. */
function subtract(span: Span, holes: Span[]): Span[] {
  let out: Span[] = [span];
  for (const h of holes) {
    const next: Span[] = [];
    for (const s of out) {
      if (h[1] <= s[0] + EPS || h[0] >= s[1] - EPS) {
        next.push(s);
        continue;
      }
      if (h[0] > s[0] + EPS) next.push([s[0], h[0]]);
      if (h[1] < s[1] - EPS) next.push([h[1], s[1]]);
    }
    out = next;
  }
  return out.filter((s) => s[1] - s[0] > EPS);
}

const len = (s: Span) => s[1] - s[0];

/** Rooms with no ceiling are bounded by a parapet; a verandah by columns. */
export function wallStyleFor(type: RoomType): WallStyle {
  if (type === "verandah") return "open";
  if (OPEN_TO_SKY.includes(type)) return "parapet";
  return "full";
}

/** Rooms that only ever get a small, high window. */
const SMALL_WINDOW: RoomType[] = ["bath", "utility", "wardrobe"];

/**
 * Walk one axis and emit every wall standing on it.
 *
 * `lo` / `hi` name the coordinate that varies along the wall. For the "x"
 * pass the wall stands at a constant x and runs along z, so a room's span
 * is [z0, z1] and the rooms either side are those whose x1 / x0 touch the
 * line.
 */
function wallsAlong(rooms: Room[], axis: "x" | "z"): Wall[] {
  const posOf = (r: Room, edge: 0 | 1) =>
    axis === "x" ? (edge ? r.x1 : r.x0) : edge ? r.z1 : r.z0;
  const spanOf = (r: Room): Span => (axis === "x" ? [r.z0, r.z1] : [r.x0, r.x1]);

  const lines = Array.from(new Set(rooms.flatMap((r) => [posOf(r, 0), posOf(r, 1)]))).sort(
    (a, b) => a - b,
  );

  const out: Wall[] = [];

  for (const line of lines) {
    // Rooms whose high edge lands on the line sit on its low side, and
    // vice versa.
    const lowSide = rooms.filter((r) => Math.abs(posOf(r, 1) - line) < EPS);
    const highSide = rooms.filter((r) => Math.abs(posOf(r, 0) - line) < EPS);

    // Interior walls: every overlapping pair across the line.
    for (const a of lowSide) {
      const holes: Span[] = [];
      for (const b of highSide) {
        const ov = overlap(spanOf(a), spanOf(b));
        if (!ov) continue;
        holes.push(ov);
        const bothOpen = OPEN_TO_SKY.includes(a.type) && OPEN_TO_SKY.includes(b.type);
        out.push({
          axis,
          pos: line,
          from: ov[0],
          to: ov[1],
          kind: "int",
          rooms: [a.id, b.id],
          style: bothOpen ? "parapet" : "full",
          openings: [],
        });
      }
      // Anything the pairs did not cover faces outdoors.
      for (const s of subtract(spanOf(a), holes)) {
        out.push({
          axis,
          pos: line,
          from: s[0],
          to: s[1],
          kind: "ext",
          rooms: [a.id],
          side: "low",
          style: wallStyleFor(a.type),
          openings: [],
        });
      }
    }

    // The same again for rooms on the high side (interior walls are
    // already recorded, so only the leftovers matter here).
    for (const b of highSide) {
      const holes: Span[] = [];
      for (const a of lowSide) {
        const ov = overlap(spanOf(a), spanOf(b));
        if (ov) holes.push(ov);
      }
      for (const s of subtract(spanOf(b), holes)) {
        out.push({
          axis,
          pos: line,
          from: s[0],
          to: s[1],
          kind: "ext",
          rooms: [b.id],
          side: "high",
          style: wallStyleFor(b.type),
          openings: [],
        });
      }
    }
  }

  return out;
}

/** Place an opening of `width` on a wall, centred unless `at` says otherwise. */
function placeOpening(wall: Wall, width: number, at: number | undefined, kind: OpeningKind) {
  const run = wall.to - wall.from;
  const w = Math.min(width, Math.max(run - 1, 0.8));
  // Keep a hand's width of wall at each end so openings never meet a corner.
  const margin = Math.min(0.5, Math.max(0, (run - w) / 2));
  const lo = wall.from + margin;
  const hi = wall.to - margin - w;
  const centre = at === undefined ? (lo + hi) / 2 : lo + (hi - lo) * at;
  const start = Math.max(lo, Math.min(hi, centre));
  const top = kind === "door" ? DOOR_H : Math.max(DOOR_H, WINDOW_HEAD);
  wall.openings.push({ from: start, to: start + w, bottom: 0, top, kind });
}

export type DerivedPlan = {
  walls: Wall[];
  /** Where the visitor crosses the threshold, in plan coordinates. */
  entryPoint: { x: number; z: number };
  /** The direction they are facing as they step in. */
  entryHeading: { x: number; z: number };
};

export function derivePlan(plan: HomePlan): DerivedPlan {
  const rooms = plan.rooms;
  const walls = [...wallsAlong(rooms, "x"), ...wallsAlong(rooms, "z")];

  // ---- Doors between rooms -----------------------------------------
  for (const c of plan.connections) {
    const candidates = walls.filter(
      (w) =>
        w.kind === "int" &&
        w.style === "full" &&
        ((w.rooms[0] === c.a && w.rooms[1] === c.b) || (w.rooms[0] === c.b && w.rooms[1] === c.a)),
    );
    if (!candidates.length) continue;
    // If two rooms touch along more than one line, use the longest run.
    const wall = candidates.reduce((best, w) =>
      w.to - w.from > best.to - best.from ? w : best,
    );
    placeOpening(wall, connectionWidth(c), c.at, c.kind);
  }

  // Openings onto a deck or court sit in a parapet run — cut them too, so
  // the slider is a real gap rather than a door drawn on a low wall.
  for (const c of plan.connections) {
    const parapets = walls.filter(
      (w) =>
        w.kind === "int" &&
        w.style === "parapet" &&
        ((w.rooms[0] === c.a && w.rooms[1] === c.b) || (w.rooms[0] === c.b && w.rooms[1] === c.a)),
    );
    for (const w of parapets) {
      if (!w.openings.length) placeOpening(w, connectionWidth(c), c.at, c.kind);
    }
  }

  // ---- The front door ----------------------------------------------
  const entryRoom = rooms.find((r) => r.id === plan.entry.room);
  let entryPoint = { x: 0, z: 0 };
  let entryHeading = { x: 0, z: 1 };

  if (entryRoom) {
    const { side, at, width } = plan.entry;
    const onX = side === "E" || side === "W";
    const linePos = side === "W" ? entryRoom.x0 : side === "E" ? entryRoom.x1 : side === "S" ? entryRoom.z0 : entryRoom.z1;
    const runStart = onX ? entryRoom.z0 : entryRoom.x0;

    const wall = walls.find(
      (w) =>
        w.kind === "ext" &&
        w.rooms[0] === entryRoom.id &&
        w.axis === (onX ? "x" : "z") &&
        Math.abs(w.pos - linePos) < EPS &&
        runStart + at >= w.from - EPS &&
        runStart + at <= w.to + EPS,
    );

    if (wall && wall.style === "full") {
      const run = wall.to - wall.from;
      const frac = run > width ? (runStart + at - wall.from) / (run - width) : 0.5;
      placeOpening(wall, width, Math.max(0, Math.min(1, frac)), "entry");
    }

    const along = runStart + at + width / 2;
    entryPoint = onX ? { x: linePos, z: along } : { x: along, z: linePos };
    entryHeading =
      side === "S"
        ? { x: 0, z: 1 }
        : side === "N"
          ? { x: 0, z: -1 }
          : side === "W"
            ? { x: 1, z: 0 }
            : { x: -1, z: 0 };
  }

  // ---- Windows on the remaining outside walls -----------------------
  const byId = new Map(rooms.map((r) => [r.id, r]));
  for (const w of walls) {
    if (w.kind !== "ext" || w.style !== "full") continue;
    const room = byId.get(w.rooms[0]);
    if (!room) continue;

    const taken = w.openings.map((o) => [o.from, o.to] as Span);
    const free = subtract([w.from, w.to], taken).filter((s) => len(s) >= 4);
    if (!free.length) continue;

    const small = SMALL_WINDOW.includes(room.type);
    const sill = small ? 5 : WINDOW_SILL;

    for (const span of free) {
      const run = len(span);
      // A long wall gets two windows rather than one enormous one.
      const count = !small && run >= 17 ? 2 : 1;
      const width = small
        ? Math.min(2.5, run - 2)
        : Math.min(7, Math.max(3, (run - 4) / count));
      if (width < 1.5) continue;
      const gap = (run - count * width) / (count + 1);
      for (let i = 0; i < count; i++) {
        const from = span[0] + gap * (i + 1) + width * i;
        w.openings.push({ from, to: from + width, bottom: sill, top: WINDOW_HEAD, kind: "window" });
      }
    }
  }

  // ---- Windows onto a light court ----------------------------------
  // A court only earns its keep if the rooms around it can see into it.
  for (const w of walls) {
    if (w.kind !== "int" || w.style !== "full" || w.openings.length) continue;
    const touchesCourt = w.rooms.some((id) => byId.get(id)?.type === "court");
    if (!touchesCourt) continue;
    const other = byId.get(w.rooms.find((id) => byId.get(id)?.type !== "court") ?? "");
    if (!other || SMALL_WINDOW.includes(other.type)) continue;
    const run = w.to - w.from;
    if (run < 4) continue;
    const width = Math.min(6, run - 2);
    const from = w.from + (run - width) / 2;
    w.openings.push({ from, to: from + width, bottom: WINDOW_SILL, top: WINDOW_HEAD, kind: "window" });
  }

  for (const w of walls) w.openings.sort((a, b) => a.from - b.from);

  return { walls, entryPoint, entryHeading };
}

/**
 * The built-up runs of a wall — everything that is not a hole. The 3D
 * builder and the drawing both use this, so a door is a gap in both.
 */
export function solidRuns(w: Wall): Span[] {
  return subtract(
    [w.from, w.to],
    w.openings.map((o) => [o.from, o.to] as Span),
  );
}

/** Centre of a room, in plan coordinates. */
export const roomCentre = (r: Room) => ({ x: (r.x0 + r.x1) / 2, z: (r.z0 + r.z1) / 2 });

/**
 * A good place to stand in a room: the centre, pulled back toward the
 * doorway so the camera sees the room rather than the wall it faces.
 */
export function viewpointFor(plan: HomePlan, room: Room, derived: DerivedPlan) {
  const c = roomCentre(room);
  const doors = derived.walls.filter(
    (w) => w.kind === "int" && w.rooms.includes(room.id) && w.openings.some((o) => o.kind !== "window"),
  );
  if (!doors.length) return { x: c.x, z: c.z, lookX: c.x, lookZ: c.z + 1 };

  // Stand a little inside the widest door, looking across the room.
  const d = doors.reduce((best, w) => {
    const a = Math.max(...w.openings.map((o) => o.to - o.from));
    const b = Math.max(...best.openings.map((o) => o.to - o.from));
    return a > b ? w : best;
  });
  const o = d.openings.reduce((m, p) => (p.to - p.from > m.to - m.from ? p : m));
  const mid = (o.from + o.to) / 2;
  const doorPt = d.axis === "x" ? { x: d.pos, z: mid } : { x: mid, z: d.pos };

  const dx = c.x - doorPt.x;
  const dz = c.z - doorPt.z;
  const dist = Math.hypot(dx, dz) || 1;
  // A third of the way in from the door, facing the far side of the room.
  const stand = {
    x: doorPt.x + (dx / dist) * Math.min(dist * 0.45, 7),
    z: doorPt.z + (dz / dist) * Math.min(dist * 0.45, 7),
  };
  return { ...stand, lookX: c.x + dx * 0.6, lookZ: c.z + dz * 0.6 };
}
