import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { fmt, getListing, listings, placeFor, plotArea, type Listing } from "@/v2/data";
import { PlaceFigure } from "@/v2/components/PlaceFigure";
import { Picture } from "@/v2/components/Picture";
import { FloorPlan, SitePlan } from "@/v2/components/Drawings";
import { ListingCard, StatusTag } from "@/v2/components/ListingCard";
import { ShortlistButton } from "@/v2/components/ShortlistButton";
import { EnquiryForm } from "@/v2/components/EnquiryForm";
import { Lightbox } from "@/v2/components/Lightbox";
import { Arrow } from "@/v2/components/Logo";
import { homePlans } from "@/v2/home/plans";
import { CourtyardPlan } from "@/v2/components/CourtyardPlan";
import { SiteModel, hhmm } from "@/v2/components/SiteModel";
import type { SiteMode } from "@/v2/components/siteScene";
import {
  Item,
  LineReveal,
  Rise,
  Stagger,
  Stroke,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "@/v2/motion";

const MapView = lazy(() => import("@/v2/components/MapView").then((m) => ({ default: m.MapView })));

export const Route = createFileRoute("/v2/collection/$slug")({
  loader: ({ params }) => {
    const listing = getListing(params.slug);
    if (!listing) throw notFound();
    return { listing };
  },
  head: ({ loaderData }) => {
    const l = loaderData?.listing;
    const title = l ? `${l.name} — ${l.locality}, ${l.city} · Aangan` : "Listing · Aangan";
    return {
      meta: [
        { title },
        { name: "description", content: l?.headline ?? "A listing from the Aangan collection." },
        { property: "og:title", content: title },
        { property: "og:description", content: l?.headline ?? "" },
        ...(l?.demo ? [{ name: "robots", content: "noindex" }] : []),
      ],
    };
  },
  notFoundComponent: () => (
    <section className="v2-wrap v2-section" style={{ paddingTop: "calc(var(--nav-h) + 6rem)" }}>
      <p className="v2-label">Not found</p>
      <h1 className="v2-d2 mt-4">This listing isn’t in the collection.</h1>
      <p className="v2-lead mt-5">It may have been sold or withdrawn.</p>
      <Link to="/v2/collection" className="v2-btn v2-btn--ink mt-8">
        Browse the collection <Arrow />
      </Link>
    </section>
  ),
  component: Detail,
});

type Tab = "plan" | "area" | "map";

function factsFor(l: Listing): [string, string][] {
  return l.kind === "plot" && l.plot
    ? [
        ["Land area", `${fmt(plotArea(l))} sq ft`],
        ["Approx. acres", (plotArea(l) / 43560).toFixed(2)],
        ["Frontage × depth", `${l.plot.frontageFt} × ${l.plot.depthFt} ft`],
        ["Facing", l.plot.facing],
        ["Locality", l.locality],
        ["Price", "On enquiry"],
      ]
    : [
        ["Configuration", `${l.bhk} BHK`],
        ["Built area", `${fmt(l.builtSqft ?? 0)} sq ft`],
        ["Locality", `${l.locality}, ${l.city}`],
        ["Status", l.status],
        ...(l.timeline.length
          ? ([["Handover", l.timeline[l.timeline.length - 1].date]] as [string, string][])
          : []),
        ["Price", "On enquiry"],
      ];
}

function Breadcrumb({ l, dark }: { l: Listing; dark?: boolean }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="v2-label flex gap-2"
      style={dark ? { color: "var(--on-dark-2)" } : undefined}
    >
      <Link to="/v2/collection" className="v2-link">
        Collection
      </Link>
      <span aria-hidden="true">/</span>
      <Link to="/v2/collection" search={{ kind: l.kind }} className="v2-link">
        {l.kind === "plot" ? "Land" : "Residences"}
      </Link>
      <span aria-hidden="true">/</span>
      <span aria-current="page" style={{ color: dark ? "var(--on-dark)" : "var(--ink)" }}>
        {l.name}
      </span>
    </nav>
  );
}

