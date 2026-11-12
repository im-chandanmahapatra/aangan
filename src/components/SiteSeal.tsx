/**
 * SiteSeal — proprietary brand device.
 * A small circular embossed-look stamp used once per residence card and once
 * in the footer. Numeral + year + provenance ring. Never decorative — always
 * carries data. SVG so it prints, scales, and never rasterizes.
 */
export function SiteSeal({
  folio,
  year,
  provenance,
  size = 92,
  tone = "ink",
}: {
  folio: string;        // e.g. "I", "II", "III", "IV" or "01"
  year: number;         // handover year
  provenance: string;   // ring text, e.g. "KOTA · BICHOLIM · JODHPUR"
  size?: number;
  tone?: "ink" | "ivory";
}) {
  const stroke = tone === "ivory" ? "rgba(250,247,242,0.72)" : "rgba(26,22,19,0.55)";
  const fill = tone === "ivory" ? "rgba(250,247,242,0.94)" : "rgba(26,22,19,0.86)";
  const id = `seal-${folio}-${year}`;
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label={`Folio ${folio}, ${year}, ${provenance}`}
      className="select-none"
    >
      <defs>
        <path
          id={id}
          d="M 60 60 m -46 0 a 46 46 0 1 1 92 0 a 46 46 0 1 1 -92 0"
        />
      </defs>
      {/* Outer hairline ring */}
      <circle cx="60" cy="60" r="56" fill="none" stroke={stroke} strokeWidth="0.6" />
      {/* Inner ring */}
      <circle cx="60" cy="60" r="42" fill="none" stroke={stroke} strokeWidth="0.4" />
      {/* Ring text — provenance */}
      <text
        fill={fill}
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "6.4px",
          letterSpacing: "0.32em",
          fontVariantCaps: "all-small-caps",
        }}
      >
        <textPath href={`#${id}`} startOffset="0%">
          {provenance} · {provenance}
        </textPath>
      </text>
      {/* Centre folio numeral */}
      <text
        x="60"
        y="60"
        textAnchor="middle"
        dominantBaseline="central"
        fill={fill}
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "22px",
          letterSpacing: "0.02em",
        }}
      >
        {folio}
      </text>
      {/* Year below */}
      <text
        x="60"
        y="82"
        textAnchor="middle"
        fill={fill}
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "5.6px",
          letterSpacing: "0.34em",
          fontVariantCaps: "all-small-caps",
        }}
      >
        MMXXV · {year}
      </text>
      {/* Two hairline marks like an architect's centering cross */}
      <line x1="60" y1="10" x2="60" y2="16" stroke={stroke} strokeWidth="0.5" />
      <line x1="60" y1="104" x2="60" y2="110" stroke={stroke} strokeWidth="0.5" />
    </svg>
  );
}
