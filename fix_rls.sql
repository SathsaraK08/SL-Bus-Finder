-- SAFE SQL script to allow public inserts
-- This will DROP the old policies first if they exist, to avoid "policy already exists" errors

-- 1. Stops
drop policy if exists "Enable insert for all users" on public.stops;
drop policy if exists "Allow insert for all" on public.stops;
create policy "Enable insert for all users" on public.stops for insert with check (true);

-- 2. Routes
drop policy if exists "Enable insert for all users" on public.routes;
drop policy if exists "Allow insert for all" on public.routes;
create policy "Enable insert for all users" on public.routes for insert with check (true);

-- 3. Route Stops
drop policy if exists "Enable insert for all users" on public.route_stops;
drop policy if exists "Allow insert for all" on public.route_stops;
create policy "Enable insert for all users" on public.route_stops for insert with check (true);
