window.Loader=(function(){
var done=0,total=5,cb=null,fin=false,t0=0,disp=0,v=0,raf=null;
function pct(){return done/total*100;}
function tick(){done++;}
function place(p){
var tr=document.getElementById('ldTrack'),b=document.getElementById('ldBlock');
if(tr&&b)b.style.left=Math.round((tr.offsetWidth-b.offsetWidth)*p/100)+'px';}
function realFinish(){
if(fin)return;fin=true;
if(raf)cancelAnimationFrame(raf);
place(100);
setTimeout(function(){
gsap.to('#loader',{opacity:0,duration:0.55,onComplete:function(){
document.getElementById('loader').style.display='none';
if(cb)cb();}});},420);}
function frame(){
if(fin)return;
var t=(Date.now()-t0)/1000;
var target=Math.min(100,pct()+15,(t/2.1)*100+6);
var gap=target-disp;
v+=gap*0.018+(Math.random()-0.5)*0.3;
v*=0.9;
if(Math.random()<0.035)v*=0.2;
disp+=v;
if(disp<0){disp=0;v=0;}
if(disp>target){disp=target;v*=0.3;}
place(disp);
if(disp>=99&&pct()>=100){realFinish();return;}
raf=requestAnimationFrame(frame);}
function run(onDone){
cb=onDone;t0=Date.now();
var jobs=[];
var canFonts=document.fonts&&document.fonts.load;
jobs.push(canFonts?document.fonts.load('400 100px "Archivo Black"'):Promise.resolve());
jobs.push(Promise.resolve());
window.PROJECTS.forEach(function(pr){
jobs.push(new Promise(function(res){
var im=new Image();
im.onload=res;im.onerror=res;
im.src=pr.img;}));});
jobs.forEach(function(j){Promise.resolve(j).then(tick,tick);});
raf=requestAnimationFrame(frame);
setTimeout(realFinish,9000);}
return{run:run};
})();
