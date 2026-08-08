-- ============================================================
-- MOVIE QUIZ – AVATAR CAROUSEL v3
-- 20 avatarů Avatar_01.png až Avatar_20.png
-- - opakovatelné / bezpečné spuštění
-- - starý popcorn_noir_01 zůstává kvůli existujícím profilům,
--   ale už není aktivní ani vybíratelný
-- - nové profily dostanou technický default avatar_01,
--   frontend je po registraci povinně pošle na výběr avatara
-- Datum: 2026-08-09
-- ============================================================

begin;

insert into quiz_private.player_avatars (
  id, label, asset_path, active, selectable, guest_only, sort_order, unlock_rule
)
values
  ('avatar_01', 'Avatar 01', 'assets/avatars/Avatar_01.png', true, true, false, 101, null),
  ('avatar_02', 'Avatar 02', 'assets/avatars/Avatar_02.png', true, true, false, 102, null),
  ('avatar_03', 'Avatar 03', 'assets/avatars/Avatar_03.png', true, true, false, 103, null),
  ('avatar_04', 'Avatar 04', 'assets/avatars/Avatar_04.png', true, true, false, 104, null),
  ('avatar_05', 'Avatar 05', 'assets/avatars/Avatar_05.png', true, true, false, 105, null),
  ('avatar_06', 'Avatar 06', 'assets/avatars/Avatar_06.png', true, true, false, 106, null),
  ('avatar_07', 'Avatar 07', 'assets/avatars/Avatar_07.png', true, true, false, 107, null),
  ('avatar_08', 'Avatar 08', 'assets/avatars/Avatar_08.png', true, true, false, 108, null),
  ('avatar_09', 'Avatar 09', 'assets/avatars/Avatar_09.png', true, true, false, 109, null),
  ('avatar_10', 'Avatar 10', 'assets/avatars/Avatar_10.png', true, true, false, 110, null),
  ('avatar_11', 'Avatar 11', 'assets/avatars/Avatar_11.png', true, true, false, 111, null),
  ('avatar_12', 'Avatar 12', 'assets/avatars/Avatar_12.png', true, true, false, 112, null),
  ('avatar_13', 'Avatar 13', 'assets/avatars/Avatar_13.png', true, true, false, 113, null),
  ('avatar_14', 'Avatar 14', 'assets/avatars/Avatar_14.png', true, true, false, 114, null),
  ('avatar_15', 'Avatar 15', 'assets/avatars/Avatar_15.png', true, true, false, 115, null),
  ('avatar_16', 'Avatar 16', 'assets/avatars/Avatar_16.png', true, true, false, 116, null),
  ('avatar_17', 'Avatar 17', 'assets/avatars/Avatar_17.png', true, true, false, 117, null),
  ('avatar_18', 'Avatar 18', 'assets/avatars/Avatar_18.png', true, true, false, 118, null),
  ('avatar_19', 'Avatar 19', 'assets/avatars/Avatar_19.png', true, true, false, 119, null),
  ('avatar_20', 'Avatar 20', 'assets/avatars/Avatar_20.png', true, true, false, 120, null)
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

-- Původní zkušební avatar už se nesmí nabízet.
update quiz_private.player_avatars
set
  active = false,
  selectable = false,
  updated_at = now()
where id = 'popcorn_noir_01';

-- Nové profily nebudou technicky vznikat se starým popcornem.
alter table quiz_private.player_profiles
  alter column avatar_id set default 'avatar_01';

commit;

-- Kontrola: první číslo musí být 20, starý avatar false/false.
select count(*) as selectable_new_avatars
from quiz_private.player_avatars
where id ~ '^avatar_[0-9]{2}$'
  and active is true
  and selectable is true
  and guest_only is false;

select id, active, selectable
from quiz_private.player_avatars
where id = 'popcorn_noir_01';
