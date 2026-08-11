Movie Quiz – Cinema Master v1
================================

PURPOSE
- Installs the approved 1672×941 1930s cinema auditorium artwork as the fixed
  visual master of the main Movie Quiz cinema/game screen.
- Does NOT bake Home, player avatar/name or Settings into the image.
  Those remain separate dynamic UI and can be redesigned next.

WHAT THIS PATCH DOES
1. Adds approved source:
   assets/cinema-v1/source/cinema-master-approved.png
2. Adds optimized production WebP (~small runtime asset):
   assets/cinema-v1/production/cinema-master.webp
3. Adds css/cinema-master-v1.css and loads it last.
4. Keeps the complete artwork visible with its 1672:941 aspect ratio.
5. Hides legacy CSS hall/ceiling/walls/seats/curtain decoration to prevent
   duplicate artwork.
6. Registers the existing functional #screen into the painted projection screen
   using one shared coordinate system.

SCREEN ANCHOR IN MASTER
x = 15.25%
y = 20.95%
w = 69.55%
h = 66.10%

IMPORTANT
- No game logic, Supabase, audio, avatar logic, scoring or questions are changed.
- v28 audio fixes and v29 avatar/button layout remain untouched.
- On monitors with a different aspect ratio, black letterbox space is expected.
  The image is never cropped or stretched out of proportion.

ROLLBACK
Remove:
- css/cinema-master-v1.css
- assets/cinema-v1/
and remove its <link rel="preload"> and <link rel="stylesheet"> from index.html.
