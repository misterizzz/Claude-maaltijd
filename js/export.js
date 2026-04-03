/**
 * export.js — CSV-exportmodule voor MentaTrack
 *
 * Exporteert vragenlijsten, verhaalresultaten en observaties
 * als CSV-bestanden voor analyse.
 */
const ExportModule = (() => {
  'use strict';

  const SEPARATOR = ';';

  /**
   * Genereer CSV voor vragenlijsten.
   */
  function generateQuestionnairesCSV(questionnaires) {
    const lines = [];
    lines.push(['Datum', 'Week', 'VraagID', 'Vraag', 'Score'].join(SEPARATOR));

    const questionLabels = {
      q1: 'Ik vind het moeilijk om te begrijpen waarom anderen doen wat ze doen',
      q2: 'Ik merk dat ik snel conclusies trek over andermans bedoelingen',
      q3: 'Ik kan me goed verplaatsen in hoe anderen zich voelen',
      q4: 'Als iemand boos reageert denk ik na over mogelijke redenen',
      q5: 'Ik voel me gestrest',
      q6: 'Ik voel me gespannen of onrustig',
      q7: 'Ik kan me goed ontspannen',
      q8: 'Ik voel me lichamelijk opgewonden of geprikkeld',
      q9: 'Ik slaap goed',
      q10: 'Ik voel me overweldigd door mijn emoties'
    };

    for (const q of questionnaires) {
      for (const resp of (q.responses || [])) {
        const label = questionLabels[resp.questionId] || resp.questionId;
        lines.push([q.date, q.weekNumber, resp.questionId, `"${label}"`, resp.value].join(SEPARATOR));
      }
    }
    return lines.join('\n');
  }

  /**
   * Genereer CSV voor verhaalresultaten.
   */
  function generateStoriesCSV(storyResults) {
    const lines = [];
    lines.push([
      'Datum', 'Week', 'VerhaalID', 'VerhaalTitel', 'Poging',
      'EersteAntwoord', 'UiteindelijkAntwoord', 'HintGebruikt', 'Score'
    ].join(SEPARATOR));

    for (const r of storyResults) {
      const story = StoriesModule.getStoryById(r.storyId);
      const title = story ? `"${story.title}"` : r.storyId;
      lines.push([
        r.date, r.weekNumber, r.storyId, title, r.attempt,
        r.firstAnswer, r.finalAnswer, r.hintUsed ? 'Ja' : 'Nee', r.score
      ].join(SEPARATOR));
    }
    return lines.join('\n');
  }

  /**
   * Genereer CSV voor observaties.
   */
  function generateObservationsCSV(observations) {
    const lines = [];
    lines.push(['Datum', 'Type', 'Notities'].join(SEPARATOR));

    for (const obs of observations) {
      const notes = obs.notes ? `"${obs.notes.replace(/"/g, '""')}"` : '';
      lines.push([obs.date, obs.type, notes].join(SEPARATOR));
    }
    return lines.join('\n');
  }

  /**
   * Download een CSV-string als bestand.
   */
  function downloadCSV(csvContent, filename) {
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }

  /**
   * Exporteer alle data als CSV-bestanden.
   */
  async function exportAll() {
    const date = DB.formatDate(new Date());

    const questionnaires = await DB.getAllQuestionnaires();
    if (questionnaires.length > 0) {
      downloadCSV(generateQuestionnairesCSV(questionnaires), `mentatrack-vragenlijsten_${date}`);
    }

    const stories = await DB.getAllStoryResults();
    if (stories.length > 0) {
      downloadCSV(generateStoriesCSV(stories), `mentatrack-verhalen_${date}`);
    }

    const observations = await DB.getAllObservations();
    if (observations.length > 0) {
      downloadCSV(generateObservationsCSV(observations), `mentatrack-observaties_${date}`);
    }

    if (questionnaires.length === 0 && stories.length === 0 && observations.length === 0) {
      alert('Geen data om te exporteren.');
    }
  }

  return {
    generateQuestionnairesCSV,
    generateStoriesCSV,
    generateObservationsCSV,
    downloadCSV,
    exportAll,
  };
})();
