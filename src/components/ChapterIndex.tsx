import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Aangan's signature device. A thin sticky vertical rail in the outer
 * right margin showing the active chapter of the current route. Watches
 * every `<section data-chapter="01" data-chapter-title="Arrival">` on the
 * page via IntersectionObserver.
 *
 * Hidden on `/consultation` and residence detail pages (short routes
 * without meaningful chapters). Also hidden on viewports below `lg`.
 */
type Chapter = { id: string; num: string; name: string };

export function ChapterIndex() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [overHero, setOverHero] = useState(false);

  const hidden =
    pathname.startsWith("/consultation") ||
    pathname.startsWith("/residences/");

  // Re-scan chapters whenever the route changes.
  useEffect(() => {
    if (hidden) {
      setChapters([]);
      return;
    }
    // Wait a frame so newly-mounted route content is in the DOM.
    const t = window.setTimeout(() => {
      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>("[data-chapter]"),
      );
      const found: Chapter[] = nodes.map((n, i) => ({
        id: n.id || `chapter-${i}`,
        num: n.dataset.chapter || String(i + 1).padStart(2, "0"),
        name: n.dataset.chapterTitle || "",
      }));
      // Ensure each node has an id so anchor links work.
      nodes.forEach((n, i) => {
        if (!n.id) n.id = `chapter-${i}`;
      });
      setChapters(found);
      setActive(found[0]?.id ?? null);

      if (found.length === 0) return;
      const io = new IntersectionObserver(
        (entries) => {
          // Pick the entry with the largest intersection ratio currently visible.
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          if (visible[0]) {
            const el = visible[0].target as HTMLElement;
            setActive(el.id);
            setOverHero(el.dataset.chapterHero === "true");
          }
        },
        {
          rootMargin: "-38% 0px -55% 0px",
          threshold: [0, 0.2, 0.5, 0.8, 1],
        },
      );
      nodes.forEach((n) => io.observe(n));
      return () => io.disconnect();
    }, 60);
    return () => window.clearTimeout(t);
  }, [pathname, hidden]);

  if (hidden || chapters.length === 0) return null;

  return (
    <nav
      className="chapter-rail"
      aria-label="Page sections"
      data-over-hero={overHero ? "true" : "false"}
    >
      {chapters.map((c) => (
        <a
          key={c.id}
          href={`#${c.id}`}
          data-active={active === c.id ? "true" : undefined}
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById(c.id);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          <span className="num">{c.num}</span>
          <span className="dot" aria-hidden="true" />
          <span className="name">{c.name}</span>
        </a>
      ))}
    </nav>
  );
}
