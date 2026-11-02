// SIMUREP · © 2026 AnthoninP · Tous droits réservés. Classeur de synoptiques de la salle 900 de Fessenheim (palier FSH, lot D1).
// La vraie salle de Fessenheim n'avait pas de synoptique mural : le classeur posé sur le pupitre le remplace (demande d'Anthonin).
// Six feuilles A3 à l'italienne, perforées quatre trous, tenues par un mécanisme à quatre anneaux ; on les tourne par les coins cornés.
// Style d'un dessin technique des années 1970-1980 : papier blanc cassé, encre noire, un trait de couleur par circuit, symboles de
// schéma de procédé (pompe, vanne, échangeur, réservoir, d'après les familles de l'ISO 10628 et les gabarits de dessin de l'époque),
// lettrage au normographe tracé trait par trait (police filaire maison, à la manière de l'ISO 3098), cadre à repères de zones et
// cartouche. Aucune figure recopiée, aucune marque. États lus au dessin : vanne ouverte en blanc, fermée noircie ; pompe en marche
// lavée de la couleur du circuit, à l'arrêt en blanc ; disjoncteur fermé noirci ; état inconnu en pointillé. Les relevés en direct sont
// les champs que reçoit la salle 900 (ceux du synoptique mural et du KIS) ; une inconnue s'écrit « — », jamais 0.
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.SDC900Classeur=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const R2=x=>Math.round(x*100)/100;
const f=v=>Number.isFinite(v)?v:null,b=v=>v===true?true:v===false?false:null;
const num=(v,d=0)=>Number.isFinite(v)?v.toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d}).replace(/ | /g,' '):'—';
const unite=(v,d,u)=>Number.isFinite(v)?num(v,d)+' '+u:'—';
// Règles de la salle 900 reprises du synoptique mural (J6, 96A et 150A) : tableaux secourus sous tension, motopompe sans tension,
// turbopompe sans vapeur. Une source inconnue n'affirme rien.
const alimentee=s=>s.reseau===true||s.diesel===true||(s.ilote===true&&s.turb>3)?true:s.reseau===false&&s.diesel===false&&(s.ilote===false||(s.ilote===true&&Number.isFinite(s.turb)))?false:null;
const enMarche=(s,k)=>s[k]===true&&alimentee(s)===false?false:b(s[k]);
const tps=s=>s.tpsA===true||s.tpsB===true?!(Number.isFinite(s.Psteam)&&s.Psteam<=6):s.tpsA===false&&s.tpsB!==true?false:null;
function releve(data,id){const e=data&&data.enregistreur;if(!e||!Array.isArray(e.voies)||!Array.isArray(e.rows))return null;const k=e.voies.findIndex(v=>v&&v.id===id);if(k<0)return null;
  for(let i=e.rows.length-1;i>=0;i--){const r=e.rows[i];if(r&&Array.isArray(r.v)){const v=r.v[k];return Number.isFinite(v)?v:null;}}return null;}

// ══ LETTRAGE AU NORMOGRAPHE ══ Police filaire : chaque caractère est un tracé de plume ronde sur une grille de 6 de haut (ligne de
// base à 6) ; seules les commandes absolues M, L, Q et A sont employées. Capitales, chiffres, accents, signes des relevés.
const GL={
 A:[4,'M0 6L2 0L4 6M.7 4L3.3 4'],B:[4,'M0 6L0 0L2.5 0Q3.9 0 3.9 1.5Q3.9 3 2.5 3L0 3M2.5 3Q4.1 3 4.1 4.5Q4.1 6 2.5 6L0 6'],
 C:[4,'M4 1.1Q3.4 0 2.1 0Q0 0 0 3Q0 6 2.1 6Q3.4 6 4 4.9'],D:[4,'M0 0L0 6L1.8 6Q4 6 4 3Q4 0 1.8 0L0 0'],E:[3.6,'M3.6 0L0 0L0 6L3.6 6M0 2.9L2.6 2.9'],
 F:[3.5,'M3.5 0L0 0L0 6M0 2.9L2.6 2.9'],G:[4.1,'M4 1.1Q3.4 0 2.1 0Q0 0 0 3Q0 6 2.1 6Q4.1 6 4.1 3.9L4.1 3.3L2.4 3.3'],H:[4,'M0 0L0 6M4 0L4 6M0 3L4 3'],
 I:[0,'M0 0L0 6'],J:[3,'M3 0L3 4.5Q3 6 1.5 6Q0 6 0 4.6'],K:[4,'M0 0L0 6M4 0L0 4M1.3 2.8L4 6'],L:[3.4,'M0 0L0 6L3.4 6'],M:[5,'M0 6L0 0L2.5 4.2L5 0L5 6'],
 N:[4,'M0 6L0 0L4 6L4 0'],O:[4.2,'M2.1 0A2.1 3 0 0 0 2.1 6A2.1 3 0 0 0 2.1 0'],P:[3.9,'M0 6L0 0L2.5 0Q3.9 0 3.9 1.6Q3.9 3.2 2.5 3.2L0 3.2'],
 Q:[4.2,'M2.1 0A2.1 3 0 0 0 2.1 6A2.1 3 0 0 0 2.1 0M2.6 4.4L4.3 6.3'],R:[3.9,'M0 6L0 0L2.5 0Q3.9 0 3.9 1.6Q3.9 3.2 2.5 3.2L0 3.2M2.1 3.2L3.9 6'],
 S:[3.9,'M3.7 .9Q3.1 0 1.9 0Q.2 0 .2 1.5Q.2 2.7 1.9 3Q3.9 3.3 3.9 4.6Q3.9 6 1.9 6Q.6 6 0 5'],T:[4,'M0 0L4 0M2 0L2 6'],
 U:[4,'M0 0L0 4.2Q0 6 2 6Q4 6 4 4.2L4 0'],V:[4,'M0 0L2 6L4 0'],W:[5.6,'M0 0L1.4 6L2.8 1.4L4.2 6L5.6 0'],X:[4,'M0 0L4 6M4 0L0 6'],
 Y:[4,'M0 0L2 3L4 0M2 3L2 6'],Z:[4,'M0 0L4 0L0 6L4 6'],
 0:[3.6,'M1.8 0A1.8 3 0 0 0 1.8 6A1.8 3 0 0 0 1.8 0'],1:[2.2,'M0 1.2L1.8 0L1.8 6'],2:[3.8,'M.2 1.1Q.7 0 1.9 0Q3.7 0 3.7 1.7Q3.7 2.8 2.3 3.8L0 6L3.8 6'],
 3:[3.8,'M.2 0L3.6 0L1.7 2.5Q3.9 2.5 3.9 4.2Q3.9 6 1.9 6Q.6 6 0 5.2'],4:[4,'M2.9 6L2.9 0L0 4.2L4 4.2'],5:[3.8,'M3.6 0L.5 0L.3 2.8Q.9 2.3 1.9 2.3Q3.9 2.3 3.9 4.1Q3.9 6 1.9 6Q.6 6 0 5.2'],
 6:[3.8,'M3.5 .6Q3 0 2 0Q0 0 0 3.4Q0 6 1.9 6Q3.8 6 3.8 4.2Q3.8 2.4 1.9 2.4Q.6 2.4 0 3.4'],7:[3.8,'M0 0L3.8 0L1.3 6'],
 8:[3.8,'M1.9 2.9A1.6 1.45 0 0 1 1.9 0A1.6 1.45 0 0 1 1.9 2.9A1.9 1.55 0 0 0 1.9 6A1.9 1.55 0 0 0 1.9 2.9'],
 9:[3.8,'M.3 5.4Q.8 6 1.8 6Q3.8 6 3.8 2.6Q3.8 0 1.9 0Q0 0 0 1.8Q0 3.6 1.9 3.6Q3.2 3.6 3.8 2.6'],
 e:[3.4,'M.1 4.1L3.3 4.1Q3.3 2.3 1.7 2.3Q.1 2.3 .1 4.1Q.1 6 1.7 6Q2.8 6 3.3 5.4'],k:[3,'M0 0L0 6M3 2.4L0 4.7M1.1 3.9L3.1 6'],
 '.':[0,'M0 5.95L0 6'],',':[.6,'M.6 5.7L0 7.1'],':':[0,'M0 1.9L0 1.95M0 5.95L0 6'],';':[.6,'M.45 1.9L.45 1.95M.6 5.7L0 7.1'],'·':[0,'M0 3L0 3.05'],'-':[2.4,'M0 3.4L2.4 3.4'],
 '—':[5,'M0 3.2L5 3.2'],'/':[3,'M0 6.4L3 -.4'],'%':[4,'M0 6L4 0M1 0A.9 1 0 0 0 1 2A.9 1 0 0 0 1 0M3 4A.9 1 0 0 0 3 6A.9 1 0 0 0 3 4'],
 '°':[1.6,'M.8 0A.8 .8 0 0 0 .8 1.6A.8 .8 0 0 0 .8 0'],'(':[1.3,'M1.3 -.3Q0 1.2 0 3Q0 4.8 1.3 6.3'],')':[1.3,'M0 -.3Q1.3 1.2 1.3 3Q1.3 4.8 0 6.3'],
 '×':[3,'M0 2L3 5M3 2L0 5'],'→':[5,'M0 3.1L5 3.1M3.3 1.8L5 3.1L3.3 4.4'],'←':[5,'M5 3.1L0 3.1M1.7 1.8L0 3.1L1.7 4.4'],'+':[3,'M1.5 1.5L1.5 4.5M0 3L3 3'],
 '=':[3,'M0 2.3L3 2.3M0 3.9L3 3.9'],'≥':[3,'M0 1.2L3 2.7L0 4.2M0 5.6L3 5.6'],"'":[0,'M.3 0L0 1.5'],'’':[0,'M.3 0L0 1.5'],'³':[1.9,'M.1 -.6L1.8 -.6L.9 .5Q2 .5 2 1.4Q2 2.4 .9 2.4Q.3 2.4 0 2'],
 'Œ':[6.4,'M3 0Q0 0 0 3Q0 6 3 6L6.4 6M3 0L6.4 0M3 0L3 6M3 2.9L5.6 2.9'],'?':[3.6,'M.1 1.2Q.5 0 1.8 0Q3.6 0 3.6 1.6Q3.6 2.8 1.8 3.4L1.8 4.3M1.8 5.95L1.8 6'],'>':[3,'M0 1.5L3 3L0 4.5'],'<':[3,'M3 1.5L0 3L3 4.5'],'~':[3.6,'M0 3.4Q.9 2.3 1.8 3.1Q2.7 3.9 3.6 2.8'],' ':[2.2,'']};
const ACC={'É':['E','M1.5 -.7L2.6 -1.9'],'È':['E','M1.1 -1.9L2.2 -.7'],'Ê':['E','M.8 -.8L1.8 -1.9L2.8 -.8'],'Ë':['E','M1 -1.2L1 -1.15M2.6 -1.2L2.6 -1.15'],'À':['A','M1.3 -1.9L2.4 -.7'],
 'Â':['A','M1 -.8L2 -1.9L3 -.8'],'Î':['I','M-1 -.8L0 -1.9L1 -.8'],'Ï':['I','M-.8 -1.2L-.8 -1.15M.8 -1.2L.8 -1.15'],'Ô':['O','M1.1 -.8L2.1 -1.9L3.1 -.8'],'Û':['U','M1 -.8L2 -1.9L3 -.8'],
 'Ù':['U','M1.3 -1.9L2.4 -.7'],'Ç':['C','M2 6L2 6.9Q2.9 7.1 2.4 7.8L1.6 7.9']};
// Déplace et met à l'échelle un tracé de glyphe (commandes absolues M, L, Q, A).
function place(d,x0,y0,k){let o='';for(const m of d.matchAll(/([MLQA])([^MLQA]*)/g)){const n=m[2].trim().split(/[\s,]+/).filter(Boolean).map(Number);
  if(m[1]==='A'){for(let i=0;i+6<n.length+0;i+=7)o+='A'+R2(n[i]*k)+' '+R2(n[i+1]*k)+' '+n[i+2]+' '+n[i+3]+' '+n[i+4]+' '+R2(x0+n[i+5]*k)+' '+R2(y0+n[i+6]*k);}
  else{o+=m[1];for(let i=0;i+1<n.length;i+=2)o+=(i?' ':'')+R2(x0+n[i]*k)+' '+R2(y0+n[i+1]*k);}}return o;}
function glyphe(c){if(GL[c])return {w:GL[c][0],d:GL[c][1]};const a=ACC[c];if(a)return {w:GL[a[0]][0],d:GL[a[0]][1]+a[1]};const u=String(c).toUpperCase();
  if(u!==c&&(GL[u]||ACC[u]))return glyphe(u);if(GEO)GEO.manque.push(c);return {w:3.6,d:'M0 0L3.6 0L3.6 6L0 6L0 0'};}
// Géométrie du dessin (contrôle des recouvrements au banc) : textes, traits, cadres de relevé, symboles pleins et contenants.
let GEO=null,ZONE='';const noeud=(x,y)=>{if(GEO)GEO.j.push({x,y,q:'nœud'});};
const geo=(k,o)=>{if(GEO)GEO[k].push(Object.assign({z:ZONE},o));};
const plein=(x0,y0,x1,y1,q)=>geo('s',{x0,y0,x1,y1,q});const contenant=(x0,y0,x1,y1,q)=>geo('b',{x0,y0,x1,y1,q});
const PAS=1.55;   // interlettre, en unités de grille
function largeur(t,h){const k=h/6;let w=0;for(const c of String(t))w+=(glyphe(c).w+PAS)*k;return Math.max(0,w-PAS*k);}
// Texte au normographe : x, y = pied de la ligne ; ancre 'd' (début), 'm' (milieu), 'f' (fin). La plume : un dixième de la hauteur.
function T(x,y,t,h=3.5,o={}){const k=h/6,w=largeur(t,h);let cx=o.a==='m'?x-w/2:o.a==='f'?x-w:x,d='';const y0=y-h;
  if(GEO){const st=String(t),acc=/[ÉÈÊËÀÂÎÏÔÛÙ]/.test(st),des=/[,;ÇQ()\/]/.test(st);geo('t',{x0:cx,y0:y0-(acc?h*.33:0),x1:cx+w,y1:y+(des?h*.2:0),q:st});}
  for(const c of String(t)){const g=glyphe(c);if(g.d)d+=place(g.d,cx,y0,k);cx+=(g.w+PAS)*k;}
  return d?'<path class="s9-cl-t" d="'+d+'" fill="none" stroke="'+(o.c||'var(--cl-encre)')+'" stroke-width="'+R2(o.p||Math.max(.24,h*.1))+'" stroke-linecap="round" stroke-linejoin="round"/>':'';}

// ══ PRIMITIVES DU DESSIN (unités : millimètres d'une feuille A3, 420 × 297) ══
const COUL={prim:'var(--cl-prim)',pf:'var(--cl-pf)',vap:'var(--cl-vap)',are:'var(--cl-are)',asg:'var(--cl-asg)',ris:'var(--cl-ris)',rra:'var(--cl-rra)',rri:'var(--cl-rri)',sec:'var(--cl-sec)',hta:'var(--cl-hta)',sb:'var(--cl-sb)',encre:'var(--cl-encre)'};
const LAV={prim:'var(--cl-prim-l)',pf:'var(--cl-pf-l)',vap:'var(--cl-vap-l)',are:'var(--cl-are-l)',asg:'var(--cl-asg-l)',ris:'var(--cl-ris-l)',rra:'var(--cl-rra-l)',rri:'var(--cl-rri-l)',sec:'var(--cl-sec-l)',hta:'var(--cl-hta-l)',sb:'var(--cl-sb-l)',encre:'var(--cl-encre-l)'};
const PAPIER='var(--cl-papier-plein)';
function segs(d,w,c){let x=0,y=0,x0=0,y0=0;for(const m of d.matchAll(/([MLHV])\s*([-\d.]+)(?:[\s,]+([-\d.]+))?/g)){const a=+m[2],b2=+m[3];
  if(m[1]==='M'){x=x0=a;y=y0=b2;continue;}const nx=m[1]==='H'?a:m[1]==='V'?x:a,ny=m[1]==='H'?y:m[1]==='V'?a:b2;geo('l',{x0:x,y0:y,x1:nx,y1:ny,w,c});x=nx;y=ny;}}
