Movie Quiz – Ticket + Loading patch v7

Ticket
- Uses the previously approved main and secondary ticket artwork as the source.
- Both tickets remain 150% of the original vertical height.
- The secondary ticket is placed behind the main ticket, shifted down/right and slightly rotated clockwise so it visibly peeks out diagonally.
- The two tickets are one transparent runtime asset: assets/ticket-login/production/ticket-stack.webp
- Desk/background stays fully independent and can be replaced later.
- The interactive facade is confined to the actual blank field between the printed upper and lower rules.
- Fields/body are moved upward; the “Vstup hráče” heading is intentionally placed slightly lower below the upper rule.
- Existing Supabase/profile/guest/recovery logic is reused.

Loading
- Loading gate is the only render-blocking stylesheet.
- Core/game/exterior/ticket styles load non-blocking behind the loading gate.
- The loading background is reduced to ~32 kB WebP.
- The film reel is reduced from ~319 kB PNG to ~7 kB WebP.
- CTA plate is reduced from ~233 kB PNG to ~23 kB WebP.
- Loading readiness no longer waits for remote city audio.
- Remote audio begins buffering only after the exterior visual assets are ready and does not block the CTA.
- Ticket/desk assets are primed after visual readiness so they do not compete with first-paint/exterior assets.
- The gate still waits for critical exterior imagery and the exterior integration before enabling “Vstoupit do filmového světa”.

Upload this patch over the repository root and overwrite files with the same names. Do not delete unrelated repository files.
