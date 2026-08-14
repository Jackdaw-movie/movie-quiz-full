MOVIE QUIZ – AVATAR LAYOUT MASTER v47
Date: 2026-08-14
Status: CANONICAL / DO NOT REPOSITION BY EYE

PURPOSE
This file is the hard layout contract for the avatar-selection screen. It exists
specifically so responsive work cannot move avatars away from the circular wells
painted in the approved avatar background asset.

MASTER COORDINATE SYSTEM
- Entire avatar screen: 1672 × 941 px.
- .mq-avatar-dialog always keeps this internal size.
- Responsive behaviour = ONE uniform scale on the complete .mq-avatar-dialog.
- Never convert the child coordinates below to vw/vh/cqw/cqh.
- Never scale the background and avatars independently.
- Never reposition the circular side slots to compensate for PNG transparency.
  Correct only the image inside the locked slot.

LOCKED CIRCULAR ASSET WELLS
LEFT WELL
- x = 264
- y = 387
- width = 234
- height = 234
- exact well centre = (381, 504)

RIGHT WELL
- x = 1194
- y = 387
- width = 234
- height = 234
- exact well centre = (1311, 504)

SIDE AVATAR ARTWORK
- rendered width = 74.8% of well
- rendered height = 74.8% of well
- this is exactly 15% smaller than the former 88% setting
- object-fit = contain
- base object-position = centre / centre

LEFT AVATAR VISUAL CORRECTION
- transform X = 0 px
- transform Y = -11 px

RIGHT AVATAR VISUAL CORRECTION
- transform X = -19 px
- transform Y = -11 px
- IMPORTANT: -19 px is the final canonical correction as of 2026-08-14.
- It includes BOTH successive user requests to move the right avatar 5 px
  further left after the earlier -9 px correction.

CENTRE AVATAR / OTHER LOCKED MASTER ITEMS
These stay in the same 1672 × 941 master unless the user explicitly changes them:
- centre avatar: x=670 y=271 w=311 h=378
- left arrow: x=553 y=453 w=89 h=87
- right arrow: x=1030 y=453 w=89 h=87
- continue: x=573 y=812 w=528 h=107
- back: x=1138 y=826 w=194 h=78

RESPONSIVE INVARIANT
At every viewport size the relationship between background artwork, circular
wells, avatars, arrows and buttons must remain pixel-identical in master space.
Only the parent master stage is allowed to scale uniformly.

GRID INVARIANT
The debug grid is a diagnostic overlay only. Turning it on/off must never:
- add a child that participates in the master layout,
- change a master transform,
- change body/page layout classes,
- resize or reposition a stage,
- intercept pointer events.
It may only READ the visible stage rectangle and paint a fixed overlay above it.
