import { materials } from "@/data/site";
import { Reveal } from "./Reveal";

export function Philosophy() {
  return (
    <section
      id="philosophy"
      data-chapter="03"
      data-chapter-title="Philosophy"
      className="relative bg-linen py-40 md:py-56 overflow-hidden"
    >
      <div className="mx-auto max-w-[1720px] px-6 md:px-12">
        {/* Folio index */}
        <Reveal>
          <div className="flex items-baseline gap-6">
            <span className="folio">Folio III</span>
            <span className="rule flex-1 max-w-[220px]" aria-hidden="true" />
            <span className="folio">Philosophy</span>
          </div>
        </Reveal>

        {/* Oversized manifesto — one sentence, viewport-dominating. */}
        <Reveal delay={120}>
          <blockquote
            className="mt-16 md:mt-24 pullquote text-foreground"
            style={{
              fontSize: "clamp(3.2rem, 11.5vw, 11rem)",
              lineHeight: "0.96",
              letterSpacing: "-0.03em",
              maxWidth: "18ch",
            }}
          >
            <span aria-hidden="true">“</span>A house is a slow object.<span aria-hidden="true">”</span>
          </blockquote>
        </Reveal>

        {/* Attribution + subhead, quiet gutter beneath */}
        <div className="mt-16 md:mt-24 grid md:grid-cols-12 gap-10">
          <Reveal delay={220} className="md:col-span-4 md:col-start-8">
            <p className="text-[15px] leading-[1.85] text-muted-foreground dropcap">
              We work at the pace of the material, not the market. Stone is
              cut once. Walnut opens twice a season. Every house we place is
              set by hand on the land it belongs to — room by room, opening
              by opening — before a single line is issued for tender.
            </p>
            <p className="mt-8 folio">— The Studio, Kala Ghoda</p>
          </Reveal>
        </div>
      </div>

      {/* Material marquee — the counterpoint. Materiality as a passing frieze. */}
      <div className="mt-32 md:mt-48 overflow-hidden">
        <div className="mx-auto max-w-[1720px] px-6 md:px-12 mb-10 flex items-baseline gap-6">
          <span className="folio">Materials</span>
          <span className="rule flex-1" aria-hidden="true" />
          <span className="folio">Selected slab by slab</span>
        </div>
        <div className="marquee flex gap-8 w-max">
          {[...materials, ...materials].map((m, i) => (
            <figure key={i} className="relative w-[280px] md:w-[380px] flex-shrink-0">
              <div className="aspect-[4/5] overflow-hidden bg-sand">
                <img
                  src={m.image}
                  alt={m.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <figcaption className="mt-4 flex items-baseline justify-between">
                <span className="display text-xl text-foreground">{m.name}</span>
                <span className="folio">{m.origin}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
