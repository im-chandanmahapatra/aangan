import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LineReveal, Parallax, Rise as Reveal, Stroke } from "@/v2/motion";
import { interiorRooms, interiors, materialLibrary, services } from "@/v2/data";
import { Picture } from "@/v2/components/Picture";
import { Lightbox } from "@/v2/components/Lightbox";
import { motion } from "framer-motion";
import { EASE } from "@/v2/motion";
import { Arrow } from "@/v2/components/Logo";
import { Breadcrumbs } from "@/v2/components/Breadcrumbs";

export const Route = createFileRoute("/v2/interiors")({
  head: () => ({
    meta: [
      { title: "Interiors — interior architecture and furnishing · Aangan" },
      {
        name: "description",
        content:
          "Interior architecture, joinery and furnishing by Aangan. Rooms shaped by named materials and warm light.",
      },
      { property: "og:title", content: "Interiors — interior architecture and furnishing · Aangan" },
      {
        property: "og:description",
        content:
          "Interior architecture, joinery and furnishing by Aangan. Rooms shaped by named materials and warm light.",
      },
      { property: "og:image", content: "https://aangan.studio/v2/film/aangan-film-poster.webp" },
      { name: "twitter:title", content: "Interiors · Aangan" },
      {
        name: "twitter:description",
        content:
          "Interior architecture, joinery and furnishing by Aangan.",
      },
      { name: "twitter:image", content: "https://aangan.studio/v2/film/aangan-film-poster.webp" },
    ],
    links: [{ rel: "canonical", href: "https://aangan.studio/v2/interiors" }],
  }),
  component: Interiors,
});

const interiorServices = services.filter((s) =>
  ["Interior Architecture", "Renovation", "Consultation", "Landscape"].includes(s.title),
);

function Interiors() {
  const [room, setRoom] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const items = useMemo(
    () => (room === "All" ? interiors : interiors.filter((i) => i.room === room)),
    [room],
  );

  return (
    <>
      <section
        className="relative min-h-[88svh] flex items-end overflow-hidden v2-forest"
        aria-labelledby="int-h"
      >
        <Parallax className="!absolute inset-0" strength={0.1}>
          <div className="absolute inset-0 v2-media v2-grain">
            <Picture image={interiors[0].image} sizes="100vw" priority />
          </div>
        </Parallax>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(0deg, rgb(12 18 14 / 0.9) 0%, rgb(12 18 14 / 0.35) 45%, rgb(12 18 14 / 0.1) 70%), linear-gradient(180deg, rgb(12 18 14 / 0.5), transparent 25%)",
          }}
        />
        <div className="relative v2-wrap pb-14 md:pb-20 grid gap-8 lg:grid-cols-12 items-end">
          <div className="lg:col-span-8">
            <Breadcrumbs crumbs={[{ label: "Interiors" }]} dark />
            <p className="v2-label mt-5">Interiors</p>
            <LineReveal
              as="h1"
              id="int-h"
              immediate
              delay={0.2}
              className="v2-d1 mt-5"
              lines={["A room is a still", "object with warm", "light in it."]}
            />
          </div>
          <div className="lg:col-span-4">
            <Stroke className="mb-6" />
            <p className="v2-lead" style={{ color: "var(--on-dark-2)" }}>
              Interior architecture, joinery and furnishing — for our own houses and for homes
              already standing.
            </p>
            <p className="v2-caption mt-5" style={{ color: "var(--on-dark-3)" }}>
              Representational image
            </p>
          </div>
        </div>
      </section>

      <section className="v2-wrap py-12 md:py-16" aria-labelledby="gal-h">
        <h2 id="gal-h" className="sr-only">
          Gallery
        </h2>
        <div className="flex flex-wrap gap-2 mb-10" role="group" aria-label="Filter by room">
          {interiorRooms.map((r) => (
            <button
              key={r}
              type="button"
              className="v2-chip"
              aria-pressed={room === r}
              onClick={() => setRoom(r)}
            >
              {r}
            </button>
          ))}
        </div>
        <ul className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
          {items.map((it, i) => (
            <motion.li
              key={it.id}
              className="mb-6 break-inside-avoid"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.9, ease: EASE, delay: (i % 3) * 0.08 }}
            >
              <button
                type="button"
                onClick={() => setOpen(i)}
                className="group block w-full text-left"
                aria-label={`Open ${it.title}`}
              >
                <span className="block relative v2-media v2-zoom">
                  <Picture
                    image={it.image}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                </span>
                <span className="mt-3 flex items-baseline justify-between gap-3">
                  <span style={{ fontFamily: "var(--f-display)", fontSize: "1.5rem" }}>
                    {it.title}
                  </span>
                  <span className="v2-label">{it.room}</span>
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
        <p className="v2-caption mt-2">All interior images are representational</p>
      </section>

      <section className="v2-section v2-earth" aria-labelledby="mat-h">
        <div className="v2-wrap grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className="v2-label">Material library</p>
            <h2 id="mat-h" className="v2-d2 mt-5">
              Every surface is named.
            </h2>
            <p className="v2-body mt-6 max-w-sm">
              We work with a small circle of quarries, mills and metal-smiths. Each project receives
              a materials index with provenance, so you know where everything you touch came from.
            </p>
          </Reveal>
          <div className="lg:col-span-8 grid sm:grid-cols-3 gap-6">
            {materialLibrary.map((m) => (
              <figure key={m.name}>
                <div className="relative v2-media aspect-square">
                  <Picture image={m.image} sizes="(min-width: 640px) 25vw, 100vw" />
                </div>
                <figcaption className="mt-3">
                  <span
                    className="block"
                    style={{ fontFamily: "var(--f-display)", fontSize: "1.3rem" }}
                  >
                    {m.name}
                  </span>
                  <span className="v2-figcap" style={{ color: "var(--on-dark-2)" }}>
                    {m.origin}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="v2-section" aria-labelledby="svc-h">
        <div className="v2-wrap">
          <p className="v2-label">Ways to work with us</p>
          <h2 id="svc-h" className="v2-d2 mt-5 max-w-[16ch]">
            For houses that are already standing.
          </h2>
          <ul
            className="mt-12 grid gap-px sm:grid-cols-2 lg:grid-cols-4"
            style={{ background: "var(--line)" }}
          >
            {interiorServices.map((s, i) => (
              <li
                key={s.title}
                className="p-6 flex flex-col gap-8 transition-colors duration-500 hover:bg-[color:var(--parchment)]"
                style={{ background: "var(--ivory)" }}
              >
                <span className="v2-label">0{i + 1}</span>
                <div>
                  <h3 className="text-[1.7rem]">{s.title}</h3>
                  <p className="v2-body mt-3">{s.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              to="/v2/enquire"
              search={{ interest: "interior" }}
              className="v2-btn v2-btn--primary"
            >
              Discuss an interior <Arrow />
            </Link>
            <Link to="/v2/studio" className="v2-btn v2-btn--line">
              How we work
            </Link>
          </div>
        </div>
      </section>

      {open !== null && (
        <Lightbox
          slides={items.map((i) => ({
            image: i.image,
            title: i.title,
            meta: `${i.room} · representational image`,
          }))}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}
