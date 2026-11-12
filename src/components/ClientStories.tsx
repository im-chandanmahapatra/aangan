import { useEffect, useState } from "react";
import { testimonials } from "@/data/site";
import { Reveal } from "./Reveal";

export function ClientStories() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = window.setInterval(() => {
      setI((n) => (n + 1) % testimonials.length);
    }, 8000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <section
      id="stories"
      data-chapter="08"
      data-chapter-title="Stories"
      className="relative bg-background py-32 md:py-56"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
          <p className="eyebrow">Client Stories</p>
        </Reveal>

        <div className="relative mt-14 md:mt-20 min-h-[46vh] md:min-h-[54vh]">
          {testimonials.map((t, idx) => (
            <blockquote
              key={idx}
              className="absolute inset-0 transition-opacity duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ opacity: idx === i ? 1 : 0, pointerEvents: idx === i ? "auto" : "none" }}
              aria-hidden={idx === i ? "false" : "true"}
            >
              <p className="pullquote text-[7.5vw] md:text-[3.6vw] leading-[1.1] text-foreground max-w-[24ch]">
                “{t.quote}”
              </p>
              <footer className="mt-12 md:mt-16 flex items-baseline gap-6 border-t border-foreground/10 pt-6">
                <cite className="eyebrow not-italic text-foreground">{t.author}</cite>
                <span className="eyebrow text-muted-foreground">{t.project}</span>
              </footer>
            </blockquote>
          ))}
        </div>

        <div className="mt-12 md:mt-16 flex items-center gap-3">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Story ${idx + 1}`}
              className={`h-[2px] transition-all duration-700 ${
                idx === i ? "w-14 bg-foreground" : "w-8 bg-foreground/25 hover:bg-foreground/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
