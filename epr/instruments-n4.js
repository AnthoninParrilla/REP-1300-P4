// SIMUREP — © 2026 AnthoninP. Instruments de lecture N4 : aucune loi moteur.
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.SDCN4Instruments=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>Number.isFinite(v)?v.toLocaleString('fr-FR',{maximumFractionDigits:1}):'—';
const C=Object.freeze({panel:'#666a69',edge:'#353938',face:'#eeeadd',ink:'#202624',dim:'#535b57',needle:'#9e281f',off:'#464b46'});
function bounds(o){let min=Number.isFinite(o.min)?o.min:0,max=Number.isFinite(o.max)&&o.max>min?o.max:min+100;if(!(max>min)||!Number.isFinite(max)){min=0;max=100;}return {min,max,known:Number.isFinite(o.value),ratio:Number.isFinite(o.value)?Math.max(0,Math.min(1,(o.value/2-min/2)/(max/2-min/2))):0};}
function title(o){return (o.label||'Mesure')+' : '+fmt(o.value)+(o.unit?' '+o.unit:'');}
function svg(o,body,height=164){return '<svg class="n4-instrument" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 '+height+'" role="img" aria-label="'+esc(title(o))+'" style="display:block;width:100%;height:auto"><title>'+esc(title(o))+'</title>'+body+'</svg>';}
function text(x,y,v,size=10,extra=''){return '<text x="'+x+'" y="'+y+'" text-anchor="middle" fill="'+C.ink+'" font-family="Arial,Helvetica,sans-serif" font-size="'+size+'" '+extra+'>'+esc(v)+'</text>';}
function base(){return '<rect x="1" y="1" width="198" height="162" rx="3" fill="'+C.panel+'" stroke="'+C.edge+'" stroke-width="2"/><path d="M4 160V4H196" fill="none" stroke="#969c98"/><rect x="9" y="9" width="182" height="146" rx="2" fill="'+C.face+'" stroke="#202624" stroke-width="2"/>';}
function gauge(o={}){
 const b=bounds(o),cx=100,cy=114,r=72,point=(ratio,radius)=>{const a=(-150+120*ratio)*Math.PI/180;return [cx+radius*Math.cos(a),cy+radius*Math.sin(a)];};
 let body=base()+text(100,27,o.label||'MESURE',11,'font-weight="700"');
 const a=point(0,r),z=point(1,r);body+='<path d="M'+a.join(' ')+' A'+r+' '+r+' 0 0 1 '+z.join(' ')+'" fill="none" stroke="'+C.ink+'" stroke-width="1.2"/>';
 for(let i=0;i<=20;i++){const major=i%5===0,p=point(i/20,r),q=point(i/20,r-(major?10:5));body+='<path d="M'+p.join(' ')+' L'+q.join(' ')+'" stroke="'+C.ink+'" stroke-width="'+(major?1.5:0.8)+'"/>';if(major){const t=point(i/20,r-20);body+=text(t[0],t[1]+3,fmt(b.min*(1-i/20)+b.max*i/20),9);}}
 body+=text(100,94,o.unit||'',10);
 if(b.known){const p=point(b.ratio,r-4);body+='<path data-needle="'+b.ratio+'" d="M100 114 L'+p.join(' ')+'" stroke="'+C.needle+'" stroke-width="2.5" stroke-linecap="round"/><circle cx="100" cy="114" r="5" fill="'+C.ink+'"/>';}
 body+='<rect x="48" y="127" width="104" height="21" rx="1" fill="#dedacb" stroke="#8b8b7e"/>'+text(100,142,fmt(o.value),14,'font-family="monospace" font-weight="700"');
 return svg(o,body);
}
function column(o={}){
 const b=bounds(o),top=42,bottom=129,h=bottom-top;
 let body=base()+text(100,27,o.label||'MESURE',11,'font-weight="700"');
 body+='<rect x="76" y="'+top+'" width="25" height="'+h+'" fill="#d3d1c5" stroke="'+C.ink+'"/>';
 if(b.known){const size=h*b.ratio;body+='<rect data-column="'+b.ratio+'" x="79" y="'+(bottom-size)+'" width="19" height="'+size+'" fill="#293b30"/><path d="M74 '+(bottom-size)+'H103" stroke="'+C.needle+'" stroke-width="2"/>';}
 for(let i=0;i<=10;i++){const y=bottom-h*i/10,major=i%2===0;body+='<path d="M105 '+y+'h'+(major?9:5)+'" stroke="'+C.ink+'"/>';if(major)body+=text(142,y+3,fmt(b.min*(1-i/10)+b.max*i/10),9);}
 body+=text(47,89,o.unit||'',10)+text(100,148,fmt(o.value),14,'font-family="monospace" font-weight="700"');return svg(o,body);
}
function annunciator(o={}){
 const colors={red:'#ff7161',rouge:'#ff7161',amber:'#f3c956',yellow:'#f3c956',jaune:'#f3c956',green:'#81c88c',vert:'#81c88c',white:'#f1efdb',blanche:'#f1efdb'},on=o.on===true,color=colors[o.color]||colors.amber;
 const label=o.label||'VOYANT',spoken=label+' : '+(on?'allumé':'éteint');
 let body='<rect x="1" y="1" width="198" height="78" rx="2" fill="'+C.panel+'" stroke="'+C.edge+'" stroke-width="2"/><rect x="9" y="10" width="182" height="60" rx="2" fill="#292e2b" stroke="#92968e"/><rect x="14" y="15" width="172" height="50" rx="1" fill="'+(on?color:C.off)+'" stroke="#151b16"/>';
 body+='<text x="100" y="39" text-anchor="middle" fill="'+(on?'#18221c':'#f0f0dc')+'" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="12">'+esc(label)+'</text><text x="100" y="56" text-anchor="middle" fill="'+(on?'#18221c':'#bdc3b8')+'" font-family="Arial,Helvetica,sans-serif" font-size="9">'+(on?'ACTIF':'REPOS')+'</text>';
 return '<svg class="n4-instrument n4-annunciator" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80" role="img" aria-label="'+esc(spoken)+'" style="display:block;width:100%;height:auto"><title>'+esc(spoken)+'</title>'+body+'</svg>';
}
function selector(o={}){
 const on=o.on===true,angle=on?38:-38;
 return '<svg class="n4-selector" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 75" aria-hidden="true" focusable="false" style="display:block;width:90px;max-width:100%;height:auto"><rect x="1" y="1" width="88" height="73" rx="3" fill="'+C.panel+'" stroke="'+C.edge+'"/><path d="M24 26 A26 26 0 0 1 66 26" fill="none" stroke="#e9e7da" stroke-width="1"/><text x="18" y="19" text-anchor="middle" fill="#faf8ee" font-family="Arial,sans-serif" font-size="11">0</text><text x="72" y="19" text-anchor="middle" fill="#faf8ee" font-family="Arial,sans-serif" font-size="11">I</text><circle cx="45" cy="43" r="24" fill="#363b36" stroke="#d7d8c9" stroke-width="2"/><circle cx="45" cy="43" r="19" fill="#212820" stroke="#141914"/><g transform="rotate('+angle+' 45 43)"><rect x="38" y="20" width="14" height="44" rx="3" fill="#171d16" stroke="#727b6f"/><path d="M45 24V36" stroke="#f8f5df" stroke-width="3" stroke-linecap="round"/></g></svg>';
}
return Object.freeze({gauge,column,annunciator,selector,colors:C});
});
