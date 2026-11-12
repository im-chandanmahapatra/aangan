/**
 * The floor plan, drawn from exactly the same data as the 3D model.
 *
 * Walls, doors and windows all come out of `derivePlan`, so a door that
 * is open in the model is a gap in the drawing. Clicking a room walks
 * the model into it.
 */
import { useMemo } from "react";
import {
  OPEN_TO_SKY,
  planBounds,
  roomSize,
  WALL_EXT,
  WALL_INT,
  type HomePlan,
  type Room,
} from "./plans";
import { derivePlan, solidRuns } from "./walls";

const PAD = 6; // feet of margin around the drawing

const ROOM_FILL: Record<string, string> = {
  bath: "var(--sand)",
  utility: "var(--sand)",
  wardrobe: "var(--sand)",
  kitchen: "var(--sand)",
  lobby: "var(--sand)",
  court: "var(--moss)",
  balcony: "var(--moss)",
  verandah: "var(--moss)",
};

export function FloorPlan2D({
  plan,
  activeRoom,
  onPickRoom,
  className = "",
  showLabels = true,
}: {
  plan: HomePlan;
  activeRoom?: string | null;
  onPickRoom?: (id: string) => void;
  className?: string;
  showLabels?: boolean;
}) {
  const { derived, b } = useMemo(
    () => ({ derived: derivePlan(plan), b: planBounds(plan) }),
    [plan],
  );

  const w = b.x1 - b.x0 + PAD * 2;
  const h = b.z1 - b.z0 + PAD * 2;
  // Plan convention: north up, so z grows upward on screen.
  const X = (x: number) => x - b.x0 + PAD;
  const Y = (z: number) => b.z1 - z + PAD;

  const labelFor = (r: Room) => (r.x1 - r.x0 >= 7 && r.z1 - r.z0 >= 5 ? r.name : "");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={`w-full h-auto ${className}`}
      role="img"
      aria-label={`Floor plan of ${plan.name}, ${plan.config}. Rooms: ${plan.rooms
        .map((r) => `${r.name} ${roomSize(r)}`)
        .join("; ")}.`}
    >
      {/* Room fills */}
      {plan.rooms.map((r) => {
        const active = r.id === activeRoom;
        const open = OPEN_TO_SKY.includes(r.type);
        return (
          <g key={r.id}>
            <rect
              x={X(r.x0)}
              y={Y(r.z1)}
              width={r.x1 - r.x0}
              height={r.z1 - r.z0}
              fill={active ? "var(--terracotta)" : (ROOM_FILL[r.type] ?? "var(--parchment)")}
              fillOpacity={active ? 0.3 : open ? 0.5 : 0.75}
              stroke="none"
              style={{ cursor: onPickRoom ? "pointer" : undefined, transition: "fill-opacity .3s" }}
              onClick={onPickRoom ? () => onPickRoom(r.id) : undefined}
            />
            {/* Open-to-sky rooms get a hatch so they read as outside. */}
            {open && (
              <rect
                x={X(r.x0)}
                y={Y(r.z1)}
                width={r.x1 - r.x0}
                height={r.z1 - r.z0}
                fill="url(#v2-open-hatch)"
                pointerEvents="none"
              />
            )}
          </g>
        );
      })}

      <defs>
        <pattern id="v2-open-hatch" width="2.2" height="2.2" patternUnits="userSpaceOnUse">
          <path d="M0 2.2 L2.2 0" stroke="var(--forest)" strokeWidth="0.14" opacity="0.35" />
        </pattern>
      </defs>

      {/* Active room outline */}
      {plan.rooms
        .filter((r) => r.id === activeRoom)
        .map((r) => (
          <rect
            key={`a-${r.id}`}
            x={X(r.x0)}
            y={Y(r.z1)}
            width={r.x1 - r.x0}
            height={r.z1 - r.z0}
            fill="none"
            stroke="var(--terracotta)"
            strokeWidth="0.5"
            pointerEvents="none"
          />
        ))}

      {/* Walls — only the built-up runs, so openings are real gaps */}
      {derived.walls.flatMap((wall, i) => {
        if (wall.style === "open") return [];
        const t = wall.kind === "ext" ? WALL_EXT : WALL_INT;
        const dashed = wall.style === "parapet";
        return solidRuns(wall).map((s, j) =>
          wall.axis === "x" ? (
            <rect
              key={`w${i}-${j}`}
              x={X(wall.pos) - t / 2}
              y={Y(s[1])}
              width={t}
              height={s[1] - s[0]}
              fill="var(--forest)"
              opacity={dashed ? 0.45 : 1}
              pointerEvents="none"
            />
          ) : (
            <rect
              key={`w${i}-${j}`}
              x={X(s[0])}
              y={Y(wall.pos) - t / 2}
              width={s[1] - s[0]}
              height={t}
              fill="var(--forest)"
              opacity={dashed ? 0.45 : 1}
              pointerEvents="none"
            />
          ),
        );
      })}

      {/* Windows: a thin line bridging the gap */}
      {derived.walls.flatMap((wall, i) =>
        wall.openings
          .filter((o) => o.kind === "window")
          .map((o, j) =>
            wall.axis === "x" ? (
              <line
                key={`win${i}-${j}`}
                x1={X(wall.pos)}
                y1={Y(o.from)}
                x2={X(wall.pos)}
                y2={Y(o.to)}
                stroke="var(--forest)"
                strokeWidth="0.22"
                opacity="0.8"
              />
            ) : (
              <line
                key={`win${i}-${j}`}
                x1={X(o.from)}
                y1={Y(wall.pos)}
                x2={X(o.to)}
                y2={Y(wall.pos)}
                stroke="var(--forest)"
                strokeWidth="0.22"
                opacity="0.8"
              />
            ),
          ),
      )}

      {/* Doors: the quarter-circle swing an architect would draw */}
      {derived.walls.flatMap((wall, i) =>
        wall.openings
          .filter((o) => o.kind === "door" || o.kind === "entry")
          .map((o, j) => {
            const r = o.to - o.from;
            const hx = wall.axis === "x" ? X(wall.pos) : X(o.from);
            const hy = wall.axis === "x" ? Y(o.from) : Y(wall.pos);
            const leafEnd =
              wall.axis === "x" ? { x: hx + r, y: hy } : { x: hx, y: hy - r };
            const arcEnd =
              wall.axis === "x" ? { x: hx, y: hy - r } : { x: hx + r, y: hy };
            return (
              <g key={`dr${i}-${j}`} pointerEvents="none">
                <path
                  d={`M ${hx} ${hy} L ${leafEnd.x} ${leafEnd.y} A ${r} ${r} 0 0 ${wall.axis === "x" ? 1 : 0} ${arcEnd.x} ${arcEnd.y}`}
                  fill="none"
                  stroke="var(--forest)"
                  strokeWidth="0.14"
                  opacity="0.5"
                />
              </g>
            );
          }),
      )}

      {/* Labels */}
      {showLabels &&
        plan.rooms.map((r) => {
          const label = labelFor(r);
          if (!label) return null;
          const cx = X((r.x0 + r.x1) / 2);
          const cy = Y((r.z0 + r.z1) / 2);
          return (
            <g key={`l-${r.id}`} pointerEvents="none">
              <text
                x={cx}
                y={cy - 0.4}
                textAnchor="middle"
                fill="var(--forest)"
                style={{ font: "600 1.85px var(--f-sans), sans-serif", letterSpacing: "0.06px" }}
              >
                {label}
              </text>
              <text
                x={cx}
                y={cy + 2.3}
                textAnchor="middle"
                fill="var(--forest)"
                opacity="0.62"
                style={{ font: "500 1.5px var(--f-sans), sans-serif" }}
              >
                {roomSize(r)}
              </text>
            </g>
          );
        })}

      {/* North arrow */}
      <g transform={`translate(${w - 4.2} ${3.6})`} pointerEvents="none" opacity="0.75">
        <path d="M0 -2.6 L1.5 2.4 L0 1.3 L-1.5 2.4 Z" fill="var(--forest)" />
        <text
          x="0"
          y="4.9"
          textAnchor="middle"
          fill="var(--forest)"
          style={{ font: "700 1.7px var(--f-sans), sans-serif" }}
        >
          N
        </text>
      </g>
    </svg>
  );
}
