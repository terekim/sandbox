// Typo Derby Flat: the finger gang as flat, outlined blobs.
// Everything is generated SVG, so there are no image files to load or cache.
// Each character is an egg body + googly eyes + big round nose + one prop.
(function(){
const INK='#1F1D2B',SW=6;
const GANG={
  thumbs:{name:'Thumbs',     c:'#FF9DB0',nose:'#F2475F',kart:'#FF5A4E',t:62, b:182,w:136,top:.52,bot:.62},
  pops:  {name:'Pops Pointer',c:'#45D1B8',nose:'#FF7259',kart:'#3B82F6',t:36, b:182,w:108,top:.56,bot:.58},
  birdie:{name:'Birdie',     c:'#FFD23F',nose:'#FF7A45',kart:'#7C5CFA',t:14, b:182,w:92, top:.58,bot:.56},
  sir:   {name:'Sir Ringsley',c:'#B79BFF',nose:'#FF6B8B',kart:'#FFB020',t:30, b:182,w:104,top:.56,bot:.58},
  lil:   {name:'Lil Pink',   c:'#FFB28E',nose:'#FF4F5E',kart:'#4CC764',t:94, b:184,w:108,top:.58,bot:.6}
};
const egg=g=>{const {t,b,w}=g,cx=100;return `M${cx} ${t}C${cx+w*g.top} ${t} ${cx+w*g.bot} ${b} ${cx} ${b}C${cx-w*g.bot} ${b} ${cx-w*g.top} ${t} ${cx} ${t}Z`};
const limb=(d,col,wd=15)=>`<path d="${d}" fill="none" stroke="${INK}" stroke-width="${wd}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${wd-SW*1.1}" stroke-linecap="round" stroke-linejoin="round"/>`;

// face geometry shared by every pose
function face(id,mood,look){
  const g=GANG[id],h=g.b-g.t,cx=100,ey=g.t+h*(id==='lil'?.36:id==='thumbs'?.36:.3),sp=id==='lil'?12:13;
  const nx=cx+look*4,ny=ey+25,er=id==='lil'?9:10;
  let s='';
  // mouth: a wide arc that tucks behind the nose
  const my=ny+11;
  if(mood==='sad')s+=`<path d="M${nx-24} ${my+14}Q${nx} ${my-6} ${nx+24} ${my+14}" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`;
  else if(mood==='smug')s+=`<path d="M${nx-20} ${my+4}Q${nx+4} ${my+14} ${nx+26} ${my-4}" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`;
  else if(mood==='happy')s+=`<path d="M${nx-22} ${my}Q${nx} ${my+34} ${nx+22} ${my}Z" fill="${INK}" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/><path d="M${nx-9} ${my+16}Q${nx} ${my+10} ${nx+10} ${my+16}Q${nx+2} ${my+24} ${nx-9} ${my+16}Z" fill="#FF6B7A"/>`;
  else s+=`<path d="M${nx-24} ${my}Q${nx} ${my+18} ${nx+24} ${my}" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`;
  // eyes
  [-1,1].forEach(k=>{const ex=cx+k*sp+look*3;
    s+=`<ellipse cx="${ex}" cy="${ey}" rx="${er}" ry="${er*1.18}" fill="#fff" stroke="${INK}" stroke-width="4"/>`;
    const py=ey+(mood==='sad'?3:0);
    s+=`<circle cx="${ex+look*3.2+(k===-1?1:-1)*.6}" cy="${py}" r="${er*.42}" fill="${INK}"/>`;
    if(id==='birdie'&&mood!=='happy')s+=`<path d="M${ex-er-1} ${ey-1}A${er+1} ${er*1.18+1} 0 0 1 ${ex+er+1} ${ey-1}Z" fill="${g.c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
  });
  // brows by mood
  if(mood==='smug'||id==='thumbs'&&mood!=='sad')[-1,1].forEach(k=>{const ex=cx+k*sp+look*3;s+=`<path d="M${ex-k*7} ${ey-er*1.4-6}L${ex+k*6} ${ey-er*1.4+1}" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`});
  if(mood==='sad')[-1,1].forEach(k=>{const ex=cx+k*sp+look*3;s+=`<path d="M${ex-k*7} ${ey-er*1.4+1}L${ex+k*6} ${ey-er*1.4-5}" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`});
  // nose
  s+=`<ellipse cx="${nx}" cy="${ny}" rx="${id==='lil'?14:17}" ry="${id==='lil'?16:20}" fill="${g.nose}" stroke="${INK}" stroke-width="${SW*.75}"/>`;
  s+=`<ellipse cx="${nx-5}" cy="${ny-8}" rx="4" ry="3" fill="#fff" opacity=".7"/>`;
  return {s,ey,ny,nx,sp,er};
}

// props that sit on the body (drawn inside the body clip where needed)
function props(id,F,look){
  const g=GANG[id],h=g.b-g.t,cx=100;let under='',over='';
  if(id==='thumbs'){ // racing helmet with a white stripe
    const y=g.t+h*.2;
    under+=`<g clip-path="url(#body)"><path d="M0 0H200V${y+2}Q${cx} ${y-8} 0 ${y+2}Z" fill="#FF5A4E"/><rect x="${cx-9+look*4}" y="0" width="18" height="${y-2}" fill="#fff"/><path d="M0 ${y+2}Q${cx} ${y-8} 200 ${y+2}" fill="none" stroke="${INK}" stroke-width="${SW}"/></g>`;
  }
  if(id==='pops'){ // specs, mustache, wispy hair
    [-1,1].forEach(k=>{over+=`<circle cx="${cx+k*F.sp+look*3}" cy="${F.ey}" r="${F.er+5}" fill="none" stroke="${INK}" stroke-width="3.5"/>`});
    over+=`<path d="M${cx-F.sp+F.er+5+look*3} ${F.ey}h${2*F.sp-2*F.er-10}" stroke="${INK}" stroke-width="3.5"/>`;
    const mx=F.nx,my=F.ny+12;
    over+=`<path d="M${mx} ${my-4}C${mx-10} ${my-8} ${mx-26} ${my-6} ${mx-30} ${my+6}C${mx-20} ${my+4} ${mx-10} ${my+8} ${mx} ${my+2}C${mx+10} ${my+8} ${mx+20} ${my+4} ${mx+30} ${my+6}C${mx+26} ${my-6} ${mx+10} ${my-8} ${mx} ${my-4}Z" fill="#fff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
    over+=`<path d="M${cx-6} ${g.t+2}q-4 -14 -14 -16M${cx+2} ${g.t+1}q2 -16 12 -18" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
  }
  if(id==='birdie'){ // toothpick
    over+=`<path d="M${F.nx+18} ${F.ny+16}l26 -8" stroke="${INK}" stroke-width="7.5" stroke-linecap="round"/><path d="M${F.nx+18} ${F.ny+16}l26 -8" stroke="#F3D9A4" stroke-width="3" stroke-linecap="round"/>`;
  }
  if(id==='sir'){ // gold ring band + monocle
    const y=g.t+h*.7;
    under+=`<g clip-path="url(#body)"><path d="M0 ${y}Q100 ${y+12} 200 ${y}v16Q100 ${y+28} 0 ${y+16}Z" fill="#FFC531"/><path d="M0 ${y}Q100 ${y+12} 200 ${y}M0 ${y+16}Q100 ${y+28} 200 ${y+16}" fill="none" stroke="${INK}" stroke-width="4"/></g>`;
    over+=`<path d="M${cx-12} ${y+14}l8 -9h10l8 9l-13 11Z" fill="#7FE3FF" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`;
    const mx=cx+F.sp+look*3;
    over+=`<circle cx="${mx}" cy="${F.ey}" r="${F.er+5}" fill="none" stroke="#FFC531" stroke-width="7"/><circle cx="${mx}" cy="${F.ey}" r="${F.er+5}" fill="none" stroke="${INK}" stroke-width="2"/>`;
    over+=`<path d="M${mx+F.er+4} ${F.ey+6}Q${mx+24} ${F.ey+40} ${mx+14} ${F.ey+70}" fill="none" stroke="#C9971A" stroke-width="2.5" stroke-dasharray="4 3"/>`;
  }
  if(id==='lil'){ // backwards cap: brim pokes out the back (left)
    const y=g.t+h*.24;
    under+=`<g clip-path="url(#body)"><path d="M0 0H200V${y+1}Q${cx} ${y-7} 0 ${y+1}Z" fill="#3B82F6"/><path d="M0 ${y+1}Q${cx} ${y-7} 200 ${y+1}" fill="none" stroke="${INK}" stroke-width="${SW}"/></g>`;
    over+=`<path d="M${cx-g.w*.36} ${y-2}Q${cx-g.w*.66} ${y-6} ${cx-g.w*.7} ${y+6}Q${cx-g.w*.5} ${y+8} ${cx-g.w*.3} ${y+4}Z" fill="#3B82F6" stroke="${INK}" stroke-width="${SW*.8}" stroke-linejoin="round"/>`;
    over+=`<circle cx="${cx+4}" cy="${g.t+3}" r="5" fill="#3B82F6" stroke="${INK}" stroke-width="3.5"/>`;
  }
  return {under,over};
}

function bodyGroup(id,mood,look){
  const g=GANG[id],F=face(id,mood,look),P=props(id,F,look),e=egg(g);
  return {defs:`<clipPath id="body"><path d="${e}"/></clipPath>`,
    s:`<path d="${e}" fill="${g.c}"/><g clip-path="url(#body)"><path d="M${100+g.w*.2} ${g.t}C${100+g.w*.7} ${g.t+20} ${100+g.w*.6} ${g.b} ${100+g.w*.05} ${g.b+2}L260 300V0Z" fill="#000" opacity=".07"/></g>`+P.under+`<path d="${e}" fill="none" stroke="${INK}" stroke-width="${SW}"/>`+F.s+P.over};
}

const svg=(vb,w,h,defs,body)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}"><defs>${defs}</defs>${body}</svg>`;
const url=s=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);

// standing pose (portraits, picker, reactions)
function stand(id,mood='neutral'){
  const g=GANG[id],B=bodyGroup(id,mood,0),cx=100,h=g.b-g.t,ay=g.t+h*.58,hw=g.w*.42;
  let s='';
  s+=limb(`M${cx-14} ${g.b-6}L${cx-16} ${g.b+22}L${cx-32} ${g.b+24}`,g.c)+limb(`M${cx+14} ${g.b-6}L${cx+16} ${g.b+22}L${cx+32} ${g.b+24}`,g.c);
  const up=mood==='happy';
  s+=limb(`M${cx-hw} ${ay-8}Q${cx-hw-16} ${ay+14} ${cx-hw-12} ${ay+40}`,g.c,14);
  s+=up?limb(`M${cx+hw} ${ay-10}Q${cx+hw+24} ${ay-20} ${cx+hw+20} ${ay-46}`,g.c,14)
       :mood==='sad'?limb(`M${cx+hw} ${ay-8}Q${cx+hw+16} ${ay+14} ${cx+hw+12} ${ay+40}`,g.c,14)
       :limb(`M${cx+hw} ${ay-8}Q${cx+hw+22} ${ay+4} ${cx+hw+20} ${ay-22}`,g.c,14);
  if(mood==='sad')s+=`<path d="M${cx+g.w*.36} ${g.t+h*.12}q-7 11 0 15q7 -4 0 -15Z" fill="#7FD3FF" stroke="${INK}" stroke-width="3"/>`;
  if(mood==='happy')s+=`<path d="M${cx-g.w*.62} ${g.t+6}l4 10l10 4l-10 4l-4 10l-4 -10l-10 -4l10 -4Z" fill="#FFC531" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
  return svg('0 -4 200 220',400,440,B.defs,s+B.s);
}

// side-on in a little kart, facing right
function kart(id){
  const g=GANG[id],B=bodyGroup(id,'neutral',1),sc=.74,tx=104-100*sc,ty=128-g.b*sc;
  const h=g.b-g.t,ay=ty+(g.t+h*.6)*sc,ax=104+g.w*.26;
  let s=`<g transform="translate(${tx} ${ty}) scale(${sc})">${B.s}</g>`;
  s+=limb(`M${ax} ${ay}Q${ax+22} ${ay+6} ${164} ${92}`,g.c,13);
  s+=`<path d="M180 116L162 86" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><ellipse cx="160" cy="86" rx="5" ry="13" fill="${INK}"/>`;
  s+=`<path d="M38 110H196Q226 110 238 128Q242 142 226 144H42Q26 144 26 128Q26 110 38 110Z" fill="${g.kart}" stroke="${INK}" stroke-width="5.5" stroke-linejoin="round"/>`;
  s+=`<path d="M46 122H200" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".85"/>`;
  [[62,144,22],[204,146,19]].forEach(([x,y,r])=>{s+=`<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}"/><circle cx="${x}" cy="${y}" r="${r*.38}" fill="#E8ECF4"/>`});
  return svg('0 0 260 172',520,344,B.defs.replace('id="body"','id="body"'),s);
}

const cache={};
window.GANG=GANG;
window.blobKart=id=>cache['k'+id]||(cache['k'+id]=url(kart(id)));
window.blobFace=(id,mood='neutral')=>cache['f'+id+mood]||(cache['f'+id+mood]=url(stand(id,mood)));
})();
