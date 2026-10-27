// SIMUREP — © 2026 AnthoninP — Tous droits réservés. Synoptique mural de la salle 900 (J2b), dessin seul.
// D'après les photos de Gravelines 5 (matrice SDC § 15.2, S1) et la réponse 3A d'Anthonin (03/10) : fond ardoise, traits
// peints sans défilement, cuve ronde au centre et trois boucles en étoile, matériels en blanc ; seules les diodes changent :
// rouge allumée = en service, circuit fermé, « pas touche » (vanne où l'eau passe, pompe en marche), verte allumée = hors service
// (9 bis et 9 ter du grand QCM du 1300, nuit du 03/10, qui remplacent la règle 3 bis) ; groupe turbo-alternateur à un
// corps HP, le GSS et trois corps BP. Il garde les fonctions du synoptique 2D du pupitre classique : niveaux, mesures,
// états des pompes et vannes. Seules les grandeurs reçues s'affichent : le niveau du pressuriseur, que le moteur ne calcule
// pas, n'est pas dessiné ; T eau alimentaire, fuite VVP et DVN sont les relevés de l'enregistreur de la tranche (même
// calcul que le pupitre classique). Le moteur ne donne que le nombre de GMPP en marche : diodes éteintes quand il ne dit
// pas lesquelles (D12/D16). Aucun repère de système recopié. Aucun identifiant SVG : le dessin figure deux fois dans la page.
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.SDC900Synoptique=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
// J6 (96A) : tableaux secourus sous tension, règle du moteur pour les motopompes ASG du 900 et du 1300 (réseau, diesels, ou îlotage
// turbine tournante) ; une source inconnue n'affirme rien. Commandée sans tension, la motopompe ne tourne pas : diode verte (hors service)
// au mur et au KIS, « non alimentée » aux TPL des salles, comme la 2.17 (H3).
const alimentee=s=>s.reseau===true||s.diesel===true||(s.ilote===true&&s.turb>3)?true:s.reseau===false&&s.diesel===false&&(s.ilote===false||(s.ilote===true&&Number.isFinite(s.turb)))?false:null;
const nonAlimentee=(s,k)=>s[k]===true&&alimentee(s)===false;
// J6, 2b (150A) : une turbopompe ASG ne débite rien sous 6 bar de vapeur (capacité ASG du moteur, index.html) ; commandée, elle s'affiche
// « sans vapeur » aux TPL et hors service au mur et au KIS, comme la motopompe sans tension (96A). Vapeur inconnue : rien d'affirmé.
const sansVapeur=(s,k)=>s[k]===true&&Number.isFinite(s.Psteam)&&s.Psteam<=6;
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=(v,d=0)=>Number.isFinite(v)?v.toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d}):'—';
// Retour d'Anthonin (14/10 au soir) : fond bien plus sombre, presque noir, comme sur la photo du mur de Gravelines 5 (S1 de la matrice
// SDC : « fond noir ») ; il remplace l'ardoise #29313a, et la patine rayée ne couvre plus le synoptique (salle-900.css).
const GRAVELINES={fond:'#101317',prim:'#e2483c',vap:'#ec9a35',are:'#4277cc',asg:'#8dc8ee',ris:'#d8c25a',rra:'#59b770',crf:'#3fa48e',enc:'#e7e0c9',equip:'#e9ecee',bord:'#8f989e',txt:'#eef1f3',dim:'#9aa3aa',val:'#ffd27a',eau:'#78b2de'};
// CP0 du Bugey (J2b, 03/10, demande d'Anthonin) : bandeau noir à traits fins, primaire orangé, vapeur jaune, eaux en bleu acier,
// matériels blancs, d'après les photos de la salle du Bugey 2 (Le Progrès, 2006) et d'EDF (2021) ; mêmes circuits, mêmes
// matériels, mêmes diodes et mêmes liens vers les zones que le synoptique du CPY. Choix de rendu : la légende réelle n'est pas lue.
const BUGEY={fond:'#0e0f0d',prim:'#dc6431',vap:'#e4c24c',are:'#8fb3d3',asg:'#bdd3e4',ris:'#d9a6c4',rra:'#7cc46a',crf:'#4c9fbf',enc:'#cfc8b0',equip:'#e7e6dd',bord:'#8b8a82',txt:'#efeee8',dim:'#a3a29a',val:'#ffcf6a',eau:'#78a9d0'};
let C=GRAVELINES,K=1;   // palette et épaisseur des traits du palier rendu (posées par render)
const P=(x,y)=>x.toFixed(1)+' '+y.toFixed(1);
const dir=(a)=>{const r=a*Math.PI/180;return [Math.cos(r),Math.sin(r)];};
// Trait peint ; « pont » : la ligne passe par-dessus celles déjà tracées (liseré du fond).
function trait(d,col,w=4,o=1){return '<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="'+(K===1?w:+(w*K).toFixed(2))+'" stroke-linejoin="round" stroke-linecap="round"'+(o<1?' opacity="'+o+'"':'')+'/>';}
function pont(d,col,w=4,o=1){return '<path d="'+d+'" fill="none" stroke="'+C.fond+'" stroke-width="'+(K===1?w+5:+(w*K+3).toFixed(2))+'" stroke-linejoin="round"/>'+trait(d,col,w,o);}
// Deux diodes (9 ter) : rouge allumée = en service (ouvert, l'eau passe ; en marche) ; verte allumée = hors service (fermé, à
// l'arrêt) ; éteintes = état non connu. La verte reste à gauche, la rouge à droite.
function diodes(x,y,etat){const v=etat===false,r=etat===true;
  return '<g aria-hidden="true">'+(v?'<circle cx="'+(x-4)+'" cy="'+y+'" r="5.2" fill="#38e26b" opacity=".35"/>':'')+(r?'<circle cx="'+(x+4)+'" cy="'+y+'" r="5.2" fill="#ff3b30" opacity=".35"/>':'')
    +'<circle cx="'+(x-4)+'" cy="'+y+'" r="2.8" fill="'+(v?'#4dff86':'#173a22')+'" stroke="#0b0d0f" stroke-width=".6"/><circle cx="'+(x+4)+'" cy="'+y+'" r="2.8" fill="'+(r?'#ff4a3d':'#45170f')+'" stroke="#0b0d0f" stroke-width=".6"/></g>';}
