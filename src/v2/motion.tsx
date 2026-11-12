/**
 * V2 motion primitives, built on framer-motion.
 *
 * Every primitive honours `prefers-reduced-motion` (MotionConfig is set to
 * reducedMotion="user" in the V2 layout, and the scroll-linked pieces check
 * useReducedMotion themselves). Movement is short, eased and never hijacks
 * scrolling.
 */
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
  type Variants,
} from "framer-motion";
import { useRef, type ReactNode } from "react";

export const EASE = [0.16, 1, 0.3, 1] as const;

/** Fade + rise (+ a trace of blur) when the element enters the viewport. */
export function Rise({
  children,
  className = "",
  delay = 0,
  y = 28,
  as = "div",
  amount = 0.25,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "p" | "figure" | "header";
  amount?: number;
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount }}
      transition={{ duration: 1, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

/** Container that staggers its <Item/> children into view. */
export function Stagger({
  children,
  className = "",
  as = "div",
  gap = 0.08,
  amount = 0.2,
  style,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol" | "dl";
  gap?: number;
  amount?: number;
  style?: React.CSSProperties;
}) {
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag
      className={className}
      style={style}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </Tag>
  );
}

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

export function Item({
  children,
  className = "",
  as = "div",
  style,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
  style?: React.CSSProperties;
}) {
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag className={className} style={style} variants={itemVariants}>
      {children}
    </Tag>
  );
}

/**
 * Display heading revealed line by line from behind a mask.
 * `lines` keeps line breaks deliberate (editorial typesetting, not
 * whatever the browser chooses).
 */
export function LineReveal({
  lines,
  as = "h2",
  className = "",
  id,
  delay = 0,
  immediate = false,
  style,
}: {
  lines: ReactNode[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  id?: string;
  delay?: number;
  /** animate on mount instead of on scroll into view */
  immediate?: boolean;
  style?: React.CSSProperties;
}) {
  const reduce = useReducedMotion();
  // The observer sits on the (untransformed) heading, not on the masked
  // lines: a line translated out of its overflow-hidden mask never
  // "intersects", so observing it directly would never fire.
  const Tag = motion[as] as typeof motion.h2;
  const trigger = immediate
    ? { animate: "show" as const }
    : { whileInView: "show" as const, viewport: { once: true, amount: 0.35 } };
  return (
    <Tag
      id={id}
      className={className}
      style={style}
      initial="hidden"
      {...trigger}
      aria-label={lines.every((l) => typeof l === "string") ? lines.join(" ") : undefined}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
          <motion.span
            className="block"
            variants={{
              hidden: reduce ? { opacity: 0 } : { y: "110%" },
              show: {
                y: "0%",
                opacity: 1,
                transition: { duration: 1.1, ease: EASE, delay: delay + i * 0.09 },
              },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Short terracotta stroke that draws in under a heading. */
export function Stroke({ className = "", delay = 0.2 }: { className?: string; delay?: number }) {
  return (
    <motion.span
      aria-hidden="true"
      className={`block w-[2.75rem] h-[2px] ${className}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
    >
      <motion.span
        className="v2-stroke"
        style={{ transformOrigin: "left" }}
        variants={{
          hidden: { scaleX: 0 },
          show: { scaleX: 1, transition: { duration: 1, ease: EASE, delay } },
        }}
      />
    </motion.span>
  );
}

/** Scroll progress of an element through the viewport (0 entering → 1 leaving). */
export function useSectionProgress<T extends HTMLElement>(offset?: [string, string]) {
  const ref = useRef<T | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: (offset ?? ["start end", "end start"]) as never,
  });
  return { ref, progress: scrollYProgress };
}

/**
 * Parallax image wrapper: the inner layer is oversized and drifts against
 * the scroll. The outer box keeps the layout fixed, so nothing shifts.
 */
export function Parallax({
  children,
  className = "",
  strength = 0.12,
  style,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  style?: React.CSSProperties;
}) {
  const reduce = useReducedMotion();
  const { ref, progress } = useSectionProgress<HTMLDivElement>();
  const y = useTransform(progress, [0, 1], [`-${strength * 100}%`, `${strength * 100}%`]);
  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`} style={style}>
      <motion.div
        className="absolute inset-x-0"
        style={{
          top: `-${strength * 100}%`,
          bottom: `-${strength * 100}%`,
          y: reduce ? 0 : y,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function useMv(mv: MotionValue<number>, input: number[], output: number[]) {
  return useTransform(mv, input, output);
}

export { motion, useReducedMotion, useScroll, useTransform };
