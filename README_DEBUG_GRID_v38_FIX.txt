Movie Quiz – Debug Pixel Grid v38 FIX

Critical fix over v37:
- Removed the global MutationObserver that watched the whole document.
- v37 could create a self-triggering mutation loop because ensureUI updated the debug button while the observer was watching childList changes.
- Debug now boots only once after DOMContentLoaded.
- A finite 20x fallback retry exists only if #cinema is unexpectedly not ready.
- Toggle text writes are idempotent.
- No game startup, profile, Supabase, audio, avatar, cinema or gameplay logic is changed.

Usage:
- GRID OFF / GRID ON button in bottom-left.
- Keyboard G toggles the grid.
- ?mqGrid=1 may still auto-enable it.

Rollback branch created before deployment:
backup-before-v38-20260813-1947
