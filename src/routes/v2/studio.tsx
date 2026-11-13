import { createFileRoute, Link } from "@tanstack/react-router";
import { LineReveal, Parallax, Rise as Reveal, Stroke, Stagger, Item } from "@/v2/motion";
import { images, processSteps, services, studio } from "@/v2/data";
import { Picture } from "@/v2/components/Picture";
import { SunStudy } from "@/v2/components/SunStudy";
import { Arrow } from "@/v2/components/Logo";
import { Breadcrumbs } from "@/v2/components/Breadcrumbs";

export const Route = createFileRoute("/v2/studio")({
  head: () => ({
    meta: [
      { title: "The studio — how Aangan designs and builds" },
      {
        name: "description",
        content:
          "Aangan is a small architecture, interior and residential studio. How we work, what we offer, and how to begin.",
      },
      { property: "og:title", content: "The studio — how Aangan designs and builds" },
      {
        property: "og:description",
        content:
          "Aangan is a small architecture, interior and residential studio. How we work, what we offer, and how to begin.",
      },
      { property: "og:image", content: "https://aangan.studio/v2/film/aangan-film-poster.webp" },
      { name: "twitter:title", content: "The studio · Aangan" },
      {
        name: "twitter:description",
        content:
          "How Aangan designs and builds private residences across India.",
      },
      { name: "twitter:image", content: "https://aangan.studio/v2/film/aangan-film-poster.webp" },
    ],
    links: [{ rel: "canonical", href: "https://aangan.studio/v2/studio" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Do you build on land I already own?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes — most of our houses are built on the client's own land. We begin with a site study before any drawing.",
              },
            },
            {
              "@type": "Question",
              name: "Why are prices not published?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Each house and plot is priced with its documents, plans and specification. We share all of it together, in writing, after a first conversation.",
              },
            },
            {
              "@type": "Question",
              name: "How do you handle due diligence on land?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "We share what we know about a site, and we ask that title, zoning and approvals are verified by your own advocate before any offer.",
              },
            },
            {
              "@type": "Question",
              name: "How long does a house take?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Our residences have typically taken several years from commission to handover. We give a realistic programme after the site study.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: Studio,
});

const faqs = [
  {
    q: "Do you build on land I already own?",
    a: "Yes — most of our houses are built on the client’s own land. We begin with a site study before any drawing.",
  },
  {
    q: "Why are prices not published?",
    a: "Each house and plot is priced with its documents, plans and specification. We share all of it together, in writing, after a first conversation.",
  },
  {
    q: "How do you handle due diligence on land?",
    a: "We share what we know about a site, and we ask that title, zoning and approvals are verified by your own advocate before any offer.",
  },
  {
    q: "How long does a house take?",
    a: "Our residences have typically taken several years from commission to handover. We give a realistic programme after the site study.",
  },
];

function Studio() {
  return (
    <>
      <section
        className="relative min-h-[92svh] flex items-end overflow-hidden v2-forest"
        aria-labelledby="studio-h"
      >
        <Parallax className="!absolute inset-0" strength={0.1}>
          <div className="absolute inset-0 v2-media v2-grain">
            <Picture image={images.bluehour} sizes="100vw" priority />
          </div>
        </Parallax>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(0deg, rgb(12 18 14 / 0.92) 0%, rgb(12 18 14 / 0.4) 50%, rgb(12 18 14 / 0.15) 100%)",
          }}
        />
        <div className="relative v2-wrap pb-14 md:pb-20">
          <Breadcrumbs crumbs={[{ label: "The studio" }]} dark />
          <p className="v2-label mt-5">The studio · since {studio.since}</p>
          <LineReveal
            as="h1"
            id="studio-h"
            immediate
            delay={0.2}
            className="v2-d1 mt-5"
            lines={["A house is", "a slow object."]}
          />
          <Stroke className="mt-8" />
          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            <p className="v2-lead lg:col-span-6" style={{ color: "var(--on-dark-2)" }}>
              Aangan is a small studio of architects and interior designers. We work at the pace of
              the material, not the market — one house at a time, across{" "}
              {studio.cities.join(", ").replace(/, ([^,]*)$/, " and $1")}.
            </p>
            <p className="v2-body lg:col-span-5 lg:col-start-8">
              <span className="v2-italic text-[1.15rem]" style={{ color: "var(--on-dark)" }}>
                Aangan — आँगन —
              </span>{" "}
              is the open courtyard at the centre of a traditional Indian house. It is where light,
              air and family gather, and it is the idea most of our plans grow from.
            </p>
          </div>
          <p className="v2-caption mt-8" style={{ color: "var(--on-dark-3)" }}>
            Representational image
          </p>
        </div>
      </section>

      <section className="v2-section" aria-labelledby="proc-h">
        <div className="v2-wrap">
          <Reveal>
            <p className="v2-label">Process</p>
            <h2 id="proc-h" className="v2-d2 mt-5 max-w-[14ch]">
              Five seasons before a key turns.
            </h2>
          </Reveal>
          <Stagger as="ol" className="mt-14" style={{ borderTop: "1px solid var(--line)" }}>
            {processSteps.map((s) => (
              <Item
                as="li"
                key={s.n}
                className="grid gap-3 md:grid-cols-12 py-8"
                style={{ borderBottom: "1px solid var(--line)" }}
              >
                <span
                  className="v2-label md:col-span-1 pt-2"
                  style={{ color: "var(--terracotta)" }}
                >
                  {s.n}
                </span>
                <h3 className="md:col-span-4 text-[2.6rem]">{s.title}</h3>
                <p className="v2-body md:col-span-6 md:col-start-7 text-[1rem]">{s.body}</p>
              </Item>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="v2-section v2-surface" aria-labelledby="sun-h">
        <div className="v2-wrap">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="v2-label">Climate &amp; section</p>
              <h2 id="sun-h" className="v2-d2 mt-5">
                We draw the sun before the walls.
              </h2>
            </div>
            <p className="v2-body max-w-md">
              Before sketching a single room, we study overhang depth, cross-ventilation, and
              thermal mass across an ordinary day.
            </p>
          </div>
          <SunStudy />
        </div>
      </section>

      <section className="v2-section" aria-labelledby="svc-h">
        <div className="v2-wrap">
          <p className="v2-label">Services</p>
          <h2 id="svc-h" className="v2-d2 mt-5 max-w-[16ch]">
            Six ways we work with private clients.
          </h2>
          <ul
            className="mt-12 grid gap-px sm:grid-cols-2 lg:grid-cols-3"
            style={{ background: "var(--line)" }}
          >
            {services.map((s, i) => (
              <li
                key={s.title}
                className="p-6 md:p-8 flex flex-col gap-8"
                style={{ background: "var(--ivory)" }}
              >
                <span className="v2-label" style={{ color: "var(--terracotta)" }}>
                  0{i + 1}
                </span>
                <div>
                  <h3 className="text-[2.1rem]">{s.title}</h3>
                  <p className="v2-body mt-3">{s.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="v2-section v2-forest" aria-labelledby="faq-h">
        <div className="v2-wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="v2-label">Questions buyers ask</p>
            <h2 id="faq-h" className="v2-d2 mt-5">
              Before you write to us.
            </h2>
          </div>
          <div className="lg:col-span-8">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group py-6"
                style={{ borderBottom: "1px solid var(--line)" }}
              >
                <summary
                  className="flex justify-between gap-6 cursor-pointer list-none text-[1.55rem] leading-tight"
                  style={{ fontFamily: "var(--f-display)" }}
                >
                  {f.q}
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-300 group-open:rotate-45 text-[1.5rem] leading-none"
                  >
                    +
                  </span>
                </summary>
                <p className="v2-body mt-4 max-w-2xl">{f.a}</p>
              </details>
            ))}
            <Link to="/v2/enquire" className="v2-btn v2-btn--primary mt-10">
              Book a consultation <Arrow />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
