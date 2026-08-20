const{chromium}=require('playwright');
(async()=>{
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1280,height:800}});
const errs=[];
p.on('pageerror',e=>errs.push('PAGE:'+e.message));
p.on('console',m=>{if(m.type()==='error')errs.push('CON:'+m.text());});
await p.goto('http://localhost:8093/',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(500);
await p.screenshot({path:'shots/u0-loader.png'});
await p.waitForTimeout(3600);
await p.screenshot({path:'shots/u1-hello.png'});
await p.waitForTimeout(5200);
await p.screenshot({path:'shots/u2-name.png'});
for(let i=0;i<3;i++){await p.mouse.move(640,400);await p.mouse.wheel(0,150);await p.waitForTimeout(750);}
await p.waitForTimeout(1400);
await p.screenshot({path:'shots/u3-projects.png'});
const cards=await p.locator('.card').count();
await p.locator('.card').first().hover();
await p.waitForTimeout(1700);
await p.screenshot({path:'shots/u4-overlay.png'});
for(let i=0;i<8;i++){await p.mouse.wheel(0,320);await p.waitForTimeout(140);}
await p.waitForTimeout(1100);
await p.screenshot({path:'shots/u5-expanded.png'});
await b.close();
console.log('E2E_RESULTS '+JSON.stringify({cards:cards,errors:errs}));
if(cards!==3)process.exit(1);
})().catch(e=>{console.error('E2E_FAIL',e.message);process.exit(1);});
