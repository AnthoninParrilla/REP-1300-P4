// SIMUREP — © 2026 AnthoninP. Instruments et organes des postes N4/EPR : aucune loi moteur.
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.SDCN4Instruments=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>Number.isFinite(v)?v.toLocaleString('fr-FR',{maximumFractionDigits:1}):'—';
function bounds(o){let min=Number.isFinite(o.min)?o.min:0,max=Number.isFinite(o.max)&&o.max>min?o.max:min+100;if(!(max>min)||!Number.isFinite(max)){min=0;max=100;}return {min,max,known:Number.isFinite(o.value),ratio:Number.isFinite(o.value)?Math.max(0,Math.min(1,(o.value/2-min/2)/(max/2-min/2))):0};}
function title(o){return (o.label||'Mesure')+' : '+fmt(o.value)+(o.unit?' '+o.unit:'');}
// Indicateur de profil du poste de secours : logement blanc profond, fente à droite, index rouge et zéro mécanique.
// Le repos sous le zéro signifie une mesure absente ; la valeur reçue reste lisible sous la plaque, même hors échelle.
function profile(o={}){
 const b=bounds(o),top=48,bottom=231,y=b.known?bottom-(bottom-top)*b.ratio:240;
 const divisions=b.max===180?6:b.max===350?7:b.max===120?6:5,minor=5;
 let marks='';
 for(let i=0;i<=divisions*minor;i++){
  const yy=bottom-(bottom-top)*i/(divisions*minor),major=i%minor===0;
  marks+='<path d="M'+(major?44:48)+' '+yy.toFixed(2)+'H54" stroke="#252622" stroke-width="'+(major?1.15:.65)+'"/>';
  if(major)marks+='<text x="41" y="'+(yy+3.1).toFixed(2)+'" text-anchor="end" font-family="Arial,Helvetica,sans-serif" font-size="8.5" fill="#22241f">'+esc(fmt(b.min+(b.max-b.min)*i/(divisions*minor)))+'</text>';
 }
 const face='<rect x="1" y="2" width="70" height="278" rx="2.4" fill="#060808"/>'
  +'<rect x="2" y="1" width="67" height="276" rx="2" fill="#232726" stroke="#080a09"/>'
  +'<path d="M3 272V3H68" fill="none" stroke="#5a605b" stroke-width=".7"/><path d="M68 4V275H4" fill="none" stroke="#000" stroke-width="1.5"/>'
  +'<rect x="7" y="11" width="57" height="258" rx="1" fill="#111412"/><rect x="9" y="14" width="53" height="252" fill="#e0e0d7"/>'
  +'<path d="M9 14H62L56 32H18Z" fill="#b5b7af"/><path d="M9 14L18 32V242L9 266Z" fill="#eeeeE7"/>'
  +'<path d="M62 14L56 32V242L62 266Z" fill="#c8cac0"/><path d="M9 266L18 242H56L62 266Z" fill="#f2f1e9"/>'
  +'<rect x="18" y="32" width="38" height="210" fill="#f5f4ee"/><path d="M18 242V32H56" fill="none" stroke="#777d73" stroke-opacity=".5" stroke-width="1.3"/>'
  +'<path d="M19 34H55V41H19Z" fill="#000" opacity=".06"/><path d="M10 18L15 32V245L10 259Z" fill="#fff" opacity=".45"/>'
  +'<text x="51" y="41" text-anchor="end" fill="#20221f" font-family="Arial,Helvetica,sans-serif" font-size="9" font-weight="700">'+esc(o.unit||'')+'</text>'+marks
  +'<path d="M57 32V243" stroke="#686c62" stroke-width="1.7"/><path d="M58.4 31V244" stroke="#fff" stroke-width="1.2"/>'
  +'<path d="M43 '+(y+1.3).toFixed(2)+'L57 '+(y-.3).toFixed(2)+'V'+(y+2.5).toFixed(2)+'Z" fill="#000" opacity=".2"/>'
  +'<path class="n4-profile-index" data-known="'+b.known+'" data-ratio="'+(b.known?b.ratio:'')+'" d="M42 '+y.toFixed(2)+'L57 '+(y-1.2).toFixed(2)+'V'+(y+1.2).toFixed(2)+'Z" fill="#a4231c"/><path d="M47 '+(y-.35).toFixed(2)+'L57 '+(y-.7).toFixed(2)+'" stroke="#eb5c48" stroke-width=".45"/>'
  +'<path d="M16 247H56" stroke="#b4b7ac" stroke-width=".7"/><ellipse cx="55" cy="257" rx="4.4" ry="3.3" fill="#000" opacity=".22"/>'
  +'<path d="M49 252L50 248Q53 246 56 249L58 255Z" fill="#f5f5ec" stroke="#b1b6ab" stroke-width=".6"/><circle cx="54" cy="255" r="3.1" fill="#343b34"/><circle cx="53.6" cy="254.5" r="2.2" fill="#171c18"/><path d="M52.3 253L55 256" stroke="#93978b" stroke-width=".65"/>'
  +'<path d="M10 16H61V19H10Z" fill="#fff" opacity=".22"/><path d="M11 23L20 22L11 131Z" fill="#fff" opacity=".16"/><path d="M60 36V262" stroke="#fff" stroke-opacity=".2" stroke-width=".7"/>';
 return '<figure class="n4-profile" role="img" aria-label="'+esc(title(o))+'"><svg class="n4-profile-face" viewBox="0 0 72 282" aria-hidden="true" focusable="false">'+face+'</svg><figcaption>'+esc(o.label||'Mesure')+'</figcaption><b class="n4-profile-value">'+esc(fmt(o.value))+' <small>'+esc(o.unit||'')+'</small></b></figure>';
}

