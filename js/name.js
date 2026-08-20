window.nameIntro=function(tl){
var el=document.getElementById('name');
'D L NARAYANA'.split('').forEach(function(ch){
var s=document.createElement('span');
if(ch===' '){s.className='sp';s.innerHTML='&nbsp;';}else{s.textContent=ch;}
el.appendChild(s);});
var sp=el.querySelectorAll('span');
tl.set('#nwrap',{visibility:'visible'},'exit+=0.55');
tl.from(sp,{x:-window.innerWidth-260,rotation:-16,duration:1.15,ease:'elastic.out(1,0.5)',stagger:0.07},'exit+=0.6');
tl.from('#tag',{opacity:0,y:24,duration:0.7,ease:'power2.out'},'-=0.5');
tl.to(sp,{y:-7,duration:1.5,ease:'sine.inOut',stagger:{each:0.08,repeat:-1,yoyo:true},repeat:-1,yoyo:true});
};
