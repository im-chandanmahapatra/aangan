import { Link } from "@tanstack/react-router";
import { fmt, placeFor, plotArea, type Listing } from "../data";
import { Arrow } from "./Logo";
import { Picture } from "./Picture";
import { PlotPlate } from "./PlotPlate";
import { ShortlistButton } from "./ShortlistButton";

function plotRatio(frontage: number, depth: number) {
  const min = Math.min(frontage, depth);
  const max = Math.max(frontage, depth);
  const ratio = max / min;
  return ratio < 1.06 ? "Square" : `1 : ${ratio.toFixed(2)}`;
}

/**
 * Editorial folio presentation for Land listings on `/v2/collection?kind=plot`:
 * full-bleed regional photography paired beside a clean paper architectural
 * survey and restrained particulars — zero overlays, pills, or dark HUD chrome.
 */
export function LandFolio({
  plots,
  onHover,
}: {
  plots: Listing[];
  onHover?: (slug: string | null) => void;
}) {
  const validPlots = plots.filter((l) => l.kind === "plot" && l.plot);
  if (validPlots.length === 0) return null;

  const maxFeet = Math.max(
    ...validPlots.map((p) => Math.max(p.plot!.frontageFt, p.plot!.depthFt)),
    1,
  );

  return (
    <div className="grid">
      <div style={{ borderTop: "1px solid var(--line)" }}>
        {validPlots.map((l, idx) => {
          const p = l.plot!;
          const area = plotArea(l);
          const acres = (area / 43560).toFixed(2);
          const place = placeFor(l.slug);

          return (
            <article
              key={l.slug}
              className="group py-12 md:py-16 grid gap-8 lg:grid-cols-12 lg:gap-10 items-start"
              style={{ borderBottom: "1px solid var(--line)" }}
              onMouseEnter={() => onHover?.(l.slug)}
              onMouseLeave={() => onHover?.(null)}
            >
              {/* Unobstructed landscape photography */}
              <figure className="lg:col-span-5">
                <Link
                  to="/v2/collection/$slug"
                  params={{ slug: l.slug }}
                  className="block v2-media v2-zoom aspect-[4/3]"
                  aria-label={`${l.name}, ${l.locality}`}
                >
                  {place && <Picture image={place.image} sizes="(min-width: 1024px) 42vw, 100vw" />}
                </Link>
                {place && (
                  <figcaption className="mt-3 v2-caption">
                    Area view · {place.caption} — Photo {place.credit} / Unsplash
                  </figcaption>
                )}
              </figure>

              {/* Paper architectural survey plate */}
              <figure className="lg:col-span-3">
                <Link
                  to="/v2/collection/$slug"
                  params={{ slug: l.slug }}
                  className="block aspect-[4/4.3] no-underline"
                  aria-label={`${l.name} survey dimensions`}
                >
                  <PlotPlate listing={l} />
                </Link>
                <figcaption className="mt-3 v2-caption">
                  Proportion {plotRatio(p.frontageFt, p.depthFt)} · Courtyard setback study
                </figcaption>
              </figure>

              {/* Editorial particulars */}
              <div className="lg:col-span-4 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="v2-label">
                      0{idx + 1} · {l.city}
                    </p>
                    <ShortlistButton slug={l.slug} name={l.name} variant="icon" />
                  </div>

                  <Link
                    to="/v2/collection/$slug"
                    params={{ slug: l.slug }}
                    className="block no-underline text-inherit mt-4"
                  >
                    <h2 className="v2-d3 group-hover:underline decoration-1 underline-offset-4">
                      {l.name}
                    </h2>
                  </Link>
                  <p className="v2-figcap mt-1.5">{l.locality}</p>
                  <p className="v2-body mt-4">{l.headline}</p>
                </div>

                <div className="mt-8">
                  <dl
                    className="grid grid-cols-2 gap-y-4 gap-x-6 py-4"
                    style={{
                      borderTop: "1px solid var(--line)",
                      borderBottom: "1px solid var(--line)",
                    }}
                  >
                    <div>
                      <dt className="v2-label">Area</dt>
                      <dd className="mt-1 text-[0.95rem] v2-num">
                        {fmt(area)} sq ft ({acres} ac)
                      </dd>
                    </div>
                    <div>
                      <dt className="v2-label">Frontage × Depth</dt>
                      <dd className="mt-1 text-[0.95rem] v2-num">
                        {p.frontageFt} × {p.depthFt} ft
                      </dd>
                    </div>
                    <div>
                      <dt className="v2-label">Facing</dt>
                      <dd className="mt-1 text-[0.95rem]">{p.facing}</dd>
                    </div>
                    <div>
                      <dt className="v2-label">Note</dt>
                      <dd className="mt-1 text-[0.9rem]" style={{ color: "var(--ink-2)" }}>
                        {l.features[1] ?? l.features[0]}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <Link
                      to="/v2/collection/$slug"
                      params={{ slug: l.slug }}
                      className="v2-arrowlink"
                    >
                      Open 3D site &amp; sun study <Arrow size={14} />
                    </Link>
                    <span className="v2-caption">On enquiry</span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Quiet true-scale comparison ruler on light parchment */}
      <div
        className="mt-14 p-6 md:p-10 v2-surface grid gap-8 lg:grid-cols-12 items-center"
        style={{ border: "1px solid var(--line)" }}
      >
        <div className="lg:col-span-4">
          <p className="v2-label">True-scale comparison</p>
          <h3 className="v2-d3 mt-3">Relative parcel sizes.</h3>
          <p className="v2-body mt-3">
            Drawn against a shared {maxFeet}-foot reference so you can judge footprint scale from a
            coastal third of an acre to a full acre orchard.
          </p>
          <Link
            to="/v2/enquire"
            search={{ interest: "land", visit: true }}
            className="v2-arrowlink mt-6"
          >
            Bring your own plot for study <Arrow size={14} />
          </Link>
        </div>

        <div
          className={`lg:col-span-8 grid gap-6 items-end ${
            validPlots.length === 1
              ? "grid-cols-1 max-w-xs"
              : validPlots.length === 2
                ? "sm:grid-cols-2"
                : "sm:grid-cols-3"
          }`}
        >
          {validPlots.map((p) => {
            const d = p.plot!;
            const area = plotArea(p);
            const wPct = Math.max(28, Math.round((d.frontageFt / maxFeet) * 100));
            const hPct = Math.max(28, Math.round((d.depthFt / maxFeet) * 100));

            return (
              <Link
                key={p.slug}
                to="/v2/collection/$slug"
                params={{ slug: p.slug }}
                className="group no-underline text-inherit block"
              >
                <div className="h-36 flex items-end">
                  <div
                    className="transition-colors duration-300 group-hover:bg-[rgb(163_70_42_/_0.09)]"
                    style={{
                      width: `${wPct}%`,
                      height: `${hPct}%`,
                      border: "1.5px solid var(--ink)",
                      background: "rgb(255 252 246 / 0.5)",
                    }}
                  />
                </div>
                <p
                  className="mt-3 text-[1.15rem] leading-tight group-hover:underline decoration-1 underline-offset-4"
                  style={{ fontFamily: "var(--f-display)" }}
                >
                  {p.name}
                </p>
                <p className="v2-caption mt-1 v2-num">
                  {fmt(area)} sq ft · {(area / 43560).toFixed(2)} ac
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
