# Aangan V2 — cinematic redesign ("Red earth, green shade")

Builds on `V2_RESEARCH.md` (routes, data and honesty rules are unchanged). V1 is untouched. The pre-redesign V2 is backed up at `..\aangan-v2-backup-before-redesign`.

## Art direction
Taken from `design/aangan-premium-end-to-end-v1.png`, adapted to the real portfolio (Mumbai, Alibaug, Goa, Bengaluru, Delhi NCR — not the mock-up's Odisha/Andaman).
- **Palette:** forest near-black `#121C16`, ivory `#F3EDE2`, parchment `#E9E0CF`, laterite/terracotta `#A3462A` (only action colour), earth `#5A2A1A` bands, brass `#B8955A` for status/process. Old token names (`--lime`, `--laterite`, …) are remapped, so every page inherits the new palette.
- **Type:** Instrument Serif (display + italic captions, kept from V1) + Manrope (UI). Widely tracked capitals for the wordmark. Both are OFL Google Fonts.
- **Rhythm:** dark full-bleed photographic bands alternate with paper-textured ivory bands; short terracotta strokes under headings; italic figure captions ("**Morning** — …").

## What changed
| Area | Change |
|---|---|
| Home | Hero film with an opening curtain, line-masked headline, chapter rail that tracks the reader, scroll-linked zoom/fade; 01 signature house band; 02 "A day here…" horizontal scroll-pinned sequence (desktop) / swipe strip (mobile); 03 interactive 3D site model; 04 animated courtyard plan; 05 slanted place panels (real Unsplash photos); collection index with cursor-following preview; 06 dossier cards; interiors; process with scroll-drawn line; "Walk it once. You will know." close |
| Residence pages | Full-bleed photographic arrival with facts overlaid, parallax, then body, sticky facts, drawings/area/map viewer, forest enquiry band |
| Plot pages | The plot as an interactive 3D model drawn to its stated frontage × depth and facing (indicative envelope, road side, coastal context), with Daylight / Monsoon / Measure |
| Collection | Photographic header, filter bar that tucks under the nav, animated re-flow of results on filter |
| Interiors, Studio, Enquire, Shortlist | New photographic heroes / split layouts, motion reveals |
| Nav / footer | Spaced-caps wordmark, transparent-over-image nav that hides on scroll down, animated mobile sheet; forest footer |

## Hero film
`public/v2/film/` — see `design/film/README.md`. **No video model was available**, so the film is edited from the studio's existing representational renders (camera moves, dissolves, grade). It is captioned on the page as not being footage of a listing. The README holds a ready prompt for a real generated film.

## Libraries
- `framer-motion@12` (MIT) — added with `npx bun add framer-motion` so `bun.lock` stays authoritative. All transforms respect `prefers-reduced-motion` via `MotionConfig reducedMotion="user"`; the film does not autoplay under reduced motion.
- `three` (already present) — new `siteScene.ts`; lazy chunk, loads ~500 px before the model scrolls in, pauses off-screen, renders only on change.
- Reference sites: unchanged from `V2_RESEARCH.md`. particles.casberry.com, freedesigntool.online and rarevi.com still refuse automated access; threevi.com returns no readable content. Techniques adopted without importing code: masked text reveals and hover image-trail rows (reactbits / hover.dev patterns, re-implemented with framer-motion), CSS film grain (grainrad idea), Three.js diorama.

## Verified
`tsc --noEmit` clean · ESLint 0 errors (9 existing fast-refresh warnings) · `vite build` succeeds · browser-checked at 1440×900, 768×1024 and 375×812: all home chapters, collection filters, residence and plot pages, 3D modes, mobile menu (Esc + focus return), shortlist, enquiry validation. No console errors.

## Not verified / limits
- A live enquiry was not submitted (it would write a real Supabase row).
- Reduced-motion was implemented but not emulated in the test browser.
- The 3D terrain, trees and massing are generated, not surveyed; only plot dimensions and facing come from data.
