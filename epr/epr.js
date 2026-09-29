// SIMUREP — © 2026 AnthoninP. Composition MCP propre à l’EPR.
// RS FLA3 ch.17 §17.4 : postes multi-écrans banalisés + vision commune grand format.
// Transposition à un navigateur, pas fac-similé ni spécialisation physique des écrans.
(function(root){'use strict';
  function secoursInstruments(data,{escape:e,number}){
    const rows=[['Pression primaire',data.pressurePrimary,180,'bar'],['Température primaire',data.tempAverage,350,'°C'],['Pression vapeur',data.pressureSteam,100,'bar'],['Niveau GV',data.levelGV,100,'%'],['Puissance neutronique',Number.isFinite(data.state?.Pn)?data.state.Pn*100:null,120,'%'],['Réserve ASG',Number.isFinite(data.state?.bacheASG)?data.state.bacheASG*100:null,100,'%']];
    function scale(label,v,max,u){const ratio=Number.isFinite(v)?Math.max(0,Math.min(1,v/max)):0;return '<svg class="epr-scale" viewBox="0 0 150 128" role="img" aria-label="'+e(label+' : '+number(v,1)+' '+u)+'"><rect x="46" y="10" width="16" height="100" fill="#dce5ed" stroke="#6e8a9c"/>'+(Number.isFinite(v)?'<rect x="49" y="'+(110-ratio*100)+'" width="10" height="'+(ratio*100)+'" fill="#285d7d"/>':'')+[0,.25,.5,.75,1].map(r=>'<path d="M64 '+(110-r*100)+'h8" stroke="#526c80"/><text x="78" y="'+(114-r*100)+'" fill="#38566d" font-size="10">'+number(max*r,0)+'</text>').join('')+'<text x="26" y="67" text-anchor="middle" fill="#38566d" font-size="10">'+e(u)+'</text></svg>';}
    const lamps=[['ARRÊT RÉACTEUR',!!data.state?.scram],['SIGNAL IS',!!data.state?.sigIS],['POMPES ASG EN MARCHE',(data.state?.asgMarche||[]).some(v=>v>0)],['RÉSEAU ABSENT',data.state?.reseau===false]];
    return '<div class="epr-verrines">'+lamps.map(([label,on])=>'<div class="epr-verrine" data-on="'+on+'" role="img" aria-label="'+label+' : '+(on?'actif':'repos')+'"><b>'+label+'</b><span>'+(on?'ACTIF':'REPOS')+'</span></div>').join('')+'</div><div class="epr-mcs-measures">'+rows.map(([label,v,max,u])=>'<section class="epr-meter" aria-label="'+e(label)+'"><h3>'+label+'</h3>'+scale(label,v,max,u)+'<div class="epr-meter-value">'+number(v,1)+' <small>'+u+'</small></div></section>').join('')+'</div>';
  }
  function render(ui,data,H){
    const {escape:e,number,synthesis,mainPanel,fiche,alarmes,courbe,simulationControls,navigation=()=>'',NAV,PAGES,SYNOPTICS}=H;
    const secours=ui.page==='auxiliaire',syn=SYNOPTICS.includes(ui.page);
    const page=(id,label,extra='')=>'<button type="button" data-n4-page="'+id+'" '+extra+'>'+label+'</button>';
    const scram='<button type="button" class="n4-scram" data-n4-command="'+e(JSON.stringify({type:'scram',...(secours||data.state?.ihm===false?{poste:'secours'}:{})}))+'"'+(ui.connected?'':' disabled')+'>ARRÊT D’URGENCE</button>';
    const monitor=(cls,label,body)=>'<section class="n4-monitor '+cls+'"><div class="n4-monitor-head"><span>'+label+'</span></div>'+body+'</section>';
    return '<div class="n4-sdc epr-sdc '+(secours?'n4-secours':'')+'">'+
      (ui.published?'':'<div class="n4-study">ESSAI PRIVÉ · EPR <span>Conduite raccordée · qualification fermée</span></div>')+
      '<header class="n4-header">'+navigation(ui)+'<div class="n4-brand"><b>SIMUREP</b><span>Poste de conduite EPR</span></div><div class="n4-unit"><strong>'+e(ui.site.toUpperCase())+' · TRANCHE&nbsp;'+e(ui.unit)+'</strong><span>PALIER EPR · 1 650 MWe</span></div><details class="epr-session"><summary>Simulation <span>'+number(data.simulationTime||0,0)+' s · ×'+(data.state?.accel||1)+'</span></summary>'+simulationControls(ui,data)+'</details></header>'+
      '<section class="n4-wall" aria-label="Synthèse de tranche"><div class="n4-wall-title"><span>SYNTHÈSE DE TRANCHE</span><b>'+e(data.stateLabel||'—')+'</b></div><div class="n4-wall-measures">'+synthesis(ui,data)+'</div></section>'+
      '<div class="n4-quickbar"><span>'+(secours?'MCS · CONDUITE CONVENTIONNELLE':'MCP · POSTE OPÉRATEUR')+'</span>'+page(secours?'primaire':'auxiliaire',secours?'Revenir au MCP':'MCS · Secours')+scram+'</div>'+
      '<div class="n4-command-status" data-active="'+!!ui.status+'" role="status">'+e(ui.status||'')+'</div>'+
      (data.state?.ihm===false?'<div class="n4-kic-lost">MCP INDISPONIBLE · Rejoindre le MCS.</div>':'')+
      '<div class="epr-workstation"><nav class="n4-page-keys epr-screen-selector" aria-label="Écrans du poste">'+NAV.map(([id,label])=>page(id,label,'aria-current="'+(id===ui.page?'page':'false')+'"')).join('')+'</nav>'+
      '<div class="epr-displays '+(syn?'':'epr-full')+'"><section class="n4-monitor n4-main-monitor"><div class="n4-monitor-head"><span>'+e(PAGES[ui.page])+'</span><span>'+(secours?'MCS':'MCP · PROCÉDÉ')+'</span>'+(syn?'<button type="button" class="n4-zoom-key" data-n4-zoom="toggle" aria-pressed="'+!!ui.zoom+'">'+(ui.zoom?'Vue entière':'Agrandir')+'</button>':'')+'</div><div class="n4-main-content">'+mainPanel(ui,data)+'</div></section>'+
      '<aside class="epr-side">'+monitor('n4-alarm-monitor','SURVEILLANCE · ALARMES',alarmes(data,false))+monitor('n4-object-monitor',secours?'DIALOGUE ÉQUIPEMENT · LECTURE':'DIALOGUE ÉQUIPEMENT','<div class="n4-object-body" aria-live="polite">'+fiche(data,ui.selected,ui)+'</div>')+'</aside></div>'+
      monitor('n4-trend-monitor','ÉVOLUTION DE LA TRANCHE',courbe(data,false,ui.traces)+page('tendances','Configurer les courbes'))+
      '<footer class="n4-desk-footer"><span>MCP · Écrans de conduite et de surveillance</span><span>© 2026 AnthoninP · SIMUREP</span></footer></div>'+
      '<nav class="n4-thumb-dock" aria-label="Navigation au pouce">'+
      '<button type="button" data-n4-menu="toggle" aria-expanded="'+!!ui.menu+'">Écrans</button><button type="button" data-n4-fiche="true">Fiche</button>'+page('auxiliaire','Secours')+scram.replace('ARRÊT D’URGENCE</button>','Arrêt<br>urgence</button>')+'</nav>'+
      (ui.menu?'<div class="n4-thumb-menu"><div><b>Écrans du poste</b><button type="button" data-n4-menu="toggle">Fermer</button></div><nav>'+NAV.map(([id,label])=>page(id,label,'aria-current="'+(id===ui.page?'page':'false')+'"')).join('')+'</nav></div>':'')+'</div>';
  }
  const common=typeof module==='object'&&module.exports?require('./n4.js'):root.SDCN4;
  const syn=typeof module==='object'&&module.exports?require('./epr-synoptiques.js'):root.SDCEPRSynoptiques;
  const app=common.createProfile({palier:'EPR',render,secoursInstruments},syn);
  if(typeof module==='object'&&module.exports)module.exports=app;else root.SDCEPR=app;
})(typeof globalThis!=='undefined'?globalThis:this);
