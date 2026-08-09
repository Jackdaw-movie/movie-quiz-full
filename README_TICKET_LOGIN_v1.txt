MOVIE QUIZ – TICKET LOGIN v1
============================

ÚČEL
Tento balík nahrazuje pouze vizuální vrstvu přihlášení u pokladny. Stávající Supabase profilová logika, guest mode, avatar onboarding a přechod do kina zůstávají zachované.

NASAZENÍ NA GITHUB
1. Rozbalte ZIP.
2. Obsah nahrajte do kořene stávajícího repozitáře movie-quiz-full.
3. Stejnojmenný index.html přepište.
4. Ostatní existující soubory v repozitáři NEMAŽTE.
5. Po dokončení GitHub Action proveďte hard refresh (Cmd + Shift + R).

NOVÉ SOUBORY
- css/ticket-login.css
- js/27-ticket-login-ui.js
- assets/ticket-login/production/desk.webp
- assets/ticket-login/production/ticket-main.webp
- assets/ticket-login/production/ticket-secondary.webp
- assets/ticket-login/source/desk-approved.png
- assets/ticket-login/source/ticket-main-approved.png
- assets/ticket-login/source/ticket-secondary-approved.png

ZMĚNĚNÝ SOUBOR
- index.html

VIZUÁL
- schválený dřevěný pult z pohledu shora je fullscreen podklad přihlášení
- hlavní schválený filmový lístek leží na pultu
- druhý schválený lístek leží částečně pod hlavním; viditelné číslo je 938030, hlavní lístek má 938029
- lístek má po celou dobu pevnou velikost; mění se pouze obsah ve vyhrazené centrální zóně
- pole jsou integrována do papíru, PIN se vizuálně zobrazuje v šesti samostatných polích
- primární CTA má při hoveru zlatý text a jemný zlatý glow
- dlouhá vysvětlení jsou přesunuta do tooltipů
- validační chyby mají pevné místo a nikdy nenatahují lístek

FUNKČNÍ STAVY A TLAČÍTKA
1. ZADÁNÍ JMÉNA
   - Pokračovat
   - Hrát jako host
   - informační tooltip

2. EXISTUJÍCÍ JMÉNO / PŘIHLÁŠENÍ PINEM
   - Zpět
   - Vstoupit do kina
   - Obnovit profil
   - informační tooltip k PINu

3. NOVÝ HRÁČ
   - nový PIN
   - potvrzení PINu
   - Zpět
   - Vytvořit profil
   - informační tooltip

4. OBNOVENÍ PROFILU
   - Recovery code
   - nový PIN
   - potvrzení PINu
   - Zpět
   - Obnovit profil
   - informační tooltip

5. ZOBRAZENÍ NOVÉHO RECOVERY CODE
   - Kopírovat kód
   - Pokračovat
   - informační tooltip
   Pozn.: původní nadpis „Profil byl vytvořen“ zůstává v DOM beze změny, protože jej používá funkční avatar onboarding.

6. PROFIL UŽ JE NA ZAŘÍZENÍ PŘIHLÁŠENÝ
   - Vstoupit do kina
   - Změnit hráče

7. HOST
   - Hrát jako host
   - Vstoupit jako host
   - Přihlásit se
   - vysvětlení host režimu v tooltipu

TECHNICKÉ POZNÁMKY
- Balík nemění RPC funkce ani Supabase klíče.
- Balík nemění js/20-online-supabase.js.
- Balík nemění js/24-player-avatars.js.
- Balík nemění js/30-difficulty-tools.js.
- Balík nemění js/26-exterior-scene.js; využívá jeho existující mount #mqTicketProfileMount a stávající přechod do kina.
- Nový JS pouze vizuálně obohacuje již vygenerované formuláře, zrcadlí validační chyby na lístek a stav databáze do diskrétního indikátoru.

VERZE
Ticket login v1.0 – 2026-08-09
