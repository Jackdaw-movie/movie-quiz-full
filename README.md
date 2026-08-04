# Movie Quiz Full – modular v3, všech 6 žánrů ze Supabase

Tato verze vychází z otestované modulární verze v2 a zachovává její vzhled, animace, zvuky, online hráčské účty i společný žebříček.

## Co je nové

Všechny žánry nyní načítají otázky z privátní databáze Supabase a odpovědi se ověřují serverově:

- `fantasy`
- `horror`
- `scifi`
- `crime`
- `animation`
- `comedy`

Každý žánr má v databázi 600 textových otázek, celkem tedy 3 600 otázek. Hra požádá server o 18 otázek přesně ve zvolené obtížnosti. K výhře je stále potřeba 15 správných odpovědí a hráč má 3 životy.

Pokud Supabase není dostupná, hra automaticky přepne danou partii na původní lokální záložní otázky.

## Nahrání na GitHub Pages

Nahrajte **obsah této složky** do kořene repozitáře `jackdaw-movie/movie-quiz-full`. Soubor `index.html` musí zůstat přímo v kořeni repozitáře.

Nejjednodušší postup:

1. Rozbalit ZIP.
2. V GitHub repozitáři otevřít **Add file → Upload files**.
3. Přetáhnout veškerý obsah rozbalené složky, včetně složek `css`, `js`, `assets` a `legacy`.
4. Potvrdit přepsání existujících souborů a vytvořit commit.
5. Po dokončení GitHub Pages provést tvrdé obnovení stránky pomocí `Ctrl + F5`.

## Databázové předpoklady

V Supabase musí být importované banky `fantasy`, `horror`, `scifi`, `crime`, `animation` a `comedy`. Krimi banka musí používat klíč `crime`, nikoli `thriller`.

## Verze klienta

`v38-all-genres-question-bank`
