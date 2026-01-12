-- Enable PostGIS for location support (optional but recommended for future)
create extension if not exists postgis;

-- 1. Profiles Table (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  role text default 'user', -- 'user', 'contributor', 'moderator', 'admin'
  reputation_score int default 0,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Bus Stops Table
create table public.stops (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  name_si text,
  name_ta text,
  latitude double precision not null,
  longitude double precision not null,
  landmark text,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Bus Routes Table
create table public.routes (
  id uuid default gen_random_uuid() primary key,
  route_number text not null,
  route_name text not null,
  description text,
  fare_estimate double precision,
  estimated_duration_mins int,
  status text default 'pending', -- 'pending', 'verified', 'rejected'
  verified_by uuid references public.profiles(id),
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Route Stops (Junction table for Many-to-Many relationship)
create table public.route_stops (
  id uuid default gen_random_uuid() primary key,
  route_id uuid references public.routes(id) on delete cascade,
  stop_id uuid references public.stops(id) on delete cascade,
  stop_order int not null,
  estimated_time_from_start_mins int,
  unique(route_id, stop_order)
);

-- RLS Policies (Row Level Security)
-- Enable RLS
alter table public.profiles enable row level security;
alter table public.stops enable row level security;
alter table public.routes enable row level security;
alter table public.route_stops enable row level security;

-- Policies
-- Everyone can read stats
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Stops are viewable by everyone." on public.stops for select using (true);
create policy "Routes are viewable by everyone." on public.routes for select using (true);
create policy "Route stops are viewable by everyone." on public.route_stops for select using (true);

-- Authenticated users can insert
create policy "Users can insert stops." on public.stops for insert with check (auth.uid() = created_by);
create policy "Users can insert routes." on public.routes for insert with check (auth.uid() = created_by);

-- Users can update their own profile
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
