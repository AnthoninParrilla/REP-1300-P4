// SIMUREP — © 2026 AnthoninP — Tous droits réservés.
// Dessins pédagogiques de la SDC EPR. Aucune commande ni dépendance au moteur.
// Les mesures appartiennent au jeu de données fourni, jamais à ce module.
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SDCEPRSynoptiques = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  var C = { bg: '#f1f5f6', text: '#233d4a', dim: '#526e7b', hot: '#a64b27', cold: '#12749a', steam: '#28754b', metal: '#576e7a', asg:'#794b9e' };
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
    return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="2"' + (arrow ? ' marker-end="url(#epr-' + arrow + ')"' : '') + '/>';
  }
  function equipment(id, label, selected, box, body) {
    return '<g class="n4-equipment' + (selected === id ? ' n4-selected' : '') + '" role="button" tabindex="0" data-n4-equipement="' + esc(id) + '" aria-label="' + esc(label) + '" aria-pressed="' + (selected === id) + '">' +
      '<rect class="n4-hit" x="' + box[0] + '" y="' + box[1] + '" width="' + box[2] + '" height="' + box[3] + '" rx="2" fill="transparent" stroke="transparent"/>' + body + '</g>';
  }
  function vessel(x, y, w, h, color) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + Math.min(w / 2, 15) + '" fill="' + C.bg + '" stroke="' + color + '" stroke-width="1.6"/>';
  }
  // GMPP (D16, principe D12 du N4) : le moteur ne donne que leur nombre en marche. Toutes en marche (disque plein)
  // ou toutes arrêtées (contour gris pointillé) : l'état de chaque pompe s'en déduit ; état partiel : dessin neutre,
  // sans désigner les pompes arrêtées. Sans état (CVI, ARE, données absentes) : dessin neutre.
  function pump(id, name, x, y, selected, labelY, direction, etat) {
    var sign = direction === 'left' ? -1 : 1, on = etat === 'marche', off = etat === 'arret', partiel = etat === 'partiel';
    var suffixe = on ? ' · en marche' : off ? ' · à l’arrêt' : partiel ? ' · état de la pompe non indiqué' : '';
    return equipment(id, name + suffixe + ' · ouvrir la fiche', selected, [x - 41, Math.min(y - 18, labelY - 17), 82, Math.max(y + 19, labelY + 5) - Math.min(y - 18, labelY - 17)],
      '<circle data-epr-gmpp="' + (on ? 'marche' : off ? 'arret' : partiel ? 'partiel' : 'inconnu') + '" cx="' + x + '" cy="' + y + '" r="13" fill="' + (on ? C.cold : C.bg) + '" stroke="' + (off ? C.dim : C.cold) + '" stroke-width="2"' + (off ? ' stroke-dasharray="3 2"' : '') + '/>' +
      '<path d="M' + (x - 5 * sign) + ' ' + (y - 8) + ' L' + (x + 8 * sign) + ' ' + y + ' L' + (x - 5 * sign) + ' ' + (y + 8) + ' Z" fill="' + (on ? C.bg : off ? 'none' : C.cold) + '" stroke="' + (off ? C.dim : on ? C.bg : C.cold) + '" stroke-width="1.5"/>' +
      text(x, labelY, name, { size: 13, color: off ? C.dim : C.text }));
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
    var left = Math.min(x - 16, labelX - 33), top = Math.min(y - 16, labelY - 17);
    var right = Math.max(x + 16, labelX + 33), bottom = Math.max(y + 16, labelY + 5);
    return equipment(id, label + ' · ouvrir la fiche', selected, [left, top, right - left, bottom - top],
      '<path d="' + shape + '" fill="' + C.bg + '" stroke="' + C.steam + '" stroke-width="1.8"/>' + text(labelX, labelY, label, { size: 13 }));
  }
  function primary(data, selected) {
    var h = text(18, 25, 'RCP / RÉACTEUR · EPR · QUATRE BOUCLES', { anchor: 'start', size: 17 });
    h += text(18, 49, 'Branche chaude : ' + number(data.tempHot) + ' °C', { anchor: 'start', color: C.hot, size: 13 });
    h += text(902, 49, 'Branche froide : ' + number(data.tempCold) + ' °C', { anchor: 'end', color: C.cold, size: 13 });
    // Une paire de branches par GV. Le sens de la branche froide revient à la cuve.
    [
      ['M421 230 H345 V120 H168', 'hot'], ['M499 230 H575 V120 H752', 'hot'],
      ['M421 284 H345 V332 H168', 'hot', '3'], ['M499 284 H575 V332 H752', 'hot'],
      ['M168 169 H265 V201 H409 V244 H421', 'cold'], ['M752 169 H655 V201 H511 V244 H499', 'cold'],
      ['M168 384 H265 V347 H409 V298 H421', 'cold'], ['M752 384 H655 V347 H511 V298 H499', 'cold']
    ].forEach(function (p) {
      // Le croisement graphique n’est pas une jonction hydraulique.
      if (p[1] === 'cold') h += path(p[0], C.bg).replace('stroke-width="2"', 'stroke-width="7"');
      h += path(p[0], p[1], p[1]).replace('<path ', '<path '+(p[2]?'data-epr-branche-chaude="'+p[2]+'" ':''));
    });
    // EDF RS Flamanville ch.5 §3.5 p.15 (veille/epr-fla3.md:3614) :
    // ligne d'expansion axiale sous le PZR vers la branche chaude de boucle 3.
    // Le masque interrompt les branches traversées, sans jonction aux boucles 1/2.
    var expansion='M390 152 V284';
    h += path(expansion,C.bg).replace('stroke-width="2"','stroke-width="7"');
    h += path(expansion,'hot').replace('<path ', '<path data-epr-ligne-expansion="3" ');
    h += '<circle data-epr-piquage-pzr="3" cx="390" cy="284" r="3" fill="' + C.hot + '"/>';
    h += equipment('pzr', 'Pressuriseur · ouvrir la fiche', selected, [351, 55, 79, 102],
      text(390, 71, 'PZR') + vessel(360, 80, 60, 72, C.hot) +
      text(390, 111, number(data.pressurePrimary), { color: C.hot }) + text(390, 131, 'bar', { size: 13, color: C.dim }));
    h += gv('gv1', 110, 95, selected, false) + gv('gv2', 752, 95, selected, false);
    h += gv('gv3', 110, 308, selected, false) + gv('gv4', 752, 308, selected, false);
    // Seul le nombre compte : l'ordre du tableau reçu ne désigne aucune pompe (D16).
    var pp = Array.isArray(data.pumps) ? data.pumps : [], enMarche = pp.length === 4 && pp.every(function (v) { return typeof v === 'boolean'; }) ? pp.filter(Boolean).length : null;
    var etat = enMarche === 4 ? 'marche' : enMarche === 0 ? 'arret' : enMarche === null ? '' : 'partiel';
    h += pump('gmpp1', 'GMPP 1', 265, 169, selected, 148, '', etat) + pump('gmpp2', 'GMPP 2', 655, 169, selected, 148, 'left', etat);
    h += pump('gmpp3', 'GMPP 3', 265, 384, selected, 416, '', etat) + pump('gmpp4', 'GMPP 4', 655, 384, selected, 416, 'left', etat);
    h += equipment('rcp', 'Réacteur et circuit primaire · ouvrir la fiche', selected, [413, 187, 94, 145],
      text(460, 206, 'CUVE') + vessel(421, 212, 78, 112, C.metal) +
      text(460, 242, 'CŒUR', { size: 13, color: C.dim }) + text(460, 269, number(data.powerThermal, 0)) +
      text(460, 290, 'MWth', { size: 13, color: C.dim }));
    h += text(460, 374, 'Cuve → GV → GMPP → cuve', { color: C.dim, size: 13 });
    // Sous « Branche chaude » : lisible sans glisser dans la vue agrandie du téléphone (comme le N4, D12).
    if (enMarche !== null) h += text(18, 69, 'GMPP en marche : ' + enMarche + ' / 4', { anchor: 'start', color: etat === 'partiel' ? C.text : C.dim, size: 13 }) +
      (etat === 'partiel' ? text(18, 85, 'répartition par boucle non indiquée', { anchor: 'start', color: C.dim, size: 12 }) : '');
    h += text(460, 438, 'Températures et niveau GV agrégés · aucune mesure indépendante par boucle', { color: C.dim, size: 12 });
    return h;
  }
  // RS Flamanville 2023 ch.6 §6.6, ch.1 TAB-1.3.1 : quatre files électriques,
  // réserves communicables. Dessin fonctionnel : ni positions de vannes ni débits
  // individuels ne sont disponibles. Chaque refoulement rejoint ici son GV.
  function secondary(data, selected) {
    var h=text(18,25,'EPR · EAU / VAPEUR ET SECOURS ASG',{anchor:'start',size:17});
    h+=text(18,48,'GV · pression commune : '+number(data.pressureSteam)+' bar',{anchor:'start',size:13,color:C.steam});
    [58,168,278,388].forEach(function(x,i){
      h+=path('M'+(x+29)+' 85 V65','steam','steam');
      h+=path('M'+(x+45)+' 205 V151','cold','cold');
      h+=path('M'+(x+15)+' 344 V153',C.bg).replace('stroke-width="2"','stroke-width="7"');
      h+=path('M'+(x+15)+' 344 V153','asg','asg');
      h+=gv('gv'+(i+1),x,85,selected,true);
      var id=['mpsa','mpsb','mpsc','mpsd'][i],name='MPS '+['A','B','C','D'][i];
      h+=equipment(id,name+' · motopompe ASG électrique · ouvrir la fiche',selected,[x-9,231,92,74],
        '<circle cx="'+(x+15)+'" cy="250" r="15" fill="'+C.bg+'" stroke="'+C.asg+'" stroke-width="2"/>'+path('M'+(x+7)+' 256 L'+(x+15)+' 240 L'+(x+23)+' 256 Z','asg')+text(x+27,285,name,{color:C.asg,size:13})+text(x+27,301,'ÉLECTRIQUE',{color:C.dim,size:10}));
      h+=equipment('asg'+(i+1),'Réserve ASG '+(i+1)+' · inventaire agrégé du modèle',selected,[x-13,333,98,61],
        '<rect x="'+(x-7)+'" y="340" width="86" height="45" rx="3" fill="'+C.bg+'" stroke="'+C.asg+'"/>'+text(x+36,359,'RÉSERVE '+(i+1),{size:11,color:C.asg})+text(x+36,376,'ASG',{size:12,color:C.asg}));
    });
    h+=path('M87 65 H862 V37','steam','steam');
    h+=path('M515 65 V129 H567','steam','steam');
    h+=path('M621 181 V277','steam','steam');
    h+=path('M488 65 V286 H554','steam','steam');
    h+=path('M621 336 V409 H459 V205 H103','cold','cold');
    // Turbine fonctionnelle : ne pas importer la géométrie HP/MP/3BP du N4.
    h+=equipment('turbine','Turbine · conversion vapeur vers arbre',selected,[558,91,154,101],
      '<path d="M568 120 L701 99 V179 L568 158 Z" fill="'+C.bg+'" stroke="'+C.metal+'" stroke-width="2"/>'+text(635,144,'TURBINE',{size:15}));
    h+=path('M701 148 H784','metal');
    h+=equipment('alternateur','Alternateur · bilan électrique calculé',selected,[751,109,151,115],
      '<circle cx="802" cy="148" r="29" fill="'+C.bg+'" stroke="'+C.metal+'" stroke-width="2"/>'+text(802,157,'~',{size:28})+text(814,197,'ALTERNATEUR',{size:12})+text(814,218,number(data.powerElectric,0)+' MWe',{color:C.dim,size:13}));
    h+=equipment('condenseur','Condenseur · ouvrir la fiche',selected,[550,270,173,72],
      '<rect x="557" y="277" width="158" height="59" fill="'+C.bg+'" stroke="'+C.metal+'" stroke-width="2"/>'+text(636,302,'CONDENSEUR',{size:13})+path('M568 321 H704','cold'));
    h+=path('M715 307 H788','cold');
    h+=pump('cvi','CVI',811,307,selected,344);
    h+=pump('are','ARE',530,409,selected,438,'left');
    h+=valve('gctc','GCT',488,241,selected,true,522,247);
    h+=valve('gcta','VDA',819,65,selected,false,819,91);
    h+=text(787,37,'ATMOSPHÈRE',{size:12,color:C.dim});
    h+='<path d="M94 385 V404 H424 V385 M204 385 V404 M314 385 V404" fill="none" stroke="'+C.asg+'" stroke-dasharray="4 4"/>';
    h+=text(234,424,'4 réserves communicables',{size:12,color:C.asg});
    h+=text(234,442,'Inventaire ASG et niveau GV agrégés',{size:11,color:C.dim});
    h+=text(760,376,'Circuit d’alimentation fonctionnel',{size:12,color:C.dim});
    h+=text(760,396,'États réels des pompes dans leurs fiches',{size:11,color:C.dim});
    return h;
  }
  function status(value,global){return value===1?(global?'DISPONIBLE':'INDISPONIBLE'):value===0?'INDISPONIBLE':'—';}
  // RS 2023 TAB-1.3.1 p.136–138 : quatre chaînes RRI / SEC. La source de
  // Flamanville est maritime. Les petits états décrivent les voies, pas un débit.
  function sourceCooling(data,selected){
    var st=data.state||{},h=text(18,25,'FLAMANVILLE · SOURCE FROIDE MARITIME',{anchor:'start',size:17});
    h+=text(18,48,'Mer : '+number(st.Tsrc)+' °C',{anchor:'start',size:13,color:C.cold});
    h+=text(900,48,'Condenseur : '+number(Number.isFinite(st.Pcond)?st.Pcond*1000:null)+' mbar',{anchor:'end',size:13});
    h+=path('M743 100 H605 M417 100 H190 V140 H743','cold','cold');
    h+=equipment('condenseur','Condenseur · circuit de circulation maritime',selected,[405,65,211,66],
      '<rect x="415" y="71" width="191" height="55" fill="'+C.bg+'" stroke="'+C.metal+'" stroke-width="2"/>'+text(510,94,'CONDENSEUR',{size:13})+text(510,115,'CRF · circuit ouvert',{size:11,color:C.cold}));
    h+=pump('crf','CRF',302,100,selected,81,'left');
    [0,1,2,3].forEach(function(i){
      var y=195+i*61;
      h+=path('M255 '+y+' H739','cold');
      h+=equipment('rra'+(i+1),'RIS-RA '+(i+1)+' · ouvrir les quatre trains',selected,[100,y-24,159,48],
        '<rect x="110" y="'+(y-21)+'" width="143" height="42" fill="'+C.bg+'" stroke="'+C.metal+'"/>'+text(181,y-2,'RIS-RA '+(i+1),{size:13})+text(181,y+14,'ÉCHANGEUR',{size:10,color:C.dim}));
      [['rri','RRI',335,st.voieRRI],['sec','SEC',535,st.voieSEC]].forEach(function(e){
        h+=equipment(e[0]+(i+1),e[1]+' '+(i+1)+' · état de la chaîne',selected,[e[2]-5,y-26,128,52],
          '<rect x="'+e[2]+'" y="'+(y-22)+'" width="118" height="44" fill="'+C.bg+'" stroke="'+C.cold+'"/>'+text(e[2]+59,y-3,e[1]+' '+(i+1),{size:13})+text(e[2]+59,y+15,status(e[3]&&e[3][i],!!(st.sec&&st.secOk&&(e[0]!=='rri'||st.rri)&&(st.reseau||st.diesel||(st.ilote&&st.turb>3)))),{size:10,color:C.dim}));
      });
    });
    h+=equipment('mer','La Manche · source froide maritime',selected,[738,64,164,355],
      '<rect x="745" y="71" width="149" height="337" rx="5" fill="#dceaf0" stroke="'+C.cold+'" stroke-width="1.7"/>'+text(819,203,'LA MANCHE',{color:C.cold,size:15})+path('M765 246 Q780 234 795 246 T825 246 T855 246 T882 246 M765 277 Q780 265 795 277 T825 277 T855 277 T882 277','cold')+text(819,314,'PRISE / REJET',{color:C.cold,size:12}));
    h+=text(460,437,'Disponibilité calculée · aucun débit individuel mesuré · RRI séparé de la mer',{color:C.dim,size:12});
    return h;
  }
  function render(page,data,selected){
    if(!['primaire','eauvapeur','sourcefroide'].includes(page))throw new RangeError('Page de synoptique EPR inconnue : '+page);
    data=data&&typeof data==='object'?data:{};
    var definitions=['hot','cold','steam','asg'].map(function(k){return '<marker id="epr-'+page+'-'+k+'" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto" markerUnits="strokeWidth"><path d="M0 0 L5 2.5 L0 5 Z" fill="'+C[k]+'"/></marker>';}).join('');
    var title={primaire:'EPR : quatre boucles primaires',eauvapeur:'EPR : quatre GV, quatre motopompes ASG électriques et circuit eau-vapeur',sourcefroide:'EPR : refroidissement maritime et quatre chaînes RRI / SEC'}[page];
    var body=(page==='primaire'?primary(data,selected):page==='eauvapeur'?secondary(data,selected):sourceCooling(data,selected)).replace(/url\(#epr-/g,'url(#epr-'+page+'-');
    return '<svg class="n4-svg epr-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 500" role="group" aria-label="'+esc(title)+'" font-family="Consolas, Liberation Mono, monospace"><defs>'+definitions+'</defs><style>.n4-svg .n4-equipment{cursor:pointer;outline:none}.n4-svg .n4-equipment:hover .n4-hit,.n4-svg .n4-equipment:focus .n4-hit,.n4-svg .n4-selected .n4-hit{stroke:#865e09;stroke-width:1.5;stroke-dasharray:4 3}.n4-svg text{pointer-events:none}</style><rect width="920" height="500" fill="'+C.bg+'"/>'+body+text(18,481,'Schéma fonctionnel · sélectionner un équipement pour sa fiche',{anchor:'start',size:12,color:C.dim})+'</svg>';
  }
  return {render:render};
});
