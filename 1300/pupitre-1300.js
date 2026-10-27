// SIMUREP — © 2026 AnthoninP — Tous droits réservés. Organes du pupitre de la salle du 1300 (J2b), dessin seul.
// Grand QCM de la nuit du 03/10 (plan 2.18, « Salle du 1300 : grand QCM »), d'après la photo du pupitre de Paluel 1 (P4, 06/05/2026,
// planche 2) et celle de la salle de Saint-Alban (planche 1) : pupitre mastic à pavés carrés vissés (6A, 7A ; teintes mesurées sur la
// photo), plaques vert sarcelle à lettres blanches pour les groupes de commandes, plaques blanches sous les postes et en tête de section ;
// traits peints (ASG orange, ARE bleu acier, vapeur gris clair, les autres circuits brun-noir) et TPL dans leurs traits (8d, 9A) :
// manette dans l'axe du trait = circuit fermé, en service ; en travers = hors service ; barrette allumée en discordance (matériel
// changé sans le joueur) ; diodes d'état rouge = en service, verte = hors service (9 bis A) ; postes de réglage noirs (10A),
// inhibitions à clé (11A), capot des SEBIM (12A), paires de boutons lumineux de l'injection et de l'aspersion sous plaques noires
// (19A) ; indicateurs et afficheurs de la salle 900 (20 bis A). Chaque organe porte la commande JSON du pupitre classique
// (data-n4-*) ou lit une valeur reçue ; aucune loi moteur, aucune commande ajoutée, aucune marque, aucun repère de matériel, aucune
// étiquette de consignation. Gestes propres à la salle (data-s13-…) : position de la manette, capot ; rien n'est envoyé au moteur.
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./instruments-900.js'));else root.SDC1300Pupitre=factory(root.SDC900Instruments);})(typeof globalThis!=='undefined'?globalThis:this,function(I){
'use strict';
const {esc,num}=I;
const cmd=c=>esc(JSON.stringify(c));
const borne=(x,a,b)=>Math.max(a,Math.min(b,x));
// Couleurs des traits peints : lues sur la photo du pupitre de Paluel 1 (médiane d'une zone unie) pour l'ASG, l'ARE et la vapeur ;
// brun-noir des purges (lu) pour les autres circuits, dont la couleur au pupitre n'est pas photographiée (choix).
const TRAITS={asg:'#f67340',are:'#6485a1',vapeur:'#c9c1ad',autre:'#35261a'};
// ── Section du pupitre : plaque blanche de tête, puis des rangées de grandes plaques mastic (relu sur la photo de Paluel 1 à la demande
//    d'Anthonin, nuit du 03/10) : chaque plaque est vissée aux quatre coins et porte des organes entiers, jamais un organe à cheval sur
//    deux plaques ; joints étroits et sombres entre plaques, cadre crème entre les sections ; les traits peints courent d'une plaque à
//    l'autre. Clé de zone pour « Commander au pupitre › ».
function zone(o={},corps=''){return '<section class="s13-zone'+(o.large?' s13-zone-large':'')+(o.olive?' s13-zone-olive':'')+(o.classe?' '+o.classe:'')+'" aria-label="'+esc(o.titre||'')+'"'+(o.cle?' data-s9-zone="'+esc(o.cle)+'"':'')+'>'
  +'<h3 class="s13-tete"><span>'+esc(String(o.titre||'').toUpperCase())+'</span></h3><div class="s13-pave">'+corps+'</div></section>';}
// Plaque mastic vissée : ses organes entiers, une plaque vert sarcelle de titre si le groupe en a une ; olive là où la photo en montre.
function pan(corps,o={}){return '<div class="s13-pan'+(o.olive?' s13-pan-olive':'')+(o.classe?' '+o.classe:'')+'">'+(o.titre?'<span class="s13-plaque s13-pan-t">'+esc(String(o.titre).toUpperCase())+'</span>':'')+'<div class="s13-pan-c">'+corps+'</div></div>';}
// Rangée de plaques ; avec un circuit, son trait peint traverse les plaques de la rangée et leurs joints à hauteur des manettes.
function pans(corps,o={}){return '<div class="s13-pans'+(o.ligne?' s13-ligne':'')+(o.haut?' s13-ligne-haut':'')+'"'+(o.ligne?' style="--trait:'+(TRAITS[o.ligne]||TRAITS.autre)+'" data-circuit="'+esc(o.ligne)+'"':'')+'>'+corps+'</div>';}
const groupe=(titre,corps,o={})=>pan(corps,Object.assign({titre},o));
const ligne=(circuit,corps,o={})=>pans(corps,{ligne:circuit,haut:o.haut});
// Diodes d'état (9 bis A) : verte allumée = hors service, rouge allumée = en service (circuit fermé, « pas touche ») ; éteintes = inconnu.
function diodes(enService){const r=enService===true,v=enService===false;
  return '<span class="s13-diodes" aria-hidden="true"><i class="s13-d s13-d-v'+(v?' on':'')+'"></i><i class="s13-d s13-d-r'+(r?' on':'')+'"></i></span>';}
