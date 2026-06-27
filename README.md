# Al Qua'a Pulse

> Turn local needs into business opportunities.
> A bilingual community demand intelligence platform for Al Qua'a, Al Ain.

Built for the **Tatweer Hackathon** — Challenge 3: *The data gap for local entrepreneurs*.

---

## Summary

Al Qua'a Pulse is a lightweight market-research tool that helps first-time entrepreneurs in
rural Al Qua'a stop guessing what business to start. Residents submit quick anonymous
needs through a mobile-friendly bilingual survey. The app aggregates responses into a
community demand dashboard and converts them into ranked business opportunities using a
transparent scoring algorithm. Each opportunity comes with evidence, first actions,
risks, a 7-day validation checklist, and an AI-generated founder brief.

---

## Challenge

**Tatweer Hackathon — Challenge 3: The data gap for local entrepreneurs.**

Local entrepreneurs in dispersed communities like Al Qua'a usually have skills and energy,
but very little reliable local data about what residents actually need. Demand signals
are scattered across WhatsApp chats, family conversations, and guesswork.

---

## Problem

Entrepreneurs in rural communities decide what to build based on intuition, not evidence.
There is no low-cost tool that:
1. Collects structured local demand data quickly.
2. Aggregates it transparently.
3. Translates it into ranked, actionable business ideas.

---

## Target users

- **Local entrepreneurs** — people considering a new business or expanding an existing one.
- **Residents, farmers, families, students, visitors** — anyone who can submit a need.
- **Community organizers** — admins who seed data and curate the demo.

---

## Solution

Residents submit quick anonymous needs (≤ 60 seconds) through a bilingual mobile survey.
The app:

1. **Aggregates** responses by category, area, urgency, and provider gap.
2. **Visualises** community demand through a civic-tech dashboard.
3. **Ranks** business opportunities using a transparent, explainable 100-point score.
4. **Generates** a practical first-action plan + 7-day validation checklist for each idea.
5. **Briefs** the founder with a fallback template or AI-generated summary.

---

## MVP features

| Feature | Route | Status |
|---|---|---|
| Bilingual landing page (EN/AR, RTL) | `/` | ✅ |
| Mobile-first resident survey, 6 steps | `/survey` | ✅ |
| Thank-you + share page | `/survey/thanks` | ✅ |
| Community demand dashboard (KPIs, filters, charts) | `/dashboard` | ✅ |
| Ranked opportunity engine + cards | `/opportunities` | ✅ |
| Opportunity detail page (evidence, actions, risks) | `/opportunities/[id]` | ✅ |
| Founder brief (AI with template fallback) | inline | ✅ |
| Admin: PIN auth, response table, manual add | `/admin` | ✅ |

---

## How it works

1. **Resident** opens `/survey`, completes 6 quick steps, submits.
2. **App** stores the response (Supabase if configured, otherwise in-memory).
3. **Dashboard** recalculates KPIs, category mix, urgency, provider gap, area activity.
4. **Opportunity engine** clusters responses by category + keyword, scores each cluster.
5. **Opportunity card** shows score, confidence, first action, and links to detail.
6. **Founder brief** button generates an AI brief (or a template brief if no AI key).

### Opportunity scoring (out of 100)

| Component | Max | Formula |
|---|---:|---|
| Demand volume | 35 | `35 × (response_count / max_response_count)` |
| Urgency | 25 | `25 × (avg_urgency / 5)` |
| Provider gap | 15 | `15 × share_with_no_or_unsure_provider` |
| Recurring demand | 15 | `15 × share_with_daily_weekly_monthly_seasonal` |
| Pay signal | 10 | `10 × avg_willingness_to_pay_weight` |

Confidence: **Low** (<5 responses), **Medium** (5–14), **High** (15+).

---

## Tech stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS 4** with a custom desert/stargazing theme
- **shadcn/ui** + **base-ui** components
- **Recharts** for charts
- **Supabase** for persistence (with in-memory fallback if env vars are missing)
- **Optional OpenAI-compatible API** for founder briefs (with deterministic fallback)
- **lucide-react** for icons
- **Tajawal** Arabic web font

---

## How to run locally

```bash
pnpm install --config.minimumReleaseAge=0 --no-frozen-lockfile
pnpm dev
# open http://localhost:3000
```

For a production build:
```bash
node_modules/.bin/next build
node_modules/.bin/next start
```

> The app runs **without any env vars** — it falls back to in-memory storage and 40
> pre-seeded, clearly-labeled demo responses. Configure Supabase and/or an AI key
> to enable live persistence and AI-generated briefs.

---

## Environment variables

Create a `.env.local`:

```bash
# Optional: Supabase (without these, app uses in-memory + seed data)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Optional: lock down the admin (if unset, any PIN/empty unlocks the admin in demo mode)
ADMIN_PIN=1234

# Optional: explicitly enable demo mode (recommended when no Supabase is set)
NEXT_PUBLIC_DEMO_MODE=true

# Optional: AI brief generation (OpenAI-compatible)
AI_API_KEY=sk-...
AI_BASE_URL=https://api.openai.com
AI_MODEL=gpt-4o-mini
```

If `SUPABASE_SERVICE_ROLE_KEY` is not set, the app **still works** end-to-end with
in-memory data. All public pages remain functional.

