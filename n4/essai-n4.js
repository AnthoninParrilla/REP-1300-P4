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
      if(!sim)throw Error('Moteur privé indisponible');
      const transport=config.transport?await SDCTransportPrive.connect(win,config):null;
      // Ordre de la prise de quart : palier, source froide du site (saison et température), puis point de fonctionnement.
      if(!transport){if(!win.__setPalier(palier))throw Error('Palier privé indisponible');
        const unit=config.unit||(epr?3:1),base=(win.__SITES||[]).find(s=>s.n===(config.site||(epr?'Flamanville':'Civaux'))),site=base&&win.CNPE.unitSite?win.CNPE.unitSite(base,unit):base;
        if(!site||!win.CNPE.initSource(site,unit))throw Error('Source froide du site indisponible');
        sim.initOperatingPoint(win.__PALIERS[palier].PEL,'RP');sim.S.accel=1;}
      sim.render();
      const note=doc.getElementById('rGNote');if(note)note.textContent='Le groupe R porte ici la régulation neutronique simulée.';
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
        #n4-native-root #coreGrid{min-width:660px;max-width:100%!important}#n4-native-root #coreGrid>*{min-height:48px}#n4-native-root #coreGrid>[data-picked]{outline:3px solid #faf2b8!important;outline-offset:-3px}#n4-native-root #coreGrid>:focus-visible{outline:3px solid #fff!important}#n4-native-root #coreDetail{position:sticky;top:0;z-index:2;background:#152c2a;color:#e4f5de;padding:12px;margin:8px 0;line-height:1.5;border:1px solid #6a9585}
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
        @media(max-width:600px){body.n4-native{padding:8px!important}#n4-native-root .card{padding:10px!important}#n4-native-root .row>label{min-width:0;flex:1 1 145px}#n4-native-root #recSel{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
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
      function restoreNative(){if(activeKind==='coeur'){const button=doc.getElementById('coreClose');if(button?.onclick)button.onclick();}while(moved.length){const [node,marker]=moved.pop();marker.replaceWith(node);}nativeRoot.replaceChildren();doc.body.classList.remove('n4-native');}
      function alignInline(){
        layoutPending=false;
        if(!activeSlot?.isConnected||frame.hidden)return;
        const rect=activeSlot.getBoundingClientRect();
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
      const nativeTitles={instrumentation:'RPN · RIC · KRT · Bilan de réactivité',coeur:'Carte du cœur '+palier,pt:'Domaine pression / température',formation:'Formation · Missions · Lexique',enregistreur:'Enregistreur'};
      function mountInline(page,slot){
        const kind=page==='tendances'?'enregistreur':page;
        if(!slot||!Object.hasOwn(nativeTitles,kind)){closeNative();return {ok:true};}
        activeSlot=slot;
        if(activeKind===kind){queueLayout();return {ok:true};}
        if(sim.S.ihm===false)return {ok:false,motif:epr?'MCP indisponible : utiliser le MCS':'KIC indisponible : utiliser le panneau auxiliaire'};
        if(!Object.hasOwn(nativeTitles,kind))return {ok:false,motif:'Écran non disponible'};
        restoreNative();activeKind=kind;nativeRoot.dataset.kind=kind;doc.body.classList.add('n4-native');
        const byId=id=>doc.getElementById(id),card=id=>{const e=byId(id);return e&&e.closest('.card');};
        if(kind==='instrumentation'){move(card('rpnP'));move(card('krtP'));move(card('rRod'));}
        if(kind==='coeur'){
          move(byId('coreModal'));if(core)core.click();if(epr){const explanation=doc.createElement('p');explanation.textContent='EPR · 241 assemblages · disposition pédagogique, pas un plan de chargement.';nativeRoot.prepend(explanation);}
          const grid=byId('coreGrid'),detail=byId('coreDetail');
          if(grid){const cols=Number(grid.style.gridTemplateColumns.match(/\d+/)?.[0])||17;grid.style.minWidth=(cols*52)+'px';
            [...grid.children].forEach((cell,i)=>{cell.setAttribute('role','button');cell.setAttribute('aria-label','Assemblage '+(i+1));cell.tabIndex=i===0?0:-1;});
            grid.onclick=e=>{const cell=e.target.closest('#coreGrid > div');if(!cell)return;grid.querySelectorAll('[data-picked]').forEach(n=>n.removeAttribute('data-picked'));cell.setAttribute('data-picked','true');[...grid.children].forEach(n=>n.tabIndex=n===cell?0:-1);};
            grid.onkeydown=e=>{const cells=[...grid.children],i=cells.indexOf(e.target);if(i<0)return;if(['Enter',' '].includes(e.key)){e.preventDefault();e.target.click();}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-cols,ArrowDown:cols}[e.key];cells[Math.max(0,Math.min(cells.length-1,i+delta))].focus();}};
            if(detail&&detail.parentElement===grid.parentElement){grid.before(detail);detail.setAttribute('role','status');}
          }
        }
        if(kind==='pt')move(byId('secSock'));
        if(kind==='formation'){['bEasy','bMis','easyCard','easyLex'].forEach(id=>move(byId(id)));byId('easyLex')?.classList.add('on');}
        if(kind==='enregistreur')move(card('recRun'));
        frame.hidden=false;frame.setAttribute('title',nativeTitles[kind]);frame.style.cssText='position:absolute;border:0;background:#10181b;z-index:2;box-sizing:border-box';
        sim.render();win.scrollTo(0,0);queueLayout();return {ok:true};
      }
      // Conserver les fonctions natives dans leur document d'origine préserve leurs événements
      // et toutes les recherches par identifiant du moteur, sans recharger l'iframe.
      if(core)core.addEventListener('click',function(){if(activeKind&&activeKind!=='coeur')poste.selectPage('coeur');});
      const history={pressureHistory:[],temperatureHistory:[],powerHistory:[]};
      let lastSample=-Infinity,lastRender=0;
      const stamp=t=>'T+'+Math.floor(t/3600).toString().padStart(2,'0')+':'+Math.floor(t/60%60).toString().padStart(2,'0')+':'+Math.floor(t%60).toString().padStart(2,'0');
      function snapshot(){
        sim.render();if(activeKind==='enregistreur')sim.recRender();const S=sim.S;
        if(S.t<lastSample){Object.values(history).forEach(a=>a.length=0);lastSample=-Infinity;}
        if(S.t-lastSample>=1){lastSample=S.t;history.pressureHistory.push(S.Ppzr);history.temperatureHistory.push(S.Tavg);history.powerHistory.push(S.Ptot*win.__PALIERS[palier].PTH);Object.values(history).forEach(a=>{if(a.length>300)a.shift();});}
        // Heure d'apparition datée au pas moteur (local ou serveur), pas l'heure du rafraîchissement.
        const onset=typeof sim.alarmes==='function'?sim.alarmes()||{}:{};
        const alarms=[...doc.querySelectorAll('.al.red,.al.amber')].map(e=>{const red=e.classList.contains('red'),o=onset[e.id],since=o&&o.etat===(red?'red':'amber')&&Number.isFinite(o.t)?o.t:S.t;return {time:stamp(since),origin:'PROTECTION',message:e.textContent.trim(),color:red?'rouge':'jaune'};});
        const journal=[...doc.querySelectorAll('#log > div')].slice(0,80).map(e=>({time:e.textContent.slice(0,10),origin:'TRANCHE',message:e.textContent.slice(10).trim(),color:e.classList.contains('red')?'rouge':e.classList.contains('amber')?'jaune':'blanche'}));
        return SDCN4Adaptateur.snapshot(S,win.__PALIERS[palier],Object.assign({alarms,journal},history));
      }
      let storage;try{storage=window.localStorage;}catch(e){}
      // Quitter la tranche : gestes maintenus arrêtés et confirmés par le serveur, puis poste détruit.
      async function quitter(){if(transport){const r=await transport.dispatch({type:'set',k:'bori',v:false,...(sim.S.ihm===false?{poste:'secours'}:{})});if(!r.ok)throw Error(r.motif);if(sim.S.dilu){const d=await transport.dispatch({type:'set',k:'dilu',v:false});if(!d.ok)throw Error(d.motif);}}poste.destroy();}
      // Dans la coquille privée, retour à la carte de France ou au CNPE de la tranche par message au parent.
      const retour=transport&&window.parent!==window?async vue=>{try{await quitter();}catch(e){return {ok:false,motif:'Retour suspendu : '+e.message};}
        window.parent.postMessage({type:'sdc-retour',vue:vue==='cnpe'?'cnpe':'france',site:config.site,unit:config.unit},location.origin);return {ok:true};}:undefined;
      poste=(epr?SDCEPR:SDCN4).mount(host,{published:config.published===true,site:config.site||(epr?'Flamanville':'Civaux'),unit:config.unit||(epr?3:1),snapshot:snapshot(),onNavigate:retour,synthesis:SDCN4Preferences.read(storage,palier),onPageMount:mountInline,onSynthesisChange:choices=>SDCN4Preferences.write(storage,choices,palier),onCommand:async command=>{const result=transport?await transport.dispatch(command):SDCN4Adaptateur.dispatch(sim,doc,command);if(sim.S.ihm===false)closeNative();poste.update(snapshot());return result;}});
      window.revueSDC=window.revueN4=poste;window.essaiSDC=window.essaiN4={sim,document:doc,snapshot,prepareLeave:quitter,dispatch:command=>transport?transport.dispatch(command):SDCN4Adaptateur.dispatch(sim,doc,command)};
      // Même pas fixe que le moteur/serveur. Le navigateur peut ralentir cet essai en arrière-plan.
      timer=setInterval(()=>{try{for(let i=0;!transport&&i<sim.S.accel;i++){sim.physStep(.05);sim.slowStep(.05);sim.trips();if(sim.recTick)sim.recTick();}if(Date.now()-lastRender>=1000){lastRender=Date.now();if(sim.S.ihm===false&&!frame.hidden)closeNative();poste.update(snapshot());queueLayout();}}catch(e){clearInterval(timer);host.setAttribute('data-engine-error',String(e));console.error(e);}},50);
    }catch(e){host.textContent='Initialisation impossible : '+e.message;console.error(e);}
  }
  frame.addEventListener('load',boot);
  if(frame.contentDocument&&frame.contentDocument.readyState==='complete'&&frame.contentWindow.__sim)boot();
  window.addEventListener('pagehide',()=>{if(timer)clearInterval(timer);if(cleanupInline)cleanupInline();});
})();
