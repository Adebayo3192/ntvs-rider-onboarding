-- Run this once in the Supabase SQL editor.
-- /api/jumia/pin calls it for every PIN check; until it exists, riders
-- cannot sign in with an existing PIN (the route returns a 500).
--
-- It takes a row lock on the rider (FOR UPDATE), so concurrent PIN guesses
-- for the same rider are checked one after another. The comparison and the
-- attempt counter / lock update happen in the same transaction, which is
-- what makes the attempt limit impossible to race past.
--
-- Returns one of:
--   'ok'          correct PIN, attempt counter reset to 0
--   'wrong'       incorrect PIN, counter incremented
--   'locked_now'  incorrect PIN and this attempt reached the limit
--   'locked'      already locked, PIN not checked
--   'no_pin'      no PIN set, nothing counted
--   'invalid'     no such rider

create or replace function public.jumia_verify_pin(
  p_rider_id uuid,
  p_pin text,
  p_max_attempts integer default 5
)
returns text
language plpgsql
set search_path = public
as $$
declare
  v_pin text;
  v_locked boolean;
  v_attempts integer;
begin
  select jumia_pin::text, coalesce(jumia_locked, false), coalesce(jumia_pin_attempts, 0)
    into v_pin, v_locked, v_attempts
    from riders
   where id = p_rider_id
     for update;

  if not found then
    return 'invalid';
  end if;

  if v_locked then
    return 'locked';
  end if;

  if v_pin is null then
    return 'no_pin';
  end if;

  if v_pin = p_pin then
    update riders set jumia_pin_attempts = 0 where id = p_rider_id;
    return 'ok';
  end if;

  v_attempts := v_attempts + 1;

  update riders
     set jumia_pin_attempts = v_attempts,
         jumia_locked = (v_attempts >= p_max_attempts)
   where id = p_rider_id;

  if v_attempts >= p_max_attempts then
    return 'locked_now';
  end if;

  return 'wrong';
end;
$$;

-- Supabase exposes public functions over its REST API. Only the server
-- (service role key) should ever be able to call this one.
revoke all on function public.jumia_verify_pin(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.jumia_verify_pin(uuid, text, integer) to service_role;
