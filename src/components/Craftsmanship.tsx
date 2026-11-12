import materialTravertine from "@/assets/material-travertine.jpg";
import materialWalnut from "@/assets/material-walnut.jpg";
import materialBrass from "@/assets/material-brass.jpg";
import { Reveal } from "./Reveal";

const items = [
  {
    name: "Kota stone",
    caption: "Ramganjmandi · quarried on commission",
    image: materialTravertine,
  },
  { name: "Ain wood", caption: "Western Ghats · licensed harvest", image: materialWalnut },
  { name: "Cast brass", caption: "Moradabad · hand-finished hardware", image: materialBrass },
];

export function Craftsmanship() {
  return (
    <section
      id="craftsmanship"
      data-chapter="07"
      data-chapter-title="Craftsmanship"
      className="relative bg-linen py-32 md:py-48"
    >
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="grid md:grid-cols-12 gap-6 items-end mb-16 md:mb-24">
          <Reveal className="md:col-span-8">
            <p className="eyebrow">Craftsmanship</p>
            <h2 className="mt-6 display text-5xl md:text-7xl text-foreground leading-[0.98]">
              Every surface
              <br />
              is decided by hand.
            </h2>
          </Reveal>
          <Reveal className="md:col-span-4">
            <p className="text-[15px] leading-[1.8] text-muted-foreground max-w-sm">
              We work with a small circle of quarries, mills, and metal-smiths
              across India. Nothing on an Aangan house is off-the-shelf.
            </p>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-3 gap-3 md:gap-6">
          {items.map((it, i) => (
            <Reveal delay={i * 100} key={it.name}>
              <figure>
                <div className="aspect-[3/4] overflow-hidden bg-sand">
                  <img
                    src={it.image}
                    alt={it.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <figcaption className="mt-6 flex items-baseline justify-between">
                  <span className="display text-2xl text-foreground">{it.name}</span>
                  <span className="eyebrow text-muted-foreground text-right max-w-[16ch]">
                    {it.caption}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
