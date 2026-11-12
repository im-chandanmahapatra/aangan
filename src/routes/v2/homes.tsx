import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { HomeExplorer } from "@/v2/home/HomeExplorer";
import { Threshold } from "@/v2/home/Threshold";
import { FloorPlan2D } from "@/v2/home/FloorPlan2D";
import {
  carpetArea,
  homePlans,
  openArea,
  type HomePlan,
} from "@/v2/home/plans";
import { LineReveal, Rise, Stagger, Item, Stroke } from "@/v2/motion";
import { images } from "@/v2/data";

export const Route = createFileRoute("/v2/homes")({
  component: HomesPage,
  head: () => ({
    meta: [
      { title: "Home types — Aangan" },
      {
        name: "description",
        content:
          "Four demonstration layouts — 1, 1.5, 2 and 3 BHK — drawn to show how Aangan organises a home of each size. Walk through each one in 3D.",
      },
    ],
  }),
});

const beds = (p: HomePlan) => p.rooms.filter((r) => r.type === "bed").length;
const baths = (p: HomePlan) => p.rooms.filter((r) => r.type === "bath").length;

function HomesPage() {
  const [thresholdDone, setThresholdDone] = useState(false);

  return (
    <>
      <Threshold onDone={() => setThresholdDone(true)} />

      {/* ——— Opening ——— */}
      <header className="v2-forest relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={images.hero.lg}
            srcSet={`${images.hero.sm} 720w, ${images.hero.lg} 1440w`}
            sizes="100vw"
            alt=""
            aria-hidden="true"
            width={images.hero.w}
            height={images.hero.h}
            className="w-full h-full object-cover"
            style={{ opacity: 0.26 }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgb(18 28 22 / 0.72), rgb(18 28 22 / 0.88))",
            }}
          />
        </div>
        <div
          className="v2-wrap relative"
          style={{ paddingTop: "calc(var(--nav-h) + 5.5rem)", paddingBottom: "4.5rem" }}
        >
          <Rise>
            <p className="v2-label" style={{ color: "var(--brass)" }}>
              Home types
            </p>
          </Rise>
          <LineReveal
            as="h1"
            className="v2-d1 mt-5"
            style={{ color: "var(--on-dark)" }}
            lines={["Four ways", "to hold a life."]}
            immediate
          />
          <Rise delay={0.25}>
            <p className="v2-lead mt-7" style={{ color: "var(--on-dark-2)" }}>
              The same ideas — shade before glass, a quiet end for sleeping, one room that
              opens to the sky — worked out at four sizes. Turn each one in your hands,
              then step inside and walk through it.
            </p>
          </Rise>
          <Rise delay={0.35}>
            <p
              className="v2-caption mt-8 max-w-[62ch]"
              style={{ color: "var(--on-dark-3)" }}
            >
              These are demonstration layouts, drawn by the studio to show how a home of
              each size is organised. They are not a released project and carry no price,
              availability or approval. Every home Aangan builds is drawn for its own site.
            </p>
          </Rise>
        </div>
      </header>

      {/* ——— The explorer ——— */}
      <section className="v2-section">
        <div className="v2-wrap">
          <HomeExplorer initialPlan="court" />
        </div>
      </section>

      {/* ——— Side by side ——— */}
      <section className="v2-section v2-paper v2-light">
        <div className="v2-wrap">
          <Rise>
            <p className="v2-label" style={{ color: "var(--terracotta)" }}>
              Compared
            </p>
            <h2 className="v2-d2 mt-4 max-w-[18ch]">The four plans, at the same scale.</h2>
            <Stroke className="mt-6" />
          </Rise>

          <Stagger className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {homePlans.map((p) => (
              <Item key={p.id} as="div">
                <article>
                  <div
                    className="p-4 border"
                    style={{ borderColor: "var(--line)", background: "var(--ivory)" }}
                  >
                    <FloorPlan2D plan={p} showLabels={false} />
                  </div>
                  <p className="v2-label mt-5" style={{ color: "var(--terracotta)" }}>
                    {p.config}
                  </p>
                  <h3 className="v2-d3 mt-2" style={{ fontSize: "1.6rem" }}>
                    {p.name}
                  </h3>
                  <dl className="v2-specs mt-5">
                    <div>
                      <dt>Carpet</dt>
                      <dd>{carpetArea(p).toLocaleString("en-IN")} sq ft</dd>
                    </div>
                    <div>
                      <dt>Open</dt>
                      <dd>{openArea(p) ? `${openArea(p).toLocaleString("en-IN")} sq ft` : "—"}</dd>
                    </div>
                    <div>
                      <dt>Bed / Bath</dt>
                      <dd>
                        {beds(p)} / {baths(p)}
                      </dd>
                    </div>
                  </dl>
                  <p className="v2-caption mt-4" style={{ color: "var(--ink-2)" }}>
                    {p.tagline}
                  </p>
                </article>
              </Item>
            ))}
          </Stagger>

          <Rise>
            <p className="v2-caption mt-12" style={{ color: "var(--ink-3)" }}>
              Plans are drawn to the same scale and from the same measurements as the 3D
              model. Dimensions are to wall centres.
            </p>
          </Rise>
        </div>
      </section>

      {/* ——— Next step ——— */}
      <section className="v2-earth v2-section">
        <div className="v2-wrap">
          <Rise>
            <h2 className="v2-d2 max-w-[20ch]" style={{ color: "var(--on-dark)" }}>
              None of these is your house yet.
            </h2>
            <p className="v2-lead mt-6" style={{ color: "var(--on-dark-2)" }}>
              They are a way of showing how we think about space before we have seen your
              land. Bring us the site and we will draw the one that belongs on it.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/v2/enquire" className="v2-btn v2-btn--light">
                Start a conversation
              </Link>
              <Link
                to="/v2/collection"
                search={{ kind: "plot" }}
                className="v2-btn v2-btn--ghost"
              >
                Look at land
              </Link>
            </div>
          </Rise>
        </div>
      </section>
    </>
  );
}
