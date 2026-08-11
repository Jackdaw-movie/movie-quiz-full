Movie Quiz – Avatar + audio minimal fix v25

Changes only:
1) LEFT AVATAR: +8 source pixels toward center.
2) RIGHT AVATAR: -8 source pixels toward center.
3) ZPĚT: explicit width AND height; placed immediately right of POKRAČOVAT,
   vertically aligned to the same centerline.
4) Exterior global pointerdown audio unlock ignores ticket/avatar overlays,
   preventing an arbitrary click in onboarding from suppressing music.
5) Inactive game mute control cannot intercept pointer clicks.

Base: v24 / master-stage refactor state.
