const{chromium}=require('playwright');
const sites=[
['https://cityhelp-sage.vercel.app/','assets/cityhelp.png'],
['https://staynest-two.vercel.app/','assets/staynest.png'],
['https://resumeforge-ruby-rho.vercel.app/','assets/resumeforge.png']
];
(async()=>{
const b=await chromium.launch();
for(const[url,out]of sites){
try{
const p=await b.newPage({viewport:{width:900,height:1200}});
await p.goto(url,{waitUntil:'load',timeout:30000});
await p.waitForTimeout(3500);
await p.screenshot({path:out});
await p.close();
console.log('SHOT_OK '+out);
}catch(e){console.log('SHOT_FAIL '+out+' '+e.message);}
}
await b.close();
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
