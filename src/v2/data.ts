/**
 * V2 data layer.
 *
 * Re-uses the V1 source of truth in `@/data/site` (properties, interiors,
 * process, services, studio) and only adds what V2 needs on top:
 * responsive WebP imagery, approximate locality coordinates, plain-language
 * features derived from the existing descriptions, and a small set of
 * clearly-labelled DEMONSTRATION land plots (the repository has no real
 * land inventory).
 *
 * Honesty rules carried over from V1:
 *  - Prices are placeholders in V1 and are never shown — always "On enquiry".
 *  - All imagery is representational (AI-generated renders from the V1
 *    build), never presented as photography of a specific built house.
 *  - Coordinates are locality-level approximations, not addresses.
 */
import {
  featuredProperties,
  interiorPieces,
  materials as v1Materials,
  processSteps,
  services,
  studio,
  type Material,
  type TimelineEntry,
} from "@/data/site";

import heroSm from "./img/hero-villa-sm.webp";
import heroLg from "./img/hero-villa-lg.webp";
import mumbaiSm from "./img/property-mumbai-sm.webp";
import mumbaiLg from "./img/property-mumbai-lg.webp";
import blrSm from "./img/property-bengaluru-sm.webp";
import blrLg from "./img/property-bengaluru-lg.webp";
import goaSm from "./img/property-goa-sm.webp";
import goaLg from "./img/property-goa-lg.webp";
import delhiSm from "./img/property-delhi-sm.webp";
import delhiLg from "./img/property-delhi-lg.webp";
import sigSm from "./img/signature-residence-sm.webp";
import sigLg from "./img/signature-residence-lg.webp";
import livingSm from "./img/interior-living-sm.webp";
import livingLg from "./img/interior-living-lg.webp";
import bathSm from "./img/interior-bath-sm.webp";
import bathLg from "./img/interior-bath-lg.webp";
import kitchenSm from "./img/interior-kitchen-sm.webp";
import kitchenLg from "./img/interior-kitchen-lg.webp";
import bedroomSm from "./img/interior-bedroom-sm.webp";
import bedroomLg from "./img/interior-bedroom-lg.webp";
import courtyardSm from "./img/interior-courtyard-sm.webp";
import courtyardLg from "./img/interior-courtyard-lg.webp";
import diningSm from "./img/interior-dining-sm.webp";
import diningLg from "./img/interior-dining-lg.webp";
import travSm from "./img/material-travertine-sm.webp";
import travLg from "./img/material-travertine-lg.webp";
import walnutSm from "./img/material-walnut-sm.webp";
import walnutLg from "./img/material-walnut-lg.webp";
import brassSm from "./img/material-brass-sm.webp";
import brassLg from "./img/material-brass-lg.webp";
import monsoonSm from "./img/silent-monsoon-sm.webp";
import monsoonLg from "./img/silent-monsoon-lg.webp";
import bluehourSm from "./img/silent-bluehour-sm.webp";
import bluehourLg from "./img/silent-bluehour-lg.webp";
// Real locality photography — Unsplash License (free, self-hosted, credited).
import sealinkSm from "./img/place/mumbai-sealink-sm.webp";
import sealinkLg from "./img/place/mumbai-sealink-lg.webp";
import blrLakeSm from "./img/place/bengaluru-lake-sm.webp";
import blrLakeLg from "./img/place/bengaluru-lake-lg.webp";
import assagaoSm from "./img/place/assagao-house-sm.webp";
import assagaoLg from "./img/place/assagao-house-lg.webp";
import qutubSm from "./img/place/delhi-qutub-sm.webp";
import qutubLg from "./img/place/delhi-qutub-lg.webp";
import bhubaneswarSm from "./img/place/bhubaneswar-residence-sm.webp";
import bhubaneswarLg from "./img/place/bhubaneswar-residence-lg.webp";
import nandiSm from "./img/place/nandi-hills-sm.webp";
import nandiLg from "./img/place/nandi-hills-lg.webp";

