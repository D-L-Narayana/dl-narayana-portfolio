const{chromium}=require('playwright');
(async()=>{
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1280,height:800}});
const errs=[];
p.on('pageerror',e=>errs.push('PAGE:'+e.message));
p.on('console',m=>{if(m.type()==='error')errs.push('CON:'+m.text());});
await p.goto('http://localhost:8090/',{waitUntil:'load'});
await p.waitForTimeout(1800);
await p.screenshot({path:'shots/hello.png'});
await p.waitForTimeout(4700);
await p.screenshot({path:'shots/name.png'});
const n=await p.locator('#name span').count();
const vis=await p.locator('#nwrap').isVisible();
const title=await p.title();
await b.close();
console.log('E2E_RESULTS '+JSON.stringify({spans:n,nameVisible:vis,title:title,errors:errs}));
if(n!==12||!vis)process.exit(1);
})().catch(e=>{console.error('E2E_FAIL',e.message);process.exit(1);});
