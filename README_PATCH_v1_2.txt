MOVIE QUIZ – NOIR PATCH v1.2 / JACKDAW'S CINEMA EXTERIOR
===============================================================

Balík navazuje na Noir rebuild v1.1 a obsahuje současně opravy UI i velkou novou úvodní scénu.

NAHRAĎTE / PŘIDEJTE:
- index.html
- css/noir-master.css
- css/exterior-scene.css        NOVÝ
- css/player-settings.css
- js/25-player-settings.js
- js/26-exterior-scene.js       NOVÝ

Ostatní soubory v balíku jsou převzaté z posledního rebuildu a mohou být nahrány také.
SQL se nemění.

CO JE NOVÉ
----------
1. Hráčský box:
   - cca +20 % avatar,
   - bez textu „Hráč“ / „Režim“, viditelné je pouze jméno nebo Host,
   - gear přesně centrovaný,
   - celý box je fixed úplně vlevo nahoře na stránce.

2. Home:
   - fixed úplně vpravo nahoře,
   - objeví se až po vstupu do sálu / na obtížnosti,
   - tooltip „Vrátit do menu“.

3. Hover descriptions:
   - Settings: „Nastavení“
   - Home: „Vrátit do menu“
   - ?: „Nápověda“

4. Settings:
   - mírně větší typografie,
   - SFX slider přehrává krátký mechanický sample,
   - hudební slider zachovává / obnovuje hudbu odpovídající právě aktivní scéně,
   - zavření Settings znovu zajistí kontextovou hudbu.

5. Opona:
   - kompletně nový horní valance bez starých průsvitných výřezů,
   - souvislé sametové drapérie,
   - nové sklady a světla,
   - nový zlatý lem.

6. NOVÁ PRVNÍ SCÉNA:
   - 1930s New York ulice před JACKDAW'S CINEMA,
   - záběr z chodníku,
   - světla oken a kina,
   - problikávající historická lampa,
   - projíždějící staré automobily,
   - siluety lidí,
   - zářící pokladna,
   - při hoveru nad pokladnou kurzor = dvojice chodících bot,
   - klik = zvuk kroků a přiblížení kamery.

7. Filmový lístek:
   - po příchodu k pokladně se přes obrazovku vysune velký vintage lístek,
   - využívá stávající Supabase přihlášení / registraci / PIN / Host,
   - žádný druhý paralelní login systém,
   - po úspěšném přihlášení nebo vstupu jako Host lístek odjede a hráč vstoupí do sálu na výběr obtížnosti.

8. Zvuk venkovní scény:
   - procedurálně generovaný tlumený dav + ulice + stará auta,
   - bez audio souborů a bez zvýšení downloadu,
   - kvůli pravidlům prohlížečů se spustí s první interakcí hráče,
   - při vstupu do sálu se utlumí a vypne.

ARCHITEKTURA
------------
- Nová venkovní scéna NEMĚNÍ Supabase profilové RPC ani databázi.
- Stávající playerView se dočasně přesune na lístek a po vstupu se vrátí.
- Úspěšný login i Guest mód stále končí standardním požadavkem showView('difficulty').
- Exterior runtime tento jeden přechod zachytí pouze při vstupu z lístku a provede filmový přechod do sálu.
- Herní otázky, scoring, reporting, statistiky a DB otázky se nemění.

PO NASAZENÍ
-----------
Command + Shift + R.

Doporučený test:
1. první ulice,
2. hover nad pokladnou,
3. klik + kroky,
4. lístek + existující hráč,
5. lístek + Host,
6. vstup do sálu,
7. hráčský box vlevo nahoře,
8. Home vpravo nahoře až od obtížnosti,
9. Settings + music/SFX sample,
10. hra + návrat přes Home.
