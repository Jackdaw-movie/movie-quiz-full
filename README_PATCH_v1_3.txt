MOVIE QUIZ – NOIR POLISH PATCH v1.3
==================================

Navazuje na funkční v1.2. Tento patch nemění Supabase ani herní DB logiku.

HLAVNÍ ZMĚNY
-------------
1. Pokladna:
   - native custom cursor byl nahrazen vlastním velkým SVG kurzorem,
   - dvě samostatné oxford/dress shoes bez nohou,
   - boty při hoveru skutečně „kráčí“,
   - kurzor sleduje myš a je výrazně čitelnější.

2. Lístek:
   - statistiky a žebříček jsou z ticket UI odstraněny,
   - ticket je nižší a kompaktnější,
   - login už nepůsobí jako moderní webová karta,
   - pole jsou „tištěné řádky“ na vstupence,
   - tlačítka vypadají jako razítkové/admission prvky,
   - přidán ink stamp JDC / VALID TONIGHT,
   - perforace, papírová struktura, tiskové linky a další materiálové detaily.

3. Profesionálnější exteriér:
   - subtilní mouse parallax,
   - hlubší fasáda,
   - Art Deco pilastry,
   - reliéfní architektura,
   - dvě plakátové vitríny,
   - prostorovější marquee s podsvícením,
   - pokladní jako silueta za sklem,
   - mokré odlesky na chodníku,
   - pára / mlha z ulice,
   - silnější světelný spill.

4. Zvuk ulice:
   - výrazně hlasitější a vrstevnatější crowd bed,
   - druhá vysokofrekvenční vrstva davu,
   - náhodné hlasové/murmur bursty,
   - silnější street rumble,
   - častější a hlasitější průjezdy aut,
   - občasný vzdálený klakson,
   - kroky prodlouženy na 9 kroků cca 1.5 sekundy,
   - každý krok má basový dopad + scuff podrážky.

5. Hlasitost celé hry:
   - při 50 % je Music gain +30 %,
   - při 50 % je SFX gain +30 %,
   - nové baseline:
     Music = 2.19024
     SFX = 1.066
   - master zůstává .96.

NAHRAĎTE / PŘIDEJTE
-------------------
- index.html
- css/exterior-scene.css
- js/25-player-settings.js
- js/26-exterior-scene.js

Kompletní ZIP obsahuje i ostatní soubory předchozího rebuildu, takže jej lze nahrát celý se zachováním cest.

PO NASAZENÍ
-----------
Command + Shift + R.

Test:
- hover pokladna -> skutečné animované boty,
- klik -> delší kroky,
- slyšitelný dav / auta,
- ticket bez statistik a žebříčku,
- login graficky integrovaný do vstupenky,
- Settings 50 % -> celá hra cca o 30 % hlasitější.