function etat(o={}){const e=o.on===true?true:o.on===false?false:null;
  return '<span class="s13-etat" role="img" aria-label="'+esc((o.label||'')+' : '+(e===true?'en service':e===false?'hors service':'état inconnu'))+'">'+diodes(e)+'<span>'+esc(o.label||'')+'</span></span>';}
// ── TPL du 1300 (9A, planche 2 repère 24) : manette chromée à barrette lumineuse, posée sur son trait. positions = [repos, service] ;
//    « manette » = position laissée par le joueur (0, 1 ou null), « etat » = position établie par le matériel (0, 1 ou null).
//    Dans l'axe du trait : service ; en travers : repos. La barrette s'allume quand le matériel n'est plus dans la position de la
//    manette (démarrage automatique, refus du moteur). Toucher tourne la manette vers l'autre position et envoie son ordre ; remettre
//    la manette d'accord renvoie l'ordre déjà exécuté. Les diodes disent l'état du matériel (« materiel » si distinct de l'ordre).
// Rendu réaliste (04/10, passe 3) : chrome dessiné par calques (aucun dégradé par identifiant, voir instruments-900.js). Lumière
// d'en haut à gauche : arc clair en haut à gauche de l'enjoliveur, arc sombre en bas à droite, ombre portée sur la plaque ; la
// manette porte sa bande de reflet du côté de la lumière quelle que soit sa position, et sa barrette en verre (éteinte : verre
// fumé et reflet ; discordance : allumée blanc-bleu).
const arc=(r,deb,ang,coul,ep,op)=>{const c=2*Math.PI*r;return '<circle cx="56" cy="38" r="'+r+'" fill="none" stroke="'+coul+'" stroke-width="'+ep+'" opacity="'+op+'" stroke-dasharray="'+(c*ang/360).toFixed(1)+' '+c.toFixed(1)+'" transform="rotate('+deb+' 56 38)"/>';};
function chrome(rot,allume){
  const travers=rot===90,haut=travers?'y="40.2"':'y="33.4"',bas=travers?'y="33.4"':'y="40.2"';
  return '<circle cx="57.6" cy="40.4" r="20" fill="#000" opacity=".32"/><circle cx="56" cy="38" r="19" fill="#3f3f3b"/><circle cx="56" cy="38" r="17.2" fill="#b9b9b3"/>'
    +arc(16,185,95,'#ffffff',2.6,.85)+arc(16,5,95,'#2c2c29',2.6,.55)+'<circle cx="56" cy="38" r="13.6" fill="#7d7d77"/><circle cx="56" cy="38" r="12.4" fill="#d3d3cd"/>'
    +arc(11.4,190,80,'#ffffff',1.6,.7)+'<ellipse cx="51.5" cy="33.2" rx="5.5" ry="3.2" fill="#ffffff" opacity=".45" transform="rotate(-35 51.5 33.2)"/>'
    +'<g transform="rotate('+rot+' 56 38)">'+(allume?'<rect x="31" y="31" width="50" height="14" rx="4" fill="#bfe6ff" opacity=".55"/>':'')
    +'<rect x="34.6" y="34.6" width="46" height="11" rx="3" fill="#000" opacity=".3"/>'
    +'<rect x="33" y="32.5" width="46" height="11" rx="3" fill="#c4c4be" stroke="#3f3f3b" stroke-width=".8"/>'
    +'<rect x="34.2" '+haut+' width="43.6" height="2.4" rx="1.2" fill="#ffffff" opacity=".85"/><rect x="34.2" '+bas+' width="43.6" height="2.4" rx="1.2" fill="#000" opacity=".22"/>'
    +'<rect x="41" y="36" width="30" height="4.5" rx="1.6" fill="'+(allume?'#f3fbff':'#4b4f53')+'" stroke="'+(allume?'#7cc8ff':'#2b2c2a')+'" stroke-width=".6"/>'
    +'<rect x="42.4" y="'+(travers?'38.9':'36.5')+'" width="27.2" height="1.1" rx=".5" fill="#ffffff" opacity="'+(allume?'.9':'.38')+'"/></g>';}
