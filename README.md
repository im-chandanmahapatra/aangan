# AANGAN (आँगन)

A premium editorial residential and architectural web experience built with **TanStack Start**, **React 19**, **Vite**, **Tailwind CSS**, **Framer Motion**, and **Three.js**.

---

## Architecture & Stack

- **Framework**: TanStack Start (Full-stack React with SSR, Nitro server engine)
- **Frontend**: React 19, TypeScript, Tailwind CSS, Framer Motion
- **3D & Visualisations**: Three.js client-side WebGL canvas (Home explorer, sun study)
- **Mapping**: Leaflet locality plates
- **Deployment Target**: Vercel (via Nitro preset)

---

## Getting Started

### 1. Prerequisites
- Node.js >= 18.18.0
- npm >= 9.0.0

### 2. Installation
```bash
npm ci
# or
npm install
```

### 3. Environment Variables
Copy the example environment configuration:
```bash
cp .env.example .env
```

| Variable | Description | Required |
|---|---|---|
| `SUPABASE_URL` | Supabase project URL (for consultation enquiry submissions) | Optional (form gracefully defaults if omitted) |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase client publishable key | Optional |
| `SUPABASE_PROJECT_ID` | Supabase project identifier | Optional |

> **Security Note**: Never commit `.env` or credentials to version control. All `.env` files are ignored by `.gitignore`.

### 4. Local Development
```bash
npm run dev
```
The application will be accessible at `http://localhost:8080/v2` (or the port indicated in terminal).

### 5. Production Build
```bash
npm run build
```
This compiles the client assets into `.output/public` and the Nitro SSR server into `.output/server`.

### 6. Preview Production Build
```bash
npm run preview
```

### 7. Code Quality
```bash
npm run lint    # ESLint check
npm run format  # Prettier code formatting
```

---

## Primary Application Routes

- `/v2` — Editorial homepage (Hero film, daylight sequence, courtyard plan, regional contexts, dossier)
- `/v2/collection` — Curated residences and land collection with live filtering
- `/v2/collection/:slug` — Individual residence & plot dossier detail views
- `/v2/homes` — Interactive 3D architectural house walkthroughs (1, 1.5, 2, 3 BHK)
- `/v2/interiors` — Material library, provenance, and interior architecture folio
- `/v2/studio` — Architectural philosophy and interactive sun/shadow study
- `/v2/enquire` — Private walk & dossier consultation request form

---

## Vercel Deployment Guide

1. Sign in to your [Vercel Dashboard](https://vercel.com).
2. Click **"Add New"** → **"Project"**.
3. Import the `aangan` GitHub repository (`im-chandanmahapatra/aangan`).
4. **Project Settings**:
   - **Framework Preset**: TanStack Start (detected automatically via `vercel.json`).
   - **Root Directory**: `./` (leave default).
   - **Build Command**: `npm run build` (default).
   - **Output Directory**: Leave empty / default (Nitro handles output bundling).
5. **Environment Variables**:
   Under *Settings* → *Environment Variables*, add:
   - `SUPABASE_URL` (if connecting Supabase)
   - `SUPABASE_PUBLISHABLE_KEY` (if connecting Supabase)
6. Click **Deploy**.
7. Once deployed, verify `/v2` and test deep routing, direct page refreshes, and form interactions.
