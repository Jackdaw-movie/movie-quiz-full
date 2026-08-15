Movie Quiz – v55.0 STATISTICS FROM SCRATCH

TOTO NENÍ PATCH STARÉ STATISTICKÉ STRÁNKY.
Původní stránka Statistik je nahrazena úplně novou scénou.

ARCHITEKTURA
------------
- starý #statisticsView se už nevytváří
- při startu se případný starý #statisticsView pro jistotu odstraní
- nová stránka se jmenuje #mqStatisticsScene
- #mqStatisticsScene je přímý potomek #cinema
- NENÍ uvnitř #screen ani .view
- proto ji nemohou mačkat staré rozměry projekčního plátna

FULL-SCREEN POZADÍ
------------------
Nová scéna používá přímo:
assets/ui-pages/production/statistics.webp

Scéna má:
position:absolute;
inset:0;
width:100%;
height:100%;
background-size:100% 100%;

Takže nový podklad vyplňuje CELÝ 1672×941 cinema master.

PRACOVNÍ PLOCHA UI
------------------
Přesně proti masteru 1672×941:
x = 187 až 1500
y = 140 až 788

CSS:
left: 11.1842%
top: 14.8778%
width: 78.5287%
height: 68.8629%

ROZLOŽENÍ
---------
1. Horní řádek:
   - Filmová bilance / Statistiky
   - Zpět
   - Obnovit

2. Čtyři hlavní metriky přes celou šířku:
   - Pořadí
   - Odehrané hry
   - Oscary
   - Úspěšnost

3. Hlavní spodní část ve třech velkých sloupcích:
   - Výsledky podle žánrů
   - Oscary podle obtížnosti + highlights
   - Poslední projekce

4. Spodní informační řádek:
   - nejlepší skóre
   - průměr
   - celkový čas
   - naposledy hráno

VZHLED
------
- žádné tmavé panely přes půl obrazovky
- žádné kartové backgroundy
- všechno je transparentní nad schváleným plátnem
- pouze text, čísla, progress linky a Art Deco předěly
- barvy jsou tmavě hnědé / mosazné, aby byly čitelné na světlém pozadí

SETTINGS / HOME
---------------
- původní hráčský dock je při Statistikách celý skrytý
- vlevo je samostatné čtvercové ozubené kolo
- vpravo je samostatné čtvercové Home
- obě tlačítka mají stejný 48×48 px noir/Art Deco styl
- gear otevírá stávající Settings menu
- Home používá stávající logiku Home tlačítka

DATA
----
Zůstává stejné RPC:
get_my_player_statistics

Používají se stejná data:
- summary
- oscars
- leaderboard
- byGenre
- byDifficulty
- recentGames
- bestGenre
- mostPlayedGenre

CO NAHRÁT
---------
Nahraj CELÝ obsah ZIP do rootu repozitáře a přepiš:
- css/player-statistics.css
- js/23-player-statistics.js

A zachovej asset:
- assets/ui-pages/production/statistics.webp
- assets/ui-pages/source/statistics-master.png

NENÍ potřeba přidávat další v53/v54 CSS vrstvu.
Tahle verze záměrně nahrazuje původní statistické soubory přímo.

Po deployi:
Cmd + Shift + R