export { processSteps, services, studio };
export type { Material, TimelineEntry };

/** `lgW` is the pixel width of the large file when it isn't 1440 (portrait photos). */
export type Img = { sm: string; lg: string; w: number; h: number; alt: string; lgW?: number };

const img = (sm: string, lg: string, w: number, h: number, alt: string): Img => ({
  sm,
  lg,
  w,
  h,
  alt,
});

export const images = {
  hero: img(
    heroSm,
    heroLg,
    1920,
    1280,
    "A low stone-and-glass residence beside a still pool at dusk",
  ),
  monsoon: img(monsoonSm, monsoonLg, 1920, 1280, "An inner courtyard under a monsoon sky"),
  bluehour: img(
    bluehourSm,
    bluehourLg,
    1920,
    1280,
    "A lime-plastered house reflected in water at blue hour",
  ),
  signature: img(
    sigSm,
    sigLg,
    1600,
    1920,
    "A long coastal villa with a deep verandah and reflecting pool",
  ),
};

/**
 * Real photographs of each listing's surroundings. These show the AREA,
 * never the listing itself, and every use carries a caption and credit.
 */
export type Place = {
  key: string;
  region: string;
  image: Img;
  caption: string;
  credit: string;
  url: string;
};

const place = (
  key: string,
  region: string,
  sm: string,
  lg: string,
  size: [number, number],
  alt: string,
  caption: string,
  credit: string,
  url: string,
): Place => ({
  key,
  region,
  image: { sm, lg, w: size[0], h: size[1], alt, lgW: size[0] },
  caption,
  credit,
  url,
});

export const places: Record<string, Place> = {
  mumbai: place(
    "mumbai",
    "Mumbai",
    sealinkSm,
    sealinkLg,
    [1080, 1620],
    "The Bandra–Worli Sea Link at golden hour",
    "The Bandra–Worli Sea Link at golden hour, from the Bandra shore",
    "Ishaan Sen",
    "https://unsplash.com/photos/0Mby_URhdoM",
  ),
  bengaluru: place(
    "bengaluru",
    "Bengaluru",
    blrLakeSm,
    blrLakeLg,
    [1080, 1629],
    "A Bengaluru city lake with a palm and red flowers on the bank",
    "One of Bengaluru’s city lakes",
    "Bhargav Panchal",
    "https://unsplash.com/photos/Glha9VgklG0",
  ),
  goa: place(
    "goa",
    "Goa",
    assagaoSm,
    assagaoLg,
    [1080, 1440],
    "Casa Andrade, a historic Assagao house with red stairs and green shutters",
    "Casa Andrade, a historic house in Assagao — the local vernacular our Goa work draws on",
    "Tirth Patel",
    "https://unsplash.com/photos/xzhTEJmPnog",
  ),
  delhi: place(
    "delhi",
    "Delhi NCR",
    qutubSm,
    qutubLg,
    [1080, 1608],
    "The Qutub Minar in Mehrauli under a clear sky",
    "Qutub Minar, Mehrauli — the heritage district beside Chhatarpur",
    "Maaz Ahmed",
    "https://unsplash.com/photos/uO5hTj1CGPg",
  ),
  bhubaneswar: place(
    "bhubaneswar",
    "Bhubaneswar",
    bhubaneswarSm,
    bhubaneswarLg,
    [1440, 960],
    "Contemporary low-rise residence in Bhubaneswar with warm sandstone, shaded verandah and landscaped courtyard",
    "Bhubaneswar, Odisha",
    "Architectural Visualisation",
    "https://aangan.studio",
  ),
  nandi: place(
    "nandi",
    "Bengaluru Rural",
    nandiSm,
    nandiLg,
    [1080, 1350],
    "The view from Nandi Hills towards Channagiri Betta",
    "The view from Nandi Hills, north of Devanahalli",
    "Aaron M Varughese",
    "https://unsplash.com/photos/C4GbdBS3A8E",
  ),
};

