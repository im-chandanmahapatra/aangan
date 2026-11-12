import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { consultationSchema, submitConsultation } from "@/lib/consultations.functions";
import type { Listing } from "../data";
import { Arrow } from "./Logo";

/**
 * V2 enquiry form. Posts through the existing V1 server function and the
 * existing `consultations` table — no backend or schema changes. Fields the
 * V1 table doesn't have (listings, site-visit date, land interest) are
 * written as a short structured header at the top of the message.
 */
const interests = [
  { v: "villa", label: "A residence" },
  { v: "land", label: "Land to build on" },
  { v: "interior", label: "Interior design" },
  { v: "architecture", label: "Architecture" },
  { v: "other", label: "Something else" },
] as const;
type Interest = (typeof interests)[number]["v"];
type Field = "name" | "email" | "phone" | "message" | "form" | "date";

const today = () => new Date().toISOString().slice(0, 10);

export function EnquiryForm({
  listings = [],
  defaultVisit = false,
  defaultInterest,
  compact = false,
}: {
  listings?: Listing[];
  defaultVisit?: boolean;
  defaultInterest?: string;
  compact?: boolean;
}) {
  const submit = useServerFn(submitConsultation);
  const onlyPlots = listings.length > 0 && listings.every((l) => l.kind === "plot");
  const [interest, setInterest] = useState<Interest>(
    interests.some((i) => i.v === defaultInterest)
      ? (defaultInterest as Interest)
      : onlyPlots
        ? "land"
        : "villa",
  );
  const [visit, setVisit] = useState(defaultVisit);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    const form = e.currentTarget;
    const f = new FormData(form);
    const date = String(f.get("date") ?? "");
    const slot = String(f.get("slot") ?? "");
    if (visit && date && date < today()) {
      setErrors({ date: "Please choose today or a later date." });
      (form.elements.namedItem("date") as HTMLElement | null)?.focus();
      return;
    }
    const header = [
      ...listings.map((l) => `Regarding: ${l.name}, ${l.locality}, ${l.city} (${l.slug})`),
      interest === "land" ? "Interest: land / plot" : "",
      visit ? `Site visit requested: ${date || "date flexible"}${slot ? `, ${slot}` : ""}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    const note = String(f.get("message") ?? "").trim();
    const raw = {
      name: String(f.get("name") ?? ""),
      email: String(f.get("email") ?? ""),
      phone: String(f.get("phone") ?? ""),
      interest: interest === "land" ? "other" : interest,
      message: [header, note].filter(Boolean).join("\n\n").slice(0, 2000),
    };
    const parsed = consultationSchema.safeParse(raw);
    if (!parsed.success) {
      const next: Partial<Record<Field, string>> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as Field;
        if (k && !next[k]) next[k] = issue.message;
      }
      setErrors(next);
      const first = Object.keys(next)[0];
      if (first) (form.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    setErrors({});
    setState("sending");
    try {
      await submit({ data: parsed.data });
      setState("done");
    } catch (err) {
      console.error(err);
      setErrors({
        form: "We couldn’t send that just now. Please try again, or write to us directly.",
      });
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div role="status" aria-live="polite" className="py-6">
        <svg width="56" height="56" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <circle cx="32" cy="32" r="30" stroke="currentColor" opacity="0.25" />
          <path
            d="M19 33l9 9 17-19"
            stroke="var(--laterite)"
            strokeWidth="2"
            className="check-draw"
          />
        </svg>
        <h3 className="v2-d3 mt-6">Thank you — your note has reached the studio.</h3>
        <p className="v2-body mt-4 max-w-md">
          {visit
            ? "A partner will write within two working days to confirm a visit time that works for you."
            : "A partner will reply personally within two working days."}{" "}
          Meanwhile, keep browsing the{" "}
          <Link to="/v2/collection" className="v2-link">
            collection
          </Link>
          .
        </p>
      </div>
    );
  }

  const err = (k: Field) =>
    errors[k] ? (
      <p id={`${k}-err`} className="v2-error">
        {errors[k]}
      </p>
    ) : null;
  const two = compact ? "" : "md:grid-cols-2";

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-7">
      {listings.length > 0 && (
        <div
          className="v2-notice"
          style={{ borderStyle: "solid", flexDirection: "column", gap: "0.35rem" }}
        >
          <span className="v2-label v2-label--ink">Regarding</span>
          <ul className="grid gap-1">
            {listings.map((l) => (
              <li key={l.slug}>
                {l.name} · {l.locality}, {l.city}
                {l.demo && <span className="v2-label"> · demonstration listing</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <fieldset>
        <legend className="v2-label mb-3">I’m interested in</legend>
        <div className="flex flex-wrap gap-2">
          {interests.map((o) => (
            <button
              key={o.v}
              type="button"
              className="v2-chip"
              aria-pressed={interest === o.v}
              onClick={() => setInterest(o.v)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="v2-label mb-3">How would you like to begin?</legend>
        <div className="grid sm:grid-cols-2 gap-2">
          {[
            { v: false, t: "A conversation", d: "Call or video, about an hour." },
            { v: true, t: "A site visit", d: "Walk the house or land with a partner." },
          ].map((o) => (
            <button
              key={String(o.v)}
              type="button"
              aria-pressed={visit === o.v}
              onClick={() => setVisit(o.v)}
              className="text-left p-4 transition-colors duration-300"
              style={{
                border: `1px solid ${visit === o.v ? "var(--ink)" : "var(--line-strong)"}`,
                background: visit === o.v ? "var(--ink)" : "transparent",
                color: visit === o.v ? "var(--lime)" : "var(--ink)",
                borderRadius: 2,
              }}
            >
              <span className="block font-medium">{o.t}</span>
              <span className="block text-[0.85rem] mt-1 opacity-75">{o.d}</span>
            </button>
          ))}
        </div>
        {visit && (
          <div className={`grid gap-6 ${two}`}>
            <label className="v2-field">
              <span>Preferred date</span>
              <input
                name="date"
                type="date"
                min={today()}
                className="v2-input"
                aria-invalid={!!errors.date}
                aria-describedby={errors.date ? "date-err" : undefined}
              />
              {err("date")}
            </label>
            <label className="v2-field">
              <span>Time of day</span>
              <select name="slot" className="v2-select" defaultValue="">
                <option value="">Flexible</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="weekend">Weekend only</option>
              </select>
            </label>
          </div>
        )}
      </fieldset>

      <div className={`grid gap-6 ${two}`}>
        <label className="v2-field">
          <span>Your name *</span>
          <input
            name="name"
            className="v2-input"
            autoComplete="name"
            maxLength={100}
            required
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-err" : undefined}
          />
          {err("name")}
        </label>
        <label className="v2-field">
          <span>Email *</span>
          <input
            name="email"
            type="email"
            className="v2-input"
            autoComplete="email"
            maxLength={255}
            required
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-err" : undefined}
          />
          {err("email")}
        </label>
        <label className={`v2-field ${compact ? "" : "md:col-span-2"}`}>
          <span>Phone (optional)</span>
          <input name="phone" type="tel" className="v2-input" autoComplete="tel" maxLength={30} />
          {err("phone")}
        </label>
      </div>

      <label className="v2-field">
        <span>About your project (optional)</span>
        <textarea
          name="message"
          className="v2-textarea"
          maxLength={1500}
          placeholder="Where is the site? Who will live in the house? Any timeline?"
        />
        {err("message")}
      </label>

      {errors.form && (
        <p className="v2-error" role="alert">
          {errors.form}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-5">
        <button type="submit" className="v2-btn v2-btn--primary" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : visit ? "Request a site visit" : "Send enquiry"}{" "}
          <Arrow />
        </button>
        <p className="text-[0.8125rem] max-w-xs" style={{ color: "var(--ink-3)" }}>
          A partner replies personally within two working days. Your details are used only to answer
          you.
        </p>
      </div>
    </form>
  );
}