// Organes des panneaux de secours (lot 4 ter, 3A et 4A d'Anthonin du 07/10 : « réaliste avec l'époque : on utilise ce qui est déjà
// utilisé sur les paliers 900 et 1300 ») : verrines, afficheurs rouges à sept segments et voyants ronds sous enjoliveur, redessinés ici pour
// les postes N4/EPR (leurs propres fichiers) ; le thème de chaque palier vient de sa feuille (N4 : cadre noir ; EPR : boîtier clair). Dessin
// seul : l'état vient de l'instantané reçu ; une valeur inconnue s'écrit en tirets, un état inconnu laisse le voyant éteint avec « — ».
// Verrines : lentille claire à inscription noire, éteinte ; allumée rouge ou ambre selon la verrine ; le mot de l'état n'est pas écrit.
function verrines(liste,o={}){
 return '<div class="n4-verrines" role="group" aria-label="'+esc(o.titre||'Verrines')+'">'+(liste||[]).map(v=>{const on=v.on===true;
  return '<div class="n4-verrine" data-on="'+on+'" data-couleur="'+(v.color==='rouge'?'rouge':'ambre')+'" role="img" aria-label="'+esc((v.label||'Verrine')+' : '+(on?'allumée':'éteinte'))+'"><span>'+esc(v.label||'')+'</span></div>';}).join('')+'</div>';
}
// Afficheur : chiffres rouges à sept segments, segments éteints visibles, fenêtre noire sous verre, plaque gravée dessous (nom et unité).
const SEG7={'0':'abcdef','1':'bc','2':'abged','3':'abgcd','4':'fgbc','5':'afgcd','6':'afgedc','7':'abc','8':'abcdefg','9':'abcdfg','-':'g'};
function segments(x,y,w,h){
 const t=2.1,g=.45,m=h/2,P=a=>a.map(p=>p[0].toFixed(2)+','+p[1].toFixed(2)).join(' ');
 const hz=yy=>[[x+g+t/2,yy],[x+g+t,yy-t/2],[x+w-g-t,yy-t/2],[x+w-g-t/2,yy],[x+w-g-t,yy+t/2],[x+g+t,yy+t/2]];
 const vt=(xx,y0,y1)=>[[xx,y0+g+t/2],[xx+t/2,y0+g+t],[xx+t/2,y1-g-t],[xx,y1-g-t/2],[xx-t/2,y1-g-t],[xx-t/2,y0+g+t]];
 return {a:P(hz(y)),g:P(hz(y+m)),d:P(hz(y+h)),f:P(vt(x,y,y+m)),b:P(vt(x+w,y,y+m)),e:P(vt(x,y+m,y+h)),c:P(vt(x+w,y+m,y+h))};
}
function sept(texte,cases){
 const cs=[];for(const ch of String(texte)){if(ch===','||ch==='.'){if(cs.length)cs[cs.length-1].p=true;continue;}if(/\s/.test(ch))continue;cs.push({c:ch==='—'?'-':ch,p:false});}
 while(cs.length<(cases||0))cs.unshift({c:' ',p:false});
 const L=13,H=26;let on='',off='';
 cs.forEach((d,i)=>{const x=5+i*L,s=segments(x,4,8.5,17),lit=SEG7[d.c]||'';for(const k of 'abcdefg'){const p='<polygon points="'+s[k]+'"/>';if(lit.includes(k))on+=p;else off+=p;}
  // 2A du 12/10 : virgule décimale sur les afficheurs, comme dans les textes ; le point et sa queue s'allument ensemble.
  const cx=x+11.2,pt='<path data-v="1" d="M'+(cx-1.2).toFixed(2)+' 21.4a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0ZM'+(cx+1.15).toFixed(2)+' 21.5L'+(cx+.4).toFixed(2)+' 24.9L'+(cx-.5).toFixed(2)+' 24.6L'+(cx-.05).toFixed(2)+' 22.5Z"/>';if(d.p)on+=pt;else off+=pt;});
 const w=8+cs.length*L;
 return '<svg viewBox="0 0 '+w+' '+H+'" width="'+(w*1.2).toFixed(0)+'" height="'+(H*1.2).toFixed(0)+'" aria-hidden="true"><g transform="translate(2.4 0) skewX(-6)"><g fill="#1f0504">'+off+'</g><g fill="#ff3a24">'+on+'</g></g></svg>';
}
function afficheur(o={}){
 const connu=Number.isFinite(o.value),txt=connu?o.value.toLocaleString('fr-FR',{maximumFractionDigits:o.digits??2,useGrouping:false}):'----';
 return '<div class="n4-aff" role="img" aria-label="'+esc((o.label||'Mesure')+' : '+(connu?txt:'inconnue')+(o.unit&&connu?' '+o.unit:''))+'"><span class="n4-aff-f">'+sept(txt,Math.max(4,txt.replace(/[,.]/g,'').length))+'</span><small><b>'+esc(o.label||'')+'</b>'+(o.unit?' <i>'+esc(o.unit)+'</i>':'')+'</small></div>';
}
// Voyant : lampe ronde sous enjoliveur chromé, blanche en service (comme la lampe des TPL), ambre si indisponible, rouge pour une alarme ;
// plaque gravée au nom, état en petit dessous ; compact sous un TPL (lampe et état seulement, le nom est sur la plaque du TPL).
function voyant(o={}){const c=o.on===true?(['rouge','ambre'].includes(o.couleur)?o.couleur:'blanc'):'eteint';
 return '<span class="n4-voy n4-voy-'+c+(o.compact?' n4-voy-compact':'')+'" role="img" aria-label="'+esc((o.label||'Voyant')+' : '+(o.etat||(o.on===true?'allumé':'éteint')))+'"><i></i>'+(o.compact?'':'<span>'+esc(o.label||'')+'</span>')+(o.etat?'<small>'+esc(o.etat)+'</small>':'')+'</span>';}
