import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { lazy, Suspense, useMemo, useState } from "react";
import { z } from "zod";
import { cities, listings, places, sizeSqft, type Listing } from "@/v2/data";
import { ListingCard } from "@/v2/components/ListingCard";
import { LandFolio } from "@/v2/components/LandFolio";
import { Picture } from "@/v2/components/Picture";
import { useShortlist } from "@/v2/shortlist";
import { Arrow } from "@/v2/components/Logo";
import { Breadcrumbs } from "@/v2/components/Breadcrumbs";
import { EASE, LineReveal, Stroke } from "@/v2/motion";

const MapView = lazy(() => import("@/v2/components/MapView").then((m) => ({ default: m.MapView })));

const search = z.object({
  kind: z.enum(["residence", "plot"]).optional().catch(undefined),
  city: z.string().optional().catch(undefined),
  status: z.enum(["Available", "Under Offer", "Demonstration"]).optional().catch(undefined),
  bhk: z.coerce.number().int().min(1).max(10).optional().catch(undefined),
  sort: z.enum(["featured", "size-desc", "size-asc"]).optional().catch(undefined),
  view: z.enum(["grid", "map"]).optional().catch(undefined),
});
type Search = z.infer<typeof search>;

export const Route = createFileRoute("/v2/collection/")({
  validateSearch: (s) => search.parse(s),
  head: () => ({
    meta: [
      { title: "The collection — residences and land · Aangan" },
      {
        name: "description",
        content:
          "Browse Aangan residences and land across Mumbai, Bengaluru, Goa, Bhubaneswar and Delhi NCR. Filter by type, city, rooms and size.",
      },
      { property: "og:title", content: "The collection — residences and land · Aangan" },
      {
        property: "og:description",
        content:
          "Browse Aangan residences and land across Mumbai, Bengaluru, Goa, Bhubaneswar and Delhi NCR.",
      },
      { property: "og:image", content: "https://aangan.studio/v2/film/aangan-film-poster.webp" },
      { name: "twitter:title", content: "The collection — residences and land · Aangan" },
      {
        name: "twitter:description",
        content:
          "Browse Aangan residences and land across Mumbai, Bengaluru, Goa, Bhubaneswar and Delhi NCR.",
      },
      { name: "twitter:image", content: "https://aangan.studio/v2/film/aangan-film-poster.webp" },
    ],
    links: [{ rel: "canonical", href: "https://aangan.studio/v2/collection" }],
  }),
  component: Collection,
});

function apply(s: Search): Listing[] {
  let r = listings.filter(
    (l) =>
      (!s.kind || l.kind === s.kind) &&
      (!s.city || l.city === s.city) &&
      (!s.status || l.status === s.status) &&
      (!s.bhk || (l.kind === "residence" && (l.bhk ?? 0) >= s.bhk)),
  );
  if (s.sort === "size-desc") r = [...r].sort((a, b) => sizeSqft(b) - sizeSqft(a));
  if (s.sort === "size-asc") r = [...r].sort((a, b) => sizeSqft(a) - sizeSqft(b));
  return r;
}

const heading: Record<string, [string, string]> = {
  residence: ["Residences,", "built slowly."],
  plot: ["Land to", "build on."],
  all: ["Residences", "& land."],
};

