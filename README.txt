MOVIE QUIZ – SETTINGS v1
========================

Bez nové SQL migrace.

NAHRAJTE DO GITHUBU SE ZACHOVÁNÍM CEST:
- js/30-difficulty-tools.js  (NAHRADIT stávající)
- js/25-player-settings.js  (NOVÝ)
- css/player-settings.css   (NOVÝ)

CO VERZE DĚLÁ:
- zvětší avatar u jména na 48 px (43 px na menších displejích),
- přidá ozubené kolečko přímo k profilu,
- Settings obsahuje profil + změnu avatara,
- Host má Settings také, ale změna avatara je u něj skrytá,
- samostatný posuvník Hudba 0–100 %,
- samostatný posuvník Herní zvuky 0–100 %,
- 50 % = přesně původní aktuální gainy hry:
  musicGain 1.6848 a sfxGain 0.82,
- hodnoty se ukládají do localStorage zařízení,
- stávající mute tlačítko zůstává funkční přes masterGain,
- staré samostatné „Změnit avatar“ ve statistikách/profilové kartě je skryté; změna je v Settings,
- opravuje křehký výběr textového labelu Host/Hráč po vložení avatarového <span>.

TEST:
1) Hard refresh Command + Shift + R.
2) U jména je větší avatar + ozubené kolečko.
3) Otevřít Settings.
4) Oba posuvníky začínají na 50 %, pokud už nebyly na zařízení změněny.
5) Hudbu stáhnout na 0 a ověřit, že herní zvuky zůstaly.
6) Herní zvuky stáhnout na 0 a hudbu vrátit nad 0.
7) Reload stránky a ověřit zachování hodnot.
8) Registrovaný hráč: Změnit avatar otevře galerii.
9) Host: změna avatara se nezobrazuje, anonymní avatar zůstává.
