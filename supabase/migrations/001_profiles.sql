-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  email text not null,
  full_name text,
  avatar_url text,
  usage_count integer default 0 not null,
  tier text default 'free' not null,
  razorpay_customer_id text,
  razorpay_subscription_id text
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

-- Create a trigger that automatically creates a profile entry when a new user signs up via Supabase Auth.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
