MOVIE QUIZ — EXTERIOR INTEGRATION v4
====================================

Oprava podle screenshotu po v3:
- úplně odstraněný starý master obrázek z pozadí
- odstraněné duplicitní dveřní overlaye a zrcadlený pravý dům
- všechny schválené assety byly technicky oříznuté na skutečný obsah, aby jejich rozměry odpovídaly objektům
- scéna používá pevný 1672×941 design stage a škáluje se jako celek, takže se vzájemné pozice nerozjedou mezi rozlišeními
- pokladna má hover přes celý objekt, bez obrysového rámečku
- boty jsou těsně vedle sebe, rychlejší a s větším rozsahem kývání
- zvuk vpravo je ve výchozím stavu pouze ozubené kolo; klik otevře Hudba/Zvuky
- výraznější živé animace: searchlights, marquee chase, blikání lampy/oken, déšť, pára, mokré odlesky a grain
- animace ruky záměrně není součástí této verze

NASAZENÍ:
Nahraj celý obsah ZIPu do kořene GitHub repozitáře se zachováním složek a přepiš stejnojmenné soubory. SQL se nemění. Po deploy: Command + Shift + R.

Důležitá oprava assetů:
V3 používala PNG/WebP canvasy s velkými průhlednými okraji jako kdyby celý canvas byl objekt. Proto byly pozice a velikosti zásadně špatně. V4 nejprve ořezává každý asset na skutečný neprůhledný obsah a až potom ho umisťuje. Marquee bylo navíc oříznuto jen na samotnou textovou tabuli, aby se neduplikoval horní znak kina.
