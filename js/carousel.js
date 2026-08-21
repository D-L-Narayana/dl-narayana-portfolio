window.Carousel=(function(){
var P=window.PROJECTS,idx=0,isBuilt=false;
var strip,cardH,cardW,gap,step,AR=1.7;
function xFor(i){return window.innerWidth/2-(i*step+cardW/2);}
function slide(anim){gsap.to(strip,{x:xFor(idx),duration:anim?0.8:0,ease:'power3.out'});}
function measure(){
cardH=Math.min(340,Math.max(120,window.innerHeight*0.26));
cardW=Math.round(cardH*AR);
gap=Math.max(18,Math.round(cardW*0.09));step=cardW+gap;
strip.style.gap=gap+'px';
document.getElementById('stripWrap').style.height=Math.ceil(cardH*1.16)+'px';
[].forEach.call(strip.children,function(el,i){
el.style.width=cardW+'px';
el.style.height=cardH+'px';
gsap.set(el,{scale:i===idx?1.12:1,transformOrigin:'50% 0%'});});
slide(false);}
function adoptAR(img){
if(!img.naturalWidth||!img.naturalHeight)return;
var r=img.naturalWidth/img.naturalHeight;
if(r<1.1)r=1.1;if(r>2.2)r=2.2;
if(Math.abs(r-AR)>0.01){AR=r;if(isBuilt)measure();}}
function setHead(){
var p=P[idx],h=document.getElementById('ptitle');h.innerHTML='';
p.title.split('\n').forEach(function(l,i){
var o=document.createElement('span');o.className='hlLine';
var s=document.createElement('span');s.className='hlIn';s.textContent=l;
o.appendChild(s);h.appendChild(o);
gsap.fromTo(s,{y:'110%'},{y:'0%',duration:0.62,delay:i*0.07,ease:'power3.out'});});
document.getElementById('pcredit').textContent=p.credit;
var m=document.getElementById('pmeta');m.innerHTML='';
p.meta.forEach(function(f,i){
var s=document.createElement('span');s.textContent=f;m.appendChild(s);
gsap.fromTo(s,{opacity:0,y:6},{opacity:0.85,y:0,duration:0.45,delay:0.12+i*0.06});});}
function rail(){
document.getElementById('railCur').textContent='0'+(idx+1);
gsap.to('#railFill',{left:(idx/P.length*100)+'%',duration:0.5,ease:'power3.out'});}
function focus(i){
i=Math.max(0,Math.min(P.length-1,i));
if(i===idx)return false;
idx=i;
[].forEach.call(strip.children,function(el,j){
gsap.to(el,{scale:j===idx?1.12:1,transformOrigin:'50% 0%',duration:0.55,ease:'power3.out'});
gsap.to(el.querySelector('.dimcard'),{opacity:j===idx?0:0.16,duration:0.55});});
slide(true);setHead();rail();return true;}
function build(){
strip=document.getElementById('strip');
P.forEach(function(p,i){
var b=document.createElement('button');
b.type='button';b.className='card';
b.setAttribute('aria-label',p.title.replace('\n',' '));
b.innerHTML='<img src="'+p.img+'" alt="" draggable="false"><span class="dimcard"'+(i===0?' style="opacity:0"':'')+'></span>';
var im=b.querySelector('img');
if(im.complete){adoptAR(im);}else{im.addEventListener('load',function(){adoptAR(im);});}
b.addEventListener('click',function(){if(i===idx){window.Overlay.open(p);}else{focus(i);}});
b.addEventListener('pointerenter',function(){window.Overlay.arm(p,b,i===idx);});
b.addEventListener('pointerleave',function(){window.Overlay.disarm(b);});
strip.appendChild(b);});
isBuilt=true;measure();setHead();rail();
window.addEventListener('resize',function(){if(isBuilt)measure();});}
return{build:build,built:function(){return isBuilt;},
next:function(){return focus(idx+1);},prev:function(){return focus(idx-1);},
index:function(){return idx;},count:P.length};
})();
