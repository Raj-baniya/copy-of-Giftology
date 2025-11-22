-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  phone_number text,
  role text default 'customer' check (role in ('customer', 'admin')),
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. CATEGORIES TABLE
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  slug text not null unique,
  description text,
  image_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. PRODUCTS TABLE
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  price decimal(10, 2) not null check (price >= 0),
  sale_price decimal(10, 2) check (sale_price >= 0),
  stock_quantity integer default 0 check (stock_quantity >= 0),
  images text[] default '{}', -- Array of image URLs
  is_featured boolean default false,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ORDERS TABLE
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null, -- Can be null for guest checkout
  guest_info jsonb, -- Stores { name, email, phone } for guest users
  status text default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount decimal(10, 2) not null check (total_amount >= 0),
  payment_method text check (payment_method in ('upi', 'cod', 'card')),
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  shipping_address jsonb not null, -- { street, city, state, zip, country }
  delivery_date date,
  delivery_slot text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ORDER ITEMS TABLE
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null check (quantity > 0),
  unit_price decimal(10, 2) not null check (unit_price >= 0), -- Price at time of purchase
  total_price decimal(10, 2) generated always as (quantity * unit_price) stored,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. CONTACT MESSAGES TABLE
create table public.contact_messages (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text,
  phone text,
  message text,
  source text default 'website', -- e.g., 'contact_form', 'mobile_modal'
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.contact_messages enable row level security;

-- PROFILES POLICIES
create policy "Public profiles are viewable by everyone" 
  on public.profiles for select using (true);

create policy "Users can insert their own profile" 
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile" 
  on public.profiles for update using (auth.uid() = id);

-- CATEGORIES & PRODUCTS POLICIES (Public Read, Admin Write)
create policy "Categories are viewable by everyone" 
  on public.categories for select using (true);

create policy "Admins can insert categories" 
  on public.categories for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update categories" 
  on public.categories for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Products are viewable by everyone" 
  on public.products for select using (true);

create policy "Admins can insert products" 
  on public.products for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update products" 
  on public.products for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ORDERS POLICIES
create policy "Users can view their own orders" 
  on public.orders for select using (auth.uid() = user_id);

create policy "Admins can view all orders" 
  on public.orders for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Users can create orders" 
  on public.orders for insert with check (auth.uid() = user_id or user_id is null);

-- ORDER ITEMS POLICIES
create policy "Users can view their own order items" 
  on public.order_items for select using (
    exists (select 1 from public.orders where id = order_items.order_id and user_id = auth.uid())
  );

create policy "Admins can view all order items" 
  on public.order_items for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Users can create order items" 
  on public.order_items for insert with check (
    exists (select 1 from public.orders where id = order_items.order_id and (user_id = auth.uid() or user_id is null))
  );

-- CONTACT MESSAGES POLICIES
create policy "Admins can view contact messages" 
  on public.contact_messages for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Anyone can insert contact messages" 
  on public.contact_messages for insert with check (true);

-- FUNCTIONS & TRIGGERS

-- Function to handle new user creation (automatically create profile)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'customer');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update 'updated_at' timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_profiles_updated_at before update on public.profiles for each row execute procedure update_updated_at_column();
create trigger update_products_updated_at before update on public.products for each row execute procedure update_updated_at_column();
create trigger update_orders_updated_at before update on public.orders for each row execute procedure update_updated_at_column();

-- REALTIME SUBSCRIPTION
-- Enable realtime for orders and contact_messages so admins get live updates
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.contact_messages;
