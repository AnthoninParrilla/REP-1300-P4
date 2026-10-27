// SIMUREP — © 2026 AnthoninP. Banc visuel privé : moteur réel en iframe isolée.
(function(){
  'use strict';
  const config=window.SDC_PRIVATE||{},palier=config.palier||'N4',epr=palier==='EPR',salle900=palier==='CPY'||palier==='CP0',salle1300=palier==='P4'||palier==="P'4",salle=salle900||salle1300;
  // Tranche par défaut d'un essai sans adresse (la vraie vient de l'URL) : Civaux 1 (N4), Flamanville 3 (EPR), Gravelines 5 (CPY),
  // Bugey 3 (CP0, index interne 2 : ULAB donne le numéro réel), Paluel 1 (P4), Cattenom 1 (P'4).
  const DEF=salle900?(palier==='CP0'?{site:'Bugey',unit:2}:{site:'Gravelines',unit:5}):salle1300?(palier==='P4'?{site:'Paluel',unit:1}:{site:'Cattenom',unit:1}):epr?{site:'Flamanville',unit:3}:{site:'Civaux',unit:1};
  const frame=document.getElementById('n4-engine'),host=document.getElementById('n4-root');
  let timer=null,poste=null,cleanupInline=null;
  async function boot(){
    if(timer)clearInterval(timer);if(poste)poste.destroy();if(cleanupInline)cleanupInline();
    frame.hidden=true;frame.style.cssText='';
    try{
      const win=frame.contentWindow,doc=win.document,sim=win.__sim;
      if(!sim)throw Error('état de la tranche non reçu');
      // Salles 900 et 1300 (J2b) : le châssis caché ne consomme pas le bilan d'absence (la salle l'affiche, comme les postes N4/EPR).
      // Aucun châssis caché n'empile d'entrée d'historique, salles et postes N4/EPR (4A, 04/10) : sinon le premier Retour du navigateur
      // était pris par l'iframe cachée, et le poste ne remontait pas à la centrale.
      if(salle&&win.CNPE)win.CNPE.afficherRetour=()=>false;if(win.__niveaux)win.__niveaux.muet=true;
      const transport=config.transport?await SDCTransportPrive.connect(win,config):null;
      // Ordre de la prise de quart : palier, source froide du site (saison et température), puis point de fonctionnement.
      if(!transport){if(!win.__setPalier(palier))throw Error('Palier privé indisponible');
        const unit=config.unit||DEF.unit,base=(win.__SITES||[]).find(s=>s.n===(config.site||DEF.site)),site=base&&win.CNPE.unitSite?win.CNPE.unitSite(base,unit):base;
        if(!site||!win.CNPE.initSource(site,unit))throw Error('Source froide du site indisponible');
        sim.initOperatingPoint(win.__PALIERS[palier].PEL,'RP');sim.S.accel=1;}
      // H18 : progression de mission mémorisée pour cette tranche, restituée après la prise de quart (même parcours) ;
      // l’état vit dans le châssis (S.mis, S.mIdx : clés locales jamais écrasées par le serveur).
      let storage;try{storage=win.localStorage||window.localStorage;}catch(e){}   // J6 (86A) : celle du châssis, qui garde en mémoire ce que le navigateur refuse
      const siteId=config.site||DEF.site,unitId=config.unit||DEF.unit,m0=SDCN4Preferences.readMission?.(storage,palier,siteId,unitId);
      if(m0&&win.__missionPoser)win.__missionPoser(m0);
      let memoire=m0?JSON.stringify(m0):'',ouvert=m0?.ouvert===true;
      // J3 (passe 4, 3A) : premier quart noté par la page France pour cette tranche (rep_premier_quart) : à la première ouverture,
      // missions depuis la première et Guide Pas à pas, suivi du réseau coupé par sa commande existante (« follow »), accueil en trois
      // étapes ; les cinq premières missions sont suivies (réussie ou passée), puis le bilan ; ensuite, la suite au choix du joueur.
      const PQ_CLE='rep_premier_quart';let pq=null,pqTexte='';
      try{const o=JSON.parse(storage?.getItem(PQ_CLE)||'null');if(o&&o.cle===siteId+'|'+unitId&&o.etape!=='fini'){pq=o;pqTexte=JSON.stringify(o);}}catch(e){}
      // J3 (10A, 5 bis A du 06/10) : mission choisie dans les listes de la carte France pour cette tranche (rep_mission_choisie, moins d’une
      // heure) : posée au premier état reçu, le joueur ayant pris lui-même le quart ; sans exiger les missions d’avant ; un incident demande
      // une tranche saine (motif au carnet sinon). Consommée.
      const MC_CLE='rep_mission_choisie';let mc=null;
      try{const o=JSON.parse(storage?.getItem(MC_CLE)||'null');if(o&&o.cle===siteId+'|'+unitId&&Date.now()-(o.t||0)<3600e3)mc=o;if(o&&(mc||Date.now()-(o.t||0)>=3600e3))storage.removeItem(MC_CLE);}catch(e){}
      const pqEcrire=()=>{if(!pq)return;const j=JSON.stringify(pq);if(j===pqTexte)return;try{storage?.setItem(PQ_CLE,j);pqTexte=j;}catch(e){}};
      // J3 (05/10, 2A) : un texte à lire s'affiche (nouvelle mission, fiche « Ce qui vient de se passer », « Bilan de l'arrêt », accueil ou
      // bilan du premier quart) : la tranche repasse à ×1 par la commande de vitesse existante, motif « lecture » que le serveur écrit au
      // journal. Rien si elle y est déjà ; le joueur rechoisit sa vitesse quand il veut.
      const lecture=()=>{if(!(sim.S.accel>1))return;const c={type:'speed',v:1,motif:'lecture'};Promise.resolve(transport?transport.dispatch(c):SDCN4Adaptateur.dispatch(sim,doc,c)).catch(()=>{});};
      if(pq&&!pq.demarre){lecture();const n=win.__missionEtat?.()?.total||0;if(n&&win.__missionPoser)win.__missionPoser({actif:true,index:0,total:n});win.__guidePoser?.('pas',true);pq.demarre=Date.now();pq.resultats={};pqEcrire();
        const coupe={type:'follow',v:false};Promise.resolve(transport?transport.dispatch(coupe):SDCN4Adaptateur.dispatch(sim,doc,coupe)).catch(()=>{});}
      // J3 (passe 5, 4A) : conséquences et débriefing. À chaque mission réussie, la fiche « Ce qui vient de se passer » prise au moteur
      // (relevés début, extrême, fin de la tentative) ; à chaque arrêt automatique, le « Bilan de l'arrêt » (cause écrite par le moteur,
      // chaleur résiduelle, derniers évènements du journal) ; chaque mission passée. Une fiche ou un bilan reste affiché jusqu'au clic ;
      // tout est gardé au « Carnet du quart » de la tranche (rep_carnet_v1), relisible dans Aide & missions. Aucune commande.
      const CARNET_CLE='rep_carnet_v1',cleTranche=siteId+'|'+unitId,aLire=[];
      const carnetTout=()=>{try{const o=JSON.parse(storage?.getItem(CARNET_CLE)||'{}');return o&&typeof o==='object'&&!Array.isArray(o)?o:{};}catch(e){return {};}};
      let carnet=(carnetTout()[cleTranche]||[]).filter(e=>e&&typeof e==='object').slice(-60),carnetVu='';
      const carnetEcrire=()=>{carnet=carnet.slice(-60);try{const o=carnetTout();o[cleTranche]=carnet;storage?.setItem(CARNET_CLE,JSON.stringify(o));}catch(e){}};
      const FR=(v,d)=>Number.isFinite(v)?v.toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d}):'—';
      const ETATS_NOMS={RP:'RP',ANGV:'AN/GV',ANRRA:'AN/RRA',APIF:'API fermé',APIO:'API ouvert',APR:'APR',RCD:'RCD'},EXUT=palier==='EPR'?'de la VDA':palier==='N4'?'du GCT-A':'du GCTa';   // relecture de la passe 2, tour 5 : jamais « de le GCT-A »
      const GR={set:['Consigne de charge',v=>FR(v,0),'%'],turb:['Charge turbine',v=>FR(v,0),'%'],rod:['Grappes de régulation',v=>FR(v,0),'% extraites'],pe:['Puissance électrique',v=>FR(v,0),'MWe'],
        pth:['Puissance thermique',v=>FR(v,0),'MWth'],tm:['Température moyenne',v=>FR(v,1),'°C'],pp:['Pression primaire',v=>FR(v,1),'bar'],
        xe:['Xénon',salle?v=>FR(v*100,0):v=>FR(v,2),salle?'% de l’équilibre':'(1,00 = équilibre)'],cb:['Bore primaire',v=>FR(v,0),'ppm'],ts:['Source froide',v=>FR(v,1),'°C'],
        gv:['Niveau GV',v=>FR(v,0),'%'],pn:['Puissance neutronique',v=>FR(v*100,1),'% PN'],pres:['Puissance résiduelle',v=>FR(v,0),'MWth'],
        pcond:['Pression au condenseur',v=>FR(v*1000,0),'mbar'],   // J3 (passe 6) : S.Pcond est en bar (0,06 bar = 60 mbar ; la fiche disait 0)
        gcta:['Ouverture '+EXUT,v=>FR(v*100,0),'%'],gaine:['Assemblages à gaine non étanche',v=>FR(v*100,1),'%'],fuite:['Fuite GV (KRT VVP)',v=>FR(v,1),'L/h'],
        etat:['État de tranche',v=>ETATS_NOMS[v]||String(v),'']};
      // Par mission, les grandeurs lues : d, début → fin ; m, début → maximum → fin ; n, début → minimum → fin ; f, fin seule.
      const RELEVES={main:'set:d turb:d rod:d pe:d',pleine:'set:d turb:d pe:d',revanche:'ts:d pe:d pth:d',xenon:'set:d xe:d',bore:'cb:d',vide:'pcond:m pe:n',
        exutoire:'gcta:m',barriere:'gaine:m',rouge:'pn:d pres:f',repli:'tm:d gv:f',pic:'xe:m',rearmer:'cb:d pn:f pe:d',etat:'etat:d tm:f',
        descente:'tm:d pp:d etat:d',rra:'tm:m',boucle:'etat:d tm:f pn:f',
        suivre:'turb:n pe:n',boreRetour:'cb:m rod:d',diluI:'cb:n',ilotage:'turb:n pe:n',asg:'gv:n pres:f',secours:'gv:n',
        // relecture de la passe 2, tour 8 : les missions Incidents et Histoire, relevées comme leurs voisines du parcours principal
        condenseur:'pcond:m pe:n',pompe:'pn:d tm:m',diesels:'gv:n pres:f',tube:'fuite:m',breche:'pp:n pn:d',posteSecours:'pn:d tm:m',
        penly2012:'pn:d tm:m',civaux1998:'tm:d pp:d etat:d',blayais1999:'gv:n pres:f'};
      const duree=s=>{s=Math.max(0,Math.round(s));const hh=Math.floor(s/3600),mm=Math.floor(s%3600/60),ss=s%60;return hh?hh+' h '+String(mm).padStart(2,'0')+' min':mm?mm+' min '+String(ss).padStart(2,'0')+' s':ss+' s';};
      const ligneGr=(f,k,mode)=>{const d0=f.d0||f.d1,d1=f.d1,x=f.ext||{},g=GR[k];if(!g||!d1)return '';
        const v=[];if(mode!=='f')v.push(g[1](d0[k]));if(mode==='m'&&x[k])v.push(g[1](x[k].max)+' (maximum)');if(mode==='n'&&x[k])v.push(g[1](x[k].min)+' (minimum)');v.push(g[1](d1[k]));
        return g[0]+' : '+v.join(' → ')+(g[2]?' '+g[2]:'');};
      // J3 (passe 6, 10A) : en tête, la prévision du joueur (ou l'effet attendu s'il n'en a pas fait) et la mesure de sa grandeur ; sans note.
      const prevLigne=f=>{const p=f.prev,mes=p?ligneGr(f,p.k,p.m):'';if(!mes)return '';
        const min=t=>t.charAt(0).toLowerCase()+t.slice(1);return (p.choix?'Tu avais prévu : « '+p.choix+' »':'Effet attendu : '+min(String(p.effet||'').replace(/[.]$/,'').replace(/ [:;] /g,', ')))+' ; mesuré : '+min(mes).replace(' : ',' ')+'.';};   // tour 5 : un seul « : » après « mesuré »
      const ficheLignes=f=>[prevLigne(f)].concat(String(RELEVES[f.id]||'').split(' ').filter(Boolean).map(s=>{const [k,mode]=s.split(':');return ligneGr(f,k,mode);})).filter(Boolean);
      // Lignes du journal autour de l'arrêt (la ligne « ARRÊT D'URGENCE », trois avant, deux après), dans l'ordre du temps, sans ordre causal.
      const autourArret=j=>{j=j||[];const k=j.findIndex(x=>/ARRÊT D.URGENCE/.test(x.message||''));return (k>=0?j.slice(Math.max(0,k-2),k+4):j.slice(0,5)).reverse().map(x=>x.time+' '+x.message);};
      let scramAvant=null,missionAvant=null;
      function debriefSuivre(S,snap,journal){let ecrire=false,lire=false;
        for(const f of (win.__missionFichesPrendre?.()||[])){if(!f||!f.d1)continue;const e={type:'fiche',parcours:f.parcours==='incidents'||f.parcours==='histoire'?f.parcours:undefined,id:f.id,titre:f.titre,bravo:f.bravo,lignes:ficheLignes(f),duree:f.d0?duree(f.d1.t-(Number.isFinite(f.t0)?f.t0:f.d0.t)):'',t:f.d1.t,quand:Date.now()};carnet.push(e);aLire.push(e);ecrire=lire=true;}
        const s=!!S.scram;if(scramAvant===false&&s&&S.tripMsg&&!/reprise du quart/i.test(S.tripMsg)){const e={type:'arret',cause:String(S.tripMsg).replace(/^AU automatique : /,'').replace(/\.$/,''),
          pres:snap.state?.residualMW,t:S.t,quand:Date.now(),journal:autourArret(journal)};carnet.push(e);aLire.push(e);ecrire=lire=true;}
        scramAvant=s;const m=snap.mission;
        if(m&&m.total){if(missionAvant&&m.index>missionAvant.index&&!missionAvant.reussie){carnet.push({type:'passee',id:missionAvant.id,titre:missionAvant.titre,t:S.t,quand:Date.now()});ecrire=true;}
          if(!missionAvant||m.index!==missionAvant.index){if(m.actif&&!m.termine)lire=true;missionAvant={index:m.index,id:m.id,titre:m.titre,reussie:!!m.reussie};}else if(m.reussie)missionAvant.reussie=true;}
        if(ecrire)carnetEcrire();if(lire)lecture();
        snap.cvp=aLire.length?{...aLire[0],reste:aLire.length-1}:null;}
      const echap=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
      // J3 (passe 6, 5A) : missions rejouables. La plus avancée des missions atteintes est gardée par tranche (rep_missions_atteintes_v1) ;
      // chaque mission dit son état de départ ; « Reprendre » une mission atteinte, « Recommencer » celle en cours (nouvelle tentative, nouveaux
      // relevés) ; le carnet garde chaque reprise, chaque nouvelle tentative et chaque arrêt du parcours. Jamais de remise en état de la tranche.
      const ATTEINTES_CLE='rep_missions_atteintes_v1';
      const atteintesTout=()=>{try{const o=JSON.parse(storage?.getItem(ATTEINTES_CLE)||'{}');return o&&typeof o==='object'&&!Array.isArray(o)?o:{};}catch(e){return {};}};
      let atteinte=Number.isInteger(atteintesTout()[cleTranche])?atteintesTout()[cleTranche]:0,listeVue='';
      const atteindre=i=>{if(!Number.isInteger(i)||i<=atteinte)return;atteinte=i;try{const o=atteintesTout();o[cleTranche]=i;storage?.setItem(ATTEINTES_CLE,JSON.stringify(o));}catch(e){}};
      // J3 (7A, 06/10) : pendant un incident, la mission du parcours principal est m.principal (sur m.totalPrincipal).
      function missionPoser(i,type){const m=win.__missionEtat?.(),n=m?.totalPrincipal||m?.total||0,cur=m?.parcours==='incidents'?m.principal:m?.index,L=win.__missionsListe?.()||[];if(!n||!Number.isInteger(i)||i<0||i>=n||i>Math.max(atteinte,cur))return false;
        win.__missionPoser?.({actif:true,index:i,total:n});const e=L[i];carnet.push({type,id:e?.id,titre:e?.titre||'',t:sim.S.t,quand:Date.now()});carnetEcrire();
        missionAvant={index:i,id:e?.id,titre:e?.titre,reussie:false};memo();lecture();return true;}
      // J3 (7A, 2A 3A 4A du 06/10) : parcours « Incidents » à part, chaque incident lancé sur une tranche saine (motif sinon), dans l'ordre du
      // joueur ; le suivi du réseau est coupé par sa commande existante ; la réussite rend la main au parcours principal.
      // J3 (passe 5) : même lancement pour une mission historique (son récit s'affiche dans l'encart).
      function incidentLancer(i,type,parcours='incidents'){const I=(parcours==='histoire'?win.__histoireListe?.():win.__incidentsListe?.())||[],x=I[i];if(!x)return {ok:false,motif:'Mission inconnue'};if(!x.possible)return {ok:false,motif:x.motif};
        if(!win.__missionPoser?.({parcours,index:i,actif:true}))return {ok:false,motif:'Mission non lancée'};
        if(win.CNPE&&win.CNPE.follow){const coupe={type:'follow',v:false};Promise.resolve(transport?transport.dispatch(coupe):SDCN4Adaptateur.dispatch(sim,doc,coupe)).catch(()=>{});}
        carnet.push({type:type||'incident',id:x.id,titre:x.titre,t:sim.S.t,quand:Date.now()});carnetEcrire();ouvert=true;poste?.setMissionOpen?.(true);memo();lecture();return {ok:true};}
      function incidentsHtml(m){const I=win.__incidentsListe?.()||[];if(!I.length)return '';const reussis=new Set(carnet.filter(e=>e.type==='fiche'&&e.parcours==='incidents').map(e=>e.id));
        return '<h3>Incidents</h3><p class="note">Chaque incident part d’une tranche saine : en production, 88 % de charge au moins, sans incident en cours. Le suivi du réseau est coupé pour l’exercice ; une fois l’incident réussi, tu reviens au parcours.</p>'
          +(I[0].possible?'':'<p class="note"><b>'+echap(I[0].motif)+'</b> Tu peux aussi prendre le quart d’une autre tranche en production depuis la carte de France.</p>')+'<ol class="missionsListe">'
          +I.map(x=>{const cours=m&&m.parcours==='incidents'&&x.index===m.index&&!m.reussie,etat=cours?(m.actif?'en cours':'arrêté'):reussis.has(x.id)?'réussi ✓':'';
            const b=cours?'<button type="button" data-incident-action="retour">Revenir au parcours</button>':'<button type="button" data-incident="'+x.index+'"'+(x.possible?'':' disabled')+'>Lancer</button>';
            return (cours?'<li aria-current="step">':'<li>')+'<b>'+echap(x.titre)+'</b>'+(etat?' · '+etat:'')+b+'</li>';}).join('')+'</ol>';}   // le départ, commun aux incidents, est dit une fois dans la note
      function mcPoser(){if(!mc||!(sim.S.t>0))return;const o=mc;mc=null;
        if(o.parcours==='incidents'||o.parcours==='histoire'){const r=incidentLancer(o.index,'choisie',o.parcours);if(!r.ok){carnet.push({type:'choisieRefusee',id:o.id,titre:o.titre,motif:r.motif,t:sim.S.t,quand:Date.now()});carnetEcrire();}return;}
        const L=win.__missionsListe?.()||[],k=L.findIndex(x=>x.id===o.id);if(k<0)return;
        if(win.__missionPoser?.({actif:true,index:k,total:L.length})){atteindre(k);carnet.push({type:'choisie',id:o.id,titre:o.debut?o.titre+' (début : '+o.debut+')':o.titre,t:sim.S.t,quand:Date.now()});carnetEcrire();
          ouvert=true;poste?.setMissionOpen?.(true);memo();lecture();}}
      function histoireHtml(m){const I=win.__histoireListe?.()||[];if(!I.length)return '';const reussis=new Set(carnet.filter(e=>e.type==='fiche'&&e.parcours==='histoire').map(e=>e.id));
        return '<h3>Histoire</h3><p class="note">Un récit bref et un exercice inspiré de l’événement, sur une tranche saine ; ce que le simulateur ne joue pas est raconté.</p><ol class="missionsListe">'
          +I.map(x=>{const cours=m&&m.parcours==='histoire'&&x.index===m.index&&!m.reussie,etat=cours?(m.actif?'en cours':'arrêtée'):reussis.has(x.id)?'réussie ✓':'';
            const b=cours?'<button type="button" data-incident-action="retour">Revenir au parcours</button>':'<button type="button" data-histoire="'+x.index+'"'+(x.possible?'':' disabled')+'>Lancer</button>';
            return (cours?'<li aria-current="step">':'<li>')+'<b>'+echap(x.titre)+'</b>'+(etat?' · '+etat:'')+'<small>'+echap(x.recit)+'</small>'+(x.possible?'':'<small>'+echap(x.motif)+'</small>')+b+'</li>';}).join('')+'</ol>';}
      function listeHtml(){const m=win.__missionEtat?.(),L=win.__missionsListe?.()||[];if(!m||!L.length)return '';const curP=m.parcours!=='principal'?m.principal:m.index,max=Math.max(atteinte,curP);
        const reussies=new Set(carnet.filter(e=>e.type==='fiche').map(e=>e.id)),passees=new Set(carnet.filter(e=>e.type==='passee').map(e=>e.id));
        return '<h3>Les missions de ta tranche</h3><p class="note">Toute mission déjà atteinte se reprend, celle en cours se recommence (nouvelle tentative). Le jeu ne remet jamais ta tranche en état : chaque mission dit l’état où elle commence.</p><ol class="missionsListe">'
          +L.map(x=>{const cours=m.parcours==='principal'&&x.index===m.index&&!m.termine,etat=reussies.has(x.id)?'réussie ✓':passees.has(x.id)?'passée':cours?(m.actif?'en cours':'arrêtée'):x.index<=max?'atteinte':'à venir';
            const b=cours?'<button type="button" data-mission-action="recommencer" data-index="'+x.index+'">Recommencer</button>':x.index<=max?'<button type="button" data-mission-action="reprendre" data-index="'+x.index+'">Reprendre</button>':'';
            return (cours?'<li aria-current="step">':'<li>')+'<b>'+echap(x.titre)+'</b> · '+etat+(x.depart?'<small>Départ : '+echap(x.depart)+'</small>':'')+b+'</li>';}).join('')+'</ol>'+incidentsHtml(m)+histoireHtml(m);}
      function listeMonter(){if(activeKind!=='formation')return;let c=doc.getElementById('missionsListe');
        if(!c){c=doc.createElement('section');c.id='missionsListe';c.className='card';listeVue='';
          c.addEventListener('click',ev=>{const t=ev.target&&ev.target.closest&&ev.target.closest('[data-incident],[data-histoire],[data-incident-action]');
            if(t){if(t.hasAttribute('data-incident'))incidentLancer(Number(t.getAttribute('data-incident')));else if(t.hasAttribute('data-histoire'))incidentLancer(Number(t.getAttribute('data-histoire')),'histoire','histoire');else doc.getElementById('bMSkip')?.onclick?.();memo();rafraichir();return;}
            const b=ev.target&&ev.target.closest&&ev.target.closest('[data-mission-action]');if(!b)return;const i=Number(b.getAttribute('data-index'));
            if(missionPoser(i,b.getAttribute('data-mission-action')==='recommencer'?'recommencee':'reprise'))rafraichir();});}
        const carnetEl=doc.getElementById('carnetQuart');if(carnetEl&&carnetEl.parentNode===nativeRoot){if(c.nextSibling!==carnetEl)nativeRoot.insertBefore(c,carnetEl);}else if(c.parentNode!==nativeRoot)nativeRoot.appendChild(c);
        const html=listeHtml();if(html!==listeVue){c.innerHTML=html;listeVue=html;}}
      const CARNET_NOMS={fiche:'Mission réussie : ',passee:'Mission passée : ',reprise:'Mission reprise : ',recommencee:'Mission recommencée : ',annulee:'Parcours arrêté pendant : ',incident:'Incident lancé : ',incidentRecommence:'Incident recommencé : ',histoire:'Mission historique lancée : ',choisie:'Mission choisie dans les listes : ',choisieRefusee:'Incident non lancé (tranche non saine) : '};
      function carnetHtml(){const L=carnet.slice().reverse();
        return '<h3>Carnet du quart</h3><p class="note">Ce que tu as fait sur cette tranche : missions réussies avec leurs relevés, missions passées, arrêts automatiques. '+(storage?'Gardé dans ce navigateur.':'Ta progression ne sera pas gardée sur cet appareil.')+'</p>'
          +(L.length?'<ol class="carnetQuart">'+L.map(e=>'<li><b>'+stamp(e.t||0)+' · '+(e.type==='fiche'&&e.parcours==='incidents'?'Incident réussi : '+echap(e.titre):e.type==='fiche'&&e.parcours==='histoire'?'Mission historique réussie : '+echap(e.titre):CARNET_NOMS[e.type]?CARNET_NOMS[e.type]+echap(e.titre):'Arrêt automatique')+'</b>'
            +(e.type==='fiche'?(e.lignes&&e.lignes.length?'<ul>'+e.lignes.map(l=>'<li>'+echap(l)+'</li>').join('')+'</ul>':'')+(e.duree?'<small>Tentative : '+echap(e.duree)+' simulées.</small>':''):e.type==='arret'?'<div>Cause : '+echap(e.cause)+'.</div>':'')+'</li>').join('')+'</ol>'
            :'<p class="note">Rien encore : réussis ou passe une mission, le carnet la gardera.</p>');}
      function carnetMonter(){if(activeKind!=='formation')return;let c=doc.getElementById('carnetQuart');if(!c){c=doc.createElement('section');c.id='carnetQuart';c.className='card';carnetVu='';}
        const lex=doc.getElementById('easyLex');if(lex&&lex.parentNode===nativeRoot){if(c.nextSibling!==lex||c.parentNode!==nativeRoot)nativeRoot.insertBefore(c,lex);}else if(c.parentNode!==nativeRoot)nativeRoot.appendChild(c);   // avant le lexique
        const html=carnetHtml();if(html!==carnetVu){c.innerHTML=html;carnetVu=html;}}
      const pqSuivre=m=>{if(!pq||pq.etape!=='missions'||!m||!m.total||(m.parcours&&m.parcours!=='principal'))return;const r=pq.resultats||(pq.resultats={});
        if(m.reussie&&m.id&&!r[m.id])r[m.id]={etat:'reussie',titre:m.titre};
        if(pq.dernier&&m.index>pq.dernier.index&&pq.dernier.id&&!r[pq.dernier.id])r[pq.dernier.id]={etat:'passee',titre:pq.dernier.titre};
        pq.dernier={index:m.index,id:m.id,titre:m.titre};if(m.index>=5||m.termine){pq.etape='bilan';lecture();}pqEcrire();};
      // Mission réussie pendant son bravo (9 s) : c’est la suivante qui est mémorisée ; quitter ou réinitialiser ne la fait pas refaire.
      const aGarder=m=>m.parcours&&m.parcours!=='principal'?{actif:m.actif,index:m.principal,total:m.totalPrincipal}:({actif:m.actif,index:m.reussie?Math.min(m.index+1,m.total):m.index,total:m.total});
      const memo=()=>{const m=win.__missionEtat?.();if(!m||!m.total)return;const v={...aGarder(m),ouvert},j=JSON.stringify(v);if(j!==memoire&&SDCN4Preferences.writeMission?.(storage,palier,siteId,unitId,v))memoire=j;};
      sim.render();
      // N4/EPR : le groupe R seul ; les salles 900 et 1300 gardent la note du mode G du châssis (banques G du CPY et du 1300).
      // V24 (S120, faux ; S121, nuance) : au N4 et à l'EPR, ce que le modèle règle et ce qu'il ne représente pas.
      const note=salle?null:doc.getElementById('rGNote');if(note)note.textContent=epr?'Dans SIMUREP, le groupe P règle la température ; le pilotage axial et les séquences de ses sous-groupes ne sont pas représentés.':'Dans SIMUREP, le groupe D règle la température ; le pilotage axial par plusieurs groupes n’est pas représenté.';
      const label=salle?null:doc.getElementById('rGLabel');if(label)label.textContent='Autres groupes de grappes';
      const core=doc.getElementById('coreOpen');
      const nativeRoot=doc.createElement('main');nativeRoot.id='n4-native-root';doc.body.appendChild(nativeRoot);
      const skin=doc.createElement('style');skin.textContent=`
        body.n4-native{margin:0!important;padding:14px!important;background:#10181b!important;color:#dce7e5!important;--panel:#10181b;--panel2:#172428;--ink:#dce7e5;--dim:#a1b6b9;--edge:#486066;font:15px system-ui!important}
        body.n4-native> :not(#n4-native-root){display:none!important}
        #n4-native-root{max-width:1160px;margin:0 auto;padding-bottom:24px;box-sizing:border-box}
        #n4-native-root>.n4-native-title{color:#a6d6df;font:600 20px system-ui;margin:8px 0 18px}
        #n4-native-root .card,#n4-native-root #easyCard,#n4-native-root #easyLex{background:#10191d!important;color:#dce7e5!important;border:1px solid #486066!important;border-radius:5px;box-shadow:none!important;padding:16px!important;margin:12px 0!important;max-width:100%!important;box-sizing:border-box}
        #n4-native-root .card::after,#n4-native-root .card::before{display:none!important;content:none!important}
        #n4-native-root .val{background:#081115!important;border:1px solid #344e53!important;padding:5px 8px;box-shadow:none!important}
        #n4-native-root h2{background:#203037!important;box-shadow:none!important;white-space:normal!important;flex-wrap:wrap;border:1px solid #405860!important;padding:12px!important;color:#a8cbd1!important;font:600 16px system-ui;line-height:1.5}
        #n4-native-root .row{gap:12px;flex-wrap:wrap;padding:5px 0}
        #n4-native-root .val,#n4-native-root .bilan td:last-child{color:#90d5e2!important;font-family:monospace}
        #n4-native-root .note,#n4-native-root .msg{color:#b2c3c5!important;background:transparent!important;line-height:1.6}
        #n4-native-root button,#n4-native-root select,#n4-native-root input:not([type=checkbox]){min-height:44px!important;min-width:44px;max-width:100%;padding:8px 12px!important;background:#22383d!important;color:#e1eeee!important;border:1px solid #577078!important;box-sizing:border-box;font:inherit!important}
        #n4-native-root button.on{background:#3a6355!important;border-color:#89b6a2!important}
        #n4-native-root button:focus-visible,#n4-native-root summary:focus-visible{outline:3px solid #80cfe0;outline-offset:2px}
        #n4-native-root input[type=checkbox]{width:20px;height:20px}#n4-native-root #recSel label{display:flex;align-items:center;min-height:44px}
        #n4-native-root #coreModal{display:block!important;position:static!important;padding:0!important;background:transparent!important;overflow:auto!important}
        #n4-native-root #coreGrid{min-width:0!important;width:100%;max-width:min(100%,520px,max(260px,calc(var(--n4-vue-h,9999px) - 150px)))!important;gap:1px!important;margin:6px auto!important}#n4-native-root #coreGrid>[data-picked]{outline:3px solid #faf2b8!important;outline-offset:-3px}#n4-native-root #coreGrid>:focus-visible{outline:3px solid #fff!important}#n4-native-root #coreDetail{background:#152c2a;color:#e4f5de;padding:6px 8px;margin:6px 0;min-height:calc(3*1.35em + 12px)!important;font-size:13px!important;line-height:1.35;border:1px solid #6a9585}
        #n4-native-root #coreModal>.card{overflow-x:auto}#n4-native-root #coreModes{position:sticky;left:0}
        #n4-native-root #secSock{display:block!important;padding-bottom:16px!important}#n4-native-root #sockWrap{max-width:100%;overflow:auto}
        #n4-native-root #easyCard,#n4-native-root #easyLex{display:block!important}#n4-native-root #bEasyLex,#n4-native-root #coreClose{display:none!important}
        #n4-native-root #lexBody{line-height:1.6}#n4-native-root .lexD summary{padding:10px 0;color:#95d0db}
        #n4-native-root .bilan{width:100%;border-collapse:collapse}#n4-native-root .bilan td{padding:10px;border-bottom:1px solid #33464b}
        #n4-native-root .log{max-height:45vh;line-height:1.65}#n4-native-root #recWrap{max-width:100%}
        html:has(body.n4-native){overflow:hidden!important}body.n4-native{overflow:hidden!important}
        #n4-native-root #recSel{background:#101b20!important;border-color:#3b555e!important}#n4-native-root #recSel label{color:#d0e4e9!important}
        #n4-native-root #recWrap{background:#0a151a!important;border-color:#3b555e!important;resize:none!important}
        #n4-native-root #recHead{background:#15262e!important;color:#b9e7f1!important;border-color:#3b555e!important}
        #n4-native-root #recTxt{color:#b9d9e1!important}#n4-native-root #easyLex b{color:#b9e7f1!important}
        #n4-native-root .card:first-child{margin-top:0!important}#n4-native-root #easyCard span,#n4-native-root #easyMsg{color:#c6e4e8!important}
        #n4-native-root details.n4-rec-voies{margin:6px 0 8px;border:1px solid #3b555e;border-radius:6px;background:#101b20}
        #n4-native-root details.n4-rec-voies>summary{min-height:44px;display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:pointer;color:#b9e7f1;font-weight:600;line-height:1.35;list-style:none}
        #n4-native-root details.n4-rec-voies>summary::-webkit-details-marker{display:none}#n4-native-root details.n4-rec-voies>summary::before{content:'▸';flex:none}#n4-native-root details.n4-rec-voies[open]>summary::before{content:'▾'}
        #n4-native-root details.n4-rec-voies #recSel{margin:0!important;border-width:1px 0 0!important;border-radius:0 0 6px 6px!important;grid-template-columns:repeat(auto-fill,minmax(96px,1fr))!important;gap:4px!important;padding:6px!important}
        #n4-native-root #recSel label{padding:0 6px;border:1px solid transparent;border-radius:4px;font-size:12px!important;gap:8px!important}
        #n4-native-root #recSel label:has(input:checked){background:#3a6355;border-color:#89b6a2;font-weight:700}#n4-native-root #recSel input[type=checkbox]{width:18px!important;height:18px!important}
        #n4-native-root[data-kind=formation] button{margin:5px!important}
        #n4-native-root[data-kind=formation]>#bMis{display:block;margin:0 5px 14px!important}
        #n4-native-root[data-kind=formation]>#bEasy{display:flex;flex-wrap:wrap;align-items:center}#n4-native-root[data-kind=formation]>#bEasy>b{margin-right:4px}
        #n4-native-root[data-kind=formation]>#n4GuideEffet{margin:2px 5px 12px;font-size:13px}
        @media(max-width:600px){#n4-native-root #coreDetail{min-height:calc(5*1.35em + 12px)!important}#n4-native-root #coreGrid>[data-picked]{outline-width:2px!important;outline-offset:-2px!important}body.n4-native{padding:8px!important}#n4-native-root .card{padding:10px!important}#n4-native-root .row>label{min-width:0;flex:1 1 145px}#n4-native-root .row>.val{white-space:normal;max-width:100%}#n4-native-root details.n4-rec-voies #recSel{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
        @media(max-width:420px){#n4-native-root #coreDetail{min-height:calc(6*1.35em + 12px)!important}}
      `;
      // Palette EPR distincte ; les styles N4 restent strictement identiques.
      // J3 (passe 5) : carnet du quart de la page Aide & missions, à la taille du texte de la page, puces dans le cadre.
      skin.textContent+="#n4-native-root #carnetQuart{font-size:14px;line-height:1.5}#n4-native-root #carnetQuart h3{margin:0 0 6px;font-size:18px}#n4-native-root #carnetQuart ol,#n4-native-root #carnetQuart ul{margin:6px 0;padding-left:22px}#n4-native-root #carnetQuart ol>li{margin:10px 0}#n4-native-root #carnetQuart small{display:block;opacity:.8}"
        +"#n4-native-root #missionsListe{font-size:14px;line-height:1.45}#n4-native-root #missionsListe h3{margin:0 0 6px;font-size:18px}#n4-native-root #missionsListe ol{margin:6px 0;padding-left:28px}"
        +"#n4-native-root #missionsListe li{margin:10px 0}#n4-native-root #missionsListe li[aria-current]>b{text-decoration:underline}#n4-native-root #missionsListe small{display:block;opacity:.8;margin:2px 0 4px}#n4-native-root #missionsListe button{display:block;margin:2px 0 0}";
      // J6 2c (lexique relu au navigateur) : dans les salles et les postes, les fiches du lexique se rangent en grille, rangée par rangée, au
      // lieu des colonnes de journal du châssis (#easyLex), hautes de 4 600 px au PC : une fiche ouverte n'est plus coupée en haut de la
      // colonne voisine et n'en déplace aucune autre ; le champ de recherche prend toute la largeur. Au téléphone, une seule colonne.
      skin.textContent+="#n4-native-root #easyLex{columns:auto}#n4-native-root #lexBody{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(270px,100%),1fr));column-gap:22px;align-items:start}";
      // J3 (passe 3) : au poste, le développement d'une entrée du lexique (« en savoir plus ») gardait le fond crème du châssis sous le
      // texte clair du poste, illisible ; il prend le fond du poste (clair à l'EPR par la table ci-dessous). Les salles ont leur feuille.
      if(!salle)skin.textContent+="#n4-native-root .lexP{background:#081115;color:#dce7e5;border-left-color:#a6d6df}";
      if(epr){const light={'#10181b':'#f1f5f6','#dce7e5':'#294754','#172428':'#e5edf1','#a1b6b9':'#526e7b','#486066':'#afc0c8','#10191d':'#f1f5f6','#081115':'#fff','#344e53':'#b2c6cf','#203037':'#dce7ec','#405860':'#a5bbc6','#a8cbd1':'#375b70','#b2c3c5':'#4c6978','#22383d':'#e1eaf0','#e1eeee':'#2b4c5d','#577078':'#9aafbc','#3a6355':'#c4ddce','#89b6a2':'#6b9a82','#152c2a':'#e1eee6','#e4f5de':'#2c5240','#101b20':'#edf3f6','#3b555e':'#a4bac6','#d0e4e9':'#345767','#0a151a':'#f7fafb','#15262e':'#dce8ee','#b9e7f1':'#245a74','#b9d9e1':'#375b6c','#c6e4e8':'#315f72','#a6d6df':'#275d77'};skin.textContent=skin.textContent.replace(/#[0-9a-f]{6}/g,c=>light[c]||c);skin.textContent+="#n4-native-root summary,#n4-native-root a,#n4-native-root #sockMemOuvrir{color:#255d78!important}#n4-native-root summary{min-height:44px;display:flex;align-items:center}";}   // lot « Chaussette », passe 6 : la ligne « De mémoire » a la couleur des volets du MCP
      // Lot « Chaussette », passe 3 : la chaussette prend l'écran du palier ; EPR, MCP clair ; N4, KIC (fond noir, traits colorés, police du KIC).
      if(epr)skin.textContent+=`
        #n4-native-root #secSock{--sk-fond:#f1f5f6;--sk-grille:#d6e0e5;--sk-encre:#294754;--sk-pale:#526e7b;--sk-zone:#c5dbe2;--sk-actif:#86c6b0;--sk-bord:#2d7a63;--sk-sat:#275d77;--sk-gv:#a8641c;--sk-rra:#1d6fa5;--sk-pompe:#6c4aa0;--sk-rp:#285d77;--sk-hors:#bf3028;--sk-trace:#aa6419;--sk-ok:#28745a}
        #n4-native-root #sockSvg{border:1px solid #afc0c8}#n4-native-root #sockResume[data-etat=franchie]{color:#bf3028!important}
      `;
      skin.textContent+='@media(max-width:600px){body.n4-native:has(#n4-native-root[data-kind=pt]){padding:3px!important}#n4-native-root #secSock{padding:6px!important}}';
      if(!epr&&!salle)skin.textContent+=`
        #n4-native-root #secSock{--sk-fond:#080d0e;--sk-grille:#17262a;--sk-encre:#dce5df;--sk-pale:#92a39c;--sk-zone:#103239;--sk-actif:#65c4c8;--sk-bord:#65c4c8;--sk-sat:#dce5df;--sk-gv:#edb06c;--sk-rra:#65c4c8;--sk-pompe:#d2a5ed;--sk-rp:#88ce95;--sk-hors:#ff6b5e;--sk-trace:#eddb77;--sk-ok:#88ce95;background:#090e12!important;border:7px solid #565e59!important;border-bottom-color:#4a554e!important;border-radius:3px!important;font-family:Consolas,'Lucida Console',monospace}
        #n4-native-root #secSock>h2{background:#142027!important;color:#b4c7c9!important;border:0!important;border-bottom:1px solid #45585e!important;font:600 13px Consolas,'Lucida Console',monospace!important;letter-spacing:.04em}
        @media(max-width:600px){#n4-native-root #secSock{border-width:3px!important}}
      `;
      doc.head.appendChild(skin);
      // Salles 900 et 1300 (J2b) : habillage des écrans natifs fourni par le profil (KIT d'époque au 900, KIS au 1300) ; N4/EPR inchangés.
      const SALLE=salle1300?SDC1300:salle900?SDC900:null;
      if(SALLE&&SALLE.styleNatif){const s9=doc.createElement('style');s9.textContent=SALLE.styleNatifPour?SALLE.styleNatifPour(palier):SALLE.styleNatif;doc.head.appendChild(s9);}
      const moved=[];let activeSlot=null,activeKind=null,layoutPending=false;
      function restoreNative(){if(activeKind==='coeur'){const button=doc.getElementById('coreClose');if(button?.onclick)button.onclick();}
        doc.querySelectorAll('details.n4-rec-voies').forEach(box=>{const sel=box.querySelector('#recSel');if(sel)box.replaceWith(sel);else box.remove();});while(moved.length){const [node,marker]=moved.pop();marker.replaceWith(node);}nativeRoot.replaceChildren();doc.body.classList.remove('n4-native');}
      function alignInline(){
        layoutPending=false;
        if(!activeSlot?.isConnected||frame.hidden)return;
        const rect=activeSlot.getBoundingClientRect();nativeRoot.style.setProperty('--n4-vue-h',window.innerHeight+'px');
        frame.style.left=(rect.left+window.scrollX)+'px';frame.style.top=(rect.top+window.scrollY)+'px';frame.style.width=rect.width+'px';
        const height=Math.ceil(nativeRoot.getBoundingClientRect().height+28);
        activeSlot.style.height=height+'px';frame.style.height=height+'px';
      }
      function queueLayout(){if(!layoutPending){layoutPending=true;requestAnimationFrame(alignInline);}}
      const observer=new ResizeObserver(queueLayout);observer.observe(nativeRoot);
      window.addEventListener('resize',queueLayout);window.addEventListener('scroll',queueLayout,{passive:true});
      cleanupInline=()=>{observer.disconnect();window.removeEventListener('resize',queueLayout);window.removeEventListener('scroll',queueLayout);};
      function closeNative(){restoreNative();frame.hidden=true;frame.style.cssText='';activeSlot=null;activeKind=null;}
      function move(node){if(!node)return;const marker=doc.createComment('n4-native-origin');node.replaceWith(marker);moved.push([node,marker]);nativeRoot.appendChild(node);}
      const ACCUEIL='Active MISSIONS pour le parcours guidé et choisis ton Guide : Pas à pas, Indices ou Libre. Les vitesses ×60 et ×300 sont dans le volet « Simulation », en haut '+(salle?'de la salle':'du poste')+'.';
      function accueil(){const a=doc.getElementById('easyMsg');if(a&&activeKind==='formation'&&!sim.S.easy&&!sim.S.mis&&a.textContent!==ACCUEIL)a.textContent=ACCUEIL;}
      // 57A du 20/10 (retour d'Anthonin : l'effet des trois boutons du Guide ne se voyait pas) : sous les boutons, ce que le mode choisi
      // montre dans l'encart de la mission déplié (replié, il garde son titre, et l'étape en Pas à pas), avec le texte de l'infobulle de
      // son bouton ; mise à jour au clic et à chaque instantané.
      const GUIDE_NOMS={pas:'Pas à pas',indices:'Indices',libre:'Libre'};
      function guideEffet(){if(activeKind!=='formation')return;const g=doc.getElementById('bEasy');if(!g||g.parentNode!==nativeRoot)return;
        let p=doc.getElementById('n4GuideEffet');if(!p){p=doc.createElement('p');p.id='n4GuideEffet';p.className='note';p.setAttribute('aria-live','polite');}
        if(g.nextSibling!==p)g.after(p);if(!g.dataset.effet){g.dataset.effet='1';g.addEventListener('click',()=>Promise.resolve().then(guideEffet));}
        const n=win.__guideNiveau?.()||'indices',b=g.querySelector('[data-guide="'+n+'"]'),t=b&&b.title&&GUIDE_NOMS[n]?'Guide « '+GUIDE_NOMS[n]+' », encart de la mission déplié : '+b.title.charAt(0).toLowerCase()+b.title.slice(1)+'.':'';
        if(p.textContent!==t)p.textContent=t;}
      const nativeTitles={instrumentation:'RPN · RIC · KRT · Bilan de réactivité',coeur:'Carte calculée du cœur '+palier,pt:'Domaine pression / température',formation:'Formation · Missions · Lexique',enregistreur:'Enregistreur'};
      function mountInline(page,slot){
        const kind=page==='tendances'?'enregistreur':page;
        if(!slot||!Object.hasOwn(nativeTitles,kind)){closeNative();return {ok:true};}
        activeSlot=slot;
        if(activeKind===kind){queueLayout();return {ok:true};}
        // P19 (142A du 25/10) : KIC ou MCP perdu, « Aide & missions » reste ouverte (l'aide n'est pas un écran du KIC) ; les autres sont refusés.
        if(sim.S.ihm===false&&kind!=='formation'){closeNative();return {ok:false,motif:epr?'MCP indisponible : utiliser le MCS':'KIC indisponible : utiliser le panneau auxiliaire'};}
        if(!Object.hasOwn(nativeTitles,kind))return {ok:false,motif:'Écran non disponible'};
        restoreNative();activeKind=kind;nativeRoot.dataset.kind=kind;doc.body.classList.add('n4-native');
        const byId=id=>doc.getElementById(id),card=id=>{const e=byId(id);return e&&e.closest('.card');};
        if(kind==='instrumentation'){move(card('rpnP'));move(card('krtP'));move(card('rRod'));}
        if(kind==='coeur'){
          move(byId('coreModal'));if(core)core.click();
          const grid=byId('coreGrid'),detail=byId('coreDetail');
          if(grid){const cols=Number(grid.style.gridTemplateColumns.match(/\d+/)?.[0])||17;grid.style.minWidth='';
            [...grid.children].forEach((cell,i)=>{cell.setAttribute('role','button');cell.setAttribute('aria-label','Assemblage '+(i+1));cell.tabIndex=i===0?0:-1;});
            grid.onclick=e=>{const cell=e.target.closest('#coreGrid > div');if(!cell)return;grid.querySelectorAll('[data-picked]').forEach(n=>n.removeAttribute('data-picked'));cell.setAttribute('data-picked','true');[...grid.children].forEach(n=>n.tabIndex=n===cell?0:-1);};
            grid.onkeydown=e=>{const cells=[...grid.children],i=cells.indexOf(e.target);if(i<0)return;if(['Enter',' '].includes(e.key)){e.preventDefault();e.target.click();}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-cols,ArrowDown:cols}[e.key];cells[Math.max(0,Math.min(cells.length-1,i+delta))].focus();}};
            if(detail&&detail.parentElement===grid.parentElement){grid.before(detail);detail.setAttribute('role','status');}
          }
        }
        if(kind==='pt')move(byId('secSock'));
        // H16 : l’accueil du châssis cite « ×60 et ×300 (en haut) » ; au poste, les vitesses sont dans le volet Simulation.
        // 57A du 20/10 : MISSIONS sur sa ligne, au-dessus du Guide (il n'en est pas un quatrième mode) ; sous le Guide, la ligne de son effet.
        if(kind==='formation'){['bMis','bEasy','easyCard','easyLex'].forEach(id=>move(byId(id)));byId('easyLex')?.classList.add('on');accueil();guideEffet();carnetMonter();listeMonter();}
        // H14 : voies de l’enregistreur repliables ; le résumé garde la sélection visible quand le volet est fermé.
        if(kind==='enregistreur'){move(card('recRun'));const sel=byId('recSel');if(sel&&!sel.closest('details.n4-rec-voies')){const box=doc.createElement('details'),summary=doc.createElement('summary');box.className='n4-rec-voies';box.open=!window.matchMedia?.('(max-width:760px), (max-width:1000px) and (max-height:500px)').matches;box.append(summary);sel.replaceWith(box);box.append(sel);
          const voies=()=>{const labels=[...sel.querySelectorAll('label')],on=labels.filter(l=>l.querySelector('input')?.checked).map(l=>(l.childNodes[1]?.textContent||'').trim());summary.textContent='Voies enregistrées · '+on.length+' sur '+labels.length+(on.length?' : '+on.join(', '):'');};
          box.addEventListener('change',voies);voies();}}
        frame.hidden=false;frame.setAttribute('title',nativeTitles[kind]);frame.style.cssText='position:absolute;border:0;background:#10181b;z-index:2;box-sizing:border-box';
        sim.render();win.scrollTo(0,0);queueLayout();return {ok:true};
      }
      // Conserver les fonctions natives dans leur document d'origine préserve leurs événements
      // et toutes les recherches par identifiant du moteur, sans recharger l'iframe.
      if(core)core.addEventListener('click',function(){if(activeKind&&activeKind!=='coeur')poste.selectPage('coeur');});
      // Historique des courbes (H13) : valeurs mêmes de l’instantané du poste, une par seconde simulée, 300 au plus.
      const APP=SALLE||(epr?SDCEPR:SDCN4),histories=Object.fromEntries(['t',...Object.keys(APP.CURVE_METRICS)].map(k=>[k,[]]));
      // J6 (V27-03) : rafraîchissement et liaison sur une horloge monotone ; un recul de l'horloge de l'appareil les suspendait (600 s rejouées).
      const horloge=()=>typeof performance!=='undefined'&&performance.now?performance.now():Date.now();   // repli des bancs sans performance
      let lastSample=-Infinity,lastRender=-Infinity,liaisonKo=0;
      // J6, client 2 (N-20) : l'historique survit au retour sur la tranche et au rechargement, gardé pour l'onglet (sessionStorage) et par
      // tranche, arrondi (5 chiffres, t au dixième) ; repris seulement s'il précède l'instant du moteur et qu'il est complet. Une tranche
      // réinitialisée ici ou par « Tout réinitialiser » l'efface ; l'absence reste un trou dans les courbes (voir l'échantillonnage).
      const COURBES_CLE='simurep_courbes_v1|'+cleTranche;let courbesLues=false,courbesEcrites=-Infinity;
      function courbesGarder(){if(!histories.t.length)return;const j=JSON.stringify(Object.fromEntries(Object.entries(histories).map(([k,a])=>[k,a.map(v=>Number.isFinite(v)?(k==='t'?Math.round(v*10)/10:+v.toPrecision(5)):null)])));
        try{window.sessionStorage.setItem(COURBES_CLE,j);}catch(_){try{const S=window.sessionStorage;for(let i=S.length-1;i>=0;i--){const k=S.key(i);if(k&&k.indexOf('simurep_courbes')===0&&k!==COURBES_CLE)S.removeItem(k);}S.setItem(COURBES_CLE,j);}catch(_e){}}}
      function courbesReprendre(t){courbesLues=true;let o=null;try{o=JSON.parse(window.sessionStorage.getItem(COURBES_CLE)||'null');}catch(_){o=null;}
        const tt=o&&Array.isArray(o.t)?o.t:[];if(!tt.length||!(tt[tt.length-1]<=t)||!Object.keys(histories).every(k=>Array.isArray(o[k])&&o[k].length===tt.length))return;
        for(const k of Object.keys(histories))histories[k].push(...o[k].slice(-300));lastSample=tt[tt.length-1];}
      // J6, C-12 : les enregistreurs des salles 900 et 1300 lisent les relevés du châssis de la page, qui repart vide à chaque vue. Comme les
      // courbes, la salle garde ce qu'elle a montré, pour l'onglet et par tranche (une ligne par instant, 5 chiffres, t au dixième), et le rend
      // au retour et au rechargement : repris seulement avec les mêmes voies et si l'instant du moteur ne recule pas ; un recul du temps
      // (tranche réinitialisée) l'oublie. L'absence est une ligne inconnue au milieu du trou, jamais une droite tirée à travers.
      const ENR_CLE='simurep_courbes_enr_v1|'+cleTranche;let enrPasse,enrVu=null,enrIds='',enrEcrit=-Infinity;
      const enrSuite=r=>{let i=r.length-1;while(i>0&&r[i-1].t<=r[i].t)i--;return i>0?r.slice(i):r;};   // les lignes d'après le dernier recul du temps
      function enrLire(ids,n,t){let o=null;try{o=JSON.parse(window.sessionStorage.getItem(ENR_CLE)||'null');}catch(_){o=null;}const rows=[];
        for(const x of (o&&o.voies===ids&&Array.isArray(o.rows)?o.rows:[])){if(!Array.isArray(x)||!Number.isFinite(x[0]))return null;
          if(x.length===2&&typeof x[1]==='string')rows.push({t:x[0],evt:x[1]});else if(x.length===n+1)rows.push({t:x[0],v:x.slice(1).map(v=>Number.isFinite(v)?v:null)});else return null;}
        if(!rows.length)return null;if(!(rows[rows.length-1].t<=t)){try{window.sessionStorage.removeItem(ENR_CLE);}catch(_){}return null;}return enrSuite(rows);}
      function enrDonnees(S){const D=typeof sim.recDonnees==='function'?sim.recDonnees():null;if(!D||!Array.isArray(D.rows)||!Array.isArray(D.voies))return D;
        const vif=enrSuite(D.rows);enrIds=D.voies.map(v=>v.id).join(',');if(enrPasse===undefined){if(!vif.some(r=>r.v))return D;enrPasse=enrLire(enrIds,D.voies.length,S.t);}   // lu au premier relevé de la page
        if(enrPasse&&vif!==D.rows){enrPasse=null;try{window.sessionStorage.removeItem(ENR_CLE);}catch(_){}}   // le temps a reculé dans la page
        let rows=vif;if(enrPasse){const a=enrPasse[enrPasse.length-1].t,suite=vif.filter(r=>r.t>=a),b=(suite.find(r=>r.v)||{}).t;if(b===undefined)return D;
          rows=enrPasse.concat(b-a>2*(D.pas||10)?[{t:(a+b)/2,v:D.voies.map(()=>null)}]:[],suite).slice(-3600);}   // plus de deux pas sans relevé : un trou
        enrVu={...D,rows:enrTrouer(rows,D.voies.length,D.pas||10)};return enrVu;}
      // 2b (relecture adverse) : une absence PENDANT la visite (écran verrouillé, page gelée) arrive au châssis en saut du temps ; la salle y pose la
      // même ligne inconnue que les courbes (même seuil, noté par snapshot), sinon l'enregistreur du 1300 la relierait par une droite.
      const enrTrous=[];
      function enrTrouer(rows,n,pas){while(enrTrous.length&&rows.length&&enrTrous[0].b<rows[0].t)enrTrous.shift();if(!enrTrous.length)return rows;const R=rows.slice(),vu=r=>Array.isArray(r.v)&&r.v.some(x=>x!==null);
        // entre le dernier relevé d'avant l'absence (j) et le premier d'après (i), une ligne inconnue au milieu, à son rang, si l'écart dépasse deux pas
        for(const {a} of enrTrous){const i=R.findIndex(r=>vu(r)&&r.t>a);let j=i-1;while(j>=0&&!vu(R[j]))j--;if(i<1||j<0||R[i].t-R[j].t<=2*pas||R.slice(j+1,i).some(r=>Array.isArray(r.v)&&!vu(r)))continue;
          const g=(R[j].t+R[i].t)/2;let k=j+1;while(k<i&&R[k].t<=g)k++;R.splice(k,0,{t:g,v:Array(n).fill(null)});}return R;}
      function enrGarder(){if(!enrVu)return;const L=[];let p=null;
        for(const x of enrSuite(enrVu.rows)){if(x.evt!==undefined){L.push([Math.round(x.t*10)/10,String(x.evt)]);continue;}if(!Array.isArray(x.v)||p&&p.t===x.t)continue;p=x;L.push([Math.round(x.t*10)/10,...x.v.map(v=>Number.isFinite(v)?+v.toPrecision(5):null)]);}
        if(!L.length)return;const j=JSON.stringify({voies:enrIds,rows:L});
        try{window.sessionStorage.setItem(ENR_CLE,j);}catch(_){try{const S=window.sessionStorage;for(let i=S.length-1;i>=0;i--){const k=S.key(i);if(k&&k.indexOf('simurep_courbes')===0&&!k.endsWith('|'+cleTranche))S.removeItem(k);}S.setItem(ENR_CLE,j);}catch(_e){}}}
      // 2.17.0e (N6) : liaison lue sur le témoin du châssis caché ; perdue seulement si l'échec dure 3 s (un refus de commande
      // isolé allume brièvement « commande non confirmée » sans que la liaison soit perdue).
      function liaison(){const dot=doc.getElementById('srvDot');if(!dot)return null;const texte=dot.textContent.replace(/^●\s*/,''),ko=/injoignable|satur|non confirm/.test(texte);
        if(!ko)liaisonKo=0;else if(!liaisonKo)liaisonKo=horloge()||1;return {ok:!(ko&&horloge()-liaisonKo>=3000),texte};}
      const stamp=t=>'T+'+Math.floor(t/3600).toString().padStart(2,'0')+':'+Math.floor(t/60%60).toString().padStart(2,'0')+':'+Math.floor(t%60).toString().padStart(2,'0');
      function snapshot(){
        sim.render();if(activeKind==='enregistreur')sim.recRender();accueil();const S=sim.S;if(!courbesLues)courbesReprendre(S.t);
        if(S.t<lastSample){Object.values(histories).forEach(a=>a.length=0);lastSample=-Infinity;try{window.sessionStorage.removeItem(COURBES_CLE);}catch(_){}}
        // Heure d'apparition datée au pas moteur (local ou serveur), pas l'heure du rafraîchissement.
        const onset=typeof sim.alarmes==='function'?sim.alarmes()||{}:{};
        // 21A du 13/10 : l'identifiant de l'alarme (état d'acquittement de sa ligne) et sa famille ; une alarme d'état allumée en ambre est blanche.
        const alarms=[...doc.querySelectorAll('.al.red,.al.amber')].map(e=>{const red=e.classList.contains('red'),o=onset[e.id],since=o&&o.etat===(red?'red':'amber')&&Number.isFinite(o.t)?o.t:S.t;return {id:e.id,time:stamp(since),origin:'PROTECTION',message:e.textContent.trim(),color:APP.familleAlarme(e.id,red?'rouge':'orange')};});
        const journal=[...doc.querySelectorAll('#log > div')].slice(0,80).map(e=>({time:e.textContent.slice(0,10),origin:'TRANCHE',message:e.textContent.slice(10).trim(),color:e.classList.contains('red')?'rouge':e.classList.contains('amber')?'jaune':'blanche'}));
        // Température vapeur sortie GV : la lecture que le châssis affiche (saturation, 1 °C), sans recopier sa loi (H06).
        const steamTemperature=Number.parseFloat(doc.getElementById('sTvap')?.textContent);
        const snap=SDCN4Adaptateur.snapshot(S,win.__PALIERS[palier],{alarms,journal,steamTemperature,mission:win.__missionEtat?.()||null,follow:!!(win.CNPE&&win.CNPE.follow),liaison:liaison()});
        // J3 (passe 3) : ligne du guide (mode facile allumé) et lexique du palier pour l'encart ; le lexique est le même tableau
        // d'un rafraîchissement à l'autre (lecture seule, aucune copie).
        snap.guide=win.__guideEtat?.()||'';snap.lexique=win.__lexique?.()||null;snap.guideNiveau=win.__guideNiveau?.()||'indices';
        debriefSuivre(S,snap,journal);mcPoser();if(snap.mission)atteindre(snap.mission.parcours&&snap.mission.parcours!=='principal'?snap.mission.principal:snap.mission.index);guideEffet();carnetMonter();listeMonter();
        pqSuivre(snap.mission);snap.premierQuart=pq&&pq.etape!=='fini'?{etape:pq.etape,palier,resultats:pq.resultats||{}}:null;
        // Salles 900 et 1300 (J2b), postes N4 et EPR (21A du 13/10) : toutes les verrines du tableau d'alarmes (allumées ou non) pour le
        // cycle d'acquittement ; salles seules : relevés de l'enregistreur du châssis pour les enregistreurs, groupes et grappes vus par
        // le châssis (lecture seule).
        snap.verrines=[...doc.querySelectorAll('.al')].map(e=>({id:e.id,txt:e.textContent.trim(),etat:e.classList.contains('red')?'rouge':e.classList.contains('amber')?'orange':''}));
        // Un écart d'échantillonnage anormal (absence, page cachée) se trace en trou : une ligne inconnue, jamais une droite inventée.
        const trou=Number.isFinite(lastSample)&&S.t-lastSample>Math.max(10,3*(S.accel||1));if(trou&&salle){enrTrous.push({a:lastSample,b:S.t});if(enrTrous.length>50)enrTrous.shift();}
        if(salle){try{snap.enregistreur=enrDonnees(S);}catch(_){snap.enregistreur=null;}if(horloge()-enrEcrit>=5000){enrEcrit=horloge();enrGarder();}}
        // Groupes et grappes vus par le châssis, salles et postes N4/EPR (coup de propre du 04/10 : écran RGL et carte des grappes).
        try{snap.grappes=typeof win.__grappes==='function'?win.__grappes():null;}catch(_){snap.grappes=null;}
        if(S.t-lastSample>=1){for(const [k,a] of Object.entries(histories)){if(trou)a.push(k==='t'?(lastSample+S.t)/2:null);a.push(k==='t'?S.t:APP.curveValue(snap,k));while(a.length>300)a.shift();}lastSample=S.t;if(horloge()-courbesEcrites>=5000){courbesEcrites=horloge();courbesGarder();}}
        snap.histories=Object.fromEntries(Object.entries(histories).map(([k,a])=>[k,a.slice()]));
        Object.assign(snap,{pressureHistory:snap.histories.pressurePrimary,temperatureHistory:snap.histories.tempAverage,powerHistory:snap.histories.powerThermal});
        return snap;
      }
      // 2.17.0e (N3, N6) : une erreur d'affichage ne fige plus le poste en silence ni ne se fait passer pour une perte de liaison.
      // Le détail technique va à la console et à data-engine-error ; le joueur lit un message clair et peut recharger le poste.
      let alerte=null;const vues=new Set();
      function erreurAffichage(e){host.setAttribute('data-engine-error',String(e));const k=String(e&&e.message||e);if(!vues.has(k)){vues.add(k);console.error(e);}
        if(alerte)return;alerte=document.createElement('div');alerte.className='n4-alerte-poste';alerte.setAttribute('role','alert');
        const t=document.createElement('p');t.textContent='Affichage '+(salle?'de la salle':'du poste')+' interrompu par une erreur : les valeurs ne se mettent plus à jour. Ta tranche continue sur le serveur.';
        const b=document.createElement('button');b.type='button';b.textContent=salle?'Recharger la salle':'Recharger le poste';b.onclick=()=>location.reload();alerte.append(t,b);host.before(alerte);}
      function rafraichir(){try{poste.update(snapshot());if(alerte){alerte.remove();alerte=null;host.removeAttribute('data-engine-error');}return true;}catch(e){erreurAffichage(e);return false;}}
      // Quitter la tranche : gestes maintenus arrêtés et confirmés par le serveur, puis poste détruit.
      let parti=false;
      async function quitter(){courbesGarder();enrGarder();if(transport){parti=true;try{win.CNPE?.quitterPupitre?.('poste',true);}catch(_){}const r=await transport.dispatch({type:'set',k:'bori',v:false,...(sim.S.ihm===false?{poste:'secours'}:{})});if(!r.ok)throw Error(r.motif);if(sim.S.dilu){const d=await transport.dispatch({type:'set',k:'dilu',v:false,...(sim.S.ihm===false?{poste:'secours'}:{})});if(!d.ok)throw Error(d.motif);}}closeNative();memo();poste.destroy();}
      // Dans la coquille privée, retour à la carte de France ou au CNPE de la tranche par message au parent.
      // Après confirmation seulement : écran neutre à la place du poste, jamais le châssis ni un module natif (H02).
      let depart=null,echecs=0;
      // J1 (J1-8) : après un premier refus, un second clic quitte quand même ; le bail serveur éteint seul un geste maintenu.
      // Fusion 2.17.0e : du motif (déjà rédigé pour le joueur par le transport) on ne garde que la première phrase, sans point doublé.
      const retour=transport&&window.parent!==window?vue=>depart||(depart=(async()=>{try{if(echecs>=1){parti=true;try{win.CNPE?.quitterPupitre?.('poste',true);}catch(_){}closeNative();memo();poste.destroy();}else await quitter();}catch(e){depart=null;echecs++;return {ok:false,motif:'Retour suspendu ('+String(e&&e.message||'commande non confirmée').split(/\.\s/)[0].replace(/\.$/,'').replace(/^./,c=>c.toLowerCase())+'). Clique encore pour quitter quand même : le serveur relâche de lui-même un geste maintenu après 2 s.'};}
        const attente=document.createElement('p');attente.id='n4-loading';attente.setAttribute('role','status');attente.textContent=vue==='cnpe'?'Retour à la centrale…':'Retour à la carte de France…';host.replaceChildren(attente);
        window.parent.postMessage({type:'sdc-retour',vue:vue==='cnpe'?'cnpe':'france',site:config.site,unit:config.unit},location.origin);return {ok:true};})()):undefined;
      // Geste 50 (136A du 25/10) : la version du bandeau est celle que le châssis affiche (verTag d'index.html, aligné par release.py sur le CACHE
      // de sw.js), lue comme la carte de France ; aucun numéro écrit ici.
      const version=(doc.getElementById('verTag')?.textContent||'').split('·')[0].trim();
      poste=APP.mount(host,{published:config.published===true,version,site:config.site||DEF.site,unit:config.unit||DEF.unit,unitLabel:win.CNPE&&win.CNPE.ULAB?win.CNPE.ULAB(config.site||DEF.site,config.unit||DEF.unit):config.unit||DEF.unit,snapshot:snapshot(),onNavigate:retour,synthesis:SDCN4Preferences.read(storage,palier),onPageMount:mountInline,onSynthesisChange:choices=>SDCN4Preferences.write(storage,choices,palier),curves:SDCN4Preferences.readCurves(storage,palier),onCurvesChange:choices=>SDCN4Preferences.writeCurves(storage,choices,palier),missionOpen:ouvert,onMissionOpen:o=>{ouvert=o;memo();},
        // Arrêt du parcours : bouton MISSIONS du châssis (état local, journal), jamais le transport de conduite.
        // 2.17.0e (N2) : « Passer à la mission suivante » depuis l'encart, par le bouton PASSER LA MISSION de la page Aide & missions.
        // J3 (passe 4, 2A) : niveau du Guide choisi dans l'encart, posé par le moteur du châssis (préférence du navigateur), sans commande.
        onCvp:action=>{if(action==='lu'&&aLire.length){aLire.shift();rafraichir();return {ok:true};}return {ok:false};},
        onPremierQuart:action=>{if(!pq)return {ok:false};
          if(action==='suivant'&&pq.etape>=1&&pq.etape<3)pq.etape++;
          else if(action==='accueil-fin'&&pq.etape>=1&&pq.etape<=3){pq.etape='missions';const m=win.__missionEtat?.();pq.dernier=m?{index:m.index,id:m.id,titre:m.titre}:null;ouvert=true;poste?.setMissionOpen?.(true);}
          else if(action==='continuer'&&pq.etape==='bilan')pq.etape='fini';
          else if(action==='libre'&&pq.etape==='bilan'){pq.etape='fini';if(sim.S.mis)doc.getElementById('bMis')?.onclick?.();}
          else return {ok:false};
          pqEcrire();memo();rafraichir();return {ok:true};},
        onGuide:niveau=>{const ok=!!win.__guidePoser?.(niveau);rafraichir();return {ok,motif:'Guide non changé'};},
        // J3 (passe 6) : la réponse à la question de prévision, gardée par le châssis pour la tentative en cours.
        onPrevoir:i=>{const ok=!!win.__missionPrevoir?.(i);rafraichir();return {ok,motif:'Le geste est déjà fait : la prévision ne change plus.'};},
        onMission:action=>{if(action==='stop'){const m=win.__missionEtat?.();if(m&&m.actif&&!m.termine&&!m.reussie){carnet.push({type:'annulee',id:m.id,titre:m.titre,t:sim.S.t,quand:Date.now()});carnetEcrire();}
            if(sim.S.mis)doc.getElementById('bMis')?.onclick?.();memo();rafraichir();return {ok:!sim.S.mis,motif:'Arrêt du parcours non confirmé'};}
          // J3 (passe 6, 5A) : nouvelle tentative de la mission en cours, nouveaux relevés ; la tranche reste telle qu'elle est.
          if(action==='recommencer'){const m=win.__missionEtat?.();if(m&&(m.parcours==='incidents'||m.parcours==='histoire')){const r=incidentLancer(m.index,'incidentRecommence',m.parcours);rafraichir();return {ok:r.ok,mission:win.__missionEtat?.(),motif:r.motif||'Nouvelle tentative non confirmée'};}
            const ok=!!m&&!m.termine&&missionPoser(m.index,'recommencee');rafraichir();return {ok,mission:win.__missionEtat?.(),motif:'Nouvelle tentative non confirmée'};}
          if(action==='next'){const m0=win.__missionEtat?.();if(!m0||!m0.actif||m0.termine)return {ok:false,motif:'Aucune mission en cours'};doc.getElementById('bMSkip')?.onclick?.();const m1=win.__missionEtat?.();memo();rafraichir();
            if(m0.parcours&&m0.parcours!=='principal')return m1&&m1.parcours==='principal'?{ok:true,mission:m1}:{ok:false,motif:'Retour au parcours non confirmé'};
            return m1&&m1.index===m0.index+1?{ok:true,mission:m1}:{ok:false,motif:'Passage à la mission suivante non confirmé'};}
          return {ok:false,motif:'Action inconnue'};},onCommand:async command=>{const result=transport?await transport.dispatch(command):SDCN4Adaptateur.dispatch(sim,doc,command);if(command.type==='incident'&&command.id==='iReset'&&result?.ok&&win.__missionPoser)win.__missionPoser(aGarder(win.__missionEtat()));if(sim.S.ihm===false&&activeKind!=='formation')closeNative();rafraichir();return result;}});
      // J1 (1A) : bilan de l'absence au retour sur cette tranche, lu une fois puis oublié.
      try{const bilan=win.CNPE?.bilanAbsence?.(siteId+'|'+unitId);if(bilan){const r=document.createElement('div');r.className='n4-retour';r.setAttribute('role','status');r.innerHTML='<span>'+bilan.html+'</span><button type="button">Compris</button>';r.querySelector('button').onclick=()=>r.remove();host.before(r);}}catch(e){}
      // Salles (J2b) : quitter la page sans « ‹ Centrale » (Retour du navigateur) ramène aussi la tranche à ×1 et note le bilan d'absence.
      window.addEventListener('pagehide',courbesGarder);window.addEventListener('pagehide',enrGarder);
      if(salle&&transport)window.addEventListener('pagehide',()=>{if(parti)return;parti=true;try{win.CNPE?.quitterPupitre?.('poste',true);}catch(_){}});
      window.revueSDC=window.revueN4=poste;signalerPret();window.essaiSDC=window.essaiN4={sim,document:doc,snapshot,prepareLeave:quitter,dispatch:command=>transport?transport.dispatch(command):SDCN4Adaptateur.dispatch(sim,doc,command)};
      // Même pas fixe que le moteur/serveur. Le navigateur peut ralentir cet essai en arrière-plan.
      timer=setInterval(()=>{try{for(let i=0;!transport&&i<sim.S.accel;i++){sim.physStep(.05);sim.slowStep(.05);sim.trips();if(sim.recTick)sim.recTick();}}catch(e){clearInterval(timer);erreurAffichage(e);return;}
        if(horloge()-lastRender>=1000){lastRender=horloge();try{if(sim.S.ihm===false&&!frame.hidden&&activeKind!=='formation')closeNative();}catch(_){}if(rafraichir()){memo();queueLayout();}}},50);
    }catch(e){console.error(e);host.setAttribute('data-engine-error',String(e));
      // 2.17.0e (N3) : jamais le message technique brut ; une issue visible (Réessayer, ‹ France).
      const reseau=/Liaison au poste indisponible|Prise de quart refusée|état de la tranche non reçu|Failed to fetch|Load failed|NetworkError|fetch failed|délai/.test(String(e&&e.message));
      const motif=document.createElement('p');motif.id='n4-loading';motif.setAttribute('role','status');
      motif.textContent=reseau?(salle?'La salle':'Le poste')+' ne peut pas s’ouvrir : le moteur de SIMUREP ne répond pas (liaison réseau). Ta tranche est conservée sur le serveur ; réessaie dans un instant.'
        :(salle?'La salle':'Le poste')+' n’a pas pu s’ouvrir à cause d’une erreur interne. Ta tranche continue sur le serveur ; réessaie, ou reviens à la carte.';
      host.replaceChildren(motif);reessayer();sortie();signalerPret();}
  }
  // L’enveloppe publique garde son écran d’attente jusqu’au poste monté (ou à son échec lisible).
  function signalerPret(){if(window.parent!==window)window.parent.postMessage({type:'sdc-pret'},location.origin);}
  function reessayer(){const b=document.createElement('button');b.type='button';b.id='n4-reessayer';b.textContent='Réessayer';b.onclick=()=>location.reload();host.appendChild(b);}
  // Poste non monté : seule sortie vers la carte (l’enveloppe n’a plus de barre) ; aucun geste n’a pu être tenu.
  function sortie(){if(window.parent===window)return;const b=document.createElement('button');b.type='button';b.id='n4-sortie';b.textContent='‹ France';b.onclick=()=>window.parent.postMessage({type:'sdc-retour',vue:'france'},location.origin);host.appendChild(b);}
  frame.addEventListener('load',boot);
  if(frame.contentDocument&&frame.contentDocument.readyState==='complete'&&frame.contentWindow.__sim)boot();
  window.addEventListener('pagehide',()=>{if(timer)clearInterval(timer);if(cleanupInline)cleanupInline();});
})();
