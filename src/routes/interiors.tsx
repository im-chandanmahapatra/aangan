import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { InteriorGallery } from "@/components/InteriorGallery";
import { Craftsmanship } from "@/components/Craftsmanship";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/interiors")({
  head: () => ({
    meta: [
      { title: "Interiors — Aangan" },
      {
        name: "description",
        content:
          "Interior architecture by the Aangan studio. Rooms shaped by material, provenance, and warm light.",
      },
      { property: "og:title", content: "Interiors — Aangan" },
      {
        property: "og:description",
        content: "Interior architecture by the Aangan studio.",
      },
      { property: "og:url", content: "/interiors" },
    ],
    links: [{ rel: "canonical", href: "/interiors" }],
  }),
  component: Interiors,
});

function Interiors() {
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
              <p className="eyebrow">The Interior Collection</p>
              <h1 className="mt-6 display text-6xl md:text-8xl lg:text-[8rem] text-foreground leading-[0.95] max-w-[16ch]">
                A room is a still object with warm light in it.
              </h1>
            </Reveal>
          </div>
        </section>
        <InteriorGallery />
        <Craftsmanship />
      </main>
      <SiteFooter />
    </>
  );
}
