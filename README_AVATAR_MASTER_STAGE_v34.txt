Movie Quiz – Avatar Master Stage v34

NEW PROJECT STANDARD
All visually fixed screens use one internal master coordinate system. Functional
elements are positioned in master pixels and the whole master is uniformly scaled
as one object. Never scale the artwork and HTML controls independently.

AVATAR SCREEN
- Internal master is permanently 1672 × 941 px.
- Background, side avatars, center avatar, arrows, Continue and Back all live in
  this same coordinate plane.
- A single JS scale = min(viewportWidth/1672, viewportHeight/941) is applied to
  the whole .mq-avatar-dialog.
- Resizing/changing monitors therefore cannot move avatars relative to the
  circles painted in the background.
- Existing v29 visual positions are preserved, converted to master pixels.
- Existing v28 audio and arrow-only interaction guards are untouched.
- Cinema v33 remains untouched.

MASTER COORDINATES
LEFT AVATAR   x467 y361 w234 h233
CENTER AVATAR x670 y271 w311 h378
RIGHT AVATAR  x966 y361 w234 h233
LEFT ARROW    x553 y453 w89 h87
RIGHT ARROW   x1030 y453 w89 h87
CONTINUE      x573 y812 w528 h107
BACK          x1138 y826 w194 h78
