-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role text not null check (role in ('facility', 'user', 'driver')),
  full_name text,
  surname text,
  driver_referral_id uuid references public.drivers(id),
  created_at timestamptz default now()
);

-- Restaurants (partner restaurants)
create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cuisine text,
  description text,
  image_url text,
  capacity int default 20,
  is_active boolean default true,
  facility_id uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- Reservations
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  date date not null,
  time text not null,
  party_size int not null default 2,
  status text default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  notes text,
  created_at timestamptz default now()
);

-- Drivers
create table public.drivers (
  id uuid references public.profiles(id) on delete cascade primary key,
  qr_code text unique not null default gen_random_uuid()::text,
  vehicle_type text,
  plate_number text,
  is_available boolean default true,
  created_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.reservations enable row level security;
alter table public.drivers enable row level security;

-- Profiles: users can read their own profile
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Restaurants: everyone can view active restaurants
create policy "Anyone can view active restaurants" on public.restaurants for select using (is_active = true);
-- Facilities can manage their own restaurants
create policy "Facilities can insert restaurants" on public.restaurants for insert with check (
  auth.uid() = facility_id and
  exists (select 1 from public.profiles where id = auth.uid() and role = 'facility')
);
create policy "Facilities can update own restaurants" on public.restaurants for update using (auth.uid() = facility_id);

-- Reservations: users can manage their own
create policy "Users can view own reservations" on public.reservations for select using (auth.uid() = user_id);
create policy "Users can create reservations" on public.reservations for insert with check (auth.uid() = user_id);
create policy "Users can cancel own reservations" on public.reservations for update using (auth.uid() = user_id);
-- Facilities can see reservations for their restaurants
create policy "Facilities can view restaurant reservations" on public.reservations for select using (
  exists (select 1 from public.restaurants where id = restaurant_id and facility_id = auth.uid())
);

-- Facilities can update status of reservations for their restaurants
create policy "Facilities can update reservation status" on public.reservations
  for update using (
    exists (select 1 from public.restaurants where id = restaurant_id and facility_id = auth.uid())
  );

-- Drivers: can view and insert own record
create policy "Drivers can view own record" on public.drivers for select using (auth.uid() = id);
create policy "Drivers can insert own record" on public.drivers for insert with check (auth.uid() = id);

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, role, full_name, surname)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'surname'
  );
  -- If driver, create driver record
  if (new.raw_user_meta_data->>'role' = 'driver') then
    insert into public.drivers (id) values (new.id);
  end if;
  return new;
end;
$$;

-- Validates a driver QR code and returns the driver's UUID (security definer bypasses RLS)
create or replace function public.validate_driver_qr(qr_code_input text)
returns uuid
language sql
security definer
stable
as $$
  select id from public.drivers where qr_code = qr_code_input limit 1;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Seed some demo restaurants
insert into public.restaurants (name, cuisine, description, capacity) values
  ('Tamada', 'Georgian', 'Traditional Georgian cuisine in the heart of the city', 40),
  ('Shavi Lomi', 'Georgian Fusion', 'Modern Georgian dishes with a twist', 30),
  ('Barbarestan', 'Georgian', 'Recipes from a 19th century cookbook', 25),
  ('Café Littera', 'European', 'Fine dining in a historic mansion', 35);