function tpl(o={}){
  const P=o.positions||[],k=o.etat===1||o.etat===0?o.etat:null,m=o.manette===1||o.manette===0?o.manette:k,ok=o.enabled!==false;
  const discord=ok&&m!==null&&k!==null&&m!==k,cible=m===1?0:1,pos=P[cible]||{},cle=(P[1]&&P[1].cmd&&P[1].cmd.k)||'';
  const service=m===1,rot=service?0:90;   // jamais en diagonale (Anthonin, 03/10) : inconnue, la manette reste en travers
  const mat=o.materiel===true||o.materiel===false?o.materiel:k===1?true:k===0?false:null;
  const svg='<svg viewBox="0 0 112 76" aria-hidden="true">'+chrome(rot,discord)+'</svg>';
  const dit=o.alerte||(k===null?(o.inconnu||'position inconnue'):(P[k]&&P[k].label)||'');   // J6 (96A) : alerte en ambre, comme au 900
  const txt=!ok&&o.verrou?o.verrou:discord?'discordance':dit;
  return '<div class="s13-tpl-o"><span class="s13-plaque">'+esc(String(o.titre||'').toUpperCase())+'</span>'
    +'<button type="button" class="s13-tpl'+(service?' s13-tpl-service':'')+(discord?' s13-tpl-discord':'')+'" data-n4-command="'+cmd(pos.cmd)+'" data-n4-command-name="'+esc(pos.nom||o.nom||o.titre||'')+'" data-s13-manette="'+esc(cle+':'+cible)+'" aria-pressed="'+service+'" aria-label="'+esc((o.titre||'')+' : '+dit+(discord?', manette en discordance':'')+(ok?'. Toucher : '+(pos.label||''):(o.verrou?' ('+o.verrou+')':'')))+'"'+(ok?'':' disabled')+'>'+svg+diodes(mat)+'</button>'
    +'<span class="s13-tpl-etat'+(discord?' s13-tpl-etat-d':'')+'"'+(o.alerte&&txt===o.alerte?' style="'+I.ALERTE_AMBRE+'"':'')+'>'+esc(txt)+'</span></div>';}
