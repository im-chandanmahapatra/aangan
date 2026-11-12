import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Reveal } from "@/components/Reveal";
import {
  getPropertyBySlug,
  featuredProperties,
  type Material,
  type TimelineEntry,
} from "@/data/site";

export const Route = createFileRoute("/residences/$slug")({
  loader: ({ params }) => {
    const property = getPropertyBySlug(params.slug);
    if (!property) throw notFound();
    return { property };
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.property;
    const title = p ? `${p.name} — ${p.city} · Aangan` : "Residence — Aangan";
    const desc = p ? p.headline : "A private residence by the Aangan studio.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/residences/${params.slug}` },
        ...(p?.image ? [{ property: "og:image", content: p.image }] : []),
      ],
      links: [{ rel: "canonical", href: `/residences/${params.slug}` }],
      scripts: p
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "House",
                name: p.name,
                description: p.headline,
                address: { "@type": "PostalAddress", addressLocality: p.location, addressRegion: p.city, addressCountry: "IN" },
                numberOfRooms: p.bhk,
                floorSize: { "@type": "QuantitativeValue", value: p.sqft, unitCode: "FTK" },
              }),
            },
          ]
        : [],
    };
  },
  notFoundComponent: () => (
    <div className="pt-40 min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <p className="eyebrow">404 · Residence not found</p>
        <h1 className="mt-6 display text-5xl text-foreground">This residence is not on our books.</h1>
        <Link to="/residences" className="eyebrow inline-block mt-8 border-b border-foreground/40 pb-1">
          Return to Residences
        </Link>
      </div>
    </div>
  ),
  component: ResidenceDetail,
});

