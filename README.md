# Movie Quiz Full – modular base v1

This is the first modular build of the working Movie Quiz v36.

## What changed

- The visible design and gameplay remain based on the working v36 build.
- CSS is split into five ordered stylesheets.
- JavaScript is split into focused files while preserving execution order.
- The fantasy dragon is now a standalone WebP asset instead of embedded Base64.
- The working single-file version is preserved in `legacy/`.
- Empty folders are prepared for future music, sound, animation and question assets.

## GitHub Pages deployment

Upload the **contents** of this folder to the root of the `movie-quiz-full` repository. Keep `index.html` in the repository root.

The existing Supabase connection remains included in `js/20-online-supabase.js`.
