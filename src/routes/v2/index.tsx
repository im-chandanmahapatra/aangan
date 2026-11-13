import { createFileRoute, Link } from "@tanstack/react-router";
import {
  dayFrames,
  fmt,
  getListing,
  images,
  interiors,
  listings,
  materialLibrary,
  processSteps,
  regions,
} from "@/v2/data";
import { Picture } from "@/v2/components/Picture";
import { Arrow } from "@/v2/components/Logo";
import { HeroFilm } from "@/v2/components/HeroFilm";
import { CourtyardPlan } from "@/v2/components/CourtyardPlan";
import { CollectionIndex, DaySequence, Dossier, PlacesSlants } from "@/v2/components/HomeSections";
import {
  Item,
  LineReveal,
  Parallax,
  Rise,
  Stagger,
  Stroke,
  motion,
  useSectionProgress,
  useTransform,
} from "@/v2/motion";

export const Route = createFileRoute("/v2/")({
  head: () => ({
    meta: [
      { title: "Aangan — Residences, land and interiors, built slowly" },
      {
        name: "description",
        content:
          "Aangan designs, builds and furnishes private courtyard houses across Mumbai, Bhubaneswar, Goa, Bengaluru and Delhi NCR. Walk a house, study our drawings, and arrange a private visit.",
      },
      { property: "og:title", content: "Aangan — Residences, land and interiors" },
      {
        property: "og:description",
        content: "Private residences, land and interiors by the Aangan studio.",
      },
      { property: "og:image", content: "https://aangan.studio/v2/film/aangan-film-poster.webp" },
      { name: "twitter:title", content: "Aangan — Residences, land and interiors" },
      {
        name: "twitter:description",
        content: "Private residences, land and interiors by the Aangan studio.",
      },
      { name: "twitter:image", content: "https://aangan.studio/v2/film/aangan-film-poster.webp" },
    ],
    links: [
      { rel: "canonical", href: "https://aangan.studio/v2" },
      {
        rel: "preload",
        as: "image",
        href: "https://aangan.studio/v2/film/aangan-film-poster.webp",
      },
    ],
  }),
  component: Home,
});

const frameImage = {
  courtyard: interiors.find((i) => i.id === "courtyard")!.image,
  signature: images.signature,
  monsoon: images.monsoon,
  bluehour: images.bluehour,
};

