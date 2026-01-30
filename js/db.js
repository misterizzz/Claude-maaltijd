/**
 * db.js — Database-module (IndexedDB) met encryptie
 *
 * Beheert alle CRUD-operaties voor maaltijdregistraties.
 * Data wordt versleuteld opgeslagen via CryptoModule.
 *
 * Schema:
 *   Store "records": key = "YYYY-MM-DD" (datum)
 *     Waarde (na decryptie): {
 *       date: "YYYY-MM-DD",
 *       absences: { [clientNumber]: { breakfast: bool, lunch: bool, dinner: bool } }
 *     }
 *
 *   Store "settings": key-value paar voor app-configuratie
 */
const DB = (() => {
  'use strict';

  const DB_NAME = 'maaltijd_db';
  const DB_VERSION = 1;
  const STORE_RECORDS = 'records';
  const STORE_SETTINGS = 'settings';
  const MAX_AGE_DAYS = 90; // 3 maanden

  let dbInstance = null;

  /**
   * Open (of maak) de IndexedDB-database.
   * @returns {Promise<IDBDatabase>}
   */
  function openDB() {
    if (dbInstance) {
      return Promise.resolve(dbInstance);
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store voor dagelijkse registraties (key = datum string)
        if (!db.objectStoreNames.contains(STORE_RECORDS)) {
          db.createObjectStore(STORE_RECORDS, { keyPath: 'dateKey' });
        }

        // Store voor instellingen (key-value)
        if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
          db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
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

  // --- Instellingen ---

  /**
   * Sla een instelling op.
   * @param {string} key
   * @param {*} value
   */
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

  /**
   * Haal een instelling op.
   * @param {string} key
   * @returns {Promise<*>} De waarde, of undefined als niet gevonden
   */
  async function getSetting(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SETTINGS, 'readonly');
      const store = tx.objectStore(STORE_SETTINGS);
      const req = store.get(key);
      req.onsuccess = () => {
        resolve(req.result ? req.result.value : undefined);
      };
      req.onerror = (e) => reject(e.target.error);
    });
  }

  // --- Registraties ---

  /**
   * Sla de afwezigheidsstatus voor één dag op (versleuteld).
   * @param {string} dateStr - Datum als "YYYY-MM-DD"
   * @param {Object} absences - Object met clientnummer als key
   *   bijv. { "101": { breakfast: false, lunch: true, dinner: false } }
   *   true = afwezig, false = aanwezig
   */
  async function saveRecord(dateStr, absences) {
    const data = { date: dateStr, absences };
    const encrypted = await CryptoModule.encrypt(data);

    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_RECORDS, 'readwrite');
      const store = tx.objectStore(STORE_RECORDS);
      store.put({ dateKey: dateStr, data: encrypted });
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
    });
  }

  /**
   * Haal de registratie voor één dag op (ontsleuteld).
   * @param {string} dateStr - Datum als "YYYY-MM-DD"
   * @returns {Promise<Object|null>} De ontsleutelde data, of null
   */
  async function getRecord(dateStr) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_RECORDS, 'readonly');
      const store = tx.objectStore(STORE_RECORDS);
      const req = store.get(dateStr);
      req.onsuccess = async () => {
        if (!req.result) {
          resolve(null);
          return;
        }
        try {
          const decrypted = await CryptoModule.decrypt(req.result.data);
          resolve(decrypted);
        } catch (err) {
          console.error('Decryptie fout voor', dateStr, err);
          resolve(null);
        }
      };
      req.onerror = (e) => reject(e.target.error);
    });
  }

  /**
   * Haal registraties op voor een reeks datums (inclusief).
   * @param {string} startDate - "YYYY-MM-DD"
   * @param {string} endDate - "YYYY-MM-DD"
   * @returns {Promise<Array<Object>>} Array van ontsleutelde records
   */
  async function getRecordsInRange(startDate, endDate) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_RECORDS, 'readonly');
      const store = tx.objectStore(STORE_RECORDS);
      const range = IDBKeyRange.bound(startDate, endDate);
      const req = store.getAll(range);

      req.onsuccess = async () => {
        const results = [];
        for (const item of req.result) {
          try {
            const decrypted = await CryptoModule.decrypt(item.data);
            results.push(decrypted);
          } catch (err) {
            console.error('Decryptie fout:', err);
          }
        }
        // Sorteer op datum
        results.sort((a, b) => a.date.localeCompare(b.date));
        resolve(results);
      };
      req.onerror = (e) => reject(e.target.error);
    });
  }

  /**
   * Tel het totaal aantal opgeslagen registraties.
   * @returns {Promise<number>}
   */
  async function countRecords() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_RECORDS, 'readonly');
      const store = tx.objectStore(STORE_RECORDS);
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  /**
   * Verwijder registraties ouder dan 3 maanden.
   * Wordt automatisch aangeroepen bij het opstarten van de app.
   * @returns {Promise<number>} Aantal verwijderde records
   */
  async function purgeOldRecords() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - MAX_AGE_DAYS);
    const cutoffStr = formatDate(cutoffDate);

    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_RECORDS, 'readwrite');
      const store = tx.objectStore(STORE_RECORDS);
      // Alles vóór de cutoff-datum
      const range = IDBKeyRange.upperBound(cutoffStr, true);
      const req = store.openCursor(range);
      let deleted = 0;

      req.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          deleted++;
          cursor.continue();
        }
      };

      tx.oncomplete = () => {
        if (deleted > 0) {
          console.log(`${deleted} oude registratie(s) verwijderd (ouder dan ${cutoffStr})`);
        }
        resolve(deleted);
      };
      tx.onerror = (e) => reject(e.target.error);
    });
  }

  /**
   * Verwijder ALLE data (records + instellingen + encryptiesleutel).
   */
  async function clearAllData() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_RECORDS, STORE_SETTINGS], 'readwrite');
      tx.objectStore(STORE_RECORDS).clear();
      tx.objectStore(STORE_SETTINGS).clear();
      tx.oncomplete = () => {
        CryptoModule.clearKey();
        // Verwijder ook alle localStorage items
        localStorage.clear();
        dbInstance = null;
        resolve();
      };
      tx.onerror = (e) => reject(e.target.error);
    });
  }

  // --- Hulpfunctie ---

  /**
   * Formatteer een Date-object als "YYYY-MM-DD".
   * @param {Date} date
   * @returns {string}
   */
  function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Publieke API
  return {
    openDB,
    setSetting,
    getSetting,
    saveRecord,
    getRecord,
    getRecordsInRange,
    countRecords,
    purgeOldRecords,
    clearAllData,
    formatDate,
  };
})();