---

## Seeding demo data

The app includes 40 realistic, clearly-labeled demo responses covering all 10
categories and 7 areas of the survey. They are auto-loaded on first request.

The system automatically populates the seed data on the first request if no live data is found in storage.

To run the database in Supabase instead, see `docs/subagent-docs/sql-schema.md`
or run the following schema:

```sql
create table public.survey_responses (
  id text primary key,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  source_type text not null check (source_type in ('demo','live','imported')),
  language text not null check (language in ('en','ar')),
  respondent_type text not null,
  area text not null,
  category text not null,
  need_title text not null,
  need_description text,
  urgency int not null check (urgency between 1 and 5),
  frequency text not null,
  has_local_provider text not null check (has_local_provider in ('yes','no','not_sure')),
  willingness_to_pay_range text,
  contact_permission boolean not null default false,
  contact_name text,
  contact_phone text,
  contact_email text,
  extra_note text,
  is_private boolean not null default true,
  is_deleted boolean not null default false
);
```

---

## Demo flow (for judges)

1. **Landing** (`/`) — explain the problem, see live community snapshot.
2. **Survey** (`/survey`) — submit a sample need in under 60 seconds.
3. **Dashboard** (`/dashboard`) — see the new response in the KPIs, filters, and charts.
4. **Opportunities** (`/opportunities`) — see the top 17 ranked business ideas.
5. **Opportunity detail** (`/opportunities/<id>`) — see evidence, score breakdown, first
   actions, 7-day validation plan, related responses, and generate a founder brief.

---

## Testable claims

1. A resident can submit a need in under 60 seconds — the survey has 8 required fields.
2. An entrepreneur can identify the top 3 unmet needs in under 2 minutes — the dashboard
   highlights the top category, urgency, and provider gap.
3. Opportunity cards explain exactly why a business idea is ranked — every score is
   broken into 5 transparent components.
4. The system can run with low cost — Vercel + Supabase free tiers cover small pilots.
5. The same model can be reused in other rural communities by editing categories and areas.

---

## Evidence & validation

- **Demo data**: 40 clearly-labeled demo responses, spanning all 10 categories and 7 areas.
- **Live test**: Responses are accepted and immediately reflected in the dashboard.
- **Privacy**: Contact fields are stripped from public responses; the survey is anonymous
  by default. No contact info appears in the public dashboard, opportunities, or
  evidence page.
- **Transparency**: Every opportunity score is broken into 5 visible components in the UI.
- **Methodology**: based on the 100-point scoring algorithm.
- **Limitations**: small sample size, demo data is not market proof, offline validation
  is still required before launching any business.

---

## Limitations (honest)

- Hackathon-window sample size is small; demo data must not be confused with real validation.
- Some needs are seasonal and may not be visible in a short collection window.
- Provider availability is self-reported.
- Offline community validation is still required before launching.

---

## Scalability

- Reuse for other rural communities by editing `lib/constants.ts` (categories + areas).
- Add WhatsApp / SMS survey links for low-bandwidth users.
- Municipality or business-association dashboards on top of the same data.
- Provider directory, demand alerts, seasonal trend tracking.
- Multi-community deployment by adding a `community_id` column.

---

## Privacy

- Survey is **anonymous by default**.
- Contact info is **optional** and only collected if the user explicitly opts in.
- The public dashboard, opportunity engine, and evidence page **never expose contact
  fields**.
- The founder-brief API only sees **aggregated, anonymized** data (no contact fields, no
  free text that could be identifying).

---

## Repository structure

```
app/
  page.tsx                  # Landing
  layout.tsx                # Root layout, font + language provider
  globals.css               # Desert/stargazing theme
  survey/page.tsx           # 6-step survey
  survey/thanks/page.tsx    # Thank-you + share
  dashboard/page.tsx        # Community demand dashboard
  opportunities/page.tsx    # Ranked opportunity list
  opportunities/[id]/page.tsx  # Opportunity detail
  admin/page.tsx            # Admin dashboard
  api/
    responses/              # Create + list responses
    opportunities/          # Computed opportunity list
    insights/               # Founder brief (AI or template)
    admin/responses/        # Admin: list/delete

lib/
  i18n/                     # Bilingual dictionary + provider
  scoring/                  # Opportunity engine + dashboard calcs
  seed/                     # 40 realistic demo responses
  store/                    # Response persistence (Supabase + fallback)
  admin/                    # Admin auth (PIN-based)
  hooks/                    # Tiny client fetch hooks
  types.ts                  # Core domain types
  constants.ts              # Bilingual option catalogs

components/
  layout/                   # Header + footer
  survey/                   # Multi-step form + thank-you
  dashboard/                # KPI cards, filters, charts, tables
  opportunities/            # Cards + detail
  admin/                    # Response table, manual add
  ui/                       # shadcn/ui primitives

public/                     # Icons, logos
```

---

## Deployment

The app is a standard Next.js 16 app. Deploy to **Vercel** with no extra config:

```bash
vercel
```

For Supabase: set the env vars in the Vercel dashboard, then run the SQL schema above.

---

## License

Built for the Tatweer Hackathon. All rights reserved by the project team.
