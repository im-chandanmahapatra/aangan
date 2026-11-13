import type { SiteMode } from "./siteScene";

type Props = {
  className?: string;
  frontageFt: number;
  depthFt: number;
  facing: string;
  coastal?: boolean;
  roadSide?: string;
  build?: string;
  mode?: SiteMode;
  hour?: number;
  label?: string;
};

/** Format hour number to HH:MM string. */
export function hhmm(h: number): string {
  const hr = Math.floor(h);
  const mn = Math.round((h - hr) * 60);
  return `${String(hr).padStart(2, "0")}:${String(mn).padStart(2, "0")}`;
}

/**
 * Placeholder 3D site model.
 * Replace with a real Three.js scene once the 3D assets and terrain data are
 * available.
 */
export function SiteModel({ className, frontageFt, depthFt, facing, label }: Props) {
  return (
    <div
      className={className}
      role="img"
      aria-label={label ?? `Site model: ${frontageFt} × ${depthFt} ft, facing ${facing}`}
      style={{
        background: "var(--earth, #1a2a1e)",
        border: "1px solid var(--line-strong, #333)",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div style={{ textAlign: "center", padding: "2rem", color: "var(--on-dark-2, #aaa)" }}>
        <p className="v2-label">3D Site Model</p>
        <p className="v2-caption mt-2">
          {frontageFt} × {depthFt} ft · {facing}-facing
        </p>
        <p className="v2-caption mt-1" style={{ opacity: 0.5 }}>
          Interactive model loading…
        </p>
      </div>
    </div>
  );
}
