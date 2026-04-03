const StoriesModule = (() => {
  'use strict';

  const STORIES = [
    {
      id: 1,
      title: 'Cor en de lijm',
      story: 'Je bent dinsdagochtend aan het werk op de dagbesteding. Cor zit aan tafel met drie andere cliënten bij een knutselactiviteit. De afgelopen twintig minuten heeft Cor nauwelijks iets gedaan — hij zit met de schaar in zijn hand maar knipt niet. Een medecliënt vraagt om de lijm die voor Cor staat. Cor pakt de lijm, maar in plaats van hem door te geven gooit hij de lijm door de kamer. De lijm raakt niemand maar landt tegen de muur. Een collega die net binnenkomt zegt: "Cor, dat is niet oké, je moet sorry zeggen." Cor staat op en loopt naar de deur. Bij de deur stopt hij, draait zich om en kijkt je aan — zijn ogen zijn rood. Je herinnert je dat Cors moeder gisterenavond heeft gebeld om te vertellen dat ze volgende maand verhuist naar een andere stad.',
      question: 'Wat denk je dat er aan de hand is met Cor? Beschrijf wat je denkt dat hij voelt en waarom hij zich zo gedraagt.',
      keyConcepten: ['verdriet', 'moeder', 'verhuiz', 'verlies', 'frustratie', 'uiten', 'niet kunnen'],
      modelAnswer: 'Cor is waarschijnlijk verdrietig en angstig over de aanstaande verhuizing van zijn moeder. Hij kan deze complexe emoties niet verbaal uiten. Zijn passiviteit bij de activiteit wijst op innerlijke preoccupatie, en het gooien van de lijm is een uiting van opgekropte frustratie — niet van agressie richting anderen. Dat hij bij de deur stopt en je aankijkt met rode ogen laat zien dat hij contact zoekt.',
      scoringGuide: { 2: 'Benoemt verband met moeder/verhuizing EN beschrijft onderliggende emotie (verdriet/angst/verlies)', 1: 'Benoemt frustratie of verdriet maar legt geen verband met moeder/verhuizing, of noemt verhuizing maar mist emotionele duiding', 0: 'Ziet het als agressie, aandacht trekken, of ongehoorzaamheid zonder diepere duiding' },
      hint: 'Denk na over wat er gisteren is gebeurd in Cors leven. Kijk ook naar de details: zijn rode ogen, zijn passiviteit eerder, en het feit dat hij bij de deur stopt en je aankijkt.',
      explanation: 'Cor verwerkt het nieuws over de verhuizing van zijn moeder. Voor iemand met een beperking kan zo\'n verandering enorm bedreigend zijn. Zijn gedrag is een coping-mechanisme bij emotionele overbelasting, geen bewuste agressie.'
    },
    {
      id: 2,
      title: 'Veerle en de foto',
      story: 'Veerle zit in de woonkamer en bladert door een fotoalbum. Ze doet dit de laatste dagen opvallend vaak. Wanneer je naast haar gaat zitten, slaat ze het album dicht en schuift het onder een kussen. Je vraagt vriendelijk: "Mooie foto\'s?" Veerle zegt "Gaat wel" en staat op. Later die dag vind je het album open op een pagina met foto\'s van een uitje naar het strand van vorig jaar — Veerle staat erop met haar vorige begeleider die twee maanden geleden is vertrokken. Een collega merkt op dat Veerle de laatste week vaker naar het toilet gaat en minder eet tijdens de maaltijden. Wanneer je haar \'s avonds welterusten wenst, pakt ze je hand vast en laat pas na een paar seconden los.',
      question: 'Wat denk je dat er met Veerle aan de hand is? Wat probeert ze je te vertellen met haar gedrag?',
      keyConcepten: ['mist', 'begeleider', 'vertrokken', 'gehechtheid', 'verdriet', 'rouw', 'veiligheid', 'contact'],
      modelAnswer: 'Veerle rouwt om het vertrek van haar vorige begeleider. Het herhaaldelijk bekijken van het fotoalbum is een manier om het verlies te verwerken. Dat ze het album verbergt wanneer je erbij komt, laat zien dat ze haar verdriet niet durft te delen. De fysieke signalen (minder eten, vaker naar het toilet) wijzen op stress. Het vastpakken van je hand is een toenaderingspoging — ze zoekt nieuwe gehechtheid maar is voorzichtig.',
      scoringGuide: { 2: 'Legt verband met vertrokken begeleider EN benoemt rouw/gemis EN herkent de toenaderingspoging', 1: 'Benoemt dat Veerle iemand mist of verdrietig is, maar mist de details (fysieke stress, hand vastpakken als toenadering)', 0: 'Interpreteert het als manipulatie, aandacht trekken, of ziet geen verband met de vertrokken begeleider' },
      hint: 'Kijk naar welke foto\'s Veerle steeds bekijkt. Let ook op de tegenstelling: ze verbergt het album, maar pakt later je hand vast. Wat vertelt dat over wat ze voelt maar niet kan zeggen?',
      explanation: 'Veerle ervaart rouw maar heeft niet de woorden om dit te bespreken. Haar gedrag laat een innerlijk conflict zien: ze wil contact maar is bang om opnieuw gehecht te raken en weer verlaten te worden.'
    },
    {
      id: 3,
      title: 'Rick en de nieuwe tafel',
      story: 'De eetruimte is opnieuw ingericht en Rick zit nu aan een andere tafel dan voorheen, met cliënten die hij minder goed kent. De eerste dag zit hij stijf rechtop, eet snel en zegt niets. De tweede dag schuift hij zijn stoel ver naar achteren, weg van de tafel. De derde dag weigert hij naar de eetruimte te komen en eet op zijn kamer. Een collega zegt: "Rick is gewoon eigenwijs, hij moet zich aanpassen." Maar je merkt ook op dat Rick de afgelopen nachten onrustig heeft geslapen — de nachtdienst heeft gemeld dat hij meerdere keren wakker was. Wanneer je Rick op zijn kamer opzoekt, zit hij op zijn bed met zijn favoriete knuffel stevig vast.',
      question: 'Wat denk je dat Rick ervaart? Beschrijf wat er onder zijn gedrag zit.',
      keyConcepten: ['onveilig', 'verandering', 'routine', 'angst', 'controle', 'voorspelbaar', 'stress', 'slaap'],
      modelAnswer: 'Rick ervaart onveiligheid door het verlies van zijn vertrouwde eetplek en routine. Zijn gedrag escaleert van gespannenheid (stijf zitten, snel eten) naar vermijding (stoel naar achteren) naar volledig terugtrekken (eten op kamer). Dit is geen eigenwijsheid maar een angstreactie. De slaapproblemen bevestigen de stress, en het vasthouden van zijn knuffel is een zelfregulatiestrategie — hij zoekt troost bij iets vertrouwds.',
      scoringGuide: { 2: 'Beschrijft de escalatie als toenemende onveiligheid/angst EN noemt het verband met de verandering EN herkent de knuffel als coping', 1: 'Benoemt dat Rick moeite heeft met verandering maar mist de escalatie of de emotionele duiding', 0: 'Ziet Rick als eigenwijs, onwillig, of manipulatief' },
      hint: 'Let op het patroon over drie dagen: Ricks gedrag wordt elke dag sterker. Wat doet hij op zijn kamer? Waarom is zijn slaap verstoord? Dit vertelt iets over hoe hij zich voelt, niet over wat hij wil.',
      explanation: 'Rick laat een klassiek escalatiepatroon zien van stress bij verandering. De knuffel als troostobject en de slaapproblemen zijn cruciale signalen dat het om angst gaat, niet om onwil.'
    },
    {
      id: 4,
      title: 'Meike bij de koffie',
      story: 'Meike zit tijdens de koffiepauze aan tafel met vier andere cliënten. Normaal praat ze honderduit, maar vandaag zit ze stil. Ze roert in haar koffie zonder te drinken. Een collega maakt een grapje en iedereen lacht — behalve Meike. Wanneer een medecliënt per ongeluk koffie morst op tafel, springt Meike op en begint overdreven druk de tafel schoon te maken. Ze gaat maar door, zelfs als alles al schoon is. Je weet dat Meikes ouders gisteravond op bezoek waren en dat het gesprek ging over of Meike in de toekomst misschien naar een andere woonvorm zou verhuizen. Na het bezoek had de avonddienst opgemerkt dat Meike lang op haar kamer zat en haar kleren netjes had opgevouwen en weer opnieuw opvouwde.',
      question: 'Wat speelt er bij Meike? Beschrijf wat er achter haar veranderde gedrag zit en wat het poetsen en opvouwen betekent.',
      keyConcepten: ['angst', 'controle', 'verhuiz', 'onzekerheid', 'toekomst', 'dwangmatig', 'houvast', 'spanning'],
      modelAnswer: 'Meike ervaart angst en onzekerheid na het gesprek over een mogelijke verhuizing. Het herhaaldelijk schoonmaken en het obsessieve opvouwen van kleren zijn pogingen om controle te krijgen over haar omgeving wanneer haar toekomst onzeker voelt. Haar stilte wijst op innerlijke preoccupatie met het gesprek. Dit zijn stresssignalen die makkelijk gemist kunnen worden omdat het gedrag op zich "netjes" lijkt.',
      scoringGuide: { 2: 'Verbindt het gedrag aan onzekerheid over verhuizing EN herkent het poetsen/opvouwen als controlegedrag bij angst', 1: 'Ziet dat Meike ergens mee zit maar legt geen verband met het gesprek over verhuizing, of noemt het verband maar mist de betekenis van het repetitieve gedrag', 0: 'Ziet het als positief gedrag (netjes/behulpzaam) of als willekeurige stemmingswisseling' },
      hint: 'Wat werd er gisterenavond besproken met Meikes ouders? Let op het repetitieve karakter van het schoonmaken en opvouwen. Wat kan iemand proberen te bereiken door steeds dezelfde handeling te herhalen?',
      explanation: 'Repetitief gedrag zoals herhaald poetsen of opvouwen kan een manier zijn om angst te reguleren. Het biedt een gevoel van controle wanneer iets in het leven oncontroleerbaar aanvoelt.'
    },
    {
      id: 5,
      title: 'Roger en het bezoek',
      story: 'Rogers zus komt elke twee weken op bezoek. Normaal is Roger dan opgewekt: hij staat bij het raam te wachten en rent naar de deur als ze komt. Vandaag is het bezoekdag, maar Roger zit in de hoek van de woonkamer met zijn rug naar het raam. Als zijn zus binnenkomt, staat hij niet op. Ze gaat naar hem toe en wil hem een knuffel geven, maar Roger draait zijn hoofd weg. Zijn zus kijkt bezorgd naar jou. Je weet dat Roger vorige bezoekdag erg enthousiast was, maar dat zijn zus toen na tien minuten al weg moest vanwege een afspraak. Roger had daarna de hele avond niet gepraat. Een collega fluistert: "Misschien is hij gewoon niet lekker vandaag."',
      question: 'Wat is er volgens jou aan de hand met Roger? Waarom gedraagt hij zich zo anders dan normaal bij het bezoek van zijn zus?',
      keyConcepten: ['teleurstelling', 'bescherm', 'kort bezoek', 'afwijz', 'pijn', 'gehecht', 'verwacht', 'verlaten'],
      modelAnswer: 'Roger beschermt zichzelf tegen een mogelijke herhaling van de teleurstelling van het vorige bezoek, toen zijn zus na tien minuten alweer vertrok. Zijn afwijzende houding is geen desinteresse maar zelfbescherming: door zelf afstand te nemen, voorkomt hij dat hij opnieuw gekwetst wordt als ze weer vroeg weggaat. Het is een vorm van anticiperend verdriet. Dat hij na het vorige korte bezoek de hele avond niet praatte, laat zien hoe diep die teleurstelling zat.',
      scoringGuide: { 2: 'Verbindt het gedrag aan de vorige teleurstelling EN beschrijft het als zelfbescherming/anticiperend verdriet', 1: 'Noemt de vorige keer maar beschrijft niet waarom Roger zich nu afwendt, of ziet teleurstelling maar mist het zelfbeschermende aspect', 0: 'Denkt dat Roger ziek is, boos op zijn zus, of desinteresse toont' },
      hint: 'Wat gebeurde er de vorige keer dat Rogers zus op bezoek kwam? Hoe reageerde Roger toen ze vroeg wegging? Soms is afstand nemen niet het tegenovergestelde van gehechtheid.',
      explanation: 'Rogers gedrag lijkt op afwijzing maar is eigenlijk een uiting van sterke gehechtheid. Hij heeft geleerd dat enthousiasme tot pijn kan leiden als het bezoek te kort is, en kiest nu (onbewust) voor emotionele afstand als bescherming.'
    },
    {
      id: 6,
      title: 'Veerle en de deur',
      story: 'Het is woensdagmiddag en er is een muziekactiviteit gepland in de grote zaal. Veerle staat bij de deuropening maar gaat niet naar binnen. Ze kijkt naar de grond en friemelt aan haar mouw. Je nodigt haar uit om mee te doen, en ze doet een stap naar binnen. Dan klinkt er een luide lach van een groep cliënten en Veerle deist terug naar de gang. Ze gaat tegen de muur staan en drukt haar handen plat tegen het koude oppervlak. Een stagiaire vraagt of ze Veerle moet meenemen naar binnen. Een ervaren collega zegt: "Laat haar maar, ze doet altijd zo bij groepsactiviteiten." Je herinnert je dat Veerle vorige maand wél mee heeft gedaan aan de muziekactiviteit, maar dat er toen maar vijf mensen in de zaal waren. Vandaag zijn er ruim vijftien.',
      question: 'Wat denk je dat er bij Veerle speelt? Beschrijf hoe je haar gedrag interpreteert en wat het verschil met vorige maand verklaart.',
      keyConcepten: ['overprikkeling', 'prikkel', 'geluid', 'groep', 'grootte', 'zelfregulatie', 'sensorisch', 'muur', 'koelen'],
      modelAnswer: 'Veerle ervaart sensorische overprikkeling door de combinatie van de grotere groep en het luide geluid. Vorige maand was de groep klein genoeg om te hanteren. Haar gedrag bij de muur (handen plat drukken) is een zelfregulatiestrategie — het koude, harde oppervlak biedt een tegengeprikkeld die helpt om de overprikkeling te reduceren. Het is geen angst voor de activiteit zelf, maar een prikkelverwerkinskwestie die samenhangt met de groepsgrootte.',
      scoringGuide: { 2: 'Herkent overprikkeling EN legt het verband met groepsgrootte EN interpreteert het muurcontact als zelfregulatie', 1: 'Benoemt overprikkeling of sensorische gevoeligheid maar mist het verband met groepsgrootte of de betekenis van de muur', 0: 'Ziet het als angst, onwil, of karaktereigenschap ("doet altijd zo")' },
      hint: 'Wat is het verschil tussen vorige maand en vandaag? Let ook op wat Veerle doet bij de muur — handen plat tegen een koud oppervlak drukken is niet willekeurig gedrag.',
      explanation: 'Het drukken van handen tegen een koude muur is een veelvoorkomende sensorische zelfregulatiestrategie. Het biedt proprioceptieve input die helpt bij het verwerken van overprikkeling. Het verschil in groepsgrootte verklaart waarom het de ene keer wel lukt en de andere niet.'
    },
    {
      id: 7,
      title: 'Cor en de telefoon',
      story: 'Elke zondagavond belt Cors moeder om acht uur. Het is nu kwart over acht en de telefoon is niet gegaan. Cor zit in de gang naast de telefoon. Om half negen vraagt hij je: "Belt mama nog?" Je zegt eerlijk dat je het niet weet. Cor loopt naar de woonkamer, pakt de afstandsbediening van de televisie en zet het geluid heel hard. Wanneer je vraagt of hij het zachter kan zetten, gooit hij de afstandsbediening op de bank en loopt naar zijn kamer. Tien minuten later hoor je een hard bonkend geluid. Als je gaat kijken, zit Cor op de grond en slaat ritmisch met zijn vlakke hand op de vloer. Hij huilt niet, maar zijn ademhaling is snel en oppervlakkig.',
      question: 'Beschrijf wat er volgens jou met Cor aan de hand is. Wat is de functie van de verschillende gedragingen die je observeert?',
      keyConcepten: ['wachten', 'moeder', 'bellen', 'angst', 'onzeker', 'regulatie', 'ritmisch', 'slaan', 'spanning', 'ademhaling'],
      modelAnswer: 'Cor ervaart toenemende angst doordat het verwachte telefoontje van zijn moeder uitblijft. De escalatie is zichtbaar: wachten bij de telefoon → vragen stellen → hard geluid opzetten (poging om de stilte/spanning te overstemmen) → terugtrekken → ritmisch slaan als zelfregulatie. Het ritmische handslaan op de vloer is geen agressie maar een manier om de lichamelijke spanning te reguleren — vergelijkbaar met wiegen. De snelle ademhaling bevestigt de angst.',
      scoringGuide: { 2: 'Beschrijft de escalatie als toenemende angst door het uitblijven van het telefoontje EN herkent het ritmisch slaan als zelfregulatie (niet als agressie)', 1: 'Begrijpt dat Cor van slag is door het telefoontje maar mist de functie van het ritmisch slaan of de betekenis van het harde geluid', 0: 'Ziet de gedragingen als losse incidenten van ongewenst gedrag, of interpreteert het slaan als agressie' },
      hint: 'Volg de tijdlijn: wachten → vragen → hard geluid → terugtrekken → ritmisch slaan. Wat verandert er steeds? En het ritmische karakter van het slaan — hoe verschilt dat van agressief slaan?',
      explanation: 'Cor laat een duidelijke escalatie zien die past bij toenemende angst. Elke stap is een poging om met de spanning om te gaan. Het ritmisch slaan is zelfstimulatie die helpt bij het reguleren van overweldigende emoties.'
    },
    {
      id: 8,
      title: 'Meike en de spiegel',
      story: 'Meike staat al tien minuten voor de spiegel in de badkamer. Ze kamt haar haar, stopt, begint opnieuw. Ze wisselt drie keer van shirt. Een collega klopt op de deur en zegt dat het tijd is voor de dagbesteding. Meike roept: "Ik kom zo!" maar komt niet. Als je uiteindelijk naar haar toe gaat, zie je dat ze huilt. Ze wijst naar zichzelf in de spiegel en zegt: "Lelijk." Je weet dat er gisteren een nieuw groepslid is gekomen bij de dagbesteding — een jonge vrouw die door meerdere cliënten als "knap" werd benoemd. Je herinnert je ook dat Meikes moeder vorige week tijdens het bezoek zei: "Je bent wel wat aangekomen, hè Meike?"',
      question: 'Wat is er aan de hand met Meike? Beschrijf de verschillende factoren die bijdragen aan haar gedrag.',
      keyConcepten: ['zelfbeeld', 'vergelijk', 'moeder', 'opmerking', 'gewicht', 'onzeker', 'nieuw groepslid', 'knap'],
      modelAnswer: 'Meike worstelt met haar zelfbeeld na twee triggers: de opmerking van haar moeder over haar gewicht en de komst van een nieuw groepslid dat door anderen als knap werd benoemd. De combinatie maakt haar onzeker over haar uiterlijk. Het herhaaldelijk kammen en wisselen van shirts is een poging om er "goed genoeg" uit te zien. Dit gaat niet over ijdelheid maar over een kwetsbaar zelfbeeld dat door twee gebeurtenissen is geraakt.',
      scoringGuide: { 2: 'Benoemt beide triggers (moeder + nieuw groepslid) EN beschrijft de impact op Meikes zelfbeeld', 1: 'Noemt een van de twee triggers of beschrijft onzekerheid maar mist de samenhang', 0: 'Ziet het als ijdelheid, aanstellerij, of tijdgebrek' },
      hint: 'Er zijn twee dingen recent gebeurd die Meikes zelfbeeld kunnen raken. Denk aan wat haar moeder zei en wat er gisteren op de dagbesteding veranderde.',
      explanation: 'Mensen met een beperking zijn even gevoelig voor opmerkingen over hun uiterlijk als ieder ander. De combinatie van een kritische ouderopmerking en sociale vergelijking kan een grote impact hebben op het zelfbeeld.'
    },
    {
      id: 9,
      title: 'Rick en het schilderij',
      story: 'Rick heeft op de dagbesteding een schilderij gemaakt waar hij drie weken aan heeft gewerkt. Vandaag neemt hij het mee naar de woonkamer en hangt het zelf op aan een spijker bij zijn favoriete stoel. Een collega zegt: "Rick, je kunt daar niet zomaar iets ophangen, dat moet je eerst vragen." De collega haalt het schilderij van de muur. Rick staat er stil bij, pakt het schilderij, loopt naar de keuken en gooit het in de prullenbak. De rest van de avond zit hij in zijn stoel en reageert niet op aanspreken. Als je het schilderij uit de prullenbak haalt en naar hem toe brengt, schudt hij heftig zijn hoofd en duwt het weg.',
      question: 'Wat is er met Rick aan de hand? Beschrijf wat hij voelt en waarom hij zijn eigen schilderij weggooit.',
      keyConcepten: ['trots', 'afgewezen', 'eigenwaarde', 'autonomie', 'betekenis', 'verneder', 'controle', 'waardering'],
      modelAnswer: 'Rick ervaart de verwijdering van zijn schilderij als een fundamentele afwijzing van iets waar hij trots op was. Het ophangen was een daad van autonomie en zelfexpressie. De correctie door de collega — hoe goedbedoeld ook — voelde als vernedering. Door het schilderij zelf weg te gooien neemt hij de controle terug: als het toch niet gewaardeerd wordt, verwijdert hij het liever zelf. Dat hij het ook niet terug wil als jij het brengt, laat zien dat de emotionele pijn groter is dan de gehechtheid aan het werkstuk.',
      scoringGuide: { 2: 'Begrijpt dat het ophangen een uiting van trots/autonomie was EN de correctie als afwijzing werd ervaren EN het weggooien controle terugneemt', 1: 'Ziet dat Rick teleurgesteld of boos is maar mist de betekenis van het zelf ophangen of het zelf weggooien', 0: 'Ziet het als een driftbui of als onredelijke reactie op een normale correctie' },
      hint: 'Rick werkte drie weken aan het schilderij en hing het zelf op. Dat is ongebruikelijk — wat zegt dat over de betekenis die het voor hem had? En wie besloot dat het weg moest?',
      explanation: 'Autonomie en eigenaarschap zijn fundamentele behoeften. Door het schilderij van de muur te halen, ontnam de collega niet alleen een decoratie maar ook Ricks gevoel van agency en trots. Het zelf weggooien is een pijnlijke maar begrijpelijke manier om de controle terug te pakken.'
    },
    {
      id: 10,
      title: 'Roger en het nieuwe ritme',
      story: 'Door personeelstekort is het dagprogramma deze week aangepast. De ochtendactiviteit begint nu om 10 uur in plaats van 9 uur, en de lunch is verschoven van 12 naar 13 uur. Roger — die normaal stipt om 8:55 klaarstaat voor de activiteit — loopt deze week doelloos door de gang tussen 9 en 10. Hij opent en sluit kasten, legt dingen neer en pakt ze weer op. Om 11 uur staat hij al voor de keuken te wachten op de lunch. Een collega zegt: "Roger snapt het best, hij moet gewoon geduld leren." Om half één begint Roger met zijn handen op zijn bovenbenen te slaan en te jammeren. Een andere collega geeft hem een boterham "om hem rustig te houden." Roger eet de boterham maar het jammeren stopt niet. Het wordt pas rustig als je met Roger naar de keuken loopt en samen de tafel dekt voor de lunch.',
      question: 'Beschrijf wat er met Roger aan de hand is. Wat veroorzaakt zijn gedrag en waarom helpt de boterham niet maar het tafel dekken wel?',
      keyConcepten: ['routine', 'structuur', 'tijd', 'voorspelbaar', 'controle', 'deelnemen', 'actief', 'houvast', 'onrust'],
      modelAnswer: 'Roger is sterk afhankelijk van een voorspelbare dagstructuur. Het verschuiven van tijden ontneemt hem zijn houvast — hij weet letterlijk niet wat hij moet doen met de "lege" tijd. Het doelloos openen van kasten en wachten bij de keuken zijn pogingen om de vertrouwde routine te vinden. De boterham helpt niet omdat het probleem niet honger is, maar gebrek aan structuur en voorspelbaarheid. Het samen tafeldekken werkt wel omdat het Roger actief betrekt bij de routine — hij krijgt weer een herkenbare taak en rol, wat hem houvast en kalmte geeft.',
      scoringGuide: { 2: 'Beschrijft het probleem als structuurverlies (niet onwil/ongeduld) EN legt uit waarom de boterham niet werkt EN waarom het tafeldekken wel werkt', 1: 'Begrijpt dat de verandering het probleem is maar legt niet goed uit waarom de ene interventie wel en de andere niet werkt', 0: 'Ziet het als ongeduld of honger, of mist het verband met de veranderde tijden' },
      hint: 'De boterham gaat ervan uit dat Roger honger heeft. Maar is honger het echte probleem? Vergelijk wat de boterham biedt (eten) met wat het tafeldekken biedt (een rol, een handeling, voorspelbaarheid).',
      explanation: 'Roger heeft geen geduld nodig maar structuur. Het verschil tussen de boterham en het tafeldekken illustreert het belang van het juist begrijpen van de onderliggende behoefte: het gaat niet om de inhoud (eten) maar om het proces (deelnemen aan een herkenbare routine).'
    }
  ];

  function getAllStories() { return STORIES; }
  function getStoryById(id) { return STORIES.find(s => s.id === id) || null; }
  function getStoryCount() { return STORIES.length; }

  function evaluateOpenAnswer(storyId, answerText, isRetry) {
    const story = getStoryById(storyId);
    if (!story) return { autoScore: 0, hint: null, needsHint: false };
    const lower = answerText.toLowerCase().trim();
    if (!isRetry && lower.length < 30) {
      return { autoScore: -1, hint: story.hint, needsHint: true };
    }
    let matches = 0;
    for (const concept of story.keyConcepten) {
      if (lower.includes(concept.toLowerCase())) matches++;
    }
    const ratio = matches / story.keyConcepten.length;
    let autoScore = ratio >= 0.4 ? 2 : ratio >= 0.2 ? 1 : 0;
    return { autoScore, hint: null, needsHint: false };
  }

  return { getAllStories, getStoryById, evaluateOpenAnswer, getStoryCount };
})();
