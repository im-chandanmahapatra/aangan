# Aangan V2 — research, decisions, limitations

**Where:** `/v2` routes in the same TanStack Start app. Layout `src/routes/v2/route.tsx`; code, data and styles in `src/v2/`. V1 is untouched except `src/routes/__root.tsx` (V1's curtain, chapter rail and cursor chip are skipped on `/v2/*`).

**Run:** `bun install` (use the committed `bun.lock` — a plain `npm install` resolves newer TanStack Start packages that break V1's `inputValidator`), then `npx vite dev` → `http://localhost:<port>/v2`. Production build: `npx vite build` (Cloudflare Workers target; preview with `wrangler`, not `vite preview`).

## Routes
| Route | Purpose |
|---|---|
| `/v2` | Hero + search, studio offer, featured residences, signature residence, 3D sun study, interiors, process, consultation CTA |
| `/v2/collection` | Discovery: type / city / rooms / status filters + sort, grid or map view, counts, empty state; state lives in the URL |
| `/v2/collection/$slug` | Residence or plot: image / plan / location viewer, facts, features, materials, timeline, due-diligence list (plots), sticky enquiry, mobile action bar |
| `/v2/interiors` | Filterable gallery + accessible lightbox, material library, interior services |
| `/v2/studio` | Philosophy, process, sun study, services, buyer FAQ |
| `/v2/shortlist` | Saved listings (localStorage, per device), side-by-side comparison, "arrange visits" |
| `/v2/enquire` | Consultation or site-visit request; accepts `?listing=`, `?shortlist=`, `?visit=`, `?interest=` |

## Design direction — "the courtyard plan"
- **Idea:** *aangan* = courtyard. Identity comes from architectural drawing: a plan-mark logo (four wings, entry gap, one tree), hairline grids, dimensioned site plans, mono plan annotations.
- **Palette (from Indian building materials):** lime plaster `#F3EFE7`, plaster `#E9E3D8`, Kadappa black `#1B1C1A`, Kota grey-green `#56604F`, laterite `#9E3F22` (the only action colour), brass `#A88A55` (status only). Body text contrast ≥ 7:1.
- **Type:** Instrument Serif (display, kept from V1), Inter Tight (UI), IBM Plex Mono (labels, data, plan notes).
- **Motion:** one purposeful 3D moment, 700 ms rises, image zoom on hover. No scroll hijacking, no cursor followers. `prefers-reduced-motion` disables all of it.

## References investigated
| Reference | What it is | Used? |
|---|---|---|
| particles.casberry.in | Browser WebGL2 particle tool with JS/React/Three exports; no licence stated | **No.** Particles had no property purpose; licence unclear. `.com` URL blocks crawlers — could not verify |
| grainrad.com | Free WebGPU ASCII/dither/retro effects tool | **Pattern only:** subtle film grain done in CSS (SVG noise), no dependency |
| freedesigntool.online | Blocks automated access | **Could not verify** |
| 21st.dev | shadcn-registry React/Tailwind components; licence per author | Inspiration for listing cards / heroes; no code imported |
| hover.dev | React + Tailwind + Motion components; copyrighted, paid tiers | **Not used** (licence forbids redistribution) |
| threejs.org | r187 listed; MIT | **Used:** `three` for the courtyard sun study (lazy chunk) |
| threevi.com | Client-rendered page; content not retrievable | **Could not verify** |
| originkit.dev | "Free animated component library"; licence not stated | Not used (licence unclear) |
| v0.app/templates | No real-estate templates listed | Layout reference only |
| reactbits.dev | MIT + Commons Clause, shadcn/jsrepo install | Reviewed; V1 already had equivalent split-text/reveal; no import needed |
| rarevi.com | Unreachable (client error) | **Could not verify** |
| thinkingorbs.com | MIT AI-status indicators | Not relevant to property buyers |
| Awwwards real-estate cases (ERA, AIR, Likova…) | Visual selectors, site plans, maps | Adopted: plan/site viewers, map discovery |

## Dependencies added
`three` (MIT, ~519 kB lazy chunk, loads only near the sun study) · `leaflet` (BSD-2, ~145 kB lazy, OSM tiles with attribution) · `@types/three`, `@types/leaflet`.

## Real photography (added in the second pass)
Six locality photographs under the free Unsplash License. I checked each one's page for the stated location and licence, and none is an Unsplash+ image. They are self-hosted as WebP at 720 px and up to 1440 px (36–222 kB) in `src/v2/img/place/`:
Bandra–Worli Sea Link (Ishaan Sen) · Alibaug beach (Ved Shrawak) · Casa Andrade, Assagao (Tirth Patel) · a Bengaluru city lake (Bhargav Panchal) · Qutub Minar, Mehrauli (Maaz Ahmed) · the view from Nandi Hills (Aaron M Varughese).
They are used in the home page's "Where we build" section (linked to the city filters), in each listing's "Around …" section, and in an "Area photo" tab on plot pages. Each is tagged "Area photograph" and credited with a link, and is **never presented as the listing itself**.

## Honesty rules applied
- All house and interior imagery comes from the V1 build, which generated it with AI; it is labelled **"Representational image"** everywhere.
- Prices are V1 placeholders → always **"On enquiry"**.
- V1's testimonials and project counts are unverified → **removed** in V2. The phone placeholder `+91 22 XXXX XXXX` is not shown.
- The three plots are **demonstration listings**: dashed tags, notice banner, `noindex`, and "verify independently" copy.
- Map pins are locality-level approximations, and labelled as such.

## Known limitations
- Real project photography, verified contact details (email/address are V1 placeholders) and real land inventory are needed before launch.
- The enquiry form posts to the existing Supabase table; listing, visit date and land interest go into the message text because the schema has no columns for them. A live submission was not run during QA (it would write a real row).
- The production build was verified with `vite build`; it was not served locally (requires `wrangler`).
- V1 issues observed but left untouched: `/residences/:slug` never renders the detail page (`residences.tsx` lacks `<Outlet/>`); no mobile nav; a hydration warning from `ChapterIndex`; a duplicate "STATIC PAGE OF AANGAN" meta description; 197 pre-existing Prettier lint errors.
