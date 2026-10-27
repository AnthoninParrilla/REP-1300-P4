// SIMUREP — © 2026 AnthoninP — Tous droits réservés. Enregistreurs numériques de la salle du 1300 (J2b), dessin seul.
// Grand QCM de la nuit du 03/10, réponse 16 (A, B à défaut) : un enregistreur numérique par panneau, au fonctionnement d'un enregistreur
// numérique de salle (appareil de référence de la veille V11, sans marque réelle : « SIMUREP » sur la façade, comme l'enregistreur du
// 900), voies préréglées parmi les 27 relevés du châssis et modifiables, vues courbes, valeurs et barres, fenêtres de 1 min, 10 min,
// 1 h et 6 h, historique et « Revenir au direct ». Planche 1, repère 6 : appareils carrés, écran, cadre noir. Format unique carré
// (04/10 : « je préfère un format d'enregistreur unique carré ; il en existe des plus grands mais ils sont toujours carrés ») : cadran
// carré, logé dans une plaque du panneau comme un organe. Rendu réaliste (04/10, « l'enregistreur ne fait pas enregistreur ») :
// la façade suit l'appareil de référence de la veille (notice du fabricant, § 19 de la matrice des SDC), sans marque réelle :
// boîtier noir carré, écran vitré en retrait au-dessus de quatre touches rondes et d'une molette (dessin seul) ; à l'écran, bandeau
// d'état bleu (nom, mode, heure), papier qui défile verticalement (le plus récent en haut, index des plumes sur l'échelle haute),
// valeurs dans des cases de la couleur de leur plume, barre de touches de l'écran en bas et menus contextuels bleus. Tout se lit
// dans les relevés reçus (pas de 10 s du châssis) ; aucune commande au moteur : les gestes (data-s13-enr) ne changent que l'affichage.
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./instruments-900.js'));else root.SDC1300Enregistreur=factory(root.SDC900Instruments);})(typeof globalThis!=='undefined'?globalThis:this,function(I){
'use strict';
const {esc,num}=I;
// Voies préréglées par panneau (choix) ; au plus six voies par appareil.
const PRESETS={barres:['pth','rod','cb','xe'],pressuriseur:['ppzr','thot','tcold','inv'],eauvapeur:['ngv','pgv','tare','basg'],turbo:['pe','adm','padm','pcond'],surete:['penc','inv','accu','ptr'],electricite:['pe','pcond','tbk']};
const MAXV=6,FENETRES=[[60,'1 min'],[600,'10 min'],[3600,'1 h'],[21600,'6 h']];
// Échelles configurées de l'appareil (choix d'affichage, pas des seuils) ; une voie sans échelle prend l'étendue de la fenêtre.
const ECHELLES={thot:[250,350],tcold:[250,350],ppzr:[100,180],pgv:[0,100],ngv:[0,100],tvap:[200,320],padm:[0,80],pcond:[0,200],tbk:[0,80],tare:[0,260],penc:[0,5],inv:[0,120],pth:[0,4000],pe:[0,1400],lvl:[0,100],h2:[0,10],rod:[0,100],cb:[0,2500],xe:[0,150],adm:[0,100],ptr:[0,100],basg:[0,100],accu:[0,100]};
// Plumes de l'appareil, sur fond clair comme l'écran de référence.
const PLUMES=['#e0261c','#1d9a33','#2850d8','#c4219f','#0b939f','#d97706'];
const VUES=[['courbes','Courbes'],['valeurs','Valeurs'],['barres','Barres']];
const NOMS={barres:'BARRES-FLUX',pressuriseur:'PRESSURISEUR',eauvapeur:'EAU-VAPEUR',turbo:'TURBOALTERNATEUR',surete:'SÛRETÉ',electricite:'ÉLECTRICITÉ'};
function etatNeuf(panneau){return {voies:(PRESETS[panneau]||['ppzr','thot']).slice(),vue:'courbes',fenetre:600,decalage:0,choix:false,menu:null};}
// Geste d'affichage : « vue:courbes », « fenetre:3600 », « voie:ppzr », « recul », « avance », « direct », « choix », « menu:vue » (menu contextuel
// de l'écran, refermé par tout autre geste).
function action(e,a,v){
  if(a==='menu'){e.menu=(v==='vue'||v==='fenetre')&&e.menu!==v?v:null;return true;}
  e.menu=null;
  if(a==='vue'&&['courbes','valeurs','barres'].includes(v)){e.vue=v;return true;}
  if(a==='fenetre'){const f=Number(v);if(FENETRES.some(([x])=>x===f)){e.fenetre=f;return true;}return false;}
  if(a==='voie'){const i=e.voies.indexOf(v);if(i>=0){if(e.voies.length>1)e.voies.splice(i,1);return true;}if(e.voies.length<MAXV){e.voies.push(v);return true;}return false;}
  if(a==='recul'){e.decalage=e.decalage+e.fenetre/2;return true;}
  if(a==='avance'){e.decalage=Math.max(0,e.decalage-e.fenetre/2);return true;}
  if(a==='direct'){e.decalage=0;return true;}
  if(a==='choix'){e.choix=!e.choix;return true;}
  return false;}
