import { useEffect, useRef, useState } from "react";
import signatureImg from "@/assets/signature-residence.jpg";
import { CountUp } from "./CountUp";
import { Reveal } from "./Reveal";

/**
 * The site's real climax. Image scale + translate are driven directly by
 * scroll progress via requestAnimationFrame + rAF-throttled window scroll,
 * not IntersectionObserver — so it visibly outweighs the rest of the flow.
 */
export function SignatureResidence() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const imgRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    setEnabled(true);
    let raf = 0;

    const update = () => {
      raf = 0;
      const s = sectionRef.current;
      const img = imgRef.current;
      if (!s || !img) return;
      const rect = s.getBoundingClientRect();
      const vh = window.innerHeight;
      // Progress: 0 when section top hits viewport bottom, 1 when section bottom leaves viewport top.
      const total = rect.height + vh;
      const p = Math.min(1, Math.max(0, (vh - rect.top) / total));
      // Scale 1.08 → 1.00; translate 40px → 0.
      const scale = 1.08 - 0.08 * p;
      const ty = 40 * (1 - p);
      img.style.transform = `translate3d(0, ${ty.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="signature"
      data-chapter="02"
      data-chapter-title="Signature"
      className="relative bg-background pt-32 md:pt-48 pb-24 md:pb-40"
    >
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 grid md:grid-cols-12 gap-10 md:gap-16 items-end">
        <div className="md:col-span-7">
          <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden bg-sand">
            <div
              ref={imgRef}
              className="absolute inset-0 will-change-transform"
              style={{
                transform: enabled ? "translate3d(0,40px,0) scale(1.08)" : undefined,
              }}
            >
              <img
                src={signatureImg}
                alt="The Kohinoor House — a residence in Bhubaneswar, Odisha"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-5 md:pb-8">
          <Reveal>
            <p className="eyebrow">The Signature Residence · Under Offer</p>
            <h2 className="mt-6 display text-5xl md:text-6xl lg:text-7xl text-foreground leading-[0.98]">
              The Kohinoor House.
              <br />
              <span className="italic font-normal text-muted-foreground/90">Bhubaneswar.</span>
            </h2>
            <p className="mt-8 max-w-md text-[15px] leading-[1.75] text-muted-foreground">
              A long, low courtyard villa set into a mature tropical grove on the edge of
              Bhubaneswar. Board-formed concrete and warm laterite cast on site over eleven months;
              a still reflecting pool between two wings; a deep verandah that runs the length of the
              garden elevation. Designed over two years, built over three.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-foreground/10 pt-8">
              <div>
                <dt className="eyebrow">Rooms</dt>
                <dd className="display text-3xl md:text-4xl mt-3 text-foreground">
                  <CountUp to={6} />
                </dd>
              </div>
              <div>
                <dt className="eyebrow">Sq Ft</dt>
                <dd className="display text-3xl md:text-4xl mt-3 text-foreground">
                  <CountUp to={9800} />
                </dd>
              </div>
              <div>
                <dt className="eyebrow">Price</dt>
                {/* Signature Residence is the ONE place where price appears — deliberate. */}
                <dd className="display text-3xl md:text-4xl mt-3 text-foreground">On Enquiry</dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
