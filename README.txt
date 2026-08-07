MOVIE QUIZ – SETTINGS v1.2
==========================

Nahraďte na GitHubu pouze:
- js/25-player-settings.js
- css/player-settings.css

SQL se nemění.
Ostatní soubory neměňte.

ZMĚNY
-----
1. Ozubené kolečko otevírá skutečné rozbalovací Settings menu vložené do <body>.
   Není tedy blokované vrstvami plátna, oponou ani herním HUD.

2. Profilový dock (avatar + jméno + ozubené kolečko) se přesouvá z #screen
   přímo do #cinema, tedy mimo projekční/herní plochu.

3. Avatar u jména je 52 px.

4. Staré společné tlačítko mute vedle domečku je skryté.

5. Hudba a herní zvuky mají:
   - vlastní slider 0–100 %,
   - vlastní tlačítko vypnout/zapnout,
   - vlastní uloženou hodnotu.
   50 % = přesně původní hlasitost hry.

6. Názvy avatarů jsou interní:
   - nejsou vidět v galerii,
   - není vidět název v profilové kartě,
   - avatarové obrázky nepoužívají interní název jako přístupný popisek.

7. Nastavení zvuku se ukládá v localStorage.

PO NAHRÁNÍ
----------
Proveďte Command + Shift + R.

TEST
----
A) klik na ozubené kolečko -> menu se musí rozbalit,
B) Hudba: slider + vypnout/zapnout,
C) Herní zvuky: slider + vypnout/zapnout,
D) tlačítko starého mute u domečku není vidět,
E) avatar/jméno/settings neleží uvnitř projekčního plátna,
F) v galerii nejsou názvy avatarů.
