import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const links = [
  { to: "/residences", label: "Residences" },
  { to: "/interiors", label: "Interiors" },
  { to: "/philosophy", label: "Studio" },
  { to: "/consultation", label: "Consultation" },
] as const;

export function SiteNav({ overHero = false }: { overHero?: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const glass = scrolled || !overHero;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        glass
          ? "bg-background/85 backdrop-blur-md border-b border-foreground/8"
          : "bg-transparent"
      }`}
      style={{ color: glass ? "var(--color-foreground)" : "var(--color-background)" }}
    >
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-baseline gap-2.5 group" aria-label="Aangan — home">
          <span className="devanagari text-[1.35rem] md:text-[1.55rem] opacity-70 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true">आँगन</span>
          <span className="display text-2xl md:text-[1.7rem] tracking-[-0.02em]">Aangan</span>
        </Link>
        <nav className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="eyebrow nav-underline"
              activeProps={{ "data-active": "true" }}
              style={{ color: "inherit" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/consultation"
          className="eyebrow hidden md:inline-flex items-center gap-2 border border-current/40 px-4 py-2 rounded-[2px] hover:bg-foreground hover:text-background hover:border-foreground transition-colors duration-500"
          style={{ color: "inherit" }}
        >
          Book a Visit
        </Link>
        <Link
          to="/consultation"
          className="eyebrow md:hidden border-b border-current/40 pb-0.5"
          style={{ color: "inherit" }}
        >
          Visit
        </Link>
      </div>
    </header>
  );
}
