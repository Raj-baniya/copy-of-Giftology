-- 1. Create profiles table if it doesn't exist
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  phone_number text,
  role text default 'customer' check (role in ('customer', 'admin')),
  avatar_url text,
  addresses jsonb default '[]', -- Added addresses column directly here
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. Create RLS policies (drop existing to avoid conflicts)
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- 4. Function to handle new user creation
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'customer')
  on conflict (id) do nothing; -- Prevent error if profile exists
  return new;
end;
$$ language plpgsql security definer;

-- 5. Trigger for new user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Backfill profiles for existing users (CRITICAL FIX)
insert into public.profiles (id, email, full_name, role)
select id, email, raw_user_meta_data->>'full_name', 'customer'
from auth.users
on conflict (id) do nothing;

-- 7. Add addresses column if table existed but column didn't
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'addresses') then
    alter table public.profiles add column addresses jsonb default '[]';
  end if;
end $$;
