# Supabase schema for Al Qua'a Pulse

Run this in the Supabase SQL editor to set up the project.

```sql
-- Main survey responses table
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

-- Useful indexes
create index if not exists idx_survey_responses_created_at on public.survey_responses (created_at desc);
create index if not exists idx_survey_responses_category on public.survey_responses (category);
create index if not exists idx_survey_responses_area on public.survey_responses (area);
create index if not exists idx_survey_responses_source_type on public.survey_responses (source_type);
create index if not exists idx_survey_responses_is_deleted on public.survey_responses (is_deleted);

-- Row Level Security: only service role can write
alter table public.survey_responses enable row level security;

-- Public can read non-deleted, non-private rows (no contact fields exposed via API)
create policy "public read non-private" on public.survey_responses
  for select using (is_deleted = false);
```

The server-side code in `lib/store/responses.ts` automatically falls back to in-memory
storage if these env vars are missing, so you can develop and demo without Supabase
configured.

### Privacy note

The API strips `contact_name`, `contact_phone`, and `contact_email` from all public
responses when `contact_permission = false`. When `contact_permission = true`, the
contact fields are still only returned to authenticated admin clients, never to the
public list endpoint.
