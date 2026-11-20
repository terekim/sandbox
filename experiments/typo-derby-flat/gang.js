// Typo Derby Flat: the gang as plain hand-inked blobs.
// Bean bodies, tiny eyes perched on a big nose, droopy cheek lines,
// noodle arms, pancake feet. Generated SVG, so no image files.
(function(){
const INK='#141414',SW=4.6;
// t/b: body top and bottom, w: width, top/bot: how full the top/bottom are,
// nose: [rx,ry], mouth: 'whisk' (cheek lines from the nose) or 'arc' (curve under it)
const GANG={
  thumbs:{name:'Thumbs',      c:'#3CCDF6',n:'#FF2414',kart:'#FF2414',t:22, b:170,w:132,top:.44, bot:.66,nose:[15,24],mouth:'whisk',ey:.2},
  pops:  {name:'Pops Pointer',c:'#3DAD4E',n:'#F25C45',kart:'#3CCDF6',t:66, b:172,w:132,top:.6, bot:.62,nose:[22,19],mouth:'arc',  ey:-.12},
  birdie:{name:'Birdie',      c:'#FFD02B',n:'#FF2414',kart:'#3DAD4E',t:12, b:172,w:94, top:.56,bot:.6, nose:[13,21],mouth:'whisk',ey:.16},
  sir:   {name:'Sir Ringsley',c:'#A98CF2',n:'#FF5A3C',kart:'#FFD02B',t:40, b:172,w:122,top:.46,bot:.7, nose:[17,20],mouth:'arc',  ey:.12},
  lil:   {name:'Lil Pink',    c:'#FF9BC0',n:'#FF2414',kart:'#A98CF2',t:100, b:174,w:112,top:.6, bot:.62,nose:[16,15],mouth:'arc',  ey:-.1}
};
const halfW=(g,y)=>{let best=0,bd=1e9;for(let i=0;i<=200;i++){const u=i/200,m=1-u,yy=m*m*m*g.t+3*m*m*u*g.t+3*m*u*u*g.b+u*u*u*g.b,xx=3*m*m*u*g.w*g.top+3*m*u*u*g.w*g.bot;const d=Math.abs(yy-y);if(d<bd){bd=d;best=xx}}return best};
const egg=g=>{const {t,b,w}=g,cx=100;return `M${cx} ${t}C${cx+w*g.top} ${t} ${cx+w*g.bot} ${b} ${cx} ${b}C${cx-w*g.bot} ${b} ${cx-w*g.top} ${t} ${cx} ${t}Z`};
// an outlined noodle: ink stroke under a thinner colored stroke
const limb=(d,col,wd=12)=>`<path d="${d}" fill="none" stroke="${INK}" stroke-width="${wd}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${wd-SW*1.5}" stroke-linecap="round" stroke-linejoin="round"/>`;
const line=(d,w=3.6)=>`<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

function face(id,mood,look){
  const g=GANG[id],h=g.b-g.t,cx=100,[rx,ry]=g.nose;
  const ny=g.t+h*g.ey+20+ry*.55, nx=cx+look*5;
  const ey=ny-ry-3, er=7.2;
  let s='';
  // cheek lines / mouth (drawn first so the nose sits on top)
  if(g.mouth==='whisk'){
    const cheek=(k,end,lift)=>line(`M${nx+k*rx*.92} ${ny-ry*.15}Q${nx+k*(rx+16)} ${ny-ry*lift} ${nx+k*(rx+28)} ${ny+end}`);
    if(mood==='happy')s+=cheek(-1,-ry*.55,-.2)+cheek(1,-ry*.55,-.2);
    else if(mood==='smug')s+=cheek(-1,ry*.9,.4)+cheek(1,-ry*.5,-.1);
    else s+=cheek(-1,ry*(mood==='sad'?1.25:.95),.45)+cheek(1,ry*(mood==='sad'?1.25:.95),.45);
  }else{
    const y=ny+ry-2;
    if(mood==='happy')s+=line(`M${nx-rx-12} ${y-4}Q${nx} ${y+22} ${nx+rx+12} ${y-4}`);
    else if(mood==='smug')s+=line(`M${nx-rx-10} ${y+8}Q${nx} ${y+14} ${nx+rx+14} ${y-2}`);
    else s+=line(`M${nx-rx-16} ${y+(mood==='sad'?22:16)}Q${nx-rx-8} ${y-2} ${nx} ${y+2}Q${nx+rx+8} ${y-2} ${nx+rx+16} ${y+(mood==='sad'?22:16)}`);
  }
  // eyes: two small ovals touching, perched on the nose
  const pdx=mood==='smug'?2.4:look*2.2, pdy=mood==='sad'?2:mood==='happy'?-1.6:-.6;
  [-1,1].forEach(k=>{const ex=nx+k*(er+.6);
    s+=`<ellipse cx="${ex}" cy="${ey}" rx="${er}" ry="${er*1.22}" fill="#fff" stroke="${INK}" stroke-width="3.6"/>`;
    s+=`<circle cx="${ex+pdx+k*.4}" cy="${ey+pdy}" r="2.7" fill="${INK}"/>`;
  });
  if(mood==='sad')s+=line(`M${nx-er*2} ${ey-er*1.4}l${er*.9} -3M${nx+er*2} ${ey-er*1.4}l${-er*.9} -3`,3.2);
  // nose
  s+=`<ellipse cx="${nx}" cy="${ny}" rx="${rx}" ry="${ry}" fill="${g.n}" stroke="${INK}" stroke-width="${SW}"/>`;
  return s;
}

// arms
const hand=(x,y,k)=>line(`M${x-k*4} ${y-3}v10M${x} ${y-1}v10M${x+k*4} ${y-3}v9`,3);
// arms start inside the body; the shoulder gets painted over afterwards so they grow out of it
const hangL=(x,y,len,col)=>limb(`M${x+9} ${y-8}Q${x-6} ${y+len*.35} ${x-4} ${y+len}`,col,14)+hand(x-4,y+len+4,1);
const hangR=(x,y,len,col)=>limb(`M${x-9} ${y-8}Q${x+6} ${y+len*.35} ${x+4} ${y+len}`,col,14)+hand(x+4,y+len+4,-1);
function thumbsUp(g,hw,col){ // fist at chest height; the arm drops into a U outside the body and rises to the shoulder
  const cx=100,h=g.b-g.t,fx=cx+hw*.52,fy=g.t+h*.7,by=Math.min(g.b+4,fy+h*.36),ox=cx+hw+12,sy=g.t+h*.46;
  let s=limb(`M${fx+6} ${fy+6}C${fx+8} ${by} ${ox+6} ${by+6} ${ox} ${fy}S${cx+hw-2} ${sy+8} ${cx+hw-6} ${sy}`,col,13);
  s+=`<path d="M${fx-10} ${fy-7}h20a7.5 7.5 0 0 1 0 15h-20a7.5 7.5 0 0 1 0 -15Z" fill="${col}" stroke="${INK}" stroke-width="3.8" stroke-linejoin="round"/>`;
  s+=line(`M${fx-7} ${fy+1}h12`,2.6);
  s+=`<path d="M${fx-7} ${fy-6}v-16a5.2 5.2 0 0 1 10.4 0v16Z" fill="${col}" stroke="${INK}" stroke-width="3.8" stroke-linejoin="round"/>`;
  return s;
}
const legs=g=>{const b=g.b-4,L=40;
  const foot=(x,dir)=>`<path d="M${x-dir*6} ${b+L-6}Q${x+dir*16} ${b+L-6} ${x+dir*32} ${b+L+2}Q${x+dir*34} ${b+L+8} ${x+dir*24} ${b+L+8}H${x-dir*8}Q${x-dir*11} ${b+L} ${x-dir*6} ${b+L-6}Z" fill="${g.c}" stroke="${INK}" stroke-width="3.8" stroke-linejoin="round"/>`;
  return limb(`M88 ${b}V${b+L}`,g.c,14)+limb(`M112 ${b}V${b+L}`,g.c,14)+foot(88,-1)+foot(112,1)};

const WOBBLE=`<filter id="ink" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="1.7"/></filter>`;
const svg=(vb,w,h,body)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}"><defs>${WOBBLE}</defs><g filter="url(#ink)">${body}</g></svg>`;
const url=s=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
const bodyShape=g=>`<path d="${egg(g)}" fill="${g.c}" stroke="${INK}" stroke-width="${SW}"/>`;

// standing pose: portraits, picker, reactions
function stand(id,mood='neutral'){
  const g=GANG[id],h=g.b-g.t,cx=100,yA=g.t+h*.5,hw=halfW(g,yA),len=Math.max(44,g.b-yA+4);
  let s=legs(g)+`<path d="${egg(g)}" fill="${g.c}" stroke="${INK}" stroke-width="${SW}"/>`;
  // arms hang just outside the body, drawn in front so their outline overlaps the edge
  s+=hangL(cx-hw,yA,len,g.c);
  if(mood!=='happy')s+=hangR(cx+hw,yA,len,g.c);
  // repaint the body above the shoulders so the arm tops disappear into it
  s+=`<clipPath id="sh"><rect x="-20" y="-20" width="240" height="${yA+9+20}"/></clipPath><path d="${egg(g)}" fill="${g.c}" stroke="${INK}" stroke-width="${SW}" clip-path="url(#sh)"/>`;
  if(mood==='happy')s+=thumbsUp(g,hw,g.c);
  s+=face(id,mood,mood==='smug'?1:0);
  return svg('-6 -8 212 252',424,504,s);
}

// side-on in a little kart, facing right
function kart(id){
  const g=GANG[id],sc=.7,tx=104-100*sc,ty=126-g.b*sc;
  const h=g.b-g.t,ay=ty+(g.t+h*.55)*sc,ax=104+g.w*.24;
  let s=`<g transform="translate(${tx} ${ty}) scale(${sc})">${bodyShape(g)}${face(id,'neutral',1)}</g>`;
  s+=limb(`M${ax-6} ${ay}Q${ax+20} ${ay+8} ${158} ${92}`,g.c,10);
  s+=line(`M178 114L162 84`,5)+`<ellipse cx="160" cy="84" rx="4.5" ry="13" fill="${INK}"/>`;
  s+=`<path d="M38 110H196Q226 110 238 128Q242 142 226 144H42Q26 144 26 128Q26 110 38 110Z" fill="${g.kart}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>`;
  [[62,146,20],[204,147,17]].forEach(([x,y,r])=>{s+=`<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}"/><circle cx="${x}" cy="${y}" r="${r*.36}" fill="#fff"/>`});
  return svg('0 0 260 172',520,344,s);
}

const cache={};
window.GANG=GANG;
window.blobKart=id=>cache['k'+id]||(cache['k'+id]=url(kart(id)));
window.blobFace=(id,mood='neutral')=>cache['f'+id+mood]||(cache['f'+id+mood]=url(stand(id,mood)));
})();
