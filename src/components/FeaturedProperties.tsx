import { Link } from "@tanstack/react-router";
import { featuredProperties } from "@/data/site";
import { Reveal } from "./Reveal";
import { SiteSeal } from "./SiteSeal";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"] as const;

function handoverYear(p: (typeof featuredProperties)[number]) {
  const last = p.timeline[p.timeline.length - 1]?.date ?? "";
  const m = last.match(/(\d{4})/);
  return m ? Number(m[1]) : new Date().getFullYear();
}

function primaryProvenance(p: (typeof featuredProperties)[number]) {
  // Compact three-word ring text pulled from the first material's provenance.
  const first = p.materials[0]?.provenance ?? "";
  const parts = first.split(/[,·]/).map((s) => s.trim()).filter(Boolean);
  const short = (parts[0] ?? p.city).toUpperCase().slice(0, 22);
  return `${short} · ${p.city.toUpperCase()} · FOLIO ${ROMAN[featuredProperties.indexOf(p)] ?? "I"}`;
}

export function FeaturedProperties() {
  return (
    <section
      id="residences"
      data-chapter="04"
      data-chapter-title="Residences"
      className="relative bg-background py-40 md:py-56"
    >
      <div className="mx-auto max-w-[1720px] px-6 md:px-12">
        {/* Folio index header */}
        <Reveal>
          <div className="flex items-baseline gap-6 mb-12 md:mb-16">
            <span className="folio">Folio IV</span>
            <span className="rule flex-1 max-w-[220px]" aria-hidden="true" />
            <span className="folio">Selected Residences</span>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-12 items-end gap-6 mb-28 md:mb-40">
          <Reveal className="md:col-span-8">
            <h2
              className="display text-foreground"
              style={{
                fontSize: "clamp(2.75rem, 6.4vw, 6rem)",
                lineHeight: "0.98",
                letterSpacing: "-0.025em",
              }}
            >
              Four houses,
              <br />
              four Indias.
            </h2>
          </Reveal>
          <Reveal className="md:col-span-4 md:pb-3">
            <p className="text-[15px] leading-[1.8] text-muted-foreground max-w-sm">
              A small collection of homes we have built for private clients
              over the last four years, offered now for sale.
            </p>
          </Reveal>
        </div>

        <div className="space-y-40 md:space-y-56">
          {featuredProperties.map((p, i) => {
            const layout = i % 4;
            const roman = ROMAN[i] ?? String(i + 1);
            const year = handoverYear(p);
            const provenance = primaryProvenance(p);
            if (layout === 2) {
              return (
                <article key={p.id} className="group">
                  <Reveal>
                    <Link
                      to="/residences/$slug"
                      params={{ slug: p.slug }}
                      data-cursor="view"
                      data-cursor-label="view house"
                      className="block relative aspect-[16/9] overflow-hidden bg-sand"
                    >
                      <img
                        src={p.image}
                        alt={`${p.name} — ${p.location}`}
                        className="w-full h-full object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                        loading="lazy"
                        decoding="async"
                      />
                    </Link>
                  </Reveal>
                  <Reveal delay={100}>
                    <div className="mt-10 grid md:grid-cols-12 items-baseline gap-6">
                      <div className="md:col-span-5">
                        <p className="folio">
                          Folio {roman} · {p.city}
                        </p>
                        <h3 className="mt-5 display text-4xl md:text-5xl text-foreground">
                          <Link
                            to="/residences/$slug"
                            params={{ slug: p.slug }}
                            className="nav-underline"
                          >
                            {p.name}
                          </Link>
                        </h3>
                      </div>
                      <p className="md:col-span-4 text-[15px] leading-[1.8] text-muted-foreground">
                        {p.headline}
                      </p>
                      <div className="md:col-span-3 md:flex md:justify-end">
                        <SiteSeal folio={roman} year={year} provenance={provenance} size={88} />
                      </div>
                    </div>
                  </Reveal>
                </article>
              );
            }
            const imageLeft = layout === 0 || layout === 3;
            const imageWidth = layout === 3 ? "md:col-span-8" : "md:col-span-7";
            const metaWidth = layout === 3 ? "md:col-span-4" : "md:col-span-5";
            return (
              <article
                key={p.id}
                className="group grid md:grid-cols-12 items-center gap-8 md:gap-20"
              >
                <Reveal
                  className={`${imageWidth} ${imageLeft ? "md:order-1" : "md:order-2"}`}
                >
                  <Link
                    to="/residences/$slug"
                    params={{ slug: p.slug }}
                    data-cursor="view"
                    data-cursor-label="view house"
                    className={`block relative overflow-hidden bg-sand ${
                      p.aspect === "portrait" ? "aspect-[4/5]" : "aspect-[4/3]"
                    }`}
                  >
                    <img
                      src={p.image}
                      alt={`${p.name} — ${p.location}`}
                      className="w-full h-full object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                      loading="lazy"
                      decoding="async"
                    />
                  </Link>
                </Reveal>
                <Reveal
                  delay={120}
                  className={`${metaWidth} ${imageLeft ? "md:order-2" : "md:order-1"}`}
                >
                  <div className="flex items-center gap-5">
                    <p className="folio">Folio {roman}</p>
                    <span className="rule flex-1 max-w-[80px]" aria-hidden="true" />
                    <p className="folio">{p.city}</p>
                  </div>
                  <h3 className="mt-6 display text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.0]" style={{ letterSpacing: "-0.02em" }}>
                    <Link
                      to="/residences/$slug"
                      params={{ slug: p.slug }}
                      className="nav-underline"
                    >
                      {p.name}
                    </Link>
                  </h3>
                  <p className="mt-3 folio">{p.location}</p>
                  <p className="mt-10 text-[15px] leading-[1.85] text-muted-foreground max-w-md">
                    {p.headline}
                  </p>

                  <div className="mt-12 flex items-end justify-between gap-6 pt-6 border-t border-foreground/10">
                    <dl className="grid grid-cols-2 gap-x-8">
                      <div>
                        <dt className="folio">Rooms</dt>
                        <dd className="mt-2 display text-2xl text-foreground tnum">{p.bhk}</dd>
                      </div>
                      <div>
                        <dt className="folio">Sq Ft</dt>
                        <dd className="mt-2 display text-2xl text-foreground tnum">{p.sqft.toLocaleString()}</dd>
                      </div>
                    </dl>
                    <SiteSeal folio={roman} year={year} provenance={provenance} size={80} />
                  </div>

                  <Link
                    to="/consultation"
                    search={{ residence: p.slug }}
                    className="folio inline-flex items-center gap-3 mt-10 border-b border-foreground/40 pb-1 hover:border-foreground text-foreground transition-colors duration-500"
                  >
                    Enquire about this residence <span aria-hidden="true">→</span>
                  </Link>
                </Reveal>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
