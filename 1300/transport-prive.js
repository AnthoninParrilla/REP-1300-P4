// SIMUREP — © 2026 AnthoninP. Transport des SDC privées : état serveur autoritaire.
// Réutilise la file /cmd et la transaction /take du châssis ; aucune physique locale.
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.SDCTransportPrive=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const modes={bManu:['auto',false],bAuto:['auto',true],bAreManu:['areAuto',false],bAreAuto:['areAuto',true],bPzrM:['pzrAuto',false],bPzrA:['pzrAuto',true],bGctM:['gctMode','manu'],bGctA:['gctMode','auto'],bGctaM:['gctaMode','manu'],bGctaA:['gctaMode','auto'],bVivF:['viv',false],bVivO:['viv',true]};
  const toggles={bMpsA:'mpsA',bMpsB:'mpsB',bTpsA:'tpsA',bTpsB:'tpsB',bHeatM:'heatM',bSprayM:'sprayM',bSebimM:'sebimM',bIshp:'ishp',bIsbp:'isbp',bEas:'eas',bIsBlk:'isBlk',bAccIso:'accIso',bInhASG:'inhASG',bInhIS:'inhIS',bInhEAS:'inhEAS',bInhIsoE:'inhIsoE',bInhIsoV:'inhIsoV',bInhKrt:'inhKrt',bInhib:'aarInhib',bEasy:'easy',bMis:'mis'};
  function normalize(command,S,follow){let c={...command};if(c.type==='action'){
    const id=c.id,p=c.poste;
    if(modes[id])c={type:'set',k:modes[id][0],v:modes[id][1]};else if(toggles[id])c={type:'set',k:toggles[id],v:!S[toggles[id]]};
    else if(id==='bAu')c={type:'scram'};else if(id==='bRearm')c={type:'rearm'};else if(id==='bSuivre')c={type:'follow',v:!follow};
    else if({tr005:1,tr02:1,tr06:1,tr12:1}[id])c={type:'set',k:'turbRate',v:{tr005:.05,tr02:.2,tr06:.6,tr12:1.2}[id]};
    c.poste=p;
  }if(c.type==='set'&&c.k==='speed')c={type:'speed',v:c.v,poste:c.poste};if(c.type==='set'&&c.k==='gainePct'){if(!Number.isFinite(c.v)||c.v<0||c.v>30||!Number.isInteger(c.v*2))throw Error('Gainage hors plage');c.k='gaine';c.v/=100;}c.src='sdc';return c;}   // J2b : ordre marqué « salle » pour le serveur (chemin natif au CPY)
  // 2.17.0e (N6) : un échec de liaison (requête perdue, délai, moteur indisponible) n'atteint jamais le joueur en message brut ;
  // un motif métier du serveur ou du poste (permissif, refus motivé, tranche changée) reste tel quel.
  const RESEAU=/Failed to fetch|Load failed|NetworkError|fetch failed|network error|délai de confirmation dépassé|aborted/i;
  function motifJoueur(e){const m=String(e&&e.message||e||''),nom=e&&e.name||'';
    if(nom==='AbortError'||RESEAU.test(m))return 'Liaison avec le moteur interrompue : commande non confirmée. L’affichage reprend l’état réel du serveur dès le retour du réseau ; vérifie-le avant de recommencer.';
    if(/^requête refusée \(5\d\d\)$/.test(m)||/^(serveur|dispatching) plein$/.test(m))return 'Le moteur de SIMUREP ne répond pas pour l’instant : commande non confirmée. Réessaie dans un instant.';
    if(['TypeError','ReferenceError','RangeError','SyntaxError','SecurityError','QuotaExceededError','NS_ERROR_DOM_QUOTA_REACHED'].includes(nom)){try{console.error(e);}catch(_){}return 'Commande non confirmée : erreur interne. Vérifie l’état affiché avant de recommencer.';}   // J6 (V27-07) : jamais le texte du navigateur sur son stockage
    if(e&&e.statut&&e.statut!==400&&e.statut!==409)return 'Le moteur de SIMUREP ne répond pas pour l’instant : commande non confirmée. Réessaie dans un instant.';   // tour 8 : hors refus motivé (400, 409), comme le témoin et la file
    return m||'Commande non confirmée';}
  async function connect(win,config){
    for(let i=0;!win.__net&&i<100;i++)await new Promise(r=>setTimeout(r,50));
    if(!win.__net||!win.CNPE)throw Error('Liaison au poste indisponible');
    const site=win.__SITES.find(s=>s.n===config.site);if(!site||!await win.CNPE.take(site,config.unit))throw Error('Prise de quart refusée');
    const net=win.__net,key=config.site+'|'+config.unit,u=net.ukey(),sim=win.__sim;
    if(sim.S.pal!==config.palier)throw Error('Palier de tranche inattendu');
    let tail=Promise.resolve(),holdTimer=null,renewing=false;
    const held=new Map();
    function stopRenewals(){held.clear();if(holdTimer!==null)clearInterval(holdTimer);holdTimer=null;}
    function startRenewals(){if(holdTimer!==null||!held.size)return;holdTimer=setInterval(async()=>{
      if(net.ukey()!==u){stopRenewals();return;}
      for(const c of held.values()){const gate=sim.commandePermise&&sim.commandePermise(c);if(gate&&!gate.ok){stopRenewals();return;}}
      if(renewing)return;renewing=true;
      try{for(const c of [...held.values()]){if(!held.has(c.k))continue;const result=await dispatch(c,true);if(!result.ok){stopRenewals();break;}}}finally{renewing=false;}
    },500);}
    function dispatch(command,renewal=false){
      const isHold=command.type==='set'&&['bori','dilu'].includes(command.k);
      if(isHold&&!renewal){if(command.v===true){held.set(command.k,{...command});startRenewals();}else{held.delete(command.k);if(!held.size)stopRenewals();}}

      const emitted={...command},issued=u;
      const operation=tail.catch(()=>{}).then(async()=>{
        if(renewal&&!held.has(emitted.k))return {ok:true,skipped:true};
        if(net.ukey()!==issued)throw Error('Tranche changée : commande annulée');
        const c=normalize(emitted,sim.S,win.CNPE.follow),avant=sim.S.etat;
        await net.cmd(c);
        let answer;
        // 2.17.0e : la commande vient d'être acceptée ; un échec ancien de la file (commande précédente sans réponse) ne la
        // rend pas incertaine. L'ancienne est réconciliée avec l'état du serveur, sans être rejouée, puis l'état est relu.
        // J6, 2b (relecture adverse) : l'accusé ne demande que les 25 dernières lignes du journal (l'anneau entier ne sert qu'à la prise de quart).
        try{answer=await net.take(issued,null,true);}catch(e){if(!net.reconcile)throw e;await net.reconcile(issued);answer=await net.take(issued,null,true);}
        if(net.ukey()!==issued)throw Error('Tranche changée : confirmation ignorée');
        net.select(issued,key,answer.state);
        if(c.type==='set'&&sim.S[c.k]!==c.v)throw Error('Consigne non appliquée');
        // Lot « Chaussette », passe 2 : AN/GV ou RP demandé depuis l'AN/RRA sous la limite d'isolement engage la remontée (l'état reste
        // AN/RRA jusqu'à l'isolement du RRA) : c'est une réussite, pas un refus.
        const remontee=c.type==='etat'&&(c.e==='ANGV'||c.e==='RP')&&((sim.S.etat==='ANRRA'&&sim.S.remontee===true)||(avant==='ANRRA'&&c.e==='RP'&&sim.S.etat==='ANGV'));   // isolée dès le pas suivant (EPR à 120 °C)
        if(c.type==='etat'&&sim.S.etat!==c.e&&!remontee)throw Error(sim.S.note||'Transition refusée');
        if(c.type==='ihm'&&sim.S.ihm!==!c.perdue)throw Error('Changement de poste de conduite non confirmé');
        return {ok:true,confirmed:true,...(remontee?{remontee:true,...(sim.S.etat==='ANGV'?{isolee:true}:{})}:{})};   // revue du 09/10 : déjà isolée, l'accusé le dit
      });const handled=operation.catch(async e=>{stopRenewals();if(net.reconcile)try{await net.reconcile(issued);}catch(_){}return {ok:false,motif:motifJoueur(e)};});tail=handled;return handled;
    }
    return {dispatch,stopRenewals,ready:true,palier:sim.S.pal,site:config.site,unit:config.unit};
  }
  return {connect,normalize,motifJoueur};
});
