/**
 * export.js — CSV-exportmodule
 *
 * Genereert een CSV-bestand van de maaltijdregistraties
 * zodat data extern verwerkt kan worden (bijv. in Excel).
 *
 * Formaat:
 *   Datum;Cliëntnummer;Ontbijt;Lunch;Avondeten
 *   2025-01-15;101;Aanwezig;Afwezig;Aanwezig
 */
const ExportModule = (() => {
  'use strict';

  // CSV-scheidingsteken (puntkomma voor NL-locale / Excel)
  const SEPARATOR = ';';

  /**
   * Genereer een CSV-string uit een array van records.
   * @param {Array<Object>} records - Ontsleutelde records uit DB
   *   Elk record: { date, absences: { [clientNr]: { breakfast, lunch, dinner } } }
   * @param {Array<number>} clientNumbers - Lijst van cliëntnummers
   * @returns {string} CSV-inhoud
   */
  function generateCSV(records, clientNumbers) {
    const lines = [];

    // Header
    lines.push(
      ['Datum', 'Cliëntnummer', 'Ontbijt', 'Lunch', 'Avondeten'].join(SEPARATOR)
    );

    // Data-rijen
    for (const record of records) {
      for (const clientNr of clientNumbers) {
        const key = String(clientNr);
        const abs = record.absences?.[key] || {};

        const breakfast = abs.breakfast ? 'Afwezig' : 'Aanwezig';
        const lunch = abs.lunch ? 'Afwezig' : 'Aanwezig';
        const dinner = abs.dinner ? 'Afwezig' : 'Aanwezig';

        lines.push(
          [record.date, clientNr, breakfast, lunch, dinner].join(SEPARATOR)
        );
      }
    }

    return lines.join('\n');
  }

  /**
   * Download een CSV-string als bestand.
   * @param {string} csvContent - De CSV-inhoud
   * @param {string} filename - Bestandsnaam (zonder extensie)
   */
  function downloadCSV(csvContent, filename) {
    // BOM (Byte Order Mark) voor correcte weergave van speciale tekens in Excel
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    // Opruimen
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }

  /**
   * Exporteer registraties als CSV-bestand.
   * @param {Array<Object>} records - De records om te exporteren
   * @param {Array<number>} clientNumbers - Cliëntnummers
   * @param {string} periodLabel - Label voor de bestandsnaam (bijv. "week-03")
   */
  function exportToCSV(records, clientNumbers, periodLabel) {
    if (!records || records.length === 0) {
      alert('Geen data om te exporteren.');
      return;
    }

    const csv = generateCSV(records, clientNumbers);
    const filename = `maaltijd-registratie_${periodLabel}`;
    downloadCSV(csv, filename);
  }

  // Publieke API
  return {
    generateCSV,
    downloadCSV,
    exportToCSV,
  };
})();
