window.Loader=(function(){
var done=0,total=5,cb=null,fin=false,t0=0,disp=0,raf=null;
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
var timePct=Math.min(100,(Date.now()-t0)/1600*100);
var target=Math.min(timePct,pct()+15);
disp+=(target-disp)*0.14;
place(disp);
if(disp>=99.2&&pct()>=100){realFinish();return;}
raf=requestAnimationFrame(frame);}
function run(onDone){
cb=onDone;t0=Date.now();
var jobs=[];
var canFonts=document.fonts&&document.fonts.load;
jobs.push(canFonts?document.fonts.load('400 100px "Archivo Black"'):Promise.resolve());
jobs.push(canFonts?document.fonts.load('400 100px "Instrument Serif"'):Promise.resolve());
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
