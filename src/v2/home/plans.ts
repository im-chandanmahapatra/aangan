/**
 * Home configurations — the single source of truth.
 *
 * Every layout below is authored as a set of rectangular rooms that tile a
 * footprint, measured in FEET. Both the interactive 3D model and the 2D
 * floor plan are generated from this same data (see `walls.ts`), so the two
 * can never drift apart: if a room moves here, it moves in both.
 *
 * HONESTY NOTE — these four configurations are DEMONSTRATION layouts drawn
 * by the studio to show how a home of each size is organised. They are not
 * built homes, not a released project, and carry no price, availability or
 * approval. Every surface that renders them says so.
 *
 * Axes: x runs east (plan width), z runs north (plan depth), y is up.
 * The entrance side is z = 0 (shown at the bottom of the plan).
 */

export type RoomType =
  | "living"
  | "dining"
  | "kitchen"
  | "bed"
  | "bath"
  | "utility"
  | "wardrobe"
  | "study"
  | "lobby"
  | "balcony"
  | "court"
  | "verandah";

/**
 * Rooms that are outside the enclosed envelope. They are excluded from
 * carpet area and bounded by a parapet (or, for a verandah, by columns).
 */
export const OPEN_TO_SKY: RoomType[] = ["balcony", "court", "verandah"];

/**
 * A verandah is open-sided but still roofed; a court and a balcony are not.
 * This is what decides where the roof slab is cut.
 */
export const hasRoof = (type: RoomType) => type !== "court" && type !== "balcony";

export type Room = {
  id: string;
  name: string;
  type: RoomType;
  /** Footprint in feet, x0 < x1 and z0 < z1. */
  x0: number;
  z0: number;
  x1: number;
  z1: number;
  /** Which interior photograph represents this kind of room. */
  photo?: "living" | "dining" | "kitchen" | "bedroom" | "bath" | "courtyard";
  /** One line shown when the visitor is standing in the room. */
  note?: string;
};

export type ConnectionKind = "door" | "wide" | "slider";

export type Connection = {
  a: string;
  b: string;
  kind: ConnectionKind;
  /** Opening width in feet. Defaults by kind if omitted. */
  width?: number;
  /**
   * Position along the shared edge, 0–1. Defaults to centre. Useful when a
   * centred door would land behind furniture or clash with a corner.
   */
  at?: number;
};

export type Entry = {
  room: string;
  side: "S" | "N" | "E" | "W";
  /** Distance in feet along that side, measured from the room's low corner. */
  at: number;
  width: number;
};

export type HomePlan = {
  id: string;
  /** "1 BHK", "1.5 BHK", … */
  config: string;
  name: string;
  tagline: string;
  /** Floor-to-ceiling height in feet. */
  ceiling: number;
  rooms: Room[];
  connections: Connection[];
  entry: Entry;
  /** What makes this layout different from the others. */
  idea: string[];
};

export const DOOR_H = 7;
export const WINDOW_SILL = 2.5;
export const WINDOW_HEAD = 7.5;
export const WALL_EXT = 0.75;
export const WALL_INT = 0.4;
export const PARAPET_H = 3.5;

const DEFAULT_WIDTH: Record<ConnectionKind, number> = { door: 3, wide: 6, slider: 7 };
export const connectionWidth = (c: Connection) => c.width ?? DEFAULT_WIDTH[c.kind];

/* ------------------------------------------------------------------ */
/* 1 BHK — a compact single-aspect plan                                */
/* ------------------------------------------------------------------ */
const nook: HomePlan = {
  id: "nook",
  config: "1 BHK",
  name: "The Nook",
  tagline: "One room to live in, one to sleep in, and a deck to sit out on.",
  ceiling: 10,
  idea: [
    "Living and kitchen share one volume, divided only by a counter",
    "The bedroom takes the quiet north end, away from the entrance",
    "A deck the full width of the bedroom, deep enough for two chairs",
  ],
  rooms: [
    {
      id: "living",
      name: "Living & Dining",
      type: "living",
      x0: 0,
      z0: 0,
      x1: 15,
      z1: 15,
      photo: "living",
      note: "The entrance opens along the short wall so the room is not a corridor.",
    },
    {
      id: "kitchen",
      name: "Kitchen",
      type: "kitchen",
      x0: 15,
      z0: 0,
      x1: 26,
      z1: 9,
      photo: "kitchen",
      note: "An L of counter with the window over the sink.",
    },
    {
      id: "bath",
      name: "Bathroom",
      type: "bath",
      x0: 15,
      z0: 9,
      x1: 22,
      z1: 15,
      photo: "bath",
    },
    {
      id: "utility",
      name: "Utility",
      type: "utility",
      x0: 22,
      z0: 9,
      x1: 26,
      z1: 15,
    },
    {
      id: "bed1",
      name: "Bedroom",
      type: "bed",
      x0: 0,
      z0: 15,
      x1: 15,
      z1: 24,
      photo: "bedroom",
      note: "Bed against the solid west wall; the long window faces the deck.",
    },
    {
      id: "deck",
      name: "Deck",
      type: "balcony",
      x0: 15,
      z0: 15,
      x1: 26,
      z1: 24,
      photo: "courtyard",
      note: "Open to the sky, with a parapet at sitting height.",
    },
  ],
  connections: [
    { a: "living", b: "kitchen", kind: "wide", width: 7 },
    { a: "living", b: "bath", kind: "door", width: 2.6 },
    { a: "living", b: "bed1", kind: "door" },
    { a: "bed1", b: "deck", kind: "slider", width: 6 },
    { a: "kitchen", b: "utility", kind: "door", width: 2.4 },
  ],
  entry: { room: "living", side: "S", at: 4, width: 3.5 },
};

