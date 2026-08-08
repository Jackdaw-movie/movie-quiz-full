Movie Quiz - Exterior v6.1 refined patch

Apply by uploading the CONTENTS of this ZIP to the repository root and allowing same-name files to overwrite.
Do not delete assets/exterior-v5/source.
No SQL changes are required.

Changes:
- Approved TICKETS booth is now used directly as a transparent isolated asset.
- Booth hover never moves/scales the booth; only brightness/glow changes.
- Booth hit-area follows the booth silhouette instead of a rectangle.
- Car depth/shimmer uses a new alpha silhouette aligned to the current master car.
- Removed synthetic marquee bulb strip, window glow blobs and lamp halo that did not match the master artwork.
- Sign, marquee and lamp lighting now animate only the exact master-aligned pixel layers.
- Existing drain steam is animated using a masked derivative of the master smoke pixels.
- Cursor shoes are tightly cropped from the approved originals, positioned much closer together, and alternate only vertically with no rotation.
- Existing exterior/ticket flow and audio settings integration are preserved from v6.
