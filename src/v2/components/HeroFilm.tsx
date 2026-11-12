import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { EASE, LineReveal } from "../motion";
import { Arrow } from "./Logo";

/** Timing measured from the supplied 10 second, 24 fps single-take film. */
const FILM_TIMING = {
  duration: 10,
  doorStarts: 2.75,
  interiorVisible: 3.75,
  doorClearsCamera: 7.75,
  finalComposition: 8.85,
} as const;

type FilmPhase = "intro" | "threshold" | "passage" | "settled";

function phaseAt(time: number): FilmPhase {
  if (time < FILM_TIMING.doorStarts) return "intro";
  if (time < FILM_TIMING.interiorVisible) return "threshold";
  if (time < FILM_TIMING.finalComposition) return "passage";
  return "settled";
}

export const chapters = [
  { id: "ch-house", label: "The house" },
  { id: "ch-day", label: "A day" },
  { id: "ch-plan", label: "The plan" },
  { id: "ch-places", label: "Places" },
  { id: "ch-dossier", label: "The dossier" },
] as const;

export function HeroFilm() {
  const reduce = useReducedMotion();
  const section = useRef<HTMLElement | null>(null);
  const video = useRef<HTMLVideoElement | null>(null);
  const previousPhase = useRef<FilmPhase>("intro");
  const resumeAfterIntersection = useRef(false);
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [phase, setPhase] = useState<FilmPhase>("intro");
  const [active, setActive] = useState<string | null>(null);
  const [filmAvailable, setFilmAvailable] = useState(true);

  // The hero is the first full-height section, so document scroll gives us a
  // stable hydration-safe 0 → 900 px exit range without a target ref race.
  const { scrollY } = useScroll();
  const filmScale = useTransform(scrollY, [0, 900], [1, 1.08]);
  const filmY = useTransform(scrollY, [0, 900], ["0%", "10%"]);
  const copyY = useTransform(scrollY, [0, 900], ["0%", "-18%"]);
  const copyOpacity = useTransform(scrollY, [0, 650], [1, 0]);
  const dim = useTransform(scrollY, [0, 900], [0, 0.5]);

  // The poster paints immediately. The 5.3 MB H.264 source attaches after
  // hydration and never autoplays for reduced-motion or Save-Data visitors.
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    if (reduce || connection?.saveData) {
      setPhase("settled");
      previousPhase.current = "settled";
      setFilmAvailable(false);
      return;
    }
    const attach = () => setSrc("/v2/film/aangan-entry-720.mp4");
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void) => number })
      .requestIdleCallback;
    if (ric) ric(attach);
    else window.setTimeout(attach, 180);
  }, [reduce]);

  useEffect(() => {
    const element = video.current;
    if (!element || !src || reduce) return;
    element.play().then(
      () => setPlaying(true),
      () => setPlaying(false),
    );
  }, [src, reduce]);

  // Only phase boundaries update React. Per-frame progress is written to a
  // CSS custom property, avoiding a render on every decoded frame.
  useEffect(() => {
    const element = video.current;
    const host = section.current;
    if (!element || !host || !playing) return;
    let raf = 0;
    const sync = () => {
      const time = Math.min(element.currentTime, FILM_TIMING.duration);
      host.style.setProperty("--film-progress", String(time / FILM_TIMING.duration));
      const next = phaseAt(time);
      if (next !== previousPhase.current) {
        previousPhase.current = next;
        setPhase(next);
      }
      if (!element.paused && !element.ended) raf = requestAnimationFrame(sync);
    };
    raf = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  // Stop decoding off screen; resume only when the film was previously active.
  useEffect(() => {
    const element = video.current;
    const host = section.current;
    if (!element || !host || reduce) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        resumeAfterIntersection.current = !element.paused && !element.ended;
        element.pause();
      } else if (resumeAfterIntersection.current) {
        element.play().catch(() => {});
        resumeAfterIntersection.current = false;
      }
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, [reduce, src]);

  useEffect(() => {
    const elements = chapters
      .map((chapter) => document.getElementById(chapter.id))
      .filter((element): element is HTMLElement => !!element);
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const element = video.current;
    if (!element || !filmAvailable) return;
    if (element.paused) {
      if (element.ended || element.currentTime >= FILM_TIMING.duration - 0.1) {
        element.currentTime = 0;
        previousPhase.current = "intro";
        setPhase("intro");
      }
      element.play().catch(() => setPlaying(false));
    } else {
      element.pause();
    }
  };

  const skip = () => {
    const element = video.current;
    if (!element) return;
    element.pause();
    element.currentTime = FILM_TIMING.duration - 0.08;
    previousPhase.current = "settled";
    setPhase("settled");
    section.current?.style.setProperty("--film-progress", "1");
  };

  return (
    <section
      ref={section}
      className="v2-hero flex flex-col"
      data-film-phase={phase}
      aria-labelledby="hero-h"
    >
      <motion.div
        className="absolute inset-0"
        style={reduce ? undefined : { scale: filmScale, y: filmY }}
        aria-hidden="true"
      >
        <motion.div
          className="absolute inset-0 v2-media v2-grain"
          style={{ background: "var(--forest)" }}
          initial={reduce ? false : { scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.2, ease: EASE }}
        >
          <video
            ref={video}
            className="absolute inset-0 v2-entry-film"
            poster={
              reduce || !filmAvailable
                ? "/v2/film/aangan-entry-final.webp"
                : "/v2/film/aangan-entry-poster.webp"
            }
            src={src ?? undefined}
            muted
            playsInline
            preload="metadata"
            disablePictureInPicture
            tabIndex={-1}
            onPause={() => setPlaying(false)}
            onPlay={() => setPlaying(true)}
            onEnded={() => {
              previousPhase.current = "settled";
              setPhase("settled");
              setPlaying(false);
              section.current?.style.setProperty("--film-progress", "1");
            }}
          />
        </motion.div>
      </motion.div>

      <div className="v2-hero__shade" />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--forest)", opacity: dim }}
      />

      {!reduce && (
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 z-20 pointer-events-none"
          style={{ background: "var(--forest)", transformOrigin: "top" }}
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 1.15, ease: [0.7, 0, 0.2, 1], delay: 0.1 }}
        />
      )}

      <motion.div
        className="relative z-10 flex-1 flex v2-wrap"
        style={reduce ? undefined : { y: copyY, opacity: copyOpacity }}
      >
        <AnimatePresence mode="wait">
          {phase === "settled" && (
            <motion.nav
              key="chapter-rail"
              aria-label="Chapters on this page"
              className="hidden lg:flex flex-col justify-center w-44 shrink-0 pt-[var(--nav-h)]"
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
              variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            >
              <div className="v2-rail">
                {chapters.map((chapter, index) => (
                  <motion.a
                    key={chapter.id}
                    href={`#${chapter.id}`}
                    data-active={active === chapter.id}
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
                    }}
                  >
                    <span className="v2-num">0{index + 1}</span> · {chapter.label}
                  </motion.a>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>

        <div className="relative flex-1 flex flex-col justify-center pt-[calc(var(--nav-h)+2rem)] pb-28">
          <AnimatePresence mode="wait">
            {phase === "intro" && (
              <motion.div
                key="film-intro"
                className="v2-film-copy v2-film-copy--intro"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <p className="v2-label" style={{ color: "var(--on-dark-2)" }}>
                  Aangan · A cinematic introduction
                </p>
                <h1 id="hero-h" className="v2-d1 mt-5">
                  Spaces to call your own.
                </h1>
                <p className="v2-lead mt-7" style={{ color: "var(--on-dark-2)" }}>
                  Houses, land and interiors shaped around light, climate and the way you want to
                  live.
                </p>
                <a href="#ch-house" className="v2-btn v2-btn--primary mt-9">
                  Step inside <Arrow />
                </a>
              </motion.div>
            )}

            {phase === "threshold" && (
              <motion.p
                key="threshold"
                className="v2-film-whisper"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                A threshold, drawn by light.
              </motion.p>
            )}

            {phase === "passage" && (
              <motion.p
                key="passage"
                className="v2-film-whisper"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                The house reveals itself slowly.
              </motion.p>
            )}

            {phase === "settled" && (
              <motion.div
                key="film-settled"
                className="v2-film-copy v2-film-copy--settled"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                <p className="v2-label" style={{ color: "var(--on-dark-2)" }}>
                  Residences · Land · Interiors
                </p>
                <LineReveal
                  as="h1"
                  id="hero-h"
                  immediate
                  className="v2-d1 mt-5"
                  lines={["Homes that follow", "the land and light."]}
                />
                <p className="v2-lead mt-7" style={{ color: "var(--on-dark-2)" }}>
                  Considered places across India, documented clearly and experienced before you
                  decide.
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <a href="#ch-house" className="v2-btn v2-btn--primary">
                    Enter the first house <Arrow />
                  </a>
                  <Link to="/v2/collection" className="v2-btn v2-btn--ghost">
                    Browse the collection
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="v2-film-progress" aria-hidden="true">
          <span />
        </div>
        <div className="v2-wrap flex items-end justify-between gap-6 py-5">
          <p className="v2-caption max-w-[24rem]" style={{ color: "var(--on-dark-3)" }}>
            Architectural visualisation · not footage of a listing
          </p>
          <div className="flex items-center gap-5">
            {filmAvailable && phase !== "settled" && (
              <button type="button" onClick={skip} className="v2-film-control">
                Skip introduction
              </button>
            )}
            {filmAvailable && (
              <button
                type="button"
                onClick={toggle}
                className="v2-film-control"
                aria-label={playing ? "Pause architectural film" : "Play architectural film"}
              >
                {playing ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M2.5 1.5h2.2v9H2.5zM7.3 1.5h2.2v9H7.3z" fill="currentColor" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M2.5 1.2 10.5 6l-8 4.8z" fill="currentColor" />
                  </svg>
                )}
                {playing ? "Pause" : phase === "settled" ? "Replay" : "Play"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