// Vanne (deux triangles) sur un tuyau horizontal ou vertical, ses diodes à côté.
function vanne(x,y,etat,axe='h',cote=-1){const h=axe==='h',a=h?'M'+(x-7)+' '+(y-5)+'L'+x+' '+y+'L'+(x-7)+' '+(y+5)+'ZM'+(x+7)+' '+(y-5)+'L'+x+' '+y+'L'+(x+7)+' '+(y+5)+'Z':'M'+(x-5)+' '+(y-7)+'L'+x+' '+y+'L'+(x+5)+' '+(y-7)+'ZM'+(x-5)+' '+(y+7)+'L'+x+' '+y+'L'+(x+5)+' '+(y+7)+'Z';
  return '<path d="'+a+'" fill="'+C.equip+'" stroke="#11151a" stroke-width=".8"/>'+(h?diodes(x,y+cote*11,etat):diodes(x+cote*(-14),y,etat));}
// Pompe : cercle blanc à flèche, ses diodes dessous.
function pompe(x,y,etat,r=10,ang=0,seule=false){return '<g aria-hidden="true"><circle cx="'+P(x,y).split(' ')[0]+'" cy="'+P(x,y).split(' ')[1]+'" r="'+r+'" fill="'+C.equip+'" stroke="'+C.bord+'" stroke-width="1.2"/><path d="M'+P(x-r*.45,y-r*.5)+'L'+P(x+r*.6,y)+'L'+P(x-r*.45,y+r*.5)+'Z" fill="#2a3138" transform="rotate('+ang+' '+x.toFixed(1)+' '+y.toFixed(1)+')"/></g>'+(seule?'':diodes(x,y+r+7,etat));}
// Plaque noire : libellé clair, valeur ambrée ; « d » : détail masqué sur le mur (lecture à distance).
function plaque(x,y,lib,val,o={}){const w=o.w||Math.max(58,Math.max(String(lib).length*5.1,String(val).length*7.4)+12),h=26;PL.push({x,y,lib:String(lib),val:String(val)});
  return '<g class="s9-pl'+(o.detail?' s9-pl-d':'')+'"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="2" fill="#0b0d10" stroke="#3c444c" stroke-width=".8"/><text x="'+(x+5)+'" y="'+(y+9.5)+'" class="s9-sl">'+esc(lib)+'</text><text x="'+(x+5)+'" y="'+(y+22)+'" class="s9-sv">'+esc(val)+'</text></g>';}
function etiq(x,y,t,o={}){const w=o.w||String(t).length*5.6+10;return '<g><rect x="'+(o.ancre==='m'?x-w/2:x)+'" y="'+(y-9)+'" width="'+w+'" height="12" rx="1.5" fill="#0b0d10"/><text x="'+(o.ancre==='m'?x:x+5)+'" y="'+(y+.5)+'"'+(o.ancre==='m'?' text-anchor="middle"':'')+' class="s9-sl">'+esc(t)+'</text></g>';}
// Réservoir ou capsule blanche, remplissage d'eau à hauteur du niveau reçu (fraction 0–1), rien si inconnu.
function bac(x,y,w,h,f,rx=4){const ok=Number.isFinite(f),hf=ok?Math.max(0,Math.min(1,f))*(h-6):0;
  return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'" fill="'+C.equip+'" stroke="'+C.bord+'" stroke-width="1.2"/>'+(ok?'<rect x="'+(x+3)+'" y="'+(y+h-3-hf).toFixed(1)+'" width="'+(w-6)+'" height="'+hf.toFixed(1)+'" rx="'+Math.max(0,rx-2)+'" fill="'+C.eau+'"/>':'');}
