Movie Quiz – Cinema Master v32

This replaces the failed v30/v31 cinema integration.

Core fix:
- Approved 1672×941 cinema art is a REAL <img> render layer.
- #cinema is one proportional 1672:941 master stage.
- Old hall DOM layers are completely hidden.
- .proscenium no longer applies a second layout/scale.
- Existing .screen-frame is registered directly to the painted screen:
  x 15.25%, y 20.95%, width 69.55%, height 66.10%.
- Existing #screen/game views remain the functional gameplay layer.
- Home/profile/settings are not restyled by this patch.

Files from v31 (cinema-master-v2.css and js/50-cinema-master-v2.js) may remain
in the repository, but index.html no longer loads them.
