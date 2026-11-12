import type { Listing } from "../data";
import { fmt } from "../data";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.2,
  vectorEffect: "non-scaling-stroke" as const,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

/**
 * The frontage (road) is always drawn along the bottom edge, so the north
 * arrow rotates to match: a south-facing plot has north up; an east-facing
 * plot has north pointing right; a north-facing plot has north pointing down.
 */
const facingRotation = { South: 0, East: 90, North: 180, West: -90 } as const;

/**
 * Dimensioned site plan generated from a plot's frontage × depth.
 * Proportions are true to the numbers; the road is drawn on the frontage
 * side, and the north arrow rotates to match the facing.
 */
export function SitePlan({ listing, className = "" }: { listing: Listing; className?: string }) {
  if (!listing.plot) return null;
  const { frontageFt: w, depthFt: d, facing } = listing.plot;
  const W = 640;
  const H = 480;
  const pad = 96;
  const scale = Math.min((W - pad * 2) / w, (H - pad * 2 - 30) / d);
  const pw = w * scale;
  const ph = d * scale;
  const x = (W - pw) / 2;
  const y = (H - ph) / 2 - 10;
  const rot = facingRotation[facing];
  // Simple deterministic contour lines across the plot.
  const contours = [0.28, 0.5, 0.72].map((t, i) => {
    const yy = y + ph * t;
    return `M${x} ${yy + 8 * (i % 2 ? 1 : -1)} C ${x + pw * 0.3} ${yy - 14}, ${x + pw * 0.7} ${yy + 16}, ${x + pw} ${yy - 4}`;
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-label={`Site plan: ${w} by ${d} feet, ${fmt(w * d)} square feet, ${facing.toLowerCase()}-facing`}
    >
      <defs>
        <pattern
          id={`hatch-${listing.slug}`}
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="8"
            stroke="currentColor"
            strokeWidth="0.6"
            opacity="0.35"
          />
        </pattern>
      </defs>
      {/* road on the frontage (bottom edge) */}
      <rect
        x={x - 40}
        y={y + ph + 26}
        width={pw + 80}
        height={22}
        fill={`url(#hatch-${listing.slug})`}
      />
      <text
        x={W / 2}
        y={y + ph + 66}
        textAnchor="middle"
        className="v2-svg-label"
        fill="currentColor"
        style={{ font: "500 10px var(--f-mono)", letterSpacing: "0.08em" }}
      >
        ACCESS ROAD
      </text>
      {/* plot boundary */}
      <rect
        x={x}
        y={y}
        width={pw}
        height={ph}
        {...stroke}
        strokeWidth={1.8}
        strokeDasharray="10 4 2 4"
      />
      {contours.map((c, i) => (
        <path key={i} d={c} {...stroke} strokeWidth={0.8} opacity={0.4} />
      ))}
      {/* indicative building envelope (setbacks ~15%) */}
      <rect
        x={x + pw * 0.16}
        y={y + ph * 0.18}
        width={pw * 0.68}
        height={ph * 0.56}
        {...stroke}
        strokeWidth={0.8}
        strokeDasharray="3 4"
        opacity={0.7}
      />
      <text
        x={x + pw / 2}
        y={y + ph * 0.46}
        textAnchor="middle"
        fill="currentColor"
        style={{ font: "400 10px var(--f-mono)", letterSpacing: "0.06em" }}
        opacity={0.7}
      >
        INDICATIVE ENVELOPE
      </text>
      {/* trees */}
      {[0.08, 0.92].map((t, i) => (
        <circle
          key={i}
          cx={x + pw * t}
          cy={y + ph * (i ? 0.1 : 0.88)}
          r={10}
          {...stroke}
          strokeWidth={0.8}
          opacity={0.6}
        />
      ))}
      {/* dimension: frontage */}
      <g fill="currentColor" style={{ font: "500 11px var(--f-mono)" }}>
        <line x1={x} y1={y - 22} x2={x + pw} y2={y - 22} {...stroke} strokeWidth={0.8} />
        <line x1={x} y1={y - 28} x2={x} y2={y - 16} {...stroke} strokeWidth={0.8} />
        <line x1={x + pw} y1={y - 28} x2={x + pw} y2={y - 16} {...stroke} strokeWidth={0.8} />
        <text x={x + pw / 2} y={y - 30} textAnchor="middle">
          {w}′-0″
        </text>
        {/* dimension: depth */}
        <line x1={x + pw + 22} y1={y} x2={x + pw + 22} y2={y + ph} {...stroke} strokeWidth={0.8} />
        <line x1={x + pw + 16} y1={y} x2={x + pw + 28} y2={y} {...stroke} strokeWidth={0.8} />
        <line
          x1={x + pw + 16}
          y1={y + ph}
          x2={x + pw + 28}
          y2={y + ph}
          {...stroke}
          strokeWidth={0.8}
        />
        <text
          x={x + pw + 34}
          y={y + ph / 2}
          transform={`rotate(90 ${x + pw + 34} ${y + ph / 2})`}
          textAnchor="middle"
        >
          {d}′-0″
        </text>
      </g>
      {/* north arrow */}
      <g transform={`translate(${W - 46} ${H - 46}) rotate(${rot})`}>
        <circle r="18" {...stroke} strokeWidth={0.8} />
        <path d="M0 -14 L6 6 L0 2 L-6 6 Z" fill="currentColor" />
        <text
          y="-22"
          textAnchor="middle"
          fill="currentColor"
          style={{ font: "600 10px var(--f-mono)" }}
          transform="rotate(0)"
        >
          N
        </text>
      </g>
    </svg>
  );
}

/** Restrained ground-floor schematics for residences, keyed by plan type. */
export function FloorPlan({ plan, className = "" }: { plan: Listing["plan"]; className?: string }) {
  return (
    <svg viewBox="0 0 640 400" className={className} role="img" aria-label="Ground-floor schematic">
      <g {...stroke}>
        {plan === "vertical" && (
          <>
            <rect x="150" y="70" width="340" height="250" strokeWidth={2} />
            <line x1="150" y1="190" x2="490" y2="190" />
            <rect x="290" y="150" width="60" height="80" strokeDasharray="4 4" />
            <line x1="250" y1="70" x2="250" y2="190" />
            <line x1="390" y1="190" x2="390" y2="320" />
            <path d="M150 320 L490 320 L520 350 L120 350 Z" strokeDasharray="3 5" />
          </>
        )}
        {plan === "u-court" && (
          <>
            <path
              d="M110 70 L110 320 L530 320 L530 70 L420 70 L420 220 L220 220 L220 70 Z"
              strokeWidth={2}
            />
            <circle cx="320" cy="140" r="26" strokeDasharray="2 4" />
            <rect x="255" y="236" width="130" height="28" strokeDasharray="4 4" />
            <line x1="110" y1="160" x2="220" y2="160" />
            <line x1="420" y1="160" x2="530" y2="160" />
          </>
        )}
        {plan === "pitched" && (
          <>
            <rect x="110" y="120" width="420" height="190" strokeWidth={2} />
            <line x1="250" y1="120" x2="250" y2="310" />
            <line x1="390" y1="120" x2="390" y2="310" />
            <line x1="110" y1="215" x2="250" y2="215" />
            <path d="M90 120 L320 60 L550 120" strokeDasharray="5 5" />
          </>
        )}
        {plan === "linear" && (
          <>
            <rect x="50" y="150" width="540" height="90" strokeWidth={2} />
            {[140, 230, 320, 410, 500].map((x) => (
              <line key={x} x1={x} y1="150" x2={x} y2="240" />
            ))}
            <rect x="230" y="60" width="180" height="90" strokeDasharray="4 4" />
            <line x1="50" y1="262" x2="590" y2="262" strokeDasharray="4 6" />
          </>
        )}
        {(plan === "long-court" || plan === "site") && (
          <>
            <rect x="70" y="90" width="210" height="220" strokeWidth={2} />
            <rect x="360" y="90" width="210" height="220" strokeWidth={2} />
            <rect x="290" y="130" width="60" height="140" strokeDasharray="4 4" />
            <line x1="40" y1="330" x2="600" y2="330" strokeDasharray="4 6" />
          </>
        )}
      </g>
    </svg>
  );
}
