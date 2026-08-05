-- Extends apply_match_points (0001) with notifications, so players get a
-- "your rank changed" alert the moment a score is recorded — this is what
-- the NotificationBell component listens for via Realtime.

create or replace function notify_match_players() returns trigger as $$
declare
  v_player uuid;
  v_delta int;
begin
  if new.result is null or new.result is not distinct from old.result then
    return new;
  end if;

  foreach v_player in array new.team_a loop
    v_delta := case new.result when 'A' then 25 when 'draw' then 10 else -10 end;
    insert into notifications (player_id, type, title, body)
    values (
      v_player,
      'match_result',
      case when v_delta > 0 then 'You won your match!' else 'Match result recorded' end,
      (case when v_delta > 0 then '+' else '' end) || v_delta || ' points — check your updated rank.'
    );
  end loop;

  foreach v_player in array new.team_b loop
    v_delta := case new.result when 'B' then 25 when 'draw' then 10 else -10 end;
    insert into notifications (player_id, type, title, body)
    values (
      v_player,
      'match_result',
      case when v_delta > 0 then 'You won your match!' else 'Match result recorded' end,
      (case when v_delta > 0 then '+' else '' end) || v_delta || ' points — check your updated rank.'
    );
  end loop;

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_notify_match_players
  after insert or update of result on matches
  for each row execute function notify_match_players();
