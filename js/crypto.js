/**
 * crypto.js — Encryptiemodule voor lokale dataopslag
 *
 * Gebruikt de Web Crypto API (AES-GCM) om gevoelige data
 * te versleutelen voordat deze in IndexedDB wordt opgeslagen.
 *
 * De encryptiesleutel wordt gegenereerd bij eerste gebruik en
 * opgeslagen in localStorage (als JWK). Omdat alle data lokaal
 * blijft, beschermt dit tegen directe lezing van IndexedDB-bestanden.
 */
const CryptoModule = (() => {
  'use strict';

  const ALGORITHM = 'AES-GCM';
  const KEY_LENGTH = 256;
  const IV_LENGTH = 12; // 96 bits, aanbevolen voor AES-GCM
  const KEY_STORAGE_NAME = 'maaltijd_crypto_key';

  /**
   * Haal de encryptiesleutel op of genereer een nieuwe.
   * @returns {Promise<CryptoKey>}
   */
  async function getKey() {
    const stored = localStorage.getItem(KEY_STORAGE_NAME);

    if (stored) {
      // Importeer bestaande sleutel uit JWK-formaat
      const jwk = JSON.parse(stored);
      return crypto.subtle.importKey(
        'jwk',
        jwk,
        { name: ALGORITHM },
        true,
        ['encrypt', 'decrypt']
      );
    }

    // Genereer nieuwe sleutel
    const key = await crypto.subtle.generateKey(
      { name: ALGORITHM, length: KEY_LENGTH },
      true, // extractable, nodig om te exporteren naar JWK
      ['encrypt', 'decrypt']
    );

    // Sla op als JWK in localStorage
    const jwk = await crypto.subtle.exportKey('jwk', key);
    localStorage.setItem(KEY_STORAGE_NAME, JSON.stringify(jwk));

    return key;
  }

  /**
   * Versleutel een JavaScript-object.
   * @param {Object} data - Het object om te versleutelen
   * @returns {Promise<{iv: string, ciphertext: string}>}
   *   iv en ciphertext als Base64-strings
   */
  async function encrypt(data) {
    const key = await getKey();
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const plaintext = new TextEncoder().encode(JSON.stringify(data));

    const cipherBuffer = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      plaintext
    );

    return {
      iv: bufferToBase64(iv),
      ciphertext: bufferToBase64(new Uint8Array(cipherBuffer)),
    };
  }

  /**
   * Ontsleutel data terug naar een JavaScript-object.
   * @param {{iv: string, ciphertext: string}} encryptedData
   * @returns {Promise<Object>}
   */
  async function decrypt(encryptedData) {
    const key = await getKey();
    const iv = base64ToBuffer(encryptedData.iv);
    const ciphertext = base64ToBuffer(encryptedData.ciphertext);

    const plainBuffer = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      ciphertext
    );

    const plaintext = new TextDecoder().decode(plainBuffer);
    return JSON.parse(plaintext);
  }

  /**
   * Verwijder de encryptiesleutel (bij data wissen).
   */
  function clearKey() {
    localStorage.removeItem(KEY_STORAGE_NAME);
  }

  // --- Hulpfuncties voor Base64-conversie ---

  function bufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function base64ToBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  // Publieke API
  return {
    encrypt,
    decrypt,
    clearKey,
  };
})();
