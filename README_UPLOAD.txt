Movie Quiz – v53.11 STATISTICS PAGE REDESIGN

Tato verze přepracovává pouze stránku Statistik.
Síň slávy zůstává z v53.10.

HLAVNÍ ZMĚNY:
1. Odebrán hráčský profil vlevo nahoře.
   - avatar je skrytý
   - starý profilový blok je pryč
   - zachovaný je toolbar a tlačítko nastavení (ozubené kolo)

2. Přesně vymezená plocha statistik:
   x = 187 až 1500
   y = 140 až 788
   proti masteru 1672 × 941

3. Statistiky jsou zobrazené úplně nově v noir stylu.
   - bez velkých tmavých panelů pod sebou
   - většina UI je transparentní
   - na pozadí zůstává viditelný schválený asset
   - obsah tvoří hlavně texty, čísla, ikony a art-deco předělovací linky

4. Scrolluje pouze obsah statistik.
   Toolbar ani header nepřekrývají data.

OBSAH ZIP:
- css/cinema-ui-v53-11.css
- css/debug-grid.css
- assets/ui-pages/production/hall-of-fame.webp
- assets/ui-pages/production/statistics.webp
- assets/ui-pages/source/hall-of-fame-master.png
- assets/ui-pages/source/statistics-master.png
- README_UPLOAD.txt

POSTUP:
1. Nahraj celý obsah ZIP do kořene repo.
2. Zachovej strukturu složek assets/ui-pages/.
3. Povol přepsání css/debug-grid.css.
4. Commitni.
5. Po deployi dej Cmd + Shift + R.