/** Residence: a full-bleed photographic arrival with the facts laid over it. */
function ResidenceHero({ l, onOpen }: { l: Listing; onOpen: () => void }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 900], [0, 180]);
  const s = useTransform(scrollY, [0, 900], [1.04, 1.14]);
  const short = l.headline;
  return (
    <section
      className="relative min-h-[100svh] flex items-end overflow-hidden v2-forest"
      aria-labelledby="l-h"
    >
      <motion.div className="absolute inset-0" style={reduce ? undefined : { y, scale: s }}>
        <motion.div
          className="absolute inset-0 v2-media v2-grain"
          initial={reduce ? false : { scale: 1.12, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {l.image && <Picture image={l.image} sizes="100vw" priority />}
        </motion.div>
      </motion.div>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(0deg, rgb(12 18 14 / 0.92) 0%, rgb(12 18 14 / 0.55) 35%, rgb(12 18 14 / 0) 65%), linear-gradient(180deg, rgb(12 18 14 / 0.5), rgb(12 18 14 / 0) 25%)",
        }}
      />
      <div className="relative v2-wrap pb-10 md:pb-14 pt-[calc(var(--nav-h)+2rem)] w-full">
        <Breadcrumb l={l} dark />
        <div className="mt-6 grid gap-8 lg:grid-cols-12 items-end">
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-3">
              <StatusTag status={l.status} />
              <span className="v2-label" style={{ color: "var(--on-dark-2)" }}>
                {l.locality}, {l.city}
              </span>
            </div>
            <LineReveal
              as="h1"
              id="l-h"
              immediate
              delay={0.3}
              className="v2-d1 mt-5"
              lines={[l.name]}
            />
            <motion.p
              className="v2-italic mt-5 text-[1.4rem] leading-snug max-w-xl"
              style={{ color: "var(--on-dark-2)" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.9 }}
            >
              {short}
            </motion.p>
          </div>
          <motion.dl
            className="lg:col-span-5 grid grid-cols-3 gap-0"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.8 } } }}
          >
            {[
              ["Rooms", `${l.bhk} BHK`],
              ["House", `${fmt(l.builtSqft ?? 0)} sq ft`],
              ["Price", "On enquiry"],
            ].map(([k, v], i) => (
              <motion.div
                key={k}
                className={i ? "pl-4" : ""}
                style={i ? { borderLeft: "1px solid var(--line-strong)" } : undefined}
                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
              >
                <dt className="v2-label" style={{ color: "var(--on-dark-2)" }}>
                  {k}
                </dt>
                <dd className="mt-1.5 text-[1rem] font-medium v2-num">{v}</dd>
              </motion.div>
            ))}
          </motion.dl>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href="#enquire" className="v2-btn v2-btn--primary">
            Request a site visit <Arrow />
          </a>
          <button type="button" onClick={onOpen} className="v2-btn v2-btn--ghost">
            View full image
          </button>
          <ShortlistButton slug={l.slug} name={l.name} variant="chip" />
          <span className="v2-caption ml-auto" style={{ color: "var(--on-dark-3)" }}>
            Representational image
          </span>
        </div>
      </div>
    </section>
  );
}

