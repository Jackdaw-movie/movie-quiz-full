MOVIE QUIZ – NOIR v2.1 LAYER RECOVERY
======================================

Nahraďte pouze:
- js/26-noir-ui.js
- js/30-difficulty-tools.js
- css/noir-ui-v2.css

Ostatní soubory NEMĚŇTE.
SQL se nemění.

Přesná oprava:
- v2 násilně zavírala kino při načtení úvodu,
- uložený profil mohl mezitím aktivovat playerView,
- playerView je běžná .view a zůstal pod oponou,
- výsledkem bylo prázdné plátno.

v2.1:
- nikdy násilně neodebírá open/running,
- sleduje aktivní view,
- při playerView / difficulty / genres / game / stats apod. automaticky otevře oponu,
- aktivní view má bezpečný foreground z-index,
- opona, valance a efekty nemohou blokovat hráčské UI.

Po nahrání:
Command + Shift + R

První test:
1) reload s uloženým hráčem,
2) na plátně musí být normálně viditelný obsah,
3) musí jít klikat.
