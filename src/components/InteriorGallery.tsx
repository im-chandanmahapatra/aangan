import { useEffect, useMemo, useState } from "react";
import { interiorFilters, interiorPieces } from "@/data/site";
import { Reveal } from "./Reveal";

type Filter = (typeof interiorFilters)[number];

export function InteriorGallery() {
  const [filter, setFilter] = useState<Filter>("All");
  const [open, setOpen] = useState<number | null>(null);

  const items = useMemo(
    () => (filter === "All" ? interiorPieces : interiorPieces.filter((p) => p.room === filter)),
    [filter],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? null : (i + 1) % items.length));
      if (e.key === "ArrowLeft")
        setOpen((i) => (i === null ? null : (i - 1 + items.length) % items.length));
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, items.length]);

  return (
    <section
      id="interiors"
      data-chapter="05"
      data-chapter-title="Interiors"
      className="relative bg-sand py-32 md:py-48"
    >
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="grid md:grid-cols-12 gap-6 items-end mb-16 md:mb-24">
          <Reveal className="md:col-span-7">
            <p className="eyebrow">The Interior Collection</p>
            <h2 className="mt-6 display text-5xl md:text-7xl text-foreground leading-[0.98]">
              Rooms, held
              <br />
              in warm light.
            </h2>
          </Reveal>
          <Reveal className="md:col-span-5">
            <div className="flex flex-wrap gap-3 md:justify-end">
              {interiorFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`eyebrow px-4 py-2 rounded-full border transition-colors duration-500 ${
                    f === filter
                      ? "bg-foreground text-background border-foreground"
                      : "border-foreground/25 text-foreground hover:border-foreground/60"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 md:gap-8 [column-fill:_balance]">
          {items.map((it, i) => (
            <button
              key={it.id + filter}
              onClick={() => setOpen(i)}
              data-cursor="view"
              data-cursor-label="view"
              className="group relative mb-6 md:mb-8 block w-full break-inside-avoid text-left"
              aria-label={`Open ${it.title}`}
            >
              <div className="relative overflow-hidden bg-background">
                <img
                  src={it.image}
                  alt={it.title}
                  className="w-full h-auto object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="display text-lg text-foreground">{it.title}</span>
                <span className="eyebrow text-muted-foreground">{it.room}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {open !== null && (
        <div
          className="fixed inset-0 z-[100] bg-foreground/92 flex items-center justify-center p-4 md:p-10 animate-[fade_400ms_var(--ease-editorial)_forwards]"
          onClick={() => setOpen(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={() => setOpen(null)}
            className="eyebrow absolute top-6 right-6 text-background/80 hover:text-background"
          >
            Close ✕
          </button>
          <figure
            className="max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={items[open].image}
              alt={items[open].title}
              className="max-h-[80vh] max-w-full object-contain"
            />
            <figcaption className="mt-6 flex items-baseline justify-between text-background">
              <span className="display text-2xl">{items[open].title}</span>
              <span className="eyebrow text-background/70">{items[open].room}</span>
            </figcaption>
          </figure>
        </div>
      )}

      <style>{`@keyframes fade { to { opacity: 1; } }`}</style>
    </section>
  );
}
