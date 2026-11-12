import propertyMumbai from "@/assets/property-mumbai.jpg";
import propertyBengaluru from "@/assets/property-bengaluru.jpg";
import propertyGoa from "@/assets/property-goa.jpg";
import propertyDelhi from "@/assets/property-delhi.jpg";
import interiorLiving from "@/assets/interior-living.jpg";
import interiorBath from "@/assets/interior-bath.jpg";
import interiorKitchen from "@/assets/interior-kitchen.jpg";
import interiorBedroom from "@/assets/interior-bedroom.jpg";
import interiorCourtyard from "@/assets/interior-courtyard.jpg";
import interiorDining from "@/assets/interior-dining.jpg";
import materialTravertine from "@/assets/material-travertine.jpg";
import materialWalnut from "@/assets/material-walnut.jpg";
import materialBrass from "@/assets/material-brass.jpg";

// NOTE: Studio contact, project counts, prices, and dates below are
// PLACEHOLDER values pending real inputs from the studio principals.
// Do not present these as verified facts in press or client-facing copy.

export type Material = { name: string; provenance: string };
export type TimelineEntry = { phase: string; date: string };

export type Property = {
  id: string;
  slug: string;
  name: string;
  city: string;
  location: string;
  bhk: number;
  sqft: number;
  /** PLACEHOLDER price in Cr — never surface on public grid; used inside detail flow only. */
  priceCr: number;
  status: "Available" | "Under Offer" | "Delivered";
  /** One sentence, specific, no triple-noun cadence. */
  headline: string;
  /** Long-form description used on detail routes. */
  description: string;
  image: string;
  aspect: "portrait" | "landscape";
  materials: Material[];
  timeline: TimelineEntry[];
  photographer: string;
};

export const featuredProperties: Property[] = [
  {
    id: "casa-marea",
    slug: "casa-marea",
    name: "Casa Marea",
    city: "Mumbai",
    location: "Bandra West",
    bhk: 5,
    sqft: 7200,
    priceCr: 42,
    status: "Available",
    headline: "A vertical villa cut into the Bandra bandstand cliff.",
    description:
      "Five floors held around a single stair shaft open to the sky. The plan turns its back on the road and opens the sea elevation completely — every principal room reads west to the Arabian horizon. Cast in board-formed concrete on site over eleven months.",
    image: propertyMumbai,
    aspect: "landscape",
    materials: [
      { name: "Board-formed concrete", provenance: "Cast on site" },
      { name: "Dholpur beige sandstone", provenance: "Bharatpur, Rajasthan" },
      { name: "Burma teak", provenance: "Reclaimed, Nagpur salvage" },
      { name: "Handloom cotton dhurries", provenance: "Warangal" },
    ],
    timeline: [
      { phase: "Commission", date: "Mar 2021" },
      { phase: "Ground-breaking", date: "Aug 2022" },
      { phase: "Roof cast", date: "Feb 2024" },
      { phase: "Handover", date: "Oct 2025" },
    ],
    photographer: "PLACEHOLDER — awaiting shoot credit",
  },
  {
    id: "the-champa-house",
    slug: "the-champa-house",
    name: "The Champa House",
    city: "Bengaluru",
    location: "Sadashivanagar",
    bhk: 4,
    sqft: 6100,
    priceCr: 28,
    status: "Under Offer",
    headline: "Built around a champa tree the client refused to cut.",
    description:
      "The plan is a U held loosely around a Plumeria alba the family has known for two generations. A shallow reflecting pool sits between the two wings; a deep verandah on the south face holds the monsoon at arm's length without a single downpipe visible.",
    image: propertyBengaluru,
    aspect: "portrait",
    materials: [
      { name: "Rough-sawn Kota stone", provenance: "Ramganjmandi quarry" },
      { name: "Locally-fired terracotta jaali", provenance: "Mysuru workshop" },
      { name: "Athangudi tiles", provenance: "Chettinad, hand-poured" },
      { name: "Ain wood", provenance: "Western Ghats, licensed harvest" },
    ],
    timeline: [
      { phase: "Commission", date: "Nov 2020" },
      { phase: "Ground-breaking", date: "Jun 2021" },
      { phase: "Landscape complete", date: "Sep 2023" },
      { phase: "Handover", date: "Apr 2024" },
    ],
    photographer: "PLACEHOLDER — awaiting shoot credit",
  },
  {
    id: "casa-fontainhas",
    slug: "casa-fontainhas",
    name: "Casa Fontainhas",
    city: "Goa",
    location: "Assagao",
    bhk: 4,
    sqft: 5800,
    priceCr: 22,
    status: "Available",
    headline: "A lime-washed Portuguese-modern house two dunes off the sea.",
    description:
      "Laterite plinth, lime plaster in the pale ochre used across the Fontainhas quarter of Panjim. Deep pitched roofs to Mangalore tiles; a single line of oyster-shell windows across the eastern elevation catches first light without heat.",
    image: propertyGoa,
    aspect: "landscape",
    materials: [
      { name: "Laterite block", provenance: "Bicholim, quarried on commission" },
      { name: "Mangalore-tile roof", provenance: "Feroke, Kerala" },
      { name: "Oyster-shell (carepa) windows", provenance: "Old Goa workshop" },
      { name: "Rain-tree furniture", provenance: "Studio commissioned, Verna" },
    ],
    timeline: [
      { phase: "Commission", date: "Jan 2022" },
      { phase: "Ground-breaking", date: "Nov 2022" },
      { phase: "Roof lay", date: "May 2024" },
      { phase: "Handover", date: "Feb 2026" },
    ],
    photographer: "PLACEHOLDER — awaiting shoot credit",
  },
  {
    id: "the-neem-farmhouse",
    slug: "the-neem-farmhouse",
    name: "The Neem Farmhouse",
    city: "Delhi NCR",
    location: "Chattarpur",
    bhk: 6,
    sqft: 12400,
    priceCr: 58,
    status: "Available",
    headline: "A long horizontal set beneath mature neem and gulmohar.",
    description:
      "The house is one room deep across its full length so every room has cross-ventilation before it has air-conditioning. Warm Jodhpur sandstone floors run through, uninterrupted; a courtyard holds the winter sun until four in the afternoon.",
    image: propertyDelhi,
    aspect: "landscape",
    materials: [
      { name: "Jodhpur pink sandstone", provenance: "Sursagar quarry, Rajasthan" },
      { name: "Yamuna river-washed limestone", provenance: "Karauli district" },
      { name: "Deodar beams", provenance: "Himachal, government-licensed lot" },
      { name: "Hand-loomed jute matting", provenance: "Cooch Behar" },
    ],
    timeline: [
      { phase: "Commission", date: "Aug 2019" },
      { phase: "Ground-breaking", date: "Feb 2020" },
      { phase: "Landscape complete", date: "Jul 2022" },
      { phase: "Handover", date: "Dec 2023" },
    ],
    photographer: "PLACEHOLDER — awaiting shoot credit",
  },
];

