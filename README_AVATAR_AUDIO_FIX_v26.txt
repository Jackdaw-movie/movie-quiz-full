Movie Quiz – avatar/audio minimal patch v26

Based on v25.

VISUAL:
- LEFT AVATAR: +5 master pixels toward center.
- RIGHT AVATAR: -5 master pixels toward center.
- ZPĚT: approx. 30% smaller than v25.
- ZPĚT: same top line and exact same master height as POKRAČOVAT.
- Approved ZPĚT asset keeps its aspect ratio (background-size: contain).

AUDIO / BLANK CLICK:
- Blank pointer/clicks inside mandatory avatar onboarding are stopped at the
  avatar modal instead of bubbling to unrelated global document handlers.
- Real controls (arrows, avatar buttons, Continue, Back) still bubble normally.
- Exterior first-interaction audio guard also checks the actual event target,
  so ticket/avatar-overlay clicks are ignored even during attribute timing races.
