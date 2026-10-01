// SIMUREP — © 2026 AnthoninP. Pont privé de la SDC vers le moteur 2.x.
// Aucune physique ni qualification ici : commandes natives et garde du poste obligatoires.
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.SDCN4Adaptateur=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const finite=v=>Number.isFinite(v)?v:null;
  function copy(v){if(Array.isArray(v))return v.map(copy);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,copy(x)]));return v;}
  function snapshot(S,PAL,options={}){
    S=S||{};PAL=PAL||{};
    const d=PAL.DTB*S.Ptot*(S.gmppN>0?PAL.NB/S.gmppN:3);
    // État d’exploitation affiché comme à la vue CNPE : l’AU puis l’îlotage priment sur l’état visé (targetState).
    return {state:Object.assign(copy(S),{residualMW:finite(S.Pres*PAL.PTH),boreTotal:Number.isFinite(S.Cb)&&Number.isFinite(PAL.CB0)?S.Cb+PAL.CB0:null,gainePct:Number.isFinite(S.gaine)?Math.round(S.gaine*100000)/1000:null,dus:S.dus===true,tVapGV:finite(options.steamTemperature)}),pal:copy(PAL),stateLabel:S.scram?'AU':S.ilote?'ÎLOT':(S.etat||'—'),targetState:S.etat||null,nominalElectric:PAL.ID==='EPR'?1650:1450,simulationTime:finite(S.t),liaison:options.liaison&&typeof options.liaison==='object'?{ok:options.liaison.ok!==false,texte:String(options.liaison.texte||'')}:null,
      powerThermal:finite(PAL.PTH*S.Ptot),powerElectric:finite(S.Pelec),powerGross:finite(S.Pbrut),powerAuxiliary:finite(S.Paux),
      pressurePrimary:finite(S.Ppzr),pressureSteam:finite(S.Psteam),steamTemperature:finite(options.steamTemperature),tempAverage:finite(S.Tavg),
      tempHot:finite(Number.isFinite(S.Thot)?S.Thot:S.Tavg+d),tempCold:finite(Number.isFinite(S.Tcold)?S.Tcold:S.Tavg-d),
      // Le moteur ne fournit ni niveau pressuriseur mesuré ni débit ARE massique.
      levelPzr:finite(S.levelPzr),levelGV:finite(S.gv),flowFeedwater:finite(S.flowFeedwater),feedwaterPercent:finite(S.areOut),setPressure:finite(S.pzrSet),
      // Le moteur ne donne que le nombre de GMPP en marche (gmppN) : ce tableau le transporte, la place de ses valeurs
      // ne désigne aucune pompe ; les vues N4 et EPR n'en lisent que le nombre (D12, D16).
      pumps:Array.from({length:Number.isInteger(PAL.NB)?PAL.NB:4},(_,i)=>Number.isFinite(S.gmppN)?i<S.gmppN:null),
      alarms:copy(options.alarms||[]),journal:copy(options.journal||[]),nativeViews:copy(options.nativeViews||{}),
      pressureHistory:copy(options.pressureHistory||[]),temperatureHistory:copy(options.temperatureHistory||[]),powerHistory:copy(options.powerHistory||[]),histories:copy(options.histories||{}),mission:copy(options.mission||null)};
  }
  const modes={auto:['bManu','bAuto'],areAuto:['bAreManu','bAreAuto'],pzrAuto:['bPzrM','bPzrA'],gctMode:['bGctM','bGctA'],gctaMode:['bGctaM','bGctaA'],viv:['bVivF','bVivO']};
  const toggles={mpsA:'bMpsA',mpsB:'bMpsB',tpsA:'bTpsA',tpsB:'bTpsB',heatM:'bHeatM',sprayM:'bSprayM',sebimM:'bSebimM',ishp:'bIshp',isbp:'bIsbp',eas:'bEas',isBlk:'bIsBlk',accIso:'bAccIso',inhASG:'bInhASG',inhIS:'bInhIS',inhEAS:'bInhEAS',inhIsoE:'bInhIsoE',inhIsoV:'bInhIsoV',inhKrt:'bInhKrt',aarInhib:'bInhib',easy:'bEasy',mis:'bMis'};
  const sliders={rod:['rod',0,100],turbSet:['turb',0,100],areM:['are',0,100],gctM:['gctMan',0,100],gctaM:['gctaMan',0,100],gctTgt:['gctSp',8,85],Tsrc:['tsrc',2,30],gaine:['gaineN',0,.3,200]};
  const rates={0.05:'tr005',0.2:'tr02',0.6:'tr06',1.2:'tr12'};
  const incidents=['iTrip','iGmpp1','iGmpp','iAre','iCvi','iApr','iLoop','iCrf','iSec','iFtgv','iMyst','iRtv','iDiluI','iRri','iRra','iRtgv','iH3'];
  const fail=motif=>({ok:false,motif});
  function dispatch(sim,doc,command){
    if(!sim||!sim.S||typeof sim.commandePermise!=='function')return fail('Moteur ou garde du poste indisponible');
    if(!command||typeof command!=='object')return fail('Commande invalide');
    let c=Object.assign({},command);const S=sim.S;
    // L’interface exprime un pourcentage, le moteur conserve sa fraction du cœur.
    if(c.type==='set'&&c.k==='gainePct'){
      if(!Number.isFinite(c.v)||c.v<0||c.v>30||!Number.isInteger(c.v*2))return fail('Défaut de gainage : saisir 0 à 30 %, par pas de 0,5 %');
      c.k='gaine';c.v=c.v/100;
    }
    // Une action visuelle doit subir la même garde que sa commande de conduite.
    if(c.type==='action'){
      let mapped=null;
      for(const [k,ids] of Object.entries(modes)){const i=ids.indexOf(c.id);if(i>=0)mapped={type:'set',k,v:k.endsWith('Mode')?(i?'auto':'manu'):!!i};}
      for(const [k,id] of Object.entries(toggles))if(c.id===id)mapped={type:'set',k,v:!S[k]};
      for(const [v,id] of Object.entries(rates))if(c.id===id)mapped={type:'set',k:'turbRate',v:+v};
      if(c.id==='bSuivre')mapped={type:'follow',v:!(doc&&doc.defaultView&&doc.defaultView.CNPE&&doc.defaultView.CNPE.follow)};
      if(c.id==='bAu')mapped={type:'scram'};if(c.id==='bRearm')mapped={type:'rearm'};
      if(!mapped&&c.id!=='bRearmIS')return fail('Action non prise en charge');
      if(mapped)c=Object.assign(mapped,{poste:c.poste});
    }
    const gate=sim.commandePermise(c);if(!gate||!gate.ok)return fail(gate&&gate.motif||'Commande refusée par le poste');
    S._refus=''; // motif d'un refus du moteur pendant cette commande seulement (jamais une note ancienne)
    function button(id){const e=doc&&doc.getElementById(id);if(!e||e.disabled)return fail('Commande native indisponible : '+id);
      if(typeof e.onclick==='function')e.onclick.call(e);else if(typeof e.click==='function')e.click();else return fail('Commande native non raccordée : '+id);return {ok:true};}
    function changed(k,v,result){if(!result.ok)return result;return S[k]===v?result:fail(S._refus||S.note||S.tripMsg||'Commande refusée par le moteur');}
    if(c.type==='set'){
      const k=c.k,v=c.v;
      if(k==='srcType'){
        const e=doc&&doc.getElementById('srcSel'),w=doc&&doc.defaultView;
        if(!e||!w||!w.Event||!e.dispatchEvent||!Array.from(e.options||[]).some(o=>o.value===v))return fail('Source froide indisponible');
        e.value=v;e.dispatchEvent(new w.Event('change',{bubbles:true}));return changed(k,v,{ok:true});
      }
      if(k==='saison'){
        if(!['hiver','mi','ete'].includes(v))return fail('Saison invalide');
        const e=doc&&doc.querySelector&&doc.querySelector('#saisons [data-s="'+v+'"]');
        if(!e||e.disabled||!e.click)return fail('Saison indisponible');e.click();return changed(k,v,{ok:true});
      }
      if(modes[k]){if(k.endsWith('Mode')?!['auto','manu'].includes(v):typeof v!=='boolean')return fail('Valeur de mode invalide');if(S[k]===v)return {ok:true};return changed(k,v,button(modes[k][v===true||v==='auto'?1:0]));}
      if(toggles[k]){if(typeof v!=='boolean')return fail('Valeur booléenne requise');if(S[k]===v)return {ok:true};return changed(k,v,button(toggles[k]));}
      if(k==='turbRate'){if(typeof sim.penteCharge==='function')return sim.penteCharge(v)?changed(k,v,{ok:true}):fail('Pente non disponible');return rates[v]?changed(k,v,button(rates[v])):fail('Pente non disponible');}
      if(k==='speed')return dispatch(sim,doc,{type:'speed',v,poste:c.poste});
      if(sliders[k]){const [id,min,max,scale=1]=sliders[k];if(!Number.isFinite(v)||v<min||v>max)return fail('Consigne hors plage');const e=doc&&doc.getElementById(id),w=doc&&doc.defaultView;
        if(!e||e.disabled||typeof e.dispatchEvent!=='function'||!w||!w.Event)return fail('Consigne native indisponible');
        e.value=String(v*scale);e.dispatchEvent(new w.Event('input',{bubbles:true}));e.dispatchEvent(new w.Event('change',{bubbles:true}));return changed(k,v,{ok:true});}
      if(k==='bori'||k==='dilu'){if(typeof v!=='boolean')return fail('Valeur booléenne requise');const e=doc&&doc.getElementById(k==='bori'?'bBori':'bDilu'),w=doc&&doc.defaultView;
        if(!e||(e.disabled&&v)||!e.dispatchEvent||!w||!w.Event)return fail('Commande maintenue indisponible');e.dispatchEvent(new w.Event(v?'pointerdown':'pointerup',{bubbles:true,cancelable:true}));return changed(k,v,{ok:true});}
      return fail('Consigne non prise en charge : '+k);
    }
    if(c.type==='incident'){
      // Recharge uniquement le document moteur privé ; aucune remise à zéro silencieuse de l'état.
      if(c.id==='iReset')return button('iReset');
      return incidents.includes(c.id)?button(c.id):fail('Incident non pris en charge');
    }
    if(c.type==='follow'){
      const api=doc&&doc.defaultView&&doc.defaultView.CNPE;
      if(typeof c.v!=='boolean'||!api||typeof api.setFollow!=='function')return fail('Suivi réseau indisponible');
      api.setFollow(c.v);return api.follow===c.v?{ok:true}:fail('Suivi réseau refusé');
    }
    if(c.type==='action'&&c.id==='bRearmIS')return changed('sigIS',false,button(c.id));
    if(c.type==='scram')return typeof sim.doScram==='function'?(sim.doScram('ARRÊT D’URGENCE manuel (SDC N4)'),{ok:!!S.scram}):changed('scram',true,button('bAu'));
    if(c.type==='rearm')return changed('scram',false,button('bRearm'));
    if(c.type==='etat'){
      if(!['RP','ANGV','ANRRA','APIF','APIO','APR','RCD'].includes(c.e))return fail('État inconnu');
      if(typeof sim.setEtat==='function')sim.setEtat(c.e);else{const e=doc&&doc.querySelector&&doc.querySelector('[data-e="'+c.e+'"]');if(!e||e.disabled||!e.click)return fail('Sélecteur d’état indisponible');e.click();}
      return changed('etat',c.e,{ok:true});
    }
    if(c.type==='voie')return ['RA','HS','RRI','SEC'].includes(c.role)&&Number.isInteger(c.i)&&typeof c.v==='boolean'&&typeof sim.voie==='function'&&sim.voie(c.role,c.i,c.v)?{ok:true}:fail('Commande de voie refusée');
    if(c.type==='ihm'){if(typeof c.perdue!=='boolean'||typeof sim.ihm!=='function')return fail('Commande IHM invalide');if(S.ihm===!c.perdue)return {ok:true};return sim.ihm(c.perdue)?{ok:true}:fail('Commande IHM refusée');}
    if(c.type==='speed'){const f=doc&&doc.defaultView&&doc.defaultView.__setSpeed;return [1,60,300,600].includes(c.v)&&typeof f==='function'&&f(c.v)?{ok:true}:fail('Vitesse indisponible');}
    return fail('Commande non prise en charge');
  }
  return Object.freeze({snapshot,dispatch,supportedCommands:Object.freeze({sets:Object.freeze([...Object.keys(modes),...Object.keys(toggles),...Object.keys(sliders),'gainePct','turbRate','bori','dilu','speed','srcType','saison']),incidents:Object.freeze(incidents)})});
});
