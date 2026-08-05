-- ============================================================
-- MOVIE QUIZ 7.1
-- PESTŘEJŠÍ LEHKÉ KOMEDIE
--
-- Změny:
-- - přidá 20 otázek „film -> děj“,
-- - přidá 20 otázek „správná dvojice postava -> film“,
-- - deaktivuje 40 opakujících se starých šablon,
-- - zachová přesně 200 aktivních lehkých komediálních otázek,
-- - výběr hry hlídá pestrost typů,
-- - podobné typy se ve výsledném pořadí prokládají,
-- - zachová historii 150 otázek, 50 filmů a trvalé profily.
-- ============================================================

begin;

create temporary table tmp_comedy_easy_variety_v2 (
  external_id text not null,
  game_mode text not null,
  genre text not null,
  difficulty smallint not null,
  question_type text not null,
  type_label text not null,
  era_label text not null,
  tags text[] not null,
  prompt text not null,
  movie_title text not null,
  movie_year smallint not null,
  explanation text not null,
  source_url text not null,
  secondary_source_url text,
  genre_source_url text not null,
  canonical_movie_key text not null,
  franchise_key text,
  relation_key text not null,
  answer_key text not null,
  primary_person_key text,
  clue_keys text[] not null,
  reveal_keys text[] not null,
  cz_familiarity smallint not null,
  genre_verified boolean not null,
  cz_difficulty_note text not null,
  question_bank_version text not null,
  options jsonb not null
) on commit drop;

