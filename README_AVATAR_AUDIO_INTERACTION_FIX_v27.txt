Movie Quiz – interaction patch v27

Based directly on v26.

VISUAL
- ZPĚT: 10% smaller than v26, same vertical center position.
- LEFT AVATAR: +5 master px toward center.
- RIGHT AVATAR: -5 master px toward center.

AUDIO
- Legacy #muteBtn is hidden and non-interactive.
- Capture guard blocks its click handler as a second safety layer.
- After ordinary clicks outside Settings, an accidental core state.muted=true
  is immediately restored to false.
- Settings volume controls remain untouched. Setting music volume directly to 0
  in Settings is still allowed.

AVATAR NAVIGATION
- Only the graphical left/right [data-avatar-nav] arrow buttons may navigate.
- Trackpad wheel / two-finger gestures no longer navigate.
- Pointer drag / swipe no longer navigates.
- Clicking a carousel avatar no longer navigates.
- Keyboard ArrowLeft / ArrowRight no longer navigate.
- Continue/confirm and Back remain functional.
