# Movie Quiz Full – modular v4, historie otázek a filmů

Tato verze navazuje na modulární v3 se všemi šesti žánry v Supabase.

## Databázové žánry

- `fantasy`
- `horror`
- `scifi`
- `crime`
- `animation`
- `comedy`

Celkem je připraveno 3 600 textových otázek. Odpovědi se ověřují serverově.

## Hlavní změna v4

Hra již při chybě Supabase **nepřepne potichu na starou lokální banku**. Místo toho zobrazí jasnou chybovou kartu s tlačítky:

- **Zkusit znovu**
- **Zpět do nabídky**

Díky tomu je při testování vždy zřejmé, zda hra skutečně používá databázové otázky.

## Historie a rotace

Tato webová verze je určená pro databázovou migraci `Movie_Quiz_question_and_movie_history_v2_fixed.sql`, která:

- blokuje posledních 150 přesných otázek,
- blokuje posledních 50 filmů v daném žánru a obtížnosti,
- vybírá maximálně jednu otázku ke stejnému filmu v jedné hře,
- upřednostňuje dosud neviděné filmy a otázky.

## Nahrání na GitHub Pages

Nahrajte **obsah rozbalené složky** do kořene repozitáře `jackdaw-movie/movie-quiz-full`.

1. Rozbalit ZIP.
2. Otevřít v GitHubu **Add file → Upload files**.
3. Přetáhnout celý obsah rozbalené složky včetně `index.html`, `css`, `js`, `assets` a `legacy`.
4. Potvrdit přepsání souborů a vytvořit commit.
5. Po nasazení provést tvrdé obnovení pomocí `Ctrl + F5`.

## Verze klienta

`v39-history-v2-no-silent-fallback`


## v5 – hlášení otázek
- Přidáno tlačítko „Nahlásit otázku“ ke každé otázce načtené ze Supabase.
- Hráč vybírá důvod a může připojit poznámku do 1000 znaků.
- Hlášení se ukládá přes RPC `report_quiz_question`.
- Již odeslané hlášení lze v téže herní relaci upravit.
- Funkce vyžaduje předchozí migraci `Movie_Quiz_question_reporting_database_v1.sql`.
