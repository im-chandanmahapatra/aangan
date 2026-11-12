import { processSteps } from "@/data/site";
import { Reveal } from "./Reveal";

export function ProcessSteps() {
  return (
    <section
      id="process"
      data-chapter="06"
      data-chapter-title="Process"
      className="relative bg-background py-32 md:py-48"
    >
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="grid md:grid-cols-12 gap-6 items-end mb-16 md:mb-24">
          <Reveal className="md:col-span-8">
            <p className="eyebrow">The Process</p>
            <h2 className="mt-6 display text-5xl md:text-7xl text-foreground leading-[0.98]">
              Five seasons
              <br />
              before a key turns.
            </h2>
          </Reveal>
        </div>

        <ol className="grid md:grid-cols-5 gap-y-16 md:gap-x-8 border-t border-foreground/10 pt-16">
          {processSteps.map((s, i) => (
            <Reveal as="li" delay={i * 90} key={s.n} className="relative">
              <span className="display text-foreground/85 text-5xl md:text-6xl">{s.n}</span>
              <h3 className="mt-6 display text-2xl text-foreground">{s.title}</h3>
              <p className="mt-4 text-[14px] leading-[1.75] text-muted-foreground max-w-[22ch]">
                {s.body}
              </p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
