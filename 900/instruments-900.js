// SIMUREP — © 2026 AnthoninP — Tous droits réservés. Organes et instruments de la salle 900 (J2b), dessin seul.
// Références : photos de Gravelines 5 (30/09/2026) et témoignage d'Anthonin, matrice SDC § 15.2 (TPL, indicateurs verticaux,
// afficheurs, verrines) ; poste de réglage d'après la photo du pupitre de Paluel 1 (§ 18.2, H7) ; transposition 2D pour PC et
// téléphone, sans marque ni repère interne. Aucune loi moteur : chaque organe porte la commande JSON du poste (data-n4-*) ou
// lit une valeur reçue ; une valeur inconnue s'affiche « — ». Aucun dégradé ni filtre SVG par identifiant : un même dessin
// peut figurer deux fois dans la page (mur et panneau), et une référence vers un exemplaire masqué ne se peindrait pas.
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.SDC900Instruments=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=(v,d=1)=>Number.isFinite(v)?v.toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d}):'—';
const cmd=c=>esc(JSON.stringify(c));
const borne=(x,a,b)=>Math.max(a,Math.min(b,x));
// ── Indicateurs verticaux en barrette (I1 ; 8A du 03/10) : boîtier noir commun, faces blanches légèrement bombées, graduations
//    et chiffres noirs, index rouge ; étiquette de couleur au-dessus, plaque blanche au nom dessous, valeur chiffrée sous la
//    plaque (aide de lecture du jeu ; l'appareil réel n'en porte pas). L'unité est sur la plaque, jamais sur l'échelle.
function cadran(o){
  const min=Number.isFinite(o.min)?o.min:0,max=Number.isFinite(o.max)&&o.max>min?o.max:min+100,v=o.value,connu=Number.isFinite(v);
  const haut=12,bas=112,h=bas-haut,pas=Number.isFinite(o.pas)?o.pas:(max-min)/5,n=Math.max(1,Math.round((max-min)/pas)),sous=o.sous||2;
  let g='';
  for(let i=0;i<=n*sous;i++){const y=bas-h*i/(n*sous),maj=i%sous===0;
    g+='<path d="M'+(maj?24:28)+' '+y.toFixed(1)+'H36" stroke="#151515" stroke-width="'+(maj?1:.6)+'"/>';
    if(maj)g+='<text x="19.5" y="'+(y+2.6).toFixed(1)+'" font-size="7.4" text-anchor="end" fill="#151515">'+esc(num(min+(max-min)*i/(n*sous),o.echelleDecimales||0))+'</text>';}
  if(o.alarme&&Number.isFinite(o.alarme.de)){const a=borne(((o.alarme.a??max)-min)/(max-min),0,1),b=borne((o.alarme.de-min)/(max-min),0,1);
    g+='<rect x="35.5" y="'+(bas-h*a).toFixed(1)+'" width="2.6" height="'+(h*Math.abs(a-b)).toFixed(1)+'" fill="#c8261f"/>';}
  const y=connu?bas-h*borne((v-min)/(max-min),0,1):null;
  // Index rouge sur la bande des graduations, pointe vers les chiffres sans les couvrir.
  const index=connu?'<path d="M22 '+(y+1.1).toFixed(1)+'L37 '+(y-.2).toFixed(1)+'V'+(y+2).toFixed(1)+'Z" fill="#000" opacity=".2"/><path d="M21 '+y.toFixed(1)+'L37 '+(y-1).toFixed(1)+'V'+(y+1).toFixed(1)+'Z" fill="#b92318"/><path d="M27 '+(y-.3).toFixed(1)+'L37 '+(y-.6).toFixed(1)+'" stroke="#f26951" stroke-width=".4"/>':'';
  return '<svg viewBox="0 0 42 124" aria-hidden="true"><rect x="0" y="0" width="42" height="124" rx="1.6" fill="#111514"/><path d="M1 122V1H41" stroke="#59605a" stroke-width=".6" fill="none"/>'
    +'<rect x="3" y="3" width="36" height="118" rx=".5" fill="#d4d6cc"/><path d="M3 3H39L36 9H7Z" fill="#9a9f95"/><path d="M3 3L7 9V115L3 121Z" fill="#f2f1e8"/><path d="M39 3L36 9V115L39 121Z" fill="#b9bfb1"/>'
    +'<rect x="7" y="9" width="29" height="106" fill="#f6f5ef"/><path d="M7 115V9H36" fill="none" stroke="#6d7566" stroke-width=".8" stroke-opacity=".6"/>'
    +g+'<path d="M37 9V115" stroke="#555e52" stroke-width=".6"/><path d="M37.8 9V116" stroke="#fff" stroke-width=".5"/>'+index
    +'<path d="M3 121L7 115H36L39 121Z" fill="#eeeee4"/><path d="M4 5L6 10V112L4 119Z" fill="#fff" opacity=".4"/><path d="M7 10H36V13H7Z" fill="#000" opacity=".06"/><path d="M8 14L12 13L8 49Z" fill="#fff" opacity=".16"/></svg>';
}
function barrette(liste,o={}){
  const L=(liste||[]).filter(Boolean);if(!L.length)return '';
  return '<div class="s9-barr'+(o.classe?' '+o.classe:'')+'" role="group" aria-label="'+esc(o.titre||'Indicateurs')+'">'+L.map(m=>{const connu=Number.isFinite(m.value),t=(m.label||'Mesure')+' : '+(connu?num(m.value,m.digits??1):'inconnue')+(m.unit?' '+m.unit:'');
    return '<figure class="s9-ind" role="img" aria-label="'+esc(t)+'"><i class="s9-ind-tag" style="--tag:'+esc(m.tag||'#d9cfae')+'"></i>'+cadran(m)
      +'<figcaption><span class="s9-ind-nom">'+esc(m.label||'')+'</span><span class="s9-ind-u">'+esc(m.unit||'')+'</span></figcaption><b class="s9-ind-v">'+esc(num(m.value,m.digits??1))+'</b></figure>';}).join('')+'</div>';
}
const indicateur=o=>barrette([o]);
// ── Afficheur numérique (9A du 03/10) : chiffres rouges à sept segments dessinés, segments éteints visibles, fenêtre noire,
//    plaque blanche dessous. Valeur inconnue : tirets.
const SEG7={'0':'abcdef','1':'bc','2':'abged','3':'abgcd','4':'fgbc','5':'afgcd','6':'afgedc','7':'abc','8':'abcdefg','9':'abcdfg','-':'g'};
function segments(x,y,w,h){
  const t=2.1,g=.45,m=h/2,P=a=>a.map(p=>p[0].toFixed(2)+','+p[1].toFixed(2)).join(' ');
  const hz=yy=>[[x+g+t/2,yy],[x+g+t,yy-t/2],[x+w-g-t,yy-t/2],[x+w-g-t/2,yy],[x+w-g-t,yy+t/2],[x+g+t,yy+t/2]];
  const vt=(xx,y0,y1)=>[[xx,y0+g+t/2],[xx+t/2,y0+g+t],[xx+t/2,y1-g-t],[xx,y1-g-t/2],[xx-t/2,y1-g-t],[xx-t/2,y0+g+t]];
  return {a:P(hz(y)),g:P(hz(y+m)),d:P(hz(y+h)),f:P(vt(x,y,y+m)),b:P(vt(x+w,y,y+m)),e:P(vt(x,y+m,y+h)),c:P(vt(x+w,y+m,y+h))};
}
// J6 (96A) : o.ambre allume les segments en ambre ; o.fleche (▲ ou ▼) ajoute une case de tendance à droite, comme la 2.17 en borication.
function sept(texte,cases,o={}){
  const cs=[];for(const ch of String(texte)){if(ch===','||ch==='.'){if(cs.length)cs[cs.length-1].p=true;continue;}if(/\s/.test(ch))continue;cs.push({c:ch==='—'?'-':ch,p:false});}
  while(cs.length<(cases||0))cs.unshift({c:' ',p:false});
  const L=13,H=26;let on='',off='';
  cs.forEach((d,i)=>{const x=5+i*L,s=segments(x,4,8.5,17),lit=SEG7[d.c]||'';for(const k of 'abcdefg'){const p='<polygon points="'+s[k]+'"/>';if(lit.includes(k))on+=p;else off+=p;}
    // 2A du 12/10 : virgule décimale sur les afficheurs, comme dans les textes ; le point et sa queue s'allument ensemble.
    const cx=x+11.2,pt='<path data-v="1" d="M'+(cx-1.2).toFixed(2)+' 21.4a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0ZM'+(cx+1.15).toFixed(2)+' 21.5L'+(cx+.4).toFixed(2)+' 24.9L'+(cx-.5).toFixed(2)+' 24.6L'+(cx-.05).toFixed(2)+' 22.5Z"/>';if(d.p)on+=pt;else off+=pt;});
  const fl=o.fleche==='▲'||o.fleche==='▼'?o.fleche:'',xf=5+cs.length*L,w=8+(cs.length+(fl?1:0))*L;
  if(fl)on+='<polygon data-fleche="'+fl+'" points="'+(fl==='▲'?[[xf+4.25,7.5],[xf+8.5,18.5],[xf,18.5]]:[[xf,7.5],[xf+8.5,7.5],[xf+4.25,18.5]]).map(p=>p.join(',')).join(' ')+'"/>';
  return '<svg viewBox="0 0 '+w+' '+H+'" width="'+(w*1.35).toFixed(0)+'" height="'+(H*1.35).toFixed(0)+'" aria-hidden="true"'+(o.ambre?' style="filter:drop-shadow(0 0 2px #ffb23c99)"':'')+'><g transform="translate(2.4 0) skewX(-6)"><g fill="'+(o.ambre?'#241503':'#1f0504')+'">'+off+'</g><g fill="'+(o.ambre?'#ffb23c':'#ff3a24')+'">'+on+'</g></g></svg>';
}
// J6 (96A) : o.sens (▲ ou ▼, borication ou dilution maintenue) passe l'afficheur en ambre avec sa flèche, comme la 2.17.
function afficheur(o={}){
  const d=o.digits??0,connu=Number.isFinite(o.value),txt=connu?o.value.toFixed(d).replace('.',','):'----',sens=o.sens==='▲'?', en hausse':o.sens==='▼'?', en baisse':'';
  return '<div class="s9-aff" role="img" aria-label="'+esc((o.label||'')+' : '+(connu?num(o.value,d):'inconnue')+' '+(o.unit||'')+sens)+'"><span class="s9-aff-f">'+sept(txt,Math.max(o.cases||4,txt.replace(/[,.]/g,'').length),sens?{ambre:true,fleche:o.sens}:{})+'</span><small><b>'+esc(o.label||'')+'</b>'+(o.unit?' <i>'+esc(o.unit)+'</i>':'')+'</small></div>';
}
// ── Voyant de signalisation : lampe ronde sous enjoliveur chromé, plaque gravée. Vert en service, ambre demandé ou dégradé,
//    rouge défaut, éteint sinon.
function voyant(o={}){const c=o.on?(o.couleur||'vert'):'eteint';return '<span class="s9-voy s9-voy-'+c+'" role="img" aria-label="'+esc((o.label||'Voyant')+' : '+(o.on?'allumé':'éteint'))+'"><i></i><span>'+esc(o.label||'')+'</span></span>';}
// ── TPL « tourner-pousser lumineux » (T1, T2 ; 6A et 6 ter A du 03/10) : grande pastille au nom du matériel, enjoliveur chromé,
//    manette dont la flèche pointe la lettre de la position établie : repos à 9 h, service à 12 h, quart de tour (photos de
//    Gravelines 5 ; lettres selon le matériel). Capuchon ivoire : la manette reste où on la met ; orange : impulsion. Au jeu, pas
//    de « pousser » (Anthonin, 03/10) : toucher le TPL donne l'ordre de l'autre position, le retoucher le défait. L'ordre part de
//    l'état reçu (aucune mutation optimiste). Couleur de voie seulement là où elle est connue : A saumon, B turquoise.
const VOIE={A:['#f1bfa9','#e39a7d'],B:['#4cb8ac','#33998e'],'':['#f1ebdc','#e1d4b6']};
// J6 (96A) : o.alerte (motopompe ASG commandée sans alimentation) remplace l'état établi, sur fond ambre, lampe éteinte : jamais « en
// marche ». Même plaquette au TPL du 1300 (ALERTE_AMBRE).
const ALERTE_AMBRE='background:#ffb23c;color:#3a2000;border-radius:2px;padding:0 3px';
const arc9=(r,deb,ang,coul,ep,op)=>{const c=2*Math.PI*r;return '<circle cx="50" cy="63" r="'+r+'" fill="none" stroke="'+coul+'" stroke-width="'+ep+'" opacity="'+op+'" stroke-dasharray="'+(c*ang/360).toFixed(1)+' '+c.toFixed(1)+'" transform="rotate('+deb+' 50 63)"/>';};
function tpl(o={}){
  const P=o.positions||[],r=P[0]||{},s=P[1]||{},k=s.actif?1:r.actif?0:-1,cible=k===1?r:s,service=k===1;
  const fond=VOIE[o.voie||''],cap=o.cap==='orange'?'#e8861c':'#ece6d4';
  const tache='<path d="M22 40l12-3m27 43l10-2m-18-54l6-1" stroke="#fff" stroke-width=".45" opacity=".22"/>';
  const nom=String(o.titre||'').toUpperCase(),mots=nom.split(' '),lignes=[];for(const m of mots){const l=lignes[lignes.length-1];if(l&&(l+' '+m).length<=12)lignes[lignes.length-1]=l+' '+m;else lignes.push(m);}
  const taille=Math.min(7,64/(Math.max(...lignes.slice(0,2).map(l=>l.length))*.62));
  const texte=lignes.slice(0,2).map((l,i)=>'<text x="50" y="'+(lignes.length>1?20+i*7.6:24)+'" font-size="'+taille.toFixed(2)+'" font-weight="700" text-anchor="middle" fill="#221a14">'+esc(l)+'</text>').join('');
  const lettre=(x,y,t)=>'<text x="'+x+'" y="'+y+'" font-size="9" font-weight="700" text-anchor="middle" fill="#221a14">'+esc(t||'')+'</text>';
  const allume=service&&o.allume!==false&&!o.alerte;
  const svg='<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="51" r="47" fill="'+fond[0]+'" stroke="#6d1b26" stroke-width="1.6"/>'+tache+texte
    +lettre(50,40,s.lettre)+lettre(22,66,r.lettre)+(o.voie?lettre(77,85,o.voie):'')
    // Rendu réaliste (04/10) : pastille bombée (reflet doux, bord ombré), enjoliveur chromé (arc éclairé en haut à gauche, arc ombré en
    // bas à droite, ombre portée), manette à reflet. Calques et opacités seulement (aucun dégradé par identifiant).
    +'<ellipse cx="38" cy="30" rx="26" ry="15" fill="#fff" opacity=".15" transform="rotate(-28 38 30)"/><circle cx="50" cy="51" r="45.6" fill="none" stroke="#000" stroke-width="2.4" opacity=".1"/>'
    +'<circle cx="51.6" cy="65.2" r="19" fill="#000" opacity=".28"/><circle cx="50" cy="63" r="18.5" fill="#55554f"/><circle cx="50" cy="63" r="17" fill="#c4c4be"/>'
    +arc9(15.9,185,95,'#ffffff',2.4,.85)+arc9(15.9,5,95,'#2c2c29',2.4,.5)+'<circle cx="50" cy="63" r="14.6" fill="#8e8e88"/><circle cx="50" cy="63" r="13.6" fill="#e4e4df"/>'
    +'<circle cx="50" cy="63" r="12" fill="'+cap+'" stroke="#5e5240" stroke-width=".6"/><ellipse cx="45.5" cy="58.5" rx="6" ry="3.4" fill="#fff" opacity=".45" transform="rotate(-35 45.5 58.5)"/>'
    // Lampe de la manette : allumée blanche en service (3B du 04/10 : « en réalité la lumière est blanche »).
    +'<g transform="rotate('+(service?90:0)+' 50 63)">'+(allume?'<rect x="35" y="57.6" width="30" height="10.8" rx="2.5" fill="#eaf3ff" opacity=".7"/>':'')
    +'<rect x="38.2" y="60.9" width="26" height="7" rx="1.3" fill="#000" opacity=".25"/><rect x="37" y="59.5" width="26" height="7" rx="1.3" fill="'+(allume?'#ffffff':'#d8d8d2')+'" stroke="#4d4d48" stroke-width=".6"/>'
    +'<rect x="37.8" y="'+(service?'64.2':'60.1')+'" width="24.4" height="1.4" rx=".7" fill="#fff" opacity=".8"/><path d="M39.5 63L44.2 60.4V62.1H60.5V63.9H44.2V65.6Z" fill="#141414"/></g></svg>';
  const etat=o.alerte||(k>=0?(P[k].label||''):(o.etat||'position inconnue')),vu=o.enabled===false&&o.etat?o.etat:etat;
  return '<button type="button" class="s9-tpl'+(service?' s9-tpl-service':'')+'" data-n4-command="'+cmd(cible.cmd)+'" data-n4-command-name="'+esc(cible.nom||o.nom||o.titre||'')+'" aria-pressed="'+service+'" aria-label="'+esc((o.titre||'')+' : '+etat+(o.enabled===false?(o.etat?' ('+o.etat+')':''):'. Toucher : '+(cible.label||'')))+'"'+(o.enabled===false?' disabled':'')+'>'+svg+'<span class="s9-tpl-etat"'+(o.alerte&&vu===o.alerte?' style="'+ALERTE_AMBRE+'"':'')+'>'+esc(vu)+'</span></button>';
}
// ── Commutateur à clé des inhibitions (11A du grand QCM du 1300 ; 11 bis A : aussi aux salles 900) : barillet chromé, clé tournée
//    vers HORS (inhibition levée) ou vers EN (inhibition en service) ; un toucher tourne la clé vers l'autre position, par la même
//    commande que le pupitre classique (aucune mutation optimiste : la clé suit l'état reçu). Plaque titre fournie par le panneau.
function cle(o={}){
  const en=o.valeur===true,hors=o.valeur===false,ok=o.enabled!==false,cible=!en,rot=en?45:hors?-45:0;
  const svg='<svg viewBox="0 0 100 92" aria-hidden="true"><text x="21" y="16" font-size="12" font-weight="700" text-anchor="middle" fill="currentColor"'+(hors?'':' opacity=".55"')+'>HORS</text><text x="80" y="16" font-size="12" font-weight="700" text-anchor="middle" fill="currentColor"'+(en?'':' opacity=".55"')+'>EN</text>'
    +'<path d="M30 30L36 36M70 30L64 36" stroke="currentColor" stroke-width="2"/>'
    // Rendu réaliste (04/10) : barillet chromé, clé noire à reflet, ombres portées (dessin repris à l'identique au 1300).
    +'<circle cx="52" cy="59" r="31" fill="#000" opacity=".3"/><circle cx="50" cy="56" r="30" fill="#3f3f3b"/><circle cx="50" cy="56" r="27.6" fill="#bdbdb7"/>'
    +'<circle cx="50" cy="56" r="25.8" fill="none" stroke="#fff" stroke-width="3" opacity=".8" stroke-dasharray="40.5 162" transform="rotate(185 50 56)"/>'
    +'<circle cx="50" cy="56" r="25.8" fill="none" stroke="#262624" stroke-width="3" opacity=".5" stroke-dasharray="40.5 162" transform="rotate(5 50 56)"/>'
    +'<circle cx="50" cy="56" r="22.4" fill="#7a7a74"/><circle cx="50" cy="56" r="20.8" fill="#dcdcd6"/><ellipse cx="42" cy="47" rx="9" ry="5" fill="#fff" opacity=".5" transform="rotate(-35 42 47)"/>'
    +'<g transform="rotate('+rot+' 50 56)"><rect x="46.6" y="35" width="9" height="22" rx="2" fill="#000" opacity=".3"/><rect x="45.5" y="33" width="9" height="22" rx="2" fill="#1d1d1b"/><rect x="46.4" y="34" width="2.2" height="20" rx="1" fill="#fff" opacity=".28"/>'
    +'<rect x="47.8" y="36" width="4.4" height="9" rx="1" fill="#4c4c47"/>'
    +'<rect x="43" y="52" width="14" height="8" rx="1.5" fill="#c7c7c0" stroke="#4d4d48" stroke-width=".6"/><rect x="44" y="52.8" width="12" height="1.8" rx=".8" fill="#fff" opacity=".7"/><path d="M50 60V77" stroke="#3a3a37" stroke-width="2.4" stroke-linecap="round"/></g></svg>';
  return '<button type="button" class="s9-cle'+(en?' s9-cle-en':'')+'" data-n4-command="'+cmd({type:'set',k:o.k,v:cible})+'" data-n4-command-name="'+esc(o.nom||o.titre||'')+'" aria-pressed="'+en+'" aria-label="'+esc((o.titre||'')+' : '+(en?'EN, inhibition en service':hors?'HORS, inhibition levée':'position inconnue')+(ok?'. Toucher : '+(cible?'EN':'HORS'):''))+'"'+(ok?'':' disabled')+'>'+svg+'<span class="s9-cle-t">'+esc(o.titre||'')+'</span></button>';
}
// ── Poste de réglage (6 bis A du 03/10, photo du pupitre de Paluel 1) : plaque titrée, échelle verticale de la sortie, boutons
//    lumineux AUTO et MANU (celui du mode établi allumé), touches + et − actives en MANU, valeur et saisie au clavier validée par
//    Entrée (contrat des postes N4/EPR). Sans mode : une consigne seule ; sans consigne : le choix du mode seul.
// J6 (96A) : une consigne qui rejoint sa cible en rampe (consigne GCT, o.rampe) s'affiche « courante → cible », comme la 2.17 ;
// écart de 0,05 au plus, ou valeur courante inconnue : la cible seule.
const enRampe=(courante,cible)=>Number.isFinite(courante)&&Number.isFinite(cible)&&Math.abs(courante-cible)>.05;
function poste(o={}){
  const m=o.mode,a=m&&m.auto===true,ma=m&&m.auto===false,mok=o.modeEnabled!==false;
  const bm=(lab,c,on)=>'<button type="button" class="s9-pous s9-mode'+(on?' s9-pous-on':'')+'" data-n4-command="'+cmd(c)+'" data-n4-command-name="'+esc(m.nom||o.titre||'')+'" aria-pressed="'+on+'"'+(mok?'':' disabled')+'>'+lab+'</button>';
  const modes=m?'<div class="s9-paire s9-poste-modes" role="group" aria-label="'+esc((o.titre||'')+' : mode')+'">'+bm('AUTO',m.cmdAuto,a)+bm('MANU',m.cmdManu,ma)+'</div>':'';
  let corps='';
  if(o.k){const v=o.value,connu=Number.isFinite(v),min=o.min,max=o.max,pas=o.pas||1,ok=o.enabled!==false,sortie=Number.isFinite(o.sortie)?o.sortie:v;
    const f=Number.isFinite(sortie)?borne((sortie-min)/(max-min),0,1):null,fc=connu?borne((v-min)/(max-min),0,1):null;
    let g='';for(let i=0;i<=10;i++){const y=104-100*i/10;g+='<path d="M'+(i%5===0?3:6)+' '+y+'H11" stroke="#1d1d1b" stroke-width="'+(i%5===0?.9:.5)+'"/>';}
    const echelle='<svg class="s9-poste-ech" viewBox="0 0 26 108" aria-hidden="true"><rect x="0" y="0" width="26" height="108" rx="2" fill="#111"/><rect x="2" y="2" width="22" height="104" fill="#f3f2ec"/>'+g
      +(f!==null?'<rect x="12" y="'+(104-100*f).toFixed(1)+'" width="9" height="'+(100*f).toFixed(1)+'" fill="#6a9358"/>':'')+(fc!==null?'<path d="M2 '+(104-100*fc).toFixed(1)+'H24" stroke="#d61f14" stroke-width="1.8"/>':'')+'</svg>';
    const moins=connu?Math.max(min,Math.round((v-pas)/pas)*pas):null,plus=connu?Math.min(max,Math.round((v+pas)/pas)*pas):null;
    const touche=(lab,val)=>'<button type="button" class="s9-pas" data-n4-command="'+cmd({type:'set',k:o.k,v:val})+'" data-n4-command-name="'+esc(o.label||o.titre)+'"'+(!ok||val===null||val===v?' disabled':'')+' aria-label="'+esc((o.label||o.titre)+' '+lab+' '+num(pas,pas<1?1:0)+' '+(o.unit||''))+'">'+lab+'</button>';
    const dg=o.digits??(pas<1?1:0);
    corps='<div class="s9-poste-c">'+echelle+'<div class="s9-poste-d"><span class="s9-poste-v"><b>'+esc((enRampe(o.rampe,v)?num(o.rampe,dg)+' → ':'')+num(v,dg))+'</b> '+esc(o.unit||'')+'</span>'
      +'<span class="s9-paire s9-poste-pas">'+touche('+',plus)+touche('−',moins)+'</span>'
      +'<label><input type="number" inputmode="decimal" min="'+min+'" max="'+max+'" step="'+pas+'" value="'+(connu?+v.toFixed((String(pas).split('.')[1]||'').length):'')+'" data-n4-set="'+esc(o.k)+'" aria-label="'+esc(o.label||o.titre)+'"'+(ok?'':' disabled')+'><small>'+esc(ok?(o.note||(num(min,0)+' à '+num(max,0)+' '+(o.unit||'')+' · Entrée pour valider')):(o.verrou||'commande indisponible'))+'</small></label></div></div>';}
  return '<div class="s9-poste'+(o.k?'':' s9-poste-seul')+'"><div class="s9-poste-t"><b>'+esc(o.titre||'')+'</b>'+(o.sous?'<small>'+esc(o.sous)+'</small>':'')+'</div>'+modes+corps+'</div>';
}
const consigne=o=>poste(Object.assign({titre:o.label},o));
// ── Manipulateur des grappes (14A du 03/10) : modes AUTO et MANU lumineux ; en MANU, une manette à deux crans déplace le groupe R
//    (cran fin ±0,5 %, cran rapide ±5 %) ; afficheur rouge à sept segments de sa position ; saisie au clavier pour une valeur
//    exacte. Chaque cran envoie la consigne du pupitre classique (set rod) depuis la position reçue ; aucune commande nouvelle.
function manipulateur(o={}){
  const m=o.mode||{},a=m.auto===true,ma=m.auto===false,mok=o.modeEnabled!==false,v=o.value,connu=Number.isFinite(v),ok=o.enabled!==false&&connu,min=o.min??0,max=o.max??100;
  const bm=(lab,c,on)=>'<button type="button" class="s9-pous s9-mode'+(on?' s9-pous-on':'')+'" data-n4-command="'+cmd(c)+'" data-n4-command-name="'+esc(m.nom||o.titre||'')+'" aria-pressed="'+on+'"'+(mok?'':' disabled')+'>'+lab+'</button>';
  const cran=(lab,txt,d)=>{const val=connu?Math.max(min,Math.min(max,Math.round((v+d)*10)/10)):null;
    return '<button type="button" class="s9-pous s9-cran" data-n4-command="'+cmd({type:'set',k:o.k,v:val})+'" data-n4-command-name="'+esc(o.label||o.titre||'')+'"'+(!ok||val===null||val===v?' disabled':'')+' aria-label="'+esc((o.label||'')+' : '+txt+' ('+(d>0?'+':'−')+num(Math.abs(d),d%1?1:0)+' %)')+'"><b>'+lab+'</b><small>'+esc(txt)+'</small></button>';};
  // Manette vue de trois quarts (Anthonin, 03/10) : plaque et chant, soufflet, tige chromée, embout jaune.
  const manette='<svg class="s9-manette" viewBox="0 0 64 124" aria-hidden="true"><text x="32" y="9" text-anchor="middle" font-size="8" font-weight="700" fill="#cfd3cc">EXT ▲</text>'
    +'<path d="M10 82H54L62 98H2Z" fill="#2c2c29" stroke="#0d0d0c" stroke-width=".8"/><path d="M2 98H62V108H2Z" fill="#141413" stroke="#000" stroke-width=".8"/><path d="M10 82H54" stroke="#55554f" stroke-width="1"/>'
    +'<circle cx="11" cy="94" r="1.7" fill="#77776f"/><circle cx="53" cy="94" r="1.7" fill="#77776f"/>'
    +'<ellipse cx="32" cy="90" rx="15" ry="5" fill="#161615"/><path d="M17 90L26 70H38L47 90Z" fill="#2f2f2c"/><path d="M20.5 83.5Q32 87.5 43.5 83.5M23.3 77.3Q32 80.3 40.7 77.3M25.2 72.6Q32 74.6 38.8 72.6" stroke="#4a4a46" stroke-width="1.1" fill="none"/>'
    +'<ellipse cx="32" cy="90" rx="15" ry="5" fill="none" stroke="#000" stroke-width=".8"/><ellipse cx="32" cy="70" rx="6" ry="2" fill="#3c3c38"/>'
    +'<path d="M30.2 70.5L31.6 31H34.6L34 70.5Z" fill="#c8c8c2" stroke="#7a7a74" stroke-width=".5"/><path d="M31.1 69.5L32.4 32" stroke="#f6f6f2" stroke-width="1"/>'
    +(o.embout==='noir'?'<circle cx="33" cy="24" r="12" fill="#0d0d0c" stroke="#000" stroke-width=".8"/><circle cx="32.4" cy="23.2" r="10.2" fill="#262624"/><ellipse cx="29" cy="18.8" rx="4.4" ry="3.1" fill="#8a8a84" opacity=".7"/>'
      :'<circle cx="33" cy="24" r="12" fill="#c98f00" stroke="#5c4300" stroke-width=".8"/><circle cx="32.4" cy="23.2" r="10.2" fill="#f7c600"/><ellipse cx="29" cy="18.8" rx="4.4" ry="3.1" fill="#fff5ae" opacity=".9"/>')
    +'<text x="32" y="121" text-anchor="middle" font-size="8" font-weight="700" fill="#cfd3cc">INS ▼</text></svg>';
  return '<div class="s9-man"><div class="s9-poste-t"><b>'+esc(o.titre||'')+'</b>'+(o.sous?'<small>'+esc(o.sous)+'</small>':'')+'</div>'
    +'<div class="s9-paire s9-poste-modes" role="group" aria-label="'+esc((o.titre||'')+' : mode')+'">'+bm('AUTO',m.cmdAuto,a)+bm('MANU',m.cmdManu,ma)+'</div>'
    +'<div class="s9-man-c">'+manette+'<div class="s9-paire s9-man-crans" role="group" aria-label="Manette du groupe '+esc(o.groupe||'R')+'">'+cran('▲','extraire',.5)+cran('▲▲','extraire vite',5)+cran('▼','insérer',-.5)+cran('▼▼','insérer vite',-5)+'</div></div>'
    +'<div class="s9-man-aff">'+sept(connu?v.toFixed(1).replace('.',','):'----',4)+'<small>% extrait · groupe '+esc(o.groupe||'R')+'</small></div>'
    +'<label class="s9-man-l"><input type="number" inputmode="decimal" min="'+min+'" max="'+max+'" step="'+(o.pas||.5)+'" value="'+(connu?+v.toFixed(1):'')+'" data-n4-set="'+esc(o.k)+'" aria-label="'+esc(o.label||o.titre||'')+'"'+(ok?'':' disabled')+'><small>'+esc(ok?(o.note||'valeur exacte · Entrée pour valider'):(o.verrou||'commande indisponible'))+'</small></label></div>';
}
// ── Commande maintenue (borication, dilution) : agit tant que le doigt reste posé ; relâcher l'arrête (bail du serveur).
// Bouton lumineux carré (l'asset « essai des lampes » sur tous les boutons, Anthonin 03/10) : lentille teintée selon le rôle
// (blanc, vert, ambre, rouge), allumée quand l'état est établi ; plaque gravée dessous pour un sous-titre.
const plaque=(lent,bouton,txt)=>txt?'<span class="s9-bp s9-bp-'+lent+'">'+bouton+'<small>'+esc(txt)+'</small></span>':bouton;
function maintien(o={}){return plaque('ambre','<button type="button" class="n4-hold s9-hold s9-l-ambre" data-n4-hold="'+esc(o.k)+'" aria-pressed="'+!!o.actif+'"'+(o.enabled===false?' disabled':'')+'>'+esc(o.label)+'</button>','maintenir appuyé');}
// ── Bouton poussoir lumineux (état de tranche, pentes, incidents, réarmements) : allumé quand l'état est établi.
function poussoir(o={}){const lent=o.lent||'blanc';return plaque(lent,'<button type="button" class="s9-pous s9-l-'+lent+(o.actif?' s9-pous-on':'')+(o.classe?' '+o.classe:'')+'" data-n4-command="'+cmd(o.cmd)+'" data-n4-command-name="'+esc(o.nom||o.label)+'" aria-pressed="'+!!o.actif+'"'+(o.enabled===false?' disabled':'')+'>'+esc(o.label)+'</button>',o.sous);}
// ── Zone fonctionnelle du pupitre (5A du 03/10, photos de Gravelines 5) : plages qui se touchent, traits bordeaux fins à pans
//    coupés, titre noir centré « système-fonction » ; sous-zones titrées. Teinte selon la fonction (blanc, beige, vert d'eau, saumon).
function zone(o={},corps=''){return '<section class="s9-zone s9-teinte-'+(o.teinte||'blanc')+(o.large?' s9-zone-large':'')+'" aria-label="'+esc(o.titre||'')+'"'+(o.cle?' data-s9-zone="'+esc(o.cle)+'"':'')+'><div class="s9-zone-in"><h3>'+esc((o.code?o.code+'-':'')+(o.titre||''))+'</h3>'+corps+'</div></section>';}
function sous(titre,corps,o={}){return '<div class="s9-sous'+(o.classe?' '+o.classe:'')+'"><div class="s9-sous-in"><h4>'+esc(titre)+'</h4><div class="s9-sous-c">'+corps+'</div></div></div>';}
return Object.freeze({esc,num,cadran,barrette,indicateur,sept,afficheur,voyant,tpl,cle,poste,enRampe,ALERTE_AMBRE,consigne,manipulateur,maintien,poussoir,zone,sous});
});
