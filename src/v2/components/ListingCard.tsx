import { Link } from "@tanstack/react-router";
import { fmt, placeFor, plotArea, type Listing } from "../data";
import { Picture } from "./Picture";
import { PlotPlate } from "./PlotPlate";
import { ShortlistButton } from "./ShortlistButton";
import { Arrow } from "./Logo";

export function StatusTag({ status }: { status: Listing["status"] }) {
  return (
    <span className="v2-tag" data-status={status}>
      {status === "Demonstration" ? "Sample site study" : status}
    </span>
  );
}

export function ListingFacts({ l }: { l: Listing }) {
  const facts =
    l.kind === "plot" && l.plot
      ? [
          ["Land", `${fmt(plotArea(l))} sq ft`],
          ["Size", `${l.plot.frontageFt} × ${l.plot.depthFt} ft`],
          ["Facing", l.plot.facing],
        ]
      : [
          ["Rooms", `${l.bhk} BHK`],
          ["Built", `${fmt(l.builtSqft ?? 0)} sq ft`],
          ["Price", "On enquiry"],
        ];
  return (
    <dl className="grid grid-cols-3 pt-4" style={{ borderTop: "1px solid var(--line)" }}>
      {facts.map(([k, v], i) => (
        <div
          key={k}
          className={i ? "pl-3" : ""}
          style={i ? { borderLeft: "1px solid var(--line)" } : undefined}
        >
          <dt className="v2-label">{k}</dt>
          <dd className="mt-1 text-[0.9rem] v2-num">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ListingCard({
  l,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  onHover,
}: {
  l: Listing;
  sizes?: string;
  onHover?: (slug: string | null) => void;
}) {
  const isPlot = l.kind === "plot" && !!l.plot;
  const place = isPlot ? placeFor(l.slug) : undefined;
  const acres = isPlot ? (plotArea(l) / 43560).toFixed(2) : null;

  return (
    <article
      className="group relative"
      onMouseEnter={() => onHover?.(l.slug)}
      onMouseLeave={() => onHover?.(null)}
      onFocus={() => onHover?.(l.slug)}
      onBlur={() => onHover?.(null)}
    >
      <div className="absolute right-3 top-3 z-20">
        <ShortlistButton slug={l.slug} name={l.name} variant="icon" />
      </div>
      <Link
        to="/v2/collection/$slug"
        params={{ slug: l.slug }}
        className="block no-underline text-inherit"
        aria-label={`${l.name}, ${l.locality}, ${l.city}`}
      >
        <div className="relative v2-media v2-zoom aspect-[4/3]">
          {l.image ? (
            <Picture image={l.image} sizes={sizes} />
          ) : place ? (
            <Picture image={place.image} sizes={sizes} />
          ) : (
            <PlotPlate listing={l} />
          )}
          <span
            className="absolute inset-x-0 bottom-0 z-20 h-1 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700"
            style={{ background: "var(--terracotta)" }}
            aria-hidden="true"
          />
        </div>
        <p className="v2-label mt-5">
          {l.city} ·{" "}
          {isPlot ? `${acres} ac · Area view${place ? ` (${place.credit})` : ""}` : "Residence"}
        </p>
        <h3 className="mt-2 text-[2rem] leading-none flex items-baseline justify-between gap-3">
          {l.name}
          <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
            <Arrow size={16} />
          </span>
        </h3>
        <p className="v2-figcap mt-2">{l.locality}</p>
        <p className="v2-body mt-3 mb-5 line-clamp-2">{l.headline}</p>
      </Link>
      <ListingFacts l={l} />
    </article>
  );
}
