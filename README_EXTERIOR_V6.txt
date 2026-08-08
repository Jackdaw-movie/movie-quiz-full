MOVIE QUIZ – EXTERIOR V6
========================

V6 je patch pro aktuální v5.

Hlavní změny:
- Master zůstává pixelově uzamčeným základem scény.
- 3D vrstvy jsou vytvořené z pixelů masteru, ale jejich průhledné masky vycházejí ze samostatných schválených assetů. Díky tomu se objekty nepřekreslují a nevzniká čtvercové pozadí.
- Samostatné depth vrstvy: JACKDAW'S sign, marquee, lampa, auto a pokladna.
- Pokladna má hover přes celý tvar; vizuálně se zvedá jen samotná pokladna.
- Viditelné animace: searchlighty, marquee bulbs, lamp flicker, window glow, car highlight a pára z kanálu. Bez deště.
- Boty kurzoru jsou cca o 20 % větší, těsně vedle sebe a střídavě se pohybují pouze nahoru/dolů. Bez naklápění.
- Exteriérové nastavení zvuku používá přesně centrované SVG ozubené kolo.
- Hráčský/avatar dock je před vstupenkou kompletně skrytý. Objeví se až po vstupu do sálu.
- Zrušen kontinuální city_ambience.ogg, který vytvářel hrubý šum. Exteriér nepouští syntetickou šumovou smyčku.
- Klik na pokladnu přehraje kroky a po cca 1,45 s otevře skutečně viditelnou vrstvu vstupenky.
- Vrstva vstupenky dostala kompletní CSS a je nad exteriérem.

Nasazení:
Nahraj celý obsah ZIPu do kořene repozitáře a přepiš stejnojmenné soubory.
V6 předpokládá, že v repozitáři již existují assety z v5:
  assets/exterior-v5/source/ChatGPT Image 8. 8. 2026 17_36_01.png
  assets/exterior-v5/source/kurzor_bota_leva.png
  assets/exterior-v5/source/kurzor_bota_prava.png

Žádné SQL není potřeba.
