window.Loader=(function(){
var done=0,total=5,cb=null,fin=false,t0=0;
function paint(){
var bar=document.getElementById('ldBar');
if(bar)bar.style.width=Math.min(100,Math.round(done/total*100))+'%';}
function tick(){done++;paint();}
function realFinish(){
if(fin)return;fin=true;
var bar=document.getElementById('ldBar');
if(bar)bar.style.width='100%';
setTimeout(function(){
gsap.to('#loader',{opacity:0,duration:0.5,onComplete:function(){
document.getElementById('loader').style.display='none';
if(cb)cb();}});},380);}
function finish(){
var wait=Math.max(0,1400-(Date.now()-t0));
setTimeout(realFinish,wait);}
function run(onDone){
cb=onDone;t0=Date.now();paint();
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
Promise.all(jobs.map(function(j){return Promise.resolve(j).then(null,function(){});})).then(finish);
setTimeout(realFinish,9000);}
return{run:run};
})();
