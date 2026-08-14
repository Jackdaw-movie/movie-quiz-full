MOVIE QUIZ – UI POLISH v44
Datum: 14. 8. 2026

SCHVÁLENÉ VIZUÁLNÍ SMĚRY
- Výběr avatara: držet schválený art-deco / Jackdaw Cinema layout. Boční avatar musí být vždy centrovaný uvnitř samostatného kruhového okna, nikoli polohovaný odhadem vůči celé stránce.
- Výběr obtížnosti: držet schválený layout s popcornem / klapkou / kamerou. Klikací prvek vizuálně tvoří pouze schválený asset. Žádný černý čtverec, legacy card, border ani podklad pod assetem.
- Vygenerovaný návrh gameplay otázky NENÍ reference a nesmí se podle něj přestavovat herní stránka.

AVATAR SELECT – MASTER 1672 × 941
- levý side-slot: left 264 px, top 387 px, 234 × 234 px; střed cca 381 × 504
- pravý side-slot: left 1194 px, top 387 px, 234 × 234 px; střed cca 1311 × 504
- side-slot frame používá true center alignment
- side avatar image používá object-position 50% 50%, ne bottom alignment
- centrální avatar se tímto pravidlem nemění

GAMEPLAY HUD – MASTER 1672 × 941
Cinema projection surface je registrovaná přibližně na:
- master x = 255
- master y = 197
- master width = 1163
- master height = 622

Požadovaný HUD anchor v cinema masteru:
- x = 293
- y = 220

Převod do lokálních souřadnic #screen:
- left = 38 px
- top = 23 px

HUD pravidla:
- celý společný blok klapka / skóre, číslo otázky, životy používá tento anchor pro všechny obtížnosti a žánry
- blok je roztažený horizontálně téměř přes celou projekční plochu
- difficulty + genre (#themeLabel) je NAD číslem otázky, posunutý výš, větší a jiným fontem
- question number má vlastní výrazný display font
- životy patří do pravého sloupce HUD
- question-wrap začíná pod vyšším HUD, aby nedošlo k překryvu

DEBUG GRID
- grid je univerzální vývojová pomůcka a musí být dostupný na všech hlavních stavech: loading, exterior, ticket/login, avatar onboarding a cinema/game
- klávesa G zapíná/vypíná grid
- query ?mqGrid=1 zapne grid při startu
- overlay je fixed na viewportu a registruje se k aktuálně viditelnému master stage
- cinema používá 1672 × 941; preload používá 1279 × 720, pokud je preload master stage dostupný

SOUBORY v44
- css/ui-polish-v44.css
- css/debug-grid.css
- js/98-debug-grid.js

NEZASAHOVAT
- neměnit herní logiku ani databázové otázky kvůli tomuto layout patchi
- neměnit schválené avatar assety
- neregenerovat difficulty assety bez výslovného požadavku