function ResidenceDetail() {
  const { property: p } = Route.useLoaderData();
  const otherResidences = featuredProperties.filter((r) => r.slug !== p.slug).slice(0, 3);

  return (
    <>
      <SiteNav />
      <main className="bg-background">
        {/* Hero */}
        <section className="relative h-[76svh] min-h-[520px] overflow-hidden bg-foreground">
          <img
            src={p.image}
            alt={`${p.name} — ${p.location}`}
            className="absolute inset-0 w-full h-full object-cover kenburns"
            fetchPriority="high"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(15,12,10,0.55) 0%, rgba(15,12,10,0.10) 55%, rgba(15,12,10,0.30) 100%)",
            }}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full mx-auto max-w-[1600px] px-6 md:px-10 flex flex-col justify-end pb-14 md:pb-20 text-background">
            <p className="eyebrow" style={{ color: "rgba(250,247,242,0.75)" }}>
              {p.city} · {p.status}
            </p>
            <h1 className="mt-4 display text-[13vw] md:text-[6.4vw] leading-[0.96] max-w-[16ch] text-background">
              {p.name}
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed" style={{ color: "rgba(250,247,242,0.85)" }}>
              {p.headline}
            </p>
          </div>
        </section>

        {/* Description + Meta */}
        <section className="py-24 md:py-32">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10 grid md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-7">
              <Reveal>
                <p className="eyebrow">The House</p>
                <p className="mt-8 display text-3xl md:text-4xl leading-[1.2] text-foreground max-w-[30ch]">
                  {p.description}
                </p>
              </Reveal>
            </div>
            <div className="md:col-span-4 md:col-start-9">
              <Reveal>
                <dl className="grid grid-cols-2 gap-y-8 gap-x-6 border-t border-foreground/10 pt-8">
                  <div>
                    <dt className="eyebrow">Rooms</dt>
                    <dd className="mt-2 display text-3xl text-foreground">{p.bhk}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow">Sq Ft</dt>
                    <dd className="mt-2 display text-3xl text-foreground">{p.sqft.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow">Location</dt>
                    <dd className="mt-2 text-sm text-foreground">{p.location}, {p.city}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow">Status</dt>
                    <dd className="mt-2 text-sm text-foreground">{p.status}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="eyebrow">Price</dt>
                    <dd className="mt-2 display text-2xl text-foreground">On Enquiry</dd>
                  </div>
                </dl>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Plan sketch — line art placeholder */}
        <section className="py-16 md:py-24 bg-linen">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10">
            <Reveal>
              <p className="eyebrow">Ground Floor · Schematic</p>
            </Reveal>
            <Reveal delay={100}>
              <div className="mt-8 aspect-[16/9] bg-background border border-foreground/10 flex items-center justify-center">
                <PlanSketch slug={p.slug} />
              </div>
              <p className="mt-4 text-xs text-muted-foreground italic">
                Schematic only. Working drawings shared under NDA on enquiry.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Materials Index */}
        <section className="py-24 md:py-32">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10 grid md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
              <Reveal>
                <p className="eyebrow">Materials Index</p>
                <h2 className="mt-6 display text-4xl md:text-5xl leading-[1] text-foreground">
                  Named, sourced, and specified.
                </h2>
              </Reveal>
            </div>
            <div className="md:col-span-8">
              <Reveal>
                <ol className="divide-y divide-foreground/10 border-y border-foreground/10">
                  {p.materials.map((m: Material, i: number) => (
                    <li key={m.name} className="py-6 flex flex-wrap items-baseline gap-6">
                      <span className="eyebrow text-muted-foreground w-8">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="display text-xl md:text-2xl text-foreground flex-1 min-w-[200px]">
                        {m.name}
                      </span>
                      <span className="eyebrow text-muted-foreground">{m.provenance}</span>
                    </li>
                  ))}
                </ol>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-24 md:py-32 bg-linen">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10">
            <Reveal>
              <p className="eyebrow">Build Timeline</p>
            </Reveal>
            <Reveal delay={100}>
              <ol className="mt-10 grid md:grid-cols-4 gap-6 md:gap-8 border-t border-foreground/10 pt-10">
                {p.timeline.map((t: TimelineEntry) => (
                  <li key={t.phase}>
                    <p className="eyebrow text-muted-foreground">{t.date}</p>
                    <p className="mt-3 display text-2xl text-foreground">{t.phase}</p>
                  </li>
                ))}
              </ol>
            </Reveal>
            <p className="mt-10 text-xs text-muted-foreground italic">
              Photography · {p.photographer}
            </p>
          </div>
        </section>

        {/* Enquire CTA */}
        <section className="py-24 md:py-32">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10">
            <Reveal>
              <div className="border-t border-foreground/10 pt-14 flex flex-wrap items-end justify-between gap-8">
                <div>
                  <p className="eyebrow">Enquire</p>
                  <h2 className="mt-6 display text-4xl md:text-5xl text-foreground max-w-[18ch]">
                    A partner from the studio will write to you personally.
                  </h2>
                </div>
                <Link
                  to="/consultation"
                  search={{ residence: p.slug }}
                  className="eyebrow inline-flex items-center gap-3 px-8 py-4 rounded-[2px] bg-foreground text-background hover:bg-transparent hover:text-foreground border border-foreground transition-colors duration-500"
                >
                  Enquire about {p.name} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Other residences */}
        <section className="py-16 md:py-24 border-t border-foreground/10">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10">
            <p className="eyebrow">Other Residences</p>
            <div className="mt-10 grid md:grid-cols-3 gap-6 md:gap-8">
              {otherResidences.map((r) => (
                <Link
                  key={r.slug}
                  to="/residences/$slug"
                  params={{ slug: r.slug }}
                  data-cursor="view"
                  data-cursor-label="view house"
                  className="group block"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-sand">
                    <img
                      src={r.image}
                      alt={r.name}
                      className="w-full h-full object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="display text-xl text-foreground">{r.name}</span>
                    <span className="eyebrow text-muted-foreground">{r.city}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

/**
 * A restrained line-art plan schematic — deliberately abstract. One SVG per
 * slug, generated from the property's spatial character (long horizontal,
 * courtyard-U, coastal linear, etc.).
 */
function PlanSketch({ slug }: { slug: string }) {
  const stroke = "currentColor";
  const common = {
    fill: "none",
    stroke,
    strokeWidth: 1.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    vectorEffect: "non-scaling-stroke" as const,
  };
  return (
    <svg
      viewBox="0 0 640 360"
      className="w-full h-full text-foreground/70 p-6"
      role="img"
      aria-label="Ground-floor schematic sketch"
    >
      {slug === "casa-marea" && (
        <g {...common}>
          <rect x="120" y="80" width="400" height="200" />
          <line x1="120" y1="180" x2="520" y2="180" />
          <line x1="320" y1="80" x2="320" y2="280" />
          <line x1="220" y1="80" x2="220" y2="180" />
          <line x1="420" y1="180" x2="420" y2="280" />
          <path d="M120 280 L520 280 L520 320 L120 320 Z" strokeDasharray="3 5" />
        </g>
      )}
      {slug === "the-champa-house" && (
        <g {...common}>
          <path d="M100 80 L100 280 L540 280 L540 80" />
          <path d="M180 80 L180 220 L460 220 L460 80" />
          <circle cx="320" cy="150" r="18" strokeDasharray="2 4" />
          <rect x="250" y="235" width="140" height="30" strokeDasharray="4 4" />
        </g>
      )}
      {slug === "casa-fontainhas" && (
        <g {...common}>
          <path d="M100 120 L540 120 L540 260 L100 260 Z" />
          <path d="M100 120 L320 60 L540 120" />
          <line x1="240" y1="120" x2="240" y2="260" />
          <line x1="400" y1="120" x2="400" y2="260" />
        </g>
      )}
      {slug === "the-neem-farmhouse" && (
        <g {...common}>
          <rect x="60" y="150" width="520" height="80" />
          <line x1="60" y1="190" x2="580" y2="190" />
          {[140, 220, 300, 380, 460, 540].map((x) => (
            <line key={x} x1={x} y1="150" x2={x} y2="230" />
          ))}
          <path d="M60 240 L580 240" strokeDasharray="4 6" />
        </g>
      )}
      {!["casa-marea", "the-champa-house", "casa-fontainhas", "the-neem-farmhouse"].includes(slug) && (
        <g {...common}>
          <rect x="120" y="80" width="400" height="200" />
          <line x1="120" y1="180" x2="520" y2="180" />
        </g>
      )}
    </svg>
  );
}
