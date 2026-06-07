-- Production Setup SQL
-- Run this in the Supabase SQL Editor to ensure all tables and schemas are correct for production.

-- 1. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  tier text DEFAULT 'free'::text NOT NULL,
  usage_count integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own profile
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own usage_count' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can update own usage_count" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;


-- 2. Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for security. Inserts are handled securely by the backend using the service_role key.
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;


-- 3. Create analyses table for history
CREATE TABLE IF NOT EXISTS public.analyses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename text NOT NULL,
  total_deposits numeric DEFAULT 0,
  total_withdrawals numeric DEFAULT 0,
  transaction_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on analyses
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for analyses
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own analyses' AND tablename = 'analyses') THEN
    CREATE POLICY "Users can read own analyses" ON public.analyses FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own analyses' AND tablename = 'analyses') THEN
    CREATE POLICY "Users can insert own analyses" ON public.analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own analyses' AND tablename = 'analyses') THEN
    CREATE POLICY "Users can delete own analyses" ON public.analyses FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;


-- 4. Set up an Auth trigger to create a profile automatically when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
begin
  insert into public.profiles (id, full_name, email, tier)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    'free'
  );
  return new;
end;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END
$$;

-- 5. Create bug reports table
CREATE TABLE IF NOT EXISTS public.bug_reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  description text not null,
  url text,
  path text,
  user_agent text,
  status text default 'open',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for bug reports
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- Users can insert their own bug reports
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own bug reports' AND tablename = 'bug_reports'
  ) THEN
    CREATE POLICY "Users can insert own bug reports"
      ON public.bug_reports FOR INSERT
      WITH CHECK ( auth.uid() = user_id );
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own bug reports' AND tablename = 'bug_reports'
  ) THEN
    CREATE POLICY "Users can read own bug reports"
      ON public.bug_reports FOR SELECT
      USING ( auth.uid() = user_id );
  END IF;
END
$$;
