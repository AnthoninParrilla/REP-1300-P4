// SIMUREP — © 2026 AnthoninP — Tous droits réservés.
// Poste N4 privé. Données reçues et commandes déléguées au transport autorisé.
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./n4-synoptiques.js'),require('./n4-commandes.js'),require('./instruments-n4.js'));
  else root.SDCN4=factory(root.SDCN4Synoptiques,root.SDCN4Commandes,root.SDCN4Instruments);
})(typeof globalThis!=='undefined'?globalThis:this,function createPoste(SYN,CMD,INST,profile={}){
  const EPR=profile.palier==='EPR', PALIER=EPR?'EPR':'N4', PRINCIPAL=EPR?'MCP':'KIC', SECOURS=EPR?'MCS · Moyen de conduite de secours':'Panneau auxiliaire';
  'use strict';
  const PAGES={primaire:'Réacteur',eauvapeur:'Eau-vapeur',tendances:'Courbes',alarmes:'Alarmes',sauvegardes:'Sauvegardes',exploitation:'Exploitation',incidents:'Incidents',sourcefroide:'Source froide',instrumentation:'RPN · RIC · KRT',coeur:'Cœur',pt:'Domaine P/T',formation:'Aide & missions',auxiliaire:'Panneau auxiliaire'};
  // J2b : une salle 900/1300 fournit ses propres panneaux (le profil remplace la liste des postes N4/EPR).
  if(profile.pages){for(const k of Object.keys(PAGES))delete PAGES[k];Object.assign(PAGES,profile.pages);}
  if(EPR&&!profile.pages)PAGES.auxiliaire=SECOURS;
  const ETATS={AU:'Arrêt d’urgence réacteur','ÎLOT':'Îlotée : l’alternateur ne porte que ses auxiliaires',RP:'Réacteur en production',ANGV:'Arrêt normal sur GV',ANRRA:'Arrêt normal sur RRA',APIF:'Arrêt pour intervention, circuit fermé',APIO:'Arrêt pour intervention, circuit ouvert',APR:'Arrêt pour rechargement',RCD:'Réacteur complètement déchargé'};
  const ETAT_COURT={ANGV:'AN/GV',ANRRA:'AN/RRA',APIF:'API fermé',APIO:'API ouvert'},etatCourt=v=>ETAT_COURT[v]||v;   // relecture de la passe 2, tour 8 : les noms d'état du moteur, jamais leur code
  const NAV=profile.nav||Object.entries(PAGES).filter(([id])=>id!=='auxiliaire');
  const SYNOPTICS=profile.synoptics||['primaire','eauvapeur','sourcefroide'];
  const SYNTHESIS_METRICS=Object.freeze({
    powerThermal:Object.freeze({label:'Puissance thermique',unit:'MWth',digits:0}),
    powerElectric:Object.freeze({label:'Puissance électrique',unit:'MWe',digits:0}),
    pressurePrimary:Object.freeze({label:'Pression primaire',unit:'bar abs',digits:1}),
    tempAverage:Object.freeze({label:'Température moyenne',unit:'°C',digits:1}),
    tempHot:Object.freeze({label:'Branche chaude',unit:'°C',digits:1}),
    tempCold:Object.freeze({label:'Branche froide',unit:'°C',digits:1}),
    pressureSteam:Object.freeze({label:'Pression sortie GV',unit:'bar abs',digits:1}),
    levelPzr:Object.freeze({label:'Niveau pressuriseur',unit:'%',digits:1})
  });
  const DEFAULT_SYNTHESIS=Object.freeze(['powerThermal','pressurePrimary','tempAverage','pressureSteam']);
  function normalizeSynthesis(choices){return DEFAULT_SYNTHESIS.map((fallback,i)=>Array.isArray(choices)&&typeof choices[i]==='string'&&Object.hasOwn(SYNTHESIS_METRICS,choices[i])?choices[i]:fallback);}
  const NOMS={rcp:'Circuit primaire principal',pzr:'Pressuriseur',turbine:'Groupe turbo-alternateur',alternateur:'Alternateur',condenseur:'Condenseur',are:'Alimentation des GV',gctc:'Contournement au condenseur',gcta:'Contournement à l’atmosphère'};
  Object.assign(NOMS,{mpsa:'Motopompe ASG A',mpsb:'Motopompe ASG B',tpsa:'Turbopompe ASG A',tpsb:'Turbopompe ASG B',asg:'Alimentation de secours des GV',cvi:'Extraction des incondensables',fleuve:'Fleuve et appoint',crf:'Circulation du condenseur',sec:'Eau brute secourue',rri:'Réfrigération intermédiaire',tour:'Tour aéroréfrigérante'});
  if(EPR)Object.assign(NOMS,{mpsc:'Motopompe ASG C',mpsd:'Motopompe ASG D',mer:'Source maritime',gcta:'VDA · Décharge à l’atmosphère'});
  // Code de fiche identique à l'étiquette du synoptique et au titre des commandes (H06).
  const CODES={gctc:'GCT-C',gcta:EPR?'VDA':'GCT-A'};
  for(let i=1;i<=4;i++){if(EPR){NOMS['asg'+i]='Réserve ASG '+i;NOMS['rra'+i]='Train RIS-RA '+i;NOMS['rri'+i]='RRI du train '+i;NOMS['sec'+i]='SEC du train '+i;}NOMS['gv'+i]='Générateur de vapeur '+i;NOMS['gmpp'+i]='Pompe primaire '+i;}
  const escape=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number=(v,d=1)=>Number.isFinite(v)?v.toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d}):'—';
  // Geste 50 (136A du 25/10) : au bandeau, l'horloge du temps simulé en T+hh:mm:ss (comme le journal et le KIS), inconnue « — » (jamais 0),
  // et la version du simulateur reçue de l'hôte (lue au verTag du châssis), rien sans elle.
  const horloge=t=>Number.isFinite(t)?'T+'+[t/3600,t/60%60,t%60].map(v=>String(Math.floor(v)).padStart(2,'0')).join(':'):'—';
  const ligneVersion=ui=>ui.version?'<small class="n4-version">'+escape(ui.version)+'</small>':'';
  const value=(v,u,d=1)=>'<b>'+number(v,d)+'</b><span>'+escape(u)+'</span>';
  const measure=(name,v,u,d)=>'<div class="n4-measure"><span>'+escape(name)+'</span><div>'+value(v,u,d)+'</div></div>';
  function synthesis(ui,data){
    return normalizeSynthesis(ui.synthesis).map((key,i)=>{
      const metric=SYNTHESIS_METRICS[key];
      return '<div class="n4-measure"><select class="n4-synthesis-select" data-n4-synthesis="'+i+'" aria-label="Grandeur de la synthèse, emplacement '+(i+1)+'">'+Object.entries(SYNTHESIS_METRICS).map(([id,m])=>'<option value="'+id+'"'+(id===key?' selected':'')+'>'+escape(m.label)+'</option>').join('')+'</select><div>'+value(data[key],metric.unit,metric.digits)+'</div></div>';
    }).join('');
  }
  let instances=0;
  // Courbes (H13) : grandeurs déjà reçues par le poste, sélection multiple ; chaque grandeur garde sa couleur,
  // son unité et son échelle propre quel que soit l'ordre ou le nombre des choix. Couleur : [fond sombre N4, fond clair EPR].
  const CURVE_METRICS=Object.freeze({
    pressurePrimary:Object.freeze({label:'Pression primaire',unit:'bar abs',colors:['#65c8df','#126b98']}),
    tempAverage:Object.freeze({label:'Température moyenne',unit:'°C',colors:['#e7ba70','#a45b16']}),
    powerThermal:Object.freeze({label:'Puissance thermique',unit:'MWth',colors:['#c48acb','#854f94']}),
    powerElectric:Object.freeze({label:'Puissance électrique nette',unit:'MWe',colors:['#8fd18f','#2f7d32']}),
    tempHot:Object.freeze({label:'Branche chaude',unit:'°C',colors:['#ff8a70','#c0392b']}),
    tempCold:Object.freeze({label:'Branche froide',unit:'°C',colors:['#86a8ff','#1f4fb8']}),
    pressureSteam:Object.freeze({label:'Pression sortie GV',unit:'bar abs',colors:['#efe06a','#7d6f00']}),
    levelGV:Object.freeze({label:'Niveau GV',unit:'%',colors:['#5fd6b5','#0f7f6a']}),
    feedwaterPercent:Object.freeze({label:'Débit ARE',unit:'%',colors:['#c9b27c','#6e5a2e']}),
    boron:Object.freeze({label:'Bore primaire',unit:'ppm',colors:['#ff9ad5','#b0306e']}),
    turbineLoad:Object.freeze({label:'Charge turbine',unit:'%',colors:['#a3e635','#4d7c0f']}),
    rods:Object.freeze({label:'Position des grappes',unit:'%',colors:['#f2f2f2','#222a2e']})
  });
  const DEFAULT_CURVES=Object.freeze(['pressurePrimary','tempAverage','powerThermal']);
  function normalizeCurves(choices){if(!Array.isArray(choices))return DEFAULT_CURVES.slice();const wanted=new Set(choices.filter(k=>typeof k==='string'&&Object.hasOwn(CURVE_METRICS,k)));return Object.keys(CURVE_METRICS).filter(k=>wanted.has(k));}
  const CURVE_STATE={boron:'boreTotal',turbineLoad:'turb',rods:'rod'};
  function curveValue(data,key){const v=Object.hasOwn(CURVE_STATE,key)?data?.state?.[CURVE_STATE[key]]:data?.[key];return Number.isFinite(v)?v:null;}
  function courbe(data,large,choices=DEFAULT_CURVES){
    const keys=normalizeCurves(choices),histories=data.histories||{},tone=EPR?1:0;
    // Retour d'Anthonin (copie d'essai, 14/10 au soir) : tracées dans un seul cadre, chacune étirée sur toute sa hauteur, les grandeurs se
    // superposaient et l'enregistrement devenait illisible. Chaque grandeur a désormais sa bande, empilées sur un axe du temps commun ; son
    // nom, sa valeur, son unité et son échelle sont écrits au-dessus de sa bande en texte de la page, lisible au téléphone comme au PC
    // (la bande s'étire en largeur, ses traits gardent leur épaisseur). Le KIS repeint les couleurs des cadres et de la grille.
    const w=large?940:430,hb=large?90:60,x0=54,x1=w-20,yh=6,yb=hb-6;
    const grille=()=>{let g='';for(let i=1;i<=3;i++)g+='<path d="M'+x0+' '+(hb*i/4)+'H'+x1+'" stroke="#273139" stroke-width="1" vector-effect="non-scaling-stroke"/>';
      for(let i=0;i<=5;i++){const x=x0+(x1-x0)*i/5;g+='<path d="M'+x+' 0V'+hb+'" stroke="#273139" vector-effect="non-scaling-stroke"/>';}return g;};
    let traces=0;const bandes=[];
    // Abscisse en temps simulé quand il est reçu (échantillons irréguliers, changement de vitesse), sinon par rang ;
    // vignette allégée à 120 points au plus (dernier point toujours gardé).
    const tt=Array.isArray(histories.t)?histories.t:[],parTemps=tt.length>1&&tt.every(Number.isFinite),pas=large?1:Math.max(1,Math.ceil(tt.length/120));
    keys.forEach(key=>{const m=CURVE_METRICS[key],color=m.colors[tone],ys=Array.isArray(histories[key])?histories[key]:[];
      // J6, client 2 : une valeur inconnue (absence, page cachée) coupe le tracé, qui ne relie jamais deux points à travers un trou.
      const brut=ys.map((v,i)=>[parTemps&&tt.length===ys.length?tt[i]:i,v]).filter((p,i,a)=>Number.isFinite(p[0])&&(i%pas===0||i===a.length-1||!Number.isFinite(p[1]))),pts=brut.filter(p=>Number.isFinite(p[1]));
      const segs=[];let seg=[];for(const p of brut){if(Number.isFinite(p[1]))seg.push(p);else if(seg.length){segs.push(seg);seg=[];}}if(seg.length)segs.push(seg);
      if(pts.length<2){bandes.push('<div class="n4-bande"><div class="n4-chart-legend"><span data-n4-serie="'+key+'"><i style="background:'+color+'"></i>'+escape(m.label)+' <small>'+escape(m.unit)+' · en attente</small></span></div></div>');return;}
      traces++;let min=Math.min(...pts.map(p=>p[1])),max=Math.max(...pts.map(p=>p[1]));const pad=Math.max((max-min)*.15,Math.abs(max)*.002,.1);min-=pad;max+=pad;
      const a0=parTemps&&tt.length===ys.length?tt[0]:0,a1=parTemps&&tt.length===ys.length?tt[tt.length-1]:ys.length-1,n=a1>a0?a1-a0:1,echelle=number(min,1)+' à '+number(max,1);
      bandes.push('<div class="n4-bande"><div class="n4-chart-legend"><span data-n4-serie="'+key+'"><i style="background:'+color+'"></i>'+escape(m.label)+' <b>'+number(pts[pts.length-1][1],1)+'</b> <small>'+escape(m.unit)+' · échelle '+echelle+'</small></span></div>'
        +'<svg class="n4-chart" viewBox="0 0 '+w+' '+hb+'" preserveAspectRatio="none" role="img" aria-label="'+escape('Historique : '+m.label+', échelle '+echelle+' '+m.unit)+'"><rect width="100%" height="100%" fill="#090e12"/>'+grille()
        +segs.map(sg=>'<polyline data-n4-serie="'+key+'" points="'+sg.map(([a,v])=>(x0+(a-a0)*(x1-x0)/n).toFixed(1)+','+(yb-(v-min)/(max-min)*(yb-yh)).toFixed(1)).join(' ')+'" fill="none" stroke="'+color+'" stroke-width="1.7" vector-effect="non-scaling-stroke"/>').join('')+'</svg></div>');
    });
    // Axe du temps simulé : durée réellement couverte par l'historique reçu.
    const ts=Array.isArray(histories.t)?histories.t.filter(Number.isFinite):[],span=ts.length>1?ts[ts.length-1]-ts[0]:null;
    const duree=span===null?'début':'− '+(span>=3600?number(span/3600,1)+' h':span>=120?number(span/60,0)+' min':number(span,0)+' s');
    return '<div class="n4-chart-bandes'+(large?'':' n4-bandes-court')+'" role="group" aria-label="Historique des grandeurs sélectionnées, une bande par grandeur, échelles séparées">'+bandes.join('')
      +(traces?'<div class="n4-bande-temps"><span>'+duree+'</span><span>maintenant</span></div>':'<p class="n4-bande-vide">'+(keys.length?'Aucun historique reçu':'Aucune grandeur choisie')+'</p>')+'</div>';
  }
  function curveOptions(ui){const chosen=normalizeCurves(ui.curves),tone=EPR?1:0;
    return '<fieldset class="n4-chart-options"><legend>Grandeurs tracées · '+chosen.length+' sur '+Object.keys(CURVE_METRICS).length+'</legend>'+Object.entries(CURVE_METRICS).map(([key,m])=>'<button type="button" data-n4-curve="'+key+'" aria-pressed="'+chosen.includes(key)+'"><i style="background:'+m.colors[tone]+'"></i>'+escape(m.label)+' <small>'+escape(m.unit)+'</small></button>').join('')+'</fieldset>';}
  // ══ CYCLE D'ACQUITTEMENT, commun aux salles 900 et 1300 et aux postes N4 et EPR (déplacé de salle-900.js pour 21A du 13/10, sans
  //    changement) : apparition et disparition distinguées, un signal à chaque apparition, disparition ou réapparition ; acquitter une
  //    apparition arrête le klaxon et rend l'alarme fixe ; acquitter une disparition l'éteint. Acquitter n'efface jamais un défaut présent.
  //    Au début du quart, l'état présent est pris comme acquis (pas de rafale), comme le journal. État d'affichage seulement : aucune
  //    commande n'est envoyée au moteur. niveauDe(v) donne le niveau d'une verrine allumée, '' si elle est éteinte.
  function cycle(niveauDe){const A={etats:{},init:false,essai:0};
    function nourrir(verrines,t){
      if(!Array.isArray(verrines))return;
      // Une verrine sans identifiant n'est pas une alarme : l'état du GCT et de l'ASG au meuble de tranche du 900 (constat du 13/10)
      for(const v of verrines){if(!v||!v.id)continue;const L=niveauDe(v),e=A.etats[v.id]||(A.etats[v.id]={mode:'repos',niveau:'',t:null});
        if(!A.init){e.mode=L?'acquittee':'repos';e.niveau=L;continue;}
        if(L){if(e.mode==='repos'||e.mode==='disparue'||L!==e.niveau){e.mode='nouvelle';e.niveau=L;e.t=t;}}
        else if(e.mode==='acquittee'||e.mode==='nouvelle'){e.mode='disparue';e.t=t;}}
      A.init=true;}
    function acquitter(){let n=0;for(const e of Object.values(A.etats)){if(e.mode==='nouvelle'){e.mode='acquittee';n++;}else if(e.mode==='disparue'){e.mode='repos';e.niveau='';n++;}}return n;}
    function klaxon(){return Object.values(A.etats).some(e=>e.mode==='nouvelle'||e.mode==='disparue');}
    function compte(){const c={nouvelle:0,disparue:0,rouge:0,orange:0,blanc:0};for(const e of Object.values(A.etats)){if(e.mode==='nouvelle'||e.mode==='disparue')c[e.mode]++;if(e.mode!=='repos'&&e.mode!=='disparue'&&e.niveau)c[e.niveau]=(c[e.niveau]||0)+1;}return c;}
    return {A,nourrir,acquitter,klaxon,compte,essai:()=>Date.now()<A.essai,reset(){A.etats={};A.init=false;A.essai=0;}};}
  // Familles d'alarmes des postes (rouge, jaune, blanche ; 21A du 13/10, compteur des blanches) : le seuil haut est rouge ; une alarme
  // d'état ou d'action automatique allumée en ambre est blanche, les autres jaunes. Même ensemble que les lentilles blanches de la salle
  // 900 (choix de répartition, matrice SDC § 15.6), qui le reprend d'ici.
  const ALARMES_ETAT=new Set(['aGct','aGcta','aAsg','aEasOn','aIso','aIlot','aDiesel','aLls','aViv','aMan','aRecirc','aTpa']);
  const familleAlarme=(id,etat)=>!etat?'':etat==='rouge'?'rouge':ALARMES_ETAT.has(id)?'blanche':'jaune';
  const niveauAlarme=v=>v?familleAlarme(v.id,v.etat):'';
  // Acquittement aux postes N4 et EPR (21A et 22A du 13/10), comme aux salles 900 et 1300 : le cycle ci-dessus, nourri par mount des
  // verrines de chaque instantané ; « Acquitter » vaut pour toutes les alarmes, klaxon visuel sans son, aucune commande. Page Alarmes et
  // vignettes au PC, bouton au pouce au téléphone. MCS de l'EPR : ses alarmes s'acquittent seules tant que le MCP répond, son propre cycle
  // ne joue que MCP perdu (veille : MATRICE-EPR-PHASE-4.5 l. 91, epr-fla3 l. 2229-2235). Sans cycle (rendu hors montage), rien ne change.
  const ETAT_ALARME={nouvelle:'nouvelle',disparue:'disparue',acquittee:'acquittée'};
  const cycleVu=(ui,secours)=>ui&&ui.acq?(secours&&ui.acq.secours?ui.acq.secours:ui.acq.principal):null;
  const secondes=s=>{const m=/^T\+(\d+):(\d\d):(\d\d)$/.exec(String(s||''));return m?Number(m[1])*3600+Number(m[2])*60+Number(m[3]):-1;};
  const horodate=t=>Number.isFinite(t)?'T+'+String(Math.floor(t/3600)).padStart(2,'0')+':'+String(Math.floor(t/60%60)).padStart(2,'0')+':'+String(Math.floor(t%60)).padStart(2,'0'):'';
  // 30A du 13/10 : MCP perdu, son « Acquitter » est inhibé comme ses autres ordres (veille) et seul le MCS acquitte ; le bouton reste
  // lisible, désactivé, avec son motif court. Le KIC du N4 n'est pas visé (son panneau auxiliaire n'a pas de liste d'alarmes).
  const mcpPerdu=(data,secours)=>EPR&&!secours&&data.state?.ihm===false,MOTIF_MCP=' <small>MCP indisponible</small>';
  // Barre d'acquittement : en tête des alarmes (page et vignettes) et, courte, au bandeau du haut (29A du 13/10, comme aux salles 900 et
  // 1300). Au MCS tant que le MCP répond : une ligne le dit dans la liste, rien au bandeau.
  function acquittement(cy,data,secours,court){
    if(EPR&&secours&&data.state?.ihm!==false)return court?'':'<p class="n4-alarm-acq n4-alarm-auto">Alarmes acquittées automatiquement tant que le MCP répond.</p>';
    const k=cy.klaxon(),c=cy.compte(),n=c.nouvelle+c.disparue,inhibe=mcpPerdu(data,secours);
    return '<div class="n4-alarm-acq'+(court?' n4-alarm-acq-court':'')+'"><span class="n4-klaxon" data-on="'+k+'" role="status" aria-label="Klaxon '+(k?'actif : alarmes à acquitter':'au repos')+'"><i></i><b>KLAXON</b></span><em>'+(n?n+' à acquitter':'')+'</em><button type="button" data-n4-acquitter="'+(secours?'secours':'principal')+'" data-on="'+(k&&!inhibe)+'"'+(inhibe?' disabled':k?'':' aria-disabled="true"')+'>Acquitter'+(inhibe?MOTIF_MCP:'')+'</button></div>';}
  // Bandeau du haut (29A) et cinquième bouton du dock au téléphone : le poste vu (le MCS sur sa page, à l'EPR) ; le bouton du dock est
  // allumé tant que son klaxon est actif.
  function bandeauAcquitter(ui,data){const secours=EPR&&ui.page==='auxiliaire',cy=cycleVu(ui,secours);return cy?acquittement(cy,data,secours,true):'';}
  function dockAcquitter(ui,data){const secours=EPR&&ui.page==='auxiliaire',cy=cycleVu(ui,secours),k=!!cy&&cy.klaxon(),c=cy?cy.compte():null,n=c?c.nouvelle+c.disparue:0,inhibe=mcpPerdu(data||{},secours);
    return '<button type="button" class="n4-dock-acq" data-n4-acquitter="'+(secours?'secours':'principal')+'" data-on="'+(k&&!inhibe)+'"'+(inhibe?' disabled':k?'':' aria-disabled="true"')+'>Acquitter'+(inhibe?MOTIF_MCP:n?' <b>'+n+'</b>':'')+'</button>';}
  function alarmes(data,full,ui,secours){
    const rows=Array.isArray(data.alarms)?data.alarms:[],cy=cycleVu(ui,secours),suivi=!!cy&&cy.A.init;
    const counts=['rouge','jaune','blanche'].map(c=>'<span class="n4-alarm-count '+c+'"><i></i>'+escape(c)+'<b>'+rows.filter(a=>a.color===c).length+'</b></span>').join('');
    // Cycle suivi : chaque ligne dit son état ; une alarme disparue reste listée jusqu'à son acquittement ; la plus récente en tête.
    let lignes=rows.map(a=>({...a,mode:suivi&&a.id&&cy.A.etats[a.id]?cy.A.etats[a.id].mode:''}));
    if(suivi){const par=Object.fromEntries((Array.isArray(data.verrines)?data.verrines:[]).filter(v=>v&&v.id).map(v=>[v.id,v]));
      for(const [id,e] of Object.entries(cy.A.etats))if(e.mode==='disparue'&&par[id])lignes.push({time:horodate(e.t),origin:'PROTECTION',message:par[id].txt,mode:'disparue'});
      lignes.sort((a,b)=>secondes(b.time)-secondes(a.time));}
    const ligne=a=>'<div class="n4-alarm-row"'+(a.mode?' data-mode="'+a.mode+'"':'')+'><span>'+escape(a.time)+'</span><span>'+escape(a.origin)+'</span><span>'+escape(a.message)+'</span>'+(suivi?'<span class="n4-alarm-etat">'+(ETAT_ALARME[a.mode]||'')+'</span>':'')+'</div>';
    return (cy?acquittement(cy,data,secours):'')+'<div class="n4-alarm-counts">'+counts+'</div><div class="n4-alarm-table"><div class="n4-alarm-head"><span>HEURE</span><span>ORIGINE</span><span>MESSAGE</span>'+(suivi?'<span>ÉTAT</span>':'')+'</div>'+(lignes.length?lignes.map(ligne).join(''):'<div class="n4-alarm-empty">Aucune alarme active</div>')+'</div>'+(full?'<p class="n4-screen-note">Les couleurs distinguent les familles d’alarmes.'+(cy?' «&nbsp;Acquitter&nbsp;» vaut pour toutes les alarmes : une alarme nouvelle passe à acquittée, une alarme disparue quitte la liste, et le klaxon s’arrête.':'')+' Consulter le journal pour suivre la succession des événements.</p>':'');
  }
  // Lot 4 ter (6A du 07/10) : le journal de la tranche dans une fenêtre du KIC (N4) ou du MCP (EPR), en page Alarmes ; mêmes lignes,
  // colorées par famille comme les alarmes du poste (rouge, jaune, blanche). Aucune entrée de menu, aucune commande.
  function journalFenetre(data){const L=Array.isArray(data.journal)?data.journal:[];
    const ligne=x=>typeof x==='string'?'<p>'+escape(x)+'</p>':'<p data-famille="'+(['rouge','jaune'].includes(x.color)?x.color:'blanche')+'">'+(x.time?'<b>'+escape(x.time)+'</b>'+(x.origin||x.message?' · ':''):'')+escape([x.origin,x.message].filter(Boolean).join(' · '))+'</p>';
    return '<section class="n4-monitor n4-journal-monitor" aria-label="Journal de la tranche"><div class="n4-monitor-head"><span>JOURNAL DE LA TRANCHE</span><span>'+PRINCIPAL+'</span></div><div class="n4-journal">'+(L.length?L.map(ligne).join(''):'<p class="n4-journal-vide">Journal vide.</p>')+'</div></section>';}
  function fiche(data,id,ui){
    // Poste de secours : fiche en lecture, les commandes y sont celles du MCS / panneau auxiliaire (retour D3).
    if(CMD&&ui?.connected){const lecture=ui.page==='auxiliaire';return '<div class="n4-object-code">'+escape(CODES[id]||id.toUpperCase())+'</div><h3>'+escape(NOMS[id]||'Équipement')+'</h3>'+
      (lecture?'<p class="n4-fiche-lecture">Fiche en lecture au '+(EPR?'MCS':'panneau auxiliaire')+' : commander depuis ce poste, ou revenir au '+PRINCIPAL+'.</p>':'')+CMD.render(id,data,!lecture);}
    let infos='',note='',commands=[];
    if(id==='pzr'){
      infos=measure('Pression',data.pressurePrimary,'bar abs')+measure('Niveau',data.levelPzr,'%')+measure('Consigne',data.setPressure,'bar abs');
      note='Un pressuriseur commun aux quatre boucles, relié à une branche chaude.';commands=['Chaufferettes','Aspersion'];
    }else if(/^gmpp/.test(id)){
      // N4 (D12) et EPR (D16) : seul le nombre de GMPP en marche est reçu ; l'état d'une pompe n'est affiché que s'il s'en déduit.
      const n=Number(id.slice(-1)),pp=data.pumps||[],k=pp.length===4&&pp.every(v=>typeof v==='boolean')?pp.filter(Boolean).length:null;
      const recu=k===4?'MARCHE':k===0?'ARRÊT':k===null?'—':'NON IDENTIFIÉ';
      infos=measure('Boucle',n,'',0)+'<div class="n4-measure"><span>État de cette pompe</span><strong>'+recu+'</strong></div>'+(k!==null?'<div class="n4-measure"><span>Groupe GMPP</span><strong>'+k+' en service'+(k<4?' / '+(4-k)+' arrêtée'+(4-k>1?'s':''):'')+'</strong></div>':'');
      note='Circulation primaire entre la sortie du GV et la branche froide.';commands=['Marche','Arrêt'];
    }else if(/^gv/.test(id)){
      infos=measure('Pression sortie vapeur',data.pressureSteam,'bar abs')+measure('Niveau',data.levelGV,'%')+measure('Débit alimentaire',data.flowFeedwater,'t/h');
      note='Échange entre le primaire et le secondaire, sans mélange des deux eaux.';commands=['Régulation ARE','Réglage manuel'];
    }else if(id==='rcp'){
      infos=measure('Pression',data.pressurePrimary,'bar abs')+measure('Branche chaude',data.tempHot,'°C')+measure('Branche froide',data.tempCold,'°C');note='Quatre boucles primaires, chacune avec un GV et une pompe primaire.';
    }else{
      infos=measure('Puissance électrique',data.powerElectric,'MWe',0)+measure('Pression vapeur',data.pressureSteam,'bar abs');
      note='Sélection de l’équipement dans le synoptique eau-vapeur.';commands=id==='gctc'||id==='gcta'?['Automatique','Manuel']:['Sélection','Validation'];
    }
    return '<div class="n4-object-code">'+escape(CODES[id]||id.toUpperCase())+'</div><h3>'+escape(NOMS[id]||'Équipement')+'</h3>'+infos+'<p class="n4-object-note">'+note+'</p>'+(commands.length?'<div class="n4-commands">'+commands.map(c=>'<button type="button" disabled>'+c+'</button>').join('')+'</div><p class="n4-command-note">Commandes non raccordées dans cette étude graphique.</p>':'');
  }
  // Mission active (H18) : titre compact au-dessus de l'écran principal, dépliable (consigne ou bravo, progression),
  // conservé entre pages et rafraîchissements ; arrêt explicite, sans passer par le transport de conduite.
  // 2.17.0e (N2) : l'encart propose aussi la mission suivante (même effet que PASSER LA MISSION de la page Aide & missions).
  // J3 (passe 3) : l'encart porte aussi la ligne du guide quand le mode facile est allumé (7A), sur toutes les pages ; les termes
  // du lexique du palier joué y sont soulignés et, au toucher, leur définition s'ouvre dans l'encart (idée d'Anthonin du 04/10) ;
  // dans les salles 900 et 1300, « Montrer » amène la vue sur la zone citée et la fait briller (2A). Aucune commande au moteur.
  // J3 (passe 4, 3A) : premier quart ouvert depuis la page France — accueil en trois étapes, puis les cinq premières missions, puis
  // le bilan : seulement ce qui a été réussi, les missions passées à part, et la suite au choix du joueur. Aucune commande.
  const PQ_FAIT={main:'tu as baissé la charge et vu les grappes suivre toutes seules',pleine:'tu as ramené la tranche à pleine charge',
    revanche:'tu as gagné des mégawatts par la source froide, sans toucher au réacteur',xenon:'tu as vu le xénon monter après une baisse de charge',
    bore:'tu as compensé le xénon par la chimie, en baissant le bore'};
  function premierQuart(ui,data,salle){const q=data.premierQuart;if(!q||!q.etape)return '';
    const ici=escape(ui.site)+', tranche '+escape(ui.unitLabel||ui.unit)+(q.palier?' (palier '+escape(q.palier)+')':''),bouton=(a,l,c)=>'<button type="button"'+(c?' class="'+c+'"':'')+' data-n4-pq="'+a+'">'+l+'</button>';
    const ACCUEIL=[['Tu conduis cette tranche','Tu es aux commandes de '+ici+'. Le réacteur chauffe l’eau du circuit primaire ; dans les générateurs de vapeur, cette chaleur fait bouillir l’eau d’un second circuit, et la vapeur entraîne la turbine et l’alternateur.'],
      ['Tu as la main sur la charge','Pour ce premier quart, le suivi du réseau est coupé : la tranche ne suit plus sa production réelle, c’est toi qui décides de sa charge. Les automatismes s’occupent du reste, dans leurs limites : les grappes règlent la température, les régulations pilotent la pression et le niveau d’eau. Surveille-les : quand les grappes arrivent en butée, c’est le bore qui prend le relais.'],
      ['Cinq missions, puis un bilan','Baisser la charge, la remonter, gagner des mégawatts par la source froide, réveiller le xénon, puis le compenser au bore. '+(salle?'La fiche de consigne dit quoi faire ; « Montrer » t’amène à la commande et la fait briller':'L’encart des missions dit quoi faire')+' ; un mot souligné ouvre sa définition. Le Guide est en Pas à pas : tu peux le changer à tout moment, et accélérer le temps dans le volet « Simulation ».']];
    if(q.etape>=1&&q.etape<=3){const [t,p]=ACCUEIL[q.etape-1];
      return '<section class="n4-pq" aria-label="Premier quart, accueil '+q.etape+' sur 3"><p class="n4-pq-etape">Premier quart · '+q.etape+'/3</p><h3>'+t+'</h3><p>'+p+'</p><div class="n4-pq-actions">'+(q.etape<3?bouton('suivant','Suivant')+bouton('accueil-fin','Passer l’accueil','n4-pq-discret'):bouton('accueil-fin','C’est parti'))+'</div></section>';}
    if(q.etape!=='bilan')return '';
    const r=q.resultats||{},faits=Object.keys(PQ_FAIT).filter(k=>r[k]&&r[k].etat==='reussie').map(k=>PQ_FAIT[k]),passees=Object.keys(r).filter(k=>r[k]&&r[k].etat==='passee').map(k=>'« '+escape(r[k].titre||k)+' »');
    const phrase=faits.length?'Pendant ce premier quart, '+(faits.length>1?faits.slice(0,-1).join(', ')+' et '+faits[faits.length-1]:faits[0])+'.':'Aucune des cinq premières missions n’a été réussie : elles restent à faire.';
    return '<section class="n4-pq n4-pq-bilan" aria-label="Bilan du premier quart"><p class="n4-pq-etape">Premier quart · bilan</p><h3>Ce que tu as fait</h3><p>'+escape(phrase)+'</p>'+(passees.length?'<p>Passées sans réussite : '+passees.join(', ')+'.</p>':'')
      +'<p>Et maintenant ? Continue le parcours, conduis librement ta tranche, ou choisis-en une autre.</p><div class="n4-pq-actions">'+bouton('continuer','Continuer le parcours')+bouton('libre','Conduire librement','n4-pq-discret')+'<button type="button" class="n4-pq-discret" data-n4-nav="france">Choisir une autre tranche</button></div></section>';}
  // J3 (passe 5, 4A) : « Ce qui vient de se passer » (mission réussie : son bravo, ses relevés de la tentative, sa durée) et « Bilan de
  // l'arrêt » (arrêt automatique : cause écrite par le moteur, chaleur résiduelle, derniers évènements), au-dessus de l'encart, gardés
  // jusqu'au clic du joueur ; le carnet du quart les garde ensuite (page Aide & missions).
  function cvpCarte(data,T){const c=data.cvp;if(!c||!c.type)return '';const n=Number.isInteger(c.reste)&&c.reste>0?c.reste:0;
    const fermer='<div class="n4-pq-actions"><button type="button" data-n4-cvp="lu">'+(c.type==='arret'?'Compris':'Fermer')+(n?' · encore '+n:'')+'</button></div>';
    if(c.type==='arret')return '<section class="n4-pq n4-cvp n4-cvp-arret" aria-label="Bilan de l’arrêt"><p class="n4-pq-etape">Bilan de l’arrêt</p><h3>La protection a arrêté le réacteur</h3>'
      +'<p>Cause : '+escape(c.cause||'')+'.</p><p>Les grappes sont tombées : la réaction en chaîne s’est arrêtée. Le réacteur dégage encore de la chaleur'+(Number.isFinite(c.pres)?' ('+number(c.pres,0)+' MWth)':'')+' : vérifie maintenant que l’eau arrive aux générateurs de vapeur et que la vapeur peut s’évacuer.</p>'
      +(Array.isArray(c.journal)&&c.journal.length?'<p class="n4-cvp-sous">Évènements autour de l’arrêt</p><ul class="n4-cvp-releves">'+c.journal.map(l=>'<li>'+escape(l)+'</li>').join('')+'</ul>':'')+fermer+'</section>';
    return '<section class="n4-pq n4-cvp" aria-label="Ce qui vient de se passer"><p class="n4-pq-etape">Ce qui vient de se passer</p><h3>'+escape(c.titre||'')+'</h3>'+(c.bravo?'<p>'+lier(c.bravo,T)+'</p>':'')
      +(Array.isArray(c.lignes)&&c.lignes.length?'<p class="n4-cvp-sous">Relevés de ta tentative</p><ul class="n4-cvp-releves">'+c.lignes.map(l=>'<li>'+escape(l)+'</li>').join('')+'</ul>':'')
      +(c.duree?'<p class="n4-cvp-duree">Tentative : '+escape(c.duree)+' simulées.</p>':'')+fermer+'</section>';}
  function missionBar(ui,data,opt={}){
    // J6 2c : la fiche avant le bilan du premier quart, qui naît pendant sa lecture (bravo de 9 s) : sous elle, il ne la pousse plus de 360 px.
    const pq=cvpCarte(data,termes(data.lexique))+premierQuart(ui,data,typeof opt.montrer==='function');
    const m=data.mission,actif=!!(m&&m.actif),guide=typeof data.guide==='string'?data.guide.trim():'';
    if(!actif&&!guide)return pq+'<section class="n4-mission" data-n4-mission-bar hidden aria-label="Mission active"></section>';
    const T=termes(data.lexique),def=definition(ui.terme,T),ligneGuide=court=>guide?'<p class="n4-mission-guide'+(court?' n4-guide-court':'')+'"><b>Guide</b> '+lier(guide,T)+'</p>':'';
    if(!actif)return pq+'<section class="n4-mission n4-guide-seul" data-n4-mission-bar aria-label="Guide">'+ligneGuide(false)+def+'</section>';
    const total=Number.isInteger(m.total)?m.total:0,index=Math.max(0,Math.min(Number.isInteger(m.index)?m.index:0,total)),fin=!!m.termine||index>=total;
    // J3 (7A, 06/10) : parcours « Incidents » à part ; « Revenir au parcours » rend la mission du parcours principal.
    // Liste cochée, tour 5 (22/10) : la barre dit la position dans le parcours, comme le titre « MISSION n/total », jamais un compte de réussites.
    const inc=m.parcours==='incidents'||m.parcours==='histoire',titre=fin?'PARCOURS TERMINÉ':(m.parcours==='incidents'?'INCIDENT ':m.parcours==='histoire'?'HISTOIRE ':'MISSION ')+(index+1)+'/'+total,etat=fin?total+'/'+total:m.reussie?'réussie ✓':'en cours';
    const texte=fin?'Formation terminée : le guide, le lexique et les alertes restent à ton service.':m.reussie?m.bravo:m.consigne;
    // Passe 4 (2A) : Pas à pas montre la consigne geste par geste ; Indices, l'objectif et la grandeur à surveiller, les gestes sur
    // demande ; Libre, le titre seul, l'objectif et les gestes sur demande. Le bravo et la fin s'affichent à tous les niveaux.
    const niveau=['pas','indices','libre'].includes(data.guideNiveau)?data.guideNiveau:'pas',enCours=!fin&&!m.reussie,gestes=niveau==='pas'||!enCours||ui.gestes===index;
    const objectif=enCours&&niveau!=='pas'&&(niveau==='indices'||gestes)&&m.objectif?'<p class="n4-mission-objectif">'+lier(m.objectif,T)+'</p>':'';
    const voir=enCours&&niveau!=='pas'?'<button type="button" data-n4-mission="gestes" aria-expanded="'+gestes+'">'+(gestes?'Masquer les gestes':niveau==='libre'?'Aide : objectif et gestes':'Voir les gestes')+'</button>':'';
    const choix='<div class="n4-guide-choix" role="group" aria-label="Guide"><span>Guide</span>'+[['pas','Pas à pas'],['indices','Indices'],['libre','Libre']].map(([k,l])=>'<button type="button" data-n4-guide="'+k+'" aria-pressed="'+(k===niveau)+'">'+l+'</button>').join('')+'</div>';
    // J3 (05/10, 1A) : consigne en étapes d'une ligne ; l'étape en cours en tête (repliée, c'est elle qui reste à l'écran en Pas à pas, avec
    // une alerte du Guide s'il y en a une), toute la consigne repliée dessous, étapes faites cochées ; « Montrer » vise l'étape en cours.
    const etapes=enCours&&Array.isArray(m.etapes)&&m.etapes.length>1?m.etapes:null,k=etapes?Math.max(0,Math.min(Number.isInteger(m.etape)?m.etape:0,etapes.length-1)):0;
    const consigneHtml=etapes?'<p class="n4-etape"><b>Étape '+(k+1)+' sur '+etapes.length+'</b> '+lier(etapes[k],T)+'</p>':'<p>'+lier(texte,T)+'</p>';
    const toute=etapes?'<details class="n4-etapes"'+(ui.toute===index?' open':'')+'><summary data-n4-mission="toute">Toute la consigne</summary><ol>'+etapes.map((e,j)=>'<li'+(j===k?' aria-current="step"':'')+(Array.isArray(m.faites)&&m.faites[j]?' data-fait="true"':'')+'>'+lier(e,T)+'</li>').join('')+'</ol></details>':'';
    const alerte=/^(⚠|🟠|🚨|🔴|👉)/u.test(guide),replie=niveau==='pas'&&enCours?'<p class="n4-mission-guide n4-guide-court n4-etape-court"><b>'+(etapes?'Étape '+(k+1)+'/'+etapes.length:'Consigne')+'</b> '+lier(etapes?etapes[k]:texte,T)+'</p>'+(alerte?ligneGuide(true):''):ligneGuide(true);
    const vus=new Set(),cibles=ui.missionOpen&&!fin&&gestes&&typeof opt.montrer==='function'?[etapes?etapes[k]:texte,guide].flatMap(t=>opt.montrer(t)||[]).filter(c=>c&&c.cible&&!vus.has(c.cible)&&vus.add(c.cible)):[];
    const montrer=cibles.length?'<div class="n4-mission-montrer"><span>Montrer</span>'+cibles.map(c=>'<button type="button" class="n4-montrer" '+(opt.attribut||'data-n4-montrer')+'="'+escape(c.cible)+'">'+escape(c.label)+'</button>').join('')+'</div>':'';
    // J3 (passe 5) : le récit d'une mission historique, en tête de l'encart déplié, à tous les niveaux du Guide.
    const recit=enCours&&m.recit?'<p class="n4-mission-recit">'+lier(m.recit,T)+'</p>':'';
    // J3 (passe 6, 10A 11A) : prévision avant le geste clé. Libre et Indices : la question et ses trois réponses tant que le geste n'est pas
    // fait (la réponse peut changer jusque-là), puis la réponse donnée ; Pas à pas : l'effet attendu. La fiche de fin compare à la mesure.
    const pv=enCours&&m.prevision&&Array.isArray(m.prevision.choix)?m.prevision:null;
    const prevoir=!pv?'':niveau==='pas'?'<p class="n4-prevoir"><b>Effet attendu</b> '+lier(pv.effet,T)+'</p>'
      :pv.ouverte?'<p class="n4-prevoir"><b>Avant ton geste</b> '+lier(pv.question,T)+'</p><div class="n4-guide-choix n4-prevoir-choix" role="group" aria-label="Ta prévision">'
        +pv.choix.map((c,i)=>'<button type="button" data-n4-prevoir="'+i+'" aria-pressed="'+(pv.reponse===i)+'">'+escape(c)+'</button>').join('')+'</div>'
      :Number.isInteger(pv.reponse)&&pv.choix[pv.reponse]?'<p class="n4-prevoir"><b>Ta prévision</b> '+escape(pv.choix[pv.reponse])+'. La fiche de fin la comparera à la mesure.</p>':'';
    const detail=ui.missionOpen?'<div class="n4-mission-detail">'+recit+objectif+(gestes?consigneHtml:'')+prevoir+ligneGuide(false)+def+(gestes?toute:'')+'<progress max="'+Math.max(total,1)+'" value="'+(fin?total:index)+'" aria-label="'+(inc?(m.parcours==='histoire'?'Mission historique ':'Incident ')+(index+1)+' sur '+total:fin?'Parcours terminé : '+total+' sur '+total:'Progression du parcours : mission '+(index+1)+' sur '+total)+'"></progress>'+montrer+'<div class="n4-mission-actions">'+voir+(fin?'':'<button type="button" data-n4-mission="next">'+(inc?'Revenir au parcours':m.reussie?'Mission suivante':'Passer à la mission suivante')+'</button>')+'<button type="button" data-n4-mission="stop">Arrêter le parcours</button>'+(enCours?'<button type="button" data-n4-mission="recommencer">Recommencer</button>':'')+(ui.page!=='formation'?'<button type="button" data-n4-page="formation">Aide &amp; missions</button>':'')+'</div>'+choix+'</div>':'';
    return pq+'<section class="n4-mission" data-n4-mission-bar aria-label="Mission active"><button type="button" class="n4-mission-toggle" data-n4-mission="toggle" aria-expanded="'+!!ui.missionOpen+'"><b>'+titre+'</b><span>'+escape(fin?'Parcours de formation':m.titre||'')+'</span><small>'+etat+'</small></button>'+(ui.missionOpen?'':replie+def)+detail+'</section>';
  }
  // Termes du lexique (J3, passe 3) : formes cherchées dans le texte (titre, sigle entre parenthèses, sigles séparés par « / »),
  // sigles à la casse exacte, mots sans casse ; une seule fois par texte, jamais au milieu d'un mot ni d'un nom composé (AN/GV, RIS-RA),
  // ni dans un nom de zone cité.
  const TERMES=new WeakMap(),LETTRE=/[\p{L}\p{N}]/u;
  function formesDe(t){t=String(t||'').trim();if(!t)return [];const out=[];
    for(const p of /^[^\s/]+(?: \/ [^\s/]+)+$/.test(t)?t.split(' / '):[t]){const m=/^(.*?)\s*\(([^()]*)\)$/.exec(p);if(!m){out.push(p.trim());continue;}
      // Entre parenthèses : un sigle (« TPA (APP) ») ou une expression de plusieurs mots ; ni un nom de palier (« (EPR) »), ni un mot
      // seul (« (pilotage) »), ni une valeur (« (1450 MWe) »), ni une liste.
      const x=m[2].trim();out.push(m[1].trim());if(!/[,…]/.test(x)&&!/^\d/.test(x)&&!/^(EPR|N4|CPY|CP0|P4|P[’']4|900|1300)$/.test(x)&&(SIGLE(x)||/\s/.test(x)))out.push(x);}
    return out.filter(f=>f.length>=2&&/\p{L}/u.test(f));}
  const SIGLE=f=>!/\s/.test(f)&&f.length<=6&&/[A-Z0-9Δ]/.test(f.slice(1));
  function termes(lex){if(!Array.isArray(lex)||!lex.length)return null;let T=TERMES.get(lex);if(T)return T;
    const formes=[];lex.forEach((e,i)=>{for(const f of formesDe(e&&e.t))formes.push({f,i,sigle:SIGLE(f),bas:f.toLowerCase()});});
    formes.sort((a,b)=>b.f.length-a.f.length);T={lex,formes,memo:new Map()};TERMES.set(lex,T);return T;}
  const bord=c=>!c||!(LETTRE.test(c)||c==='/'||c==='-'||c==='_');
  function lier(texte,T){const s=String(texte==null?'':texte);if(!T)return escape(s);if(T.memo.has(s))return T.memo.get(s);
    const bas=s.toLowerCase(),pris=[...s.matchAll(/zone « [^»]*»/g)].map(z=>({k:z.index,fin:z.index+z[0].length,i:-1})),vus=new Set();
    for(const F of T.formes){if(vus.has(F.i))continue;const dans=F.sigle?s:bas,mot=F.sigle?F.f:F.bas;
      for(let k=dans.indexOf(mot);k>=0;k=dans.indexOf(mot,k+1)){const fin=k+mot.length;if(bord(s[k-1])&&bord(s[fin])&&!pris.some(p=>k<p.fin&&fin>p.k)){pris.push({k,fin,i:F.i});vus.add(F.i);break;}}}
    pris.sort((a,b)=>a.k-b.k);let out='',pos=0;
    for(const p of pris.filter(x=>x.i>=0)){out+=escape(s.slice(pos,p.k))+'<button type="button" class="n4-terme" data-n4-terme="'+escape(T.lex[p.i].t)+'">'+escape(s.slice(p.k,p.fin))+'</button>';pos=p.fin;}
    // J3 (06/10) : espaces insécables à l'intérieur des guillemets, jamais « en fin de ligne ni » en début (encart et ligne du Guide).
    out+=escape(s.slice(pos));out=out.replace(/« /g,'«&nbsp;').replace(/ »/g,'&nbsp;»');if(T.memo.size>300)T.memo.clear();T.memo.set(s,out);return out;}
  function definition(cle,T){const e=cle&&T?T.lex.find(x=>x&&x.t===cle):null;if(!e)return '';
    return '<div class="n4-terme-def" role="note" aria-label="Lexique : '+escape(e.t)+'"><p><b>'+escape(e.t)+'</b> : '+escape(e.d||'')+'</p>'+(e.p?'<details class="n4-terme-plus"><summary>En savoir plus</summary><p>'+escape(e.p)+'</p></details>':'')+'<button type="button" class="n4-terme-fermer" data-n4-terme="">Fermer</button></div>';}
  function secoursInstruments(data){
    if(profile.secoursInstruments)return profile.secoursInstruments(data,{escape,number});
    const readings=[['Pression primaire',data.pressurePrimary,180,'bar'],['Température primaire',data.tempAverage,350,'°C'],['Pression vapeur',data.pressureSteam,100,'bar'],['Niveau GV',data.levelGV,100,'%'],['Puissance neutronique',Number.isFinite(data.state?.Pn)?data.state.Pn*100:null,120,'%'],['Bâche ASG',Number.isFinite(data.state?.bacheASG)?data.state.bacheASG*100:null,100,'%']];
    if(!INST)return '';
    const lamps=[['ARRÊT RÉACTEUR',!!data.state?.scram,'red'],['SIGNAL IS',!!data.state?.sigIS,'red'],[EPR?'POMPES ASG EN MARCHE':'ASG EN SERVICE',EPR?(data.state?.asgMarche||[]).some(v=>v>0):!!data.state?.asg,'amber'],['RÉSEAU ABSENT',data.state?.reseau===false,'amber']];
    // Lot 4 ter (07/10) : verrines du palier en tête (4A, sans le mot de l'état), puis les six indicateurs de profil en rangée (1A avec B, 2A).
    return INST.verrines(lamps.map(([label,on,color])=>({label,on,color:color==='red'?'rouge':'ambre'})),{titre:'Verrines du panneau auxiliaire'})+'<div class="n4-physical-instruments">'+readings.map(([label,value,max,unit])=>INST.profile({label,value,min:0,max,unit})).join('')+'</div>';
  }

  // Coup de propre N4/EPR (04/10 : 8A, 15 bis A, 1A, 2A) : la page Cœur des postes porte l'écran RGL (positions comptée et mesurée par
  // groupe, fins de course, écarts), les commandes de la régulation des grappes (celles de la fiche RCP, mêmes identifiants), la carte des
  // grappes du plan lu (toucher une case : son détail, sans commande), puis la carte actuelle native (température, puissance, épuisement,
  // produits de fission, gaine). Couleurs des groupes : choix d'affichage.
  const COUL_GR=EPR?{P:'#e0473a',N:'#2f7fc1'}:{D:'#e0473a',C:'#e0a21a',B:'#3fa7d6',SA:'#8e7cc3',SB:'#5cb85c',SC:'#d46fa1',SD:'#9aa7b0'};
  const THEME_GR=EPR?{fond:'#f4f7fa',vide:'#dfe7ee',case:'#ffffff',trait:'#9cabb9',texte:'#3b526b',sel:'#c26a00',gris:'#8e989f'}:undefined;
  // V24 (S052) : l'EPR dessine le plan de 2006 (37 de contrôle, 52 d'arrêt ; 36 et 53 en 2023) ; son époque est dite sous le tableau et la légende.
  const SCHEMA_GR=EPR?'Schéma historique de 2006 : 37 grappes de contrôle et 52 grappes d’arrêt.':'En mode A, ce schéma regroupe 33 grappes de pilotage en D, C et B, et 40 grappes d’arrêt ; dans SIMUREP, seul D règle la température.';
  function grappesPage(ui,data){const v=data.grappes,st=data.state||{};
    return '<div class="n4-rgl-page">'+INST.ecranRGL(v,{auto:st.auto,couleurs:COUL_GR,schema:SCHEMA_GR})+(CMD?CMD.render('rcp',data,ui.connected):'')
      +'<h3 class="n4-gr-titre">Carte des grappes</h3>'+INST.carteGrappes(v,{sel:ui.caseCoeur,attr:'data-n4-case',couleurs:COUL_GR,theme:THEME_GR,schema:SCHEMA_GR})+'<h3 class="n4-gr-titre">Carte calculée</h3></div>';}
  function mainPanel(ui,data){
    if(['sauvegardes','exploitation','incidents','auxiliaire'].includes(ui.page)&&CMD)return (ui.page==='auxiliaire'?(EPR?alarmes(data,false,ui,true):'')+secoursInstruments(data):'')+CMD.render(ui.page,data,ui.connected,ui.page==='auxiliaire');
    const slot='<div data-n4-live-slot="'+ui.page+'" class="n4-live-slot" aria-label="Instruments intégrés"></div>';
    if(ui.page==='coeur'&&!profile.pages&&INST&&INST.ecranRGL)return grappesPage(ui,data)+slot;
    if(['instrumentation','coeur','pt','formation'].includes(ui.page))return slot;
    if(SYNOPTICS.includes(ui.page))return '<div class="n4-synoptic-viewport'+(ui.zoom?' n4-synoptic-zoom':'')+'" data-n4-pince="n4-'+ui.page+'">'+SYN.render(ui.page,data,ui.selected)+'</div>';
    if(ui.page==='tendances')return '<div class="n4-curves-page"><h2>Suivi des grandeurs</h2><p class="n4-screen-note">Mêmes tracés que la vignette du poste · une échelle par grandeur.</p>'+courbe(data,true,ui.curves)+curveOptions(ui)+'</div>'+slot;
    if(ui.page==='alarmes')return '<div class="n4-alarms-page"><h2>Traitement des alarmes</h2>'+alarmes(data,true,ui)+journalFenetre(data)+'</div>';
    return '<div class="n4-pa-page"><span class="n4-panel-ref">MOYEN DE CONDUITE DIVERSIFIÉ</span><h2>Panneau auxiliaire</h2><div class="n4-pa-sketch" aria-hidden="true">'+['Surveillance','État de tranche','Commandes'].map(t=>'<div><div class="n4-pa-lamps">● ● ● ● ●</div><b>'+t+'</b><div class="n4-pa-instruments">▱ ▱ ▱</div></div>').join('')+'</div><p>Le panneau auxiliaire est un moyen conventionnel indépendant du KIC, prévu pour conduire vers l’arrêt sûr lorsque la conduite informatisée est indisponible.</p><p class="n4-screen-note">Son implantation détaillée et ses commandes feront l’objet d’un dessin distinct. Cette page situe son rôle.</p></div>';
  }
  // Comme la vue CNPE : RP sans AU, admission turbine presque fermée et réacteur encore en puissance. V24 (S505, 14/10) : rien n'y prouve
  // que le GCT évacue la vapeur (ni GCT, ni condenseur, ni déclenchement), le bandeau ne l'affirme plus.
  function gct(data){const s=data.state||{};return data.stateLabel==='RP'&&!s.scram&&(s.turb||0)<1&&(s.Ptot||0)>0.1;}
  // Sortie du poste vers les vues du simulateur : seulement si l’hôte sait y conduire (onNavigate).
  // J1 (3A) : les niveaux se nomment France › Centrale › Tranche ; les deux premiers sont des sorties.
  // Revue du visible, liste cochée (22/10) : « la centrale du Blayais », comme deSite de la vue Centrale (cnpe.js), pour les salles 900 et 1300.
  const DU_SITE={Bugey:1,Blayais:1,Tricastin:1};
  function navigation(ui){return ui.navigation?'<nav class="n4-exit" aria-label="Niveaux du simulateur"><button type="button" data-n4-nav="france" aria-label="Revenir à la carte de France">France</button><i aria-hidden="true">›</i><button type="button" data-n4-nav="cnpe" aria-label="Revenir à la centrale '+(DU_SITE[ui.site]?'du ':'de ')+escape(ui.site)+'">Centrale</button><i aria-hidden="true">›</i><b aria-current="step">Tranche</b></nav>':'';}
  // J1 (2A, J1-8) : suivi du réseau et liaison au moteur toujours visibles dans l'en-tête du poste.
  // Fusion 2.17.0e : la couleur du témoin suit tout de suite le texte du châssis ; seul le message « liaison interrompue » attend 3 s.
  function temoins(data){const f=data.follow===true,l=data.liaison;return '<div class="n4-temoins"><span class="n4-temoin" data-on="'+f+'" title="Suivi du réseau : la consigne de charge suit la production réelle RTE tant que la charge n’est pas touchée (bouton « Suivre le réseau »)">⇄ suivi réseau '+(f?'actif':'coupé')+'</span>'+(l?'<span class="n4-temoin n4-liaison" data-on="'+(l.ok!==false&&!/injoignable|satur|non confirm/.test(l.texte||''))+'">● '+escape(l.texte||(l.ok!==false?'moteur en ligne':'liaison perdue'))+'</span>':'')+'</div>';}
  function sortiesMenu(ui){return ui.navigation?'<nav class="n4-thumb-exits" aria-label="Quitter la tranche"><button type="button" data-n4-nav="cnpe">‹ Centrale</button><button type="button" data-n4-nav="france">‹ France</button></nav>':'';}
  function simulationControls(ui,data){
    const button=(text,command,pressed)=>'<button type="button" data-n4-command="'+escape(JSON.stringify(command))+'" data-n4-command-name="'+text+'"'+(pressed!==undefined?' aria-pressed="'+pressed+'"':'')+(ui.connected?'':' disabled')+'>'+text+'</button>';
    return '<div class="n4-simulation"><b>SIMULATION</b> <span>Temps écoulé · '+number(data.simulationTime||0,0)+' s</span><div aria-label="Vitesse de simulation">'+[1,60,300,600].map(v=>button('×'+v,{type:'speed',v},data.state?.accel===v)).join('')+'</div><details><summary>Réinitialiser cette tranche…</summary><p>Cette tranche repart de son état initial : sa conduite, son journal et sa sauvegarde sur le serveur sont effacés. Tes missions, ton carnet, tes autres tranches et la conduite du réseau sont gardés.</p>'+button('Confirmer la réinitialisation',{type:'incident',id:'iReset'})+'</details></div>';
  }
  function render(ui,data){
    if(profile.render)return profile.render(ui,data,{escape,number,horloge,ligneVersion,etatCourt,synthesis,mainPanel,fiche,alarmes,bandeauAcquitter,dockAcquitter,courbe,curveOptions,missionBar,simulationControls,navigation,temoins,sortiesMenu,NAV,PAGES,SYNOPTICS});
    const title=ui.page==='primaire'?'RCP · CIRCUIT PRIMAIRE ET GÉNÉRATEURS DE VAPEUR':ui.page==='eauvapeur'?'VVP / ARE · CIRCUIT EAU-VAPEUR':PAGES[ui.page].toUpperCase();
    // 56A du 20/10 : les touches d'écrans en haut de la console, au-dessus des écrans (comme le sélecteur de l'EPR) ; au PC, n4.css les
    // garde en haut de la fenêtre quand la page défile ; au téléphone, le menu « Écrans » du dock reste le seul menu (H12).
    const touches='<nav class="n4-page-keys" aria-label="Écrans du poste">'+NAV.map(([id,t],i)=>'<button type="button" data-n4-page="'+id+'" aria-current="'+(ui.page===id?'page':'false')+'"><small>'+String(i+1).padStart(2,'0')+'</small>'+t+'</button>').join('')+'</nav>';
    return '<div class="n4-sdc '+(ui.page==='auxiliaire'?'n4-secours':'')+'">'+(ui.published?'':'<div class="n4-study">ESSAI PRIVÉ · '+PALIER+' <span>'+ (ui.connected?'Conduite raccordée · qualification fermée':'Consultation · moteur non raccordé') +'</span></div>')+
      '<header class="n4-header">'+navigation(ui)+'<div class="n4-brand"><b>SIMUREP</b><span>Le simulateur du parc électronucléaire français</span>'+ligneVersion(ui)+'</div>'+(ui.navigation?'':'<div class="n4-steps" aria-label="Niveaux du simulateur"><span>France</span><i>›</i><span>Centrale</span><i>›</i><b>Tranche</b></div>')+'<div class="n4-unit"><strong>'+escape(ui.site.toUpperCase())+' · TRANCHE&nbsp;'+escape(ui.unitLabel||ui.unit)+'</strong><span>PALIER '+PALIER+' ('+(EPR?'1650':'1450')+' MWe)</span></div>'+temoins(data)+'<details class="n4-session"><summary>Simulation <span>'+horloge(data.simulationTime)+' · ×'+(data.state?.accel||1)+'</span></summary>'+simulationControls(ui,data)+'</details></header>'+
      '<div class="n4-wall"><div class="n4-wall-title"><span>SYNTHÈSE DE TRANCHE</span><b>'+escape(etatCourt(data.stateLabel)||'—')+'</b></div><div class="n4-wall-measures">'+synthesis(ui,data)+'</div><div class="n4-wall-footer"><span>4 BOUCLES</span></div></div>'+
      '<div class="n4-quickbar"><span>'+escape(etatCourt(data.stateLabel)||'—')+(ETATS[data.stateLabel]?' · '+ETATS[data.stateLabel]:'')+(data.targetState&&data.targetState!==data.stateLabel?' · état visé '+escape(etatCourt(data.targetState)):'')+(gct(data)?' · admission turbine presque fermée : vérifie l’évacuation de la chaleur':'')+'</span>'+bandeauAcquitter(ui,data)+'<button type="button" data-n4-page="auxiliaire">'+SECOURS+'</button><button type="button" class="n4-scram" data-n4-command="{&quot;type&quot;:&quot;scram&quot;'+(data.state?.ihm===false||ui.page==='auxiliaire'?',&quot;poste&quot;:&quot;secours&quot;':'')+'}"'+(ui.connected?'':' disabled')+'>ARRÊT D’URGENCE</button></div><div class="n4-command-status" data-active="'+!!ui.status+'" role="status">'+escape(ui.status||'')+'</div>'+(data.state?.ihm===false?'<div class="n4-kic-lost">'+PRINCIPAL+' INDISPONIBLE · Rejoindre '+(EPR?'le MCS':'le panneau auxiliaire')+'.</div>':'')+'<div class="n4-console"><div class="n4-desk-head"><span>'+(ui.page==='auxiliaire'?'CONDUITE CONVENTIONNELLE':'CONDUITE INFORMATISÉE')+'</span><span class="n4-selection-help">Sélectionner un équipement : mesures et commandes</span></div>'+touches+
      '<div class="n4-monitors '+(SYNOPTICS.includes(ui.page)?'':'n4-single')+'"><section class="n4-monitor n4-main-monitor'+(ui.page==='auxiliaire'?' n4-physical-panel':'')+'"><div class="n4-monitor-head'+(ui.page==='auxiliaire'?' n4-physical-title':'')+'"><span>'+title+'</span><span>'+PALIER+' / '+(ui.page==='auxiliaire'?(EPR?'MCS':'PA'):String(NAV.findIndex(([id])=>id===ui.page)+1).padStart(2,'0'))+'</span>'+(SYNOPTICS.includes(ui.page)?'<button class="n4-zoom-key" type="button" data-n4-zoom="toggle" aria-pressed="'+!!ui.zoom+'">'+(ui.zoom?'Vue entière':'Agrandir')+'</button>':'')+'</div>'+missionBar(ui,data)+'<div class="n4-main-content">'+mainPanel(ui,data)+'</div></section>'+
      '<aside class="n4-monitor n4-object-monitor" aria-label="Fiche de l’équipement sélectionné"><div class="n4-monitor-head"><span>FICHE ÉQUIPEMENT</span><span>'+(ui.page==='auxiliaire'?'LECTURE':'CONDUITE')+'</span></div><div class="n4-object-body" aria-live="polite">'+fiche(data,ui.selected,ui)+'</div></aside></div>'+
      '<div class="n4-lower-monitors"><section class="n4-monitor n4-alarm-monitor"><div class="n4-monitor-head"><span>ZONE ALARMES</span><span>MESSAGES CLASSÉS</span></div>'+alarmes(data,false,ui)+'</section><section class="n4-monitor n4-trend-monitor"><div class="n4-monitor-head"><span>ENREGISTREURS</span><button type="button" data-n4-page="tendances">Agrandir ↗</button></div>'+courbe(data,false,ui.curves)+'</section></div>'+
      '<footer class="n4-desk-footer"><span>'+PRINCIPAL+' · Conduite sur écrans</span><span>© 2026 AnthoninP · SIMUREP</span></footer></div><nav class="n4-thumb-dock" aria-label="Navigation au pouce"><button type="button" data-n4-menu="toggle" aria-expanded="'+!!ui.menu+'">Écrans</button><button type="button" data-n4-fiche="true">Fiche</button><button type="button" data-n4-page="auxiliaire">Secours</button>'+dockAcquitter(ui,data)+'<button type="button" class="n4-scram" data-n4-command="{&quot;type&quot;:&quot;scram&quot;'+(data.state?.ihm===false||ui.page==='auxiliaire'?',&quot;poste&quot;:&quot;secours&quot;':'')+'}"'+(ui.connected?'':' disabled')+'>Arrêt<br>d’urgence</button></nav>'+(ui.menu?'<div class="n4-thumb-menu"><div><b>Écrans du poste</b><button type="button" data-n4-menu="toggle">Fermer</button></div><nav>'+NAV.map(([id,label])=>'<button type="button" data-n4-page="'+id+'" aria-current="'+(ui.page===id?'page':'false')+'">'+label+'</button>').join('')+'</nav>'+sortiesMenu(ui)+'</div>':'')+'</div>';
  }
  function mount(host,options={}){
    if(!host||!host.addEventListener)throw new Error('SDC N4 : hôte DOM requis');
    let data={...(options.snapshot||{})},ui={site:options.site||(EPR?'Flamanville':'Civaux'),unit:options.unit||(EPR?3:1),unitLabel:String(options.unitLabel||options.unit||(EPR?3:1)),page:profile.pageInitiale||'primaire',selected:profile.selectionInitiale===undefined?'pzr':profile.selectionInitiale,synthesis:normalizeSynthesis(options.synthesis),zoom:false,published:options.published===true,version:String(options.version||''),connected:typeof options.onCommand==='function',navigation:typeof options.onNavigate==='function',status:'',menu:false,curves:normalizeCurves(options.curves),missionOpen:options.missionOpen===true,acq:profile.pages?null:{principal:cycle(niveauAlarme),secours:EPR?cycle(niveauAlarme):null}},alive=true,statusTimer=null;
    // 21A et 22A du 13/10 : chaque instantané nourrit le cycle du poste (montage neuf : le présent est pris comme acquis) ; au MCS de l'EPR,
    // acquittement automatique tant que le MCP répond.
    function nourrirAlarmes(d){const a=ui.acq;if(!a)return;a.principal.nourrir(d.verrines,d.simulationTime);if(a.secours){a.secours.nourrir(d.verrines,d.simulationTime);if(d.state?.ihm!==false)a.secours.acquitter();}}
    nourrirAlarmes(data);
    const prefix='n4-instance-'+(++instances)+'-';
    const telephone=host.ownerDocument?.defaultView?.matchMedia?.('(max-width:760px), (max-width:1000px) and (max-height:500px)'),bascule=()=>{if(telephone&&!telephone.matches&&ui.menu){ui.menu=false;draw();}};telephone?.addEventListener?.('change',bascule);
    // Relecture du 20/10 (56A) : au PC dès 1001 px (la requête de n4.css et d'epr.css), l'encart déplié et la définition d'un terme sont posés
    // par-dessus l'écran des postes N4 et EPR ; le focus clavier qui passe dessous, dans l'écran, les replie (les salles les gardent dans le
    // flux). Échap les referme partout et rend le focus au titre de l'encart.
    const parDessus=profile.pages?null:host.ownerDocument?.defaultView?.matchMedia?.('(min-width:1001px)'),voletSous=e=>{if(!parDessus?.matches||!(ui.missionOpen||ui.terme)||!e.target?.closest?.('.n4-main-content'))return;const m=ui.missionOpen;ui.missionOpen=false;ui.terme='';draw();if(m)options.onMissionOpen?.(false);};
    let dessine=false;
    const draw=()=>{
      if(!alive)return;
      const doc=host.ownerDocument,active=doc?.activeElement;
      const focusKey=active&&host.contains(active)?['data-n4-page','data-n4-command','data-n4-equipement','data-n4-native','data-n4-zoom','data-n4-menu','data-n4-fiche','data-n4-nav','data-n4-curve','data-n4-mission','data-n4-terme','data-n4-guide','data-n4-pq','data-n4-cvp','data-n4-acquitter'].find(k=>active.hasAttribute?.(k)):null,focusValue=focusKey?active.getAttribute(focusKey):null;
      const left=host.querySelector('.n4-synoptic-viewport')?.scrollLeft||0,ficheAvant=!dessine||!!host.querySelector('.n4-pq');dessine=true;
      const markup=render(ui,data).replace(/\bid="([^"]+)"/g,(_,id)=>'id="'+prefix+id+'"').replace(/url\(#([^\)]+)\)/g,(_,id)=>'url(#'+prefix+id+')');
      // Conserver les nœuds vivants : saisie, focus, scroll et menus natifs.
      // Seul le champ actuellement édité est préservé ; les alarmes continuent à évoluer.
      if(doc?.createElement&&host.firstChild){
        const template=doc.createElement('template');template.innerHTML=markup;
        function sync(parent,next){
          const wanted=[...next.childNodes];
          wanted.forEach((fresh,i)=>{
            const old=parent.childNodes[i];
            if(!old){parent.appendChild(fresh.cloneNode(true));return;}
            if(old.nodeType!==fresh.nodeType||old.nodeName!==fresh.nodeName){old.replaceWith(fresh.cloneNode(true));return;}
            if(old.nodeType===3){if(old.nodeValue!==fresh.nodeValue)old.nodeValue=fresh.nodeValue;return;}
            if(old.nodeType!==1)return;
            if(old.hasAttribute('data-n4-live-slot')&&old.getAttribute('data-n4-live-slot')===fresh.getAttribute('data-n4-live-slot'))return;
            if(old===active&&['INPUT','SELECT'].includes(old.tagName))return;
            for(const attr of [...old.attributes])if(!(old.tagName==='DETAILS'&&attr.name==='open')&&!fresh.hasAttribute(attr.name))old.removeAttribute(attr.name);
            for(const attr of [...fresh.attributes])if(old.getAttribute(attr.name)!==attr.value)old.setAttribute(attr.name,attr.value);
            sync(old,fresh);
            if(['INPUT','SELECT'].includes(old.tagName)&&old.value!==fresh.value)old.value=fresh.value;
          });
          while(parent.childNodes.length>wanted.length)parent.lastChild.remove();
        }
        sync(host,template.content);
      }else host.innerHTML=markup;
      for(const c of CADRES)if(!c.isConnected){CADRES.delete(c);for(const type of ['touchstart','touchmove','touchend','touchcancel','gesturestart'])c.removeEventListener(type,pinceEvent,{passive:false});c.removeEventListener('scroll',pinceDefile,{passive:true});}
      host.querySelectorAll?.('[data-n4-pince]').forEach(pinceAppliquer);
      const viewport=host.querySelector('.n4-synoptic-viewport');if(viewport&&ui.zoom)viewport.scrollLeft=left;
      // J6 2c : le focus d'un nœud remplacé est rendu avant de juger la fiche née (il l'était après, et reprenait le sien à la fiche).
      if(focusKey&&!active?.isConnected)[...(host.querySelectorAll?.('['+focusKey+']')||[])].find(e=>e.getAttribute(focusKey)===focusValue)?.focus({preventScroll:true});
      // J6, client 2 (110A) : une fiche qui naît (premier quart, « Ce qui vient de se passer », bilan) est amenée dans l'écran ; au téléphone,
      // elle naissait 2 600 px au-dessus de la consigne touchée, sans que rien ne le dise.
      // Rien au premier rendu du montage (le bandeau d'absence vient au-dessus), rien pendant une saisie, rien si elle est déjà entière à
      // l'écran ; amenée, elle prend le focus quand il était sur une commande restée hors de vue.
      // J6 2c (C-07) : une consigne déjà envoyée par Entrée n'est plus une saisie (aux postes, au téléphone, la fiche de « Pleine puissance »
      // naissait 350 à 570 px au-dessus, le focus resté dans la consigne de charge) ; née dans l'écran, la fiche prend aussi le focus d'une
      // commande qu'elle a poussée hors de vue (la cuve touchée). Le focus va à son bouton d'action, jamais à un mot du lexique.
      const ficheNee=!ficheAvant&&host.querySelector('.n4-pq'),actif=doc?.activeElement,saisie=/^(INPUT|SELECT|TEXTAREA)$/.test(actif?.tagName||'')&&!(actif.hasAttribute?.('data-n4-set')&&envoyees.get(actif)===actif.value);
      if(ficheNee?.getBoundingClientRect&&!saisie){const r=ficheNee.getBoundingClientRect(),H=doc?.defaultView?.innerHeight||0,amenee=!!H&&(r.top<0||r.bottom>H);if(amenee)ficheNee.scrollIntoView?.({block:'start'});
        const a=doc.activeElement,q=a?.getBoundingClientRect?.();if(H&&a&&a!==doc.body&&host.contains(a)&&!ficheNee.contains(a)&&(amenee||q&&(q.bottom<=0||q.top>=H)))(ficheNee.querySelector('[data-n4-pq],[data-n4-cvp]')||ficheNee.querySelector('button'))?.focus?.({preventScroll:true});}
      options.onPageMount?.(ui.page,host.querySelector('[data-n4-live-slot]'));
    };
    function selectPage(page){if(!Object.hasOwn(PAGES,page))return;releaseHold();const autre=page!==ui.page;ui.page=page;ui.menu=false;ui.zoom=false;if(autre&&page==='primaire')ui.selected='pzr';if(autre&&page==='eauvapeur')ui.selected='turbine';if(autre&&page==='sourcefroide')ui.selected=EPR?'mer':'tour';draw();host.querySelector('.n4-main-monitor')?.scrollIntoView?.({block:'start'});}
    function setSynthesis(choices){
      if(!alive)return;
      ui.synthesis=normalizeSynthesis(choices);draw();
      if(typeof options.onSynthesisChange==='function')options.onSynthesisChange(ui.synthesis.slice());
    }
    function announce(message){ui.status=message;const win=host.ownerDocument?.defaultView;if(win){win.clearTimeout(statusTimer);statusTimer=win.setTimeout(()=>{ui.status=lienPerdu?LIEN_PERDU:'';draw();},4500);}}
    // 2.17.0e (N6) : liaison au moteur perdue depuis 3 s (data.liaison, lu par l'hôte) : message tenu jusqu'au retour, valeurs figées dites.
    const LIEN_PERDU='Liaison avec le moteur interrompue : les valeurs affichées ne bougent plus. L’affichage reprend seul au retour de la liaison, avec l’état réel de ta tranche.';   // J6 : le serveur peut être arrêté, rien n'est affirmé sur lui
    let lienPerdu=false;
    function lien(l){const perdu=!!l&&l.ok===false;if(perdu===lienPerdu)return;lienPerdu=perdu;if(perdu){ui.status=LIEN_PERDU;host.ownerDocument?.defaultView?.clearTimeout(statusTimer);}else announce('Liaison avec le moteur rétablie : valeurs à jour.');}
    // Accusé lisible : ce que la commande a établi, pas un booléen générique (retour D3).
    const MODES={auto:'Régulation grappes',areAuto:'Régulation ARE',pzrAuto:'Régulation pression',gctMode:'Régulation GCT-C',gctaMode:EPR?'Régulation VDA':/^(CPY|CP0|P4|P'4)$/.test(profile.palier||'')?'Régulation GCTa':'Régulation GCT-A'};   // tour 8 : GCTa aux salles 900/1300
    const nombre=v=>Number.isFinite(v)?v.toLocaleString('fr-FR',{maximumFractionDigits:3}):String(v);
    // Pompes ASG nommées comme au journal : EPR, quatre motopompes (tpsA/tpsB = C/D) ; N4, deux motopompes et deux turbopompes.
    const POMPES_ASG=profile.pompesAsg||(EPR?{mpsA:'Motopompe ASG A',mpsB:'Motopompe ASG B',tpsA:'Motopompe ASG C',tpsB:'Motopompe ASG D'}
      :{mpsA:'Motopompe ASG A',mpsB:'Motopompe ASG B',tpsA:'Turbopompe ASG A',tpsB:'Turbopompe ASG B'});
    function accuse(c,label,r){
      const on=c.v===true||c.v==='auto',voie=Number.isInteger(c.i)?(EPR?'Train '+(c.i+1):'Voie '+['A','B','C','D'][c.i]):'';
      if(c.type==='set'&&Object.hasOwn(MODES,c.k))return MODES[c.k]+' : '+(on?'AUTO':'MANU');
      if(c.type==='set'&&c.k==='viv')return 'VIV : '+(c.v?'ouvertes':'fermées');
      if(c.type==='set'&&c.k==='saison')return 'Saison : '+({hiver:'hiver',mi:'mi-saison',ete:'été'}[c.v]||c.v);   // tour 8 : la saison en clair
      if(c.type==='set'&&c.k==='turbRate')return 'Pente de charge : '+nombre(c.v*60)+' %/min';
      if(c.type==='set'&&(c.k==='bori'||c.k==='dilu'))return (c.k==='bori'?'Borication':'Dilution')+' : '+(c.v?'maintenue':'arrêtée');
      if(c.type==='set'&&/^inh|^aarInhib$/.test(c.k))return 'Inhibition '+(label||c.k)+' : '+(c.v?'active':'levée');
      // Pompes ASG (D22, comme D21) : l'accusé nomme la pompe et dit l'ordre ; la fiche dit ensuite la marche (courant, vapeur, bâche).
      if(c.type==='set'&&Object.hasOwn(POMPES_ASG,c.k))return POMPES_ASG[c.k]+' : '+(c.v?'ordre de marche':'à l’arrêt');
      if(c.type==='set'&&typeof c.v==='boolean')return (label||c.k)+' : '+(c.v?'en service':'à l’arrêt');
      if(c.type==='set')return (label||'Consigne')+' : '+nombre(c.v);
      // RRA non raccordé (primaire chaud) : un ordre de voie n'évacue rien ; l'accusé le dit, sans « en service ».
      if(c.type==='voie'&&c.role==='RA'){const raccorde=data.state?.rra!==false;
        return voie+(EPR?' · alignement RA : '+(c.v?'actif':'inactif'):' RRA : '+(raccorde?(c.v?'en service':'arrêtée'):(c.v?'ordre de mise en service':'ordre d’arrêt')))+(raccorde?'':' · '+(EPR?'RIS-RA':'RRA')+' non raccordé, aucune évacuation');}
      if(c.type==='voie'&&c.role==='HS')return voie+' : '+(c.v?(EPR?'mis hors service':'mise hors service'):(EPR?'rendu disponible':'rendue disponible'));   // tour 3 de la liste cochée (22/10) : « Train » à l'EPR, « Voie » ailleurs
      if(c.type==='voie')return voie+' · '+c.role+' : '+(c.v?'rétabli':'perdu');
      if(c.type==='speed')return 'Vitesse : ×'+c.v;
      if(c.type==='etat')return r&&r.remontee?(r.isolee?(EPR?'RIS-RA':'RRA')+' isolé : tranche en AN/GV'+(c.e==='RP'?' ; RP ensuite, à l’arrêt à chaud':''):'Remontée engagée vers l’AN/GV : le '+(EPR?'RIS-RA':'RRA')+(data.state?._rraT===0?' ne refroidit plus, rétablis le refroidissement à l’arrêt':' retient la chauffe jusqu’à son isolement')+(c.e==='RP'?' ; RP ensuite, à l’arrêt à chaud':'')):'État '+etatCourt(c.e)+' : atteint';
      if(c.type==='ihm')return (EPR?'MCP':'KIC')+' : '+(c.perdue?'perdu, conduite au '+(EPR?'MCS':'panneau auxiliaire'):'rétabli');
      return label?label+' : appliqué':'Commande acceptée';
    }
    function send(command,label=''){
      // « Suivre le réseau » bascule le suivi : l'accusé dit l'état obtenu, et non « appliqué » (retour d'Anthonin, 14/10 au soir).
      const suivi=command.type==='action'&&command.id==='bSuivre'?!data.follow:null;
      const success=r=>suivi===null?accuse(command,label,r):suivi?'Suivi du réseau : actif, la charge suit la production réelle':'Suivi du réseau : coupé, tu as la main sur la charge';
      if(!ui.connected)return;
      try{const result=options.onCommand(command);if(result&&typeof result.then==='function'){announce('Commande en cours…');result.then(r=>{announce(r?.ok?success(r):r?.motif||'Commande refusée');draw();}).catch(()=>{announce('Commande non confirmée : vérifie l’état affiché avant de recommencer.');draw();});}else announce(result?.ok?success(result):result?.motif||'Commande refusée');}catch(error){announce('Commande refusée : '+error.message);}
      draw();
    }
    let held=null,tenu=null;   // tenu : bouton et pointeur d'un maintien au doigt ou à la souris (aucun au clavier)
    function releaseHold(){if(!held)return;const c=held;held=null;tenu=null;send({...c,v:false});}
    // J6 (96A) : sortir du bouton en gardant l'appui relâche le maintien, comme le pointerleave de la 2.17.0e. La capture du pointeur
    // reste (relâcher ailleurs arrive au bouton) mais masque la sortie : la position du pointeur est comparée au bouton tenu.
    const sorti=e=>{const r=tenu.el.getBoundingClientRect?.();return !r||e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom;};
    function holdEvent(e){
      if(['pointerup','pointercancel'].includes(e.type)&&tenu&&e.pointerId!==tenu.id)return;   // J6 (relecture adverse) : un autre doigt ne relâche pas le maintien
      if(['pointerup','pointercancel','blur','focusout'].includes(e.type)){releaseHold();return;}
      if(e.type==='pointermove'){if(tenu&&e.pointerId===tenu.id&&sorti(e))releaseHold();return;}
      if(e.type==='keyup'&&[' ','Enter'].includes(e.key)){releaseHold();return;}
      const target=e.target.closest?.('[data-n4-hold]');if(!target||target.disabled)return;if(held){if(e.type==='keydown'&&[' ','Enter'].includes(e.key))e.preventDefault();return;}
      if(e.type==='keydown'&&![' ','Enter'].includes(e.key))return;
      e.preventDefault();held={type:'set',k:target.getAttribute('data-n4-hold'),poste:target.getAttribute('data-n4-poste')||undefined};
      if(e.type==='pointerdown'){target.setPointerCapture?.(e.pointerId);tenu={el:target,id:e.pointerId};}
      send({...held,v:true},'Injection maintenue');
    }
    const envoyees=new WeakMap(); // champ de consigne → dernière valeur envoyée
    function change(e){
      const field=e.target.closest&&e.target.closest('[data-n4-set]');
      if(field&&host.contains(field)&&field.getAttribute('data-n4-set')){const v=Number(field.value),label=field.getAttribute('aria-label')||'Consigne';
        // Entrée a déjà envoyé cette valeur : la perte du focus qui suit ne la renvoie pas (retour D3 du 27/09).
        if(e.type==='change'&&envoyees.get(field)===field.value)return;
        if(field.value!==''&&Number.isFinite(v)&&(!field.checkValidity||field.checkValidity())){envoyees.set(field,field.value);send({type:'set',k:field.getAttribute('data-n4-set'),v,...(field.getAttribute('data-n4-poste')?{poste:'secours'}:{})},label);}
        else{const a=n=>nombre(Number(field.getAttribute(n)));announce(label+' : valeur non envoyée. Saisis une valeur de '+a('min')+' à '+a('max')+', par pas de '+a('step')+'.');draw();}
        return;}

      const target=e.target.closest&&e.target.closest('[data-n4-synthesis]');if(!target||!host.contains(target))return;
      const slot=Number(target.getAttribute('data-n4-synthesis'));
      if(!Number.isInteger(slot)||slot<0||slot>=DEFAULT_SYNTHESIS.length)return;
      const choices=ui.synthesis.slice();choices[slot]=target.value;setSynthesis(choices);
      host.querySelector('[data-n4-synthesis="'+slot+'"]')?.focus({preventScroll:true});
    }
    // Le tactile conserve son défilement natif ; la souris peut saisir le dessin.
    // J6, client 2 (102A) : pincement limité au dessin. Deux doigts posés dans un cadre marqué data-n4-pince agrandissent le dessin seul
    // (×1 à ×4) autour du point pincé, en largeur (défilement du cadre) comme en hauteur (défilement de la page) ; la page garde son échelle
    // (touch-action du cadre, gestes de Safari retenus). Écouteurs non passifs sur les seuls cadres. L'échelle, en part de la largeur du
    // cadre (juste après une rotation), et la position sont gardées par dessin et rendues après chaque rafraîchissement. Affichage seul.
    const PINCE=new Map(),CADRES=new Set();let pince=null;
    const pinceLargeur=(svg,cadre,z)=>{svg.style.width=(z.p*z.s).toFixed(2)+'%';svg.style.maxWidth='none';cadre.setAttribute('data-n4-pince-zoom','');};
    function pinceAppliquer(cadre){const z=PINCE.get(cadre.getAttribute('data-n4-pince')),svg=cadre.querySelector('svg');
      if(!CADRES.has(cadre)){CADRES.add(cadre);for(const type of ['touchstart','touchmove','touchend','touchcancel','gesturestart'])cadre.addEventListener(type,pinceEvent,{passive:false});
        cadre.addEventListener('scroll',pinceDefile,{passive:true});if(z&&z.s>1&&svg){pinceLargeur(svg,cadre,z);cadre.scrollLeft=z.x||0;return;}}
      if(!svg)return;if(!z||z.s<=1){svg.style.width='';svg.style.maxWidth='';cadre.removeAttribute('data-n4-pince-zoom');return;}pinceLargeur(svg,cadre,z);}
    function pinceDefile(e){const z=PINCE.get(e.currentTarget.getAttribute('data-n4-pince'));if(z&&z.s>1&&!pince)z.x=e.currentTarget.scrollLeft;}
    function pinceEvent(e){const t=e.touches,cadre=e.currentTarget;
      if(e.type==='gesturestart'){e.preventDefault();return;}
      if(e.type==='touchstart'){pince=null;if(t.length!==2||!cadre.contains(t[0].target)||!cadre.contains(t[1].target))return;const svg=cadre.querySelector('svg');if(!svg)return;
        const k=cadre.getAttribute('data-n4-pince'),z=PINCE.get(k)||{s:1,p:100,x:0},x0=cadre.scrollLeft,win=cadre.ownerDocument.defaultView;
        svg.style.width='';svg.style.maxWidth='';z.p=svg.getBoundingClientRect().width/(cadre.clientWidth||1)*100;if(z.s>1){pinceLargeur(svg,cadre,z);cadre.scrollLeft=x0;}
        const r=cadre.getBoundingClientRect();PINCE.set(k,z);pince={cadre,z,win,s0:z.s,d0:Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY)||1,x0,y0:win.scrollY,
          mx:(t[0].clientX+t[1].clientX)/2-r.left,my:(t[0].clientY+t[1].clientY)/2-r.top};e.preventDefault();return;}
      if(e.type==='touchmove'&&pince&&t.length===2){const p=pince;if(!p.cadre.isConnected){pince=null;return;}const s=Math.max(1,Math.min(4,p.s0*Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY)/p.d0));
        p.z.s=s;pinceAppliquer(p.cadre);p.cadre.scrollLeft=(p.x0+p.mx)*s/p.s0-p.mx;p.z.x=p.cadre.scrollLeft;p.win.scrollTo(p.win.scrollX,p.y0+p.my*(s/p.s0-1));e.preventDefault();return;}
      if((e.type==='touchend'||e.type==='touchcancel')&&pince&&t.length<2){pince.z.x=pince.cadre.scrollLeft;pince=null;}}
    let pan=null,suppressPanClick=false;
    function endPan(){
      if(!pan)return;
      const previous=pan;pan=null;
      if(previous.viewport.hasPointerCapture?.(previous.id))previous.viewport.releasePointerCapture(previous.id);
    }
    function panEvent(e){
      if(e.type==='pointerdown'){
        suppressPanClick=false;
        const viewport=e.target.closest?.('.n4-synoptic-zoom');
        if(e.pointerType!=='mouse'||e.button!==0||!viewport)return;
        pan={viewport,id:e.pointerId,x:e.clientX,left:viewport.scrollLeft,moved:false};return;
      }
      if(!pan||e.pointerId!==pan.id)return;
      if(e.type==='pointermove'){
        const dx=e.clientX-pan.x;
        if(!pan.moved&&Math.abs(dx)<6)return;
        pan.moved=true;suppressPanClick=true;
        pan.viewport.setPointerCapture?.(e.pointerId);
        pan.viewport.scrollLeft=pan.left-dx;e.preventDefault();
      }else endPan();
    }
    function event(e){
      if(e.type==='click'&&suppressPanClick){suppressPanClick=false;e.preventDefault();return;}
      if(e.type==='keydown'&&e.key==='Enter'&&e.target.getAttribute?.('data-n4-set')){e.preventDefault();change(e);return;}
      if(e.type==='keydown'&&e.key==='Escape'&&(ui.missionOpen||ui.terme)){e.preventDefault();const m=!ui.terme;if(m)ui.missionOpen=false;else ui.terme='';draw();if(m)options.onMissionOpen?.(false);host.querySelector('[data-n4-mission="toggle"]')?.focus?.({preventScroll:true});return;}
      const target=e.target.closest&&e.target.closest('[data-n4-page],[data-n4-equipement],[data-n4-zoom],[data-n4-command],[data-n4-native],[data-n4-menu],[data-n4-fiche],[data-n4-curve],[data-n4-mission],[data-n4-nav],[data-n4-case],[data-n4-terme],[data-n4-guide],[data-n4-prevoir],[data-n4-pq],[data-n4-cvp],[data-n4-acquitter]');if(!target||!host.contains(target))return;
      // 21A du 13/10 : « Acquitter » vaut pour toutes les alarmes du poste vu (le MCS à part, à l'EPR) ; affichage seul, aucune commande.
      if(e.type==='click'&&target.getAttribute('data-n4-acquitter')){const secours=target.getAttribute('data-n4-acquitter')==='secours',cy=cycleVu(ui,secours);if(cy&&!mcpPerdu(data,secours))cy.acquitter();draw();return;}
      // J3 (passe 3) : un terme du lexique ouvre sa définition dans l'encart, le même terme ou « Fermer » la referme ; aucune commande.
      const terme=target.getAttribute('data-n4-terme');
      if(e.type==='click'&&terme!=null){const k=terme||'';ui.terme=k&&ui.terme!==k?k:'';draw();
        (ui.terme?host.querySelector('.n4-terme-fermer'):[...(host.querySelectorAll?.('[data-n4-terme]')||[])].find(b=>b.getAttribute('data-n4-terme')===k))?.focus?.({preventScroll:true});return;}
      // Carte des grappes (04/10) : toucher une case la sélectionne ou la désélectionne ; aucune commande.
      if(target.getAttribute('data-n4-case')){if(e.type==='keydown'&&!['Enter',' '].includes(e.key))return;if(e.type==='keydown')e.preventDefault();const r=target.getAttribute('data-n4-case');ui.caseCoeur=ui.caseCoeur===r?'':r;draw();host.querySelector('[data-n4-case="'+r+'"]')?.focus?.({preventScroll:true});return;}
      // Quitter la tranche : commandes maintenues relâchées, puis l’hôte arrête le transport et change de vue.
      if(e.type==='click'&&target.getAttribute('data-n4-nav')){const vue=target.getAttribute('data-n4-nav');releaseHold();announce(vue==='france'?'Retour vers la carte de France…':'Retour vers la centrale…');draw();
        Promise.resolve(options.onNavigate?.(vue)).then(r=>{if(r?.ok===false){announce(r.motif||'Retour impossible');draw();}}).catch(error=>{announce('Retour impossible : '+error.message);draw();});return;}
      if(e.type==='click'&&target.getAttribute('data-n4-curve')){const key=target.getAttribute('data-n4-curve'),chosen=new Set(ui.curves);if(!Object.hasOwn(CURVE_METRICS,key))return;chosen.has(key)?chosen.delete(key):chosen.add(key);ui.curves=normalizeCurves([...chosen]);draw();options.onCurvesChange?.(ui.curves.slice());host.querySelector('[data-n4-curve="'+key+'"]')?.focus({preventScroll:true});return;}
      if(e.type==='click'&&target.getAttribute('data-n4-menu')){ui.menu=!ui.menu;draw();return;}
      // Bandeau de mission : déplier ne change ni de page ni de commande ; « Arrêter » passe par l'hôte (état local).
      // J6 2c : la dernière fiche fermée, le focus va au bilan du premier quart quand il est là (il restait au titre de l'encart, sous lui).
      if(e.type==='click'&&target.getAttribute('data-n4-cvp')){Promise.resolve(options.onCvp?.(target.getAttribute('data-n4-cvp'))).then(()=>{draw();(host.querySelector('[data-n4-cvp]')||host.querySelector('.n4-pq-bilan [data-n4-pq]')||host.querySelector('[data-n4-mission="toggle"]'))?.focus?.({preventScroll:true});}).catch(()=>draw());return;}
      if(e.type==='click'&&target.getAttribute('data-n4-pq')){const a=target.getAttribute('data-n4-pq');Promise.resolve(options.onPremierQuart?.(a)).then(()=>{draw();
        (host.querySelector('[data-n4-pq]')||host.querySelector('[data-n4-mission="toggle"]'))?.focus?.({preventScroll:true});}).catch(()=>draw());return;}
      if(e.type==='click'&&target.getAttribute('data-n4-mission')==='toute'){e.preventDefault();const i=data.mission?.index;ui.toute=ui.toute===i?-1:i;draw();host.querySelector('[data-n4-mission="toute"]')?.focus({preventScroll:true});return;}
      if(e.type==='click'&&target.getAttribute('data-n4-mission')==='gestes'){const i=data.mission?.index;ui.gestes=ui.gestes===i?-1:i;draw();host.querySelector('[data-n4-mission="gestes"]')?.focus({preventScroll:true});return;}
      if(e.type==='click'&&target.getAttribute('data-n4-prevoir')!==null){const i=Number(target.getAttribute('data-n4-prevoir'));
        Promise.resolve(options.onPrevoir?.(i)).then(r=>{announce(r?.ok===false?(r.motif||'Prévision non notée'):'Prévision notée : « '+(target.textContent||'')+' »');draw();host.querySelector('[data-n4-prevoir="'+i+'"]')?.focus?.({preventScroll:true});}).catch(()=>{announce('Prévision non notée');draw();});return;}
      if(e.type==='click'&&target.getAttribute('data-n4-guide')){const g=target.getAttribute('data-n4-guide'),nom={pas:'Pas à pas',indices:'Indices',libre:'Libre'}[g];
        Promise.resolve(options.onGuide?.(g)).then(r=>{announce(r?.ok===false?(r.motif||'Guide non changé'):'Guide : '+nom);draw();}).catch(()=>{announce('Guide non changé');draw();});return;}
      if(e.type==='click'&&target.getAttribute('data-n4-mission')==='toggle'){ui.missionOpen=!ui.missionOpen;draw();options.onMissionOpen?.(ui.missionOpen);host.querySelector('[data-n4-mission="toggle"]')?.focus({preventScroll:true});return;}
      if(e.type==='click'&&target.getAttribute('data-n4-mission')==='next'){Promise.resolve(options.onMission?.('next')).then(r=>{const m=r?.mission;announce(r?.ok===false?(r.motif||'Passage à la mission suivante non confirmé'):(m&&!m.termine?'Mission '+(m.index+1)+'/'+m.total+' : '+m.titre:'Parcours de missions terminé'));draw();}).catch(()=>{announce('Passage à la mission suivante non confirmé');draw();});return;}
      // J3 (passe 6, 5A) : nouvelle tentative de la mission en cours, par l'hôte ; la tranche reste telle qu'elle est.
      if(e.type==='click'&&target.getAttribute('data-n4-mission')==='recommencer'){Promise.resolve(options.onMission?.('recommencer')).then(r=>{const m=r?.mission;announce(r?.ok===false?(r.motif||'Nouvelle tentative non confirmée'):(m?'Mission '+(m.index+1)+'/'+m.total+' : nouvelle tentative':'Nouvelle tentative'));draw();}).catch(()=>{announce('Nouvelle tentative non confirmée');draw();});return;}
      if(e.type==='click'&&target.getAttribute('data-n4-mission')==='stop'){Promise.resolve(options.onMission?.('stop')).then(r=>{announce(r?.ok===false?(r.motif||'Arrêt du parcours non confirmé'):'Parcours de missions arrêté · progression conservée');draw();
        const suite=[...(host.querySelectorAll?.('.n4-page-keys [data-n4-page="formation"],[data-n4-menu="toggle"]')||[])].find(b=>b.offsetParent!==null);suite?.focus?.({preventScroll:true});}).catch(()=>{announce('Arrêt du parcours non confirmé');draw();});return;}
      if(e.type==='click'&&target.getAttribute('data-n4-fiche')){const section=host.querySelector(SYNOPTICS.includes(ui.page)?'.n4-object-monitor':'.n4-main-content');section?.scrollIntoView?.({block:'start',behavior:'smooth'});return;}
      // Une vitesse choisie referme le volet Simulation : il ne recouvre plus la conduite (accès au poste de secours). La réinitialisation
      // confirmée le referme aussi, avec sa question (J6, client 2 : il restait ouvert au téléphone sur la tranche repartie).
      if(e.type==='click'&&target.getAttribute('data-n4-command')){if(!target.disabled){const c=JSON.parse(target.getAttribute('data-n4-command')),volet=c.type==='speed'||c.id==='iReset'?target.closest?.('details.n4-session,details.epr-session'):null;
        send(c,target.getAttribute('data-n4-command-name')||'');if(c.id==='iReset')target.closest?.('details')?.removeAttribute?.('open');if(volet&&volet.tagName){volet.open=false;volet.querySelector('summary')?.focus?.({preventScroll:true});}}return;}
      if(e.type==='click'&&target.getAttribute('data-n4-native')){const r=options.onNative?.(target.getAttribute('data-n4-native'));if(r?.ok===false){announce(r.motif);draw();}return;}
      const page=target.getAttribute('data-n4-page'),id=target.getAttribute('data-n4-equipement');
      if(e.type==='keydown'){if(!id||!['Enter',' '].includes(e.key))return;e.preventDefault();}
      if(target.getAttribute('data-n4-zoom')==='toggle'){ui.zoom=!ui.zoom;draw();host.querySelector('[data-n4-zoom="toggle"]')?.focus({preventScroll:true});}
      else if(page){selectPage(page);host.querySelector('.n4-page-keys [data-n4-page="'+page+'"]')?.focus({preventScroll:true});}
      else if(Object.hasOwn(NOMS,id)){ui.selected=id;draw();host.querySelector('[data-n4-equipement="'+id+'"]')?.focus({preventScroll:true});}
    }
    for(const type of ['pointerdown','pointermove','pointerup','pointercancel','lostpointercapture'])host.addEventListener(type,panEvent);
    host.ownerDocument?.defaultView?.addEventListener('blur',endPan);
    for(const type of ['pointerdown','pointermove','pointerup','pointercancel','keydown','keyup','focusout'])host.addEventListener(type,holdEvent);
    host.ownerDocument?.defaultView?.addEventListener('blur',releaseHold);
    host.ownerDocument?.defaultView?.addEventListener('pagehide',releaseHold);
    const visibility=()=>{if(host.ownerDocument?.hidden)releaseHold();};host.ownerDocument?.addEventListener?.('visibilitychange',visibility);
    host.addEventListener('click',event);host.addEventListener('keydown',event);host.addEventListener('change',change);host.addEventListener('focusin',voletSous);draw();
    return {selectPage,setSynthesis,setMissionOpen(v){ui.missionOpen=!!v;draw();options.onMissionOpen?.(ui.missionOpen);},update(snapshot){const changed=data.state?.ihm!==snapshot?.state?.ihm;data={...(snapshot||{})};if(changed)releaseHold();nourrirAlarmes(data);lien(data.liaison);draw();},setContext(site,unit,unitLabel){ui.site=String(site);ui.unit=unit;ui.unitLabel=String(unitLabel||unit);draw();},getState(){const {acq,...vu}=ui;return {...vu,synthesis:ui.synthesis.slice(),curves:ui.curves.slice(),missionOpen:!!ui.missionOpen};},alarmes(){const vu=cy=>cy?{klaxon:cy.klaxon(),etats:JSON.parse(JSON.stringify(cy.A.etats)),compte:cy.compte()}:null;return {...vu(ui.acq&&ui.acq.principal),secours:vu(ui.acq&&ui.acq.secours)};},destroy(){endPan();telephone?.removeEventListener?.('change',bascule);for(const type of ['pointerdown','pointermove','pointerup','pointercancel','lostpointercapture'])host.removeEventListener(type,panEvent);for(const c of CADRES){for(const type of ['touchstart','touchmove','touchend','touchcancel','gesturestart'])c.removeEventListener(type,pinceEvent,{passive:false});c.removeEventListener('scroll',pinceDefile,{passive:true});}CADRES.clear();pince=null;host.ownerDocument?.defaultView?.removeEventListener('blur',endPan);releaseHold();for(const type of ['pointerdown','pointermove','pointerup','pointercancel','keydown','keyup','focusout'])host.removeEventListener(type,holdEvent);host.ownerDocument?.defaultView?.removeEventListener('blur',releaseHold);host.ownerDocument?.defaultView?.removeEventListener('pagehide',releaseHold);host.ownerDocument?.removeEventListener?.('visibilitychange',visibility);alive=false;host.ownerDocument?.defaultView?.clearTimeout(statusTimer);host.removeEventListener('click',event);host.removeEventListener('keydown',event);host.removeEventListener('change',change);host.removeEventListener('focusin',voletSous);host.replaceChildren();}};
  }
  return {createProfile:(p,syn,cmd)=>createPoste(syn,cmd||CMD,INST,p),mount,render,cycle,ALARMES_ETAT,familleAlarme,format:number,SYNTHESIS_METRICS,DEFAULT_SYNTHESIS,normalizeSynthesis,CURVE_METRICS,DEFAULT_CURVES,normalizeCurves,curveValue};
});