// TPL des panneaux de secours (H08 ; coup de propre N4/EPR du 04/10 : l'organe TPL de la salle 900 entre dans les panneaux de secours) :
// pastille, enjoliveur chromé, manette en quart de tour, jamais en diagonale (Anthonin, 03/10) : repos « 0 » à 9 h, service « I » à 12 h,
// repère et chiffre sur l'axe exact de la manette dans chaque position ; lampe de la manette blanche en service (3B du 04/10). Calques et
// opacités seulement, sans identifiant. Dessin seul : commande et retour d'état restent ceux du bouton.
function selector(o={}){
 const on=o.on===true,rot=on?90:0,cx=45,cy=43,axe=(deg,r)=>{const a=deg*Math.PI/180;return [cx+r*Math.sin(a),cy-r*Math.cos(a)].map(v=>Math.round(v*10)/10);};
 const repere=(deg,label,actif)=>{const [x1,y1]=axe(deg,26),[x2,y2]=axe(deg,30),[tx,ty]=axe(deg,21);return '<path d="M'+x1+' '+y1+'L'+x2+' '+y2+'" stroke="#221a14" stroke-width="1.6"/><text x="'+tx+'" y="'+(ty+(deg?4:3))+'" text-anchor="middle" fill="#221a14" font-family="Arial,sans-serif" font-size="9" font-weight="700"'+(actif?'':' opacity=".6"')+'>'+label+'</text>';};
 const arc=(r,deb,ang,coul,ep,op)=>{const c=2*Math.PI*r;return '<circle cx="45" cy="43" r="'+r+'" fill="none" stroke="'+coul+'" stroke-width="'+ep+'" opacity="'+op+'" stroke-dasharray="'+(c*ang/360).toFixed(1)+' '+c.toFixed(1)+'" transform="rotate('+deb+' 45 43)"/>';};
 return '<svg class="n4-selector" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 75" aria-hidden="true" focusable="false" style="display:block;width:108px;max-width:100%;height:auto">'
  +'<circle class="n4-tpl-p" cx="45" cy="42" r="31" fill="#ece6d4" stroke="#3a3a36" stroke-width="1.4"/><ellipse cx="34" cy="26" rx="18" ry="10" fill="#fff" opacity=".3" transform="rotate(-28 34 26)"/>'
  +repere(-90,'0',!on)+repere(0,'I',on)
  +'<circle cx="46.4" cy="45" r="16.5" fill="#000" opacity=".28"/><circle cx="45" cy="43" r="16" fill="#55554f"/><circle cx="45" cy="43" r="14.7" fill="#c4c4be"/>'
  +arc(13.7,185,95,'#ffffff',2.2,.85)+arc(13.7,5,95,'#2c2c29',2.2,.5)+'<circle cx="45" cy="43" r="12.6" fill="#8e8e88"/><circle cx="45" cy="43" r="11.7" fill="#e4e4df"/>'
  +'<circle cx="45" cy="43" r="10.3" fill="#ece6d4" stroke="#5e5240" stroke-width=".5"/><ellipse cx="41" cy="39" rx="5" ry="2.9" fill="#fff" opacity=".45" transform="rotate(-35 41 39)"/>'
  +'<g transform="rotate('+rot+' 45 43)">'+(on?'<rect x="31.5" y="38.3" width="27" height="9.4" rx="2.2" fill="#eaf3ff" opacity=".7"/>':'')
  +'<rect x="34" y="40.4" width="22.6" height="6.2" rx="1.2" fill="#000" opacity=".25"/><rect x="33.2" y="39.5" width="23.6" height="6.2" rx="1.2" fill="'+(on?'#ffffff':'#d8d8d2')+'" stroke="#4d4d48" stroke-width=".55"/>'
  +'<rect x="33.9" y="'+(on?'43.4':'40')+'" width="22.2" height="1.2" rx=".6" fill="#fff" opacity=".8"/><path d="M35.4 42.6L39.6 40.3V41.8H54.4V43.4H39.6V44.9Z" fill="#141414"/></g></svg>';
}
// ── Carte des grappes et écran RGL (coup de propre N4/EPR du 04/10 : réponses 1A, 2A, 4A, 8A et 15 bis A d'Anthonin). Dessin seul, commun
//    aux postes N4/EPR et aux salles : implantation, repères et positions viennent de la vue des grappes du châssis (vue reçue), jamais
//    inventés ; une position inconnue s'écrit « — ». Positions en pour cent extrait quand la course en pas n'est pas lue. Mode A (CP0, N4) :
//    les groupes de commande sans engagement simulé sont hauts hors arrêt d'urgence (même règle que le CP0, 4A du 03/10). Position comptée
//    (compteur alimenté par les pas demandés) et position mesurée (mesure indépendante) distinctes (8A) : l'écart se signale.
//    V24 (S049, S050, S052, S058) : la carte compte les positions qu'elle représente ; le type absorbant n'est dit que si la vue porte
//    les grappes grises (N4), sinon le détail dit qu'il n'est pas indiqué ; o.schema (donné par le poste) date le plan montré.
const ROLE={regulation:'régulation',commande:'commande',compensation:'compensation',arret:'arrêt'};
function fracGrappe(v,g,quoi){
  const x=g&&g[quoi];if(Number.isFinite(x))return Math.max(0,Math.min(1,x));
  if(v&&v.mode==='A'&&g&&g.role==='commande'&&v.mesure===true&&(quoi==='compte'||!v.au))return 1;
  return null;}
