window.Loader=(function(){
var PH=[[0,'waking up'],[25,'loading fonts'],[55,'fetching projects'],[80,'almost there'],[100,'welcome']];
var done=0,total=5,cb=null,fin=false,t0=0,disp=0,raf=null,curLabel='';
function assetPct(){return done/total*100;}
function tick(){done++;}
function pick(v){var a=PH[0][1];PH.forEach(function(p){if(v>=p[0])a=p[1];});return a;}
function setLabel(l){
if(l===curLabel)return;curLabel=l;
var host=document.getElementById('ldPhase');
if(!host)return;
var old=host.querySelector('.ph');
if(old){old.className='ph old';gsap.to(old,{opacity:0,scale:1.35,filter:'blur(10px)',duration:0.4,ease:'power2.in',onComplete:function(){old.remove();}});}
var d=document.createElement('div');d.className='ph';
l.split('').forEach(function(ch){
var s=document.createElement('span');s.textContent=ch===' '?'\u00a0':ch;d.appendChild(s);});
host.appendChild(d);
gsap.fromTo(d,{opacity:0,scale:0.7,filter:'blur(12px)'},{opacity:1,scale:1,filter:'blur(0px)',duration:0.7,ease:'power3.out'});
gsap.fromTo(d.children,{opacity:0,y:12,filter:'blur(8px)'},{opacity:1,y:0,filter:'blur(0px)',duration:0.45,stagger:0.035,delay:0.12,ease:'power3.out'});}
function realFinish(){
if(fin)return;fin=true;
if(raf)cancelAnimationFrame(raf);
var bar=document.getElementById('ldBar');
if(bar)bar.style.width='100%';
setLabel('welcome');
setTimeout(function(){
gsap.to('#loader',{opacity:0,duration:0.5,onComplete:function(){
document.getElementById('loader').style.display='none';
if(cb)cb();}});},700);}
function frame(){
if(fin)return;
var timePct=Math.min(100,(Date.now()-t0)/2600*100);
var target=Math.min(timePct,assetPct()+15);
disp+=(target-disp)*0.12;
var bar=document.getElementById('ldBar');
if(bar)bar.style.width=disp+'%';
setLabel(pick(disp));
if(disp>=99.2&&assetPct()>=100){realFinish();return;}
raf=requestAnimationFrame(frame);}
function run(onDone){
cb=onDone;t0=Date.now();
setLabel(PH[0][1]);
var jobs=[];
var canFonts=document.fonts&&document.fonts.load;
jobs.push(canFonts?document.fonts.load('600 230px Caveat'):Promise.resolve());
jobs.push(canFonts?document.fonts.load('400 100px "Archivo Black"'):Promise.resolve());
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
