const{chromium}=require('playwright');
(async()=>{
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1280,height:800}});
const errs=[];
p.on('pageerror',e=>errs.push('PAGE:'+e.message));
p.on('console',m=>{if(m.type()==='error')errs.push('CON:'+m.text());});
await p.goto('http://localhost:8091/',{waitUntil:'load'});
await p.waitForTimeout(6800);
await p.screenshot({path:'shots/s1-name.png'});
for(let i=0;i<3;i++){await p.mouse.move(640,400);await p.mouse.wheel(0,150);await p.waitForTimeout(750);}
await p.waitForTimeout(1400);
await p.screenshot({path:'shots/s2-projects.png'});
const cards=await p.locator('.card').count();
await p.locator('.card').first().hover();
await p.waitForTimeout(1700);
await p.screenshot({path:'shots/s3-overlay.png'});
for(let i=0;i<8;i++){await p.mouse.wheel(0,320);await p.waitForTimeout(140);}
await p.waitForTimeout(1100);
await p.screenshot({path:'shots/s4-expanded.png'});
const ovOpen=await p.locator('#overlay').isVisible();
await b.close();
console.log('E2E_RESULTS '+JSON.stringify({cards:cards,overlayOpen:ovOpen,errors:errs}));
if(cards!==3)process.exit(1);
})().catch(e=>{console.error('E2E_FAIL',e.message);process.exit(1);});
