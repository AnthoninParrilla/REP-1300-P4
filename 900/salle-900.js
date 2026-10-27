// SIMUREP — © 2026 AnthoninP — Tous droits réservés. Salle de commande 900 (J2b) : CPY, puis CP0 du Bugey.
// Salle « conventionnelle » : panneaux et pupitre, synoptique mural, verrines, enregistreurs, KIT et panneau de sûreté en
// consultation (matrice SDC § 1, § 13 à 15). Disposition libre pour PC et téléphone, complexité conservée (décisions des 28 et
// 29/09) : chaque commande du pupitre classique reste atteinte, par le même transport et les mêmes identifiants (contrat).
// Moteur d'interaction commun aux postes (n4.js : rafraîchissement, maintien, consignes, accusés, missions) ; ce profil fournit
// les pages, le rendu, et le cycle d'acquittement des alarmes montré pour la décision 10A d'Anthonin.
(function(root){'use strict';
const req=n=>typeof module==='object'&&module.exports?require(n):null;
const common=req('./n4.js')||root.SDCN4,IN=req('./instruments-n4.js')||root.SDCN4Instruments,I=req('./instruments-900.js')||root.SDC900Instruments,SYN=req('./synoptique-900.js')||root.SDC900Synoptique,KS=req('./ks6p.js')||root.SDC900Enregistreur;
const {esc,num}=I;
const PAGES={pupitre:'Pupitre de conduite',arriere:'Tableau arrière',synoptique:'Synoptique mural',verrines:'Alarmes',enregistreur:'Enregistreur à points',surete:'Panneau de sûreté',instrumentation:'KIT · neutronique, KRT',coeur:'KIT · carte calculée',pt:'KIT · domaine P/T',incidents:'Incidents (simulateur)',formation:'Aide & missions'};
PAGES.kit='KIT · systèmes';
// J3 (passe 3, 2A) : zones des panneaux citées par les consignes des missions et la ligne du guide : titre de la zone → page:clé.
const ZONES={'Grappes · régulation de température':'pupitre:RGL','Bore et appoint':'pupitre:REA','Pressuriseur':'pupitre:RCP','Turbine et charge':'pupitre:GRE',
  'Générateurs de vapeur · eau alimentaire':'pupitre:ARE','Contournement vapeur':'pupitre:GCT','État de tranche':'pupitre:ETAT','Alimentation de secours des GV':'arriere:ASG',
  'Injection de sécurité et aspersion':'arriere:RIS','Inhibitions · protection réacteur et automatismes':'arriere:RPR','Alimentations électriques':'arriere:LH',
  'Source froide et auxiliaires':'arriere:CRF','Arrêt d’urgence et réarmement':'arriere:AAR'};
// « Montrer » (2A) : chaque zone connue citée par un texte (« zone « Z » ») devient sa cible page:clé ; une page citée sans zone connue
// (« page Alarmes », « page Incidents (simulateur), zone « Défaut d’étanchéité des gaines » ») amène la page seule. Lecture du texte,
// dans l'ordre, sans doublon ; aucune commande.
function ciblesTexte(texte,pages,zones){const s=String(texte||''),out=[],vus=new Set(),labels=Object.entries(pages).sort((a,b)=>b[1].length-a[1].length);let m;
  const ajoute=(cible,label)=>{if(cible&&!vus.has(cible)){vus.add(cible);out.push({cible,label});}};
  const re=/\b[Pp]age |zone « ([^»]+) »|\(([^()›]+) › ([^()]+)\)/g;
  while((m=re.exec(s))){
    const z=m[1]||m[3];if(z){if(zones[z.trim()])ajoute(zones[z.trim()],z.trim());continue;}
    const i=m.index+m[0].length,r=labels.find(([,l])=>s.startsWith(l,i));if(!r)continue;
    const suite=/^, zone « ([^»]+) »/.exec(s.slice(i+r[1].length));if(suite&&zones[suite[1]])continue;ajoute(r[0],r[1]);}
  return out;}
const cibles=t=>ciblesTexte(t,PAGES,ZONES);
// KIT (12A du 03/10) : une seule entrée, la grille des systèmes ; neutronique et KRT, carte du cœur et domaine P/T s'y ouvrent.
const SOUS_KIT=['instrumentation','coeur','pt'],ORDRE=['pupitre','arriere','synoptique','verrines','enregistreur','surete','kit','incidents','formation'];
const NAV=ORDRE.map(id=>[id,PAGES[id]]);
const ETATS={AU:'Arrêt d’urgence réacteur','ÎLOT':'Îlotée : l’alternateur ne porte que ses auxiliaires',RP:'Réacteur en production',ANGV:'Arrêt normal sur GV',ANRRA:'Arrêt normal sur RRA',APIF:'Arrêt pour intervention, circuit fermé',APIO:'Arrêt pour intervention, circuit ouvert',APR:'Arrêt pour rechargement',RCD:'Réacteur complètement déchargé'};
// ══ VERRINES : sections du tableau d'alarmes (verrines groupées par système, en tête des panneaux : matrice SDC § 15.2 E6, A1).
//    Lentille : rouge pour le seuil haut d'une alarme, orange pour son premier seuil, blanche pour une action automatique ou un état
//    (trois couleurs de Gravelines 5, témoignage A2 ; catégorie 3 du document EDF de 1996, matrice § 15.6 : choix de répartition).
//    « D » : l'alarme peut aller jusqu'à l'arrêt automatique du réacteur (témoignage d'Anthonin, A2) ; posé là où le moteur arrête.
const SECTIONS=[
 ['Réacteur',['aOver','aXe','aMan','aAu','aInhib','aDecouv','aDmg']],
 ['Circuit primaire',['aThot','aPzrHi','aPzrLo','aSebim','aRdp','aGmpp','aPT','aDom','aDilu']],
 ['Générateurs de vapeur',['aGvLo','aGvHi','aDry','aPvap','aSvGv','aViv','aGct','aGcta','aRejA']],
 ['Eau alimentaire, turbine',['aAre','aTpa','aAsg','aVide','aCvi']],
 ['Électricité',['aReseau','aIlot','aDiesel','aH3','aLls']],
 ['Sauvegardes',['aIS','aBlkIS','aAcc','aEasOn','aIso','aRecirc','aPenc','aEncF']],
 ['Auxiliaires, source froide',['aRri','aSec','aCrf','aRra','aPtr','aKhy']],
 ['Radioprotection',['aActP','aActV','aActE','aH2']]];
const BLANC=common.ALARMES_ETAT;   // ensemble tenu dans n4.js depuis 21A du 13/10 : les mêmes alarmes sont blanches aux postes N4 et EPR
const D=new Set(['aOver','aThot','aGvLo','aGvHi','aPzrHi','aPzrLo','aPenc','aGmpp']);
// Couleur de la lentille au niveau le plus haut que la verrine peut prendre (essai des lampes) : rouge si le châssis peut
// l'allumer en rouge (alarmStates, et « Rejets atmosph. » allumée au rendu), sinon blanche ou orange comme ci-dessus.
// Le banc compare cette liste au châssis.
const ROUGE=new Set(['aActE','aActP','aActV','aAre','aAu','aCrf','aCvi','aDecouv','aDilu','aDmg','aDom','aDry','aEncF','aGmpp','aGvHi','aGvLo','aH2','aH3','aIS','aKhy','aOver','aPT','aPenc','aPtr','aPvap','aPzrHi','aPzrLo','aRdp','aRecirc','aReseau','aRra','aRri','aSebim','aSec','aSvGv','aThot','aVide','aRejA']);
const couleur=id=>ROUGE.has(id)?'rouge':BLANC.has(id)?'blanc':'orange';
// « D » des verrines (photos de Gravelines 5) : grande lettre détourée devant l'inscription.
const DSVG='<svg class="s9-d" viewBox="0 0 20 24" aria-hidden="true"><path d="M2.5 1.5h6.8c6 0 9.2 4.3 9.2 10.5S15.3 22.5 9.3 22.5H2.5zM7 6h2.2c3.2 0 4.8 2.3 4.8 6s-1.6 6-4.8 6H7z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
// ══ CYCLE D'ACQUITTEMENT (document EDF de 1996 sur le 900, matrice SDC § 15.6) : apparition et disparition distinguées, un
//    signal à chaque apparition, disparition ou réapparition ; acquitter une apparition arrête le klaxon et rend la verrine fixe ;
//    acquitter une disparition l'éteint. Acquitter n'efface jamais un défaut présent. Au début du quart, l'état présent est pris
//    comme acquis (pas de rafale), comme le journal. État d'affichage seulement : aucune commande n'est envoyée au moteur.
//    Le cycle est un état par salle (J2b) : la salle du 1300 en tient un à elle, avec ses propres niveaux (1A du point d'arrêt).
//    Le cycle lui-même vit dans n4.js depuis 21A du 13/10 (postes N4 et EPR) ; la salle le reprend sans changement, ici avec ses lentilles.
function lentille(v){if(!v||!v.etat)return '';return v.etat==='rouge'?'rouge':BLANC.has(v.id)?'blanc':'orange';}
const cycle=(niveauDe=lentille)=>common.cycle(niveauDe);
const CY=cycle(),ACK=CY.A,{nourrir,acquitter,klaxon,compte}=CY;
// Verrine (photos de Gravelines 5) : lentille dans son cadre gris, éteinte gris clair à inscription noire, allumée rose-rouge,
// orange ou blanche ; essai des lampes : chaque verrine dans la couleur de son niveau le plus haut.
function verrine(v,cy=CY){
  const e=cy.A.etats[v.id]||{mode:'repos',niveau:''},essai=cy.essai(),mode=essai?'acquittee':e.mode,niveau=essai?couleur(v.id):e.niveau,d=D.has(v.id);
  const dit=mode==='repos'?'éteinte':mode==='nouvelle'?'nouvelle, à acquitter':mode==='disparue'?'disparue, à acquitter':'présente, acquittée';
  return '<div class="s9-v" data-mode="'+mode+'" data-niveau="'+(niveau||'')+'"'+(d?' data-d="1"':'')+' role="img" aria-label="'+esc(v.txt+(d?' (D)':'')+' : '+dit)+'">'+(d?DSVG:'')+'<span>'+esc(v.txt.toUpperCase())+'</span></div>';}
// Matrice d'un système : bandeau orange titré, rangées numérotées sur la bande de gauche, trois verrines par rangée,
// emplacements libres laissés nus (verrines de réserve) pour garder la grille.
function matrice(titre,ids,parId,cy){
  const vs=ids.filter(id=>parId[id]).map(id=>verrine(parId[id],cy));while(vs.length%3)vs.push('<b class="s9-v-libre" aria-hidden="true"></b>');
  let g='';for(let i=0;i<vs.length;i+=3)g+='<i class="s9-mat-n" aria-hidden="true">'+(i/3+1)+'</i>'+vs.slice(i,i+3).join('');
  return '<section class="s9-mat-s" aria-label="'+esc('Verrines · '+titre)+'"><h4>'+esc(titre)+'</h4><div class="s9-mat-g">'+g+'</div></section>';}
function tableau(data,complet,cy=CY){
  const parId=Object.fromEntries((data.verrines||[]).map(v=>[v.id,v]));
  return '<div class="s9-mat'+(complet?' s9-mat-plein':'')+'">'+SECTIONS.map(([titre,ids])=>matrice(titre,ids,parId,cy)).join('')+'</div>';}
// Klaxon, nombre d'alarmes à acquitter (pas de légende des couleurs : Anthonin, 03/10) et la paire verte ESSAI LAMPES /
// ACQUITTEMENT du pupitre (photo de Gravelines 5) :
// lentilles carrées dans un cadre d'acier, plaques turquoise ; la lentille d'acquittement s'allume quand le klaxon sonne.
function commandesAlarmes(court,cy=CY){const k=cy.klaxon(),c=cy.compte(),acq=c.nouvelle+c.disparue,essai=cy.essai();
  const bp=(a,txt,plaque,on,extra)=>'<span class="s9-bp s9-bp-vert"><button type="button" class="s9-lent s9-l-vert" data-s9="'+a+'" data-on="'+on+'"'+extra+'><span>'+txt+'</span></button><small aria-hidden="true">'+plaque+'</small></span>';
  return '<div class="s9-alcmd'+(court?' s9-alcmd-court':'')+'"><span class="s9-klaxon" data-on="'+k+'" role="status" aria-label="Klaxon '+(k?'actif : alarmes à acquitter':'au repos')+'"><i></i><b>KLAXON</b></span>'
    +(acq?'<span class="s9-alcpt" role="status"><em>'+acq+' à acquitter</em></span>':'')
    +'<span class="s9-paire" role="group" aria-label="Essai des lampes et acquittement">'+bp('essai','ESSAI<br>LAMPES','ESSAI LAMPES',essai,' title="Essai des lampes : toutes les verrines s’allument trois secondes"')+bp('acquitter','ACQUIT-<br>TEMENT','ACQUITTEMENT',k,k?'':' aria-disabled="true"')+'</span></div>';}
// ══ OUTILS DE RENDU
const st=d=>d&&d.state||{};
// Palier servi (J2b) et groupe de régulation : R en mode G (CPY), D en mode A (CP0 ; 3A à 6A du 03/10).
const palDe=d=>st(d).pal==='CP0'?'CP0':'CPY',grpReg=d=>palDe(d)==='CP0'?'D':'R';
const set=(k,v)=>({type:'set',k,v});
// Voyant d'état d'un matériel (2A du 04/10, règle 9 bis du 1300 appliquée au 900) : rouge allumé = en service (circuit fermé, pompe en
// marche, disjoncteur fermé), vert allumé = hors service, éteint = état non donné.
const ouiNon=v=>v===true?true:v===false?false:null;
const etatV=(label,e)=>I.voyant({label,on:e===true||e===false,couleur:e===true?'rouge':'vert'});
const unite=(v,d)=>Number.isFinite(v)?v:null;
function vide(){return '';}
// ══ PANNEAU DE POSITION DES GRAPPES (14A du 03/10) : un tapis de petites diodes rondes rouges, une colonne par grappe, groupées par
//    groupe (« des petites LED rondes rouges, de partout », peau 900 du pupitre classique) ; vingt rangs allumés du haut du cœur
//    jusqu'au bas de la grappe ; sous chaque groupe, son repère et son compteur de pas à sept segments. Positions calculées par le
//    moteur (grappesEtat, J2a-2), vue complète lue au châssis par l'hôte ; au CPY, 36 positions de pilotage lues (Gasse 2024, V16) et
//    17 positions S du plan de conception de 1978 en maquette des grappes d'arrêt (9A) ; aucune mention dans le jeu (règle du 02/10).
//    Une position inconnue laisse la colonne éteinte et le compteur à tirets. CP0 (mode A, 3A à 5A du 03/10) : 48 grappes en six
//    groupes (D, C, B, A, SA, SB), positions en pour cent extrait (nombre de pas non lu), A, B et C hauts hors arrêt d'urgence.
const COUL={G1:'#8f9894',G2:'#b3bab6',N1:'#2a2d2c',N2:'#46413b',R:'#c8261f',S:'#1b4f8f',SA:'#1b4f8f',SB:'#2c6ab0',SC:'#3d82c9',SD:'#5e9bd8',D:'#c8261f',C:'#46413b',B:'#2a2d2c',A:'#666'};
const CAPS={R:['#c9271b','#ffffff'],G1:['#b9b9b9','#1a1a1a'],G2:['#b9b9b9','#1a1a1a'],N1:['#1a1a1a','#e8e8e8'],N2:['#1a1a1a','#e8e8e8'],S:['#1b4f8f','#ffffff'],D:['#c9271b','#ffffff'],SA:['#1b4f8f','#ffffff'],SB:['#1b4f8f','#ffffff']};
// Fraction extraite d'un groupe (1 = en haut) et texte de son compteur : en pas quand la course est lue (CPY), en pour cent extrait
// sinon (CP0 : course non lue, 5A). Au CP0, A, B et C n'ont pas d'engagement simulé : hauts tant que le réacteur n'est pas arrêté
// d'urgence (4A), comme les groupes d'arrêt ; à l'arrêt d'urgence, le moteur les donne au fond avec les autres.
function posGroupe(g,gr){
  if(g.course){const p=Number.isFinite(gr.pas)?gr.pas:null;return {f:p===null?null:Math.max(0,Math.min(1,p/g.course)),txt:p===null?'---':String(Math.round(p)),u:'pas'};}
  let x=Number.isFinite(gr.ext)?gr.ext:null;if(x===null&&g.mode==='A'&&gr.role==='commande'&&g.mesure===true)x=1;
  return {f:x===null?null:Math.max(0,Math.min(1,x)),txt:x===null?'---':String(Math.round(x*100)),u:'%'};}
const rond=(x,y,r)=>'M'+(x-r).toFixed(2)+' '+y.toFixed(2)+'a'+r+' '+r+' 0 1 0 '+(2*r)+' 0a'+r+' '+r+' 0 1 0 '+(-2*r)+' 0';
function panneauGrappes(g){
  if(!g||!Array.isArray(g.groupes))return '<p class="s9-note">Positions des grappes non reçues.</p>';
  const RG=20,PX=8,PY=7.5,r=2.7,GAP=14,X0=36,Y0=10,HC=RG*PY,pc=!g.course;
  let x=X0,off='',on='',halo='',eclat='',pied='';
  for(const gr of g.groupes){
    const L=Array.isArray(gr.grappes)&&gr.grappes.length?gr.grappes:null,n=L?L.length:(Number.isInteger(gr.n)?gr.n:0);if(!n)continue;
    const w=n*PX,pg=posGroupe(g,gr);
    for(let c=0;c<n;c++){const f=pg.f;
      const nb=f===null?0:1+Math.round((RG-1)*(1-f)),cx=x+c*PX+PX/2;
      for(let k=0;k<RG;k++){const cy=Y0+k*PY+PY/2;if(k<nb){on+=rond(cx,cy,r);halo+=rond(cx,cy,r+1.7);eclat+=rond(cx-.8,cy-.9,.85);}else off+=rond(cx,cy,r);}}
    const [bg,fg]=CAPS[gr.id]||(gr.type==='gris'?CAPS.G1:CAPS.N1),yC=Y0+HC+6;
    pied+='<rect x="'+x+'" y="'+yC+'" width="'+w+'" height="13" rx="2" fill="'+bg+'"'+(bg==='#1a1a1a'?' stroke="#6a6a6a" stroke-width=".8"':'')+'/><text x="'+(x+w/2)+'" y="'+(yC+10)+'" text-anchor="middle" class="s9-rg-cap" fill="'+fg+'">'+esc(gr.id)+'</text>'
      +'<g transform="translate('+(x+w/2-15.5).toFixed(1)+' '+(yC+17)+') scale(.5)">'+I.sept(pg.txt,3)+'</g>';
    x+=w+GAP;}
  const W=x-GAP+12,H=Y0+HC+6+13+4+18+4;
  const svg='<svg class="s9-rg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+(pc?'Position des groupes en pour cent extrait : '+esc(g.groupes.map(x=>{const q=posGroupe(g,x);return x.id+' '+(q.txt==='---'?'inconnue':q.txt);}).join(', ')):'Position des groupes en pas extraits : '+esc(g.groupes.map(x=>x.id+' '+(Number.isFinite(x.pas)?x.pas:'inconnue')).join(', ')))+'">'
    +'<rect width="'+W+'" height="'+H+'" rx="4" fill="#12140c"/>'
    +'<text x="'+(X0-7)+'" y="'+(Y0+7)+'" text-anchor="end" class="s9-rg-ech">HAUT</text><text x="'+(X0-7)+'" y="'+(Y0+HC-1)+'" text-anchor="end" class="s9-rg-ech">BAS</text>'
    +(pc?'<text x="'+(X0-7)+'" y="'+(Y0+HC+6+13+4+12)+'" text-anchor="end" class="s9-rg-ech">% EXT.</text>':'')
    +'<path d="'+off+'" fill="#3a0d09" stroke="#1a0604" stroke-width=".6"/><path d="'+halo+'" fill="#ff3b30" opacity=".22"/><path d="'+on+'" fill="#ff3b30" stroke="#b3140a" stroke-width=".5"/><path d="'+eclat+'" fill="#ffd0c8" opacity=".75"/>'+pied+'</svg>';
  const tot=Number.isFinite(g.totalisateur)?'<div class="s9-rg-tot"><span>Totalisateur G</span>'+I.sept(String(Math.round(g.totalisateur)),3)+'<span>/ '+esc(g.totalMax||'—')+' pas insérés</span></div>':'';
  return '<div class="s9-rgl">'+svg+tot+'</div>';}
function carte(g){
  const L='RPNMLKJHGFEDCBA',cell=14,N=[3,7,9,11,13,13,15,15,15,13,13,11,9,7,3];   // 157 assemblages du 900 par rangée, centrés (plan de 1978)
  const pos={};for(const x of g.groupes||[])if(Array.isArray(x.grappes)){const q=posGroupe(g,x);for(const y of x.grappes)pos[y.rep]={grp:x.id,f:q.f,type:x.type};}
  if(!Object.keys(pos).length)return '';
  let h='<svg class="s9-carte" viewBox="0 0 '+(15*cell+20)+' '+(15*cell+20)+'" role="img" aria-label="Carte des grappes : '+Object.keys(pos).length+' positions"><g transform="translate(16,4)">';
  for(let r=0;r<15;r++){const a=(15-N[r])/2;for(let c=a;c<a+N[r];c++){const rep=L[c]+(r+1),p=pos[rep],x=c*cell,y=r*cell;
    h+='<rect x="'+x+'" y="'+y+'" width="'+(cell-1)+'" height="'+(cell-1)+'" fill="'+(p?'#f3efe2':'#d7d1bd')+'" stroke="#9c9480" stroke-width=".4"/>';
    if(p){const f=Number.isFinite(p.f)?p.f:0;h+='<rect x="'+(x+2)+'" y="'+(y+1.5+(cell-4)*(f))+'" width="'+(cell-5)+'" height="'+((cell-4)*(1-f))+'" fill="'+(p.type==='gris'?'#9aa19d':COUL[p.grp]||'#333')+'"/><text x="'+(x+cell/2-.5)+'" y="'+(y+cell-3)+'" font-size="5" text-anchor="middle" fill="#fff" stroke="#000" stroke-width=".15">'+esc(p.grp)+'</text>';}}}
  for(let c=0;c<15;c++)h+='<text x="'+(c*cell+cell/2)+'" y="'+(15*cell+9)+'" font-size="6" text-anchor="middle" fill="#4a4436">'+L[c]+'</text>';
  for(let r=0;r<15;r++)h+='<text x="-4" y="'+(r*cell+cell/2+2)+'" font-size="6" text-anchor="end" fill="#4a4436">'+(r+1)+'</text>';
  return h+'</g></svg><p class="s9-note">Carte des grappes : dans chaque case, la surface colorée indique la proportion insérée de la grappe.</p>';
}
// ── Saturation (marge à l'ébullition du panneau de sûreté) : même loi que le moteur (psat), inversée ; affichage seulement.
const tsat=p=>Number.isFinite(p)&&p>0?1687.537/(5.11564-Math.log10(p))-230.17:null;
// ══ PAGES
// Mode d'une régulation reçu de l'état : vrai (AUTO), faux (MANU), inconnu sinon.
const mode=v=>v===true?true:v===false?false:null;
const modeTxt=(v,auto,manu)=>v===auto?true:v===manu?false:null;
// TPL marche / arrêt d'un matériel (7A du 03/10) : repos A (arrêt) à 9 h, service M (marche) à 12 h.
const tplMA=(titre,k,etat,o={})=>I.tpl(Object.assign({titre,nom:titre,positions:[{lettre:'A',label:'à l’arrêt',cmd:set(k,false),actif:etat===false},{lettre:'M',label:'en marche',cmd:set(k,true),actif:etat===true}]},o));
// J6 (96A) : motopompe ASG commandée sans tension, « non alimentée » ; la règle d'alimentation est celle du synoptique (mur et KIS)
const nonAlimentee=SYN.nonAlimentee,sansVapeur=SYN.sansVapeur;
// Panneaux colorés (passe 6, 03/10, d'après le mur et le pupitre photographiés à Gravelines 5) : îlot nucléaire en saumon et
// ivoire, eau-vapeur en vert d'eau, turbine et électricité en kaki. Deux colonnes de panneaux accolés de même hauteur.
const TEINTE={RGL:'blanc',RCP:'saumon',REA:'saumon',ARE:'verteau',GRE:'kaki',GCT:'verteau',ETAT:'kaki',ASG:'verteau',CRF:'verteau',RIS:'saumon',LH:'kaki',AAR:'blanc',RPR:'saumon'};
// Repères des zones en tête du pupitre et du tableau arrière : un toucher amène à la zone et l'éclaire (même geste que depuis
// le synoptique) ; aucune commande.
const REPERES={pupitre:[['RGL','Grappes'],['RCP','Pression'],['REA','Bore'],['ARE','Eau alimentaire'],['GRE','Turbine'],['GCT','Vapeur'],['ETAT','État de tranche']],
  arriere:[['ASG','Secours GV'],['CRF','Source froide'],['RIS','Injection'],['LH','Électricité'],['AAR','Arrêt d’urgence'],['RPR','Inhibitions']]};
function reperes(page){return '<nav class="s9-reperes s9-reperes-'+page+'" aria-label="Zones du '+(page==='pupitre'?'pupitre':'tableau arrière')+'">'+REPERES[page].map(([cle,l])=>'<button type="button" class="s9-pous s9-repere s9-teinte-'+TEINTE[cle]+'" data-s9-aller="'+page+':'+cle+'">'+esc(l)+'</button>').join('')+'</nav>';}
function pupitre(d,on){const s=st(d),manu=s.auto===false,pzrM=s.pzrAuto===false,areM=s.areAuto===false,au=!!s.scram,nb=(d.pal&&d.pal.NB)||3;
  const rgl=I.zone({titre:'Grappes · régulation de température',code:'RGL',cle:'RGL',teinte:TEINTE.RGL},
    '<div class="s9-rang">'+I.manipulateur({titre:'Régulation grappes',sous:'groupe '+grpReg(d),groupe:grpReg(d),mode:{auto:mode(s.auto),cmdAuto:set('auto',true),cmdManu:set('auto',false),nom:'Régulation grappes'},modeEnabled:on,k:'rod',label:'Extraction du groupe '+grpReg(d),value:unite(s.rod),min:0,max:100,pas:.5,enabled:on&&manu&&!au,verrou:au?'arrêt d’urgence : grappes au fond':'en AUTO, en production, les grappes règlent la température jusqu’en butée'})
    +I.barrette([{label:'P neutronique',value:Number.isFinite(s.Pn)?s.Pn*100:null,min:0,max:120,pas:20,unit:'% PN',digits:1,tag:'#e7dcc0'}])+'</div>'+panneauGrappes(d.grappes)+carte(d.grappes));
  const rea=I.zone({titre:'Bore et appoint',code:'REA',cle:'REA',teinte:TEINTE.REA},'<div class="s9-rang">'+I.maintien({k:'bori',label:'◄ BORICATION',actif:!!s.bori,enabled:on&&!(s.dilu&&!s.bori)})+I.maintien({k:'dilu',label:'DILUTION ►',actif:!!s.dilu,enabled:on&&!(s.bori&&!s.dilu)})+'</div>'
    +'<div class="s9-rang">'+I.afficheur({label:'Bore primaire',value:s.boreTotal,unit:'ppm',sens:s.bori===true?'▲':s.dilu===true?'▼':''})+I.afficheur({label:'Effluents vers TEP',value:s.effl,unit:'m³',digits:1})+I.afficheur({label:'Xénon',value:Number.isFinite(s.Xe)?s.Xe*100:null,unit:'% éq.'})+'</div><p class="s9-note">Arrêter la borication avant de diluer, et inversement.</p>');
  const pzr=I.zone({titre:'Pressuriseur',code:'RCP',cle:'RCP',teinte:TEINTE.RCP},'<div class="s9-rang">'
    +I.poste({titre:'Régulation pression',sous:'chaufferettes et aspersion',mode:{auto:mode(s.pzrAuto),cmdAuto:set('pzrAuto',true),cmdManu:set('pzrAuto',false),nom:'Régulation pression'},modeEnabled:on})
    +tplMA('Chaufferettes','heatM',pzrM?s.heatM===true?true:s.heatM===false?false:null:null,{enabled:on&&pzrM,etat:pzrM?'':'en AUTO'})
    +tplMA('Aspersion','sprayM',pzrM?s.sprayM===true?true:s.sprayM===false?false:null:null,{enabled:on&&pzrM,etat:pzrM?'':'en AUTO'})
    +I.poussoir({label:'SOUPAPES',sous:'ouverture volontaire',cmd:set('sebimM',!s.sebimM),actif:!!s.sebimM,enabled:on,lent:'rouge',classe:'s9-pous-garde',nom:'Ouverture volontaire des soupapes du pressuriseur'})+'</div>'
    +'<div class="s9-rang">'+I.barrette([{label:'P pressuriseur',value:s.Ppzr,min:0,max:180,pas:30,unit:'bar',digits:1,tag:'#efc3ae'},{label:'T moyenne',value:s.Tavg,min:250,max:350,pas:20,unit:'°C',digits:1,tag:'#efc3ae'}])
    +I.afficheur({label:'Consigne de pression',value:s.pzrSet,unit:'bar',digits:1})+I.afficheur({label:'GMPP en marche',value:s.gmppN,unit:'/ '+nb,cases:2})+'</div>');
  const turb=I.zone({titre:'Turbine et charge',code:'GRE',cle:'GRE',teinte:TEINTE.GRE},'<div class="s9-rang">'
    +I.poste({titre:'Consigne de charge',k:'turbSet',label:'Consigne de charge',value:unite(s.turbSet),sortie:s.turb,min:0,max:100,pas:1,unit:'%',enabled:on})
    +I.sous('Pente de charge','<div class="s9-paire s9-pentes" role="group" aria-label="Pente de charge">'+[[.05,'0,05'],[.2,'0,2'],[.6,'0,6'],[1.2,'1,2']].map(([v,l])=>I.poussoir({label:l+' %/s',sous:Math.round(v*60)+' %/min',cmd:set('turbRate',v),actif:s.turbRate===v,enabled:on,nom:'Pente de charge'})).join('')+'</div>'
      +I.poussoir({label:'Suivre le réseau',sous:d.follow?'suivi actif':'suivi coupé',cmd:{type:'action',id:'bSuivre'},actif:d.follow===true,enabled:on,lent:'vert'}))
    +I.tpl({titre:'Isolement vapeur VIV',nom:'VIV',positions:[{lettre:'F',label:'fermées',cmd:set('viv',false),actif:s.viv===false},{lettre:'O',label:'ouvertes',cmd:set('viv',true),actif:s.viv===true}],enabled:on})+'</div>'
    +'<div class="s9-rang">'+I.barrette([{label:'Admission turbine',value:s.turb,min:0,max:100,pas:20,unit:'%',digits:1,tag:'#d9cfae'},{label:'P admission HP',value:s.Padm,min:0,max:80,pas:20,unit:'bar',digits:1,tag:'#d9cfae'}])+I.afficheur({label:'P électrique',value:s.Pelec,unit:'MWe'})+'</div>');
  const gv=I.zone({titre:'Générateurs de vapeur · eau alimentaire',code:'ARE',cle:'ARE',teinte:TEINTE.ARE},'<div class="s9-rang">'
    +I.poste({titre:'Régulation ARE',sous:'puissance et niveau',mode:{auto:mode(s.areAuto),cmdAuto:set('areAuto',true),cmdManu:set('areAuto',false),nom:'Régulation ARE'},modeEnabled:on,k:'areM',label:'Demande ARE (MANU)',value:unite(areM?s.areM:s.areOut),sortie:s.areOut,min:0,max:100,pas:1,unit:'%',enabled:on&&areM,verrou:'en AUTO, la régulation tient le niveau'})
    +I.barrette([{label:'Niveau GV',value:s.gv,min:0,max:100,pas:20,unit:'%',digits:1,alarme:{de:0,a:12},tag:'#cfe1d4'},{label:'P vapeur GV',value:s.Psteam,min:0,max:100,pas:20,unit:'bar',digits:1,tag:'#cfe1d4'},{label:'Débit ARE',value:s.areOut,min:0,max:120,pas:20,unit:'%',digits:0,tag:'#cfe1d4'}])
    +etatV('TPA en service',ouiNon(s.tpaRun))+'</div>');
  const gct=I.zone({titre:'Contournement vapeur',code:'GCT',cle:'GCT',teinte:TEINTE.GCT},'<div class="s9-rang">'
    +I.poste({titre:'Consigne de pression vapeur',k:'gctTgt',label:'Consigne de pression vapeur',value:unite(s.gctTgt),rampe:s.gctSet,sortie:s.Psteam,min:8,max:85,pas:.5,unit:'bar',enabled:on,note:'8 à 85 bar, rampe et limiteur de 28 °C/h'})
    +I.poste({titre:'GCT-C · condenseur',mode:{auto:modeTxt(s.gctMode,'auto','manu'),cmdAuto:set('gctMode','auto'),cmdManu:set('gctMode','manu'),nom:'GCT-C'},modeEnabled:on,k:'gctM',label:'Ouverture GCT-C (MANU)',value:unite(s.gctMode==='manu'?s.gctM:(s.gct||0)*100),sortie:(s.gct||0)*100,min:0,max:100,pas:1,unit:'%',enabled:on&&s.gctMode==='manu',verrou:'en AUTO, ouverture réglée sur la consigne'})
    +I.poste({titre:'GCTa · atmosphère',mode:{auto:modeTxt(s.gctaMode,'auto','manu'),cmdAuto:set('gctaMode','auto'),cmdManu:set('gctaMode','manu'),nom:'GCTa'},modeEnabled:on,k:'gctaM',label:'Ouverture GCTa (MANU)',value:unite(s.gctaMode==='manu'?s.gctaM:(s.gctA||0)*100),sortie:(s.gctA||0)*100,min:0,max:100,pas:1,unit:'%',enabled:on&&s.gctaMode==='manu',verrou:'en AUTO, ouverture au-dessus de la consigne'})+'</div>');
  const etats=I.zone({titre:'État de tranche',cle:'ETAT',teinte:TEINTE.ETAT,large:true},'<div class="s9-paire s9-etats" role="group" aria-label="État de tranche">'+['RP','ANGV','ANRRA','APIF','APIO','APR','RCD'].map(e=>I.poussoir({label:{ANGV:'AN/GV',ANRRA:'AN/RRA',APIF:'API fermé',APIO:'API ouvert'}[e]||e,cmd:{type:'etat',e},actif:s.etat===e,enabled:on,nom:'État de tranche'})).join('')+'</div><p class="s9-note">Choisir un état lointain enchaîne les transitions et s’arrête à la première refusée, avec son motif.</p>');
  return reperes('pupitre')+'<div class="s9-pupitre"><div class="s9-pcols"><div class="s9-pcol">'+rgl+pzr+rea+'</div><div class="s9-pcol">'+gv+turb+gct+'</div></div>'+etats+'</div>';}
function arriere(d,on){const s=st(d),pal=d.pal&&d.pal.ID,cp0=pal==='CP0'||(d.state&&d.state.pal==='CP0');
  const tps=s.tpsA===true||s.tpsB===true?true:s.tpsA===false&&s.tpsB!==true?false:null;
  // V24 (S411, 14/10) : le verrou de l'arrêt manuel ne bloque que le démarrage sur niveau GV très bas, pas la bascule AN/GV ni le signal IS.
  const asg=I.zone({titre:'Alimentation de secours des GV',code:'ASG',cle:'ASG',teinte:TEINTE.ASG},'<div class="s9-rang">'
    +I.sous('Motopompes',['A','B'].map(v=>tplMA('Motopompe '+v,'mps'+v,mode(s['mps'+v]),{voie:v,enabled:on,alerte:nonAlimentee(s,'mps'+v)?'non alimentée':''})).join(''))
    +I.sous('Turbopompe',tplMA('Turbopompe','tpsA',tps,{enabled:on,alerte:sansVapeur(s,'tpsA')||sansVapeur(s,'tpsB')?'sans vapeur':''})+etatV('Vapeur auxiliaire SVA',ouiNon(s.svaOn)))
    +I.barrette([{label:'Bâche ASG',value:Number.isFinite(s.bacheASG)?s.bacheASG*100:null,min:0,max:100,pas:20,unit:'%',digits:0,tag:'#a9d3bd'},{label:'Débit ASG',value:Number.isFinite(s.asg)?s.asg*100:null,min:0,max:12,pas:2,unit:'% nominal',digits:1,tag:'#a9d3bd'}])+'</div>'
    +'<p class="s9-note">Une turbopompe au 900, entraînée par la vapeur des GV, et deux motopompes. Dans SIMUREP, arrêter la dernière pompe bloque le démarrage automatique sur niveau GV très bas jusqu’à une remise en service manuelle ; d’autres automatismes peuvent encore donner un ordre de marche.</p>');
  const ris=I.zone({titre:'Injection de sécurité et aspersion',code:'RIS · EAS',cle:'RIS',teinte:TEINTE.RIS},'<div class="s9-rang">'
    +I.sous('Injection',tplMA('Injection HP','ishp',mode(s.ishp),{enabled:on})+tplMA('Injection BP','isbp',mode(s.isbp),{enabled:on}))
    +I.sous('Aspersion',tplMA('Aspersion enceinte','eas',mode(s.eas),{enabled:on}))
    +I.sous('Accumulateurs',I.tpl({titre:'Accumulateurs',positions:[{lettre:'F',label:'isolés',cmd:set('accIso',true),actif:s.accIso===true,nom:'Isolement des accumulateurs'},{lettre:'O',label:'alignés',cmd:set('accIso',false),actif:s.accIso===false,nom:'Isolement des accumulateurs'}],enabled:on}))
    +I.sous('Signal IS',I.tpl({titre:'Blocage signal IS',positions:[{lettre:'N',label:'normal',cmd:set('isBlk',false),actif:s.isBlk===false,nom:'Blocage du signal IS'},{lettre:'B',label:'bloqué',cmd:set('isBlk',true),actif:s.isBlk===true,nom:'Blocage du signal IS'}],enabled:on})
      +'<div class="s9-col">'+I.voyant({label:'Signal IS',on:!!s.sigIS,couleur:'rouge'})+I.voyant({label:'Isolement enceinte',on:!!s.isoEnc,couleur:'ambre'})
      +I.poussoir({label:'Réarmer IS',cmd:{type:'action',id:'bRearmIS'},enabled:on&&!!s.sigIS,actif:!!s.sigIS,lent:'ambre',sous:s.sigIS?'signal présent':'aucun signal'})+'</div>')+'</div>'
    +'<div class="s9-rang">'+I.barrette([{label:'Accumulateurs',value:s.accu,min:0,max:100,pas:20,unit:'%',digits:0,tag:'#efc3ae'},{label:'P enceinte',value:s.Penc,min:0,max:5,pas:1,unit:'bar',digits:2,tag:'#efc3ae',echelleDecimales:1},{label:'Inventaire primaire',value:s.inv,min:0,max:120,pas:20,unit:'%',digits:0,tag:'#efc3ae'}])+'</div>');
  const INH=[['aarInhib','Arrêt automatique (AAR)'],['inhIsoE','Isolement enceinte'],['inhIsoV','Isolement vapeur (VIV)'],['inhIS','Signal IS'],['inhEAS','EAS automatique'],['inhASG','ASG automatique'],['inhKrt','Isolement VVP (KRT)']];
  // Inhibitions en commutateurs à clé HORS / EN (11 bis A du grand QCM du 1300 : « il y en a aussi sur la SDC 900 »), mêmes commandes.
  const inh=I.zone({titre:'Inhibitions · protection réacteur et automatismes',code:'RPR',cle:'RPR',teinte:TEINTE.RPR,large:true},'<div class="s9-inhib">'+INH.map(([k,l])=>I.cle({titre:l,nom:l,k,valeur:s[k],enabled:on})).join('')+'</div><p class="s9-note">Les inhibitions ne sont pas réinitialisées par la mise à l’état ; chaque ordre inhibé est consigné au journal.</p>');
  const elec=I.zone({titre:'Alimentations électriques',code:'LH',cle:'LH',teinte:TEINTE.LH},'<div class="s9-rang"><div class="s9-voys">'+etatV('Réseau extérieur',ouiNon(s.reseau))+I.voyant({label:'Îlotage',on:!!s.ilote,couleur:'ambre'})
    +etatV('Diesels '+(cp0?'LHG/LHH':'LHP/LHQ'),ouiNon(s.diesel))+etatV('Ultime secours',ouiNon(s.lls))+I.voyant({label:'Perte totale (H3)',on:!!s.h3,couleur:'rouge'})+'</div>'
    +I.afficheur({label:'Production nette',value:s.Pelec,unit:'MWe'})+'</div><p class="s9-note">Tableaux secourus LHA et LHB ; les pertes de sources se commandent depuis la page Incidents (simulateur).</p>');
  const src={mer:'mer',estuaire:'estuaire',fleuve:'fleuve, circuit ouvert',tour:'fleuve et aéroréfrigérants'}[s.srcType]||'—';
  const sf=I.zone({titre:'Source froide et auxiliaires',code:'CRF · SEC',cle:'CRF',teinte:TEINTE.CRF},'<div class="s9-rang"><div class="s9-src">Source froide du site : <b>'+esc(src)+'</b></div>'
    +I.sous('Saison','<div class="s9-paire s9-saisons" role="group" aria-label="Saison">'+[['hiver','Hiver'],['mi','Mi-saison'],['ete','Été']].map(([v,l])=>I.poussoir({label:l,cmd:set('saison',v),actif:s.saison===v,enabled:on,nom:'Saison'})).join('')+'</div>')
    +I.consigne({k:'Tsrc',label:'Température de la source froide',value:unite(s.Tsrc),min:2,max:30,pas:.5,unit:'°C',enabled:on})
    +'<div class="s9-voys">'+etatV('CRF',ouiNon(s.crf))+etatV('SEC',ouiNon(s.sec))+etatV('RRI',ouiNon(s.rri))+etatV('RRA raccordé',ouiNon(s.rra))+'</div>'
    +I.barrette([{label:'P condenseur',value:Number.isFinite(s.Pcond)?s.Pcond*1000:null,min:0,max:200,pas:40,unit:'mbar',digits:0,tag:'#a9d3bd'}])+'</div>');
  const au=I.zone({titre:'Arrêt d’urgence et réarmement',code:'AAR',cle:'AAR',teinte:TEINTE.AAR},'<div class="s9-rang">'+I.poussoir({label:'ARRÊT D’URGENCE',cmd:{type:'scram'},enabled:on,lent:'rouge',classe:'s9-pous-au',nom:'Arrêt d’urgence'})
    +I.poussoir({label:'Réarmer',sous:s.scram?'réacteur arrêté':'réacteur réarmé',cmd:{type:'rearm'},enabled:on&&!!s.scram,actif:!!s.scram,lent:'ambre',nom:'Réarmement'})+'</div>');
  return reperes('arriere')+'<div class="s9-pupitre s9-arriere"><div class="s9-pcols"><div class="s9-pcol">'+asg+sf+'</div><div class="s9-pcol">'+ris+elec+au+'</div></div>'+inh+'</div>';}
// ══ ÉCRANS SEMI-GRAPHIQUES (KPS et KIT, 11A et 12A du 03/10) : écran noir sous un cadre beige, police à chasse fixe, couleurs
//    d'époque (vert en service, rouge défaut, jaune valeurs, cyan titres) ; tout se lit dans l'instantané reçu.
function ecran(code,titre,corps,o={}){return '<section class="s9-crt'+(o.classe?' '+o.classe:'')+'" aria-label="'+esc(code+' · '+titre)+'"><div class="s9-crt-verre"><div class="s9-crt-tete"><b>'+esc(code)+'</b><span>'+esc(titre)+'</span>'+(o.droite||'')+'</div>'+corps+'</div>'+(o.pied?'<div class="s9-crt-pied">'+esc(o.pied)+'</div>':'')+'</section>';}
function ligne(lab,val,u,f,o={}){return '<div class="s9-crt-l'+(o.etat?' s9-crt-'+o.etat:'')+'"><span>'+esc(lab)+'</span><b>'+esc(val)+'</b><i>'+esc(u||'')+'</i>'+(f===undefined?'':'<em class="s9-crt-barre" aria-hidden="true"><span style="width:'+(f===null?0:Math.round(Math.max(0,Math.min(1,f))*100))+'%"></span></em>')+'</div>';}
function tor(lab,on,c){return '<span class="s9-crt-tor" data-on="'+(on===true)+'" data-c="'+(c||'v')+'">'+esc(lab)+'</span>';}
// Valeur d'ingénieur : notation scientifique pour les très petites ou très grandes valeurs (KRT).
function sci(v){if(!Number.isFinite(v))return '—';if(v===0)return '0';const a=Math.abs(v);return a>=1e4||a<1e-2?v.toExponential(1).replace('.',',').replace('e+','E').replace('e-','E-'):num(v,a<10?2:a<100?1:0);}
const psat=T=>Math.pow(10,5.11564-1687.537/(T+230.17));   // même loi que le moteur (bar, °C)
// Ébulliomètre : diagramme P-T, courbe de saturation, point de la branche chaude (et de la branche froide) à la pression primaire,
// marge à l'ébullition tracée jusqu'à la courbe.
function ebulliometre(P,Th,Tf,marge){
  const W=320,H=212,x0=36,y0=10,w=W-x0-12,h=H-y0-30,Tmin=100,Tmax=360,Pmax=180,X=T=>x0+(T-Tmin)/(Tmax-Tmin)*w,Y=p=>y0+h-(p/Pmax)*h;
  let g='';for(let T=Tmin;T<=Tmax;T+=20)g+='<path d="M'+X(T).toFixed(1)+' '+y0+'V'+(y0+h)+'" class="s9-ebu-g"/>'+(T%40===0?'<text x="'+X(T).toFixed(1)+'" y="'+(y0+h+12)+'" text-anchor="middle" class="s9-ebu-t">'+T+'</text>':'');
  for(let p=0;p<=Pmax;p+=20)g+='<path d="M'+x0+' '+Y(p).toFixed(1)+'H'+(x0+w)+'" class="s9-ebu-g"/>'+(p%40===0?'<text x="'+(x0-4)+'" y="'+(Y(p)+3).toFixed(1)+'" text-anchor="end" class="s9-ebu-t">'+p+'</text>':'');
  let c='';for(let T=Tmin;T<=Tmax;T+=2){const p=psat(T);if(p>Pmax)break;c+=(c?'L':'M')+X(T).toFixed(1)+' '+Y(p).toFixed(1);}
  let m='';
  if(Number.isFinite(P)&&P>0&&P<=Pmax){const y=Y(P),ts=1687.537/(5.11564-Math.log10(P))-230.17;
    if(Number.isFinite(Th)&&Th>=Tmin&&Th<=Tmax){const xh=X(Th),xs=X(Math.min(Tmax,ts));m+='<path d="M'+xh.toFixed(1)+' '+y.toFixed(1)+'H'+xs.toFixed(1)+'" class="s9-ebu-m"/><path d="M'+(xh-6).toFixed(1)+' '+(y-6).toFixed(1)+'l12 12m0-12l-12 12" class="s9-ebu-p"/>';}
    if(Number.isFinite(Tf)&&Tf>=Tmin&&Tf<=Tmax){const xf=X(Tf);m+='<path d="M'+(xf-4).toFixed(1)+' '+y.toFixed(1)+'h8M'+xf.toFixed(1)+' '+(y-4).toFixed(1)+'v8" class="s9-ebu-f"/>';}}
  return '<svg class="s9-ebu" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Ébulliomètre : pression primaire et températures des branches par rapport à la saturation">'+g
    +'<path d="'+c+'" class="s9-ebu-c"/><text x="'+(X(300)+6).toFixed(1)+'" y="'+(Y(psat(300))+14).toFixed(1)+'" class="s9-ebu-l">SATURATION</text>'
    +'<text x="'+(x0+8)+'" y="'+(y0+14)+'" class="s9-ebu-l">EAU</text><text x="'+(x0+w-6)+'" y="'+(y0+h-8)+'" text-anchor="end" class="s9-ebu-l">VAPEUR</text>'
    +'<text x="'+(x0+w/2)+'" y="'+(H-2)+'" text-anchor="middle" class="s9-ebu-t">T (°C) · P (bar)</text>'+m+'</svg>';}
// ══ PANNEAU DE SÛRETÉ (11A du 03/10) : trois écrans semi-graphiques comme le décrit le document EDF de 1996 pour le 900 (matrice SDC
//    § 15.7 : KPS, trois écrans, deux claviers) : surveillance, ébulliomètre, enceinte. Seulement des grandeurs calculées par le
//    moteur ; KRT : derniers relevés de l'enregistreur de la tranche (même calcul que le pupitre classique).
function surete(d){const s=st(d),Th=d.tempHot,Tf=d.tempCold,ts=tsat(s.Ppzr),marge=Number.isFinite(Th)&&Number.isFinite(ts)?ts-Th:null,fx=(v,a,b)=>Number.isFinite(v)?(v-a)/(b-a):null;
  const sature=marge!==null&&marge<=0?'rouge':'';
  const surv=ecran('KPS','Surveillance',
     ligne('P primaire',num(s.Ppzr,1),'bar',fx(s.Ppzr,0,180))+ligne('T branche chaude',num(Th,1),'°C',fx(Th,0,350))+ligne('T branche froide',num(Tf,1),'°C',fx(Tf,0,350))
    +ligne('Marge à l’ébullition',num(marge,1),'°C',fx(marge,-20,80),{etat:sature})+ligne('Niveau cuve',num(s.lvlCuve,0),'%',fx(s.lvlCuve,0,100))+ligne('Inventaire primaire',num(s.inv,0),'%',fx(s.inv,0,120))
    +'<div class="s9-crt-tors">'+tor('Arrêt réacteur',!!s.scram,'r')+tor('Signal IS',!!s.sigIS,'r')+tor('Isolement enceinte',!!s.isoEnc,'o')+tor('Aspersion enceinte',!!s.eas,'o')+tor('ASG en service',(s.asg||0)>0,'o')+'</div>',{pied:'Écran 1'});
  const ebu=ecran('KPS','Ébulliomètre',ebulliometre(s.Ppzr,Th,Tf,marge)+ligne('Marge à l’ébullition',num(marge,1),'°C',undefined,{etat:sature})+'<p class="s9-crt-n">× branche chaude · + branche froide · trait : marge jusqu’à la saturation</p>',{pied:'Écran 2'});
  const krte=SYN.releve(d,'krte'),dvn=SYN.releve(d,'dvn');
  const enc=ecran('KPS','Enceinte',ligne('P enceinte',num(s.Penc,2),'bar',fx(s.Penc,0,5))+ligne('H2 enceinte',num(s.h2,1),'% vol',fx(s.h2,0,10))+ligne('Débit de dose enceinte',sci(krte),'mGy/h')+ligne('Activité cheminée',sci(dvn),'Bq/m³')
    +'<div class="s9-crt-tors">'+tor('Isolement enceinte',!!s.isoEnc,'o')+tor('Aspersion EAS',!!s.eas,'o')+tor('Recirculation',!!s.recirc,'o')+tor('Rupture du confinement',!!s.encFail,'r')+'</div>',{pied:'Écran 3'});
  return '<div class="s9-kps">'+surv+ebu+enc+'</div><p class="s9-note">La marge à l’ébullition est l’écart entre la température de saturation à la pression primaire et la branche chaude.</p>';}
// ══ KIT (12A du 03/10) : le calculateur de tranche en consultation. Une grande grille des systèmes élémentaires (allumée selon leurs
//    alarmes) ; un système choisi montre ses alarmes et événements (lignes du journal de la tranche qui le concernent), ses états
//    tout-ou-rien et ses mesures analogiques, lus dans l'instantané ; les écrans natifs (neutronique et KRT, carte du cœur, domaine
//    P/T) s'ouvrent depuis la grille. Consultation seule : aucune commande.
const KITSEL={sys:'',cas:''};
const MA=v=>v===true?['MARCHE','v']:v===false?['ARRÊT','']:['—',''],DI=v=>v===true?['EN SERVICE','v']:v===false?['PERDU','r']:['—',''],AMv=v=>v===true?['AUTO','c']:v===false?['MANU','j']:['—',''];
const AMt=v=>v==='auto'?['AUTO','c']:v==='manu'?['MANU','j']:['—',''],PRES=(v,a)=>v?[a||'PRÉSENT','r']:['—',''];
const rv=(d,id,dg)=>{const v=SYN.releve(d,id);return v===null?'—':dg===undefined?sci(v):num(v,dg);};
// [code, nom, verrines, mots du journal, états (TOR), mesures (analogiques)] ; une ligne d'état : [libellé, [texte, couleur]].
const KIT_SYS=[
 ['RCP','Circuit primaire',['aThot','aPzrHi','aPzrLo','aSebim','aRdp','aGmpp','aPT','aDom','aDecouv','aDmg'],['PRESSURISEUR','GMPP','SOUPAPES DU PRESSURISEUR','RDP','PRIMAIRE','P-T','BRANCHE','CŒUR'],
  (s,d)=>[['Pompes primaires',Number.isInteger(s.gmppN)?[s.gmppN+' / '+((d.pal&&d.pal.NB)||3)+' EN MARCHE',s.gmppN>0?'v':'r']:['—','']],['Régulation pression',AMv(s.pzrAuto)],['Chaufferettes',MA(s.heat)],['Aspersion pressuriseur',MA(s.spray)],['Soupapes du pressuriseur',s.sebim===true?['OUVERTES','r']:s.sebim===false?['FERMÉES','']:['—','']]],
  (s,d)=>[['P pressuriseur',num(s.Ppzr,1),'bar'],['Consigne de pression',num(s.pzrSet,1),'bar'],['T moyenne',num(s.Tavg,1),'°C'],['T branche chaude',num(d.tempHot,1),'°C'],['T branche froide',num(d.tempCold,1),'°C'],['Inventaire primaire',num(s.inv,0),'%'],['Niveau cuve',num(s.lvlCuve,0),'%']]],
 ['RCV','Bore et appoint (REA)',['aDilu','aXe'],['BORE','BORICATION','DILUTION','REA','XÉNON','APPOINT'],
  s=>[['Borication',s.bori?['EN COURS','j']:['ARRÊT','']],['Dilution',s.dilu?['EN COURS','j']:['ARRÊT','']]],
  s=>[['Bore primaire',num(s.boreTotal,0),'ppm'],['Effluents vers TEP',num(s.effl,1),'m³'],['Xénon',Number.isFinite(s.Xe)?num(s.Xe*100,0):'—','% éq.']]],
 ['RGL','Grappes',['aMan','aAu'],['GRAPPES','ARRÊT D','RÉARM','GROUPE R','GROUPE D'],
  s=>[['Régulation grappes',AMv(s.auto)],['Arrêt d’urgence',PRES(!!s.scram,'GRAPPES AU FOND')]],
  (s,d)=>{const g=d.grappes,L=g&&Array.isArray(g.groupes)?g.groupes:null;return [['Position groupe '+grpReg(d),num(s.rod,1),'% extrait'],...(L?L.map(x=>{const q=posGroupe(g,x);return ['Groupe '+x.id,q.txt==='---'?'—':q.txt,q.u==='%'?'% extrait':'pas'];}):[]),
    ...(g&&!g.totalMax&&g.mode==='A'?[]:[['Totalisateur G',g&&Number.isFinite(g.totalisateur)?String(Math.round(g.totalisateur)):'—','pas insérés']])];}],
 ['RPN','Instrumentation nucléaire',['aOver'],['SURPUISSANCE','NIVEAU SOURCE','CHAÎNE','FLUX','DIVERGENCE','P6','P10','CRITIC'],
  s=>[],(s,d)=>[['Puissance neutronique',Number.isFinite(s.Pn)?num(s.Pn*100,1):'—','% PN'],['Puissance thermique',num(d.powerThermal,0),'MWth']],'instrumentation'],
 ['RIS','Injection de sécurité',['aIS','aBlkIS','aAcc','aRecirc'],['SIGNAL IS','ISHP','ISBP','INJECTION','ACCUMULATEUR','ACCUS','RECIRC','P11','RÉARMER IS'],
  s=>[['Signal IS',PRES(!!s.sigIS)],['Blocage du signal IS',s.isBlk===true?['BLOQUÉ','j']:s.isBlk===false?['NORMAL','']:['—','']],['Injection haute pression',MA(s.ishp)],['Injection basse pression',MA(s.isbp)],['Accumulateurs',s.accIso===true?['ISOLÉS','j']:s.accIso===false?['ALIGNÉS','v']:['—','']],['Recirculation',s.recirc?['ENGAGÉE','j']:['—','']]],
  s=>[['Accumulateurs',num(s.accu,0),'%'],['Bâche PTR',Number.isFinite(s.ptr)?num(s.ptr*100,0):'—','%']]],
 ['EAS','Aspersion enceinte',['aEasOn','aPenc'],['EAS','ASPERSION ENCEINTE'],
  s=>[['Aspersion enceinte',MA(s.eas)]],s=>[['P enceinte',num(s.Penc,2),'bar']]],
 ['ENC','Enceinte',['aIso','aH2','aEncF'],['ISOLEMENT ENCEINTE','HYDROG','CONFINEMENT','ENCEINTE'],
  s=>[['Isolement enceinte',s.isoEnc?['ISOLÉE','j']:['NORMAL','']],['Rupture du confinement',PRES(!!s.encFail)]],
  (s,d)=>[['P enceinte',num(s.Penc,2),'bar'],['H2 enceinte',num(s.h2,1),'% vol'],['Débit de dose enceinte',rv(d,'krte'),'mGy/h']]],
 ['RRA','Refroidissement à l’arrêt',['aRra'],['RRA'],
  s=>[['RRA',s.rra===true?['RACCORDÉ','v']:s.rra===false?['ISOLÉ','']:['—','']]],s=>[['T moyenne primaire',num(s.Tavg,1),'°C'],['P primaire',num(s.Ppzr,1),'bar']]],
 // V24 (S413, S407, 14/10) : l'ARE est dite disponible, pas en service ; les lignes de l'ASG sont des ordres, son débit dit le reste.
 ['ARE','Eau alimentaire',['aAre','aTpa','aGvLo','aGvHi','aDry'],['ARE','TPA','NIVEAU GV','EAU ALIMENTAIRE','P14','ASSÉCH','APA'],
  s=>[['Régulation ARE',AMv(s.areAuto)],['Eau alimentaire',s.areAvail===true?['DISPONIBLE','v']:s.areAvail===false?['PERDUE','r']:['—','']],['Turbopompe alimentaire TPA',MA(s.tpaRun)]],
  (s,d)=>[['Niveau GV',num(s.gv,1),'%'],['Débit ARE',num(s.areOut,0),'%'],['T eau alimentaire',rv(d,'tare',0),'°C']]],
 ['ASG','Alimentation de secours',['aAsg'],['ASG','MPS','TPS','BÂCHE ASG','SVA','TURBOPOMPE'],
  s=>[['Ordre motopompe A',MA(s.mpsA)],['Ordre motopompe B',MA(s.mpsB)],['Ordre turbopompe',MA(s.tpsA===true||s.tpsB===true?true:s.tpsA===false?false:null)],['Vapeur auxiliaire SVA',s.svaOn===true?['EN SERVICE','v']:['—','']]],
  s=>[['Débit ASG',Number.isFinite(s.asg)?num(s.asg*100,1):'—','% nominal'],['Bâche ASG',Number.isFinite(s.bacheASG)?num(s.bacheASG*100,0):'—','%']]],
 ['VVP','Vapeur principale',['aPvap','aSvGv','aViv','aRejA'],['VVP','VIV','SOUPAPES DE SÛRETÉ GV','RTV','PRESSION VAPEUR','ISOLEMENT VAPEUR','REJETS CONTAMINÉS'],
  s=>[['Vannes d’isolement VIV',s.viv===true?['OUVERTES','v']:s.viv===false?['FERMÉES','j']:['—','']],['Soupapes des GV',Number.isFinite(s.svf)?(s.svf>0.02?['OUVERTES','r']:['FERMÉES','']):['—','']]],
  (s,d)=>[['P vapeur GV',num(s.Psteam,1),'bar'],['T vapeur GV',num(s.tVapGV,0),'°C'],['Fuite GV (VVP)',rv(d,'krtv'),'L/h']]],
 ['GCT','Contournement vapeur',['aGct','aGcta'],['GCT'],
  s=>[['GCT condenseur',AMt(s.gctMode)],['GCT atmosphère',AMt(s.gctaMode)]],
  s=>[['Consigne de pression vapeur',num(s.gctTgt,1),'bar'],['Ouverture GCT condenseur',Number.isFinite(s.gct)?num(s.gct*100,0):'—','%'],['Ouverture GCT atmosphère',Number.isFinite(s.gctA)?num(s.gctA*100,0):'—','%']]],
 ['GRE','Turbine et charge',[],['TURBINE','CHARGE','DÉCLENCHEMENT','ADMISSION','SUIVI DU RÉSEAU'],
  (s,d)=>[['Suivi du réseau',d.follow===true?['ACTIF','v']:d.follow===false?['COUPÉ','']:['—','']]],
  s=>[['Consigne de charge',num(s.turbSet,0),'%'],['Admission turbine',num(s.turb,1),'%'],['Pente de charge',Number.isFinite(s.turbRate)?num(s.turbRate*60,0):'—','%/min'],['P admission HP',num(s.Padm,1),'bar'],['P électrique',num(s.Pelec,0),'MWe']]],
 ['CVI','Condenseur',['aVide','aCvi'],['CONDENSEUR','VIDE','CVI'],
  s=>[['Extraction des incondensables',DI(s.cvi)]],s=>[['P condenseur',Number.isFinite(s.Pcond)?num(s.Pcond*1000,0):'—','mbar']]],
 ['CRF','Source froide',['aCrf','aSec','aRri'],['CRF','SEC','RRI','SOURCE FROIDE'],
  s=>[['Circulation CRF',DI(s.crf)],['Eau brute SEC',DI(s.sec)],['Réfrigération RRI',DI(s.rri)]],
  s=>[['T source froide',num(s.Tsrc,1),'°C']]],
 ['LH','Alimentations électriques',['aReseau','aIlot','aDiesel','aH3','aLls'],['RÉSEAU','ÎLOTAGE','DIESEL','LLS','H3','LHA','LHB','ULTIME','SOURCE EXTÉRIEURE','LOOP'],
  s=>[['Réseau extérieur',s.reseau===false?['PERDU','r']:s.reseau===true?['PRÉSENT','v']:['—','']],['Îlotage',s.ilote?['ÎLOTÉE','j']:['—','']],['Diesels',s.diesel?['EN SERVICE','j']:['—','']],['Ultime secours',s.lls?['EN SERVICE','j']:['—','']],['Perte totale (H3)',PRES(!!s.h3)]],
  s=>[['Production nette',num(s.Pelec,0),'MWe'],['Production brute',num(s.Pbrut,0),'MWe'],['Auxiliaires',num(s.Paux,0),'MWe']]],
 ['RPR','Protection et inhibitions',['aInhib'],['INHIB','PROTECTION','ORDRE AAR','ORDRE AUTOMATIQUE'],
  s=>[['Arrêt automatique (AAR)','aarInhib'],['Isolement enceinte','inhIsoE'],['Isolement vapeur (VIV)','inhIsoV'],['Signal IS','inhIS'],['EAS automatique','inhEAS'],['ASG automatique','inhASG'],['Isolement VVP (KRT)','inhKrt']].map(([l,k])=>[l,s[k]===true?['INHIBÉ','r']:s[k]===false?['NORMAL','']:['—','']]),s=>[]],
 ['KRT','Radioprotection',['aActP','aActV','aActE','aRejA'],['KRT','ACTIVITÉ','REJETS','DOSE'],
  s=>[],(s,d)=>[['Débit de dose enceinte',rv(d,'krte'),'mGy/h'],['Fuite GV (VVP)',rv(d,'krtv'),'L/h'],['Activité cheminée',rv(d,'dvn'),'Bq/m³']],'instrumentation'],
 ['PTR','Piscine et bâche PTR',['aPtr','aKhy'],['PTR','PISCINE','BK','KHY'],
  s=>[],(s,d)=>[['T piscine BK',rv(d,'tbk',1),'°C'],['Bâche PTR',Number.isFinite(s.ptr)?num(s.ptr*100,0):'—','%']]]];
const KIT_ECRANS=[['instrumentation','Neutronique, KRT et réactivité'],['coeur','Carte calculée'],['pt','Domaine pression / température']];
// Carte des grappes du KIT (coup de propre N4/EPR, 4A du 04/10, comme la carte du KIS du 1300) : les grappes du plan lu par groupe (CPY :
// 36 de pilotage lues et les 17 S du plan de 1978 ; CP0 : 48), leur position, le détail au toucher (sans commande), puis la carte calculée
// native (température, puissance, épuisement, indice PF, gaine). Couleurs de l'écran du KIT au CPY, phosphore vert au CP0.
const COUL_KIT={R:'#ff5a4a',G1:'#c8ccc8',G2:'#9aa19d',N1:'#ffe36b',N2:'#3be0d0',S:'#4d9bff',D:'#4dff86',C:'#4dff86',B:'#4dff86',A:'#4dff86',SA:'#4dff86',SB:'#4dff86'};
function carteKit(d){const g=d.grappes,cp0=palDe(d)==='CP0';
  const theme=cp0?{fond:'#03070a',vide:'#04110a',case:'#0a2414',trait:'#1f5a3a',texte:'#6fdc8c',sel:'#e6ff9a',gris:'#3f8f5a'}:{fond:'#03070a',vide:'#0a1418',case:'#122229',trait:'#2b4a52',texte:'#9fe8bf',sel:'#ffe36b',gris:'#9aa19d'};
  return ecran('KIT','Carte du cœur · grappes',IN.carteGrappes(g,{sel:KITSEL.cas,attr:'data-s9-case',theme,couleurs:COUL_KIT,cellule:16})
    +'<button type="button" class="s9-crt-b" data-n4-page="coeur">▸ Carte calculée : température, puissance, épuisement, indice PF, gaine</button>',
    {classe:'s9-kit s9-kit-carte',droite:'<button type="button" class="s9-crt-b" data-s9-kit="">‹ Grille</button>',pied:'Calculateur de tranche · consultation'});}
const norm=t=>String(t||'').toUpperCase().replace(/[’']/g,'\'');
function niveauSys(ids,d){const par=Object.fromEntries((d.verrines||[]).map(v=>[v.id,v]));let n=0,haut='';for(const id of ids){const L=lentille(par[id]);if(L){n++;if(L==='rouge'||(L==='orange'&&haut!=='rouge')||(L==='blanc'&&!haut))haut=L;}}return {n,haut};}
function kit(d){
  if(KITSEL.sys==='CARTE')return carteKit(d);
  if(KITSEL.sys==='JOURNAL')return journalKit(d,true);
  const sys=KIT_SYS.find(x=>x[0]===KITSEL.sys);
  if(!sys){const tuiles=KIT_SYS.map(([code,nom,ids])=>{const {n,haut}=niveauSys(ids,d);return '<button type="button" class="s9-kit-t" data-s9-kit="'+code+'" data-niveau="'+haut+'"><b>'+code+'</b><span>'+esc(nom)+'</span><small>'+(n?n+(n>1?' alarmes':' alarme'):'—')+'</small></button>';}).join('')
      +'<button type="button" class="s9-kit-t s9-kit-e" data-s9-kit="JOURNAL"><b>ÉCRAN</b><span>Journal de la tranche</span><small>▸ ouvrir</small></button>'
      +'<button type="button" class="s9-kit-t s9-kit-e" data-s9-kit="CARTE"><b>ÉCRAN</b><span>Carte des grappes</span><small>▸ ouvrir</small></button>'
      +KIT_ECRANS.map(([p,nom])=>'<button type="button" class="s9-kit-t s9-kit-e" data-n4-page="'+p+'"><b>ÉCRAN</b><span>'+esc(nom)+'</span><small>▸ ouvrir</small></button>').join('');
    return ecran('KIT','Systèmes élémentaires','<p class="s9-crt-n">Choisir un système : ses alarmes et événements, ses états et ses mesures.</p><div class="s9-kit-g">'+tuiles+'</div>',{classe:'s9-kit',pied:'Calculateur de tranche · consultation'});}
  const [code,nom,ids,mots,etats,mesures,natif]=sys,s=st(d),M=mots.map(norm);
  const ev=(d.journal||[]).filter(x=>{const t=norm(x.message);return M.some(m=>t.includes(m));}).slice(0,14);
  const E=etats(s,d),A=mesures(s,d);
  const evs=ev.length?ev.map(x=>'<p class="'+(x.color==='rouge'?'r':x.color==='jaune'?'o':'')+'"><b>'+esc(x.time)+'</b> '+esc(x.message)+'</p>').join(''):'<p class="s9-crt-n">Aucun événement récent pour ce système.</p>';
  const tors=E.length?E.map(([l,[t,c]])=>'<div class="s9-crt-l"><span>'+esc(l)+'</span><b class="s9-crt-e" data-c="'+c+'">'+esc(t)+'</b></div>').join(''):'<p class="s9-crt-n">—</p>';
  const anas=A.length?A.map(([l,v,u])=>ligne(l,v,u)).join(''):'<p class="s9-crt-n">—</p>';
  return ecran('KIT',code+' · '+nom,'<div class="s9-kit-d"><section><h4>Alarmes et événements</h4><div class="s9-kit-ev">'+evs+'</div></section><section><h4>États (tout ou rien)</h4>'+tors+'<h4>Mesures (analogiques)</h4>'+anas
    +(natif?'<button type="button" class="s9-crt-b" data-n4-page="'+natif+'">▸ Écran neutronique, KRT et réactivité</button>':'')+'</section></div>',{classe:'s9-kit',droite:'<button type="button" class="s9-crt-b" data-s9-kit="">‹ Grille</button>',pied:'Calculateur de tranche · consultation'});}
function incidents(d,on){const s=st(d);
  const L=[['iTrip','Déclenchement turbine',s.turb<=1&&s.etat==='RP'&&!s.scram,'Recoupler turbine'],['iGmpp1','Perte d’une GMPP',s.gmppN>0&&s.gmppN<((d.pal&&d.pal.NB)||3),'Relancer la GMPP'],['iGmpp','Perte des GMPP',s.gmpp===false&&!s._gmppAtt,'Relancer les GMPP'],['iAre','Perte ARE',s.areAvail===false,'Rétablir ARE'],['iCvi','Perte CVI',s.cvi===false,'Rétablir CVI'],['iApr','Brèche primaire (APRP)',(s.breche||0)>0,'Isoler la brèche'],['iLoop','Perte source extérieure',s.reseau===false,'Rétablir réseau ext.'],['iH3','Défaillance diesels (H3)',!!s.h3,'Réparer diesels'],['iCrf','Perte CRF',s.crf===false,'Rétablir CRF'],['iSec','Perte SEC',s.sec===false,'Rétablir SEC'],['iRri','Perte RRI',s.rri===false,'Rétablir RRI'],['iRra','Perte RRA',!!s.rraF,'Rétablir RRA'],['iFtgv','Fuite tube GV',(s.fuiteGV||0)>0&&(s.fuiteGV||0)<3,'Colmater fuite GV'],['iRtgv','RTGV franche',(s.fuiteGV||0)>=3,'Bouchonner le tube'],['iRtv','Rupture tuyauterie vapeur (RTV)',(s.rtv||0)>0,'Colmater la RTV (exercice)'],['iDiluI','Dilution intempestive',!!s.diluI,'Isoler l’appoint (REA)'],['iMyst','Panne mystère',!!s.myst,'Révéler la panne']];
  return '<div class="s9-inc">'+I.zone({titre:'Incidents et rétablissements (simulateur)',teinte:'creme'},'<div class="s9-inc-g">'+L.map(([id,lab,actif,parade])=>I.poussoir({label:actif?parade:lab,cmd:{type:'incident',id},actif,enabled:on,lent:'ambre',nom:actif?parade:lab})).join('')+'</div><p class="s9-note">Le pupitre de l’instructeur : chaque incident devient sa parade une fois injecté.</p>')
    +I.zone({titre:'Défaut d’étanchéité des gaines',teinte:'creme'},I.consigne({k:'gainePct',label:'Assemblages présentant un défaut',value:Number.isFinite(s.gaine)?s.gaine*100:null,min:0,max:30,pas:.5,unit:'% du cœur',enabled:on&&!((s.dmg||0)>0.01),verrou:'réglage verrouillé : le cœur est endommagé'})+'<p class="s9-note">Dans SIMUREP, cela fait environ '+(Number.isFinite(s.gaine)&&Number.isFinite(d.pal&&d.pal.NASS)?Math.round(s.gaine*d.pal.NASS):'—')+(Number.isFinite(s.gaine)&&Number.isFinite(d.pal&&d.pal.NASS)&&Math.round(s.gaine*d.pal.NASS)<=1?' assemblage':' assemblages')+' sur '+(Number.isFinite(d.pal&&d.pal.NASS)?d.pal.NASS:'—')+'. Surveiller l’activité KRT du primaire et de la vapeur.</p>')+'</div>';}
// Lot 4 ter (6A, 7A du 07/10) : aux salles 900, le journal de la tranche est un écran du KIT, en bas de la page Alarmes et par la tuile
// « ÉCRAN » de la grille du KIT ; mêmes lignes, couleurs de l'écran du KIT du palier (CPY : couleurs d'époque ; CP0 : phosphore vert,
// vidéo inverse pour le rouge). Aucune entrée de menu, aucune commande.
function journalKit(d,grille){const L=(d.journal||[]).slice(0,60);
  return ecran('KIT','Journal de la tranche','<div class="s9-kit-ev s9-kit-jl">'+(L.length?L.map(x=>'<p class="'+(x.color==='rouge'?'r':x.color==='jaune'?'o':'')+'"><b>'+esc(x.time)+'</b> '+esc(x.message)+'</p>').join(''):'<p class="s9-crt-n">Journal vide.</p>')+'</div>',
    {classe:'s9-kit s9-kit-journal'+(grille?' s9-kit-journal-plein':''),droite:grille?'<button type="button" class="s9-crt-b" data-s9-kit="">‹ Grille</button>':'',pied:'Calculateur de tranche · consultation'});}
// ── Contenu de la page courante
function contenu(ui,d,H){const on=ui.connected;
  if(SOUS_KIT.includes(ui.page))return ecran('KIT',PAGES[ui.page].replace(/^KIT · /,''),'<div data-n4-live-slot="'+ui.page+'" class="n4-live-slot" aria-label="Écran du KIT"></div>',{classe:'s9-kit s9-crt-natif',droite:'<button type="button" class="s9-crt-b" data-n4-page="kit">‹ Grille</button>',pied:'Calculateur de tranche · consultation'});
  if(ui.page==='formation')return '<div class="s9-formation"><div data-n4-live-slot="formation" class="n4-live-slot" aria-label="Aide et missions"></div></div>';
  if(ui.page==='kit')return kit(d);
  if(ui.page==='pupitre')return pupitre(d,on);if(ui.page==='arriere')return arriere(d,on);if(ui.page==='surete')return surete(d);
  if(ui.page==='synoptique')return '<div class="s9-syn-page">'+SYN.render(d,{vue:'page'})+SYN.render(d,{vue:'tel',coupe:SYNV.coupe,releves:SYNV.releves})+'</div>';
  if(ui.page==='verrines')return commandesAlarmes(false)+tableau(d,true)+journalKit(d);
  if(ui.page==='enregistreur')return KS.page(enr(),d.enregistreur,null,st(d).t,'e',{groupe:grpReg(d)});
  if(ui.page==='incidents')return incidents(d,on);
  return '';}
// Enregistreur : état de l'appareil gardé entre les pages ; volet des voies ouvert au PC, replié au téléphone (10A du 03/10).
const ENR={e:null,store:null,tel:false};
function enr(){if(!ENR.e){ENR.e=KS.etatNeuf(ENR.store);ENR.e.ouvert=!ENR.tel;}return ENR.e;}
// Zone visée depuis le synoptique : éclairée 1,6 s, l'attribut est posé au rendu pour survivre aux rafraîchissements.
const VISEE={cle:'',jusqua:0},RETOUR={page:''},SYNV={coupe:0,releves:false};
function render(ui,data,H){return viser(rendu(ui,data,H));}
const courant=(id,page)=>id===page||(id==='kit'&&SOUS_KIT.includes(page));
// Enseigne du CP0 (10A du 03/10, photos de la salle du Bugey 2 : « TRANCHE 2 », horloge rouge, puissance en MW) : sur le bandeau
// noir du mur, visible mur replié ; l'horloge donne le jour et l'heure de l'appareil du joueur, comme une horloge de salle, la
// puissance est la production électrique reçue du moteur. Affichage seulement.
const JOURS=['DIM','LUN','MAR','MER','JEU','VEN','SAM'],MOIS=['JANV.','FÉVR.','MARS','AVR.','MAI','JUIN','JUIL.','AOÛT','SEPT.','OCT.','NOV.','DÉC.'];
function enseigne(ui,s){const d=new Date(),hh=String(d.getHours()).padStart(2,'0'),mm=String(d.getMinutes()).padStart(2,'0'),mw=Number.isFinite(s.Pelec)?String(Math.max(0,Math.round(s.Pelec))):'---';
  return '<div class="s9-ens" role="group" aria-label="'+esc('Tranche '+(ui.unitLabel||ui.unit)+' · '+JOURS[d.getDay()].toLowerCase()+' '+d.getDate()+' '+MOIS[d.getMonth()].toLowerCase()+' '+hh+' h '+mm+' · '+(mw==='---'?'puissance inconnue':mw+' MW'))+'">'
    +'<b>TRANCHE '+esc(ui.unitLabel||ui.unit)+'</b><span class="s9-ens-h"><small>'+d.getDate()+' '+JOURS[d.getDay()]+'<br>'+MOIS[d.getMonth()]+'</small>'+I.sept(hh,2)+'<em>:</em>'+I.sept(mm,2)+'</span><span class="s9-ens-mw">'+I.sept(mw,3)+'<small>MW</small></span></div>';}
// Mur dépliant : état du volet (replié par défaut), gardé dans le navigateur du joueur.
const MUR={ouvert:false,store:null,cle:'simurep_sdc_900_mur_v1'};
function etatMur(c){const allumees=c.rouge+c.orange+c.blanc,acq=c.nouvelle+c.disparue;return (acq?acq+' à acquitter · ':'')+(allumees?allumees+(allumees>1?' verrines allumées':' verrine allumée'):'aucune verrine allumée');}
function viser(html){if(!VISEE.cle||Date.now()>=VISEE.jusqua)return html;return html.replace('data-s9-zone="'+VISEE.cle+'"','data-s9-zone="'+VISEE.cle+'" data-visee="1"');}
function rendu(ui,data,H){if(ui.page==='synoptique')RETOUR.page='';
  const {escape:e,number,horloge,ligneVersion,etatCourt=v=>v,missionBar=()=>'',simulationControls,navigation=()=>'',temoins=()=>'',sortiesMenu=()=>''}=H,s=data.state||{},pal=data.pal&&data.pal.ID||'900',palier=s.pal||'CPY';
  const page=(id,label,extra='')=>'<button type="button" data-n4-page="'+id+'" '+extra+'>'+label+'</button>';
  const scram='<button type="button" class="n4-scram" data-n4-command="'+e(JSON.stringify({type:'scram'}))+'"'+(ui.connected?'':' disabled')+'>ARRÊT D’URGENCE</button>';
  const k=klaxon(),c=compte();
  // Geste 50 (136A du 25/10) : puissance électrique reçue du moteur dans la barre d'état, comme au 1300 ; au CP0, l'enseigne du mur la porte,
  // la barre la reprend quand le mur est replié hors de la page (téléphone). Inconnue : « — ».
  const pel='<span class="s9-pel'+(palier==='CP0'?' s9-pel-tel':'')+'" title="Puissance électrique">'+number(Number.isFinite(s.Pelec)?Math.max(0,Math.round(s.Pelec)):null,0)+'&nbsp;MWe</span>';
  return '<div class="n4-sdc s9-sdc" data-page="'+e(ui.page)+'" data-palier="'+e(palier)+'">'+(ui.published?'':'<div class="n4-study">ESSAI PRIVÉ · SALLE 900 <span>palier '+e(palier)+'</span></div>')
    // En-tête sur une ligne (1A du 03/10) : niveaux, tranche, témoins, identité en petit, simulation.
    +'<header class="n4-header s9-entete">'+navigation(ui)+'<div class="n4-unit"><strong>'+e(ui.site.toUpperCase())+' · TRANCHE&nbsp;'+e(ui.unitLabel||ui.unit)+'</strong><span>PALIER '+e(palier)+'</span></div>'+temoins(data)+'<div class="n4-brand"><b>SIMUREP</b><span>Le simulateur du parc électronucléaire français</span>'+ligneVersion(ui)+'</div><details class="n4-session"><summary>Simulation <span>'+horloge(data.simulationTime)+' · ×'+(s.accel||1)+'</span></summary>'+simulationControls(ui,data)+'</details></header>'
    +'<div class="n4-quickbar s9-quickbar"><span class="s9-etat"><b>'+e(etatCourt(data.stateLabel)||'—')+'</b>'+(ETATS[data.stateLabel]?' '+ETATS[data.stateLabel]:'')+(data.targetState&&data.targetState!==data.stateLabel?' · état visé '+e(etatCourt(data.targetState)):'')+pel+'</span>'+commandesAlarmes(true)+scram+'</div>'
    +'<div class="n4-command-status" data-active="'+!!ui.status+'" role="status">'+e(ui.status||'')+'</div>'
    // Mur dépliant (Anthonin, 03/10, question 7 du point d'arrêt) : le pupitre d'abord, le mur dans un volet que le joueur
    // déplie ou replie ; son choix est gardé. Replié, le bandeau garde klaxon, acquittement et nombre d'alarmes.
    +'<details class="s9-mur-volet"'+(MUR.ouvert?' open':'')+'><summary><b>Mur · synoptique et verrines</b><span>'+etatMur(c)+'</span>'+(palier==='CP0'?enseigne(ui,s):'')+'<i>'+(MUR.ouvert?'Replier':'Déplier')+'</i></summary>'
    +'<div class="s9-mur" aria-label="Mur de la salle : synoptique et verrines"><div class="s9-mur-syn">'+SYN.render(data,{vue:'mur'})+'</div><div class="s9-mur-ver">'+tableau(data,false)+'</div></div></details>'
    +'<div class="s9-salle"><nav class="n4-page-keys s9-keys" aria-label="Panneaux de la salle">'+NAV.map(([id,label])=>page(id,label,'aria-current="'+(courant(id,ui.page)?'page':'false')+'"')).join('')+'</nav>'
    +'<section class="s9-panneau" aria-label="'+e(PAGES[ui.page]||'')+'"><div class="s9-panneau-t"><h2>'+e(PAGES[ui.page]||'')+'</h2>'+(RETOUR.page&&RETOUR.page!==ui.page?'<button type="button" class="s9-pous s9-l-blanc s9-retour" data-s9-retour="'+e(RETOUR.page)+'">‹ '+e(RETOUR.page==='synoptique'?'Synoptique':PAGES[RETOUR.page]||'Retour')+'</button>':'')+'</div>'+missionBar(ui,data,{montrer:cibles,attribut:'data-s9-aller'})+'<div class="n4-main-content s9-main">'+contenu(ui,data,H)+'</div></section></div>'
    +'<footer class="n4-desk-footer"><span>Salle de commande · palier '+e(palier)+'</span><span>© 2026 AnthoninP · SIMUREP</span></footer>'
    +'<nav class="n4-thumb-dock s9-dock" aria-label="Navigation au pouce"><button type="button" data-n4-menu="toggle" aria-expanded="'+!!ui.menu+'">Panneaux</button>'+page('verrines','Alarmes'+(c.nouvelle+c.disparue?' <b class="s9-dock-n">'+(c.nouvelle+c.disparue)+'</b>':''),'class="s9-dock-al'+(k?' s9-dock-k':'')+'"')+'<button type="button" class="s9-dock-acq s9-l-vert" data-s9="acquitter" data-on="'+k+'"'+(k?'':' aria-disabled="true"')+'>Acquitter</button>'+scram.replace('ARRÊT D’URGENCE</button>','Arrêt<br>d’urgence</button>')+'</nav>'
    +(ui.menu?'<div class="n4-thumb-menu"><div><b>Panneaux de la salle</b><button type="button" data-n4-menu="toggle">Fermer</button></div><nav>'+NAV.map(([id,label])=>page(id,label,'aria-current="'+(courant(id,ui.page)?'page':'false')+'"')).join('')+'</nav>'+sortiesMenu(ui)+'</div>':'')
    +'</div>';
}
// Écrans natifs du KIT (12A du 03/10) : même contenu, habillage d'époque (fond noir, chasse fixe, couleurs du calculateur) ; Aide &
// missions aux couleurs crème de la salle, boutons lumineux carrés. Feuille ajoutée par l'hôte dans le document du châssis caché,
// pour la salle 900 seulement (les postes N4/EPR gardent la leur).
// J6 2c (C-30, 134A) : sous-titre de la chaussette en gras : sans Consolas ni Lucida Console (Mac, iPhone), la chasse fixe est un Courier New
// maigre, illisible sous le balayage de l'écran.
const styleNatif=`
body.n4-native{background:#03070a!important;color:#cfe8d8!important;font:13px/1.5 "Consolas","Lucida Console","Courier New",monospace!important}
body.n4-native::after{content:'';position:fixed;inset:0;background:repeating-linear-gradient(0deg,#0000 0 2px,#00000040 2px 3px);pointer-events:none;z-index:9}
#n4-native-root .card,#n4-native-root #easyCard,#n4-native-root #easyLex{background:#03070a!important;color:#cfe8d8!important;border:1px solid #1f6f5a!important;border-radius:0!important}
#n4-native-root h2{background:#3be0d0!important;color:#02110f!important;border:0!important;font:700 13px/1.4 "Consolas","Lucida Console","Courier New",monospace!important;letter-spacing:.14em;text-transform:uppercase;padding:4px 8px!important}
#n4-native-root .val,#n4-native-root .bilan td:last-child{background:transparent!important;border:0!important;color:#ffe36b!important;font:700 14px "Consolas","Lucida Console","Courier New",monospace!important}
#n4-native-root .k,#n4-native-root .bilan td,#n4-native-root label{color:#9fe8bf!important}
#n4-native-root .note,#n4-native-root .msg{color:#7fbfa0!important}
#n4-native-root .row{border-bottom:1px dotted #1f4f3c}
#n4-native-root button,#n4-native-root select{background:#04140f!important;color:#7dffb0!important;border:1px solid #2f8f5f!important;border-radius:0!important;font:700 12px "Consolas","Lucida Console","Courier New",monospace!important;text-transform:uppercase;letter-spacing:.06em}
#n4-native-root button.on{background:#7dffb0!important;color:#02110f!important}
#n4-native-root #coreDetail{background:#03070a!important;color:#cfe8d8!important;border-color:#1f6f5a!important}@media(max-width:420px){#n4-native-root #coreDetail{min-height:calc(7*1.35em + 12px)!important}}
body.n4-native:has(#n4-native-root[data-kind=formation]){background:#e1d9c1!important;color:#2b2318!important;font:15px/1.5 Arial,sans-serif!important}
body.n4-native:has(#n4-native-root[data-kind=formation])::after{display:none}
#n4-native-root[data-kind=formation] #easyCard,#n4-native-root[data-kind=formation] #easyLex,#n4-native-root[data-kind=formation] .card{background:#f7f5ef!important;color:#2b2318!important;border:1.6px solid #6d1b26!important;border-radius:0!important}
#n4-native-root[data-kind=formation] h2,#n4-native-root[data-kind=formation] b{color:#1b1714!important;background:transparent!important}
#n4-native-root[data-kind=formation] #easyCard span,#n4-native-root[data-kind=formation] #easyMsg,#n4-native-root[data-kind=formation] .note,#n4-native-root[data-kind=formation] .msg{color:#3a2f20!important}
#n4-native-root[data-kind=formation] .lexD summary{color:#6d1b26!important}
#n4-native-root[data-kind=formation] #easyLex b{color:#6d1b26!important}
#n4-native-root[data-kind=formation] input:not([type=checkbox]){background:#fffdf6!important;color:#2b2318!important;border:1px solid #6d6350!important;border-radius:2px!important}
#n4-native-root[data-kind=formation] button{margin:5px!important;border:3px solid #c9ccc8!important;border-radius:2px!important;background:linear-gradient(#e3e6e2,#c3c7c2)!important;color:#22262a!important;box-shadow:inset 0 0 0 1px #0007,inset 0 2px 4px #0005,0 0 0 1px #535553,0 0 0 4px #363836,0 0 0 5px #111211!important;font:700 12px/1.12 "Arial Narrow",Arial,sans-serif!important;letter-spacing:.05em;text-transform:uppercase}
#n4-native-root[data-kind=formation] button.on{background:radial-gradient(circle at 50% 38%,#ffffff,#f7faff 55%,#d4e1f2)!important;color:#0d1115!important;box-shadow:inset 0 0 0 1px #fff7,0 0 0 1px #535553,0 0 0 4px #363836,0 0 0 5px #111211,0 0 14px 6px #eaf2ffcc!important}
#n4-native-root #secSock{--sk-fond:#03070a;--sk-grille:#123a2a;--sk-encre:#cfe8d8;--sk-pale:#7fbfa0;--sk-zone:#1f6f5a;--sk-actif:#3be0d0;--sk-bord:#3be0d0;--sk-sat:#cfe8d8;--sk-gv:#ffe36b;--sk-rra:#3be0d0;--sk-pompe:#7dffb0;--sk-rp:#9fe8bf;--sk-hors:#ff5a4a;--sk-trace:#ffe36b;--sk-ok:#7dffb0}
#n4-native-root #secSock>h2>span{color:#02110f!important;font-weight:700}#n4-native-root #skVal[data-etat=hors]{background:#ff5a4a;color:#03070a}
`;
// CP0 (11A et 9A du 03/10) : écrans natifs du KIT en phosphore vert, Aide & missions au sable ocré de la salle, trait brun.
const PHOSPHORE={'#ff5a4a':'#b8ffc6','#123a2a':'#0e3318','#3be0d0':'#7dff9a','#02110f':'#021a08','#ffe36b':'#b8ffc6','#cfe8d8':'#7dff9a','#9fe8bf':'#4fd977','#7fbfa0':'#2f8f4f','#1f6f5a':'#1e6b36','#1f4f3c':'#123c1f','#04140f':'#03140a','#7dffb0':'#7dff9a','#2f8f5f':'#2f8f4f','#03070a':'#020803','#e1d9c1':'#d6bb85','#f7f5ef':'#e3ca98','#6d1b26':'#5b4426'};
function styleNatifPour(pal){return pal==='CP0'?styleNatif.replace(/#[0-9a-f]{6}/g,c=>PHOSPHORE[c]||c):styleNatif;}
// Pompes ASG nommées dans les accusés : au 900, une seule turbopompe (ses deux clés du moteur vont ensemble).
// Retour d'Anthonin (copie d'essai, 14/10 au soir) : on arrive dans la salle sur le synoptique mural.
const app=common.createProfile({palier:'CPY',pages:PAGES,nav:NAV,synoptics:[],pageInitiale:'synoptique',selectionInitiale:null,render,pompesAsg:{mpsA:'Motopompe ASG A',mpsB:'Motopompe ASG B',tpsA:'Turbopompe ASG',tpsB:'Turbopompe ASG'}},null,null);
// J6 2c (178A) : au téléphone, le bouton de retour (‹ Synoptique, ‹ KIS) ne se fixe en haut à droite qu'une fois l'en-tête de la salle sorti
// de l'écran ; en-tête à l'écran, il reste dans le titre du panneau (fixé dès le haut de page, il couvrait le volet Simulation). Une sentinelle
// par salle montée guette l'en-tête et pose la classe sur l'hôte, que le rendu ne touche pas ; le titre garde la hauteur qu'il avait avec le
// bouton (mesurée sans la classe, dans la même tâche), pour que rien ne remonte sous le doigt ni sous la zone amenée par « Montrer ».
// Sans IntersectionObserver (bancs Node), rien n'est posé : le bouton reste dans le titre. Reprise par la salle du 1300 (commun).
function sentinelle(host){const w=host.ownerDocument&&host.ownerDocument.defaultView,cl=host.classList;
  if(!w||typeof w.IntersectionObserver!=='function'||!cl||!host.querySelector)return {guetter(){},fin(){}};
  let tete=null;
  function poser(hors){const t=hors&&host.querySelector('.s9-panneau-t');if(t){cl.remove('s9-entete-hors');host.style.setProperty('--s9-titre-h',t.offsetHeight+'px');}cl.toggle('s9-entete-hors',!!hors);}
  const io=new w.IntersectionObserver(L=>{for(const x of L)if(x.target===tete){if(!tete.isConnected){guetter();return;}if(!x.isIntersecting!==cl.contains('s9-entete-hors'))poser(!x.isIntersecting);}});
  // Un en-tête remplacé est guetté à nouveau ; « mesure » reprend la hauteur du titre quand le bouton y change, en-tête sorti.
  function guetter(mesure){const e=host.querySelector('.s9-entete');if(e!==tete){if(tete)io.unobserve(tete);tete=e;if(e)io.observe(e);else poser(false);}else if(mesure&&cl.contains('s9-entete-hors'))poser(true);}
  guetter();
  return {guetter,fin(){io.disconnect();tete=null;cl.remove('s9-entete-hors');host.style.removeProperty('--s9-titre-h');}};}
// Montage : l'état des verrines est nourri à chaque instantané (une fois), avant le rendu ; acquittement, essai des lampes et
// enregistreur à points sont des gestes d'affichage, traités ici sans passer par le transport de conduite.
const mount0=app.mount;
function mount(host,options={}){
  ACK.etats={};ACK.init=false;ACK.essai=0;RETOUR.page='';VISEE.cle='';SYNV.coupe=0;SYNV.releves=false;KITSEL.sys='';KITSEL.cas='';let store=null;try{store=host.ownerDocument&&host.ownerDocument.defaultView&&host.ownerDocument.defaultView.localStorage;}catch(_){}ENR.store=store;ENR.e=null;MUR.store=store;try{MUR.ouvert=!!store&&store.getItem(MUR.cle)==='1';}catch(_){MUR.ouvert=false;}try{const w=host.ownerDocument&&host.ownerDocument.defaultView;ENR.tel=!!(w&&w.matchMedia&&w.matchMedia('(max-width:760px)').matches);}catch(_){ENR.tel=false;}
  let dernier=options.snapshot||{};nourrir(dernier.verrines,dernier.simulationTime);
  const inst=mount0(host,options),up=inst.update,sent=sentinelle(host);
  // Synoptique au téléphone (retour d'Anthonin, 14/10 au soir) : le dessin entier défile ; un onglet amène sa coupe, la coupe au milieu de
  // l'écran allume son onglet, et le dessin rouvert revient à la coupe ouverte. Affichage seul.
  const echelle=e=>e.scrollWidth/SYN.largeur;
  function amener(e,lisse){const k=echelle(e);if(!(k>0))return false;const x=SYN.coupes[SYNV.coupe][1]*k;if(lisse&&e.scrollTo)e.scrollTo({left:x,behavior:'smooth'});else e.scrollLeft=x;return true;}
  // J6, client 2 : un dessin agrandi au pincement garde la position que le joueur lui a donnée (le châssis la rend).
  function caler(){const e=host.querySelector&&host.querySelector('.s9-syn-defil');if(e&&!e.__s9cale&&!e.hasAttribute('data-n4-pince-zoom')&&amener(e,false))e.__s9cale=true;}
  function defile(ev){const e=ev.target;if(!e||!e.classList||!e.classList.contains('s9-syn-defil'))return;const k=echelle(e);if(!(k>0))return;
    const xc=(e.scrollLeft+e.clientWidth/2)/k,j=SYN.coupes.findIndex(c=>xc>=c[4]&&xc<c[5]);if(j>=0&&j!==SYNV.coupe){SYNV.coupe=j;up(dernier);}}
  host.addEventListener('scroll',defile,true);
  function redessiner(){up(dernier);caler();sent.guetter();}
  inst.update=function(snapshot){dernier=snapshot||{};nourrir(dernier.verrines,dernier.simulationTime);up(dernier);caler();sent.guetter();};
  caler();
  function aller(cible){const [page,cle]=String(cible).split(':');if(!PAGES[page])return;const w=host.ownerDocument&&host.ownerDocument.defaultView;
    RETOUR.page=inst.getState().page==='synoptique'?'synoptique':'';VISEE.cle=cle||'';VISEE.jusqua=Date.now()+1600;inst.selectPage(page);sent.guetter(true);
    const z=cle&&host.querySelector&&host.querySelector('[data-s9-zone="'+cle+'"]');(z||host.querySelector&&host.querySelector('.s9-panneau'))?.scrollIntoView?.({block:'start',behavior:'smooth'});
    if(w)w.setTimeout(redessiner,1700);}
  // J6 2c (139A) : l'élément de la salle touché est lu à la capture, avant que le poste redessine l'encart ; un bouton du poste que ce redessin
  // change sur place (« Pas à pas » devenu « Montrer · Turbine et charge », vu au navigateur) ne déclenche plus rien dans la salle.
  const TOUCHES='[data-s9],[data-s9-ks],[data-s9-aller],[data-s9-retour],[data-s9-kit],[data-s9-case]';
  function touche(ev){ev.__s9=ev.target&&ev.target.closest?ev.target.closest(TOUCHES):null;}
  function clic(ev){caler();const t=ev.target&&ev.target.closest&&ev.target.closest(TOUCHES);if(!t||!host.contains(t)||('__s9' in ev&&ev.__s9!==t))return;
    if(ev.type==='keydown'&&!['Enter',' '].includes(ev.key))return;if(ev.type==='keydown')ev.preventDefault();
    if(t.hasAttribute('data-s9-case')){const r=t.getAttribute('data-s9-case');KITSEL.cas=KITSEL.cas===r?'':r;redessiner();return;}   // carte des grappes du KIT : affichage seul
    if(t.hasAttribute('data-s9-aller')){aller(t.getAttribute('data-s9-aller'));return;}
    if(t.hasAttribute('data-s9-kit')){KITSEL.sys=t.getAttribute('data-s9-kit')||'';redessiner();host.querySelector&&host.querySelector('.s9-panneau')?.scrollIntoView?.({block:'start'});return;}
    if(t.hasAttribute('data-s9-retour')){const r=t.getAttribute('data-s9-retour');RETOUR.page='';if(PAGES[r]){inst.selectPage(r);host.querySelector&&host.querySelector('.s9-panneau')?.scrollIntoView?.({block:'start'});}return;}
    const a=t.getAttribute('data-s9'),k=t.getAttribute('data-s9-ks');
    if(a&&a.startsWith('coupe:')){SYNV.coupe=Number(a.slice(6))||0;redessiner();const e=host.querySelector&&host.querySelector('.s9-syn-defil');if(e){e.__s9cale=true;amener(e,true);}return;}
    if(a==='acquitter'){acquitter();redessiner();return;}
    if(a==='essai'){ACK.essai=Date.now()+3000;redessiner();const w=host.ownerDocument&&host.ownerDocument.defaultView;if(w)w.setTimeout(redessiner,3100);return;}
    if(k){if(KS.action(enr(),k,dernier.state&&dernier.state.t))redessiner();}}
  // Les volets des voies et des relevés du synoptique gardent l'état choisi par le joueur (l'événement « toggle » ne remonte pas :
  // écoute en capture).
  function volet(ev){const t=ev.target;if(!t||!t.classList)return;if(t.classList.contains('s9-ks-choix'))enr().ouvert=!!t.open;else if(t.classList.contains('s9-syn-rel-volet'))SYNV.releves=!!t.open;}
  host.addEventListener('toggle',volet,true);
  function mur(ev){const t=ev.target;if(!t||!t.classList||!t.classList.contains('s9-mur-volet'))return;if(MUR.ouvert===!!t.open)return;MUR.ouvert=!!t.open;try{MUR.store&&MUR.store.setItem(MUR.cle,MUR.ouvert?'1':'0');}catch(_){}redessiner();}
  host.addEventListener('toggle',mur,true);
  host.addEventListener('click',touche,true);host.addEventListener('keydown',touche,true);host.addEventListener('click',clic);host.addEventListener('keydown',clic);
  const destroy=inst.destroy;inst.destroy=function(){host.removeEventListener('scroll',defile,true);host.removeEventListener('click',touche,true);host.removeEventListener('keydown',touche,true);host.removeEventListener('click',clic);host.removeEventListener('keydown',clic);host.removeEventListener('toggle',volet,true);host.removeEventListener('toggle',mur,true);sent.fin();destroy();};
  inst.alarmes=()=>({klaxon:klaxon(),etats:JSON.parse(JSON.stringify(ACK.etats)),compte:compte()});
  inst.acquitter=()=>{const n=acquitter();redessiner();return n;};
  inst.aller=aller;
  return inst;
}
// Pièces communes aux salles conventionnelles (J2b) : la salle du 1300 les reprend telles quelles, sans copie.
const commun=Object.freeze({sentinelle,ciblesTexte,cycle,commandesAlarmes,tableau,verrine,panneauGrappes,incidents,ebulliometre,tsat,psat,ecran,ligne,tor,sci,DSVG,ETATS,KIT_SYS,niveauSys,posGroupe,MA,DI,AMv,AMt,PRES,rv,alimentee:SYN.alimentee,nonAlimentee,sansVapeur});
const salle=Object.assign({},app,{mount,commun,cibles,ZONES,PAGES,NAV,KIT_SYS,styleNatif,styleNatifPour,SECTIONS,BLANC,D,ROUGE,couleur,_ack:{nourrir,acquitter,klaxon,compte,lentille,etats:()=>ACK.etats,reset(){ACK.etats={};ACK.init=false;}}});
if(typeof module==='object'&&module.exports)module.exports=salle;else root.SDC900=salle;
})(typeof globalThis!=='undefined'?globalThis:this);
