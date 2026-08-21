window.nameIntro=function(tl){
var el=document.getElementById('name');
el.classList.add('polish');
'D L NARAYANA'.split('').forEach(function(ch,i){
var s=document.createElement('span');
if(ch===' '){s.className='sp';s.innerHTML='&nbsp;';}else{s.textContent=ch;}
s.style.animationDelay=(i*0.08)+'s';
el.appendChild(s);});
var sp=el.querySelectorAll('span');
tl.set('#nwrap',{visibility:'visible'},'exit+=0.55');
tl.from(sp,{x:-window.innerWidth-260,rotation:-16,duration:1.15,ease:'elastic.out(1,0.5)',stagger:0.07},'exit+=0.6');
tl.from('#tag',{opacity:0,y:24,duration:0.7,ease:'power2.out'},'-=0.5');
tl.to('#nwrap',{keyframes:[{opacity:0.25,duration:0.06},{opacity:1,duration:0.06},{opacity:0.35,duration:0.07},{opacity:1,duration:0.05},{opacity:0.6,duration:0.08},{opacity:1,duration:0.12},{opacity:0.8,duration:0.05},{opacity:1,duration:0.25}]},'exit+=2.05');
tl.to(sp,{y:-7,duration:1.5,ease:'sine.inOut',stagger:{each:0.08,repeat:-1,yoyo:true},repeat:-1,yoyo:true});
};
