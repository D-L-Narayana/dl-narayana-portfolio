window.Nav=(function(){
var mode='home',ov=false;
function paint(){
document.querySelectorAll('.navItem').forEach(function(b){
b.classList.toggle('active',b.dataset.m===mode);});}
function sync(m){
ov=false;
if(m===mode)return;
mode=m;paint();}
function open(m){
if(m===mode)return;
var secs=['about','resume'];
if(m==='about'||m==='resume'){
mode=m;paint();
window.Extras.homeUi(false);
gsap.to('#stage',{opacity:0,duration:0.35});
gsap.to('#scrollHint',{opacity:0,duration:0.3});
gsap.to('#proj',{opacity:0,duration:0.35,onComplete:function(){gsap.set('#proj',{visibility:'hidden'});}});
gsap.to('#aboutStage',{opacity:0,duration:0.3,onComplete:function(){gsap.set('#aboutStage',{visibility:'hidden'});}});
secs.forEach(function(x){if(x!==m)gsap.set('#sec-'+x,{opacity:0,visibility:'hidden'});});
gsap.set('#sec-'+m,{visibility:'visible'});
gsap.fromTo('#sec-'+m,{opacity:0,y:26},{opacity:1,y:0,duration:0.55,ease:'power2.out'});
window.Extras.warp('#sec-'+m+' h2');
document.body.className='theme-'+m;
}else{
mode=m;paint();
secs.forEach(function(x){gsap.set('#sec-'+x,{opacity:0,visibility:'hidden'});});
document.body.className='';
gsap.to('#stage',{opacity:1,duration:0.4});
window.Stage.set(m==='projects'?2:0,true);
if(m==='home')window.Extras.homeUi(true);}}
function init(){
document.querySelectorAll('.navItem').forEach(function(b){
b.addEventListener('click',function(){open(b.dataset.m);});});}
return{init:init,open:open,sync:sync,blocked:function(){return ov;},mode:function(){return mode;}};
})();
