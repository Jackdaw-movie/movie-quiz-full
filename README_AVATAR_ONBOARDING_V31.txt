Movie Quiz – avatar onboarding hotfix v3.1

Co opravuje:
- Po kliknutí na „Rozumím, pokračovat“ u NOVĚ vytvořeného profilu se povinně otevře carousel 20 avatarů.
- Otevření už není blokované tím, že čerstvě načtený profil ještě nemá v lokálním snapshotu profileId.
- Do hry se pokračuje až po úspěšném uložení avatara.
- Obnova PINu existujícího profilu se nemění.

Nasazení:
1. Nahraj složku js do kořene repozitáře a přepiš js/24-player-avatars.js.
2. SQL už znovu nespouštěj – 20 avatarů máš v DB správně.
3. Po deploymentu udělej Command + Shift + R.