insert into tmp_comedy_easy_variety_v2 values
('comedy_cz_easy_v2_plot_match_001','classic','comedy',1,'plot_match','Film a děj','1990s',ARRAY['comedy','czech-audience','easy','plot-match','variety-v2']::text[],'Který z těchto dějů patří ke komedii Sám doma?','Home Alone',1990,'Ke komedii Sám doma patří tento děj: Chlapec zůstane omylem přes Vánoce sám doma a chrání dům před dvojicí nešikovných zlodějů.','https://en.wikipedia.org/wiki/Special:Search?search=Home+Alone+1990+film','https://www.themoviedb.org/search/movie?query=Home+Alone+1990','https://en.wikipedia.org/wiki/Special:Search?search=Home+Alone+1990+film','movie:home_alone','franchise:home_alone','plot_match:movie:home_alone','plot:movie:home_alone',null,ARRAY['movie:home_alone']::text[],ARRAY['plot:movie:home_alone']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Chlapec nastoupí do špatného letadla, ocitne se sám v New Yorku a znovu narazí na známé zloděje.","correct":false},{"text":"Úspěšný právník kvůli synovu přání celý den nedokáže vyslovit žádnou lež.","correct":false},{"text":"Tři přátelé se po divoké rozlučce probudí bez vzpomínek a musí před svatbou najít zmizelého ženicha.","correct":false},{"text":"Chlapec zůstane omylem přes Vánoce sám doma a chrání dům před dvojicí nešikovných zlodějů.","correct":true}]'::jsonb),
('comedy_cz_easy_v2_plot_match_002','classic','comedy',1,'plot_match','Film a děj','1990s',ARRAY['comedy','czech-audience','easy','plot-match','variety-v2']::text[],'Který z těchto dějů patří ke komedii Ace Ventura: Zvířecí detektiv?','Ace Ventura: Pet Detective',1994,'Ke komedii Ace Ventura: Zvířecí detektiv patří tento děj: Výstřední detektiv specializovaný na zvířata hledá uneseného maskota týmu amerického fotbalu.','https://en.wikipedia.org/wiki/Special:Search?search=Ace+Ventura%3A+Pet+Detective+1994+film','https://www.themoviedb.org/search/movie?query=Ace+Ventura%3A+Pet+Detective+1994','https://en.wikipedia.org/wiki/Special:Search?search=Ace+Ventura%3A+Pet+Detective+1994+film','movie:ace_ventura','franchise:ace_ventura','plot_match:movie:ace_ventura','plot:movie:ace_ventura',null,ARRAY['movie:ace_ventura']::text[],ARRAY['plot:movie:ace_ventura']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Nešikovný britský agent musí zabránit francouzskému miliardáři zmocnit se královského trůnu.","correct":false},{"text":"Zdravotník se snaží získat souhlas přísného otce své přítelkyně, ale každá situace končí katastrofou.","correct":false},{"text":"Výstřední detektiv specializovaný na zvířata hledá uneseného maskota týmu amerického fotbalu.","correct":true},{"text":"Zvířecí detektiv cestuje do Afriky, aby našel posvátného netopýra a zabránil válce mezi kmeny.","correct":false}]'::jsonb),
('comedy_cz_easy_v2_plot_match_003','classic','comedy',1,'plot_match','Film a děj','1990s',ARRAY['comedy','czech-audience','easy','plot-match','variety-v2']::text[],'Který z těchto dějů patří ke komedii Lhář, lhář?','Liar Liar',1997,'Ke komedii Lhář, lhář patří tento děj: Úspěšný právník kvůli synovu přání celý den nedokáže vyslovit žádnou lež.','https://en.wikipedia.org/wiki/Special:Search?search=Liar+Liar+1997+film','https://www.themoviedb.org/search/movie?query=Liar+Liar+1997','https://en.wikipedia.org/wiki/Special:Search?search=Liar+Liar+1997+film','movie:liar_liar','franchise:liar_liar','plot_match:movie:liar_liar','plot:movie:liar_liar',null,ARRAY['movie:liar_liar']::text[],ARRAY['plot:movie:liar_liar']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Žena se snaží být dokonalou družičkou své nejlepší kamarádce, přestože se jí osobní život rozpadá.","correct":false},{"text":"Úspěšný právník kvůli synovu přání celý den nedokáže vyslovit žádnou lež.","correct":true},{"text":"Uzavřený muž se zaváže říkat ano každé příležitosti a jeho život se začne rychle měnit.","correct":false},{"text":"Parta přátel se před svatbou v Thajsku znovu probudí bez vzpomínek a hledá ztraceného člena rodiny.","correct":false}]'::jsonb),
('comedy_cz_easy_v2_plot_match_004','classic','comedy',1,'plot_match','Film a děj','2000s',ARRAY['comedy','czech-audience','easy','plot-match','variety-v2']::text[],'Který z těchto dějů patří ke komedii Johnny English?','Johnny English',2003,'Ke komedii Johnny English patří tento děj: Nešikovný britský agent musí zabránit francouzskému miliardáři zmocnit se královského trůnu.','https://en.wikipedia.org/wiki/Special:Search?search=Johnny+English+2003+film','https://www.themoviedb.org/search/movie?query=Johnny+English+2003','https://en.wikipedia.org/wiki/Special:Search?search=Johnny+English+2003+film','movie:johnny_english','franchise:johnny_english','plot_match:movie:johnny_english','plot:movie:johnny_english',null,ARRAY['movie:johnny_english']::text[],ARRAY['plot:movie:johnny_english']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Nešikovný britský agent musí zabránit francouzskému miliardáři zmocnit se královského trůnu.","correct":true},{"text":"Agent se vrací do služby a snaží se odhalit spiknutí připravující atentát na čínského premiéra.","correct":false},{"text":"Dvě naprosto odlišné rodiny se setkají před svatbou svých dětí a jejich rozdíly vyvolají chaos.","correct":false},{"text":"Dva nezralí dospělí muži se po svatbě svých rodičů stanou nevlastními bratry a musí spolu žít.","correct":false}]'::jsonb),
('comedy_cz_easy_v2_plot_match_005','classic','comedy',1,'plot_match','Film a děj','1990s',ARRAY['comedy','czech-audience','easy','plot-match','variety-v2']::text[],'Který z těchto dějů patří ke komedii Prci, prci, prcičky?','American Pie',1999,'Ke komedii Prci, prci, prcičky patří tento děj: Čtyři středoškoláci uzavřou dohodu, že před maturitou přijdou o panictví.','https://en.wikipedia.org/wiki/Special:Search?search=American+Pie+1999+film','https://www.themoviedb.org/search/movie?query=American+Pie+1999','https://en.wikipedia.org/wiki/Special:Search?search=American+Pie+1999+film','movie:american_pie','franchise:american_pie','plot_match:movie:american_pie','plot:movie:american_pie',null,ARRAY['movie:american_pie']::text[],ARRAY['plot:movie:american_pie']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Přátelé si pronajmou dům u jezera a pokoušejí se během léta napravit své milostné životy.","correct":false},{"text":"Plachý prodavač elektroniky se s pomocí kolegů pokouší navázat první skutečný vztah.","correct":false},{"text":"Skupina herců natáčejících válečný film se ocitne ve skutečném nebezpečí a stále si myslí, že jde o režii.","correct":false},{"text":"Čtyři středoškoláci uzavřou dohodu, že před maturitou přijdou o panictví.","correct":true}]'::jsonb),
('comedy_cz_easy_v2_plot_match_006','classic','comedy',1,'plot_match','Film a děj','2000s',ARRAY['comedy','czech-audience','easy','plot-match','variety-v2']::text[],'Který z těchto dějů patří ke komedii Jeho fotr, to je lotr!?','Meet the Fockers',2004,'Ke komedii Jeho fotr, to je lotr! patří tento děj: Dvě naprosto odlišné rodiny se setkají před svatbou svých dětí a jejich rozdíly vyvolají chaos.','https://en.wikipedia.org/wiki/Special:Search?search=Meet+the+Fockers+2004+film','https://www.themoviedb.org/search/movie?query=Meet+the+Fockers+2004','https://en.wikipedia.org/wiki/Special:Search?search=Meet+the+Fockers+2004+film','movie:meet_fockers','franchise:meet_parents','plot_match:movie:meet_fockers','plot:movie:meet_fockers',null,ARRAY['movie:meet_fockers']::text[],ARRAY['plot:movie:meet_fockers']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Narcistický závodník NASCAR začne pochybovat o sobě, když ho porazí francouzský soupeř.","correct":false},{"text":"Dospělý muž žije se sprostým mluvícím plyšovým medvědem, který ohrožuje jeho partnerský vztah.","correct":false},{"text":"Dvě naprosto odlišné rodiny se setkají před svatbou svých dětí a jejich rozdíly vyvolají chaos.","correct":true},{"text":"Muž po letech hledá svou středoškolskou lásku, o kterou soupeří několik podivných nápadníků.","correct":false}]'::jsonb),
('comedy_cz_easy_v2_plot_match_007','classic','comedy',1,'plot_match','Film a děj','2000s',ARRAY['comedy','czech-audience','easy','plot-match','variety-v2']::text[],'Který z těchto dějů patří ke komedii Čtyřicetiletý panic?','The 40-Year-Old Virgin',2005,'Ke komedii Čtyřicetiletý panic patří tento děj: Plachý prodavač elektroniky se s pomocí kolegů pokouší navázat první skutečný vztah.','https://en.wikipedia.org/wiki/Special:Search?search=The+40-Year-Old+Virgin+2005+film','https://www.themoviedb.org/search/movie?query=The+40-Year-Old+Virgin+2005','https://en.wikipedia.org/wiki/Special:Search?search=The+40-Year-Old+Virgin+2005+film','movie:virgin_40','franchise:virgin_40','plot_match:movie:virgin_40','plot:movie:virgin_40',null,ARRAY['movie:virgin_40']::text[],ARRAY['plot:movie:virgin_40']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Traumatizovaný pilot se vrací do služby a účastní se absurdní vojenské mise.","correct":false},{"text":"Plachý prodavač elektroniky se s pomocí kolegů pokouší navázat první skutečný vztah.","correct":true},{"text":"Sebevědomý televizní moderátor musí přijmout talentovanou reportérku v době, kdy zpravodajství ovládají muži.","correct":false},{"text":"Kazašský reportér cestuje po Spojených státech a svými rozhovory odhaluje předsudky i vlastní neznalost.","correct":false}]'::jsonb),
('comedy_cz_easy_v2_plot_match_008','classic','comedy',1,'plot_match','Film a děj','2000s',ARRAY['comedy','czech-audience','easy','plot-match','variety-v2']::text[],'Který z těchto dějů patří ke komedii Ricky Bobby: Nejrychlejší jezdec?','Talladega Nights: The Ballad of Ricky Bobby',2006,'Ke komedii Ricky Bobby: Nejrychlejší jezdec patří tento děj: Narcistický závodník NASCAR začne pochybovat o sobě, když ho porazí francouzský soupeř.','https://en.wikipedia.org/wiki/Special:Search?search=Talladega+Nights%3A+The+Ballad+of+Ricky+Bobby+2006+film','https://www.themoviedb.org/search/movie?query=Talladega+Nights%3A+The+Ballad+of+Ricky+Bobby+2006','https://en.wikipedia.org/wiki/Special:Search?search=Talladega+Nights%3A+The+Ballad+of+Ricky+Bobby+2006+film','movie:talladega','franchise:talladega','plot_match:movie:talladega','plot:movie:talladega',null,ARRAY['movie:talladega']::text[],ARRAY['plot:movie:talladega']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Narcistický závodník NASCAR začne pochybovat o sobě, když ho porazí francouzský soupeř.","correct":true},{"text":"Naivní mužský model je tajně naprogramován k atentátu během módní přehlídky.","correct":false},{"text":"Město přijme na policejní akademii každého zájemce a skupina naprostých outsiderů se pokouší dokončit výcvik.","correct":false},{"text":"Doktor Zloduch cestuje časem a ukradne Austinu Powersovi jeho životní energii zvanou mojo.","correct":false}]'::jsonb),
('comedy_cz_easy_v2_plot_match_009','classic','comedy',1,'plot_match','Film a děj','2000s',ARRAY['comedy','czech-audience','easy','plot-match','variety-v2']::text[],'Který z těchto dějů patří ke komedii Borat: Nakoukání do amerycké kultury na obědnávku slavnoj kazašskoj národu?','Borat',2006,'Ke komedii Borat: Nakoukání do amerycké kultury na obědnávku slavnoj kazašskoj národu patří tento děj: Kazašský reportér cestuje po Spojených státech a svými rozhovory odhaluje předsudky i vlastní neznalost.','https://en.wikipedia.org/wiki/Special:Search?search=Borat+2006+film','https://www.themoviedb.org/search/movie?query=Borat+2006','https://en.wikipedia.org/wiki/Special:Search?search=Borat+2006+film','movie:borat','franchise:borat','plot_match:movie:borat','plot:movie:borat',null,ARRAY['movie:borat']::text[],ARRAY['plot:movie:borat']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Rozmazlený diktátor přijede do New Yorku, přijde o moc a poprvé se musí vydávat za obyčejného člověka.","correct":false},{"text":"Skupinu teenagerů pronásleduje maskovaný vrah v parodii na známé horory devadesátých let.","correct":false},{"text":"Dva bohatí bratři prohodí život úspěšného makléře s pouličním podvodníkem kvůli sázce.","correct":false},{"text":"Kazašský reportér cestuje po Spojených státech a svými rozhovory odhaluje předsudky i vlastní neznalost.","correct":true}]'::jsonb),
('comedy_cz_easy_v2_plot_match_010','classic','comedy',1,'plot_match','Film a děj','1980s',ARRAY['comedy','czech-audience','easy','plot-match','variety-v2']::text[],'Který z těchto dějů patří ke komedii Bláznivá střela?','The Naked Gun: From the Files of Police Squad!',1988,'Ke komedii Bláznivá střela patří tento děj: Nešikovný detektiv se snaží zabránit atentátu na britskou královnu během baseballového zápasu.','https://en.wikipedia.org/wiki/Special:Search?search=The+Naked+Gun%3A+From+the+Files+of+Police+Squad%21+1988+film','https://www.themoviedb.org/search/movie?query=The+Naked+Gun%3A+From+the+Files+of+Police+Squad%21+1988','https://en.wikipedia.org/wiki/Special:Search?search=The+Naked+Gun%3A+From+the+Files+of+Police+Squad%21+1988+film','movie:naked_gun','franchise:naked_gun','plot_match:movie:naked_gun','plot:movie:naked_gun',null,ARRAY['movie:naked_gun']::text[],ARRAY['plot:movie:naked_gun']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Detroitský policista přijíždí do Beverly Hills vyšetřit vraždu přítele a naráží na místní pravidla.","correct":false},{"text":"Zpěvačka svědčící proti gangsterovi se ukryje v klášteře a promění místní sbor.","correct":false},{"text":"Nešikovný detektiv se snaží zabránit atentátu na britskou královnu během baseballového zápasu.","correct":true},{"text":"Bývalý pilot musí převzít řízení dopravního letadla, když posádku i cestující postihne otrava jídlem.","correct":false}]'::jsonb),
('comedy_cz_easy_v2_plot_match_011','classic','comedy',1,'plot_match','Film a děj','2000s',ARRAY['comedy','czech-audience','easy','plot-match','variety-v2']::text[],'Který z těchto dějů patří ke komedii Scary Movie: Děsnej biják?','Scary Movie',2000,'Ke komedii Scary Movie: Děsnej biják patří tento děj: Skupinu teenagerů pronásleduje maskovaný vrah v parodii na známé horory devadesátých let.','https://en.wikipedia.org/wiki/Special:Search?search=Scary+Movie+2000+film','https://www.themoviedb.org/search/movie?query=Scary+Movie+2000','https://en.wikipedia.org/wiki/Special:Search?search=Scary+Movie+2000+film','movie:scary_movie','franchise:scary_movie','plot_match:movie:scary_movie','plot:movie:scary_movie',null,ARRAY['movie:scary_movie']::text[],ARRAY['plot:movie:scary_movie']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Tvrdý policista se vydává za učitele v mateřské škole, aby našel syna hledaného zločince.","correct":false},{"text":"Skupinu teenagerů pronásleduje maskovaný vrah v parodii na známé horory devadesátých let.","correct":true},{"text":"Britský špion ze šedesátých let se probudí v současnosti a znovu čelí doktoru Zloduchovi.","correct":false},{"text":"Rozvedený otec se převlékne za starší hospodyni, aby mohl trávit více času se svými dětmi.","correct":false}]'::jsonb),
('comedy_cz_easy_v2_plot_match_012','classic','comedy',1,'plot_match','Film a děj','1980s',ARRAY['comedy','czech-audience','easy','plot-match','variety-v2']::text[],'Který z těchto dějů patří ke komedii Policajt v Beverly Hills?','Beverly Hills Cop',1984,'Ke komedii Policajt v Beverly Hills patří tento děj: Detroitský policista přijíždí do Beverly Hills vyšetřit vraždu přítele a naráží na místní pravidla.','https://en.wikipedia.org/wiki/Special:Search?search=Beverly+Hills+Cop+1984+film','https://www.themoviedb.org/search/movie?query=Beverly+Hills+Cop+1984','https://en.wikipedia.org/wiki/Special:Search?search=Beverly+Hills+Cop+1984+film','movie:beverly_hills_cop','franchise:beverly_hills_cop','plot_match:movie:beverly_hills_cop','plot:movie:beverly_hills_cop',null,ARRAY['movie:beverly_hills_cop']::text[],ARRAY['plot:movie:beverly_hills_cop']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Detroitský policista přijíždí do Beverly Hills vyšetřit vraždu přítele a naráží na místní pravidla.","correct":true},{"text":"Africký princ se přestěhuje do Queensu, aby si našel ženu, která ho nebude milovat jen kvůli titulu.","correct":false},{"text":"Bohatý ochrnutý muž zaměstná jako pečovatele mladíka z předměstí a vznikne nečekané přátelství.","correct":false},{"text":"Dvě sousední rodiny prožívají před invazí roku 1968 konflikty rodičů, první lásky i generační střety.","correct":false}]'::jsonb),
('comedy_cz_easy_v2_plot_match_013','classic','comedy',1,'plot_match','Film a děj','1980s',ARRAY['comedy','czech-audience','easy','plot-match','variety-v2']::text[],'Který z těchto dějů patří ke komedii Tootsie?','Tootsie',1982,'Ke komedii Tootsie patří tento děj: Nezaměstnatelný herec se převlékne za ženu a získá úspěšnou roli v televizním seriálu.','https://en.wikipedia.org/wiki/Special:Search?search=Tootsie+1982+film','https://www.themoviedb.org/search/movie?query=Tootsie+1982','https://en.wikipedia.org/wiki/Special:Search?search=Tootsie+1982+film','movie:tootsie','franchise:tootsie','plot_match:movie:tootsie','plot:movie:tootsie',null,ARRAY['movie:tootsie']::text[],ARRAY['plot:movie:tootsie']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Chlapci se splní přání stát se dospělým a musí si poradit s prací, vztahy i vlastním dětstvím.","correct":false},{"text":"Tři vědci založí v New Yorku firmu na chytání duchů a čelí nadpřirozené katastrofě.","correct":false},{"text":"Knihkupec začne v restauracích předstírat, že je číšník, a inkasuje účty od hostů.","correct":false},{"text":"Nezaměstnatelný herec se převlékne za ženu a získá úspěšnou roli v televizním seriálu.","correct":true}]'::jsonb),
('comedy_cz_easy_v2_plot_match_014','classic','comedy',1,'plot_match','Film a děj','2010s',ARRAY['comedy','czech-audience','easy','plot-match','variety-v2']::text[],'Který z těchto dějů patří ke komedii Nedotknutelní?','The Intouchables',2011,'Ke komedii Nedotknutelní patří tento děj: Bohatý ochrnutý muž zaměstná jako pečovatele mladíka z předměstí a vznikne nečekané přátelství.','https://en.wikipedia.org/wiki/Special:Search?search=The+Intouchables+2011+film','https://www.themoviedb.org/search/movie?query=The+Intouchables+2011','https://en.wikipedia.org/wiki/Special:Search?search=The+Intouchables+2011+film','movie:intouchables','franchise:intouchables','plot_match:movie:intouchables','plot:movie:intouchables',null,ARRAY['movie:intouchables']::text[],ARRAY['plot:movie:intouchables']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Tři otcové vezmou děti na zimní dovolenou bez manželek a jejich plán klidu se rychle rozpadne.","correct":false},{"text":"Dvanáct rodin se pokouší uskutečnit složitou řetězovou výměnu bytů během jediné noci.","correct":false},{"text":"Bohatý ochrnutý muž zaměstná jako pečovatele mladíka z předměstí a vznikne nečekané přátelství.","correct":true},{"text":"Naivní muž zjistí, že má naprosto odlišného dvojčete, a vydá se ho hledat.","correct":false}]'::jsonb),
('comedy_cz_easy_v2_plot_match_015','classic','comedy',1,'plot_match','Film a děj','1980s',ARRAY['comedy','czech-audience','easy','plot-match','variety-v2']::text[],'Který z těchto dějů patří ke komedii Krotitelé duchů?','Ghostbusters',1984,'Ke komedii Krotitelé duchů patří tento děj: Tři vědci založí v New Yorku firmu na chytání duchů a čelí nadpřirozené katastrofě.','https://en.wikipedia.org/wiki/Special:Search?search=Ghostbusters+1984+film','https://www.themoviedb.org/search/movie?query=Ghostbusters+1984','https://en.wikipedia.org/wiki/Special:Search?search=Ghostbusters+1984+film','movie:ghostbusters','franchise:ghostbusters','plot_match:movie:ghostbusters','plot:movie:ghostbusters',null,ARRAY['movie:ghostbusters']::text[],ARRAY['plot:movie:ghostbusters']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Sochař zakázaný režimem a jeho okolí prožívají osmdesátá léta mezi kompromisy, rodinou a malými vzpourami.","correct":false},{"text":"Tři vědci založí v New Yorku firmu na chytání duchů a čelí nadpřirozené katastrofě.","correct":true},{"text":"Arogantní televizní meteorolog se probouzí stále do stejného dne v malém městě.","correct":false},{"text":"Dělník se vrací do večerní školy, kde musí zvládnout studium i vlastní sebevědomí.","correct":false}]'::jsonb),
('comedy_cz_easy_v2_plot_match_016','classic','comedy',1,'plot_match','Film a děj','1980s',ARRAY['comedy','czech-audience','easy','plot-match','variety-v2']::text[],'Který z těchto dějů patří ke komedii S tebou mě baví svět?','S tebou mě baví svět',1982,'Ke komedii S tebou mě baví svět patří tento děj: Tři otcové vezmou děti na zimní dovolenou bez manželek a jejich plán klidu se rychle rozpadne.','https://cs.wikipedia.org/wiki/Special:Search?search=S+tebou+m%C4%9B+bav%C3%AD+sv%C4%9Bt+1982+film','https://www.themoviedb.org/search/movie?query=S+tebou+m%C4%9B+bav%C3%AD+sv%C4%9Bt+1982','https://cs.wikipedia.org/wiki/Special:Search?search=S+tebou+m%C4%9B+bav%C3%AD+sv%C4%9Bt+1982+film','movie:s_tebou','franchise:s_tebou','plot_match:movie:s_tebou','plot:movie:s_tebou',null,ARRAY['movie:s_tebou']::text[],ARRAY['plot:movie:s_tebou']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Tři otcové vezmou děti na zimní dovolenou bez manželek a jejich plán klidu se rychle rozpadne.","correct":true},{"text":"Student přijíždí do jihočeské vesnice zkoumat moderní zemědělské postupy a zaplete se do místních vztahů.","correct":false},{"text":"Pražská rodina si pronajme venkovskou chalupu a snaží se přesvědčit starého majitele, aby se odstěhoval.","correct":false},{"text":"Dva kamarádi vyrážejí na vodu, kde se snaží uniknout rodičům a zapůsobit na dívky.","correct":false}]'::jsonb),
('comedy_cz_easy_v2_plot_match_017','classic','comedy',1,'plot_match','Film a děj','1970s',ARRAY['comedy','czech-audience','easy','plot-match','variety-v2']::text[],'Který z těchto dějů patří ke komedii Marečku, podejte mi pero!?','Marečku, podejte mi pero!',1976,'Ke komedii Marečku, podejte mi pero! patří tento děj: Dělník se vrací do večerní školy, kde musí zvládnout studium i vlastní sebevědomí.','https://cs.wikipedia.org/wiki/Special:Search?search=Mare%C4%8Dku%2C+podejte+mi+pero%21+1976+film','https://www.themoviedb.org/search/movie?query=Mare%C4%8Dku%2C+podejte+mi+pero%21+1976','https://cs.wikipedia.org/wiki/Special:Search?search=Mare%C4%8Dku%2C+podejte+mi+pero%21+1976+film','movie:marecku','franchise:marecku','plot_match:movie:marecku','plot:movie:marecku',null,ARRAY['movie:marecku']::text[],ARRAY['plot:movie:marecku']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Nesmělý mechanik začne řídit život podle počítačově vypočítaných šťastných a nešťastných dnů.","correct":false},{"text":"Učitel v důchodu hledá novou životní náplň a začne pracovat u výkupu lahví v supermarketu.","correct":false},{"text":"Chlapec nastoupí do špatného letadla, ocitne se sám v New Yorku a znovu narazí na známé zloděje.","correct":false},{"text":"Dělník se vrací do večerní školy, kde musí zvládnout studium i vlastní sebevědomí.","correct":true}]'::jsonb),
('comedy_cz_easy_v2_plot_match_018','classic','comedy',1,'plot_match','Film a děj','1980s',ARRAY['comedy','czech-audience','easy','plot-match','variety-v2']::text[],'Který z těchto dějů patří ke komedii Vesničko má středisková?','Vesničko má středisková',1985,'Ke komedii Vesničko má středisková patří tento děj: Dobrosrdečný řidič nákladního auta se snaží vycházet se svým prostoduchým závozníkem v malé vesnici.','https://cs.wikipedia.org/wiki/Special:Search?search=Vesni%C4%8Dko+m%C3%A1+st%C5%99ediskov%C3%A1+1985+film','https://www.themoviedb.org/search/movie?query=Vesni%C4%8Dko+m%C3%A1+st%C5%99ediskov%C3%A1+1985','https://cs.wikipedia.org/wiki/Special:Search?search=Vesni%C4%8Dko+m%C3%A1+st%C5%99ediskov%C3%A1+1985+film','movie:vesnicko','franchise:vesnicko','plot_match:movie:vesnicko','plot:movie:vesnicko',null,ARRAY['movie:vesnicko']::text[],ARRAY['plot:movie:vesnicko']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Usedlý manžel začne následovat radu svého tchána, že nevěra může zachránit manželství.","correct":false},{"text":"Zvířecí detektiv cestuje do Afriky, aby našel posvátného netopýra a zabránil válce mezi kmeny.","correct":false},{"text":"Dobrosrdečný řidič nákladního auta se snaží vycházet se svým prostoduchým závozníkem v malé vesnici.","correct":true},{"text":"Venkovský samotář nečekaně zdědí velký majetek a začne si užívat života, na který není připraven.","correct":false}]'::jsonb),
('comedy_cz_easy_v2_plot_match_019','classic','comedy',1,'plot_match','Film a děj','2000s',ARRAY['comedy','czech-audience','easy','plot-match','variety-v2']::text[],'Který z těchto dějů patří ke komedii Vratné lahve?','Vratné lahve',2007,'Ke komedii Vratné lahve patří tento děj: Učitel v důchodu hledá novou životní náplň a začne pracovat u výkupu lahví v supermarketu.','https://cs.wikipedia.org/wiki/Special:Search?search=Vratn%C3%A9+lahve+2007+film','https://www.themoviedb.org/search/movie?query=Vratn%C3%A9+lahve+2007','https://cs.wikipedia.org/wiki/Special:Search?search=Vratn%C3%A9+lahve+2007+film','movie:vratne_lahve','franchise:vratne_lahve','plot_match:movie:vratne_lahve','plot:movie:vratne_lahve',null,ARRAY['movie:vratne_lahve']::text[],ARRAY['plot:movie:vratne_lahve']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Uzavřený muž se zaváže říkat ano každé příležitosti a jeho život se začne rychle měnit.","correct":false},{"text":"Učitel v důchodu hledá novou životní náplň a začne pracovat u výkupu lahví v supermarketu.","correct":true},{"text":"Dva kamarádi jedou na hory za snowboardingem a dívkami, ale většina jejich plánů končí trapasem.","correct":false},{"text":"Dva nepříliš chytří přátelé cestují napříč Amerikou, aby vrátili kufřík ženě, do níž se jeden z nich zamiloval.","correct":false}]'::jsonb),
('comedy_cz_easy_v2_plot_match_020','classic','comedy',1,'plot_match','Film a děj','2010s',ARRAY['comedy','czech-audience','easy','plot-match','variety-v2']::text[],'Který z těchto dějů patří ke komedii Muži v naději?','Muži v naději',2011,'Ke komedii Muži v naději patří tento děj: Usedlý manžel začne následovat radu svého tchána, že nevěra může zachránit manželství.','https://cs.wikipedia.org/wiki/Special:Search?search=Mu%C5%BEi+v+nad%C4%9Bji+2011+film','https://www.themoviedb.org/search/movie?query=Mu%C5%BEi+v+nad%C4%9Bji+2011','https://cs.wikipedia.org/wiki/Special:Search?search=Mu%C5%BEi+v+nad%C4%9Bji+2011+film','movie:muzi_nadeji','franchise:muzi_nadeji','plot_match:movie:muzi_nadeji','plot:movie:muzi_nadeji',null,ARRAY['movie:muzi_nadeji']::text[],ARRAY['plot:movie:muzi_nadeji']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Usedlý manžel začne následovat radu svého tchána, že nevěra může zachránit manželství.","correct":true},{"text":"Chlapec zůstane omylem přes Vánoce sám doma a chrání dům před dvojicí nešikovných zlodějů.","correct":false},{"text":"Nespokojený televizní reportér dostane na týden božské schopnosti a zjišťuje, že řídit svět není jednoduché.","correct":false},{"text":"Agent se vrací do služby a snaží se odhalit spiknutí připravující atentát na čínského premiéra.","correct":false}]'::jsonb),
('comedy_cz_easy_v2_character_pair_001','classic','comedy',1,'character_pair','Správná dvojice','1990s',ARRAY['comedy','czech-audience','easy','character-pair','variety-v2']::text[],'Která dvojice postavy a komedie je správně?','Home Alone 2: Lost in New York',1992,'Správně je Kevin McCallister — Sám doma 2: Ztracen v New Yorku.','https://en.wikipedia.org/wiki/Special:Search?search=Home+Alone+2%3A+Lost+in+New+York+1992+film','https://www.themoviedb.org/search/movie?query=Home+Alone+2%3A+Lost+in+New+York+1992','https://en.wikipedia.org/wiki/Special:Search?search=Home+Alone+2%3A+Lost+in+New+York+1992+film','movie:home_alone_2','franchise:home_alone','character_pair:movie:home_alone_2:kevin_mccallister','pair:movie:home_alone_2:kevin_mccallister',null,ARRAY['question_type:character_pair']::text[],ARRAY['movie:home_alone_2','character:home_alone_2:kevin_mccallister']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Fletcher Reede — Ženy sobě","correct":false},{"text":"Carl Allen — Superbad","correct":false},{"text":"Kevin McCallister — Sám doma 2: Ztracen v New Yorku","correct":true},{"text":"Bruce Nolan — Něco na té Mary je","correct":false}]'::jsonb),
('comedy_cz_easy_v2_character_pair_002','classic','comedy',1,'character_pair','Správná dvojice','1990s',ARRAY['comedy','czech-audience','easy','character-pair','variety-v2']::text[],'Která dvojice postavy a komedie je správně?','Ace Ventura: When Nature Calls',1995,'Správně je Ace Ventura — Ace Ventura 2: Volání divočiny.','https://en.wikipedia.org/wiki/Special:Search?search=Ace+Ventura%3A+When+Nature+Calls+1995+film','https://www.themoviedb.org/search/movie?query=Ace+Ventura%3A+When+Nature+Calls+1995','https://en.wikipedia.org/wiki/Special:Search?search=Ace+Ventura%3A+When+Nature+Calls+1995+film','movie:ace_ventura_2','franchise:ace_ventura','character_pair:movie:ace_ventura_2:ace_ventura','pair:movie:ace_ventura_2:ace_ventura',null,ARRAY['question_type:character_pair']::text[],ARRAY['movie:ace_ventura_2','character:ace_ventura_2:ace_ventura']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Alan Garner — Policejní akademie","correct":false},{"text":"Ace Ventura — Ace Ventura 2: Volání divočiny","correct":true},{"text":"Johnny English — Diktátor","correct":false},{"text":"Johnny English — Méďa","correct":false}]'::jsonb),
('comedy_cz_easy_v2_character_pair_003','classic','comedy',1,'character_pair','Správná dvojice','2000s',ARRAY['comedy','czech-audience','easy','character-pair','variety-v2']::text[],'Která dvojice postavy a komedie je správně?','Yes Man',2008,'Správně je Carl Allen — Yes Man.','https://en.wikipedia.org/wiki/Special:Search?search=Yes+Man+2008+film','https://www.themoviedb.org/search/movie?query=Yes+Man+2008','https://en.wikipedia.org/wiki/Special:Search?search=Yes+Man+2008+film','movie:yes_man','franchise:yes_man','character_pair:movie:yes_man:carl_allen','pair:movie:yes_man:carl_allen',null,ARRAY['question_type:character_pair']::text[],ARRAY['movie:yes_man','character:yes_man:carl_allen']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Carl Allen — Yes Man","correct":true},{"text":"Jim Levenstein — Cesta do Ameriky","correct":false},{"text":"Greg Focker — Záměna","correct":false},{"text":"Jack Byrnes — Táta v sukni","correct":false}]'::jsonb),
('comedy_cz_easy_v2_character_pair_004','classic','comedy',1,'character_pair','Správná dvojice','2010s',ARRAY['comedy','czech-audience','easy','character-pair','variety-v2']::text[],'Která dvojice postavy a komedie je správně?','Johnny English Reborn',2011,'Správně je Johnny English — Johnny English se vrací.','https://en.wikipedia.org/wiki/Special:Search?search=Johnny+English+Reborn+2011+film','https://www.themoviedb.org/search/movie?query=Johnny+English+Reborn+2011','https://en.wikipedia.org/wiki/Special:Search?search=Johnny+English+Reborn+2011+film','movie:johnny_english_reborn','franchise:johnny_english','character_pair:movie:johnny_english_reborn:johnny_english','pair:movie:johnny_english_reborn:johnny_english',null,ARRAY['question_type:character_pair']::text[],ARRAY['movie:johnny_english_reborn','character:johnny_english_reborn:johnny_english']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Seth — Na Hromnice o den více","correct":false},{"text":"Andy Stitzer — Pelíšky","correct":false},{"text":"Ron Burgundy — S tebou mě baví svět","correct":false},{"text":"Johnny English — Johnny English se vrací","correct":true}]'::jsonb),
('comedy_cz_easy_v2_character_pair_005','classic','comedy',1,'character_pair','Správná dvojice','2010s',ARRAY['comedy','czech-audience','easy','character-pair','variety-v2']::text[],'Která dvojice postavy a komedie je správně?','The Hangover Part II',2011,'Správně je Alan Garner — Pařba v Bangkoku.','https://en.wikipedia.org/wiki/Special:Search?search=The+Hangover+Part+II+2011+film','https://www.themoviedb.org/search/movie?query=The+Hangover+Part+II+2011','https://en.wikipedia.org/wiki/Special:Search?search=The+Hangover+Part+II+2011+film','movie:hangover_2','franchise:hangover','character_pair:movie:hangover_2:alan_garner','pair:movie:hangover_2:alan_garner',null,ARRAY['question_type:character_pair']::text[],ARRAY['movie:hangover_2','character:hangover_2:alan_garner']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Peter LaFleur — Pupendo","correct":false},{"text":"Tugg Speedman — Vratné lahve","correct":false},{"text":"Alan Garner — Pařba v Bangkoku","correct":true},{"text":"Derek Zoolander — Dědictví aneb Kurvahošigutntag","correct":false}]'::jsonb),
('comedy_cz_easy_v2_character_pair_006','classic','comedy',1,'character_pair','Správná dvojice','1990s',ARRAY['comedy','czech-audience','easy','character-pair','variety-v2']::text[],'Která dvojice postavy a komedie je správně?','There''s Something About Mary',1998,'Správně je Mary Jensenová — Něco na té Mary je.','https://en.wikipedia.org/wiki/Special:Search?search=There%27s+Something+About+Mary+1998+film','https://www.themoviedb.org/search/movie?query=There%27s+Something+About+Mary+1998','https://en.wikipedia.org/wiki/Special:Search?search=There%27s+Something+About+Mary+1998+film','movie:mary','franchise:mary','character_pair:movie:mary:mary_jensenov','pair:movie:mary:mary_jensenov',null,ARRAY['question_type:character_pair']::text[],ARRAY['movie:mary','character:mary:mary_jensenova']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Frank Drebin — Božský Bruce","correct":false},{"text":"Mary Jensenová — Něco na té Mary je","correct":true},{"text":"John Bennett — Ace Ventura: Zvířecí detektiv","correct":false},{"text":"Carey Mahoney — Ace Ventura 2: Volání divočiny","correct":false}]'::jsonb),
('comedy_cz_easy_v2_character_pair_007','classic','comedy',1,'character_pair','Správná dvojice','2000s',ARRAY['comedy','czech-audience','easy','character-pair','variety-v2']::text[],'Která dvojice postavy a komedie je správně?','Superbad',2007,'Správně je Seth — Superbad.','https://en.wikipedia.org/wiki/Special:Search?search=Superbad+2007+film','https://www.themoviedb.org/search/movie?query=Superbad+2007','https://en.wikipedia.org/wiki/Special:Search?search=Superbad+2007+film','movie:superbad','franchise:superbad','character_pair:movie:superbad:seth','pair:movie:superbad:seth',null,ARRAY['question_type:character_pair']::text[],ARRAY['movie:superbad','character:superbad:seth']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Seth — Superbad","correct":true},{"text":"Cindy Campbellová — Prci, prci, prcičky","correct":false},{"text":"Austin Powers — Prci, prci, prcičky 2","correct":false},{"text":"Austin Powers — Fotr je lotr","correct":false}]'::jsonb),
('comedy_cz_easy_v2_character_pair_008','classic','comedy',1,'character_pair','Správná dvojice','2000s',ARRAY['comedy','czech-audience','easy','character-pair','variety-v2']::text[],'Která dvojice postavy a komedie je správně?','Zoolander',2001,'Správně je Derek Zoolander — Zoolander.','https://en.wikipedia.org/wiki/Special:Search?search=Zoolander+2001+film','https://www.themoviedb.org/search/movie?query=Zoolander+2001','https://en.wikipedia.org/wiki/Special:Search?search=Zoolander+2001+film','movie:zoolander','franchise:zoolander','character_pair:movie:zoolander:derek_zoolander','pair:movie:zoolander:derek_zoolander',null,ARRAY['question_type:character_pair']::text[],ARRAY['movie:zoolander','character:zoolander:derek_zoolander']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"princ Akeem — Vybíjená: Běž do toho na plný koule","correct":false},{"text":"Louis Winthorpe III — Tropická bouře","correct":false},{"text":"Daniel Hillard — Borat: Nakoukání do amerycké kultury na obědnávku slavnoj kazašskoj národu","correct":false},{"text":"Derek Zoolander — Zoolander","correct":true}]'::jsonb),
('comedy_cz_easy_v2_character_pair_009','classic','comedy',1,'character_pair','Správná dvojice','2010s',ARRAY['comedy','czech-audience','easy','character-pair','variety-v2']::text[],'Která dvojice postavy a komedie je správně?','The Dictator',2012,'Správně je generál Aladeen — Diktátor.','https://en.wikipedia.org/wiki/Special:Search?search=The+Dictator+2012+film','https://www.themoviedb.org/search/movie?query=The+Dictator+2012','https://en.wikipedia.org/wiki/Special:Search?search=The+Dictator+2012+film','movie:dictator','franchise:dictator','character_pair:movie:dictator:gener_l_aladeen','pair:movie:dictator:gener_l_aladeen',null,ARRAY['question_type:character_pair']::text[],ARRAY['movie:dictator','character:dictator:general_aladeen']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Driss — Křižovatka smrti","correct":false},{"text":"Julius Benedict — Policajt v Beverly Hills","correct":false},{"text":"generál Aladeen — Diktátor","correct":true},{"text":"Deloris Van Cartier — Austin Powers: Špion, který mě vojel","correct":false}]'::jsonb),
('comedy_cz_easy_v2_character_pair_010','classic','comedy',1,'character_pair','Správná dvojice','1980s',ARRAY['comedy','czech-audience','easy','character-pair','variety-v2']::text[],'Která dvojice postavy a komedie je správně?','Police Academy',1984,'Správně je Carey Mahoney — Policejní akademie.','https://en.wikipedia.org/wiki/Special:Search?search=Police+Academy+1984+film','https://www.themoviedb.org/search/movie?query=Police+Academy+1984','https://en.wikipedia.org/wiki/Special:Search?search=Police+Academy+1984+film','movie:police_academy','franchise:police_academy','character_pair:movie:police_academy:carey_mahoney','pair:movie:police_academy:carey_mahoney',null,ARRAY['question_type:character_pair']::text[],ARRAY['movie:police_academy','character:police_academy:carey_mahoney']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Michal Šebek — Krotitelé duchů","correct":false},{"text":"Carey Mahoney — Policejní akademie","correct":true},{"text":"Peter Venkman — Policajt ze školky","correct":false},{"text":"Phil Connors — Do naha!","correct":false}]'::jsonb),
('comedy_cz_easy_v2_character_pair_011','classic','comedy',1,'character_pair','Správná dvojice','1990s',ARRAY['comedy','czech-audience','easy','character-pair','variety-v2']::text[],'Která dvojice postavy a komedie je správně?','Austin Powers: International Man of Mystery',1997,'Správně je Austin Powers — Austin Powers: Špionátor.','https://en.wikipedia.org/wiki/Special:Search?search=Austin+Powers%3A+International+Man+of+Mystery+1997+film','https://www.themoviedb.org/search/movie?query=Austin+Powers%3A+International+Man+of+Mystery+1997','https://en.wikipedia.org/wiki/Special:Search?search=Austin+Powers%3A+International+Man+of+Mystery+1997+film','movie:austin_powers','franchise:austin_powers','character_pair:movie:austin_powers:austin_powers','pair:movie:austin_powers:austin_powers',null,ARRAY['question_type:character_pair']::text[],ARRAY['movie:austin_powers','character:austin_powers:austin_powers']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Austin Powers — Austin Powers: Špionátor","correct":true},{"text":"Kelišová — Kulový blesk","correct":false},{"text":"Dalibor Vrána — Na samotě u lesa","correct":false},{"text":"Jiří Kroupa — Vesničko má středisková","correct":false}]'::jsonb),
('comedy_cz_easy_v2_character_pair_012','classic','comedy',1,'character_pair','Správná dvojice','1990s',ARRAY['comedy','czech-audience','easy','character-pair','variety-v2']::text[],'Která dvojice postavy a komedie je správně?','Rush Hour',1998,'Správně je James Carter — Křižovatka smrti.','https://en.wikipedia.org/wiki/Special:Search?search=Rush+Hour+1998+film','https://www.themoviedb.org/search/movie?query=Rush+Hour+1998','https://en.wikipedia.org/wiki/Special:Search?search=Rush+Hour+1998+film','movie:rush_hour','franchise:rush_hour','character_pair:movie:rush_hour:james_carter','pair:movie:rush_hour:james_carter',null,ARRAY['question_type:character_pair']::text[],ARRAY['movie:rush_hour','character:rush_hour:james_carter']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Oldřich Lavička — Sám doma 2: Ztracen v New Yorku","correct":false},{"text":"Otík Rákosník — Blbý a blbější","correct":false},{"text":"Bohuš Stejskal — Maska","correct":false},{"text":"James Carter — Křižovatka smrti","correct":true}]'::jsonb),
('comedy_cz_easy_v2_character_pair_013','classic','comedy',1,'character_pair','Správná dvojice','1990s',ARRAY['comedy','czech-audience','easy','character-pair','variety-v2']::text[],'Která dvojice postavy a komedie je správně?','Mrs. Doubtfire',1993,'Správně je Daniel Hillard — Táta v sukni.','https://en.wikipedia.org/wiki/Special:Search?search=Mrs.+Doubtfire+1993+film','https://www.themoviedb.org/search/movie?query=Mrs.+Doubtfire+1993','https://en.wikipedia.org/wiki/Special:Search?search=Mrs.+Doubtfire+1993+film','movie:mrs_doubtfire','franchise:mrs_doubtfire','character_pair:movie:mrs_doubtfire:daniel_hillard','pair:movie:mrs_doubtfire:daniel_hillard',null,ARRAY['question_type:character_pair']::text[],ARRAY['movie:mrs_doubtfire','character:mrs_doubtfire:daniel_hillard']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Dany — Pařba ve Vegas","correct":false},{"text":"Helena — Pařba v Bangkoku","correct":false},{"text":"Daniel Hillard — Táta v sukni","correct":true},{"text":"Jáchym — Johnny English se vrací","correct":false}]'::jsonb),
('comedy_cz_easy_v2_character_pair_014','classic','comedy',1,'character_pair','Správná dvojice','1980s',ARRAY['comedy','czech-audience','easy','character-pair','variety-v2']::text[],'Která dvojice postavy a komedie je správně?','Twins',1988,'Správně je Julius Benedict — Dvojčata.','https://en.wikipedia.org/wiki/Special:Search?search=Twins+1988+film','https://www.themoviedb.org/search/movie?query=Twins+1988','https://en.wikipedia.org/wiki/Special:Search?search=Twins+1988+film','movie:twins','franchise:twins','character_pair:movie:twins:julius_benedict','pair:movie:twins:julius_benedict',null,ARRAY['question_type:character_pair']::text[],ARRAY['movie:twins','character:twins:julius_benedict']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Stanley Ipkiss — Ricky Bobby: Nejrychlejší jezdec","correct":false},{"text":"Julius Benedict — Dvojčata","correct":true},{"text":"Kevin McCallister — Zprávař: Příběh Rona Burgundyho","correct":false},{"text":"Lloyd Christmas — Bratři z donucení","correct":false}]'::jsonb),
('comedy_cz_easy_v2_character_pair_015','classic','comedy',1,'character_pair','Správná dvojice','1990s',ARRAY['comedy','czech-audience','easy','character-pair','variety-v2']::text[],'Která dvojice postavy a komedie je správně?','The Full Monty',1997,'Správně je Gaz — Do naha!.','https://en.wikipedia.org/wiki/Special:Search?search=The+Full+Monty+1997+film','https://www.themoviedb.org/search/movie?query=The+Full+Monty+1997','https://en.wikipedia.org/wiki/Special:Search?search=The+Full+Monty+1997+film','movie:full_monty','franchise:full_monty','character_pair:movie:full_monty:gaz','pair:movie:full_monty:gaz',null,ARRAY['question_type:character_pair']::text[],ARRAY['movie:full_monty','character:full_monty:gaz']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Gaz — Do naha!","correct":true},{"text":"Bruce Nolan — Připoutejte se, prosím!","correct":false},{"text":"Fletcher Reede — Žhavé výstřely","correct":false},{"text":"Carl Allen — Scary Movie: Děsnej biják","correct":false}]'::jsonb),
('comedy_cz_easy_v2_character_pair_016','classic','comedy',1,'character_pair','Správná dvojice','1980s',ARRAY['comedy','czech-audience','easy','character-pair','variety-v2']::text[],'Která dvojice postavy a komedie je správně?','Slunce, seno, jahody',1983,'Správně je Blažena Škopková — Slunce, seno, jahody.','https://cs.wikipedia.org/wiki/Special:Search?search=Slunce%2C+seno%2C+jahody+1983+film','https://www.themoviedb.org/search/movie?query=Slunce%2C+seno%2C+jahody+1983','https://cs.wikipedia.org/wiki/Special:Search?search=Slunce%2C+seno%2C+jahody+1983+film','movie:slunce_seno_jahody','franchise:slunce_seno','character_pair:movie:slunce_seno_jahody:bla_ena_kopkov','pair:movie:slunce_seno_jahody:bla_ena_kopkov',null,ARRAY['question_type:character_pair']::text[],ARRAY['movie:slunce_seno_jahody','character:slunce_seno_jahody:blazena_skopkova']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Johnny English — Velký","correct":false},{"text":"Johnny English — Sestra v akci","correct":false},{"text":"Alan Garner — Nedotknutelní","correct":false},{"text":"Blažena Škopková — Slunce, seno, jahody","correct":true}]'::jsonb),
('comedy_cz_easy_v2_character_pair_017','classic','comedy',1,'character_pair','Správná dvojice','1980s',ARRAY['comedy','czech-audience','easy','character-pair','variety-v2']::text[],'Která dvojice postavy a komedie je správně?','Vrchní, prchni!',1980,'Správně je Dalibor Vrána — Vrchní, prchni!.','https://cs.wikipedia.org/wiki/Special:Search?search=Vrchn%C3%AD%2C+prchni%21+1980+film','https://www.themoviedb.org/search/movie?query=Vrchn%C3%AD%2C+prchni%21+1980','https://cs.wikipedia.org/wiki/Special:Search?search=Vrchn%C3%AD%2C+prchni%21+1980+film','movie:vrchni_prchni','franchise:vrchni_prchni','character_pair:movie:vrchni_prchni:dalibor_vr_na','pair:movie:vrchni_prchni:dalibor_vr_na',null,ARRAY['question_type:character_pair']::text[],ARRAY['movie:vrchni_prchni','character:vrchni_prchni:dalibor_vrana']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Greg Focker — Marečku, podejte mi pero!","correct":false},{"text":"Jack Byrnes — Jáchyme, hoď ho do stroje!","correct":false},{"text":"Dalibor Vrána — Vrchní, prchni!","correct":true},{"text":"Jim Levenstein — Slunce, seno a pár facek","correct":false}]'::jsonb),
('comedy_cz_easy_v2_character_pair_018','classic','comedy',1,'character_pair','Správná dvojice','1970s',ARRAY['comedy','czech-audience','easy','character-pair','variety-v2']::text[],'Která dvojice postavy a komedie je správně?','Na samotě u lesa',1976,'Správně je Oldřich Lavička — Na samotě u lesa.','https://cs.wikipedia.org/wiki/Special:Search?search=Na+samot%C4%9B+u+lesa+1976+film','https://www.themoviedb.org/search/movie?query=Na+samot%C4%9B+u+lesa+1976','https://cs.wikipedia.org/wiki/Special:Search?search=Na+samot%C4%9B+u+lesa+1976+film','movie:samota_lesa','franchise:samota_lesa','character_pair:movie:samota_lesa:old_ich_lavi_ka','pair:movie:samota_lesa:old_ich_lavi_ka',null,ARRAY['question_type:character_pair']::text[],ARRAY['movie:samota_lesa','character:samota_lesa:oldrich_lavicka']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Ron Burgundy — Sám doma","correct":false},{"text":"Oldřich Lavička — Na samotě u lesa","correct":true},{"text":"Seth — Ženy v pokušení","correct":false},{"text":"Andy Stitzer — Muži v naději","correct":false}]'::jsonb),
('comedy_cz_easy_v2_character_pair_019','classic','comedy',1,'character_pair','Správná dvojice','2000s',ARRAY['comedy','czech-audience','easy','character-pair','variety-v2']::text[],'Která dvojice postavy a komedie je správně?','Pupendo',2003,'Správně je Bedřich Mára — Pupendo.','https://cs.wikipedia.org/wiki/Special:Search?search=Pupendo+2003+film','https://www.themoviedb.org/search/movie?query=Pupendo+2003','https://cs.wikipedia.org/wiki/Special:Search?search=Pupendo+2003+film','movie:pupendo','franchise:pupendo','character_pair:movie:pupendo:bed_ich_m_ra','pair:movie:pupendo:bed_ich_m_ra',null,ARRAY['question_type:character_pair']::text[],ARRAY['movie:pupendo','character:pupendo:bedrich_mara']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"Bedřich Mára — Pupendo","correct":true},{"text":"Derek Zoolander — Prázdniny pana Beana","correct":false},{"text":"Peter LaFleur — Mr. Bean: Největší filmová katastrofa","correct":false},{"text":"Tugg Speedman — Johnny English","correct":false}]'::jsonb),
('comedy_cz_easy_v2_character_pair_020','classic','comedy',1,'character_pair','Správná dvojice','2010s',ARRAY['comedy','czech-audience','easy','character-pair','variety-v2']::text[],'Která dvojice postavy a komedie je správně?','Ženy v pokušení',2010,'Správně je Helena — Ženy v pokušení.','https://cs.wikipedia.org/wiki/Special:Search?search=%C5%BDeny+v+poku%C5%A1en%C3%AD+2010+film','https://www.themoviedb.org/search/movie?query=%C5%BDeny+v+poku%C5%A1en%C3%AD+2010','https://cs.wikipedia.org/wiki/Special:Search?search=%C5%BDeny+v+poku%C5%A1en%C3%AD+2010+film','movie:zeny_pokuseni','franchise:zeny_pokuseni','character_pair:movie:zeny_pokuseni:helena','pair:movie:zeny_pokuseni:helena',null,ARRAY['question_type:character_pair']::text[],ARRAY['movie:zeny_pokuseni','character:zeny_pokuseni:helena']::text[],1,true,'Lehká obtížnost pro české publikum: pestřejší formát otázky bez opakování stejné šablony.','comedy-cz-v1-1-variety','[{"text":"John Bennett — Ženy sobě","correct":false},{"text":"Carey Mahoney — Superbad","correct":false},{"text":"Frank Drebin — Čtyřicetiletý panic","correct":false},{"text":"Helena — Ženy v pokušení","correct":true}]'::jsonb);

update quiz_private.questions
set
  active = false,
  source_note = coalesce(source_note || ' ', '') ||
    'Deaktivováno v Movie Quiz 7.1 kvůli větší pestrosti lehkých komedií.',
  updated_at = now()
where external_id in (
    'comedy_cz_easy_005',
    'comedy_cz_easy_017',
    'comedy_cz_easy_026',
    'comedy_cz_easy_038',
    'comedy_cz_easy_050',
    'comedy_cz_easy_059',
    'comedy_cz_easy_071',
    'comedy_cz_easy_080',
    'comedy_cz_easy_092',
    'comedy_cz_easy_104',
    'comedy_cz_easy_113',
    'comedy_cz_easy_125',
    'comedy_cz_easy_137',
    'comedy_cz_easy_146',
    'comedy_cz_easy_158',
    'comedy_cz_easy_167',
    'comedy_cz_easy_179',
    'comedy_cz_easy_188',
    'comedy_cz_easy_194',
    'comedy_cz_easy_002',
    'comedy_cz_easy_009',
    'comedy_cz_easy_018',
    'comedy_cz_easy_027',
    'comedy_cz_easy_036',
    'comedy_cz_easy_045',
    'comedy_cz_easy_057',
    'comedy_cz_easy_066',
    'comedy_cz_easy_075',
    'comedy_cz_easy_084',
    'comedy_cz_easy_093',
    'comedy_cz_easy_102',
    'comedy_cz_easy_111',
    'comedy_cz_easy_120',
    'comedy_cz_easy_129',
    'comedy_cz_easy_138',
    'comedy_cz_easy_150',
    'comedy_cz_easy_159',
    'comedy_cz_easy_168',
    'comedy_cz_easy_177',
    'comedy_cz_easy_006'
);

insert into quiz_private.questions (
  external_id,
  game_mode,
  genre,
  difficulty,
  question_type,
  type_label,
  era_label,
  tags,
  prompt,
  movie_title,
  movie_year,
  explanation,
  language,
  active,
  review_status,
  source_url,
  secondary_source_url,
  genre_source_url,
  source_note,
  canonical_movie_key,
  franchise_key,
  relation_key,
  answer_key,
  primary_person_key,
  clue_keys,
  reveal_keys,
  cz_familiarity,
  genre_verified,
  cz_difficulty_note,
  question_bank_version,
  fact_checked_at,
  fact_checked_by
)
select
  imported.external_id,
  imported.game_mode,
  imported.genre,
  imported.difficulty,
  imported.question_type,
  imported.type_label,
  imported.era_label,
  imported.tags,
  imported.prompt,
  imported.movie_title,
  imported.movie_year,
  imported.explanation,
  'cs',
  true,
  'approved',
  imported.source_url,
  imported.secondary_source_url,
  imported.genre_source_url,
  'Odvozeno z již schválených dějových a postavových dat banky komedií v1.',
  imported.canonical_movie_key,
  imported.franchise_key,
  imported.relation_key,
  imported.answer_key,
  imported.primary_person_key,
  imported.clue_keys,
  imported.reveal_keys,
  imported.cz_familiarity,
  imported.genre_verified,
  imported.cz_difficulty_note,
  imported.question_bank_version,
  now(),
  'Movie Quiz 7.1 deterministic variety migration'
from tmp_comedy_easy_variety_v2 as imported
on conflict (external_id) do update
set
  game_mode = excluded.game_mode,
  genre = excluded.genre,
  difficulty = excluded.difficulty,
  question_type = excluded.question_type,
  type_label = excluded.type_label,
  era_label = excluded.era_label,
  tags = excluded.tags,
  prompt = excluded.prompt,
  movie_title = excluded.movie_title,
  movie_year = excluded.movie_year,
  explanation = excluded.explanation,
  language = excluded.language,
  active = excluded.active,
  review_status = excluded.review_status,
  source_url = excluded.source_url,
  secondary_source_url = excluded.secondary_source_url,
  genre_source_url = excluded.genre_source_url,
  source_note = excluded.source_note,
  canonical_movie_key = excluded.canonical_movie_key,
  franchise_key = excluded.franchise_key,
  relation_key = excluded.relation_key,
  answer_key = excluded.answer_key,
  primary_person_key = excluded.primary_person_key,
  clue_keys = excluded.clue_keys,
  reveal_keys = excluded.reveal_keys,
  cz_familiarity = excluded.cz_familiarity,
  genre_verified = excluded.genre_verified,
  cz_difficulty_note = excluded.cz_difficulty_note,
  question_bank_version = excluded.question_bank_version,
  fact_checked_at = excluded.fact_checked_at,
  fact_checked_by = excluded.fact_checked_by,
  updated_at = now();

delete from quiz_private.question_options as stored_option
using quiz_private.questions as stored_question,
      tmp_comedy_easy_variety_v2 as imported
where
  stored_option.question_id = stored_question.id
  and stored_question.external_id = imported.external_id;

insert into quiz_private.question_options (
  question_id,
  option_text,
  is_correct,
  display_order
)
select
  stored_question.id,
  option_item.value ->> 'text',
  (option_item.value ->> 'correct')::boolean,
  option_item.ordinality::smallint
from tmp_comedy_easy_variety_v2 as imported
join quiz_private.questions as stored_question
  on stored_question.external_id = imported.external_id
cross join lateral jsonb_array_elements(imported.options)
  with ordinality as option_item(value, ordinality);

create or replace function public.start_quiz_session(
  p_game_mode text,
  p_genre text,
  p_difficulty text,
  p_question_count integer default 18,
  p_client_version text default null
)
returns table (
  session_id uuid,
  selected_questions integer
)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict error
declare
  v_user_id uuid;
  v_session_id uuid;
  v_level smallint;
  v_requested integer;
  v_inserted integer := 0;

  v_history_pass smallint;
  v_question_window integer;
  v_movie_window integer;

  v_used_history_pass smallint := 1;
  v_used_question_window integer := 150;
  v_used_movie_window integer := 50;

  v_diversity_pass smallint;
  v_used_diversity_pass smallint := 1;

  v_candidate record;
  v_franchise_limit integer;
  v_person_limit integer;
  v_type_limit integer;

  v_unseen_questions integer := 0;
  v_repeated_questions integer := 0;
  v_unseen_movies integer := 0;
  v_repeated_movies integer := 0;
begin
  v_user_id := quiz_private.current_player_profile_id();

  if v_user_id is null then
    raise exception 'Authentication is required';
  end if;

  if p_difficulty not in ('easy', 'medium', 'hard') then
    raise exception 'Unsupported difficulty';
  end if;

  if nullif(btrim(p_genre), '') is null then
    raise exception 'Genre is required';
  end if;

  if nullif(btrim(p_game_mode), '') is null then
    raise exception 'Game mode is required';
  end if;

  v_level :=
    case p_difficulty
      when 'easy' then 1
      when 'medium' then 2
      else 3
    end;

  v_requested := least(
    greatest(coalesce(p_question_count, 18), 1),
    50
  );

  insert into public.quiz_sessions (
    player_id,
    game_mode,
    genre,
    difficulty,
    requested_question_count,
    client_version,
    question_bank_version,
    history_tier,
    history_window_used,
    movie_history_window_used
  )
  values (
    v_user_id,
    btrim(p_game_mode),
    btrim(p_genre),
    p_difficulty,
    v_requested,
    p_client_version,
    'cz-history-v2-type-variety',
    1,
    150,
    50
  )
  returning id into v_session_id;

  -- Ochranná okna přesných otázek a filmů.
  for v_history_pass in 1..5 loop

    v_question_window :=
      case v_history_pass
        when 1 then 150
        when 2 then 125
        when 3 then 100
        when 4 then 50
        else 0
      end;

    v_movie_window :=
      case v_history_pass
        when 1 then 50
        when 2 then 40
        when 3 then 25
        when 4 then 10
        else 0
      end;

    -- Uvolňuje se pouze franšíza a hlavní osoba.
    -- Stejný film se neuvolní nikdy.
    for v_diversity_pass in 1..3 loop

      v_franchise_limit :=
        case v_diversity_pass
          when 1 then 2
          when 2 then 3
          else 4
        end;

      v_person_limit :=
        case v_diversity_pass
          when 1 then 1
          when 2 then 1
          else 2
        end;

      for v_candidate in
        with ranked_question_history as (
          select
            history.question_id,
            history.last_seen_at,
            row_number() over (
              order by history.last_seen_at desc, history.question_id
            )::integer as recent_rank
          from quiz_private.player_question_history as history
          join quiz_private.questions as history_question
            on history_question.id = history.question_id
          where
            history.player_id = v_user_id
            and history_question.genre = btrim(p_genre)
            and history_question.difficulty = v_level
        ),
        ranked_movie_history as (
          select
            movie_history.canonical_movie_key,
            movie_history.last_seen_at,
            row_number() over (
              order by
                movie_history.last_seen_at desc,
                movie_history.canonical_movie_key
            )::integer as recent_rank
          from quiz_private.player_movie_history as movie_history
          where
            movie_history.player_id = v_user_id
            and movie_history.genre = btrim(p_genre)
            and movie_history.difficulty = v_level
        )
        select
          question.id,
          question.question_type,
          question.canonical_movie_key,
          question.franchise_key,
          question.relation_key,
          question.answer_key,
          question.primary_person_key,
          question.clue_keys,
          question.reveal_keys,

          question_history.last_seen_at as question_last_seen_at,
          movie_history.last_seen_at as movie_last_seen_at

        from quiz_private.questions as question

        left join ranked_question_history as question_history
          on question_history.question_id = question.id

        left join ranked_movie_history as movie_history
          on movie_history.canonical_movie_key =
             question.canonical_movie_key

        where
          question.active is true
          and question.review_status = 'approved'
          and question.genre_verified is true
          and question.language = 'cs'
          and question.genre = btrim(p_genre)
          and question.difficulty = v_level

          and (
            btrim(p_game_mode) = 'mixed'
            or question.game_mode = btrim(p_game_mode)
          )

          and (
            v_question_window = 0
            or question_history.recent_rank is null
            or question_history.recent_rank > v_question_window
          )

          and (
            question.canonical_movie_key is null
            or v_movie_window = 0
            or movie_history.recent_rank is null
            or movie_history.recent_rank > v_movie_window
          )

          and (
            question.question_type not in ('audio', 'image', 'video')
            or exists (
              select 1
              from quiz_private.question_media as question_media
              join quiz_private.media_assets as media
                on media.id = question_media.media_id
              where
                question_media.question_id = question.id
                and media.active is true
                and media.rights_confirmed is true
            )
          )

        order by
          case
            when movie_history.last_seen_at is null then 0
            else 1
          end,

          movie_history.last_seen_at asc nulls first,

          case
            when question_history.last_seen_at is null then 0
            else 1
          end,

          question_history.last_seen_at asc nulls first,
          random()

      loop

        exit when v_inserted >= v_requested;

        if exists (
          select 1
          from quiz_private.session_questions as selected
          where
            selected.session_id = v_session_id
            and selected.question_id = v_candidate.id
        ) then
          continue;
        end if;

        -- V jedné hře je vždy maximálně jedna otázka ke konkrétnímu filmu.
        if
          v_candidate.canonical_movie_key is not null
          and exists (
            select 1
            from quiz_private.session_questions as selected
            join quiz_private.questions as selected_question
              on selected_question.id = selected.question_id
            where
              selected.session_id = v_session_id
              and selected_question.canonical_movie_key =
                  v_candidate.canonical_movie_key
          )
        then
          continue;
        end if;

        -- Stejný testovaný fakt nebo stejná správná odpověď.
        if exists (
          select 1
          from quiz_private.session_questions as selected
          join quiz_private.questions as selected_question
            on selected_question.id = selected.question_id
          where
            selected.session_id = v_session_id
            and (
              (
                v_candidate.relation_key is not null
                and selected_question.relation_key =
                    v_candidate.relation_key
              )
              or
              (
                v_candidate.answer_key is not null
                and selected_question.answer_key =
                    v_candidate.answer_key
              )
            )
        ) then
          continue;
        end if;

        -- Žádné vzájemné prozrazení odpovědi.
        if exists (
          select 1
          from quiz_private.session_questions as selected
          join quiz_private.questions as selected_question
            on selected_question.id = selected.question_id
          where
            selected.session_id = v_session_id
            and (
              coalesce(v_candidate.clue_keys, '{}'::text[])
                && coalesce(selected_question.reveal_keys, '{}'::text[])
              or
              coalesce(v_candidate.reveal_keys, '{}'::text[])
                && coalesce(selected_question.clue_keys, '{}'::text[])
            )
        ) then
          continue;
        end if;


        -- Pestrost lehkých komedií.
        -- První průchod drží 18 otázek v poměru 4/4/4/3/3.
        -- Při vyčerpání historie se limity postupně uvolní,
        -- aby bylo vždy možné sestavit celou hru.
        if btrim(p_genre) = 'comedy' and v_level = 1 then
          v_type_limit :=
            case v_diversity_pass
              when 1 then
                case v_candidate.question_type
                  when 'plot' then 4
                  when 'plot_match' then 4
                  when 'character_pair' then 4
                  when 'character' then 3
                  when 'character_film' then 3
                  else 2
                end
              when 2 then
                case v_candidate.question_type
                  when 'plot' then 6
                  when 'plot_match' then 5
                  when 'character_pair' then 5
                  when 'character' then 5
                  when 'character_film' then 5
                  else 4
                end
              else 18
            end;

          if (
            select count(*)
            from quiz_private.session_questions as selected
            join quiz_private.questions as selected_question
              on selected_question.id = selected.question_id
            where
              selected.session_id = v_session_id
              and selected_question.question_type =
                  v_candidate.question_type
          ) >= v_type_limit then
            continue;
          end if;
        end if;

        -- Omezení franšízy.
        if
          v_candidate.franchise_key is not null
          and (
            select count(*)
            from quiz_private.session_questions as selected
            join quiz_private.questions as selected_question
              on selected_question.id = selected.question_id
            where
              selected.session_id = v_session_id
              and selected_question.franchise_key =
                  v_candidate.franchise_key
          ) >= v_franchise_limit
        then
          continue;
        end if;

        -- Omezení stejné hlavní osoby.
        if
          v_candidate.primary_person_key is not null
          and (
            select count(*)
            from quiz_private.session_questions as selected
            join quiz_private.questions as selected_question
              on selected_question.id = selected.question_id
            where
              selected.session_id = v_session_id
              and selected_question.primary_person_key =
                  v_candidate.primary_person_key
          ) >= v_person_limit
        then
          continue;
        end if;

        v_inserted := v_inserted + 1;

        v_used_history_pass :=
          greatest(v_used_history_pass, v_history_pass);

        v_used_question_window :=
          least(v_used_question_window, v_question_window);

        v_used_movie_window :=
          least(v_used_movie_window, v_movie_window);

        v_used_diversity_pass :=
          greatest(v_used_diversity_pass, v_diversity_pass);

        if v_candidate.question_last_seen_at is null then
          v_unseen_questions := v_unseen_questions + 1;
        else
          v_repeated_questions := v_repeated_questions + 1;
        end if;

        if v_candidate.movie_last_seen_at is null then
          v_unseen_movies := v_unseen_movies + 1;
        else
          v_repeated_movies := v_repeated_movies + 1;
        end if;

        insert into quiz_private.session_questions (
          session_id,
          question_number,
          question_id
        )
        values (
          v_session_id,
          v_inserted,
          v_candidate.id
        );

      end loop;

      exit when v_inserted >= v_requested;

    end loop;

    exit when v_inserted >= v_requested;

  end loop;

  if v_inserted < v_requested then
    delete from public.quiz_sessions
    where id = v_session_id;

    raise exception
      'Only % of % non-repeating questions could be selected',
      v_inserted,
      v_requested;
  end if;


  -- U lehkých komedií se typy po výběru také proloží,
  -- aby několik podobných šablon nešlo bezprostředně za sebou.
  if btrim(p_genre) = 'comedy' and v_level = 1 then
    update quiz_private.session_questions as selected
    set question_number = -selected.question_number
    where selected.session_id = v_session_id;

    with type_ranked as (
      select
        selected.question_id,
        question.question_type,
        row_number() over (
          partition by question.question_type
          order by md5(
            selected.question_id::text
            || v_session_id::text
          )
        )::integer as type_position
      from quiz_private.session_questions as selected
      join quiz_private.questions as question
        on question.id = selected.question_id
      where selected.session_id = v_session_id
    ),
    reordered as (
      select
        type_ranked.question_id,
        row_number() over (
          order by
            type_ranked.type_position,
            md5(
              type_ranked.question_type
              || type_ranked.question_id::text
              || v_session_id::text
            )
        )::integer as new_question_number
      from type_ranked
    )
    update quiz_private.session_questions as selected
    set question_number = reordered.new_question_number
    from reordered
    where
      selected.session_id = v_session_id
      and selected.question_id = reordered.question_id;
  end if;

  update public.quiz_sessions
  set
    selected_question_count = v_inserted,
    diversity_tier = v_used_diversity_pass,
    history_tier = v_used_history_pass,
    history_window_used = v_used_question_window,
    movie_history_window_used = v_used_movie_window,
    unseen_questions_selected = v_unseen_questions,
    repeated_questions_selected = v_repeated_questions,
    unseen_movies_selected = v_unseen_movies,
    repeated_movies_selected = v_repeated_movies
  where id = v_session_id;

  return query
  select
    v_session_id,
    v_inserted;
end;
$$;

revoke all privileges
on function public.start_quiz_session(
  text,
  text,
  text,
  integer,
  text
)
from public, anon, authenticated;

grant execute
on function public.start_quiz_session(
  text,
  text,
  text,
  integer,
  text
)
to authenticated;

do $$
declare
  v_active integer;
  v_distinct_movies integer;
  v_new_questions integer;
  v_bad_options integer;
begin
  select count(*), count(distinct canonical_movie_key)
  into v_active, v_distinct_movies
  from quiz_private.questions
  where
    genre = 'comedy'
    and difficulty = 1
    and active is true
    and review_status = 'approved'
    and genre_verified is true
    and language = 'cs';

  if v_active <> 200 then
    raise exception
      'Expected 200 active easy comedy questions, found %',
      v_active;
  end if;

  if v_distinct_movies <> 70 then
    raise exception
      'Expected 70 easy comedy films, found %',
      v_distinct_movies;
  end if;

  select count(*)
  into v_new_questions
  from quiz_private.questions
  where
    genre = 'comedy'
    and difficulty = 1
    and active is true
    and question_bank_version = 'comedy-cz-v1-1-variety';

  if v_new_questions <> 40 then
    raise exception
      'Expected 40 new variety questions, found %',
      v_new_questions;
  end if;

  select count(*)
  into v_bad_options
  from (
    select
      question.id
    from quiz_private.questions as question
    left join quiz_private.question_options as option_item
      on option_item.question_id = question.id
    where
      question.question_bank_version =
        'comedy-cz-v1-1-variety'
    group by question.id
    having
      count(option_item.id) <> 4
      or count(option_item.id) filter (
        where option_item.is_correct is true
      ) <> 1
  ) as bad_question;

  if v_bad_options <> 0 then
    raise exception
      'Invalid options in % new questions',
      v_bad_options;
  end if;
end;
$$;

notify pgrst, 'reload schema';

commit;

select
  question_type,
  count(*) as active_questions
from quiz_private.questions
where
  genre = 'comedy'
  and difficulty = 1
  and active is true
  and review_status = 'approved'
group by question_type
order by question_type;

select
  'Movie Quiz 7.1 easy comedy variety installed successfully'
  as status;
