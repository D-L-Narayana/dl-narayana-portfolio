window.Overlay=(function(){
var el,card,imgEl,bgI,det,titleEl,hint,odT,odA,odF,odL;
var on=false,p=0,tp=0,timer=null,raf=null;
function init(){
el=document.getElementById('overlay');card=document.getElementById('ovCard');
imgEl=document.getElementById('ovImg');bgI=document.getElementById('ovBg');
det=document.getElementById('ovDetails');titleEl=document.getElementById('ovTitle');
hint=document.getElementById('ovHint');
odT=document.getElementById('odTitle');odA=document.getElementById('odAbout');
odF=document.getElementById('odFeats');odL=document.getElementById('odLink');
document.getElementById('ovClose').addEventListener('click',close);
window.addEventListener('keydown',function(e){if(e.key==='Escape')close();});}
function arm(pr,btn,focused){
if(!focused||on)return;
timer=setTimeout(function(){
gsap.to(btn,{scale:1.07,duration:0.3,ease:'power2.out'});
timer=setTimeout(function(){gsap.to(btn,{scale:1,duration:0.25});open(pr);},450);
},550);}
function disarm(btn){
if(timer){clearTimeout(timer);timer=null;}
if(!on)gsap.to(btn,{scale:1,duration:0.25});}
function open(pr){
if(on)return;
on=true;p=0;tp=0;
imgEl.src=pr.img;bgI.src=pr.img;
titleEl.textContent=pr.title.replace('\n',' ');
odT.textContent=pr.title.replace('\n',' ');
odA.textContent=pr.about;
odF.innerHTML='';
pr.feats.forEach(function(f){var li=document.createElement('li');li.textContent=f;odF.appendChild(li);});
odL.href=pr.url;
el.style.display='block';
gsap.fromTo(el,{opacity:0},{opacity:1,duration:0.4});
apply(0);
if(raf)cancelAnimationFrame(raf);
loop();}
function close(){
if(!on)return;on=false;
if(raf){cancelAnimationFrame(raf);raf=null;}
gsap.to(el,{opacity:0,duration:0.3,onComplete:function(){el.style.display='none';}});}
function wheel(d){tp=Math.max(0,Math.min(2,tp+d/800));}
function loop(){p+=(tp-p)*0.14;apply(p);raf=requestAnimationFrame(loop);}
function apply(q){
var e1=Math.min(1,q),e2=Math.max(0,q-1);
var w0=Math.min(window.innerWidth*0.3,300),h0=window.innerHeight*0.42;
var w1=window.innerWidth*0.92,h1=window.innerHeight*0.86;
card.style.width=(w0+(w1-w0)*e1)+'px';
card.style.height=(h0+(h1-h0)*e1)+'px';
card.style.transform='translate(-50%,'+(-50-e2*10)+'%)';
card.style.borderRadius=(14-8*e1)+'px';
det.style.transform='translateY('+((1-e2)*100)+'%)';
hint.style.opacity=String(Math.max(0,1-q*2.5));
titleEl.style.opacity=String(Math.max(0,1-e2*1.4));}
return{init:init,arm:arm,disarm:disarm,open:open,close:close,wheel:wheel,isOpen:function(){return on;}};
})();
