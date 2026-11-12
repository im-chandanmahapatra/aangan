import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * A solid ink panel that wipes up between routes. Timed to the site's
 * motion token (--ease-editorial). Skipped for reduced-motion users.
 */
export function RouteCurtain() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const prev = useRef(pathname);
  const [phase, setPhase] = useState<"idle" | "in" | "out">("idle");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(!reduce);
  }, []);

  useEffect(() => {
    if (!enabled) {
      prev.current = pathname;
      return;
    }
    if (prev.current === pathname) return;
    prev.current = pathname;
    setPhase("in");
    // Snap the scroll after the curtain covers, before it lifts.
    const t1 = window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
      setPhase("out");
    }, 460);
    const t2 = window.setTimeout(() => setPhase("idle"), 1140);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pathname, enabled]);

  if (phase === "idle") return null;
  return (
    <div
      className={`fixed inset-0 z-[200] bg-foreground pointer-events-none ${
        phase === "in" ? "curtain-in" : "curtain-out"
      }`}
      aria-hidden="true"
    />
  );
}
