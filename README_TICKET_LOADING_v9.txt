Movie Quiz – Ticket + Avatar + City-only Exterior Audio v9

Nasazení:
1. Rozbalte ZIP do kořene současného repozitáře movie-quiz-full.
2. Přepište stejnojmenné soubory, ostatní soubory nemažte.
3. Po dokončení GitHub Action udělejte tvrdý refresh (Cmd + Shift + R).

Změny v9:
- Tlačítko Pokračovat po vytvoření profilu znovu používá původní #mqRecoveryDone flow.
- Pokud avatarový modul ještě nemá přímý binding, je doplněn bezpečný fallback openOnboarding(doneButton).
- Avatar modal má z-index nad ticketem, takže výběr avatara není schovaný za vstupenkou.
- Po potvrzení avatara původní avatarový modul znovu klikne na #mqRecoveryDone a existující flow přejde na výběr obtížnosti.
- Aktivní prázdné PIN políčko má blikající svislý caret.
- Exteriér je city-only: hraje pouze ruch lidí/dopravy, syntetická menu hudba je venku potlačena.
- Posuvník hudby v exteriérovém nastavení je přejmenován na „Hudba v kině“; hodnotu jen ukládá pro auditorium.
- Hudba se znovu aktivuje až při skutečném vstupu do kina.
