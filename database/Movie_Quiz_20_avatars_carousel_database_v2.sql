-- ============================================================
-- MOVIE QUIZ – 20 NOVYCH AVATARU
-- Carousel katalog v2
-- Datum: 2026-08-09
-- ============================================================

begin;

insert into quiz_private.player_avatars (
  id, label, asset_path, active, selectable, guest_only, sort_order, unlock_rule
)
values
  ('avatar_01', 'Avatar 01', 'assets/avatars/Avatar_01.png', true, true, false, 20, null),
  ('avatar_02', 'Avatar 02', 'assets/avatars/Avatar_02.png', true, true, false, 21, null),
  ('avatar_03', 'Avatar 03', 'assets/avatars/Avatar_03.png', true, true, false, 22, null),
  ('avatar_04', 'Avatar 04', 'assets/avatars/Avatar_04.png', true, true, false, 23, null),
  ('avatar_05', 'Avatar 05', 'assets/avatars/Avatar_05.png', true, true, false, 24, null),
  ('avatar_06', 'Avatar 06', 'assets/avatars/Avatar_06.png', true, true, false, 25, null),
  ('avatar_07', 'Avatar 07', 'assets/avatars/Avatar_07.png', true, true, false, 26, null),
  ('avatar_08', 'Avatar 08', 'assets/avatars/Avatar_08.png', true, true, false, 27, null),
  ('avatar_09', 'Avatar 09', 'assets/avatars/Avatar_09.png', true, true, false, 28, null),
  ('avatar_10', 'Avatar 10', 'assets/avatars/Avatar_10.png', true, true, false, 29, null),
  ('avatar_11', 'Avatar 11', 'assets/avatars/Avatar_11.png', true, true, false, 30, null),
  ('avatar_12', 'Avatar 12', 'assets/avatars/Avatar_12.png', true, true, false, 31, null),
  ('avatar_13', 'Avatar 13', 'assets/avatars/Avatar_13.png', true, true, false, 32, null),
  ('avatar_14', 'Avatar 14', 'assets/avatars/Avatar_14.png', true, true, false, 33, null),
  ('avatar_15', 'Avatar 15', 'assets/avatars/Avatar_15.png', true, true, false, 34, null),
  ('avatar_16', 'Avatar 16', 'assets/avatars/Avatar_16.png', true, true, false, 35, null),
  ('avatar_17', 'Avatar 17', 'assets/avatars/Avatar_17.png', true, true, false, 36, null),
  ('avatar_18', 'Avatar 18', 'assets/avatars/Avatar_18.png', true, true, false, 37, null),
  ('avatar_19', 'Avatar 19', 'assets/avatars/Avatar_19.png', true, true, false, 38, null),
  ('avatar_20', 'Avatar 20', 'assets/avatars/Avatar_20.png', true, true, false, 39, null)
on conflict (id)
do update set
  label = excluded.label,
  asset_path = excluded.asset_path,
  active = excluded.active,
  selectable = excluded.selectable,
  guest_only = excluded.guest_only,
  sort_order = excluded.sort_order,
  unlock_rule = excluded.unlock_rule,
  updated_at = now();

commit;

-- Kontrola: musi vratit 20 radku.
select id, asset_path, active, selectable, sort_order
from quiz_private.player_avatars
where id ~ '^avatar_[0-9]{2}$'
order by sort_order, id;

select count(*) as new_avatar_count
from quiz_private.player_avatars
where id ~ '^avatar_[0-9]{2}$';
