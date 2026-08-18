# Responsive exterior v8 audit

This `test-responsive` build intentionally has a single exterior interaction target: the ticket booth.

## Root causes removed

- Old responsive exterior controllers accumulated across v5/v6/v7 and could fight the production booth cursor/hover.
- Portrait previously ran a second hover system while the production booth button could still own hover/cursor state.
- Hidden/nonfunctional stage elements were still able to receive pointer events.
- Marquee chase relied on CSS-only animations that were vulnerable to competing responsive overrides.

## v8 architecture

- Desktop keeps the production `#mqTicketBoothHotspot`, production shoe cursor and production click handler.
- Every other descendant of `#mqExteriorStage` is pointer-dead in the responsive test build.
- Portrait makes the production booth button inert and uses one pixel-mask booth controller only.
- Legacy responsive booth hit targets/classes are removed at runtime and new stage children are sanitized by `MutationObserver`.
- Booth glow remains a separate glow-only asset, shifted +10 px, with roughly half the previous intensity.
- Portrait marquee reuses the registered portrait bulb-only assets, but the exact production v6.3 halo/G1/G2/G3 chase is driven by Web Animations (`3.2 s` halo, `1.35 s` chase, `450 ms` phase spacing) and is placed above all other stage layers.
- Car/shine and hand/bubble geometry remain unchanged from the approved responsive state.

## Browser harness checks before commit

Portrait:
- booth hover ON inside mask / OFF immediately outside mask
- shoes visible inside / hidden outside
- booth click fired exactly once
- legacy door click blocked
- bulb-group computed opacities changed between samples, confirming the chase is running

Desktop:
- production shoes appear on booth enter and disappear on booth leave
- production booth click fired exactly once
- legacy door click blocked
- production booth pointer-events = `auto`; legacy target pointer-events = `none`
