-- Create a table for public profiles (Sync with Core Schema)
create table if not exists public.profiles (
  id uuid not null references auth.users on delete cascade,
  role text not null check (role in ('directivo', 'docente', 'docente_tutor', 'prefectura', 'orientacion', 'trabajo_social', 'enfermeria', 'secretaria')),
  nombre text,
  created_at timestamptz not null default now(),
  primary key (id)
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can update their own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- Create a trigger function to automatically create a profile for new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, nombre)
  values (
    new.id,
    'docente', -- Default role
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
