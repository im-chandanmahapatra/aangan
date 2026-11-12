
# GREYSTONE — Cinematic Editorial Website

Pan-India luxury real estate developer + architecture/interior studio. Editorial coffee-table book meets Apple product storytelling. Fully populated content, travertine + glass golden-hour hero, live consultation form saving to Lovable Cloud.

## Design System (src/styles.css)

Semantic tokens in oklch (converted from the brand hex values):
- `--background` Warm Ivory `#FAF7F2`
- `--surface-linen` `#F5F1EB`
- `--surface-sand` `#EFE8DF`
- `--foreground` Deep Charcoal `#2B2620`
- `--muted-foreground` Warm Gray `#6E655A`
- `--accent-brass` `#C9A876` — buttons, prices, links, active nav only, never large fill
- `--accent-sage` `#B8C4B0`
- `--accent-blush` `#E8DCD4`
- `--border` warm gray hairline at ~12% opacity

Typography loaded via `<link>` in `__root.tsx` head (never `@import` remote in styles.css):
- Display: **Fraunces** (300 weight, tight leading, 72–120px)
- Body: **Inter** (16–18px, generous leading)
- Eyebrow/Nav: Inter uppercase, tracking-[0.2em], 11–12px

Motion tokens: 700ms expo-out, 80ms child stagger, respects `prefers-reduced-motion`. No spring, bounce, or elastic.

## Route Structure

```
src/routes/
  __root.tsx           font links, brand meta, no og:image at root
  index.tsx            full cinematic single-page journey
  residences.tsx       property collection (secondary depth)
  interiors.tsx        interior gallery (secondary depth)
  philosophy.tsx       studio + process
  consultation.tsx     full consultation form
  api/public/*         (only if needed; consultation uses server fn)
```

Each leaf route: unique title, description, og:title/og:description, og:image at leaf only.

## Homepage Journey (index.tsx)

Sections flow into each other with overlapping negative margins, alternating ivory / linen / sand backgrounds, asymmetric grids — never obvious "hero/features/cta" stacks.

1. **Arrival** — full-viewport travertine + glass villa at golden hour, transparent nav, Fraunces headline fades word-by-word, subtle 30s Ken Burns zoom (scale 1→1.06), 10px max mouse parallax, two CTAs (Explore Residences / Book Consultation).
2. **Signature Residence** — one hero property (e.g. "The Kohinoor House — Alibaug"), oversized image left, editorial copy right, numeric metadata (BHK, sqft, ₹Cr) with count-up.
3. **Architecture Philosophy** — massive Fraunces pull-quote, thin vertical rule, short paragraph, horizontal material strip (travertine / walnut / brushed brass close-ups).
4. **Featured Properties** — magazine layout, 4 properties across Mumbai, Bengaluru, Goa, Delhi-NCR, alternating left / right / full-width / asymmetric. Hover: slow 1.05 zoom, metadata slides up, shadow deepens, custom cursor.
5. **Interior Collection** — CSS-columns masonry, filter chips (Living / Bath / Kitchen / Bedroom / Courtyard), lightbox with shared-element transition, cinematic dark overlay.
6. **Design Process** — five numbered steps (Listen → Site → Sketch → Build → Live), horizontal editorial spread, thin brass numerals, sparse copy.
7. **Craftsmanship** — full-bleed material close-ups with tactile captions.
8. **Client Stories** — massive Fraunces serif quote one at a time, minimal dot pagination, 900ms cross-fade, real-sounding attributed testimonials.
9. **Private Consultation** — inline form (underline inputs, floating labels, elegant success draw-checkmark), submits to Lovable Cloud.
10. **Footer** — oversized wordmark, minimal three-column, no clutter.

## Content

Fully populated with realistic sample data in typed TS under `src/data/`:
- 4 featured properties with names, cities, BHK/sqft/₹Cr prices, one-line editorial descriptions
- 1 signature residence with longer editorial write-up
- 6–8 interior images with captions
- 3–4 testimonials with attributed names (e.g. private client, city)
- Studio contact block: Pan-India studio address placeholder, hello@greystone.in, phone

## Lovable Cloud — Consultation Storage

Enable Lovable Cloud, then:

**Migration** (`consultations` table):
```sql
CREATE TABLE public.consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  interest text,        -- villa / interior / architecture / other
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.consultations TO anon, authenticated;
GRANT ALL ON public.consultations TO service_role;

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a consultation"
  ON public.consultations FOR INSERT TO anon, authenticated
  WITH CHECK (true);
-- No SELECT policy: submissions are write-only from the app.
```

**Server function** `src/lib/consultations.functions.ts`:
- `createServerFn({ method: "POST" })` with Zod `inputValidator` (trimmed name ≤100, email ≤255 valid, phone ≤30 optional, interest enum, message ≤2000)
- Handler creates a publishable-key Supabase client from `SUPABASE_URL` + `SUPABASE_PUBLISHABLE_KEY`, inserts, returns `{ ok: true }`
- Called from the form via `useServerFn`
- No PII returned; errors surface a generic "Something went wrong — please try again"

## Components (`src/components/`)

- `SiteNav` — transparent → ivory on scroll, center-grow underline
- `Reveal` — IntersectionObserver wrapper (opacity + 30px translateY, 700ms expo)
- `SplitText` — line/word reveal for headlines
- `CountUp` — smooth numeric interpolation (jumps to final value under reduced-motion)
- `TiltCard` — max 6° perspective from mouse (desktop hover-fine only)
- `KenBurns` — subtle image zoom
- `Lightbox` — masonry gallery viewer, keyboard accessible
- `MagneticCursor` — subtle cursor scale over media (desktop hover-fine only)
- `Marquee` — material strip
- `Field` — underline input with floating label
- `ConsultationForm` — Zod-validated, wired to server fn

No external animation library — pure CSS transitions + IntersectionObserver + rAF. Keeps bundle lean, motion controlled.

## Imagery

Generated via `imagegen`, saved under `src/assets/`:
- 1 hero (premium tier) — travertine + glass villa, golden hour, infinity pool, palm silhouettes
- 1 signature residence exterior (premium)
- 4 featured property images (standard)
- 6 interior masonry images (standard)
- 3 material close-ups: travertine, walnut, brushed brass
All prompts specify Architectural Digest quality, warm Indian golden-hour light, modern minimalism, no stock-photo look.

## Accessibility & Performance

- Semantic landmarks, single `<h1>` per route, alt text on all imagery
- Brass focus rings, keyboard navigation for lightbox, gallery, and form
- `prefers-reduced-motion`: disables Ken Burns, parallax, tilt, count-up animation, marquee — content still visible
- Native `loading="lazy"` + `decoding="async"` on below-fold images
- WCAG AA verified: charcoal on ivory passes AAA; brass reserved for large text / interactive with focus indicator

## Technical Notes

- Fonts via Google Fonts `<link>` in `__root.tsx` head
- Custom cursor mounts only on `(hover: hover) and (pointer: fine)`
- Ken Burns and parallax use `transform` + `will-change`, cleaned up on unmount
- "3D feel" achieved via subtle perspective transforms and layered z-index — no WebGL library
- All colors as semantic tokens; zero hardcoded hex in components
- Client-side Zod validation mirrors server-side validation

## Out of Scope

- Auth / dashboard for viewing submissions (data lives in the table; can add an authenticated admin route later on request)
- CMS for properties (typed TS data files)
- Payments / booking calendar / i18n

Ready to build on approval.
