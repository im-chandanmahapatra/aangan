import { useEffect, useRef, type ElementType, type ReactNode } from "react";

type Props = {
  as?: ElementType;
  className?: string;
  delay?: number;
  children: ReactNode;
};

export function Reveal({ as: Tag = "div", className = "", delay = 0, children }: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const t = window.setTimeout(() => {
              (e.target as HTMLElement).setAttribute("data-in-view", "true");
            }, delay);
            io.unobserve(e.target);
            return () => window.clearTimeout(t);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <Tag ref={ref as never} className={`reveal ${className}`}>
      {children}
    </Tag>
  );
}
