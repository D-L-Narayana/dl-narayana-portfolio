window.helloIntro=function(tl){
var L=document.querySelectorAll('#hello tspan');
tl.to(L,{strokeDashoffset:0,duration:1.05,stagger:0.42,ease:'power1.inOut'});
tl.to({},{duration:0.5});
tl.add('exit');
tl.to('#hello',{x:36,duration:0.2,ease:'sine.inOut',yoyo:true,repeat:6},'exit');
tl.to('#hello',{y:-window.innerHeight,opacity:0,scale:0.9,duration:1.35,ease:'power2.in'},'exit');
};
