// SIMUREP — © 2026 AnthoninP — Tous droits réservés.
// Dessins pédagogiques de la SDC N4. Aucune commande ni dépendance au moteur.
// Les mesures appartiennent au jeu de données fourni, jamais à ce module.
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SDCN4Synoptiques = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  var C = { bg: '#080d0e', text: '#dce5df', dim: '#92a39c', hot: '#edb06c', cold: '#65c4c8', steam: '#88ce95', metal: '#b7c4bb', asg:'#d2a5ed' };
  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function number(value, decimals) {
    return typeof value === 'number' && Number.isFinite(value)
      ? value.toLocaleString('fr-FR', { maximumFractionDigits: decimals == null ? 1 : decimals }) : '—';
  }
  function text(x, y, value, options) {
    options = options || {};
    return '<text x="' + x + '" y="' + y + '" fill="' + (options.color || C.text) + '" font-size="' + (options.size || 14) + '" text-anchor="' + (options.anchor || 'middle') + '">' + esc(value) + '</text>';
  }
  function path(d, type, arrow) {
    var color = C[type] || type;
    return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="2"' + (arrow ? ' marker-end="url(#n4-' + arrow + ')"' : '') + '/>';
  }
  function equipment(id, label, selected, box, body) {
    return '<g class="n4-equipment' + (selected === id ? ' n4-selected' : '') + '" role="button" tabindex="0" data-n4-equipement="' + esc(id) + '" aria-label="' + esc(label) + '" aria-pressed="' + (selected === id) + '">' +
      '<rect class="n4-hit" x="' + box[0] + '" y="' + box[1] + '" width="' + box[2] + '" height="' + box[3] + '" rx="2" fill="transparent" stroke="transparent"/>' + body + '</g>';
  }
  function vessel(x, y, w, h, color) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + Math.min(w / 2, 15) + '" fill="' + C.bg + '" stroke="' + color + '" stroke-width="1.6"/>';
  }
  // GMPP (H07) : seul le nombre en service est reçu. Tout = pleine, rien = pointillée ; partiel = hachure neutre,
  // jamais quatre symboles d'arrêt ni pompe désignée. Le compteur encadré dit « n en service / m arrêtée(s) ».
  function pump(id, name, x, y, selected, labelY, direction, etat) {
    var sign = direction === 'left' ? -1 : 1, box = [x - 41, Math.min(y - 18, labelY - 17), 82, Math.max(y + 19, labelY + 5) - Math.min(y - 18, labelY - 17)];
    var triangle = 'M' + (x - 5 * sign) + ' ' + (y - 8) + ' L' + (x + 8 * sign) + ' ' + y + ' L' + (x - 5 * sign) + ' ' + (y + 8) + ' Z';
    if (!etat) return equipment(id, name + ' · ouvrir la fiche', selected, box,
      '<circle cx="' + x + '" cy="' + y + '" r="13" fill="' + C.bg + '" stroke="' + C.cold + '" stroke-width="2"/>' +
      path(triangle, 'cold') + text(x, labelY, name, { size: 13 }));
    var on = etat === 'marche', off = etat === 'arret', partiel = etat === 'partiel';
    return equipment(id, name + (on ? ' · en marche' : off ? ' · à l’arrêt' : ' · état de la pompe non indiqué') + ' · ouvrir la fiche', selected, box,
      '<circle data-n4-gmpp="' + etat + '" cx="' + x + '" cy="' + y + '" r="13" fill="' + (on ? C.cold : partiel ? 'url(#n4-gmpp-partiel)' : C.bg) + '" stroke="' + (off ? C.dim : C.cold) + '" stroke-width="2"' + (off ? ' stroke-dasharray="3 2"' : '') + '/>' +
      '<path d="' + triangle + '" fill="' + (on || partiel ? C.bg : 'none') + '" stroke="' + (off ? C.dim : on ? C.bg : C.cold) + '" stroke-width="' + (on ? 1.5 : 2) + '"/>' +
      text(x, labelY, name, { size: 13, color: off ? C.dim : C.text }));
  }
  function compteGmpp(n) {
    if (n === null) return '';
    var arret = 4 - n, partiel = n > 0 && arret > 0;
    var ligne = 'GMPP : ' + n + ' en service' + (arret ? ' / ' + arret + ' arrêtée' + (arret > 1 ? 's' : '') : '');
    // Couleur d'attention propre (pas celle de la branche chaude) ; le cadre ne capte aucun toucher (GV 1 dessous).
    return (partiel ? '<rect data-n4-gmpp-compte="partiel" pointer-events="none" x="10" y="55" width="272" height="36" rx="3" fill="' + C.bg + '" stroke="#e7d78e" stroke-width="1.5"/>' : '') +
      text(18, 69, ligne, { anchor: 'start', color: partiel ? '#e7d78e' : C.dim, size: 13 }) +
      (partiel ? text(18, 85, arret > 1 ? 'pompes arrêtées non identifiées' : 'pompe arrêtée non identifiée', { anchor: 'start', color: C.text, size: 12 }) : '');
  }
  function gv(id, x, y, selected, secondary) {
    var w = 58, h = secondary ? 72 : 94, n = id.slice(2);
    var tubes;
    if (secondary) tubes = 'M' + (x + 17) + ' ' + (y + h - 9) + ' V' + (y + 24) + ' Q' + (x + 29) + ' ' + (y + 9) + ' ' + (x + 41) + ' ' + (y + 24) + ' V' + (y + h - 9);
    else {
      var left = Number(n) % 2 === 0, edge = left ? x : x + w;
      var a = left ? x + 17 : x + 41, b = left ? x + 41 : x + 17;
      var inlet = y + (Number(n) > 2 ? 24 : 25), outlet = y + (Number(n) > 2 ? 76 : 74);
      tubes = 'M' + edge + ' ' + inlet + ' H' + a + ' V' + (y + 22) + ' Q' + (x + 29) + ' ' + (y + 9) + ' ' + b + ' ' + (y + 22) + ' V' + outlet + ' H' + edge;
    }
    return equipment(id, 'Générateur de vapeur ' + n + ' · ouvrir la fiche', selected, [x - 7, y - 6, w + (secondary ? 35 : 14), h + 31],
      vessel(x, y, w, h, C.metal) +
      path(tubes, 'metal') +
      text(x + (secondary ? 40 : 29), y + h + 21, 'GV ' + n, { anchor: secondary ? 'start' : 'middle' }));
  }
  function valve(id, label, x, y, selected, vertical, labelX, labelY) {
    var shape = vertical
      ? 'M' + (x - 10) + ' ' + (y - 10) + ' H' + (x + 10) + ' L' + (x - 10) + ' ' + (y + 10) + ' H' + (x + 10) + ' Z'
      : 'M' + (x - 10) + ' ' + (y - 10) + ' V' + (y + 10) + ' L' + (x + 10) + ' ' + (y - 10) + ' V' + (y + 10) + ' Z';
    // Cible tactile d'au moins 48 u autour du robinet, étiquette comprise (H06 : GCT-C touché sans viser au pixel).
    var left = Math.min(x - 24, labelX - 33), top = Math.min(y - 24, labelY - 17);
    var right = Math.max(x + 24, labelX + 33), bottom = Math.max(y + 24, labelY + 5);
    return equipment(id, label + ' · ouvrir la fiche', selected, [left, top, right - left, bottom - top],
      '<path d="' + shape + '" fill="' + C.bg + '" stroke="' + C.steam + '" stroke-width="1.8"/>' + text(labelX, labelY, label, { size: 13 }));
  }
  function primary(data, selected) {
    var h = text(18, 25, 'RCP / RÉACTEUR · QUATRE BOUCLES', { anchor: 'start', size: 17 });
    h += text(18, 49, 'Branche chaude : ' + number(data.tempHot) + ' °C', { anchor: 'start', color: C.hot, size: 13 });
    h += text(902, 49, 'Branche froide : ' + number(data.tempCold) + ' °C', { anchor: 'end', color: C.cold, size: 13 });
    // Une paire de branches par GV. Le sens de la branche froide revient à la cuve.
    [
      ['M421 230 H345 V120 H168', 'hot'], ['M499 230 H575 V120 H752', 'hot'],
      ['M421 284 H345 V332 H168', 'hot'], ['M499 284 H575 V332 H752', 'hot'],
      ['M168 169 H265 V201 H409 V244 H421', 'cold'], ['M752 169 H655 V201 H511 V244 H499', 'cold'],
      ['M168 384 H265 V347 H409 V298 H421', 'cold'], ['M752 384 H655 V347 H511 V298 H499', 'cold']
    ].forEach(function (p) {
      // Le croisement graphique n’est pas une jonction hydraulique.
      if (p[1] === 'cold') h += path(p[0], C.bg).replace('stroke-width="2"', 'stroke-width="7"');
      h += path(p[0], p[1], p[1]);
    });
    // Un seul pressuriseur, piqué sur une branche chaude ; aucun cinquième circuit.
    h += path('M390 152 V178 H345', 'hot');
    h += '<circle cx="345" cy="178" r="3" fill="' + C.hot + '"/>';
    h += equipment('pzr', 'Pressuriseur · ouvrir la fiche', selected, [351, 55, 79, 102],
      text(390, 71, 'PZR') + vessel(360, 80, 60, 72, C.hot) +
      text(390, 111, number(data.pressurePrimary), { color: C.hot }) + text(390, 131, 'bar', { size: 13, color: C.dim }));
    h += gv('gv1', 110, 95, selected, false) + gv('gv2', 752, 95, selected, false);
    h += gv('gv3', 110, 308, selected, false) + gv('gv4', 752, 308, selected, false);
    var pp = Array.isArray(data.pumps) ? data.pumps : [], enMarche = pp.length === 4 && pp.every(function (v) { return typeof v === 'boolean'; }) ? pp.filter(Boolean).length : null;
    var etat = enMarche === 4 ? 'marche' : enMarche === 0 ? 'arret' : enMarche === null ? '' : 'partiel';
    h += pump('gmpp1', 'GMPP 1', 265, 169, selected, 148, '', etat) + pump('gmpp2', 'GMPP 2', 655, 169, selected, 148, 'left', etat);
    h += pump('gmpp3', 'GMPP 3', 265, 384, selected, 416, '', etat) + pump('gmpp4', 'GMPP 4', 655, 384, selected, 416, 'left', etat);
    // Sous « Branche chaude » : visible sans glisser dans la vue agrandie du téléphone.
    h += compteGmpp(enMarche);
    h += equipment('rcp', 'Réacteur et circuit primaire · ouvrir la fiche', selected, [413, 187, 94, 145],
      text(460, 206, 'CUVE') + vessel(421, 212, 78, 112, C.metal) +
      text(460, 242, 'CŒUR', { size: 13, color: C.dim }) + text(460, 269, number(data.powerThermal, 0)) +
      text(460, 290, 'MWth', { size: 13, color: C.dim }));
    h += text(460, 374, 'Cuve → GV → GMPP → cuve', { color: C.dim, size: 13 });
    return h;
  }
  function secondary(data, selected) {
    var h = text(18, 25, 'EAU / VAPEUR · CONVERSION D’ÉNERGIE', { anchor: 'start', size: 17 });
    h += text(18, 47, 'Sortie GV : ' + number(data.pressureSteam) + ' bar', { anchor: 'start', color: C.steam, size: 13 });
    h += text(322, 47, 'COLLECTEUR VVP', { color: C.steam, size: 13 });
    // Chaque GV rejoint le collecteur vapeur et reçoit l’alimentation ARE.
    [42, 143, 244, 345].forEach(function (x, i) {
      h += path('M' + (x + 29) + ' 87 V66', 'steam', 'steam');
      h += path('M' + (x + 29) + ' 343 V158', 'cold', 'cold');
    });
    h += path('M71 66 H876 V37', 'steam', 'steam');
    h += path('M450 66 V156 H496', 'steam', 'steam');
    // Le dessin des corps suit l’arbre ; leur alimentation BP est distribuée,
    // sans représenter les trois corps BP comme trois détentes en série.
    // Architecture N4 (matrice N4-03, TAB p. 143-144) : HP, MP, puis trois BP.
    // Les séparateurs-surchauffeurs ne sont pas détaillés dans cette vue globale.
    h += path('M537 145 H543', 'steam');
    h += path('M584 145 V97 H726', 'steam');
    [616, 671, 726].forEach(function (x) {
      h += path('M' + x + ' 97 V122', 'steam', 'steam');
      h += path('M' + x + ' 209 V250', 'steam', 'steam');
    });
    h += path('M616 250 H726 M642 250 V279', 'steam', 'steam');
    // Contournement au condenseur ou à l’atmosphère : circuits distincts.
    h += path('M450 83 H468 V266 H541 V295', 'steam', 'steam');
    h += path('M642 340 V384 H420 V343 H71', 'cold');
    h += path('M496 165 H849', 'metal');
    [42, 143, 244, 345].forEach(function (x, i) { h += gv('gv' + (i + 1), x, 87, selected, true); });
    var bodies = '';
    [[496, 'HP'], [543, 'MP']].forEach(function (part) {
      var x = part[0];
      bodies += '<path d="M' + x + ' 136 L' + (x + 41) + ' 122 V198 L' + x + ' 184 Z" fill="' + C.bg + '" stroke="' + C.metal + '" stroke-width="1.7"/>' + text(x + 20, 167, part[1], { size: 13 });
    });
    [595, 650, 705].forEach(function (x) {
      bodies += '<path d="M' + x + ' 145 L' + (x + 42) + ' 122 V209 L' + x + ' 186 Z" fill="' + C.bg + '" stroke="' + C.metal + '" stroke-width="1.7"/>' + text(x + 21, 171, 'BP', { size: 13 });
    });
    bodies += text(630, 88, 'TURBINE · HP + MP + 3 BP', { size: 13 });
    h += equipment('turbine', 'Turbine : un corps haute pression, un corps moyenne pression et trois corps basse pression · ouvrir la fiche', selected, [485, 71, 273, 144], bodies);
    h += equipment('alternateur', 'Alternateur · ouvrir la fiche', selected, [779, 120, 122, 130],
      '<circle cx="818" cy="165" r="31" fill="' + C.bg + '" stroke="' + C.metal + '" stroke-width="1.8"/>' +
      text(818, 171, '~', { size: 26 }) + text(837, 222, 'ALTERNATEUR', { size: 13 }) +
      text(837, 243, number(data.powerElectric, 0) + ' MWe', { color: C.dim, size: 13 }));
    h += equipment('condenseur', 'Condenseur · ouvrir la fiche', selected, [533, 274, 221, 72],
      '<rect x="541" y="279" width="205" height="61" fill="' + C.bg + '" stroke="' + C.metal + '" stroke-width="1.7"/>' +
      path('M554 322 H732', 'cold') + text(643, 305, 'CONDENSEUR', { size: 14 }));
    h += pump('are', 'ARE', 420, 384, selected, 416, 'left');
    h += text(652, 405, 'Extraction / réchauffage / alimentation', { color: C.dim, size: 13 });
    // Deux ensembles de deux pompes (MPS + TPS en parallèle), chacun pour deux GV.
    // TEC861 PDF183 / TAB135 ; numérotation des paires choisie pour le dessin.
    // Le violet distingue l’alimentation de secours de l’ARE cyan.
    h += path('M25 408 V306 H356 M53 206 H154 M255 206 H356',C.bg).replace('stroke-width="2"','stroke-width="7"')+path('M25 408 V306 H356 M53 206 H154 M255 206 H356','asg')+text(104,195,'ENSEMBLE A',{size:10,color:C.asg})+text(306,195,'ENSEMBLE B',{size:10,color:C.asg});
    [53,154,255,356].forEach(function(x,i){
      h += path('M'+x+' 306 V158','asg','asg');
      var key=['mpsA','tpsA','mpsB','tpsB'][i],label=['MPS A','TPS A','MPS B','TPS B'][i];
      h += equipment(key.toLowerCase(),label+' · pompe ASG · ouvrir la fiche',selected,[x-30,226,76,63],
        '<circle cx="'+x+'" cy="247" r="15" fill="'+C.bg+'" stroke="'+C.asg+'" stroke-width="2"/>'+path('M'+(x-8)+' 253 L'+x+' 236 L'+(x+8)+' 253 Z','asg')+'<rect x="'+(x-25)+'" y="270" width="50" height="17" fill="'+C.bg+'"/>'+text(x,282,label,{size:12,color:C.asg})+
        '<rect x="'+(x+22)+'" y="244" width="6" height="6" fill="'+(data.state?.[key]?C.asg:C.bg)+'" stroke="'+C.asg+'"/>');
    });
    h += equipment('asg','ASG · alimentation de secours des générateurs de vapeur',selected,[12,398,182,55],
      '<rect x="18" y="404" width="170" height="43" rx="3" fill="'+C.bg+'" stroke="'+C.asg+'" stroke-width="1.7"/>'+text(103,421,'BÂCHE ASG',{color:C.asg})+text(103,439,'2 ENSEMBLES · 4 GV',{size:11,color:C.asg}));
    h+=text(225,437,'■ ordre pompe',{anchor:'start',size:11,color:C.asg});
    h += path('M746 308 H811', 'cold');
    h += equipment('cvi', 'CVI · maintien du vide au condenseur', selected, [786, 275, 110, 80],
      '<circle cx="838" cy="308" r="21" fill="' + C.bg + '" stroke="' + C.cold + '" stroke-width="1.7"/>' +
      path('M827 296 L850 308 L827 320 Z', 'cold') + text(838, 348, 'CVI', { size: 13 }));
    h += valve('gctc', 'GCT-C', 468, 226, selected, true, 468, 253);
    h += valve('gcta', 'GCT-A', 828, 66, selected, false, 828, 94);
    h += text(804, 37, 'ATMOSPHÈRE', { color: C.dim, size: 13 });
    return h;
  }
  function sourceCooling(data, selected) {
    var st = data.state || {};
    var h = text(18, 25, 'SOURCE FROIDE · FLEUVE ET AÉRORÉFRIGÉRANT', { anchor: 'start', size: 17 });
    h += text(18, 48, 'Eau extérieure : ' + number(st.Tsrc) + ' °C', { anchor: 'start', color: C.cold, size: 13 });
    h += text(900, 48, 'Pression condenseur : ' + number(Number.isFinite(st.Pcond) ? st.Pcond * 1000 : null, 1) + ' mbar', { anchor: 'end', size: 13 });
    // Circuit de circulation fermé par la tour ; le fleuve assure l’appoint.
    // SEC puis RRI : deux échangeurs séparés, sans mélange des circuits.
    h += path('M616 163 H714 V218', 'hot', 'hot');
    h += path('M714 290 V352 H443 V183 H469', 'cold', 'cold');
    h += path('M150 352 H391 V352 H443', 'cold', 'cold');
    h += path('M145 177 H219', 'cold', 'cold');
    h += path('M256 195 V230 H144', 'cold', 'cold');
    h += path('M291 150 H315 V115 H375', 'cold', 'cold');
    h += path('M375 199 H321 V182 H291', 'hot', 'hot');
    h += equipment('fleuve', 'Fleuve · appoint du refroidissement', selected, [28, 99, 141, 284],
      '<rect x="37" y="111" width="112" height="260" rx="5" fill="#0d2026" stroke="' + C.cold + '" stroke-width="1.4"/>' +
      path('M52 144 Q75 129 97 144 T137 144 M52 213 Q75 198 97 213 T137 213 M52 281 Q75 266 97 281 T137 281 M52 333 Q75 318 97 333 T137 333', 'cold') +
      text(94, 396, 'FLEUVE', { color: C.cold, size: 13 }));
    h += equipment('sec', 'SEC · eau brute secourue', selected, [200, 103, 104, 105],
      '<rect x="215" y="121" width="77" height="75" fill="' + C.bg + '" stroke="' + C.cold + '" stroke-width="1.7"/>' +
      path('M225 136 L280 182 M225 153 L262 184 M243 134 L282 167', 'cold') + text(253, 112, 'SEC', { size: 13 }));
    h += equipment('rri', 'RRI · refroidissement intermédiaire', selected, [342, 80, 111, 145],
      vessel(365, 106, 55, 99, C.metal) + path('M365 128 H410 V147 H375 V165 H410 V184 H365', 'cold') +
      text(392, 95, 'RRI', { size: 13 }) + text(392, 223, 'AUXILIAIRES', { size: 11 }));
    h += equipment('condenseur', 'Condenseur · ouvrir la fiche', selected, [461, 108, 162, 112],
      '<rect x="469" y="128" width="145" height="72" fill="' + C.bg + '" stroke="' + C.metal + '" stroke-width="1.7"/>' +
      path('M482 178 H601', 'cold') + text(541, 153, 'CONDENSEUR', { size: 12 }) +
      text(541, 215, 'CRF', { color: C.cold, size: 12 }));
    // Relier l’entrée CRF sans traverser le symbole RRI.

    h += equipment('tour', 'Tour aéroréfrigérante · circuit de circulation', selected, [663, 103, 191, 222],
      '<path d="M703 128 Q733 205 678 291 H837 Q783 205 811 128 Z" fill="' + C.bg + '" stroke="' + C.metal + '" stroke-width="1.8"/>' +
      path('M690 274 H825 M711 142 H803 M713 218 H802', 'cold') +
      text(758, 247, 'TOUR', { size: 15 }) + text(758, 315, 'AÉRORÉFRIGÉRANT', { size: 12 }));
    h += pump('crf', 'CRF', 580, 352, selected, 383, 'left');
    h += text(240, 373, 'APPOINT', { color: C.dim, size: 12 });
    h += text(680, 390, 'Eau refroidie → condenseur → tour', { color: C.dim, size: 13 });
    return h;
  }
  function render(page, data, selected) {
    if (page !== 'primaire' && page !== 'eauvapeur' && page !== 'sourcefroide') throw new RangeError('Page de synoptique N4 inconnue : ' + page);
    data = data && typeof data === 'object' ? data : {};
    var title = page === 'primaire' ? 'Circuit primaire N4 : quatre boucles et un pressuriseur' : page === 'sourcefroide' ? 'Source froide N4 : fleuve, tour, CRF, SEC et RRI' : 'Circuit eau-vapeur N4 : générateurs de vapeur, turbine et condenseur';
    var definitions = ['hot', 'cold', 'steam', 'asg'].map(function (key) {
      return '<marker id="n4-' + page + '-' + key + '" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto" markerUnits="strokeWidth"><path d="M0 0 L5 2.5 L0 5 Z" fill="' + C[key] + '"/></marker>';
    }).join('');
    definitions += '<pattern id="n4-' + page + '-gmpp-partiel" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="' + C.bg + '"/><path d="M1.5 0V6" stroke="' + C.cold + '" stroke-width="2.2"/></pattern>';
    var legend = page === 'primaire'
      ? [['hot', 'Branche chaude'], ['cold', 'Branche froide'], ['metal', 'Équipement']]
      : page === 'sourcefroide' ? [['hot', 'Eau réchauffée'], ['cold', 'Eau refroidie'], ['metal', 'Équipement']] : [['steam', 'Vapeur'], ['cold', 'ARE'], ['asg', 'ASG · secours'], ['metal', 'Équipement']];
    var footer = '';
    legend.forEach(function (item, i) {
      var x = 18 + i * (legend.length===4?225:300);
      footer += path('M' + x + ' 461 H' + (x + 30), item[0]) + text(x + 41, 466, item[1], { anchor: 'start', color: C[item[0]], size: 13 });
    });
    return '<svg class="n4-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 500" role="group" aria-label="' + esc(title) + '" font-family="Consolas, Liberation Mono, monospace">' +
      '<defs>' + definitions + '</defs>' +
      '<style>.n4-svg .n4-equipment{cursor:pointer;outline:none}.n4-svg .n4-equipment:hover .n4-hit,.n4-svg .n4-equipment:focus .n4-hit,.n4-svg .n4-selected .n4-hit{stroke:#eddb77;stroke-width:1.5;stroke-dasharray:4 3}.n4-svg text{pointer-events:none}</style>' +
      '<rect width="920" height="500" fill="' + C.bg + '"/>' + (page === 'primaire' ? primary(data, selected) : page === 'sourcefroide' ? sourceCooling(data, selected) : secondary(data, selected)).replace(/url\(#n4-/g, 'url(#n4-' + page + '-') + footer + '</svg>';
  }
  return { render: render };
});
