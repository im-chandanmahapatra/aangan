import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { MotionConfig } from "framer-motion";
import v2Css from "@/v2/v2.css?url";
import homeCss from "@/v2/home-explorer.css?url";
import { Nav } from "@/v2/components/Nav";
import { Footer } from "@/v2/components/Footer";

/**
 * V2 layout. Everything under /v2 renders inside `.v2`, which scopes the V2
 * design tokens; V1 routes and styles are untouched.
 * MotionConfig reducedMotion="user" makes every framer-motion transform
 * respect the visitor's reduced-motion setting.
 */
export const Route = createFileRoute("/v2")({
  head: () => ({
    meta: [{ name: "theme-color", content: "#121c16" }],
    links: [
      { rel: "stylesheet", href: v2Css },
      { rel: "stylesheet", href: homeCss },
      { rel: "icon", href: "/v2-favicon.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: V2Layout,
  notFoundComponent: V2NotFound,
});

function V2Layout() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="v2">
        <Nav />
        <main id="main" tabIndex={-1} style={{ outline: "none" }}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}

function V2NotFound() {
  return (
    <section className="v2-wrap v2-section" style={{ paddingTop: "calc(var(--nav-h) + 6rem)" }}>
      <p className="v2-label">404</p>
      <h1 className="v2-d2 mt-4 max-w-[14ch]">This page isn’t on the plan.</h1>
      <p className="v2-lead mt-6">
        The address may have changed. Try the collection, or go back to the start.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/v2/collection" className="v2-btn v2-btn--ink">
          Browse the collection
        </Link>
        <Link to="/v2" className="v2-btn v2-btn--line">
          Home
        </Link>
      </div>
    </section>
  );
}
