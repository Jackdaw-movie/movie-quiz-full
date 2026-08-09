Movie Quiz – Avatar selection v15 asset-based rebuild

This patch replaces the painted-one-piece avatar screen with a clean asset composition:
- background: approved clean stage with 2 full circular side avatar wells
- arrow-left / arrow-right: standalone transparent assets
- continue: standalone transparent POKRAČOVAT asset
- back: standalone transparent ZPĚT asset

Behavior:
- center avatar is active selection
- exactly one previous and one next avatar are visible in the left/right circular wells
- all navigation/button hovers are applied directly to their standalone image assets
- ZPĚT during mandatory post-registration onboarding returns to the recovery-code ticket
- ZPĚT when gallery was opened elsewhere uses the original close behavior, returning to the exact underlying screen
- avatar prewarming helper is enabled for faster carousel rendering

Production assets are optimized WebP; source approved PNGs are kept in assets/avatar-onboarding-v15/source/.
