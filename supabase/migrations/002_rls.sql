-- Profiles are viewable by everyone.
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

-- Users can insert their own profile.
create policy "Users can insert their own profile."
  on profiles for insert
  with check ( (select auth.uid()) = id );

-- Users can update own profile.
create policy "Users can update own profile."
  on profiles for update
  using ( (select auth.uid()) = id );