// ── Poste de réglage noir (10A, planche 2 repère 25) : échelle 0–100 de la sortie, pictogrammes main (MANU) et flèches (AUTO) avec la
//    diode du mode établi, touches + et − en manuel ; plaque blanche au nom dessous ; saisie exacte au clavier, validée par Entrée.
const MAIN='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.2 12.6V5.4a1.3 1.3 0 0 1 2.6 0v5.6m0-6.9a1.3 1.3 0 0 1 2.6 0v6.7m0-5.9a1.3 1.3 0 0 1 2.6 0v6.3m0-4.5a1.3 1.3 0 0 1 2.6 0v7.1c0 3.7-2.5 6.2-6 6.2-2.4 0-4-1.1-5.3-3l-2.6-4a1.4 1.4 0 0 1 2.3-1.6l1.1 1.3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const FLECHES='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 9.5A7.5 7.5 0 0 0 5.6 7.4M5 14.5a7.5 7.5 0 0 0 13.4 2.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M5.2 3.6v4.2h4.2M18.8 20.4v-4.2h-4.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function poste(o={}){
  const m=o.mode,a=m&&m.auto===true,ma=m&&m.auto===false,mok=o.modeEnabled!==false;
  const bm=(pic,lab,c,on)=>'<button type="button" class="s13-mode'+(on?' on':'')+'" data-n4-command="'+cmd(c)+'" data-n4-command-name="'+esc(m.nom||o.titre||'')+'" aria-pressed="'+on+'" aria-label="'+esc((o.titre||'')+' : '+lab)+'"'+(mok?'':' disabled')+'><i class="s13-mode-d" aria-hidden="true"></i>'+pic+'<small>'+lab+'</small></button>';
  const modes=m?'<div class="s13-modes" role="group" aria-label="'+esc((o.titre||'')+' : mode')+'">'+bm(MAIN,'MANU',m.cmdManu,ma)+bm(FLECHES,'AUTO',m.cmdAuto,a)+'</div>':'';
  let echelle='',reglage='';
  if(o.k){const v=o.value,connu=Number.isFinite(v),min=o.min,max=o.max,pas=o.pas||1,ok=o.enabled!==false,sortie=Number.isFinite(o.sortie)?o.sortie:v;
    const f=Number.isFinite(sortie)?borne((sortie-min)/(max-min),0,1):null,fc=connu?borne((v-min)/(max-min),0,1):null;
    // Échelle 0–100 de la sortie (poste photographié) ; un poste de consigne en bar ou en °C porte les bornes de sa plage.
    const pc=o.unit==='%',lab=i=>pc?String(i*10):num(min+(max-min)*i/10,(max-min)%2?1:0).replace(/,0$/,'');
    let g='';for(let i=0;i<=10;i++){const y=106-96*i/10;g+='<path d="M'+(i%5===0?16:20)+' '+y+'H26" stroke="#e8e8e2" stroke-width="'+(i%5===0?1:.6)+'"/>'+(i%5===0?'<text x="14" y="'+(y+3)+'" font-size="'+(lab(i).length>3?6.5:8)+'" text-anchor="end" fill="#e8e8e2">'+lab(i)+'</text>':'');}
    echelle='<svg class="s13-poste-ech" viewBox="0 0 44 112" aria-hidden="true"><rect x="0" y="0" width="44" height="112" rx="2" fill="#111211"/>'+g
      +(f!==null?'<rect x="29" y="'+(106-96*f).toFixed(1)+'" width="9" height="'+(96*f).toFixed(1)+'" fill="#e9e3c8" opacity=".85"/>':'')+(fc!==null?'<path d="M26 '+(106-96*fc).toFixed(1)+'H42" stroke="#ff5a3a" stroke-width="2"/>':'')+'</svg>';
    const moins=connu?Math.max(min,Math.round((v-pas)/pas)*pas):null,plus=connu?Math.min(max,Math.round((v+pas)/pas)*pas):null;
    const touche=(lab,val)=>'<button type="button" class="s13-pas" data-n4-command="'+cmd({type:'set',k:o.k,v:val})+'" data-n4-command-name="'+esc(o.label||o.titre)+'"'+(!ok||val===null||val===v?' disabled':'')+' aria-label="'+esc((o.label||o.titre)+' '+lab+' '+num(pas,pas<1?1:0)+' '+(o.unit||''))+'">'+lab+'</button>';
    const dg=o.digits??(pas<1?1:0);   // J6 (96A) : consigne en rampe « courante → cible », comme au 900
    reglage='<div class="s13-poste-r"><span class="s13-poste-v"><b>'+esc((I.enRampe(o.rampe,v)?num(o.rampe,dg)+' → ':'')+num(v,dg))+'</b> '+esc(o.unit||'')+'</span><span class="s13-pastouches">'+touche('+',plus)+touche('−',moins)+'</span>'
      +'<label><input type="number" inputmode="decimal" min="'+min+'" max="'+max+'" step="'+pas+'" value="'+(connu?+v.toFixed((String(pas).split('.')[1]||'').length):'')+'" data-n4-set="'+esc(o.k)+'" aria-label="'+esc(o.label||o.titre)+'"'+(ok?'':' disabled')+'><small>'+esc(ok?(o.note||(num(min,0)+' à '+num(max,0)+' '+(o.unit||'')+' · Entrée')):(o.verrou||'commande indisponible'))+'</small></label></div>';}
  return '<div class="s13-poste'+(o.k?'':' s13-poste-seul')+'"><div class="s13-poste-boite">'+echelle+'<div class="s13-poste-d">'+modes+reglage+'</div></div><span class="s13-plaque-b">'+esc(String(o.titre||'').toUpperCase())+(o.sous?'<small>'+esc(o.sous)+'</small>':'')+'</span></div>';}
