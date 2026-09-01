window.Contact=(function(){
var built=false,raf=null,cv,ctx,W=0,H=0,dots=[],ripples=[],lastX=-1,lastY=-1,lastT=0,ripT=0;
var GREET='Hey! Ask me about my projects, skills, or how to reach me.';
var FALLBACK='I am the mini bot for D L Narayana. Try asking about projects, skills, or contact.';
var REPLIES=[
[/city|civic|help/i,'CityHelp is my realtime civic reporting app for Hyderabad. Live at cityhelp-sage.vercel.app'],
[/stay|nest|travel|hotel/i,'StayNest is a curated stays platform. Live at staynest-two.vercel.app'],
[/resume|forge|ats|cv/i,'ResumeForge builds ATS-scored resumes with live preview. Live at resumeforge-ruby-rho.vercel.app'],
[/skill|stack|tool|figma|design/i,'I work with Figma, UI/UX research, HTML/CSS/JS, GSAP motion, React basics and design systems.'],
[/mail|contact|hire|reach|email/i,'Reach me at nvr0910@gmail.com or hit the Email Me button above.'],
[/project|work|built|portfolio/i,'Three shipped products: CityHelp, StayNest and ResumeForge. Scroll back to Projects to explore.'],
[/hi|hello|hey/i,GREET]];
function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;}
function fit(){
if(!cv)return;
cv.width=W=window.innerWidth;cv.height=H=window.innerHeight;
dots=[];var SP=46;
for(var y=SP/2;y<H;y+=SP)for(var x=SP/2;x<W;x+=SP)dots.push({x:x,y:y,tw:Math.random()*6.283});}
function loop(ts){
var t=ts/1000;
ctx.fillStyle='#0d0713';ctx.fillRect(0,0,W,H);
var bl=[[0.28+0.1*Math.sin(t*0.4),0.4,'rgba(150,20,110,0.16)'],[0.72+0.1*Math.cos(t*0.33),0.62,'rgba(70,40,190,0.14)']];
for(var k=0;k<2;k++){var b=bl[k];
var g=ctx.createRadialGradient(b[0]*W,b[1]*H,0,b[0]*W,b[1]*H,0.5*Math.max(W,H));
g.addColorStop(0,b[2]);g.addColorStop(1,'rgba(13,7,19,0)');
ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
var live=[];
for(k=0;k<ripples.length;k++)if(ts-ripples[k].t0<1700)live.push(ripples[k]);
ripples=live;
for(k=0;k<dots.length;k++){
var d=dots[k],dx=0,dy=0,hl=0;
for(var r=0;r<ripples.length;r++){
var rp=ripples[r],age=(ts-rp.t0)/1000;
var vx=d.x-rp.x,vy=d.y-rp.y,dist=Math.sqrt(vx*vx+vy*vy)+0.01;
var R=age*760,gg=Math.exp(-Math.pow(dist-R,2)/4050)*(1-age/1.7);
dx+=vx/dist*gg*30;dy+=vy/dist*gg*30;
if(gg>hl)hl=gg;}
var a=0.16+0.14*Math.sin(t*1.4+d.tw);
ctx.fillStyle='rgba(255,255,255,'+(a+hl*0.5)+')';
ctx.fillRect(d.x+dx-1,d.y+dy-1,2,2);
if(hl>0.08){
ctx.fillStyle='rgba(122,184,255,'+(hl*0.9)+')';
ctx.fillRect(d.x+dx-1.5,d.y+dy-1.5,3,3);}}
raf=requestAnimationFrame(loop);}
function toast(msg){
var tt=document.getElementById('ctToast');
tt.textContent=msg;
gsap.fromTo(tt,{opacity:0,y:8},{opacity:1,y:0,duration:0.3});
gsap.to(tt,{opacity:0,duration:0.4,delay:1.6});}
function build(){
if(built)return;built=true;
var root=el('div','');root.id='contactStage';
root.innerHTML='<canvas id="ctBg"></canvas>'+
'<div id="ctMarquee"><div class="mqTrack"></div></div>'+
'<div id="ctInner">'+
'<div id="ctFeat"></div>'+
'<div id="ctCta"><h2>Have an idea?<br>Let&rsquo;s build it.</h2>'+
'<div id="ctBtns">'+
'<a class="btnShiny" href="mailto:nvr0910@gmail.com"><span>Email Me</span></a>'+
'<a class="btnGrad" href="https://github.com/D-L-Narayana" target="_blank" rel="noopener">GitHub</a>'+
'<button type="button" class="btnGlass" data-act="resume"><i></i><span>My Resume</span></button>'+
'</div></div>'+
'<div id="ctChat"><div class="chHead">ASK MY PORTFOLIO</div><div class="chLog"></div>'+
'<form class="chForm"><input class="chIn" type="text" placeholder="Ask about projects, skills, contact..." maxlength="120"><button class="chSend" type="submit" aria-label="Send">&#8594;</button></form></div>'+
'</div>'+
'<div id="ctDock">'+
'<button type="button" class="dkPill" data-act="home">HOME</button>'+
'<a class="dkBtn" href="https://github.com/D-L-Narayana" target="_blank" rel="noopener" aria-label="GitHub">GH</a>'+
'<a class="dkBtn" href="mailto:nvr0910@gmail.com" aria-label="Email">&#9993;</a>'+
'<button type="button" class="dkBtn" data-act="share" aria-label="Copy link">&#8599;</button>'+
'<button type="button" class="dkBtn" data-act="heart" aria-label="Like">&#9825;</button>'+
'</div>'+
'<div id="ctToast"></div>';
document.body.appendChild(root);
var words=['FIGMA','UI/UX','GSAP MOTION','HTML &middot; CSS &middot; JS','PROTOTYPING','DESIGN SYSTEMS','USER RESEARCH','REACT','RESPONSIVE'];
var htm='';for(var k=0;k<3;k++)for(var i=0;i<words.length;i++)htm+='<span>'+words[i]+'</span><i>&#10022;</i>';
root.querySelector('.mqTrack').innerHTML=htm;
var feats=[['&#9670;','UX Research','Interviews, journeys and testing that ground every decision.'],
['&#9650;','UI Design','Clean, bold interfaces built on a growing design system.'],
['&#9679;','Motion','GSAP-driven micro-interactions that make screens feel alive.'],
['&#9632;','Front-end','Hand-coded, responsive, zero-bloat HTML/CSS/JS.']];
var fw=root.querySelector('#ctFeat');
for(var j=0;j<feats.length;j++){
fw.appendChild(el('div','ctCard','<div class="ctIco">'+feats[j][0]+'</div><h3>'+feats[j][1]+'</h3><p>'+feats[j][2]+'</p>'));}
var log=root.querySelector('.chLog'),form=root.querySelector('.chForm'),inp=root.querySelector('.chIn');
function msg(txt,me){var m=el('div','chMsg'+(me?' me':''),txt);log.appendChild(m);log.scrollTop=log.scrollHeight;
gsap.fromTo(m,{opacity:0,y:8},{opacity:1,y:0,duration:0.3});}
msg(GREET,false);
form.addEventListener('submit',function(e){
e.preventDefault();
var q=inp.value.trim();if(!q)return;
inp.value='';msg(q,true);
var dtsEl=el('div','chMsg dots','&middot; &middot; &middot;');log.appendChild(dtsEl);log.scrollTop=log.scrollHeight;
setTimeout(function(){
log.removeChild(dtsEl);
var rr=FALLBACK;
for(var i=0;i<REPLIES.length;i++){if(REPLIES[i][0].test(q)){rr=REPLIES[i][1];break;}}
msg(rr,false);},700);});
root.addEventListener('click',function(e){
var b=e.target.closest('[data-act]');
if(!b)return;
var act=b.getAttribute('data-act');
if(act==='home'&&window.Nav)window.Nav.open('home');
if(act==='resume'&&window.Nav)window.Nav.open('resume');
if(act==='share'){
var link='https://dln-portfolio.vercel.app';
if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(link).then(function(){toast('Link copied');},function(){toast(link);});}
else{toast(link);}}
if(act==='heart'){
b.classList.add('loved');b.innerHTML='&#9829;';
gsap.fromTo(b,{scale:1},{scale:1.35,duration:0.18,yoyo:true,repeat:1,ease:'power2.out'});}});
root.addEventListener('pointermove',function(e){
var now=performance.now();
if(lastX>=0){
var dt=Math.max(1,now-lastT);
var v=Math.sqrt(Math.pow(e.clientX-lastX,2)+Math.pow(e.clientY-lastY,2))/dt;
if(v>0.85&&now-ripT>110){ripples.push({x:e.clientX,y:e.clientY,t0:now});ripT=now;}}
lastX=e.clientX;lastY=e.clientY;lastT=now;});
cv=root.querySelector('#ctBg');ctx=cv.getContext('2d',{desynchronized:true});
window.addEventListener('resize',fit);fit();}
function show(){
build();
gsap.set('#contactStage',{visibility:'visible'});
gsap.to('#contactStage',{opacity:1,duration:0.6});
gsap.fromTo('#ctInner',{y:36},{y:0,duration:0.9,ease:'power3.out'});
gsap.fromTo('.ctCard',{opacity:0,y:22},{opacity:1,y:0,duration:0.6,stagger:0.08,ease:'power2.out',delay:0.15});
gsap.fromTo('#ctDock',{opacity:0,y:20},{opacity:1,y:0,duration:0.7,ease:'power3.out',delay:0.3});
fit();if(!raf)raf=requestAnimationFrame(loop);}
function hide(){
if(raf){cancelAnimationFrame(raf);raf=null;}
gsap.to('#contactStage',{opacity:0,duration:0.45,onComplete:function(){gsap.set('#contactStage',{visibility:'hidden'});}});}
function addNav(){
if(document.querySelector('[data-m="contact"]'))return;
var items=document.querySelectorAll('.navItem');
if(!items.length)return;
var last=items[items.length-1];
var b=document.createElement('button');
b.type='button';b.className='navItem';b.setAttribute('data-m','contact');b.textContent='Contact';
last.parentNode.appendChild(b);
b.addEventListener('click',function(){if(window.Nav)window.Nav.open('contact');});}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',addNav);}else{addNav();}
return{show:show,hide:hide};
})();
