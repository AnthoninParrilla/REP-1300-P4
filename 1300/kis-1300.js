// SIMUREP — © 2026 AnthoninP — Tous droits réservés. KIS de la salle du 1300 (J2b) : un seul écran de supervision, en consultation.
// Vision d'Anthonin (question 8 du grand QCM, nuit du 03/10) : « une supervision moderne qui ressemble à celle de l'EPR ; le KIS devient
// le logiciel dans la salle de commande qui donne uniquement des infos et nous montre une des synoptiques ; il intègre les
// fonctionnalités du KIT du 900 ; on peut ouvrir des fiches d'équipement en cliquant sur les éléments de la synoptique ; bref pareil
// que l'EPR mais sans les actions et pilotages. » Un seul KIS (8a B), des pages (23A : « un écran KIS, des multitudes de pages ») ;
// six synoptiques (8b A), fiches comme le « Dialogue équipement » de l'EPR, sans commande, avec « Commander au pupitre › » (8c A) ;
// écran plat à fond clair, titré KIS (17A). Couleurs des matériels à la règle de la salle (9 bis A) : rouge = en service, vert = hors
// service, gris = état non donné. Tout se lit dans l'instantané reçu ; aucune commande, aucune grandeur absente du moteur : GV, GMPP et
// TPA en agrégat (un niveau, « n en marche »), ni vibrations, ni vitesse, ni température par réchauffeur, ni niveau du pressuriseur.
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./instruments-900.js'),require('./salle-900.js'),require('./synoptique-900.js'));else root.SDC1300KIS=factory(root.SDC900Instruments,root.SDC900,root.SDC900Synoptique);})(typeof globalThis!=='undefined'?globalThis:this,function(I,S9,SYN9){
'use strict';
const {esc,num}=I,C9=S9.commun;
const st=d=>d&&d.state||{};
const f=v=>Number.isFinite(v)?v:null,b=v=>v===true?true:v===false?false:null;
const releve=(d,id)=>SYN9&&SYN9.releve?SYN9.releve(d,id):null;
// ── Palette (écrans clairs dans l'esprit de l'EPR, 17A ; choix) et matériels à la règle de la salle (9 bis A).
const K={fond:'#f6f8f9',grille:'#e3e9ec',trait:'#3c5866',txt:'#1f3741',dim:'#5b717b',prim:'#b0442a',vap:'#2c7a4e',eau:'#1d6f9e',asg:'#7a4d9f',ris:'#a8740f',rri:'#2f8a87',elec:'#4f6a7a',crf:'#2f7fb3',enc:'#8a9ba3',
  marche:'#e0473a',arret:'#3c9f58',inconnu:'#d3dbdf',equip:'#ffffff',bord:'#576e7a',eauNiv:'#8cc4e8'};
const coul=e=>e===true?K.marche:e===false?K.arret:K.inconnu;
const P=(x,y)=>x.toFixed(1)+' '+y.toFixed(1);
function trait(d,c,w=2.6,o={}){return '<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="'+w+'" stroke-linejoin="round" stroke-linecap="round"'+(o.tirets?' stroke-dasharray="6 5"':'')+(o.op?' opacity="'+o.op+'"':'')+'/>';}
function texte(x,y,t,o={}){return '<text x="'+x+'" y="'+y+'" font-size="'+(o.taille||13)+'" text-anchor="'+(o.ancre||'middle')+'" fill="'+(o.c||K.txt)+'"'+(o.gras?' font-weight="700"':'')+'>'+esc(t)+'</text>';}
// Étiquette de valeur : libellé fin, valeur en gras, unité ; « — » si la grandeur n'est pas reçue.
function valeur(x,y,lib,v,u,o={}){const w=o.w||Math.max(92,lib.length*6.4+14),txt=v===null||v===undefined||v==='—'?'—':v;
  return '<g class="s13-k-val"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="34" rx="3" fill="#fff" stroke="#c3d0d6"/>'+texte(x+7,y+13,lib,{taille:10.5,ancre:'start',c:K.dim})+'<text x="'+(x+7)+'" y="'+(y+28)+'" font-size="14.5" font-weight="700" fill="#0f3b52">'+esc(txt)+(u&&txt!=='—'?'<tspan font-size="11" font-weight="400" fill="'+K.dim+'"> '+esc(u)+'</tspan>':'')+'</text></g>';}
// Matériel touchable : ouvre sa fiche (aucune commande).
function equip(id,lib,corps,sel){return '<g class="s13-k-eq'+(sel===id?' s13-k-sel':'')+'" data-s13-equip="'+esc(id)+'" role="button" tabindex="0" aria-label="'+esc(lib+' : ouvrir la fiche')+'" aria-pressed="'+(sel===id)+'">'+corps+'</g>';}
function pompe(x,y,e,r=13,ang=0){return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+coul(e)+'" stroke="'+K.bord+'" stroke-width="1.6"/><path d="M'+P(x-r*.42,y-r*.5)+'L'+P(x+r*.62,y)+'L'+P(x-r*.42,y+r*.5)+'Z" fill="#fff" opacity=".9" transform="rotate('+ang+' '+x+' '+y+')"/>';}
function vanne(x,y,e,axe='h'){const h=axe==='h',d=h?'M'+(x-9)+' '+(y-6)+'L'+x+' '+y+'L'+(x-9)+' '+(y+6)+'ZM'+(x+9)+' '+(y-6)+'L'+x+' '+y+'L'+(x+9)+' '+(y+6)+'Z':'M'+(x-6)+' '+(y-9)+'L'+x+' '+y+'L'+(x+6)+' '+(y-9)+'ZM'+(x-6)+' '+(y+9)+'L'+x+' '+y+'L'+(x+6)+' '+(y+9)+'Z';
  return '<path d="'+d+'" fill="'+coul(e)+'" stroke="'+K.bord+'" stroke-width="1.2"/>';}
function capsule(x,y,w,h,niv,o={}){const ok=Number.isFinite(niv),hf=ok?Math.max(0,Math.min(1,niv))*(h-6):0,rx=o.rx??Math.min(w/2,14);
  return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'" fill="'+K.equip+'" stroke="'+K.bord+'" stroke-width="1.6"/>'+(ok?'<rect x="'+(x+3)+'" y="'+(y+h-3-hf).toFixed(1)+'" width="'+(w-6)+'" height="'+hf.toFixed(1)+'" rx="'+Math.max(0,rx-3)+'" fill="'+K.eauNiv+'"/>':'')+(o.lib?texte(x+w/2,y+h/2+4,o.lib,{taille:o.taille||11,gras:true,c:'#21404d'}):'');}