/* ------------------------------------------------------------------ */
/* 1.5 BHK — the half is a real room, not a widened passage            */
/* ------------------------------------------------------------------ */
const study: HomePlan = {
  id: "study",
  config: "1.5 BHK",
  name: "The Study",
  tagline: "A one-bedroom plan with a second room that can be worked in or slept in.",
  ceiling: 10,
  idea: [
    "The half room is a full 13 × 8 — a desk, a daybed and a door that shuts",
    "Kitchen and study both face east, so the morning side is the working side",
    "Bath and utility are grouped on one wet wall at the back",
  ],
  rooms: [
    {
      id: "living",
      name: "Living & Dining",
      type: "living",
      x0: 0,
      z0: 0,
      x1: 17,
      z1: 16,
      photo: "living",
      note: "Square enough to hold a dining table and a sofa without either crowding.",
    },
    {
      id: "kitchen",
      name: "Kitchen",
      type: "kitchen",
      x0: 17,
      z0: 0,
      x1: 30,
      z1: 10,
      photo: "kitchen",
    },
    {
      id: "study",
      name: "Study",
      type: "study",
      x0: 17,
      z0: 10,
      x1: 30,
      z1: 18,
      photo: "bedroom",
      note: "The half room — a door, a window and enough wall for shelves.",
    },
    {
      id: "bath",
      name: "Bathroom",
      type: "bath",
      x0: 17,
      z0: 18,
      x1: 24,
      z1: 26,
      photo: "bath",
    },
    {
      id: "utility",
      name: "Utility",
      type: "utility",
      x0: 24,
      z0: 18,
      x1: 30,
      z1: 26,
    },
    {
      id: "bed1",
      name: "Bedroom",
      type: "bed",
      x0: 0,
      z0: 16,
      x1: 17,
      z1: 26,
      photo: "bedroom",
      note: "Cross-ventilated: windows on the west and the north.",
    },
  ],
  connections: [
    { a: "living", b: "kitchen", kind: "wide", width: 7 },
    { a: "living", b: "study", kind: "door" },
    { a: "living", b: "bed1", kind: "door" },
    { a: "bed1", b: "bath", kind: "door", width: 2.6 },
    { a: "study", b: "utility", kind: "door", width: 2.4 },
    { a: "bath", b: "utility", kind: "door", width: 2.2 },
  ],
  entry: { room: "living", side: "S", at: 4, width: 3.5 },
};

