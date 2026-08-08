MOVIE QUIZ – AVATAR CAROUSEL v3

Opravy:
- carousel nepoužívá databázový seznam jako zdroj obrázků; vždy načte přesně Avatar_01.png až Avatar_20.png z assets/avatars/
- starý Popcorn Noir se v carouselu nezobrazuje
- šipky, klik na boční avatar, kolečko/trackpad, klávesy a swipe mění avatar
- výběr se nadále ukládá do profilu přes stávající Supabase RPC set_my_player_avatar
- po vytvoření NOVÉHO profilu a potvrzení obnovovacího kódu se automaticky otevře povinný výběr avatara
- po uložení avatara hra automaticky pokračuje dál

NASAZENÍ:
1. Obsah ZIPu nahraj do kořene GitHub repozitáře a přepiš stejnojmenné soubory.
2. V Supabase > SQL Editor spusť database/Movie_Quiz_avatar_carousel_v3_database.sql.
3. Kontrola SQL musí vrátit selectable_new_avatars = 20.
4. Po zeleném GitHub Pages deployi dej Command + Shift + R.

Poznámka:
20 PNG už musí existovat v assets/avatars/ jako Avatar_01.png až Avatar_20.png.
