// SIMUREP — © 2026 AnthoninP — Tous droits réservés.
// Préférences d’affichage seulement. Stockage fourni par l’appelant, hors conduite.
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./n4.js'));
  else root.SDCN4Preferences = factory(root.SDCN4);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (SDC) {
  'use strict';
  if (!SDC || typeof SDC.normalizeSynthesis !== 'function') throw new Error('SDC N4 : normalisation des préférences indisponible');
  var KEY = 'simurep_sdc_n4_affichage_v1';
  function defaults() { return SDC.normalizeSynthesis(SDC.DEFAULT_SYNTHESIS); }
  function read(storage,palier) {
    try {
      if (!storage || typeof storage.getItem !== 'function') return defaults();
      var saved = JSON.parse(storage.getItem(palier==='EPR'?'simurep_sdc_epr_affichage_v1':KEY));
      if (!saved || Array.isArray(saved) || typeof saved !== 'object' || saved.version !== 1) return defaults();
      return SDC.normalizeSynthesis(saved.synthesis);
    } catch (_) { return defaults(); }
  }
  function write(storage, choices,palier) {
    try {
      if (!storage || typeof storage.setItem !== 'function') return false;
      storage.setItem(palier==='EPR'?'simurep_sdc_epr_affichage_v1':KEY, JSON.stringify({ version: 1, synthesis: SDC.normalizeSynthesis(choices) }));
      return true;
    } catch (_) { return false; }
  }
  return { KEY: KEY, read: read, write: write };
});
