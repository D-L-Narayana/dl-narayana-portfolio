window.Slider=(function(){
var S=[],cur=0,anim=false,timer=null,on=false,built=false;
var root,out,inn,fill,chap,title,num,count,hit,cursor,a1,a2;
var mx=0,my=0,px=0,py=0,inside=false,side='right';
var STRIPS=10;
function slides(){
S=window.PROJECTS.map(function(p,i){return{src:p.img,title:p.title.replace('\n',' '),chap:'Project 0'+(i+1)};});}
function setTitle(t,animate){
title.innerHTML='';
t.split('').forEach(function(c){
var s=document.createElement('span');
s.textContent=c===' '?'\u00a0':c;
title.appendChild(s);});
if(animate)gsap.from(title.children,{yPercent:110,duration:0.6,ease:'power2.out',stagger:0.04});}
function setCap(i,animate){
chap.textContent=S[i].chap;
num.textContent=('0'+(i+1)).slice(-2);
if(animate){
gsap.fromTo(chap,{autoAlpha:0},{autoAlpha:1,duration:0.5,ease:'power2.out'});
gsap.from(num,{yPercent:110,duration:0.55,ease:'power3.out'});}
setTitle(S[i].title,animate);}
function move(e){
mx=e.clientX;my=e.clientY;
var over=e.target instanceof Element&&e.target.closest('#nav,button,a');
var okk=on&&!over&&!window.Overlay.isOpen();
if(!okk){
if(inside){inside=false;gsap.to(cursor,{opacity:0,scale:0.6,duration:0.25,ease:'power3.inOut'});}
return;}
if(!inside){
inside=true;px=mx;py=my;
gsap.set(cursor,{x:mx,y:my});
gsap.to(cursor,{opacity:1,scale:1,duration:0.25,ease:'power3.out'});}
var ns=mx<window.innerWidth/2?'left':'right';
if(ns!==side){
side=ns;
var r=ns==='left'?[135,-135,-5]:[45,-45,5];
gsap.to(a1,{rotation:r[0],x:r[2],duration:0.32,ease:'power3.inOut'});
gsap.to(a2,{rotation:r[1],x:r[2],duration:0.32,ease:'power3.inOut'});}}
function follow(){
px+=(mx-px)*0.13;py+=(my-py)*0.13;
gsap.set(cursor,{x:px,y:py});
requestAnimationFrame(follow);}
function go(nx,dir){
if(anim||nx===cur)return;
anim=true;
var w=100/STRIPS,html='',i;
for(i=0;i<STRIPS;i++){
html+='<div class="slStrip" style="left:'+(i*w)+'%;width:'+(w+0.06)+'%"><div style="left:-'+(i*100)+'%;width:'+(STRIPS*100)+'%"><img src="'+S[nx].src+'" alt=""></div></div>';}
inn.innerHTML=html;
var strips=[].slice.call(inn.querySelectorAll('.slStrip'));
var zooms=[].slice.call(inn.querySelectorAll('.slStrip img'));
var ord=dir==='prev'?strips.slice().reverse():strips;
gsap.to([chap,title,count],{autoAlpha:0,y:-2,duration:0.3,delay:0.12,ease:'power2.in'});
var tl=gsap.timeline({onComplete:function(){
out.innerHTML='<img src="'+S[nx].src+'" alt="">';
inn.innerHTML='';
cur=nx;anim=false;}});
tl.fromTo(ord,
{clipPath:dir==='prev'?'inset(0 0 0 100%)':'inset(0 100% 0 0)'},
{clipPath:'inset(0 0% 0 0%)',duration:0.5,ease:'power3.out',stagger:0.04},0);
tl.fromTo(zooms,{scale:1.2},{scale:1,duration:0.9,ease:'power3.out'},0);
tl.to(fill,{scaleX:(nx+1)/S.length,duration:0.9,ease:'power3.inOut'},0);
tl.add(function(){
gsap.set([chap,title,count],{autoAlpha:1,y:0});
setCap(nx,true);},0.5);}
function next(){go((cur+1)%S.length,'next');}
function prev(){go((cur-1+S.length)%S.length,'prev');}
function build(){
if(built)return;built=true;
slides();
root=document.getElementById('slider');
out=document.getElementById('slOut');inn=document.getElementById('slIn');
fill=document.getElementById('slFill');chap=document.getElementById('slChap');
title=document.getElementById('slTitle');num=document.getElementById('slNum');
count=document.getElementById('slCount');hit=document.getElementById('slHit');
cursor=document.getElementById('slCursor');
a1=document.getElementById('slA1');a2=document.getElementById('slA2');
out.innerHTML='<img src="'+S[0].src+'" alt="">';
fill.style.transform='scaleX('+(1/S.length)+')';
setCap(0,false);
hit.addEventListener('click',function(e){
if(anim||!on)return;
if(e.clientX<window.innerWidth/2)prev();else next();});
gsap.set(cursor,{opacity:0,scale:0.6});
gsap.set([a1,a2],{xPercent:-50,yPercent:-50,transformOrigin:'100% 50%'});
gsap.set(a1,{y:-1.5,rotation:45,x:5});
gsap.set(a2,{y:1.5,rotation:-45,x:5});
window.addEventListener('mousemove',move);
requestAnimationFrame(follow);}
function show(){
build();on=true;
gsap.set(root,{visibility:'visible'});
gsap.to(root,{opacity:1,duration:0.7,ease:'power2.out'});
if(timer)clearInterval(timer);
timer=setInterval(function(){
if(!anim&&on&&!window.Overlay.isOpen())next();},5000);}
function hide(){
on=false;
if(timer){clearInterval(timer);timer=null;}
if(inside){inside=false;gsap.to(cursor,{opacity:0,scale:0.6,duration:0.2});}
gsap.to(root,{opacity:0,duration:0.5,onComplete:function(){gsap.set(root,{visibility:'hidden'});}});}
return{show:show,hide:hide,next:next,prev:prev};
})();
