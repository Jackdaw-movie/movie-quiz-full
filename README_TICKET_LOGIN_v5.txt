Movie Quiz – Ticket Login v5.0 (taller ticket patch)

WHAT CHANGED
- Uses one transparent ticket-stack asset containing the approved main ticket + peeking second ticket.
- Both tickets are vertically enlarged to 150% of the earlier ticket height.
- The desk remains a completely separate backdrop asset (`assets/ticket-login/production/desk.webp`) and can be swapped later without touching the ticket UI.
- The usable form region now fills nearly the entire blank area from the underline below JACKDAW'S CINEMA to the lower printed line.
- Register/recovery states no longer need aggressive compression and have more vertical room.
- Main CTA (including POKRAČOVAT / VYTVOŘIT PROFIL / VSTOUPIT DO KINA) uses the dark-brown cut-corner plaque style matching the approved visual reference, with warm gold edge and gold hover text.
- Functional Supabase/profile logic remains in the existing hidden source UI; the ticket facade mirrors it as in v4.

DEPLOYMENT
Upload the contents of this ZIP into the ROOT of the current `movie-quiz-full` repository.
Overwrite same-named files. Do not delete unrelated files.
After GitHub Pages deployment, hard refresh (Cmd + Shift + R on Mac).

MODULAR ASSETS
- Background: assets/ticket-login/production/desk.webp
- Ticket stack: assets/ticket-login/production/ticket-stack.webp
- Editable source: assets/ticket-login/source/ticket-stack-tall-150.png

The ticket stack is transparent and independent of the desk/background.
