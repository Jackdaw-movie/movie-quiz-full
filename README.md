# Movie Quiz v7.2 – administrace hlášení

Tento balík obsahuje celou hru Movie Quiz v7.1 a navíc samostatnou administrační stránku:

- `index.html` – hra
- `admin.html` – zabezpečená administrace nahlášených otázek
- `css/admin.css` – vzhled administrace
- `js/admin.js` – přihlášení a práce s administrátorskými RPC funkcemi
- `database/Movie_Quiz_question_reports_admin_database_v1.sql` – databázová migrace

Administrace je dostupná na adrese:

`https://jackdaw-movie.github.io/movie-quiz-full/admin.html`

Povolený administrátorský e-mail:

`kafkatomas13@gmail.com`

Při prvním přístupu lze administrátorský Auth účet vytvořit přímo na stránce `admin.html`. Heslo se nevkládá do GitHubu ani do zdrojových souborů.

Pro potvrzovací e-mail musí být v Supabase Auth mezi povolenými Redirect URLs přesná adresa:

`https://jackdaw-movie.github.io/movie-quiz-full/admin.html`

Administrátorská relace používá samostatný klíč úložiště v prohlížeči a neovlivní anonymní hráčskou relaci Movie Quiz.
Admin UI update
