import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
  studio,
} from "@/v2/data";
import { Picture } from "@/v2/components/Picture";
import { Arrow } from "@/v2/components/Logo";
import { HeroFilm } from "@/v2/components/HeroFilm";
import { SiteModel, hhmm } from "@/v2/components/SiteModel";
import type { SiteMode } from "@/v2/components/siteScene";
import { CourtyardPlan } from "@/v2/components/CourtyardPlan";
import { CollectionIndex, DaySequence, Dossier, PlacesSlants } from "@/v2/components/HomeSections";
import {
  EASE,
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
          "Aangan designs, builds and furnishes private courtyard houses across Mumbai, Alibaug, Goa, Bengaluru and Delhi NCR. Walk a house, read the land in 3D, and arrange a private visit.",
      },
      { property: "og:title", content: "Aangan — Residences, land and interiors" },
      {
        property: "og:description",
        content: "Private residences, land and interiors by the Aangan studio.",
      },
      { property: "og:image", content: "/v2/film/aangan-film-poster.webp" },
    ],
    links: [{ rel: "preload", as: "image", href: "/v2/film/aangan-film-poster.webp" }],
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
  const demoPlot = getListing("nagaon-casuarina-plot")!;
  const frames = dayFrames.map((f) => ({ ...f, image: frameImage[f.image] }));

  return (
    <>
      <HeroFilm />

      {/* 01 · A day */}
      <DaySequence frames={frames} />

      {/* 03 · The land — interactive 3D */}
      <LandSection plot={demoPlot} />

      {/* 04 · The plan */}
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
                04 · The plan
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

      {/* 05 · Places */}
      <PlacesSlants />

      {/* Walk through the home */}
      <section className="v2-earth v2-section" aria-labelledby="homes-h">
        <div className="v2-wrap">
          <Rise>
            <p className="v2-label" style={{ color: "var(--brass)" }}>Home types</p>
            <h2 id="homes-h" className="v2-d2 mt-4" style={{ color: "var(--on-dark)", maxWidth: "18ch" }}>
              Walk through each home before you choose.
            </h2>
            <p className="v2-lead mt-6" style={{ color: "var(--on-dark-2)", maxWidth: "52ch" }}>
              Four demonstration layouts — 1, 1.5, 2 and 3 BHK — drawn to real
              dimensions. Turn each one in your hands, step inside, and explore
              room by room in 3D.
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
              <LineReveal id="col-h" className="v2-d2 mt-5" lines={["Houses and land,", "few and documented."]} />
            </div>
            <Link to="/v2/collection" className="v2-btn v2-btn--line">
              Filter all {listings.length} <Arrow />
            </Link>
          </div>
          <CollectionIndex items={listings} />
          <p className="v2-caption mt-5">
            Prices on enquiry · house images are representational · plots marked “Demonstration” are samples
          </p>
        </div>
      </section>

      {/* 06 · Dossier */}
      <Dossier />

      {/* Interiors */}
      <section className="v2-section" aria-labelledby="int-h">
        <div className="v2-wrap grid gap-10 lg:grid-cols-12 items-end">
          <div className="lg:col-span-4">
            <p className="v2-label">Interiors</p>
            <LineReveal id="int-h" className="v2-d2 mt-5" lines={["Rooms, held", "in warm light."]} />
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

      {/* Closing */}
      <section className="relative overflow-hidden" aria-labelledby="cta-h" style={{ color: "var(--on-dark)" }}>
        <Parallax className="!absolute inset-0" strength={0.12}>
          <div className="absolute inset-0 v2-media v2-grain">
            <Picture image={materialLibrary[0].image} sizes="100vw" />
          </div>
        </Parallax>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgb(60 22 10 / 0.35) 0%, rgb(40 15 8 / 0.82) 50%, rgb(30 12 6 / 0.92) 100%)",
          }}
        />
        <div className="relative v2-wrap py-28 md:py-40 grid lg:grid-cols-12">
          <div className="lg:col-span-7 lg:col-start-6">
            <p className="v2-label" style={{ color: "var(--on-dark-2)" }}>
              A private visit
            </p>
            <LineReveal id="cta-h" className="v2-d1 mt-5" lines={["Walk it once.", "You will know."]} />
            <Stroke className="mt-8" />
            <Rise delay={0.2}>
              <p className="v2-lead mt-8" style={{ color: "var(--on-dark-2)" }}>
                A partner walks the house or land with you — the light, the approach, the
                neighbours, the documents. We take on a small number of houses each year.
              </p>
            </Rise>
            <Rise delay={0.3} className="mt-10 flex flex-wrap gap-3">
              <Link to="/v2/enquire" search={{ visit: true }} className="v2-btn v2-btn--primary">
                Arrange a private walk <Arrow />
              </Link>
              <Link to="/v2/enquire" search={{ interest: "land" }} className="v2-btn v2-btn--ghost">
                Ask for the complete dossier <Arrow />
              </Link>
            </Rise>
            <p className="mt-8 text-[0.9rem]" style={{ color: "var(--on-dark-2)" }}>
              Or write to{" "}
              <a href={`mailto:${studio.email}`} className="v2-link">
                {studio.email}
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

