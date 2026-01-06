-- Create students table
create table public.students (
  id uuid default gen_random_uuid() primary key,
  matricula text not null unique,
  name text not null,
  group_id text,
  avatar_url text,
  guardian_info jsonb,
  last_modified_by text,
  last_modified_at timestamptz,
  created_at timestamptz not null default now()
);

-- Create incidents table
create table public.incidents (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students(id) on delete cascade,
  type text not null,
  description text,
  date timestamptz not null default now(),
  reported_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Create justificantes table
create table public.justificantes (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students(id) on delete cascade,
  folio text not null,
  start_date date,
  end_date date,
  reason text,
  description text,
  issued_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Create salud table (for medical alerts)
create table public.salud (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students(id) on delete cascade,
  padecimiento text not null,
  documento_url text,
  created_at timestamptz not null default now()
);

-- Create audit_log table
create table public.audit_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  user_email text,
  user_role text,
  action_type text not null,
  action_description text,
  target_table text,
  target_record_id text,
  target_student_name text,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.students enable row level security;
alter table public.incidents enable row level security;
alter table public.justificantes enable row level security;
alter table public.salud enable row level security;
alter table public.audit_log enable row level security;

-- Basic Policies (Authenticated users can read/write for now)
create policy "Authenticated users can select students" on public.students for select to authenticated using (true);
create policy "Authenticated users can insert students" on public.students for insert to authenticated with check (true);
create policy "Authenticated users can update students" on public.students for update to authenticated using (true);

create policy "Authenticated users can select incidents" on public.incidents for select to authenticated using (true);
create policy "Authenticated users can insert incidents" on public.incidents for insert to authenticated with check (true);

create policy "Authenticated users can select justificantes" on public.justificantes for select to authenticated using (true);
create policy "Authenticated users can insert justificantes" on public.justificantes for insert to authenticated with check (true);

create policy "Authenticated users can select salud" on public.salud for select to authenticated using (true);
create policy "Authenticated users can insert salud" on public.salud for insert to authenticated with check (true);

create policy "Authenticated users can insert audit_log" on public.audit_log for insert to authenticated with check (true);
-- Audit log should probably be read-only for most, but allow select for now
create policy "Authenticated users can select audit_log" on public.audit_log for select to authenticated using (true);
