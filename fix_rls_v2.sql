-- COMPLETE FIX for "No Results" and "Error Inserting"
-- Run this in Supabase SQL Editor to allow both READING and WRITING data.

-- 1. STOPS
drop policy if exists "Enable all for stops" on public.stops;
drop policy if exists "Enable insert for all users" on public.stops;
drop policy if exists "Allow insert for all" on public.stops;
create policy "Enable all for stops" on public.stops for all using (true) with check (true);

-- 2. ROUTES
drop policy if exists "Enable all for routes" on public.routes;
drop policy if exists "Enable insert for all users" on public.routes;
drop policy if exists "Allow insert for all" on public.routes;
create policy "Enable all for routes" on public.routes for all using (true) with check (true);

-- 3. ROUTE_STOPS
drop policy if exists "Enable all for route_stops" on public.route_stops;
drop policy if exists "Enable insert for all users" on public.route_stops;
drop policy if exists "Allow insert for all" on public.route_stops;
create policy "Enable all for route_stops" on public.route_stops for all using (true) with check (true);

-- 4. CONTRIBUTIONS
drop policy if exists "Enable all for contributions" on public.contributions;
create policy "Enable all for contributions" on public.contributions for all using (true) with check (true);
