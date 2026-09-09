window.Ascii=(function(){
var cv,ctx,parts=[],ready=false,raf=null,W=0,H=0,DPR=1,mode='hide',start=0,imgEl=null,pend=null;
function ez(p){return 1-Math.pow(1-p,3);}
function ezi(p){return p*p*p;}
function size(){
DPR=Math.min(2,window.devicePixelRatio||1);
var h=Math.min(window.innerHeight*0.46,470);
var w=h*(imgEl.naturalWidth/imgEl.naturalHeight);
if(w>window.innerWidth*0.86){w=window.innerWidth*0.86;h=w*imgEl.naturalHeight/imgEl.naturalWidth;}
cv.style.width=Math.round(w)+'px';cv.style.height=Math.round(h)+'px';
cv.width=Math.round(w*DPR);cv.height=Math.round(h*DPR);
W=cv.width;H=cv.height;sample();}
function sample(){
var cols=140,rows=Math.round(cols*imgEl.naturalHeight/imgEl.naturalWidth),SS=3;
var oc=document.createElement('canvas');oc.width=cols*SS;oc.height=rows*SS;
var ox=oc.getContext('2d');ox.drawImage(imgEl,0,0,cols*SS,rows*SS);
var d=ox.getImageData(0,0,cols*SS,rows*SS).data;
parts=[];
var cw=W/cols,chh=H/rows,mx=1,i,L,x,y,ci;
var cell=new Float32Array(cols*rows);
for(y=0;y<rows*SS;y++)for(x=0;x<cols*SS;x++){
i=(y*cols*SS+x)*4;L=(d[i]+d[i+1]+d[i+2])/3;
ci=Math.floor(y/SS)*cols+Math.floor(x/SS);
if(L>cell[ci])cell[ci]=L;}
for(i=0;i<cell.length;i++)if(cell[i]>mx)mx=cell[i];
var nf=255/mx;
for(y=0;y<rows;y++)for(x=0;x<cols;x++){
L=cell[y*cols+x]*nf;
if(L<44)continue;
var a=Math.random()*Math.PI*2,r=(0.4+Math.random()*0.9)*Math.max(W,H);
parts.push({tx:(x+0.5)*cw,ty:(y+0.5)*chh,
sx:(x+0.5)*cw+Math.cos(a)*r,sy:(y+0.5)*chh+Math.sin(a)*r,
ch:L>215?'@':L>175?'#':L>135?'*':L>95?'+':L>65?':':'.',
o:Math.min(1,0.3+L/230),dl:Math.random()*0.5});}
ctx.font=Math.ceil(chh*1.12)+'px monospace';
ctx.textAlign='center';ctx.textBaseline='middle';}
function draw(now){
var el=(now-start)/1000,done=true,k,p,q,e;
ctx.clearRect(0,0,W,H);
ctx.fillStyle='#eef7ff';
if(mode==='in'){
for(k=0;k<parts.length;k++){
p=parts[k];q=(el-p.dl)/1.35;q=q<0?0:q>1?1:q;
if(q<1)done=false;e=ez(q);
ctx.globalAlpha=p.o*e;
ctx.fillText(p.ch,p.sx+(p.tx-p.sx)*e,p.sy+(p.ty-p.sy)*e);}}
else if(mode==='out'){
for(k=0;k<parts.length;k++){
p=parts[k];q=(el-p.dl*0.35)/0.75;q=q<0?0:q>1?1:q;
if(q<1)done=false;e=ezi(q);
if(q<1){ctx.globalAlpha=p.o*(1-q);
ctx.fillText(p.ch,p.tx+(p.sx-p.tx)*e*0.55,p.ty+(p.sy-p.ty)*e*0.55);}}}
ctx.globalAlpha=1;
if(!done){raf=requestAnimationFrame(draw);}
else{raf=null;if(mode==='out')ctx.clearRect(0,0,W,H);}}
function play(m){
if(!ready){pend=m;return;}
mode=m;start=performance.now();
if(raf)cancelAnimationFrame(raf);
raf=requestAnimationFrame(draw);}
function boot(){
var wrap=document.createElement('div');wrap.id='aboutStage';
wrap.innerHTML='<div id="asciiPanel"><canvas id="ascii"></canvas></div><div id="aboutCap">About &mdash; I design and build web experiences</div>';
document.body.appendChild(wrap);
cv=document.getElementById('ascii');ctx=cv.getContext('2d',{desynchronized:true});
imgEl=new Image();
imgEl.onload=function(){ready=true;size();if(pend){var m=pend;pend=null;play(m);}};
imgEl.src='assets/ascii.jpg';
window.addEventListener('resize',function(){if(ready)size();});}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',boot);}else{boot();}
return{assemble:function(){play('in');},disperse:function(){play('out');}};
})();
window.Stage=(function(){
var s=0,bw=0,bh=0,acc=0,until=0,ok=false,MAX=5;
function readyFn(){
var nw=document.getElementById('nwrap');
bw=nw.offsetWidth;bh=nw.offsetHeight;ok=true;
gsap.to('#scrollHint',{opacity:0.7,duration:0.6});
gsap.set('#nav',{visibility:'visible'});
gsap.to('#nav',{opacity:1,duration:0.7,ease:'power2.out'});}
function moveName(){
var t=Math.min(1,s),sc=1-0.66*t;
var tx=(-(window.innerWidth/2)+(bw*0.34)/2+34)*t;
var ty=((window.innerHeight/2)-(bh*0.34)/2-46)*t;
if(s===0){gsap.to('#nwrap',{autoAlpha:0,duration:0.4});}
else{gsap.set('#nwrap',{visibility:'visible'});gsap.to('#nwrap',{autoAlpha:1,x:tx,y:ty,scale:sc,duration:1.15,ease:'power3.inOut'});}}
function enterAbout(){
gsap.set('#aboutStage',{visibility:'visible'});
gsap.to('#aboutStage',{opacity:1,duration:0.6,ease:'power2.out'});
gsap.fromTo('#aboutStage',{y:30},{y:0,duration:1,ease:'power3.out'});
window.Ascii.assemble();}
function exitAbout(){
window.Ascii.disperse();
gsap.to('#aboutStage',{opacity:0,duration:0.5,onComplete:function(){gsap.set('#aboutStage',{visibility:'hidden'});}});}
function enterInfo(){
document.body.className='theme-about';
if(window.Extras)window.Extras.globeOn();
gsap.set('#sec-about',{visibility:'visible'});
gsap.fromTo('#sec-about',{opacity:0,y:26},{opacity:1,y:0,duration:0.55,ease:'power2.out'});}
function exitInfo(){
if(document.body.className==='theme-about')document.body.className='';
if(window.Extras)window.Extras.globeOff();
gsap.to('#sec-about',{opacity:0,duration:0.4,onComplete:function(){gsap.set('#sec-about',{visibility:'hidden'});}});}
function enterRes(){
document.body.className='theme-resume';
gsap.set('#sec-resume',{visibility:'visible'});
gsap.fromTo('#sec-resume',{opacity:0,y:26},{opacity:1,y:0,duration:0.55,ease:'power2.out'});}
function exitRes(){
if(document.body.className==='theme-resume')document.body.className='';
gsap.to('#sec-resume',{opacity:0,duration:0.4,onComplete:function(){gsap.set('#sec-resume',{visibility:'hidden'});}});}
function enter(){
if(!window.Carousel.built()){window.Carousel.build();}
gsap.set('#proj',{visibility:'visible'});
gsap.to('#proj',{opacity:1,duration:0.7,ease:'power2.out'});
gsap.fromTo('#stripWrap',{y:40},{y:0,duration:0.7,ease:'power3.out'});}
function exitP(){
gsap.to('#proj',{opacity:0,duration:0.5,onComplete:function(){gsap.set('#proj',{visibility:'hidden'});}});}
function set(n,force){
n=Math.max(0,Math.min(MAX,n));
if(n===s&&!force)return;
var was=s;s=n;moveName();
gsap.to('#scrollHint',{opacity:s===0?0.7:0,duration:0.4});
if(s===0){window.Slider.show();}else if(was===0){window.Slider.hide();}
if(s===1){enterAbout();}else if(was===1){exitAbout();}
if(s===2){enterInfo();}else if(was===2){exitInfo();}
if(s===3){enter();}else if(was===3){exitP();}
if(s===4){enterRes();}else if(was===4){exitRes();}
if(s===5){window.Contact.show();}else if(was===5){window.Contact.hide();}
if(document.getElementById('corridor'))gsap.set('#corridor',{autoAlpha:0});
if(window.Nav)window.Nav.sync(s===5?'contact':s===4?'resume':s===3?'projects':s===2?'about':'home');}
function route(delta,ts){
if(window.Overlay.isOpen()){window.Overlay.wheel(delta);return;}
if(!ok)return;
var now=ts||Date.now();
if(now<until)return;
acc+=delta;
if(Math.abs(acc)<60)return;
var dir=acc>0?1:-1;acc=0;
if(s===2||s===4){
var sel=document.getElementById(s===2?'sec-about':'sec-resume');
if(sel){
var can=dir>0?(sel.scrollTop+sel.clientHeight<sel.scrollHeight-6):(sel.scrollTop>6);
if(can){sel.scrollBy({top:dir*260,behavior:'smooth'});until=now+150;return;}}}
until=now+620;
if(s===3){
if(dir>0){if(!window.Carousel.next())set(4);}
else{if(!window.Carousel.prev())set(2);}}
else{set(s+dir);}}
function navBlocked(){
return !!(window.Nav&&window.Nav.blocked&&window.Nav.blocked());}
window.addEventListener('wheel',function(e){
if(navBlocked())return;
e.preventDefault();
route(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY,e.timeStamp);
},{passive:false});
var ly=null;
window.addEventListener('touchstart',function(e){ly=e.touches[0].clientY;},{passive:true});
window.addEventListener('touchmove',function(e){
if(navBlocked())return;
if(ly===null)return;
e.preventDefault();
var y=e.touches[0].clientY;
route((ly-y)*2,e.timeStamp);ly=y;
},{passive:false});
window.addEventListener('keydown',function(e){
if(s===3&&!navBlocked()&&!window.Overlay.isOpen()){
if(e.key==='ArrowRight')window.Carousel.next();
if(e.key==='ArrowLeft'){if(!window.Carousel.prev())set(MAX-1);}}});
window.addEventListener('resize',function(){if(s>0)moveName();});
return{set:set,ready:readyFn,stage:function(){return s;}};
})();