function tr(d,c='encre',w=.5,o={}){if(GEO)segs(d,w,c);return '<path d="'+d+'" fill="none" stroke="'+COUL[c]+'" stroke-width="'+w+'" stroke-linejoin="round" stroke-linecap="'+(o.cap||'round')+'"'+(o.tir?' stroke-dasharray="'+o.tir+'"':'')+'/>';}
// Saut de croisement (le trait enjambe celui qu'il croise) : demi-cercle de 1,6 mm sur une ligne horizontale.
function saut(x,y,c,w){geo('j',{x,y,q:'saut'});return '<path d="M'+(x-2)+' '+y+'L'+(x+2)+' '+y+'" stroke="'+PAPIER+'" stroke-width="'+(w+.6)+'"/><path d="M'+(x-1.8)+' '+y+'A1.8 1.8 0 0 1 '+(x+1.8)+' '+y+'" fill="none" stroke="'+COUL[c]+'" stroke-width="'+w+'"/>';}
const ETAT={true:'marche',false:'arret',null:'inconnu'};
// Contour selon l'état : plein (connu) ou pointillé (inconnu).
const bord=(e,w=.45)=>'stroke="var(--cl-encre)" stroke-width="'+w+'"'+(e===null?' stroke-dasharray="1.1 .9"':'');
// Pompe centrifuge (cercle, triangle de refoulement orienté) ; en marche : lavis du circuit ; à l'arrêt : blanc.
function pompe(x,y,e,c,r=4,ang=0,lib){plein(x-r,y-r,x+r,y+r,'pompe '+(lib||''));const a=ang*Math.PI/180,p=(t,rr=r)=>R2(x+rr*Math.cos(a+t))+' '+R2(y+rr*Math.sin(a+t));
  return '<g class="s9-cl-pompe" data-etat="'+ETAT[e]+'"'+(lib?' data-lib="'+esc(lib)+'"':'')+'><circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+(e===true?LAV[c]:PAPIER)+'" '+bord(e)+'/>'
    +'<path d="M'+p(2.25)+'L'+p(0)+'L'+p(-2.25)+'" fill="none" '+bord(e,.4)+'/>'+(e===true?'<circle cx="'+x+'" cy="'+y+'" r="'+R2(r*.28)+'" fill="var(--cl-encre)"/>':'')+'</g>';}
// Vanne à opercule (deux triangles affrontés) ; ouverte : blanche ; fermée : noircie. « m » : servomoteur (tige et carré).
function vanne(x,y,e,axe='h',s=2.6,o={}){const h=axe==='h',d=h?'M'+(x-s)+' '+(y-s*.62)+'L'+(x+s)+' '+(y+s*.62)+'L'+(x+s)+' '+(y-s*.62)+'L'+(x-s)+' '+(y+s*.62)+'Z'
    :'M'+(x-s*.62)+' '+(y-s)+'L'+(x+s*.62)+' '+(y+s)+'L'+(x-s*.62)+' '+(y+s)+'L'+(x+s*.62)+' '+(y-s)+'Z';
  plein(x-s-.2,y-s-.2-(o.m&&h?s*1.5+2.6:0),x+s+.2+(o.m&&!h?s*1.5+2.6:0),y+s+.2,'vanne '+(o.lib||''));
  const m=o.m?(h?'<path d="M'+x+' '+y+'L'+x+' '+(y-s*1.5)+'" stroke="var(--cl-encre)" stroke-width=".35"/><rect x="'+(x-1.5)+'" y="'+(y-s*1.5-2.6)+'" width="3" height="2.6" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".35"/>'
      :'<path d="M'+x+' '+y+'L'+(x+s*1.5)+' '+y+'" stroke="var(--cl-encre)" stroke-width=".35"/><rect x="'+(x+s*1.5)+'" y="'+(y-1.5)+'" width="2.6" height="3" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".35"/>'):'';
  return '<g class="s9-cl-vanne" data-etat="'+(e===true?'ouvert':e===false?'ferme':'inconnu')+'"'+(o.lib?' data-lib="'+esc(o.lib)+'"':'')+'>'+m+'<path d="'+d+'" fill="'+(e===false?'var(--cl-encre)':PAPIER)+'" '+bord(e,.4)+' stroke-linejoin="miter"/></g>';}
// Clapet antiretour : triangle et barre.
function clapet(x,y,axe='h',sens=1,s=2.2){const h=axe==='h',pas=h?(sens>0?'droite':'gauche'):(sens>0?'bas':'haut');plein(x-s,y-s,x+s,y+s,'clapet');geo('c',{x,y,pas});return h?'<path class="s9-cl-clapet" data-passant="'+pas+'" d="M'+(x-s*sens)+' '+(y-s*.7)+'L'+(x+s*sens*.6)+' '+y+'L'+(x-s*sens)+' '+(y+s*.7)+'ZM'+(x+s*sens*.6)+' '+(y-s*.8)+'L'+(x+s*sens*.6)+' '+(y+s*.8)+'" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".38"/>'
  :'<path class="s9-cl-clapet" data-passant="'+pas+'" d="M'+(x-s*.7)+' '+(y-s*sens)+'L'+x+' '+(y+s*sens*.6)+'L'+(x+s*.7)+' '+(y-s*sens)+'ZM'+(x-s*.8)+' '+(y+s*sens*.6)+'L'+(x+s*.8)+' '+(y+s*sens*.6)+'" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".38"/>';}