export function getPropertyBySlug(slug: string) {
  return featuredProperties.find((p) => p.slug === slug);
}

export const interiorPieces = [
  { id: "living", room: "Living", title: "The Long Room", image: interiorLiving, span: 2 },
  { id: "bath", room: "Bath", title: "Stone & Steam", image: interiorBath, span: 1 },
  { id: "kitchen", room: "Kitchen", title: "Walnut Wall", image: interiorKitchen, span: 1 },
  { id: "bedroom", room: "Bedroom", title: "Morning, held quiet", image: interiorBedroom, span: 2 },
  { id: "courtyard", room: "Courtyard", title: "Jaali & Water", image: interiorCourtyard, span: 1 },
  { id: "dining", room: "Living", title: "Twelve at the Table", image: interiorDining, span: 1 },
] as const;

export const interiorFilters = ["All", "Living", "Bath", "Kitchen", "Bedroom", "Courtyard"] as const;

export const materials = [
  { name: "Kota stone", origin: "Ramganjmandi, Rajasthan", image: materialTravertine },
  { name: "Ain wood", origin: "Western Ghats, licensed harvest", image: materialWalnut },
  { name: "Cast brass", origin: "Moradabad foundry", image: materialBrass },
  { name: "Laterite block", origin: "Bicholim, Goa", image: materialTravertine },
  { name: "Deodar", origin: "Himachal Pradesh", image: materialWalnut },
  { name: "Athangudi tile", origin: "Chettinad, Tamil Nadu", image: materialBrass },
];

export const processSteps = [
  {
    n: "01",
    title: "Listen",
    body: "A season of conversations before a single line is drawn. We ask how you spend a Sunday morning; the plan follows.",
  },
  {
    n: "02",
    title: "Site",
    body: "We walk the land at every hour. Sun path, prevailing wind, the trees you want kept — all traced before the survey.",
  },
  {
    n: "03",
    title: "Sketch",
    body: "Hand drawings, then a physical model at 1:50. Rooms sized to the body before any drawing is issued for tender.",
  },
  {
    n: "04",
    title: "Build",
    body: "A partner from the studio lives with your project through the build. Materials selected slab by slab at the quarry.",
  },
  {
    n: "05",
    title: "Live",
    body: "We furnish, style, and hand over the keys. Then we return in a year, to see how the house has begun to settle.",
  },
];

export const testimonials = [
  {
    quote:
      "They did not build us a house — they built us a way of spending our mornings, and the rest of the plan followed from that.",
    author: "Anaya & Rohan M.",
    project: "The Champa House · Bengaluru",
  },
  {
    quote:
      "For two years they asked us questions we had never thought to ask ourselves. The house that came out of it is more ours than we could have designed alone.",
    author: "Vikram S.",
    project: "Casa Marea · Mumbai",
  },
  {
    quote:
      "Every material was decided in a room together, at the quarry or the mill. We know the provenance of every surface we touch.",
    author: "Meera & Aditya R.",
    project: "The Neem Farmhouse · Delhi NCR",
  },
];

export const services = [
  { title: "Private Villas", body: "Ground-up residences on your land, or one from our own selection." },
  { title: "Interior Architecture", body: "Full interior design from plan to the final piece of joinery." },
  { title: "Architecture", body: "Bespoke architectural commissions for private clients across India." },
  { title: "Landscape", body: "Gardens, courtyards, and water — designed as rooms in their own right." },
  { title: "Renovation", body: "Careful rework of older homes with a light, editorial hand." },
  { title: "Consultation", body: "A single-day studio visit for direction on a project already in motion." },
];

// PLACEHOLDER — replace before publish. Domain and phone are unverified.
export const studio = {
  email: "hello@aangan.studio",
  phone: "+91 22 XXXX XXXX",
  address: "Studio Aangan · Kala Ghoda, Mumbai · By appointment",
  cities: ["Mumbai", "Bengaluru", "Goa", "Delhi NCR"],
  since: 2011,
  projects: 84,
  completed: 62,
};