const pc=f=>f===null?'—':Math.round(f*100)+' %';
function carteGrappes(v,o={}){
  const T=Object.assign({fond:'#0b1013',vide:'#1d272c',case:'#2b383e',trait:'#3f5058',texte:'#9fb3bd',sel:'#ffd23a',gris:'#9aa19d'},o.theme||{}),COUL=o.couleurs||{},attr=o.attr||'data-n4-case';
  if(!v||!Array.isArray(v.groupes)||!Array.isArray(v.rangees)||!v.grille)return '<p class="n4-grappes-vide">Positions des grappes non reçues.</p>';
  const R=v.rangees,L=Math.max(...R),G=v.grille,cell=o.cellule||15,ox=18,oy=4,pos={},gris=new Set();
  for(const g of v.groupes){const f=fracGrappe(v,g,'ext');for(const r of g.grappes||[])pos[r.rep]={g,f};for(const r of g.gris||[])gris.add(r);}
  let h='',nb=0;
  R.forEach((n,r)=>{const a=(L-n)/2;for(let c=a;c<a+n;c++){nb++;const rep=G.colonnes[c]+G.rangees[r],p=pos[rep],x=ox+c*cell,y=oy+r*cell,sel=o.sel===rep;
    h+='<g class="n4-gr-case" '+attr+'="'+esc(rep)+'" role="button" tabindex="0" aria-pressed="'+sel+'" aria-label="'+esc('Assemblage '+rep+(p?', grappe du groupe '+p.g.id+' ('+(ROLE[p.g.role]||p.g.role)+'), '+pc(p.f)+' extrait':', sans grappe'))+'">'
      +'<rect x="'+x+'" y="'+y+'" width="'+(cell-1)+'" height="'+(cell-1)+'" rx="1" fill="'+(p?T.case:T.vide)+'" stroke="'+(sel?T.sel:T.trait)+'" stroke-width="'+(sel?1.6:.5)+'"/>';
    if(p){const col=gris.has(rep)?T.gris:(COUL[p.g.id]||'#c8261f'),f=p.f;
      if(f!==null&&f<1)h+='<rect x="'+(x+2.5)+'" y="'+(y+2)+'" width="'+(cell-6)+'" height="'+((cell-5)*(1-f)).toFixed(2)+'" fill="'+col+'" opacity=".9"/>';
      h+='<circle cx="'+(x+cell/2-.5)+'" cy="'+(y+cell/2-.5)+'" r="'+(cell*.2).toFixed(2)+'" fill="'+col+'" stroke="'+(gris.has(rep)?'#3c4246':'#000')+'" stroke-width=".4"/>'
        +'<text x="'+(x+cell/2-.5)+'" y="'+(y+cell-2.2)+'" font-size="4.6" text-anchor="middle" fill="'+T.texte+'">'+esc(p.g.id)+'</text>';}
    h+='</g>';}});
  for(let c=0;c<L;c++)h+='<text x="'+(ox+c*cell+cell/2-.5)+'" y="'+(oy+R.length*cell+8)+'" font-size="6" text-anchor="middle" fill="'+T.texte+'">'+esc(G.colonnes[c])+'</text>';
  R.forEach((n,r)=>{h+='<text x="'+(ox-3)+'" y="'+(oy+r*cell+cell/2+2)+'" font-size="6" text-anchor="end" fill="'+T.texte+'">'+esc(G.rangees[r])+'</text>';});
  const W=ox+L*cell+4,H=oy+R.length*cell+12,placees=Object.keys(pos).length;
  const svgT='<svg class="n4-gr-carte" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc('Carte des grappes : '+nb+' assemblages, '+placees+' positions représentées sur ce schéma')+'" style="background:'+T.fond+'">'+h+'</svg>';
  const p=o.sel&&pos[o.sel],dans=o.sel&&!p&&R.some((n,r)=>{const a=(L-n)/2;for(let c=a;c<a+n;c++)if(G.colonnes[c]+G.rangees[r]===o.sel)return true;return false;});
  const detail=p?'<p class="n4-gr-detail"><b>'+esc(o.sel)+'</b> · grappe '+(gris.size?(gris.has(o.sel)?'grise ':'noire '):'')+'du groupe <b>'+esc(p.g.id)+'</b> ('+esc(ROLE[p.g.role]||p.g.role)+')'+(gris.size?'':' ; le type absorbant n’est pas indiqué sur ce schéma')+' · mesurée '+pc(fracGrappe(v,p.g,'ext'))+' · comptée '+pc(fracGrappe(v,p.g,'compte'))+'</p>'
    :dans?'<p class="n4-gr-detail"><b>'+esc(o.sel)+'</b> · assemblage sans grappe</p>':'<p class="n4-gr-detail">Toucher une case : sa grappe, son groupe et sa position.</p>';
  const legende='<div class="n4-gr-leg">'+v.groupes.map(g=>'<span><i style="background:'+(COUL[g.id]||'#c8261f')+'"></i><b>'+esc(g.id)+'</b> '+esc(ROLE[g.role]||g.role)+' · '+(Array.isArray(g.grappes)?g.grappes.length:g.n)+'</span>').join('')+(gris.size?'<span><i style="background:'+T.gris+'"></i>grappe grise</span>':'')+(o.schema?'<span>'+esc(o.schema)+'</span>':'')+'</div>';
  return '<div class="n4-gr">'+svgT+legende+detail+'</div>';}
