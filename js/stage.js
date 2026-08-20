window.Stage=(function(){
var s=0,bw=0,bh=0,acc=0,until=0,ok=false;
function readyFn(){
var nw=document.getElementById('nwrap');
bw=nw.offsetWidth;bh=nw.offsetHeight;ok=true;
gsap.to('#scrollHint',{opacity:0.7,duration:0.6});}
function moveName(){
var t=s/3,sc=1-0.66*t;
var tx=(-(window.innerWidth/2)+(bw*0.34)/2+34)*t;
var ty=((window.innerHeight/2)-(bh*0.34)/2-46)*t;
gsap.to('#nwrap',{x:tx,y:ty,scale:sc,duration:0.65,ease:'power3.inOut'});}
function enter(){
if(!window.Carousel.built()){window.Carousel.build();}
gsap.set('#proj',{visibility:'visible'});
gsap.to('#proj',{opacity:1,duration:0.7,ease:'power2.out'});
gsap.fromTo('#stripWrap',{y:40},{y:0,duration:0.7,ease:'power3.out'});
gsap.set('#topbar',{visibility:'visible'});
gsap.to('#topbar',{opacity:1,duration:0.6});}
function exitP(){
gsap.to('#proj',{opacity:0,duration:0.5,onComplete:function(){gsap.set('#proj',{visibility:'hidden'});}});
gsap.to('#topbar',{opacity:0,duration:0.4,onComplete:function(){gsap.set('#topbar',{visibility:'hidden'});}});}
function set(n){
n=Math.max(0,Math.min(3,n));
if(n===s)return;
var was=s;s=n;moveName();
gsap.to('#scrollHint',{opacity:s===0?0.7:0,duration:0.4});
if(s===3){enter();}else if(was===3){exitP();}}
function route(delta,ts){
if(window.Overlay.isOpen()){window.Overlay.wheel(delta);return;}
if(!ok)return;
var now=ts||Date.now();
if(now<until)return;
acc+=delta;
if(Math.abs(acc)<60)return;
var dir=acc>0?1:-1;acc=0;until=now+460;
if(s<3){set(s+dir);}
else{
if(dir>0){window.Carousel.next();}
else{if(!window.Carousel.prev())set(2);}}}
window.addEventListener('wheel',function(e){
e.preventDefault();
route(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY,e.timeStamp);
},{passive:false});
var ly=null;
window.addEventListener('touchstart',function(e){ly=e.touches[0].clientY;},{passive:true});
window.addEventListener('touchmove',function(e){
if(ly===null)return;
e.preventDefault();
var y=e.touches[0].clientY;
route((ly-y)*2,e.timeStamp);ly=y;
},{passive:false});
window.addEventListener('keydown',function(e){
if(s===3&&!window.Overlay.isOpen()){
if(e.key==='ArrowRight')window.Carousel.next();
if(e.key==='ArrowLeft'){if(!window.Carousel.prev())set(2);}}});
document.getElementById('tbHome').addEventListener('click',function(){set(0);});
window.addEventListener('resize',function(){if(s>0)moveName();});
return{set:set,ready:readyFn,stage:function(){return s;}};
})();
