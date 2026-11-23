// Type-A-Saurus character system.
// One drawer, built from the two reference characters (the blue thumbs-up bean and the green
// boulder pusher): flat body colour, one even black outline, small white eyes perched on a big
// red nose, thin cheek lines, tube limbs with finger lines, flat feet. Nothing else.
// Every character is drawn in a 200 x 260 box with its feet on y = 248.
(function(root){
const INK='#0B0B0C', NOSE='#F7271B', LW=2.6;            // line weight: about 1% of a figure's height
const COLORS={cyan:'#3CD3FA',green:'#3BAF50',yellow:'#FFD034',orange:'#FF8B2E',pink:'#FF86B8',purple:'#9C7BF2',red:'#FF5A4A',lime:'#B5E35A'};
const f=n=>Math.round(n*10)/10;
const stroke=(w=LW)=>`stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
// A tube limb: ink outline drawn wide, body colour drawn narrower on top.
const tube=(d,col,w=11)=>`<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w-LW*2}" stroke-linecap="round" stroke-linejoin="round"/>`;
// Bodies. bean: tall, narrow top (the blue reference). egg: round, slightly leaning (the green reference).
function bodyPath(type,cx,t,b){const h=b-t;
  if(type==='egg'){const w=h*.9,m=t+h*.55;   // the green: nearly round, widest just below the middle
    return `M${f(cx)} ${f(t)}C${f(cx+w*.3)} ${f(t)} ${f(cx+w*.5)} ${f(t+h*.24)} ${f(cx+w*.5)} ${f(m)}C${f(cx+w*.5)} ${f(t+h*.86)} ${f(cx+w*.28)} ${f(b)} ${f(cx)} ${f(b)}C${f(cx-w*.28)} ${f(b)} ${f(cx-w*.5)} ${f(t+h*.86)} ${f(cx-w*.5)} ${f(m)}C${f(cx-w*.5)} ${f(t+h*.24)} ${f(cx-w*.3)} ${f(t)} ${f(cx)} ${f(t)}Z`}
  const w=h*.82,m=t+h*.66;                     // the blue: soft dome on top, widest low down, flat-ish bottom
  return `M${f(cx)} ${f(t)}C${f(cx+w*.3)} ${f(t)} ${f(cx+w*.45)} ${f(t+h*.28)} ${f(cx+w*.5)} ${f(m)}C${f(cx+w*.53)} ${f(t+h*.95)} ${f(cx+w*.3)} ${f(b)} ${f(cx)} ${f(b)}C${f(cx-w*.3)} ${f(b)} ${f(cx-w*.53)} ${f(t+h*.95)} ${f(cx-w*.5)} ${f(m)}C${f(cx-w*.45)} ${f(t+h*.28)} ${f(cx-w*.3)} ${f(t)} ${f(cx)} ${f(t)}Z`}
// The face. nose: 'long' (tall drop, the blue) or 'round' (the green). mouth: 'cheeks' | 'frown' | 'smile' | 'none'.
function face(cx,ey,o){
  const er=o.type==='egg'?7.6:7,nose=o.nose||(o.type==='egg'?'round':'long');let s='';
  const nw=nose==='round'?19:14,nh=nose==='round'?16:27,ny=ey+er*.7+nh;
  if(o.mouth==='cheeks'||(!o.mouth&&nose==='long'))s+=`<path d="M${f(cx-nw*.95)} ${f(ny-nh*.45)}Q${f(cx-nw*2.2)} ${f(ny-nh*.2)} ${f(cx-nw*2.9)} ${f(ny+nh*.5)}M${f(cx+nw*.95)} ${f(ny-nh*.45)}Q${f(cx+nw*2)} ${f(ny-nh*.25)} ${f(cx+nw*2.5)} ${f(ny+nh*.35)}" fill="none" ${stroke(LW*.62)}/>`;
  if(o.mouth==='frown'||(!o.mouth&&nose==='round'))s+=`<path d="M${f(cx-nw*1.2)} ${f(ny+nh*1.55)}Q${f(cx)} ${f(ny+nh*.75)} ${f(cx+nw*1.2)} ${f(ny+nh*1.55)}" fill="none" ${stroke(LW*.62)}/>`;
  if(o.mouth==='smile')s+=`<path d="M${f(cx-nw*1.5)} ${f(ny+nh*.75)}Q${f(cx)} ${f(ny+nh*1.9)} ${f(cx+nw*1.5)} ${f(ny+nh*.75)}" fill="none" ${stroke(LW*.7)}/>`;
  s+=nose==='long'   // a teardrop: narrow at the top, full and round at the bottom
    ?`<path d="M${f(cx)} ${f(ny-nh)}C${f(cx+nw*.55)} ${f(ny-nh)} ${f(cx+nw*1.05)} ${f(ny+nh*.35)} ${f(cx+nw*.9)} ${f(ny+nh*.68)}C${f(cx+nw*.7)} ${f(ny+nh*1.05)} ${f(cx-nw*.7)} ${f(ny+nh*1.05)} ${f(cx-nw*.9)} ${f(ny+nh*.68)}C${f(cx-nw*1.05)} ${f(ny+nh*.35)} ${f(cx-nw*.55)} ${f(ny-nh)} ${f(cx)} ${f(ny-nh)}Z" fill="${NOSE}" ${stroke()}/>`
    :`<ellipse cx="${f(cx)}" cy="${f(ny)}" rx="${nw}" ry="${nh}" fill="${NOSE}" ${stroke()}/>`;
  const lk=o.look||0;
  [-1,1].forEach(k=>{const ex=cx+k*er*1.02;
    s+=`<ellipse cx="${f(ex)}" cy="${f(ey)}" rx="${er}" ry="${f(er*1.12)}" fill="#fff" ${stroke(LW*.85)}/>`;
    s+=`<circle cx="${f(ex+lk*er*.38-k*er*.12)}" cy="${f(ey+er*.12)}" r="${f(er*.36)}" fill="${INK}"/>`});
  return s}
const fingers=(x,y,dir)=>`<path d="M${f(x-3)} ${f(y)}v${f(dir*6)}M${f(x)} ${f(y+1)}v${f(dir*6)}M${f(x+3)} ${f(y)}v${f(dir*6)}" fill="none" ${stroke(LW*.6)}/>`;
const foot=(x,y,dir,col)=>`<path d="M${f(x-dir*6)} ${f(y-7)}L${f(x+dir*24)} ${f(y-4)}Q${f(x+dir*34)} ${f(y+1)} ${f(x+dir*22)} ${f(y+3)}L${f(x-dir*7)} ${f(y+3)}Q${f(x-dir*11)} ${f(y-2)} ${f(x-dir*6)} ${f(y-7)}Z" fill="${col}" ${stroke()}/>`;
// Poses: stand | thumbs | wave | cheer | run | push
function blob(o){
  const col=COLORS[o.color]||o.color||COLORS.cyan,type=o.type||'bean',pose=o.pose||'stand';
  const cx=100,ground=248,legLen=type==='egg'?32:46,b=ground-legLen-(pose==='run'?6:0),t=b-(o.h||(type==='egg'?150:178));
  const h=b-t,bw=type==='egg'?h*.9:h*.82;
  const side=y=>{const u=(y-t)/h;return bw*.5*Math.pow(Math.sin(Math.PI*Math.min(.98,Math.max(.04,type==='egg'?u*.92+.04:u*.76+.12))),.55)};
  let back='',front='';
  // legs and feet
  const lx=[cx-bw*.15,cx+bw*.15];
  if(pose==='run'){
    back+=tube(`M${f(lx[0])} ${f(b-6)}Q${f(lx[0]-16)} ${f(b+18)} ${f(lx[0]-30)} ${f(ground-14)}`,col,15)+foot(lx[0]-30,ground-10,-1,col);
    back+=tube(`M${f(lx[1])} ${f(b-6)}Q${f(lx[1]+20)} ${f(b+12)} ${f(lx[1]+12)} ${f(ground)}`,col,15)+foot(lx[1]+12,ground,1,col);
  }else lx.forEach((x,i)=>{const d=i?1:-1;back+=tube(`M${f(x)} ${f(b-6)}L${f(x+d*2)} ${f(ground-3)}`,col,17)+foot(x+d*2,ground,d,col)});
  // arms
  const ay=t+h*(type==='egg'?.55:.5),sl=cx-side(ay),sr=cx+side(ay);
  const hang=(x,d)=>tube(`M${f(x-d*5)} ${f(ay-h*.06)}Q${f(x+d*3)} ${f(ay+h*.12)} ${f(x+d*2)} ${f(ay+h*.42)}`,col,15)+fingers(x+d*2,ay+h*.42+5,1);
  if(pose==='stand'){front+=hang(sl,-1)+hang(sr,1)}
  if(pose==='thumbs'){front+=hang(sl,-1);
    const fx=cx+bw*.2,fy=t+h*.42;front+=tube(`M${f(sr-2)} ${f(ay-6)}Q${f(sr+10)} ${f(ay+h*.2)} ${f(sr-6)} ${f(ay+h*.24)}Q${f(fx-2)} ${f(ay+h*.22)} ${f(fx)} ${f(fy+8)}`,col,15);
    front+=`<path d="M${f(fx-6)} ${f(fy+10)}Q${f(fx-8)} ${f(fy)} ${f(fx-1)} ${f(fy+1)}L${f(fx-1)} ${f(fy-9)}Q${f(fx+2)} ${f(fy-14)} ${f(fx+5)} ${f(fy-9)}L${f(fx+5)} ${f(fy+2)}Q${f(fx+9)} ${f(fy+4)} ${f(fx+7)} ${f(fy+12)}Z" fill="${col}" ${stroke(LW*.9)}/>`}
  if(pose==='wave'){front+=hang(sl,-1)+tube(`M${f(sr-3)} ${f(ay)}Q${f(sr+22)} ${f(ay-10)} ${f(sr+18)} ${f(t+h*.08)}`,col,15)+fingers(sr+18,t+h*.08-4,-1)}
  if(pose==='cheer'){[[sl,-1],[sr,1]].forEach(([x,d])=>front+=tube(`M${f(x-d*3)} ${f(ay)}Q${f(x+d*22)} ${f(ay-14)} ${f(x+d*18)} ${f(t-6)}`,col,15)+fingers(x+d*18,t-10,-1))}
  if(pose==='run'){front+=tube(`M${f(sl+8)} ${f(ay-4)}Q${f(sl-16)} ${f(ay+16)} ${f(sl-10)} ${f(ay+38)}`,col,15)+tube(`M${f(sr-8)} ${f(ay+4)}Q${f(sr+20)} ${f(ay+2)} ${f(sr+16)} ${f(ay-26)}`,col,15)}
  if(pose==='push'){const bx=cx+bw*.62+26,by=ay+8;
    front+=tube(`M${f(cx-bw*.05)} ${f(ay+4)}L${f(bx-24)} ${f(ay-4)}`,col,11)+tube(`M${f(cx-bw*.05)} ${f(ay+16)}L${f(bx-24)} ${f(ay+10)}`,col,11);
    back+=`<path d="M${f(bx-26)} ${f(by+6)}C${f(bx-30)} ${f(by-40)} ${f(bx+34)} ${f(by-46)} ${f(bx+38)} ${f(by-2)}C${f(bx+42)} ${f(by+34)} ${f(bx-22)} ${f(by+40)} ${f(bx-26)} ${f(by+6)}Z" fill="#BDBDBD" ${stroke()}/><path d="M${f(bx+30)} ${f(by-40)}l5 -5M${f(bx+36)} ${f(by-34)}l5 -5" fill="none" ${stroke(LW*.6)}/>`}
  const lean=pose==='run'?8:0,lookX=pose==='run'||pose==='push'?bw*.12:0;
  const ey=type==='egg'?t+2:t+h*.16;
  const body=`<path d="${bodyPath(type,cx,t,b)}" fill="${col}" ${stroke()}/>`;
  const fc=face(cx+lookX,ey,{...o,type,look:pose==='run'||pose==='push'?1:o.look||0});
  return `<g transform="rotate(${lean} 100 ${b})">${back}${body}${front}${fc}</g>`}
function svg(o,{w,h,pad=8}={}){const inner=blob(o),x0=-pad-(o.pose==='push'?0:0),W=200+pad*2+(o.pose==='push'?70:0)+(o.pose==='run'?10:0);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0} ${-pad-14} ${W} ${260+pad*2+14}"${w?` width="${w}"`:''}${h?` height="${h}"`:''}>${inner}</svg>`}
// The cast: each character is one colour and one body type. No hats, no props (except the boulder).
const CAST={
  thumbs:{name:'Thumbs',color:'cyan',type:'bean'},
  boulder:{name:'Boulder',color:'green',type:'egg'},
  sunny:{name:'Sunny',color:'yellow',type:'bean',nose:'round',mouth:'smile'},
  tango:{name:'Tango',color:'orange',type:'egg',nose:'long'},
  bubbles:{name:'Bubbles',color:'pink',type:'egg',mouth:'smile'},
  grape:{name:'Grape',color:'purple',type:'bean'},
  chili:{name:'Chili',color:'red',type:'egg',nose:'round',mouth:'cheeks'},
  sprout:{name:'Sprout',color:'lime',type:'bean',nose:'round'},
};
// Scenery, drawn with the same flat colour and the same line.
const SCENE={
  cactus:(h=90)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 88 ${h+8}" height="${h}"><path d="M32 ${h}V18a8 8 0 0 1 16 0V${h}M32 50H22a8 8 0 0 1-8-8V30a6 6 0 0 1 12 0v10h6M48 58h10a8 8 0 0 0 8-8V36a6 6 0 0 0-12 0v12h-6" fill="${COLORS.green}" ${stroke()}/><path d="M38 26v4M42 40v4M37 56v4M20 36v3M60 44v3" ${stroke(LW*.6)}/><path d="M24 ${h}h32" ${stroke()}/></svg>`,
  rock:(w=46)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 54 34" width="${w}"><path d="M2 26C2 12 12 4 24 4s22 9 22 22Z" fill="#BDBDBD" ${stroke()}/></svg>`,
  bush:(w=50)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 58 40" width="${w}"><path d="M8 32C2 20 6 8 12 6c2 8 4 12 6 16C18 10 22 2 26 0c4 4 4 14 2 22c4-8 8-14 14-14c2 8-2 18-8 24Z" fill="${COLORS.green}" ${stroke()}/></svg>`,
  mound:(w=80)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 88 44" width="${w}"><path d="M2 38C4 14 22 4 40 4s36 10 38 34Z" fill="${COLORS.purple}" ${stroke()}/><path d="M26 18l-3 4M42 14l2 4M56 22l3 3M34 28l-2 3" ${stroke(LW*.7)}/></svg>`,
};
// The wordmark: each letter a cast colour, the same ink line.
function wordmark(text='TYPE-A-SAURUS'){const cols=['cyan','cyan','cyan','cyan','ink','green','ink','yellow','yellow','orange','pink','purple','green'];
  return [...text].map((ch,i)=>`<span style="color:${ch==='-'?INK:COLORS[cols[i%cols.length]]||INK}">${ch}</span>`).join('')}
// Head and shoulders, for round avatars.
function head(o,{w,h}={}){const type=o.type||'bean',t=type==='egg'?248-32-150:248-46-178,S=type==='egg'?120:118;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${100-S/2} ${t-16} ${S} ${S}"${w?` width="${w}"`:''}${h?` height="${h}"`:''}>${blob({...o,pose:'stand'})}</svg>`}
root.TAS={INK,NOSE,LW,COLORS,CAST,blob,svg,head,SCENE,wordmark};
})(typeof window!=='undefined'?window:globalThis);
if(typeof module!=='undefined')module.exports=globalThis.TAS;
