Movie Quiz – Ticket Login v4.0 UX rebuild

This package is an update for the existing Jackdaw Movie Quiz repository.
Upload its contents to the repository root and overwrite files with the same names.
Do not delete other repository files.

What changed:
- Approved desk and both approved ticket assets are unchanged.
- The second ticket is shown only as its approved image; no HTML number overlay is added.
- Ticket login UI was rebuilt as a dedicated visual facade instead of reskinning the old profile DOM.
- The original profile/Supabase DOM remains functional off-screen and is used as the source of truth.
- Name, PIN, registration, recovery, recovery-code reveal, linked profile and guest states are mirrored into the ticket facade.
- Ticket typography now uses a single classic serif family; the previous condensed/modern button typography is removed.
- Guest CTA and Back actions are materially larger and higher contrast.
- Registration and recovery layouts are fixed-height and cannot overlap.
- Tooltip markers use a small Art-Deco diamond with ? instead of a generic circled i.
- When a guest later chooses "Přihlásit se" inside the auditorium, the approved ticket-on-desk screen reopens.
- Continuing from that reopened ticket closes it and returns to the auditorium.

Files changed:
- index.html (cache/version bumps only)
- css/ticket-login.css
- js/27-ticket-login-ui.js
- js/26-exterior-scene.js (ticket re-entry behavior only)

Approved source assets remain in assets/ticket-login/source/.