const TT=t=>Number.isFinite(t)?(t=Math.max(0,t),'T+'+String(Math.floor(t/3600)).padStart(2,'0')+':'+String(Math.floor(t/60%60)).padStart(2,'0')+':'+String(Math.floor(t%60)).padStart(2,'0')):'—';
function rendu(panneau,e,donnees){
  const V=donnees&&Array.isArray(donnees.voies)?donnees.voies:[],rows=donnees&&Array.isArray(donnees.rows)?donnees.rows.filter(r=>r&&Array.isArray(r.v)):[];
  const idx=Object.fromEntries(V.map((v,i)=>[v.id,i])),sel=e.voies.filter(id=>id in idx);
  const tDer=rows.length?rows[rows.length-1].t:null,maxDec=tDer===null?0:Math.max(0,tDer-(rows[0].t||0)-e.fenetre/2);if(e.decalage>maxDec)e.decalage=maxDec;
  const tFin=tDer===null?null:tDer-e.decalage,tDeb=tFin===null?null:tFin-e.fenetre,dans=rows.filter(r=>r.t>=tDeb&&r.t<=tFin),dernier=dans.length?dans[dans.length-1]:null;
  const val=(id,r)=>{const k=idx[id];const x=r&&k!==undefined?r.v[k]:null;return Number.isFinite(x)?x:null;};
  const ech=id=>{if(ECHELLES[id])return ECHELLES[id];const xs=dans.map(r=>val(id,r)).filter(Number.isFinite);if(!xs.length)return [0,1];let a=Math.min(...xs),b=Math.max(...xs);if(a===b){a-=1;b+=1;}const m=(b-a)*.1;return [a-m,b+m];};
  const extremes=id=>{const xs=dans.map(r=>val(id,r)).filter(Number.isFinite);return xs.length?[Math.min(...xs),Math.max(...xs)]:[null,null];};
  const direct=e.decalage===0,coul=j=>PLUMES[j%PLUMES.length],fen=(FENETRES.find(([x])=>x===e.fenetre)||[0,''])[1];
  const nv=(x,v)=>x===null?'—':num(x,v.d);
  // ── Cases de valeurs : nom de la voie et unité dans la couleur de la plume, valeur en grand ; case teintée de sa couleur.
  const kase=(id,j,o={})=>{const v=V[idx[id]],x=val(id,dernier);
    return '<div class="s13-enr-case'+(o.grand?' s13-enr-case-g':'')+'" style="--pl:'+coul(j)+'"><span>'+esc(o.grand?v.lbl:v.sh)+'</span><b>'+esc(nv(x,v))+'</b><i>'+esc(v.u)+'</i></div>';};
  let ecran='';
  if(!rows.length)ecran='<p class="s13-enr-vide">Aucun relevé reçu : l’acquisition démarre avec la tranche.</p>';
  else if(e.vue==='courbes'){
    // Papier qui défile vers le bas : le plus récent en haut, sous l'échelle de la première voie et les index des plumes.
    const W=236,H=232,x0=4,x1=W-4,y0=24,y1=H-4,Y=t=>y0+(tFin-t)/(tFin-tDeb)*(y1-y0),X=f=>x0+f*(x1-x0);
    let g='';for(let i=0;i<=4;i++){const x=X(i/4);g+='<path d="M'+x.toFixed(1)+' '+y0+'V'+y1+'" stroke="#c9ced6" stroke-width="'+(i%2?.6:1)+'"/>';}
    for(let i=0;i<=6;i++){const y=y0+(y1-y0)*i/6;g+='<path d="M'+x0+' '+y.toFixed(1)+'H'+x1+'" stroke="#c9ced6" stroke-width=".6"/>';}
    const s0=sel[0],[a0,b0]=s0?ech(s0):[0,1],v0=s0?V[idx[s0]]:null;
    let echelle='';if(v0)for(let i=0;i<=4;i++)echelle+='<text x="'+X(i/4).toFixed(1)+'" y="10" font-size="8.5" text-anchor="'+(i===0?'start':i===4?'end':'middle')+'" fill="'+coul(0)+'">'+esc(num(a0+(b0-a0)*i/4,(b0-a0)<10?1:0))+'</text>';
    const ptr=sel.map((id,j)=>{const [a,b]=ech(id),x=val(id,dernier);if(x===null)return '';const px=X(Math.max(0,Math.min(1,(x-a)/(b-a))));
      return '<path d="M'+(px-4).toFixed(1)+' 13.5H'+(px+4).toFixed(1)+'L'+px.toFixed(1)+' 21.5Z" fill="'+coul(j)+'" stroke="#0006" stroke-width=".5"/>';}).join('');
    // J6, C-12 : un relevé inconnu (voie inconnue, ou ligne posée par la salle sur une absence) coupe le trait : un trou, jamais une droite.
    const tr=sel.map((id,j)=>{const [a,b]=ech(id),traits=[[]];for(const r of dans){const v=val(id,r);if(v!==null)traits[traits.length-1].push([r.t,v]);else if(traits[traits.length-1].length)traits.push([]);}
      return traits.filter(pts=>pts.length>=2).map(pts=>'<polyline points="'+pts.map(([t,v])=>X((Math.max(a,Math.min(b,v))-a)/(b-a)).toFixed(1)+','+Y(t).toFixed(1)).join(' ')+'" fill="none" stroke="'+coul(j)+'" stroke-width="1.6" stroke-linejoin="round"/>').join('');}).join('');
    ecran='<div class="s13-enr-papier"><svg class="s13-enr-c" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMid meet" role="img" aria-label="'+esc('Courbes : '+sel.map(id=>V[idx[id]].lbl).join(', '))+'">'
      +'<rect width="'+W+'" height="'+H+'" fill="#e3e6ea"/><rect x="'+x0+'" y="'+y0+'" width="'+(x1-x0)+'" height="'+(y1-y0)+'" fill="'+(direct?'#fbfcfd':'#eef0f3')+'"/>'+g+echelle
      +(v0?'<text x="'+(W/2)+'" y="'+(y1-4)+'" font-size="7.5" text-anchor="middle" fill="'+coul(0)+'" opacity=".8">'+esc(v0.u)+'</text>':'')
      +tr+ptr+'<path d="M'+x0+' '+y0+'H'+x1+'" stroke="#5b6470" stroke-width="1"/>'
      +'<text x="'+(x0+3)+'" y="'+(y0+9)+'" font-size="7.5" fill="#3b4450">'+esc(direct?'direct':TT(tFin))+'</text><text x="'+(x0+3)+'" y="'+(y1-3)+'" font-size="7.5" fill="#3b4450">'+esc(TT(tDeb))+'</text></svg>'
      +'<div class="s13-enr-cases">'+sel.map((id,j)=>kase(id,j)).join('')+'</div></div>';}
  else if(e.vue==='valeurs')ecran='<div class="s13-enr-v">'+sel.map((id,j)=>kase(id,j,{grand:true})).join('')+'</div>';
  else ecran='<div class="s13-enr-b">'+sel.map((id,j)=>{const v=V[idx[id]],x=val(id,dernier),[a,b]=ech(id),[mi,ma]=extremes(id),f=x===null?0:Math.max(0,Math.min(1,(x-a)/(b-a)));
    return '<div style="--pl:'+coul(j)+'"><span>'+esc(v.sh)+'</span><small>'+esc(num(a,0))+'</small><em><i style="width:'+(f*100).toFixed(1)+'%"></i></em><small>'+esc(num(b,0))+'</small>'
      +'<b>'+esc(nv(x,v))+' <i>'+esc(v.u)+'</i></b><u>min '+esc(nv(mi,v))+' · max '+esc(nv(ma,v))+'</u></div>';}).join('')+'</div>';
  const b=(a,v,lab,on,o={})=>'<button type="button" class="s13-enr-k'+(on?' on':'')+'" data-s13-enr="'+esc(panneau+':'+a+(v!==undefined?':'+v:''))+'" aria-pressed="'+!!on+'"'+(o.off?' disabled':'')+(o.titre?' aria-label="'+esc(o.titre)+'"':'')+(o.menu?' aria-haspopup="menu" aria-expanded="'+!!on+'"':'')+'>'+lab+'</button>';
  // Menu contextuel bleu de l'appareil, posé au-dessus de la barre de touches.
  const menu=e.menu==='vue'?'<div class="s13-enr-menu" role="menu" aria-label="Écran"><b>ÉCRAN</b>'+VUES.map(([x,l])=>b('vue',x,l+(e.vue===x?' ✓':''),e.vue===x)).join('')+'</div>'
    :e.menu==='fenetre'?'<div class="s13-enr-menu" role="menu" aria-label="Fenêtre"><b>FENÊTRE</b>'+FENETRES.map(([x,l])=>b('fenetre',x,l+(e.fenetre===x?' ✓':''),e.fenetre===x)).join('')+'</div>':'';
  const choix=e.choix?'<div class="s13-enr-choix" role="group" aria-label="Voies de l’enregistreur">'+V.map(v=>b('voie',v.id,esc(v.sh),sel.includes(v.id),{off:!sel.includes(v.id)&&sel.length>=MAXV,titre:v.lbl})).join('')+'<small>'+sel.length+' voie'+(sel.length>1?'s':'')+' sur '+MAXV+' au plus</small></div>':'';
  const vueNom=(VUES.find(([x])=>x===e.vue)||['',''])[1];
  return '<div class="s13-enr" aria-label="Enregistreur numérique"><div class="s13-enr-face"><div class="s13-enr-ecran'+(direct?'':' s13-enr-replay')+'">'
    +'<div class="s13-enr-tete"><b>SIMUREP</b><span>'+esc(direct?'DIRECT':'HISTORIQUE')+' · '+esc(TT(tFin))+'</span><em>'+esc(fen)+'</em><small>'+esc(NOMS[panneau]||'')+' · '+esc(vueNom)+'</small></div>'
    +'<div class="s13-enr-trace">'+ecran+'</div>'+menu
    +'<div class="s13-enr-touches">'+b('menu','vue','Écran▴',e.menu==='vue',{menu:true,titre:'Choisir l’écran : courbes, valeurs ou barres'})+b('menu','fenetre',esc(fen)+'▴',e.menu==='fenetre',{menu:true,titre:'Choisir la fenêtre de temps'})
    +b('recul',undefined,'◄',false,{titre:'Remonter dans l’historique',off:!rows.length||e.decalage>=maxDec})+b('avance',undefined,'►',false,{titre:'Avancer',off:direct})+b('direct',undefined,'Direct',false,{titre:'Revenir au direct',off:direct})
    +b('choix',undefined,'Voies',e.choix,{titre:'Choisir les voies'})+'</div></div>'
    +'<div class="s13-enr-clavier" aria-hidden="true"><i></i><i></i><i></i><i></i><span></span></div></div>'+choix+'</div>';}
return Object.freeze({PRESETS,FENETRES,ECHELLES,MAXV,PLUMES,etatNeuf,action,rendu});
});