function boite(x,y,w,h,lib,o={}){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+(o.rx??4)+'" fill="'+(o.fond||K.equip)+'" stroke="'+(o.bord||K.bord)+'" stroke-width="1.6"/>'+(lib?texte(x+w/2,y+h/2+4.5,lib,{taille:o.taille||12,gras:true,c:o.c||'#21404d'}):'');}
function cadre(W,H,corps,lab){return '<svg class="s13-k-syn" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(lab)+'"><rect width="'+W+'" height="'+H+'" fill="'+K.fond+'"/>'+corps+'</svg>';}
// GMPP : le moteur ne donne que le nombre en marche (D12/D16) : couleur seulement si les quatre sont dans le même état.
function gmpp(s,nb){const n=Number.isInteger(s.gmppN)?s.gmppN:null;return {n,e:n===null?null:n===nb?true:n===0?false:null};}
// ══ 1. PRIMAIRE : cuve au centre, quatre boucles en étoile (branche chaude sur le rayon du GV, retour par la GMPP sur un rayon décalé,
//    comme le synoptique de la salle 900), pressuriseur sur une branche chaude, décharge, accumulateurs, raccordement RRA.
function synPrimaire(d,sel){const s=st(d),nb=(d.pal&&d.pal.NB)||4,g=gmpp(s,nb),W=980,H=560,cx=470,cy=290,R=38;let L='',E='',T='';
  const dir=a=>{const r=a*Math.PI/180;return [Math.cos(r),Math.sin(r)];},pt=(a,r)=>{const [dx,dy]=dir(a);return [cx+r*dx,cy+r*dy];};
  const TH=[-140,-40,40,140],AP=32,RIN=100,ROUT=226,RP=134;
  TH.forEach((t,i)=>{const a=pt(t,R),inn=pt(t,RIN),pp=pt(t+AP,RP),c=pt(t+AP,R);
    L+=trait('M'+P(a[0],a[1])+'L'+P(inn[0],inn[1]),K.prim,6)+trait('M'+P(inn[0],inn[1])+'L'+P(pp[0],pp[1]),K.prim,4.5,{op:.9})+trait('M'+P(pp[0],pp[1])+'L'+P(c[0],c[1]),K.prim,4.5,{op:.9});
    const m=pt(t,(RIN+ROUT)/2),lev=f(s.gv)===null?null:Math.max(0,Math.min(1,s.gv/100)),Lg=ROUT-RIN,Wd=46;
    E+=equip('gv','Générateur de vapeur '+(i+1),'<g transform="rotate('+(t+90)+' '+m[0].toFixed(1)+' '+m[1].toFixed(1)+')"><rect x="'+(m[0]-Wd/2).toFixed(1)+'" y="'+(m[1]-Lg/2).toFixed(1)+'" width="'+Wd+'" height="'+Lg+'" rx="18" fill="'+K.equip+'" stroke="'+K.bord+'" stroke-width="1.6"/>'
      +(lev!==null?'<rect x="'+(m[0]-12).toFixed(1)+'" y="'+(m[1]+Lg/2-8-(Lg-20)*lev).toFixed(1)+'" width="24" height="'+((Lg-20)*lev).toFixed(1)+'" rx="5" fill="'+K.eauNiv+'"/>':'')+'</g>',sel);
    const e=pt(t,ROUT+20);T+=texte(e[0],e[1]+4,'GV'+(i+1),{taille:12,gras:true,c:K.dim});
    E+=equip('gmpp','Pompes primaires (GMPP)',pompe(pp[0],pp[1],g.e,14,t+AP+180),sel);});
  E+=equip('cuve','Cuve et cœur','<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="#e9eef0" stroke="'+K.bord+'" stroke-width="2"/><rect x="'+(cx-14)+'" y="'+(cy-20)+'" width="28" height="40" rx="3" fill="'+((s.etat==='RP'||s.etat==='ANGV')&&!s.scram&&(s.Pn||0)>0.02?'#e5622f':'#9aa6ab')+'"/>',sel);
  // pressuriseur sur la branche chaude de la boucle 2 (rayon −40°), soupapes SEBIM vers le réservoir de décharge
  const hp=pt(-40,62);L+=trait('M'+P(hp[0],hp[1])+'V40H576V60',K.prim,3);
  E+=equip('pzr','Pressuriseur','<rect x="560" y="60" width="32" height="86" rx="15" fill="'+K.equip+'" stroke="'+K.bord+'" stroke-width="1.6"/>'+texte(576,106,'PZR',{taille:10.5,gras:true,c:'#21404d'})
    +'<path d="M567 136l3-5l3 5l3-5l3 5l3-5" stroke="'+(s.heat?'#e0473a':'#9aa6ab')+'" stroke-width="1.8" fill="none"/>',sel);
  L+=trait('M592 40H660V60',K.prim,2.4);E+=equip('sebim','Soupapes du pressuriseur',vanne(626,40,s.sebim===true?true:s.sebim===false?false:null),sel)+equip('rdp','Réservoir de décharge',capsule(641,60,38,44,f(s.rdp),{rx:8,lib:'RDP',taille:9.5}),sel);
  T+=texte(626,28,'SOUPAPES',{taille:10.5,c:K.dim,gras:true});
  // accumulateurs : un par boucle (quatre au 1300), piqués sur la branche froide entre la GMPP et la cuve ; niveau commun du moteur
  //    (04/10 : plus de tracé qui traverse le dessin)
  TH.forEach(t=>{const a=pt(t+AP+20,100),j=pt(t+AP,84);L+=trait('M'+P(a[0],a[1])+'L'+P(j[0],j[1]),K.ris,2.2,{op:s.accIso===true?.35:1});E+=equip('accu','Accumulateurs',capsule(a[0]-11,a[1]-18,22,36,null,{rx:10}),sel);});
  // RRA : aspiration sur la branche chaude de la boucle 3, retour sur la branche froide de la boucle 4, sous la cuve
  const ra=pt(40,60),rb=pt(140+AP,60);L+=trait('M'+P(ra[0],ra[1])+'V510H484',K.rri,2.6,{op:s.rra?1:.4})+trait('M456 510H'+rb[0].toFixed(1)+'V'+rb[1].toFixed(1),K.rri,2.6,{op:s.rra?1:.4});
  E+=equip('rra','Refroidissement à l’arrêt (RRA)',pompe(470,510,b(s.rra),14,180),sel);T+=texte(470,540,'RRA',{taille:10.5,c:K.dim,gras:true});
  T+=valeur(16,18,'P primaire',num(f(s.Ppzr),1),'bar')+valeur(16,58,'T moyenne',num(f(s.Tavg),1),'°C')+valeur(16,98,'T branche chaude',num(f(d.tempHot),1),'°C',{w:120})+valeur(16,138,'T branche froide',num(f(d.tempCold),1),'°C',{w:120});
  T+=valeur(W-148,18,'GMPP',g.n===null?'—':g.n+' / '+nb+' en marche','',{w:132})+valeur(W-148,58,'Niveau cuve',num(f(s.lvlCuve),0),'%',{w:132})+valeur(W-148,98,'Inventaire primaire',num(f(s.inv),0),'%',{w:132})+valeur(W-148,138,'Puissance thermique',num(f(d.powerThermal),0),'MWth',{w:132});
  T+=valeur(W-148,438,'Accumulateurs',num(f(s.accu),0),'%',{w:132})+valeur(W-148,478,'RRA',s.rra===true?'raccordé':s.rra===false?'isolé':'—','',{w:132});
  return cadre(W,H,L+E+T,'KIS · synoptique du circuit primaire : quatre boucles');}
// ══ 2. EAU-VAPEUR : quatre GV, VIV, collecteur, turbine, GCT, ARE, ASG (deux motopompes, deux turbopompes).
function synEauVapeur(d,sel){const s=st(d),W=980,H=560;let L='',E='',T='';
  const adm=f(s.turb),gct=f(s.gct),gcta=f(s.gctA),sv=f(s.svf);
  for(let i=0;i<4;i++){const y=70+i*112;
    E+=equip('gv','Générateurs de vapeur',capsule(60,y-40,46,96,f(s.gv)!==null?s.gv/100:null,{lib:'GV'+(i+1),rx:20,taille:11}),sel);
    L+=trait('M106 '+(y-24)+'H330',K.vap,4);E+=equip('viv','Vannes d’isolement vapeur (VIV)',vanne(250,y-24,b(s.viv)),sel);
    L+=trait('M106 '+(y+18)+'H190V'+(y+18),K.eau,2.6)+trait('M106 '+(y+34)+'H150',K.asg,2.2,{op:f(s.asg)!==null&&s.asg>0.0005?1:.45});}
  L+=trait('M330 46V382',K.vap,5)+trait('M330 200H620',K.vap,5);
  E+=equip('turbine','Turbine (admission)','<path d="M620 168L700 152V248L620 232Z" fill="'+K.equip+'" stroke="'+K.bord+'" stroke-width="1.6"/>'+texte(660,205,'TURBINE',{taille:10.5,gras:true}),sel)+equip('admission','Vannes d’admission',vanne(560,200,adm===null?null:adm>1),sel);
  L+=trait('M400 200V300H470',K.vap,3);E+=equip('gctc','Contournement au condenseur (GCT-C)',vanne(500,300,gct===null?null:gct>0.01),sel);L+=trait('M509 300H620',K.vap,3);E+=equip('condenseur','Condenseur',boite(620,284,120,34,'CONDENSEUR'),sel);
  L+=trait('M370 200V120',K.vap,3);E+=equip('gcta','Contournement à l’atmosphère (GCTa)',vanne(370,100,gcta===null?null:gcta>0.01,'v'),sel)+equip('soupapes','Soupapes des GV',vanne(420,100,sv===null?null:sv>0.02,'v'),sel);L+=trait('M420 120V200',K.vap,2.4);
  T+=texte(370,72,'GCTa',{taille:10.5,c:K.dim,gras:true})+texte(420,72,'SOUPAPES',{taille:10.5,c:K.dim,gras:true});
  // ARE : TPA → AHP → vanne ARE → collecteur vers les GV
  L+=trait('M190 88V430H560V470H680',K.eau,2.6);E+=equip('are','Vanne de régulation ARE',vanne(400,430,s.areAvail===false?false:f(s.areOut)===null?null:s.areOut>0.5),sel);
  E+=equip('tpa','Turbopompes alimentaires (TPA)',pompe(700,470,b(s.tpaRun),15,180),sel);T+=texte(700,500,'TPA',{taille:10.5,c:K.dim,gras:true});
  // ASG : bâche, deux motopompes et deux turbopompes, vers les GV ; turbopompes entraînées par la vapeur
  L+=trait('M150 104V520H860',K.asg,2.4,{op:f(s.asg)!==null&&s.asg>0.0005?1:.5});
  E+=equip('bacheasg','Bâche ASG',capsule(880,470,64,74,f(s.bacheASG),{rx:6,lib:'BÂCHE',taille:10}),sel);
  [['mpsA','Motopompe ASG A',560,C9.nonAlimentee(s,'mpsA')?false:b(s.mpsA),'MPS A'],['mpsB','Motopompe ASG B',640,C9.nonAlimentee(s,'mpsB')?false:b(s.mpsB),'MPS B'],   // J6 (96A) : sans tension, elle ne tourne pas
  ['tpsA','Turbopompe ASG A',720,C9.sansVapeur(s,'tpsA')?false:b(s.tpsA),'TPS A'],['tpsB','Turbopompe ASG B',800,C9.sansVapeur(s,'tpsB')?false:b(s.tpsB),'TPS B']].forEach(([id,lib,x,e,t])=>{E+=equip(id,lib,pompe(x,520,e,13,180),sel);T+=texte(x,548,t,{taille:10.5,c:K.dim,gras:true});});   // J6, 2b (150A) : sans vapeur, elle ne tourne pas
  L+=trait('M330 382V400H760V507M760 400H800V507',K.vap,1.8,{tirets:true,op:(s.tpsA||s.tpsB)?1:.5});
  T+=valeur(760,18,'Niveau GV',num(f(s.gv),0),'%',{w:200})+valeur(760,58,'P vapeur GV',num(f(s.Psteam),1),'bar',{w:200})+valeur(760,98,'Admission turbine',num(adm,0),'%',{w:200})+valeur(760,138,'GCT condenseur',(s.gctMode==='manu'?'manu ':'auto ')+(gct===null?'—':num(gct*100,0)+' %'),'',{w:200})
    +valeur(760,178,'Débit ARE',num(f(s.areOut),0),'%',{w:200})+valeur(760,218,'Débit ASG',f(s.asg)===null?'—':num(s.asg*100,1),'% nominal',{w:200});
  return cadre(W,H,L+E+T,'KIS · synoptique eau-vapeur : quatre GV, vapeur, eau alimentaire et secours');}
// ══ 3. TURBINE, LIGNE D'ARBRE (repère 13) : HP, GSS, trois corps BP, alternateur, sorties vers le réseau.
function synTurbine(d,sel){const s=st(d),W=980,H=420;let L='',E='',T='';const y=200;
  // vapeur vive des GV → vannes d'admission → corps HP ; l'arbre relie HP, BP et alternateur
  L+=trait('M24 '+y+'H90',K.vap,3.4);E+=equip('admission','Vannes d’admission turbine',vanne(56,y,f(s.turb)===null?null:s.turb>0.5),sel);T+=texte(56,y-16,'ADMISSION',{taille:9.5,c:K.dim,gras:true});
  L+=trait('M170 '+y+'H738',K.trait,3);
  E+=equip('hp','Corps haute pression','<path d="M90 '+(y-36)+'L170 '+(y-54)+'V'+(y+54)+'L90 '+(y+36)+'Z" fill="'+K.equip+'" stroke="'+K.bord+'" stroke-width="1.6"/>'+texte(130,y+5,'HP',{gras:true}),sel);
  // HP → sécheurs-surchauffeurs → collecteur des corps BP (04/10 : le GSS alimente les BP, pas l'alternateur)
  E+=equip('gss','Sécheurs-surchauffeurs (GSS)',boite(210,50,110,40,'GSS'),sel);L+=trait('M150 '+(y-46)+'V70H210',K.vap,2.6)+trait('M265 90V110H600',K.vap,2.6);
  [300,450,600].forEach((x,i)=>{E+=equip('bp','Corps basse pression','<path d="M'+(x-60)+' '+(y-70)+'L'+(x-12)+' '+(y-40)+'V'+(y+40)+'L'+(x-60)+' '+(y+70)+'ZM'+(x+60)+' '+(y-70)+'L'+(x+12)+' '+(y-40)+'V'+(y+40)+'L'+(x+60)+' '+(y+70)+'Z" fill="'+K.equip+'" stroke="'+K.bord+'" stroke-width="1.6"/>',sel);
    T+=texte(x+8,y+96,'BP'+(i+1),{gras:true,taille:11.5,ancre:'start',c:K.dim});});
  L+=trait('M300 '+(y-70)+'V110M450 '+(y-70)+'V110M600 '+(y-70)+'V110',K.vap,2.2);T+=texte(440,104,'VAPEUR RESURCHAUFFÉE VERS LES CORPS BP',{taille:10,c:K.vap,gras:true});
  E+=equip('alternateur','Alternateur','<circle cx="790" cy="'+y+'" r="52" fill="'+K.equip+'" stroke="'+K.bord+'" stroke-width="1.8"/>'+texte(790,y-6,'ALTERNATEUR',{taille:10.5,gras:true})+texte(790,y+16,Number.isFinite(s.Pelec)?num(s.Pelec,0)+' MWe':'—',{taille:14,gras:true,c:'#0f3b52'}),sel);
  L+=trait('M842 '+y+'H920V120',K.elec,3);E+=equip('reseau','Réseau extérieur',boite(880,70,80,46,'RÉSEAU'),sel);
  L+=trait('M300 '+(y+70)+'V320M450 '+(y+70)+'V320M600 '+(y+70)+'V320',K.vap,2.2,{op:.6});E+=equip('condenseur','Condenseur',boite(230,320,440,40,'CONDENSEUR'),sel);
  T+=valeur(24,268,'P vapeur',num(f(s.Psteam),1),'bar',{w:124})+valeur(24,308,'P admission HP',num(f(s.Padm),1),'bar',{w:124})+valeur(24,348,'Admission turbine',num(f(s.turb),1),'%',{w:124})
    +valeur(700,290,'Consigne de charge',num(f(s.turbSet),0),'%',{w:124})+valeur(834,290,'Pente de charge',f(s.turbRate)===null?'—':num(s.turbRate*60,0),'%/min',{w:124})+valeur(700,330,'Suivi du réseau',d.follow===true?'actif':d.follow===false?'coupé':'—','',{w:124})+valeur(834,330,'P condenseur',Number.isFinite(s.Pcond)?num(s.Pcond*1000,0):'—','mbar',{w:124});
  return cadre(W,H,L+E+T,'KIS · turbine et ligne d’arbre : admission, HP, sécheurs-surchauffeurs, trois corps BP, alternateur');}
// ══ 4. POSTE D'EAU (repère 14) : condenseur, pompes d'extraction CEX, réchauffeurs BP, bâche alimentaire, turbopompes alimentaires,
//    réchauffeurs HP, puis l'ARE vers les quatre GV (04/10 : « CEX pour extraction, et ARE vers GV »).
function synPosteEau(d,sel){const s=st(d),W=980,H=420;let L='',E='',T='';const tare=releve(d,'tare'),are=s.areAvail===false?false:f(s.areOut)===null?null:s.areOut>0.5;
  E+=equip('condenseur','Condenseur',boite(24,90,140,52,'CONDENSEUR'),sel);L+=trait('M94 142V250H200',K.eau,2.6);
  E+=equip('cvi','Extraction des incondensables (CVI)',pompe(94,56,b(s.cvi),12,-90),sel);T+=texte(116,60,'CVI',{taille:10.5,c:K.dim,gras:true,ancre:'start'});
  E+=equip('cex','Pompes d’extraction (CEX)',pompe(216,250,null,14),sel);T+=texte(216,282,'CEX',{taille:11,c:K.dim,gras:true});
  L+=trait('M230 250H280',K.eau,2.6);E+=equip('abp','Réchauffeurs basse pression (ABP)',boite(280,226,100,48,'ABP'),sel);L+=trait('M380 250H420V170H440',K.eau,2.6);
  E+=equip('bache','Bâche alimentaire',capsule(440,140,120,60,null,{rx:24,lib:'BÂCHE',taille:11}),sel);L+=trait('M560 170H590V250H606',K.eau,2.6);
  E+=equip('tpa','Turbopompes alimentaires (TPA)',pompe(621,250,b(s.tpaRun),15),sel);T+=texte(621,282,'TPA',{taille:10.5,c:K.dim,gras:true});
  L+=trait('M636 250H670',K.eau,2.6);E+=equip('ahp','Réchauffeurs haute pression (AHP)',boite(670,226,96,48,'AHP'),sel);
  L+=trait('M766 250H790',K.eau,2.6);E+=equip('are','Vanne de régulation ARE',vanne(806,250,are),sel);L+=trait('M815 250H840V88H870M840 130H870M840 172H870M840 214H870',K.eau,2.6);
  T+=texte(806,232,'ARE',{taille:11,c:K.eau,gras:true});
  for(let i=0;i<4;i++)E+=equip('gv','Générateurs de vapeur',capsule(870,70+i*42,70,36,f(s.gv)!==null?s.gv/100:null,{rx:14,lib:'GV'+(i+1),taille:10}),sel);
  L+=trait('M330 226V168M718 226V168',K.vap,1.8,{tirets:true});T+=texte(330,160,'soutirages BP',{taille:10,c:K.vap,gras:true})+texte(718,160,'soutirages HP',{taille:10,c:K.vap,gras:true});
  T+=valeur(24,320,'P condenseur',Number.isFinite(s.Pcond)?num(s.Pcond*1000,0):'—','mbar',{w:130})+valeur(164,320,'T eau alimentaire',tare===null?'—':num(tare,0),'°C',{w:140})+valeur(314,320,'Débit ARE',num(f(s.areOut),0),'%',{w:120})
    +valeur(444,320,'Régulation ARE',s.areAuto===true?'AUTO':s.areAuto===false?'MANU':'—','',{w:130})+valeur(584,320,'TPA',s.tpaRun===true?'en service':s.tpaRun===false?'arrêtées':'—','',{w:130})+valeur(724,320,'Niveau GV',num(f(s.gv),0),'%',{w:120});
  return cadre(W,H,L+E+T,'KIS · poste d’eau : condenseur, CEX, réchauffeurs, bâche, turbopompes alimentaires, ARE vers les GV');}
// ══ 5. SAUVEGARDES : PTR et collecteur d'aspiration, injection HP et BP, aspersion, accumulateurs, recirculation depuis le puisard
//    vers l'aspiration des pompes, enceinte.
function synSauvegardes(d,sel){const s=st(d),W=980,H=480;let L='',E='',T='';
  E+=equip('enceinte','Enceinte de confinement','<rect x="420" y="40" width="520" height="400" rx="60" fill="none" stroke="'+K.enc+'" stroke-width="3"/>',sel);T+=texte(440,64,'ENCEINTE',{taille:11,c:K.dim,gras:true,ancre:'start'});
  E+=equip('cuve','Cuve et cœur','<rect x="640" y="190" width="60" height="110" rx="26" fill="#e9eef0" stroke="'+K.bord+'" stroke-width="2"/>'+texte(670,250,'CUVE',{taille:10.5,gras:true,c:K.dim}),sel);
  E+=equip('ptr','Bâche PTR',capsule(30,250,110,100,f(s.ptr),{rx:6,lib:'PTR'}),sel);
  L+=trait('M140 300H190M190 190V440',K.ris,2.6);                                                           // collecteur d'aspiration des pompes
  L+=trait('M190 190H246M190 330H246M190 390H246',K.ris,2.6);
  E+=equip('eas','Aspersion enceinte (EAS)',pompe(260,190,b(s.eas),14),sel)+equip('ishp','Injection moyenne pression',pompe(260,330,b(s.ishp),14),sel)+equip('isbp','Injection basse pression',pompe(260,390,b(s.isbp),14),sel);
  T+=texte(260,170,'EAS',{taille:10.5,c:K.dim,gras:true})+texte(260,312,'IS MP',{taille:10.5,c:K.dim,gras:true})+texte(260,422,'IS BP',{taille:10.5,c:K.dim,gras:true});
  L+=trait('M274 190H360V80H880',K.asg,2.4,{op:s.eas?1:.5});for(let x=500;x<=860;x+=60)L+='<path d="M'+x+' 82l-6 11M'+x+' 82v13M'+x+' 82l6 11" stroke="'+(s.eas?K.asg:'#9aa6ab')+'" stroke-width="1.6" fill="none"/>';
  L+=trait('M274 330H600V262H640M274 390H610V282H640',K.ris,2.6,{op:f(s.inj)!==null&&s.inj>0.02?1:.55});
  for(let i=0;i<4;i++){const ax=450+i*40;E+=equip('accu','Accumulateurs',capsule(ax,120,28,58,null,{rx:12}),sel);L+=trait('M'+(ax+14)+' 178V196',K.ris,2,{op:s.accIso===true?.35:1});}
  L+=trait('M464 196H630V240H640',K.ris,2,{op:s.accIso===true?.35:1});T+=texte(450,110,'ACCUMULATEURS',{taille:10.5,c:K.dim,gras:true,ancre:'start'});
  L+=trait('M720 428V452H190V440',K.ris,2.2,{tirets:true,op:s.recirc?1:.45});E+=equip('recirc','Recirculation depuis le puisard',vanne(560,452,b(s.recirc)),sel);
  E+=equip('enceinte','Puisard de l’enceinte','<rect x="680" y="412" width="90" height="16" rx="3" fill="'+(f(s.puisard)!==null&&s.puisard>0.01?K.eauNiv:'#e8eef1')+'" stroke="'+K.bord+'"/>',sel);T+=texte(725,406,'PUISARD',{taille:10.5,c:K.dim,gras:true});
  T+=valeur(30,20,'Signal IS',s.sigIS?'présent':'—','',{w:120})+valeur(30,60,'Blocage du signal IS',s.isBlk===true?'bloqué':s.isBlk===false?'normal':'—','',{w:150})+valeur(30,100,'Inventaire primaire',num(f(s.inv),0),'%',{w:150})
    +valeur(770,150,'Accumulateurs',num(f(s.accu),0),'%',{w:150})+valeur(770,190,'Isolement enceinte',s.isoEnc?'isolée':'—','',{w:150})+valeur(770,300,'P enceinte',num(f(s.Penc),2),'bar',{w:150})+valeur(770,340,'H2 enceinte',num(f(s.h2),1),'% vol',{w:150});
  return cadre(W,H,L+E+T,'KIS · sauvegardes : injection de sécurité, accumulateurs, aspersion, recirculation, enceinte');}
// ══ 6. ÉLECTRICITÉ : réseau, disjoncteur, transformateur principal, alternateur ; auxiliaires par le transformateur de soutirage
//    (normal) ou le transformateur auxiliaire (secours), tableaux secourus, diesels, ultime secours. Production brute et auxiliaires
//    ne sont pas calculées au 1300 (le moteur ne les donne qu'au N4 et à l'EPR) : pas de case vide.
function transfo(x,y,v){return v?'<circle cx="'+x+'" cy="'+(y-8)+'" r="13" fill="'+K.equip+'" fill-opacity=".85" stroke="'+K.bord+'" stroke-width="1.6"/><circle cx="'+x+'" cy="'+(y+8)+'" r="13" fill="none" stroke="'+K.bord+'" stroke-width="1.6"/>'
  :'<circle cx="'+(x-8)+'" cy="'+y+'" r="13" fill="'+K.equip+'" fill-opacity=".85" stroke="'+K.bord+'" stroke-width="1.6"/><circle cx="'+(x+8)+'" cy="'+y+'" r="13" fill="none" stroke="'+K.bord+'" stroke-width="1.6"/>';}
function synElec(d,sel){const s=st(d),W=980,H=440;let L='',E='',T='';const res=s.reseau===false?false:s.reseau===true?true:null,dj=s.ilote===true?false:res;
  E+=equip('reseau','Réseau extérieur',boite(30,36,150,52,'RÉSEAU',{fond:s.reseau===false?'#fbe3df':K.equip}),sel);
  L+=trait('M180 62H592',K.elec,3);E+=equip('reseau','Disjoncteur de ligne',vanne(250,62,dj),sel);T+=texte(250,44,'DISJONCTEUR',{taille:9.5,c:K.dim,gras:true});
  T+=transfo(360,62,false)+texte(360,98,'TP',{taille:10,c:K.dim,gras:true});
  E+=equip('alternateur','Alternateur','<circle cx="622" cy="62" r="30" fill="'+K.equip+'" stroke="'+K.bord+'" stroke-width="1.6"/>'+texte(622,66,'ALT',{gras:true,taille:11}),sel)+texte(622,110,Number.isFinite(s.Pelec)?num(s.Pelec,0)+' MWe':'—',{taille:13,gras:true,c:'#0f3b52'});
  // soutirage (normal) entre le transformateur principal et l'alternateur ; transformateur auxiliaire (secours) depuis le réseau
  L+=trait('M500 62V230',K.elec,2.6)+trait('M105 88V230',K.elec,2.2,{tirets:true});T+=transfo(500,146,true)+texte(522,150,'TS',{taille:10,c:K.dim,gras:true,ancre:'start'})+transfo(105,150,true)+texte(127,154,'TA (secours)',{taille:10,c:K.dim,gras:true,ancre:'start'});
  L+=trait('M105 230H560',K.elec,3.4);T+=texte(116,222,'TABLEAUX DES AUXILIAIRES',{taille:10,c:K.dim,gras:true,ancre:'start'});
  E+=equip('lh','Tableaux secourus LHA et LHB','<rect x="190" y="280" width="140" height="40" rx="4" fill="'+K.equip+'" stroke="'+K.bord+'" stroke-width="1.6"/>'+texte(260,305,'TABLEAU LHA',{taille:11,gras:true})+'<rect x="380" y="280" width="140" height="40" rx="4" fill="'+K.equip+'" stroke="'+K.bord+'" stroke-width="1.6"/>'+texte(450,305,'TABLEAU LHB',{taille:11,gras:true}),sel);
  L+=trait('M260 230V280M450 230V280',K.elec,3)+trait('M260 320V360M450 320V360',K.elec,3);
  E+=equip('diesel','Diesels LHP/LHQ','<rect x="230" y="360" width="60" height="44" rx="4" fill="'+coul(b(s.diesel))+'" stroke="'+K.bord+'" stroke-width="1.6"/>'+texte(260,387,'DG A',{gras:true,taille:11,c:'#fff'})+'<rect x="420" y="360" width="60" height="44" rx="4" fill="'+coul(b(s.diesel))+'" stroke="'+K.bord+'" stroke-width="1.6"/>'+texte(450,387,'DG B',{gras:true,taille:11,c:'#fff'}),sel);
  L+=trait('M520 300H600V382H620',K.elec,2.4,{tirets:true});E+=equip('lls','Ultime secours','<rect x="620" y="360" width="80" height="44" rx="4" fill="'+coul(b(s.lls))+'" stroke="'+K.bord+'" stroke-width="1.6"/>'+texte(660,387,'US',{gras:true,taille:11,c:'#fff'}),sel);
  T+=texte(360,428,'DIESELS LHP/LHQ (un par voie) · ULTIME SECOURS',{taille:10,c:K.dim,gras:true});
  T+=valeur(770,150,'Production nette',num(f(s.Pelec),0),'MWe',{w:180})+valeur(770,190,'Réseau extérieur',s.reseau===true?'présent':s.reseau===false?'perdu':'—','',{w:180})
    +valeur(770,230,'Îlotage',s.ilote?'îlotée':'—','',{w:180})+valeur(770,270,'Perte totale (H3)',s.h3?'présente':'—','',{w:180});
  return cadre(W,H,L+E+T,'KIS · électricité : réseau, alternateur, soutirage et secours, tableaux secourus, diesels, ultime secours');}
// ══ 7. REFROIDISSEMENT (page seule, demande du 04/10) : la source du site en bande d'eau au bas de l'écran (prises et rejets), la
//    circulation CRF du condenseur, l'eau brute secourue SEC, la réfrigération intermédiaire RRI et le refroidissement à l'arrêt RRA.
//    Aux sites à tours, un aéroréfrigérant refroidit la circulation (panache quand la CRF est en service) et le fleuve fait l'appoint.
//    Dessin seul : aucune grandeur de tour (débit, température d'eau chaude) n'est simulée.
function aero(x,y,on){const h=150,w0=120,w1=76,w2=96,yr=y-40;
  return '<g aria-hidden="true"><defs><linearGradient id="s13-k-aero" x1="0" x2="1"><stop offset="0" stop-color="#f1f4f5"/><stop offset=".5" stop-color="#dbe2e5"/><stop offset="1" stop-color="#aebbc1"/></linearGradient></defs>'+(on?'<g fill="#eef3f5" opacity=".95"><ellipse cx="'+x+'" cy="'+(y-h-18)+'" rx="46" ry="18"/><ellipse cx="'+(x-24)+'" cy="'+(y-h-34)+'" rx="34" ry="16"/><ellipse cx="'+(x+26)+'" cy="'+(y-h-38)+'" rx="38" ry="18"/><ellipse cx="'+(x+4)+'" cy="'+(y-h-58)+'" rx="30" ry="14"/></g>':'')
    +'<path d="M'+(x-w0/2)+' '+y+'Q'+(x-w1/2-6)+' '+(y-h*.55)+' '+(x-w2/2)+' '+(y-h)+'H'+(x+w2/2)+'Q'+(x+w1/2+6)+' '+(y-h*.55)+' '+(x+w0/2)+' '+y+'Z" fill="url(#s13-k-aero)" stroke="'+K.bord+'" stroke-width="1.6"/>'
    +'<path d="M'+(x-w0/2+12)+' '+yr+'H'+(x+w0/2-8)+'" stroke="'+K.crf+'" stroke-width="2"/>'+[-36,-12,12,36].map(dx=>'<path d="M'+(x+dx)+' '+(yr+2)+'v10M'+(x+dx-5)+' '+(yr+3)+'l-3 8M'+(x+dx+5)+' '+(yr+3)+'l3 8" stroke="'+K.crf+'" stroke-width="1.3" fill="none"/>').join('')
    +'<rect x="'+(x-w0/2-10)+'" y="'+y+'" width="'+(w0+20)+'" height="10" rx="2" fill="#bfdcef" stroke="'+K.bord+'"/></g>';}
function synRefroid(d,sel){const s=st(d),W=980,H=500,tour=s.srcType==='tour',on=k=>({op:s[k]===false?.4:1});let L='',E='',T='';
  const lib={mer:'MER',estuaire:'ESTUAIRE',fleuve:'FLEUVE',tour:'FLEUVE'}[s.srcType]||'SOURCE FROIDE';
  let vag='';for(const yv of [456,472]){vag+='M210 '+yv;for(let x=210;x<930;x+=24)vag+='q6 -6 12 0t12 0';}
  E+=equip('source','Source froide','<rect x="30" y="440" width="920" height="44" rx="4" fill="#d8ebf6" stroke="'+K.bord+'" stroke-width="1.6"/><path d="'+vag+'" stroke="'+K.crf+'" stroke-width="1.6" fill="none" opacity=".75"/>'+texte(44,467,lib,{taille:12,gras:true,c:'#21404d',ancre:'start'}),sel);
  E+=equip('condenseur','Condenseur',boite(420,130,180,80,'CONDENSEUR'),sel);T+=texte(510,228,'P '+(Number.isFinite(s.Pcond)?num(s.Pcond*1000,0)+' mbar':'—'),{taille:11,c:K.dim,gras:true});
  if(tour){E+=equip('tour','Aéroréfrigérant',aero(170,330,s.crf===true),sel);T+=texte(170,358,'AÉRORÉFRIGÉRANT',{taille:10.5,c:K.dim,gras:true});
    L+=trait('M240 335H300V170H420',K.crf,3.2,on('crf'))+trait('M600 170H650V100H262V290H222',K.crf,3.2,on('crf'));
    L+=trait('M120 440V340',K.crf,2,{tirets:true})+trait('M220 340V440',K.crf,2,{tirets:true});T+=texte(112,404,'appoint',{taille:10,c:K.dim,ancre:'end'})+texte(228,404,'purge',{taille:10,c:K.dim,ancre:'start'});
    E+=equip('crf','Circulation CRF',pompe(360,170,b(s.crf),15),sel);T+=texte(360,146,'CRF',{taille:11,c:K.dim,gras:true});}
  else{L+=trait('M120 440V170H420',K.crf,3.2,on('crf'))+trait('M600 170H930V440',K.crf,3.2,on('crf'));
    E+=equip('crf','Circulation CRF',pompe(270,170,b(s.crf),15),sel);T+=texte(270,146,'CRF',{taille:11,c:K.dim,gras:true})+texte(140,300,'prise',{taille:10,c:K.dim,ancre:'start'})+texte(922,300,'rejet',{taille:10,c:K.dim,ancre:'end'});}
  // SEC (prise et rejet) → échangeurs RRI/SEC → RRI → échangeurs RRA ; RRA entre le primaire et ses échangeurs
  L+=trait('M380 440V358H460',K.crf,2.4,on('sec'))+trait('M540 386V440',K.crf,2.4,on('sec'));E+=equip('sec','Eau brute secourue SEC',pompe(380,404,b(s.sec),13,-90),sel);T+=texte(362,408,'SEC',{taille:11,c:K.dim,gras:true,ancre:'end'})+texte(548,420,'rejet',{taille:10,c:K.dim,ancre:'start'});
  E+=equip('rri','Réfrigération intermédiaire RRI','<rect x="460" y="330" width="120" height="56" rx="4" fill="'+(s.rri===false?'#fbe3df':K.equip)+'" stroke="'+K.bord+'" stroke-width="1.6"/><path d="M476 354h12l6-10l8 20l8-20l8 20l8-20l6 10h12" stroke="'+K.rri+'" stroke-width="1.8" fill="none"/>'+texte(520,378,'RRI / SEC',{taille:9.5,c:K.dim,gras:true}),sel);
  L+=trait('M580 358H660',K.rri,2.6,on('rri'));T+=texte(620,350,'RRI',{taille:11,c:K.rri,gras:true});
  E+=equip('rra','Refroidissement à l’arrêt (RRA)',boite(660,334,110,48,'RRA',{fond:s.rra===true?'#fde3df':K.equip}),sel);L+=trait('M770 358H880V262',K.rri,2.2,{op:s.rra?1:.4});
  E+=equip('rra','Refroidissement à l’arrêt (RRA)',pompe(830,358,b(s.rra),13),sel);T+=texte(830,388,'pompes RRA',{taille:10,c:K.dim})+texte(880,252,'PRIMAIRE',{taille:10,c:K.dim,gras:true});
  T+=valeur(40,16,'T source froide',num(f(s.Tsrc),1),'°C',{w:190})+valeur(250,16,'Saison',({hiver:'hiver',mi:'mi-saison',ete:'été'}[s.saison]||'—'),'',{w:190})+valeur(460,16,'P condenseur',Number.isFinite(s.Pcond)?num(s.Pcond*1000,0):'—','mbar',{w:190})
    +valeur(670,16,'Source du site',({mer:'mer',estuaire:'estuaire',fleuve:'fleuve, circuit ouvert',tour:'fleuve et aéroréfrigérants'}[s.srcType]||'—'),'',{w:270});
  return cadre(W,H,L+E+T,'KIS · refroidissement : source froide'+(tour?' et aéroréfrigérant':'')+', CRF, SEC, RRI, RRA');}
const SYNOPTIQUES=[['syn-primaire','Primaire',synPrimaire],['syn-eauvapeur','Eau-vapeur',synEauVapeur],['syn-turbine','Ligne d’arbre',synTurbine],['syn-posteeau','Poste d’eau',synPosteEau],['syn-sauvegardes','Sauvegardes',synSauvegardes],['syn-electricite','Électricité',synElec],['syn-refroid','Refroidissement',synRefroid]];
// ══ FICHES D'ÉQUIPEMENT (8c A, « Dialogue équipement » de l'EPR sans commande) : état, mesures, alarmes, dernières lignes du journal,
//    « Commander au pupitre › » vers la zone où il se commande. [nom, page:zone du pupitre, états, mesures, verrines, mots du journal]
// V24 (S441, S442, S557, 14/10) : une pompe ASG ne montre que son ordre (ORD) ; le LLS est sollicité, il lui faut la vapeur des GV (LLS).
const MA=v=>v===true?['en marche','r']:v===false?['à l’arrêt','v']:['—',''],SV=v=>v===true?['en service','r']:v===false?['hors service','v']:['—',''],
  ORD=v=>v===true?['marche','r']:v===false?['arrêt','v']:['—',''],LLS=v=>v===true?['sollicité','r']:v===false?['à l’arrêt','v']:['—',''];
const EQUIP={
  cuve:['Cuve et cœur','barres:RGL',s=>[['État de tranche',[({ANGV:'AN/GV',ANRRA:'AN/RRA',APIF:'API fermé',APIO:'API ouvert'})[s.etat]||s.etat||'—','']],['Arrêt d’urgence',s.scram?['grappes au fond','r']:['—','']]],(s,d)=>[['Puissance neutronique',Number.isFinite(s.Pn)?num(s.Pn*100,1):'—','% PN'],['Puissance thermique',num(f(d.powerThermal),0),'MWth'],['Niveau cuve',num(f(s.lvlCuve),0),'%'],['Position du groupe R',num(f(s.rod),1),'% extrait']],['aOver','aAu','aDecouv','aDmg'],['GRAPPES','CŒUR','DIVERGENCE','CRITIC','ARRÊT D']],
  gv:['Générateurs de vapeur (quatre)','eauvapeur:ARE',s=>[['Régulation ARE',s.areAuto===true?['AUTO','c']:s.areAuto===false?['MANU','j']:['—','']]],s=>[['Niveau GV (agrégat)',num(f(s.gv),1),'%'],['P vapeur',num(f(s.Psteam),1),'bar'],['T vapeur',num(f(s.tVapGV),0),'°C']],['aGvLo','aGvHi','aDry','aPvap','aSvGv'],['NIVEAU GV','ASSÉCH','GV']],
  gmpp:['Pompes primaires (GMPP)','pressuriseur:RCP',(s,d)=>[['GMPP en marche',Number.isInteger(s.gmppN)?[s.gmppN+' / '+((d.pal&&d.pal.NB)||4),s.gmppN>0?'r':'v']:['—','']]],(s,d)=>[['T branche chaude',num(f(d.tempHot),1),'°C'],['T branche froide',num(f(d.tempCold),1),'°C']],['aGmpp'],['GMPP']],
  pzr:['Pressuriseur','pressuriseur:RCP',s=>[['Régulation pression',s.pzrAuto===true?['AUTO','c']:s.pzrAuto===false?['MANU','j']:['—','']],['Chaufferettes',SV(b(s.heat))],['Aspersion',SV(b(s.spray))]],s=>[['P pressuriseur',num(f(s.Ppzr),1),'bar'],['Consigne de pression',num(f(s.pzrSet),1),'bar']],['aPzrHi','aPzrLo'],['PRESSURISEUR','PRESSION']],
  sebim:['Soupapes du pressuriseur','pressuriseur:RCP',s=>[['Soupapes',s.sebim===true?['ouvertes','r']:s.sebim===false?['fermées','v']:['—','']],['Ouverture volontaire',s.sebimM?['demandée','j']:['—','']]],s=>[['P pressuriseur',num(f(s.Ppzr),1),'bar']],['aSebim','aRdp'],['SOUPAPES DU PRESSURISEUR']],
  rdp:['Réservoir de décharge','pressuriseur:RCP',s=>[['Disque de rupture',s.rdpBurst?['rompu','r']:['—','']]],s=>[['Niveau RDP',f(s.rdp)===null?'—':num(s.rdp*100,0),'%']],['aRdp'],['RDP']],
  accu:['Accumulateurs','surete:RIS',s=>[['Accumulateurs',s.accIso===true?['isolés','v']:s.accIso===false?['alignés','r']:['—','']]],s=>[['Niveau (commun)',num(f(s.accu),0),'%']],['aAcc'],['ACCUMULATEUR','ACCUS']],
  rra:['Refroidissement à l’arrêt (RRA)','electricite:CRF',s=>[['RRA',s.rra===true?['raccordé','r']:s.rra===false?['isolé','v']:['—','']]],s=>[['T moyenne primaire',num(f(s.Tavg),1),'°C'],['P primaire',num(f(s.Ppzr),1),'bar']],['aRra'],['RRA']],
  viv:['Vannes d’isolement vapeur (VIV)','eauvapeur:VVP',s=>[['VIV',s.viv===true?['ouvertes','r']:s.viv===false?['fermées','v']:['—','']]],s=>[['P vapeur',num(f(s.Psteam),1),'bar']],['aViv'],['VIV','ISOLEMENT VAPEUR']],
  admission:['Vannes d’admission turbine','turbo:GRE',s=>[],s=>[['Admission',num(f(s.turb),1),'%'],['P admission HP',num(f(s.Padm),1),'bar']],[],['ADMISSION','TURBINE']],
  turbine:['Turbine','turbo:GRE',(s,d)=>[['Suivi du réseau',d.follow===true?['actif','c']:d.follow===false?['coupé','']:['—','']]],s=>[['Admission',num(f(s.turb),1),'%'],['P admission HP',num(f(s.Padm),1),'bar'],['P électrique',num(f(s.Pelec),0),'MWe']],[],['TURBINE','DÉCLENCHEMENT']],
  hp:['Corps haute pression','turbo:GRE',s=>[],s=>[['P admission HP',num(f(s.Padm),1),'bar'],['Admission',num(f(s.turb),1),'%']],[],['TURBINE']],
  gss:['Sécheurs-surchauffeurs (GSS)','turbo:GRE',s=>[],s=>[['Admission',num(f(s.turb),1),'%']],[],['GSS']],
  bp:['Corps basse pression','turbo:CVI',s=>[],s=>[['P condenseur',Number.isFinite(s.Pcond)?num(s.Pcond*1000,0):'—','mbar']],['aVide'],['VIDE']],
  alternateur:['Alternateur','turbo:GRE',(s,d)=>[['Suivi du réseau',d.follow===true?['actif','c']:d.follow===false?['coupé','']:['—','']],['Îlotage',s.ilote?['îlotée','j']:['—','']]],s=>[['P électrique',num(f(s.Pelec),0),'MWe']],['aReseau','aIlot'],['ALTERNATEUR','ÎLOTAGE','RÉSEAU']],
  gctc:['Contournement au condenseur (GCT-C)','eauvapeur:GCT',s=>[['Mode',s.gctMode==='auto'?['AUTO','c']:s.gctMode==='manu'?['MANU','j']:['—','']]],s=>[['Ouverture',f(s.gct)===null?'—':num(s.gct*100,0),'%'],['Consigne de pression vapeur',num(f(s.gctTgt),1),'bar']],['aGct'],['GCT']],
  gcta:['Contournement à l’atmosphère (GCTa)','eauvapeur:GCT',s=>[['Mode',s.gctaMode==='auto'?['AUTO','c']:s.gctaMode==='manu'?['MANU','j']:['—','']]],s=>[['Ouverture',f(s.gctA)===null?'—':num(s.gctA*100,0),'%']],['aGcta','aRejA'],['GCT']],
  soupapes:['Soupapes des GV','eauvapeur:GCT',s=>[['Soupapes',f(s.svf)===null?['—','']:s.svf>0.02?['ouvertes','r']:['fermées','v']]],s=>[['P vapeur',num(f(s.Psteam),1),'bar']],['aSvGv'],['SOUPAPES DE SÛRETÉ GV']],
  condenseur:['Condenseur','turbo:CVI',s=>[['Extraction des incondensables',SV(b(s.cvi))]],s=>[['P condenseur',Number.isFinite(s.Pcond)?num(s.Pcond*1000,0):'—','mbar']],['aVide','aCvi'],['CONDENSEUR','VIDE','CVI']],
  cvi:['Extraction des incondensables (CVI)','turbo:CVI',s=>[['CVI',SV(b(s.cvi))]],s=>[['P condenseur',Number.isFinite(s.Pcond)?num(s.Pcond*1000,0):'—','mbar']],['aCvi'],['CVI']],
  cex:['Pompes d’extraction (CEX)','eauvapeur:ARE',s=>[],s=>[['P condenseur',Number.isFinite(s.Pcond)?num(s.Pcond*1000,0):'—','mbar']],[],['CEX','EXTRACTION']],
  abp:['Réchauffeurs basse pression (ABP)','eauvapeur:ARE',s=>[],(s,d)=>[['T eau alimentaire (sortie du poste)',releve(d,'tare')===null?'—':num(releve(d,'tare'),0),'°C']],[],[]],
  bache:['Bâche alimentaire','eauvapeur:ARE',s=>[],s=>[['Débit ARE',num(f(s.areOut),0),'%']],[],[]],
  ahp:['Réchauffeurs haute pression (AHP)','eauvapeur:ARE',s=>[],(s,d)=>[['T eau alimentaire',releve(d,'tare')===null?'—':num(releve(d,'tare'),0),'°C']],[],[]],
  are:['Vanne de régulation ARE','eauvapeur:ARE',s=>[['Régulation',s.areAuto===true?['AUTO','c']:s.areAuto===false?['MANU','j']:['—','']],['Eau alimentaire',s.areAvail===false?['perdue','v']:s.areAvail===true?['disponible','r']:['—','']]],s=>[['Débit ARE',num(f(s.areOut),0),'%'],['Niveau GV',num(f(s.gv),1),'%']],['aAre','aGvLo','aGvHi'],['ARE','EAU ALIMENTAIRE']],
  tpa:['Turbopompes alimentaires (TPA)','eauvapeur:ARE',s=>[['TPA',SV(b(s.tpaRun))]],s=>[['Débit ARE',num(f(s.areOut),0),'%']],['aTpa'],['TPA']],
  bacheasg:['Bâche ASG','eauvapeur:ASG',s=>[],s=>[['Niveau bâche ASG',f(s.bacheASG)===null?'—':num(s.bacheASG*100,0),'%'],['Débit ASG',f(s.asg)===null?'—':num(s.asg*100,1),'% nominal']],['aAsg'],['BÂCHE ASG']],
  mpsA:['Motopompe ASG A','eauvapeur:ASG',s=>[['Ordre motopompe A',ORD(b(s.mpsA))]],s=>[['Débit ASG (ensemble)',f(s.asg)===null?'—':num(s.asg*100,1),'% nominal']],['aAsg'],['MPS','MOTOPOMPE']],
  mpsB:['Motopompe ASG B','eauvapeur:ASG',s=>[['Ordre motopompe B',ORD(b(s.mpsB))]],s=>[['Débit ASG (ensemble)',f(s.asg)===null?'—':num(s.asg*100,1),'% nominal']],['aAsg'],['MPS','MOTOPOMPE']],
  tpsA:['Turbopompe ASG A','eauvapeur:ASG',s=>[['Ordre turbopompe A',ORD(b(s.tpsA))],['Vapeur auxiliaire SVA',SV(b(s.svaOn))]],s=>[['P vapeur',num(f(s.Psteam),1),'bar']],['aAsg'],['TPS','TURBOPOMPE']],
  tpsB:['Turbopompe ASG B','eauvapeur:ASG',s=>[['Ordre turbopompe B',ORD(b(s.tpsB))],['Vapeur auxiliaire SVA',SV(b(s.svaOn))]],s=>[['P vapeur',num(f(s.Psteam),1),'bar']],['aAsg'],['TPS','TURBOPOMPE']],
  enceinte:['Enceinte de confinement','surete:EAS',s=>[['Isolement enceinte',s.isoEnc?['isolée','j']:['—','']],['Rupture du confinement',s.encFail?['présente','r']:['—','']]],(s,d)=>[['P enceinte',num(f(s.Penc),2),'bar'],['H2 enceinte',num(f(s.h2),1),'% vol'],['Débit de dose enceinte',(()=>{const v=releve(d,'krte');return v===null?'—':C9.sci(v);})(),'mGy/h']],['aPenc','aIso','aH2','aEncF'],['ENCEINTE','CONFINEMENT','HYDROG']],
  ptr:['Bâche PTR','surete:RIS',s=>[],s=>[['Niveau PTR',f(s.ptr)===null?'—':num(s.ptr*100,0),'%']],['aPtr'],['PTR']],
  ishp:['Injection moyenne pression','surete:RIS',s=>[['Injection MP',MA(b(s.ishp))],['Signal IS',s.sigIS?['présent','r']:['—','']]],s=>[['Inventaire primaire',num(f(s.inv),0),'%']],['aIS'],['ISHP','INJECTION','SIGNAL IS']],
  isbp:['Injection basse pression','surete:RIS',s=>[['Injection BP',MA(b(s.isbp))],['Signal IS',s.sigIS?['présent','r']:['—','']]],s=>[['Inventaire primaire',num(f(s.inv),0),'%']],['aIS'],['ISBP','INJECTION','SIGNAL IS']],
  eas:['Aspersion enceinte (EAS)','surete:EAS',s=>[['Aspersion',MA(b(s.eas))]],s=>[['P enceinte',num(f(s.Penc),2),'bar']],['aEasOn','aPenc'],['EAS','ASPERSION']],
  recirc:['Recirculation depuis le puisard','surete:EAS',s=>[['Recirculation',s.recirc?['engagée','r']:['—','']]],s=>[['Bâche PTR',f(s.ptr)===null?'—':num(s.ptr*100,0),'%']],['aRecirc'],['RECIRC']],
  reseau:['Réseau extérieur','electricite:LH',s=>[['Réseau',s.reseau===false?['perdu','v']:s.reseau===true?['présent','r']:['—','']],['Îlotage',s.ilote?['îlotée','j']:['—','']]],s=>[['Production nette',num(f(s.Pelec),0),'MWe']],['aReseau','aIlot'],['RÉSEAU','LOOP','SOURCE EXTÉRIEURE']],
  lh:['Tableaux secourus LHA et LHB','electricite:LH',s=>[['Perte totale (H3)',s.h3?['présente','r']:['—','']],['Diesels',SV(b(s.diesel))]],s=>[],['aH3'],['LHA','LHB','H3']],
  diesel:['Diesels LHP/LHQ','electricite:LH',s=>[['Diesels',SV(b(s.diesel))]],s=>[],['aDiesel','aH3'],['DIESEL']],
  lls:['Ultime secours','electricite:LH',s=>[['Ultime secours',LLS(b(s.lls))]],s=>[],['aLls'],['LLS','ULTIME']],
  source:['Source froide','electricite:CRF',s=>[['Type',[({mer:'mer',estuaire:'estuaire',fleuve:'fleuve',tour:'fleuve et aéroréfrigérants'}[s.srcType]||'—'),'']],['Saison',[({hiver:'hiver',mi:'mi-saison',ete:'été'}[s.saison]||'—'),'']]],s=>[['T source froide',num(f(s.Tsrc),1),'°C']],['aCrf','aSec'],['SOURCE FROIDE']],
  tour:['Aéroréfrigérant','electricite:CRF',s=>[['Circulation CRF',SV(b(s.crf))]],s=>[['T source froide',num(f(s.Tsrc),1),'°C'],['P condenseur',Number.isFinite(s.Pcond)?num(s.Pcond*1000,0):'—','mbar']],['aCrf'],['CRF','AÉRORÉFRIGÉRANT']],
  crf:['Circulation CRF','electricite:CRF',s=>[['CRF',SV(b(s.crf))]],s=>[['P condenseur',Number.isFinite(s.Pcond)?num(s.Pcond*1000,0):'—','mbar']],['aCrf'],['CRF']],
  sec:['Eau brute secourue SEC','electricite:CRF',s=>[['SEC',SV(b(s.sec))]],s=>[],['aSec'],['SEC']],
  rri:['Réfrigération intermédiaire RRI','electricite:CRF',s=>[['RRI',SV(b(s.rri))]],s=>[],['aRri'],['RRI']]};
const PAGE_PUPITRE={barres:'Barres-flux',pressuriseur:'Pressuriseur',eauvapeur:'Eau-vapeur',turbo:'Turboalternateur',surete:'Panneau de sûreté',electricite:'Électricité et source froide'};
function fiche(d,id){const e=EQUIP[id],s=st(d);
  if(!e)return '<div class="s13-k-fiche s13-k-fiche-vide"><p>Toucher un matériel du synoptique : sa fiche s’ouvre ici (état, mesures, alarmes, journal).</p></div>';
  const [nom,cible,etats,mesures,ids,mots]=e,E=etats(s,d),A=mesures(s,d),par=Object.fromEntries((d.verrines||[]).map(v=>[v.id,v]));
  const al=ids.map(i=>par[i]).filter(v=>v&&v.etat);const M=mots.map(m=>m.toUpperCase());
  const jr=M.length?(d.journal||[]).filter(x=>{const t=String(x.message||'').toUpperCase();return M.some(m=>t.includes(m));}).slice(0,4):[];
  const [page,zone]=cible.split(':');
  return '<div class="s13-k-fiche" aria-live="polite"><div class="s13-k-fiche-t"><b>'+esc(nom)+'</b><small>Fiche d’équipement · consultation</small></div>'
    +'<h4>État</h4>'+(E.length?E.map(([l,[t,c]])=>'<div class="s13-kis-l"><span>'+esc(l)+'</span><b class="s13-kis-e" data-c="'+c+'">'+esc(t)+'</b></div>').join(''):'<p class="s13-kis-n">Aucun état suivi pour ce matériel.</p>')
    +'<h4>Mesures</h4>'+(A.length?A.map(([l,v,u])=>'<div class="s13-kis-l"><span>'+esc(l)+'</span><b>'+esc(v)+'</b><i>'+esc(u||'')+'</i></div>').join(''):'<p class="s13-kis-n">Aucune mesure suivie pour ce matériel.</p>')
    +'<h4>Alarmes</h4>'+(al.length?al.map(v=>'<p class="s13-k-al" data-c="'+(v.etat==='rouge'?'r':'o')+'">'+esc(v.txt)+'</p>').join(''):'<p class="s13-kis-n">Aucune alarme présente.</p>')
    +'<h4>Journal</h4>'+(jr.length?'<div class="s13-kis-ev">'+jr.map(x=>'<p class="'+(x.color==='rouge'?'r':x.color==='jaune'?'o':'')+'"><b>'+esc(x.time)+'</b> '+esc(x.message)+'</p>').join('')+'</div>':'<p class="s13-kis-n">Aucune ligne récente.</p>')
    +'<button type="button" class="s13-kis-b s13-k-aller" data-s13-aller="'+esc(cible)+'">Commander au pupitre › <small>'+esc(PAGE_PUPITRE[page]||'')+'</small></button></div>';}
// ══ FLASH (18A, 23A) : grandes valeurs encadrées, limitées aux grandeurs du moteur.
function flash(d){const s=st(d),g=d.grappes,L=g&&Array.isArray(g.groupes)?g.groupes.filter(x=>!/^S/.test(x.id)):[];
  const grand=(lib,v,u,o={})=>'<div class="s13-k-flash-v'+(o.large?' s13-k-flash-l':'')+'"><span>'+esc(lib)+'</span><b>'+esc(v)+'</b><i>'+esc(u||'')+'</i></div>';
  return '<div class="s13-k-flash">'+grand('Puissance thermique',num(f(d.powerThermal),0),'MWth',{large:true})+grand('Température moyenne',num(f(s.Tavg),1),'°C',{large:true})+grand('Niveau GV',num(f(s.gv),1),'%',{large:true})
    +'<div class="s13-k-flash-g"><span>Positions des groupes de grappes</span><div>'+(L.length?L.map(x=>{const q=C9.posGroupe(g,x);return '<p><b>'+esc(x.id)+'</b><em>'+esc(q.txt==='---'?'—':q.txt)+'</em><small>'+esc(q.u)+'</small></p>';}).join(''):'<p>—</p>')+'</div></div></div>';}
// ══ ALARMES (13A) : les alarmes non urgentes, en jaune (action différable), blanc (automatisme) ou vert (sauvegarde, protection,
//    déclenchement de charge), à l'heure du moteur ; les urgentes restent sur les verrines rouges ; historique des apparitions,
//    disparitions et acquittements. Consultation seule : l'acquittement se fait au pupitre (bouton ACQUITTEMENT).
const COUL_NOM={jaune:'action différable',blanc:'automatisme',vert:'sauvegarde, protection, déclenchement de charge',rouge:'urgente (verrine)'};
function alarmes(ctx){const A=ctx&&ctx.alarmes?ctx.alarmes():{liste:[],historique:[],comptes:{}},c=A.comptes||{};
  const etat=m=>m==='nouvelle'?'nouvelle, à acquitter':m==='disparue'?'disparue, à acquitter':'présente, acquittée';
  return '<div class="s13-k-al-tete"><span data-c="rouge">Urgentes sur verrines <b>'+(c.urgentes||0)+'</b></span><span data-c="jaune">Jaune <b>'+(c.jaune||0)+'</b></span><span data-c="blanc">Blanc <b>'+(c.blanc||0)+'</b></span><span data-c="vert">Vert <b>'+(c.vert||0)+'</b></span><span data-c="acq">À acquitter <b>'+(c.aAcquitter||0)+'</b></span></div>'
    +'<div class="s13-k-al-liste" role="table" aria-label="Alarmes du KIS"><div class="s13-k-al-l s13-k-al-h" role="row"><span>Heure</span><span>Alarme</span><span>Détection</span><span>État</span></div>'
    +(A.liste.length?A.liste.map(a=>'<div class="s13-k-al-l" role="row" data-c="'+a.niveau+'" data-mode="'+a.mode+'" title="'+esc(COUL_NOM[a.niveau]||'')+'"><span>'+esc(a.t)+'</span><span><i aria-hidden="true"></i>'+esc(a.txt)+'</span><span>'+esc(a.seuil||'—')+'</span><span>'+esc(etat(a.mode))+'</span></div>').join(''):'<p class="s13-kis-n">Aucune alarme au KIS.</p>')+'</div>'
    +'<h4 class="s13-k-al-st">Historique</h4><div class="s13-kis-journal s13-k-al-hist">'+(A.historique.length?A.historique.map(h=>'<p data-c="'+(h.urgente?'rouge':h.niveau)+'"><b>'+esc(h.t)+'</b> '+esc(h.type==='apparition'?'Apparition : ':h.type==='disparition'?'Disparition : ':'Acquittement : ')+esc(h.txt)+(h.urgente?' (verrine)':'')+'</p>').join(''):'<p class="s13-kis-n">Aucun événement depuis la prise de quart.</p>')+'</div>'
    ;}
// ══ CARTE DU CŒUR (15A) : les 193 assemblages du 1300 (15 × 15, centres dans le cercle du cœur, comme la carte du châssis), grappes
//    par groupe à leur place lue (Bouzerar 1991, Muniglia 2017 ; plan transféré au P'4), partie insérée en couleur depuis le haut ;
//    huit emplacements réservés du plan de 1991 marqués d'une croix ; détail au toucher. Les vues de la carte calculée (température,
//    puissance, épuisement, indice PF, gaine) sont celles de l'écran natif, ouvert depuis cette page.
const LETTRES='RPNMLKJHGFEDCBA',RANGEES=[7,11,13,13,15,15,15,15,15,15,15,13,13,11,7];
const COUL_G={R:'#c8261f',G1:'#8f9894',G2:'#b3bab6',N1:'#2a2d2c',N2:'#46413b',SA:'#1b4f8f',SB:'#2c6ab0',SC:'#3d82c9',SD:'#5e9bd8'};
function carte(d,etat){const g=d.grappes,pos={},res=new Set((g&&g.reserves)||[]),grs=g&&Array.isArray(g.groupes)?g.groupes:[];
  for(const x of grs){const q=C9.posGroupe(g,x);if(Array.isArray(x.grappes))for(const y of x.grappes)pos[y.rep]={grp:x.id,f:q.f,txt:q.txt,u:q.u};}
  const cell=30,ox=28,oy=8,W=ox+15*cell+8,H=oy+15*cell+22;let h='',nb=0;
  for(let r=0;r<15;r++){const n=RANGEES[r],a=(15-n)/2;for(let c=a;c<a+n;c++){nb++;const rep=LETTRES[c]+(r+1),p=pos[rep],x=ox+c*cell,y=oy+r*cell,sel=etat.case===rep,rv=res.has(rep);
    h+='<g class="s13-k-case" data-s13-case="'+rep+'" role="button" tabindex="0" aria-label="'+esc('Assemblage '+rep+(p?', grappe du groupe '+p.grp:rv?', emplacement réservé':''))+'"><rect x="'+x+'" y="'+y+'" width="'+(cell-2)+'" height="'+(cell-2)+'" rx="2" fill="'+(p?'#ffffff':'#e8eef1')+'" stroke="'+(sel?'#0b6fb8':'#a9b9c1')+'" stroke-width="'+(sel?2.6:1)+'"'+(rv?' stroke-dasharray="3 2"':'')+'/>';
    if(p){const f=Number.isFinite(p.f)?p.f:null;if(f!==null&&f<1)h+='<rect x="'+(x+3)+'" y="'+(y+3+(cell-8)*f).toFixed(1)+'" width="'+(cell-8)+'" height="'+((cell-8)*(1-f)).toFixed(1)+'" fill="'+(COUL_G[p.grp]||'#333')+'"/>';
      h+=texte(x+cell/2-1,y+cell/2+3.5,p.grp,{taille:9.5,gras:true,c:f!==null&&f<.45&&!/G/.test(p.grp)?'#fff':'#1f3741'});}
    else if(rv)h+='<path d="M'+(x+9)+' '+(y+9)+'l10 10m0-10l-10 10" stroke="#7b8f99" stroke-width="1.6"/>';
    h+='</g>';}}
  for(let c=0;c<15;c++)h+=texte(ox+c*cell+cell/2-1,oy+15*cell+15,LETTRES[c],{taille:10,c:K.dim});
  for(let r=0;r<15;r++)h+=texte(ox-8,oy+r*cell+cell/2+3.5,String(r+1),{taille:10,c:K.dim,ancre:'end'});
  const svg='<svg class="s13-k-carte" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc('Carte du cœur : '+nb+' assemblages, '+Object.keys(pos).length+' grappes placées, '+res.size+' emplacements réservés')+'">'+h+'</svg>';
  const rep=etat.case,p=rep&&pos[rep];
  const detail=!rep?'<p class="s13-kis-n">Toucher un assemblage : sa grappe, son groupe et sa position.</p>'
    :'<div class="s13-k-fiche-t"><b>Assemblage '+esc(rep)+'</b><small>'+(p?'grappe du groupe '+esc(p.grp):res.has(rep)?'emplacement réservé, sans grappe':'sans grappe')+'</small></div>'
     +(p?'<div class="s13-kis-l"><span>Position du groupe</span><b>'+esc(p.txt==='---'?'—':p.txt)+'</b><i>'+esc(p.u==='pas'?'pas extraits':'% extrait')+'</i></div><div class="s13-kis-l"><span>Partie insérée</span><b>'+(Number.isFinite(p.f)?num((1-p.f)*100,0):'—')+'</b><i>%</i></div>':'');
  const groupes='<div class="s13-k-carte-g">'+grs.map(x=>{const q=C9.posGroupe(g,x);return '<p><i style="background:'+(COUL_G[x.id]||'#333')+'"></i><b>'+esc(x.id)+'</b><span>'+(Array.isArray(x.grappes)?x.grappes.length:'—')+' grappes</span><em>'+esc(q.txt==='---'?'—':q.txt)+' '+esc(q.u)+'</em></p>';}).join('')+'</div>';
  return '<div class="s13-k-synpage"><div class="s13-k-synvue s13-k-cartevue" data-n4-pince="kis-carte">'+svg+'</div><div class="s13-k-fiche">'+detail+'<h4>Groupes</h4>'+groupes+(grs.length?'<p class="s13-kis-n">Effectifs du plan de référence à 65 grappes retenu dans SIMUREP, sans les quatre grappes d’arrêt prévues au quatrième réexamen.</p>':'')
    +'<button type="button" class="s13-kis-b s13-k-aller" data-n4-page="coeur">Carte calculée › <small>température, puissance, épuisement, indice PF, gaine</small></button></div></div>';}
// ══ SÛRETÉ (19A, 23A : une page du KIS, pas un écran de plus) : barres des grandeurs de sûreté et ébulliomètre (loi de saturation du
//    moteur, comme le panneau de sûreté du 900), états tout ou rien des sauvegardes ; sans sigle KPS (non attesté au 1300).
function surete(d){const s=st(d),Th=f(d.tempHot),Tf=f(d.tempCold),ts=C9.tsat(s.Ppzr),marge=Th!==null&&Number.isFinite(ts)?ts-Th:null,sat=marge!==null&&marge<=0;
  const kr=releve(d,'krte'),dv=releve(d,'dvn');
  const barre=(lib,v,u,a,bb,dg,o={})=>{const x=f(v),fr=x===null?0:Math.max(0,Math.min(1,(x-a)/(bb-a)));return '<div class="s13-k-sb'+(o.alerte?' s13-k-sb-a':'')+'"><span>'+esc(lib)+'</span><em><i style="width:'+(fr*100).toFixed(1)+'%"></i></em><b>'+esc(x===null?'—':o.sci?C9.sci(x):num(x,dg))+'</b><small>'+esc(u)+'</small></div>';};
  const tor=(lib,on,c)=>'<span class="s13-k-tor" data-on="'+(on===true)+'" data-c="'+(c||'')+'">'+esc(lib)+'</span>';
  return '<div class="s13-k-surete"><section><h4>Grandeurs de sûreté</h4>'
    +barre('P primaire',s.Ppzr,'bar',0,180,1)+barre('T branche chaude',Th,'°C',0,350,1)+barre('T branche froide',Tf,'°C',0,350,1)+barre('Marge à l’ébullition',marge,'°C',-20,80,1,{alerte:sat})
    +barre('Niveau cuve',s.lvlCuve,'%',0,100,0)+barre('Inventaire primaire',s.inv,'%',0,120,0)+barre('P enceinte',s.Penc,'bar',0,5,2)+barre('H2 enceinte',s.h2,'% vol',0,10,1)
    +barre('Débit de dose enceinte',kr,'mGy/h',0,10,2,{sci:true})+barre('Activité cheminée',dv,'Bq/m³',0,1e4,0,{sci:true})
    +'<div class="s13-k-tors">'+tor('Arrêt réacteur',!!s.scram,'r')+tor('Signal IS',!!s.sigIS,'r')+tor('Isolement enceinte',!!s.isoEnc,'o')+tor('Aspersion enceinte',!!s.eas,'o')+tor('ASG en service',(s.asg||0)>0,'o')+tor('Recirculation',!!s.recirc,'o')+tor('Rupture du confinement',!!s.encFail,'r')+'</div></section>'
    +'<section><h4>Ébulliomètre</h4>'+C9.ebulliometre(s.Ppzr,Th,Tf,marge)+'<div class="s13-kis-l"><span>Marge à l’ébullition</span><b'+(sat?' class="s13-k-rouge"':'')+'>'+esc(num(marge,1))+'</b><i>°C</i></div><p class="s13-kis-n">× branche chaude · + branche froide · trait : marge jusqu’à la saturation.</p></section></div>';}
// ══ Courbes : mêmes tracés que les postes (relevés du moteur), passés à la palette claire du KIS.
function courbes(ctx){if(!ctx||!ctx.courbe)return '<p class="s13-kis-n">Courbes indisponibles.</p>';let h=ctx.courbe(true)+ctx.options();
  const M=ctx.metriques||{};for(const m of Object.values(M))if(m&&m.colors)h=h.split(m.colors[0]).join(m.colors[1]);
  return '<div class="s13-k-courbes">'+h.replace(/#090e12/g,'#ffffff').replace(/#273139/g,'#dde5e8').replace(/#94a7b2/g,'#5b717b')+'</div>';}
// ── Systèmes élémentaires (fonctions du KIT du 900, 12A) : au 1300, deux turbopompes ASG distinctes.
const ASG1300=['ASG','Alimentation de secours',['aAsg'],['ASG','MPS','TPS','BÂCHE ASG','SVA','TURBOPOMPE'],
  s=>[['Ordre motopompe A',C9.MA(s.mpsA)],['Ordre motopompe B',C9.MA(s.mpsB)],['Ordre turbopompe A',C9.MA(s.tpsA)],['Ordre turbopompe B',C9.MA(s.tpsB)],['Vapeur auxiliaire SVA',s.svaOn===true?['EN SERVICE','v']:['—','']]],
  s=>[['Débit ASG',Number.isFinite(s.asg)?num(s.asg*100,1):'—','% nominal'],['Bâche ASG',Number.isFinite(s.bacheASG)?num(s.bacheASG*100,0):'—','%']]];
// V24 (S557, 14/10) : au 1300, l'ultime secours est le turbo-alternateur LLS ; sollicité, il lui faut la vapeur des GV (fiche LH du 900 reprise).
const LH1300=x=>[x[0],x[1],x[2],x[3],s=>x[4](s).map(([l,v])=>[l,l==='Ultime secours'&&s.lls?['SOLLICITÉ','j']:v]),...x.slice(5)];
// V34 (3-01, 20/10) : au 1300, l'injection de sécurité est à moyenne pression (V24 S217) : la ligne du RIS du 900 reprise est renommée.
const RIS1300=x=>[x[0],x[1],x[2],x[3],(s,d)=>x[4](s,d).map(([l,v])=>[l.replace('Injection haute','Injection moyenne'),v]),...x.slice(5)];
const SYSTEMES=C9.KIT_SYS.map(x=>x[0]==='ASG'?ASG1300:x[0]==='LH'?LH1300(x):x[0]==='RIS'?RIS1300(x):x);
const norm=t=>String(t||'').toUpperCase().replace(/[’']/g,'\'');
function systemes(d,etat,niveau){
  const sys=SYSTEMES.find(x=>x[0]===etat.sys);
  if(!sys)return '<p class="s13-kis-n">Choisir un système : ses alarmes et événements, ses états et ses mesures.</p><div class="s13-kis-g">'
    +SYSTEMES.map(([code,nom,ids])=>{const {n,haut}=niveau(ids,d);return '<button type="button" class="s13-kis-t" data-s13-kis-sys="'+code+'" data-niveau="'+haut+'"><b>'+code+'</b><span>'+esc(nom)+'</span><small>'+(n?n+(n>1?' alarmes':' alarme'):'—')+'</small></button>';}).join('')+'</div>';
  const [code,nom,,mots,etats,mesures,natif]=sys,s=st(d),M=mots.map(norm);
  const ev=(d.journal||[]).filter(x=>{const t=norm(x.message);return M.some(m=>t.includes(m));}).slice(0,14);
  const E=etats(s,d),A=mesures(s,d);
  return '<div class="s13-kis-sys"><h3><button type="button" class="s13-kis-b" data-s13-kis-sys="">‹ Systèmes</button>'+esc(code+' · '+nom)+'</h3><div class="s13-kis-d">'
    +'<section><h4>Alarmes et événements</h4><div class="s13-kis-ev">'+(ev.length?ev.map(x=>'<p class="'+(x.color==='rouge'?'r':x.color==='jaune'?'o':'')+'"><b>'+esc(x.time)+'</b> '+esc(x.message)+'</p>').join(''):'<p class="s13-kis-n">Aucun événement récent pour ce système.</p>')+'</div></section>'
    +'<section><h4>États (tout ou rien)</h4>'+(E.length?E.map(([l,[t,c]])=>'<div class="s13-kis-l"><span>'+esc(l)+'</span><b class="s13-kis-e" data-c="'+c+'">'+esc(t)+'</b></div>').join(''):'<p class="s13-kis-n">—</p>')
    +'<h4>Mesures (analogiques)</h4>'+(A.length?A.map(([l,v,u])=>'<div class="s13-kis-l"><span>'+esc(l)+'</span><b>'+esc(v)+'</b><i>'+esc(u||'')+'</i></div>').join(''):'<p class="s13-kis-n">—</p>')
    +(natif?'<button type="button" class="s13-kis-b" data-n4-page="'+natif+'">Neutronique et KRT ›</button>':'')+'</section></div></div>';}
function journal(d){const L=(d.journal||[]).slice(0,60);return '<div class="s13-kis-journal" aria-label="Journal de la tranche">'+(L.length?L.map(x=>'<p class="'+(x.color==='rouge'?'r':x.color==='jaune'?'o':'')+'"><b>'+esc(x.time)+'</b> '+esc(x.message)+'</p>').join(''):'<p class="s13-kis-n">Journal vide.</p>')+'</div>';}
// ══ CADRE ET PAGES (23A : un écran, des pages). Synoptiques sur la première rangée, les autres pages sur la seconde.
const AUTRES=[['flash','FLASH'],['surete','Sûreté'],['alarmes','Alarmes'],['journal','Journal'],['systemes','Systèmes'],['courbes','Courbes'],['carte','Carte du cœur']],NATIFS=[['coeur','Carte calculée'],['instrumentation','Neutronique et KRT'],['pt','Domaine P/T']];
const PAGES=[...SYNOPTIQUES.map(([id,l])=>[id,l]),...AUTRES];
const TITRES=Object.assign(Object.fromEntries(SYNOPTIQUES.map(([id,l])=>[id,'Synoptique · '+l])),{flash:'FLASH · grandeurs principales',surete:'Sûreté · grandeurs et ébulliomètre',carte:'Carte du cœur · grappes',alarmes:'Alarmes',journal:'Journal de la tranche',systemes:'Systèmes élémentaires',courbes:'Courbes'});
const horloge=d=>{const t=Number.isFinite(d.simulationTime)?d.simulationTime:null;if(t===null)return '';const h=Math.floor(t/3600),m=Math.floor(t/60%60),s=Math.floor(t%60);return 'T+'+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');};
function cadreKis(d,page,titre,corps){
  const bt=([id,l],natif)=>'<button type="button" '+(natif?'data-n4-page':'data-s13-kis')+'="'+id+'" aria-current="'+(id===page?'page':'false')+'">'+esc(l)+'</button>';
  return '<section class="s13-kis" aria-label="'+esc('KIS · '+titre)+'"><header class="s13-kis-tete"><b>KIS</b><span>'+esc(titre)+'</span><em>'+esc(horloge(d))+'</em></header>'
    +'<nav class="s13-kis-pages" aria-label="Pages du KIS"><div class="s13-kis-rang" role="group" aria-label="Synoptiques">'+SYNOPTIQUES.map(([id,l])=>bt([id,l])).join('')+'<span class="s13-kis-suite" aria-hidden="true">›</span>'+'</div><div class="s13-kis-rang s13-kis-rang2" role="group" aria-label="Autres pages">'+AUTRES.map(x=>bt(x)).join('')+NATIFS.map(x=>bt(x,true)).join('')+'<span class="s13-kis-suite" aria-hidden="true">›</span>'+'</div></nav>'
    +'<div class="s13-kis-corps">'+corps+'</div><footer class="s13-kis-pied">Supervision de tranche · consultation, aucune commande</footer></section>';}
// Rendu de la page courante du KIS. etat : {page, sys, equip} ; ctx : niveau(ids,d) des systèmes, tracés des courbes.
function rendu(d,etat,ctx={}){const page=TITRES[etat.page]?etat.page:'syn-primaire',syn=SYNOPTIQUES.find(x=>x[0]===page);
  if(syn)return cadreKis(d,page,TITRES[page],'<div class="s13-k-synpage"><div class="s13-k-synvue" data-n4-pince="kis-'+esc(page)+'">'+syn[2](d,etat.equip)+'</div>'+fiche(d,etat.equip)+'</div>');
  const corps=page==='flash'?flash(d):page==='surete'?surete(d):page==='carte'?carte(d,etat):page==='alarmes'?alarmes(ctx):page==='journal'?journal(d):page==='courbes'?courbes(ctx):systemes(d,etat,ctx.niveau||(()=>({n:0,haut:''})));
  return cadreKis(d,page,TITRES[page],corps);}
// Lot 4 ter (6A du 07/10) : en bas de la page Alarmes de la salle, le journal de la tranche sur l'écran du KIS, comme sa page Journal
// (même en-tête, mêmes lignes, même pied), sans les touches de pages : aucune entrée de menu, aucune commande.
function journalEcran(d){return '<section class="s13-kis s13-kis-seul" aria-label="'+esc('KIS · '+TITRES.journal)+'"><header class="s13-kis-tete"><b>KIS</b><span>'+esc(TITRES.journal)+'</span><em>'+esc(horloge(d||{}))+'</em></header>'
  +'<div class="s13-kis-corps">'+journal(d||{})+'</div><footer class="s13-kis-pied">Supervision de tranche · consultation, aucune commande</footer></section>';}
// Écran natif (neutronique et KRT, carte du cœur, domaine P/T) dans le cadre du KIS.
function natif(d,page,titre){return cadreKis(d||{},page,titre,'<div data-n4-live-slot="'+page+'" class="n4-live-slot" aria-label="'+esc('KIS · '+titre)+'"></div>');}
return Object.freeze({rendu,natif,journalEcran,fiche,flash,EQUIP,SYNOPTIQUES,SYSTEMES,PAGES,NATIFS,TITRES});
});