function Collection() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/v2/collection/" });
  const results = useMemo(() => apply(s), [s]);
  const [hover, setHover] = useState<string | null>(null);
  const { items } = useShortlist();
  const view = s.view ?? "grid";
  const set = (patch: Partial<Search>) =>
    navigate({
      search: (prev: Search) => ({ ...prev, ...patch }),
      replace: true,
      resetScroll: false,
    });
  const active = [s.kind, s.city, s.status, s.bhk].filter(Boolean).length;
  const countFor = (patch: Partial<Search>) => apply({ ...s, ...patch }).length;
  const h = heading[s.kind ?? "all"];
  const bg = s.kind === "plot" ? places.nandi : places.bhubaneswar;

  return (
    <>
      <section className="relative v2-forest overflow-hidden" aria-labelledby="col-h">
        <div className="absolute inset-0 v2-media opacity-45" aria-hidden="true">
          <Picture image={bg.image} sizes="100vw" priority />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgb(18 28 22 / 0.95) 0%, rgb(18 28 22 / 0.7) 50%, rgb(18 28 22 / 0.35) 100%)",
          }}
        />
        <div className="relative v2-wrap pt-[calc(var(--nav-h)+clamp(3rem,7vw,6rem))] pb-14 md:pb-20">
          <Breadcrumbs crumbs={[{ label: "The collection" }]} dark />
          <div className="mt-5 flex flex-wrap items-end justify-between gap-8">
            <div>
              <p className="v2-label">The collection</p>
              <LineReveal
                key={s.kind ?? "all"}
                as="h1"
                id="col-h"
                immediate
                className="v2-d1 mt-5"
                lines={h}
              />
              <Stroke className="mt-7" />
              <p className="v2-lead mt-7">
                Houses we have designed and built, and land we can build on. Prices are shared on
                enquiry, with plans and the dossier.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3">
              {items.length > 0 && (
                <Link to="/v2/shortlist" className="v2-btn v2-btn--ghost">
                  Your shortlist ({items.length}) <Arrow />
                </Link>
              )}
              <p className="v2-caption" style={{ color: "var(--on-dark-3)" }}>
                Background: {bg.caption} · Photo {bg.credit} / Unsplash
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section
        className="sticky z-30"
        style={{
          top: "var(--nav-h)",
          background: "rgb(243 237 226 / 0.96)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--line)",
        }}
        aria-label="Filters"
      >
        <div className="v2-wrap relative py-3 flex flex-nowrap md:flex-wrap overflow-x-auto md:overflow-visible items-center gap-2 md:gap-3 [&>*]:shrink-0 [scrollbar-width:none]">
          <div className="flex" role="group" aria-label="Type">
            {(
              [
                [undefined, "All"],
                ["residence", "Residences"],
                ["plot", "Land"],
              ] as const
            ).map(([k, label]) => (
              <button
                key={label}
                type="button"
                className="v2-chip v2-seg"
                aria-pressed={s.kind === k}
                onClick={() => set({ kind: k, bhk: k === "plot" ? undefined : s.bhk })}
              >
                {label} <span className="count">{countFor({ kind: k })}</span>
              </button>
            ))}
          </div>
          <span className="hidden md:block w-px h-6" style={{ background: "var(--line)" }} />
          <label className="sr-only" htmlFor="f-city">
            City
          </label>
          <select
            id="f-city"
            className="v2-select v2-select--sm"
            value={s.city ?? ""}
            onChange={(e) => set({ city: e.target.value || undefined })}
          >
            <option value="">All places</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c} ({countFor({ city: c })})
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="f-bhk">
            Bedrooms
          </label>
          <select
            id="f-bhk"
            className="v2-select v2-select--sm"
            value={s.bhk ?? ""}
            disabled={s.kind === "plot"}
            onChange={(e) => set({ bhk: e.target.value ? Number(e.target.value) : undefined })}
          >
            <option value="">Any rooms</option>
            {[4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}+ BHK
              </option>
            ))}
          </select>
          {active > 0 && (
            <button
              type="button"
              className="v2-link text-[0.85rem] px-2"
              onClick={() =>
                set({ kind: undefined, city: undefined, status: undefined, bhk: undefined })
              }
            >
              Clear ({active})
            </button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <label className="sr-only" htmlFor="f-sort">
              Sort
            </label>
            <select
              id="f-sort"
              className="v2-select v2-select--sm"
              value={s.sort ?? "featured"}
              onChange={(e) =>
                set({
                  sort:
                    e.target.value === "featured" ? undefined : (e.target.value as Search["sort"]),
                })
              }
            >
              <option value="featured">Featured</option>
              <option value="size-desc">Largest first</option>
              <option value="size-asc">Smallest first</option>
            </select>
            <div className="flex" role="group" aria-label="View">
              {(["grid", "map"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  className="v2-chip v2-seg"
                  aria-pressed={view === v}
                  onClick={() => set({ view: v === "grid" ? undefined : v })}
                >
                  {v === "grid" ? "Grid" : "Map"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="v2-wrap py-10 md:py-14" aria-live="polite" aria-label="Results">
        <p className="v2-label mb-8">
          {results.length} {results.length === 1 ? "listing" : "listings"}
          {s.city ? ` in ${s.city}` : ""}
        </p>

        {results.length === 0 ? (
          <div
            className="py-20 text-center grid place-items-center gap-5"
            style={{ border: "1px dashed var(--line-strong)" }}
          >
            <h2 className="v2-d3">Nothing matches those filters.</h2>
            <p className="v2-body max-w-md">
              Our collection is deliberately small. Clear a filter, or tell us what you’re looking
              for — we often know of houses and land before they’re listed.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                className="v2-btn v2-btn--ink"
                onClick={() =>
                  set({ kind: undefined, city: undefined, status: undefined, bhk: undefined })
                }
              >
                Clear filters
              </button>
              <Link to="/v2/enquire" className="v2-btn v2-btn--line">
                Tell us what you need
              </Link>
            </div>
          </div>
        ) : view === "map" ? (
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 lg:order-2">
              <div className="lg:sticky" style={{ top: "calc(var(--nav-h) + 5rem)" }}>
                <Suspense
                  fallback={
                    <div
                      className="aspect-[4/3] grid place-items-center v2-label"
                      style={{ background: "var(--parchment)" }}
                    >
                      Loading map…
                    </div>
                  }
                >
                  <MapView
                    listings={results}
                    activeSlug={hover}
                    onSelect={(slug) => navigate({ to: "/v2/collection/$slug", params: { slug } })}
                    className="aspect-[4/3] lg:aspect-auto lg:h-[calc(100svh-12rem)]"
                    label="Map of listings"
                  />
                </Suspense>
                <p className="v2-caption mt-2">
                  Pins mark the locality, not the address · dashed pins are demonstration land
                </p>
              </div>
            </div>
            <div className="lg:col-span-5 lg:order-1 grid gap-12">
              {results.map((l) => (
                <ListingCard
                  key={l.slug}
                  l={l}
                  onHover={setHover}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                />
              ))}
            </div>
          </div>
        ) : s.kind === "plot" ? (
          <LandFolio plots={results} onHover={setHover} />
        ) : (
          <motion.div layout className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {results.map((l, i) => (
                <motion.div
                  key={l.slug}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.7, ease: EASE, delay: Math.min(i, 6) * 0.05 },
                  }}
                  exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.25 } }}
                >
                  <ListingCard l={l} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      <section className="v2-earth">
        <div className="v2-wrap py-16 flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="v2-d3">Don’t see the right house or land?</h2>
            <p className="v2-body mt-3 max-w-xl">
              We can design and build on land you already own, or look for a site with you.
            </p>
          </div>
          <Link to="/v2/enquire" className="v2-btn v2-btn--light">
            Book a consultation <Arrow />
          </Link>
        </div>
      </section>
    </>
  );
}