// ── Clé d'inhibition (11A) : commutateur HORS / EN de la salle 900 sous sa plaque vert sarcelle, sur un pavé olive (repère 18).
function cle(o={}){const en=o.valeur===true,hors=o.valeur===false,rot=en?45:hors?-45:0;
  const svg='<svg viewBox="0 0 100 92" aria-hidden="true"><text x="21" y="16" font-size="12" font-weight="700" text-anchor="middle" fill="currentColor"'+(hors?'':' opacity=".55"')+'>HORS</text><text x="80" y="16" font-size="12" font-weight="700" text-anchor="middle" fill="currentColor"'+(en?'':' opacity=".55"')+'>EN</text>'
    +'<path d="M30 30L36 36M70 30L64 36" stroke="currentColor" stroke-width="2"/>'
    +'<circle cx="52" cy="59" r="31" fill="#000" opacity=".3"/><circle cx="50" cy="56" r="30" fill="#3f3f3b"/><circle cx="50" cy="56" r="27.6" fill="#bdbdb7"/>'
    +'<circle cx="50" cy="56" r="25.8" fill="none" stroke="#fff" stroke-width="3" opacity=".8" stroke-dasharray="40.5 162" transform="rotate(185 50 56)"/>'
    +'<circle cx="50" cy="56" r="25.8" fill="none" stroke="#262624" stroke-width="3" opacity=".5" stroke-dasharray="40.5 162" transform="rotate(5 50 56)"/>'
    +'<circle cx="50" cy="56" r="22.4" fill="#7a7a74"/><circle cx="50" cy="56" r="20.8" fill="#dcdcd6"/><ellipse cx="42" cy="47" rx="9" ry="5" fill="#fff" opacity=".5" transform="rotate(-35 42 47)"/>'
    +'<g transform="rotate('+rot+' 50 56)"><rect x="46.6" y="35" width="9" height="22" rx="2" fill="#000" opacity=".3"/><rect x="45.5" y="33" width="9" height="22" rx="2" fill="#1d1d1b"/><rect x="46.4" y="34" width="2.2" height="20" rx="1" fill="#fff" opacity=".28"/>'
    +'<rect x="47.8" y="36" width="4.4" height="9" rx="1" fill="#4c4c47"/>'
    +'<rect x="43" y="52" width="14" height="8" rx="1.5" fill="#c7c7c0" stroke="#4d4d48" stroke-width=".6"/><rect x="44" y="52.8" width="12" height="1.8" rx=".8" fill="#fff" opacity=".7"/><path d="M50 60V77" stroke="#3a3a37" stroke-width="2.4" stroke-linecap="round"/></g></svg>';
  return '<div class="s13-cle-o"><span class="s13-plaque">INHIB. '+esc(String(o.titre||'').toUpperCase())+'</span>'+I.cle(Object.assign({},o,{titre:''})).replace(/<svg[\s\S]*?<\/svg>/,()=>svg)+'</div>';}
// ── Capot des SEBIM (12A, repère 28) : capot transparent relevable ; un toucher relève le capot, le second ouvre, le capot retombe
//    seul après 5 s. Capot baissé : aucun ordre possible (le bouton est dessous).
function capot(o={}){const ouvert=!!o.ouvert,ok=o.enabled!==false;
  const bouton='<button type="button" class="s13-capot-b'+(o.actif?' on':'')+'" data-n4-command="'+cmd(o.cmd)+'" data-n4-command-name="'+esc(o.nom||o.label||'')+'" aria-pressed="'+!!o.actif+'"'+(ok&&ouvert?'':' disabled')+(ouvert?'':' tabindex="-1" aria-hidden="true"')+'>'+esc(o.label||'')+'</button>';
  return '<div class="s13-capot-o"><span class="s13-plaque">'+esc(String(o.titre||o.label||'').toUpperCase())+'</span><div class="s13-capot'+(ouvert?' s13-capot-ouvert':'')+'">'+bouton
    +(ouvert?'<span class="s13-capot-releve" aria-hidden="true"></span>':'<button type="button" class="s13-capot-v" data-s13-capot="'+esc(o.id||'capot')+'" aria-label="'+esc('Relever le capot : '+(o.label||''))+'"'+(ok?'':' disabled')+'></button>')
    +'</div><span class="s13-plaque-b">'+esc(ouvert?'capot relevé':'capot baissé')+'</span></div>';}
// ── Paire de boutons lumineux sous plaque noire (19A, repère 9) : MARCHE allumé rouge en service, ARRÊT allumé vert hors service ;
//    mêmes ordres que le pupitre classique (même clé, deux valeurs).
function paire(o={}){const on=o.valeur===true,off=o.valeur===false,ok=o.enabled!==false;
  const b=(lab,v,lent,actif)=>'<button type="button" class="s9-pous s9-l-'+lent+(actif?' s9-pous-on':'')+'" data-n4-command="'+cmd({type:'set',k:o.k,v})+'" data-n4-command-name="'+esc(o.titre||'')+'" aria-pressed="'+actif+'"'+(ok?'':' disabled')+'>'+lab+'</button>';
  return '<div class="s13-paire-o"><span class="s13-plaque-n">'+esc(String(o.titre||'').toUpperCase())+'</span><div class="s9-paire" role="group" aria-label="'+esc(o.titre||'')+'">'+b('MARCHE',true,'rouge',on)+b('ARRÊT',false,'vert',off)+'</div></div>';}
