// SIMUREP — © 2026 AnthoninP — Tous droits réservés. Enregistreur à points six voies de la salle 900 (J2b).
// Dessin repris de la maquette du 30/09/2026 (veille/2.18-claude/sdc/MAQUETTE-ENREGISTREUR-900.html ; matrice SDC § 15) :
// face 144 × 144 mm, papier de 100 mm utiles qui sort sous la tête (le plus récent en haut), tambour six couleurs, un point
// par voie, voies choisies par le joueur parmi les 27 du jeu (décisions 1B à 4A d'Anthonin, 30/09), aucune marque réelle.
// Les valeurs sont les relevés de l'enregistreur du moteur (recDonnees, même acquisition que l'enregistreur du pupitre).
// Le rôle réel des inscriptions « 1-0-2 » de la poignée n'est pas établi : au jeu, il choisit la vitesse du papier.
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.SDC900Enregistreur=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const KS={X0:17.5,YE:34,CY:38.8,YP:49.5,YL:113.4,YB:133.3,PG:10.7,PD:125.7};
const KS_COL=['#1b1b1b','#c4272d','#8f6a23','#2f9a3a','#1d4f94','#7a2b83'];   // le tambour : noir, rouge, brun, vert, bleu, violet
const N=x=>String(Math.round(x*100)/100);
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const lg=x=>Math.log(x)/Math.LN10;
function puiss(n){return '10<tspan dy="-.42em" font-size="68%">'+n+'</tspan>';}
function pos(g,v){if(!Number.isFinite(v))return null;const f=g.log?(lg(Math.max(v,1e-12))-g.lo)/(g.hi-g.lo):(v-g.lo)/(g.hi-g.lo);return Math.max(0,Math.min(1,f));}
// ── LES 27 MESURES (mêmes identifiants que les voies de l'enregistreur du moteur). Gamme gravée FIXE par mesure : celle du jeu
//    quand il en a une, sinon un choix de maquette ; KRT en logarithmique. La concentration en bore est absolue (CB0 + écart).
const CAT=[
 {id:'thot', f:'Primaire',   lbl:'T BRANCHE CHAUDE',nom:'T branche chaude',     u:'°C',   g:{lo:250,hi:350,pas:20,sous:10}},
 {id:'tcold',f:'Primaire',   lbl:'T BRANCHE FROIDE',nom:'T branche froide',     u:'°C',   g:{lo:250,hi:350,pas:20,sous:10}},
 {id:'ppzr', f:'Primaire',   lbl:'P PRESSURISEUR',nom:'P pressuriseur',       u:'bar',  g:{lo:0,hi:180,pas:30,sous:6}},
 {id:'inv',  f:'Primaire',   lbl:'INVENTAIRE PRIMAIRE',nom:'Inventaire primaire',  u:'%',    g:{lo:0,hi:120,pas:20,sous:4}},
 {id:'lvl',  f:'Primaire',   lbl:'NIVEAU CUVE',nom:'Niveau cuve',          u:'%',    g:{lo:0,hi:100,pas:20,sous:4}},
 {id:'pgv',  f:'Secondaire', lbl:'P VAPEUR GV',nom:'P vapeur GV',          u:'bar',  g:{lo:0,hi:100,pas:20,sous:4}},
 {id:'ngv',  f:'Secondaire', lbl:'NIVEAU GV',nom:'Niveau GV',            u:'%',    g:{lo:0,hi:100,pas:20,sous:4}},
 {id:'tvap', f:'Secondaire', lbl:'T VAPEUR GV',nom:'T vapeur GV',          u:'°C',   g:{lo:100,hi:350,pas:50,sous:5}},
 {id:'padm', f:'Secondaire', lbl:'P ADMISSION HP',nom:'P admission HP',       u:'bar',  g:{lo:0,hi:80,pas:20,sous:4}},
 {id:'pcond',f:'Secondaire', lbl:'P CONDENSEUR',nom:'P condenseur',         u:'mbar', g:{lo:0,hi:200,pas:40,sous:4}},
 {id:'tare', f:'Secondaire', lbl:'T EAU ALIMENTAIRE',nom:'T eau alimentaire',    u:'°C',   g:{lo:0,hi:250,pas:50,sous:5}},
 {id:'adm',  f:'Secondaire', lbl:'ADMISSION TURBINE',nom:'Admission turbine',    u:'%',    g:{lo:0,hi:100,pas:20,sous:4}},
 {id:'pth',  f:'Puissance',  lbl:'P THERMIQUE',nom:'P thermique',          u:'MWth', g:{lo:0,hi:3200,pas:800,sous:4}},
 {id:'pe',   f:'Puissance',  lbl:'P ÉLECTRIQUE',nom:'P électrique',         u:'MWe',  g:{lo:0,hi:1000,pas:200,sous:4}},
 {id:'rod',  f:'Puissance',  lbl:'POSITION GROUPE R',nom:'Position groupe R',    u:'%',    g:{lo:0,hi:100,pas:20,sous:4}},
 {id:'cb',   f:'Puissance',  lbl:'CONCENTRATION BORE',nom:'Concentration en bore',   u:'ppm',  g:{lo:0,hi:2500,pas:500,sous:5}},
 {id:'xe',   f:'Puissance',  lbl:'XÉNON',nom:'Xénon (% de l’équilibre à pleine puissance)',u:'% éq.',g:{lo:0,hi:200,pas:40,sous:4}},   // V24 (S104) : concentration relative à l’équilibre, pas une puissance
 {id:'tbk',  f:'Réserves',   lbl:'T PISCINE BK',nom:'T piscine BK',         u:'°C',   g:{lo:0,hi:100,pas:20,sous:4}},
 {id:'ptr',  f:'Réserves',   lbl:'BÂCHE PTR',nom:'Bâche PTR',            u:'%',    g:{lo:0,hi:100,pas:20,sous:4}},
 {id:'basg', f:'Réserves',   lbl:'BÂCHE ASG',nom:'Bâche ASG',            u:'%',    g:{lo:0,hi:100,pas:20,sous:4}},
 {id:'accu', f:'Réserves',   lbl:'ACCUMULATEURS RIS',nom:'Accumulateurs RIS',    u:'%',    g:{lo:0,hi:100,pas:20,sous:4}},
 {id:'tep',  f:'Réserves',   lbl:'EFFLUENTS VERS TEP',nom:'Effluents vers TEP',   u:'m³',   g:{lo:0,hi:200,pas:40,sous:4}},
 {id:'penc', f:'Enceinte',   lbl:'P ENCEINTE',nom:'P enceinte',           u:'bar',  g:{lo:0,hi:5,pas:1,sous:5}},
 {id:'h2',   f:'Enceinte',   lbl:'H2 ENCEINTE',nom:'H2 enceinte',          u:'%vol', g:{lo:0,hi:10,pas:2,sous:4}},
 {id:'krte', f:'Enceinte',   lbl:'DÉBIT DE DOSE ENCEINTE',nom:'Débit de dose enceinte',u:'mGy/h',g:{lo:-1,hi:5,log:true}},
 {id:'krtv', f:'Enceinte',   lbl:'FUITE GV (VVP)',nom:'Fuite GV (VVP)',       u:'L/h',  g:{lo:-1,hi:5,log:true}},
 {id:'dvn',  f:'Enceinte',   lbl:'ACTIVITÉ CHEMINÉE',nom:'Activité cheminée',    u:'Bq/m³',g:{lo:0,hi:6,log:true}}
];
// Voie « position » : le groupe de régulation du palier servi, R en mode G (CPY), D en mode A (CP0, 6A du 03/10) ; posé par page().
let GRP='R';
const nomV=i=>CAT[i].id==='rod'?'Position groupe '+GRP:CAT[i].nom,lblV=i=>CAT[i].id==='rod'?'POSITION GROUPE '+GRP:CAT[i].lbl;
const DEFAUT=['thot','ppzr','pgv','ngv','pth','pe'];   // à défaut, les voies les plus utiles à la conduite (décision 1B du 30/09)
// ── État de l'appareil (une instance par page) : voies branchées, vitesse du papier et ses changements, loupe, papier tiré.
function etatNeuf(store){
  let voies=DEFAUT.map(id=>CAT.findIndex(m=>m.id===id));
  try{const s=store&&JSON.parse(store.getItem('simurep_sdc_900_enregistreur_v1'));if(s&&s.version===1&&Array.isArray(s.voies)&&s.voies.length===6&&s.voies.every(v=>v===null||(Number.isInteger(v)&&v>=0&&v<CAT.length)))voies=s.voies.slice();}catch(_){}
  return {voies,vitesse:30,segments:[],loupe:false,tire:false,store};
}
function memoriser(e){try{e.store&&e.store.setItem('simurep_sdc_900_enregistreur_v1',JSON.stringify({version:1,voies:e.voies}));}catch(_){}}
// Papier déroulé (mm) à l'instant t : chaque changement de vitesse ouvre un segment, l'historique garde sa place.
function papier(e,t){const g=e.segments;if(!g.length)return t*e.vitesse/3600;let k=g.length-1;while(k>0&&g[k].t0>t)k--;const sg=g[k];return sg.s0+(t-sg.t0)*sg.v/3600;}
function vitesse(e,v,t){if(![0,30,60].includes(v)||v===e.vitesse)return;const s=Number.isFinite(t)?papier(e,t):0;if(!e.segments.length&&Number.isFinite(t))e.segments.push({t0:-1e12,s0:s-(t+1e12)*e.vitesse/3600,v:e.vitesse});e.segments.push({t0:t,s0:s,v});e.vitesse=v;}
function groupes(e){const G=[],k={};for(let c=0;c<6;c++){const i=e.voies[c];if(i==null)continue;const m=CAT[i],g=m.g,cle=(g.log?'L':'')+g.lo+'|'+g.hi;
  if(k[cle]==null){k[cle]=G.length;G.push({lo:g.lo,hi:g.hi,pas:g.pas,sous:g.sous,log:!!g.log,voies:[],u:[]});}G[k[cle]].voies.push(c);G[k[cle]].u.push(m.u);}return G;}