const placeBySlug: Record<string, string> = {
  "casa-marea": "mumbai",
  "the-champa-house": "bengaluru",
  "casa-fontainhas": "goa",
  "the-neem-farmhouse": "delhi",
  "the-kohinoor-house": "bhubaneswar",
  "assagao-ridge-plot": "goa",
  "nagaon-casuarina-plot": "bhubaneswar",
  "devanahalli-orchard-plot": "nandi",
};

export function placeFor(slug: string): Place | undefined {
  return places[placeBySlug[slug]];
}

/** Regions for "Where we build", keyed to collection city filters. */
export const regions = [
  { city: "Mumbai", place: "mumbai" },
  { city: "Bhubaneswar", place: "bhubaneswar" },
  { city: "Goa", place: "goa" },
  { city: "Bengaluru", place: "bengaluru" },
  { city: "Delhi NCR", place: "delhi" },
] as const;

export type ListingKind = "residence" | "plot";
export type ListingStatus = "Available" | "Under Offer" | "Delivered" | "Demonstration";

export type Listing = {
  slug: string;
  kind: ListingKind;
  name: string;
  city: string;
  locality: string;
  status: ListingStatus;
  headline: string;
  description: string;
  /** Residences only */
  bhk?: number;
  builtSqft?: number;
  /** Plots only — frontage × depth in feet */
  plot?: { frontageFt: number; depthFt: number; facing: "North" | "South" | "East" | "West" };
  image?: Img;
  /** Locality-level [lat, lng] — approximate, never an address. */
  coords: [number, number];
  nearby: string[];
  features: string[];
  materials: Material[];
  timeline: TimelineEntry[];
  plan: "vertical" | "u-court" | "pitched" | "linear" | "long-court" | "site";
  /** True for content that is not real inventory. */
  demo: boolean;
  /** Plots only — context for the 3D site model (indicative, not surveyed). */
  site?: { coastal: boolean; roadSide: "front" | "back" };
};

const v1 = Object.fromEntries(featuredProperties.map((p) => [p.slug, p]));

function fromV1(
  slug: string,
  extra: Pick<Listing, "image" | "coords" | "nearby" | "features" | "plan">,
): Listing {
  const p = v1[slug];
  return {
    slug: p.slug,
    kind: "residence",
    name: p.name,
    city: p.city,
    locality: p.location,
    status: p.status,
    headline: p.headline,
    description: p.description,
    bhk: p.bhk,
    builtSqft: p.sqft,
    materials: p.materials,
    timeline: p.timeline,
    demo: false,
    ...extra,
  };
}

