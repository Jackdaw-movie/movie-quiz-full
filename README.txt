MOVIE QUIZ – SETTINGS v1.1 STABILITY FIX

Nahraďte v GitHubu:
- js/24-player-avatars.js
- js/25-player-settings.js
- js/30-difficulty-tools.js

SQL se nemění.

Oprava odstraňuje zpětnovazební smyčku MutationObserveru v profilové kartě a Settings už při načtení stránky nevytváří AudioContext. Loader používá ?v=1.1 kvůli cache.

Po nahrání: Command + Shift + R.
První test: Spustit promítání -> uložený profil musí zobrazit kartu Vítej zpět a aktivní tlačítko Pokračovat.
