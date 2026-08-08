Movie Quiz exterior v6.7 – city ambience stability patch

Changes:
- city ambience has one playback owner (no duplicate play() calls on first gesture)
- menu soundtrack no longer starts on the same first interaction as city ambience
- automatic restart watchdog if the HTMLAudio element pauses/stalls while exterior is active
- city ambience stays looping until actual auditorium entry
- cache-buster for js/26-exterior-scene.js bumped to v=6.7
- no visual assets changed

Deploy: copy patch contents to repository root and overwrite matching files.