/* 03 · The land — mode toggles + time of day drive the 3D model. */
function LandSection({ plot }: { plot: NonNullable<ReturnType<typeof getListing>> }) {
  const [mode, setMode] = useState<SiteMode>("day");
  const [hour, setHour] = useState(9.5);
  const notes: Record<SiteMode, string> = {
    day: "Morning sun reaches the east wing first; by afternoon the verandah on the sea side carries the heat off the rooms behind it.",
    monsoon:
      "June to September the south-west monsoon arrives off the sea. The casuarina belt takes the wind; the courtyard collects the rain.",
    measure: `${plot.plot!.frontageFt} ft of frontage to the west, ${plot.plot!.depthFt} ft deep — drawn to the listing’s stated dimensions.`,
  };
  const modes: [SiteMode, string, React.ReactNode][] = [
    [
      "day",
      "Daylight",
      <svg key="d" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
        <circle cx="8" cy="8" r="3" />
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6 13 13M3 13l1.4-1.4M11.6 4.4 13 3" />
      </svg>,
    ],
    [
      "monsoon",
      "Monsoon",
      <svg key="m" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
        <path d="M4 9.5h8a2.5 2.5 0 0 0 0-5 3.5 3.5 0 0 0-6.7-.8A2.6 2.6 0 0 0 4 9.5Z" />
        <path d="M5 12l-.8 2M8 12l-.8 2M11 12l-.8 2" />
      </svg>,
    ],
    [
      "measure",
      "Measure",
      <svg key="r" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
        <path d="M1.5 11 11 1.5l3.5 3.5L5 14.5Z" />
        <path d="M4 8.5l1.5 1.5M6 6.5l1 1M8 4.5l1.5 1.5" />
      </svg>,
    ],
  ];
  return (
    <section id="ch-land" className="v2-forest v2-section" aria-labelledby="land-h">
      <div className="v2-wrap grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4 flex flex-col">
          <p className="v2-label">03 · The land</p>
          <LineReveal id="land-h" className="v2-d2 mt-5" lines={["Know every", "contour."]} />
          <Stroke className="mt-7" />
          <p className="v2-body mt-7 max-w-sm">
            A true sense of the land, the house and its setting — turn the model, follow the sun,
            bring in the monsoon, take the measurements.
          </p>
          <div className="mt-8 grid gap-2 justify-start" role="group" aria-label="Model view">
            {modes.map(([k, label, icon]) => (
              <button
                key={k}
                type="button"
                className="v2-toggle"
                aria-pressed={mode === k}
                onClick={() => setMode(k)}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
          <div className="mt-8 min-h-[9rem]">
            {mode === "day" && (
              <motion.label
                className="v2-field max-w-xs"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <span>
                  Time of day ·{" "}
                  <span className="v2-num" style={{ color: "var(--on-dark)" }}>
                    {hhmm(hour)}
                  </span>
                </span>
                <input
                  type="range"
                  className="v2-range"
                  min={6}
                  max={18}
                  step={0.25}
                  value={hour}
                  aria-valuetext={hhmm(hour)}
                  onChange={(e) => setHour(Number(e.target.value))}
                  style={{ color: "var(--on-dark)" }}
                />
              </motion.label>
            )}
            <motion.p
              key={mode}
              className="v2-body mt-4 max-w-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              aria-live="polite"
            >
              {notes[mode]}
            </motion.p>
          </div>
        </div>
        <div className="lg:col-span-8">
          <SiteModel
            className="w-full aspect-[4/5] sm:aspect-[4/3] lg:aspect-[16/11]"
            frontageFt={plot.plot!.frontageFt}
            depthFt={plot.plot!.depthFt}
            facing={plot.plot!.facing}
            coastal
            roadSide="back"
            build="courtyard"
            mode={mode}
            hour={hour}
            label={`Interactive 3D model of ${plot.name}, a ${plot.plot!.frontageFt} by ${plot.plot!.depthFt} foot coastal plot, with an indicative courtyard house. Drag to turn.`}
          />
          <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4">
            <p className="text-[0.85rem] max-w-xl" style={{ color: "var(--on-dark-3)" }}>
              Demonstration plot — {plot.name}, {plot.locality}. Frontage, depth and facing are the
              listing’s; terrain, trees and the house massing are indicative.
            </p>
            <Link to="/v2/collection/$slug" params={{ slug: plot.slug }} className="v2-arrowlink">
              Open the plot <Arrow />
            </Link>
          </div>
        </div>
      </div>
    </section>
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
            <LineReveal id="proc-h" className="v2-d2 mt-5" lines={["Five seasons", "before a key turns."]} />
          </div>
          <Link to="/v2/studio" className="v2-btn v2-btn--line">
            The studio <Arrow />
          </Link>
        </div>
        <div className="relative mt-16 h-px" style={{ background: "var(--line)" }} aria-hidden="true">
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
