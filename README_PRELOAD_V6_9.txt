Movie Quiz – technical preload/performance patch v6.9

Purpose:
- add a temporary technical loading gate before the exterior (final visual PNG can replace the gate later)
- use the Enter click as the trusted browser gesture that starts pre-buffered city ambience immediately
- hide and pause the exterior while loading so the player never sees the scene assembling
- defer noncritical game styles behind the loading gate
- avoid painting/layout of the hidden auditorium while still outside
- replace heavy exterior PNG runtime assets with visually equivalent high-quality WebP production copies
- resize the cursor shoe source bitmaps to an appropriate runtime resolution
- reuse the preloaded Audio objects in 26-exterior-scene.js instead of downloading/creating duplicate tracks

No source artwork in assets/exterior-v5/source is modified or deleted.
No database migration is required.

Upload the CONTENTS of this ZIP to the repository root and overwrite matching files.
