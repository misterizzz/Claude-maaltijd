/**
 * app.js — Hoofdmodule van de MentaTrack PWA
 *
 * Beheert de UI, navigatie, vragenlijst, casusverhalen,
 * observaties, voortgang en instellingen.
 */
const App = (() => {
  'use strict';

  // --- Configuratie ---
  let config = {
    participantId: '',
    programWeeks: 20,
    startDate: '',
    notifyDay1: 3,
    notifyDay2: 5,
  };

  let currentView = 'dashboard';
  let navOpen = false;

  // Story state
  let currentStory = null;
  let currentStoryAttempt = 1;
  let storyIsRetry = false;
  let selectedOptionIndex = -1;

  // Observation state
  let currentObsType = '';

  // --- Vragenlijst definities (voor begeleiders in de gehandicaptenzorg) ---
  const QUESTIONS = [
    { id: 'q1', text: 'Ik vind het moeilijk om te begrijpen waarom cliënten zich op een bepaalde manier gedragen', category: 'mentaliseren', reversed: true },
    { id: 'q2', text: 'Ik merk dat ik snel conclusies trek over de bedoelingen van cliënten', category: 'mentaliseren', reversed: true },
    { id: 'q3', text: 'Ik kan me goed verplaatsen in hoe een cliënt zich voelt', category: 'mentaliseren', reversed: false },
    { id: 'q4', text: 'Als een cliënt onverwacht reageert, sta ik stil bij mogelijke redenen daarvoor', category: 'mentaliseren', reversed: false },
    { id: 'q5', text: 'Ik voel me gestrest in mijn werk als begeleider', category: 'stress', reversed: true },
    { id: 'q6', text: 'Ik voel me gespannen of onrustig tijdens het begeleiden', category: 'stress', reversed: true },
    { id: 'q7', text: 'Ik kan me na een werkdag goed ontspannen', category: 'stress', reversed: false },
    { id: 'q8', text: 'Ik voel me lichamelijk opgewonden of geprikkeld door situaties op het werk', category: 'arousal', reversed: true },
    { id: 'q9', text: 'Ik slaap goed, ook na een intensieve werkdag', category: 'arousal', reversed: false },
    { id: 'q10', text: 'Ik voel me overweldigd door mijn emoties op het werk', category: 'arousal', reversed: true },
  ];

  // --- Initialisatie ---

  async function init() {
    registerServiceWorker();
    await DB.openDB();

    const setupDone = await DB.getSetting('setupDone');
    if (!setupDone) {
      showPrivacyOverlay();
    } else {
      await loadConfig();
      showApp();
    }

    bindEvents();
    scheduleNotificationCheck();
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch((err) => {
        console.warn('SW registratie mislukt:', err);
      });
    }
  }

  // --- Configuratie ---

  async function loadConfig() {
    const pid = await DB.getSetting('participantId');
    const weeks = await DB.getSetting('programWeeks');
    const start = await DB.getSetting('startDate');
    const nd1 = await DB.getSetting('notifyDay1');
    const nd2 = await DB.getSetting('notifyDay2');

    if (pid !== undefined) config.participantId = pid;
    if (weeks !== undefined) config.programWeeks = weeks;
    if (start !== undefined) config.startDate = start;
    if (nd1 !== undefined) config.notifyDay1 = nd1;
    if (nd2 !== undefined) config.notifyDay2 = nd2;
  }

  async function saveConfig() {
    await DB.setSetting('participantId', config.participantId);
    await DB.setSetting('programWeeks', config.programWeeks);
    await DB.setSetting('startDate', config.startDate);
    await DB.setSetting('notifyDay1', config.notifyDay1);
    await DB.setSetting('notifyDay2', config.notifyDay2);
  }

  // --- Privacy & Setup ---

  function showPrivacyOverlay() {
    document.getElementById('privacy-overlay').classList.remove('hidden');
  }

  function hidePrivacyOverlay() {
    document.getElementById('privacy-overlay').classList.add('hidden');
    showSetupOverlay();
  }

  function showSetupOverlay() {
    const today = new Date();
    document.getElementById('setup-start-date').value = DB.formatDate(today);
    document.getElementById('setup-overlay').classList.remove('hidden');
  }

  async function handleSetupSave() {
    const pidInput = document.getElementById('setup-participant-id');
    const weeksInput = document.getElementById('setup-program-weeks');
    const startInput = document.getElementById('setup-start-date');
    const nd1 = document.getElementById('setup-notify-day1');
    const nd2 = document.getElementById('setup-notify-day2');

    const pid = pidInput.value.trim();
    const weeks = parseInt(weeksInput.value, 10);
    const start = startInput.value;

    if (!pid) { pidInput.focus(); return; }
    if (isNaN(weeks) || weeks < 15 || weeks > 30) { weeksInput.focus(); return; }
    if (!start) { startInput.focus(); return; }

    config.participantId = pid;
    config.programWeeks = weeks;
    config.startDate = start;
    config.notifyDay1 = parseInt(nd1.value, 10);
    config.notifyDay2 = parseInt(nd2.value, 10);

    await saveConfig();
    await DB.setSetting('setupDone', true);

    // Generate default schedule
    await generateDefaultSchedule();

    document.getElementById('setup-overlay').classList.add('hidden');
    showApp();

    // Request notification permission
    requestNotificationPermission();
  }

  async function generateDefaultSchedule() {
    const stories = StoriesModule.getAllStories();
    const schedule = [];

    // 10 stories, each 2x = 20 story assignments
    // Spread across program weeks, roughly 1 per week
    const totalSlots = stories.length * 2;
    const weeksPerSlot = Math.floor(config.programWeeks / totalSlots);

    let weekCounter = 1;
    // First pass: each story once
    for (const story of stories) {
      schedule.push({
        weekNumber: weekCounter,
        storyId: story.id,
        attempt: 1,
      });
      weekCounter += Math.max(1, weeksPerSlot);
      if (weekCounter > config.programWeeks) weekCounter = config.programWeeks;
    }

    // Second pass: each story again
    weekCounter = Math.ceil(config.programWeeks / 2) + 1;
    for (const story of stories) {
      schedule.push({
        weekNumber: Math.min(weekCounter, config.programWeeks),
        storyId: story.id,
        attempt: 2,
      });
      weekCounter += Math.max(1, weeksPerSlot);
      if (weekCounter > config.programWeeks) weekCounter = config.programWeeks;
    }

    await DB.saveSchedule(schedule);
  }

  // --- App tonen ---

  function showApp() {
    document.getElementById('app-header').classList.remove('hidden');
    navigateTo('dashboard');
  }

  // --- Navigatie ---

  function toggleNav() {
    navOpen = !navOpen;
    const nav = document.getElementById('main-nav');
    nav.classList.toggle('hidden', !navOpen);
  }

  function navigateTo(view) {
    currentView = view;
    document.querySelectorAll('.view').forEach((v) => v.classList.add('hidden'));
    const viewEl = document.getElementById('view-' + view);
    if (viewEl) viewEl.classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });

    navOpen = false;
    document.getElementById('main-nav').classList.add('hidden');

    // View-specific initialization
    switch (view) {
      case 'dashboard': updateDashboard(); break;
      case 'questionnaire': renderQuestionnaire(); break;
      case 'story': loadCurrentStory(); break;
      case 'observations': updateObservations(); break;
      case 'progress': updateProgress(); break;
      case 'researcher': updateResearcher(); break;
      case 'settings': populateSettings(); break;
    }
  }

  // --- Weekberekening ---

  function getCurrentWeek() {
    if (!config.startDate) return 1;
    const start = new Date(config.startDate);
    const now = new Date();
    const diffMs = now - start;
    const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
    return Math.max(1, Math.min(diffWeeks, config.programWeeks));
  }

  // --- Dashboard ---

  async function updateDashboard() {
    const week = getCurrentWeek();
    document.getElementById('dashboard-greeting').textContent =
      'Welkom' + (config.participantId ? ', ' + config.participantId : '');
    document.getElementById('dashboard-week-info').textContent =
      'Week ' + week + ' van ' + config.programWeeks;

    // Check questionnaire status
    const questionnaires = await DB.getAllQuestionnaires();
    const thisWeekQ = questionnaires.filter(q => q.weekNumber === week);
    const qStatus = document.getElementById('dash-questionnaire-status');
    if (thisWeekQ.length > 0) {
      qStatus.textContent = thisWeekQ.length + 'x ingevuld deze week';
    } else {
      qStatus.textContent = 'Nog niet ingevuld deze week';
    }

    // Check story status
    const schedule = await DB.getSchedule();
    const thisWeekStories = schedule.filter(s => s.weekNumber === week);
    const storyResults = await DB.getAllStoryResults();
    const thisWeekResults = storyResults.filter(r => r.weekNumber === week);
    const sStatus = document.getElementById('dash-story-status');
    if (thisWeekStories.length === 0) {
      sStatus.textContent = 'Geen verhaal gepland deze week';
    } else if (thisWeekResults.length >= thisWeekStories.length) {
      sStatus.textContent = 'Casusverhaal afgerond deze week';
    } else {
      sStatus.textContent = thisWeekStories.length + ' verhaal/verhalen beschikbaar';
    }

    // Progress count
    const stats = await DB.getStats();
    document.getElementById('dash-progress-status').textContent =
      stats.questionnaires + ' vragenlijsten, ' + stats.stories + ' casussen';

    // Check if notification should show
    checkNotificationBanner();
  }

  function checkNotificationBanner() {
    const today = new Date().getDay();
    // Map: 1=ma, 2=di, 3=wo, 4=do, 5=vr
    const dayMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 };
    const isNotifyDay = today === config.notifyDay1 || today === config.notifyDay2;

    const banner = document.getElementById('dashboard-notification');
    if (isNotifyDay) {
      banner.classList.remove('hidden');
    } else {
      banner.classList.add('hidden');
    }
  }

  // --- Vragenlijst ---

  function renderQuestionnaire() {
    const container = document.getElementById('questionnaire-form');
    const submitBtn = document.getElementById('btn-submit-questionnaire');
    const doneMsg = document.getElementById('questionnaire-done');

    doneMsg.classList.add('hidden');
    submitBtn.classList.remove('hidden');
    container.classList.remove('hidden');

    let html = '';
    for (let i = 0; i < QUESTIONS.length; i++) {
      const q = QUESTIONS[i];
      html += '<div class="q-item" data-qid="' + q.id + '">';
      html += '  <div class="q-item-label">';
      html += '    <span class="q-item-number">' + (i + 1) + '</span>';
      html += '    ' + q.text;
      html += '  </div>';
      html += '  <div class="q-scale">';
      for (let v = 1; v <= 5; v++) {
        html += '    <button class="q-scale-btn" data-qid="' + q.id + '" data-value="' + v + '">' + v + '</button>';
      }
      html += '  </div>';
      html += '  <div class="q-scale-labels">';
      html += '    <span>Helemaal niet</span>';
      html += '    <span>Helemaal wel</span>';
      html += '  </div>';
      html += '</div>';
    }
    container.innerHTML = html;
  }

  function handleScaleClick(event) {
    const btn = event.target.closest('.q-scale-btn');
    if (!btn) return;

    const qid = btn.dataset.qid;
    const value = btn.dataset.value;

    // Deselect siblings
    const parent = btn.parentElement;
    parent.querySelectorAll('.q-scale-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  }

  async function submitQuestionnaire() {
    const responses = [];
    let allAnswered = true;

    for (const q of QUESTIONS) {
      const selected = document.querySelector('.q-scale-btn.selected[data-qid="' + q.id + '"]');
      if (!selected) {
        allAnswered = false;
        // Scroll to first unanswered
        const item = document.querySelector('.q-item[data-qid="' + q.id + '"]');
        if (item) item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      }
      responses.push({
        questionId: q.id,
        value: parseInt(selected.dataset.value, 10),
      });
    }

    if (!allAnswered) {
      alert('Beantwoord alle vragen voordat je opslaat.');
      return;
    }

    const data = {
      date: DB.formatDate(new Date()),
      weekNumber: getCurrentWeek(),
      responses: responses,
    };

    await DB.saveQuestionnaire(data);

    // Show done message
    document.getElementById('questionnaire-form').classList.add('hidden');
    document.getElementById('btn-submit-questionnaire').classList.add('hidden');
    document.getElementById('questionnaire-done').classList.remove('hidden');
  }

  // --- Casusverhalen ---

  async function loadCurrentStory() {
    const week = getCurrentWeek();
    const schedule = await DB.getSchedule();
    const storyResults = await DB.getAllStoryResults();

    // Find stories scheduled for this week that haven't been completed yet
    const thisWeekSchedule = schedule.filter(s => s.weekNumber === week);
    const completedIds = storyResults
      .filter(r => r.weekNumber === week)
      .map(r => r.storyId + '-' + r.attempt);

    const pending = thisWeekSchedule.filter(s => !completedIds.includes(s.storyId + '-' + s.attempt));

    if (pending.length === 0) {
      document.getElementById('story-none').classList.remove('hidden');
      document.getElementById('story-active').classList.add('hidden');
      return;
    }

    const next = pending[0];
    const story = StoriesModule.getStoryById(next.storyId);
    if (!story) {
      document.getElementById('story-none').classList.remove('hidden');
      document.getElementById('story-active').classList.add('hidden');
      return;
    }

    currentStory = story;
    currentStoryAttempt = next.attempt;
    storyIsRetry = false;
    selectedOptionIndex = -1;

    document.getElementById('story-none').classList.add('hidden');
    document.getElementById('story-active').classList.remove('hidden');
    document.getElementById('story-result').classList.add('hidden');
    document.getElementById('story-hint').classList.add('hidden');
    document.getElementById('btn-submit-answer').classList.remove('hidden');

    // Populate
    document.getElementById('story-badge').textContent =
      'Verhaal ' + story.id + ' van ' + StoriesModule.getStoryCount();
    document.getElementById('story-attempt-badge').textContent =
      'Poging ' + currentStoryAttempt;
    document.getElementById('story-title').textContent = story.title;
    document.getElementById('story-text').textContent = story.story;
    document.getElementById('story-question').textContent = story.question;

    // Render options
    let optHtml = '';
    for (let i = 0; i < story.options.length; i++) {
      optHtml += '<button class="story-option" data-index="' + i + '">' + story.options[i] + '</button>';
    }
    document.getElementById('story-options').innerHTML = optHtml;
  }

  function handleOptionClick(event) {
    const option = event.target.closest('.story-option');
    if (!option || option.classList.contains('disabled')) return;

    selectedOptionIndex = parseInt(option.dataset.index, 10);

    // Deselect all, select this one
    document.querySelectorAll('.story-option').forEach(o => {
      o.classList.remove('selected');
    });
    option.classList.add('selected');
  }

  async function submitAnswer() {
    if (selectedOptionIndex < 0 || !currentStory) {
      alert('Kies eerst een antwoord.');
      return;
    }

    const result = StoriesModule.evaluateAnswer(currentStory.id, selectedOptionIndex, storyIsRetry);

    if (result.score === -1) {
      // First attempt wrong -> show hint, allow retry
      document.getElementById('story-hint').classList.remove('hidden');
      document.getElementById('story-hint-text').textContent = result.hint;

      // Mark the wrong answer
      document.querySelectorAll('.story-option').forEach(o => {
        if (parseInt(o.dataset.index, 10) === selectedOptionIndex) {
          o.classList.add('incorrect');
          o.classList.add('disabled');
        }
        o.classList.remove('selected');
      });

      storyIsRetry = true;
      selectedOptionIndex = -1;
      return;
    }

    // Final result
    document.getElementById('btn-submit-answer').classList.add('hidden');

    // Mark options
    document.querySelectorAll('.story-option').forEach(o => {
      const idx = parseInt(o.dataset.index, 10);
      o.classList.add('disabled');
      if (idx === currentStory.correctIndex) {
        o.classList.add('correct');
      }
      if (idx === selectedOptionIndex && !result.correct) {
        o.classList.add('incorrect');
      }
    });

    // Show result
    const resultEl = document.getElementById('story-result');
    const iconEl = document.getElementById('story-result-icon');
    const titleEl = document.getElementById('story-result-title');
    const scoreEl = document.getElementById('story-result-score');
    const explEl = document.getElementById('story-result-explanation');

    iconEl.className = 'result-icon score-' + result.score;
    if (result.score === 2) {
      iconEl.textContent = '\u2713';
      titleEl.textContent = 'Uitstekend!';
      scoreEl.textContent = 'Score: 2/2 — Correct bij eerste poging';
    } else if (result.score === 1) {
      iconEl.textContent = '\u2713';
      titleEl.textContent = 'Goed!';
      scoreEl.textContent = 'Score: 1/2 — Correct na hint';
    } else {
      iconEl.textContent = '\u2717';
      titleEl.textContent = 'Helaas';
      scoreEl.textContent = 'Score: 0/2 — Niet correct';
    }

    explEl.textContent = result.explanation || '';
    resultEl.classList.remove('hidden');

    // Save result
    const data = {
      date: DB.formatDate(new Date()),
      weekNumber: getCurrentWeek(),
      storyId: currentStory.id,
      attempt: currentStoryAttempt,
      firstAnswer: storyIsRetry ? -1 : selectedOptionIndex,
      finalAnswer: selectedOptionIndex,
      score: result.score,
      hintUsed: storyIsRetry,
    };

    await DB.saveStoryResult(data);
  }

  function handleStoryContinue() {
    // Reload to check for more stories this week
    loadCurrentStory();
  }

  // --- Observaties ---

  async function updateObservations() {
    const observations = await DB.getAllObservations();
    const types = ['voor', 'na', 'follow-up'];

    for (const type of types) {
      const statusEl = document.getElementById('obs-status-' + type);
      const existing = observations.find(o => o.type === type);
      if (existing) {
        statusEl.textContent = 'Ingevuld op ' + existing.date;
        statusEl.className = 'obs-status done';
      } else {
        statusEl.textContent = 'Niet ingevuld';
        statusEl.className = 'obs-status not-done';
      }
    }

    document.getElementById('observation-form-container').classList.add('hidden');
  }

  function openObservationForm(type) {
    currentObsType = type;
    const titles = { 'voor': 'Voormeting', 'na': 'Nameting', 'follow-up': 'Follow-up' };
    document.getElementById('obs-form-title').textContent = titles[type] || 'Observatie';
    document.getElementById('obs-notes').value = '';
    document.getElementById('observation-form-container').classList.remove('hidden');
    document.getElementById('obs-notes').focus();
  }

  async function saveObservation() {
    const notes = document.getElementById('obs-notes').value.trim();
    if (!notes) {
      document.getElementById('obs-notes').focus();
      return;
    }

    const data = {
      date: DB.formatDate(new Date()),
      type: currentObsType,
      notes: notes,
    };

    await DB.saveObservation(data);
    showSaveIndicator();
    updateObservations();
  }

  // --- Voortgang ---

  async function updateProgress() {
    const questionnaires = await DB.getAllQuestionnaires();
    const storyResults = await DB.getAllStoryResults();

    document.getElementById('progress-q-count').textContent = questionnaires.length;
    document.getElementById('progress-s-count').textContent = storyResults.length;

    // Average story score
    if (storyResults.length > 0) {
      const avgScore = storyResults.reduce((sum, r) => sum + r.score, 0) / storyResults.length;
      document.getElementById('progress-avg-score').textContent = avgScore.toFixed(1);
    } else {
      document.getElementById('progress-avg-score').textContent = '-';
    }

    // Story scores chart
    renderStoryChart(storyResults);

    // Questionnaire trends chart
    renderQuestionnaireChart(questionnaires);
  }

  function renderStoryChart(results) {
    const container = document.getElementById('progress-chart');
    if (results.length === 0) {
      container.innerHTML = '<div class="progress-empty">Nog geen casusresultaten</div>';
      return;
    }

    const maxHeight = 80;
    let html = '';
    for (const r of results) {
      const height = (r.score / 2) * maxHeight;
      const scoreClass = r.score === 2 ? 'score-high' : r.score === 1 ? 'score-mid' : 'score-low';
      const story = StoriesModule.getStoryById(r.storyId);
      const label = story ? 'V' + story.id : r.storyId;

      html += '<div class="chart-bar-container">';
      html += '  <div class="chart-value">' + r.score + '</div>';
      html += '  <div class="chart-bar ' + scoreClass + '" style="height:' + Math.max(4, height) + 'px"></div>';
      html += '  <div class="chart-label">' + label + '</div>';
      html += '</div>';
    }
    container.innerHTML = html;
  }

  function renderQuestionnaireChart(questionnaires) {
    const container = document.getElementById('questionnaire-chart');
    if (questionnaires.length === 0) {
      container.innerHTML = '<div class="progress-empty">Nog geen vragenlijsten ingevuld</div>';
      return;
    }

    const maxHeight = 80;
    let html = '';

    for (const q of questionnaires) {
      const avgVal = q.responses.reduce((sum, r) => sum + r.value, 0) / q.responses.length;
      const height = (avgVal / 5) * maxHeight;
      const weekLabel = 'W' + q.weekNumber;

      html += '<div class="chart-bar-container">';
      html += '  <div class="chart-value">' + avgVal.toFixed(1) + '</div>';
      html += '  <div class="chart-bar q-bar" style="height:' + Math.max(4, height) + 'px"></div>';
      html += '  <div class="chart-label">' + weekLabel + '</div>';
      html += '</div>';
    }
    container.innerHTML = html;
  }

  // --- Onderzoekersportaal ---

  async function updateResearcher() {
    const questionnaires = await DB.getAllQuestionnaires();
    const storyResults = await DB.getAllStoryResults();
    const observations = await DB.getAllObservations();
    const week = getCurrentWeek();

    // Summary stats
    const rqCount = document.getElementById('researcher-q-count');
    const rsCount = document.getElementById('researcher-s-count');
    const rAvg = document.getElementById('researcher-avg');
    const rWeeks = document.getElementById('researcher-weeks');

    if (rqCount) rqCount.textContent = questionnaires.length;
    if (rsCount) rsCount.textContent = storyResults.length;
    if (rWeeks) rWeeks.textContent = week;

    if (storyResults.length > 0) {
      const avg = storyResults.reduce((s, r) => s + r.score, 0) / storyResults.length;
      if (rAvg) rAvg.textContent = avg.toFixed(1);
    } else {
      if (rAvg) rAvg.textContent = '-';
    }

    // Questionnaire table: per-category averages per entry
    const qTbody = document.getElementById('researcher-q-tbody');
    if (qTbody) {
      let html = '';
      if (questionnaires.length === 0) {
        html = '<tr><td colspan="6" style="text-align:center;padding:16px;color:#999;">Nog geen data</td></tr>';
      } else {
        for (const q of questionnaires) {
          const byCategory = { mentaliseren: [], stress: [], arousal: [] };
          for (const r of q.responses) {
            const qDef = QUESTIONS.find(qd => qd.id === r.questionId);
            if (qDef) byCategory[qDef.category].push(r.value);
          }
          const avgCat = (arr) => arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : '-';
          const totalAvg = q.responses.length > 0 ? (q.responses.reduce((s, r) => s + r.value, 0) / q.responses.length).toFixed(1) : '-';
          html += '<tr>';
          html += '<td>' + q.weekNumber + '</td>';
          html += '<td>' + q.date + '</td>';
          html += '<td>' + avgCat(byCategory.mentaliseren) + '</td>';
          html += '<td>' + avgCat(byCategory.stress) + '</td>';
          html += '<td>' + avgCat(byCategory.arousal) + '</td>';
          html += '<td><strong>' + totalAvg + '</strong></td>';
          html += '</tr>';
        }
      }
      qTbody.innerHTML = html;
    }

    // Story results table
    const sTbody = document.getElementById('researcher-s-tbody');
    if (sTbody) {
      let html = '';
      if (storyResults.length === 0) {
        html = '<tr><td colspan="6" style="text-align:center;padding:16px;color:#999;">Nog geen data</td></tr>';
      } else {
        for (const r of storyResults) {
          const story = StoriesModule.getStoryById(r.storyId);
          const title = story ? story.title : 'Verhaal ' + r.storyId;
          const scoreClass = r.score === 2 ? 'color:#4caf50' : r.score === 1 ? 'color:#ff9800' : 'color:#EA5045';
          html += '<tr>';
          html += '<td>' + r.weekNumber + '</td>';
          html += '<td>' + r.date + '</td>';
          html += '<td>' + title + '</td>';
          html += '<td>' + r.attempt + '</td>';
          html += '<td>' + (r.hintUsed ? 'Ja' : 'Nee') + '</td>';
          html += '<td style="font-weight:700;' + scoreClass + '">' + r.score + '/2</td>';
          html += '</tr>';
        }
      }
      sTbody.innerHTML = html;
    }

    // Trend chart: story scores over time
    const trendChart = document.getElementById('researcher-trend-chart');
    if (trendChart) {
      if (storyResults.length === 0) {
        trendChart.innerHTML = '<div class="progress-empty">Nog geen casusresultaten</div>';
      } else {
        const maxH = 80;
        let html = '';
        for (const r of storyResults) {
          const h = (r.score / 2) * maxH;
          const cls = r.score === 2 ? 'score-high' : r.score === 1 ? 'score-mid' : 'score-low';
          html += '<div class="chart-bar-container">';
          html += '<div class="chart-value">' + r.score + '</div>';
          html += '<div class="chart-bar ' + cls + '" style="height:' + Math.max(4, h) + 'px"></div>';
          html += '<div class="chart-label">W' + r.weekNumber + '</div>';
          html += '</div>';
        }
        trendChart.innerHTML = html;
      }
    }

    // Observations list
    const obsList = document.getElementById('researcher-obs-list');
    if (obsList) {
      if (observations.length === 0) {
        obsList.innerHTML = '<p style="color:#999;text-align:center;padding:16px;">Nog geen observaties</p>';
      } else {
        let html = '';
        for (const obs of observations) {
          const typeLabels = { 'voor': 'Voormeting', 'na': 'Nameting', 'follow-up': 'Follow-up' };
          html += '<div style="padding:12px;border-left:4px solid #6A167A;margin-bottom:8px;background:#f9f0fa;border-radius:0 8px 8px 0;">';
          html += '<strong>' + (typeLabels[obs.type] || obs.type) + '</strong> — ' + obs.date;
          html += '<p style="margin-top:4px;font-size:0.9rem;color:#555;">' + obs.notes + '</p>';
          html += '</div>';
        }
        obsList.innerHTML = html;
      }
    }
  }

  // --- Instellingen ---

  async function populateSettings() {
    document.getElementById('settings-participant-id').value = config.participantId;
    document.getElementById('settings-program-weeks').value = config.programWeeks;
    document.getElementById('settings-notify-day1').value = config.notifyDay1;
    document.getElementById('settings-notify-day2').value = config.notifyDay2;

    const stats = await DB.getStats();
    document.getElementById('data-count-q').textContent = stats.questionnaires;
    document.getElementById('data-count-s').textContent = stats.stories;
    document.getElementById('data-count-o').textContent = stats.observations;

    // Render schedule editor
    await renderScheduleEditor();
  }

  async function renderScheduleEditor() {
    const container = document.getElementById('schedule-editor');
    const schedule = await DB.getSchedule();
    const stories = StoriesModule.getAllStories();

    // Group by week
    let html = '';
    for (let week = 1; week <= config.programWeeks; week++) {
      const weekItems = schedule.filter(s => s.weekNumber === week);
      if (weekItems.length === 0) continue;

      for (const item of weekItems) {
        html += '<div class="schedule-row">';
        html += '  <span class="schedule-week">Week ' + week + '</span>';
        html += '  <select class="schedule-story-select" data-week="' + week + '" data-attempt="' + item.attempt + '">';
        html += '    <option value="">-- Geen --</option>';
        for (const s of stories) {
          const sel = s.id === item.storyId ? ' selected' : '';
          html += '    <option value="' + s.id + '"' + sel + '>' + s.title + ' (poging ' + item.attempt + ')</option>';
        }
        html += '  </select>';
        html += '</div>';
      }
    }

    if (!html) {
      html = '<p class="info-text">Geen planning gevonden. Sla de instellingen opnieuw op om een standaardplanning te genereren.</p>';
    }

    container.innerHTML = html;
  }

  async function handleSaveSettings() {
    const pid = document.getElementById('settings-participant-id').value.trim();
    const weeks = parseInt(document.getElementById('settings-program-weeks').value, 10);

    if (!pid) { document.getElementById('settings-participant-id').focus(); return; }
    if (isNaN(weeks) || weeks < 15 || weeks > 30) { document.getElementById('settings-program-weeks').focus(); return; }

    config.participantId = pid;
    config.programWeeks = weeks;
    await saveConfig();
    showSaveIndicator();
  }

  async function handleSaveSchedule() {
    const selects = document.querySelectorAll('.schedule-story-select');
    const schedule = [];

    selects.forEach(sel => {
      const week = parseInt(sel.dataset.week, 10);
      const attempt = parseInt(sel.dataset.attempt, 10);
      const storyId = parseInt(sel.value, 10);
      if (storyId && !isNaN(storyId)) {
        schedule.push({ weekNumber: week, storyId, attempt });
      }
    });

    await DB.saveSchedule(schedule);
    showSaveIndicator();
  }

  async function handleSaveNotifications() {
    config.notifyDay1 = parseInt(document.getElementById('settings-notify-day1').value, 10);
    config.notifyDay2 = parseInt(document.getElementById('settings-notify-day2').value, 10);
    await saveConfig();
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
      function onOk() { cleanup(); resolve(true); }
      function onCancel() { cleanup(); resolve(false); }

      okBtn.addEventListener('click', onOk);
      cancelBtn.addEventListener('click', onCancel);
    });
  }

  async function handleDeleteData() {
    const confirmed = await showConfirmDialog(
      'Alle data wissen?',
      'Dit verwijdert alle gegevens permanent. Deze actie kan niet ongedaan worden gemaakt.'
    );
    if (confirmed) {
      await DB.clearAllData();
      window.location.reload();
    }
  }

  // --- Notificaties ---

  function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  function scheduleNotificationCheck() {
    // Check every hour if it's time for a notification
    setInterval(() => {
      const now = new Date();
      const day = now.getDay();
      const hour = now.getHours();

      if ((day === config.notifyDay1 || day === config.notifyDay2) && hour === 9) {
        showLocalNotification();
      }
    }, 60 * 60 * 1000); // Check every hour
  }

  function showLocalNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('MentaTrack', {
        body: 'Het is tijd om je vragenlijst en casusverhaal in te vullen!',
        icon: 'icons/icon-192.png',
        badge: 'icons/icon-96.png',
      });
    }
  }

  function testNotification() {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('MentaTrack - Test', {
          body: 'Dit is een testmelding. De meldingen werken!',
          icon: 'icons/icon-192.png',
        });
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(perm => {
          if (perm === 'granted') {
            new Notification('MentaTrack - Test', {
              body: 'Meldingen zijn ingeschakeld!',
              icon: 'icons/icon-192.png',
            });
          }
        });
      } else {
        alert('Meldingen zijn geblokkeerd. Ga naar de browserinstellingen om dit te wijzigen.');
      }
    } else {
      alert('Deze browser ondersteunt geen meldingen.');
    }
  }

  // --- Opslaanindicator ---

  function showSaveIndicator() {
    const indicator = document.getElementById('save-indicator');
    indicator.classList.remove('hidden');
    clearTimeout(indicator._timeout);
    indicator._timeout = setTimeout(() => {
      indicator.classList.add('hidden');
    }, 1500);
  }

  // --- Event Listeners ---

  function bindEvents() {
    // Privacy & Setup
    document.getElementById('btn-accept-privacy').addEventListener('click', hidePrivacyOverlay);
    document.getElementById('btn-save-setup').addEventListener('click', handleSetupSave);

    // Header
    document.getElementById('btn-menu').addEventListener('click', toggleNav);

    // Navigation
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => navigateTo(btn.dataset.view));
    });

    // Dashboard
    document.getElementById('dash-card-questionnaire').addEventListener('click', () => navigateTo('questionnaire'));
    document.getElementById('dash-card-story').addEventListener('click', () => navigateTo('story'));
    document.getElementById('dash-card-progress').addEventListener('click', () => navigateTo('progress'));
    document.getElementById('btn-start-session').addEventListener('click', () => navigateTo('questionnaire'));

    // Questionnaire
    document.getElementById('questionnaire-form').addEventListener('click', handleScaleClick);
    document.getElementById('btn-submit-questionnaire').addEventListener('click', submitQuestionnaire);
    document.getElementById('btn-questionnaire-back').addEventListener('click', () => navigateTo('dashboard'));

    // Story
    document.getElementById('story-options').addEventListener('click', handleOptionClick);
    document.getElementById('btn-submit-answer').addEventListener('click', submitAnswer);
    document.getElementById('btn-story-continue').addEventListener('click', handleStoryContinue);
    document.getElementById('btn-story-back-none').addEventListener('click', () => navigateTo('dashboard'));

    // Observations
    document.querySelectorAll('.btn-obs-fill').forEach(btn => {
      btn.addEventListener('click', () => openObservationForm(btn.dataset.type));
    });
    document.getElementById('btn-obs-cancel').addEventListener('click', () => {
      document.getElementById('observation-form-container').classList.add('hidden');
    });
    document.getElementById('btn-obs-save').addEventListener('click', saveObservation);

    // Progress
    document.getElementById('btn-export-all').addEventListener('click', () => ExportModule.exportAll());

    // Researcher
    const researcherExportBtn = document.getElementById('btn-researcher-export');
    if (researcherExportBtn) researcherExportBtn.addEventListener('click', () => ExportModule.exportAll());

    // Settings
    document.getElementById('btn-save-settings').addEventListener('click', handleSaveSettings);
    document.getElementById('btn-save-schedule').addEventListener('click', handleSaveSchedule);
    document.getElementById('btn-save-notifications').addEventListener('click', handleSaveNotifications);
    document.getElementById('btn-test-notification').addEventListener('click', testNotification);
    document.getElementById('btn-delete-data').addEventListener('click', handleDeleteData);
  }

  // --- Start ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init, getCurrentWeek };
})();
