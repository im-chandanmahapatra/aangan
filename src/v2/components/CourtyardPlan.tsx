import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "../motion";

/**
 * Schematic ground-floor plan of a long courtyard house: two wings held
 * around a reflecting pool, a verandah along the sea elevation. Walls draw
 * in as the plan enters the viewport; rooms then label themselves.
 * Schematic only — representational, not a working drawing.
 */
const walls = [
  // outer envelope, with an entry gap on the north wall
  "M300 40 H40 V300 H600 V40 H340",
  // west wing / court / east wing division
  "M220 40 V300 M420 40 V300",
  // west wing rooms
  "M40 170 H220 M130 170 V300",
  // east wing rooms
  "M420 140 H600 M510 40 V140",
];
const rooms: { x: number; y: number; t: string; s?: string }[] = [
  { x: 130, y: 105, t: "Bedroom 01" },
  { x: 85, y: 235, t: "Bath" },
  { x: 175, y: 235, t: "Bedroom 02" },
  { x: 320, y: 120, t: "Courtyard", s: "open to sky" },
  { x: 465, y: 90, t: "Kitchen" },
  { x: 555, y: 90, t: "Store" },
  { x: 510, y: 220, t: "Living / Dining" },
  { x: 320, y: 345, t: "Verandah", s: "full sea elevation" },
];

export function CourtyardPlan({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const draw = (i: number) => ({
    hidden: { pathLength: reduce ? 1 : 0, opacity: reduce ? 0 : 1 },
    show: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: reduce ? 0.2 : 1.6, ease: EASE, delay: i * 0.18 },
    },
  });
  return (
    <motion.svg
      viewBox="0 0 640 400"
      className={className}
      role="img"
      aria-label="Schematic plan: two wings around an open courtyard with a reflecting pool, and a verandah along the sea elevation"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
    >
      <defs>
        <pattern
          id="cp-hatch"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="6"
            stroke="currentColor"
            strokeWidth="0.6"
            opacity="0.25"
          />
        </pattern>
      </defs>
      {/* verandah slab */}
      <motion.rect
        x="40"
        y="300"
        width="560"
        height="70"
        fill="url(#cp-hatch)"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 5"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { delay: 1, duration: 1 } },
        }}
      />
      {/* reflecting pool */}
      <motion.rect
        x="265"
        y="170"
        width="110"
        height="90"
        fill="rgb(120 170 170 / 0.28)"
        stroke="currentColor"
        strokeWidth="1"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { delay: 1.1, duration: 1 } },
        }}
      />
      <motion.text
        x="320"
        y="220"
        textAnchor="middle"
        fill="currentColor"
        style={{ font: "italic 13px var(--f-display)" }}
        variants={{ hidden: { opacity: 0 }, show: { opacity: 0.85, transition: { delay: 1.3 } } }}
      >
        Pool
      </motion.text>
      {/* courtyard tree */}
      <motion.circle
        cx="320"
        cy="82"
        r="16"
        fill="none"
        stroke="currentColor"
        strokeDasharray="2 3"
        variants={{ hidden: { opacity: 0 }, show: { opacity: 0.8, transition: { delay: 1.2 } } }}
      />
      {walls.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth={i === 0 ? 7 : 4}
          strokeLinejoin="miter"
          variants={draw(i)}
        />
      ))}
      {rooms.map((r, i) => (
        <motion.g
          key={r.t}
          variants={{
            hidden: { opacity: 0, y: 6 },
            show: { opacity: 1, y: 0, transition: { delay: 1.2 + i * 0.08, duration: 0.6 } },
          }}
        >
          <text
            x={r.x}
            y={r.y}
            textAnchor="middle"
            fill="currentColor"
            style={{ font: "600 11px var(--f-sans)", letterSpacing: "0.06em" }}
          >
            {r.t}
          </text>
          {r.s && (
            <text
              x={r.x}
              y={r.y + 15}
              textAnchor="middle"
              fill="currentColor"
              opacity={0.7}
              style={{ font: "italic 12px var(--f-display)" }}
            >
              {r.s}
            </text>
          )}
        </motion.g>
      ))}
      {/* entry + sea arrows */}
      <motion.g
        fill="currentColor"
        style={{ font: "600 10px var(--f-sans)", letterSpacing: "0.12em" }}
        variants={{ hidden: { opacity: 0 }, show: { opacity: 0.8, transition: { delay: 1.8 } } }}
      >
        <text x="320" y="26" textAnchor="middle">
          ENTRY ↓
        </text>
        <text x="320" y="392" textAnchor="middle">
          SEA ↓
        </text>
      </motion.g>
    </motion.svg>
  );
}
