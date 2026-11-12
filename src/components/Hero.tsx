import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import heroImg from "@/assets/hero-villa.jpg";
import { SplitText } from "./SplitText";

export function Hero() {
  const imgRef = useRef<HTMLDivElement | null>(null);

  // Very subtle mouse parallax — max 10px.
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reduce) return;

    let rx = 0, ry = 0, tx = 0, ty = 0, raf = 0;
    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth, h = window.innerHeight;
      tx = ((e.clientX / w) - 0.5) * -20;
      ty = ((e.clientY / h) - 0.5) * -20;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const loop = () => {
      rx += (tx - rx) * 0.05;
      ry += (ty - ry) * 0.05;
      el.style.transform = `translate3d(${rx.toFixed(2)}px, ${ry.toFixed(2)}px, 0)`;
      if (Math.abs(tx - rx) > 0.1 || Math.abs(ty - ry) > 0.1) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      id="arrival"
      data-chapter="01"
      data-chapter-title="Arrival"
      data-chapter-hero="true"
      className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-foreground"
    >
      <div
        ref={imgRef}
        className="absolute inset-[-4%] will-change-transform"
        aria-hidden="true"
      >
        <img
          src={heroImg}
          alt=""
          className="w-full h-full object-cover kenburns"
          fetchPriority="high"
        />
      </div>

      {/* Cinematic overlay — soft ink from bottom */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to top, rgba(15,12,10,0.62) 0%, rgba(15,12,10,0.18) 45%, rgba(15,12,10,0.05) 70%, rgba(15,12,10,0.35) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full mx-auto max-w-[1600px] px-6 md:px-10 flex flex-col justify-end pb-16 md:pb-24 text-background">
        <div className="flex items-baseline gap-4 mb-6 md:mb-10 opacity-0 animate-[fade_1200ms_400ms_var(--ease-editorial)_forwards]">
          <span
            className="devanagari text-lg md:text-xl"
            style={{ color: "rgba(250, 247, 242, 0.7)" }}
            aria-hidden="true"
          >
            आँगन
          </span>
          <span className="rule w-10 opacity-70" aria-hidden="true" style={{ background: "rgba(250,247,242,0.6)" }} />
          <p className="eyebrow" style={{ color: "rgba(250, 247, 242, 0.72)" }}>
            Folio I · Arrival · Since 2011
          </p>
        </div>

        <SplitText
          as="h1"
          text="Houses built at the pace of stone."
          className="display text-[13vw] md:text-[7vw] leading-[0.96] max-w-[16ch] text-background"
          stagger={110}
        />

        <p
          className="mt-8 md:mt-10 max-w-md text-sm md:text-base leading-relaxed opacity-0 animate-[fadeUp_900ms_1600ms_var(--ease-editorial)_forwards]"
          style={{ color: "rgba(250, 247, 242, 0.82)" }}
        >
          A small studio of architects and interior designers. We build private
          residences slowly and by hand — one at a time — across India.
        </p>

        <div className="mt-10 md:mt-14 flex flex-wrap items-center gap-6 md:gap-10 opacity-0 animate-[fadeUp_900ms_1900ms_var(--ease-editorial)_forwards]">
          {/*
            The single Laterite (signal) moment on the home page: hero CTA
            underline. Reserved usage 1 / 3 sitewide.
          */}
          <a
            href="#residences"
            className="eyebrow inline-flex items-center gap-4 border-b border-[color:var(--color-signal)] pb-2 hover:text-[color:var(--color-signal)] transition-colors duration-500"
          >
            <span>Explore Residences</span>
            <span aria-hidden="true">→</span>
          </a>
          <Link
            to="/consultation"
            className="eyebrow inline-flex items-center gap-3 px-6 py-3 border border-current/40 rounded-[2px] hover:bg-background hover:text-foreground hover:border-background transition-colors duration-500"
          >
            Book a Private Consultation
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fade { to { opacity: 1; } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
    </section>
  );
}
