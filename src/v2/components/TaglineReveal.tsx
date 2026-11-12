import { useEffect, useRef } from "react";

type Props = {
  lines: string[];
};

/** A calm, word-by-word reading moment used for the home page manifesto. */
export function TaglineReveal({ lines }: Props) {
  const ref = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const words = Array.from(root.querySelectorAll<HTMLElement>("[data-tagline-word]"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      words.forEach((word) => word.setAttribute("data-visible", "true"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const word = entry.target as HTMLElement;
          word.setAttribute("data-visible", "true");
          observer.unobserve(word);
        });
      },
      { threshold: 0.8, rootMargin: "0px 0px -18% 0px" },
    );
    words.forEach((word) => observer.observe(word));
    return () => observer.disconnect();
  }, []);

  return (
    <p ref={ref} className="v2-tagline" aria-label={lines.join(" ")}>
      {lines.map((line, lineIndex) => (
        <span key={line} className="block">
          {line.split(" ").map((word, wordIndex) => (
            <span data-tagline-word key={`${word}-${wordIndex}`}>
              {word}{" "}
            </span>
          ))}
          {lineIndex < lines.length - 1 && <br />}
        </span>
      ))}
    </p>
  );
}