function echelles(e){
  const K=KS,G=groupes(e),n=G.length;let h='';if(!n)return '';
  const big=n===1,hS=big?0:Math.min(7.8,23.4/n),fs=big?3.3:Math.min(2.9,hS*.5);
  for(let i=0;i<n;i++){const g=G[i],yb=big?K.YE:10.3+(i+1)*hS-.55;let t=big?'':'<line x1="'+K.X0+'" y1="'+N(yb)+'" x2="'+(K.X0+100)+'" y2="'+N(yb)+'"/>';
    const Lt=(maj,mid)=>big?(maj?3.2:(mid?2.4:1.5)):(maj?hS*.33:hS*.18);let nb=0;
    if(g.log){const dec=g.hi-g.lo;for(let p=0;p<=dec;p++)for(let q=1;q<=(p<dec?9:1);q++){const x=K.X0+100*(p+lg(q))/dec;t+='<line x1="'+N(x)+'" y1="'+N(yb)+'" x2="'+N(x)+'" y2="'+N(yb-Lt(q===1,q===5))+'"/>';}}
    else{nb=Math.round((g.hi-g.lo)/g.pas);for(let p=0;p<=nb*g.sous;p++){const x=K.X0+100*p/(nb*g.sous);t+='<line x1="'+N(x)+'" y1="'+N(yb)+'" x2="'+N(x)+'" y2="'+N(yb-Lt(p%g.sous===0,g.sous%2===0&&p%(g.sous/2)===0))+'"/>';}}
    h+='<g stroke="#141414" stroke-width="'+(big?'.26':'.2')+'">'+t+'</g><g class="din" font-size="'+N(fs)+'" fill="#141414" text-anchor="middle">';
    const yt=big?yb-3.8:yb-hS*.4;
    if(g.log)for(let p=0;p<=g.hi-g.lo;p++)h+='<text x="'+N(K.X0+100*p/(g.hi-g.lo)+(p===0?.9:0))+'" y="'+N(yt)+'">'+puiss(g.lo+p)+'</text>';
    else for(let p=0;p<=nb;p++)h+='<text x="'+N(K.X0+100*p/nb)+'" y="'+N(yt)+'">'+(g.lo+p*g.pas)+'</text>';
    const lv=g.voies.map(c=>c+1).join('-');if(!big)h+='<text x="'+N(K.X0-2.1)+'" y="'+N(yb-.2)+'" text-anchor="end" font-size="'+N(Math.min(fs+.3,lv.length>3?2.2:9))+'">'+lv+'</text>';
    const un=g.u.every(u=>u===g.u[0]);let x=K.X0+100+(big?String(g.log?'10'+g.hi:g.hi).length*.95+1.6:2.8);const yd=big?yt-1.05:yb-fs*.36,yu=big?yt:yb-.2;
    // J6, 2b (149A) : points et unités restent dans le cadrant (fenêtre ksV, bord à 134,3). Seulement quand ils dépassent : une unité que répètent
    // des voies voisines s'écrit une fois, après la dernière d'entre elles, puis points et unités se resserrent à la place qui reste, moins 10 %
    // pour l'écart des polices à la largeur estimée. Un réglage qui tient déjà garde son dessin.
    const pas=big?2.5:2.3,cw=big?1.55:fs*.56,place=134.3-.5-x,large=m=>g.voies.reduce((s,c,j)=>s+pas+(m(j)?g.u[j].length*cw+1.2:0),0)-2.2;   // du premier point à la fin du dernier texte
    let montre=j=>!un||j===g.voies.length-1,k=1;
    if(large(montre)>place){montre=j=>j===g.voies.length-1||g.u[j+1]!==g.u[j];if(large(montre)>place*.9)k=place*.9/large(montre);}
    for(let j=0;j<g.voies.length;j++){h+='<circle cx="'+N(x)+'" cy="'+N(yd)+'" r="'+N((big?1.05:.95)*k)+'" fill="'+KS_COL[g.voies[j]]+'"/>';x+=pas*k;
      if(montre(j)){h+='<text x="'+N(x-k)+'" y="'+N(yu)+'" text-anchor="start" font-size="'+N((big?2.8:fs)*k)+'">'+esc(g.u[j])+'</text>';x+=(g.u[j].length*cw+1.2)*k;}}
    h+='</g>';}
  return h;
}
function verticales(y0,y1){let t='';for(let p=0;p<=50;p++){const x=KS.X0+p*2;t+='<line x1="'+N(x)+'" y1="'+N(y0)+'" x2="'+N(x)+'" y2="'+N(y1)+'"'+(p%5===0?' stroke-width=".27"':'')+'/>';}return '<g stroke="#2f2f2c" stroke-width=".15">'+t+'</g>';}
// Valeur d'une voie dans un relevé du moteur (la bore est absolue : CB0 + écart).
function valeur(r,ix,cb0){const v=r.v[ix.v];return ix.id==='cb'&&Number.isFinite(cb0)?v+cb0:v;}
// Ce qui descend avec le papier dans la bande [sHaut − Hh ; sHaut], posée à partir de y0.
function contenu(e,rows,ix,cb0,sHaut,y0,Hh){
  const K=KS,Y=s=>y0+(sHaut-s);let h='',t='';
  for(let k=Math.ceil((sHaut-Hh)/10);k*10<=sHaut;k++){const y=Y(k*10);t+='<line x1="'+K.X0+'" y1="'+N(y)+'" x2="'+(K.X0+100)+'" y2="'+N(y)+'"/>';}
  h+='<g stroke="#2f2f2c" stroke-width=".22">'+t+'</g>';t='';
  for(let k=Math.ceil((sHaut-Hh)/5);k*5<=sHaut+1;k++){const y=Y(k*5);t+='<circle cx="'+N(K.X0-4.7)+'" cy="'+N(y)+'" r=".8"/><rect x="'+N(K.X0+101.9)+'" y="'+N(y-.8)+'" width="3.2" height="1.6" rx=".8"/>';}
  h+='<g fill="#44443f">'+t+'</g>';
  for(let k=Math.ceil((sHaut-Hh)/60)-1;k*60<=sHaut+20;k++){let y=Y(k*60-5);
    if(y>y0-3&&y<y0+Hh+3){h+='<g class="din" font-size="3.5" fill="#34342f" text-anchor="middle">';for(let i=0;i<=5;i++)h+='<rect x="'+N(K.X0+i*20-3.2)+'" y="'+N(y-2.9)+'" width="6.4" height="3.4" fill="#e6e5df"/><text x="'+N(K.X0+i*20)+'" y="'+N(y)+'">'+(i*20)+'</text>';h+='</g>';}
    y=Y(k*60-38);if(y>y0-20&&y<y0+Hh+20)h+='<text class="hel" transform="translate('+N(K.X0-1.3)+','+N(y)+') rotate(-90)" font-size="2.35" fill="#34342f">LIN 0-100 · 100 mm</text>';}
  // l'heure de tranche, écrite au passage de chaque heure
  if(rows.length){const t0=rows[0].t,t1=rows[rows.length-1].t;for(let hh=Math.ceil(t0/3600);hh*3600<=t1;hh++){const y=Y(papier(e,hh*3600));if(y<y0-4||y>y0+Hh+4)continue;
    h+='<text class="hel" x="'+N(K.X0+5)+'" y="'+N(y-.7)+'" font-size="3.2" font-weight="700" fill="#22221f" text-anchor="middle">'+hh+'</text>';}}
  // les événements rouges et ambre du journal : un trait rouge en marge droite
  t='';for(let i=rows.length-1;i>=0;i--){const r=rows[i];if(!r.evt)continue;const y=Y(papier(e,r.t));if(y<y0-1)continue;if(y>y0+Hh+1)break;t+='M'+N(K.X0+99)+' '+N(y)+'h3';}
  if(t)h+='<path d="'+t+'" stroke="#c4272d" stroke-width=".5"/>';
  // les points : un par relevé et par voie branchée, à la couleur de la voie
  for(let c=0;c<6;c++){const ci=e.voies[c];if(ci==null||!ix[ci])continue;let d='';
    for(let i=rows.length-1;i>=0;i--){const r=rows[i];if(!r.v)continue;const y=Y(papier(e,r.t)+(c*2)*e.vitesse/3600);if(y<y0-1)continue;if(y>y0+Hh+1)break;const f=pos(CAT[ci].g,valeur(r,ix[ci],cb0));if(f===null)continue;d+='M'+N(K.X0+100*f)+' '+N(y)+'h.01';}
    if(d)h+='<path d="'+d+'" fill="none" stroke="'+KS_COL[c]+'" stroke-width=".55" stroke-linecap="round"/>';}
  return h;
}
// ── L'APPAREIL vu de face, avec le papier en cours et le chariot posé sur la dernière valeur de la voie qu'il imprime.
function face(e,rows,ix,cb0,tNow,uid){
  const K=KS,u=uid||'k';let h='',i,a,r='';const sHaut=papier(e,tNow);
  h+='<svg class="ks6p" viewBox="-3 -15 156 162" role="img" aria-label="Enregistreur à points six voies : '+esc(e.voies.map((v,c)=>v==null?null:(c+1)+' '+nomV(v)).filter(Boolean).join(', '))+'">';
  h+='<defs><linearGradient id="ksB'+u+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d7d4be"/><stop offset="1" stop-color="#c4c1aa"/></linearGradient><linearGradient id="ksM'+u+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3eee0"/><stop offset=".5" stop-color="#bbb39c"/><stop offset="1" stop-color="#8b8470"/></linearGradient><linearGradient id="ksR'+u+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#77766f"/><stop offset=".3" stop-color="#c9c8c1" stop-opacity=".7"/><stop offset="1" stop-color="#e6e5df" stop-opacity="0"/></linearGradient><linearGradient id="ksO'+u+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".3"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient><linearGradient id="ksG'+u+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><pattern id="ksK'+u+'" width=".9" height=".9" patternUnits="userSpaceOnUse"><rect width=".9" height=".9" fill="#2a2a28"/><path d="M0 0L.9 .9M.9 0L0 .9" stroke="#8d8c86" stroke-width=".16"/></pattern><clipPath id="ksV'+u+'"><rect x="9.7" y="9.7" width="124.6" height="124.6"/></clipPath><clipPath id="ksT'+u+'"><rect x="9.7" y="'+K.YE+'" width="124.6" height="17"/></clipPath><clipPath id="ksP'+u+'"><rect x="'+K.PG+'" y="'+K.YP+'" width="'+N(K.PD-K.PG)+'" height="'+N(K.YL-K.YP)+'"/></clipPath></defs>';
  h+='<rect x="13" y="-13.4" width="16.5" height="10" fill="#f6f5f0" stroke="#c3c0b4" stroke-width=".25"/><text class="hel" x="21.25" y="-5.8" font-size="6" font-weight="900" fill="#151515" text-anchor="middle">01</text><rect x="31" y="-12.8" width="66" height="8.8" fill="#efe7b9" stroke="#8d8566" stroke-width=".3"/><text class="hel" x="64" y="-6.3" font-size="5" fill="#151515" text-anchor="middle" letter-spacing=".3">ENREGISTREUR 6 VOIES</text>';
  h+='<rect x="1.3" y="2" width="144" height="144" rx="2.2" fill="#000" opacity=".2"/><rect x="0" y="0" width="144" height="144" rx="2.2" fill="url(#ksB'+u+')" stroke="#8f8c77" stroke-width=".45"/><polygon points="6,6 138,6 134.3,9.7 9.7,9.7" fill="#a5a28c"/><polygon points="6,138 138,138 134.3,134.3 9.7,134.3" fill="#dedbc8"/><polygon points="6,6 9.7,9.7 9.7,134.3 6,138" fill="#b8b59f"/><polygon points="138,6 134.3,9.7 134.3,134.3 138,138" fill="#c8c5af"/><rect x="9.7" y="9.7" width="124.6" height="124.6" fill="#0d0d0c"/>';
  h+='<g clip-path="url(#ksV'+u+')"><rect x="9.7" y="9.7" width="124.6" height="'+N(K.YE-9.7)+'" fill="#f0efe9"/>'+echelles(e)+'<rect x="9.7" y="9.7" width="124.6" height="3.4" fill="url(#ksO'+u+')"/>';
  h+='<line x1="9.7" y1="42.6" x2="134.3" y2="42.6" stroke="#262624" stroke-width=".9"/><line x1="9.7" y1="46.4" x2="134.3" y2="46.4" stroke="#1f1f1d" stroke-width=".7"/>';
  h+='<g clip-path="url(#ksP'+u+')"><rect x="'+K.PG+'" y="'+K.YP+'" width="'+N(K.PD-K.PG)+'" height="'+N(K.YL-K.YP)+'" fill="#e6e5df"/>'+verticales(K.YP,K.YL)+contenu(e,rows,ix,cb0,sHaut,K.YP,K.YL-K.YP)+'<rect x="'+K.PG+'" y="'+K.YP+'" width="'+N(K.PD-K.PG)+'" height="7" fill="url(#ksR'+u+')"/></g>';
  h+='<rect x="'+K.PD+'" y="'+K.YP+'" width="1.5" height="'+N(K.YL-K.YP)+'" fill="#9b9a93"/><rect x="127.7" y="50.4" width="5.3" height="18.6" rx="1.1" fill="url(#ksK'+u+')" stroke="#111" stroke-width=".3"/><rect x="127.2" y="76.5" width="4.6" height="13.6" rx=".5" fill="url(#ksM'+u+')" stroke="#4a463a" stroke-width=".25"/><rect x="127.7" y="95.6" width="5.3" height="17.8" rx="1.1" fill="url(#ksK'+u+')" stroke="#111" stroke-width=".3"/>';
  // le chariot sur la voie qui vient d'être imprimée (cycle de 12 s, une voie toutes les 2 s, en temps de tranche)
  const actif=Number.isFinite(tNow)?Math.floor(((tNow%12)+12)%12/2):0,ci=e.voies[actif],der=rows.length?rows[rows.length-1]:null;
  const f=ci!=null&&der&&der.v&&ix[ci]?pos(CAT[ci].g,valeur(der,ix[ci],cb0)):null,x=f===null?0:100*f;
  r='<circle r="10" fill="#151514" stroke="#30302d" stroke-width=".3"/>';for(i=0;i<6;i++){a=(184-60*i)*Math.PI/180;r+='<text class="din" transform="translate('+N(7.6*Math.sin(a))+','+N(-7.6*Math.cos(a))+') rotate('+(4-60*i)+')" y="1.72" font-size="4.9" fill="#f1f1ec" text-anchor="middle">'+(i+1)+'</text>';}
  r+='<circle r="5" fill="#ecebe6" stroke="#bdbbb3" stroke-width=".2"/>';for(i=0;i<6;i++){const a1=(i*60-30)*Math.PI/180,b1=(i*60+30)*Math.PI/180;r+='<path d="M0 0L'+N(5*Math.sin(a1))+' '+N(-5*Math.cos(a1))+'A5 5 0 0 1 '+N(5*Math.sin(b1))+' '+N(-5*Math.cos(b1))+'Z" fill="'+KS_COL[i]+'" opacity=".1"/>';}r+='<circle r=".95" fill="#161616"/>';
  h+='<g clip-path="url(#ksT'+u+')"><g class="ksChar" style="transform:translate('+N(x)+'px,0)"><g transform="translate('+K.X0+','+K.CY+')"><g class="ksRoue" style="transform:rotate('+(actif*60+300)+'deg)">'+r+'</g></g></g></g>';
  h+='<g class="ksChar" style="transform:translate('+N(x)+'px,0)"><rect x="'+N(K.X0-3.5)+'" y="10.2" width="7" height="20.4" rx=".5" fill="#fff" fill-opacity=".3" stroke="#77756c" stroke-opacity=".55" stroke-width=".18"/><line x1="'+K.X0+'" y1="10.8" x2="'+K.X0+'" y2="30.1" stroke="#111" stroke-width=".38"/></g>';
  h+='<rect x="9.7" y="'+K.YL+'" width="124.6" height="'+N(K.YB-K.YL)+'" fill="#f2f1ec"/><line x1="9.7" y1="'+K.YL+'" x2="134.3" y2="'+K.YL+'" stroke="#8d8c84" stroke-width=".25"/>';
  for(i=0;i<6;i++){const cx=i<3?15.3:73.8,cy=K.YL+5+(i%3)*4.95,v=e.voies[i];h+='<circle cx="'+cx+'" cy="'+N(cy)+'" r="1.4" fill="'+KS_COL[i]+'"/><text class="eng" x="'+(cx+4.2)+'" y="'+N(cy+1.45)+'" font-size="4.25" fill="#161616" letter-spacing=".12">'+(i+1)+'-'+(v!=null?esc(lblV(v)):'')+'</text>';}
  h+='<rect x="12" y="'+N(K.YL-12.4)+'" width="11.6" height="11.4" fill="#5d9fd4" opacity=".93"/><rect x="24.1" y="'+N(K.YL-12.4)+'" width="12.4" height="11.4" fill="#5d9fd4" opacity=".93"/><text class="din" x="17.8" y="'+N(K.YL-4.6)+'" font-size="5.6" fill="#eef5fb" text-anchor="middle">6P</text><text class="hel" x="30.3" y="'+N(K.YL-5.6)+'" font-size="2.15" font-weight="700" fill="#eef5fb" text-anchor="middle">SIMUREP</text>';
  h+='<polygon points="70,9.7 118,9.7 58,134.3 10,134.3" fill="url(#ksG'+u+')"/></g>';
  h+='<rect x="138.2" y="62.6" width="6.4" height="24.6" fill="url(#ksM'+u+')" stroke="#5c5748" stroke-width=".3"/><rect x="134.8" y="70" width="15.4" height="10.6" rx=".4" fill="url(#ksM'+u+')" stroke="#5c5748" stroke-width=".3"/><rect x="-.9" y="19" width="1.3" height="7.5" rx=".3" fill="#1d1d1b"/><rect x="-.9" y="117.5" width="1.3" height="7.5" rx=".3" fill="#1d1d1b"/>';
  return h+'</svg>';
}
// ── Le papier tiré : ce qui a déjà quitté la fenêtre, pendu sous l'appareil, le plus ancien en bas (mémoire du moteur).
function rouleau(e,rows,ix,cb0,tNow,uid){
  const K=KS,sHaut=papier(e,tNow)-(K.YL-K.YP),sMin=rows.length?papier(e,rows[0].t):sHaut,L=Math.max(0,sHaut-sMin);
  if(L<2)return '<p class="s9-ks-vide">Rien n’est encore sorti de la fenêtre : tout le papier écrit est visible sur l’appareil.</p>';
  return '<svg class="ks6p" viewBox="-3 0 156 '+N(L+1)+'" role="img" aria-label="Papier déjà sorti de l’enregistreur"><defs><clipPath id="ksQ'+uid+'"><rect x="'+K.PG+'" y="0" width="'+N(K.PD-K.PG)+'" height="'+N(L)+'"/></clipPath></defs><g clip-path="url(#ksQ'+uid+')"><rect x="'+K.PG+'" y="0" width="'+N(K.PD-K.PG)+'" height="'+N(L)+'" fill="#e6e5df"/>'+verticales(0,L)+contenu(e,rows,ix,cb0,sHaut,0,L)+'</g></svg>';
}
// Index des voies du moteur par identifiant de mesure ; une mesure absente des relevés reste débranchable mais muette.
function indexer(voiesMoteur){const ix={};CAT.forEach((m,i)=>{const k=(voiesMoteur||[]).findIndex(v=>v.id===m.id);if(k>=0)ix[i]={v:k,id:m.id};});return ix;}
// ── La page : l'appareil, la loupe, le papier à tirer, la vitesse et le choix des voies (six au plus).
function page(e,enr,cb0,tNow,uid,o){GRP=o&&o.groupe==='D'?'D':'R';
  const rows=enr&&Array.isArray(enr.rows)?enr.rows:[],ix=indexer(enr&&enr.voies);
  const fams={},ordre=[];CAT.forEach((m,i)=>{if(!fams[m.f]){fams[m.f]=[];ordre.push(m.f);}fams[m.f].push(i);});
  const pleins=e.voies.filter(v=>v!=null).length>=6;
  const choix=ordre.map(f=>'<div class="s9-ks-fam"><b>'+esc(f)+'</b><div>'+fams[f].map(i=>{const c=e.voies.indexOf(i),on=c>=0;return '<button type="button" class="s9-ks-v'+(on?' on':'')+(!on&&pleins?' plein':'')+'" data-s9-ks="voie:'+i+'" aria-pressed="'+on+'"'+(on?' style="--c:'+KS_COL[c]+'"':'')+'><span class="pl">'+(on?c+1:'')+'</span>'+esc(nomV(i))+'</button>';}).join('')+'</div></div>').join('');
  // Barre-poignée sous l'appareil (photo de Gravelines 5, 10A du 03/10) : la poignée tire le papier ; le sélecteur gravé « 1-0-2 »
  // choisit la vitesse (1 : 30 mm/h, 0 : arrêt, 2 : 60 mm/h), son index pointe la position établie.
  const POS=[[30,'1','30 mm/h',-45],[0,'0','arrêt',0],[60,'2','60 mm/h',45]],ang=(POS.find(p=>p[0]===e.vitesse)||POS[0])[3];
  const sel='<span class="s9-ks-sel" role="group" aria-label="Vitesse du papier (sélecteur 1-0-2)"><svg class="s9-ks-bouton" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="22" r="15" fill="#1d1d1b" stroke="#000"/><circle cx="20" cy="22" r="11" fill="#2e2e2b"/>'
    +'<g transform="rotate('+ang+' 20 22)"><rect x="18" y="8" width="4" height="15" rx="1.5" fill="#e9e6da"/></g></svg>'
    +POS.map(([v,l,t])=>'<button type="button" class="s9-ks-pos" data-s9-ks="vitesse:'+v+'" aria-pressed="'+(e.vitesse===v)+'" aria-label="Vitesse '+l+' : '+t+'"><b>'+l+'</b><small>'+t+'</small></button>').join('')+'</span>';
  const barre='<div class="s9-ks-barre"><button type="button" class="s9-ks-tir" data-s9-ks="tirer" aria-expanded="'+e.tire+'"><i aria-hidden="true"></i>'+(e.tire?'▴ Rentrer le papier':'▾ Tirer le papier')+'</button>'+sel+'</div>';
  const n=e.voies.filter(v=>v!=null).length,resume=e.voies.map((v,c)=>v==null?null:(c+1)+' '+nomV(v)).filter(Boolean).join(' · ');
  return '<div class="s9-ks"><div class="s9-ks-poste"><div class="s9-ks-ecrin'+(e.loupe?' loupe':'')+'" data-s9-ks="loupe" role="button" tabindex="0" aria-label="'+(e.loupe?'Refermer la loupe':'Ouvrir la loupe sur l’enregistreur')+'">'+face(e,rows,ix,cb0,tNow,uid)+'</div>'
    +barre+(e.tire?'<div class="s9-ks-rouleau">'+rouleau(e,rows,ix,cb0,tNow,uid)+'</div>':'')+'</div>'
    +'<details class="s9-ks-choix"'+(e.ouvert?' open':'')+'><summary><b>Voies de l’enregistreur</b><span>'+n+' sur 6 · '+esc(resume||'aucune')+'</span></summary><p>Six voies au plus. Une mesure branchée prend la première voie libre et sa couleur ; la débrancher libère sa voie. Relevés : un point par voie au pas de l’enregistreur de la tranche ('+(enr&&Number.isFinite(enr.pas)?enr.pas+' s':'—')+').</p>'+choix+'</details><p class="s9-ks-msg" role="status">'+esc(e.msg||'')+'</p></div>';
}
// Action d'un toucher (data-s9-ks) : renvoie vrai si l'affichage doit être redessiné.
function action(e,cle,tNow){
  e.msg='';const [k,v]=String(cle).split(':');
  if(k==='loupe'){e.loupe=!e.loupe;return true;}
  if(k==='tirer'){e.tire=!e.tire;return true;}
  if(k==='vitesse'){vitesse(e,Number(v),tNow);return true;}
  if(k==='voie'){const i=Number(v);if(!Number.isInteger(i)||i<0||i>=CAT.length)return false;const c=e.voies.indexOf(i);
    if(c>=0)e.voies[c]=null;else{const libre=e.voies.indexOf(null);if(libre<0){e.msg='Six voies au plus : débranche d’abord une mesure.';return true;}e.voies[libre]=i;}
    memoriser(e);return true;}
  return false;
}
return Object.freeze({CAT,KS_COL,DEFAUT,etatNeuf,page,action,papier});
});
