import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Philosophy } from "@/components/Philosophy";
import { ProcessSteps } from "@/components/ProcessSteps";
import { ClientStories } from "@/components/ClientStories";
import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import { services, studio } from "@/data/site";

export const Route = createFileRoute("/philosophy")({
  head: () => ({
    meta: [
      { title: "The Studio — Aangan" },
      {
        name: "description",
        content:
          "Aangan is a small architecture and interior design studio working quietly across India since 2011.",
      },
      { property: "og:title", content: "The Studio — Aangan" },
      {
        property: "og:description",
        content:
          "A small architecture and interior design studio, working quietly across India since 2011.",
      },
      { property: "og:url", content: "/philosophy" },
    ],
    links: [{ rel: "canonical", href: "/philosophy" }],
  }),
  component: Studio,
});

function Studio() {
  return (
    <>
      <SiteNav />
      <main>
        <section
          data-chapter="01"
          data-chapter-title="Studio"
          className="pt-40 md:pt-56 pb-24 md:pb-40 bg-background"
        >
          <div className="mx-auto max-w-[1600px] px-6 md:px-10 grid md:grid-cols-12 gap-12 items-end">
            <Reveal className="md:col-span-8">
              <p className="eyebrow">The Studio</p>
              <h1 className="mt-6 display text-6xl md:text-8xl lg:text-[8rem] text-foreground leading-[0.95] max-w-[14ch]">
                A quiet room, over fourteen years.
              </h1>
            </Reveal>
            <Reveal className="md:col-span-4">
              <dl className="grid grid-cols-3 gap-6 border-t border-foreground/10 pt-8">
                <div>
                  <dt className="eyebrow">Since</dt>
                  <dd className="mt-3 display text-3xl text-foreground">{studio.since}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Projects</dt>
                  <dd className="mt-3 display text-3xl text-foreground">
                    <CountUp to={studio.projects} />
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Homes lived in</dt>
                  <dd className="mt-3 display text-3xl text-foreground">
                    <CountUp to={studio.completed} />
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </section>

        <Philosophy />

        <section
          data-chapter="04"
          data-chapter-title="Services"
          className="bg-background py-32 md:py-48"
        >
          <div className="mx-auto max-w-[1600px] px-6 md:px-10">
            <Reveal>
              <p className="eyebrow">Services</p>
              <h2 className="mt-6 display text-5xl md:text-7xl text-foreground leading-[0.98] max-w-[16ch]">
                Six ways we work with private clients.
              </h2>
            </Reveal>
            <div className="mt-16 md:mt-24 grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16 border-t border-foreground/10 pt-16">
              {services.map((s, i) => (
                <Reveal delay={i * 60} key={s.title}>
                  <p className="eyebrow text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-4 display text-3xl text-foreground">{s.title}</h3>
                  <p className="mt-4 text-[15px] leading-[1.8] text-muted-foreground max-w-[32ch]">
                    {s.body}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <ProcessSteps />
        <ClientStories />
      </main>
      <SiteFooter />
    </>
  );
}
