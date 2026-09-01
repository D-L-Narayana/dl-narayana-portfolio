window.Contact=(function(){
var built=false,raf=null,t0=0,cv,ctx,W=0,H=0;
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
function fit(){if(!cv)return;cv.width=W=window.innerWidth;cv.height=H=window.innerHeight;}
function loop(ts){
if(!t0)t0=ts;var t=(ts-t0)/1000;
ctx.fillStyle='#140812';ctx.fillRect(0,0,W,H);
var bl=[[0.25+0.12*Math.sin(t*0.5),0.35+0.1*Math.cos(t*0.4),'rgba(255,20,120,0.35)',0.45],
[0.75+0.1*Math.cos(t*0.35),0.3+0.12*Math.sin(t*0.55),'rgba(120,40,255,0.3)',0.5],
[0.5+0.15*Math.sin(t*0.3),0.75+0.1*Math.cos(t*0.45),'rgba(255,90,40,0.22)',0.55]];
for(var k=0;k<bl.length;k++){var b=bl[k];
var g=ctx.createRadialGradient(b[0]*W,b[1]*H,0,b[0]*W,b[1]*H,b[3]*Math.max(W,H));
g.addColorStop(0,b[2]);g.addColorStop(1,'rgba(20,8,18,0)');
ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
raf=requestAnimationFrame(loop);}
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
'<a class="btnStar" href="https://github.com/Rahul777111" target="_blank" rel="noopener"><span>GitHub</span></a>'+
'</div></div>'+
'<div id="ctChat"><div class="chHead">ASK MY PORTFOLIO</div><div class="chLog"></div>'+
'<form class="chForm"><input class="chIn" type="text" placeholder="Ask about projects, skills, contact..." maxlength="120"><button class="chSend" type="submit" aria-label="Send">&#8594;</button></form></div>'+
'</div>';
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
var dots=el('div','chMsg dots','&middot; &middot; &middot;');log.appendChild(dots);log.scrollTop=log.scrollHeight;
setTimeout(function(){
log.removeChild(dots);
var r=FALLBACK;
for(var i=0;i<REPLIES.length;i++){if(REPLIES[i][0].test(q)){r=REPLIES[i][1];break;}}
msg(r,false);},700);});
cv=root.querySelector('#ctBg');ctx=cv.getContext('2d');
window.addEventListener('resize',fit);fit();}
function show(){
build();
gsap.set('#contactStage',{visibility:'visible'});
gsap.to('#contactStage',{opacity:1,duration:0.6});
gsap.fromTo('#ctInner',{y:36},{y:0,duration:0.9,ease:'power3.out'});
gsap.fromTo('.ctCard',{opacity:0,y:22},{opacity:1,y:0,duration:0.6,stagger:0.08,ease:'power2.out',delay:0.15});
t0=0;fit();if(!raf)raf=requestAnimationFrame(loop);}
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
