import { useEffect, useState } from "react";
import { useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { consultationSchema, submitConsultation } from "@/lib/consultations.functions";
import { getPropertyBySlug } from "@/data/site";
import { Field, TextArea } from "./Field";

type Errors = Partial<Record<"name" | "email" | "phone" | "message" | "interest" | "form", string>>;

const interests = [
  { v: "villa", label: "A private villa" },
  { v: "interior", label: "Interior design" },
  { v: "architecture", label: "Architecture" },
  { v: "other", label: "Something else" },
] as const;

export function ConsultationForm({ compact = false }: { compact?: boolean }) {
  const submit = useServerFn(submitConsultation);
  // Read ?residence=<slug> from the URL if present. `strict: false` so this
  // component can be rendered inside any route.
  const search = useSearch({ strict: false }) as { residence?: string } | undefined;
  const residence = search?.residence ? getPropertyBySlug(search.residence) : undefined;

  const [interest, setInterest] = useState<(typeof interests)[number]["v"]>("villa");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");

  // Pre-fill the message with the residence context when arriving from a card.
  useEffect(() => {
    if (residence && !message) {
      setMessage(
        `I'd like to enquire about ${residence.name} — ${residence.location}, ${residence.city}.`,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residence?.slug]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    const form = new FormData(e.currentTarget);
    const raw = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      interest,
      message: String(form.get("message") ?? ""),
    };
    const parsed = consultationSchema.safeParse(raw);
    if (!parsed.success) {
      const es: Errors = {};
      for (const iss of parsed.error.issues) {
        const k = iss.path[0] as keyof Errors;
        if (k) es[k] = iss.message;
      }
      setErrors(es);
      return;
    }
    setErrors({});
    setState("sending");
    try {
      await submit({ data: parsed.data });
      setState("done");
    } catch (err) {
      console.error(err);
      setErrors({ form: "Something went wrong — please try again." });
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div className="text-center py-10 md:py-16" role="status" aria-live="polite">
        <svg
          viewBox="0 0 64 64"
          className="mx-auto w-16 h-16"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ color: "var(--color-foreground)" }}
        >
          <circle cx="32" cy="32" r="30" opacity="0.2" />
          <path className="check-draw" d="M18 33 L28 43 L46 22" />
        </svg>
        <p className="eyebrow mt-8 text-foreground">Received</p>
        <h3 className="mt-4 display text-3xl md:text-4xl text-foreground">
          Thank you. A partner from the studio will write to you within two working days.
        </h3>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className={compact ? "" : "max-w-3xl"}>
      {residence && (
        <p className="eyebrow mb-8 text-foreground border-l-2 border-[color:var(--color-signal)] pl-3">
          Regarding · {residence.name}, {residence.city}
        </p>
      )}

      {/* Screen-reader live region for validation summaries. */}
      <div role="status" aria-live="polite" className="sr-only">
        {errors.form
          ? errors.form
          : Object.values(errors).filter(Boolean).length > 0
          ? "Please check the highlighted fields."
          : ""}
      </div>

      <div className={`grid ${compact ? "gap-6" : "md:grid-cols-2 gap-x-10 gap-y-8"}`}>
        <Field name="name" label="Your name" required maxLength={100} error={errors.name} />
        <Field
          name="email"
          type="email"
          label="Email"
          required
          maxLength={255}
          autoComplete="email"
          error={errors.email}
        />
        <Field
          name="phone"
          type="tel"
          label="Phone (optional)"
          maxLength={30}
          autoComplete="tel"
          error={errors.phone}
        />
        <div>
          <label className="eyebrow block mb-4 text-muted-foreground">Area of interest</label>
          <div className="flex flex-wrap gap-2">
            {interests.map((opt) => (
              <button
                type="button"
                key={opt.v}
                onClick={() => setInterest(opt.v)}
                className={`eyebrow px-4 py-2 rounded-full border transition-colors duration-500 ${
                  interest === opt.v
                    ? "bg-foreground text-background border-foreground"
                    : "border-foreground/25 text-foreground hover:border-foreground/60"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <TextArea
        name="message"
        label="A little about your project (optional)"
        maxLength={2000}
        className="mt-8"
        error={errors.message}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      {errors.form && (
        <p className="mt-6 text-sm text-destructive" role="alert">
          {errors.form}
        </p>
      )}

      <div className="mt-12 flex flex-wrap items-center gap-6">
        {/*
          The single Laterite (signal) moment on the consultation page:
          the submit CTA. Reserved usage 2 / 3 sitewide.
        */}
        <button
          type="submit"
          disabled={state === "sending"}
          className="eyebrow inline-flex items-center gap-3 px-8 py-4 rounded-[2px] bg-[color:var(--color-signal)] text-[color:var(--color-signal-foreground)] border border-[color:var(--color-signal)] hover:bg-transparent hover:text-[color:var(--color-signal)] transition-colors duration-500 disabled:opacity-60"
        >
          {state === "sending" ? "Sending…" : "Request a Consultation"}
          <span aria-hidden="true">→</span>
        </button>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
          We reply personally, from Mumbai. No newsletters, no lists.
        </p>
      </div>
    </form>
  );
}
