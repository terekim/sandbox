const { chromium } = require('playwright');
const SH='/tmp/claude-0/-home-user/fa58ae90-4d70-572b-8850-7ea8f05f7ca1/scratchpad';
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ deviceScaleFactor:1 });
  await p.goto('http://localhost:8857/overlay.html?cx=590&by=1690&s=13.6', { waitUntil:'networkidle' });
  await p.waitForFunction(()=>window.__ready, {timeout:5000});
  // crop to the character region of the 1179x2556 ref
  await p.screenshot({ path: SH+'/overlay1.png', clip:{ x:120, y:520, width:960, height:1250 } });
  await b.close();
})().catch(e=>{console.error('FATAL',e);process.exit(1);});
