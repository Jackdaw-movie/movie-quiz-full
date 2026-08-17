Movie Quiz – RESPONSIVE PORTRAIT EXTERIOR v6.4
TEST INSTANCE ONLY

Co se mění:
- pouze test-responsive/index.html
- nový test-responsive/css/responsive-exterior-portrait-v6.css
- nový test-responsive/js/responsive-exterior-portrait-v6.js
- nové assety v test-responsive/assets/exterior-portrait-v6/

Co zůstává nedotčené:
- produkční /index.html
- produkční desktop master 1672×941
- produkční CSS/JS a desktopové assety

Portrait master:
- 1086×1235
- je skutečně seříznutý odspodu, bez prázdného pole
- view je TOP-CENTER anchored, ne booth-centered ani bottom-centered
- používá cover scaling

Animace:
- searchlights
- JACKDAW'S glow
- HOTEL glow
- lamp flicker
- marquee bulb chase (3 groups)
- car shine
- steam (2 staggered passes)
- booth hover
- shoe cursor hover
- production hand + 5-frame bubble sequence

Důležité:
- portrait obrazové vrstvy jsou odvozené z pixelů stejného portrait masteru.
- boty, ruka a bubble frames se znovu negenerují; používají existující produkční assety a stávající produkční logiku.


Patch v6.1:
- zoom-safe portrait cover scale, aby browser zoom neodhaloval černé okraje
- ruka posunuta +30 px vpravo a +50 px dolů
- bublina i text posunuty +30 px vpravo a +30 px dolů

Patch v6.2:
- ruka +3 px doprava
- bublina +5 px dolů
- odlesk auta už není obdélník; používá transparentní exact car-shine overlay odvozený z assetu auta
- car shine cyklus zrychlen na 8 s
- výraznější steam
- výraznější a zřetelnější blink/chase marquee světel

Patch v6.3:
- odlesk auta zpomalen na 9 s
- car-shine overlay zrcadlově otočen
- doplněn desktop-style marquee-lights pulse z exact portrait assetu marquee-lights.png
- chase bulb overlays ponechány jen jako jemný doplněk, hlavní blikání dělá přesný marquee-lights overlay

Patch v6.4 – skutečná oprava dvou problémů:
- AUTO: odlesk už nepoužívá black/white PNG jako alpha mask. Používá přímo alpha kanál car.png.
  Samotná vrstva zůstává stát přesně na autě; hýbe se pouze gradient uvnitř masky.
  Tím odlesk nemůže vytvořit obdélník mimo auto. Směr je zrcadlově otočený, cyklus zůstává 9 s.
- KINO: předchozí marquee PNG byly chybně téměř celé neprůhledné výřezy.
  Jsou kompletně přegenerované z pixelů tohoto portrait masteru jako transparentní bulb-only vrstvy.
  Animace používá stejné časy jako desktop v6.3: 1.35 s chase, delay 0 / -0.45 / -0.90 s,
  plus 3.2 s bulb halo.