/** Plot: the land itself, as an interactive 3D model drawn to its dimensions. */
function PlotHero({ l }: { l: Listing }) {
  const [mode, setMode] = useState<SiteMode>("day");
  const [hour, setHour] = useState(10);
  return (
    <section className="v2-forest pt-[calc(var(--nav-h)+1.75rem)] pb-12" aria-labelledby="l-h">
      <div className="v2-wrap">
        <Breadcrumb l={l} dark />
        <div className="mt-6 grid gap-8 lg:grid-cols-12 items-end">
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-3">
              <StatusTag status={l.status} />
              <span className="v2-label">
                {l.locality}, {l.city}
              </span>
            </div>
            <LineReveal
              as="h1"
              id="l-h"
              immediate
              delay={0.1}
              className="v2-d1 mt-5"
              lines={[l.name]}
            />
            <p
              className="v2-italic mt-4 text-[1.35rem] leading-snug max-w-xl"
              style={{ color: "var(--on-dark-2)" }}
            >
              {l.headline}
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-wrap gap-3 lg:justify-end">
            <ShortlistButton slug={l.slug} name={l.name} variant="chip" />
          </div>
        </div>
        <p
          className="v2-notice mt-8"
          style={{
            borderColor: "var(--on-dark-3)",
            color: "var(--on-dark-2)",
            background: "rgb(255 255 255 / 0.04)",
          }}
        >
          <strong className="font-semibold" style={{ color: "var(--on-dark)" }}>
            Demonstration listing.
          </strong>
          <span>
            This plot shows how the studio presents land; it is not live inventory. Title, zoning
            and approvals would be verified independently before any offer.
          </span>
        </p>
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <SiteModel
            className="lg:col-span-9 w-full aspect-[4/5] sm:aspect-[16/11] lg:aspect-[16/9]"
            frontageFt={l.plot!.frontageFt}
            depthFt={l.plot!.depthFt}
            facing={l.plot!.facing}
            coastal={l.site?.coastal ?? false}
            roadSide={l.site?.roadSide ?? "front"}
            build="envelope"
            mode={mode}
            hour={hour}
            label={`Interactive 3D model of ${l.name}: ${l.plot!.frontageFt} by ${l.plot!.depthFt} feet, ${l.plot!.facing.toLowerCase()}-facing, with an indicative building envelope. Drag to turn.`}
          />
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="grid gap-2" role="group" aria-label="Model view">
              {(
                [
                  ["day", "Daylight"],
                  ["monsoon", "Monsoon"],
                  ["measure", "Measure"],
                ] as [SiteMode, string][]
              ).map(([k, t]) => (
                <button
                  key={k}
                  type="button"
                  className="v2-toggle"
                  aria-pressed={mode === k}
                  onClick={() => setMode(k)}
                >
                  {t}
                </button>
              ))}
            </div>
            {mode === "day" && (
              <label className="v2-field">
                <span>
                  Time of day ·{" "}
                  <span className="v2-num" style={{ color: "var(--on-dark)" }}>
                    {hhmm(hour)}
                  </span>
                </span>
                <input
                  type="range"
                  className="v2-range"
                  min={6}
                  max={18}
                  step={0.25}
                  value={hour}
                  aria-valuetext={hhmm(hour)}
                  onChange={(e) => setHour(Number(e.target.value))}
                  style={{ color: "var(--on-dark)" }}
                />
              </label>
            )}
            <p className="text-[0.85rem]" style={{ color: "var(--on-dark-3)" }}>
              Frontage, depth and facing are the listing’s. Terrain, trees and the envelope are
              indicative — not survey data.
            </p>
            <a href="#enquire" className="v2-btn v2-btn--primary mt-auto">
              Ask about this land <Arrow />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Detail() {
  const { listing: l } = Route.useLoaderData();
  const isPlot = l.kind === "plot";
  const area = placeFor(l.slug);
  const [tab, setTab] = useState<Tab>("plan");
  const [lightbox, setLightbox] = useState(false);
  const others = listings
    .filter((o) => o.slug !== l.slug && (o.kind === l.kind || o.city === l.city))
    .slice(0, 3);
  const facts = factsFor(l);

  return (
    <>
      {isPlot ? <PlotHero l={l} /> : <ResidenceHero l={l} onOpen={() => setLightbox(true)} />}

      {/* Body + sticky facts aside */}
      <section className="v2-wrap py-16 md:py-24 grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7 grid gap-16">
          <Rise>
            <p className="v2-label">{isPlot ? "The land" : "The house"}</p>
            <p
              className="mt-5 text-[1.6rem] md:text-[2.1rem] leading-[1.22]"
              style={{ fontFamily: "var(--f-display)" }}
            >
              {l.description}
            </p>
          </Rise>

          <div>
            <h2 className="v2-label">Key features</h2>
            <Stagger
              as="ul"
              className="mt-5 grid sm:grid-cols-3 gap-px"
              style={{ background: "var(--line)" }}
            >
              {l.features.map((f, i) => (
                <Item as="li" key={f} className="p-5" style={{ background: "var(--ivory)" }}>
                  <span className="v2-label" style={{ color: "var(--terracotta)" }}>
                    0{i + 1}
                  </span>
                  <p className="mt-3 text-[0.95rem] leading-snug">{f}</p>
                </Item>
              ))}
            </Stagger>
          </div>

          {l.materials.length > 0 && (
            <div>
              <h2 className="v2-label">Materials · named and sourced</h2>
              <Stagger as="ol" className="mt-5" style={{ borderTop: "1px solid var(--line)" }}>
                {l.materials.map((m, i) => (
                  <Item
                    as="li"
                    key={m.name}
                    className="py-4 grid grid-cols-[2.5rem_1fr] sm:grid-cols-[2.5rem_1fr_auto] gap-x-4 gap-y-1 items-baseline"
                    style={{ borderBottom: "1px solid var(--line)" }}
                  >
                    <span className="v2-label">{String(i + 1).padStart(2, "0")}</span>
                    <span style={{ fontFamily: "var(--f-display)", fontSize: "1.5rem" }}>
                      {m.name}
                    </span>
                    <span className="v2-figcap col-start-2 sm:col-start-3 text-[0.95rem]">
                      {m.provenance}
                    </span>
                  </Item>
                ))}
              </Stagger>
            </div>
          )}

          {l.timeline.length > 0 && (
            <div>
              <h2 className="v2-label">Build timeline</h2>
              <Stagger
                as="ol"
                className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-6 pt-5"
                style={{ borderTop: "1px solid var(--line)" }}
              >
                {l.timeline.map((t) => (
                  <Item as="li" key={t.phase}>
                    <p className="v2-label v2-num">{t.date}</p>
                    <p
                      className="mt-2"
                      style={{ fontFamily: "var(--f-display)", fontSize: "1.5rem" }}
                    >
                      {t.phase}
                    </p>
                  </Item>
                ))}
              </Stagger>
            </div>
          )}

          {isPlot && (
            <div>
              <h2 className="v2-label">Before any offer, we would verify</h2>
              <ul className="mt-5 grid sm:grid-cols-2 gap-x-8 gap-y-3 text-[0.95rem]">
                {[
                  "Title chain and encumbrance certificate",
                  "Land use, conversion and zoning",
                  "Setbacks, FSI and height limits",
                  "Access road width and right of way",
                  "Soil, water table and drainage",
                  "Coastal or heritage restrictions, if any",
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-[0.7em] w-3 h-px flex-none"
                      style={{ background: "var(--terracotta)" }}
                    />
                    {t}
                  </li>
                ))}
              </ul>
              <p className="v2-body mt-5">
                Verification is carried out with your own advocate. We share what we know; we never
                ask you to rely on it alone.
              </p>
            </div>
          )}
        </div>

        <aside className="lg:col-span-4 lg:col-start-9">
          <div
            className="lg:sticky grid gap-6 p-6 md:p-8 v2-paper"
            style={{ top: "calc(var(--nav-h) + 1.5rem)", border: "1px solid var(--line)" }}
          >
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt className="v2-label">{k}</dt>
                  <dd
                    className="mt-1 v2-num"
                    style={{ fontFamily: "var(--f-display)", fontSize: "1.45rem", lineHeight: 1.1 }}
                  >
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
            <hr className="v2-rule" />
            <div className="grid gap-3">
              <a href="#enquire" className="v2-btn v2-btn--primary w-full">
                {isPlot ? "Ask about this land" : "Request a site visit"} <Arrow />
              </a>
              <a href="#enquire" className="v2-btn v2-btn--line w-full">
                Ask for plans, dossier &amp; price
              </a>
            </div>
            <p className="text-[0.8125rem]" style={{ color: "var(--ink-3)" }}>
              Replies come from a studio partner within two working days.
            </p>
          </div>
        </aside>
      </section>

      {/* Drawings & place viewer */}
      <section className="v2-surface v2-section" aria-labelledby="draw-h">
        <div className="v2-wrap">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
            <div>
              <p className="v2-label">Drawings &amp; place</p>
              <h2 id="draw-h" className="v2-d2 mt-4">
                {isPlot ? "The site, on paper." : "The plan, and where it sits."}
              </h2>
              <Stroke className="mt-6" />
            </div>
            <div className="flex gap-2" role="tablist" aria-label="View">
              {(
                [
                  ["plan", isPlot ? "Site plan" : "Plan"],
                  ...(area ? [["area", "Area photo"]] : []),
                  ["map", "Location"],
                ] as [Tab, string][]
              ).map(([k, label]) => (
                <button
                  key={k}
                  role="tab"
                  type="button"
                  aria-selected={tab === k}
                  aria-controls={`panel-${k}`}
                  id={`tab-${k}`}
                  className="v2-chip"
                  onClick={() => setTab(k)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div
            className="relative aspect-[4/3] md:aspect-[16/8]"
            style={{ background: "var(--ivory)", border: "1px solid var(--line)" }}
          >
            {tab === "plan" && (
              <motion.div
                key="plan"
                role="tabpanel"
                id="panel-plan"
                aria-labelledby="tab-plan"
                className="absolute inset-0 v2-grid-bg p-6 md:p-12 grid place-items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {isPlot ? (
                  <SitePlan listing={l} className="w-full h-full" />
                ) : l.plan === "long-court" ? (
                  <CourtyardPlan className="w-full h-full max-w-4xl" />
                ) : (
                  <FloorPlan plan={l.plan} className="w-full h-full max-w-4xl" />
                )}
                <span className="absolute left-3 bottom-3 v2-caption">
                  {isPlot
                    ? "Drawn to the stated dimensions · envelope is indicative"
                    : "Ground floor · schematic only — working drawings shared on enquiry"}
                </span>
              </motion.div>
            )}
            {tab === "area" && area && (
              <motion.div
                key="area"
                role="tabpanel"
                id="panel-area"
                aria-labelledby="tab-area"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="absolute inset-0 v2-media">
                  <Picture image={area.image} sizes="(min-width: 1440px) 1340px, 100vw" />
                </div>
                <div
                  className="absolute inset-x-0 bottom-0 p-3 md:p-4 flex flex-wrap items-end justify-between gap-2"
                  style={{ background: "linear-gradient(transparent, rgb(12 18 14 / 0.65))" }}
                >
                  <span className="v2-tag">Area photograph — not the listing</span>
                  <a
                    href={area.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="v2-caption v2-link"
                    style={{ color: "var(--on-dark)" }}
                  >
                    {area.caption} · Photo {area.credit} / Unsplash
                  </a>
                </div>
              </motion.div>
            )}
            {tab === "map" && (
              <div
                role="tabpanel"
                id="panel-map"
                aria-labelledby="tab-map"
                className="absolute inset-0"
              >
                <Suspense
                  fallback={
                    <div className="absolute inset-0 grid place-items-center v2-label">
                      Loading map…
                    </div>
                  }
                >
                  <MapView
                    listings={[l]}
                    zoom={isPlot ? 13 : 14}
                    className="absolute inset-0"
                    label={`Approximate location of ${l.name}`}
                  />
                </Suspense>
              </div>
            )}
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h3 className="v2-label">Around {l.locality}</h3>
              <ul className="mt-5 flex flex-wrap gap-2">
                {l.nearby.map((n) => (
                  <li key={n} className="v2-chip" style={{ cursor: "default" }}>
                    {n}
                  </li>
                ))}
              </ul>
              <p className="v2-caption mt-3">
                Locality shown approximately · exact address shared on a confirmed visit
              </p>
            </div>
            {area && (
              <div className="lg:col-span-5 lg:col-start-8 max-w-md">
                <PlaceFigure
                  place={area}
                  sizes="(min-width: 1024px) 28rem, 100vw"
                  aspect="aspect-[4/3]"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {!isPlot && (() => {
        const bhk = l.bhk ?? 3;
        const exact = homePlans.find(p => p.config === `${bhk} BHK`);
        // No exact match → pick the closest (largest that doesn't exceed, or just the largest)
        const closest = [...homePlans]
          .sort((a, b) => Math.abs(parseFloat(a.config) - bhk) - Math.abs(parseFloat(b.config) - bhk))[0];
        const match = exact ?? closest;
        if (!match) return null;
        return (
          <section className="v2-earth v2-section" aria-labelledby="walk-h">
            <div className="v2-wrap grid gap-8 lg:grid-cols-12 items-center">
              <div className="lg:col-span-7">
                <Rise>
                  <p className="v2-label" style={{ color: "var(--brass)" }}>
                    Interactive 3D walkthrough
                  </p>
                  <h2 id="walk-h" className="v2-d3 mt-4" style={{ color: "var(--on-dark)" }}>
                    Walk through {match.name} — our {match.config} layout.
                  </h2>
                  <p className="v2-body mt-5" style={{ color: "var(--on-dark-2)", maxWidth: "44ch" }}>
                    {match.tagline} Turn the model, step inside, and explore
                    room by room before you visit the real thing.
                  </p>
                  <Link
                    to="/v2/homes"
                    search={{ plan: match.id }}
                    className="v2-btn v2-btn--light mt-8"
                  >
                    Explore the {match.config} layout <Arrow />
                  </Link>
                </Rise>
              </div>
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-xs aspect-square rounded-2xl" style={{
                  background: "radial-gradient(circle at 40% 40%, var(--brass-glass), transparent 70%), var(--earth)",
                  border: "1px solid var(--line-strong)",
                  display: "grid",
                  placeItems: "center",
                }}>
                  <div style={{ color: "var(--brass)", textAlign: "center" }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <p className="v2-label mt-3">{match.config}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      <section id="enquire" className="v2-forest v2-section scroll-mt-16" aria-labelledby="enq-h">
        <div className="v2-wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="v2-label">Enquire</p>
            <LineReveal
              id="enq-h"
              className="v2-d2 mt-5"
              lines={
                isPlot ? ["Talk to us", "about this land."] : ["Walk it once.", `Visit ${l.name}.`]
              }
            />
            <Stroke className="mt-7" />
            <p className="v2-lead mt-7">
              Tell us a little about yourself and when you could visit. Plans, the dossier and price
              are shared personally, not published.
            </p>
          </div>
          <div className="lg:col-span-7 p-6 md:p-10 v2-paper v2-light">
            <EnquiryForm listings={[l]} defaultVisit={!isPlot} />
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="v2-wrap v2-section" aria-labelledby="more-h">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 id="more-h" className="v2-d3">
              You might also consider
            </h2>
            <Link to="/v2/collection" className="v2-btn v2-btn--line">
              Full collection <Arrow />
            </Link>
          </div>
          <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o: Listing) => (
              <ListingCard key={o.slug} l={o} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile action bar */}
      <div
        className="lg:hidden fixed inset-x-0 bottom-0 z-50 p-3 flex gap-2"
        style={{
          background: "rgb(243 237 226 / 0.96)",
          borderTop: "1px solid var(--line)",
          backdropFilter: "blur(8px)",
        }}
      >
        <ShortlistButton slug={l.slug} name={l.name} variant="icon" />
        <a href="#enquire" className="v2-btn v2-btn--primary flex-1">
          {isPlot ? "Ask about this land" : "Request a site visit"}
        </a>
      </div>
      <div className="lg:hidden h-20" aria-hidden="true" />

      {lightbox && l.image && (
        <Lightbox
          slides={[
            {
              image: l.image,
              title: l.name,
              meta: `${l.locality}, ${l.city} · representational image`,
            },
          ]}
          index={0}
          onIndex={() => {}}
          onClose={() => setLightbox(false)}
        />
      )}
    </>
  );
}