// ── Modules de position des grappes (14A, planche 1 repère 2) : un module noir par groupe, une colonne de diodes rouges par grappe,
//    allumée du haut du cœur jusqu'au bout de la grappe, comme au 900 (retour d'Anthonin du 14/10 au soir : à mi-course, la moitié des
//    diodes allumées, et non plus une seule diode au bout ; à pleine puissance, seule la diode du haut) ;
//    plaque du groupe noire, grise (G1, G2) ou rouge (R) ; compteur de pas à sept segments ; totalisateur sur sa course totale.
//    Positions calculées par le moteur (grappesEtat) ; inconnue : colonne éteinte, compteur à tirets. Les quatre grappes de la VD4 ne
//    sont pas dessinées tant que leur place n'est pas lue.
const RANGS=26;
function modules(g){
  if(!g||!Array.isArray(g.groupes))return '<p class="s13-note">Positions des grappes non reçues.</p>';
  const course=g.course||260,PX=10,PY=6.4,r=2.5,Y0=8,H=Y0*2+RANGS*PY;
  const PLAQUE={R:['#c9271b','#ffffff'],G1:['#b9b9b9','#141414'],G2:['#b9b9b9','#141414']};
  const html=g.groupes.map(gr=>{const n=Array.isArray(gr.grappes)?gr.grappes.length:(Number.isInteger(gr.n)?gr.n:0);if(!n)return '';
    const p=Number.isFinite(gr.pas)?gr.pas:null,f=p===null?null:Math.max(0,Math.min(1,p/course)),k=f===null?-1:Math.round((1-f)*(RANGS-1)),W=n*PX+12;
    let off='',on='',halo='';for(let c=0;c<n;c++){const cx=6+c*PX+PX/2;for(let j=0;j<RANGS;j++){const cy=Y0+j*PY+PY/2,d='M'+(cx-r).toFixed(1)+' '+cy.toFixed(1)+'a'+r+' '+r+' 0 1 0 '+(2*r)+' 0a'+r+' '+r+' 0 1 0 '+(-2*r)+' 0';if(j<=k){on+=d;halo+='M'+(cx-r-1.6).toFixed(1)+' '+cy.toFixed(1)+'a'+(r+1.6)+' '+(r+1.6)+' 0 1 0 '+(2*r+3.2)+' 0a'+(r+1.6)+' '+(r+1.6)+' 0 1 0 '+(-2*r-3.2)+' 0';}else off+=d;}}
    const [bg,fg]=PLAQUE[gr.id]||['#141414','#eeeeea'];
    return '<figure class="s13-mod" role="img" aria-label="'+esc('Groupe '+gr.id+' : '+n+' grappes, '+(p===null?'position inconnue':Math.round(p)+' pas extraits'))+'"><span class="s13-mod-p" style="background:'+bg+';color:'+fg+'">'+esc(gr.id)+'</span>'
      +'<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" aria-hidden="true"><rect width="'+W+'" height="'+H+'" rx="3" fill="#121311"/><path d="'+off+'" fill="#3a0d09" stroke="#1a0604" stroke-width=".5"/>'+(on?'<path d="'+halo+'" fill="#ff3b30" opacity=".28"/><path d="'+on+'" fill="#ff3b30" stroke="#b3140a" stroke-width=".5"/>':'')+'</svg>'
      +'<figcaption>'+I.sept(p===null?'---':String(Math.round(p)),3)+'<small>pas</small></figcaption></figure>';}).join('');
  const tot=Number.isFinite(g.totalisateur)?'<div class="s13-mod-tot"><span>TOTALISATEUR G</span>'+I.sept(String(Math.round(g.totalisateur)),3)+'<span>/ '+esc(g.totalMax||'—')+' pas insérés</span></div>':'';
  return '<div class="s13-mods">'+html+'</div>'+tot;}
return Object.freeze({esc,num,TRAITS,zone,pan,pans,groupe,ligne,diodes,etat,tpl,poste,cle,capot,paire,modules,
  barrette:(l,o)=>I.barrette(l,o),afficheur:o=>I.afficheur(o),voyant:o=>I.voyant(o),poussoir:o=>I.poussoir(o),maintien:o=>I.maintien(o),manipulateur:o=>I.manipulateur(o),sous:(t,c,o)=>I.sous(t,c,o),sept:I.sept});
});
