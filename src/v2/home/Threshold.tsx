/**
 * Cinematic entry — the first thing a visitor sees on the homes page, once
 * per session.  A dark screen with the AANGAN wordmark, a gentle glow, and
 * a "Step Inside" CTA.  Pressing the CTA or the always-visible Skip button
 * dissolves the overlay and reveals the page beneath.  Under reduced motion
 * it fades rather than animates.  SessionStorage prevents it from showing
 * again in the same tab.
 *
 * This is a pure CSS + Framer Motion component — no Three.js, no video.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { motion, useReducedMotion, EASE } from "../motion";

const STORAGE_KEY = "aangan-threshold-seen";

function alreadySeen(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* private browsing */
  }
}

export function Threshold({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"intro" | "exiting" | "done">(() =>
    alreadySeen() ? "done" : "intro",
  );
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-dismiss after 12 s so it never traps the visitor.
  useEffect(() => {
    if (phase !== "intro") return;
    timer.current = setTimeout(() => dismiss(), 12_000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const dismiss = useCallback(() => {
    if (phase !== "intro") return;
    markSeen();
    setPhase("exiting");
    // Let the exit animation play, then notify parent.
    setTimeout(
      () => {
        setPhase("done");
        onDone();
      },
      reduce ? 200 : 900,
    );
  }, [phase, onDone, reduce]);

  // Keyboard: Escape also dismisses.
  useEffect(() => {
    if (phase !== "intro") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, dismiss]);

  if (phase === "done") return null;

  return (
    <AnimatePresence>
      <motion.div
          key="threshold"
          className="v2-threshold"
          initial={{ opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0 }}
          transition={{ duration: reduce ? 0.2 : 0.85, ease: EASE }}
          aria-label="Welcome to Aangan homes"
          role="dialog"
          aria-modal="false"
        >
          {/* ——— ambient glow ——— */}
          <div className="v2-threshold__scene" aria-hidden="true">
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse 60% 55% at 50% 52%, rgb(38 56 40 / 0.45), transparent 70%)",
              }}
            />
            {/* vertical light shaft */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "12%",
                width: "2px",
                height: "76%",
                transform: "translateX(-50%)",
                background:
                  "linear-gradient(to bottom, transparent, rgb(243 237 226 / 0.12) 30%, rgb(243 237 226 / 0.12) 70%, transparent)",
              }}
            />
            {/* horizontal warm band */}
            <div
              style={{
                position: "absolute",
                left: "20%",
                right: "20%",
                top: "49%",
                height: "2px",
                background:
                  "linear-gradient(to right, transparent, rgb(184 149 90 / 0.22) 30%, rgb(184 149 90 / 0.22) 70%, transparent)",
              }}
            />
          </div>

          {/* ——— wordmark + CTA ——— */}
          <div className="v2-threshold__inner">
            <motion.p
              className="v2-label"
              style={{
                color: "var(--brass)",
                letterSpacing: "0.18em",
                fontSize: "0.7rem",
              }}
              initial={reduce ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
            >
              Aangan
            </motion.p>
            <motion.h2
              className="v2-d1"
              style={{
                color: "var(--on-dark)",
                maxWidth: "14ch",
                lineHeight: 1.08,
              }}
              initial={reduce ? {} : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.4, delay: 0.4, ease: EASE }}
            >
              Walk through
              <br />
              the home.
            </motion.h2>
            <motion.p
              className="v2-body"
              style={{
                color: "var(--on-dark-2)",
                maxWidth: "32ch",
                marginTop: "0.25rem",
              }}
              initial={reduce ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.8, ease: EASE }}
            >
              Four demonstration layouts drawn to real dimensions. Turn each
              one, step inside, and explore room by room.
            </motion.p>
            <motion.button
              type="button"
              className="v2-btn v2-btn--light"
              onClick={dismiss}
              style={{ marginTop: "1rem" }}
              initial={reduce ? {} : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2, ease: EASE }}
            >
              Step inside
            </motion.button>
          </div>

          {/* ——— skip ——— */}
          <button
            type="button"
            className="v2-threshold__skip"
            onClick={dismiss}
          >
            Skip
          </button>
        </motion.div>
    </AnimatePresence>
  );
}
