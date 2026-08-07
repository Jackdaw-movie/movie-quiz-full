MOVIE QUIZ – NOIR REBUILD v1
==============================

Toto je stabilizační rebuild frontendu, ne další patch na rozbitou v2.

NAHRAĎTE / PŘIDEJTE V REPOZITÁŘI:
- index.html
- js/24-player-avatars.js
- js/25-player-settings.js
- js/30-difficulty-tools.js
- css/player-avatars.css
- css/player-settings.css
- css/noir-master.css
- assets/avatars/guest_unknown.svg
- assets/avatars/popcorn_noir_01.png

STARÉ NEPOUŽÍVANÉ SOUBORY LZE SMAZAT:
- css/noir-ui-v2.css
- js/26-noir-ui.js

ARCHITEKTURA PO ÚDRŽBĚ
----------------------
1. Herní jádro a Supabase moduly zůstávají beze změny.
2. Guest script už nenačítá další systémy dynamicky.
3. Avatar, Settings a Noir CSS jsou načtené přímo v index.html.
4. Noir design nemanipuluje s aktivními view ani open/running stavem kina.
5. Oponu otevírá pouze původní openCurtain() z 00-core.js.
6. Settings vychází z ověřené funkční verze v1.2.
7. Avatarový modul vychází ze stabilizační verze bez observer smyčky.
8. Interní názvy avatarů se hráči nevykreslují.
9. Testovací popcorn avatar je zmenšen na max. 512 px.

NOVÝ NOIR DESIGN
----------------
- Limelight pro titulkové prvky, Cormorant Garamond pro otázky, Oswald pro UI.
- Černá / burgundy / krémová / staré zlato.
- Přepracovaná opona, valance, světla, rám plátna a sedačky.
- Na úvodu je zatažená opona za tlačítkem Spustit promítání.
- Po kliknutí se používá původní animace otevření opony.
- Obtížnost a žánry bez metodických a interních popisů.
- Profil + větší avatar + Settings mimo projekční plochu.
- Home mimo projekční plochu.
- Starý společný mute je skrytý.
- Otázka a odpovědi jsou centrované.
- A/B/C/D mají světlé písmo v tmavém vínovém kruhu se zlatým obrysem.
- Nahlásit otázku je vizuálně v levém dolním rohu herní plochy.
- Settings i report dialog jsou sjednocené do noir stylu.

NASAZENÍ
--------
1. Nahrajte uvedené soubory se zachováním cest.
2. Smažte staré noir-ui-v2.css a 26-noir-ui.js (nebo je jen nechte nepoužívané).
3. Command + Shift + R.
4. Otestujte: intro -> profil -> obtížnost -> žánr -> hra -> report -> Settings -> statistiky -> žebříček.

SQL SE NEMĚNÍ.
