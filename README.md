# Movie Quiz – modular v6, hráčské statistiky

Tato verze navazuje na v5 s databázovými otázkami, dlouhodobou historií a funkčním hlášením problémových otázek.

## Aktivní žánry

- `fantasy`
- `horror`
- `scifi`
- `crime`
- `animation`
- `comedy`

V Supabase je celkem 3 600 textových otázek. Odpovědi se ověřují serverově a hra se při chybě databáze nepřepíná na starou lokální banku.

## Novinka v6 – Moje statistiky

Rozhraní obsahuje nové tlačítko **Moje statistiky**. Hráč zde uvidí:

- počet her, výher a proher,
- úspěšnost odpovědí,
- Oscary podle obtížnosti,
- pořadí a body ve společném žebříčku,
- nejlepší a nejhranější žánr,
- výsledky podle všech žánrů,
- počet unikátních otázek a filmů,
- posledních deset dokončených her.

Statistiky jsou načítané bezpečně přes RPC `public.get_my_player_statistics()` a každý anonymní hráč dostane pouze vlastní výsledky.

## Potřebná databázová migrace

Před nasazením této webové verze musí být v Supabase úspěšně spuštěn soubor:

`Movie_Quiz_player_statistics_database_v1.sql`

## Nahrání na GitHub Pages

Nahrajte **obsah rozbalené složky** do kořene repozitáře `jackdaw-movie/movie-quiz-full`.

1. Rozbalit ZIP.
2. Otevřít **Add file → Upload files**.
3. Nahrát `index.html` a všechny složky `css`, `js`, `assets`, `data`, `legacy`.
4. Potvrdit přepsání souborů přes **Commit changes**.
5. Po nasazení provést tvrdé obnovení pomocí `Ctrl + F5` nebo použít anonymní okno.

## Verze klienta

`v41-player-statistics`

## Poznámka k hráčskému účtu

Movie Quiz používá anonymní Supabase účet uložený v konkrétním prohlížeči. Statistiky proto patří hráčskému účtu v daném prohlížeči. Vymazání dat webu nebo použití jiného počítače vytvoří nový anonymní účet.
