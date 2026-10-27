// SIMUREP — © 2026 AnthoninP — Tous droits réservés. Salle de commande du 1300 (J2b) : une salle pour le P4 et le P'4.
// Grand QCM de la nuit du 03/10 (plan 2.18, « Salle du 1300 : grand QCM ») : en-tête « PALIER P4 » ou « PALIER P'4 », aucune différence
// inventée (1A) ; disposition de la salle 900, liste de panneaux et mur replié (4C) ; panneaux nommés d'après les titres de la salle de
// Saint-Alban (BARRES FLUX, PRESSURISEUR, TURBOALTERNATEUR, PANNEAU SÛRETÉ) ; un seul KIS en consultation, avec des pages (8a B, 23A),
// qui porte les synoptiques, les fiches d'équipement et les fonctions du KIT du 900 ; le pupitre garde ses traits peints et ses TPL
// (8d : « sans KIS il faut toujours savoir piloter »). Chaque commande du pupitre classique reste atteinte par le même transport et le
// même identifiant (contrat), aucune n'est ajoutée ; au 1300, les deux turbopompes ASG sont distinctes. Moteur d'interaction commun
// aux postes (n4.js) ; pièces communes de la salle 900 (cycle d'acquittement, bandeau d'alarmes, incidents) reprises sans copie ; le journal
// de la tranche est l'écran du KIS (lot 4 ter, 6A du 07/10).
(function(root){'use strict';
const req=n=>typeof module==='object'&&module.exports?require(n):null;
const common=req('./n4.js')||root.SDCN4,I=req('./instruments-900.js')||root.SDC900Instruments,S9=req('./salle-900.js')||root.SDC900,
  P=req('./pupitre-1300.js')||root.SDC1300Pupitre,KIS=req('./kis-1300.js')||root.SDC1300KIS,ENR=req('./enregistreur-1300.js')||root.SDC1300Enregistreur;
const {esc,num}=I,C9=S9.commun;
const PAGES={barres:'Barres-flux',pressuriseur:'Pressuriseur',eauvapeur:'Eau-vapeur',turbo:'Turboalternateur',surete:'Panneau de sûreté',electricite:'Électricité et source froide',kis:'KIS',alarmes:'Alarmes',incidents:'Incidents (simulateur)',formation:'Aide & missions'};
// Écrans natifs du châssis, ouverts depuis le KIS : pages du moteur d'interaction sans entrée de menu.
Object.assign(PAGES,{instrumentation:'KIS · neutronique et KRT',coeur:'KIS · carte calculée',pt:'KIS · domaine P/T'});
const SOUS_KIS=['instrumentation','coeur','pt'],ORDRE=['barres','pressuriseur','eauvapeur','turbo','surete','electricite','kis','alarmes','incidents','formation'];
const NAV=ORDRE.map(id=>[id,PAGES[id]]);
// J3 (passe 3, 2A) : zones des panneaux du 1300 citées par les consignes et la ligne du guide ; « Montrer » par la lecture commune.
const ZONES={'Grappes · régulation de température':'barres:RGL','Position des grappes':'barres:GRP','État de tranche':'barres:ETAT','Pression primaire':'pressuriseur:RCP',
  'Bore et appoint':'pressuriseur:REA','Générateurs de vapeur · eau alimentaire':'eauvapeur:ARE','Isolement vapeur':'eauvapeur:VVP','Contournement vapeur':'eauvapeur:GCT',
  'Alimentation de secours des GV':'eauvapeur:ASG','Turbine et charge':'turbo:GRE','Condenseur':'turbo:CVI','Injection de sécurité':'surete:RIS',
  'Aspersion enceinte et recirculation':'surete:EAS','Inhibitions · protection réacteur et automatismes':'surete:RPR','Alimentations électriques':'electricite:LH',
  'Source froide et auxiliaires':'electricite:CRF','Arrêt d’urgence et réarmement':'electricite:AAR'};
const cibles=t=>C9.ciblesTexte(t,PAGES,ZONES);
const st=d=>d&&d.state||{};
const set=(k,v)=>({type:'set',k,v});
const unite=v=>Number.isFinite(v)?v:null;
const mode=v=>v===true?true:v===false?false:null;
const modeTxt=(v,auto,manu)=>v===auto?true:v===manu?false:null;
// Position établie d'un matériel sur un TPL : 1 = service (circuit fermé), 0 = repos, null = inconnue.
const idx=(v,service=true)=>v===service?1:v===!service?0:null,b=v=>v===true?true:v===false?false:null;
const MA=k=>[{lettre:'A',label:'à l’arrêt',cmd:set(k,false)},{lettre:'M',label:'en marche',cmd:set(k,true)}];
// Manettes des TPL (9A) : position laissée par le joueur, par clé du moteur ; prise à l'état reçu à la première lecture et à chaque
// passage en MANU, et tenue sur l'état tant que le TPL est verrouillé (régulation en AUTO). Affichage seulement, remis à zéro au montage.
const MANETTE={},ACTIF={};
function tpl(o,etat){const k=o.positions[1].cmd.k,actif=o.enabled!==false;
  if(MANETTE[k]===undefined||MANETTE[k]===null||!actif||ACTIF[k]===false)MANETTE[k]=etat;ACTIF[k]=actif;
  return P.tpl(Object.assign({},o,{etat,manette:MANETTE[k]}));}
// Capot des SEBIM (12A) : relevé par un toucher, retombe seul après 5 s.
const CAPOT={ouvert:false,jusqua:0};
const capotOuvert=()=>CAPOT.ouvert&&Date.now()<CAPOT.jusqua;
// ══ ALARMES (13A du grand QCM, répartition proposée en planche le 04/10, à faire valider par Anthonin) : les urgentes sur verrines
//    rouges, en matrices en tête de leur section (bordeaux éteintes, rose-rouge allumées, « D » sur les mêmes huit qu'au 900) ; les
//    autres sur la page Alarmes du KIS, en jaune (action différable), blanc (automatisme) ou vert (sauvegarde, protection, déclenchement
//    de charge), à l'heure du moteur, avec historique. Répartition : choix d'après les quatre couleurs du document IPSN de 1996 sur le
//    1300 (matrice SDC § 15.6), pas un relevé des verrines réelles. Un seul cycle d'acquittement pour les deux (1A du point d'arrêt).
const URGENTES={barres:['aOver','aAu','aDecouv','aDmg'],pressuriseur:['aThot','aPzrHi','aPzrLo','aGmpp','aSebim','aDom','aDilu'],eauvapeur:['aGvLo','aGvHi','aDry','aAre'],surete:['aIS','aPenc','aEncF','aRecirc'],electricite:['aReseau','aH3','aRri','aSec','aCrf','aRra']};
const URG=new Set(Object.values(URGENTES).flat());
const KIS_COUL=Object.assign({},...['aXe','aMan','aPT','aPvap','aSvGv','aRejA','aTpa','aVide','aCvi','aRdp','aPtr','aKhy','aActP','aActV','aActE','aH2'].map(id=>({[id]:'jaune'})),
  ...['aGct','aGcta'].map(id=>({[id]:'blanc'})),...['aAsg','aEasOn','aIso','aViv','aDiesel','aLls','aIlot','aInhib','aBlkIS','aAcc'].map(id=>({[id]:'vert'})));
const niveau13=v=>!v||!v.etat?'':URG.has(v.id)?'rouge':(KIS_COUL[v.id]||'jaune');
// Cycle d'acquittement propre à la salle (1A du point d'arrêt : même cycle qu'au 900), niveaux du 1300.
const CY=C9.cycle(niveau13);
// Historique des alarmes (13A) : apparitions, disparitions et acquittements, à l'heure du moteur ; affichage seulement.
const HIST=[];
function nourrir13(verrines,t){const init=CY.A.init,avant=Object.fromEntries(Object.entries(CY.A.etats).map(([k,e])=>[k,e.mode]));CY.nourrir(verrines,t);if(!init)return;
  for(const [k,e] of Object.entries(CY.A.etats)){const m0=avant[k]||'repos';if(m0!==e.mode&&(e.mode==='nouvelle'||e.mode==='disparue'))HIST.unshift({t:Number.isFinite(t)?t:null,id:k,type:e.mode==='nouvelle'?'apparition':'disparition',niveau:e.niveau||niveau13({id:k,etat:'x'})});}
  if(HIST.length>200)HIST.length=200;}
function acquitter13(t){const n=CY.acquitter();if(n)HIST.unshift({t:Number.isFinite(t)?t:null,id:'',type:'acquittement',n});if(HIST.length>200)HIST.length=200;return n;}
// Verrine rouge du 1300 : bordeaux éteinte, rose-rouge allumée ; essai des lampes : toutes allumées.
function verrine13(v){const e=CY.A.etats[v.id]||{mode:'repos'},essai=CY.essai(),mode=essai?'acquittee':e.mode,lit=mode!=='repos',d=S9.D.has(v.id);
  const dit=mode==='repos'?'éteinte':mode==='nouvelle'?'nouvelle, à acquitter':mode==='disparue'?'disparue, à acquitter':'présente, acquittée';
  return '<div class="s9-v s13-v" data-mode="'+mode+'" data-niveau="'+(lit?'rouge':'')+'"'+(d?' data-d="1"':'')+' role="img" aria-label="'+esc(v.txt+(d?' (D)':'')+' : '+dit)+'">'+(d?C9.DSVG:'')+'<span>'+esc(v.txt.toUpperCase())+'</span></div>';}
// Matrice d'une section (1B du 04/10 : « ça fait légèrement vide ») : douze fenêtres au moins, six par rangée en tête de panneau et
// trois au mur ; les fenêtres de réserve sont en verre éteint, sans libellé, comme sur un tableau d'alarmes réel. Aucune alarme ajoutée.
function matrice13(page,d,titre){const par=Object.fromEntries((d.verrines||[]).map(v=>[v.id,v])),ids=(URGENTES[page]||[]).filter(id=>par[id]);if(!ids.length)return '';
  const vs=ids.map(id=>verrine13(par[id])),n=Math.max(12,Math.ceil(vs.length/6)*6);while(vs.length<n)vs.push('<b class="s9-v-libre" aria-hidden="true"></b>');
  return '<section class="s13-mat" aria-label="'+esc('Verrines · '+(titre||PAGES[page]))+'"><h4>'+esc(String(titre||PAGES[page]).toUpperCase())+'</h4><div class="s13-mat-g">'+vs.join('')+'</div></section>';}
const tousMur=d=>'<div class="s13-mur-mat">'+Object.keys(URGENTES).map(p=>matrice13(p,d)).join('')+'</div>';
// Liste des alarmes du KIS (13A) : présentes ou à acquitter, hors verrines urgentes, avec leur couleur, leur seuil et leur état.
const TT=t=>Number.isFinite(t)?'T+'+String(Math.floor(t/3600)).padStart(2,'0')+':'+String(Math.floor(t/60%60)).padStart(2,'0')+':'+String(Math.floor(t%60)).padStart(2,'0'):'—';
function alarmesKis(d){const par=Object.fromEntries((d.verrines||[]).map(v=>[v.id,v])),L=[];
  for(const [id,e] of Object.entries(CY.A.etats)){if(URG.has(id)||e.mode==='repos'||!par[id])continue;L.push({id,txt:par[id].txt,niveau:KIS_COUL[id]||'jaune',seuil:par[id].etat==='rouge'?'détecté':par[id].etat==='orange'?'détecté':'',mode:e.mode,t:TT(e.t)});}
  L.sort((a,b)=>b.t.localeCompare(a.t));const c=CY.compte();
  return {liste:L,historique:HIST.slice(0,40).map(h=>({t:TT(h.t),type:h.type,txt:h.id?(par[h.id]&&par[h.id].txt)||h.id:(h.n+' alarme'+(h.n>1?'s':'')),urgente:URG.has(h.id),niveau:h.niveau||''})),comptes:{urgentes:c.rouge||0,jaune:c.jaune||0,blanc:c.blanc||0,vert:c.vert||0,aAcquitter:c.nouvelle+c.disparue}};}
const note=t=>'<p class="s13-note">'+esc(t)+'</p>';
const {pan,pans}=P;
// ══ PANNEAUX (titres de la salle de Saint-Alban ; matière du pupitre de Paluel 1 : plaques mastic vissées, organes entiers par plaque)
function barres(d,on,enrZ=''){const s=st(d),manu=s.auto===false,au=!!s.scram;
  const rgl=P.zone({titre:'Grappes · régulation de température',cle:'RGL'},
    pans(pan(P.manipulateur({titre:'Régulation grappes · RGL',sous:'groupe R',groupe:'R',embout:'noir',mode:{auto:mode(s.auto),cmdAuto:set('auto',true),cmdManu:set('auto',false),nom:'Régulation grappes'},modeEnabled:on,k:'rod',label:'Extraction du groupe R',value:unite(s.rod),min:0,max:100,pas:.5,enabled:on&&manu&&!au,verrou:au?'arrêt d’urgence : grappes au fond':'en AUTO, en production, les grappes règlent la température jusqu’en butée'}))
      +pan(P.barrette([{label:'P neutronique',value:Number.isFinite(s.Pn)?s.Pn*100:null,min:0,max:120,pas:20,unit:'% PN',digits:1,tag:'#e7dcc0'}])+P.afficheur({label:'Puissance thermique',value:d.powerThermal,unit:'MWth',cases:4})+'<button type="button" class="s13-vers-kis" data-s13-kis="flash">KIS · FLASH ›</button>',{titre:'Puissance'})));
  const grp=P.zone({titre:'Position des grappes',cle:'GRP',large:true},pans(pan(P.modules(d.grappes),{classe:'s13-pan-large'})));
  const etats=P.zone({titre:'État de tranche',cle:'ETAT',large:true},pans(pan('<div class="s9-paire s9-etats" role="group" aria-label="État de tranche">'+['RP','ANGV','ANRRA','APIF','APIO','APR','RCD'].map(e=>P.poussoir({label:{ANGV:'AN/GV',ANRRA:'AN/RRA',APIF:'API fermé',APIO:'API ouvert'}[e]||e,cmd:{type:'etat',e},actif:s.etat===e,enabled:on,nom:'État de tranche'})).join('')+'</div>'
    +note('Choisir un état lointain enchaîne les transitions et s’arrête à la première refusée, avec son motif.'),{titre:'État visé'})));
  return '<div class="s13-pupitre"><div class="s13-cols"><div class="s13-col">'+rgl+'</div><div class="s13-col">'+etats+enrZ+'</div></div>'+grp+'</div>';}
function pressuriseur(d,on,enrZ=''){const s=st(d),pzrM=s.pzrAuto===false,nb=(d.pal&&d.pal.NB)||4;
  const pzr=P.zone({titre:'Pression primaire',cle:'RCP'},
    pans(pan(P.poste({titre:'Régulation pression',sous:'chaufferettes et aspersion',mode:{auto:mode(s.pzrAuto),cmdAuto:set('pzrAuto',true),cmdManu:set('pzrAuto',false),nom:'Régulation pression'},modeEnabled:on})+P.afficheur({label:'Consigne de pression',value:s.pzrSet,unit:'bar',digits:1}))
      +pan(P.capot({id:'sebim',titre:'Soupapes du pressuriseur',label:s.sebimM?'FERMETURE':'OUVERTURE',cmd:set('sebimM',!s.sebimM),actif:!!s.sebimM,enabled:on,ouvert:capotOuvert(),nom:'Ouverture volontaire des soupapes du pressuriseur'})+P.afficheur({label:'Niveau RDP',value:Number.isFinite(s.rdp)?s.rdp*100:null,unit:'%',cases:3})))
    +pans(pan(tpl({titre:'Chaufferettes',nom:'Chaufferettes',positions:MA('heatM'),enabled:on&&pzrM,verrou:'en AUTO',materiel:b(s.heat)},pzrM?idx(s.heatM):idx(s.heat))
      +tpl({titre:'Aspersion',nom:'Aspersion',positions:MA('sprayM'),enabled:on&&pzrM,verrou:'en AUTO',materiel:b(s.spray)},pzrM?idx(s.sprayM):idx(s.spray))),{ligne:'autre'})
    +pans(pan(P.barrette([{label:'P pressuriseur',value:s.Ppzr,min:0,max:180,pas:30,unit:'bar',digits:1,tag:'#e9e3d0'},{label:'T moyenne',value:s.Tavg,min:250,max:350,pas:20,unit:'°C',digits:1,tag:'#e9e3d0'},{label:'T branche chaude',value:d.tempHot,min:250,max:350,pas:20,unit:'°C',digits:1,tag:'#e9e3d0'},{label:'T branche froide',value:d.tempCold,min:250,max:350,pas:20,unit:'°C',digits:1,tag:'#e9e3d0'}])+P.afficheur({label:'GMPP en marche',value:s.gmppN,unit:'/ '+nb,cases:2}))));
  const rea=P.zone({titre:'Bore et appoint',cle:'REA'},pans(pan(P.maintien({k:'bori',label:'◄ BORICATION',actif:!!s.bori,enabled:on&&!(s.dilu&&!s.bori)})+P.maintien({k:'dilu',label:'DILUTION ►',actif:!!s.dilu,enabled:on&&!(s.bori&&!s.dilu)}),{titre:'Appoint'}))
    +pans(pan(P.afficheur({label:'Bore primaire',value:s.boreTotal,unit:'ppm',sens:s.bori===true?'▲':s.dilu===true?'▼':''})+P.afficheur({label:'Effluents vers TEP',value:s.effl,unit:'m³',digits:1})+P.afficheur({label:'Xénon',value:Number.isFinite(s.Xe)?s.Xe*100:null,unit:'% éq.'})+note('Arrêter la borication avant de diluer, et inversement.'))));
  return '<div class="s13-pupitre"><div class="s13-cols"><div class="s13-col">'+pzr+'</div><div class="s13-col">'+rea+enrZ+'</div></div></div>';}
function eauvapeur(d,on,enrZ=''){const s=st(d),areM=s.areAuto===false;
  const are=P.zone({titre:'Générateurs de vapeur · eau alimentaire',cle:'ARE'},
    pans(pan(P.poste({titre:'Régulation ARE',sous:'vanne principale',mode:{auto:mode(s.areAuto),cmdAuto:set('areAuto',true),cmdManu:set('areAuto',false),nom:'Régulation ARE'},modeEnabled:on,k:'areM',label:'Demande ARE (MANU)',value:unite(areM?s.areM:s.areOut),sortie:s.areOut,min:0,max:100,pas:1,unit:'%',enabled:on&&areM,verrou:'en AUTO, la régulation tient le niveau'}))
      +pan(P.etat({label:'Turbopompe alimentaire',on:b(s.tpaRun)})+P.afficheur({label:'Débit ARE',value:s.areOut,unit:'%',cases:3})),{ligne:'are',haut:true})
    +pans(pan(P.barrette([{label:'Niveau GV',value:s.gv,min:0,max:100,pas:20,unit:'%',digits:1,alarme:{de:0,a:12},tag:'#c9d6e2'},{label:'P vapeur GV',value:s.Psteam,min:0,max:100,pas:20,unit:'bar',digits:1,tag:'#c9d6e2'}]))));
  const viv=P.zone({titre:'Isolement vapeur',cle:'VVP'},pans(pan(tpl({titre:'Vannes VIV',nom:'VIV',positions:[{lettre:'F',label:'fermées',cmd:set('viv',false)},{lettre:'O',label:'ouvertes',cmd:set('viv',true)}],enabled:on},idx(s.viv)))
    +pan(P.afficheur({label:'Pression vapeur',value:s.Psteam,unit:'bar',digits:1})+P.afficheur({label:'T vapeur GV',value:s.tVapGV,unit:'°C',cases:3})),{ligne:'vapeur'}));
  const gct=P.zone({titre:'Contournement vapeur',cle:'GCT'},
    pans(pan(P.poste({titre:'Consigne de pression vapeur',k:'gctTgt',label:'Consigne de pression vapeur',value:unite(s.gctTgt),rampe:s.gctSet,sortie:s.Psteam,min:8,max:85,pas:.5,unit:'bar',enabled:on,note:'8 à 85 bar · rampe 28 °C/h'}))
    +pan(P.poste({titre:'GCT condenseur',mode:{auto:modeTxt(s.gctMode,'auto','manu'),cmdAuto:set('gctMode','auto'),cmdManu:set('gctMode','manu'),nom:'GCT-C'},modeEnabled:on,k:'gctM',label:'Ouverture GCT-C (MANU)',value:unite(s.gctMode==='manu'?s.gctM:(s.gct||0)*100),sortie:(s.gct||0)*100,min:0,max:100,pas:1,unit:'%',enabled:on&&s.gctMode==='manu',verrou:'en AUTO, ouverture sur la consigne'}))
    +pan(P.poste({titre:'GCT atmosphère',mode:{auto:modeTxt(s.gctaMode,'auto','manu'),cmdAuto:set('gctaMode','auto'),cmdManu:set('gctaMode','manu'),nom:'GCTa'},modeEnabled:on,k:'gctaM',label:'Ouverture GCTa (MANU)',value:unite(s.gctaMode==='manu'?s.gctaM:(s.gctA||0)*100),sortie:(s.gctA||0)*100,min:0,max:100,pas:1,unit:'%',enabled:on&&s.gctaMode==='manu',verrou:'en AUTO, au-dessus de la consigne'})),{ligne:'vapeur',haut:true}));
  const asg=P.zone({titre:'Alimentation de secours des GV',cle:'ASG'},
    pans(pan(['A','B'].map(v=>tpl({titre:'Motopompe '+v,nom:'Motopompe '+v,positions:MA('mps'+v),enabled:on,...(C9.nonAlimentee(s,'mps'+v)?{alerte:'non alimentée',materiel:false}:{})},idx(s['mps'+v]))).join(''))   // J6 (96A) : sans tension, « non alimentée » et diode verte, jamais rouge
      +pan(['A','B'].map(v=>tpl({titre:'Turbopompe '+v,nom:'Turbopompe '+v,positions:MA('tps'+v),enabled:on,...(C9.sansVapeur(s,'tps'+v)?{alerte:'sans vapeur',materiel:false}:{})},idx(s['tps'+v]))).join('')),{ligne:'asg'})   // J6, 2b (150A) : sans vapeur, comme la motopompe sans tension
    +pans(pan(P.etat({label:'Vapeur auxiliaire SVA',on:b(s.svaOn)}))+pan(P.barrette([{label:'Bâche ASG',value:Number.isFinite(s.bacheASG)?s.bacheASG*100:null,min:0,max:100,pas:20,unit:'%',digits:0,tag:'#f3c2a8'},{label:'Débit ASG',value:Number.isFinite(s.asg)?s.asg*100:null,min:0,max:12,pas:2,unit:'% nominal',digits:1,tag:'#f3c2a8'}])))
    +note('Deux motopompes électriques et deux turbopompes entraînées par la vapeur des GV. Dans SIMUREP, arrêter la dernière pompe bloque le démarrage automatique sur niveau GV très bas jusqu’à une remise en service manuelle ; d’autres automatismes peuvent encore donner un ordre de marche.'));
  return '<div class="s13-pupitre"><div class="s13-cols"><div class="s13-col">'+are+viv+enrZ+'</div><div class="s13-col">'+gct+asg+'</div></div></div>';}
function turbo(d,on,enrZ=''){const s=st(d);
  const gre=P.zone({titre:'Turbine et charge',cle:'GRE'},pans(pan(P.poste({titre:'Consigne de charge',k:'turbSet',label:'Consigne de charge',value:unite(s.turbSet),sortie:s.turb,min:0,max:100,pas:1,unit:'%',enabled:on}))
    +pan('<div class="s9-paire s9-pentes" role="group" aria-label="Pente de charge">'+[[.05,'0,05'],[.2,'0,2'],[.6,'0,6'],[1.2,'1,2']].map(([v,l])=>P.poussoir({label:l+' %/s',sous:Math.round(v*60)+' %/min',cmd:set('turbRate',v),actif:s.turbRate===v,enabled:on,nom:'Pente de charge'})).join('')+'</div>',{titre:'Pente de charge'})
    )+pans(pan(P.poussoir({label:'Suivre le réseau',sous:d.follow?'suivi actif':'suivi coupé',cmd:{type:'action',id:'bSuivre'},actif:d.follow===true,enabled:on,lent:'vert'}),{titre:'Réseau'})
    +pan(P.afficheur({label:'P électrique',value:s.Pelec,unit:'MWe',cases:4})+P.afficheur({label:'P vapeur GV',value:s.Psteam,unit:'bar',digits:1})))
    +pans(pan(P.barrette([{label:'Admission turbine',value:s.turb,min:0,max:100,pas:20,unit:'%',digits:1,tag:'#e2d9bf'},{label:'P admission HP',value:s.Padm,min:0,max:80,pas:20,unit:'bar',digits:1,tag:'#e2d9bf'}]),{titre:'Admission'})));
  const cvi=P.zone({titre:'Condenseur',cle:'CVI'},pans(pan(P.barrette([{label:'P condenseur',value:Number.isFinite(s.Pcond)?s.Pcond*1000:null,min:0,max:200,pas:40,unit:'mbar',digits:0,tag:'#e2d9bf'}])+P.etat({label:'Extraction des incondensables',on:b(s.cvi)}))));
  return '<div class="s13-pupitre"><div class="s13-cols"><div class="s13-col">'+gre+'</div><div class="s13-col">'+cvi+enrZ+'</div></div></div>';}
function surete(d,on,enrZ=''){const s=st(d);
  const ris=P.zone({titre:'Injection de sécurité',cle:'RIS'},pans(pan(P.paire({titre:'Injection moyenne pression',k:'ishp',valeur:b(s.ishp),enabled:on})+P.paire({titre:'Injection basse pression',k:'isbp',valeur:b(s.isbp),enabled:on})))
    +pans(pan(tpl({titre:'Accumulateurs',nom:'Isolement des accumulateurs',positions:[{lettre:'F',label:'isolés',cmd:set('accIso',true)},{lettre:'O',label:'alignés',cmd:set('accIso',false)}],enabled:on},idx(s.accIso,false)))
      +pan(tpl({titre:'Blocage signal IS',nom:'Blocage du signal IS',positions:[{lettre:'N',label:'normal',cmd:set('isBlk',false)},{lettre:'B',label:'bloqué',cmd:set('isBlk',true)}],enabled:on},idx(s.isBlk))),{ligne:'autre'})
    +pans(pan(P.voyant({label:'Signal IS',on:!!s.sigIS,couleur:'rouge'})+P.poussoir({label:'Réarmer IS',cmd:{type:'action',id:'bRearmIS'},enabled:on&&!!s.sigIS,actif:!!s.sigIS,lent:'ambre',sous:s.sigIS?'signal présent':'aucun signal'}),{titre:'Signal IS'})
    )+pans(pan(P.barrette([{label:'Accumulateurs',value:s.accu,min:0,max:100,pas:20,unit:'%',digits:0,tag:'#e9e3d0'},{label:'Inventaire primaire',value:s.inv,min:0,max:120,pas:20,unit:'%',digits:0,tag:'#e9e3d0'},{label:'P enceinte',value:s.Penc,min:0,max:5,pas:1,unit:'bar',digits:2,tag:'#e9e3d0',echelleDecimales:1},{label:'Bâche PTR',value:Number.isFinite(s.ptr)?s.ptr*100:null,min:0,max:100,pas:20,unit:'%',digits:0,tag:'#e9e3d0'},{label:'H2 enceinte',value:s.h2,min:0,max:10,pas:2,unit:'% vol',digits:1,tag:'#e9e3d0'}]),{titre:'Grandeurs de sûreté'})));
  const eas=P.zone({titre:'Aspersion enceinte et recirculation',cle:'EAS'},pans(pan(P.paire({titre:'Aspersion enceinte',k:'eas',valeur:b(s.eas),enabled:on}))+pan(P.etat({label:'Recirculation',on:b(s.recirc)})+P.voyant({label:'Isolement enceinte',on:!!s.isoEnc,couleur:'ambre'}),{titre:'Enceinte'})));
  const kis='<div class="s13-vers-kis-l"><button type="button" class="s13-vers-kis" data-s13-kis="surete">KIS · Sûreté ›</button><span>Grandeurs de sûreté et ébulliomètre sur la page Sûreté du KIS.</span></div>';
  const INH=[['aarInhib','Arrêt automatique (AAR)'],['inhIsoE','Isolement enceinte'],['inhIsoV','Isolement vapeur (VIV)'],['inhIS','Signal IS'],['inhEAS','EAS automatique'],['inhASG','ASG automatique'],['inhKrt','Isolement VVP (KRT)']];
  const inh=P.zone({titre:'Inhibitions · protection réacteur et automatismes',cle:'RPR',large:true},pans(INH.map(([k,l])=>pan(P.cle({titre:l,nom:l,k,valeur:s[k],enabled:on}),{olive:true})).join(''))
    +note('Les inhibitions ne sont pas réinitialisées par la mise à l’état ; chaque ordre inhibé est consigné au journal.'));
  return kis+'<div class="s13-pupitre"><div class="s13-cols"><div class="s13-col">'+ris+'</div><div class="s13-col">'+eas+enrZ+'</div></div>'+inh+'</div>';}
function electricite(d,on,enrZ=''){const s=st(d);
  const lh=P.zone({titre:'Alimentations électriques',cle:'LH'},pans(pan(P.etat({label:'Réseau extérieur',on:s.reseau===false?false:s.reseau===true?true:null})+P.etat({label:'Diesels LHP/LHQ',on:b(s.diesel)})+P.etat({label:'Ultime secours',on:b(s.lls)}),{titre:'Sources'})
    +pan(P.voyant({label:'Îlotage',on:!!s.ilote,couleur:'ambre'})+P.voyant({label:'Perte totale (H3)',on:!!s.h3,couleur:'rouge'}),{titre:'Situations'}))
    +pans(pan(P.afficheur({label:'Production nette',value:s.Pelec,unit:'MWe',cases:4})))
    +note('Tableaux secourus LHA et LHB ; les pertes de sources se commandent depuis la page Incidents (simulateur).'));
  const src={mer:'mer',estuaire:'estuaire',fleuve:'fleuve, circuit ouvert',tour:'fleuve et aéroréfrigérants'}[s.srcType]||'—';
  const sf=P.zone({titre:'Source froide et auxiliaires',cle:'CRF'},pans(pan('<div class="s13-src">Source froide du site : <b>'+esc(src)+'</b></div>'+'<div class="s9-paire s9-saisons" role="group" aria-label="Saison">'+[['hiver','Hiver'],['mi','Mi-saison'],['ete','Été']].map(([v,l])=>P.poussoir({label:l,cmd:set('saison',v),actif:s.saison===v,enabled:on,nom:'Saison'})).join('')+'</div>',{titre:'Saison'}))
    +pans(pan(P.poste({titre:'Température de la source froide',k:'Tsrc',label:'Température de la source froide',value:unite(s.Tsrc),min:2,max:30,pas:.5,unit:'°C',enabled:on}))
    +pan(P.etat({label:'Circulation CRF',on:b(s.crf)})+P.etat({label:'Eau brute SEC',on:b(s.sec)})+P.etat({label:'Réfrigération RRI',on:b(s.rri)})+P.etat({label:'RRA raccordé',on:b(s.rra)}),{titre:'Circuits'})));
  const au=P.zone({titre:'Arrêt d’urgence et réarmement',cle:'AAR'},pans(pan(P.poussoir({label:'ARRÊT D’URGENCE',cmd:{type:'scram'},enabled:on,lent:'rouge',classe:'s9-pous-au',nom:'Arrêt d’urgence'}))
    +pan(P.poussoir({label:'Réarmer',sous:s.scram?'réacteur arrêté':'réacteur réarmé',cmd:{type:'rearm'},enabled:on&&!!s.scram,actif:!!s.scram,lent:'ambre',nom:'Réarmement'}))));
  return '<div class="s13-pupitre"><div class="s13-cols"><div class="s13-col">'+lh+sf+'</div><div class="s13-col">'+au+enrZ+'</div></div></div>';}
// ══ KIS : état d'affichage (page, système choisi), gardé entre les rafraîchissements.
const KISV={page:'syn-primaire',sys:'',equip:'',case:''};
// Zone du pupitre visée depuis une fiche du KIS (« Commander au pupitre › ») : éclairée 1,6 s ; retour proposé vers le KIS.
const VISEE={cle:'',jusqua:0},RETOUR={page:''};
function viser(html){if(!VISEE.cle||Date.now()>=VISEE.jusqua)return html;return html.replace('data-s9-zone="'+VISEE.cle+'"','data-s9-zone="'+VISEE.cle+'" data-visee="1"');}
const lentille=v=>!v||!v.etat?'':v.etat==='rouge'?'rouge':S9.BLANC.has(v.id)?'blanc':'orange';
function niveauSys(ids,d){const par=Object.fromEntries((d.verrines||[]).map(v=>[v.id,v]));let n=0,haut='';for(const id of ids){const L=lentille(par[id]);if(L){n++;if(L==='rouge'||(L==='orange'&&haut!=='rouge')||(L==='blanc'&&!haut))haut=L;}}return {n,haut};}
function contenu(ui,d,H){const on=ui.connected;
  if(SOUS_KIS.includes(ui.page))return KIS.natif(d,ui.page,PAGES[ui.page].replace(/^KIS · /,''));
  if(ui.page==='formation')return '<div class="s9-formation"><div data-n4-live-slot="formation" class="n4-live-slot" aria-label="Aide et missions"></div></div>';
  if(ui.page==='kis')return KIS.rendu(d,KISV,{alarmes:()=>alarmesKis(d),niveau:niveauSys,courbe:large=>H.courbe(d,large,ui.curves),options:()=>H.curveOptions(ui),metriques:common.CURVE_METRICS});
  if(ui.page==='alarmes')return C9.commandesAlarmes(false,CY)+'<h3 class="s9-h3">Verrines rouges · alarmes urgentes</h3>'+tousMur(d)+'<div class="s13-vers-kis-l"><button type="button" class="s13-vers-kis" data-s13-kis="alarmes">KIS · Alarmes ›</button><span>Les autres alarmes, en jaune, blanc ou vert, sur la page Alarmes du KIS.</span></div>'+KIS.journalEcran(d);
  if(ui.page==='incidents')return C9.incidents(d,on);
  // Verrines rouges de la section en tête du panneau (13A : « en matrices en tête de section ») ; enregistreur numérique du panneau
  // (16A : un par panneau), carré, logé dans la colonne la plus courte (04/10).
  const f={barres,pressuriseur,eauvapeur,turbo,surete,electricite}[ui.page];if(!f)return '';const m=matrice13(ui.page,d);
  const enrZ=P.zone({titre:'Enregistreur',cle:'ENR',classe:'s13-zone-enr'},pans(pan(ENR.rendu(ui.page,enr(ui.page),d.enregistreur),{classe:'s13-pan-enr'})));
  return (m?'<div class="s13-tete-mat">'+m+'</div>':'')+f(d,on,enrZ);}
// Enregistreurs : état de chaque appareil (voies, vue, fenêtre, historique), gardé entre les pages ; remis à zéro au montage.
const ENRS={};
const enr=page=>ENRS[page]||(ENRS[page]=ENR.etatNeuf(page));
// ══ LA SALLE
const MUR={ouvert:false,store:null,cle:'simurep_sdc_1300_mur_v1'};
function etatMur(c){const allumees=c.rouge||0,kis=(c.jaune||0)+(c.blanc||0)+(c.vert||0),acq=c.nouvelle+c.disparue;return (acq?acq+' à acquitter · ':'')+(allumees?allumees+(allumees>1?' verrines allumées':' verrine allumée'):'aucune verrine allumée')+(kis?' · '+kis+' au KIS':'');}
const courant=(id,page)=>id===page||(id==='kis'&&SOUS_KIS.includes(page));
function render(ui,data,H){if(courant('kis',ui.page))RETOUR.page='';return viser(rendu(ui,data,H));}
// Afficheur de la puissance électrique (18A, planche 1 repère 13 : « 1339 » rouge au-dessus du fer à cheval) : la production nette reçue
// du moteur, en MWe, toujours visible sur le bandeau du mur. Lot 4 ter (Anthonin, 07/10) : la barre verte est retirée, « juste un bel
// affichage de MW bien fier » : grands chiffres rouges dans une fenêtre noire sous verre, cadre d'acier, unité gravée.
function puissance(data){const s=data.state||{},pel=Number.isFinite(s.Pelec)?Math.max(0,Math.round(s.Pelec)):null;
  return '<span class="s13-mw" role="img" aria-label="'+esc('Puissance électrique : '+(pel===null?'inconnue':pel+' MWe'))+'"><span class="s13-mw-f">'+I.sept(pel===null?'----':String(pel),4)+'</span><small>MWe</small></span>';}
function rendu(ui,data,H){
  const {escape:e,number,horloge,ligneVersion,etatCourt=v=>v,missionBar=()=>'',simulationControls,navigation=()=>'',temoins=()=>'',sortiesMenu=()=>''}=H,s=data.state||{},palier=s.pal==="P'4"?"P'4":'P4',palierLib=palier.replace("'",'’');   // revue du visible (22/10) : « P’4 » à l'écran, la clé dans data-palier
  const page=(id,label,extra='')=>'<button type="button" data-n4-page="'+id+'" '+extra+'>'+label+'</button>';
  const scram='<button type="button" class="n4-scram" data-n4-command="'+e(JSON.stringify({type:'scram'}))+'"'+(ui.connected?'':' disabled')+'>ARRÊT D’URGENCE</button>';
  const k=CY.klaxon(),c=CY.compte();
  return '<div class="n4-sdc s9-sdc s13-sdc" data-page="'+e(ui.page)+'" data-palier="'+e(palier)+'">'+(ui.published?'':'<div class="n4-study">ESSAI PRIVÉ · SALLE 1300 <span>palier '+e(palierLib)+'</span></div>')
    +'<header class="n4-header s9-entete">'+navigation(ui)+'<div class="n4-unit"><strong>'+e(ui.site.toUpperCase())+' · TRANCHE&nbsp;'+e(ui.unitLabel||ui.unit)+'</strong><span>PALIER '+e(palierLib)+'</span></div>'+temoins(data)+'<div class="n4-brand"><b>SIMUREP</b><span>Le simulateur du parc électronucléaire français</span>'+ligneVersion(ui)+'</div><details class="n4-session"><summary>Simulation <span>'+horloge(data.simulationTime)+' · ×'+(s.accel||1)+'</span></summary>'+simulationControls(ui,data)+'</details></header>'
    +'<div class="n4-quickbar s9-quickbar"><span class="s9-etat"><b>'+e(etatCourt(data.stateLabel)||'—')+'</b>'+(C9.ETATS[data.stateLabel]?' '+C9.ETATS[data.stateLabel]:'')+(data.targetState&&data.targetState!==data.stateLabel?' · état visé '+e(etatCourt(data.targetState)):'')+'</span>'+'<span class="s13-mw-tel">'+puissance(data)+'</span>'+C9.commandesAlarmes(true,CY)+scram+'</div>'
    +'<div class="n4-command-status" data-active="'+!!ui.status+'" role="status">'+e(ui.status||'')+'</div>'
    // Mur replié par défaut (4C) : verrines ; son choix est gardé dans le navigateur du joueur.
    +'<details class="s9-mur-volet"'+(MUR.ouvert?' open':'')+'><summary><b>Mur · verrines</b><span>'+etatMur(c)+'</span>'+puissance(data)+'<i>'+(MUR.ouvert?'Replier':'Déplier')+'</i></summary>'
    +'<div class="s9-mur" aria-label="Mur de la salle : verrines rouges"><div class="s9-mur-ver s13-mur-ver">'+tousMur(data)+'</div></div></details>'
    +'<div class="s9-salle"><nav class="n4-page-keys s9-keys" aria-label="Panneaux de la salle">'+NAV.map(([id,label])=>page(id,label,'aria-current="'+(courant(id,ui.page)?'page':'false')+'"')).join('')+'</nav>'
    +'<section class="s9-panneau" aria-label="'+e(PAGES[ui.page]||'')+'"><div class="s9-panneau-t"><h2>'+e(PAGES[ui.page]||'')+'</h2>'+(RETOUR.page==='kis'&&!courant('kis',ui.page)?'<button type="button" class="s9-pous s9-l-blanc s9-retour" data-s13-retour="kis">‹ KIS</button>':'')+'</div>'+missionBar(ui,data,{montrer:cibles,attribut:'data-s13-montrer'})+'<div class="n4-main-content s9-main">'+contenu(ui,data,H)+'</div></section></div>'
    +'<footer class="n4-desk-footer"><span>Salle de commande · palier '+e(palierLib)+'</span><span>© 2026 AnthoninP · SIMUREP</span></footer>'
    +'<nav class="n4-thumb-dock s9-dock" aria-label="Navigation au pouce"><button type="button" data-n4-menu="toggle" aria-expanded="'+!!ui.menu+'">Panneaux</button>'+page('alarmes','Alarmes'+(c.nouvelle+c.disparue?' <b class="s9-dock-n">'+(c.nouvelle+c.disparue)+'</b>':''),'class="s9-dock-al'+(k?' s9-dock-k':'')+'"')+'<button type="button" class="s9-dock-acq s9-l-vert" data-s9="acquitter" data-on="'+k+'"'+(k?'':' aria-disabled="true"')+'>Acquitter</button>'+scram.replace('ARRÊT D’URGENCE</button>','Arrêt<br>d’urgence</button>')+'</nav>'
    +(ui.menu?'<div class="n4-thumb-menu"><div><b>Panneaux de la salle</b><button type="button" data-n4-menu="toggle">Fermer</button></div><nav>'+NAV.map(([id,label])=>page(id,label,'aria-current="'+(courant(id,ui.page)?'page':'false')+'"')).join('')+'</nav>'+sortiesMenu(ui)+'</div>':'')
    +'</div>';}
// Écrans natifs ouverts dans le KIS (neutronique et KRT, carte du cœur, domaine P/T) : écran plat clair du KIS (17A) ; Aide & missions
// garde l'habillage crème des salles conventionnelles, repris de la salle 900 (règles « formation » de sa feuille, sans copie).
const KIS_NATIF=`
body.n4-native{background:#f4f7f8!important;color:#1f3741!important;font:14px/1.5 system-ui,"Segoe UI",Arial,sans-serif!important}
#n4-native-root .card,#n4-native-root #easyCard,#n4-native-root #easyLex{background:#ffffff!important;color:#1f3741!important;border:1px solid #c3d0d6!important;border-radius:3px!important}
#n4-native-root h2{background:#1e3e4d!important;color:#eef7fa!important;border:0!important;font:600 14px system-ui,Arial,sans-serif!important;letter-spacing:.04em;padding:6px 10px!important}
#n4-native-root .val,#n4-native-root .bilan td:last-child{background:#f4f7f8!important;border:1px solid #c3d0d6!important;color:#0f3b52!important;font:700 14px "DIN Alternate","Bahnschrift",system-ui,Arial,sans-serif!important}
#n4-native-root .k,#n4-native-root .bilan td,#n4-native-root label{color:#3d5560!important}
#n4-native-root .note,#n4-native-root .msg{color:#5b717b!important}
#n4-native-root .row{border-bottom:1px solid #e3e9ec}
#n4-native-root button,#n4-native-root select{background:#e9eff2!important;color:#1e3e4d!important;border:1px solid #8ea4ae!important;border-radius:3px!important;font:600 12.5px system-ui,Arial,sans-serif!important}
#n4-native-root button.on{background:#1e3e4d!important;color:#eff9fc!important;border-color:#1e3e4d!important}
#n4-native-root #coreDetail{background:#eef4f6!important;color:#1f3741!important;border-color:#c3d0d6!important}
#n4-native-root #secSock{--sk-fond:#f4f7f8;--sk-grille:#dde6ea;--sk-encre:#1f3741;--sk-pale:#5b717b;--sk-zone:#c0d7df;--sk-actif:#7fc2ad;--sk-bord:#1e6e57;--sk-sat:#1e3e4d;--sk-gv:#b5651d;--sk-rra:#1f6fb2;--sk-pompe:#7a4fa0;--sk-rp:#285d77;--sk-hors:#c0261e;--sk-trace:#c27a1a;--sk-ok:#1e7a58}
#n4-native-root #sockSvg{border:1px solid #c3d0d6}
`;
const styleNatif=KIS_NATIF+S9.styleNatif.split('\n').filter(l=>l.includes('formation')).join('\n');
// Pompes ASG nommées dans les accusés : au 1300, deux motopompes et deux turbopompes distinctes.
// Retour d'Anthonin (copie d'essai, 14/10 au soir) : on arrive dans la salle sur le KIS, son synoptique centré à l'écran.
const app=common.createProfile({palier:'P4',pages:PAGES,nav:NAV,synoptics:[],pageInitiale:'kis',selectionInitiale:null,render,pompesAsg:{mpsA:'Motopompe ASG A',mpsB:'Motopompe ASG B',tpsA:'Turbopompe ASG A',tpsB:'Turbopompe ASG B'}},null,null);
const mount0=app.mount;
function mount(host,options={}){
  for(const k of Object.keys(ENRS))delete ENRS[k];CY.reset();KISV.page='syn-primaire';KISV.sys='';KISV.equip='';KISV.case='';VISEE.cle='';RETOUR.page='';for(const k of Object.keys(MANETTE))delete MANETTE[k];for(const k of Object.keys(ACTIF))delete ACTIF[k];CAPOT.ouvert=false;CAPOT.jusqua=0;let store=null;try{store=host.ownerDocument&&host.ownerDocument.defaultView&&host.ownerDocument.defaultView.localStorage;}catch(_){}MUR.store=store;try{MUR.ouvert=!!store&&store.getItem(MUR.cle)==='1';}catch(_){MUR.ouvert=false;}
  HIST.length=0;let dernier=options.snapshot||{};nourrir13(dernier.verrines,dernier.simulationTime);
  const inst=mount0(host,options),up=inst.update,sent=C9.sentinelle(host);   // J6 2c (178A) : retour fixé seulement en-tête sorti
  // Téléphone (retours d'Anthonin, 14/10 au soir) : le dessin du KIS, plus large que l'écran, s'ouvre centré (une fois par dessin, puis
  // le joueur le fait défiler) ; l'onglet ouvert d'une rangée défilante est ramené au milieu de sa rangée. Affichage seul.
  function caler(){if(!host.querySelectorAll)return;
    for(const v of host.querySelectorAll('.s13-k-synvue')){const svg=v.querySelector('svg'),cle=svg&&svg.getAttribute('aria-label')||'',marge=v.scrollWidth-v.clientWidth;
      if(marge>1&&v.__centre!==cle&&!v.hasAttribute('data-n4-pince-zoom')){v.__centre=cle;v.scrollLeft=marge/2;}}
    // J6, client 2 (101A) : le repère « › » d'une rangée d'onglets ne s'affiche que s'il reste des onglets à droite.
    for(const r of host.querySelectorAll('.s13-kis-rang'))finRang(r);
    for(const r of host.querySelectorAll('.s13-kis-rang')){const b=r.querySelector('[aria-current=page]'),cle=b?b.textContent:'';if(r.__actif===cle)continue;r.__actif=cle;
      if(!b||r.scrollWidth<=r.clientWidth+1)continue;const rr=r.getBoundingClientRect(),bb=b.getBoundingClientRect();r.scrollLeft+=bb.left+bb.width/2-(rr.left+rr.width/2);}}
  function finRang(r){r.toggleAttribute('data-fin',r.scrollLeft+r.clientWidth>=r.scrollWidth-1);}
  function rangDefile(ev){const r=ev.target;if(r&&r.classList&&r.classList.contains('s13-kis-rang'))finRang(r);}
  host.addEventListener('scroll',rangDefile,true);
  function redessiner(){up(dernier);caler();sent.guetter();}
  inst.update=function(snapshot){dernier=snapshot||{};nourrir13(dernier.verrines,dernier.simulationTime);up(dernier);caler();sent.guetter();};
  caler();
  // Manette d'un TPL (9A) : écoutée avant l'envoi de l'ordre par le moteur commun (phase de capture), pour que le rendu qui suit
  // l'ordre montre déjà la manette tournée ; le matériel, lui, ne change qu'à l'état reçu.
  function manette(ev){const t=ev.target&&ev.target.closest&&ev.target.closest('[data-s13-manette]');if(!t||t.disabled)return;if(ev.type==='keydown'&&!['Enter',' '].includes(ev.key))return;
    const [k,v]=String(t.getAttribute('data-s13-manette')).split(':');if(k&&(v==='0'||v==='1'))MANETTE[k]=Number(v);}
  host.addEventListener('click',manette,true);
  const w=()=>host.ownerDocument&&host.ownerDocument.defaultView;
  // « Commander au pupitre › » (8c A) : le panneau où le matériel se commande, la zone éclairée 1,6 s, « ‹ KIS » pour revenir.
  function aller(cible,montre){const [page,cle]=String(cible).split(':');if(!PAGES[page])return;RETOUR.page=!montre||courant('kis',inst.getState().page)?'kis':'';VISEE.cle=cle||'';VISEE.jusqua=Date.now()+1600;inst.selectPage(page);sent.guetter(true);
    const z=cle&&host.querySelector&&host.querySelector('[data-s9-zone="'+cle+'"]');(z||host.querySelector&&host.querySelector('.s9-panneau'))?.scrollIntoView?.({block:'start',behavior:'smooth'});
    if(w())w().setTimeout(redessiner,1700);}
  // J6 2c (139A) : comme au 900, l'élément de la salle touché est lu à la capture, avant que le poste redessine l'encart.
  const TOUCHES='[data-s9],[data-s13-kis],[data-s13-kis-sys],[data-s13-capot],[data-s13-equip],[data-s13-aller],[data-s13-montrer],[data-s13-retour],[data-s13-case],[data-s13-enr]';
  function touche(ev){ev.__s13=ev.target&&ev.target.closest?ev.target.closest(TOUCHES):null;}
  function clic(ev){caler();const t=ev.target&&ev.target.closest&&ev.target.closest(TOUCHES);if(!t||!host.contains(t)||('__s13' in ev&&ev.__s13!==t))return;
    if(ev.type==='keydown'&&!['Enter',' '].includes(ev.key))return;if(ev.type==='keydown')ev.preventDefault();
    if(t.hasAttribute('data-s13-kis')){const p=t.getAttribute('data-s13-kis')||'syn-primaire';if(p!==KISV.page){KISV.equip='';KISV.sys='';KISV.case='';}KISV.page=p;if(inst.getState().page!=='kis')inst.selectPage('kis');else redessiner();return;}
    if(t.hasAttribute('data-s13-equip')){KISV.equip=t.getAttribute('data-s13-equip')||'';redessiner();const f=host.querySelector&&host.querySelector('.s13-k-fiche');if(f&&w()&&w().matchMedia&&w().matchMedia('(max-width:760px)').matches)f.scrollIntoView?.({block:'nearest',behavior:'smooth'});return;}
    if(t.hasAttribute('data-s13-aller')){aller(t.getAttribute('data-s13-aller'));return;}
    if(t.hasAttribute('data-s13-montrer')){aller(t.getAttribute('data-s13-montrer'),true);return;}
    if(t.hasAttribute('data-s13-case')){KISV.case=t.getAttribute('data-s13-case')||'';redessiner();return;}
    if(t.hasAttribute('data-s13-enr')){const [pg,a,v]=String(t.getAttribute('data-s13-enr')).split(':');if(PAGES[pg]&&ENR.action(enr(pg),a,v))redessiner();return;}
    if(t.hasAttribute('data-s13-retour')){RETOUR.page='';inst.selectPage('kis');host.querySelector&&host.querySelector('.s9-panneau')?.scrollIntoView?.({block:'start'});return;}
    if(t.hasAttribute('data-s13-kis-sys')){KISV.sys=t.getAttribute('data-s13-kis-sys')||'';redessiner();host.querySelector&&host.querySelector('.s9-panneau')?.scrollIntoView?.({block:'start'});return;}
    if(t.hasAttribute('data-s13-capot')){CAPOT.ouvert=true;CAPOT.jusqua=Date.now()+5000;redessiner();const w=host.ownerDocument&&host.ownerDocument.defaultView;if(w)w.setTimeout(()=>{if(Date.now()>=CAPOT.jusqua){CAPOT.ouvert=false;redessiner();}},5100);return;}
    const a=t.getAttribute('data-s9');
    if(a==='acquitter'){acquitter13(dernier.simulationTime);redessiner();return;}
    if(a==='essai'){CY.A.essai=Date.now()+3000;redessiner();const w=host.ownerDocument&&host.ownerDocument.defaultView;if(w)w.setTimeout(redessiner,3100);}}
  function mur(ev){const t=ev.target;if(!t||!t.classList||!t.classList.contains('s9-mur-volet'))return;if(MUR.ouvert===!!t.open)return;MUR.ouvert=!!t.open;try{MUR.store&&MUR.store.setItem(MUR.cle,MUR.ouvert?'1':'0');}catch(_){}redessiner();}
  host.addEventListener('toggle',mur,true);host.addEventListener('click',touche,true);host.addEventListener('keydown',touche,true);host.addEventListener('click',clic);host.addEventListener('keydown',clic);
  const destroy=inst.destroy;inst.destroy=function(){host.removeEventListener('scroll',rangDefile,true);host.removeEventListener('click',manette,true);host.removeEventListener('click',touche,true);host.removeEventListener('keydown',touche,true);host.removeEventListener('click',clic);host.removeEventListener('keydown',clic);host.removeEventListener('toggle',mur,true);sent.fin();destroy();};
  inst.alarmes=()=>({klaxon:CY.klaxon(),etats:JSON.parse(JSON.stringify(CY.A.etats)),compte:CY.compte()});
  inst.acquitter=()=>{const n=acquitter13(dernier.simulationTime);redessiner();return n;};
  inst.manettes=()=>JSON.parse(JSON.stringify(MANETTE));
  inst.kis=()=>JSON.parse(JSON.stringify(KISV));inst.aller=aller;
  return inst;}
const salle=Object.assign({},app,{mount,cibles,ZONES,PAGES,NAV,styleNatif,URGENTES,KIS_COUL});
if(typeof module==='object'&&module.exports)module.exports=salle;else root.SDC1300=salle;
})(typeof globalThis!=='undefined'?globalThis:this);