// Échangeur (cercle traversé d'un serpentin) ; disjoncteur (carré noirci quand il est fermé).
function echangeur(x,y,r=5,c='encre'){plein(x-r-2,y-r,x+r+2,y+r,'échangeur');return '<g class="s9-cl-ech"><circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".45"/><path d="M'+(x-r-2)+' '+(y+r*.15)+'L'+(x-r*.6)+' '+(y+r*.15)+'L'+(x-r*.35)+' '+(y-r*.5)+'L'+(x)+' '+(y+r*.5)+'L'+(x+r*.35)+' '+(y-r*.5)+'L'+(x+r*.6)+' '+(y+r*.15)+'L'+(x+r+2)+' '+(y+r*.15)+'" fill="none" stroke="'+COUL[c]+'" stroke-width=".45" stroke-linejoin="round"/></g>';}
function disj(x,y,e,s=3.4,lib){plein(x-s/2,y-s/2,x+s/2,y+s/2,'disjoncteur');return '<g class="s9-cl-disj" data-etat="'+(e===true?'ferme':e===false?'ouvert':'inconnu')+'"'+(lib?' data-lib="'+esc(lib)+'"':'')+'><rect x="'+(x-s/2)+'" y="'+(y-s/2)+'" width="'+s+'" height="'+s+'" fill="'+(e===true?'var(--cl-encre)':PAPIER)+'" '+bord(e,.42)+'/></g>';}
// Réservoir vertical à fonds bombés ; niveau reçu (0 à 1) : lavis d'eau et repère ▽ ; rien d'affirmé s'il est inconnu.
function reservoir(x,y,w,h,niv,c,o={}){contenant(x,y,x+w,y+h,'réservoir');const ok=Number.isFinite(niv),rx=o.rx!=null?o.rx:Math.min(w/2,h/2),f0=ok?Math.max(0,Math.min(1,niv)):0,hy=R2(y+h-f0*h);
  const id=o.id||('s9cl-r'+(++NR));let s='<clipPath id="'+id+'"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'"/></clipPath><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width="'+(o.w||.5)+'"/>';
  if(ok&&f0>0){s+='<path d="M'+x+' '+hy+'L'+(x+w)+' '+hy+'L'+(x+w)+' '+(y+h)+'L'+x+' '+(y+h)+'Z" fill="'+LAV[c]+'" clip-path="url(#'+id+')"/>';
    const lx=x+w*.72;s+='<path d="M'+(x+1)+' '+hy+'L'+(x+w-1)+' '+hy+'" stroke="'+COUL[c]+'" stroke-width=".35"/><path d="M'+R2(lx-1.3)+' '+R2(hy-2.2)+'L'+R2(lx+1.3)+' '+R2(hy-2.2)+'L'+R2(lx)+' '+hy+'Z" fill="none" stroke="'+COUL[c]+'" stroke-width=".3"/>';}
  return s+'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'" fill="none" stroke="var(--cl-encre)" stroke-width="'+(o.w||.5)+'"/>';}
// Bulle d'instrument au tableau (cercle barré) et renvoi vers le relevé.
function bulle(x,y,lettres){plein(x-3.4,y-3.4,x+3.4,y+3.4,'bulle');const z=ZONE;ZONE='bulle';const t=T(x,y-.7,lettres,2,{a:'m',p:.22});ZONE=z;return '<circle cx="'+x+'" cy="'+y+'" r="3.4" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".35"/><path d="M'+(x-3.4)+' '+y+'L'+(x+3.4)+' '+y+'" stroke="var(--cl-encre)" stroke-width=".3"/>'+t;}
// Renvoi d'une feuille à l'autre (flèche pentagonale du dessin de procédé).
const wren=(lib,vers)=>Math.max(largeur(lib,2.6),largeur(vers,2.6))+6;
function renvoi(x,y,lib,vers,sens=1,c='encre'){const w=wren(lib,vers);if(sens>0)x=Math.min(x,404-w-3);else x=Math.max(x,26+w+3);const x0=sens>0?x:x-w,pt=sens>0?x+w+3:x-w-3;
  contenant(Math.min(x0,pt),y-4.6,Math.max(x0+w,pt),y+4.4,'renvoi');geo('v',{x0:Math.min(x0,pt),x1:Math.max(x0+w,pt),y,pointe:sens>0?'droite':'gauche',lib,vers});const z=ZONE;ZONE='renvoi';
  return '<path class="s9-cl-renvoi" data-pointe="'+(sens>0?'droite':'gauche')+'" d="M'+x0+' '+(y-4.6)+'L'+(x0+w)+' '+(y-4.6)+(sens>0?'L'+pt+' '+(y-.1)+'L'+(x0+w)+' '+(y+4.4):'L'+(x0+w)+' '+(y+4.4))+'L'+x0+' '+(y+4.4)+(sens<0?'L'+pt+' '+(y-.1):'')+'Z" fill="'+PAPIER+'" stroke="'+COUL[c]+'" stroke-width=".4"/>'
    +T(x0+w/2,y-.6,lib,2.6,{a:'m'})+T(x0+w/2,y+3.3,vers,2.6,{a:'m',p:.24})+(ZONE=z,'');}
// Relevé en direct : bulle, libellé au normographe, cadre de lecture où la valeur est écrite à l'encre bleue.
let RL=[],NR=0;
function rel(x,y,lib,val,o={}){const v=String(val),hv=o.hv||5.2,wv=largeur(v,hv),wl=largeur(lib,2.7),w=Math.max(o.w||0,wv+6,wl+2,26),bx=o.a==='f'?x-w:x;RL.push({lib,val:v,x:bx,y:y-4,w,h:hv+9});
  geo('r',{x0:bx,y0:y,x1:bx+w,y1:y+hv+5,q:lib});const z=ZONE;ZONE='rel:'+lib;
  const h='<g class="s9-cl-rel" data-lib="'+esc(lib)+'" data-val="'+esc(v)+'">'+T(bx+.4,y-1,lib,2.7)+'<rect x="'+bx+'" y="'+y+'" width="'+R2(w)+'" height="'+R2(hv+5)+'" fill="var(--cl-cadre)" stroke="var(--cl-encre)" stroke-width=".42"/>'
    +'<rect x="'+(bx+.9)+'" y="'+(y+.9)+'" width="'+R2(w-1.8)+'" height="'+R2(hv+3.2)+'" fill="none" stroke="var(--cl-encre)" stroke-width=".18"/>'
    +T(bx+w-3,y+hv+3,v,hv,{a:'f',c:'var(--cl-stylo)',p:hv*.115})+'</g>';ZONE=z;return h;}
// Étiquette de matériel (normographe) et petite note.
const lab=(x,y,t,h=3.2,a='m',c)=>T(x,y,t,h,{a,c});

// ══ CADRE, ZONES, CARTOUCHE, LÉGENDE ══
const W=420,H=297,TROUS=[28.5,108.5,188.5,268.5];
function cadre(n,titre,tranche,corps,elec){
  let s='<rect x="15" y="5" width="400" height="287" fill="none" stroke="var(--cl-encre)" stroke-width=".25"/><rect x="20" y="10" width="390" height="277" fill="none" stroke="var(--cl-encre)" stroke-width=".7"/>';
  ZONE='marge';for(let i=0;i<8;i++){const x=20+i*390/8,xm=x+390/16;if(i)s+='<path d="M'+R2(x)+' 5L'+R2(x)+' 10M'+R2(x)+' 287L'+R2(x)+' 292" stroke="var(--cl-encre)" stroke-width=".25"/>';s+=T(xm,8.9,String(i+1),2.4,{a:'m',p:.22})+T(xm,290.9,String(i+1),2.4,{a:'m',p:.22});}
  'ABCDEF'.split('').forEach((l,i)=>{const y=10+i*277/6,ym=y+277/12;if(i)s+='<path d="M15 '+R2(y)+'L20 '+R2(y)+'M410 '+R2(y)+'L415 '+R2(y)+'" stroke="var(--cl-encre)" stroke-width=".25"/>';s+=T(17.5,ym+1.2,l,2.4,{a:'m',p:.22})+T(412.5,ym+1.2,l,2.4,{a:'m',p:.22});});
  ZONE='';// flèches de centrage
  s+='<path d="M215 5L215 12M215 285L215 292M15 148.5L22 148.5M408 148.5L415 148.5" stroke="var(--cl-encre)" stroke-width=".35"/>';
  // cartouche (130 × 30 mm)
  const cx=263,cy=257,cr=cx+130;contenant(cx,cy,cr,287,'cartouche');s+='<g class="s9-cl-cartouche" data-centrale="Centrale de Fessenheim · Tranche '+tranche+'" data-titre="'+esc(titre)+'" data-feuille="'+(n?'Feuille '+n+' / 6':'Sommaire')+'"><rect x="'+cx+'" y="'+cy+'" width="130" height="30" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".7"/>'
    +tr('M'+cx+' '+(cy+9)+'L'+cr+' '+(cy+9)+'M'+cx+' '+(cy+22)+'L'+cr+' '+(cy+22)+'M'+(cx+46)+' '+(cy+22)+'L'+(cx+46)+' 287M'+(cx+80)+' '+(cy+22)+'L'+(cx+80)+' 287M'+(cx+16)+' '+(cy+9)+'L'+(cx+16)+' '+(cy+22),'encre',.35)
    +tr('M'+cx+' '+cy+'L'+cr+' '+cy+'L'+cr+' 287L'+cx+' 287L'+cx+' '+cy,'encre',.7)
    +T(cx+65,cy+6.6,'CENTRALE DE FESSENHEIM · TRANCHE '+tranche,3.4,{a:'m'})
    +T(cx+8,cy+13.4,'IND.',1.8,{a:'m',p:.18})+T(cx+8,cy+19.6,'A',4,{a:'m'})
    +T(cx+73,cy+18.6,titre,Math.min(5.4,(130-16-8)/largeur(titre,1)),{a:'m',p:.6})
    +T(cx+23,cy+27.3,'SYNOPTIQUE DE CONDUITE',Math.min(2.3,(46-4)/largeur('SYNOPTIQUE DE CONDUITE',1)),{a:'m',p:.2})+T(cx+63,cy+27.3,'ÉCHELLE : SANS',2.1,{a:'m',p:.2})+T(cx+105,cy+27.8,n?'FEUILLE '+n+' / 6':'6 FEUILLES',3.4,{a:'m',p:.4})+'</g>';
  if(!n)return s+corps;
  // légende
  const lx=28,ly=262;contenant(lx,ly-4,lx+(elec?150:168),ly+21,'légende');let g='<g class="s9-cl-legende"><rect x="'+lx+'" y="'+(ly-4)+'" width="'+(elec?150:168)+'" height="25" fill="none" stroke="var(--cl-encre)" stroke-width=".3"/>'+T(lx+2.5,ly+.5,'LÉGENDE',2.6,{p:.3});
  if(elec)g+=disj(lx+6,ly+7,true,3)+T(lx+10,ly+8.3,'DISJONCTEUR FERMÉ',2.4)+disj(lx+6,ly+14,false,3)+T(lx+10,ly+15.3,'OUVERT',2.4)+disj(lx+40,ly+14,null,3)+T(lx+44,ly+15.3,'ÉTAT INCONNU',2.4)
    +'<rect x="'+(lx+78)+'" y="'+(ly+4)+'" width="7" height="5" fill="var(--cl-sb-l)" stroke="var(--cl-encre)" stroke-width=".4"/>'+T(lx+88,ly+8.3,'SOUS TENSION, EN MARCHE',2.4)
    +'<rect x="'+(lx+78)+'" y="'+(ly+11)+'" width="7" height="5" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".4"/>'+T(lx+88,ly+15.3,'HORS TENSION, À L’ARRÊT',2.4);
  else g+=vanne(lx+6,ly+7,true,'h',2)+T(lx+10,ly+8.3,'VANNE OUVERTE',2.4)+vanne(lx+6,ly+14,false,'h',2)+T(lx+10,ly+15.3,'FERMÉE',2.4)
    +pompe(lx+56,ly+7,true,'prim',2.6)+T(lx+60,ly+8.3,'POMPE EN MARCHE',2.4)+pompe(lx+56,ly+14,false,'prim',2.6)+T(lx+60,ly+15.3,'À L’ARRÊT',2.4)
    +pompe(lx+110,ly+7,null,'prim',2.6)+T(lx+114,ly+8.3,'ÉTAT INCONNU',2.4)+bulle(lx+110,ly+14.5,'X')+T(lx+115,ly+15.3,'RELEVÉ EN DIRECT',2.4);
  // symboles d'exemple : hors des matériels de la tranche
  s+=g.replace(/class="s9-cl-(vanne|pompe|disj)" data-etat/g,'class="s9-cl-leg" data-etat')+'</g>';
  return s+corps;}

// ══ FEUILLE 1 · CIRCUIT PRIMAIRE ══ Cuve à gauche, trois boucles en bandes. La branche chaude entre dans la boîte à eau du GV, sous la
// plaque tubulaire, côté gauche de la cloison ; la branche en U part du côté droit vers la GMPP ; la branche froide revient à la cuve.
// Aspersion du pressuriseur piquée sur la branche froide de la boucle 1 (entre la GMPP et la cuve). RCV : la décharge et la charge
// traversent l'échangeur régénérateur.
function enceinteMixte(x,y,w,h,r){segs('M'+(x+r)+' '+y+'L'+(x+w-r)+' '+y+'M'+x+' '+(y+r)+'L'+x+' '+(y+h-r)+'M'+(x+w)+' '+(y+r)+'L'+(x+w)+' '+(y+h-r)+'M'+(x+r)+' '+(y+h)+'L'+(x+w-r)+' '+(y+h),.35);
  return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="none" stroke="var(--cl-encre)" stroke-width=".35" stroke-dasharray="7 1.4 1 1.4"/>';}
const interne=f0=>{const z=ZONE;ZONE='int';const r=f0();ZONE=z;return r;};
function f1(d){const s=d.state||{},nb=(d.pal&&Number.isInteger(d.pal.NB))?d.pal.NB:3,n=Number.isInteger(s.gmppN)?s.gmppN:null,gm=n===null?null:n===nb?true:n===0?false:null;
  let L='',E='',V='',X='';
  const B=[70,140,210],xc=88,GX=232,PX=170,SX=161;
  L+=enceinteMixte(34,14,226,236,14)+lab(52,246.5,'ENCEINTE DE CONFINEMENT',2.6,'d');
  B.forEach((yb,i)=>{const yh=yb-14,yf=yb+14,top=yb-44,bot=yb+6;
    L+=tr('M'+(xc+14)+' '+yh+'L'+(GX-18)+' '+yh+'L'+(GX-18)+' '+(bot-3)+'L'+(GX-10)+' '+(bot-3),'prim',1.1)
      +tr('M'+(GX+10)+' '+(bot-3)+'L'+(GX+16)+' '+(bot-3)+'L'+(GX+16)+' '+yf+'L'+(PX+5)+' '+yf,'pf',1.1)+tr('M'+(PX-5)+' '+yf+'L'+(xc+14)+' '+yf,'pf',1.1);
    contenant(GX-12,top,GX+12,bot,'GV');
    E+='<g class="s9-cl-gv"><path d="M'+(GX-12)+' '+(top+12)+'Q'+(GX-12)+' '+top+' '+GX+' '+top+'Q'+(GX+12)+' '+top+' '+(GX+12)+' '+(top+12)+'L'+(GX+12)+' '+(bot-8)+'Q'+(GX+12)+' '+bot+' '+GX+' '+bot+'Q'+(GX-12)+' '+bot+' '+(GX-12)+' '+(bot-8)+'Z" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".6"/>'
      +'<path d="M'+(GX-12)+' '+(bot-8)+'L'+(GX+12)+' '+(bot-8)+'M'+GX+' '+(bot-8)+'L'+GX+' '+bot+'" stroke="var(--cl-encre)" stroke-width=".35"/>'
      +[3,6,9].map(k=>'<path d="M'+(GX-k)+' '+(bot-8)+'L'+(GX-k)+' '+(top+16-k*.4)+'A'+k+' '+k+' 0 0 1 '+(GX+k)+' '+(top+16-k*.4)+'L'+(GX+k)+' '+(bot-8)+'" fill="none" stroke="var(--cl-prim)" stroke-width=".35"/>').join('')+'</g>';
    const ngv=f(s.gv);if(ngv!==null){const yl=R2(bot-8-(bot-8-top-4)*Math.max(0,Math.min(1,ngv/100)));X+='<path d="M'+(GX-11.5)+' '+yl+'L'+(GX+11.5)+' '+yl+'" stroke="var(--cl-are)" stroke-width=".35" stroke-dasharray="1.6 .8"/>';}
    X+=lab(GX-14,top+5,'GV '+(i+1),3.4,'f');
    L+=tr('M'+(GX+4)+' '+top+'L'+(GX+4)+' '+(top-5)+'L'+(GX+30)+' '+(top-5),'vap',.9)+tr('M'+(GX+30)+' '+(top+14)+'L'+(GX+12)+' '+(top+14),'are',.7);
    X+=renvoi(GX+31,top-5,'VAPEUR GV '+(i+1),'VERS F. 2',1,'vap')+renvoi(GX+34+wren('EAU ALIM. GV '+(i+1),'DE F. 2'),top+14,'EAU ALIM. GV '+(i+1),'DE F. 2',-1,'are');
    plein(PX-3.2,yf-12.5,PX+3.2,yf-6.5,'moteur GMPP');
    E+='<rect x="'+(PX-3.2)+'" y="'+(yf-12.5)+'" width="6.4" height="6" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".4"/><path d="M'+PX+' '+(yf-6.5)+'L'+PX+' '+(yf-5)+'" stroke="var(--cl-encre)" stroke-width=".4"/>'+interne(()=>T(PX,yf-8,'M',2.6,{a:'m',p:.25}));
    E+=pompe(PX,yf,gm,'pf',5,180,'GMPP '+(i+1));X+=lab(PX,yf+10.5,'GMPP '+(i+1),2.8);
    // accumulateur entre les deux branches, raccordé à la branche froide
    const ax=124,ac=f(s.accu);E+=reservoir(ax-5,yb-10,10,15,ac===null?null:ac/100*.7,'ris',{rx:5});
    L+=tr('M'+ax+' '+(yb+5)+'L'+ax+' '+yf,'ris',.55);V+=vanne(ax+.01,yb+8,s.accIso===true?false:s.accIso===false?true:null,'v',1.7,{lib:'Isolement accumulateur '+(i+1)})+clapet(ax,yb+11.6,'v',1,1.5);
    X+=lab(ax+7,yb-2,'ACCU '+(i+1),2.4,'d');
  });
  // cuve : virole, fonds, cœur et grappes
  const ct=40,cb=236,lc=f(s.lvlCuve),rod=f(s.rod);contenant(xc-14,ct,xc+14,cb,'cuve');
  E+='<g class="s9-cl-cuve"><clipPath id="s9cl-cuve"><rect x="'+(xc-14)+'" y="'+ct+'" width="28" height="'+(cb-ct)+'" rx="14"/></clipPath><rect x="'+(xc-14)+'" y="'+ct+'" width="28" height="'+(cb-ct)+'" rx="14" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".8"/>';
  if(lc!==null){const yl=R2(cb-(cb-ct)*Math.max(0,Math.min(1,lc/100)));E+='<path d="M'+(xc-14)+' '+yl+'L'+(xc+14)+' '+yl+'L'+(xc+14)+' '+cb+'L'+(xc-14)+' '+cb+'Z" fill="var(--cl-prim-l)" opacity=".32" clip-path="url(#s9cl-cuve)"/>';}
  E+='<rect x="'+(xc-9)+'" y="150" width="18" height="62" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".5"/>';
  for(let k=1;k<6;k++)E+='<path d="M'+(xc-9+k*3)+' 150L'+(xc-9+k*3)+' 212" stroke="var(--cl-encre)" stroke-width=".2"/>';
  const ins=rod===null?null:R2(150+62*(1-Math.max(0,Math.min(100,rod))/100));
  [xc-4.5,xc+1.5].forEach(x=>{E+='<path d="M'+x+' '+(ct+6)+'L'+x+' '+(ins===null?150:ins)+'" stroke="var(--cl-encre)" stroke-width=".9"'+(ins===null?' stroke-dasharray="1.2 1"':'')+'/>';});
  E+='<path d="M'+(xc-14)+' 56L'+(xc+14)+' 56" stroke="var(--cl-encre)" stroke-width=".35"/></g>'+lab(xc,ct-3,'CUVE',3.4)+T(xc-16,182,'CŒUR',2.6,{a:'f'});
  // pressuriseur sur la branche chaude de la boucle 1, chaufferettes, aspersion depuis la branche froide 1, soupapes vers le RDP
  const zx=150,zt=18,zb=48;L+=tr('M'+zx+' '+zb+'L'+zx+' '+(B[0]-14),'prim',.8);contenant(zx-8,zt,zx+8,zb,'pressuriseur');
  E+='<g class="s9-cl-pzr" data-chauff="'+ETAT[b(s.heat)]+'"><rect x="'+(zx-8)+'" y="'+zt+'" width="16" height="'+(zb-zt)+'" rx="8" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".6"/>'
    +'<path d="M'+(zx-5)+' '+(zb-4)+'L'+(zx-3.5)+' '+(zb-7)+'L'+(zx-2)+' '+(zb-4)+'L'+(zx-.5)+' '+(zb-7)+'L'+(zx+1)+' '+(zb-4)+'L'+(zx+2.5)+' '+(zb-7)+'L'+(zx+4)+' '+(zb-4)+'" fill="none" stroke="'+(s.heat===true?'var(--cl-prim)':'var(--cl-encre)')+'" stroke-width="'+(s.heat===true?.7:.35)+'"'+(s.heat==null?' stroke-dasharray=".9 .7"':'')+'/></g>';
  X+=lab(zx-10,40,'PRESSURISEUR',2.8,'f');
  L+=tr('M'+SX+' '+(B[0]+14)+'L'+SX+' 13L'+(zx+3)+' 13L'+(zx+3)+' '+zt,'pf',.45,{tir:'2.2 1'});X+=saut(SX,B[0]-14,'prim',1.1);
  V+=vanne(SX,30,b(s.spray),'v',2,{m:true,lib:'Aspersion'});X+=lab(SX+4,24,'ASPERSION',2.2,'d');
  L+=tr('M'+(zx-3)+' '+zt+'L'+(zx-3)+' 16L58 16L58 22','prim',.45);V+=vanne(118,16,b(s.sebim),'h',2,{m:true,lib:'Soupapes du pressuriseur'});X+=lab(104,22.6,'SOUPAPES',2.2,'d');
  const rdp=f(s.rdp);contenant(40,22,74,35,'RDP');E+='<rect x="40" y="22" width="34" height="13" rx="6.5" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".5"/>'+(rdp!==null?'<rect x="41" y="'+R2(34-11*Math.max(0,Math.min(1,rdp)))+'" width="32" height="'+R2(11*Math.max(0,Math.min(1,rdp)))+'" fill="var(--cl-prim-l)" opacity=".6"/>':'')+lab(57,31,'RDP',2.6);
  // RCV : décharge sur la branche en U de la boucle 3, échangeur régénérateur dans l'enceinte ; réservoir et pompe de charge dehors ;
  // la charge revient par le régénérateur vers la branche froide.
  const yc=B[2]+14,R0=GX+20,yR=238;
  L+=tr('M'+(GX+16)+' 219L'+R0+' 219L'+R0+' '+(yR-4.4),'pf',.5)+tr('M'+R0+' '+(yR+4.4)+'L'+R0+' 248L'+(GX+70)+' 248L'+(GX+70)+' 222','pf',.5);
  E+=reservoir(GX+64,200,12,22,null,'pf',{rx:6})+lab(GX+80,212,'RÉSERVOIR RCV',2.4,'d');
  L+=tr('M'+(GX+64)+' 214L'+(GX+52)+' 214L'+(GX+52)+' '+R2(yR+.66)+'L'+R2(R0+6.4)+' '+R2(yR+.66),'pf',.5)+tr('M'+R2(R0-6.4)+' '+R2(yR+.66)+'L140 '+R2(yR+.66)+'L140 '+yc,'pf',.5);
  E+=echangeur(R0,yR,4.4,'pf')+pompe(GX+52,221,null,'pf',3,90,'Charge RCV');X+=lab(GX+48,224,'CHARGE',2.2,'f')+lab(R0-8,235.6,'ÉCH. RÉGÉNÉRATEUR',2.2,'f');
  X+=T(GX+80,234,'RCV : CHARGE',2.6,{a:'d'})+T(GX+80,239,'ET DÉCHARGE',2.6,{a:'d'});
  // relevés (tableau de droite)
  const R=[],c1=300,c2=356;
  R.push(rel(c1,24,'T BRANCHE CHAUDE',unite(f(d.tempHot),1,'°C'),{w:44}));
  R.push(rel(c1,48,'T BRANCHE FROIDE',unite(f(d.tempCold),1,'°C'),{w:44}));
  R.push(rel(c1,72,'T MOYENNE',unite(f(s.Tavg),1,'°C'),{w:44}));
  R.push(rel(c1,96,'P PRIMAIRE',unite(f(s.Ppzr),1,'BAR'),{w:44}));
  R.push(rel(c1,120,'P THERMIQUE',unite(f(d.powerThermal),0,'MWTH'),{w:44}));
  R.push(rel(c1,144,'GMPP EN MARCHE',n===null?'—':n+' / '+nb,{w:44}));
  R.push(rel(c1,168,'NIVEAU CUVE',unite(lc,0,'%'),{w:44}));
  R.push(rel(c2,24,'GRAPPES D (EXTRAITES)',unite(rod,1,'%'),{w:44}));
  R.push(rel(c2,48,'BORE',unite(f(s.boreTotal),0,'PPM'),{w:44}));
  R.push(rel(c2,72,'ACCUMULATEURS',unite(f(s.accu),0,'%'),{w:44}));
  R.push(rel(c2,96,'NIVEAU GV',unite(f(s.gv),0,'%'),{w:44}));
  R.push(rel(c2,120,'INVENTAIRE',unite(f(s.inv),0,'%'),{w:44}));
  X+=bulle(134,27,'P')+bulle(126,47,'T')+'<path d="M126 50.4L126 '+(B[0]-14)+'" stroke="var(--cl-encre)" stroke-width=".2"/>'+bulle(146,92,'T')+'<path d="M146 88.6L146 '+(B[0]+14)+'" stroke="var(--cl-encre)" stroke-width=".2"/>';
  return L+E+V+X+R.join('');}

// ══ FEUILLE 2 · VAPEUR ET EAU ALIMENTAIRE ══ Trois GV ; soupapes, GCTa et vapeur de la TPS piquées en amont des VIV ; collecteur ; GCT ;
// poste d'eau : eau extraite, bâche alimentaire, TPA, réchauffeurs HP, vannes ARE ; ASG : bâche, deux motopompes, une turbopompe.
// Simplifications déclarées : l'ASG entre dans le GV par sa propre ligne, la TPS prend sa vapeur sur un GV.
function f2(d){const s=d.state||{};let L='',E='',V='',X='';const G=[60,110,160],yt=58,yb=150,ngv=f(s.gv);
  const gcta=f(s.gctA),svf=f(s.svf),gct=f(s.gct),are=f(s.areOut),asg=f(s.asg),Ps=f(s.Psteam);
  L+=tr('M'+G[0]+' 34L372 34','vap',1.2);X+=renvoi(372,34,'VAPEUR VERS','TURBINE F. 3',1,'vap');
  G.forEach((x,i)=>{const top=yt;contenant(x-12,top,x+12,yb,'GV');
    E+='<g class="s9-cl-gv"><path d="M'+(x-12)+' '+(top+14)+'Q'+(x-12)+' '+top+' '+x+' '+top+'Q'+(x+12)+' '+top+' '+(x+12)+' '+(top+14)+'L'+(x+12)+' '+(top+40)+'L'+(x+9)+' '+(top+50)+'L'+(x+9)+' '+(yb-8)+'Q'+(x+9)+' '+yb+' '+x+' '+yb+'Q'+(x-9)+' '+yb+' '+(x-9)+' '+(yb-8)+'L'+(x-9)+' '+(top+50)+'L'+(x-12)+' '+(top+40)+'Z" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".6"/>';
    if(ngv!==null){const hh=(yb-8)-(top+50),yl=R2(yb-8-hh*Math.max(0,Math.min(1,ngv/100)));E+='<path d="M'+(x-8.6)+' '+yl+'L'+(x+8.6)+' '+yl+'L'+(x+8.6)+' '+(yb-8)+'L'+(x-8.6)+' '+(yb-8)+'Z" fill="var(--cl-are-l)" opacity=".6"/><path d="M'+(x-8.6)+' '+yl+'L'+(x+8.6)+' '+yl+'" stroke="var(--cl-are)" stroke-width=".35"/>';}
    E+='<path d="M'+(x-6)+' '+(yb-4)+'L'+(x-6)+' '+(top+56)+'A6 6 0 0 1 '+(x+6)+' '+(top+56)+'L'+(x+6)+' '+(yb-4)+'M'+(x-3)+' '+(yb-4)+'L'+(x-3)+' '+(top+56)+'A3 3 0 0 1 '+(x+3)+' '+(top+56)+'L'+(x+3)+' '+(yb-4)+'" fill="none" stroke="var(--cl-prim)" stroke-width=".35"/>'
      +'<path d="M'+(x-10)+' '+(top+20)+'L'+(x+10)+' '+(top+20)+'M'+(x-10)+' '+(top+24)+'L'+(x+10)+' '+(top+24)+'" stroke="var(--cl-encre)" stroke-width=".25"/></g>';
    X+=lab(x,yb+7,'GV '+(i+1),3.6)+lab(x,yb+12,'PRIMAIRE F. 1',2.2);
    L+=tr('M'+x+' '+top+'L'+x+' 34','vap',.9);
    // en amont des VIV : soupapes (y 54), GCTa (y 50) ; la VIV juste sous le collecteur
    L+=tr('M'+x+' 50L'+(x+9)+' 50L'+(x+9)+' 18','vap',.5);X+=saut(x+9,34,'vap',1.2);V+=vanne(x+9,26,gcta===null?null:gcta>.01,'v',2,{m:true,lib:'GCTa GV '+(i+1)});X+='<path d="M'+(x+6)+' 16L'+(x+12)+' 16M'+(x+9)+' 16L'+(x+9)+' 13" stroke="var(--cl-vap)" stroke-width=".5"/>';
    L+=tr('M'+x+' 54L'+(x-9)+' 54L'+(x-9)+' 18','vap',.5);if(x-9>G[0])X+=saut(x-9,34,'vap',1.2);plein(x-11,19.5,x-7,28.5,'soupape');
    V+='<g class="s9-cl-vanne" data-etat="'+(svf===null?'inconnu':svf>.02?'ouvert':'ferme')+'" data-lib="Soupapes GV '+(i+1)+'"><path d="M'+(x-11)+' 28L'+(x-7)+' 28L'+(x-9)+' 24Z" fill="'+(svf===null?PAPIER:svf>.02?PAPIER:'var(--cl-encre)')+'" '+bord(svf===null?null:true,.35)+'/><path d="M'+(x-9)+' 24L'+(x-9)+' 20M'+(x-10.6)+' 23L'+(x-7.4)+' 21.4M'+(x-10.6)+' 21.6L'+(x-7.4)+' 20" stroke="var(--cl-encre)" stroke-width=".3"/></g>';
    V+=vanne(x,41,b(s.viv),'v',2.2,{m:true,lib:'VIV GV '+(i+1)});
    L+=tr('M'+(x+12)+' '+(top+30)+'L'+(x+18)+' '+(top+30)+'L'+(x+18)+' 178','are',.7);V+=vanne(x+18,170,are===null?null:are>.5,'v',2.1,{m:true,lib:'Vanne ARE GV '+(i+1)});
    L+=tr('M'+(x-9)+' '+(top+62)+'L'+(x-16)+' '+(top+62)+'L'+(x-16)+' 200','asg',.6);if(x-16>78)X+=saut(x-16,178,'are',1);V+=vanne(x-16,192,asg===null?null:asg>.0005,'v',1.9,{lib:'Vanne ASG GV '+(i+1)});
  });
  X+=lab(78,24,'GCTA',2.6,'d')+lab(47,24,'SOUPAPES',2.4,'f')+lab(57,46,'VIV',2.4,'f');
  const xG=Math.min(372,404-wren('GCT VERS','CONDENSEUR F. 3')-3);L+=tr('M300 34L300 66L'+R2(xG)+' 66','vap',.7);V+=vanne(330,66,gct===null?null:gct>.01,'h',2.4,{m:true,lib:'GCT au condenseur'});X+=lab(330,74,'GCT',3)+renvoi(xG,66,'GCT VERS','CONDENSEUR F. 3',1,'vap');
  // poste d'eau
  const wE=wren('EAU EXTRAITE','DE F. 3');L+=tr('M78 178L295 178','are',1)+tr('M305 178L334 178','are',1)+tr('M364 178L'+R2(404-wE-3)+' 178','are',1);X+=renvoi(404,178,'EAU EXTRAITE','DE F. 3',-1,'are');
  contenant(334,171,364,185,'bâche alimentaire');E+='<rect x="334" y="171" width="30" height="14" rx="7" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".5"/>'+lab(349,192.5,'BÂCHE ALIMENTAIRE',2.4);
  E+=pompe(300,178,b(s.tpaRun),'are',5,180,'TPA');X+=lab(300,190,'TPA',3);E+=echangeur(250,178,5,'vap')+echangeur(225,178,5,'vap');X+=lab(237.5,190,'RÉCHAUFFEURS HP',2.4);
  // ASG
  const bA=f(s.bacheASG);E+=reservoir(30,206,26,40,bA,'asg',{rx:3});X+=lab(43,252,'BÂCHE ASG',2.6);
  L+=tr('M56 228L66 228L66 212L95.8 212M66 228L95.8 228M66 228L66 242L95.8 242','asg',.6);
  L+=tr('M104.2 212L136 212M104.2 228L136 228M104.2 242L136 242','asg',.6)+tr('M136 242L136 200M44 200L144 200','asg',.6);
  E+=pompe(100,212,enMarche(s,'mpsA'),'asg',4.2,0,'Motopompe ASG A')+pompe(100,228,enMarche(s,'mpsB'),'asg',4.2,0,'Motopompe ASG B')+pompe(100,242,tps(s),'asg',4.2,0,'Turbopompe ASG');
  X+=lab(78,207,'MPS A',2.4,'d')+lab(78,223,'MPS B',2.4,'d')+lab(78,237.5,'TPS',2.4,'d');
  plein(96,246.2,104,253,'turbine TPS');E+='<path d="M97 247L103 246.2L103 253L97 252.2Z" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".4"/><path d="M100 246.2L100 247" stroke="var(--cl-encre)" stroke-width=".4"/>';
  L+=tr('M103 249.6L184 249.6L184 56L'+G[2]+' 56','vap',.45,{tir:'2 1'});X+=saut(184,178,'are',1);
  L+=tr('M184 70L188 70','vap',.45,{tir:'2 1'});X+=renvoi(188,70,'VAPEUR LLS','VERS F. 4',1,'vap');X+=lab(187,150,'VAPEUR TPS',2.2,'d')+lab(150,256,'ASG : MOTOPOMPES ET TURBOPOMPE',2.6,'d');
  const R=[];
  R.push(rel(196,90,'NIVEAU GV',unite(ngv,0,'%'),{w:36}));
  R.push(rel(196,114,'P VAPEUR GV',unite(Ps,1,'BAR'),{w:36}));
  R.push(rel(240,90,'T VAPEUR GV',unite(f(s.tVapGV),0,'°C'),{w:36}));
  R.push(rel(240,114,'FUITE VVP',(v=>v===null?'—':num(v,1)+' L/H')(releve(d,'krtv')),{w:36}));
  R.push(rel(300,90,'GCT ATMOSPHÈRE',gcta===null?'—':num(gcta*100,0)+' %',{w:40}));
  R.push(rel(300,114,'GCT CONDENSEUR',(s.gctMode==='manu'?'MANU ':s.gctMode==='auto'?'AUTO ':'')+(gct===null?'—':num(gct*100,0)+' %'),{w:46}));
  R.push(rel(196,204,'ARE',s.areAvail===false?'INDISPONIBLE':(s.areAuto===false?'MANU ':s.areAuto===true?'AUTO ':'')+(are===null?'—':num(are,0)+' %'),{w:40}));
  R.push(rel(245,204,'T EAU ALIMENTAIRE',unite(releve(d,'tare'),0,'°C'),{w:40}));
  R.push(rel(146,216,'DÉBIT ASG',asg===null?'—':num(asg*100,1)+' %',{w:30}));
  R.push(rel(196,228,'BÂCHE ASG',bA===null?'—':num(bA*100,0)+' %',{w:40}));
  X+=bulle(191,96,'L')+bulle(191,120,'P');
  return L+E+V+X+R.join('');}

// Source froide de Fessenheim : la prise dans le canal latéral, le rejet dans le canal de force motrice (V29), séparés par une digue.
function eaux(y0,h){let s='';for(const [a,b2,t] of [[24,211,'CANAL LATÉRAL · PRISE'],[219,408,'CANAL DE FORCE MOTRICE · REJET']]){
    s+='<rect x="'+a+'" y="'+y0+'" width="'+(b2-a)+'" height="'+h+'" fill="var(--cl-sec-l)" opacity=".55"/>';let v='';for(let x=a+4;x<b2-12;x+=12)v+='M'+x+' '+(y0+5)+'q3 -2 6 0t6 0';
    s+='<path d="'+v+'" fill="none" stroke="var(--cl-sec)" stroke-width=".3"/>'+tr('M'+a+' '+y0+'L'+b2+' '+y0,'encre',.45);contenant(a,y0,b2,y0+h,'eau');s+=T(a+4,y0+h-2.4,t,2.6);}
  let hh='';for(let y=y0;y<y0+h;y+=2.4)hh+='M211 '+R2(y+2.4)+'L219 '+R2(y);
  return s+'<rect x="211" y="'+(y0-2)+'" width="8" height="'+(h+2)+'" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".35"/><path d="'+hh+'" stroke="var(--cl-encre)" stroke-width=".2" clip-path="inset(0)"/>';}

// ══ FEUILLE 3 · LIGNE D'ARBRE ══ Turbine HP, sécheur surchauffeur, corps BP (trois, comme le 900 du jeu), alternateur ; condenseur, CVI,
// circulation CRF (prise au canal latéral, rejet au canal de force motrice).
function f3(d){const s=d.state||{};let L='',E='',V='',X='';const ya=92,adm=f(s.turb),Pc=f(s.Pcond),crf=b(s.crf);
  E+='<path d="M24 '+ya+'L400 '+ya+'" stroke="var(--cl-encre)" stroke-width=".3" stroke-dasharray="9 1.5 1.5 1.5"/>';X+=lab(26,ya-1.5,'AXE',2.2,'d');
  const wv=largeur('VAPEUR DES GV',2.6)+6;X+=renvoi(26,40,'VAPEUR DES GV','DE F. 2',1,'vap');L+=tr('M'+R2(29+wv)+' 40L70 40L70 '+(ya-14.4),'vap',1.2);
  V+=vanne(70,62,adm===null?null:adm>1,'v',2.6,{m:true,lib:'Admission HP'});X+=lab(66,63,'ADMISSION',2.4,'f');
  contenant(64,ya-20,84,ya+20,'HP');E+='<path d="M64 '+(ya-12)+'L84 '+(ya-20)+'L84 '+(ya+20)+'L64 '+(ya+12)+'Z" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".6"/>'+lab(75,ya-3,'HP',3);
  contenant(120,22,140,38,'GSS');L+=tr('M80 '+(ya-18.4)+'L80 30L120 30','vap',.8)+tr('M140 30L300 30','vap',.8);E+='<rect x="120" y="22" width="20" height="16" rx="3" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".5"/>'+'<path d="M123 33L126 27L129 33L132 27L135 33L138 27" fill="none" stroke="var(--cl-vap)" stroke-width=".35"/>'+lab(130,19,'GSS',2.8);
  [160,230,300].forEach((x,i)=>{L+=tr('M'+x+' 30L'+x+' '+(ya-17),'vap',.8);contenant(x-24,ya-26,x+24,ya+26,'BP');
    E+='<path d="M'+(x-24)+' '+(ya-26)+'L'+(x-4)+' '+(ya-14)+'L'+(x-4)+' '+(ya+14)+'L'+(x-24)+' '+(ya+26)+'ZM'+(x+24)+' '+(ya-26)+'L'+(x+4)+' '+(ya-14)+'L'+(x+4)+' '+(ya+14)+'L'+(x+24)+' '+(ya+26)+'Z" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".6"/><rect x="'+(x-4)+'" y="'+(ya-14)+'" width="8" height="28" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".5"/>'+lab(x,ya+33,'BP '+(i+1),3.2);
    L+=tr('M'+(x-20)+' '+(ya+24)+'L'+(x-20)+' 150M'+(x+20)+' '+(ya+24)+'L'+(x+20)+' 150','vap',.5,{tir:'2 1'});});
  const ax=358;contenant(ax-17,ya-17,ax+17,ya+17,'alternateur');E+='<circle cx="'+ax+'" cy="'+ya+'" r="17" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".7"/>'+lab(ax,ya-2,'G',6,'m')+T(ax,ya+7,'~',4,{a:'m'});
  contenant(380,ya-6,390,ya+6,'excitatrice');E+='<rect x="380" y="'+(ya-6)+'" width="10" height="12" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".4"/>'+lab(385,ya+11,'EXC.',2.2)+lab(ax,ya+22,'ALTERNATEUR',2.8);
  L+=tr('M'+ax+' '+(ya-17)+'L'+ax+' 46L'+(ax+4)+' 46','hta',.8);X+=renvoi(ax+4,46,'RÉSEAU','F. 4',1,'hta');
  contenant(120,150,330,184,'condenseur');E+='<rect x="120" y="150" width="210" height="34" rx="3" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".6"/>';
  for(let k=0;k<4;k++)E+='<path d="M126 '+(156+k*4.5)+'L324 '+(156+k*4.5)+'" stroke="var(--cl-sec)" stroke-width=".3"/>';
  X+=lab(225,181,'CONDENSEUR',3.2);contenant(210,186,240,194,'puits');E+='<rect x="210" y="186" width="30" height="8" rx="2" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".4"/>'+lab(244,192,'PUITS',2.2,'d');
  const wg=largeur('DE F. 2',2.6)+6;X+=renvoi(26,140,'GCT','DE F. 2',1,'vap');L+=tr('M'+R2(29+wg)+' 140L124 140L124 150','vap',.6);
  L+=tr('M330 160L366 160','encre',.45);E+=pompe(370,160,b(s.cvi),'encre',4,0,'CVI');X+=lab(370,170,'CVI',2.8,'m')+lab(370,175,'INCONDENSABLES',2,'m');
  const xX=Math.min(372,404-wren('EAU EXTRAITE','VERS F. 2')-3);L+=tr('M225 194L225 206L261 206','are',.7)+tr('M269 206L'+R2(xX)+' 206','are',.7);E+=pompe(265,206,null,'are',4,0,'Extraction');X+=lab(265,215,'EXTRACTION',2.2)+renvoi(xX,206,'EAU EXTRAITE','VERS F. 2',1,'are');
  E+=eaux(236,16);
  L+=tr('M96 236L96 217M96 207L96 167L120 167','sec',.9)+tr('M330 167L352 167L352 236','sec',.9);X+=saut(352,206,'are',.7);
  E+=pompe(96,212,crf,'sec',5,-90,'CRF');X+=lab(88,213,'CRF',3,'f')+lab(100,201,'PRISE',2.2,'d')+lab(356,212,'REJET',2.2,'d');
  const R=[];
  R.push(rel(28,70,'ADMISSION HP',unite(adm,0,'%'),{w:32}));
  R.push(rel(96,48,'P ADMISSION',unite(f(s.Padm),1,'BAR'),{w:34}));
  R.push(rel(336,124,'PUISSANCE ÉLECTRIQUE',unite(f(s.Pelec),0,'MWe'),{w:46}));
  R.push(rel(150,200,'P CONDENSEUR',Pc===null?'—':num(Pc*1000,0)+' MBAR',{w:38}));
  R.push(rel(30,170,'T SOURCE FROIDE',unite(f(s.Tsrc),1,'°C'),{w:38}));
  R.push(rel(30,194,'PUISSANCE THERMIQUE',unite(f(d.powerThermal),0,'MWTH'),{w:46}));
  X+=bulle(140,192,'P')+'<path d="M140 188.6L140 184" stroke="var(--cl-encre)" stroke-width=".2"/>';
  return L+E+V+X+R.join('');}

// ══ FEUILLE 4 · ÉLECTRICITÉ ══ Schéma unifilaire : poste 400 kV, transformateur principal, alternateur, soutirage, auxiliaires,
// tableaux secourus LHA et LHB, diesels des voies A et B (282A : pas de repère de diesel à Fessenheim), TAC du site, ultime secours LLS.
function transfo(x,y,v=true,c1='hta',c2='encre'){plein(x-5,y-8.4,x+5,y+8.4,'transformateur');return v?'<circle cx="'+x+'" cy="'+(y-3.4)+'" r="5" fill="none" stroke="'+COUL[c1]+'" stroke-width=".5"/><circle cx="'+x+'" cy="'+(y+3.4)+'" r="5" fill="none" stroke="'+COUL[c2]+'" stroke-width=".5"/>'
  :'<circle cx="'+(x-3.4)+'" cy="'+y+'" r="5" fill="none" stroke="'+COUL[c1]+'" stroke-width=".5"/><circle cx="'+(x+3.4)+'" cy="'+y+'" r="5" fill="none" stroke="'+COUL[c2]+'" stroke-width=".5"/>';}
function gen(x,y,e,lib,r=7){plein(x-r,y-r,x+r,y+r,'générateur');return '<g class="s9-cl-gen" data-etat="'+ETAT[e]+'" data-lib="'+esc(lib)+'"><circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+(e===true?'var(--cl-sb-l)':PAPIER)+'" '+bord(e,.55)+'/>'+interne(()=>T(x,y+.4,'G',r*.55,{a:'m'})+T(x,y+r*.62,'~',r*.4,{a:'m',p:.3}))+'</g>';}
function jeu(x,y,w,lib,e,c='sb'){plein(x,y-2.2,x+w,y+2.2,'barres');return '<g class="s9-cl-jdb" data-etat="'+(e===true?'sous-tension':e===false?'hors-tension':'inconnu')+'" data-lib="'+esc(lib)+'"><rect x="'+x+'" y="'+(y-2.2)+'" width="'+w+'" height="4.4" fill="'+(e===true?LAV[c]:PAPIER)+'" '+bord(e,.6)+'/></g>';}
function f4(d){const s=d.state||{};let L='',E='',V='',X='';const res=b(s.reseau),ilo=s.ilote===true,dj=ilo?false:res,al=alimentee(s),dg=b(s.diesel),lls=b(s.lls);
  E+=jeu(40,26,240,'Poste 400 kV',res,'hta')+'<path d="M40 31L280 31" stroke="var(--cl-hta)" stroke-width=".35"/>';X+=lab(40,19,'POSTE 400 kV · RÉSEAU DE TRANSPORT',3.2,'d');
  L+=tr('M120 28.2L120 53.6','hta',.7);V+=disj(120,40,dj,4,'Disjoncteur de groupe');X+=lab(126,41.4,'DISJONCTEUR',2.4,'d');
  E+=transfo(120,62,true,'hta','encre');X+=lab(128,63,'TRANSFORMATEUR PRINCIPAL',2.4,'d');
  L+=tr('M120 70.4L120 92L201 92','encre',.7);E+=gen(212,92,s.Pelec>1?true:Number.isFinite(s.Pelec)?false:null,'Alternateur',11);X+=lab(212,110,'ALTERNATEUR',2.8)+lab(212,115,'LIGNE D’ARBRE F. 3',2.2);
  L+=tr('M150 92L150 107.6','encre',.6);E+=transfo(150,116,true,'encre','sb');X+=lab(158,116,'SOUTIRAGE',2.4,'d');L+=tr('M150 124.4L150 139.8','sb',.6);
  E+=jeu(40,82,50,'Réseau auxiliaire',res,'hta');X+=lab(40,77,'RÉSEAU AUXILIAIRE',2.4,'d');L+=tr('M64 84.2L64 103.6','hta',.5,{tir:'2 1'});E+=transfo(64,112,true,'hta','sb');X+=lab(72,112,'TRANSFO. AUXILIAIRE',2.2,'d');L+=tr('M64 120.4L64 139.8','sb',.5,{tir:'2 1'});
  E+=jeu(40,142,160,'Tableaux des auxiliaires',res===true||ilo&&f(s.turb)>3?true:res===false&&!ilo?false:null,'sb');X+=lab(84,150.5,'TABLEAUX DES AUXILIAIRES 6,6 kV',2.6,'d');
  const LH=[[80,'LHA','VOIE A'],[190,'LHB','VOIE B']];
  LH.forEach(([x,t,g],i)=>{L+=tr('M'+x+' 144.2L'+x+' 187.8','sb',.6);V+=disj(x,164,al===null?null:al&&!(res===false&&dg===true),3.4,'Arrivée normale '+t);
    E+=jeu(x-30,190,60,'Tableau secouru '+t,al);X+=lab(x-30,197.6,'TABLEAU '+t,2.6,'d');
    L+=tr('M'+(x+18)+' 192.2L'+(x+18)+' 222.6','sb',.6);V+=disj(x+18,206,dg,3.4,'Arrivée diesel '+g.toLowerCase());
    contenant(x+10,236,x+26,246,'moteur diesel');E+='<rect x="'+(x+10)+'" y="236" width="16" height="10" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".45"/>'+T(x+18,243.4,'D',3,{a:'m'})+gen(x+18,229,dg,'Diesel '+g.toLowerCase(),6.4);
    X+=lab(x+28,240,'DIESEL '+g,2.8,'d');});
  L+=tr('M266 193L266 172L110 172L110 187.8','sb',.45,{tir:'2.2 1'})+tr('M266 172L220 172L220 187.8','sb',.45,{tir:'2.2 1'});X+=saut(190,172,'sb',.45);
  contenant(258,208,274,217,'TAC');E+=gen(266,200,null,'TAC du site',7)+'<rect x="258" y="208" width="16" height="9" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".45" stroke-dasharray="1.1 .9"/>'+T(266,214.7,'TAC',2.4,{a:'m'});X+=lab(278,201,'TAC DU SITE',2.8,'d');
  E+=jeu(300,150,80,'Tableau ultime secours',lls,'sb');X+=lab(300,144,'TABLEAU ULTIME SECOURS',2.4,'d');L+=tr('M340 152.2L340 169','sb',.6);E+=gen(340,176,lls,'Ultime secours LLS',7);
  const wL=wren('VAPEUR LLS','DE F. 2');L+=tr('M340 183L340 192L370 192L370 136L'+R2(404-wL-3)+' 136','vap',.45,{tir:'2 1'});X+=lab(346,188,'LLS',3,'d')+renvoi(404,136,'VAPEUR LLS','DE F. 2',-1,'vap');
  const R=[];
  R.push(rel(296,40,'RÉSEAU EXTÉRIEUR',res===true?'PRÉSENT':res===false?'PERDU':'—',{w:46}));
  R.push(rel(350,40,'ÎLOTAGE',s.ilote===true?'ÎLOTÉE':s.ilote===false?'NON':'—',{w:30}));
  R.push(rel(244,64,'PRODUCTION NETTE',unite(f(s.Pelec),0,'MWe'),{w:40}));
  R.push(rel(296,64,'PRODUCTION BRUTE',unite(f(s.Pbrut),0,'MWe'),{w:40}));
  R.push(rel(350,64,'AUXILIAIRES',unite(f(s.Paux),0,'MWe'),{w:40}));
  R.push(rel(296,88,'TABLEAUX LHA · LHB',al===true?'SOUS TENSION':al===false?'HORS TENSION':'—',{w:52}));
  R.push(rel(296,112,'PERTE TOTALE H3',s.h3===true?'PRÉSENTE':s.h3===false?'NON':'—',{w:44}));
  R.push(rel(296,218,'DIESELS VOIES A · B',dg===true?'EN MARCHE':dg===false?'ARRÊT':'—',{w:42}));
  R.push(rel(346,218,'ULTIME SECOURS',lls===true?'SOLLICITÉ':lls===false?'ARRÊT':'—',{w:40}));
  return L+E+V+X+R.join('');}

// ══ FEUILLE 5 · SAUVEGARDES ══ Bâche PTR ; injection HP par les pompes de charge du RCV, comme au 900 ; RIS BP ; accumulateurs ; tout
// arrive aux branches froides. Aspersion EAS, puisard et recirculation, signal IS.
function f5(d){const s=d.state||{};let L='',E='',V='',X='';const inj=f(s.inj),is=s.sigIS===true;
  segs('M220 18L356 18M190 48L190 202M386 48L386 202M220 232L356 232',.9);
  E+='<rect x="190" y="18" width="196" height="214" rx="30" fill="none" stroke="var(--cl-encre)" stroke-width=".9"/><rect x="194" y="22" width="188" height="206" rx="27" fill="none" stroke="var(--cl-encre)" stroke-width=".3"/>';
  X+=lab(200,47,'ENCEINTE',3,'d');
  // cuve et branches froides
  contenant(344,92,366,172,'cuve');E+='<rect x="344" y="92" width="22" height="80" rx="11" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".7"/>'+lab(355,88,'CUVE',2.8);
  L+=tr('M344 104L222 104M344 116L222 116M344 128L222 128','pf',.8);X+=lab(220,105,'BF 1',2.2,'f')+lab(220,117,'BF 2',2.2,'f')+lab(220,129,'BF 3',2.2,'f');
  // accumulateurs ×3, chacun sur sa branche froide
  const ac=f(s.accu),AX=[230,254,278];AX.forEach((x,i)=>{E+=reservoir(x-6,46,12,30,ac===null?null:ac/100*.7,'ris',{rx:6});L+=tr('M'+x+' 76L'+x+' '+(104+12*i),'ris',.5);X+=lab(x,43,'A'+(i+1),2.4);
    V+=vanne(x,84,s.accIso===true?false:s.accIso===false?true:null,'v',2,{m:true,lib:'Isolement accumulateur '+(i+1)})+clapet(x,94,'v',1,1.8);
    for(let k=0;k<i;k++)X+=saut(x,104+12*k,'pf',.8);});
  // bâche PTR, collecteur d'aspiration
  const ptr=f(s.ptr);E+=reservoir(30,40,38,70,ptr,'ris',{rx:4,w:.6});X+=lab(49,36,'BÂCHE PTR',2.8);
  L+=tr('M49 110L49 124L84 124','ris',.8)+tr('M84 60L84 216','ris',.8);
  // EAS : pompe, échangeur, rampe et buses en haut de l'enceinte
  L+=tr('M84 60L119.6 60','ris',.7)+tr('M128.4 60L146 60L146 50.2M146 41.8L146 30L370 30','asg',.7);E+=pompe(124,60,b(s.eas),'asg',4.4,0,'Aspersion EAS');
  for(let x=216;x<=360;x+=24)L+='<path d="M'+x+' 30L'+(x-2.5)+' 35M'+x+' 30L'+x+' 36M'+x+' 30L'+(x+2.5)+' 35" stroke="var(--cl-asg)" stroke-width=".4" fill="none"/>';
  E+=echangeur(146,46,4.2,'sec');X+=lab(131,71,'EAS',3,'d')+lab(155,47,'ÉCH. EAS',2.2,'d');
  // injection HP par la charge RCV, RIS BP : aux trois branches froides
  L+=tr('M84 150L119.6 150','ris',.7)+tr('M128.4 150L310 150L310 104','ris',.7);E+=pompe(124,150,b(s.ishp),'ris',4.4,0,'Charge RCV en injection HP');X+=lab(131,156,'CHARGE RCV · IS HP',2.6,'d')+lab(131,161,'POMPES DE CHARGE F. 1',2,'d');
  L+=tr('M84 180L119.6 180','ris',.7)+tr('M128.4 180L300 180L300 104','ris',.7);E+=pompe(124,180,b(s.isbp),'ris',4.4,0,'Injection BP');X+=lab(131,186,'RIS BP',2.6,'d')+saut(300,150,'ris',.7);
  [104,116,128].forEach(y=>{noeud(300,y);noeud(310,y);});X+=[104,116,128].map(y=>'<circle cx="300" cy="'+y+'" r=".9" fill="var(--cl-ris)"/><circle cx="310" cy="'+y+'" r=".9" fill="var(--cl-ris)"/>').join('');
  V+=vanne(176,150,inj===null?null:inj>.02,'h',2.2,{m:true,lib:'Injection de sécurité'});
  // puisard et recirculation
  contenant(280,210,340,222,'puisard');E+='<rect x="280" y="210" width="60" height="12" rx="2" fill="'+(f(s.puisard)>.01?'var(--cl-ris-l)':PAPIER)+'" stroke="var(--cl-encre)" stroke-width=".5"/>'+lab(310,206,'PUISARD',2.6);
  L+=tr('M280 216L84 216','ris',.5,{tir:'2 1'});X+=saut(124,216,'ris',.5);V+=vanne(230,216,b(s.recirc),'h',2.2,{m:true,lib:'Recirculation'});X+=lab(230,226,'RECIRCULATION',2.2);
  // logique du signal IS
  const sx=40,sy=150;contenant(sx,sy,sx+26,sy+22,'signal IS');E+='<g class="s9-cl-logique" data-etat="'+(is?'present':s.sigIS===false?'absent':'inconnu')+'"><rect x="'+sx+'" y="'+sy+'" width="26" height="22" fill="'+(is?'var(--cl-ris-l)':PAPIER)+'" stroke="var(--cl-encre)" stroke-width=".5"/>'+T(sx+13,sy+9,'≥1',3.4,{a:'m'})+T(sx+13,sy+17,'SIGNAL IS',2.2,{a:'m',p:.22})+'</g>';
  X+=lab(sx-4,sy+4,'P ENC.',2,'f')+lab(sx-4,sy+10,'P PRIM.',2,'f')+lab(sx-4,sy+16,'P VAP.',2,'f')+'<path d="M'+(sx-3)+' '+(sy+3)+'L'+sx+' '+(sy+3)+'M'+(sx-3)+' '+(sy+9)+'L'+sx+' '+(sy+9)+'M'+(sx-3)+' '+(sy+15)+'L'+sx+' '+(sy+15)+'" stroke="var(--cl-encre)" stroke-width=".3"/>';
  L+=tr('M66 161L76 161L76 236L124 236L124 184.4','encre',.3,{tir:'3 1 .6 1'});
  X+=lab(78,244,'ORDRE DE DÉMARRAGE',2.2,'d');
  const R=[];
  R.push(rel(30,200,'SIGNAL IS',s.sigIS===true?'PRÉSENT':s.sigIS===false?'ABSENT':'—',{w:38}));
  R.push(rel(30,228,'BLOCAGE IS',s.isBlk===true?'BLOQUÉ':s.isBlk===false?'NORMAL':'—',{w:38}));
  R.push(rel(30,132,'BÂCHE PTR',ptr===null?'—':num(ptr*100,0)+' %',{w:30}));
  R.push(rel(292,46,'ACCUMULATEURS',unite(ac,0,'%'),{w:36}));
  R.push(rel(334,46,'P ENCEINTE',unite(f(s.Penc),2,'BAR'),{w:36}));
  R.push(rel(292,66,'H2 ENCEINTE',unite(f(s.h2),1,'% VOL'),{w:36}));
  R.push(rel(334,66,'ISOLEMENT',s.isoEnc===true?'ISOLÉE':s.isoEnc===false?'NORMAL':'—',{w:36}));
  R.push(rel(206,186,'INVENTAIRE',unite(f(s.inv),0,'%'),{w:30}));
  return L+E+V+X+R.join('');}

// ══ FEUILLE 6 · REFROIDISSEMENT ══ RRA → RRI → SEC ; à Fessenheim, EAS, RCV, pompes primaires et ventilations directement au SEC.
function f6(d){const s=d.state||{},nb=(d.pal&&Number.isInteger(d.pal.NB))?d.pal.NB:3,n=Number.isInteger(s.gmppN)?s.gmppN:null,gm=n===null?null:n===nb?true:n===0?false:null;
  let L='',E='',V='',X='';const sec=b(s.sec),rri=b(s.rri),rra=b(s.rra);
  contenant(30,34,64,90,'primaire');E+='<rect x="30" y="34" width="34" height="56" rx="12" fill="'+PAPIER+'" stroke="var(--cl-encre)" stroke-width=".6"/>'+lab(47,64,'PRIMAIRE',2.6)+lab(47,70,'F. 1',2.2);
  L+=tr('M64 46L75.4 46M80.6 46L90.6 46','rra',.7)+tr('M99.4 46L120 46L120 61.8L142.6 61.8','rra',.7)+tr('M157.4 61.8L166 61.8L166 80L64 80','rra',.7);
  E+=pompe(95,46,rra,'rra',4.4,0,'Pompe RRA');V+=vanne(78,46,rra,'h',2.2,{m:true,lib:'Aspiration RRA'});X+=lab(95,38,'RRA',3.2);
  E+=echangeur(150,61,5.4,'rra');X+=lab(170,72,'ÉCH. RRA',2.4,'d');
  L+=tr('M150 55.6L150 50L250 50L250 83.6M250 96.4L250 120L204.4 120M195.6 120L150 120L150 66.4','rri',.7);X+=saut(150,80,'rra',.7);
  L+=tr('M150 104L126 104L126 110','rri',.5);E+=reservoir(120,110,12,16,null,'rri',{rx:3});X+=lab(126,132,'EXPANSION RRI',2.2,'m');
  E+=pompe(200,120,rri,'rri',4.4,180,'Pompe RRI');X+=lab(200,130,'RRI',3.2);X+=lab(200,47,'RRI',3.2,'m',COUL.rri);
  E+=echangeur(250,90,6.4,'sec');X+=lab(258,80,'ÉCH. RRI / SEC',2.4,'d');
  // SEC : prise au canal latéral, pompe, aller, retour, rejet au canal de force motrice
  const ya=196,yr=212,xf=367;E+=eaux(240,16);
  L+=tr('M70 240L70 219M70 209L70 '+ya+'L'+xf+' '+ya,'sec',.9)+tr('M266 '+yr+'L392 '+yr+'L392 240','sec',.9);
  E+=pompe(70,ya+18,sec,'sec',5,-90,'Pompe SEC');X+=lab(62,ya+20,'SEC',3.2,'f')+lab(74,234,'PRISE',2.2,'d')+lab(388,234,'REJET',2.2,'f');
  X+=lab(160,ya-2,'ALLER SEC',2.2,'m',COUL.sec)+lab(330,yr+5,'RETOUR SEC',2.2,'m',COUL.sec);
  L+=tr('M236 '+ya+'L236 91L243.2 91M256.8 91L266 91L266 '+yr,'sec',.5);X+=saut(236,120,'rri',.7);X+=saut(266,ya,'sec',.9);
  const C=[[292,'ÉCH. EAS','EAS F. 5'],[320,'ÉCH. RCV','RCV F. 1'],[348,'GMPP','PALIERS'],[376,'VENTIL.','LOCAUX']];
  C.forEach(([x,t,n])=>{L+=tr('M'+(x-9)+' '+ya+'L'+(x-9)+' 150.75L'+(x-7)+' 150.75M'+(x+7)+' 150.75L'+(x+9)+' 150.75L'+(x+9)+' '+yr,'sec',.5);if(x+9<xf)X+=saut(x+9,ya,'sec',.9);
    E+=echangeur(x,150,5,'sec');X+=lab(x,140,t,2.2,'m')+lab(x,135,n,1.9,'m');});
  E+='<g class="s9-cl-gmpp" data-etat="'+ETAT[gm]+'">'+pompe(348,120,gm,'pf',4,0,'GMPP')+'</g><path d="M348 124L348 132" stroke="var(--cl-encre)" stroke-width=".3"/>';
  X+='<path d="M280 112L280 108L388 108L388 112" fill="none" stroke="var(--cl-encre)" stroke-width=".3"/>'+lab(332,105,'DIRECTEMENT AU SEC',2.6,'m');
  const R=[];
  R.push(rel(30,110,'T SOURCE FROIDE',unite(f(s.Tsrc),1,'°C'),{w:38}));
  R.push(rel(30,134,'SAISON',({hiver:'HIVER',mi:'MI-SAISON',ete:'ÉTÉ'}[s.saison]||'—'),{w:38}));
  R.push(rel(30,158,'SEC',sec===true?'EN SERVICE':sec===false?'ARRÊT':'—',{w:38}));
  R.push(rel(290,40,'RRI',rri===true?'EN SERVICE':rri===false?'ARRÊT':'—',{w:38}));
  R.push(rel(290,64,'RRA',rra===true?'EN SERVICE':rra===false?'ARRÊT':'—',{w:38}));
  R.push(rel(340,40,'GMPP EN MARCHE',n===null?'—':n+' / '+nb,{w:40}));
  R.push(rel(340,64,'T BRANCHE CHAUDE',unite(f(d.tempHot),1,'°C'),{w:40}));
  return L+E+V+X+R.join('');}

// ══ SOMMAIRE ══ Première feuille du classeur, même papier, même lettrage, même cadre et cartouche : liste des six feuilles, symboles et
// couleurs des circuits (la légende générale du classeur).
const CONTENUS=['TROIS BOUCLES, PRESSURISEUR, RCV, ACCUMULATEURS','TROIS GV, ARE, ASG, GCTA, GCT','TURBINE HP ET BP, ALTERNATEUR, CONDENSEUR, CVI, CIRCULATION CRF',
  'RÉSEAU 400 kV, SOUTIRAGE, LHA ET LHB, DIESELS VOIES A ET B, TAC, LLS','CHARGE RCV EN INJECTION HP, RIS BP, ACCUMULATEURS, EAS, SIGNAL IS','RRA, RRI, SEC ; EAS, RCV, GMPP ET VENTILATIONS AU SEC'];
function fS(d,tranche){let X=T(40,38,'SOMMAIRE',9,{p:.9})+T(40,49,'SYNOPTIQUES DE CONDUITE · TRANCHE '+tranche,3.8);
  const x0=40,x1=64,x2=176,x3=400,y0=60,hr=15;
  X+='<g class="s9-cl-table"><rect x="'+x0+'" y="'+y0+'" width="'+(x3-x0)+'" height="'+(10+6*hr)+'" fill="none" stroke="var(--cl-encre)" stroke-width=".6"/>'
    +'<path d="M'+x0+' '+(y0+10)+'L'+x3+' '+(y0+10)+'M'+x1+' '+y0+'L'+x1+' '+(y0+10+6*hr)+'M'+x2+' '+y0+'L'+x2+' '+(y0+10+6*hr)+'" stroke="var(--cl-encre)" stroke-width=".45"/>'
    +T((x0+x1)/2,y0+7,'FEUILLE',2.8,{a:'m'})+T(x1+4,y0+7,'DÉSIGNATION',2.8)+T(x2+4,y0+7,'CONTENU',2.8);
  FEUILLES.forEach((F,i)=>{const y=y0+10+i*hr;if(i)X+='<path d="M'+x0+' '+y+'L'+x3+' '+y+'" stroke="var(--cl-encre)" stroke-width=".25"/>';
    X+='<g class="s9-cl-ligne" data-n="'+(i+1)+'" data-lib="'+esc(F[1])+'">'+T((x0+x1)/2,y+10.4,String(i+1),5.4,{a:'m',p:.55})+T(x1+4,y+10,F[0],4.2,{p:.45})+T(x2+4,y+9.6,CONTENUS[i],2.9)+'</g>';});
  X+='</g>';
  // symboles
  const sx=40,sy=176;X+='<rect x="'+sx+'" y="'+sy+'" width="186" height="74" fill="none" stroke="var(--cl-encre)" stroke-width=".45"/>'+T(sx+4,sy+8,'SYMBOLES',3.4,{p:.4});
  const L=[[vanne(sx+10,sy+18,true,'h',2.6),'VANNE OUVERTE'],[vanne(sx+10,sy+28,false,'h',2.6),'VANNE FERMÉE'],[vanne(sx+7.5,sy+38,null,'v',2.2,{m:true}),'VANNE MOTORISÉE, ÉTAT INCONNU'],
    [pompe(sx+10,sy+48,true,'prim',3.4),'POMPE EN MARCHE'],[pompe(sx+10,sy+58,false,'prim',3.4),'POMPE À L’ARRÊT'],[pompe(sx+10,sy+68,null,'prim',3.4),'ÉTAT INCONNU'],
    [disj(sx+104,sy+18,true,3.4),'DISJONCTEUR FERMÉ'],[disj(sx+104,sy+28,false,3.4),'DISJONCTEUR OUVERT'],[echangeur(sx+104,sy+38,3.6),'ÉCHANGEUR'],
    [clapet(sx+104,sy+48),'CLAPET ANTIRETOUR'],[bulle(sx+104,sy+58,'P'),'RELEVÉ EN DIRECT'],['<path d="M'+(sx+98)+' '+(sy+68)+'L'+(sx+110)+' '+(sy+68)+'" stroke="var(--cl-encre)" stroke-width=".35" stroke-dasharray="7 1.4 1 1.4"/>','ENCEINTE']];
  L.forEach(([g,t],i)=>{const c=i<6?0:96;X+=g.replace(/class="s9-cl-(vanne|pompe|disj)" data-etat/g,'class="s9-cl-leg" data-etat')+T(sx+c+17,sy+19.2+(i%6)*10,t,2.8);});
  // couleurs des circuits
  const cx=236,cy=176,K=[['prim','PRIMAIRE, BRANCHE CHAUDE'],['pf','BRANCHES FROIDES, RCV'],['vap','VAPEUR'],['are','EAU ALIMENTAIRE ARE'],['asg','SECOURS ASG, EAS'],['ris','INJECTION, PTR'],['rra','REFROIDISSEMENT RRA'],['rri','RÉFRIGÉRATION RRI'],['sec','EAU BRUTE SEC, CRF'],['hta','RÉSEAU 400 kV'],['sb','TABLEAUX DES AUXILIAIRES']];
  X+='<rect x="'+cx+'" y="'+cy+'" width="164" height="74" fill="none" stroke="var(--cl-encre)" stroke-width=".45"/>'+T(cx+4,cy+8,'COULEURS DES CIRCUITS',3.4,{p:.4});
  K.forEach(([c,t],i)=>{const x=cx+4+(i>5?80:0),y=cy+17+(i%6)*10;X+=tr('M'+x+' '+(y-1.4)+'L'+(x+12)+' '+(y-1.4),c,1.1)+T(x+15,y,t,2.6);});
  X+=T(40,256,'CHAQUE FEUILLE PORTE SA LÉGENDE ; LES RELEVÉS SONT CEUX DE LA TRANCHE, EN DIRECT.',2.6);
  return X;}

const FEUILLES=[['CIRCUIT PRIMAIRE','Circuit primaire',f1],['VAPEUR ET EAU ALIMENTAIRE','Vapeur et eau alimentaire',f2],['LIGNE D’ARBRE','Ligne d’arbre',f3],
  ['ÉLECTRICITÉ','Électricité',f4],['SAUVEGARDES','Sauvegardes',f5],['REFROIDISSEMENT','Refroidissement',f6]];
const NF=FEUILLES.length;

// ══ LIENS VERS LES PANNEAUX ══ Retour 9 d'Anthonin (31/10) : la feuille mène au panneau à piloter, comme le mur des autres 900 (mêmes cibles là
// où il en a une, routage de la salle par data-s9-aller). Règle : la zone où l'élément se commande, sinon celle où son état s'affiche, sinon
// rien ; le KIT et l'enregistreur ne sont pas des panneaux à piloter. Zones groupées par bloc de conduite : à ×1 une cible de 44 px couvrirait
// 58 mm de feuille, le détail se vise après un pincement. Rectangles en mm de la feuille : [x0, y0, x1, y1, nom, cible, nature]. Nature : c
// se commande là, l se lit là, a amène au bloc sans que la valeur y soit écrite. Les noms des panneaux viennent de la salle (opts.lieu).
// La couche est hors du groupe filtré : un survol ne repeint pas l'encre. Le sommaire n'a aucune cible de panneau.
const CIBLES={RGL:'pupitre:RGL',RCP:'pupitre:RCP',REA:'pupitre:REA',ARE:'pupitre:ARE',GRE:'pupitre:GRE',GCT:'pupitre:GCT',ASG:'arriere:ASG',RIS:'arriere:RIS',LH:'arriere:LH',CRF:'arriere:CRF',KPS:'surete'};
const VERBES={c:'piloter dans',l:'lire dans',a:'aller à'};
const LIENS={
 1:[[38,18,75,37,'RDP','RCP','a'],[100,11,142,26,'Soupapes du pressuriseur','RCP','c'],[112,13,182,52,'Pressuriseur et aspersion','RCP','c'],[75,33,104,238,'Cuve et grappes','RGL','c'],[58,176,75,186,'Cœur','RGL','c'],
  [204,24,246,78,'GV 1','ARE','c'],[204,94,246,148,'GV 2','ARE','c'],[204,164,246,218,'GV 3','ARE','c'],[116,58,150,84,'Accumulateur 1','RIS','c'],[116,128,150,154,'Accumulateur 2','RIS','c'],[116,198,150,224,'Accumulateur 3','RIS','c'],
  [160,70.5,180,96,'GMPP 1','RCP','l'],[160,140.5,180,166,'GMPP 2','RCP','l'],[160,210.5,180,236,'GMPP 3','RCP','l'],[246,196,348,252,'Circuit RCV','REA','a'],[212,230,246,240,'Échangeur régénérateur','REA','a']],
 2:[[63,13,92,31.5,'GCTa GV 1','GCT','c'],[113,13,129,31.5,'GCTa GV 2','GCT','c'],[163,13,179,31.5,'GCTa GV 3','GCT','c'],[46,35.5,172,46.5,'VIV','GRE','c'],[46,58,74,164,'GV 1','ARE','c'],[96,58,124,164,'GV 2','ARE','c'],[146,58,174,164,'GV 3','ARE','c'],
  [70,165,186,176,'Vannes ARE','ARE','c'],[288,168,312,194,'TPA','ARE','l'],[28,186,145,256,'Secours ASG','ASG','c'],[316,56,346,78,'GCT au condenseur','GCT','c']],
 3:[[43,54,88,114,'Admission et corps HP','GRE','c'],[136,64,184,128,'Corps BP 1','GRE','c'],[206,64,254,128,'Corps BP 2','GRE','c'],[276,64,324,128,'Corps BP 3','GRE','c'],[338,74,392,116,'Alternateur et excitatrice','GRE','c'],
  [118,148,332,186,'Condenseur','CRF','l'],[78,198,110,222,'Pompe CRF','CRF','l'],[24,236,408,252,'Canaux','CRF','c']],
 4:[[38,14,284,48,'Poste 400 kV et disjoncteur de groupe','LH','l'],[197,80,227,118,'Alternateur','GRE','c'],[38,72,92,88,'Réseau auxiliaire','LH','l'],[38,136,250,200,'Tableaux des auxiliaires et tableaux secourus','LH','a'],
  [86,202,150,250,'Diesel voie A','LH','l'],[196,202,258,250,'Diesel voie B','LH','l'],[298,138,384,190,'Ultime secours LLS','LH','l']],
 5:[[28,32,72,112,'Bâche PTR','RIS','a'],[112,26,170,76,'Aspersion EAS','RIS','c'],[170,26,372,38,'Rampe d’aspersion','RIS','c'],[112,144,200,164,'Injection HP','RIS','c'],[112,172,200,190,'RIS BP','RIS','c'],[222,40,286,98,'Accumulateurs','RIS','c'],[26,146,68,174,'Signal IS','RIS','c'],[342,84,368,174,'Cuve','RGL','c'],[216,207,244,228,'Recirculation','KPS','l']],
 6:[[72,34,186,82,'Circuit RRA','CRF','l'],[114,104,256,136,'Circuit RRI','CRF','l'],[52,204,82,236,'Pompe SEC','CRF','l'],[24,238,408,257,'Canaux','CRF','c']]};
// Chaque relevé de chaque feuille a sa décision : null, aucun lien (au KIT, à l'enregistreur, ou sans panneau).
const LIENS_REL={
 1:{'T BRANCHE CHAUDE':['KPS','l'],'T BRANCHE FROIDE':['KPS','l'],'T MOYENNE':['RCP','l'],'P PRIMAIRE':['RCP','c'],'P THERMIQUE':null,'GMPP EN MARCHE':['RCP','l'],'NIVEAU CUVE':['KPS','l'],'GRAPPES D (EXTRAITES)':['RGL','c'],'BORE':['REA','c'],'ACCUMULATEURS':['RIS','c'],'NIVEAU GV':['ARE','c'],'INVENTAIRE':['RIS','l']},
 2:{'NIVEAU GV':['ARE','c'],'P VAPEUR GV':['ARE','l'],'T VAPEUR GV':null,'FUITE VVP':null,'GCT ATMOSPHÈRE':['GCT','c'],'GCT CONDENSEUR':['GCT','c'],'ARE':['ARE','c'],'T EAU ALIMENTAIRE':null,'DÉBIT ASG':['ASG','l'],'BÂCHE ASG':['ASG','l']},
 3:{'ADMISSION HP':['GRE','l'],'P ADMISSION':['GRE','l'],'PUISSANCE ÉLECTRIQUE':['GRE','l'],'P CONDENSEUR':['CRF','l'],'T SOURCE FROIDE':['CRF','c'],'PUISSANCE THERMIQUE':null},
 4:{'RÉSEAU EXTÉRIEUR':['LH','l'],'ÎLOTAGE':['LH','l'],'PRODUCTION NETTE':['LH','l'],'PRODUCTION BRUTE':null,'AUXILIAIRES':null,'TABLEAUX LHA · LHB':['LH','a'],'PERTE TOTALE H3':['LH','l'],'DIESELS VOIES A · B':['LH','l'],'ULTIME SECOURS':['LH','l']},
 5:{'SIGNAL IS':['RIS','c'],'BLOCAGE IS':['RIS','c'],'BÂCHE PTR':['RIS','a'],'ACCUMULATEURS':['RIS','c'],'P ENCEINTE':['RIS','l'],'H2 ENCEINTE':['KPS','l'],'ISOLEMENT':['RIS','l'],'INVENTAIRE':['RIS','l']},
 6:{'T SOURCE FROIDE':['CRF','c'],'SAISON':['CRF','c'],'SEC':['CRF','l'],'RRI':['CRF','l'],'RRA':['CRF','l'],'GMPP EN MARCHE':['RCP','l'],'T BRANCHE CHAUDE':['KPS','l']}};
// `dit` (dépliant) : le bouton dit aussi la valeur, le SVG du pli n'étant fait que de tracés ; sans lui, un parcours bouton par bouton n'entendrait jamais le chiffre.
const lienRect=(x,y,w,h,nom,cle,nat,lieu,rx,dit)=>'<rect class="s9-cl-lien" x="'+R2(x)+'" y="'+R2(y)+'" width="'+R2(w)+'" height="'+R2(h)+'"'+(rx?' rx="'+rx+'"':'')+' data-s9-aller="'+CIBLES[cle]+'" role="button" tabindex="0" aria-label="'+esc((dit?dit+', ':nom+' : ')+VERBES[nat]+' '+lieu(CIBLES[cle]))+'"/>';
function coucheLiens(n,rel,lieu){const z=(LIENS[n]||[]).map(([x0,y0,x1,y1,nom,cle,nat])=>lienRect(x0,y0,x1-x0,y1-y0,nom,cle,nat,lieu,2)).join(''),cib=LIENS_REL[n]||{};
  return '<g class="s9-cl-liens">'+z+rel.filter(r=>cib[r.lib]).map(r=>lienRect(r.x,r.y,r.w,r.h,r.lib,cib[r.lib][0],cib[r.lib][1],lieu,1)).join('')+'</g>';}

// ══ FEUILLE COMPLÈTE (SVG) et relevés ══
// Perforations, chacune renforcée d'un œillet collé (feuilles très manipulées).
function trous(cote){const x=cote==='d'?410:10;return TROUS.map((y,i)=>'<circle class="s9-cl-oeillet" cx="'+x+'" cy="'+y+'" r="4.5"/><circle class="s9-cl-trou" cx="'+x+'" cy="'+y+'" r="2.9"/>').join('');}
// `lieu` (recto vif seulement) : couche de liens, et groupe d'encre nommé pour la loupe. Jamais sur un verso ni sur la feuille qui tourne.
function feuilleSVG(n,data,tranche,lieu){RL=[];NR=n*100;const F=n?FEUILLES[n-1]:['SOMMAIRE','Sommaire',()=>fS(data,tranche)],corps=F[2](data||{});const rel=RL.slice(),liens=lieu&&n?coucheLiens(n,rel,lieu):'';
  const svg='<svg class="s9-cl-dessin'+(n?'':' s9-cl-sommaire')+'" viewBox="0 0 '+W+' '+H+'" role="'+(liens?'group':'img')+'" aria-label="'+esc(n?'Feuille '+n+' sur '+NF+' : '+F[1]:'Sommaire du classeur : '+FEUILLES.map((G,i)=>(i+1)+'. '+G[1]).join(', '))+'" preserveAspectRatio="xMidYMid meet">'
    +'<filter id="s9cl-plume-'+n+'" x="0" y="0" width="420" height="297" filterUnits="userSpaceOnUse"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="'+(7+n)+'"/><feDisplacementMap in="SourceGraphic" scale=".32" xChannelSelector="R" yChannelSelector="G"/></filter>'
    +'<g'+(lieu?' id="s9cl-miroir"':'')+' class="s9-cl-encre" filter="url(#s9cl-plume-'+n+')">'+cadre(n,F[0],tranche,corps,n===4)+'</g>'+trous('g')+liens+'</svg>';return {svg,rel};}
let RO=false;
function relevesHTML(n,rel){return '<details class="s9-cl-releves"'+(RO?' open':'')+'><summary>Relevés de la feuille '+n+'<span>'+rel.length+'</span></summary><dl>'+rel.map(r=>'<div><dt>'+esc(r.lib)+'</dt><dd>'+esc(r.val)+'</dd></div>').join('')+'</dl></details>';}
// Au téléphone, les relevés de la feuille se lisent sur un dépliant plié en accordéon : même papier, même lettrage, plis et ombres.
function depliant(n,rel,lieu){const P=[],cib=LIENS_REL[n]||{},dit=r=>r.lib+' : '+(r.val==='—'?'inconnu':r.val);for(let i=0;i<rel.length;i+=4)P.push(rel.slice(i,i+4));const F=FEUILLES[n-1];
  const pan=(corps,h,j,lab)=>'<div class="s9-cl-pli s9-cl-pli-'+(j%2?'b':'a')+'"><svg viewBox="0 0 100 '+h+'" role="'+(corps.includes('s9-cl-lien')?'group':'img')+'" aria-label="'+esc(lab)+'">'+corps+'</svg></div>';
  let h=pan(T(4,9.5,'RELEVÉS',5.2,{p:.55})+T(96,9.5,'FEUILLE '+n+' / 6',3.2,{a:'f'})+T(4,16.5,F[0],3,{})+'<path d="M4 19.5L96 19.5" stroke="var(--cl-encre)" stroke-width=".35"/>',22,0,'Relevés de la feuille '+n+' : '+F[1]);
  P.forEach((g,j)=>{let c='';g.forEach((r,i)=>{const y=10+i*11,wl=largeur(r.lib,2.8),wv=largeur(r.val,4.4);c+=T(4,y,r.lib,2.8)+'<path d="M'+R2(6+wl)+' '+(y-.4)+'L'+R2(94-wv)+' '+(y-.4)+'" stroke="var(--cl-encre)" stroke-width=".25" stroke-dasharray=".3 1.4" stroke-linecap="round"/>'+T(96,y+.6,r.val,4.4,{a:'f',c:'var(--cl-stylo)',p:.5});if(lieu&&cib[r.lib])c+=lienRect(0,y-8.2,100,11,r.lib,cib[r.lib][0],cib[r.lib][1],lieu,0,dit(r));else if(lieu)c+='<rect class="s9-cl-lu" x="0" y="'+R2(y-8.2)+'" width="100" height="11" fill="none" pointer-events="none" role="img" aria-label="'+esc(dit(r))+'"/>';});
    h+=pan(c,g.length*11+3,j+1,g.map(dit).join(' ; '));});
  return '<div class="s9-cl-depliant" role="group" aria-label="'+esc('Dépliant des relevés de la feuille '+n)+'">'+h+'</div>';}
// Géométrie d'une feuille (0 : sommaire) pour le contrôle des recouvrements.
function geometrie(n,data,tranche){GEO={t:[],l:[],r:[],s:[],b:[],j:[],v:[],c:[],manque:[]};try{feuilleSVG(n,data||{},tranche||1);return GEO;}finally{GEO=null;ZONE='';}}
function releves(data,n){return feuilleSVG(n,data,1).rel;}

// ══ CLASSEUR ══ État : {position} de 0 (fermé) à 7, ou {feuille} de 0 à 6, ou {sommaire: true}. Faces : droite(k) = la couverture (k = 0) ou le recto de la feuille k ; gauche(k) = le
// revers de la couverture (k = 1) ou le verso de la feuille k − 1, où l'encre de la feuille transparaît à l'envers.
// Retour 8 : le recto vif est le cadre du pincement limité au dessin (102A, n4.js ; pendant le geste, le pincement fluide de monter), un zoom par feuille. Retirer cet attribut rend le zoom natif de la page.
// Sous ×1,1, la fin du geste rend ×1, défilement compris : deux doigts posés par mégarde ne laissent ni une feuille presque à plat dont le glissé serait mort, ni la page décalée.
function recto(n,data,tranche,lieu){const {svg}=feuilleSVG(n,data,tranche,lieu);return '<div class="s9-cl-page s9-cl-recto" data-n="'+n+'"'+(lieu?' data-n4-pince="classeur-'+n+'" data-n4-pince-seuil="1.1"':'')+'>'+svg+'</div>';}
function verso(n,data,tranche){const {svg}=feuilleSVG(n,data,tranche);return '<div class="s9-cl-page s9-cl-verso" data-n="'+n+'" aria-hidden="true"><div class="s9-cl-transparence">'+svg.replace('role="img"','aria-hidden="true"')+'</div><svg class="s9-cl-trous" viewBox="0 0 '+W+' '+H+'" aria-hidden="true">'+trous('d')+'</svg></div>';}
// Couverture : toile vert sapin vue de dessus, posée à plat : le dos ne se voit pas, seul son bombé borde la reliure ; une rainure de
// charnière court à quelques millimètres du bord. Étiquette : le dessin de Codex (lot D2), porte-fiche nickelé et fiche crème.
// Griffe SIMUREP sérigraphiée en bas à gauche (les deux carrés bleus de la vitre de l'enregistreur à points, sans « 6P »).
function couverture(tranche){return '<div class="s9-cl-couv" aria-hidden="true"><i class="s9-cl-charniere"></i><div class="s9-cl-etiq-pos"><div class="s9-cl-etiquette"><div class="s9-cl-etiquette__cadre"><i class="s9-cl-etiquette__rivet"></i><i class="s9-cl-etiquette__rivet s9-cl-etiquette__rivet--droit"></i>'
  +'<div class="s9-cl-etiquette__fiche"><p class="s9-cl-etiquette__centrale">Centrale de Fessenheim</p><strong class="s9-cl-etiquette__titre"><span>Synoptiques</span> <span>de conduite</span></strong><p class="s9-cl-etiquette__pied"><span class="s9-cl-etiquette__edition">6 feuilles · Édition A</span><span class="s9-cl-etiquette__tranche">Tranche '+esc(tranche)+'</span></p></div></div></div></div>'
  +'<div class="s9-cl-griffe" data-griffe="SIMUREP"><i></i><i><b>SIMUREP</b></i></div></div>';}
function revers(){return '<div class="s9-cl-revers" aria-hidden="true"></div>';}
// Positions : 0 fermé, 1 sommaire, 2 à 7 les feuilles 1 à 6. droite(p) : couverture, sommaire ou recto ; gauche(p) : revers de la
// couverture (p = 1), verso du sommaire (p = 2) ou verso de la feuille précédente.
const NP=NF+1;
function droite(p,data,tranche,lieu){return p<=0?couverture(tranche):recto(p-1,data,tranche,lieu);}
function gauche(p,data,tranche){return p<=0?'':p===1?revers(tranche):verso(p-2,data,tranche);}
const posDe=e=>{if(e&&Number.isFinite(Number(e.position)))return Math.max(0,Math.min(NP,Math.trunc(Number(e.position))));if(e&&e.sommaire)return 1;const f=Math.max(0,Math.min(NF,Math.trunc(Number(e&&e.feuille))||0));return f?f+1:0;};
const etatDe=p=>({position:p,feuille:p>=2?p-1:0,sommaire:p===1});
const corne=(sens,dis)=>dis?'':'<button type="button" class="s9-cl-corne s9-cl-'+(sens>0?'suiv':'prec')+'" data-s9-cl="'+(sens>0?'suiv':'prec')+'" aria-label="'+(sens>0?'Feuille suivante':'Feuille précédente')+'"><i aria-hidden="true"></i></button>';
const coin=s=>'<i class="s9-cl-corne s9-cl-'+s+'" aria-hidden="true"><i></i></i>';   // la corne dessinée sur la couverture qui pivote, sans bouton
const pile=(k,cote)=>'<i class="s9-cl-pile s9-cl-pile-'+cote+'" style="--n:'+k+'" aria-hidden="true"></i>';
// Petite loupe du PC : elle n'allume ni n'agrandit rien par elle-même, elle dit seulement si la loupe suit le curseur.
const titreLoupe=on=>(on?'Éteindre':'Allumer')+' la loupe';
const loupeBouton=on=>'<button type="button" class="s9-cl-loupe-b" data-s9-cl-loupe aria-label="Loupe au survol" aria-pressed="'+on+'" title="'+titreLoupe(on)+'"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.4 15.4L21 21"/><path class="s9-cl-loupe-barre" d="M4 3.5L20.5 20"/></svg></button>';
// La lentille, à côté de la section : hors du pupitre qui la couperait, position fixe pour n'élargir aucune page. Elle redessine le groupe d'encre du recto vif.
const lentille='<div class="s9-cl-lentille" aria-hidden="true"><svg viewBox="0 0 '+W+' '+H+'"><use href="#s9cl-miroir"/></svg></div>';
function render(etat,data,opts={}){const p=posDe(etat),k=p>=2?p-1:0,tr0=opts.tranche||1,lieu=opts.lieu||(c=>c);
  const lib=p===0?'Classeur de synoptiques fermé':p===1?'Classeur de synoptiques ouvert sur le sommaire':'Classeur de synoptiques ouvert, feuille '+k+' sur '+NF+' : '+FEUILLES[k-1][1];
  const rel=k>0?feuilleSVG(k,data||{},tr0).rel:[];RO=!!opts.releves;
  return '<section class="s9-classeur" data-position="'+p+'" data-feuille="'+(p===1?'sommaire':k)+'" aria-label="'+esc(lib)+'" aria-roledescription="classeur" tabindex="-1"><div class="s9-cl-pupitre"><div class="s9-cl-livre">'
    +'<div class="s9-cl-gauche">'+(p>0?'<div class="s9-cl-plat s9-cl-plat-g"></div>'+pile(Math.max(0,p-1),'g')+gauche(p,data||{},tr0)+corne(-1,false):'')+'</div>'
    +'<div class="s9-cl-dos" aria-hidden="true">'+(p>0?'<i class="s9-cl-meca"><i class="s9-cl-levier"></i></i>'+TROUS.map(y=>'<i class="s9-cl-anneau" style="--y:'+(y/H*100).toFixed(2)+'%"><b></b></i>').join(''):'')+'</div>'
    +'<div class="s9-cl-droite">'+(p>0?'<div class="s9-cl-plat s9-cl-plat-d"></div>'+pile(NP-p,'d'):pile(NP,'d'))+droite(p,data||{},tr0,lieu)+corne(1,p>=NP)+'</div>'
    +'</div>'+(p>0?loupeBouton(opts.loupe!==false):'')+'</div><p class="s9-cl-aide" aria-live="polite">'+esc(p===0?'Classeur fermé : la corne en bas à droite l’ouvre.':p===1?'Sommaire · six feuilles':'Feuille '+k+' / '+NF+' · '+FEUILLES[k-1][1])+'</p>'
    +(k>0?relevesHTML(k,rel)+depliant(k,rel,lieu):'')+'</section>'+(p>0?lentille:'');}

// ══ RENDU VIVANT ══ Retours 5 et 6 d'Anthonin (31/10) : refaire innerHTML à chaque instantané remettait le défilement à 0 sous WebKit, qui
// attend la mesure du conteneur de requêtes (container-type), relançait la transition de la corne sous la souris ou le focus, et perdait les
// clics à cheval sur un instantané. L'instantané se colle sur les nœuds existants, sur le modèle de sync (n4.js) : section, dessin, cornes et
// relevés restent les mêmes nœuds, seules les valeurs changées sont écrites. Le zoom du cadre reste à son auteur, le pincement de n4.js
// (attribut du cadre et largeur du dessin), la place de la lentille à la loupe.
const garde=(n,a)=>a==='data-n4-pince-zoom'||a==='style'&&(n.nodeName==='svg'||n.getAttribute('class')==='s9-cl-lentille');
function coller(parent,neuf){const voulus=[...neuf.childNodes];voulus.forEach((f,i)=>{const v=parent.childNodes[i];
    if(!v){parent.appendChild(f.cloneNode(true));return;}
    if(v.nodeType!==f.nodeType||v.nodeName!==f.nodeName){v.replaceWith(f.cloneNode(true));return;}
    if(v.nodeType===3){if(v.nodeValue!==f.nodeValue)v.nodeValue=f.nodeValue;return;}
    if(v.nodeType!==1)return;
    for(const a of [...v.attributes])if(!f.hasAttribute(a.name)&&!garde(v,a.name))v.removeAttribute(a.name);
    for(const a of [...f.attributes])if(v.getAttribute(a.name)!==a.value)v.setAttribute(a.name,a.value);
    coller(v,f);});
  while(parent.childNodes.length>voulus.length)parent.lastChild.remove();}

// ══ GESTES ══ Coins cornés (boutons), flèches et Page préc./suiv. au clavier, glissé du doigt. La feuille tourne autour des anneaux ;
// sous prefers-reduced-motion, la feuille change simplement.
function monter(host,o={}){let k=posDe(o),data=o.data||o.snapshot||{},verrou=false,glisse=null,geste=null;const tranche=o.tranche||1,win=host.ownerDocument&&host.ownerDocument.defaultView;
  // Retour 8, PC : la loupe suit la souris au survol de la feuille, sans clic, et la lentille laisse tout passer (pointer-events:none) : ni clic, ni
  // molette, ni capture du pointeur. 4,6 px par mm, bornée de ×2 à ×4. Allumée par défaut, le choix du joueur est gardé dans son navigateur.
  const CLE_LOUPE='simurep_sdc_900_loupe_v1';let loupe=true;try{loupe=!win||win.localStorage.getItem(CLE_LOUPE)!=='0';}catch(_){}
  const lent=()=>host.querySelector&&host.querySelector('.s9-cl-lentille'),eteindre=()=>{const l=lent();if(l&&l.hasAttribute('style'))l.removeAttribute('style');};
  const fine=()=>typeof matchMedia==='function'&&matchMedia('(hover:hover) and (pointer:fine)').matches;
  function survol(e){if(e.pointerType!=='mouse'||!loupe||verrou||!fine())return eteindre();const c=e.target&&e.target.closest&&e.target.closest('.s9-cl-recto[data-n4-pince]'),l=lent();if(!c||!l||c.hasAttribute('data-n4-pince-zoom'))return eteindre();
    const r=c.getBoundingClientRect(),K=Math.max(2,Math.min(4,4.6*W/r.width)),D=Math.round(Math.max(240,Math.min(420,r.width*.46)));
    l.setAttribute('style','display:block;width:'+D+'px;height:'+D+'px;transform:translate3d('+(e.clientX-D/2)+'px,'+(e.clientY-D/2)+'px,0)');
    l.firstChild.setAttribute('style','width:'+R2(r.width*K)+'px;height:'+R2(r.height*K)+'px;transform:translate3d('+R2(D/2-(e.clientX-r.left)*K)+'px,'+R2(D/2-(e.clientY-r.top)*K)+'px,0)');}
  // Le bouton seul : pendant un tour, un collage emporterait la feuille en vol et ferait atterrir la couverture d'un coup.
  function basculer(){loupe=!loupe;if(!loupe)eteindre();try{const s=win&&win.localStorage;if(s)s.setItem(CLE_LOUPE,loupe?'1':'0');}catch(_){}const b=host.querySelector('[data-s9-cl-loupe]');if(b){b.setAttribute('aria-pressed',loupe);b.setAttribute('title',titreLoupe(loupe));}}
  function recoller(){const html=rendu(),doc=host.ownerDocument;if(doc&&doc.createElement&&host.firstChild){const t=doc.createElement('template');t.innerHTML=html;coller(host,t.content);}else host.innerHTML=html;}
  let ouvert=o.releves!=null?!!o.releves:typeof innerWidth==='number'&&innerWidth<700;
  const reduit=()=>typeof matchMedia!=='function'||matchMedia('(prefers-reduced-motion: reduce)').matches||typeof document==='undefined';
  const zoome=()=>!!(host.querySelector&&host.querySelector('[data-n4-pince-zoom]'));
  const rendu=()=>render({position:k},data,{tranche,releves:ouvert,lieu:o.lieu,loupe});
  // Un tour de feuille remplace tout : la hauteur est tenue le temps d'une mise en page, sinon WebKit borne le défilement à 0 (retour 5). Le cadre
  // neuf est confié au pincement avant de rendre la hauteur : une feuille zoomée revient d'un coup.
  function dessiner(){geste=null;const s=host.style,h=host.offsetHeight;if(s&&h)s.minHeight=h+'px';host.innerHTML=rendu();armer();if(o.cadres)o.cadres();if(s&&h){void host.offsetHeight;s.minHeight='';}}
  function focus(sens){const b=host.querySelector&&(host.querySelector('[data-s9-cl="'+(sens>0?'suiv':'prec')+'"]')||host.querySelector('[data-s9-cl]'));if(b&&b.focus)b.focus({preventScroll:true});}
  function aller(a,sens){a=Math.max(0,Math.min(NP,a));if(a===k||verrou)return false;const de=k;sens=sens||(a>de?1:-1);eteindre();
    if(reduit()||Math.abs(a-de)!==1||zoome()){k=a;dessiner();focus(sens);if(o.onChange)o.onChange(etatDe(k));return true;}
    // Couverture (retour 7, 31/10) : une planche lourde, pas une feuille. À l'ouverture, le côté gauche reste vide jusqu'à l'atterrissage et
    // le livre glisse sous elle ; à la fermeture, le livre ouvert reste sous elle et le classeur fermé n'est dessiné qu'à l'atterrissage.
    // Ses deux faces portent ce que le joueur voit au repos (plat, tranche, corne) : rien ne saute au départ ni à l'arrivée.
    const lo=Math.min(a,de),couv=lo===0,ferme=couv&&sens<0,avant=couv?'':sens>0?gauche(de,data,tranche):droite(de,data,tranche);k=a;if(!ferme)dessiner();
    // Feuille d'arrivée déjà zoomée : dessiner() a rendu son cadre, le livre fait 905 px, la feuille volante n'y a pas sa place. Elle arrive sans tour.
    if(!ferme&&zoome()){focus(sens);if(o.onChange)o.onChange(etatDe(k));return true;}
    const livre=host.querySelector('.s9-cl-livre');if(!livre){if(ferme)dessiner();return true;}
    const racine=couv&&host.querySelector('.s9-classeur');if(racine)racine.setAttribute('data-anim',ferme?'ferme':'ouvre');
    // verrou tient la feuille du tour en cours : le minuteur de secours d'un tour déjà conclu par animationend ne touche pas au suivant.
    const v=document.createElement('div');verrou=v;v.className='s9-cl-anim s9-cl-anim-'+(sens>0?'suiv':'prec')+(couv?' s9-cl-anim-couv':'');
    v.innerHTML='<div class="s9-cl-sous s9-cl-sous-'+(sens>0?'g':'d')+'">'+avant+'</div><div class="s9-cl-volant"><div class="s9-cl-face s9-cl-face-av">'+droite(lo,data,tranche)+(couv?coin('suiv'):'')+'</div><div class="s9-cl-face s9-cl-face-ar">'+(couv?'<div class="s9-cl-plat s9-cl-plat-g"></div>'+pile(0,'g'):'')+gauche(lo+1,data,tranche)+(couv?coin('prec'):'')+'</div></div>';
    livre.appendChild(v);const fin=()=>{if(verrou!==v)return;verrou=false;v.remove();if(ferme)dessiner();else if(racine)racine.removeAttribute('data-anim');focus(sens);};v.querySelector('.s9-cl-volant').addEventListener('animationend',fin);setTimeout(fin,1400);
    if(o.onChange)o.onChange(etatDe(k));return true;}
  const clic=e=>{const c=e.target&&e.target.closest,t=c&&e.target.closest('[data-s9-cl]'),b=c&&!t&&e.target.closest('[data-s9-cl-loupe]');if(b&&host.contains(b)){basculer();return;}if(!t||!host.contains(t))return;e.preventDefault&&e.preventDefault();const a=t.getAttribute('data-s9-cl');aller(k+(a==='suiv'?1:-1));};
  const touche=e=>{const m={ArrowRight:1,PageDown:1,ArrowLeft:-1,PageUp:-1}[e.key];if(!m)return;const t=e.target;if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName||''))return;if(aller(k+m)&&e.preventDefault)e.preventDefault();};
  const bascule=e=>{const t=e.target;if(t&&t.classList&&t.classList.contains('s9-cl-releves'))ouvert=!!t.open;};
  // Glissé d'un seul doigt, suivi par son pointerId : un deuxième doigt ou le navigateur qui reprend le geste (pointercancel) l'annule ; à
  // zoom actif, le doigt défile le cadre. Sans touch-action sur le livre, le navigateur reprenait tout glissé et la feuille ne tournait jamais.
  const bas=e=>{if(e.pointerType==='mouse')return;glisse=e.isPrimary&&!zoome()?{id:e.pointerId,x:e.clientX,y:e.clientY}:null;};
  const haut=e=>{const g=glisse;if(!g||e.pointerId!==g.id)return;glisse=null;const dx=e.clientX-g.x,dy=e.clientY-g.y;if(Math.abs(dx)>60&&Math.abs(dx)>1.5*Math.abs(dy))aller(k+(dx<0?1:-1));};
  const annule=()=>{glisse=null;};
  // ══ PINCEMENT FLUIDE ══ 290A (01/11) : recalculer la largeur réelle à chaque mouvement faisait ramer le téléphone. Le pincement reste celui de n4.js (échelle par feuille, ×4,
  // seuil, retour du panneau), seul son rythme change. En capture sur le cadre, avant lui, le classeur retient les mouvements et déplace le dessin par transform, sur les mêmes
  // comptes que n4.js (point pincé gardé, cadre sans vide, page bornée à 0 et au bas qu'aura le document, lu sur son contenu à la pose, car la hauteur du document ne descend pas sous l'écran, et décalé de ce que gagne ou perd le cadre : sinon le dessin sauterait au lâcher), sans aucune mise en page : léger flou passager. À la fin du geste, il lui rend le dernier mouvement : n4.js pose la
  // largeur réelle et les défilements, le navigateur redessine net dans la même image. Un instantané attend le lâcher (update) : aucun nœud ne part sous les doigts.
  const ecart=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
  function conclure(){const g=geste;if(!g)return;geste=null;g.svg.style.transform='';g.cadre.removeAttribute('data-s9-cl-geste');if(g.t){const m=new Event('touchmove',{cancelable:true});m.touches=g.t;g.cadre.dispatchEvent(m);}}
  function doigts(e){const c=e.currentTarget,t=e.touches;
    if(e.type==='touchmove'){if(!geste||t.length!==2)return;const g=geste,s=Math.max(1,Math.min(4,g.s0*ecart(t)/g.d0)),z=s/g.s0,x=Math.max(0,Math.min((g.x0+g.mx)*z-g.mx,g.l*(s-1)));
      g.t=[{clientX:t[0].clientX,clientY:t[0].clientY},{clientX:t[1].clientX,clientY:t[1].clientY}];g.svg.style.transform='translate3d('+(g.x0-x)+'px,'+(g.y0-Math.max(0,Math.min(g.y0+g.my*(z-1),g.b+g.h*(z-1))))+'px,0) scale('+z+')';e.preventDefault();e.stopPropagation();return;}
    conclure();if(e.type!=='touchstart'||t.length!==2||!c.contains(t[0].target)||!c.contains(t[1].target))return;const svg=c.querySelector('svg');if(!svg)return;const r=c.getBoundingClientRect();
    const d=c.ownerDocument,w=d.defaultView,s=c.closest('.n4-sdc');let bas=0;for(const k of s.children)if(w.getComputedStyle(k).position!=='fixed')bas=Math.max(bas,k.getBoundingClientRect().bottom);geste={cadre:c,svg,s0:parseFloat(svg.style.width)/100||1,d0:ecart(t)||1,x0:c.scrollLeft,y0:w.scrollY,b:bas+parseFloat(w.getComputedStyle(s).paddingBottom)+w.scrollY-w.innerHeight,h:r.height,l:c.clientWidth,mx:(t[0].clientX+t[1].clientX)/2-r.left,my:(t[0].clientY+t[1].clientY)/2-r.top,t:null};c.setAttribute('data-s9-cl-geste','');}
  // Un cadre neuf à chaque dessin, ses écouteurs partent avec lui ; le collage garde le même nœud d'un instantané à l'autre. Non passif sur le seul mouvement, comme n4.js sur ce cadre.
  function armer(){const c=host.querySelector&&host.querySelector('[data-n4-pince]');if(c)for(const t of ['touchstart','touchmove','touchend','touchcancel'])c.addEventListener(t,doigts,{capture:true,passive:t!=='touchmove'});}
  host.addEventListener('click',clic);host.addEventListener('keydown',touche);host.addEventListener('pointerdown',bas);host.addEventListener('pointerup',haut);host.addEventListener('pointercancel',annule);host.addEventListener('toggle',bascule,true);host.addEventListener('pointermove',survol);host.addEventListener('pointerleave',eteindre);if(win)win.addEventListener('scroll',eteindre,{passive:true,capture:true});
  dessiner();
  // Intégration à la salle (283A) : un instantané par seconde, collé sur l'existant.
  return {update(d){data=d||{};if(verrou||geste)return;
    // Seconde passe : le volet des relevés est relu avant le rendu (un clic entre deux instantanés ne le rouvre ni ne le referme).
    const det=host.querySelector&&host.querySelector('.s9-cl-releves');if(det)ouvert=!!det.open;recoller();},aller:e=>aller(typeof e==='object'?posDe(e):posDe({feuille:e})),suivante:()=>aller(k+1),precedente:()=>aller(k-1),getState:()=>etatDe(k),
    detruire(){verrou=false;geste=null;host.removeEventListener('click',clic);host.removeEventListener('keydown',touche);host.removeEventListener('pointerdown',bas);host.removeEventListener('pointerup',haut);host.removeEventListener('pointercancel',annule);host.removeEventListener('toggle',bascule,true);host.removeEventListener('pointermove',survol);host.removeEventListener('pointerleave',eteindre);if(win)win.removeEventListener('scroll',eteindre,{passive:true,capture:true});}};}

return Object.freeze({render,monter,releves,feuilleSVG,feuilles:FEUILLES.map(F=>F[1]),nombre:NF,positions:NP,geometrie,texte:T,largeur,alimentee});
});
