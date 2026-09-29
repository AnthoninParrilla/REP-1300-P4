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
  // Courbes (H13) : clé distincte, même contrat (versionnée, défauts sur lecture invalide, hors clés de conduite).
  var CURVES_KEY = 'simurep_sdc_n4_courbes_v1';
  function curvesKey(palier) { return palier === 'EPR' ? 'simurep_sdc_epr_courbes_v1' : CURVES_KEY; }
  function readCurves(storage, palier) {
    try {
      if (!storage || typeof storage.getItem !== 'function' || typeof SDC.normalizeCurves !== 'function') return SDC.DEFAULT_CURVES ? SDC.DEFAULT_CURVES.slice() : [];
      var saved = JSON.parse(storage.getItem(curvesKey(palier)));
      if (!saved || Array.isArray(saved) || typeof saved !== 'object' || saved.version !== 1 || !Array.isArray(saved.courbes)) return SDC.normalizeCurves(null);
      return SDC.normalizeCurves(saved.courbes);
    } catch (_) { return SDC.DEFAULT_CURVES ? SDC.DEFAULT_CURVES.slice() : []; }
  }
  function writeCurves(storage, choices, palier) {
    try {
      if (!storage || typeof storage.setItem !== 'function' || typeof SDC.normalizeCurves !== 'function') return false;
      storage.setItem(curvesKey(palier), JSON.stringify({ version: 1, courbes: SDC.normalizeCurves(choices) }));
      return true;
    } catch (_) { return false; }
  }
  // Mission active (H18) : progression du parcours par tranche, hors clés de conduite ; lecture stricte, null sinon.
  var MISSION_KEY = 'simurep_sdc_n4_mission_v1';
  function missionKey(palier) { return palier === 'EPR' ? 'simurep_sdc_epr_mission_v1' : MISSION_KEY; }
  function valide(m) { return !!m && typeof m === 'object' && !Array.isArray(m) && typeof m.actif === 'boolean' && typeof m.ouvert === 'boolean' && Number.isInteger(m.total) && Number.isInteger(m.index) && m.total > 0 && m.total <= 64 && m.index >= 0 && m.index <= m.total; }
  function lireTout(storage, palier) {
    var saved = JSON.parse(storage.getItem(missionKey(palier)));
    return saved && !Array.isArray(saved) && typeof saved === 'object' && saved.version === 1 && saved.tranches && typeof saved.tranches === 'object' && !Array.isArray(saved.tranches) ? saved : { version: 1, tranches: {} };
  }
  function readMission(storage, palier, site, unit) {
    try {
      if (!storage || typeof storage.getItem !== 'function') return null;
      var m = lireTout(storage, palier).tranches[String(site) + '|' + Number(unit)];
      return valide(m) ? { actif: m.actif, index: m.index, total: m.total, ouvert: m.ouvert } : null;
    } catch (_) { return null; }
  }
  function writeMission(storage, palier, site, unit, m) {
    try {
      if (!storage || typeof storage.setItem !== 'function' || typeof storage.getItem !== 'function' || !valide(m)) return false;
      var tout; try { tout = lireTout(storage, palier); } catch (_) { tout = { version: 1, tranches: {} }; }
      tout.tranches[String(site) + '|' + Number(unit)] = { actif: m.actif, index: m.index, total: m.total, ouvert: m.ouvert };
      storage.setItem(missionKey(palier), JSON.stringify(tout));
      return true;
    } catch (_) { return false; }
  }
  return { KEY: KEY, CURVES_KEY: CURVES_KEY, MISSION_KEY: MISSION_KEY, read: read, write: write, readCurves: readCurves, writeCurves: writeCurves, readMission: readMission, writeMission: writeMission };
});
