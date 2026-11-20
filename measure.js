const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setContent(`<img id=r src="http://localhost:8859/ref.png">`);
  await p.waitForFunction(()=>{const r=document.getElementById('r');return r&&r.complete&&r.naturalWidth>0;});
  const bbox = await p.evaluate(()=>{
    const img=document.getElementById('r'); const W=img.naturalWidth,H=img.naturalHeight;
    const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.drawImage(img,0,0);
    const d=x.getImageData(0,0,W,H).data;
    let minx=W,maxx=0,miny=H,maxy=0,cnt=0;
    for(let y=0;y<H;y+=2){ for(let xx=0;xx<W;xx+=2){ const i=(y*W+xx)*4; const r=d[i],g=d[i+1],bl=d[i+2];
      // greenish character pixels (teal/jade), exclude near-white bg
      if(g>110 && g>r+25 && g>bl+10 && !(r>220&&g>220&&bl>220)){ if(xx<minx)minx=xx;if(xx>maxx)maxx=xx;if(y<miny)miny=y;if(y>maxy)maxy=y;cnt++; } } }
    return {W,H,minx,maxx,miny,maxy,cnt,cx:(minx+maxx)/2};
  });
  console.log(JSON.stringify(bbox));
  await b.close();
})().catch(e=>{console.error('FATAL',e);process.exit(1);});