function ecranRGL(v,o={}){
  if(!v||!Array.isArray(v.groupes))return '<p class="n4-grappes-vide">Positions des grappes non reçues.</p>';
  const COUL=o.couleurs||{},ecart=o.ecart||0.05;let alerte=0;
  const lignes=v.groupes.map(g=>{const m=fracGrappe(v,g,'ext'),k=fracGrappe(v,g,'compte'),e=m!==null&&k!==null&&Math.abs(m-k)>ecart;if(e)alerte++;
    const fdc=m===null?'—':m>=.995?'HAUT':m<=.005?'BAS':'';
    return '<tr'+(e?' data-ecart="1"':'')+'><th scope="row"><i style="background:'+(COUL[g.id]||'#c8261f')+'"></i>'+esc(g.id)+'</th><td>'+esc(ROLE[g.role]||g.role)+'</td><td>'+(Array.isArray(g.grappes)?g.grappes.length:g.n)+'</td>'
      +'<td><b>'+pc(k)+'</b></td><td><b>'+pc(m)+'</b></td><td class="n4-rgl-barres" aria-hidden="true"><span><em style="width:'+(k===null?0:k*100).toFixed(1)+'%"></em></span><span><i style="width:'+(m===null?0:m*100).toFixed(1)+'%"></i></span></td>'
      +'<td>'+fdc+'</td><td>'+(e?'<strong>ÉCART</strong>':'')+'</td></tr>';}).join('');
  const etat=v.mesure===false?'mesure indisponible (couvercle déposé)':v.au?'arrêt d’urgence : grappes au bas':'en service';
  return '<section class="n4-rgl" aria-label="Écran RGL : position des grappes"><header><b>RGL</b><span>Régulation des grappes · '+(o.auto===true?'AUTO':o.auto===false?'MANU':'—')+'</span><span>'+esc(etat)+'</span>'+(alerte?'<strong>ÉCART COMPTÉ / MESURÉ</strong>':'')+'</header>'
    +'<table><thead><tr><th scope="col">Groupe</th><th scope="col">Rôle</th><th scope="col">Grappes</th><th scope="col">Compté</th><th scope="col">Mesuré</th><th scope="col">Position (compté / mesuré)</th><th scope="col">Fin de course</th><th scope="col">Écart</th></tr></thead><tbody>'+lignes+'</tbody></table>'
    +(o.schema?'<p class="n4-rgl-n">'+esc(o.schema)+'</p>':'')+'<p class="n4-rgl-n">Positions en pour cent extrait, avec 100 % en haut ; compare les indications comptée et mesurée pour repérer un éventuel écart.</p></section>';}
return Object.freeze({profile,verrines,afficheur,voyant,selector,carteGrappes,ecranRGL,fracGrappe});
});
