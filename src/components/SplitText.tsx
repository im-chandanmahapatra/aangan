import { useEffect, useRef } from "react";

/**
 * Word-by-word reveal. RESERVED for the hero headline only — repeating
 * this device on every h2 reads as a template tic. Use `Reveal` for
 * everything else.
 */
type Props = {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  stagger?: number;
};

export function SplitText({ text, className = "", as: Tag = "h1", stagger = 90 }: Props) {
  void stagger;
  const ref = useRef<HTMLElement | null>(null);
  const words = text.split(/(\s+)/);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).setAttribute("data-in-view", "true");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref as never} className={className} aria-label={text}>
      {words.map((w, i) => {
        if (/^\s+$/.test(w)) return <span key={i}> </span>;
        return (
          <span
            key={i}
            className="reveal-word"
            style={{ ["--i" as never]: (i / 2) as never }}
            aria-hidden="true"
          >
            <span>{w}</span>
          </span>
        );
      })}
    </Tag>
  );
}
