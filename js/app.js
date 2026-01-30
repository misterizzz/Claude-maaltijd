/**
 * app.js — Hoofdmodule van de Maaltijd Aanwezigheid PWA
 *
 * Beheert de UI, navigatie, datumkiezer, maaltijd-grid,
 * overzichtsweergave en instellingen. Communiceert met
 * DB (db.js), CryptoModule (crypto.js) en ExportModule (export.js).
 */
const App = (() => {
  'use strict';

  // --- Status ---
  let currentDate = new Date();
  let config = {
    location: '',
    clientCount: 15,
    clientStart: 1,
  };
  let currentView = 'registration';
  let navOpen = false;

  // Maaltijdtypes
  const MEALS = ['breakfast', 'lunch', 'dinner'];
  const MEAL_LABELS = { breakfast: 'Ontbijt', lunch: 'Lunch', dinner: 'Avondeten' };

  // --- Initialisatie ---

  /**
   * Start de app: registreer service worker, open DB,
   * controleer eerste gebruik, en bouw de UI.
   */
  async function init() {
    // Registreer service worker voor offline gebruik
    registerServiceWorker();

    // Open de database
    await DB.openDB();

    // Verwijder automatisch records ouder dan 3 maanden
    await DB.purgeOldRecords();

    // Controleer of dit het eerste gebruik is
    const setupDone = await DB.getSetting('setupDone');

    if (!setupDone) {
      showPrivacyOverlay();
    } else {
      // Laad bestaande instellingen
      await loadConfig();
      showApp();
    }

    // Bind alle event listeners
    bindEvents();
  }

  /**
   * Registreer de service worker.
   */
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('sw.js')
        .then((reg) => {
          console.log('Service Worker geregistreerd:', reg.scope);
        })
        .catch((err) => {
          console.warn('Service Worker registratie mislukt:', err);
        });
    }
  }

  // --- Configuratie ---

  /**
   * Laad de configuratie uit IndexedDB.
   */
  async function loadConfig() {
    const loc = await DB.getSetting('location');
    const count = await DB.getSetting('clientCount');
    const start = await DB.getSetting('clientStart');

    if (loc !== undefined) config.location = loc;
    if (count !== undefined) config.clientCount = count;
    if (start !== undefined) config.clientStart = start;
  }

  /**
   * Sla de configuratie op in IndexedDB.
   */
  async function saveConfig() {
    await DB.setSetting('location', config.location);
    await DB.setSetting('clientCount', config.clientCount);
    await DB.setSetting('clientStart', config.clientStart);
  }

  /**
   * Geef een array van cliëntnummers terug op basis van de configuratie.
   * @returns {Array<number>}
   */
  function getClientNumbers() {
    const numbers = [];
    for (let i = 0; i < config.clientCount; i++) {
      numbers.push(config.clientStart + i);
    }
    return numbers;
  }

  // --- Privacy overlay (eerste gebruik) ---

  function showPrivacyOverlay() {
    document.getElementById('privacy-overlay').classList.remove('hidden');
  }

  function hidePrivacyOverlay() {
    document.getElementById('privacy-overlay').classList.add('hidden');
    showSetupOverlay();
  }

  // --- Setup overlay (eerste gebruik) ---

  function showSetupOverlay() {
    document.getElementById('setup-overlay').classList.remove('hidden');
  }

  async function handleSetupSave() {
    const locInput = document.getElementById('setup-location');
    const countInput = document.getElementById('setup-client-count');
    const startInput = document.getElementById('setup-client-start');

    const loc = locInput.value.trim();
    const count = parseInt(countInput.value, 10);
    const start = parseInt(startInput.value, 10);

    // Validatie
    if (!loc) {
      locInput.focus();
      return;
    }
    if (isNaN(count) || count < 1 || count > 50) {
      countInput.focus();
      return;
    }
    if (isNaN(start) || start < 1 || start > 1800) {
      startInput.focus();
      return;
    }

    config.location = loc;
    config.clientCount = count;
    config.clientStart = start;

    await saveConfig();
    await DB.setSetting('setupDone', true);

    document.getElementById('setup-overlay').classList.add('hidden');
    showApp();
  }

  // --- App tonen ---

  function showApp() {
    document.getElementById('app-header').classList.remove('hidden');
    updateHeaderTitle();
    navigateTo('registration');
  }

  function updateHeaderTitle() {
    const title = document.getElementById('header-title');
    title.textContent = config.location || 'Maaltijd';
  }

  // --- Navigatie ---

  function toggleNav() {
    navOpen = !navOpen;
    const nav = document.getElementById('main-nav');
    if (navOpen) {
      nav.classList.remove('hidden');
    } else {
      nav.classList.add('hidden');
    }
  }

  function navigateTo(view) {
    currentView = view;

    // Verberg alle views
    document.querySelectorAll('.view').forEach((v) => v.classList.add('hidden'));

    // Toon de geselecteerde view
    const viewEl = document.getElementById(`view-${view}`);
    if (viewEl) viewEl.classList.remove('hidden');

    // Update navigatie-actieve status
    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });

    // Sluit het menu
    navOpen = false;
    document.getElementById('main-nav').classList.add('hidden');

    // View-specifieke acties
    if (view === 'registration') {
      renderMealGrid();
    } else if (view === 'settings') {
      populateSettings();
    } else if (view === 'overview') {
      resetOverview();
    }
  }

  // --- Datumkiezer ---

  /**
   * Formatteer de huidige datum voor weergave.
   */
  function formatDisplayDate(date) {
    const today = new Date();
    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();

    const days = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
    const months = [
      'jan', 'feb', 'mrt', 'apr', 'mei', 'jun',
      'jul', 'aug', 'sep', 'okt', 'nov', 'dec',
    ];

    const dayName = days[date.getDay()];
    const dayNum = date.getDate();
    const monthName = months[date.getMonth()];

    const label = `${dayName} ${dayNum} ${monthName}`;
    return isToday ? `Vandaag — ${label}` : label;
  }

  function updateDateDisplay() {
    document.getElementById('display-date').textContent = formatDisplayDate(currentDate);
    document.getElementById('date-input').value = DB.formatDate(currentDate);
  }

  function goToPreviousDay() {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateDisplay();
    renderMealGrid();
  }

  function goToNextDay() {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateDisplay();
    renderMealGrid();
  }

  function openDatePicker() {
    const input = document.getElementById('date-input');
    input.showPicker?.() || input.focus();
  }

  function handleDateChange(event) {
    const val = event.target.value;
    if (val) {
      const parts = val.split('-');
      currentDate = new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10)
      );
      updateDateDisplay();
      renderMealGrid();
    }
  }

  // --- Maaltijd Grid ---

  /**
   * Bouw het maaltijd-grid op basis van de cliëntnummers
   * en laad de bestaande registratie voor de geselecteerde datum.
   */
  async function renderMealGrid() {
    const container = document.getElementById('meal-grid-body');
    const dateStr = DB.formatDate(currentDate);
    const clients = getClientNumbers();

    // Laad bestaande data voor deze dag
    const record = await DB.getRecord(dateStr);
    const absences = record?.absences || {};

    // Bouw grid-rijen
    let html = '';
    for (const clientNr of clients) {
      const key = String(clientNr);
      const clientAbs = absences[key] || {};

      html += `<div class="meal-row" data-client="${key}">`;
      html += `  <div class="client-number">${clientNr}</div>`;

      for (const meal of MEALS) {
        const isAbsent = clientAbs[meal] === true;
        const stateClass = isAbsent ? 'absent' : 'present';

        html += `
          <div class="meal-cell" data-client="${key}" data-meal="${meal}">
            <div class="meal-toggle ${stateClass}" role="button"
                 aria-label="Cliënt ${clientNr} ${MEAL_LABELS[meal]}: ${isAbsent ? 'afwezig' : 'aanwezig'}"
                 tabindex="0">
              <span class="icon-check">&#10003;</span>
              <span class="icon-cross">&#10007;</span>
            </div>
          </div>`;
      }

      html += '</div>';
    }

    container.innerHTML = html;
    updateDateDisplay();
  }

  /**
   * Toggle de afwezigheidsstatus van een maaltijd-cel.
   * Slaat automatisch op na elke wijziging.
   */
  async function handleMealToggle(cell) {
    const clientKey = cell.dataset.client;
    const meal = cell.dataset.meal;
    const toggle = cell.querySelector('.meal-toggle');

    if (!toggle) return;

    // Toggle status
    const wasAbsent = toggle.classList.contains('absent');
    const isNowAbsent = !wasAbsent;

    toggle.classList.toggle('absent', isNowAbsent);
    toggle.classList.toggle('present', !isNowAbsent);
    toggle.setAttribute(
      'aria-label',
      `Cliënt ${clientKey} ${MEAL_LABELS[meal]}: ${isNowAbsent ? 'afwezig' : 'aanwezig'}`
    );

    // Verzamel alle huidige states uit het grid en sla op
    await saveCurrentGrid();
  }

  /**
   * Lees de huidige staat van het grid en sla op in de database.
   */
  async function saveCurrentGrid() {
    const dateStr = DB.formatDate(currentDate);
    const absences = {};

    document.querySelectorAll('.meal-cell').forEach((cell) => {
      const clientKey = cell.dataset.client;
      const meal = cell.dataset.meal;
      const toggle = cell.querySelector('.meal-toggle');

      if (!absences[clientKey]) {
        absences[clientKey] = {};
      }

      absences[clientKey][meal] = toggle.classList.contains('absent');
    });

    await DB.saveRecord(dateStr, absences);
    showSaveIndicator();
  }

  /**
   * Toon kort de "Opgeslagen" indicator.
   */
  function showSaveIndicator() {
    const indicator = document.getElementById('save-indicator');
    indicator.classList.remove('hidden');
    clearTimeout(indicator._timeout);
    indicator._timeout = setTimeout(() => {
      indicator.classList.add('hidden');
    }, 1500);
  }

  // --- Overzicht ---

  function resetOverview() {
    document.getElementById('overview-results').classList.add('hidden');
    document.getElementById('period-select').value = 'today';
    document.getElementById('custom-range').classList.add('hidden');
  }

  function handlePeriodChange(event) {
    const custom = document.getElementById('custom-range');
    if (event.target.value === 'custom') {
      custom.classList.remove('hidden');
    } else {
      custom.classList.add('hidden');
    }
  }

  /**
   * Bereken de datum-range op basis van de gekozen periode.
   * @returns {{start: string, end: string, label: string}}
   */
  function getDateRange() {
    const period = document.getElementById('period-select').value;
    const today = new Date();
    let start, end, label;

    switch (period) {
      case 'today':
        start = end = DB.formatDate(today);
        label = 'vandaag';
        break;

      case 'week': {
        // Begin van de week (maandag)
        const day = today.getDay();
        const diff = day === 0 ? 6 : day - 1; // maandag = 0
        const monday = new Date(today);
        monday.setDate(today.getDate() - diff);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        start = DB.formatDate(monday);
        end = DB.formatDate(sunday);
        label = `week-${getWeekNumber(today)}`;
        break;
      }

      case 'month': {
        const first = new Date(today.getFullYear(), today.getMonth(), 1);
        const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        start = DB.formatDate(first);
        end = DB.formatDate(last);
        const months = [
          'jan', 'feb', 'mrt', 'apr', 'mei', 'jun',
          'jul', 'aug', 'sep', 'okt', 'nov', 'dec',
        ];
        label = `${months[today.getMonth()]}-${today.getFullYear()}`;
        break;
      }

      case 'custom': {
        start = document.getElementById('range-start').value;
        end = document.getElementById('range-end').value;
        if (!start || !end) {
          alert('Vul beide datums in.');
          return null;
        }
        if (start > end) {
          alert('De startdatum moet voor de einddatum liggen.');
          return null;
        }
        label = `${start}_${end}`;
        break;
      }

      default:
        start = end = DB.formatDate(today);
        label = 'vandaag';
    }

    return { start, end, label };
  }

  /**
   * Laad het overzicht voor de gekozen periode.
   * Wordt alleen uitgevoerd na actieve gebruikersactie (klik op knop).
   */
  async function loadOverview() {
    const range = getDateRange();
    if (!range) return;

    const records = await DB.getRecordsInRange(range.start, range.end);
    const clients = getClientNumbers();

    // Bereken statistieken
    let totalAbsent = 0;
    let totalPresent = 0;

    for (const record of records) {
      for (const clientNr of clients) {
        const key = String(clientNr);
        const abs = record.absences?.[key] || {};
        for (const meal of MEALS) {
          if (abs[meal]) {
            totalAbsent++;
          } else {
            totalPresent++;
          }
        }
      }
    }

    const totalEntries = totalAbsent + totalPresent;

    // Update statistieken
    document.getElementById('stat-total').textContent = totalEntries;
    document.getElementById('stat-absent').textContent = totalAbsent;
    document.getElementById('stat-present').textContent = totalPresent;

    // Bouw overzichtstabel
    renderOverviewTable(records, clients);

    // Bewaar range-label voor export
    document.getElementById('overview-results').dataset.label = range.label;
    document.getElementById('overview-results').dataset.start = range.start;
    document.getElementById('overview-results').dataset.end = range.end;

    // Toon resultaten
    document.getElementById('overview-results').classList.remove('hidden');
  }

  /**
   * Render de overzichtstabel.
   */
  function renderOverviewTable(records, clients) {
    const thead = document.getElementById('overview-thead-row');
    const tbody = document.getElementById('overview-tbody');

    // Header: Datum | per client: O L A
    let headerHtml = '<th>Datum</th>';
    for (const clientNr of clients) {
      headerHtml += `<th colspan="3">Cliënt ${clientNr}</th>`;
    }
    thead.innerHTML = headerHtml;

    // Sub-header met maaltijden
    let subHeaderHtml = '<tr class="sub-header"><td></td>';
    for (const _clientNr of clients) {
      subHeaderHtml += '<td>O</td><td>L</td><td>A</td>';
    }
    subHeaderHtml += '</tr>';

    // Data-rijen
    let bodyHtml = subHeaderHtml;

    if (records.length === 0) {
      bodyHtml += `<tr><td colspan="${1 + clients.length * 3}" style="text-align:center;padding:20px;color:#999;">Geen registraties gevonden</td></tr>`;
    } else {
      for (const record of records) {
        bodyHtml += `<tr><td>${formatShortDate(record.date)}</td>`;
        for (const clientNr of clients) {
          const key = String(clientNr);
          const abs = record.absences?.[key] || {};
          for (const meal of MEALS) {
            const isAbsent = abs[meal] === true;
            const cls = isAbsent ? 'cell-absent' : 'cell-present';
            const symbol = isAbsent ? '✗' : '✓';
            bodyHtml += `<td class="${cls}">${symbol}</td>`;
          }
        }
        bodyHtml += '</tr>';
      }
    }

    tbody.innerHTML = bodyHtml;
  }

  /**
   * Kort datumformaat voor de tabel.
   */
  function formatShortDate(dateStr) {
    const parts = dateStr.split('-');
    return `${parts[2]}-${parts[1]}`;
  }

  /**
   * ISO-weeknummer berekenen.
   */
  function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  // --- CSV Export ---

  async function handleExport() {
    const resultsEl = document.getElementById('overview-results');
    const start = resultsEl.dataset.start;
    const end = resultsEl.dataset.end;
    const label = resultsEl.dataset.label;

    if (!start || !end) {
      alert('Laad eerst een overzicht.');
      return;
    }

    const records = await DB.getRecordsInRange(start, end);
    const clients = getClientNumbers();

    ExportModule.exportToCSV(records, clients, label);
  }

  // --- Instellingen ---

  function populateSettings() {
    document.getElementById('settings-location').value = config.location;
    document.getElementById('settings-client-count').value = config.clientCount;
    document.getElementById('settings-client-start').value = config.clientStart;

    // Update data-telling
    DB.countRecords().then((count) => {
      document.getElementById('data-count').textContent = count;
    });
  }

  async function handleSaveSettings() {
    const loc = document.getElementById('settings-location').value.trim();
    const count = parseInt(document.getElementById('settings-client-count').value, 10);
    const start = parseInt(document.getElementById('settings-client-start').value, 10);

    if (!loc) {
      document.getElementById('settings-location').focus();
      return;
    }
    if (isNaN(count) || count < 1 || count > 50) {
      document.getElementById('settings-client-count').focus();
      return;
    }
    if (isNaN(start) || start < 1 || start > 1800) {
      document.getElementById('settings-client-start').focus();
      return;
    }

    config.location = loc;
    config.clientCount = count;
    config.clientStart = start;

    await saveConfig();
    updateHeaderTitle();
    showSaveIndicator();
  }

  // --- Bevestigingsdialoog ---

  function showConfirmDialog(title, message) {
    return new Promise((resolve) => {
      document.getElementById('confirm-title').textContent = title;
      document.getElementById('confirm-message').textContent = message;
      document.getElementById('confirm-dialog').classList.remove('hidden');

      const okBtn = document.getElementById('btn-confirm-ok');
      const cancelBtn = document.getElementById('btn-confirm-cancel');

      function cleanup() {
        document.getElementById('confirm-dialog').classList.add('hidden');
        okBtn.removeEventListener('click', onOk);
        cancelBtn.removeEventListener('click', onCancel);
      }

      function onOk() {
        cleanup();
        resolve(true);
      }

      function onCancel() {
        cleanup();
        resolve(false);
      }

      okBtn.addEventListener('click', onOk);
      cancelBtn.addEventListener('click', onCancel);
    });
  }

  async function handleDeleteData() {
    const confirmed = await showConfirmDialog(
      'Alle data wissen?',
      'Dit verwijdert alle registraties en instellingen permanent. Deze actie kan niet ongedaan worden gemaakt.'
    );

    if (confirmed) {
      await DB.clearAllData();
      // Herlaad de pagina om opnieuw te beginnen
      window.location.reload();
    }
  }

  // --- Event Listeners ---

  function bindEvents() {
    // Privacy overlay
    document.getElementById('btn-accept-privacy').addEventListener('click', hidePrivacyOverlay);

    // Setup overlay
    document.getElementById('btn-save-setup').addEventListener('click', handleSetupSave);

    // Header menu toggle
    document.getElementById('btn-menu').addEventListener('click', toggleNav);

    // Navigatie
    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.addEventListener('click', () => navigateTo(btn.dataset.view));
    });

    // Datumkiezer
    document.getElementById('btn-prev-day').addEventListener('click', goToPreviousDay);
    document.getElementById('btn-next-day').addEventListener('click', goToNextDay);
    document.getElementById('btn-date').addEventListener('click', openDatePicker);
    document.getElementById('date-input').addEventListener('change', handleDateChange);

    // Maaltijd-grid (event delegation voor performance)
    document.getElementById('meal-grid-body').addEventListener('click', (event) => {
      const cell = event.target.closest('.meal-cell');
      if (cell) handleMealToggle(cell);
    });

    // Keyboard-toegankelijkheid voor maaltijd-toggles
    document.getElementById('meal-grid-body').addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        const cell = event.target.closest('.meal-cell');
        if (cell) {
          event.preventDefault();
          handleMealToggle(cell);
        }
      }
    });

    // Overzicht
    document.getElementById('period-select').addEventListener('change', handlePeriodChange);
    document.getElementById('btn-load-overview').addEventListener('click', loadOverview);
    document.getElementById('btn-apply-range').addEventListener('click', loadOverview);
    document.getElementById('btn-export-csv').addEventListener('click', handleExport);

    // Instellingen
    document.getElementById('btn-save-settings').addEventListener('click', handleSaveSettings);
    document.getElementById('btn-delete-data').addEventListener('click', handleDeleteData);
  }

  // --- Start de app zodra de DOM geladen is ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Publieke API (voor eventueel testen)
  return {
    init,
    getClientNumbers,
  };
})();