// Dernier relevé de l'enregistreur de la tranche pour une voie (même calcul que le pupitre classique), sinon null.
function releve(data,id){const e=data&&data.enregistreur;if(!e||!Array.isArray(e.voies)||!Array.isArray(e.rows))return null;const k=e.voies.findIndex(v=>v&&v.id===id);if(k<0)return null;
  for(let i=e.rows.length-1;i>=0;i--){const r=e.rows[i];if(r&&Array.isArray(r.v)){const v=r.v[k];return Number.isFinite(v)?v:null;}}return null;}
const SRC={mer:'MER',estuaire:'ESTUAIRE',fleuve:'FLEUVE',tour:'FLEUVE'};
const W=1600,H=400;
// Plaques du dernier dessin (libellé, valeur, position) : relevés repris en grand sous la coupe du téléphone.
const PL=[];
function contenu(data){PL.length=0;
  const s=data&&data.state||{},pal=data&&data.pal||{},nb=Number.isInteger(pal.NB)?pal.NB:3,n=Number.isInteger(s.gmppN)?s.gmppN:null;
  const gm=n===null?null:n===nb?true:n===0?false:null;   // D12/D16 : nombre seul
  const b=v=>v===true?true:v===false?false:null,f=v=>Number.isFinite(v)?v:null;
  // Toucher un matériel amène au panneau et à la zone où il se commande ou se lit (idée d'Anthonin, 03/10) : pas de fiche
  // d'équipement (salle conventionnelle), le point de vue se déplace et la zone s'éclaire un instant.
  const ALLER={pupitre:'Pupitre de conduite',arriere:'Tableau arrière',surete:'Panneau de sûreté'};
  const lien=(cible,corps,lib)=>{const [page,zone]=cible.split(':');return '<g class="s9-equip" data-s9-aller="'+esc(cible)+'" role="button" tabindex="0" aria-label="'+esc(lib)+' : aller au '+esc((ALLER[page]||'panneau').toLowerCase())+(zone?', zone '+esc(zone):'')+'">'+corps+'</g>';};
  // Quatre couches : traits, puis matériels, puis vannes et diodes (jamais recouvertes), puis plaques et étiquettes.
  let L='',E='',V='',T='';
  // ═══ CIRCUIT PRIMAIRE : cuve au centre, trois boucles en étoile (rayons droits depuis la cuve) ═══
  const cx=250,cy=182,R=28,pt=(a,r)=>{const [dx,dy]=dir(a);return [cx+r*dx,cy+r*dy];};
  const TH=[-150,-30,90],AP=50,RIN=68,ROUT=132,RP=96;   // GV de r=68 à 132 sur le rayon θ ; GMPP sur le rayon θ+50 à r=96
  const gv=TH.map(t=>{const [dx,dy]=dir(t);return {t,dx,dy,nx:-dy,ny:dx,inn:pt(t,RIN),out:pt(t,ROUT),pp:pt(t+AP,RP)};});
  T+='<rect x="16" y="22" width="470" height="314" rx="26" fill="none" stroke="'+C.enc+'" stroke-width="2.4"/>'+etiq(22,16,'ENCEINTE');
  const pu=f(s.puisard);if(pu!==null&&pu>0.01)L+='<rect x="20" y="326" width="'+(462*Math.min(1,pu)).toFixed(0)+'" height="8" fill="'+C.eau+'" opacity=".8"/>';
  gv.forEach(g=>{const a=pt(g.t,R),c=pt(g.t+AP,R);
    L+=trait('M'+P(a[0],a[1])+'L'+P(g.inn[0],g.inn[1]),C.prim,5)                    // branche chaude : rayon θ
      +trait('M'+P(g.inn[0],g.inn[1])+'L'+P(g.pp[0],g.pp[1]),C.prim,4)              // sortie du GV vers la GMPP
      +trait('M'+P(g.pp[0],g.pp[1])+'L'+P(c[0],c[1]),C.prim,5);});                  // branche froide : rayon θ+50
  // pressuriseur sur la branche chaude de la boucle 1 (rayon −150°) : ligne d'expansion horizontale jusqu'au rayon
  const yE=166,rE=(cy-yE)/0.5,jE=pt(-150,rE);
  L+=trait('M48 160V'+yE+'H'+jE[0].toFixed(1),C.prim,3)+trait('M48 100V78',C.prim,2.6);
  // aspersion EAS : depuis la PTR, rampe et buses en haut de l'enceinte
  const easCol=s.eas?C.asg:'#56606a';L+=trait('M24 340V36H118',C.ris,2,.5)+trait('M24 36H118',easCol,2.4)+[44,66,88,110].map(x=>'<path d="M'+x+' 37l-4 7M'+x+' 37l0 8M'+x+' 37l4 7" stroke="'+easCol+'" stroke-width="1.4" fill="none"/>').join('');
  // accumulateurs et injection de sécurité : branche froide de la boucle 3 (rayon 140°), raccord horizontal depuis la gauche
  const yA=226,rA=(yA-cy)/0.6428,jA=pt(140,rA);
  L+=trait('M82 '+yA+'H'+jA[0].toFixed(1),C.ris,2.6)+trait('M146 366V'+yA,C.ris,3,s.inj>0.02?1:.55)+trait('M80 366H146',C.ris,3,s.inj>0.02?1:.55);
  L+=trait('M90 334V366',C.ris,2,s.recirc?1:.35);
  // RRA : aspiration sur la branche chaude de la boucle 3 (rayon 90°, vertical), retour sur la branche froide de la boucle 2
  const xR=305,yR=cy+(xR-cx)*Math.tan(20*Math.PI/180);
  L+=trait('M250 243H290',C.rra,3,s.rra?1:.45)+trait('M'+xR+' 232V'+yR.toFixed(1),C.rra,3,s.rra?1:.45);
  // vapeur, eau alimentaire (ARE) et secours (ASG) de chaque GV, en lignes séparées jusqu'au secondaire (3 bis et remarque
  // d'Anthonin, 03/10 : l'ASG va directement aux GV). Montées triées : la plus à gauche monte le plus haut, aucun croisement.
  const bord=(g,x,cote)=>{const t=(cote*(x-(g.out[0]+13*cote*g.nx)))/(-g.dx*cote);return [x,g.out[1]-t*g.dy+13*cote*g.ny];};
  const g1=gv[0],g2=gv[1],g3=gv[2];
  const e1A=bord(g1,156,1),e1S=bord(g1,172,1),e2S=bord(g2,332,-1),e2A=bord(g2,348,-1);   // côté supérieur de chaque capsule
  const Y={v1:30,a1:42,s1:54,s2:66,a2:78,v2:90,s3:102,a3:114,v3:126};
  const asgOp=f(s.asg)!==null&&s.asg>0.0005?1:.6;
  L+=trait('M'+P(g1.out[0],g1.out[1])+'V'+Y.v1+'H640',C.vap,4)+trait('M'+P(e1A[0],e1A[1])+'V'+Y.a1+'H572',C.are,3)+trait('M'+P(e1S[0],e1S[1])+'V'+Y.s1+'H548',C.asg,2.6,asgOp);
  L+=trait('M'+P(e2S[0],e2S[1])+'V'+Y.s2+'H548',C.asg,2.6,asgOp)+trait('M'+P(e2A[0],e2A[1])+'V'+Y.a2+'H536',C.are,3)+trait('M'+P(g2.out[0],g2.out[1])+'V'+Y.v2+'H536',C.vap,4);
  L+=trait('M263 276H496V'+Y.s3+'H548',C.asg,2.6,asgOp)+trait('M263 290H508V'+Y.a3+'H536',C.are,3)+trait('M'+P(g3.out[0],g3.out[1])+'V322H520V'+Y.v3+'H536',C.vap,4);
  // ═══ SECONDAIRE : collecteurs ═══
  L+=trait('M548 '+Y.s1+'V362H740',C.asg,3,asgOp);                                                   // collecteur ASG : bâche, motopompes, turbopompe → GV
  L+=trait('M572 '+Y.a1+'V330H1270V240',C.are,3);                                                     // collecteur ARE ← TPA ← condenseur
  // ponts : la ligne passe au-dessus d'un collecteur sans s'y raccorder ; le pont s'arrête avant chaque raccord (pas d'encoche)
  L+=pont('M536 '+Y.a2+'H560M536 '+Y.a3+'H560',C.are,3)+trait('M560 '+Y.a2+'H572M560 '+Y.a3+'H572',C.are,3);   // ARE des GV 2 et 3, au-dessus de l'ASG
  L+=pont('M536 '+Y.v2+'H590M536 '+Y.v3+'H590',C.vap,4)+trait('M590 '+Y.v2+'H640M590 '+Y.v3+'H640',C.vap,4)+trait('M640 '+Y.v1+'V'+Y.v3,C.vap,4); // vapeur → VIV → collecteur
  L+=trait('M640 '+Y.v1+'H1088V120H1102',C.vap,4.5);
  const tpsOp=(s.tpsA||s.tpsB)?1:.5;
  L+=trait('M584 '+Y.v3+'V250H700V353',C.vap,2.6,tpsOp)+pont('M700 318V342',C.vap,2.6,tpsOp);         // turbopompe ASG : vapeur prise en amont des VIV
  L+=trait('M528 '+Y.v1+'V6M556 '+Y.v1+'V6',C.vap,3);                                                 // GCTa et soupapes, en amont des VIV
  L+=trait('M1102 120H1508',C.dim,3)+trait('M1146 95V56H1170M1222 56H1450',C.vap,3.5)+[1270,1360,1450].map(x=>trait('M'+x+' 56V100',C.vap,3.5)+trait('M'+x+' 140V200',C.vap,3)).join('');
  L+=trait('M1020 '+Y.v1+'V182H1240V200',C.vap,3)+trait('M1250 240V248',C.dim,2);
  L+=trait('M1480 210H1572V344M1552 344V232H1480',C.crf,3.5,s.crf===false?.45:1);
  // ═══ MATÉRIELS ═══
  const ngv=f(s.gv);
  gv.forEach((g,i)=>{const a=g.t+90,mx=(g.inn[0]+g.out[0])/2,my=(g.inn[1]+g.out[1])/2,Lg=ROUT-RIN,Wd=26,lev=ngv===null?null:Math.max(0,Math.min(1,ngv/100));
    E+=lien('pupitre:ARE','<g transform="rotate('+a+' '+mx.toFixed(1)+' '+my.toFixed(1)+')"><rect x="'+(mx-Wd/2).toFixed(1)+'" y="'+(my-Lg/2).toFixed(1)+'" width="'+Wd+'" height="'+Lg+'" rx="12" fill="'+C.equip+'" stroke="'+C.bord+'" stroke-width="1.3"/>'
      +(lev!==null?'<rect x="'+(mx-6).toFixed(1)+'" y="'+(my+Lg/2-6-(Lg-16)*lev).toFixed(1)+'" width="12" height="'+((Lg-16)*lev).toFixed(1)+'" rx="2" fill="'+C.eau+'"/>':'')+'</g>','Générateur de vapeur '+(i+1));
    const e=i===0?pt(g.t,158):[mx+32*g.nx,my+32*g.ny];T+=etiq(e[0],e[1]+4,'GV '+(i+1),{ancre:'m',w:30});});
  // GMPP : diodes sur le rayon, côté extérieur (jamais sur un tuyau)
  gv.forEach(g=>{const o=pt(g.t+AP,RP+19);E+=pompe(g.pp[0],g.pp[1],undefined,10,g.t+AP+180,true);V+=diodes(o[0],o[1],gm);});
  const crit=(s.etat==='RP'||s.etat==='ANGV')&&!s.scram&&(s.Pn||0)>0.02;
  E+=lien('pupitre:RGL','<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="#a7abae" stroke="#dfe2e4" stroke-width="2"/><rect x="'+(cx-11)+'" y="'+(cy-16)+'" width="22" height="32" rx="2" fill="'+(crit?'#e5622f':'#6d7175')+'"/>','Cuve et cœur');
  // pressuriseur (sans niveau : le moteur ne le calcule pas), chaufferettes et aspersion signalées ; RDP
  E+=lien('pupitre:RCP','<rect x="36" y="100" width="24" height="60" rx="11" fill="'+C.equip+'" stroke="'+C.bord+'" stroke-width="1.3"/><text x="48" y="134" text-anchor="middle" class="s9-st" transform="rotate(-90 48 130)">PZR</text>'
    +'<path d="M41 152l3-5l3 5l3-5l3 5l3-5" stroke="'+(s.heat?'#ff8a2a':'#9aa1a6')+'" stroke-width="1.6" fill="none"/>'+(s.heat?'<circle cx="48" cy="150" r="7" fill="#ff8a2a" opacity=".3"/>':'')
    +'<path d="M43 108h10M45 111l-2 4M48 111v5M51 111l2 4" stroke="'+(s.spray?C.asg:'#9aa1a6')+'" stroke-width="1.4" fill="none"/>','Pressuriseur');
  const rdp=f(s.rdp);E+=lien('pupitre:RCP',bac(36,54,24,24,rdp,4)+(s.rdpBurst?'<path d="M36 54l24 24M60 54l-24 24" stroke="#ff4a3d" stroke-width="2"/>':''),'Réservoir de décharge');
  const ac=f(s.accu);E+=lien('arriere:RIS',bac(60,212,22,48,ac===null?null:ac/100,9),'Accumulateurs');
  const ptr=f(s.ptr);E+=lien('arriere:RIS',bac(22,340,58,52,ptr,4),'Bâche PTR et injection de sécurité');
  E+=pompe(104,366,undefined,9,0,true)+pompe(126,366,undefined,9,0,true);V+=diodes(104,382,b(s.ishp))+diodes(126,382,b(s.isbp));
  E+=lien('arriere:CRF','<rect x="290" y="232" width="30" height="22" rx="3" fill="'+C.equip+'" stroke="'+C.bord+'" stroke-width="1.2"/><text x="305" y="247" text-anchor="middle" class="s9-st" style="font-size:10px">RRA</text>','Refroidissement à l’arrêt RRA');
  // secondaire
  E+=lien('pupitre:GRE','<path d="M1102 104L1152 94V146L1102 136Z" fill="'+C.equip+'" stroke="'+C.bord+'" stroke-width="1.3"/><text x="1127" y="124" text-anchor="middle" class="s9-st">HP</text>','Turbine haute pression');
  E+='<rect x="1170" y="42" width="52" height="28" rx="3" fill="'+C.equip+'" stroke="'+C.bord+'" stroke-width="1.3"/><text x="1196" y="60" text-anchor="middle" class="s9-st">GSS</text>';
  [1270,1360,1450].forEach((x,i)=>{E+=lien('pupitre:GRE','<path d="M'+(x-36)+' 86L'+(x-6)+' 104V136L'+(x-36)+' 154ZM'+(x+36)+' 86L'+(x+6)+' 104V136L'+(x+36)+' 154Z" fill="'+C.equip+'" stroke="'+C.bord+'" stroke-width="1.3"/><rect x="'+(x-7)+'" y="100" width="14" height="40" fill="'+C.equip+'" stroke="'+C.bord+'" stroke-width="1.3"/>'
    +'<text x="'+(x-21)+'" y="124" text-anchor="middle" class="s9-st" style="font-size:10px">BP'+(i+1)+'</text>','Turbine basse pression '+(i+1));});
  PL.push({x:1508,y:84,lib:'ALTERNATEUR',val:Number.isFinite(s.Pelec)?num(s.Pelec,0)+' MWe':'—'});
  E+=lien('pupitre:GRE','<circle cx="1544" cy="120" r="36" fill="'+C.equip+'" stroke="'+C.bord+'" stroke-width="1.6"/><text x="1544" y="112" text-anchor="middle" class="s9-st">ALT</text><text x="1544" y="134" text-anchor="middle" class="s9-sg">'+esc(Number.isFinite(s.Pelec)?num(s.Pelec,0):'—')+'</text>','Alternateur');
  E+=lien('arriere:CRF','<rect x="1230" y="200" width="250" height="40" rx="5" fill="'+C.equip+'" stroke="'+C.bord+'" stroke-width="1.3"/><text x="1355" y="224" text-anchor="middle" class="s9-st">CONDENSEUR</text>','Condenseur et source froide');
  E+=pompe(1250,256,undefined,8,90,true)+lien('pupitre:ARE',pompe(880,330,undefined,10,180,true),'Turbopompe alimentaire TPA')+pompe(1572,300,undefined,8,-90,true);
  E+=pompe(600,362,undefined,9,180,true)+pompe(640,362,undefined,9,180,true)+pompe(700,362,undefined,9,180,true);
  const bA=f(s.bacheASG);E+=lien('arriere:ASG',bac(740,340,64,44,bA,4),'Alimentation de secours ASG');
  const src=SRC[s.srcType]||'SOURCE';E+='<rect x="1500" y="344" width="96" height="48" rx="3" fill="#1e5470"/><path d="M1508 368q8-6 16 0t16 0t16 0t16 0t16 0M1508 382q8-6 16 0t16 0t16 0t16 0t16 0" stroke="#8dc8ee" stroke-width="1.6" fill="none"/>';
  if(s.srcType==='tour')E+='<path d="M1460 330q-8-34 0-64h40q-8 30 0 64Z" fill="'+C.equip+'" stroke="'+C.bord+'"/>';
  // ═══ VANNES ET DIODES (dernière couche avant les plaques) ═══
  V+=vanne(48,89,b(s.sebim),'v',-1);
  V+=vanne(112,yA,s.accIso===true?false:s.accIso===false?true:null,'h',-1);
  V+=vanne(90,348,b(s.recirc),'v',-1);
  V+=vanne(270,243,b(s.rra),'h',-1);
  const gcta=f(s.gctA),sv=f(s.svf);V+=vanne(528,17,gcta===null?null:gcta>0.01,'v',1)+'<path d="M522 6h12M528 6V1" stroke="'+C.vap+'" stroke-width="2"/>'+vanne(556,17,sv===null?null:sv>0.02,'v',-1)+'<path d="M550 6h12M556 6V1" stroke="'+C.vap+'" stroke-width="2"/>';
  [Y.v1,Y.v2,Y.v3].forEach(y=>{V+=vanne(600,y,b(s.viv),'h',-1);});
  const adm=f(s.turb),gct=f(s.gct),are=f(s.areOut);
  V+=vanne(1060,Y.v1,adm===null?null:adm>1,'h',1)+lien('pupitre:GCT',vanne(1020,112,gct===null?null:gct>0.01,'v',1),'GCT au condenseur')+vanne(760,330,s.areAvail===false?false:are===null?null:are>0.5,'h',-1);
  V+=diodes(880,347,b(s.tpaRun))+diodes(1250,271,b(s.cvi))+diodes(1590,300,b(s.crf));
  V+=diodes(600,378,nonAlimentee(s,'mpsA')?false:b(s.mpsA))+diodes(640,378,nonAlimentee(s,'mpsB')?false:b(s.mpsB))+diodes(700,378,(s.tpsA||s.tpsB)?!(sansVapeur(s,'tpsA')||sansVapeur(s,'tpsB')):(s.tpsA===false&&s.tpsB!==true?false:null));
  // ═══ PLAQUES ET ÉTIQUETTES ═══
  T+=etiq(72,93,'SOUPAPES',{w:61})+etiq(64,70,'RDP')+etiq(24,396,'PTR',{w:30})+etiq(92,396,'ISHP · ISBP',{w:64})+etiq(86,254,'ACCU ×3',{w:52});
  T+=plaque(48,176,'P PRIMAIRE',num(f(s.Ppzr),1)+' bar',{w:86});
  T+=plaque(36,272,'NIVEAU CUVE',Number.isFinite(s.lvlCuve)?num(s.lvlCuve,0)+' %':'—',{w:86,detail:true})+plaque(36,302,s.pal==='CP0'?'GRAPPES D':'GRAPPES R',Number.isFinite(s.rod)?num(s.rod,1)+' %':'—',{w:86,detail:true});
  T+=plaque(384,120,'NIVEAU GV',ngv===null?'—':num(ngv,0)+' %',{w:96})+plaque(384,150,'GMPP',n===null?'—':n+' / '+nb+' en marche',{w:96});
  T+=plaque(384,180,'T BRANCHE CHAUDE',Number.isFinite(data.tempHot)?num(data.tempHot,1)+' °C':'—',{w:96})+plaque(384,210,'T BRANCHE FROIDE',Number.isFinite(data.tempCold)?num(data.tempCold,1)+' °C':'—',{w:96})+plaque(384,240,'P ENCEINTE',num(f(s.Penc),2)+' bar',{w:96,detail:true});
  T+=plaque(656,2,'GCT ATMOSPHÈRE',gcta===null?'—':num(gcta*100,0)+' %',{w:92,detail:true})+etiq(470,12,'GCTa')+etiq(582,12,'SOUPAPES GV')+etiq(592,146,'VIV');
  const kv=releve(data,'krtv');T+=plaque(700,46,'P VAPEUR GV',num(f(s.Psteam),1)+' bar')+plaque(800,46,'T VAPEUR GV',Number.isFinite(s.tVapGV)?num(s.tVapGV,0)+' °C':'—')+plaque(900,46,'FUITE VVP',kv===null?'—':num(kv,1)+' L/h',{detail:true});
  T+=plaque(1004,0,'ADMISSION HP',adm===null?'—':num(adm,0)+' %',{w:82})+plaque(1092,0,'P ADMISSION',num(f(s.Padm),1)+' bar',{w:76,detail:true});
  T+=plaque(912,130,'GCT CONDENSEUR',(s.gctMode==='manu'?'manu ':'auto ')+(gct===null?'—':num(gct*100,0)+' %'),{w:96});
  T+=etiq(1528,170,'MWe',{w:32})+plaque(1402,0,'PUISSANCE RÉACTEUR',Number.isFinite(data.powerThermal)?num(data.powerThermal,0)+' MWth':'—',{w:118});
  T+=plaque(1356,246,'P CONDENSEUR',Number.isFinite(s.Pcond)?num(s.Pcond*1000,0)+' mbar':'—',{w:84})+etiq(1204,260,'CVI');
  T+=etiq(1508,358,src,{w:60})+plaque(1400,300,'CRF · '+src.toLowerCase(),Number.isFinite(s.Tsrc)?num(s.Tsrc,1)+' °C':'—',{w:92})+etiq(1400,344,'SEC')+etiq(1400,366,'RRI');V+=diodes(1440,340,b(s.sec))+diodes(1440,362,b(s.rri));
  if(s.srcType==='tour')T+=etiq(1440,260,'AÉRORÉFRIGÉRANT');
  T+=plaque(850,286,'TPA',s.tpaRun===true?'en marche':s.tpaRun===false?'arrêt':'—',{w:70})+plaque(718,286,'ARE',(s.areAvail===false?'indisponible':(s.areAuto===false?'manu ':'auto ')+(are===null?'—':num(are,0)+' %')),{w:84});
  const tare=releve(data,'tare');T+=plaque(1100,346,'T EAU ALIMENTAIRE',tare===null?'—':num(tare,0)+' °C',{w:102,detail:true});
  const asg=f(s.asg);T+=plaque(490,346,'ASG',asg===null?'—':num(asg*100,1)+' %',{w:54})+etiq(746,352,'BÂCHE ASG',{w:56})+etiq(588,396,'MPS A · MPS B · TPS',{w:104});
  const dvn=releve(data,'dvn');T+=plaque(1260,0,'ACTIVITÉ CHEMINÉE',dvn===null?'—':(dvn>=1e4?dvn.toExponential(1).replace('.',','):num(dvn,0))+' Bq/m³',{w:120,detail:true});
  return '<rect width="'+W+'" height="'+H+'" fill="'+C.fond+'"/>'+L+E+V+T;
}
// Vues : « mur » (bande du mur, plaques de détail masquées), « page » (tout), « tel » (trois onglets, primaire ; vapeur, eau et
// secours ; turbine, condenseur et source froide, passe 6 du 03/10 ; le dessin entier défile depuis le 14/10, voir COUPES). Sous le
// dessin, les plaques de la coupe ouverte se relisent dans un volet replié par défaut (mêmes valeurs que le dessin ; le dessin d'abord,
// Anthonin, 03/10).
// Retour d'Anthonin (14/10 au soir) : au téléphone, les trois onglets restent, mais le dessin entier défile sous le doigt ; un onglet
// amène sa coupe, et la coupe au milieu de l'écran allume son onglet (salle-900.js). Une coupe tient à peu près un écran (BANDE, en unités
// du dessin : la largeur de la coupe du primaire ; la largeur du dessin est posée dans salle-900.css, 1600 / 560).
const COUPES=[['Circuit primaire',0,560,'Primaire',0,480],['Vapeur, eau alimentaire, secours',540,460,'Vapeur et eau',480,990],['Turbine, condenseur, source froide',996,604,'Turbine',990,W]];
const BANDE=560;
function render(data,opts={}){
  const bugey=!!(data&&data.state&&data.state.pal==='CP0');C=bugey?BUGEY:GRAVELINES;K=bugey?.6:1;
  const c=contenu(data||{}),vue=opts.vue||'page',lab='Synoptique de la tranche : circuits primaire et secondaire';
  if(vue==='tel'){const i=Math.max(0,Math.min(COUPES.length-1,Math.trunc(Number(opts.coupe))||0)),[t,,,,a,b]=COUPES[i];
    const rel=PL.filter(p=>p.x>=a&&p.x<b).sort((p,q)=>p.y-q.y||p.x-q.x);
    return '<div class="s9-syn-tel"><div class="s9-syn-onglets" role="group" aria-label="Vues du synoptique">'+COUPES.map((k,j)=>'<button type="button" class="s9-pous s9-l-blanc'+(j===i?' on':'')+'" aria-pressed="'+(j===i)+'" data-s9="coupe:'+j+'">'+esc(k[3])+'</button>').join('')+'</div>'
      +'<figure><figcaption>'+esc(t)+'</figcaption><div class="s9-syn-defil" data-n4-pince="s9-syn"><svg class="s9-syn'+(bugey?' s9-syn-bugey':'')+'" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(lab)+'">'+c+'</svg></div></figure>'
      +'<details class="s9-syn-rel-volet"'+(opts.releves?' open':'')+'><summary>Relevés de la coupe <span>'+rel.length+'</span></summary>'
      +'<dl class="s9-syn-rel" aria-label="Relevés · '+esc(t)+'">'+rel.map(p=>'<div><dt>'+esc(p.lib)+'</dt><dd>'+esc(p.val)+'</dd></div>').join('')+'</dl></details></div>';}
  return '<svg class="s9-syn s9-syn-v-'+vue+(bugey?' s9-syn-bugey':'')+'" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(lab)+'">'+c+'</svg>';
}
return Object.freeze({render,alimentee,nonAlimentee,sansVapeur,couleurs:GRAVELINES,bugey:BUGEY,releve,coupes:COUPES,largeur:W,bande:BANDE});
});