/* ------------------------------------------------------------------ */
/* 2 BHK — built around a small light court                            */
/* ------------------------------------------------------------------ */
const court: HomePlan = {
  id: "court",
  config: "2 BHK",
  name: "The Court",
  tagline: "Two bedrooms held apart by a court that brings light into the middle.",
  ceiling: 10.5,
  idea: [
    "An 8 × 7 court open to the sky stops the plan going dark in the centre",
    "The two bedrooms sit at opposite ends — nobody shares a bedroom wall",
    "Dining looks into the court, so the table always has daylight",
  ],
  rooms: [
    {
      id: "living",
      name: "Living",
      type: "living",
      x0: 0,
      z0: 0,
      x1: 18,
      z1: 17,
      photo: "living",
    },
    {
      id: "kitchen",
      name: "Kitchen",
      type: "kitchen",
      x0: 18,
      z0: 0,
      x1: 34,
      z1: 10,
      photo: "kitchen",
    },
    {
      id: "dining",
      name: "Dining",
      type: "dining",
      x0: 18,
      z0: 10,
      x1: 34,
      z1: 17,
      photo: "dining",
      note: "Between the kitchen and the court — the shortest trip from pan to plate.",
    },
    {
      id: "bed1",
      name: "Main Bedroom",
      type: "bed",
      x0: 0,
      z0: 17,
      x1: 13,
      z1: 27,
      photo: "bedroom",
    },
    {
      id: "bath1",
      name: "Main Bath",
      type: "bath",
      x0: 0,
      z0: 27,
      x1: 8,
      z1: 34,
      photo: "bath",
    },
    {
      id: "wardrobe",
      name: "Wardrobe",
      type: "wardrobe",
      x0: 8,
      z0: 27,
      x1: 13,
      z1: 34,
    },
    {
      id: "court",
      name: "Light Court",
      type: "court",
      x0: 13,
      z0: 17,
      x1: 21,
      z1: 22,
      photo: "courtyard",
      note: "Open to the sky. Rain falls into it and the whole plan hears it.",
    },
    {
      id: "bath2",
      name: "Second Bath",
      type: "bath",
      x0: 13,
      z0: 22,
      x1: 21,
      z1: 28,
      photo: "bath",
    },
    {
      id: "utility",
      name: "Utility",
      type: "utility",
      x0: 13,
      z0: 28,
      x1: 21,
      z1: 34,
    },
    {
      id: "bed2",
      name: "Second Bedroom",
      type: "bed",
      x0: 21,
      z0: 17,
      x1: 34,
      z1: 27,
      photo: "bedroom",
    },
    {
      id: "balcony",
      name: "Balcony",
      type: "balcony",
      x0: 21,
      z0: 27,
      x1: 34,
      z1: 34,
      photo: "courtyard",
    },
  ],
  connections: [
    { a: "living", b: "kitchen", kind: "wide", width: 6 },
    { a: "living", b: "dining", kind: "wide", width: 5 },
    { a: "kitchen", b: "dining", kind: "wide", width: 8 },
    { a: "living", b: "court", kind: "wide", width: 3.5 },
    { a: "living", b: "bed1", kind: "door" },
    { a: "bed1", b: "bath1", kind: "door", width: 2.6 },
    { a: "bed1", b: "wardrobe", kind: "door", width: 2.6 },
    { a: "dining", b: "bed2", kind: "door" },
    { a: "bed2", b: "bath2", kind: "door", width: 2.6 },
    { a: "bed2", b: "balcony", kind: "slider", width: 7 },
    { a: "bath2", b: "utility", kind: "door", width: 2.2 },
  ],
  entry: { room: "living", side: "S", at: 4.5, width: 3.5 },
};

