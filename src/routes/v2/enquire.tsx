import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { getListing, images, studio, type Listing } from "@/v2/data";
import { Picture } from "@/v2/components/Picture";
import { Item, LineReveal, Rise, Stagger, Stroke } from "@/v2/motion";
import { EnquiryForm } from "@/v2/components/EnquiryForm";
import { Breadcrumbs } from "@/v2/components/Breadcrumbs";

const search = z.object({
  listing: z.string().optional().catch(undefined),
  /** comma-separated slugs from the shortlist */
  shortlist: z.string().optional().catch(undefined),
  visit: z.coerce.boolean().optional().catch(undefined),
  interest: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/v2/enquire")({
  validateSearch: (s) => search.parse(s),
  head: () => ({
    meta: [
      { title: "Book a consultation or site visit · Aangan" },
      {
        name: "description",
        content:
          "Request a private consultation or a site visit with the Aangan studio. A partner replies personally within two working days.",
      },
      { property: "og:title", content: "Book a consultation or site visit · Aangan" },
      {
        property: "og:description",
        content:
          "Request a private consultation or a site visit with the Aangan studio.",
      },
      { property: "og:image", content: "https://aangan.studio/v2/film/aangan-film-poster.webp" },
      { name: "twitter:title", content: "Book a consultation · Aangan" },
      {
        name: "twitter:description",
        content:
          "Request a private consultation or a site visit with the Aangan studio.",
      },
      { name: "twitter:image", content: "https://aangan.studio/v2/film/aangan-film-poster.webp" },
    ],
    links: [{ rel: "canonical", href: "https://aangan.studio/v2/enquire" }],
  }),
  component: Enquire,
});

function Enquire() {
  const s = Route.useSearch();
  const slugs = [s.listing, ...(s.shortlist?.split(",") ?? [])].filter(Boolean) as string[];
  const selected = Array.from(new Set(slugs))
    .map((x) => getListing(x))
    .filter((l): l is Listing => !!l);

  return (
    <section className="grid lg:grid-cols-12 min-h-[100svh]" aria-labelledby="enq-h">
      <div className="lg:col-span-5 relative v2-forest overflow-hidden">
        <div className="absolute inset-0 v2-media opacity-35" aria-hidden="true">
          <Picture image={images.monsoon} sizes="(min-width: 1024px) 42vw, 100vw" />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgb(18 28 22 / 0.7), rgb(18 28 22 / 0.95) 60%)",
          }}
        />
        <div className="relative px-[var(--gutter)] lg:pl-[max(var(--gutter),calc((100vw-1440px)/2+var(--gutter)))] lg:pr-12 pt-[calc(var(--nav-h)+clamp(2.5rem,6vw,5rem))] pb-16">
          <Breadcrumbs crumbs={[{ label: "Enquire" }]} dark />
          <p className="v2-label mt-5">A private visit</p>
          <LineReveal
            as="h1"
            id="enq-h"
            immediate
            delay={0.1}
            className="v2-d1 mt-5"
            style={{ fontSize: "clamp(3rem, 5.4vw, 5.5rem)" }}
            lines={["Begin with", "an hour,", "and the site."]}
          />
          <Stroke className="mt-8" />
          <p className="v2-lead mt-7" style={{ color: "var(--on-dark-2)" }}>
            We take on a small number of houses each year. Write to us and a partner will reply
            personally.
          </p>

          <Stagger
            as="ol"
            className="mt-12 grid gap-6"
            style={{ borderTop: "1px solid var(--line)" }}
          >
            {[
              [
                "01",
                "You write",
                "A few lines about the house or land, and how you’d like to begin.",
              ],
              [
                "02",
                "We reply",
                "A studio partner writes within two working days — never a call centre.",
              ],
              [
                "03",
                "We walk it",
                "An hour’s conversation, or a walk through the house or site with the dossier.",
              ],
              [
                "04",
                "You decide",
                "Plans, specification and price, in writing. No pressure, no deadlines.",
              ],
            ].map(([n, t, b]) => (
              <Item as="li" key={n} className="grid grid-cols-[2.5rem_1fr] gap-3 pt-6">
                <span className="v2-label" style={{ color: "var(--brass)" }}>
                  {n}
                </span>
                <div>
                  <p className="v2-italic text-[1.35rem] leading-tight">{t}</p>
                  <p className="v2-body mt-1">{b}</p>
                </div>
              </Item>
            ))}
          </Stagger>

          <div className="mt-12 pt-6 grid gap-2" style={{ borderTop: "1px solid var(--line)" }}>
            <p className="v2-label">Or write directly</p>
            <a href={`mailto:${studio.email}`} className="v2-link text-[1.05rem]">
              {studio.email}
            </a>
            <p className="v2-body">{studio.address}</p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 v2-paper px-[var(--gutter)] lg:pr-[max(var(--gutter),calc((100vw-1440px)/2+var(--gutter)))] lg:pl-14 pt-12 lg:pt-[calc(var(--nav-h)+clamp(2.5rem,6vw,5rem))] pb-24">
        <Rise>
          <EnquiryForm listings={selected} defaultVisit={!!s.visit} defaultInterest={s.interest} />
        </Rise>
        {selected.length === 0 && (
          <p className="v2-body mt-8">
            Looking at something specific?{" "}
            <Link to="/v2/collection" className="v2-link">
              Browse the collection
            </Link>{" "}
            and use “Request a site visit” on any listing.
          </p>
        )}
      </div>
    </section>
  );
}
