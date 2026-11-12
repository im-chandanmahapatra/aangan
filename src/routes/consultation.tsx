import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ConsultationForm } from "@/components/ConsultationForm";
import { Reveal } from "@/components/Reveal";
import { studio } from "@/data/site";

const searchSchema = z.object({
  residence: z.string().optional(),
});

export const Route = createFileRoute("/consultation")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Private Consultation — Aangan" },
      {
        name: "description",
        content:
          "Request a private consultation with the Aangan studio. A single conversation to see whether we are the right fit for the house you have in mind.",
      },
      { property: "og:title", content: "Private Consultation — Aangan" },
      {
        property: "og:description",
        content: "A single, quiet conversation with the Aangan studio.",
      },
      { property: "og:url", content: "/consultation" },
    ],
    links: [{ rel: "canonical", href: "/consultation" }],
  }),
  component: ConsultationPage,
});

function ConsultationPage() {
  return (
    <>
      <SiteNav />
      <main>
        <section className="pt-40 md:pt-56 pb-32 md:pb-48 bg-background">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10 grid md:grid-cols-12 gap-12">
            <div className="md:col-span-5">
              <Reveal>
                <p className="eyebrow">Private Consultation</p>
                <h1 className="mt-6 display text-6xl md:text-7xl text-foreground leading-[0.98]">
                  Begin, quietly.
                </h1>
                <p className="mt-8 text-[15px] leading-[1.85] text-muted-foreground max-w-sm">
                  We take on a small number of new projects each year. Send a
                  note and a partner from the studio will write to you
                  personally within two working days.
                </p>
              </Reveal>

              <Reveal delay={120}>
                <div className="mt-16 space-y-6 border-t border-foreground/10 pt-10">
                  <div>
                    <p className="eyebrow">Studio</p>
                    <p className="mt-3 text-sm text-foreground">{studio.address}</p>
                  </div>
                  <div>
                    <p className="eyebrow">Direct</p>
                    <p className="mt-3 text-sm">
                      <a href={`mailto:${studio.email}`} className="nav-underline text-foreground">
                        {studio.email}
                      </a>
                      <br />
                      <span className="text-muted-foreground">{studio.phone}</span>
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
            <div className="md:col-span-7">
              <Reveal delay={200}>
                <ConsultationForm />
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
