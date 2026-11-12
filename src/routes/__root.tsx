import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ChapterIndex } from "../components/ChapterIndex";
import { CursorView } from "../components/CursorView";
import { RouteCurtain } from "../components/RouteCurtain";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <p className="eyebrow">404 — Not found</p>
        <h1 className="mt-6 display text-5xl md:text-6xl text-foreground">
          This page has slipped away.
        </h1>
        <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
          The address you followed doesn't lead anywhere in our studio.
        </p>
        <div className="mt-10">
          <Link
            to="/"
            className="eyebrow inline-flex items-center gap-3 border-b border-foreground/40 pb-1 hover:border-signal hover:text-signal transition-colors"
          >
            <span>Return to Aangan</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <p className="eyebrow">A moment.</p>
        <h1 className="mt-6 display text-4xl md:text-5xl text-foreground">
          Something didn't load.
        </h1>
        <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
          Try again, or return to the entrance.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-6">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="eyebrow border-b border-foreground/40 pb-1 hover:border-signal hover:text-signal transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="eyebrow border-b border-foreground/40 pb-1 hover:border-signal hover:text-signal transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Aangan — Crafted Beyond Time." },
      {
        name: "description",
        content:
          "Aangan is a small Indian architecture and interior studio building private residences slowly, materially, and by hand across Mumbai, Bengaluru, Goa, and Delhi NCR.",
      },
      { name: "author", content: "Aangan" },
      { property: "og:site_name", content: "Aangan" },
      { property: "og:title", content: "Aangan — Crafted Beyond Time." },
      {
        property: "og:description",
        content:
          "A small Indian architecture and interior studio. Private residences, built slowly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#FAF7F2" },
      { name: "twitter:title", content: "Aangan — Crafted Beyond Time." },
      { name: "description", content: "STATIC PAGE OF AANGAN" },
      { property: "og:description", content: "STATIC PAGE OF AANGAN" },
      { name: "twitter:description", content: "STATIC PAGE OF AANGAN" },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/fedb742e-33e9-49de-9a8b-27e12c5b86d5/id-preview-6d5c1cea--57d34785-5d34-44a8-b780-a69df3d22bc0.lovable.app-1782929901764.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/fedb742e-33e9-49de-9a8b-27e12c5b86d5/id-preview-6d5c1cea--57d34785-5d34-44a8-b780-a69df3d22bc0.lovable.app-1782929901764.png",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      // Preload the display font's WOFF2 subset for LCP.
      {
        rel: "preload",
        as: "style",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@300;400;500;600&family=Noto+Serif+Devanagari:wght@400;500&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@300;400;500;600&family=Noto+Serif+Devanagari:wght@400;500&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Aangan",
          description: "An Indian architecture, interior and residential development studio.",
          areaServed: ["Mumbai", "Bengaluru", "Goa", "Delhi NCR"],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  // V2 (/v2/*) has its own layout and motion system; V1's global overlays
  // (route curtain, chapter rail, cursor chip) stay on V1 routes only.
  const isV2 = useRouterState({ select: (s) => s.location.pathname.startsWith("/v2") });

  return (
    <QueryClientProvider client={queryClient}>
      {!isV2 && <RouteCurtain />}
      {!isV2 && <ChapterIndex />}
      {!isV2 && <CursorView />}
      <Outlet />
    </QueryClientProvider>
  );
}
