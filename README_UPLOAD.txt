Movie Quiz – v53.12 STATISTICS CLEAN REBUILD

Tato verze je čistý rebuild stránky Statistik, ne další kosmetický patch.

CO JE OPRAVENO:
1. Hráčský profil vlevo nahoře
   - globální #mqPlayerBadge je na Statistikách skutečně odstraněn
   - zůstává pouze funkční .mq-settings-gear (ozubené kolo)
   - důvod předchozí chyby: hráčský dock je přesunutý do document.body,
     takže selektory uvnitř #statisticsView ho nemohly ovlivnit

2. Přesná pracovní zóna na masteru 1672×941
   x = 187 až 1500
   y = 140 až 788

3. Nový DOM statistik
   - js/23-player-statistics.js je přímo přepsaný
   - odstraněn starý profilový header a avatarová struktura
   - nový topbar: název Statistiky vlevo, Zpět + Obnovit vpravo
   - žádné jméno hráče v horní části stránky

4. Transparentní UI
   - žádné velké kartové / dashboardové backgroundy
   - text, čísla a data jsou přímo na schváleném statistics.webp
   - oddělení je tvořené tenkými Art Deco linkami
   - barvy jsou tmavě hnědé / mosazné, aby byly čitelné na světlém podkladu

5. Nové rozložení
   - 4 hlavní metriky v horní linii
   - 3 hlavní sloupce: žánry / Oscary a highlights / poslední projekce
   - spodní souhrn
   - scrolluje jen datová část, nikdy hlavička

DŮLEŽITÉ:
- v53.11 se záměrně NENAČÍTÁ
- v53.10 dál zajišťuje, že statistics.webp nahrazuje CELÝ kino sál
- schválené assety jsou znovu součástí ZIPu

SOUBORY K NAHRÁNÍ:
assets/ui-pages/production/hall-of-fame.webp
assets/ui-pages/production/statistics.webp
assets/ui-pages/source/hall-of-fame-master.png
assets/ui-pages/source/statistics-master.png
css/cinema-ui-v53-9.css
css/cinema-ui-v53-10.css
css/cinema-ui-v53-12.css
css/debug-grid.css
js/23-player-statistics.js

POSTUP:
1. Rozbal ZIP.
2. Nahraj CELÝ obsah do kořene repozitáře.
3. Povol přepsání existujících souborů.
4. Zachovej strukturu složek.
5. Commitni do main.
6. Po deployi udělej Cmd + Shift + R.
