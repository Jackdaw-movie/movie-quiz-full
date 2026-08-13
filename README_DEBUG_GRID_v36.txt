Movie Quiz – temporary pixel/master debug grid v36

HOW TO ENABLE
Open the game with ?mqGrid=1 appended to the URL.
Example:
https://.../index.html?mqGrid=1

CONTROLS
- G = grid ON/OFF (ignored while typing into an input/textarea/select)
- Bottom-left GRID button = same toggle
- Move mouse over the cinema to see MASTER X/Y coordinates.
- Yellow box = actual functional GAME SCREEN.
- Cyan box = HTML element currently under the mouse.
- Readout shows the hovered element's master x/y/width/height.

COORDINATE SYSTEM
MASTER = 1672 × 941
Grid = 10 px minor, 50 px medium, 100 px major.

NORMAL PLAYERS
If ?mqGrid=1 is not in the URL, the module exits immediately and renders nothing.

REMOVAL AFTER WE FINISH PIXEL-PERFECT WORK
1. Delete css/debug-grid.css
2. Delete js/98-debug-grid.js
3. Remove the debug-grid stylesheet <link> from index.html
4. Remove the mq-debug-grid-script <script> from index.html
No game logic depends on this module.
