MOVIE QUIZ — EXTERIOR GAME SCENE v2.0
=====================================

Tato verze ruší předchozí „obrázkový / samolepkový“ exteriér.
První scéna je nově skutečný canvasový 2.5D herní svět.

CO SE ZMĚNILO
-------------
- Kino, ulice, budovy, marquee, pokladna, auto, lampa, plakátové vitríny,
  mokré odrazy, reflektory a dým se kreslí společně v Canvasu.
- ŽÁDNÝ obrázek exteriéru, kina ani auta se nepoužívá.
- Jediné PNG assety první scény jsou dvě uživatelem dodané boty kurzoru.
- Zrušený pohyb celé scény podle pozice myši.
- Kamera se přiblíží pouze jednou po záměrném kliknutí na pokladnu.
- Pokladna trvale výrazně svítí. Hover nedělá obrys, pouze přepne kurzor.
- Hotspot pokladny používá stejné world souřadnice jako vykreslená pokladna.
- Marquee text:
    TONIGHT ONLY
    MOVIE QUIZ
    ENTER THE CINEMA. PROVE YOUR FILM KNOWLEDGE.
- Vpravo nahoře je ovládání hlasitosti už v první scéně.
- Hudba a herní zvuky používají stejné uložené nastavení jako zbytek hry.
- 50 % zůstává zvýšená základní hlasitost (+30 % proti staré verzi):
    Music 2.19024
    SFX   1.066
- Klik na pokladnu už nespouští kontinuální bílý šum.
- City ambience je tvořený jemným tónovým traffic bedem + vzdálenými
  hlasovými formanty, průjezdy aut a občasným klaksonem.
- Kroky mají 9 došlapů a trvají přibližně 1,5 s.
- Po kliknutí na pokladnu se zachová existující ticket/login flow.
- Statistiky a žebříček se na vstupence skrývají.
- Po loginu / registraci / Host režimu se vstoupí do stávajícího kina
  na výběr obtížnosti. Databáze ani Supabase RPC se nemění.

NOVÉ SOUBORY
------------
css/exterior-game.css
js/26-exterior-game.js
assets/cursor/shoe_left.png
assets/cursor/shoe_right.png

UPRAVENÝ SOUBOR
---------------
index.html

DALŠÍ SOUBORY V ZIPU
--------------------
Balík obsahuje také poslední ověřované avatar / settings / noir soubory,
aby bylo možné celý obsah ZIPu nahrát do repozitáře a přepsat stejné cesty.

NASAZENÍ
--------
1. Rozbal ZIP.
2. Nahraj celý obsah do kořene GitHub repozitáře se zachováním složek.
3. Nech přepsat existující soubory stejného názvu.
4. SQL se nemění.
5. Po deploy udělej Command + Shift + R.

KONTROLA
--------
- první scéna je stabilní při pohybu myši
- pokladna trvale svítí
- nad pokladnou se zobrazí dvě skutečné boty
- klik: delší kroky -> vstupenka
- zvukový panel vpravo nahoře reaguje už venku
- klik na pokladnu nevytváří šum
- po přihlášení / Host pokračuje stávající hra
