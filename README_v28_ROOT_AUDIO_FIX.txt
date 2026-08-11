Movie Quiz v28 – root audio fix + avatar micro-adjustments

VISUAL
- ZPĚT: another 10% smaller than v27, centre position preserved.
- LEFT AVATAR: +3 master pixels toward centre.
- RIGHT AVATAR: -3 master pixels toward centre.

AUDIO ROOT FIX
- Exterior suppressExteriorMusic() no longer zeros musicGain while avatar modal is visible.
- Exterior switchMusic guard allows normal menu music while avatar modal is visible.
- Legacy #muteBtn node is replaced with a clean clone, physically removing the core click listener.
- While avatar modal is open, clicks outside real Settings controls re-apply stored audio volumes and menu music after the event.
- Settings sliders/toggles are explicitly exempt and remain the only way to change audio.

AVATAR NAVIGATION
- Existing v27 arrow-only navigation protection remains: wheel, trackpad, drag/swipe, avatar click and keyboard arrows cannot navigate.
