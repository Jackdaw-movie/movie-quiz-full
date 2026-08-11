MOVIE QUIZ — MASTER STAGE REFACTOR v1
=====================================

Cíl
---
Sjednotit všechny obrazovky založené na pevné grafické kompozici do jednoho
souřadnicového systému. Pozadí, overlay assety a interaktivní prvky se již
nesmějí škálovat nezávisle podle viewportu.

Master souřadnice
-----------------
Loading:      1279 × 720
Exteriér:     1672 × 941
Ticket login: 1672 × 941 (dřevěný pult je master; ticket-stack je kotven uvnitř)
Avatar select:1672 × 941

Princip
-------
1. Každá art-directed obrazovka má pevný master stage.
2. Master stage se pouze proporcionálně škáluje pomocí min(viewport/master).
3. Na jiném poměru monitoru se použijí letterbox okraje, nikdy crop/cover.
4. Všechny hotspoty, avatary, buttony a formuláře zůstávají uvnitř stejného
   master stage a tím drží přesnou pozici vůči grafice.
5. Auditorium/gameplay zůstává fluidní responzivní UI, protože nejde o jednu
   pevnou master grafiku.

Co patch mění
-------------
- nový css/master-stage.css
- nový js/06-master-stage.js
- index.html: master-stage wrapper pro loading a ticket, cache-bust verze,
  výkonové helpery
- js/26-exterior-scene.js: scaling používá společný master-stage manager
- css/ticket-login.css zůstává vizuálně beze změny, ale master-stage override
  odstraní viewport-dependent škálování celé kompozice
- css/avatar-onboarding-stage.css: zachován aktuální asset set a souřadnice;
  celý dialog se škáluje jako jeden 1672×941 celek
- js/05-preload-gate.js: po exteriéru se nízkou prioritou připraví ticket a
  avatar UI assety
- js/24a-avatar-performance.js je nově skutečně zapojen v index.html
- js/07-runtime-cache.js je nově skutečně zapojen v index.html
- sw.js: nová cache verze, zahrnuje exterior/avatar/ticket/loading produkční
  assety; HTML se necachuje

Důležitá změna ticketu
----------------------
Původní desk background používal background-size: cover, což na monitorech s
jiným poměrem stran ořezávalo velkou část pultu. Nyní je pult pevný 1672×941
master a ticket stack je uvnitř na souřadnicích x=246, y=23, w=1180, h=895.
Celá kompozice se následně škáluje společně.

Viewport matrix ověřená výpočtem
--------------------------------
1366×768, 1440×900, 1920×1080, 2560×1440, 3440×1440, 3840×2160, 1280×800.
Na ultrawide/16:10 se přidají okraje; žádný master asset se neořízne.

Debug
-----
Přidejte do URL ?mqStageDebug=1. Master stage dostane žlutý přerušovaný obrys.

Nasazení
--------
Obsah ZIPu nahrát do kořene movie-quiz-full a přepsat stejnojmenné soubory.
Nové soubory css/master-stage.css a js/06-master-stage.js musí být nahrány také.
Po GitHub Pages deploymentu proveďte hard refresh.

Rollback
--------
Použijte samostatný BACKUP ZIP dodaný spolu s tímto patchem a odstraňte:
- css/master-stage.css
- js/06-master-stage.js

