import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { FeaturedProperties } from "@/components/FeaturedProperties";
import { SignatureResidence } from "@/components/SignatureResidence";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/residences")({
  head: () => ({
    meta: [
      { title: "Residences — Aangan" },
      {
        name: "description",
        content:
          "A curated selection of private villas by the Aangan studio, across Mumbai, Bengaluru, Goa, and Delhi NCR.",
      },
      { property: "og:title", content: "Residences — Aangan" },
      {
        property: "og:description",
        content: "Private villas by the Aangan studio, across India.",
      },
      { property: "og:url", content: "/residences" },
    ],
    links: [{ rel: "canonical", href: "/residences" }],
  }),
  component: Residences,
});

function Residences() {
  return (
    <>
      <SiteNav />
      <main>
        <section
          data-chapter="01"
          data-chapter-title="Overview"
          className="pt-40 md:pt-56 pb-6 md:pb-10 bg-background"
        >
          <div className="mx-auto max-w-[1600px] px-6 md:px-10">
            <Reveal>
              <p className="eyebrow">The Residences · 2024 – 2026</p>
              <h1 className="mt-6 display text-6xl md:text-8xl lg:text-[8rem] text-foreground leading-[0.95] max-w-[14ch]">
                Houses we have quietly built.
              </h1>
            </Reveal>
          </div>
        </section>
        <SignatureResidence />
        <FeaturedProperties />
      </main>
      <SiteFooter />
    </>
  );
}
