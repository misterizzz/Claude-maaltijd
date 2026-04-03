/**
 * stories.js — Casusverhalen voor mentalisatietaak
 *
 * 10 verhalen over begeleidingssituaties in de gehandicaptenzorg.
 * Begeleiders moeten inschatten wat de bedoeling/intentie/emotie
 * is van de cliënt in de casus.
 *
 * Cliëntnamen: Veerle, Rick, Cor, Meike, Roger (elk 2x)
 *
 * Scoringssysteem: 2 = correct eerste poging, 1 = correct na hint, 0 = fout na hint
 */
const StoriesModule = (() => {
  'use strict';

  const STORIES = [
    {
      id: 1,
      title: 'Cor en het bord',
      story: 'Tijdens het avondeten gooit Cor plotseling zijn bord van tafel. Het eten valt op de grond. ' +
        'Cor kijkt je daarna aan met grote ogen en begint te huilen. Eerder op de dag was er een nieuw ' +
        'dagprogramma geïntroduceerd waarbij Cor naast iemand anders moest zitten dan normaal.',
      question: 'Wat is de meest waarschijnlijke reden voor Cors gedrag?',
      options: [
        'Cor is boos en probeert jou als begeleider te provoceren',
        'Cor vindt het eten niet lekker en laat dat op zijn manier zien',
        'Cor raakt gefrustreerd door de veranderingen en kan dat niet goed uiten',
        'Cor wil aandacht trekken en doet dit bewust om reactie uit te lokken'
      ],
      correctIndex: 2,
      hint: 'Denk aan wat er eerder op de dag veranderd is. Cor huilt nadat hij het bord weggooit. Wat kan dat betekenen over hoe hij zich voelt?',
      explanation: 'Cor reageert waarschijnlijk op de verandering in zijn dagprogramma. Het weggooien van het bord is een uiting van frustratie, niet van agressie. Zijn huilbui laat zien dat hij overweldigd is en steun zoekt. Veranderingen in routine kunnen heel stressvol zijn voor mensen met een beperking.'
    },
    {
      id: 2,
      title: 'Veerle trekt zich terug',
      story: 'Veerle zit normaal graag in de gemeenschappelijke woonkamer. De laatste dagen trekt ze zich ' +
        'steeds vaker terug op haar kamer. Als je haar vraagt of alles goed is, zegt ze "ja hoor" maar ' +
        'ze vermijdt oogcontact. Je weet dat haar vaste begeleider vorige week op vakantie is gegaan.',
      question: 'Wat zou de meest waarschijnlijke verklaring zijn voor Veerles veranderde gedrag?',
      options: [
        'Veerle is boos op het team omdat haar vaste begeleider weg is en straft jullie door zich terug te trekken',
        'Veerle heeft gewoon een fase waarin ze meer alleen wil zijn, er is niets aan de hand',
        'Veerle voelt zich onzeker door de afwezigheid van haar vertrouwde begeleider en zoekt veiligheid op haar kamer',
        'Veerle doet alsof er iets mis is om extra aandacht te krijgen'
      ],
      correctIndex: 2,
      hint: 'Let op de timing: het gedrag begon toen haar vaste begeleider wegging. Wat betekent "ja hoor" zeggen terwijl je oogcontact vermijdt?',
      explanation: 'Veerle voelt zich waarschijnlijk onzeker door het wegvallen van haar vertrouwde begeleider. Haar kamer voelt als een veilige plek. Dat ze "ja" zegt maar geen oogcontact maakt, laat zien dat ze haar gevoelens moeilijk kan benoemen. Dit is geen boosheid of aandachttrekken, maar een coping-mechanisme bij onzekerheid.'
    },
    {
      id: 3,
      title: 'Rick bij de activiteit',
      story: 'Tijdens een groepsactiviteit (tekenen) verscheurt Rick plotseling zijn eigen tekening en ' +
        'die van de persoon naast hem. Daarna kruist hij zijn armen en kijkt boos voor zich uit. ' +
        'Je had eerder die middag opgemerkt dat Rick moeite had met het vasthouden van het potlood ' +
        'en dat een andere cliënt een compliment kreeg voor zijn tekening.',
      question: 'Wat verklaart Ricks gedrag het beste?',
      options: [
        'Rick is jaloers en reageert zijn frustratie af op de tekening van de ander',
        'Rick heeft een hekel aan tekenen en wil ermee stoppen',
        'Rick voelt frustratie omdat hij ziet dat het hem niet lukt terwijl het een ander wel lukt, en kan die emotie niet anders uiten',
        'Rick is agressief van aard en kan niet omgaan met groepsactiviteiten'
      ],
      correctIndex: 2,
      hint: 'Je zag dat Rick moeite had met het potlood. Kort daarna kreeg iemand anders een compliment. Hoe zou dat samengaan met wat er vervolgens gebeurde?',
      explanation: 'Rick ervaart frustratie door het contrast tussen zijn eigen moeite en het succes van een ander. Het verscheuren van de tekeningen is een uiting van machteloosheid, niet van jaloezie of agressie. Hij mist de vaardigheden om zijn frustratie verbaal te uiten. Begrip voor deze onderliggende emotie helpt om adequaat te reageren.'
    },
    {
      id: 4,
      title: 'Meike en de knuffel',
      story: 'Meike komt op je af en omhelst je stevig wanneer je de woonkamer binnenloopt. Ze laat niet ' +
        'los als je dat aangeeft. Een collega zegt: "Ze doet dat bij iedereen, ze kent geen grenzen." ' +
        'Je weet dat Meike vanmorgen te horen heeft gekregen dat haar moeder dit weekend niet op bezoek komt.',
      question: 'Hoe kun je Meikes gedrag het beste begrijpen?',
      options: [
        'Meike kent inderdaad geen grenzen en moet leren dat dit niet mag',
        'Meike probeert je te manipuleren om extra aandacht te krijgen',
        'Meike zoekt troost en nabijheid na het teleurstellende nieuws over haar moeder',
        'Meike is ongepast gehecht en dit gedrag moet worden afgeleerd'
      ],
      correctIndex: 2,
      hint: 'Meike hoorde net dat haar moeder niet komt. Wat zou een knuffel in die context kunnen betekenen? Kijk verder dan het zichtbare gedrag.',
      explanation: 'Meikes stevige knuffel is waarschijnlijk een uiting van haar behoefte aan troost na het teleurstellende nieuws. In plaats van het gedrag alleen als "grensoverschrijdend" te labelen, helpt het om de functie ervan te begrijpen: ze zoekt veiligheid en nabijheid op een moment dat ze verdrietig is.'
    },
    {
      id: 5,
      title: 'Roger weigert',
      story: 'Roger weigert al drie dagen om mee te doen met de dagbesteding. Hij zegt "nee" en draait ' +
        'zich om als je het vraagt. Collega\'s worden hier gefrustreerd over. Je herinnert je dat Roger ' +
        'vorige week is gevallen tijdens een activiteit en dat meerdere mensen dat zagen.',
      question: 'Wat is de meest waarschijnlijke reden dat Roger weigert?',
      options: [
        'Roger test de grenzen en kijkt hoe ver hij kan gaan met weigeren',
        'Roger is lui geworden en heeft geen motivatie meer',
        'Roger voelt schaamte of angst na zijn val en vermijdt de situatie waar dat gebeurde',
        'Roger heeft een hekel gekregen aan de dagbesteding en de andere deelnemers'
      ],
      correctIndex: 2,
      hint: 'Roger is vorige week gevallen waar anderen bij waren. Hoe zou dat een rol kunnen spelen in zijn weigering om terug te gaan?',
      explanation: 'Rogers weigering is waarschijnlijk gerelateerd aan de val. Hij kan zich schamen dat anderen het zagen, of bang zijn om opnieuw te vallen. Dit is geen kwestie van grenzen testen of luiheid, maar van emotionele zelfbescherming. Het helpt om in gesprek te gaan over de val en zijn gevoel van veiligheid te herstellen.'
    },
    {
      id: 6,
      title: 'Veerle en het geluid',
      story: 'Tijdens een gezamenlijke koffiepauze beginnen twee andere cliënten luid te praten en te lachen. ' +
        'Veerle staat abrupt op, houdt haar handen tegen haar oren en loopt snel naar de gang. Een collega ' +
        'zegt: "Veerle doet weer moeilijk, ze moet leren om erbij te blijven zitten."',
      question: 'Hoe begrijp je Veerles reactie het beste?',
      options: [
        'Veerle is onbeleefd en moet leren om gezelschap te verdragen',
        'Veerle wordt overprikkeld door het geluid en beschermt zichzelf door weg te gaan',
        'Veerle heeft een hekel aan die twee cliënten en wil niet bij ze zitten',
        'Veerle zoekt een excuus om van de groep weg te zijn'
      ],
      correctIndex: 1,
      hint: 'Let op het specifieke gedrag: handen tegen de oren. Wat vertelt dat lichaamstaal over wat Veerle ervaart?',
      explanation: 'Veerle laat duidelijk zien dat ze overprikkeld raakt door het geluid — haar handen tegen haar oren is letterlijk een poging om de prikkel te verminderen. Het weglopen is een gezonde copingstrategie. Het is belangrijk om dit niet te interpreteren als "moeilijk doen" maar als zelfregulatie bij sensorische overbelasting.'
    },
    {
      id: 7,
      title: 'Cor zoekt contact',
      story: 'Cor komt steeds naar je toe tijdens de avonddienst. Hij zegt elke keer hetzelfde: "Wanneer ' +
        'gaan we slapen?" Hoewel je al meerdere keren hebt uitgelegd dat het nog niet bedtijd is, blijft ' +
        'hij terug komen. Een collega raakt geïrriteerd en zegt: "Hij luistert gewoon niet."',
      question: 'Waarom blijft Cor steeds dezelfde vraag stellen?',
      options: [
        'Cor luistert inderdaad niet en heeft meer structuur nodig',
        'Cor probeert je aandacht te monopoliseren',
        'Cor voelt zich onrustig of angstig en de herhaalde vraag is een manier om contact en geruststelling te zoeken',
        'Cor begrijpt het concept van tijd niet en heeft cognitief de uitleg niet begrepen'
      ],
      correctIndex: 2,
      hint: 'Het gaat niet om de letterlijke vraag over bedtijd. Waarom zou iemand steeds dezelfde vraag stellen terwijl hij het antwoord al heeft gehoord? Wat is de functie van het herhalen?',
      explanation: 'Cors herhaalde vraag gaat waarschijnlijk niet over bedtijd zelf, maar over het zoeken van geruststelling en contact. Het herhalen van de vraag is een manier om nabijheid te zoeken wanneer hij zich onrustig voelt. Door voorbij de letterlijke vraag te kijken naar de emotionele behoefte, kun je beter reageren — bijvoorbeeld door even naast hem te gaan zitten.'
    },
    {
      id: 8,
      title: 'Meike en het cadeau',
      story: 'Meike heeft op de dagbesteding een tekening gemaakt. Ze komt stralend naar je toe en geeft ' +
        'de tekening aan je. Je zegt vriendelijk "wat mooi!" en legt hem op de tafel. Meike\'s gezicht ' +
        'betrekt, ze pakt de tekening terug en scheurt hem doormidden.',
      question: 'Wat is de meest waarschijnlijke verklaring voor Meikes reactie?',
      options: [
        'Meike kan niet tegen complimenten en reageert daar onvoorspelbaar op',
        'Meike is boos omdat je de tekening niet goed genoeg waardeerde — op tafel leggen voelde als afwijzing',
        'Meike had een slechte dag en reageerde het af op de tekening',
        'Meike heeft moeite met het geven van cadeaus en had spijt'
      ],
      correctIndex: 1,
      hint: 'Meike kwam stralend naar je toe (positief). Haar gezicht betrok nadat je de tekening op tafel legde. Wat betekent het voor haar om iets persoonlijks te geven en dan te zien dat het "weggelegd" wordt?',
      explanation: 'Voor Meike was de tekening een persoonlijk cadeau — een uiting van verbinding. Door het op tafel te leggen in plaats van het vast te houden of op te hangen, voelde dat voor haar als afwijzing. Haar reactie (scheuren) komt voort uit teleurstelling en gekwetstheid, niet uit grilligheid. Dit laat zien hoe belangrijk het is om te begrijpen wat een gebaar betekent vanuit het perspectief van de cliënt.'
    },
    {
      id: 9,
      title: 'Rick in de ochtend',
      story: 'Rick wordt \'s ochtends wakker en weigert zijn bed uit te komen. Als je hem probeert te helpen ' +
        'met aankleden, duwt hij je hand weg. Dit is nieuw gedrag — normaal werkt Rick goed mee in de ' +
        'ochtendroutine. Gisteren is Rick naar de tandarts geweest waar een behandeling plaatsvond.',
      question: 'Wat zou de reden kunnen zijn dat Rick niet wil opstaan?',
      options: [
        'Rick is opstandig en test hoe ver hij kan gaan',
        'Rick is lui en wil in bed blijven',
        'Rick heeft mogelijk pijn of ongemak na de tandartsbehandeling en kan dit niet goed verwoorden',
        'Rick heeft slecht geslapen en is chagrijnig'
      ],
      correctIndex: 2,
      hint: 'Rick was gisteren bij de tandarts voor een behandeling. Dit gedrag is nieuw. Wat als Rick iets voelt dat hij niet kan uitleggen?',
      explanation: 'De verandering in Ricks gedrag valt samen met het tandartsbezoek. Het is goed mogelijk dat hij pijn of ongemak heeft maar dit niet verbaal kan uiten. Het wegduwen van je hand bij het aankleden kan betekenen dat aanraking onprettig is. Bij mensen met een beperking is veranderd gedrag vaak een signaal van fysiek ongemak dat niet verwoord kan worden.'
    },
    {
      id: 10,
      title: 'Roger en de nieuwe bewoner',
      story: 'Er is een nieuwe bewoner op de groep gekomen. Roger, die normaal rustig en vriendelijk is, ' +
        'begint vaker te schreeuwen en gooit dingen door de kamer. Dit gebeurt vooral op momenten dat jij ' +
        'aandacht besteedt aan de nieuwe bewoner. Een collega zegt: "Roger is gewoon jaloers en moet ' +
        'hier maar aan wennen."',
      question: 'Hoe kun je Rogers veranderde gedrag het beste begrijpen?',
      options: [
        'Roger is jaloers en moet leren delen — het gaat vanzelf over',
        'Roger voelt zich bedreigd in zijn veilige plek en mist de voorspelbaarheid van de situatie vóór de nieuwe bewoner',
        'Roger kan niet tegen verandering en is niet geschikt voor een groep',
        'Roger probeert de nieuwe bewoner weg te pesten'
      ],
      correctIndex: 1,
      hint: 'Rogers gedrag veranderde met de komst van de nieuwe bewoner. Het gebeurt vooral wanneer jij aandacht aan de ander geeft. Gaat het echt om jaloezie, of speelt er iets diepers?',
      explanation: 'Rogers gedrag gaat dieper dan simpele jaloezie. De komst van een nieuwe bewoner verstoort zijn gevoel van veiligheid en voorspelbaarheid. Zijn schreeuwen en gooien zijn uitingen van onzekerheid over zijn plek in de groep. Door te erkennen dat Roger zich bedreigd voelt en hem extra geruststelling te bieden, help je hem om te wennen aan de nieuwe situatie.'
    }
  ];

  function getAllStories() { return STORIES; }

  function getStoryById(id) {
    return STORIES.find(s => s.id === id) || null;
  }

  function evaluateAnswer(storyId, chosenIndex, isRetry) {
    const story = getStoryById(storyId);
    if (!story) return { correct: false, score: 0, hint: null, explanation: null };

    const isCorrect = chosenIndex === story.correctIndex;

    if (isCorrect && !isRetry) {
      return { correct: true, score: 2, hint: null, explanation: story.explanation };
    } else if (isCorrect && isRetry) {
      return { correct: true, score: 1, hint: null, explanation: story.explanation };
    } else if (!isCorrect && !isRetry) {
      return { correct: false, score: -1, hint: story.hint, explanation: null };
    } else {
      return { correct: false, score: 0, hint: null, explanation: story.explanation };
    }
  }

  function getStoryCount() { return STORIES.length; }

  return { getAllStories, getStoryById, evaluateAnswer, getStoryCount };
})();
