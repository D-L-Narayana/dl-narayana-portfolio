window.helloIntro=function(tl){
var L=document.querySelectorAll('#hello tspan');
var bo=document.getElementById('blackout');
tl.to(L,{strokeDashoffset:0,duration:1.05,stagger:0.42,ease:'power1.inOut'});
tl.to({},{duration:0.45});
tl.add('exit');
tl.to('#hello',{x:72,duration:0.11,ease:'sine.inOut',yoyo:true,repeat:9},'exit');
tl.to('#hello',{rotation:5,duration:0.11,ease:'sine.inOut',yoyo:true,repeat:9},'exit');
tl.to('#hello',{y:-window.innerHeight*1.25,opacity:0,duration:0.7,ease:'power3.in'},'exit+=0.15');
var iris={r:0};
tl.to(iris,{r:125,duration:1.5,ease:'power2.inOut',onUpdate:function(){
bo.style.background='radial-gradient(circle at 50% 50%, rgba(0,0,0,0) '+iris.r+'%, #000 '+Math.min(iris.r+45,170)+'%)';
}},'exit+=0.3');
tl.set(bo,{display:'none'},'exit+=1.9');
};
