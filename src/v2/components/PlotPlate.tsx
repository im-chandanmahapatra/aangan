import { useId } from "react";
import { fmt, plotArea, type Listing } from "../data";

const facingRotation = { South: 0, East: 90, North: 180, West: -90 } as const;

/**
 * Clean architectural survey drawing on warm tracing paper.
 * No gradients, glows, or overlays — crisp ink linework, site contours,
 * courtyard envelope, and horizontal dimension ticks that stay legible at small sizes.
 */
export function PlotPlate({ listing, className = "" }: { listing: Listing; className?: string }) {
  const uid = useId().replace(/:/g, "");
  if (!listing.plot) return null;

  const { frontageFt: w, depthFt: d, facing } = listing.plot;
  const area = plotArea(listing);
  const isCoastal = Boolean(listing.site?.coastal);
  const isOrchard = listing.slug.includes("orchard");

  const W = 520;
  const H = 560;
  const padX = 78;
  const padTop = 84;
  const padBottom = 108;
  const scale = Math.min((W - padX * 2) / w, (H - padTop - padBottom) / d);
  const pw = w * scale;
  const ph = d * scale;
  const x = (W - pw) / 2;
  const y = padTop + (H - padTop - padBottom - ph) / 2;

  // Indicative setback envelope (~16% inset)
  const bx = x + pw * 0.16;
  const by = y + ph * 0.17;
  const bw = pw * 0.68;
  const bh = ph * 0.6;

  // Organic terrain contours
  const contours = [0.25, 0.5, 0.75].map((t, i) => {
    const yy = y + ph * t;
    const tilt = listing.slug.includes("ridge") ? (i - 1) * 12 : isCoastal ? 2 : i % 2 ? 7 : -7;
    const wave = isCoastal ? 6 : 14;
    return `M${x - 10} ${yy + tilt} C ${x + pw * 0.34} ${yy - wave}, ${x + pw * 0.66} ${yy + wave - tilt * 0.3}, ${x + pw + 10} ${yy - tilt * 0.5}`;
  });

  // Botanical tree plan circles matching parcel notes
  const trees: Array<{ cx: number; cy: number; r: number }> = isCoastal
    ? [0.16, 0.38, 0.62, 0.84].map((t, i) => ({
        cx: x + pw * t,
        cy: y + ph * (i % 2 === 0 ? 0.08 : 0.11),
        r: 9,
      }))
    : isOrchard
      ? [
          { cx: x + pw * 0.12, cy: y + ph * 0.14, r: 10 },
          { cx: x + pw * 0.88, cy: y + ph * 0.17, r: 12 },
          { cx: x + pw * 0.14, cy: y + ph * 0.82, r: 11 },
          { cx: x + pw * 0.86, cy: y + ph * 0.8, r: 10 },
        ]
      : [
          { cx: x + pw * 0.12, cy: y + ph * 0.86, r: 10 },
          { cx: x + pw * 0.88, cy: y + ph * 0.13, r: 9 },
        ];

  const rot = facingRotation[facing];
  const ink = "#1b1f1a";
  const muted = "rgb(27 31 26 / 0.5)";
  const accent = "#a3462a";

  return (
    <div
      className={`relative w-full h-full overflow-hidden v2-grid-bg ${className}`}
      style={{
        backgroundColor: "#ede4d3",
        border: "1px solid var(--line)",
        color: ink,
      }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-full"
        role="img"
        aria-label={`Architectural survey plan: ${w} by ${d} feet, ${fmt(area)} square feet, ${facing.toLowerCase()}-facing`}
      >
        <defs>
          <pattern
            id={`road-${uid}`}
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="8" stroke={ink} strokeWidth="0.65" opacity="0.28" />
          </pattern>
        </defs>

        {/* Contours */}
        {contours.map((c, idx) => (
          <path key={idx} d={c} fill="none" stroke={ink} strokeWidth={0.75} opacity={0.28} />
        ))}

        {/* Parcel boundary */}
        <rect
          x={x}
          y={y}
          width={pw}
          height={ph}
          fill="rgb(255 252 246 / 0.48)"
          stroke={ink}
          strokeWidth={1.6}
          strokeDasharray="10 4 2 4"
        />

        {/* Setback courtyard footprint */}
        <rect
          x={bx}
          y={by}
          width={bw}
          height={bh}
          fill="rgb(163 70 42 / 0.06)"
          stroke={accent}
          strokeWidth={1}
          strokeDasharray="4 4"
        />

        {/* Canopy marks */}
        {trees.map((t, i) => (
          <circle
            key={i}
            cx={t.cx}
            cy={t.cy}
            r={t.r}
            fill="rgb(77 91 67 / 0.1)"
            stroke={ink}
            strokeWidth={0.75}
            opacity={0.55}
          />
        ))}

        {/* Approach road strip */}
        <rect
          x={x - 16}
          y={y + ph + 14}
          width={pw + 32}
          height={15}
          fill={`url(#road-${uid})`}
          stroke={muted}
          strokeWidth={0.6}
        />
        <text
          x={W / 2}
          y={y + ph + 44}
          textAnchor="middle"
          fill={muted}
          style={{ font: "500 10px var(--f-sans)", letterSpacing: "0.14em" }}
        >
          ACCESS ROAD
        </text>

        {/* Horizontal frontage dimension */}
        <g style={{ font: "600 12px var(--f-sans)", letterSpacing: "0.06em" }}>
          <line x1={x} y1={y - 18} x2={x + pw} y2={y - 18} stroke={muted} strokeWidth={0.85} />
          <line x1={x} y1={y - 24} x2={x} y2={y - 12} stroke={muted} strokeWidth={0.85} />
          <line x1={x + pw} y1={y - 24} x2={x + pw} y2={y - 12} stroke={muted} strokeWidth={0.85} />
          <text x={W / 2} y={y - 28} textAnchor="middle" fill={ink}>
            {w} FT × {d} FT
          </text>
        </g>

        {/* Clean oriented compass in bottom-right corner with full clearance */}
        <g transform={`translate(${W - 44} ${H - 44})`}>
          <circle r="17" fill="#ede4d3" stroke={muted} strokeWidth={0.85} />
          <g transform={`rotate(${rot})`}>
            <path d="M0 -11 L4 4 L0 1.5 L-4 4 Z" fill={accent} />
          </g>
          <text
            y="30"
            textAnchor="middle"
            fill={muted}
            style={{ font: "600 9px var(--f-sans)", letterSpacing: "0.14em" }}
          >
            {facing.toUpperCase()}
          </text>
        </g>
      </svg>
    </div>
  );
}