/* ------------------------------------------------------------------ */
/* 3 BHK — an L around a deep verandah                                 */
/* ------------------------------------------------------------------ */
const verandah: HomePlan = {
  id: "verandah",
  config: "3 BHK",
  name: "The Verandah",
  tagline: "An L-plan that puts eight feet of shade between the sun and every room.",
  ceiling: 11,
  idea: [
    "A verandah 30 feet long and 8 feet deep — the house is entered through shade",
    "The bedroom wing turns east off its own lobby, so no bedroom is reached through another room",
    "The L leaves an open corner of garden that the verandah looks straight into",
  ],
  rooms: [
    {
      id: "verandah",
      name: "Verandah",
      type: "verandah",
      x0: 0,
      z0: 0,
      x1: 30,
      z1: 8,
      photo: "courtyard",
      note: "Columns on the open side; the floor runs out to meet the garden.",
    },
    {
      id: "living",
      name: "Living",
      type: "living",
      x0: 0,
      z0: 8,
      x1: 18,
      z1: 24,
      photo: "living",
      note: "Opens the full width onto the verandah.",
    },
    {
      id: "dining",
      name: "Dining",
      type: "dining",
      x0: 18,
      z0: 8,
      x1: 30,
      z1: 16,
      photo: "dining",
    },
    {
      id: "kitchen",
      name: "Kitchen",
      type: "kitchen",
      x0: 18,
      z0: 16,
      x1: 30,
      z1: 24,
      photo: "kitchen",
    },
    {
      id: "bed1",
      name: "Main Bedroom",
      type: "bed",
      x0: 0,
      z0: 24,
      x1: 14,
      z1: 36,
      photo: "bedroom",
      note: "The far corner of the plan — two external walls, no circulation past it.",
    },
    {
      id: "bath1",
      name: "Main Bath",
      type: "bath",
      x0: 14,
      z0: 24,
      x1: 22,
      z1: 31,
      photo: "bath",
    },
    {
      id: "wardrobe",
      name: "Wardrobe",
      type: "wardrobe",
      x0: 14,
      z0: 31,
      x1: 22,
      z1: 36,
    },
    {
      id: "utility",
      name: "Utility",
      type: "utility",
      x0: 22,
      z0: 24,
      x1: 30,
      z1: 31,
    },
    {
      id: "store",
      name: "Store",
      type: "utility",
      x0: 22,
      z0: 31,
      x1: 30,
      z1: 36,
    },
    {
      id: "lobby",
      name: "Bedroom Lobby",
      type: "lobby",
      x0: 30,
      z0: 8,
      x1: 36,
      z1: 28,
      note: "The spine of the bedroom wing — every bedroom door opens off it.",
    },
    {
      id: "bath2",
      name: "Shared Bath",
      type: "bath",
      x0: 30,
      z0: 28,
      x1: 36,
      z1: 36,
      photo: "bath",
    },
    {
      id: "bed2",
      name: "Second Bedroom",
      type: "bed",
      x0: 36,
      z0: 8,
      x1: 44,
      z1: 22,
      photo: "bedroom",
    },
    {
      id: "bed3",
      name: "Third Bedroom",
      type: "bed",
      x0: 36,
      z0: 22,
      x1: 44,
      z1: 36,
      photo: "bedroom",
    },
  ],
  connections: [
    { a: "verandah", b: "living", kind: "wide", width: 10 },
    { a: "verandah", b: "dining", kind: "wide", width: 5 },
    { a: "living", b: "dining", kind: "wide", width: 6 },
    { a: "dining", b: "kitchen", kind: "wide", width: 5 },
    { a: "living", b: "bed1", kind: "door" },
    { a: "bed1", b: "bath1", kind: "door", width: 2.6 },
    { a: "bed1", b: "wardrobe", kind: "door", width: 2.6 },
    { a: "kitchen", b: "utility", kind: "door", width: 2.6 },
    { a: "utility", b: "store", kind: "door", width: 2.4 },
    { a: "dining", b: "lobby", kind: "door" },
    { a: "lobby", b: "bed2", kind: "door" },
    { a: "lobby", b: "bed3", kind: "door" },
    { a: "lobby", b: "bath2", kind: "door", width: 2.6 },
  ],
  entry: { room: "verandah", side: "S", at: 9, width: 4 },
};

export const homePlans: HomePlan[] = [nook, study, court, verandah];

export const getPlan = (id: string) => homePlans.find((p) => p.id === id);

/** Carpet area, excluding anything open to the sky. */
export function carpetArea(plan: HomePlan) {
  return plan.rooms
    .filter((r) => !OPEN_TO_SKY.includes(r.type))
    .reduce((n, r) => n + (r.x1 - r.x0) * (r.z1 - r.z0), 0);
}

/** Area of decks, courts and verandahs — reported separately, never merged in. */
export function openArea(plan: HomePlan) {
  return plan.rooms
    .filter((r) => OPEN_TO_SKY.includes(r.type))
    .reduce((n, r) => n + (r.x1 - r.x0) * (r.z1 - r.z0), 0);
}

export const roomArea = (r: Room) => (r.x1 - r.x0) * (r.z1 - r.z0);
export const roomSize = (r: Room) => `${r.x1 - r.x0} × ${r.z1 - r.z0} ft`;

/** Bounding box of the whole plan. */
export function planBounds(plan: HomePlan) {
  const xs = plan.rooms.flatMap((r) => [r.x0, r.x1]);
  const zs = plan.rooms.flatMap((r) => [r.z0, r.z1]);
  return {
    x0: Math.min(...xs),
    x1: Math.max(...xs),
    z0: Math.min(...zs),
    z1: Math.max(...zs),
  };
}

/** Rooms a visitor can stand in, in a sensible order for the room list. */
const TOUR_ORDER: RoomType[] = [
  "verandah",
  "living",
  "dining",
  "kitchen",
  "court",
  "bed",
  "study",
  "bath",
  "balcony",
];

const NOT_ON_TOUR: RoomType[] = ["utility", "wardrobe", "lobby"];

export function tourRooms(plan: HomePlan) {
  return plan.rooms
    .filter((r) => !NOT_ON_TOUR.includes(r.type))
    .slice()
    .sort((a, b) => {
      const d = TOUR_ORDER.indexOf(a.type) - TOUR_ORDER.indexOf(b.type);
      return d !== 0 ? d : a.z0 - b.z0;
    });
}
