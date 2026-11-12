import { useEffect, useRef, useState } from "react";
import type { Facing, SiteMode, SiteScene } from "./siteScene";

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
const hhmm = (h: number) => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

export type SiteModelProps = {
  frontageFt: number;
  depthFt: number;
  facing: Facing;
  coastal: boolean;
  roadSide: "front" | "back";
  build: "courtyard" | "envelope";
  className?: string;
  /** controls rendered by the parent? (home page puts them in its own column) */
  onReady?: (api: { setMode: (m: SiteMode) => void; setHour: (h: number) => void }) => void;
  mode?: SiteMode;
  hour?: number;
  label: string;
};

/**
 * Interactive 3D site model. Three.js (~half a megabyte) is fetched only
 * when the model nears the viewport; rendering pauses when it scrolls away
 * and only runs while something changes (rain, drag, camera move).
 */
export function SiteModel({
  frontageFt,
  depthFt,
  facing,
  coastal,
  roadSide,
  build,
  className = "",
  mode = "day",
  hour = 9,
  label,
}: SiteModelProps) {
  const host = useRef<HTMLDivElement | null>(null);
  const overlay = useRef<HTMLDivElement | null>(null);
  const north = useRef<HTMLDivElement | null>(null);
  const scale = useRef<HTMLSpanElement | null>(null);
  const scene = useRef<SiteScene | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "fallback">("idle");

  useEffect(() => {
    const el = host.current;
    if (!el || !overlay.current) return;
    if (!hasWebGL()) {
      setState("fallback");
      return;
    }
    let disposed = false;
    const io = new IntersectionObserver(
      async ([e]) => {
        if (!e.isIntersecting || scene.current) return;
        io.disconnect();
        setState("loading");
        try {
          const { createSiteScene } = await import("./siteScene");
          if (disposed || !overlay.current) return;
          scene.current = createSiteScene(el, {
            frontageFt,
            depthFt,
            facing,
            coastal,
            roadSide,
            build,
            reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
            overlay: overlay.current,
            northEl: north.current,
            scaleEl: scale.current,
            scaleMeters: 20,
          });
          setState("ready");
        } catch (err) {
          console.error("[v2 site model]", err);
          setState("fallback");
        }
      },
      { rootMargin: "500px 0px" },
    );
    io.observe(el);
    return () => {
      disposed = true;
      io.disconnect();
      scene.current?.dispose();
      scene.current = null;
    };
  }, [frontageFt, depthFt, facing, coastal, roadSide, build]);

  useEffect(() => {
    scene.current?.setMode(mode);
  }, [mode, state]);
  useEffect(() => {
    scene.current?.setHour(hour);
  }, [hour, state]);

  return (
    <div className={`v2-model ${className}`} role="img" aria-label={label}>
      <div ref={host} className="absolute inset-0" />
      <div ref={overlay} className="absolute inset-0 pointer-events-none" aria-hidden="true" />
      {state !== "ready" && (
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <p className="v2-label" style={{ color: "var(--on-dark-2)" }} aria-live="polite">
            {state === "fallback"
              ? "3D view unavailable on this device — see the site plan"
              : "Preparing the site model…"}
          </p>
        </div>
      )}
      {/* Scale bar + north arrow (both live: they follow the camera) */}
      <div
        className="absolute right-4 bottom-4 flex items-end gap-5 pointer-events-none"
        style={{ color: "var(--on-dark)" }}
        aria-hidden="true"
      >
        <div className="text-[10px] font-semibold tracking-[0.1em]">
          <span className="flex justify-between mb-1 gap-3">
            <span>0</span>
            <span>20 m</span>
          </span>
          <span
            ref={scale}
            className="block h-[6px] min-w-12 border-x border-b"
            style={{ borderColor: "currentColor", width: 90 }}
          />
        </div>
        <div className="grid place-items-center w-9">
          <span className="text-[10px] font-semibold">N</span>
          <div
            ref={north}
            className="w-6 h-6 grid place-items-center"
            style={{ transition: "none" }}
          >
            <svg width="14" height="20" viewBox="0 0 14 20">
              <path d="M7 0 13 19 7 15 1 19Z" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>
      <p
        className="hidden sm:block absolute left-4 bottom-4 v2-caption pointer-events-none max-w-[60%]"
        style={{ color: "var(--on-dark-3)" }}
      >
        Indicative model · drag to turn · not survey data
      </p>
      <span className="sr-only">Current time in model: {hhmm(hour)}</span>
    </div>
  );
}

export { hhmm };
