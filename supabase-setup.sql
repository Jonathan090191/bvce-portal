-- Coller ce SQL dans Supabase → SQL Editor → Run

-- Table des profils utilisateurs
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  role text default 'viewer' check (role in ('admin', 'viewer')),
  subscription_status text default 'inactive' check (subscription_status in ('active', 'inactive', 'past_due')),
  stripe_customer_id text,
  stripe_subscription_id text,
  airtable_mandataire_id text,
  created_at timestamptz default now()
);

-- Activer Row Level Security
alter table public.profiles enable row level security;

-- Politique : chaque user voit uniquement son propre profil
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Politique : chaque user peut mettre à jour son propre profil
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger : créer automatiquement un profil à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Créer manuellement l'admin (après avoir créé le compte via le portail)
-- Remplacer 'j.illouz@afinancea.fr' par ton email
-- update public.profiles set role = 'admin', subscription_status = 'active'
-- where email = 'j.illouz@afinancea.fr';
