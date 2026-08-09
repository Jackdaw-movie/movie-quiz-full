Movie Quiz – performance patch v10
=================================

Cil: zrychlit prvni vykresleni/loading a pripravu avataroveho carouselu bez zmeny schvalene grafiky.

Hlavni zmeny:
1. Loading gate zacina preload okamzite po svem HTML, ne az po DOMContentLoaded.
2. Loading CSS je vlozen primo do index.html, takze prvni obrazovka neceka na samostatny CSS request.
3. Odstraneny zbytecne casne preloads stareho loading pozadi a ticket assetu.
4. Priorita prvniho loadu: male loading assety + exterior master.
5. Exterior integrace se spousti hned po core.js; ma watchdog, ktery znovu obali showView po pozdejsim nacteni online modulu.
6. Loading gate ceka jen na hlavni exterior vrstvy. Zarovky, para a kurzor se pripravuji hned po visual-ready.
7. Ticket/profile CSS se po visual-ready povysi na normalni prioritu, aby byl pripraven pred klikem na pokladnu.
8. Avatar performance warmup: jeste pred onboardingem se nacita a dekoduje prvni sada carouselu (01,20,02,19,03 + sousedi). Dalsi avatary se jemne prednacitaji v idle case.
9. Pri otevrenem carouselu se avatarove obrazky povysi na eager/high priority.
10. Service worker cacheuje stabilni exterior a avatar assety pro dalsi navstevy. HTML, ticket a loading grafika se timto SW necachuji, aby se neblokovaly dalsi vizualni patche.

Nasazeni:
- Nahraj obsah ZIPu do korene existujiciho repozitare movie-quiz-full.
- Prepis stejne soubory, ostatni soubory nemaz.
- Po GitHub Action proved Cmd+Shift+R.
- Prvni navsteva je rychlejsi diky novemu poradi priorit; dalsi navstevy navic vyuziji cache stabilnich avatar/exterior assetu.
