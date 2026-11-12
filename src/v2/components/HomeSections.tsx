import { Link } from "@tanstack/react-router";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { fmt, listings, places, plotArea, regions, type Img, type Listing } from "../data";
import { EASE, Item, LineReveal, Stagger, Stroke } from "../motion";
import { Picture } from "./Picture";
import { PlaceCredit } from "./PlaceFigure";
import { StatusTag } from "./ListingCard";
import { SitePlan } from "./Drawings";
import { Arrow } from "./Logo";

const useIsoLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;

/* ————————————————————————————————————————————————————————————————
 * A day here — four frames that slide horizontally while you scroll
 * (desktop). Mobile / reduced motion: a native swipeable strip.
 * ———————————————————————————————————————————————————————————————— */
export function DaySequence({ frames }: { frames: { time: string; text: string; image: Img }[] }) {
  const reduce = useReducedMotion();
  const outer = useRef<HTMLDivElement | null>(null);
  const track = useRef<HTMLDivElement | null>(null);
  const [range, setRange] = useState(0);
  const [desktop, setDesktop] = useState(false);

  useIsoLayout(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const set = () => setDesktop(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);
  const pinned = desktop && !reduce;
  useIsoLayout(() => {
    if (!pinned) return;
    const measure = () => {
      if (track.current) setRange(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pinned]);

  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -range]);
  const progress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const heading = (
    <div className="shrink-0 w-full lg:w-[min(34vw,30rem)] lg:pr-10 flex flex-col justify-center">
      <p className="v2-label">02 · A day</p>
      <LineReveal
        className="v2-d2 mt-5"
        lines={["A day here", "begins before", "the doors open."]}
      />
      <Stroke className="mt-7" />
      <p className="v2-body mt-7 max-w-sm">
        We plan each house around how light and weather move through it — from the first sun on the
        courtyard floor to the last of it on the water.
      </p>
      {pinned && (
        <div
          className="mt-10 h-px w-40 relative"
          style={{ background: "var(--line)" }}
          aria-hidden="true"
        >
          <motion.span
            className="absolute inset-y-0 left-0 w-full"
            style={{ background: "var(--terracotta)", scaleX: progress, transformOrigin: "left" }}
          />
        </div>
      )}
    </div>
  );

  const items = frames.map((f, i) => (
    <figure key={f.time} className="shrink-0 w-[78vw] sm:w-[52vw] lg:w-[min(44vw,76vh)] snap-start">
      <div className="relative v2-media v2-grain aspect-[4/3]">
        <Picture image={f.image} sizes="(min-width: 1024px) 44vw, 78vw" />
      </div>
      <figcaption className="mt-4 v2-figcap max-w-[26rem]">
        <b>{f.time}</b> — {f.text}
      </figcaption>
      <span className="v2-caption mt-2 block">
        0{i + 1} / 0{frames.length} · Representational
      </span>
    </figure>
  ));

  if (!pinned) {
    return (
      <section id="ch-day" className="v2-section v2-paper" aria-label="A day in the house">
        <div className="v2-wrap">{heading}</div>
        <div className="mt-12 flex gap-5 overflow-x-auto snap-x snap-mandatory px-[var(--gutter)] scroll-px-[var(--gutter)] pb-4 [scrollbar-width:thin]">
          {items}
        </div>
      </section>
    );
  }

  return (
    <section
      id="ch-day"
      ref={outer}
      className="v2-paper relative"
      style={{ height: `calc(100vh + ${range}px)` }}
      aria-label="A day in the house"
    >
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        <motion.div
          ref={track}
          className="shrink-0 flex items-center gap-8 pl-[var(--gutter)] pr-[12vw]"
          style={{ x }}
        >
          {heading}
          {items}
        </motion.div>
      </div>
    </section>
  );
}

/* ————————————————————————————————————————————————————————————————
 * Places — slanted panels of real locality photography.
 * ———————————————————————————————————————————————————————————————— */
export function PlacesSlants() {
  return (
    <section id="ch-places" aria-labelledby="places-h">
      <div className="v2-paper">
        <div className="v2-wrap py-14 md:py-20 grid gap-8 lg:grid-cols-12 items-end">
          <div className="lg:col-span-5">
            <p className="v2-label">05 · Places</p>
            <LineReveal
              id="places-h"
              className="v2-d2 mt-5"
              lines={["Five places.", "Five climates."]}
            />
            <Stroke className="mt-7" />
          </div>
          <p className="v2-body lg:col-span-5 lg:col-start-8">
            A coastal house in Alibaug and a farmhouse in Delhi answer different suns, soils and
            monsoons. We design for the place first — these are the places, photographed as they
            are.
          </p>
        </div>
      </div>
      <div className="v2-slants">
        {regions.map((r, i) => {
          const p = places[r.place];
          const n = listings.filter((l) => l.city === r.city).length;
          return (
            <Link
              key={r.city}
              to="/v2/collection"
              search={{ city: r.city }}
              className="v2-slant"
              aria-label={`${r.city}: ${n} ${n === 1 ? "listing" : "listings"}`}
            >
              <div className="absolute inset-0 v2-media">
                <Picture image={p.image} sizes="(min-width: 768px) 30vw, 100vw" />
              </div>
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(0deg, rgb(10 16 12 / 0.7), rgb(10 16 12 / 0) 55%)",
                }}
              />
              <div className="absolute left-0 right-0 bottom-0 p-5 md:pl-6 md:pr-[5vw] md:pb-7">
                <span className="v2-caption block" style={{ color: "var(--on-dark-2)" }}>
                  0{i + 1}
                </span>
                <span
                  className="block mt-1"
                  style={{
                    fontFamily: "var(--f-display)",
                    fontSize: "clamp(1.7rem, 2.3vw, 2.6rem)",
                    lineHeight: 1,
                  }}
                >
                  {r.city}
                </span>
                <span className="v2-label mt-2 block" style={{ color: "var(--on-dark-2)" }}>
                  {n} {n === 1 ? "listing" : "listings"} →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="v2-forest">
        <p
          className="v2-wrap py-3 flex flex-wrap gap-x-5 gap-y-1"
          style={{ color: "var(--on-dark-3)" }}
        >
          <span className="v2-caption">Area photographs, not listings:</span>
          {regions.map((r) => (
            <PlaceCredit
              key={r.city}
              place={places[r.place]}
              className="!text-[color:var(--on-dark-3)]"
            />
          ))}
        </p>
      </div>
    </section>
  );
}

/* ————————————————————————————————————————————————————————————————
 * The collection as an editorial index; hovering a row floats its image
 * beside the cursor (desktop). Touch: thumbnails sit inline.
 * ———————————————————————————————————————————————————————————————— */
function sizeLabel(l: Listing) {
  return l.kind === "plot"
    ? `${fmt(plotArea(l))} sq ft land`
    : `${l.bhk} BHK · ${fmt(l.builtSqft ?? 0)} sq ft`;
}
export function CollectionIndex({ items }: { items: Listing[] }) {
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement | null>(null);
  const [hover, setHover] = useState<Listing | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 180, damping: 24, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 180, damping: 24, mass: 0.6 });

  return (
    <div
      ref={box}
      className="relative"
      onMouseMove={(e) => {
        const r = box.current?.getBoundingClientRect();
        if (!r) return;
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      onMouseLeave={() => setHover(null)}
    >
      <Stagger
        as="ol"
        gap={0.06}
        className="relative z-10"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        {items.map((l, i) => (
          <Item as="li" key={l.slug}>
            <Link
              to="/v2/collection/$slug"
              params={{ slug: l.slug }}
              className="v2-row group"
              onMouseEnter={() => setHover(l)}
              onFocus={() => setHover(null)}
            >
              <span className="v2-label v2-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex items-center gap-4 min-w-0">
                <span className="lg:hidden shrink-0 w-20 aspect-[4/3] relative v2-media">
                  {l.image ? (
                    <Picture image={l.image} sizes="80px" />
                  ) : (
                    <span
                      className="absolute inset-0 grid place-items-center p-1"
                      style={{ background: "var(--parchment)" }}
                    >
                      <SitePlan listing={l} className="w-full h-full" />
                    </span>
                  )}
                </span>
                <span className="v2-row__name">{l.name}</span>
              </span>
              <span className="hidden lg:block text-[0.95rem]" style={{ color: "var(--ink-2)" }}>
                {l.locality}, {l.city}
              </span>
              <span
                className="hidden lg:block text-[0.9rem] v2-num"
                style={{ color: "var(--ink-2)" }}
              >
                {sizeLabel(l)}
              </span>
              <span className="flex items-center gap-3 justify-self-end">
                <span className="hidden sm:inline-flex">
                  <StatusTag status={l.status} />
                </span>
                <span className="transition-transform duration-500 group-hover:translate-x-1">
                  <Arrow size={16} />
                </span>
              </span>
            </Link>
          </Item>
        ))}
      </Stagger>
      {/* floating preview */}
      {!reduce && (
        <motion.div
          className="hidden lg:block absolute left-0 top-0 z-20 pointer-events-none w-[22rem]"
          style={{ x: sx, y: sy, translateX: "-50%", translateY: "-110%" }}
          aria-hidden="true"
        >
          <AnimatePresence mode="popLayout">
            {hover && (
              <motion.div
                key={hover.slug}
                initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="relative v2-media aspect-[4/3] shadow-[0_30px_60px_-25px_rgb(0_0_0_/_0.5)]"
              >
                {hover.image ? (
                  <Picture image={hover.image} sizes="352px" />
                ) : (
                  <div
                    className="absolute inset-0 grid place-items-center p-4 v2-grid-bg"
                    style={{ background: "var(--parchment)" }}
                  >
                    <SitePlan listing={hover} className="w-full h-full" />
                  </div>
                )}
                <span className="absolute left-2 bottom-2 v2-tag v2-tag--plain">
                  {hover.image ? "Representational" : "Site plan · demonstration"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

/* ————————————————————————————————————————————————————————————————
 * The dossier — what a buyer receives before a visit.
 * Statuses describe what the studio provides, never a verification it
 * hasn't done; the closing line hands verification to the buyer's advocate.
 * ———————————————————————————————————————————————————————————————— */
const dossier = [
  {
    t: "Survey & land details",
    s: "Dimensions, levels, survey number",
    icon: (
      <g>
        <path d="M8 46 30 12l34 10-6 30-30 6Z" strokeDasharray="3 3" />
        <path d="M30 12 28 58M8 46l50 6" opacity=".5" />
        <circle cx="52" cy="44" r="9" />
      </g>
    ),
  },
  {
    t: "Title review",
    s: "Title chain & encumbrance, for your advocate",
    icon: (
      <g>
        <rect x="14" y="8" width="40" height="52" />
        {[18, 24, 30, 36, 42].map((y) => (
          <path key={y} d={`M20 ${y}h28`} opacity=".5" />
        ))}
        <circle cx="44" cy="50" r="7" />
      </g>
    ),
  },
  {
    t: "Access",
    s: "Approach road & right of way",
    icon: (
      <g>
        <path d="M24 60 32 8M44 60 36 8" />
        <path d="M34 54v-6M34 40v-6M34 26v-5" opacity=".6" />
        <circle cx="14" cy="22" r="7" opacity=".6" />
        <circle cx="56" cy="30" r="6" opacity=".6" />
      </g>
    ),
  },
  {
    t: "Utilities",
    s: "Water, power and drainage — stated as found",
    icon: (
      <g>
        <path d="M34 60V10M24 16h20M26 24h16" />
        <path d="M34 16 8 30M34 16l26 12" opacity=".5" />
      </g>
    ),
  },
  {
    t: "Construction status",
    s: "Stage, programme and what is underway",
    icon: (
      <g>
        <path d="M10 56V30l22-16 22 16v26Z" />
        <path d="M24 56V40h16v16" opacity=".6" />
        <path d="M6 32 32 12l26 20" />
      </g>
    ),
  },
];
export function Dossier() {
  return (
    <section
      id="ch-dossier"
      className="v2-section v2-paper overflow-hidden"
      aria-labelledby="dossier-h"
    >
      <div className="v2-wrap grid gap-12 lg:grid-cols-12 items-center">
        <div className="lg:col-span-4">
          <p className="v2-label">06 · The dossier</p>
          <LineReveal
            id="dossier-h"
            className="v2-d2 mt-5"
            lines={["Nothing", "important", "stays hidden."]}
          />
          <Stroke className="mt-7" />
          <p className="v2-body mt-7 max-w-sm">
            Before you visit, we send a clear account of what you would be buying, how you reach it,
            what is in place and what is underway. Your own advocate verifies it — we never ask you
            to rely on our word alone.
          </p>
          <Link to="/v2/enquire" search={{ interest: "land" }} className="v2-arrowlink mt-8">
            Ask for a dossier <Arrow />
          </Link>
        </div>
        <Stagger
          as="ol"
          gap={0.09}
          amount={0.3}
          className="lg:col-span-8 flex gap-0 overflow-x-auto lg:overflow-visible snap-x pb-6 pt-4 -mx-[var(--gutter)] px-[var(--gutter)] lg:mx-0 lg:px-0 [scrollbar-width:none]"
        >
          {dossier.map((d, i) => {
            const rot = [-3, 1.5, -1, 2.5, -2][i];
            return (
              <Item
                as="li"
                key={d.t}
                className="snap-start shrink-0 lg:shrink lg:flex-1 -ml-3 first:ml-0"
              >
                <motion.div
                  className="v2-dossier w-[13.5rem] lg:w-auto p-5 pb-6 min-h-[17rem] flex flex-col"
                  style={{ rotate: rot, transformOrigin: "50% 100%" }}
                  whileHover={{
                    rotate: 0,
                    y: -14,
                    zIndex: 5,
                    transition: { duration: 0.5, ease: EASE },
                  }}
                >
                  <span className="v2-label" style={{ color: "var(--terracotta-deep)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 text-[1.45rem] leading-[1.02]">{d.t}</h3>
                  <svg
                    viewBox="0 0 68 68"
                    className="mt-4 w-full h-24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    aria-hidden="true"
                    style={{ color: "#5b4a36" }}
                  >
                    {d.icon}
                  </svg>
                  <p
                    className="mt-auto pt-4 text-[0.82rem] leading-snug"
                    style={{ color: "var(--ink-2)" }}
                  >
                    {d.s}
                  </p>
                  <p
                    className="mt-3 flex items-center gap-2 text-[0.72rem] font-semibold tracking-[0.08em] uppercase"
                    style={{ color: "var(--moss)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                      <circle cx="7" cy="7" r="6.2" fill="none" stroke="currentColor" />
                      <path
                        d="m4 7.2 2 2 4-4.4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.3"
                      />
                    </svg>
                    In the dossier
                  </p>
                </motion.div>
              </Item>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
