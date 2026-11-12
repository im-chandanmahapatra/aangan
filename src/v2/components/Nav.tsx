import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Logo, Arrow } from "./Logo";
import { useShortlist } from "../shortlist";
import { EASE } from "../motion";

const links = [
  { to: "/v2/collection", search: { kind: "residence" }, label: "Residences" },
  { to: "/v2/collection", search: { kind: "plot" }, label: "Land" },
  { to: "/v2/interiors", label: "Interiors" },
  { to: "/v2/studio", label: "Studio" },
] as const;

/** Pages that open on a dark, full-bleed band — the nav starts transparent there. */
function opensDark(path: string) {
  const p = path.replace(/\/$/, "");
  return (
    p === "/v2" ||
    p === "/v2/collection" ||
    p.startsWith("/v2/collection/") ||
    p === "/v2/interiors" ||
    p === "/v2/studio"
  );
}

export function Nav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const firstLink = useRef<HTMLAnchorElement | null>(null);
  const toggle = useRef<HTMLButtonElement | null>(null);

  const keepVisible = pathname.replace(/\/$/, "") === "/v2/collection";

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (keepVisible) {
        setHidden(false);
        lastY = y;
        return;
      }
      // hide while reading downward, return on any upward scroll
      setHidden(y > 640 && y > lastY + 4);
      if (y < lastY - 4 || y < 640) setHidden(false);
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [keepVisible]);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstLink.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const solid = !opensDark(pathname) || scrolled;
  const { items } = useShortlist();

  return (
    <>
      <a
        href="#main"
        className="v2-btn v2-btn--ink"
        style={{ position: "fixed", left: 12, top: -80, zIndex: 100 }}
        onFocus={(e) => (e.currentTarget.style.top = "12px")}
        onBlur={(e) => (e.currentTarget.style.top = "-80px")}
      >
        Skip to content
      </a>
      <header
        className="v2-nav"
        data-solid={solid ? "true" : "false"}
        data-hidden={hidden && !open ? "true" : "false"}
      >
        <div className="v2-wrap h-full flex items-center justify-between gap-6">
          <Link to="/v2" aria-label="Aangan — home" className="text-inherit no-underline">
            <Logo compact />
          </Link>
          <nav aria-label="Primary" className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                search={"search" in l ? l.search : undefined}
                className="v2-navlink"
                activeOptions={{ includeSearch: true }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            {items.length > 0 && (
              <Link
                to="/v2/shortlist"
                className="v2-navlink inline-flex items-center gap-1.5"
                aria-label={`Shortlist, ${items.length} saved`}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M3.5 1.75h9v12.5L8 11.2l-4.5 3.05z" fill="currentColor" />
                </svg>
                <span className="v2-num">{items.length}</span>
              </Link>
            )}
            <Link
              to="/v2/enquire"
              search={{ visit: true }}
              className={`v2-btn ${solid ? "v2-btn--ink" : "v2-btn--ghost"} v2-hide-sm`}
              style={{ minHeight: "2.6rem" }}
            >
              Arrange a visit
            </Link>
            <button
              ref={toggle}
              type="button"
              className="md:hidden inline-flex items-center justify-center w-11 h-11 -mr-2"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="v2-menu"
              onClick={() => setOpen(true)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 8h18M3 16h12" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="v2-menu"
            className="v2-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div
              className="v2-wrap flex items-center justify-between"
              style={{ height: "var(--nav-h)" }}
            >
              <Logo compact />
              <button
                type="button"
                className="inline-flex items-center justify-center w-11 h-11 -mr-2"
                aria-label="Close menu"
                onClick={() => {
                  setOpen(false);
                  toggle.current?.focus();
                }}
              >
                <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
                  <path d="M5 5l12 12M17 5 5 17" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            </div>
            <motion.nav
              aria-label="Mobile"
              className="v2-wrap flex-1 flex flex-col justify-center"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } } }}
            >
              {[
                { to: "/v2", label: "Home" } as const,
                ...links,
                {
                  to: "/v2/shortlist",
                  label: `Shortlist${items.length ? ` (${items.length})` : ""}`,
                } as const,
              ].map((l, i) => (
                <motion.div
                  key={l.label}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
                  }}
                >
                  <Link
                    to={l.to}
                    search={"search" in l ? l.search : undefined}
                    ref={i === 0 ? firstLink : undefined}
                    className="flex items-baseline justify-between py-3 no-underline text-inherit"
                    style={{ borderBottom: "1px solid rgb(243 237 226 / 0.14)" }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--f-display)",
                        fontSize: "2.7rem",
                        lineHeight: 1.05,
                      }}
                    >
                      {l.label}
                    </span>
                    <span className="v2-label" style={{ color: "var(--on-dark-2)" }}>
                      0{i + 1}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.nav>
            <div className="v2-wrap pb-8 grid gap-2">
              <Link
                to="/v2/enquire"
                search={{ visit: true }}
                className="v2-btn v2-btn--primary w-full"
              >
                Arrange a private visit <Arrow />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
