# Movie Quiz – responsive QA v1

This checklist belongs to `feature/mobile-responsive`. Do not merge the branch to `main` until the visual/device pass is complete.

## Viewport matrix

Test at least these CSS viewport sizes. Browser zoom should be 100% unless the row explicitly tests zoom.

| Class | Viewport | Orientation / purpose |
|---|---:|---|
| Ultra large | 3840 × 2160 | 4K / large-monitor scaling |
| Large | 2560 × 1440 | 1440p desktop |
| Standard | 1920 × 1080 | reference desktop |
| Laptop | 1440 × 900 | common laptop |
| Laptop | 1366 × 768 | compact desktop |
| Windowed | 1200 × 800 | desktop not maximized |
| Windowed | 1024 × 768 | narrow desktop / tablet landscape boundary |
| Tablet | 1180 × 820 | tablet landscape |
| Tablet | 820 × 1180 | tablet portrait |
| Phone | 430 × 932 | tall phone portrait |
| Phone | 390 × 844 | common phone portrait |
| Phone | 375 × 667 | short phone portrait |
| Phone | 844 × 390 | phone landscape |

Also test desktop browser resizing continuously from roughly 1900 px wide down to 900 px. There must be no point where background art and interactive layers visibly separate.

## Scenes to verify at every relevant breakpoint

1. Loading gate
   - complete/intentional background framing
   - progress bar, reel and ENTER button visible
   - no horizontal scroll
2. Exterior
   - cinema master, sign, letters, marquee, lamp, car, booth and steam remain one registered plane
   - booth hotspot stays on the booth
   - audio control remains reachable
   - walking-shoe cursor desktop only
3. Ticket / profile
   - login, registration, PIN, recovery-code and guest states
   - no field clipped by viewport or virtual keyboard
   - error messages and online-status mark visible
4. Avatar onboarding / avatar change
   - centre avatar, prev/next, Back and Continue reachable
   - no horizontal page scroll
5. Cinema intro
   - Start projection, Help and tooltip readable
6. Difficulty
   - all 3 uploaded artwork cards complete and clickable
   - title and tools do not overlap cards
7. Genres
   - all 6 true genres + Random visible
   - Random symbol visible
   - Back/home/settings controls do not overlap cards
8. Gameplay
   - standard text question
   - long question + long answers
   - image question
   - audio question
   - video question
   - DB loading state
   - DB error state
   - Random mode
   - life strip and burn animation
   - report-question action
9. Settings
   - player identity, avatar change, music/SFX sliders, mute controls
10. Statistics
   - empty / low-data / long-history states
   - genre stats remain six real genres
   - vertical scrolling on tablet/phone
11. End states
   - credits + Skip
   - loss / The End
   - victory / Oscar
   - Replay buttons
12. Genre atmosphere / animation
   - Fantasy dragon crosses the projection, not the browser viewport
   - no FX leaks outside the functional projection on mobile

## Interaction and platform checks

- Mouse: hover styles must not move master-registered objects.
- Touch: all primary controls have usable touch targets; no hover-only dependency.
- iOS Safari: safe-area around notch/Dynamic Island; address bar expanded and collapsed; rotate portrait ↔ landscape.
- Android Chrome: dynamic address bar; rotate portrait ↔ landscape.
- Reduced motion: core game remains usable with `prefers-reduced-motion: reduce`.
- Browser zoom desktop: spot-check 80%, 100%, 125% and 150% for overlap/overflow.
- Keyboard navigation: visible focus for login/settings/reporting and main game navigation.

## Merge gate

Before merging to `main`:

- no regression in Supabase login, anonymous play or Random RPC flow
- no source artwork changed
- no question/game logic changed
- no unexpected horizontal scrolling
- no unreachable controls
- no master-asset registration drift on window resize
- mobile portrait gameplay remains readable without browser pinch zoom
- test branch is compared against the frozen backup `backup/pre-responsive-mobile-2026-08-17`
