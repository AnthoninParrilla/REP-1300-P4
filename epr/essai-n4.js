// SIMUREP — © 2026 AnthoninP. Banc visuel privé : moteur réel en iframe isolée.
(function(){
  'use strict';
  const config=window.SDC_PRIVATE||{},palier=config.palier||'N4',epr=palier==='EPR';
  const frame=document.getElementById('n4-engine'),host=document.getElementById('n4-root');
  let timer=null,poste=null,cleanupInline=null;
  async function boot(){
    if(timer)clearInterval(timer);if(poste)poste.destroy();if(cleanupInline)cleanupInline();
    frame.hidden=true;frame.style.cssText='';
    try{
      const win=frame.contentWindow,doc=win.document,sim=win.__sim;
      if(!sim)throw Error('état de la tranche non reçu');
      const transport=config.transport?await SDCTransportPrive.connect(win,config):null;
      // Ordre de la prise de quart : palier, source froide du site (saison et température), puis point de fonctionnement.
      if(!transport){if(!win.__setPalier(palier))throw Error('Palier privé indisponible');
        const unit=config.unit||(epr?3:1),base=(win.__SITES||[]).find(s=>s.n===(config.site||(epr?'Flamanville':'Civaux'))),site=base&&win.CNPE.unitSite?win.CNPE.unitSite(base,unit):base;
        if(!site||!win.CNPE.initSource(site,unit))throw Error('Source froide du site indisponible');
        sim.initOperatingPoint(win.__PALIERS[palier].PEL,'RP');sim.S.accel=1;}
      // H18 : progression de mission mémorisée pour cette tranche, restituée après la prise de quart (même parcours) ;
      // l’état vit dans le châssis (S.mis, S.mIdx : clés locales jamais écrasées par le serveur).
      let storage;try{storage=window.localStorage;}catch(e){}
      const siteId=config.site||(epr?'Flamanville':'Civaux'),unitId=config.unit||(epr?3:1),m0=SDCN4Preferences.readMission?.(storage,palier,siteId,unitId);
      if(m0&&win.__missionPoser)win.__missionPoser(m0);
      let memoire=m0?JSON.stringify(m0):'',ouvert=m0?.ouvert===true;
      // Mission réussie pendant son bravo (9 s) : c’est la suivante qui est mémorisée ; quitter ou réinitialiser ne la fait pas refaire.
      const aGarder=m=>({actif:m.actif,index:m.reussie?Math.min(m.index+1,m.total):m.index,total:m.total});
      const memo=()=>{const m=win.__missionEtat?.();if(!m||!m.total)return;const v={...aGarder(m),ouvert},j=JSON.stringify(v);if(j!==memoire&&SDCN4Preferences.writeMission?.(storage,palier,siteId,unitId,v))memoire=j;};
      sim.render();
      const note=doc.getElementById('rGNote');if(note)note.textContent='Le groupe R représente seul la régulation neutronique (modes X et T simplifiés).';
      const label=doc.getElementById('rGLabel');if(label)label.textContent='Autres groupes de grappes';
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
        #n4-native-root #coreGrid{min-width:0!important;width:100%;max-width:min(100%,520px,max(260px,calc(var(--n4-vue-h,9999px) - 150px)))!important;gap:1px!important;margin:6px auto!important}#n4-native-root #coreGrid>[data-picked]{outline:3px solid #faf2b8!important;outline-offset:-3px}#n4-native-root #coreGrid>:focus-visible{outline:3px solid #fff!important}#n4-native-root #coreDetail{background:#152c2a;color:#e4f5de;padding:6px 8px;margin:6px 0;min-height:calc(2*1.35em + 12px)!important;font-size:13px!important;line-height:1.35;border:1px solid #6a9585}
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
        @media(max-width:600px){#n4-native-root #coreDetail{min-height:calc(3*1.35em + 12px)!important}#n4-native-root #coreGrid>[data-picked]{outline-width:2px!important;outline-offset:-2px!important}body.n4-native{padding:8px!important}#n4-native-root .card{padding:10px!important}#n4-native-root .row>label{min-width:0;flex:1 1 145px}#n4-native-root details.n4-rec-voies #recSel{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
        @media(max-width:420px){#n4-native-root #coreDetail{min-height:calc(4*1.35em + 12px)!important}}
      `;
      // Palette EPR distincte ; les styles N4 restent strictement identiques.
      if(epr){const light={'#10181b':'#f1f5f6','#dce7e5':'#294754','#172428':'#e5edf1','#a1b6b9':'#526e7b','#486066':'#afc0c8','#10191d':'#f1f5f6','#081115':'#fff','#344e53':'#b2c6cf','#203037':'#dce7ec','#405860':'#a5bbc6','#a8cbd1':'#375b70','#b2c3c5':'#4c6978','#22383d':'#e1eaf0','#e1eeee':'#2b4c5d','#577078':'#9aafbc','#3a6355':'#c4ddce','#89b6a2':'#6b9a82','#152c2a':'#e1eee6','#e4f5de':'#2c5240','#101b20':'#edf3f6','#3b555e':'#a4bac6','#d0e4e9':'#345767','#0a151a':'#f7fafb','#15262e':'#dce8ee','#b9e7f1':'#245a74','#b9d9e1':'#375b6c','#c6e4e8':'#315f72','#a6d6df':'#275d77'};skin.textContent=skin.textContent.replace(/#[0-9a-f]{6}/g,c=>light[c]||c);skin.textContent+="#n4-native-root summary,#n4-native-root a{color:#255d78!important}#n4-native-root summary{min-height:44px;display:flex;align-items:center}";}
      if(epr)skin.textContent+=`
        #n4-native-root #sockSvg{background:#f1f5f6!important;border:1px solid #afc0c8}
        #n4-native-root #sockSvg .skLbl{fill:#526e7b}
        #n4-native-root #sockSvg .skT{fill:#285d77}
        #n4-native-root #sockSvg .skZ{fill:#bcded2;fill-opacity:.55;stroke:#39806a}
        #n4-native-root #sockSvg .skC{stroke:#829aaa}
        #n4-native-root #sockSvg line[stroke="#1c2e20"]{stroke:#ccd8df}
        #n4-native-root #sockSvg [stroke="#8fd18f"],#n4-native-root #sockSvg [stroke="#8fd89a"]{stroke:#39806a}
        #n4-native-root #skTrail{stroke:#aa6419}
        #n4-native-root #skPt{stroke:#f1f5f6}
        #n4-native-root #skPt[fill="#8fd18f"]{fill:#28745a}
        #n4-native-root #skPt[fill="#e04438"]{fill:#bf3028}
        #n4-native-root #skVal[fill="#e8e0c8"]{fill:#285d77}
        #n4-native-root #skVal[fill="#ffb3ac"]{fill:#ad2924}
      `;
      doc.head.appendChild(skin);
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
      const ACCUEIL='Active MISSIONS pour le parcours guidé (16 missions) ou MODE FACILE pour l’analyse d’état. Les vitesses ×60 et ×300 sont dans le volet « Simulation », en haut du poste.';
      function accueil(){const a=doc.getElementById('easyMsg');if(a&&activeKind==='formation'&&!sim.S.easy&&!sim.S.mis&&a.textContent!==ACCUEIL)a.textContent=ACCUEIL;}
      const nativeTitles={instrumentation:'RPN · RIC · KRT · Bilan de réactivité',coeur:'Carte du cœur '+palier,pt:'Domaine pression / température',formation:'Formation · Missions · Lexique',enregistreur:'Enregistreur'};
      function mountInline(page,slot){
        const kind=page==='tendances'?'enregistreur':page;
        if(!slot||!Object.hasOwn(nativeTitles,kind)){closeNative();return {ok:true};}
        activeSlot=slot;
        if(activeKind===kind){queueLayout();return {ok:true};}
        if(sim.S.ihm===false){closeNative();return {ok:false,motif:epr?'MCP indisponible : utiliser le MCS':'KIC indisponible : utiliser le panneau auxiliaire'};}
        if(!Object.hasOwn(nativeTitles,kind))return {ok:false,motif:'Écran non disponible'};
        restoreNative();activeKind=kind;nativeRoot.dataset.kind=kind;doc.body.classList.add('n4-native');
        const byId=id=>doc.getElementById(id),card=id=>{const e=byId(id);return e&&e.closest('.card');};
        if(kind==='instrumentation'){move(card('rpnP'));move(card('krtP'));move(card('rRod'));}
        if(kind==='coeur'){
          move(byId('coreModal'));if(core)core.click();if(epr){const explanation=doc.createElement('p');explanation.textContent='EPR · 241 assemblages · disposition pédagogique, pas un plan de chargement.';nativeRoot.prepend(explanation);}
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
        if(kind==='formation'){['bEasy','bMis','easyCard','easyLex'].forEach(id=>move(byId(id)));byId('easyLex')?.classList.add('on');accueil();}
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
      const APP=epr?SDCEPR:SDCN4,histories=Object.fromEntries(['t',...Object.keys(APP.CURVE_METRICS)].map(k=>[k,[]]));
      let lastSample=-Infinity,lastRender=0,liaisonKo=0;
      // 2.17.0e (N6) : liaison lue sur le témoin du châssis caché ; perdue seulement si l'échec dure 3 s (un refus de commande
      // isolé allume brièvement « commande non confirmée » sans que la liaison soit perdue).
      function liaison(){const dot=doc.getElementById('srvDot');if(!dot)return null;const texte=dot.textContent.replace(/^●\s*/,''),ko=/injoignable|satur|non confirm/.test(texte);
        if(!ko)liaisonKo=0;else if(!liaisonKo)liaisonKo=Date.now();return {ok:!(ko&&Date.now()-liaisonKo>=3000),texte};}
      const stamp=t=>'T+'+Math.floor(t/3600).toString().padStart(2,'0')+':'+Math.floor(t/60%60).toString().padStart(2,'0')+':'+Math.floor(t%60).toString().padStart(2,'0');
      function snapshot(){
        sim.render();if(activeKind==='enregistreur')sim.recRender();accueil();const S=sim.S;
        if(S.t<lastSample){Object.values(histories).forEach(a=>a.length=0);lastSample=-Infinity;}
        // Heure d'apparition datée au pas moteur (local ou serveur), pas l'heure du rafraîchissement.
        const onset=typeof sim.alarmes==='function'?sim.alarmes()||{}:{};
        const alarms=[...doc.querySelectorAll('.al.red,.al.amber')].map(e=>{const red=e.classList.contains('red'),o=onset[e.id],since=o&&o.etat===(red?'red':'amber')&&Number.isFinite(o.t)?o.t:S.t;return {time:stamp(since),origin:'PROTECTION',message:e.textContent.trim(),color:red?'rouge':'jaune'};});
        const journal=[...doc.querySelectorAll('#log > div')].slice(0,80).map(e=>({time:e.textContent.slice(0,10),origin:'TRANCHE',message:e.textContent.slice(10).trim(),color:e.classList.contains('red')?'rouge':e.classList.contains('amber')?'jaune':'blanche'}));
        // Température vapeur sortie GV : la lecture que le châssis affiche (saturation, 1 °C), sans recopier sa loi (H06).
        const steamTemperature=Number.parseFloat(doc.getElementById('sTvap')?.textContent);
        const snap=SDCN4Adaptateur.snapshot(S,win.__PALIERS[palier],{alarms,journal,steamTemperature,mission:win.__missionEtat?.()||null,liaison:liaison()});
        if(S.t-lastSample>=1){lastSample=S.t;for(const [k,a] of Object.entries(histories)){a.push(k==='t'?S.t:APP.curveValue(snap,k));if(a.length>300)a.shift();}}
        snap.histories=Object.fromEntries(Object.entries(histories).map(([k,a])=>[k,a.slice()]));
        Object.assign(snap,{pressureHistory:snap.histories.pressurePrimary,temperatureHistory:snap.histories.tempAverage,powerHistory:snap.histories.powerThermal});
        return snap;
      }
      // 2.17.0e (N3, N6) : une erreur d'affichage ne fige plus le poste en silence ni ne se fait passer pour une perte de liaison.
      // Le détail technique va à la console et à data-engine-error ; le joueur lit un message clair et peut recharger le poste.
      let alerte=null;const vues=new Set();
      function erreurAffichage(e){host.setAttribute('data-engine-error',String(e));const k=String(e&&e.message||e);if(!vues.has(k)){vues.add(k);console.error(e);}
        if(alerte)return;alerte=document.createElement('div');alerte.className='n4-alerte-poste';alerte.setAttribute('role','alert');
        const t=document.createElement('p');t.textContent='Affichage du poste interrompu par une erreur : les valeurs ne se mettent plus à jour. Ta tranche continue sur le serveur.';
        const b=document.createElement('button');b.type='button';b.textContent='Recharger le poste';b.onclick=()=>location.reload();alerte.append(t,b);host.before(alerte);}
      function rafraichir(){try{poste.update(snapshot());if(alerte){alerte.remove();alerte=null;host.removeAttribute('data-engine-error');}return true;}catch(e){erreurAffichage(e);return false;}}
      // Quitter la tranche : gestes maintenus arrêtés et confirmés par le serveur, puis poste détruit.
      async function quitter(){if(transport){const r=await transport.dispatch({type:'set',k:'bori',v:false,...(sim.S.ihm===false?{poste:'secours'}:{})});if(!r.ok)throw Error(r.motif);if(sim.S.dilu){const d=await transport.dispatch({type:'set',k:'dilu',v:false,...(sim.S.ihm===false?{poste:'secours'}:{})});if(!d.ok)throw Error(d.motif);}}closeNative();memo();poste.destroy();}
      // Dans la coquille privée, retour à la carte de France ou au CNPE de la tranche par message au parent.
      // Après confirmation seulement : écran neutre à la place du poste, jamais le châssis ni un module natif (H02).
      let depart=null;
      const retour=transport&&window.parent!==window?vue=>depart||(depart=(async()=>{try{await quitter();}catch(e){depart=null;return {ok:false,motif:'Retour suspendu : '+e.message};}
        const attente=document.createElement('p');attente.id='n4-loading';attente.setAttribute('role','status');attente.textContent=vue==='cnpe'?'Retour au CNPE…':'Retour à la carte de France…';host.replaceChildren(attente);
        window.parent.postMessage({type:'sdc-retour',vue:vue==='cnpe'?'cnpe':'france',site:config.site,unit:config.unit},location.origin);return {ok:true};})()):undefined;
      poste=APP.mount(host,{published:config.published===true,site:config.site||(epr?'Flamanville':'Civaux'),unit:config.unit||(epr?3:1),snapshot:snapshot(),onNavigate:retour,synthesis:SDCN4Preferences.read(storage,palier),onPageMount:mountInline,onSynthesisChange:choices=>SDCN4Preferences.write(storage,choices,palier),curves:SDCN4Preferences.readCurves(storage,palier),onCurvesChange:choices=>SDCN4Preferences.writeCurves(storage,choices,palier),missionOpen:ouvert,onMissionOpen:o=>{ouvert=o;memo();},
        // Arrêt du parcours : bouton MISSIONS du châssis (état local, journal), jamais le transport de conduite.
        // 2.17.0e (N2) : « Passer à la mission suivante » depuis l'encart, par le bouton PASSER LA MISSION de la page Aide & missions.
        onMission:action=>{if(action==='stop'){if(sim.S.mis)doc.getElementById('bMis')?.onclick?.();memo();rafraichir();return {ok:!sim.S.mis,motif:'Arrêt du parcours non confirmé'};}
          if(action==='next'){const m0=win.__missionEtat?.();if(!m0||!m0.actif||m0.termine)return {ok:false,motif:'Aucune mission en cours'};doc.getElementById('bMSkip')?.onclick?.();const m1=win.__missionEtat?.();memo();rafraichir();
            return m1&&m1.index===m0.index+1?{ok:true,mission:m1}:{ok:false,motif:'Passage à la mission suivante non confirmé'};}
          return {ok:false,motif:'Action inconnue'};},onCommand:async command=>{const result=transport?await transport.dispatch(command):SDCN4Adaptateur.dispatch(sim,doc,command);if(command.type==='incident'&&command.id==='iReset'&&result?.ok&&win.__missionPoser)win.__missionPoser(aGarder(win.__missionEtat()));if(sim.S.ihm===false)closeNative();rafraichir();return result;}});
      window.revueSDC=window.revueN4=poste;signalerPret();window.essaiSDC=window.essaiN4={sim,document:doc,snapshot,prepareLeave:quitter,dispatch:command=>transport?transport.dispatch(command):SDCN4Adaptateur.dispatch(sim,doc,command)};
      // Même pas fixe que le moteur/serveur. Le navigateur peut ralentir cet essai en arrière-plan.
      timer=setInterval(()=>{try{for(let i=0;!transport&&i<sim.S.accel;i++){sim.physStep(.05);sim.slowStep(.05);sim.trips();if(sim.recTick)sim.recTick();}}catch(e){clearInterval(timer);erreurAffichage(e);return;}
        if(Date.now()-lastRender>=1000){lastRender=Date.now();try{if(sim.S.ihm===false&&!frame.hidden)closeNative();}catch(_){}if(rafraichir()){memo();queueLayout();}}},50);
    }catch(e){console.error(e);host.setAttribute('data-engine-error',String(e));
      // 2.17.0e (N3) : jamais le message technique brut ; une issue visible (Réessayer, ‹ France).
      const reseau=/Liaison au poste indisponible|Prise de quart refusée|état de la tranche non reçu|Failed to fetch|Load failed|NetworkError|fetch failed|délai/.test(String(e&&e.message));
      const motif=document.createElement('p');motif.id='n4-loading';motif.setAttribute('role','status');
      motif.textContent=reseau?'Le poste ne peut pas s’ouvrir : le moteur de SIMUREP ne répond pas (liaison réseau). Ta tranche est conservée sur le serveur ; réessaie dans un instant.'
        :'Le poste n’a pas pu s’ouvrir à cause d’une erreur interne. Ta tranche continue sur le serveur ; réessaie, ou reviens à la carte.';
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
