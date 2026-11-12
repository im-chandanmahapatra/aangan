/**
 * The home explorer: turn the house in your hands, step inside, and walk
 * from room to room.
 *
 * Three.js loads only when the explorer nears the viewport, and only on a
 * device that can render it. Where it cannot, the floor plan takes over —
 * the same drawing, from the same data, so nothing is lost but the view.
 */
import { lazy, Suspense, useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { motion, useReducedMotion, EASE, Rise, Stroke } from "../motion";
import { roomPhotos } from "../data";
import {
  carpetArea,
  getPlan,
  homePlans,
  openArea,
  roomSize,
  tourRooms,
  type HomePlan,
} from "./plans";
import type { HomeScene, ViewMode } from "./homeScene";

const FloorPlan2D = lazy(() =>
  import("./FloorPlan2D").then((m) => ({ default: m.FloorPlan2D })),
);

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const bedroomCount = (p: HomePlan) => p.rooms.filter((r) => r.type === "bed").length;
const bathCount = (p: HomePlan) => p.rooms.filter((r) => r.type === "bath").length;

export function HomeExplorer({
  initialPlan = "court",
  className = "",
}: {
  initialPlan?: string;
  className?: string;
}) {
  const host = useRef<HTMLDivElement | null>(null);
  const overlay = useRef<HTMLDivElement | null>(null);
  const scene = useRef<HomeScene | null>(null);
  const reduce = useReducedMotion();
  const panelId = useId();

  const [plan, setPlan] = useState<HomePlan>(() => getPlan(initialPlan) ?? homePlans[0]);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "fallback">("idle");
  const [mode, setMode] = useState<ViewMode>("exterior");
  const [room, setRoom] = useState<string | null>(null);
  const [showPlan, setShowPlan] = useState(false);

  // Keep the latest callbacks reachable from the scene without rebuilding it.
  const onMode = useCallback((m: ViewMode) => setMode(m), []);
  const onRoom = useCallback((r: string | null) => setRoom(r), []);

  useEffect(() => {
    const el = host.current;
    if (!el || !overlay.current) return;
    if (!hasWebGL()) {
      setState("fallback");
      return;
    }
    let disposed = false;

    /** Pre-load the scene module so the IO callback is synchronous after it. */
    let sceneModuleP: Promise<typeof import("./homeScene")> | null = null;
    const ensureModule = () => {
      if (!sceneModuleP) sceneModuleP = import("./homeScene");
      return sceneModuleP;
    };

    const boot = async () => {
      setState("loading");
      try {
        const mod = await ensureModule();
        // After the await, React StrictMode may have unmounted us.
        if (disposed) return;
        // Refs may have been swapped — grab them fresh.
        const hostEl = host.current;
        const overlayEl = overlay.current;
        if (!hostEl || !overlayEl) {
          // Refs not ready yet (rare). Fall back gracefully instead of hanging.
          setState("fallback");
          return;
        }
        if (scene.current) return; // already booted by a concurrent call
        const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
        scene.current = mod.createHomeScene(hostEl, {
          planId: plan.id,
          reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          lowPower:
            window.matchMedia("(max-width: 900px)").matches ||
            (navigator.hardwareConcurrency ?? 8) <= 4 ||
            nav.connection?.saveData === true,
          overlay: overlayEl,
          onMode,
          onRoom,
          onReady: () => setState("ready"),
        });
      } catch (err) {
        console.error("[v2 home explorer]", err);
        if (!disposed) setState("fallback");
      }
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || scene.current) return;
        io.disconnect();
        boot();
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => {
      disposed = true;
      io.disconnect();
      scene.current?.dispose();
      scene.current = null;
    };
    // The scene is created once; configuration changes go through setPlan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choose = (p: HomePlan) => {
    setPlan(p);
    setRoom(null);
    setMode("exterior");
    scene.current?.setPlan(p.id);
  };

  const activeRoom = plan.rooms.find((r) => r.id === room) ?? null;
  const photo = activeRoom?.photo ? roomPhotos[activeRoom.photo] : null;
  const tour = tourRooms(plan);

  return (
    <div className={className}>
      {/* ---- configuration switcher ---- */}
      <Rise className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5 mb-7">
        <div>
          <p className="v2-label mb-3" style={{ color: "var(--terracotta)" }}>
            Home types
          </p>
          <h3 className="v2-d3">{plan.name}</h3>
          <p className="v2-body mt-2 max-w-[46ch]" style={{ color: "var(--ink-2)" }}>
            {plan.tagline}
          </p>
        </div>
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Home configuration"
          aria-controls={panelId}
        >
          {homePlans.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              className="v2-chip"
              aria-selected={p.id === plan.id}
              onClick={() => choose(p)}
            >
              {p.config}
            </button>
          ))}
        </div>
      </Rise>

      <div id={panelId} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-8">
        {/* ---- viewport ---- */}
        <div>
          <div className="v2-model v2-model--home">
            <div ref={host} className="absolute inset-0" />
            <div ref={overlay} className="absolute inset-0 pointer-events-none" />

            {state !== "ready" && (
              <div className="absolute inset-0 grid place-items-center p-6 text-center">
                {state === "fallback" ? (
                  <div className="max-w-[34ch]">
                    <p className="v2-label mb-2" style={{ color: "var(--on-dark-2)" }}>
                      3D unavailable on this device
                    </p>
                    <p className="v2-caption" style={{ color: "var(--on-dark-3)" }}>
                      The floor plan below is drawn from the same measurements.
                    </p>
                  </div>
                ) : (
                  <p className="v2-label" style={{ color: "var(--on-dark-2)" }} aria-live="polite">
                    Building the model…
                  </p>
                )}
              </div>
            )}

            {/* ---- viewport controls ---- */}
            {state === "ready" && (
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 flex items-end justify-between gap-3 pointer-events-none">
                <div className="pointer-events-auto">
                  <AnimatePresence mode="wait" initial={false}>
                    {mode === "exterior" ? (
                      <motion.button
                        key="enter"
                        type="button"
                        className="v2-btn v2-btn--light"
                        onClick={() => scene.current?.enter()}
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                        transition={{ duration: 0.4, ease: EASE }}
                      >
                        Enter this home
                      </motion.button>
                    ) : (
                      <motion.button
                        key="exit"
                        type="button"
                        className="v2-btn v2-btn--ghost"
                        onClick={() => scene.current?.exit()}
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                        transition={{ duration: 0.4, ease: EASE }}
                      >
                        Step back out
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
                <p
                  className="v2-caption text-right pointer-events-none hidden sm:block max-w-[22ch]"
                  style={{ color: "var(--on-dark-3)" }}
                >
                  {mode === "exterior"
                    ? "Drag to turn · scroll to zoom"
                    : "Drag to look · tap a doorway to walk through"}
                </p>
              </div>
            )}

            {/* ---- where you are ---- */}
            <AnimatePresence>
              {activeRoom && state === "ready" && (
                <motion.div
                  key={activeRoom.id}
                  className="v2-roomcard"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, x: -14 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <p className="v2-label" style={{ color: "var(--terracotta)" }}>
                    {roomSize(activeRoom)}
                  </p>
                  <p className="v2-roomcard__name mt-1">{activeRoom.name}</p>
                  {activeRoom.note && (
                    <p className="v2-caption mt-2" style={{ color: "var(--on-dark-3)" }}>
                      {activeRoom.note}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ---- room strip ---- */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 v2-noscroll">
            {tour.map((r) => (
              <button
                key={r.id}
                type="button"
                className="v2-chip shrink-0"
                aria-pressed={r.id === room}
                onClick={() => scene.current?.goToRoom(r.id)}
                disabled={state !== "ready"}
              >
                {r.name}
              </button>
            ))}
          </div>

          <p className="v2-caption mt-4" style={{ color: "var(--ink-3)" }}>
            Demonstration layout drawn by the studio to show how a home of this size is
            organised — not a built house, a released project or an offer. Room dimensions
            are measured to wall centres.
          </p>
        </div>

        {/* ---- side column ---- */}
        <div className="lg:border-l lg:pl-8" style={{ borderColor: "var(--line)" }}>
          <Stroke className="mb-5" />
          <dl className="v2-specs">
            <div>
              <dt>Carpet area</dt>
              <dd>{carpetArea(plan).toLocaleString("en-IN")} sq ft</dd>
            </div>
            <div>
              <dt>Open area</dt>
              <dd>
                {openArea(plan) ? `${openArea(plan).toLocaleString("en-IN")} sq ft` : "—"}
              </dd>
            </div>
            <div>
              <dt>Bedrooms</dt>
              <dd>{bedroomCount(plan)}</dd>
            </div>
            <div>
              <dt>Bathrooms</dt>
              <dd>{bathCount(plan)}</dd>
            </div>
            <div>
              <dt>Ceiling</dt>
              <dd>{plan.ceiling} ft</dd>
            </div>
          </dl>

          <ul className="mt-7 space-y-3">
            {plan.idea.map((line) => (
              <li key={line} className="v2-caption flex gap-3" style={{ color: "var(--ink-2)" }}>
                <span aria-hidden="true" style={{ color: "var(--terracotta)" }}>
                  —
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>

          {photo && (
            <figure className="mt-7">
              <img
                src={photo.lg}
                srcSet={`${photo.sm} 720w, ${photo.lg} ${photo.lgW ?? 1440}w`}
                sizes="(min-width:1024px) 19rem, 100vw"
                width={photo.w}
                height={photo.h}
                alt={photo.alt}
                loading="lazy"
                decoding="async"
                className="w-full h-auto"
              />
              <figcaption className="v2-figcap mt-2">
                Representational render of a comparable {activeRoom?.name.toLowerCase()} —
                not this layout.
              </figcaption>
            </figure>
          )}

          <button
            type="button"
            className="v2-arrowlink mt-7"
            onClick={() => setShowPlan((v) => !v)}
            aria-expanded={showPlan}
          >
            {showPlan ? "Hide the floor plan" : "See the floor plan"}
          </button>
        </div>
      </div>

      {/* ---- floor plan ---- */}
      <AnimatePresence initial={false}>
        {(showPlan || state === "fallback") && (
          <motion.div
            key="plan"
            initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="v2-planbox mt-8">
              <Suspense
                fallback={<p className="v2-caption p-6">Drawing the plan…</p>}
              >
                <FloorPlan2D
                  plan={plan}
                  activeRoom={room}
                  onPickRoom={(id) => scene.current?.goToRoom(id)}
                />
              </Suspense>
              <p className="v2-figcap mt-3">
                {plan.config} · {plan.name} — the same data the 3D model is built from.
                Click a room to walk into it.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
