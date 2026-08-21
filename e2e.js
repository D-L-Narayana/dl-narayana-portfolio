const{chromium}=require('playwright');
(async()=>{
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1280,height:800}});
const errs=[];
p.on('pageerror',e=>errs.push('PAGE:'+e.message));
p.on('console',m=>{if(m.type()==='error')errs.push('CON:'+m.text());});
await p.goto('http://localhost:8095/',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(1200);
await p.screenshot({path:'shots/w0-loader.png'});
await p.waitForTimeout(4400);
await p.screenshot({path:'shots/w1-hello.png'});
await p.waitForTimeout(5200);
await p.screenshot({path:'shots/w2-name.png'});
for(let i=0;i<2;i++){await p.mouse.move(640,400);await p.mouse.wheel(0,150);await p.waitForTimeout(900);}
await p.waitForTimeout(1500);
await p.screenshot({path:'shots/w3-projects.png'});
const cards=await p.locator('.card').count();
await p.locator('.card').first().hover();
await p.waitForTimeout(1700);
await p.screenshot({path:'shots/w4-overlay.png'});
await b.close();
console.log('E2E_RESULTS '+JSON.stringify({cards:cards,errors:errs}));
if(cards!==3)process.exit(1);
})().catch(e=>{console.error('E2E_FAIL',e.message);process.exit(1);});
