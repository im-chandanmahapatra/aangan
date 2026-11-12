import { Reveal } from "./Reveal";
import { ConsultationForm } from "./ConsultationForm";

export function ConsultationSection() {
  return (
    <section
      id="consultation"
      data-chapter="09"
      data-chapter-title="Consultation"
      className="relative bg-linen py-32 md:py-48"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-5">
          <Reveal>
            <p className="eyebrow">Private Consultation</p>
            <h2 className="mt-6 display text-5xl md:text-6xl text-foreground leading-[0.98]">
              Begin quietly.
            </h2>
            <p className="mt-8 text-[15px] leading-[1.8] text-muted-foreground max-w-sm">
              A single conversation, in person or over a call. We listen for an
              hour, look at your site or floor plan, and tell you honestly
              whether we are the right studio for the house you have in mind.
            </p>
          </Reveal>
        </div>
        <div className="md:col-span-7">
          <Reveal delay={120}>
            <ConsultationForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
