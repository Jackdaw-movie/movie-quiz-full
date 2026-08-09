MOVIE QUIZ – TICKET LOGIN v2.0 FIX
==================================

Účel balíku
-----------
Oprava přihlašovací vstupenky po v1. Nemění profilovou/Supabase logiku.
Používá pouze schválené assety ticketů a schválený dřevěný pult.

Opraveno oproti v1
------------------
1. Zadní ticket je čistě schválený obrázek. Žádné ručně doplněné číslo ani HTML patch.
2. Odstraněn tmavý profilový panel – formulář je přímo součástí světlého papíru ticketu.
3. Textová pole mají tenkou hnědou linku a transparentní/papírový podklad podle schváleného návrhu.
4. PIN je zobrazen v šesti samostatných světlých políčkách.
5. Nadpisy jsou malé a tištěné do lístku, ne velké bílé titulky.
6. Primární CTA je tmavě hnědé; hover mění text do zlaté a přidává jemný zlatý glow.
7. Sekundární akce jsou jednoduché textové volby na papíře.
8. Delší instrukce zůstávají v tooltipech.
9. Chybové hlášky mají pevně rezervované místo a ticket se neroztahuje.
10. CSS má nové cache-busting číslo v2.0 a JS navíc kritické styly vynucuje inline,
    takže původní tmavé profilové styly hry už ticket nepřepíšou.

Instalace
---------
Rozbal ZIP do kořene repozitáře movie-quiz-full a povol přepsání stejnojmenných souborů.
Ostatní existující soubory v repozitáři nemaž.
Po dokončení GitHub Action proveď tvrdé obnovení stránky (Cmd + Shift + R).

Měněné soubory
--------------
- index.html
- css/ticket-login.css
- js/27-ticket-login-ui.js
- assets/ticket-login/... (schválené assety, beze změny zdrojových PNG)
