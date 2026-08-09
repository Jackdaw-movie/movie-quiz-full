MOVIE QUIZ — LOADING SCREEN v1 — GITHUB UPDATE

CO TENTO BALÍK DĚLÁ
- Přidává před současný exteriér novou loading obrazovku dle domluveného flow.
- Pozadí je jednoduchá noční silueta New Yorku bez kina.
- Při načítání se zobrazuje: „NAČÍTÁM KVÍZOVÝ ZÁŽITEK“.
- Pod textem běží progress line.
- Filmová cívka pod linkou se otáčí synchronně s procentem preloadu.
- Po načtení se text změní na „VŠE JE PŘIPRAVENO“.
- Cívka zmizí a na jejím místě se objeví „VSTOUPIT DO FILMOVÉHO SVĚTA“.
- Kliknutí odemkne audio, skryje loading a pustí současný schválený exteriér.

NASAZENÍ NA GITHUB
1. Rozbal ZIP.
2. Obsah nahraj do KOŘENE stávajícího repozitáře movie-quiz-full.
3. Zachovej strukturu složek.
4. Stejnojmenné soubory potvrď jako Replace/Overwrite.
5. Ostatní soubory v repozitáři NEMAŽ.

ZMĚNĚNÉ / NOVÉ SOUBORY
- index.html
- css/preload-gate.css
- js/05-preload-gate.js
- assets/loading/new-york-night.svg (nový)

V BALÍKU JSOU TAKÉ PONECHÁNY SOUBORY Z PŘEDCHOZÍHO v6.9 UPDATE
- css/exterior-performance.css
- css/exterior-scene.css
- js/26-exterior-scene.js
Ty zajišťují, že balík navazuje na v6.9 preload/exteriér.

CO SE NEMĚNÍ
- schválený exteriér Jackdaw's Cinema
- produkční exteriérové assety
- ticket flow
- onboarding/profily/avatary
- herní logika, databáze, admin ani Supabase
- assets/exterior-v5/source/ se nemaže ani neupravuje

POZNÁMKA K VIZUÁLU
Pozadí New Yorku v tomto balíku je samostatný lehký SVG asset vytvořený pro funkční první verzi loading screenu.
Je tedy snadno vyměnitelné za finální schválený PNG/WebP obraz bez změny preload logiky.
