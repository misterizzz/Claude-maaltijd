/**
 * stories.js — Casusverhalen-module voor mentalisatietaak
 *
 * Bevat 10 verhalen over sociale situaties. Deelnemers moeten
 * inschatten wat de bedoeling/intentie is van de personages.
 *
 * Scoringssysteem:
 *   2 = Correct antwoord bij eerste poging
 *   1 = Correct antwoord na hint
 *   0 = Fout antwoord na hint
 *
 * Elk verhaal wordt 2x aangeboden gedurende het programma.
 */
const StoriesModule = (() => {
  'use strict';

  /**
   * De 10 casusverhalen.
   * Elk verhaal bevat:
   *   - id: unieke identifier
   *   - title: korte titel
   *   - story: het verhaal (de casus)
   *   - question: de vraag over de intentie van het personage
   *   - options: 4 antwoordmogelijkheden
   *   - correctIndex: index van het juiste antwoord (0-3)
   *   - hint: een hint die gegeven wordt bij een fout antwoord
   *   - explanation: uitleg waarom het juiste antwoord correct is
   */
  const STORIES = [
    {
      id: 1,
      title: 'De nieuwe collega',
      story: 'Lisa begint vandaag op haar nieuwe werk. Tijdens de lunch zit ze alleen aan een tafeltje. ' +
        'Mark, een collega die al jaren bij het bedrijf werkt, ziet haar zitten. Hij loopt naar haar toe ' +
        'met zijn lunchblad en vraagt of hij erbij mag komen zitten. Tijdens het gesprek stelt hij veel ' +
        'vragen over haar vorige baan en haar interesses.',
      question: 'Wat is de meest waarschijnlijke reden dat Mark bij Lisa gaat zitten en veel vragen stelt?',
      options: [
        'Mark wil informatie verzamelen om Lisa later tegen te gebruiken',
        'Mark wil Lisa welkom laten voelen en een collegiale band opbouwen',
        'Mark zit haar uit te horen in opdracht van de manager',
        'Mark probeert indruk te maken omdat hij verliefd is'
      ],
      correctIndex: 1,
      hint: 'Denk na over wat de meest gebruikelijke reden is om een nieuwe collega op te zoeken tijdens de lunch. Welke intentie past het best bij normaal collegiaal gedrag?',
      explanation: 'Mark laat typisch gastvrij collegiaal gedrag zien. Door naast een nieuwe collega te gaan zitten en interesse te tonen, helpt hij haar zich welkom te voelen op de werkplek.'
    },
    {
      id: 2,
      title: 'Het verjaardagsfeest',
      story: 'Tom is uitgenodigd voor het verjaardagsfeest van zijn vriend Bas. Wanneer Tom aankomt, ' +
        'merkt hij dat Bas vooral met andere gasten praat en niet meteen naar hem toe komt. Later op ' +
        'de avond komt Bas naar Tom toe, geeft hem een hartelijke knuffel en zegt: "Sorry dat ik je niet ' +
        'eerder gesproken heb, het is zo druk vanavond!"',
      question: 'Waarom sprak Bas niet meteen met Tom toen hij aankwam?',
      options: [
        'Bas was boos op Tom en negeerde hem expres',
        'Bas had het druk als gastheer en moest zijn aandacht verdelen over alle gasten',
        'Bas vond de andere gasten belangrijker dan Tom',
        'Bas had spijt dat hij Tom had uitgenodigd'
      ],
      correctIndex: 1,
      hint: 'Bedenk wat het betekent om gastheer te zijn op een feest met veel gasten. Hoe verklaart Bas zelf zijn gedrag later?',
      explanation: 'Als gastheer van een feest moet Bas zijn aandacht verdelen over alle gasten. Zijn latere uitleg en hartelijke knuffel bevestigen dat hij Tom niet negeerde, maar simpelweg druk was.'
    },
    {
      id: 3,
      title: 'De boodschap',
      story: 'Fatima stuurt een WhatsApp-bericht naar haar vriendin Sara: "Heb je zin om morgen koffie ' +
        'te drinken?" Sara leest het bericht maar antwoordt pas de volgende ochtend met: "Sorry, had ' +
        'je bericht wel gezien maar was gisteren heel druk met de kinderen. Vanmiddag kan ik wel!"',
      question: 'Waarom reageerde Sara niet meteen op het bericht van Fatima?',
      options: [
        'Sara vond het bericht niet belangrijk genoeg om op te reageren',
        'Sara was aan het bedenken hoe ze Fatima kon afwijzen',
        'Sara was druk bezig en had even geen ruimte om te reageren',
        'Sara is boos op Fatima en liet haar expres wachten'
      ],
      correctIndex: 2,
      hint: 'Let op wat Sara zelf zegt over waarom ze niet eerder reageerde. Welk antwoord sluit het best aan bij haar uitleg?',
      explanation: 'Sara geeft een duidelijke en geloofwaardige reden: ze was druk met de kinderen. Ze toont ook interesse door alsnog een afspraak voor te stellen, wat laat zien dat ze de vriendschap waardeert.'
    },
    {
      id: 4,
      title: 'De teamvergadering',
      story: 'Tijdens een teamvergadering presenteert Jan zijn idee voor een nieuw project. Zijn ' +
        'collega Petra stelt kritische vragen over het budget en de haalbaarheid van het plan. Na de ' +
        'vergadering stuurt Petra Jan een e-mail: "Goed plan, Jan. Mijn vragen waren bedoeld om het ' +
        'plan sterker te maken voordat we het aan de directie presenteren."',
      question: 'Wat was de bedoeling van Petra\'s kritische vragen tijdens de vergadering?',
      options: [
        'Petra wilde Jan voor schut zetten waar het team bij was',
        'Petra is jaloers op Jan en probeerde zijn plan te saboteren',
        'Petra wilde het plan verbeteren door zwakke punten te identificeren',
        'Petra wilde laten zien dat zij slimmer is dan Jan'
      ],
      correctIndex: 2,
      hint: 'Kijk naar wat Petra achteraf zegt over haar intentie. Kritische vragen stellen hoeft niet negatief bedoeld te zijn. Wat kan een constructieve reden zijn?',
      explanation: 'Petra stelde kritische vragen om het plan te versterken. Haar e-mail bevestigt dat ze constructief bedoelde te zijn en Jan wilde helpen een beter voorstel te maken voor de directie.'
    },
    {
      id: 5,
      title: 'De speeltuin',
      story: 'Op de speeltuin ziet moeder Anna dat een onbekende vrouw haar dochtertje Sophie aanspreekt. ' +
        'De vrouw wijst naar de glijbaan en praat tegen Sophie. Anna loopt snel naar haar toe. De vrouw ' +
        'zegt tegen Anna: "Ik zag dat uw dochtertje bijna van de bovenkant van de glijbaan viel. Ik heb ' +
        'haar gewaarschuwd om voorzichtig te zijn."',
      question: 'Wat was de intentie van de onbekende vrouw toen ze Sophie aansprak?',
      options: [
        'De vrouw had slechte bedoelingen met Sophie',
        'De vrouw wilde Sophie bang maken',
        'De vrouw wilde Sophie beschermen tegen een mogelijk ongeluk',
        'De vrouw wilde Anna bekritiseren als moeder'
      ],
      correctIndex: 2,
      hint: 'Bedenk wat de vrouw zelf zegt over waarom ze Sophie aansprak. In een speeltuin met kinderen, wat is een logische reden om een onbekend kind aan te spreken?',
      explanation: 'De vrouw handelde uit bezorgdheid voor Sophie\'s veiligheid. Ze zag een gevaarlijke situatie en greep in door het kind te waarschuwen. Dit is een normaal beschermend gedrag van volwassenen naar kinderen.'
    },
    {
      id: 6,
      title: 'De stilte',
      story: 'Ahmed en zijn partner Noor hebben een drukke week gehad. Op zaterdagavond zitten ze ' +
        'samen op de bank. Noor is stil en staart voor zich uit. Wanneer Ahmed vraagt of alles goed is, ' +
        'zucht Noor en zegt: "Ja hoor, ik ben alleen moe. Het was zo\'n drukke week op het werk. ' +
        'Ik geniet ervan om gewoon even stil naast je te zitten."',
      question: 'Waarom was Noor stil op de bank?',
      options: [
        'Noor is boos op Ahmed maar wil er niet over praten',
        'Noor overweegt om de relatie te beëindigen',
        'Noor voelt zich verveeld in Ahmeds gezelschap',
        'Noor was moe en genoot van het rustige samenzijn'
      ],
      correctIndex: 3,
      hint: 'Luister goed naar wat Noor zelf zegt over hoe ze zich voelt. Stilte hoeft niet altijd iets negatiefs te betekenen. Wat kan stilte ook betekenen?',
      explanation: 'Noor was gewoon moe na een drukke week en vond het prettig om in stilte naast Ahmed te zitten. Stilte in een relatie kan juist een teken zijn van comfort en vertrouwen.'
    },
    {
      id: 7,
      title: 'De cadeau-uitwisseling',
      story: 'Het is Sinterklaas op het werk. Iedereen doet mee met lootjes trekken. Kevin krijgt ' +
        'een boek over tuinieren van zijn collega Daniëlle. Kevin houdt niet van tuinieren. Daniëlle ' +
        'zegt erbij: "Ik wist niet zo goed wat je leuk zou vinden, dus ik heb iets gekozen wat ik ' +
        'zelf ook leuk vind. Ik hoop dat je het wat vindt!"',
      question: 'Waarom gaf Daniëlle een boek over tuinieren terwijl Kevin daar niet van houdt?',
      options: [
        'Daniëlle gaf expres iets wat Kevin niet leuk zou vinden om hem te pesten',
        'Daniëlle kende Kevins interesses niet goed en koos iets vanuit haar eigen interesses',
        'Daniëlle vindt Kevin niet aardig en deed geen moeite',
        'Daniëlle wilde Kevin belachelijk maken waar iedereen bij was'
      ],
      correctIndex: 1,
      hint: 'Let op wat Daniëlle zelf zegt over hoe ze het cadeau heeft uitgekozen. Wat vertelt dit over haar intentie?',
      explanation: 'Daniëlle was eerlijk dat ze Kevins interesses niet goed kende en koos vanuit haar eigen referentiekader. Dit is geen kwade opzet, maar een onschuldige misvatting die vaak voorkomt bij lootjes trekken.'
    },
    {
      id: 8,
      title: 'De afzegging',
      story: 'Eva heeft met haar vriendin Lotte afgesproken om samen te gaan wandelen. Een uur voor ' +
        'de afspraak belt Lotte: "Eva, het spijt me heel erg maar ik moet afzeggen. Mijn zoon is ziek ' +
        'geworden en heeft koorts. Ik moet bij hem blijven. Kunnen we het verzetten naar volgende week?" ' +
        'Lotte klinkt gestrest aan de telefoon.',
      question: 'Waarom zegt Lotte de afspraak af?',
      options: [
        'Lotte had geen zin meer en gebruikt haar zoon als excuus',
        'Lotte vindt andere dingen altijd belangrijker dan Eva',
        'Lotte moet voor haar zieke zoon zorgen en kan daardoor niet komen',
        'Lotte vermijdt Eva en zoekt steeds redenen om af te zeggen'
      ],
      correctIndex: 2,
      hint: 'Let op de details: Lotte klinkt gestrest, ze biedt een alternatief aan en haar zoon is ziek. Wat zegt dit over haar intentie?',
      explanation: 'Lotte zegt af vanwege een reële situatie: haar zoon is ziek. Ze klinkt gestrest (wat wijst op echte bezorgdheid), biedt excuses aan en stelt meteen een nieuwe datum voor. Dit zijn tekenen van een oprechte reden.'
    },
    {
      id: 9,
      title: 'De feedback',
      story: 'Rick heeft een rapport geschreven voor zijn opleiding. Zijn docent, mevrouw De Vries, ' +
        'geeft het terug met veel rode aantekeningen en opmerkingen. Onderaan schrijft ze: "Rick, je ' +
        'hebt een interessant onderwerp gekozen en goede bronnen gebruikt. De structuur kan sterker. ' +
        'Kom gerust langs tijdens mijn spreekuur dan help ik je verder."',
      question: 'Waarom heeft mevrouw De Vries zoveel aantekeningen gemaakt bij het rapport?',
      options: [
        'Ze vindt Rick een slechte student en wil hem ontmoedigen',
        'Ze wil Rick helpen zijn rapport te verbeteren en biedt daarbij begeleiding aan',
        'Ze wil laten zien hoe machtig ze is als docent',
        'Ze heeft een hekel aan Rick en zoekt fouten om hem te laten zakken'
      ],
      correctIndex: 1,
      hint: 'Kijk naar het totaalplaatje: de docent noemt ook positieve punten en biedt hulp aan. Wat zegt dit over haar bedoeling met de aantekeningen?',
      explanation: 'Mevrouw De Vries geeft gedetailleerde feedback om Rick te helpen verbeteren. Ze benoemt positieve aspecten, geeft constructieve kritiek en biedt persoonlijke begeleiding aan. Dit wijst op een investering in Ricks ontwikkeling.'
    },
    {
      id: 10,
      title: 'De buurman',
      story: 'Sinds een paar weken merkt Karin dat haar buurman, meneer Jansen, elke ochtend haar ' +
        'vuilnisbak aan de straat zet als het ophaaldag is. Ze heeft hem hier nooit om gevraagd. ' +
        'Op een dag spreekt ze hem aan. Meneer Jansen lacht en zegt: "Ik zet die van mezelf toch al ' +
        'buiten, dan neem ik die van jou ook even mee. Je vertrekt altijd vroeg naar je werk."',
      question: 'Waarom zet meneer Jansen de vuilnisbak van Karin buiten?',
      options: [
        'Hij wil Karin het gevoel geven dat ze bij hem in het krijt staat',
        'Hij bemoeit zich met Karins zaken en respecteert haar privacy niet',
        'Hij doet het als een vriendelijk gebaar omdat het hem weinig moeite kost',
        'Hij probeert een romantische relatie met Karin te beginnen'
      ],
      correctIndex: 2,
      hint: 'Let op de uitleg van meneer Jansen: hij zet zijn eigen vuilnisbak toch al buiten. Wat is de meest eenvoudige verklaring voor zijn gedrag?',
      explanation: 'Meneer Jansen helpt Karin met een klein gebaar dat hem nauwelijks extra moeite kost. Hij merkte dat ze vroeg vertrekt en biedt pragmatische hulp. Dit is typisch goed buurmanschap zonder bijbedoelingen.'
    }
  ];

  /**
   * Haal alle verhalen op.
   * @returns {Array<Object>}
   */
  function getAllStories() {
    return STORIES;
  }

  /**
   * Haal een specifiek verhaal op basis van ID.
   * @param {number} id - Het verhaal-ID (1-10)
   * @returns {Object|null}
   */
  function getStoryById(id) {
    return STORIES.find(s => s.id === id) || null;
  }

  /**
   * Beoordeel het antwoord van een deelnemer.
   * @param {number} storyId - Het verhaal-ID
   * @param {number} chosenIndex - Het gekozen antwoordindex (0-3)
   * @param {boolean} isRetry - Of dit een tweede poging is (na hint)
   * @returns {{correct: boolean, score: number, hint: string|null, explanation: string|null}}
   */
  function evaluateAnswer(storyId, chosenIndex, isRetry) {
    const story = getStoryById(storyId);
    if (!story) return { correct: false, score: 0, hint: null, explanation: null };

    const isCorrect = chosenIndex === story.correctIndex;

    if (isCorrect && !isRetry) {
      // Eerste poging correct: 2 punten
      return { correct: true, score: 2, hint: null, explanation: story.explanation };
    } else if (isCorrect && isRetry) {
      // Correct na hint: 1 punt
      return { correct: true, score: 1, hint: null, explanation: story.explanation };
    } else if (!isCorrect && !isRetry) {
      // Fout eerste poging: geef hint, nog geen score
      return { correct: false, score: -1, hint: story.hint, explanation: null };
    } else {
      // Fout na hint: 0 punten
      return { correct: false, score: 0, hint: null, explanation: story.explanation };
    }
  }

  /**
   * Haal het totaal aantal verhalen op.
   * @returns {number}
   */
  function getStoryCount() {
    return STORIES.length;
  }

  return {
    getAllStories,
    getStoryById,
    evaluateAnswer,
    getStoryCount,
  };
})();
