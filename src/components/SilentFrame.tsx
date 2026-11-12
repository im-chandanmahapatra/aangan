import silentImg from "@/assets/silent-monsoon.jpg";

/**
 * SilentFrame — the "held breath" between chapters.
 * Full-bleed image, no headline, no CTA. Only a marginal caption in the gutter.
 * The one place on the page where the site chooses silence over content.
 * Do not add copy here. Do not add a button. This is the section that
 * gets screenshot and shared.
 */
export function SilentFrame() {
  return (
    <section
      aria-label="Interlude"
      data-chapter="02"
      data-chapter-title="Interlude"
      className="relative w-full bg-foreground"
    >
      <figure className="relative">
        <div className="relative aspect-[16/10] md:aspect-[21/9] w-full overflow-hidden">
          <img
            src={silentImg}
            alt="An inner courtyard held quiet under a monsoon sky."
            width={1920}
            height={1280}
            className="w-full h-full object-cover kenburns"
            loading="lazy"
            decoding="async"
          />
        </div>
        <figcaption className="absolute left-6 md:left-10 bottom-6 md:bottom-10 text-background/85 max-w-[24rem]">
          <p
            className="eyebrow"
            style={{ color: "rgba(250,247,242,0.7)" }}
          >
            Interlude · Courtyard, monsoon
          </p>
          <p
            className="mt-3 text-xs md:text-sm"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              color: "rgba(250,247,242,0.9)",
              letterSpacing: "0.005em",
            }}
          >
            Held.
          </p>
        </figcaption>
      </figure>
    </section>
  );
}
