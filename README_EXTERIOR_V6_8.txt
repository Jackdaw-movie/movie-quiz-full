Movie Quiz – Exterior v6.8 audio patch

Změny:
- jednorázově nastaví výchozí Hudba = 50 % a Herní zvuky = 50 %;
- další změny už se normálně ukládají a při reloadu se neresetují;
- slider Herní zvuky přímo řídí i hlasitost exteriérového městského ruchu;
- starý assets/audio/city_ambience.ogg se v exteriéru už nepoužívá;
- nový exteriér používá dvě vrstvy z Mixkit:
  1) Street ambience with walking people (lidé, hovory, kroky),
  2) City traffic background ambience (tišší dopravní podkres);
- obě vrstvy běží v různě dlouhých smyčkách, takže opakování není tak nápadné;
- při vstupu do sálu se městský ruch plynule vypne;
- na prvním skutečném kliknutí se zároveň odemkne a spustí menu hudba.

Zdroj zvuků: Mixkit Sound Effects, použito podle Mixkit Sound Effects Free License.
https://mixkit.co/free-sound-effects/public-places/
https://mixkit.co/free-sound-effects/city/
https://mixkit.co/license/

Poznámka k autoplay: prohlížeč může zakázat slyšitelný zvuk bez uživatelské interakce. Kód se pokusí o okamžité spuštění a při blokaci spustí ruch při prvním kliknutí/stisku klávesy.
