/**
 * app.js — MentaTrack hoofdmodule
 * Rolgebaseerd: deelnemer (begeleider) vs admin (onderzoeker)
 */
const App = (() => {
  'use strict';

  let config = { participantId: '', programWeeks: 20, startDate: '', notifyDay1: 3, notifyDay2: 5 };
  let currentRole = ''; // 'deelnemer' or 'admin'
  let currentView = '';
  let navOpen = false;
  let currentStory = null;
  let currentStoryAttempt = 1;
  let storyIsRetry = false;
  let currentObsType = '';

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

  // --- Init ---
  async function init() {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
    await DB.openDB();
    const setupDone = await DB.getSetting('setupDone');
    if (!setupDone) {
      document.getElementById('privacy-overlay').classList.remove('hidden');
    } else {
      await loadConfig();
      currentRole = await DB.getSetting('role') || 'deelnemer';
      showApp();
    }
    bindEvents();
  }

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

  // --- Privacy & Role & Setup ---
  function hidePrivacy() {
    document.getElementById('privacy-overlay').classList.add('hidden');
    document.getElementById('role-overlay').classList.remove('hidden');
  }

  async function selectRole(role) {
    currentRole = role;
    await DB.setSetting('role', role);
    document.getElementById('role-overlay').classList.add('hidden');
    if (role === 'deelnemer') {
      document.getElementById('setup-deelnemer-overlay').classList.remove('hidden');
    } else {
      document.getElementById('setup-start-date').value = DB.formatDate(new Date());
      document.getElementById('setup-admin-overlay').classList.remove('hidden');
    }
  }

  async function handleSetupDeelnemer() {
    const pid = document.getElementById('setup-participant-id').value.trim();
    if (!pid) { document.getElementById('setup-participant-id').focus(); return; }
    config.participantId = pid;
    config.startDate = DB.formatDate(new Date());
    await saveConfig();
    await DB.setSetting('setupDone', true);
    await generateDefaultSchedule();
    document.getElementById('setup-deelnemer-overlay').classList.add('hidden');
    showApp();
  }

  async function handleSetupAdmin() {
    const pid = document.getElementById('setup-admin-pid').value.trim();
    const weeks = parseInt(document.getElementById('setup-program-weeks').value, 10);
    const start = document.getElementById('setup-start-date').value;
    if (!pid) { document.getElementById('setup-admin-pid').focus(); return; }
    if (isNaN(weeks) || weeks < 15 || weeks > 30) { document.getElementById('setup-program-weeks').focus(); return; }
    if (!start) { document.getElementById('setup-start-date').focus(); return; }
    config.participantId = pid;
    config.programWeeks = weeks;
    config.startDate = start;
    config.notifyDay1 = parseInt(document.getElementById('setup-notify-day1').value, 10);
    config.notifyDay2 = parseInt(document.getElementById('setup-notify-day2').value, 10);
    await saveConfig();
    await DB.setSetting('setupDone', true);
    await generateDefaultSchedule();
    document.getElementById('setup-admin-overlay').classList.add('hidden');
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    showApp();
  }

  async function generateDefaultSchedule() {
    const stories = StoriesModule.getAllStories();
    const schedule = [];
    let w = 1;
    for (const s of stories) { schedule.push({ weekNumber: w, storyId: s.id, attempt: 1 }); w++; if (w > config.programWeeks) w = config.programWeeks; }
    w = Math.ceil(config.programWeeks / 2) + 1;
    for (const s of stories) { schedule.push({ weekNumber: Math.min(w, config.programWeeks), storyId: s.id, attempt: 2 }); w++; if (w > config.programWeeks) w = config.programWeeks; }
    await DB.saveSchedule(schedule);
  }

  // --- Show App ---
  function showApp() {
    document.getElementById('app-header').classList.remove('hidden');
    if (currentRole === 'admin') {
      document.getElementById('admin-nav').classList.remove('hidden');
      document.getElementById('deelnemer-nav').classList.add('hidden');
      navigateTo('admin-dashboard');
    } else {
      document.getElementById('deelnemer-nav').classList.remove('hidden');
      document.getElementById('admin-nav').classList.add('hidden');
      navigateTo('dashboard');
    }
  }

  // --- Navigation ---
  function toggleNav() {
    navOpen = !navOpen;
    const nav = currentRole === 'admin' ? document.getElementById('admin-nav') : document.getElementById('deelnemer-nav');
    nav.classList.toggle('hidden', !navOpen);
  }

  function navigateTo(view) {
    currentView = view;
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    const el = document.getElementById('view-' + view);
    if (el) el.classList.remove('hidden');
    // Update nav active states
    const navId = currentRole === 'admin' ? 'admin-nav' : 'deelnemer-nav';
    document.querySelectorAll('#' + navId + ' .nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });
    navOpen = false;
    const nav = document.getElementById(navId);
    if (nav) nav.classList.add('hidden');

    switch (view) {
      case 'dashboard': updateDashboard(); break;
      case 'admin-dashboard': updateAdminDashboard(); break;
      case 'questionnaire': renderQuestionnaire(); break;
      case 'story': loadCurrentStory(); break;
      case 'observations': updateObservations(); break;
      case 'researcher': updateResearcher(); break;
      case 'settings': populateSettings(); break;
    }
  }

  function getCurrentWeek() {
    if (!config.startDate) return 1;
    const start = new Date(config.startDate);
    const diffWeeks = Math.floor((new Date() - start) / (7 * 24 * 60 * 60 * 1000)) + 1;
    return Math.max(1, Math.min(diffWeeks, config.programWeeks));
  }

  // --- Deelnemer Dashboard ---
  async function updateDashboard() {
    const week = getCurrentWeek();
    document.getElementById('dashboard-greeting').textContent = 'Welkom' + (config.participantId ? ', ' + config.participantId : '');
    document.getElementById('dashboard-week-info').textContent = 'Week ' + week + ' van ' + config.programWeeks;
    const questionnaires = await DB.getAllQuestionnaires();
    const thisWeekQ = questionnaires.filter(q => q.weekNumber === week);
    document.getElementById('dash-questionnaire-status').textContent = thisWeekQ.length > 0 ? thisWeekQ.length + 'x ingevuld' : 'Nog niet ingevuld deze week';
    const schedule = await DB.getSchedule();
    const storyResults = await DB.getAllStoryResults();
    const thisWeekStories = schedule.filter(s => s.weekNumber === week);
    const thisWeekDone = storyResults.filter(r => r.weekNumber === week);
    // Prototype mode: show total completed vs total available
    const totalDone = storyResults.length;
    const totalAvailable = StoriesModule.getStoryCount() * 2; // each story 2x
    document.getElementById('dash-story-status').textContent = totalDone >= totalAvailable ? 'Alle casussen afgerond' : (totalAvailable - totalDone) + ' casussen beschikbaar';
  }

  // --- Admin Dashboard ---
  async function updateAdminDashboard() {
    const week = getCurrentWeek();
    document.getElementById('admin-week-info').textContent = 'Week ' + week + ' van ' + config.programWeeks;
    const stats = await DB.getStats();
    document.getElementById('admin-q-count').textContent = stats.questionnaires;
    document.getElementById('admin-s-count').textContent = stats.stories;
    document.getElementById('admin-o-count').textContent = stats.observations;
    document.getElementById('admin-week').textContent = week;
  }

  // --- Questionnaire ---
  function renderQuestionnaire() {
    const container = document.getElementById('questionnaire-form');
    document.getElementById('questionnaire-done').classList.add('hidden');
    document.getElementById('btn-submit-questionnaire').classList.remove('hidden');
    container.classList.remove('hidden');
    let html = '';
    for (let i = 0; i < QUESTIONS.length; i++) {
      const q = QUESTIONS[i];
      html += '<div class="q-item" data-qid="' + q.id + '"><div class="q-item-label"><span class="q-item-number">' + (i+1) + '</span>' + q.text + '</div><div class="q-scale">';
      for (let v = 1; v <= 5; v++) html += '<button class="q-scale-btn" data-qid="' + q.id + '" data-value="' + v + '">' + v + '</button>';
      html += '</div><div class="q-scale-labels"><span>Helemaal niet</span><span>Helemaal wel</span></div></div>';
    }
    container.innerHTML = html;
  }

  function handleScaleClick(e) {
    const btn = e.target.closest('.q-scale-btn');
    if (!btn) return;
    btn.parentElement.querySelectorAll('.q-scale-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  }

  async function submitQuestionnaire() {
    const responses = [];
    for (const q of QUESTIONS) {
      const sel = document.querySelector('.q-scale-btn.selected[data-qid="' + q.id + '"]');
      if (!sel) { document.querySelector('.q-item[data-qid="' + q.id + '"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); alert('Beantwoord alle vragen.'); return; }
      responses.push({ questionId: q.id, value: parseInt(sel.dataset.value, 10) });
    }
    await DB.saveQuestionnaire({ date: DB.formatDate(new Date()), weekNumber: getCurrentWeek(), responses });
    document.getElementById('questionnaire-form').classList.add('hidden');
    document.getElementById('btn-submit-questionnaire').classList.add('hidden');
    document.getElementById('questionnaire-done').classList.remove('hidden');
  }

  // --- Stories (open text) ---
  // PROTOTYPE MODE: all stories available immediately, sequentially
  // In production, filter by weekNumber === getCurrentWeek()
  async function loadCurrentStory() {
    const results = await DB.getAllStoryResults();
    const allStories = StoriesModule.getAllStories();

    // Find next story not yet completed (any attempt)
    let next = null;
    for (const story of allStories) {
      // Check attempt 1
      if (!results.some(r => r.storyId === story.id && r.attempt === 1)) {
        next = { storyId: story.id, attempt: 1 }; break;
      }
      // Check attempt 2
      if (!results.some(r => r.storyId === story.id && r.attempt === 2)) {
        next = { storyId: story.id, attempt: 2 }; break;
      }
    }

    if (!next) {
      document.getElementById('story-none').classList.remove('hidden');
      document.getElementById('story-active').classList.add('hidden');
      return;
    }
    currentStory = StoriesModule.getStoryById(next.storyId);
    if (!currentStory) { document.getElementById('story-none').classList.remove('hidden'); document.getElementById('story-active').classList.add('hidden'); return; }
    currentStoryAttempt = next.attempt;
    storyIsRetry = false;
    document.getElementById('story-none').classList.add('hidden');
    document.getElementById('story-active').classList.remove('hidden');
    document.getElementById('story-result').classList.add('hidden');
    document.getElementById('story-hint').classList.add('hidden');
    document.getElementById('btn-submit-answer').classList.remove('hidden');
    document.getElementById('story-answer').value = '';
    document.getElementById('story-char-count').textContent = '0';
    document.getElementById('story-badge').textContent = 'Casus ' + currentStory.id + ' van ' + StoriesModule.getStoryCount();
    document.getElementById('story-attempt-badge').textContent = 'Poging ' + currentStoryAttempt;
    document.getElementById('story-title').textContent = currentStory.title;
    document.getElementById('story-text').textContent = currentStory.story;
    document.getElementById('story-question').textContent = currentStory.question;
  }

  async function submitStoryAnswer() {
    if (!currentStory) return;
    const textarea = document.getElementById('story-answer');
    const answer = textarea.value.trim();
    if (!answer) { textarea.focus(); return; }
    const result = StoriesModule.evaluateOpenAnswer(currentStory.id, answer, storyIsRetry);
    if (result.needsHint) {
      document.getElementById('story-hint').classList.remove('hidden');
      document.getElementById('story-hint-text').textContent = result.hint;
      storyIsRetry = true;
      return;
    }
    document.getElementById('btn-submit-answer').classList.add('hidden');
    document.getElementById('story-result').classList.remove('hidden');
    const data = {
      date: DB.formatDate(new Date()), weekNumber: getCurrentWeek(), storyId: currentStory.id,
      attempt: currentStoryAttempt, answerText: storyIsRetry ? '' : answer,
      revisedText: storyIsRetry ? answer : '', autoScore: result.autoScore,
      manualScore: null, hintUsed: storyIsRetry, researcherNote: ''
    };
    if (storyIsRetry) data.answerText = document.getElementById('story-answer').defaultValue || answer;
    await DB.saveStoryResult(data);
  }

  // --- Observations ---
  async function updateObservations() {
    const observations = await DB.getAllObservations();
    for (const type of ['voor', 'na', 'follow-up']) {
      const el = document.getElementById('obs-status-' + type);
      const existing = observations.find(o => o.type === type);
      if (existing) { el.textContent = 'Ingevuld ' + existing.date; el.className = 'obs-status done'; }
      else { el.textContent = 'Niet ingevuld'; el.className = 'obs-status not-done'; }
    }
    document.getElementById('observation-form-container').classList.add('hidden');
  }

  function openObsForm(type) {
    currentObsType = type;
    document.getElementById('obs-form-title').textContent = { voor: 'Voormeting (T0)', na: 'Nameting (T1)', 'follow-up': 'Follow-up (T2)' }[type] || 'Observatie';
    document.getElementById('obs-notes').value = '';
    document.getElementById('observation-form-container').classList.remove('hidden');
  }

  async function saveObs() {
    const notes = document.getElementById('obs-notes').value.trim();
    if (!notes) { document.getElementById('obs-notes').focus(); return; }
    await DB.saveObservation({ date: DB.formatDate(new Date()), type: currentObsType, notes });
    showSave();
    updateObservations();
  }

  // --- Researcher Portal ---
  async function updateResearcher() {
    const questionnaires = await DB.getAllQuestionnaires();
    const storyResults = await DB.getAllStoryResults();
    const observations = await DB.getAllObservations();

    document.getElementById('researcher-q-count').textContent = questionnaires.length;
    document.getElementById('researcher-s-count').textContent = storyResults.length;
    if (storyResults.length > 0) {
      const scores = storyResults.map(r => r.manualScore !== null && r.manualScore !== undefined ? r.manualScore : r.autoScore);
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      document.getElementById('researcher-avg').textContent = avg.toFixed(1);
    } else { document.getElementById('researcher-avg').textContent = '-'; }

    // Questionnaire table
    const qTbody = document.getElementById('researcher-q-tbody');
    if (questionnaires.length === 0) { qTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:16px;color:#999;">Nog geen data</td></tr>'; }
    else {
      let h = '';
      for (const q of questionnaires) {
        const cats = { mentaliseren: [], stress: [], arousal: [] };
        for (const r of q.responses) { const def = QUESTIONS.find(d => d.id === r.questionId); if (def) cats[def.category].push(r.value); }
        const avg = arr => arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : '-';
        const tot = q.responses.length ? (q.responses.reduce((s,r)=>s+r.value,0)/q.responses.length).toFixed(1) : '-';
        h += '<tr><td>'+q.weekNumber+'</td><td>'+q.date+'</td><td>'+avg(cats.mentaliseren)+'</td><td>'+avg(cats.stress)+'</td><td>'+avg(cats.arousal)+'</td><td><strong>'+tot+'</strong></td></tr>';
      }
      qTbody.innerHTML = h;
    }

    // Story cards with score adjustment
    const cardsEl = document.getElementById('researcher-story-cards');
    if (storyResults.length === 0) { cardsEl.innerHTML = '<p style="color:#999;text-align:center;padding:16px;">Nog geen casusantwoorden</p>'; }
    else {
      let h = '';
      for (const r of storyResults) {
        const story = StoriesModule.getStoryById(r.storyId);
        const title = story ? story.title : 'Casus ' + r.storyId;
        const effectiveScore = r.manualScore !== null && r.manualScore !== undefined ? r.manualScore : r.autoScore;
        const scoreClass = effectiveScore === 2 ? 'score-2' : effectiveScore === 1 ? 'score-1' : 'score-0';
        const modelAnswer = story ? story.modelAnswer : '';
        h += '<div class="score-card" data-record-id="' + r._id + '">';
        h += '<div class="score-card-header"><h4>W' + r.weekNumber + ' — ' + title + ' (poging ' + r.attempt + ')</h4><span class="score-badge ' + scoreClass + '">' + effectiveScore + '/2</span></div>';
        h += '<div class="answer-text">' + (r.answerText || r.revisedText || '<em>Geen antwoord</em>') + '</div>';
        if (r.revisedText && r.answerText) h += '<div class="answer-text" style="border-left:3px solid #ff9800;"><strong>Herzien:</strong> ' + r.revisedText + '</div>';
        if (modelAnswer) h += '<div class="model-answer-toggle" onclick="this.nextElementSibling.classList.toggle(\'visible\')">Modelantwoord tonen/verbergen</div><div class="model-answer">' + modelAnswer + '</div>';
        h += '<div class="score-adjust"><select class="score-select" data-id="' + r._id + '"><option value=""' + (r.manualScore === null || r.manualScore === undefined ? ' selected' : '') + '>Auto (' + (r.autoScore||0) + ')</option><option value="0"' + (r.manualScore === 0 ? ' selected' : '') + '>0</option><option value="1"' + (r.manualScore === 1 ? ' selected' : '') + '>1</option><option value="2"' + (r.manualScore === 2 ? ' selected' : '') + '>2</option></select>';
        h += '<input class="score-note" data-id="' + r._id + '" placeholder="Toelichting..." value="' + (r.researcherNote || '') + '">';
        h += '<button class="btn btn-primary btn-small" onclick="App.saveScore(' + r._id + ')">Opslaan</button></div>';
        h += '</div>';
      }
      cardsEl.innerHTML = h;
    }

    // Trend chart
    const chart = document.getElementById('researcher-trend-chart');
    if (storyResults.length === 0) { chart.innerHTML = '<div class="progress-empty">Nog geen data</div>'; }
    else {
      let h = '';
      for (const r of storyResults) {
        const s = r.manualScore !== null && r.manualScore !== undefined ? r.manualScore : (r.autoScore || 0);
        const cls = s === 2 ? 'score-high' : s === 1 ? 'score-mid' : 'score-low';
        h += '<div class="chart-bar-container"><div class="chart-value">' + s + '</div><div class="chart-bar ' + cls + '" style="height:' + Math.max(4, (s/2)*80) + 'px"></div><div class="chart-label">W' + r.weekNumber + '</div></div>';
      }
      chart.innerHTML = h;
    }

    // Observations
    const obsList = document.getElementById('researcher-obs-list');
    if (observations.length === 0) { obsList.innerHTML = '<p style="color:#999;text-align:center;padding:16px;">Nog geen observaties</p>'; }
    else {
      let h = '';
      for (const o of observations) {
        h += '<div style="padding:12px;border-left:4px solid #6A167A;margin-bottom:8px;background:#f9f0fa;border-radius:0 8px 8px 0;"><strong>' + ({voor:'Voormeting (T0)',na:'Nameting (T1)','follow-up':'Follow-up (T2)'}[o.type]||o.type) + '</strong> — ' + o.date + '<p style="margin-top:4px;font-size:0.9rem;color:#555;">' + o.notes + '</p></div>';
      }
      obsList.innerHTML = h;
    }
  }

  async function saveScore(recordId) {
    const select = document.querySelector('.score-select[data-id="' + recordId + '"]');
    const noteInput = document.querySelector('.score-note[data-id="' + recordId + '"]');
    const val = select.value;
    const manualScore = val === '' ? null : parseInt(val, 10);
    const note = noteInput ? noteInput.value : '';
    if (manualScore !== null) {
      await DB.updateStoryScore(recordId, manualScore, note);
    }
    showSave();
    updateResearcher();
  }

  // --- Settings ---
  async function populateSettings() {
    document.getElementById('settings-participant-id').value = config.participantId;
    document.getElementById('settings-program-weeks').value = config.programWeeks;
    document.getElementById('settings-notify-day1').value = config.notifyDay1;
    document.getElementById('settings-notify-day2').value = config.notifyDay2;
    const stats = await DB.getStats();
    document.getElementById('data-count-q').textContent = stats.questionnaires;
    document.getElementById('data-count-s').textContent = stats.stories;
    document.getElementById('data-count-o').textContent = stats.observations;
    await renderScheduleEditor();
  }

  async function renderScheduleEditor() {
    const container = document.getElementById('schedule-editor');
    const schedule = await DB.getSchedule();
    const stories = StoriesModule.getAllStories();
    let html = '';
    for (let w = 1; w <= config.programWeeks; w++) {
      const items = schedule.filter(s => s.weekNumber === w);
      for (const item of items) {
        html += '<div class="schedule-row"><span class="schedule-week">Week ' + w + '</span><select class="schedule-story-select" data-week="' + w + '" data-attempt="' + item.attempt + '">';
        html += '<option value="">-- Geen --</option>';
        for (const s of stories) html += '<option value="' + s.id + '"' + (s.id === item.storyId ? ' selected' : '') + '>' + s.title + ' (p' + item.attempt + ')</option>';
        html += '</select></div>';
      }
    }
    container.innerHTML = html || '<p class="info-text">Geen planning gevonden.</p>';
  }

  async function handleSaveSettings() {
    const pid = document.getElementById('settings-participant-id').value.trim();
    const weeks = parseInt(document.getElementById('settings-program-weeks').value, 10);
    if (!pid || isNaN(weeks) || weeks < 15 || weeks > 30) return;
    config.participantId = pid; config.programWeeks = weeks;
    await saveConfig(); showSave();
  }

  async function handleSaveSchedule() {
    const schedule = [];
    document.querySelectorAll('.schedule-story-select').forEach(sel => {
      const w = parseInt(sel.dataset.week, 10), a = parseInt(sel.dataset.attempt, 10), sid = parseInt(sel.value, 10);
      if (sid && !isNaN(sid)) schedule.push({ weekNumber: w, storyId: sid, attempt: a });
    });
    await DB.saveSchedule(schedule); showSave();
  }

  async function handleSaveNotifications() {
    config.notifyDay1 = parseInt(document.getElementById('settings-notify-day1').value, 10);
    config.notifyDay2 = parseInt(document.getElementById('settings-notify-day2').value, 10);
    await saveConfig(); showSave();
  }

  // --- Confirm Dialog ---
  function showConfirmDialog(title, message) {
    return new Promise(resolve => {
      document.getElementById('confirm-title').textContent = title;
      document.getElementById('confirm-message').textContent = message;
      document.getElementById('confirm-dialog').classList.remove('hidden');
      const ok = document.getElementById('btn-confirm-ok'), cancel = document.getElementById('btn-confirm-cancel');
      function cleanup() { document.getElementById('confirm-dialog').classList.add('hidden'); ok.removeEventListener('click', onOk); cancel.removeEventListener('click', onCancel); }
      function onOk() { cleanup(); resolve(true); }
      function onCancel() { cleanup(); resolve(false); }
      ok.addEventListener('click', onOk); cancel.addEventListener('click', onCancel);
    });
  }

  async function handleDeleteData() {
    if (await showConfirmDialog('Alle data wissen?', 'Dit verwijdert alles permanent.')) { await DB.clearAllData(); window.location.reload(); }
  }

  function testNotification() {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') new Notification('MentaTrack - Test', { body: 'Meldingen werken!' });
      else if (Notification.permission === 'default') Notification.requestPermission().then(p => { if (p === 'granted') new Notification('MentaTrack', { body: 'Meldingen ingeschakeld!' }); });
      else alert('Meldingen geblokkeerd in browserinstellingen.');
    }
  }

  function showSave() {
    const el = document.getElementById('save-indicator');
    el.classList.remove('hidden');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.add('hidden'), 1500);
  }

  // --- Events ---
  function bindEvents() {
    document.getElementById('btn-accept-privacy').addEventListener('click', hidePrivacy);
    document.getElementById('btn-role-deelnemer').addEventListener('click', () => selectRole('deelnemer'));
    document.getElementById('btn-role-admin').addEventListener('click', () => selectRole('admin'));
    document.getElementById('btn-save-setup-deelnemer').addEventListener('click', handleSetupDeelnemer);
    document.getElementById('btn-save-setup-admin').addEventListener('click', handleSetupAdmin);
    document.getElementById('btn-menu').addEventListener('click', toggleNav);

    // Nav items (both navs)
    document.querySelectorAll('.nav-item').forEach(btn => btn.addEventListener('click', () => navigateTo(btn.dataset.view)));

    // Dashboard
    document.getElementById('dash-card-questionnaire').addEventListener('click', () => navigateTo('questionnaire'));
    document.getElementById('dash-card-story').addEventListener('click', () => navigateTo('story'));
    const startBtn = document.getElementById('btn-start-session');
    if (startBtn) startBtn.addEventListener('click', () => navigateTo('questionnaire'));

    // Questionnaire
    document.getElementById('questionnaire-form').addEventListener('click', handleScaleClick);
    document.getElementById('btn-submit-questionnaire').addEventListener('click', submitQuestionnaire);
    document.getElementById('btn-questionnaire-back').addEventListener('click', () => navigateTo(currentRole === 'admin' ? 'admin-dashboard' : 'dashboard'));

    // Story
    document.getElementById('btn-submit-answer').addEventListener('click', submitStoryAnswer);
    document.getElementById('btn-story-continue').addEventListener('click', () => loadCurrentStory());
    document.getElementById('btn-story-back-none').addEventListener('click', () => navigateTo(currentRole === 'admin' ? 'admin-dashboard' : 'dashboard'));
    document.getElementById('story-answer').addEventListener('input', function() {
      document.getElementById('story-char-count').textContent = this.value.length;
    });

    // Observations
    document.querySelectorAll('.btn-obs-fill').forEach(btn => btn.addEventListener('click', () => openObsForm(btn.dataset.type)));
    document.getElementById('btn-obs-cancel').addEventListener('click', () => document.getElementById('observation-form-container').classList.add('hidden'));
    document.getElementById('btn-obs-save').addEventListener('click', saveObs);

    // Researcher
    const resExp = document.getElementById('btn-researcher-export');
    if (resExp) resExp.addEventListener('click', () => ExportModule.exportAll());

    // Settings
    document.getElementById('btn-save-settings').addEventListener('click', handleSaveSettings);
    document.getElementById('btn-save-schedule').addEventListener('click', handleSaveSchedule);
    document.getElementById('btn-save-notifications').addEventListener('click', handleSaveNotifications);
    document.getElementById('btn-test-notification').addEventListener('click', testNotification);
    document.getElementById('btn-delete-data').addEventListener('click', handleDeleteData);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return { init, getCurrentWeek, navigateTo, saveScore };
})();
