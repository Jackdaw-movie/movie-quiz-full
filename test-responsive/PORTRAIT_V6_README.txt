Movie Quiz – RESPONSIVE PORTRAIT EXTERIOR v6.0
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