export const listings: Listing[] = [
  fromV1("casa-marea", {
    image: img(
      mumbaiSm,
      mumbaiLg,
      1600,
      1200,
      "Casa Marea — a terraced concrete house above the sea",
    ),
    coords: [19.0466, 72.8199],
    nearby: ["Bandstand promenade", "Mount Mary Basilica", "Carter Road"],
    features: [
      "Five floors around an open-to-sky stair",
      "Every principal room faces the sea to the west",
      "Board-formed concrete, cast on site",
    ],
    plan: "vertical",
  }),
  fromV1("the-champa-house", {
    image: img(
      blrSm,
      blrLg,
      1280,
      1600,
      "The Champa House — a stone courtyard house around a flowering tree",
    ),
    coords: [13.0068, 77.5813],
    nearby: ["Sankey Tank", "Mekhri Circle", "Indian Institute of Science"],
    features: [
      "U-plan held around a mature champa tree",
      "Shallow reflecting pool between the two wings",
      "Deep south verandah for the monsoon",
    ],
    plan: "u-court",
  }),
  fromV1("casa-fontainhas", {
    image: img(
      goaSm,
      goaLg,
      1600,
      1200,
      "Casa Fontainhas — lime-washed walls and a tiled roof near the sea",
    ),
    coords: [15.5937, 73.7647],
    nearby: ["Assagao village church", "Mapusa market", "Anjuna coast"],
    features: [
      "Laterite plinth with pale-ochre lime plaster",
      "Deep pitched roofs in Mangalore tile",
      "Oyster-shell windows along the east elevation",
    ],
    plan: "pitched",
  }),
  fromV1("the-neem-farmhouse", {
    image: img(
      delhiSm,
      delhiLg,
      1600,
      1200,
      "The Neem Farmhouse — a long sandstone house beneath old trees",
    ),
    coords: [28.5065, 77.175],
    nearby: ["Mehrauli–Gurgaon Road", "Qutub Minar", "Sanjay Van"],
    features: [
      "One room deep — every room cross-ventilated",
      "A courtyard that holds winter sun until four",
      "Jodhpur sandstone floors, uninterrupted",
    ],
    plan: "linear",
  }),
  {
    slug: "the-kohinoor-house",
    kind: "residence",
    name: "The Kohinoor House",
    city: "Bhubaneswar",
    locality: "Chandaka Foothills, Bhubaneswar",
    status: "Under Offer",
    headline: "A long, low courtyard villa set into a mature tropical grove.",
    description:
      "Set beside the green foothills on the edge of Bhubaneswar. Board-formed concrete and warm laterite cast on site over eleven months; a still reflecting pool between two wings; a deep verandah that runs the length of the garden elevation. Designed over two years, built over three.",
    bhk: 6,
    builtSqft: 9800,
    image: img(
      sigSm,
      sigLg,
      1600,
      1920,
      "The Kohinoor House — a long courtyard villa with a reflecting pool",
    ),
    coords: [20.2961, 85.8245],
    nearby: ["Chandaka Nature Reserve", "Bhubaneswar Airport (BBI)", "Ekamra Kshetra"],
    features: [
      "Long, low plan within a shaded tropical grove",
      "Reflecting pool held between two wings",
      "Verandah along the full garden elevation",
    ],
    materials: [{ name: "Board-formed concrete", provenance: "Cast on site over eleven months" }],
    timeline: [],
    plan: "long-court",
    demo: false,
  },
  // ——— DEMONSTRATION LAND — not real inventory ———
  {
    slug: "assagao-ridge-plot",
    kind: "plot",
    name: "Assagao Ridge",
    city: "Goa",
    locality: "Assagao, North Goa",
    status: "Demonstration",
    headline: "A gently falling laterite plot looking east over paddy.",
    description:
      "Demonstration listing. Shows how the studio presents land it can design and build on: frontage, depth, orientation and the first questions we would ask of the site. Title, zoning and conversion status would be verified independently before any offer.",
    plot: { frontageFt: 90, depthFt: 143, facing: "East" },
    coords: [15.596, 73.77],
    nearby: ["Assagao village", "Mapusa market", "Anjuna coast"],
    features: [
      "East-facing frontage",
      "Laterite subsoil (to be surveyed)",
      "Road access on the west",
    ],
    materials: [],
    timeline: [],
    plan: "site",
    demo: true,
    site: { coastal: false, roadSide: "back" },
  },
  {
    slug: "nagaon-casuarina-plot",
    kind: "plot",
    name: "Chandaka Grove",
    city: "Bhubaneswar",
    locality: "Chandaka, Bhubaneswar",
    status: "Demonstration",
    headline: "A rectangular laterite plot behind a native sal and mango grove.",
    description:
      "Demonstration listing. A sample of how an Odisha plot would be documented — dimensions, sun orientation and a first reading of wind and courtyard shade. Any real offer would carry an independently verified title and conversion position.",
    plot: { frontageFt: 125, depthFt: 160, facing: "East" },
    coords: [20.354, 85.765],
    nearby: ["Chandaka sanctuary", "Bhubaneswar city centre", "Biju Patnaik Airport"],
    features: [
      "East-facing for morning courtyard light",
      "Laterite subsoil and mature tree canopy",
      "Approach from the west",
    ],
    materials: [],
    timeline: [],
    plan: "site",
    demo: true,
    site: { coastal: false, roadSide: "back" },
  },
  {
    slug: "devanahalli-orchard-plot",
    kind: "plot",
    name: "Devanahalli Orchard",
    city: "Bengaluru",
    locality: "Devanahalli, Bengaluru Rural",
    status: "Demonstration",
    headline: "Close to an acre of old orchard on the city's northern edge.",
    description:
      "Demonstration listing. Illustrates a larger rural plot suited to a single farmhouse. Land-use and conversion status would be verified before any discussion of price.",
    plot: { frontageFt: 208, depthFt: 209, facing: "North" },
    coords: [13.247, 77.712],
    nearby: ["Devanahalli fort", "Kempegowda International Airport", "Nandi Hills"],
    features: [
      "North-facing frontage",
      "Existing orchard trees (to be surveyed)",
      "Near-square proportion",
    ],
    materials: [],
    timeline: [],
    plan: "site",
    demo: true,
    site: { coastal: false, roadSide: "front" },
  },
];

