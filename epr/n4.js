// SIMUREP — © 2026 AnthoninP — Tous droits réservés.
// Poste N4 privé. Données reçues et commandes déléguées au transport autorisé.
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./n4-synoptiques.js'),require('./n4-commandes.js'),require('./instruments-n4.js'));
  else root.SDCN4=factory(root.SDCN4Synoptiques,root.SDCN4Commandes,root.SDCN4Instruments);
})(typeof globalThis!=='undefined'?globalThis:this,function createPoste(SYN,CMD,INST,profile={}){
  const EPR=profile.palier==='EPR', PALIER=EPR?'EPR':'N4', PRINCIPAL=EPR?'MCP':'KIC', SECOURS=EPR?'MCS · Moyen de conduite de secours':'Panneau auxiliaire';
  'use strict';
  const PAGES={primaire:'Réacteur',eauvapeur:'Eau-vapeur',tendances:'Courbes',alarmes:'Alarmes',sauvegardes:'Sauvegardes',exploitation:'Exploitation',incidents:'Incidents',sourcefroide:'Source froide',instrumentation:'RPN · RIC · KRT',coeur:'Cœur',pt:'Domaine P/T',formation:'Aide & missions',auxiliaire:'Panneau auxiliaire'};
  if(EPR)PAGES.auxiliaire=SECOURS;
  const ETATS={AU:'Arrêt d’urgence réacteur','ÎLOT':'Îlotée : l’alternateur ne porte que ses auxiliaires',RP:'Réacteur en production',ANGV:'Arrêt normal sur GV',ANRRA:'Arrêt normal sur RRA',APIF:'Arrêt pour intervention fermé',APIO:'Arrêt pour intervention ouvert',APR:'Arrêt pour rechargement',RCD:'Réacteur complètement déchargé'};
  const NAV=Object.entries(PAGES).filter(([id])=>id!=='auxiliaire');
  const SYNOPTICS=['primaire','eauvapeur','sourcefroide'];
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
  for(let i=1;i<=4;i++){if(EPR){NOMS['asg'+i]='Réserve ASG '+i;NOMS['rra'+i]='Train RIS-RA '+i;NOMS['rri'+i]='RRI du train '+i;NOMS['sec'+i]='SEC du train '+i;}NOMS['gv'+i]='Générateur de vapeur '+i;NOMS['gmpp'+i]='Pompe primaire '+i;}
  const escape=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number=(v,d=1)=>Number.isFinite(v)?v.toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d}):'—';
  const value=(v,u,d=1)=>'<b>'+number(v,d)+'</b><span>'+escape(u)+'</span>';
  const measure=(name,v,u,d)=>'<div class="n4-measure"><span>'+escape(name)+'</span><div>'+value(v,u,d)+'</div></div>';
  function synthesis(ui,data){
    return normalizeSynthesis(ui.synthesis).map((key,i)=>{
      const metric=SYNTHESIS_METRICS[key];
      return '<div class="n4-measure"><select class="n4-synthesis-select" data-n4-synthesis="'+i+'" aria-label="Grandeur de la synthèse, emplacement '+(i+1)+'">'+Object.entries(SYNTHESIS_METRICS).map(([id,m])=>'<option value="'+id+'"'+(id===key?' selected':'')+'>'+escape(m.label)+'</option>').join('')+'</select><div>'+value(data[key],metric.unit,metric.digits)+'</div></div>';
    }).join('');
  }
  let instances=0;
  function courbe(data,large,choices=[true,true,true]){
    const series=[['Pression primaire','bar abs','#65c8df',data.pressureHistory,154,156],['Température moyenne','°C','#e7ba70',data.temperatureHistory,309,312],['Puissance thermique','MWth','#c48acb',data.powerHistory,4200,4300]];
    const visible=series.filter((_,i)=>choices[i]);
    const w=large?940:430,h=large?360:188,x0=54,y0=26,x1=w-20,y1=h-35;
    let htm='<svg class="n4-chart" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Historique des grandeurs sélectionnées, échelles séparées"><rect width="100%" height="100%" fill="#090e12"/>';
    for(let i=0;i<=4;i++){const y=y0+(y1-y0)*i/4;htm+='<path d="M'+x0+' '+y+'H'+x1+'" stroke="#273139" stroke-width="1"/>';}
    for(let i=0;i<=5;i++){const x=x0+(x1-x0)*i/5;htm+='<path d="M'+x+' '+y0+'V'+y1+'" stroke="#273139"/>';}
    let traces=0;
    visible.forEach((serie)=>{let [label,unit,color,ys,min,max]=serie;if(!Array.isArray(ys)||ys.length<2||!ys.every(Number.isFinite))return;traces++;min=Math.min(...ys);max=Math.max(...ys);const pad=Math.max((max-min)*.15,Math.abs(max)*.002,.1);min-=pad;max+=pad;serie[4]=Number(min.toFixed(1));serie[5]=Number(max.toFixed(1));
      const pts=ys.map((v,i)=>[x0+i*(x1-x0)/(ys.length-1),y1-(v-min)/(max-min)*(y1-y0)]);
      htm+='<polyline points="'+pts.map(p=>p.map(n=>n.toFixed(2)).join(',')).join(' ')+'" fill="none" stroke="'+color+'" stroke-width="1.7"/>';
    });
    htm+='<g fill="#94a7b2" font-family="monospace" font-size="13"><text x="'+x0+'" y="'+(h-12)+'">début</text><text x="'+(x1-32)+'" y="'+(h-12)+'">0</text></g>';
    if(!traces)htm+='<text x="'+w/2+'" y="'+h/2+'" text-anchor="middle" fill="#94a7b2">Aucun historique reçu</text>';
    return htm+'</svg><div class="n4-chart-legend">'+visible.map(([label,unit,color,,min,max])=>'<span><i style="background:'+color+'"></i>'+label+' <small>'+min+'–'+max+' '+unit+'</small></span>').join('')+'</div>';
  }
  function alarmes(data,full){
    const rows=Array.isArray(data.alarms)?data.alarms:[];
    const counts=['rouge','jaune','blanche'].map(c=>'<span class="n4-alarm-count '+c+'"><i></i>'+escape(c)+'<b>'+rows.filter(a=>a.color===c).length+'</b></span>').join('');
    return '<div class="n4-alarm-counts">'+counts+'</div><div class="n4-alarm-table"><div class="n4-alarm-head"><span>HEURE</span><span>ORIGINE</span><span>MESSAGE</span></div>'+ (rows.length?rows.map(a=>'<div class="n4-alarm-row"><span>'+escape(a.time)+'</span><span>'+escape(a.origin)+'</span><span>'+escape(a.message)+'</span></div>').join(''):'<div class="n4-alarm-empty">Aucune alarme active</div>')+'</div>'+(full?'<p class="n4-screen-note">Les couleurs distinguent les familles d’alarmes. Consulter le journal pour suivre la succession des événements.</p>':'');
  }
  function fiche(data,id,ui){
    // Poste de secours : fiche en lecture, les commandes y sont celles du MCS / panneau auxiliaire (retour D3).
    if(CMD&&ui?.connected){const lecture=ui.page==='auxiliaire';return '<div class="n4-object-code">'+escape(id.toUpperCase())+'</div><h3>'+escape(NOMS[id]||'Équipement')+'</h3>'+
      (lecture?'<p class="n4-fiche-lecture">Fiche en lecture au '+(EPR?'MCS':'panneau auxiliaire')+' : commander depuis ce poste, ou revenir au '+PRINCIPAL+'.</p>':'')+CMD.render(id,data,!lecture);}
    let infos='',note='',commands=[];
    if(id==='pzr'){
      infos=measure('Pression',data.pressurePrimary,'bar abs')+measure('Niveau',data.levelPzr,'%')+measure('Consigne',data.setPressure,'bar abs');
      note='Un pressuriseur commun aux quatre boucles, relié à une branche chaude.';commands=['Chaufferettes','Aspersion'];
    }else if(/^gmpp/.test(id)){
      // N4 (D12) et EPR (D16) : seul le nombre de GMPP en marche est reçu ; l'état d'une pompe n'est affiché que s'il s'en déduit.
      const n=Number(id.slice(-1)),pp=data.pumps||[],k=pp.length===4&&pp.every(v=>typeof v==='boolean')?pp.filter(Boolean).length:null;
      const recu=k===4?'MARCHE':k===0?'ARRÊT':k===null?'—':'NON INDIQUÉ';
      infos=measure('Boucle',n,'',0)+'<div class="n4-measure"><span>État reçu</span><strong>'+recu+'</strong></div>'+(k!==null?measure('GMPP en marche',k,'/ 4',0):'');
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
    return '<div class="n4-object-code">'+escape(id.toUpperCase())+'</div><h3>'+escape(NOMS[id]||'Équipement')+'</h3>'+infos+'<p class="n4-object-note">'+note+'</p>'+(commands.length?'<div class="n4-commands">'+commands.map(c=>'<button type="button" disabled>'+c+'</button>').join('')+'</div><p class="n4-command-note">Commandes non raccordées dans cette étude graphique.</p>':'');
  }
  function secoursInstruments(data){
    if(profile.secoursInstruments)return profile.secoursInstruments(data,{escape,number});
    const readings=[['Pression primaire',data.pressurePrimary,180,'bar'],['Température primaire',data.tempAverage,350,'°C'],['Pression vapeur',data.pressureSteam,100,'bar'],['Niveau GV',data.levelGV,100,'%'],['Puissance neutronique',Number.isFinite(data.state?.Pn)?data.state.Pn*100:null,120,'%'],['Bâche ASG',Number.isFinite(data.state?.bacheASG)?data.state.bacheASG*100:null,100,'%']];
    if(!INST)return '';
    const lamps=[['ARRÊT RÉACTEUR',!!data.state?.scram,'red'],['SIGNAL IS',!!data.state?.sigIS,'red'],[EPR?'POMPES ASG EN MARCHE':'ASG EN SERVICE',EPR?(data.state?.asgMarche||[]).some(v=>v>0):!!data.state?.asg,'amber'],['RÉSEAU ABSENT',data.state?.reseau===false,'amber']];
    return '<div class="n4-physical-lamps">'+lamps.map(([label,on,color])=>INST.annunciator({label,on,color})).join('')+'</div><div class="n4-physical-instruments">'+readings.map(([label,value,max,unit],i)=>'<div class="n4-dial">'+INST[i===3||i===5?'column':'gauge']({label,value,min:0,max,unit})+'</div>').join('')+'</div>';
  }

  function mainPanel(ui,data){
    if(['sauvegardes','exploitation','incidents','auxiliaire'].includes(ui.page)&&CMD)return (ui.page==='auxiliaire'?(EPR?alarmes(data,false):'')+secoursInstruments(data):'')+CMD.render(ui.page,data,ui.connected,ui.page==='auxiliaire');
    const slot='<div data-n4-live-slot="'+ui.page+'" class="n4-live-slot" aria-label="Instruments intégrés"></div>';
    if(['instrumentation','coeur','pt','formation'].includes(ui.page))return slot;
    if(SYNOPTICS.includes(ui.page))return '<div class="n4-synoptic-viewport'+(ui.zoom?' n4-synoptic-zoom':'')+'">'+SYN.render(ui.page,data,ui.selected)+'</div>';
    if(ui.page==='tendances')return '<div class="n4-curves-page"><h2>Suivi des grandeurs</h2><p class="n4-screen-note">Même suivi que l’écran de veille du poste · échelles indépendantes.</p>'+courbe(data,true,ui.traces)+'<fieldset class="n4-chart-options"><legend>Tracés du poste et de la vignette</legend>'+['Pression primaire','Température moyenne','Puissance thermique'].map((label,i)=>'<button type="button" data-n4-trace="'+i+'" aria-pressed="'+ui.traces[i]+'">'+label+'</button>').join('')+'</fieldset>'+'</div>'+slot;
    if(ui.page==='alarmes')return '<div class="n4-alarms-page"><h2>Traitement des alarmes</h2>'+alarmes(data,true)+'<h3>Journal de conduite</h3><div class="n4-journal">'+(data.journal||[]).map(x=>'<p>'+escape(typeof x==='string'?x:[x.time,x.origin,x.message].filter(Boolean).join(' · '))+'</p>').join('')+'</div></div>';
    return '<div class="n4-pa-page"><span class="n4-panel-ref">MOYEN DE CONDUITE DIVERSIFIÉ</span><h2>Panneau auxiliaire</h2><div class="n4-pa-sketch" aria-hidden="true">'+['Surveillance','État de tranche','Commandes'].map(t=>'<div><div class="n4-pa-lamps">● ● ● ● ●</div><b>'+t+'</b><div class="n4-pa-instruments">▱ ▱ ▱</div></div>').join('')+'</div><p>Le panneau auxiliaire est un moyen conventionnel indépendant du KIC, prévu pour conduire vers l’arrêt sûr lorsque la conduite informatisée est indisponible.</p><p class="n4-screen-note">Son implantation détaillée et ses commandes feront l’objet d’un dessin distinct. Cette page situe son rôle.</p></div>';
  }
  // Repli sur GCT, comme la vue CNPE : RP sans AU, turbine déclenchée et réacteur encore en puissance.
  function gct(data){const s=data.state||{};return data.stateLabel==='RP'&&!s.scram&&(s.turb||0)<1&&(s.Ptot||0)>0.1;}
  // Sortie du poste vers les vues du simulateur : seulement si l’hôte sait y conduire (onNavigate).
  function navigation(ui){return ui.navigation?'<nav class="n4-exit" aria-label="Quitter la tranche"><button type="button" data-n4-nav="france" aria-label="Revenir à la carte de France">‹ France</button><button type="button" data-n4-nav="cnpe" aria-label="Revenir au CNPE de '+escape(ui.site)+'">‹ CNPE</button></nav>':'';}
  function simulationControls(ui,data){
    const button=(text,command,pressed)=>'<button type="button" data-n4-command="'+escape(JSON.stringify(command))+'" data-n4-command-name="'+text+'"'+(pressed!==undefined?' aria-pressed="'+pressed+'"':'')+(ui.connected?'':' disabled')+'>'+text+'</button>';
    return '<div class="n4-simulation"><b>SIMULATION</b><span>Temps écoulé · '+number(data.simulationTime||0,0)+' s</span><div aria-label="Vitesse de simulation">'+[1,60,300,600].map(v=>button('×'+v,{type:'speed',v},data.state?.accel===v)).join('')+'</div><details><summary>Réinitialiser la session…</summary><p>Repartir de l’état initial et effacer la conduite de cet essai.</p>'+button('Confirmer la réinitialisation',{type:'incident',id:'iReset'})+'</details></div>';
  }
  function render(ui,data){
    if(profile.render)return profile.render(ui,data,{escape,number,synthesis,mainPanel,fiche,alarmes,courbe,simulationControls,navigation,NAV,PAGES,SYNOPTICS});
    const title=ui.page==='primaire'?'RCP · CIRCUIT PRIMAIRE ET GÉNÉRATEURS DE VAPEUR':ui.page==='eauvapeur'?'VVP / ARE · CIRCUIT EAU-VAPEUR':PAGES[ui.page].toUpperCase();
    return '<div class="n4-sdc '+(ui.page==='auxiliaire'?'n4-secours':'')+'">'+(ui.published?'':'<div class="n4-study">ESSAI PRIVÉ · '+PALIER+' <span>'+ (ui.connected?'Conduite raccordée · qualification fermée':'Consultation · moteur non raccordé') +'</span></div>')+
      '<header class="n4-header">'+navigation(ui)+'<div class="n4-brand"><b>SIMUREP</b><span>Le simulateur du parc électronucléaire français</span></div>'+(ui.navigation?'':'<div class="n4-steps" aria-label="Niveaux du simulateur"><span>01 FRANCE</span><i>›</i><span>02 CNPE</span><i>›</i><b>03 TRANCHE</b></div>')+'<div class="n4-unit"><strong>'+escape(ui.site.toUpperCase())+' · TRANCHE&nbsp;'+escape(ui.unit)+'</strong><span>PALIER '+PALIER+' · '+(EPR?'1 650':'1 450')+' MWe</span></div><details class="n4-session"><summary>Simulation <span>'+number(data.simulationTime||0,0)+' s · ×'+(data.state?.accel||1)+'</span></summary>'+simulationControls(ui,data)+'</details></header>'+
      '<div class="n4-wall"><div class="n4-wall-title"><span>SYNTHÈSE DE TRANCHE</span><b>'+escape(data.stateLabel||'—')+'</b></div><div class="n4-wall-measures">'+synthesis(ui,data)+'</div><div class="n4-wall-footer"><span>4 BOUCLES</span></div></div>'+
      '<div class="n4-quickbar"><span>'+escape(data.stateLabel||'—')+(ETATS[data.stateLabel]?' · '+ETATS[data.stateLabel]:'')+(data.targetState&&data.targetState!==data.stateLabel?' · état visé '+escape(data.targetState):'')+(gct(data)?' · turbine déclenchée : réacteur sur GCT':'')+'</span><button type="button" data-n4-page="auxiliaire">'+SECOURS+'</button><button type="button" class="n4-scram" data-n4-command="{&quot;type&quot;:&quot;scram&quot;'+(data.state?.ihm===false||ui.page==='auxiliaire'?',&quot;poste&quot;:&quot;secours&quot;':'')+'}"'+(ui.connected?'':' disabled')+'>ARRÊT D’URGENCE</button></div><div class="n4-command-status" data-active="'+!!ui.status+'" role="status">'+escape(ui.status||'')+'</div>'+(data.state?.ihm===false?'<div class="n4-kic-lost">'+PRINCIPAL+' INDISPONIBLE · Rejoindre '+SECOURS+'.</div>':'')+'<div class="n4-console"><div class="n4-desk-head"><span>'+(ui.page==='auxiliaire'?'CONDUITE CONVENTIONNELLE':'CONDUITE INFORMATISÉE')+'</span><span class="n4-selection-help">Sélectionner un équipement : mesures et commandes</span></div>'+
      '<div class="n4-monitors '+(SYNOPTICS.includes(ui.page)?'':'n4-single')+'"><section class="n4-monitor n4-main-monitor"><div class="n4-monitor-head"><span>'+title+'</span><span>'+PALIER+' / '+(ui.page==='auxiliaire'?(EPR?'MCS':'PA'):String(NAV.findIndex(([id])=>id===ui.page)+1).padStart(2,'0'))+'</span>'+(SYNOPTICS.includes(ui.page)?'<button class="n4-zoom-key" type="button" data-n4-zoom="toggle" aria-pressed="'+!!ui.zoom+'">'+(ui.zoom?'Vue entière':'Agrandir')+'</button>':'')+'</div><div class="n4-main-content">'+mainPanel(ui,data)+'</div><nav class="n4-page-keys" aria-label="Écrans du poste">'+NAV.map(([id,t],i)=>'<button type="button" data-n4-page="'+id+'" aria-current="'+(ui.page===id?'page':'false')+'"><small>'+String(i+1).padStart(2,'0')+'</small>'+t+'</button>').join('')+'</nav></section>'+
      '<aside class="n4-monitor n4-object-monitor" aria-label="Fiche de l’équipement sélectionné"><div class="n4-monitor-head"><span>FICHE ÉQUIPEMENT</span><span>'+(ui.page==='auxiliaire'?'LECTURE':'CONDUITE')+'</span></div><div class="n4-object-body" aria-live="polite">'+fiche(data,ui.selected,ui)+'</div></aside></div>'+
      '<div class="n4-lower-monitors"><section class="n4-monitor n4-alarm-monitor"><div class="n4-monitor-head"><span>ZONE ALARMES</span><span>MESSAGES CLASSÉS</span></div>'+alarmes(data,false)+'</section><section class="n4-monitor n4-trend-monitor"><div class="n4-monitor-head"><span>ENREGISTREURS</span><button type="button" data-n4-page="tendances">Agrandir ↗</button></div>'+courbe(data,false,ui.traces)+'</section></div>'+
      '<footer class="n4-desk-footer"><span>'+PRINCIPAL+' · Conduite sur écrans</span><span>© 2026 AnthoninP · SIMUREP</span></footer></div><nav class="n4-thumb-dock" aria-label="Navigation au pouce"><button type="button" data-n4-menu="toggle" aria-expanded="'+!!ui.menu+'">Écrans</button><button type="button" data-n4-fiche="true">Fiche</button><button type="button" data-n4-page="auxiliaire">Secours</button><button type="button" class="n4-scram" data-n4-command="{&quot;type&quot;:&quot;scram&quot;'+(data.state?.ihm===false||ui.page==='auxiliaire'?',&quot;poste&quot;:&quot;secours&quot;':'')+'}"'+(ui.connected?'':' disabled')+'>Arrêt<br>urgence</button></nav>'+(ui.menu?'<div class="n4-thumb-menu"><div><b>Écrans du poste</b><button type="button" data-n4-menu="toggle">Fermer</button></div><nav>'+NAV.map(([id,label])=>'<button type="button" data-n4-page="'+id+'" aria-current="'+(ui.page===id?'page':'false')+'">'+label+'</button>').join('')+'</nav></div>':'')+'</div>';
  }
  function mount(host,options={}){
    if(!host||!host.addEventListener)throw new Error('SDC N4 : hôte DOM requis');
    let data={...(options.snapshot||{})},ui={site:options.site||(EPR?'Flamanville':'Civaux'),unit:options.unit||(EPR?3:1),page:'primaire',selected:'pzr',synthesis:normalizeSynthesis(options.synthesis),zoom:false,published:options.published===true,connected:typeof options.onCommand==='function',navigation:typeof options.onNavigate==='function',status:'',menu:false,traces:[true,true,true]},alive=true,statusTimer=null;
    const prefix='n4-instance-'+(++instances)+'-';
    const draw=()=>{
      if(!alive)return;
      const doc=host.ownerDocument,active=doc?.activeElement;
      const focusKey=active&&host.contains(active)?['data-n4-page','data-n4-command','data-n4-equipement','data-n4-native','data-n4-zoom','data-n4-menu','data-n4-fiche','data-n4-nav'].find(k=>active.hasAttribute?.(k)):null,focusValue=focusKey?active.getAttribute(focusKey):null;
      const left=host.querySelector('.n4-synoptic-viewport')?.scrollLeft||0;
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
      const viewport=host.querySelector('.n4-synoptic-viewport');if(viewport&&ui.zoom)viewport.scrollLeft=left;
      if(focusKey&&!active?.isConnected)[...(host.querySelectorAll?.('['+focusKey+']')||[])].find(e=>e.getAttribute(focusKey)===focusValue)?.focus({preventScroll:true});
      options.onPageMount?.(ui.page,host.querySelector('[data-n4-live-slot]'));
    };
    function selectPage(page){if(!Object.hasOwn(PAGES,page))return;releaseHold();ui.page=page;ui.menu=false;ui.zoom=false;if(page==='primaire')ui.selected='pzr';if(page==='eauvapeur')ui.selected='turbine';if(page==='sourcefroide')ui.selected=EPR?'mer':'tour';draw();host.querySelector('.n4-main-monitor')?.scrollIntoView?.({block:'start'});}
    function setSynthesis(choices){
      if(!alive)return;
      ui.synthesis=normalizeSynthesis(choices);draw();
      if(typeof options.onSynthesisChange==='function')options.onSynthesisChange(ui.synthesis.slice());
    }
    function announce(message){ui.status=message;const win=host.ownerDocument?.defaultView;if(win){win.clearTimeout(statusTimer);statusTimer=win.setTimeout(()=>{ui.status='';draw();},4500);}}
    // Accusé lisible : ce que la commande a établi, pas un booléen générique (retour D3).
    const MODES={auto:'Régulation grappes',areAuto:'Régulation ARE',pzrAuto:'Régulation pression',gctMode:'Régulation GCT-c',gctaMode:EPR?'Régulation VDA':'Régulation GCT-a'};
    const nombre=v=>Number.isFinite(v)?v.toLocaleString('fr-FR',{maximumFractionDigits:3}):String(v);
    // Pompes ASG nommées comme au journal : EPR, quatre motopompes (tpsA/tpsB = C/D) ; N4, deux motopompes et deux turbopompes.
    const POMPES_ASG=EPR?{mpsA:'Motopompe ASG A',mpsB:'Motopompe ASG B',tpsA:'Motopompe ASG C',tpsB:'Motopompe ASG D'}
      :{mpsA:'Motopompe ASG A',mpsB:'Motopompe ASG B',tpsA:'Turbopompe ASG A',tpsB:'Turbopompe ASG B'};
    function accuse(c,label){
      const on=c.v===true||c.v==='auto',voie=Number.isInteger(c.i)?(EPR?'Train '+(c.i+1):'Voie '+['A','B','C','D'][c.i]):'';
      if(c.type==='set'&&Object.hasOwn(MODES,c.k))return MODES[c.k]+' : '+(on?'AUTO':'MANU');
      if(c.type==='set'&&c.k==='viv')return 'VIV : '+(c.v?'ouvertes':'fermées');
      if(c.type==='set'&&c.k==='turbRate')return 'Pente de charge : '+nombre(c.v*60)+' %/min';
      if(c.type==='set'&&(c.k==='bori'||c.k==='dilu'))return (c.k==='bori'?'Borication':'Dilution')+' : '+(c.v?'maintenue':'arrêtée');
      if(c.type==='set'&&/^inh|^aarInhib$/.test(c.k))return 'Inhibition '+(label||c.k)+' : '+(c.v?'active':'levée');
      // Pompes ASG (D22, comme D21) : l'accusé nomme la pompe et dit l'ordre ; la fiche dit ensuite la marche (courant, vapeur, bâche).
      if(c.type==='set'&&Object.hasOwn(POMPES_ASG,c.k))return POMPES_ASG[c.k]+' : '+(c.v?'ordre de marche':'à l’arrêt');
      if(c.type==='set'&&typeof c.v==='boolean')return (label||c.k)+' : '+(c.v?'en service':'à l’arrêt');
      if(c.type==='set')return (label||'Consigne')+' : '+nombre(c.v);
      // RRA non raccordé (primaire chaud) : un ordre de voie n'évacue rien ; l'accusé le dit, sans « en service ».
      if(c.type==='voie'&&c.role==='RA'){const raccorde=data.state?.rra!==false;
        return voie+(EPR?' · alignement RA : '+(c.v?'actif':'inactif'):' RRA : '+(raccorde?(c.v?'en service':'arrêtée'):(c.v?'ordre de mise en service':'ordre d’arrêt')))+(raccorde?'':' · RRA non raccordé : aucune évacuation');}
      if(c.type==='voie'&&c.role==='HS')return voie+' : '+(c.v?'mise hors service':'rendue disponible');
      if(c.type==='voie')return voie+' · '+c.role+' : '+(c.v?'rétabli':'perdu');
      if(c.type==='speed')return 'Vitesse : ×'+c.v;
      if(c.type==='etat')return 'État '+c.e+' : atteint';
      if(c.type==='ihm')return (EPR?'MCP':'KIC')+' : '+(c.perdue?'perdu, conduite au '+(EPR?'MCS':'panneau auxiliaire'):'rétabli');
      return label?label+' : appliqué':'Commande acceptée';
    }
    function send(command,label=''){
      const success=()=>accuse(command,label);
      if(!ui.connected)return;
      try{const result=options.onCommand(command);if(result&&typeof result.then==='function'){announce('Commande en cours…');result.then(r=>{announce(r?.ok?success():r?.motif||'Commande refusée');draw();}).catch(()=>{announce('Transport indisponible');draw();});}else announce(result?.ok?success():result?.motif||'Commande refusée');}catch(error){announce('Commande refusée : '+error.message);}
      draw();
    }
    let held=null;
    function releaseHold(){if(!held)return;const c=held;held=null;send({...c,v:false});}
    function holdEvent(e){
      if(['pointerup','pointercancel','blur','focusout'].includes(e.type)){releaseHold();return;}
      if(e.type==='keyup'&&[' ','Enter'].includes(e.key)){releaseHold();return;}
      const target=e.target.closest?.('[data-n4-hold]');if(!target||target.disabled)return;if(held){if(e.type==='keydown'&&[' ','Enter'].includes(e.key))e.preventDefault();return;}
      if(e.type==='keydown'&&![' ','Enter'].includes(e.key))return;
      e.preventDefault();held={type:'set',k:target.getAttribute('data-n4-hold'),poste:target.getAttribute('data-n4-poste')||undefined};
      if(e.type==='pointerdown')target.setPointerCapture?.(e.pointerId);
      send({...held,v:true},'Injection maintenue');
    }
    const envoyees=new WeakMap(); // champ de consigne → dernière valeur envoyée
    function change(e){
      const field=e.target.closest&&e.target.closest('[data-n4-set]');
      if(field&&host.contains(field)&&field.getAttribute('data-n4-set')){const v=Number(field.value),label=field.getAttribute('aria-label')||'Consigne';
        // Entrée a déjà envoyé cette valeur : la perte du focus qui suit ne la renvoie pas (retour D3 du 27/09).
        if(e.type==='change'&&envoyees.get(field)===field.value)return;
        if(field.value!==''&&Number.isFinite(v)&&(!field.checkValidity||field.checkValidity())){envoyees.set(field,field.value);send({type:'set',k:field.getAttribute('data-n4-set'),v,...(field.getAttribute('data-n4-poste')?{poste:'secours'}:{})},label);}
        else{const a=n=>nombre(Number(field.getAttribute(n)));announce(label+' non envoyée : saisir une valeur de '+a('min')+' à '+a('max')+', par pas de '+a('step'));draw();}
        return;}

      const target=e.target.closest&&e.target.closest('[data-n4-synthesis]');if(!target||!host.contains(target))return;
      const slot=Number(target.getAttribute('data-n4-synthesis'));
      if(!Number.isInteger(slot)||slot<0||slot>=DEFAULT_SYNTHESIS.length)return;
      const choices=ui.synthesis.slice();choices[slot]=target.value;setSynthesis(choices);
      host.querySelector('[data-n4-synthesis="'+slot+'"]')?.focus({preventScroll:true});
    }
    // Le tactile conserve son défilement natif ; la souris peut saisir le dessin.
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
      const target=e.target.closest&&e.target.closest('[data-n4-page],[data-n4-equipement],[data-n4-zoom],[data-n4-command],[data-n4-native],[data-n4-menu],[data-n4-fiche],[data-n4-trace],[data-n4-nav]');if(!target||!host.contains(target))return;
      // Quitter la tranche : commandes maintenues relâchées, puis l’hôte arrête le transport et change de vue.
      if(e.type==='click'&&target.getAttribute('data-n4-nav')){const vue=target.getAttribute('data-n4-nav');releaseHold();announce(vue==='france'?'Retour vers la carte de France…':'Retour vers le CNPE…');draw();
        Promise.resolve(options.onNavigate?.(vue)).then(r=>{if(r?.ok===false){announce(r.motif||'Retour impossible');draw();}}).catch(error=>{announce('Retour impossible : '+error.message);draw();});return;}
      if(e.type==='click'&&target.hasAttribute?.('data-n4-trace')){const i=Number(target.getAttribute('data-n4-trace'));ui.traces[i]=!ui.traces[i];draw();return;}
      if(e.type==='click'&&target.getAttribute('data-n4-menu')){ui.menu=!ui.menu;draw();return;}
      if(e.type==='click'&&target.getAttribute('data-n4-fiche')){const section=host.querySelector(SYNOPTICS.includes(ui.page)?'.n4-object-monitor':'.n4-main-content');section?.scrollIntoView?.({block:'start',behavior:'smooth'});return;}
      // Une vitesse choisie referme le volet Simulation : il ne recouvre plus la conduite (accès au poste de secours).
      if(e.type==='click'&&target.getAttribute('data-n4-command')){if(!target.disabled){const c=JSON.parse(target.getAttribute('data-n4-command')),volet=c.type==='speed'?target.closest?.('details.n4-session,details.epr-session'):null;
        send(c,target.getAttribute('data-n4-command-name')||'');if(volet&&volet.tagName)volet.open=false;}return;}
      if(e.type==='click'&&target.getAttribute('data-n4-native')){const r=options.onNative?.(target.getAttribute('data-n4-native'));if(r?.ok===false){announce(r.motif);draw();}return;}
      const page=target.getAttribute('data-n4-page'),id=target.getAttribute('data-n4-equipement');
      if(e.type==='keydown'){if(!id||!['Enter',' '].includes(e.key))return;e.preventDefault();}
      if(target.getAttribute('data-n4-zoom')==='toggle'){ui.zoom=!ui.zoom;draw();host.querySelector('[data-n4-zoom="toggle"]')?.focus({preventScroll:true});}
      else if(page){selectPage(page);host.querySelector('.n4-page-keys [data-n4-page="'+page+'"]')?.focus({preventScroll:true});}
      else if(Object.hasOwn(NOMS,id)){ui.selected=id;draw();host.querySelector('[data-n4-equipement="'+id+'"]')?.focus({preventScroll:true});}
    }
    for(const type of ['pointerdown','pointermove','pointerup','pointercancel','lostpointercapture'])host.addEventListener(type,panEvent);
    host.ownerDocument?.defaultView?.addEventListener('blur',endPan);
    for(const type of ['pointerdown','pointerup','pointercancel','keydown','keyup','focusout'])host.addEventListener(type,holdEvent);
    host.ownerDocument?.defaultView?.addEventListener('blur',releaseHold);
    host.ownerDocument?.defaultView?.addEventListener('pagehide',releaseHold);
    const visibility=()=>{if(host.ownerDocument?.hidden)releaseHold();};host.ownerDocument?.addEventListener?.('visibilitychange',visibility);
    host.addEventListener('click',event);host.addEventListener('keydown',event);host.addEventListener('change',change);draw();
    return {selectPage,setSynthesis,update(snapshot){const changed=data.state?.ihm!==snapshot?.state?.ihm;data={...(snapshot||{})};if(changed)releaseHold();draw();},setContext(site,unit){ui.site=String(site);ui.unit=unit;draw();},getState(){return {...ui,synthesis:ui.synthesis.slice()};},destroy(){endPan();for(const type of ['pointerdown','pointermove','pointerup','pointercancel','lostpointercapture'])host.removeEventListener(type,panEvent);host.ownerDocument?.defaultView?.removeEventListener('blur',endPan);releaseHold();for(const type of ['pointerdown','pointerup','pointercancel','keydown','keyup','focusout'])host.removeEventListener(type,holdEvent);host.ownerDocument?.defaultView?.removeEventListener('blur',releaseHold);host.ownerDocument?.defaultView?.removeEventListener('pagehide',releaseHold);host.ownerDocument?.removeEventListener?.('visibilitychange',visibility);alive=false;host.ownerDocument?.defaultView?.clearTimeout(statusTimer);host.removeEventListener('click',event);host.removeEventListener('keydown',event);host.removeEventListener('change',change);host.replaceChildren();}};
  }
  return {createProfile:(p,syn,cmd)=>createPoste(syn,cmd||CMD,INST,p),mount,render,format:number,SYNTHESIS_METRICS,DEFAULT_SYNTHESIS,normalizeSynthesis};
});
