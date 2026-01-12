-- 5. Contributions / Suggestions Table
create table public.contributions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  route_id uuid references public.routes(id), -- Nullable (if report is general or for new route)
  type text check (type in ('new_route', 'edit', 'correction', 'report_issue')),
  data jsonb, -- The details of the suggestion (e.g. { "stop_name": "New Name" })
  status text default 'pending', -- pending, approved, rejected
  admin_comment text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS Policies
alter table public.contributions enable row level security;

-- Everyone can see (for transparency)
create policy "Public contributions are viewable by everyone." 
  on public.contributions for select using (true);

-- Authenticated users can submit
create policy "Users can insert contributions." 
  on public.contributions for insert with check (auth.uid() = user_id);

-- Only admins/moderators can update status (Simulated by checking role in profile)
-- For MVP, we allow users to update their OWN contribution? No.
-- We'll just secure insert for now. Update requires Admin RLS which is complex without custom claims.
-- We will rely on Backend/Edge Functions for Admin updates later.