/**
 * A day in an Aangan house, told with the studio's representational renders.
 * Used by the home page's time-of-day sequence.
 */
export const dayFrames = [
  {
    time: "Morning",
    text: "Low sun comes through the jaali and lays its pattern on the courtyard floor.",
    image: "courtyard",
  },
  {
    time: "Noon",
    text: "The verandah holds a deep shade; the pool stays still and cool.",
    image: "signature",
  },
  {
    time: "Monsoon",
    text: "Rain fills the open court and the whole house hears it.",
    image: "monsoon",
  },
  {
    time: "Blue hour",
    text: "Lime plaster keeps the last light; water doubles the house.",
    image: "bluehour",
  },
] as const;

export const cities = Array.from(new Set(listings.map((l) => l.city)));

export function getListing(slug: string) {
  return listings.find((l) => l.slug === slug);
}

export function plotArea(l: Listing) {
  return l.plot ? l.plot.frontageFt * l.plot.depthFt : 0;
}

/** Comparable "size" for sorting/filtering: built area for houses, land for plots. */
export function sizeSqft(l: Listing) {
  return l.kind === "plot" ? plotArea(l) : (l.builtSqft ?? 0);
}

export const fmt = (n: number) => n.toLocaleString("en-IN");

// ——— Interiors ———
const interiorImages: Record<string, Img> = {
  living: img(livingSm, livingLg, 1400, 1800, "A long living room in pale plaster and timber"),
  bath: img(bathSm, bathLg, 1400, 1750, "A stone bathroom with soft daylight"),
  kitchen: img(kitchenSm, kitchenLg, 1600, 1200, "A kitchen with a full-height walnut wall"),
  bedroom: img(bedroomSm, bedroomLg, 1600, 1072, "A quiet bedroom in morning light"),
  courtyard: img(
    courtyardSm,
    courtyardLg,
    1400,
    1750,
    "A jaali-screened courtyard with a palm and water",
  ),
  dining: img(diningSm, diningLg, 1600, 1200, "A dining room set for twelve"),
};

/**
 * The same representational renders, keyed by room kind, for the home
 * explorer. Always captioned as "a comparable room", never as the layout
 * being shown.
 */
export const roomPhotos = interiorImages;

export const interiors = interiorPieces.map((p) => ({
  id: p.id,
  room: p.room as string,
  title: p.title as string,
  image: interiorImages[p.id],
}));
export const interiorRooms = ["All", ...Array.from(new Set(interiors.map((i) => i.room)))];

const materialImg = [
  img(travSm, travLg, 1200, 1200, "Close-up of a warm stone surface"),
  img(walnutSm, walnutLg, 1200, 1200, "Close-up of oiled timber grain"),
  img(brassSm, brassLg, 1200, 1200, "Close-up of hand-finished brass"),
];
export const materialLibrary = v1Materials.slice(0, 3).map((m, i) => ({
  name: m.name,
  origin: m.origin,
  image: materialImg[i],
}));