function Home() {
  const signature = getListing("the-kohinoor-house")!;
  const frames = dayFrames.map((f) => ({ ...f, image: frameImage[f.image] }));

  return (
    <>
      <HeroFilm />

      {/* 02 · A day */}
      <DaySequence frames={frames} />

      {/* 03 · The plan */}
      <section
        id="ch-plan"
        className="relative overflow-hidden"
        style={{ background: "var(--earth)", color: "var(--on-dark)" }}
        aria-labelledby="plan-h"
      >
        <div className="grid lg:grid-cols-12 min-h-[86svh]">
          <div className="relative lg:col-span-7 min-h-[60svh]">
            <Parallax className="!absolute inset-0" strength={0.08}>
              <div className="absolute inset-0 v2-media v2-grain">
                <Picture image={frameImage.courtyard} sizes="(min-width: 1024px) 58vw, 100vw" />
              </div>
            </Parallax>
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgb(58 26 15 / 0.96) 0%, rgb(58 26 15 / 0.88) 34%, rgb(58 26 15 / 0.2) 70%, rgb(58 26 15 / 0) 100%)",
              }}
            />
            <div className="relative v2-wrap lg:!max-w-none py-20 md:py-28 lg:pl-[max(var(--gutter),calc((100vw-1440px)/2+var(--gutter)))]">
              <p className="v2-label" style={{ color: "var(--on-dark-2)" }}>
                03 · The plan
              </p>
              <LineReveal
                id="plan-h"
                className="v2-d2 mt-5"
                lines={["Move from", "courtyard", "to coast."]}
              />
              <Stroke className="mt-7" />
              <p className="v2-body mt-7 max-w-[22rem]">
                A simple, airy plan: rooms one deep, held around a shaded court and a still pool,
                opening through a long verandah to the sea.
              </p>
              <Link
                to="/v2/collection/$slug"
                params={{ slug: signature.slug }}
                className="v2-arrowlink mt-8"
              >
                See the house’s drawings <Arrow />
              </Link>
            </div>
          </div>
          <div
            className="lg:col-span-5 relative flex items-center justify-center p-6 md:p-12"
            style={{
              background:
                "linear-gradient(135deg, #3b1d12, #2a140c), radial-gradient(circle at 30% 20%, rgb(255 255 255 / 0.05), transparent 60%)",
            }}
          >
            <div className="absolute inset-0 v2-grid-bg opacity-40" aria-hidden="true" />
            <figure className="relative w-full max-w-[34rem]">
              <CourtyardPlan className="w-full h-auto" />
              <figcaption className="v2-caption mt-4" style={{ color: "var(--on-dark-3)" }}>
                Ground floor · schematic, representational — working drawings shared on enquiry
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* 04 · Places */}
      <PlacesSlants />

      {/* Walk through the home */}
      <section className="v2-earth v2-section" aria-labelledby="homes-h">
        <div className="v2-wrap">
          <Rise>
            <p className="v2-label" style={{ color: "var(--brass)" }}>
              Home types
            </p>
            <h2
              id="homes-h"
              className="v2-d2 mt-4"
              style={{ color: "var(--on-dark)", maxWidth: "18ch" }}
            >
              Walk through each home before you choose.
            </h2>
            <p className="v2-lead mt-6" style={{ color: "var(--on-dark-2)", maxWidth: "52ch" }}>
              Four demonstration layouts — 1, 1.5, 2 and 3 BHK — drawn to real dimensions. Turn each
              one in your hands, step inside, and explore room by room in 3D.
            </p>
            <Link to="/v2/homes" className="v2-btn v2-btn--light mt-8">
              Explore all four layouts <Arrow />
            </Link>
          </Rise>
        </div>
      </section>

      {/* The collection */}
      <section className="v2-section" aria-labelledby="col-h">
        <div className="v2-wrap">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
            <div>
              <p className="v2-label">The collection</p>
              <LineReveal
                id="col-h"
                className="v2-d2 mt-5"
                lines={["Houses and land,", "few and documented."]}
              />
            </div>
            <Link to="/v2/collection" className="v2-btn v2-btn--line">
              Filter all {listings.length} <Arrow />
            </Link>
          </div>
          <CollectionIndex items={listings} />
          <p className="v2-caption mt-5">
            Prices on enquiry · house images are representational · plots marked “Demonstration” are
            samples
          </p>
        </div>
      </section>

      {/* 05 · Dossier */}
      <Dossier />

      {/* Interiors */}
      <section className="v2-section" aria-labelledby="int-h">
        <div className="v2-wrap grid gap-10 lg:grid-cols-12 items-end">
          <div className="lg:col-span-4">
            <p className="v2-label">Interiors</p>
            <LineReveal
              id="int-h"
              className="v2-d2 mt-5"
              lines={["Rooms, held", "in warm light."]}
            />
            <Stroke className="mt-7" />
            <p className="v2-body mt-7 max-w-sm">
              Interior architecture, joinery and furnishing — for our own houses and for homes
              already standing. Every surface is named and sourced.
            </p>
            <ul className="mt-8 grid grid-cols-3 gap-3 max-w-sm">
              {materialLibrary.map((m) => (
                <li key={m.name}>
                  <div className="relative v2-media aspect-square">
                    <Picture image={m.image} sizes="120px" />
                  </div>
                  <p className="mt-2 text-[0.78rem] leading-tight">{m.name}</p>
                </li>
              ))}
            </ul>
            <Link to="/v2/interiors" className="v2-btn v2-btn--ink mt-10">
              See the interiors <Arrow />
            </Link>
          </div>
          <div className="lg:col-span-8 grid grid-cols-5 gap-4 md:gap-6 items-end">
            <Rise className="col-span-3">
              <Link to="/v2/interiors" className="block group no-underline text-inherit">
                <Parallax className="aspect-[4/5]" strength={0.07}>
                  <div className="absolute inset-0 v2-media">
                    <Picture image={interiors[0].image} sizes="(min-width: 1024px) 38vw, 60vw" />
                  </div>
                </Parallax>
                <p className="v2-figcap mt-3">
                  <b>{interiors[0].title}</b> — {interiors[0].room}
                </p>
              </Link>
            </Rise>
            <div className="col-span-2 grid gap-4 md:gap-6">
              {[interiors[2], interiors[3]].map((it, i) => (
                <Rise key={it.id} delay={0.1 + i * 0.1}>
                  <Link to="/v2/interiors" className="block no-underline text-inherit">
                    <div className="relative v2-media v2-zoom aspect-[4/3]">
                      <Picture image={it.image} sizes="(min-width: 1024px) 25vw, 40vw" />
                    </div>
                    <p className="v2-figcap mt-3">
                      <b>{it.title}</b>
                    </p>
                  </Link>
                </Rise>
              ))}
            </div>
          </div>
        </div>
        <p className="v2-wrap v2-caption mt-6">All interior images are representational</p>
      </section>

      {/* Process */}
      <ProcessBand />
    </>
  );
}

function ProcessBand() {
  const { ref, progress } = useSectionProgress<HTMLElement>(["start 80%", "end 60%"]);
  const scaleX = useTransform(progress, [0, 1], [0, 1]);
  return (
    <section ref={ref} className="v2-section v2-forest" aria-labelledby="proc-h">
      <div className="v2-wrap">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="v2-label">How we work</p>
            <LineReveal
              id="proc-h"
              className="v2-d2 mt-5"
              lines={["Five seasons", "before a key turns."]}
            />
          </div>
          <Link to="/v2/studio" className="v2-btn v2-btn--line">
            The studio <Arrow />
          </Link>
        </div>
        <div
          className="relative mt-16 h-px"
          style={{ background: "var(--line)" }}
          aria-hidden="true"
        >
          <motion.span
            className="absolute inset-0"
            style={{ background: "var(--brass)", scaleX, transformOrigin: "left" }}
          />
        </div>
        <Stagger as="ol" className="grid md:grid-cols-5 gap-x-8" gap={0.1}>
          {processSteps.map((s) => (
            <Item as="li" key={s.n} className="pt-8 pb-4 flex flex-col gap-6">
              <span className="v2-label" style={{ color: "var(--brass)" }}>
                {s.n}
              </span>
              <div>
                <h3 className="text-[2rem]">{s.title}</h3>
                <p className="v2-body mt-3">{s.body}</p>
              </div>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
