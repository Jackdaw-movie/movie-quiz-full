MOVIE QUIZ – NOIR REDESIGN v2
===============================

Tento balík opravuje chyby předchozího redesignu a mění architekturu:
funkční Settings v1.2 je obnovené a noir vzhled je nově samostatná poslední vrstva.

NAHRAĎTE / PŘIDEJTE V GITHUBU:
- js/24-player-avatars.js
- js/25-player-settings.js
- js/26-noir-ui.js          (nový)
- js/30-difficulty-tools.js
- css/player-settings.css
- css/noir-ui-v2.css        (nový)

SQL se nemění.

OPRAVY A ZMĚNY
--------------
- obnovené plně funkční Settings v1.2,
- ozubené kolečko je kontrastní a znovu funkční,
- avatar na přihlašovací obrazovce se už nevytváří jako samostatný profilový blok,
- interní názvy avatarů se hráči nikde nezobrazují,
- galerie avatarů je ve vlastní fixed vrstvě mimo projekční plátno,
- Movie Quiz marquee je nad oponou a už se za ni neschovává,
- intro začíná zataženou výrazně přepracovanou oponou,
- Spustit promítání je před oponou; klik využívá stávající openCurtain() animaci,
- sedačky jsou vrácené a graficky přepracované,
- otázka + odpovědi jsou skutečně vycentrované v herní ploše,
- A/B/C/D jsou čitelné: světlé písmo v tmavém vínovém kruhu se zlatým obrysem,
- Nahlásit otázku je v levém dolním rohu herní plochy a má nový noir design,
- dialog hlášení je vizuálně sjednocený,
- světla, rám plátna, barvy a hover/focus efekty jsou přepracované,
- fonty: Limelight + Oswald,
- metodické texty u obtížností a popisy žánrů jsou skryté,
- žádné nové bitmapové grafiky; jen CSS + 2 webfonty.

Po nahrání proveďte Command + Shift + R.

Doporučený test:
1. úvod – zatažená opona, čitelné tlačítko, Movie Quiz nad oponou, sedačky dole,
2. klik Spustit promítání – opona se otevře,
3. přihlášení – žádný obří avatar ani název avatara,
4. Settings – klik funguje a menu je čitelné,
5. hra – otázka a odpovědi na středu,
6. ABCD – čitelné a vycentrované,
7. Nahlásit otázku – vlevo dole, funkce i dialog,
8. Home / host / avatar galerie.
