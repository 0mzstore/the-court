-- Auto-create a profile the moment someone signs up via Supabase Auth,
-- so the app never has a logged-in user without a matching profiles row.
-- Username is derived from their name and de-duplicated if taken.

create or replace function handle_new_user() returns trigger as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  base_username := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'full_name', 'player'), '[^a-zA-Z0-9]', '', 'g'));
  if base_username = '' then base_username := 'player'; end if;
  final_username := base_username;

  while exists (select 1 from profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, full_name, username, skill_level, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New Player'),
    final_username,
    coalesce((new.raw_user_meta_data->>'skill_level')::skill_level, 'beginner'),
    'player'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
