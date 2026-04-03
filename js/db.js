/**
 * db.js — Database-module (IndexedDB) met encryptie
 *
 * Beheert alle CRUD-operaties voor de MentaTrack app.
 * Data wordt versleuteld opgeslagen via CryptoModule.
 *
 * Schema:
 *   Store "questionnaires": key = auto-increment
 *     Waarde (na decryptie): {
 *       id, date, weekNumber, responses: [{ questionId, value }]
 *     }
 *
 *   Store "storyResults": key = auto-increment
 *     Waarde (na decryptie): {
 *       id, date, weekNumber, storyId, attempt,
 *       firstAnswer, finalAnswer, score, hintUsed
 *     }
 *
 *   Store "observations": key = auto-increment
 *     Waarde (na decryptie): {
 *       id, date, type ('voor'|'na'|'follow-up'), notes, scores
 *     }
 *
 *   Store "settings": key-value paar voor app-configuratie
 *
 *   Store "schedule": planning van wanneer welk verhaal wordt aangeboden
 */
const DB = (() => {
  'use strict';

  const DB_NAME = 'mentatrack_db';
  const DB_VERSION = 1;
  const STORE_QUESTIONNAIRES = 'questionnaires';
  const STORE_STORIES = 'storyResults';
  const STORE_OBSERVATIONS = 'observations';
  const STORE_SETTINGS = 'settings';
  const STORE_SCHEDULE = 'schedule';

  let dbInstance = null;

  /**
   * Open (of maak) de IndexedDB-database.
   * @returns {Promise<IDBDatabase>}
   */
  function openDB() {
    if (dbInstance) return Promise.resolve(dbInstance);

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(STORE_QUESTIONNAIRES)) {
          db.createObjectStore(STORE_QUESTIONNAIRES, { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(STORE_STORIES)) {
          db.createObjectStore(STORE_STORIES, { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(STORE_OBSERVATIONS)) {
          db.createObjectStore(STORE_OBSERVATIONS, { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
          db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(STORE_SCHEDULE)) {
          db.createObjectStore(STORE_SCHEDULE, { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = (event) => {
        dbInstance = event.target.result;
        resolve(dbInstance);
      };

      request.onerror = (event) => {
        console.error('IndexedDB fout:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  // --- Generieke helpers ---

  async function putRecord(storeName, record) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(record);
      req.onsuccess = () => resolve(req.result);
      tx.onerror = (e) => reject(e.target.error);
    });
  }

  async function getAllRecords(storeName) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async function countStore(storeName) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  // --- Instellingen ---

  async function setSetting(key, value) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SETTINGS, 'readwrite');
      const store = tx.objectStore(STORE_SETTINGS);
      store.put({ key, value });
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
    });
  }

  async function getSetting(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SETTINGS, 'readonly');
      const store = tx.objectStore(STORE_SETTINGS);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.value : undefined);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  // --- Vragenlijsten ---

  /**
   * Sla een ingevulde vragenlijst op (versleuteld).
   * @param {Object} data - { date, weekNumber, responses: [{ questionId, value }] }
   */
  async function saveQuestionnaire(data) {
    const encrypted = await CryptoModule.encrypt(data);
    return putRecord(STORE_QUESTIONNAIRES, { data: encrypted });
  }

  /**
   * Haal alle vragenlijsten op (ontsleuteld).
   * @returns {Promise<Array<Object>>}
   */
  async function getAllQuestionnaires() {
    const records = await getAllRecords(STORE_QUESTIONNAIRES);
    const results = [];
    for (const record of records) {
      try {
        const decrypted = await CryptoModule.decrypt(record.data);
        decrypted._id = record.id;
        results.push(decrypted);
      } catch (err) {
        console.error('Decryptie fout vragenlijst:', err);
      }
    }
    return results.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  }

  // --- Verhaalresultaten ---

  /**
   * Sla een verhaalresultaat op (versleuteld).
   * @param {Object} data - { date, weekNumber, storyId, attempt, firstAnswer, finalAnswer, score, hintUsed }
   */
  async function saveStoryResult(data) {
    const encrypted = await CryptoModule.encrypt(data);
    return putRecord(STORE_STORIES, { data: encrypted });
  }

  /**
   * Haal alle verhaalresultaten op (ontsleuteld).
   * @returns {Promise<Array<Object>>}
   */
  async function getAllStoryResults() {
    const records = await getAllRecords(STORE_STORIES);
    const results = [];
    for (const record of records) {
      try {
        const decrypted = await CryptoModule.decrypt(record.data);
        decrypted._id = record.id;
        results.push(decrypted);
      } catch (err) {
        console.error('Decryptie fout verhaal:', err);
      }
    }
    return results.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  }

  // --- Observaties ---

  /**
   * Sla een observatie op (versleuteld).
   * @param {Object} data - { date, type, notes, scores }
   */
  async function saveObservation(data) {
    const encrypted = await CryptoModule.encrypt(data);
    return putRecord(STORE_OBSERVATIONS, { data: encrypted });
  }

  /**
   * Haal alle observaties op (ontsleuteld).
   * @returns {Promise<Array<Object>>}
   */
  async function getAllObservations() {
    const records = await getAllRecords(STORE_OBSERVATIONS);
    const results = [];
    for (const record of records) {
      try {
        const decrypted = await CryptoModule.decrypt(record.data);
        decrypted._id = record.id;
        results.push(decrypted);
      } catch (err) {
        console.error('Decryptie fout observatie:', err);
      }
    }
    return results.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  }

  // --- Planning ---

  /**
   * Sla de verhalenplanning op.
   * @param {Array<Object>} schedule - [{ weekNumber, storyId, attempt }]
   */
  async function saveSchedule(schedule) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SCHEDULE, 'readwrite');
      const store = tx.objectStore(STORE_SCHEDULE);
      store.clear();
      for (const item of schedule) {
        store.add(item);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
    });
  }

  /**
   * Haal de verhalenplanning op.
   * @returns {Promise<Array<Object>>}
   */
  async function getSchedule() {
    return getAllRecords(STORE_SCHEDULE);
  }

  // --- Statistieken ---

  async function getStats() {
    const questionnaires = await countStore(STORE_QUESTIONNAIRES);
    const stories = await countStore(STORE_STORIES);
    const observations = await countStore(STORE_OBSERVATIONS);
    return { questionnaires, stories, observations };
  }

  // --- Alles wissen ---

  async function clearAllData() {
    const db = await openDB();
    const storeNames = [STORE_QUESTIONNAIRES, STORE_STORIES, STORE_OBSERVATIONS, STORE_SETTINGS, STORE_SCHEDULE];
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeNames, 'readwrite');
      for (const name of storeNames) {
        tx.objectStore(name).clear();
      }
      tx.oncomplete = () => {
        CryptoModule.clearKey();
        localStorage.clear();
        dbInstance = null;
        resolve();
      };
      tx.onerror = (e) => reject(e.target.error);
    });
  }

  // --- Hulpfuncties ---

  function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  return {
    openDB,
    setSetting,
    getSetting,
    saveQuestionnaire,
    getAllQuestionnaires,
    saveStoryResult,
    getAllStoryResults,
    saveObservation,
    getAllObservations,
    saveSchedule,
    getSchedule,
    getStats,
    clearAllData,
    formatDate,
    getWeekNumber,
  };
})();
