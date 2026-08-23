window.Extras=(function(){
function ascii(){
var pre=document.getElementById('asciiPre');
if(pre&&window.ASCII_ME)pre.textContent=window.ASCII_ME;}
function homeUi(v){
var el=document.getElementById('homeUi');
if(!el)return;
if(v){gsap.set(el,{visibility:'visible'});gsap.to(el,{opacity:1,duration:0.5});}
else{gsap.to(el,{opacity:0,duration:0.3,onComplete:function(){gsap.set(el,{visibility:'hidden'});}});}}
function warp(sel){
var h=document.querySelector(sel);
if(!h)return;
if(!h.dataset.split){
var t=h.textContent;h.textContent='';h.dataset.split='1';
t.split('').forEach(function(c){
var s=document.createElement('span');
s.textContent=c===' '?'\u00a0':c;
s.style.display='inline-block';
h.appendChild(s);});}
gsap.fromTo(h.children,
{opacity:0,y:function(){return gsap.utils.random(-46,46);},rotationY:function(){return gsap.utils.random(-140,140);},skewX:function(){return gsap.utils.random(-28,28);}},
{opacity:1,y:0,rotationY:0,skewX:0,duration:0.85,stagger:0.045,ease:'power3.out'});}
function thumbsRest(th){
th.forEach(function(im,i){gsap.to(im,{x:i*7,rotation:(i-1)*9,duration:0.45,ease:'power3.out'});});}
function initHome(){
document.getElementById('btnStart').addEventListener('click',function(){window.Nav.open('projects');});
document.getElementById('btnSpark').addEventListener('click',function(){window.Nav.open('about');});
var pill=document.getElementById('introPill');
var box=pill.querySelector('.thumbs');
var th=[].slice.call(pill.querySelectorAll('.thumbs img'));
th.forEach(function(im,i){gsap.set(im,{x:i*7,rotation:(i-1)*9});});
pill.addEventListener('click',function(){window.Nav.open('projects');});
pill.addEventListener('pointerenter',function(){
gsap.to(box,{width:118,duration:0.45,ease:'power3.out'});
th.forEach(function(im,i){gsap.to(im,{x:i*38,rotation:0,duration:0.45,ease:'power3.out'});});});
pill.addEventListener('pointerleave',function(){
gsap.to(box,{width:48,duration:0.45,ease:'power3.out'});
thumbsRest(th);});}
function init(){ascii();initHome();}
return{init:init,homeUi:homeUi,warp:warp};
})();
